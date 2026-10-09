package com.orbi.clima.alerts

import android.net.Uri
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.text.Normalizer
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.time.format.DateTimeParseException
import java.time.temporal.ChronoUnit
import java.util.Locale

data class BackgroundSenapredAlert(
    val id: String,
    val level: String,
    val levelLabel: String,
    val causalidad: String,
    val region: String,
    val provincia: String?,
    val comuna: String?,
    val startsAt: String?,
    val sourceService: String,
) {
    val severity: String
        get() = when (level) {
            "roja" -> "critical"
            "amarilla" -> "warning"
            else -> "watch"
        }

    val area: String
        get() = listOfNotNull(comuna, provincia, region)
            .filter { it.isNotBlank() }
            .joinToString(" · ")

    fun dedupKey(): String {
        val territory = comuna?.takeIf { it.isNotBlank() } ?: area
        return listOf(
            "senapred",
            normalizeToken(level),
            normalizeToken(causalidad),
            normalizeToken(region),
            normalizeToken(territory),
            normalizeToken(startsAt ?: LocalDate.now().toString()),
        ).joinToString(":")
    }
}

data class BackgroundSenapredResult(
    val alerts: List<BackgroundSenapredAlert>,
    val hasVerifiedCoverage: Boolean,
    val coveragePartial: Boolean,
    val usedDirectoryDiscovery: Boolean,
    val errorMessage: String?,
)

private data class LayerDefinition(
    val suffix: String,
    val level: String,
    val levelLabel: String,
    val staleDays: Long,
)

private enum class LayerStatus { OK, INACTIVE, ERROR }

private data class LayerQueryResult(
    val status: LayerStatus,
    val alerts: List<BackgroundSenapredAlert>,
    val error: String? = null,
)

object SenapredBackgroundClient {
    private const val BASE = "https://services3.arcgis.com/CNzkI2T3GmfwkaAR/arcgis/rest/services"
    private const val REQUEST_TIMEOUT_MS = 9_000
    private const val MAX_DATED_LAYER_AGE_DAYS = 21L

    private val layers = listOf(
        LayerDefinition("VERDE", "temprana_preventiva", "Alerta Temprana Preventiva", 365),
        LayerDefinition("AMARILLA", "amarilla", "Alerta Amarilla", 120),
        LayerDefinition("ROJA", "roja", "Alerta Roja", 60),
    )

    fun fetch(config: OfficialAlertWatchConfig): BackgroundSenapredResult {
        if (!config.country.equals("Chile", ignoreCase = true)) {
            return BackgroundSenapredResult(
                alerts = emptyList(),
                hasVerifiedCoverage = false,
                coveragePartial = false,
                usedDirectoryDiscovery = false,
                errorMessage = "SENAPRED se consulta únicamente para ubicaciones en Chile.",
            )
        }

        val discovered = discoverServices()
        val usedDirectory = discovered != null
        val results = layers.map { definition ->
            val service = if (discovered == null) {
                "METEOROLOGICAS_${definition.suffix}"
            } else {
                discovered[definition.level]
            }

            if (usedDirectory && service == null) {
                LayerQueryResult(LayerStatus.INACTIVE, emptyList())
            } else {
                queryLayer(config, definition, service ?: "METEOROLOGICAS_${definition.suffix}")
            }
        }

        val successful = results.count { it.status == LayerStatus.OK }
        val errors = results.filter { it.status == LayerStatus.ERROR }
        val alerts = deduplicate(results.flatMap { it.alerts })

        return BackgroundSenapredResult(
            alerts = alerts,
            hasVerifiedCoverage = successful > 0,
            coveragePartial = successful > 0 && errors.isNotEmpty(),
            usedDirectoryDiscovery = usedDirectory,
            errorMessage = errors.firstOrNull()?.error,
        )
    }

    private fun discoverServices(): Map<String, String>? {
        return try {
            val payload = getJson("$BASE?f=json") ?: return null
            val services = payload.optJSONArray("services") ?: return null
            val names = mutableListOf<String>()

            for (index in 0 until services.length()) {
                val item = services.optJSONObject(index) ?: continue
                val type = item.optString("type", "")
                val name = item.optString("name", "").trim()
                if (type.equals("FeatureServer", ignoreCase = true) && name.isNotBlank()) {
                    names += name
                }
            }

            val selected = mutableMapOf<String, String>()
            layers.forEach { definition ->
                chooseService(names, definition.suffix)?.let { selected[definition.level] = it }
            }
            selected
        } catch (_: Exception) {
            null
        }
    }

    private fun chooseService(services: List<String>, suffix: String): String? {
        val exact = "METEOROLOGICAS_$suffix"
        services.firstOrNull { it.substringAfterLast('/').equals(exact, ignoreCase = true) }
            ?.let { return it }

        val now = Instant.now()
        val cutoff = now.minus(MAX_DATED_LAYER_AGE_DAYS, ChronoUnit.DAYS)
        val futureTolerance = now.plus(2, ChronoUnit.DAYS)

        return services.mapNotNull { service ->
            val date = datedServiceDate(service, suffix) ?: return@mapNotNull null
            val instant = date.atStartOfDay(ZoneId.of("America/Santiago")).toInstant()
            if (instant.isBefore(cutoff) || instant.isAfter(futureTolerance)) null else service to instant
        }.maxByOrNull { it.second }?.first
    }

    private fun datedServiceDate(service: String, suffix: String): LocalDate? {
        val finalName = service.substringAfterLast('/')
        val regex = Regex("^METEOROLOGICAS_${Regex.escape(suffix)}_(\\d{2})(\\d{2})(\\d{2})$", RegexOption.IGNORE_CASE)
        val match = regex.matchEntire(finalName) ?: return null
        val (day, month, shortYear) = match.destructured
        return try {
            LocalDate.of(2000 + shortYear.toInt(), month.toInt(), day.toInt())
        } catch (_: Exception) {
            null
        }
    }

    private fun queryLayer(
        config: OfficialAlertWatchConfig,
        definition: LayerDefinition,
        service: String,
    ): LayerQueryResult {
        val geometry = JSONObject().apply {
            put("x", config.longitude)
            put("y", config.latitude)
            put("spatialReference", JSONObject().put("wkid", 4326))
        }.toString()

        val encodedService = service.split('/').joinToString("/") { Uri.encode(it) }
        val endpoint = "$BASE/$encodedService/FeatureServer/0/query"
        val uri = Uri.parse(endpoint).buildUpon()
            .appendQueryParameter("where", "1=1")
            .appendQueryParameter("geometry", geometry)
            .appendQueryParameter("geometryType", "esriGeometryPoint")
            .appendQueryParameter("inSR", "4326")
            .appendQueryParameter("spatialRel", "esriSpatialRelIntersects")
            .appendQueryParameter("outFields", "FID,CUT_REG,CUT_PROV,CUT_COM,REGION,PROVINCIA,COMUNA,TIPO_ALERT,CAUSALIDAD,FECHA_INI")
            .appendQueryParameter("returnGeometry", "false")
            .appendQueryParameter("f", "json")
            .build()

        return try {
            val response = getJsonWithStatus(uri.toString())
            if (response.statusCode == 400 || response.statusCode == 404) {
                return LayerQueryResult(LayerStatus.INACTIVE, emptyList())
            }
            if (response.statusCode !in 200..299 || response.payload == null) {
                return LayerQueryResult(
                    LayerStatus.ERROR,
                    emptyList(),
                    "SENAPRED ArcGIS HTTP ${response.statusCode}",
                )
            }

            val payload = response.payload
            if (payload.has("error")) {
                val error = payload.optJSONObject("error")
                val code = error?.optInt("code", -1) ?: -1
                if (code == 400 || code == 404) {
                    return LayerQueryResult(LayerStatus.INACTIVE, emptyList())
                }
                return LayerQueryResult(
                    LayerStatus.ERROR,
                    emptyList(),
                    error?.optString("message", "Error ArcGIS") ?: "Error ArcGIS",
                )
            }

            val features = payload.optJSONArray("features")
            val alerts = mutableListOf<BackgroundSenapredAlert>()
            if (features != null) {
                for (index in 0 until features.length()) {
                    val attrs = features.optJSONObject(index)?.optJSONObject("attributes") ?: continue
                    val level = normalizeLevel(attrs.optString("TIPO_ALERT", ""), definition.level)
                    val startsRaw = stringOrNull(attrs.opt("FECHA_INI"))
                    if (isStale(startsRaw, definition.copy(level = level))) continue

                    val region = stringOrNull(attrs.opt("REGION")) ?: config.region.ifBlank { "Chile" }
                    val causalidad = stringOrNull(attrs.opt("CAUSALIDAD")) ?: "Evento meteorológico"
                    val fid = stringOrNull(attrs.opt("FID")) ?: index.toString()
                    val startsAt = parseSenapredDate(startsRaw)

                    alerts += BackgroundSenapredAlert(
                        id = "senapred:$service:$fid",
                        level = level,
                        levelLabel = levelLabel(level),
                        causalidad = causalidad,
                        region = region,
                        provincia = stringOrNull(attrs.opt("PROVINCIA")),
                        comuna = stringOrNull(attrs.opt("COMUNA")),
                        startsAt = startsAt,
                        sourceService = service,
                    )
                }
            }
            LayerQueryResult(LayerStatus.OK, alerts)
        } catch (error: Exception) {
            LayerQueryResult(LayerStatus.ERROR, emptyList(), error.message ?: "Error de red desconocido")
        }
    }

    private fun normalizeLevel(value: String, fallback: String): String {
        val text = value.lowercase(Locale.ROOT)
        return when {
            text.contains("roja") -> "roja"
            text.contains("amarilla") -> "amarilla"
            text.contains("preventiva") || text.contains("temprana") -> "temprana_preventiva"
            else -> fallback
        }
    }

    private fun levelLabel(level: String): String = when (level) {
        "roja" -> "Alerta Roja"
        "amarilla" -> "Alerta Amarilla"
        else -> "Alerta Temprana Preventiva"
    }

    private fun isStale(value: String?, definition: LayerDefinition): Boolean {
        val date = parseSenapredLocalDate(value) ?: return false
        val ageDays = ChronoUnit.DAYS.between(date, LocalDate.now(ZoneId.of("America/Santiago")))
        return ageDays > definition.staleDays
    }

    private fun parseSenapredDate(value: String?): String? =
        parseSenapredLocalDate(value)?.format(DateTimeFormatter.ISO_LOCAL_DATE)

    private fun parseSenapredLocalDate(value: String?): LocalDate? {
        if (value.isNullOrBlank()) return null
        return try {
            LocalDate.parse(value.trim(), DateTimeFormatter.ofPattern("dd-MM-uuuu").withLocale(Locale.US))
        } catch (_: DateTimeParseException) {
            null
        }
    }

    private fun stringOrNull(value: Any?): String? {
        if (value == null || value == JSONObject.NULL) return null
        return value.toString().trim().takeIf { it.isNotBlank() }
    }

    private fun deduplicate(alerts: List<BackgroundSenapredAlert>): List<BackgroundSenapredAlert> {
        val byKey = linkedMapOf<String, BackgroundSenapredAlert>()
        alerts.forEach { alert ->
            val key = listOf(
                alert.level,
                alert.causalidad.lowercase(Locale.ROOT),
                alert.region.lowercase(Locale.ROOT),
                alert.comuna?.lowercase(Locale.ROOT) ?: "",
                alert.startsAt ?: "",
            ).joinToString("|")
            byKey.putIfAbsent(key, alert)
        }

        val weight = mapOf("roja" to 3, "amarilla" to 2, "temprana_preventiva" to 1)
        return byKey.values.sortedByDescending { weight[it.level] ?: 0 }
    }

    private data class HttpJsonResponse(val statusCode: Int, val payload: JSONObject?)

    private fun getJson(url: String): JSONObject? {
        val response = getJsonWithStatus(url)
        return if (response.statusCode in 200..299) response.payload else null
    }

    private fun getJsonWithStatus(url: String): HttpJsonResponse {
        val connection = (URL(url).openConnection() as HttpURLConnection).apply {
            connectTimeout = REQUEST_TIMEOUT_MS
            readTimeout = REQUEST_TIMEOUT_MS
            requestMethod = "GET"
            setRequestProperty("Accept", "application/json")
            useCaches = false
        }

        return try {
            val status = connection.responseCode
            val stream = if (status in 200..299) connection.inputStream else connection.errorStream
            val body = stream?.bufferedReader(Charsets.UTF_8)?.use { it.readText() }.orEmpty()
            val payload = if (body.isBlank()) null else JSONObject(body)
            HttpJsonResponse(status, payload)
        } finally {
            connection.disconnect()
        }
    }
}

private fun normalizeToken(value: String): String {
    return Normalizer.normalize(value, Normalizer.Form.NFD)
        .replace(Regex("\\p{M}+"), "")
        .lowercase(Locale.ROOT)
        .replace(Regex("[^a-z0-9]+"), "-")
        .trim('-')
        .take(90)
}

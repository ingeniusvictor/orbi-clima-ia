package com.orbi.clima.alerts

import android.content.Context
import org.json.JSONObject
import java.security.MessageDigest
import java.util.Locale
import java.util.concurrent.TimeUnit

data class OfficialAlertWatchConfig(
    val enabled: Boolean,
    val locationId: String,
    val locationName: String,
    val region: String,
    val country: String,
    val latitude: Double,
    val longitude: Double,
    val timezone: String,
    val intervalMinutes: Long,
    val quietHoursEnabled: Boolean,
    val quietHoursMode: String,
    val quietHoursStart: String,
    val quietHoursEnd: String,
    val allowCriticalDuringQuietHours: Boolean,
)

object OfficialAlertWatchStore {
    const val PREFS_NAME = "orbi_official_alert_watch_v1"
    const val DEFAULT_INTERVAL_MINUTES = 30L
    const val MIN_INTERVAL_MINUTES = 15L
    private val DELIVERY_RETENTION_MS = TimeUnit.DAYS.toMillis(180)
    private const val DELIVERED_PREFIX = "delivered_"

    private fun prefs(context: Context) =
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    fun saveConfig(context: Context, config: OfficialAlertWatchConfig) {
        prefs(context).edit()
            .putBoolean("enabled", config.enabled)
            .putString("location_id", config.locationId)
            .putString("location_name", config.locationName)
            .putString("region", config.region)
            .putString("country", config.country)
            .putString("latitude", config.latitude.toString())
            .putString("longitude", config.longitude.toString())
            .putString("timezone", config.timezone)
            .putLong("interval_minutes", config.intervalMinutes.coerceAtLeast(MIN_INTERVAL_MINUTES))
            .putBoolean("quiet_enabled", config.quietHoursEnabled)
            .putString("quiet_mode", config.quietHoursMode)
            .putString("quiet_start", config.quietHoursStart)
            .putString("quiet_end", config.quietHoursEnd)
            .putBoolean("quiet_allow_critical", config.allowCriticalDuringQuietHours)
            .putLong("configured_at", System.currentTimeMillis())
            .apply()
    }

    fun loadConfig(context: Context): OfficialAlertWatchConfig? {
        val p = prefs(context)
        val latitude = p.getString("latitude", null)?.toDoubleOrNull() ?: return null
        val longitude = p.getString("longitude", null)?.toDoubleOrNull() ?: return null

        return OfficialAlertWatchConfig(
            enabled = p.getBoolean("enabled", false),
            locationId = p.getString("location_id", "") ?: "",
            locationName = p.getString("location_name", "Ubicación guardada") ?: "Ubicación guardada",
            region = p.getString("region", "") ?: "",
            country = p.getString("country", "Chile") ?: "Chile",
            latitude = latitude,
            longitude = longitude,
            timezone = p.getString("timezone", "America/Santiago") ?: "America/Santiago",
            intervalMinutes = p.getLong("interval_minutes", DEFAULT_INTERVAL_MINUTES)
                .coerceAtLeast(MIN_INTERVAL_MINUTES),
            quietHoursEnabled = p.getBoolean("quiet_enabled", true),
            quietHoursMode = p.getString("quiet_mode", "critical_only") ?: "critical_only",
            quietHoursStart = p.getString("quiet_start", "22:00") ?: "22:00",
            quietHoursEnd = p.getString("quiet_end", "07:00") ?: "07:00",
            allowCriticalDuringQuietHours = p.getBoolean("quiet_allow_critical", true),
        )
    }

    fun setEnabled(context: Context, enabled: Boolean) {
        prefs(context).edit().putBoolean("enabled", enabled).apply()
    }

    fun recordCheck(
        context: Context,
        result: String,
        error: String? = null,
        coveragePartial: Boolean? = null,
    ) {
        val edit = prefs(context).edit()
            .putLong("last_check_at", System.currentTimeMillis())
            .putString("last_result", result)

        if (error.isNullOrBlank()) edit.remove("last_error") else edit.putString("last_error", error)
        if (coveragePartial != null) edit.putBoolean("last_coverage_partial", coveragePartial)
        edit.apply()
    }

    fun recordCandidate(context: Context, dedupKey: String, level: String, area: String) {
        prefs(context).edit()
            .putString("last_candidate_key", dedupKey)
            .putString("last_alert_level", level)
            .putString("last_alert_area", area)
            .apply()
    }

    fun recordNotification(context: Context, dedupKey: String, level: String, area: String) {
        markDelivered(context, dedupKey)
        prefs(context).edit()
            .putLong("last_notification_at", System.currentTimeMillis())
            .putString("last_delivered_key", dedupKey)
            .putString("last_alert_level", level)
            .putString("last_alert_area", area)
            .putString("last_result", "delivered")
            .apply()
    }

    fun isDelivered(context: Context, dedupKey: String): Boolean {
        pruneDelivered(context)
        return prefs(context).contains(deliveredStorageKey(dedupKey))
    }

    fun markDelivered(context: Context, dedupKey: String) {
        pruneDelivered(context)
        prefs(context).edit()
            .putLong(deliveredStorageKey(dedupKey), System.currentTimeMillis())
            .apply()
    }

    private fun deliveredStorageKey(dedupKey: String): String {
        val digest = MessageDigest.getInstance("SHA-256")
            .digest(dedupKey.toByteArray(Charsets.UTF_8))
            .joinToString("") { "%02x".format(Locale.US, it) }
        return "$DELIVERED_PREFIX$digest"
    }

    private fun pruneDelivered(context: Context) {
        val p = prefs(context)
        val cutoff = System.currentTimeMillis() - DELIVERY_RETENTION_MS
        val stale = p.all.entries
            .filter { (key, value) ->
                key.startsWith(DELIVERED_PREFIX) && value is Long && value < cutoff
            }
            .map { it.key }

        if (stale.isEmpty()) return
        val edit = p.edit()
        stale.forEach(edit::remove)
        edit.apply()
    }

    fun statusJson(context: Context): JSONObject {
        val p = prefs(context)
        val config = loadConfig(context)
        return JSONObject().apply {
            put("enabled", config?.enabled ?: false)
            put("configured", config != null)
            put("locationName", config?.locationName ?: JSONObject.NULL)
            put("region", config?.region ?: JSONObject.NULL)
            put("country", config?.country ?: JSONObject.NULL)
            put("latitude", config?.latitude ?: JSONObject.NULL)
            put("longitude", config?.longitude ?: JSONObject.NULL)
            put("timezone", config?.timezone ?: JSONObject.NULL)
            put("intervalMinutes", config?.intervalMinutes ?: DEFAULT_INTERVAL_MINUTES)
            put("lastCheckAt", epochOrNull(p.getLong("last_check_at", 0L)))
            put("lastNotificationAt", epochOrNull(p.getLong("last_notification_at", 0L)))
            put("lastResult", p.getString("last_result", null) ?: JSONObject.NULL)
            put("lastError", p.getString("last_error", null) ?: JSONObject.NULL)
            put("lastAlertLevel", p.getString("last_alert_level", null) ?: JSONObject.NULL)
            put("lastAlertArea", p.getString("last_alert_area", null) ?: JSONObject.NULL)
            put("coveragePartial", p.getBoolean("last_coverage_partial", false))
            put("deliveryRetentionDays", 180)
            put("usesBackgroundLocation", false)
            put("usesForegroundService", false)
        }
    }

    private fun epochOrNull(value: Long): Any = if (value > 0L) value else JSONObject.NULL
}

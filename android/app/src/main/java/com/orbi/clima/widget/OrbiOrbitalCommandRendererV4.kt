package com.orbi.clima.widget

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.LinearGradient
import android.graphics.Paint
import android.graphics.Path
import android.graphics.RadialGradient
import android.graphics.RectF
import android.graphics.Shader
import android.graphics.Typeface
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import kotlin.math.PI
import kotlin.math.cos
import kotlin.math.max
import kotlin.math.min
import kotlin.math.sin

/**
 * OC-22Q SkyOrb Commander Orbital V4.
 *
 * Native Android Canvas reconstruction of the original ORBI orbital-weather
 * language: dominant glass weather core, forecast satellites, operational
 * satellites, orbital energy rails and an ORBI IA narrative rail.
 *
 * This renderer is fully isolated from the frozen Golden Orb. Fluid V3 stays
 * available as the progressive fallback for constrained launcher geometry.
 */
object OrbiOrbitalCommandRendererV4 {
    private const val OBSIDIAN = 0xFF01050E.toInt()
    private const val OBSIDIAN_2 = 0xFF071225.toInt()
    private const val PANEL = 0xE00A162B.toInt()
    private const val CYAN = 0xFF35D9F5.toInt()
    private const val CYAN_SOFT = 0xFF8BEAFA.toInt()
    private const val BLUE = 0xFF3B82F6.toInt()
    private const val VIOLET = 0xFF8B5CF6.toInt()
    private const val SOLAR = 0xFFFFC857.toInt()
    private const val GREEN = 0xFF34D399.toInt()
    private const val ICE = 0xFFDDF5FF.toInt()
    private const val CLOUD = 0xFFB8C7DA.toInt()
    private const val TEXT = 0xFFF8FAFC.toInt()
    private const val MUTED = 0xFFB7C3D7.toInt()

    private enum class Family {
        CLEAR, CLOUD, FOG, DRIZZLE, RAIN, STORM, SNOW, WIND, NIGHT
    }

    private data class Profile(
        val family: Family,
        val accent: Int,
        val intensity: Float,
    )

    fun render(
        context: Context,
        state: OrbiWidgetContract,
        variant: OrbiNativeWidgetSnapshotRendererV2.Variant,
        width: Int,
        height: Int,
    ): Bitmap {
        @Suppress("UNUSED_VARIABLE")
        val retainedContext = context
        val safeWidth = width.coerceAtLeast(1)
        val safeHeight = height.coerceAtLeast(1)
        val bitmap = Bitmap.createBitmap(safeWidth, safeHeight, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)
        val bounds = RectF(0f, 0f, safeWidth.toFloat(), safeHeight.toFloat())
        val profile = profile(state)
        val premium = variant == OrbiNativeWidgetSnapshotRendererV2.Variant.PREMIUM_COMMAND
        val corner = (min(bounds.width(), bounds.height()) * 0.075f).coerceIn(18f, 74f)
        val clip = Path().apply { addRoundRect(bounds, corner, corner, Path.Direction.CW) }

        canvas.save()
        canvas.clipPath(clip)
        drawBackdrop(canvas, bounds, profile)
        drawWeatherAtmosphere(canvas, bounds, profile)
        drawOrbitalArchitecture(canvas, bounds, profile, premium)
        drawHeaderMeta(canvas, state, bounds, profile)
        drawForecastSatellites(canvas, state, bounds, profile, premium)
        drawCoreOrb(canvas, state, bounds, profile, premium)
        drawOperationalSatellites(canvas, state, bounds, profile)
        drawNarrativeRail(canvas, state, bounds, profile)
        drawEdge(canvas, bounds, corner, profile.accent)
        canvas.restore()
        return bitmap
    }

    private fun drawBackdrop(canvas: Canvas, b: RectF, p: Profile) {
        canvas.drawRect(b, Paint(Paint.ANTI_ALIAS_FLAG).apply {
            shader = LinearGradient(
                b.left, b.top, b.right, b.bottom,
                OBSIDIAN, OBSIDIAN_2, Shader.TileMode.CLAMP,
            )
        })
        val cx = b.centerX()
        val cy = b.top + b.height() * 0.49f
        val radius = max(b.width(), b.height()) * 0.62f
        canvas.drawCircle(cx, cy, radius, Paint(Paint.ANTI_ALIAS_FLAG).apply {
            shader = RadialGradient(
                cx, cy, radius,
                withAlpha(p.accent, 42), Color.TRANSPARENT,
                Shader.TileMode.CLAMP,
            )
        })
        canvas.drawCircle(cx, cy, radius * 0.54f, Paint(Paint.ANTI_ALIAS_FLAG).apply {
            shader = RadialGradient(
                cx, cy, radius * 0.54f,
                withAlpha(BLUE, 24), Color.TRANSPARENT,
                Shader.TileMode.CLAMP,
            )
        })
    }

    private fun drawWeatherAtmosphere(canvas: Canvas, b: RectF, p: Profile) {
        val side = min(b.width(), b.height())
        when (p.family) {
            Family.CLEAR -> {
                val x = b.right - side * 0.15f
                val y = b.top + side * 0.20f
                canvas.drawCircle(x, y, side * 0.20f, glowPaint(x, y, side * 0.20f, SOLAR, 48))
            }
            Family.CLOUD, Family.DRIZZLE, Family.RAIN, Family.STORM, Family.SNOW -> {
                repeat(6) { i ->
                    val x = b.left + b.width() * (0.12f + ((i * 19) % 73) / 100f)
                    val y = b.top + b.height() * (0.16f + ((i * 13) % 31) / 100f)
                    val radius = side * (0.08f + (i % 3) * 0.025f)
                    canvas.drawCircle(x, y, radius, glowPaint(x, y, radius, if (i % 2 == 0) CLOUD else p.accent, 22))
                }
            }
            Family.FOG -> repeat(6) { i ->
                val y = b.top + b.height() * (0.27f + i * 0.085f)
                val fog = RectF(b.left - b.width() * 0.05f, y, b.right + b.width() * 0.05f, y + side * 0.032f)
                canvas.drawRoundRect(fog, side * 0.018f, side * 0.018f, solidPaint(withAlpha(CLOUD, 22 + i * 3)))
            }
            Family.WIND -> repeat(5) { i ->
                val y = b.top + b.height() * (0.25f + i * 0.11f)
                val path = Path().apply {
                    moveTo(b.left - b.width() * 0.04f, y)
                    cubicTo(
                        b.left + b.width() * 0.22f, y - side * 0.035f,
                        b.left + b.width() * 0.58f, y + side * 0.03f,
                        b.right + b.width() * 0.04f, y,
                    )
                }
                canvas.drawPath(path, strokePaint(withAlpha(CYAN, 38), max(1f, side * 0.0025f)))
            }
            Family.NIGHT -> repeat(24) { i ->
                val x = b.left + ((i * 61 + 17) % 97) / 100f * b.width()
                val y = b.top + ((i * 37 + 11) % 71) / 100f * b.height() * 0.76f
                canvas.drawCircle(x, y, side * if (i % 5 == 0) 0.004f else 0.002f, solidPaint(withAlpha(if (i % 4 == 0) CYAN else Color.WHITE, 55)))
            }
        }

        if (p.family == Family.DRIZZLE || p.family == Family.RAIN || p.family == Family.STORM) {
            val count = if (p.family == Family.DRIZZLE) 12 else if (p.intensity > 0.75f) 28 else 20
            val paint = strokePaint(
                withAlpha(CYAN_SOFT, if (p.family == Family.DRIZZLE) 34 else 48),
                max(1f, side * if (p.family == Family.DRIZZLE) 0.0018f else 0.0027f),
            )
            repeat(count) { i ->
                val x = b.left + ((i * 73 + 31) % 101) / 100f * b.width()
                val y = b.top + ((i * 47 + 17) % 93) / 100f * b.height()
                val len = side * if (p.family == Family.DRIZZLE) 0.025f else 0.05f
                canvas.drawLine(x, y, x - len * 0.20f, y + len, paint)
            }
        }

        if (p.family == Family.SNOW) {
            repeat(if (p.intensity > 0.75f) 28 else 18) { i ->
                val x = b.left + ((i * 67 + 23) % 101) / 100f * b.width()
                val y = b.top + ((i * 43 + 19) % 97) / 100f * b.height()
                canvas.drawCircle(x, y, side * (0.0025f + (i % 3) * 0.001f), solidPaint(withAlpha(ICE, 66)))
            }
        }
    }

    private fun drawOrbitalArchitecture(canvas: Canvas, b: RectF, p: Profile, premium: Boolean) {
        val side = min(b.width(), b.height())
        val cx = b.centerX()
        val cy = b.top + b.height() * 0.49f
        val inner = side * if (premium) 0.365f else 0.35f
        val outer = side * if (premium) 0.405f else 0.385f
        val stroke = max(1f, side * 0.0023f)

        canvas.drawCircle(cx, cy, outer, Paint(Paint.ANTI_ALIAS_FLAG).apply {
            style = Paint.Style.STROKE
            strokeWidth = stroke
            shader = LinearGradient(cx - outer, cy, cx + outer, cy, withAlpha(CYAN, 54), withAlpha(VIOLET, 48), Shader.TileMode.CLAMP)
        })
        canvas.drawCircle(cx, cy, inner, Paint(Paint.ANTI_ALIAS_FLAG).apply {
            style = Paint.Style.STROKE
            strokeWidth = stroke * 1.20f
            shader = LinearGradient(cx - inner, cy - inner, cx + inner, cy + inner, withAlpha(CYAN_SOFT, 74), withAlpha(BLUE, 32), Shader.TileMode.CLAMP)
        })

        val count = if (premium) 14 else 10
        repeat(count) { i ->
            val angle = PI * 2.0 * i / count - PI / 2.0
            val orbit = if (i % 2 == 0) outer else inner
            val x = cx + cos(angle).toFloat() * orbit
            val y = cy + sin(angle).toFloat() * orbit
            val node = side * if (i % 3 == 0) 0.006f else 0.0033f
            val nodeColor = if (i % 2 == 0) CYAN_SOFT else VIOLET
            canvas.drawCircle(x, y, node * 3f, glowPaint(x, y, node * 3f, nodeColor, 92))
            canvas.drawCircle(x, y, node, solidPaint(nodeColor))
        }
    }

    private fun drawHeaderMeta(canvas: Canvas, state: OrbiWidgetContract, b: RectF, p: Profile) {
        val s = scale(b)
        val right = b.right - b.width() * 0.045f
        val now = Date()
        val locale = Locale("es", "CL")
        val date = SimpleDateFormat("EEE, d MMM", locale).format(now).uppercase(locale)
        val time = SimpleDateFormat("HH:mm", locale).format(now)
        drawFittedText(canvas, date, right, b.top + b.height() * 0.065f, b.width() * 0.27f, s * 3f, s * 1.7f, MUTED, true, Paint.Align.RIGHT)
        drawFittedText(canvas, time, right, b.top + b.height() * 0.115f, b.width() * 0.27f, s * 6.2f, s * 3.4f, TEXT, false, Paint.Align.RIGHT)
        val updated = if (state.lastUpdated.isBlank()) sourceBadge(state) else "${sourceBadge(state)} · ${state.lastUpdated}"
        drawFittedText(canvas, updated, right, b.top + b.height() * 0.147f, b.width() * 0.31f, s * 2.25f, s * 1.45f, p.accent, false, Paint.Align.RIGHT)
    }

    private fun drawForecastSatellites(canvas: Canvas, state: OrbiWidgetContract, b: RectF, p: Profile, premium: Boolean) {
        val side = min(b.width(), b.height())
        val radius = side * if (premium) 0.081f else 0.077f
        drawForecastBubble(canvas, b.left + b.width() * 0.225f, b.top + b.height() * 0.265f, radius, state.forecastDay2Label, state.forecastDay2MaxC, state.forecastDay2MinC, "${state.forecastDay2ConditionCode} ${state.forecastDay2ConditionLabel}", p)
        drawForecastBubble(canvas, b.centerX(), b.top + b.height() * 0.205f, radius * 1.03f, state.forecastDay1Label, state.forecastDay1MaxC, state.forecastDay1MinC, "${state.forecastDay1ConditionCode} ${state.forecastDay1ConditionLabel}", p)
        drawForecastBubble(canvas, b.right - b.width() * 0.225f, b.top + b.height() * 0.265f, radius, state.forecastDay3Label, state.forecastDay3MaxC, state.forecastDay3MinC, "${state.forecastDay3ConditionCode} ${state.forecastDay3ConditionLabel}", p)
    }

    private fun drawForecastBubble(
        canvas: Canvas,
        cx: Float,
        cy: Float,
        radius: Float,
        label: String,
        maxTemp: Int,
        minTemp: Int,
        conditionKey: String,
        p: Profile,
    ) {
        val s = radius / 8f
        val accent = accentForKey(conditionKey, p.accent)
        drawGlassBubble(canvas, cx, cy, radius, accent)
        drawFittedText(canvas, label.uppercase(), cx, cy - radius * 0.55f, radius * 1.45f, s * 2.1f, s * 1.3f, TEXT, true, Paint.Align.CENTER)
        drawWeatherGlyph(canvas, cx, cy - radius * 0.08f, radius * 0.58f, conditionKey, accent)
        drawFittedText(canvas, "$maxTemp°", cx - radius * 0.12f, cy + radius * 0.63f, radius * 0.78f, s * 2.7f, s * 1.6f, CYAN_SOFT, true, Paint.Align.RIGHT)
        drawFittedText(canvas, "/", cx, cy + radius * 0.63f, radius * 0.22f, s * 2.2f, s * 1.4f, MUTED, false, Paint.Align.CENTER)
        drawFittedText(canvas, "$minTemp°", cx + radius * 0.12f, cy + radius * 0.63f, radius * 0.78f, s * 2.7f, s * 1.6f, SOLAR, true, Paint.Align.LEFT)
    }

    private fun drawCoreOrb(canvas: Canvas, state: OrbiWidgetContract, b: RectF, p: Profile, premium: Boolean) {
        val side = min(b.width(), b.height())
        val cx = b.centerX()
        val cy = b.top + b.height() * 0.49f
        val radius = side * if (premium) 0.225f else 0.215f

        canvas.drawCircle(cx, cy, radius * 1.24f, glowPaint(cx, cy, radius * 1.24f, p.accent, 106))
        canvas.drawCircle(cx, cy, radius, Paint(Paint.ANTI_ALIAS_FLAG).apply {
            shader = RadialGradient(
                cx - radius * 0.24f,
                cy - radius * 0.30f,
                radius * 1.35f,
                withAlpha(lighten(p.accent, 0.32f), 210),
                0xFF050B19.toInt(),
                Shader.TileMode.CLAMP,
            )
        })
        canvas.drawCircle(cx, cy, radius * 0.89f, Paint(Paint.ANTI_ALIAS_FLAG).apply {
            shader = RadialGradient(
                cx - radius * 0.30f,
                cy - radius * 0.40f,
                radius * 0.95f,
                withAlpha(Color.WHITE, 34),
                Color.TRANSPARENT,
                Shader.TileMode.CLAMP,
            )
        })
        canvas.drawCircle(cx, cy, radius, Paint(Paint.ANTI_ALIAS_FLAG).apply {
            style = Paint.Style.STROKE
            strokeWidth = max(2f, side * 0.004f)
            shader = LinearGradient(cx - radius, cy - radius, cx + radius, cy + radius, CYAN_SOFT, VIOLET, Shader.TileMode.CLAMP)
        })
        canvas.drawArc(
            RectF(cx - radius * 0.92f, cy - radius * 0.92f, cx + radius * 0.92f, cy + radius * 0.92f),
            205f, 92f, false,
            strokePaint(withAlpha(SOLAR, 160), max(2f, side * 0.006f)),
        )
        canvas.drawOval(
            RectF(cx - radius * 0.62f, cy - radius * 0.73f, cx + radius * 0.08f, cy - radius * 0.39f),
            solidPaint(withAlpha(Color.WHITE, 32)),
        )

        val key = "${state.conditionCode} ${state.conditionLabel}"
        drawWeatherGlyph(canvas, cx, cy - radius * 0.48f, radius * 0.44f, key, p.accent)
        val s = scale(b)
        drawFittedText(canvas, "${state.temperatureC}°", cx, cy + radius * 0.12f, radius * 1.55f, s * 18f, s * 10f, TEXT, false, Paint.Align.CENTER)
        drawFittedText(canvas, state.conditionLabel, cx, cy + radius * 0.43f, radius * 1.60f, s * 4.6f, s * 2.5f, TEXT, false, Paint.Align.CENTER)
        drawFittedText(canvas, state.locationName, cx, cy + radius * 0.61f, radius * 1.52f, s * 3.4f, s * 2.1f, CYAN, true, Paint.Align.CENTER)
        drawFittedText(canvas, "Sensación ${state.feelsLikeC}°", cx, cy + radius * 0.76f, radius * 1.45f, s * 2.6f, s * 1.6f, MUTED, false, Paint.Align.CENTER)
        drawFittedText(canvas, "UV ${state.uvIndex} · ${uvDescriptor(state.uvIndex)}", cx, cy + radius * 0.91f, radius * 1.35f, s * 2.35f, s * 1.45f, if (state.uvIndex >= 6) SOLAR else CYAN_SOFT, true, Paint.Align.CENTER)
    }

    private fun drawOperationalSatellites(canvas: Canvas, state: OrbiWidgetContract, b: RectF, p: Profile) {
        val side = min(b.width(), b.height())
        val radius = side * 0.072f
        val y = b.top + b.height() * 0.745f
        drawMetricBubble(canvas, b.left + b.width() * 0.245f, y, radius, "LLUVIA", "${state.rainProbability}%", "Probabilidad", BLUE)
        drawMetricBubble(canvas, b.centerX(), y + radius * 0.16f, radius, "VIENTO", "${state.windSpeedKmh}", "km/h", VIOLET)
        drawMetricBubble(canvas, b.right - b.width() * 0.245f, y, radius, "HUMEDAD", "${state.humidity}%", humidityDescriptor(state.humidity), CYAN)
        if (p.family == Family.STORM) {
            drawBolt(canvas, b.right - b.width() * 0.115f, b.top + b.height() * 0.53f, side * 0.035f, withAlpha(Color.WHITE, 170))
        }
    }

    private fun drawMetricBubble(
        canvas: Canvas,
        cx: Float,
        cy: Float,
        radius: Float,
        label: String,
        value: String,
        sub: String,
        accent: Int,
    ) {
        val s = radius / 8f
        drawGlassBubble(canvas, cx, cy, radius, accent)
        drawFittedText(canvas, label, cx, cy - radius * 0.42f, radius * 1.55f, s * 1.9f, s * 1.2f, TEXT, true, Paint.Align.CENTER)
        drawMetricGlyph(canvas, cx, cy - radius * 0.02f, radius * 0.28f, label, accent)
        drawFittedText(canvas, value, cx, cy + radius * 0.42f, radius * 1.45f, s * 3f, s * 1.7f, CYAN_SOFT, true, Paint.Align.CENTER)
        drawFittedText(canvas, sub, cx, cy + radius * 0.70f, radius * 1.55f, s * 1.55f, s * 1f, MUTED, false, Paint.Align.CENTER)
    }

    private fun drawNarrativeRail(canvas: Canvas, state: OrbiWidgetContract, b: RectF, p: Profile) {
        val s = scale(b)
        val rail = RectF(
            b.left + b.width() * 0.105f,
            b.top + b.height() * 0.875f,
            b.right - b.width() * 0.105f,
            b.top + b.height() * 0.95f,
        )
        canvas.drawRoundRect(rail, rail.height() / 2f, rail.height() / 2f, solidPaint(PANEL))
        canvas.drawRoundRect(rail, rail.height() / 2f, rail.height() / 2f, strokePaint(withAlpha(p.accent, 98), max(1f, s * 0.30f)))

        val starX = rail.left + rail.height() * 0.50f
        val starY = rail.centerY()
        canvas.drawCircle(starX, starY, rail.height() * 0.21f, glowPaint(starX, starY, rail.height() * 0.21f, CYAN, 210))
        canvas.drawCircle(starX, starY, rail.height() * 0.065f, solidPaint(CYAN_SOFT))
        drawFittedText(canvas, "ORBI IA", rail.left + rail.height() * 0.83f, rail.centerY() + s * 1.15f, rail.width() * 0.17f, s * 3.1f, s * 1.8f, CYAN, true, Paint.Align.LEFT)
        val narrative = when {
            hasAlert(state) -> "${state.mainAlertTitle}: ${state.mainAlertMessage}"
            state.shortNarrative.isNotBlank() -> state.shortNarrative
            else -> state.personRecommendation
        }
        drawFittedText(canvas, narrative, rail.left + rail.width() * 0.26f, rail.centerY() + s * 1.10f, rail.width() * 0.65f, s * 2.8f, s * 1.55f, TEXT, false, Paint.Align.LEFT)
        drawFittedText(canvas, "›", rail.right - rail.width() * 0.035f, rail.centerY() + s * 1.4f, rail.width() * 0.05f, s * 4.2f, s * 2.4f, CYAN_SOFT, true, Paint.Align.RIGHT)
    }

    private fun drawGlassBubble(canvas: Canvas, cx: Float, cy: Float, radius: Float, accent: Int) {
        canvas.drawCircle(cx, cy, radius * 1.30f, glowPaint(cx, cy, radius * 1.30f, accent, 60))
        canvas.drawCircle(cx, cy, radius, Paint(Paint.ANTI_ALIAS_FLAG).apply {
            shader = RadialGradient(
                cx - radius * 0.22f,
                cy - radius * 0.28f,
                radius * 1.28f,
                withAlpha(lighten(accent, 0.20f), 94),
                PANEL,
                Shader.TileMode.CLAMP,
            )
        })
        canvas.drawCircle(cx, cy, radius, strokePaint(withAlpha(accent, 158), max(1f, radius * 0.035f)))
        canvas.drawArc(
            RectF(cx - radius * 0.80f, cy - radius * 0.80f, cx + radius * 0.80f, cy + radius * 0.80f),
            210f, 90f, false,
            strokePaint(withAlpha(Color.WHITE, 56), max(1f, radius * 0.035f)),
        )
    }

    private fun drawWeatherGlyph(canvas: Canvas, cx: Float, cy: Float, size: Float, keyRaw: String, accent: Int) {
        val key = keyRaw.lowercase()
        when {
            key.contains("torment") || key.contains("thunder") || key.contains("granizo") || key.contains("hail") -> {
                drawCloudGlyph(canvas, cx, cy - size * 0.08f, size, CLOUD)
                drawBolt(canvas, cx + size * 0.12f, cy + size * 0.10f, size * 0.62f, SOLAR)
            }
            key.contains("lluv") || key.contains("rain") || key.contains("llovizna") || key.contains("drizzle") || key.contains("chubasco") -> {
                drawCloudGlyph(canvas, cx, cy - size * 0.12f, size, CLOUD)
                val paint = strokePaint(CYAN_SOFT, max(1f, size * 0.08f))
                repeat(3) { i ->
                    val x = cx + (i - 1) * size * 0.26f
                    canvas.drawLine(x, cy + size * 0.22f, x - size * 0.07f, cy + size * 0.48f, paint)
                }
            }
            key.contains("nieve") || key.contains("snow") || key.contains("escarcha") || key.contains("frost") -> {
                drawCloudGlyph(canvas, cx, cy - size * 0.12f, size, CLOUD)
                repeat(3) { i -> drawSnowStar(canvas, cx + (i - 1) * size * 0.26f, cy + size * 0.36f, size * 0.12f, ICE) }
            }
            key.contains("niebla") || key.contains("fog") || key.contains("bruma") || key.contains("mist") -> {
                val paint = strokePaint(CLOUD, max(1f, size * 0.09f))
                repeat(3) { i ->
                    val y = cy + (i - 1) * size * 0.22f
                    canvas.drawLine(cx - size * 0.48f, y, cx + size * if (i == 1) 0.34f else 0.48f, y, paint)
                }
            }
            key.contains("vient") || key.contains("wind") -> drawWindGlyph(canvas, cx, cy, size, CYAN_SOFT)
            key.contains("night") || key.contains("noche") -> drawMoonGlyph(canvas, cx, cy, size, VIOLET)
            key.contains("parcial") || key.contains("partly") -> {
                drawSunGlyph(canvas, cx + size * 0.22f, cy - size * 0.18f, size * 0.62f, SOLAR)
                drawCloudGlyph(canvas, cx - size * 0.08f, cy + size * 0.10f, size * 0.82f, CLOUD)
            }
            key.contains("sun") || key.contains("sol") || key.contains("despejado") || key.contains("clear") || key.contains("hot") -> drawSunGlyph(canvas, cx, cy, size, SOLAR)
            else -> drawCloudGlyph(canvas, cx, cy, size, if (accent == SOLAR) CLOUD else lighten(accent, 0.45f))
        }
    }

    private fun drawSunGlyph(canvas: Canvas, cx: Float, cy: Float, size: Float, color: Int) {
        val radius = size * 0.28f
        canvas.drawCircle(cx, cy, radius, solidPaint(color))
        val paint = strokePaint(color, max(1f, size * 0.08f))
        repeat(8) { i ->
            val angle = PI * 2.0 * i / 8.0
            canvas.drawLine(
                cx + cos(angle).toFloat() * size * 0.42f,
                cy + sin(angle).toFloat() * size * 0.42f,
                cx + cos(angle).toFloat() * size * 0.58f,
                cy + sin(angle).toFloat() * size * 0.58f,
                paint,
            )
        }
    }

    private fun drawCloudGlyph(canvas: Canvas, cx: Float, cy: Float, size: Float, color: Int) {
        val paint = solidPaint(color)
        canvas.drawCircle(cx - size * 0.22f, cy, size * 0.25f, paint)
        canvas.drawCircle(cx + size * 0.02f, cy - size * 0.13f, size * 0.31f, paint)
        canvas.drawCircle(cx + size * 0.28f, cy + size * 0.02f, size * 0.23f, paint)
        canvas.drawRoundRect(RectF(cx - size * 0.42f, cy, cx + size * 0.47f, cy + size * 0.28f), size * 0.14f, size * 0.14f, paint)
    }

    private fun drawBolt(canvas: Canvas, cx: Float, cy: Float, size: Float, color: Int) {
        val path = Path().apply {
            moveTo(cx + size * 0.08f, cy - size * 0.48f)
            lineTo(cx - size * 0.20f, cy + size * 0.04f)
            lineTo(cx + size * 0.02f, cy + size * 0.02f)
            lineTo(cx - size * 0.12f, cy + size * 0.48f)
            lineTo(cx + size * 0.30f, cy - size * 0.10f)
            lineTo(cx + size * 0.08f, cy - size * 0.08f)
            close()
        }
        canvas.drawPath(path, solidPaint(color))
    }

    private fun drawSnowStar(canvas: Canvas, cx: Float, cy: Float, size: Float, color: Int) {
        val paint = strokePaint(color, max(1f, size * 0.16f))
        repeat(3) { i ->
            val angle = PI * i / 3.0
            canvas.drawLine(
                cx - cos(angle).toFloat() * size,
                cy - sin(angle).toFloat() * size,
                cx + cos(angle).toFloat() * size,
                cy + sin(angle).toFloat() * size,
                paint,
            )
        }
    }

    private fun drawWindGlyph(canvas: Canvas, cx: Float, cy: Float, size: Float, color: Int) {
        val paint = strokePaint(color, max(1f, size * 0.09f))
        repeat(3) { i ->
            val y = cy + (i - 1) * size * 0.25f
            val path = Path().apply {
                moveTo(cx - size * 0.52f, y)
                cubicTo(cx - size * 0.10f, y - size * 0.12f, cx + size * 0.12f, y + size * 0.10f, cx + size * 0.48f, y - size * 0.02f)
            }
            canvas.drawPath(path, paint)
        }
    }

    private fun drawMoonGlyph(canvas: Canvas, cx: Float, cy: Float, size: Float, color: Int) {
        canvas.drawCircle(cx, cy, size * 0.42f, solidPaint(color))
        canvas.drawCircle(cx + size * 0.18f, cy - size * 0.10f, size * 0.40f, solidPaint(PANEL))
    }

    private fun drawMetricGlyph(canvas: Canvas, cx: Float, cy: Float, size: Float, label: String, accent: Int) {
        when (label) {
            "VIENTO" -> drawWindGlyph(canvas, cx, cy, size, accent)
            "LLUVIA" -> {
                val path = Path().apply {
                    moveTo(cx, cy - size * 0.58f)
                    cubicTo(cx - size * 0.42f, cy - size * 0.04f, cx - size * 0.42f, cy + size * 0.45f, cx, cy + size * 0.55f)
                    cubicTo(cx + size * 0.42f, cy + size * 0.45f, cx + size * 0.42f, cy - size * 0.04f, cx, cy - size * 0.58f)
                }
                canvas.drawPath(path, strokePaint(accent, max(1f, size * 0.12f)))
            }
            else -> {
                canvas.drawCircle(cx - size * 0.16f, cy, size * 0.22f, strokePaint(accent, max(1f, size * 0.12f)))
                canvas.drawCircle(cx + size * 0.18f, cy, size * 0.28f, strokePaint(accent, max(1f, size * 0.12f)))
            }
        }
    }

    private fun drawFittedText(
        canvas: Canvas,
        text: String,
        x: Float,
        y: Float,
        maxWidth: Float,
        maxSize: Float,
        minSize: Float,
        color: Int,
        bold: Boolean,
        align: Paint.Align,
    ) {
        if (text.isBlank() || maxWidth <= 0f) return
        var size = maxSize
        var paint = textPaint(size, color, bold, align)
        val step = max(0.5f, (maxSize - minSize) / 10f)
        while (size > minSize && paint.measureText(text) > maxWidth) {
            size = max(minSize, size - step)
            paint = textPaint(size, color, bold, align)
        }
        canvas.drawText(fitText(text, paint, maxWidth), x, y, paint)
    }

    private fun fitText(text: String, paint: Paint, maxWidth: Float): String {
        if (paint.measureText(text) <= maxWidth) return text
        var candidate = text
        while (candidate.length > 2 && paint.measureText("$candidate…") > maxWidth) candidate = candidate.dropLast(1)
        return candidate.trimEnd() + "…"
    }

    private fun textPaint(size: Float, color: Int, bold: Boolean, align: Paint.Align): Paint =
        Paint(Paint.ANTI_ALIAS_FLAG).apply {
            this.color = color
            textSize = size
            textAlign = align
            typeface = Typeface.create("sans-serif", if (bold) Typeface.BOLD else Typeface.NORMAL)
            isSubpixelText = true
        }

    private fun profile(state: OrbiWidgetContract): Profile {
        val key = "${state.conditionCode} ${state.conditionLabel} ${state.orbAssetKey}".lowercase()
        val intensity = when {
            key.contains("violent") || key.contains("violento") || key.contains("intensa") || key.contains("intenso") || key.contains("fuerte") || key.contains("heavy") -> 0.92f
            key.contains("moder") || key.contains("media") -> 0.62f
            key.contains("liger") || key.contains("débil") || key.contains("debil") || key.contains("light") -> 0.34f
            else -> 0.50f
        }
        return when {
            key.contains("torment") || key.contains("thunder") || key.contains("granizo") || key.contains("hail") -> Profile(Family.STORM, VIOLET, intensity)
            key.contains("nieve") || key.contains("snow") || key.contains("frost") || key.contains("escarcha") || key.contains("cold") -> Profile(Family.SNOW, ICE, intensity)
            key.contains("llovizna") || key.contains("drizzle") -> Profile(Family.DRIZZLE, CYAN, intensity)
            key.contains("lluv") || key.contains("rain") || key.contains("chubasco") || key.contains("shower") -> Profile(Family.RAIN, BLUE, intensity)
            key.contains("niebla") || key.contains("fog") || key.contains("bruma") || key.contains("mist") -> Profile(Family.FOG, CLOUD, intensity)
            key.contains("vient") || key.contains("wind") -> Profile(Family.WIND, CYAN, intensity)
            key.contains("night") || key.contains("noche") -> Profile(Family.NIGHT, VIOLET, intensity)
            key.contains("nubl") || key.contains("cubiert") || key.contains("cloud") || key.contains("parcial") -> Profile(Family.CLOUD, CLOUD, intensity)
            else -> Profile(Family.CLEAR, SOLAR, intensity)
        }
    }

    private fun accentForKey(keyRaw: String, fallback: Int): Int {
        val key = keyRaw.lowercase()
        return when {
            key.contains("torment") || key.contains("hail") || key.contains("thunder") -> VIOLET
            key.contains("nieve") || key.contains("snow") || key.contains("frost") -> ICE
            key.contains("lluv") || key.contains("rain") || key.contains("drizzle") || key.contains("chubasco") -> BLUE
            key.contains("sun") || key.contains("sol") || key.contains("despejado") || key.contains("clear") -> SOLAR
            key.contains("niebla") || key.contains("fog") -> CLOUD
            else -> fallback
        }
    }

    private fun sourceBadge(state: OrbiWidgetContract): String = when (state.sourceMode.lowercase()) {
        "gps" -> "GPS"
        "live" -> "LIVE"
        "cached", "cache" -> "CACHE"
        "saved", "guardada" -> "GUARDADA"
        "destination", "destino" -> "DESTINO"
        "demo", "mock" -> "DEMO"
        "fallback" -> "SEGURO"
        else -> state.sourceMode.uppercase().ifBlank { "LIVE" }
    }

    private fun hasAlert(state: OrbiWidgetContract): Boolean =
        state.mainAlertTitle.isNotBlank() &&
            state.mainAlertTitle != "Sin alertas relevantes" &&
            state.mainAlertTitle != "Sin alertas operativas críticas"

    private fun uvDescriptor(value: Int): String = when {
        value >= 11 -> "Extremo"
        value >= 8 -> "Muy alto"
        value >= 6 -> "Alto"
        value >= 3 -> "Moderado"
        else -> "Bajo"
    }

    private fun humidityDescriptor(value: Int): String = when {
        value >= 85 -> "Muy alta"
        value >= 70 -> "Alta"
        value >= 40 -> "Normal"
        else -> "Baja"
    }

    private fun scale(b: RectF): Float = min(b.width(), b.height()) / 100f

    private fun solidPaint(color: Int): Paint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        this.color = color
    }

    private fun strokePaint(color: Int, width: Float): Paint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        this.color = color
        style = Paint.Style.STROKE
        strokeWidth = width
        strokeCap = Paint.Cap.ROUND
    }

    private fun glowPaint(cx: Float, cy: Float, radius: Float, color: Int, alpha: Int): Paint =
        Paint(Paint.ANTI_ALIAS_FLAG).apply {
            shader = RadialGradient(
                cx, cy, radius.coerceAtLeast(1f),
                withAlpha(color, alpha), Color.TRANSPARENT,
                Shader.TileMode.CLAMP,
            )
        }

    private fun lighten(color: Int, amount: Float): Int {
        val a = amount.coerceIn(0f, 1f)
        return Color.rgb(
            (Color.red(color) + (255 - Color.red(color)) * a).toInt().coerceIn(0, 255),
            (Color.green(color) + (255 - Color.green(color)) * a).toInt().coerceIn(0, 255),
            (Color.blue(color) + (255 - Color.blue(color)) * a).toInt().coerceIn(0, 255),
        )
    }

    private fun withAlpha(color: Int, alpha: Int): Int =
        Color.argb(alpha.coerceIn(0, 255), Color.red(color), Color.green(color), Color.blue(color))

    private fun drawEdge(canvas: Canvas, b: RectF, radius: Float, accent: Int) {
        val side = min(b.width(), b.height())
        val stroke = (side * 0.0036f).coerceIn(1.2f, 4f)
        val inset = stroke / 2f + 1f
        canvas.drawRoundRect(
            RectF(b.left + inset, b.top + inset, b.right - inset, b.bottom - inset),
            max(2f, radius - inset),
            max(2f, radius - inset),
            Paint(Paint.ANTI_ALIAS_FLAG).apply {
                style = Paint.Style.STROKE
                strokeWidth = stroke
                shader = LinearGradient(
                    b.left, b.top, b.right, b.bottom,
                    withAlpha(CYAN, 150), withAlpha(accent, 96), Shader.TileMode.CLAMP,
                )
            },
        )
    }
}
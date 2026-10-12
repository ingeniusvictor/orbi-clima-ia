package com.orbi.clima.widget

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.LinearGradient
import android.graphics.Paint
import android.graphics.Path
import android.graphics.RadialGradient
import android.graphics.Rect
import android.graphics.RectF
import android.graphics.Shader
import android.graphics.Typeface
import androidx.annotation.DrawableRes
import androidx.core.content.ContextCompat
import com.orbi.clima.R
import kotlin.math.max
import kotlin.math.min

/**
 * OC-22O Native Widget Fluid Fidelity V3.
 *
 * Launcher geometry is the source of truth. Unlike V2/J, this renderer paints
 * directly into the final launcher bitmap instead of scaling a fixed canvas.
 * That keeps typography, orbital geometry and information density intentional
 * across OEM grids and resize operations.
 *
 * This renderer is isolated from the frozen Golden Orb implementation.
 */
object OrbiFluidNativeWidgetRendererV3 {
    private const val OBSIDIAN = 0xFF020611.toInt()
    private const val OBSIDIAN_2 = 0xFF07101F.toInt()
    private const val CARD = 0xD90A1425.toInt()
    private const val CARD_SOFT = 0xBD101C31.toInt()
    private const val CYAN = 0xFF67E8F9.toInt()
    private const val CYAN_2 = 0xFF22D3EE.toInt()
    private const val COBALT = 0xFF3B82F6.toInt()
    private const val VIOLET = 0xFF8B5CF6.toInt()
    private const val SOLAR = 0xFFFFD166.toInt()
    private const val GREEN = 0xFF34D399.toInt()
    private const val AMBER = 0xFFFBBF24.toInt()
    private const val ORANGE = 0xFFF97316.toInt()
    private const val RED = 0xFFFB7185.toInt()
    private const val ICE = 0xFFBAE6FD.toInt()
    private const val CLOUD = 0xFF94A3B8.toInt()
    private const val FOG = 0xFFD4D4D8.toInt()
    private const val TEXT = 0xFFF8FAFC.toInt()
    private const val MUTED = 0xFFCBD5E1.toInt()
    private const val DIM = 0xFF718096.toInt()

    private enum class Family {
        CLEAR,
        CLOUD,
        FOG,
        DRIZZLE,
        RAIN,
        STORM,
        SNOW,
        WIND,
        NIGHT,
    }

    private data class WeatherProfile(
        val family: Family,
        val accent: Int,
        val secondary: Int,
        val intensity: Float,
    )

    fun render(
        context: Context,
        state: OrbiWidgetContract,
        variant: OrbiNativeWidgetSnapshotRendererV2.Variant,
        width: Int,
        height: Int,
    ): Bitmap {
        val safeWidth = width.coerceAtLeast(1)
        val safeHeight = height.coerceAtLeast(1)
        val bitmap = Bitmap.createBitmap(safeWidth, safeHeight, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)
        val minSide = min(safeWidth, safeHeight).toFloat()
        val radius = (minSide * 0.075f).coerceIn(18f, 74f)
        val bounds = RectF(0f, 0f, safeWidth.toFloat(), safeHeight.toFloat())
        val profile = weatherProfile(state)
        val clip = Path().apply { addRoundRect(bounds, radius, radius, Path.Direction.CW) }

        canvas.save()
        canvas.clipPath(clip)
        drawBackdrop(canvas, bounds, profile)
        drawWeatherAtmosphere(canvas, bounds, profile)

        when (variant) {
            OrbiNativeWidgetSnapshotRendererV2.Variant.MINI -> drawMini(canvas, context, state, bounds, profile)
            OrbiNativeWidgetSnapshotRendererV2.Variant.PANEL -> drawPanel(canvas, context, state, bounds, profile)
            OrbiNativeWidgetSnapshotRendererV2.Variant.COMMAND -> drawCommand(canvas, context, state, bounds, profile, premium = false)
            OrbiNativeWidgetSnapshotRendererV2.Variant.PREMIUM_COMMAND -> drawCommand(canvas, context, state, bounds, profile, premium = true)
            OrbiNativeWidgetSnapshotRendererV2.Variant.FIELD_COMMAND -> drawField(canvas, context, state, bounds, profile)
            OrbiNativeWidgetSnapshotRendererV2.Variant.CINEMATIC_BAR -> drawCinematic(canvas, context, state, bounds, profile)
        }

        drawEdge(canvas, bounds, radius, profile.accent)
        canvas.restore()
        return bitmap
    }

    private fun drawBackdrop(canvas: Canvas, bounds: RectF, profile: WeatherProfile) {
        val base = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            shader = LinearGradient(
                bounds.left,
                bounds.top,
                bounds.right,
                bounds.bottom,
                intArrayOf(OBSIDIAN, OBSIDIAN_2, 0xFF050A16.toInt()),
                floatArrayOf(0f, 0.55f, 1f),
                Shader.TileMode.CLAMP,
            )
        }
        canvas.drawRect(bounds, base)

        val ambient = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            shader = RadialGradient(
                bounds.centerX() * 0.96f,
                bounds.centerY() * 0.92f,
                max(bounds.width(), bounds.height()) * 0.78f,
                intArrayOf(
                    withAlpha(profile.accent, 66),
                    withAlpha(profile.secondary, 24),
                    Color.TRANSPARENT,
                ),
                floatArrayOf(0f, 0.58f, 1f),
                Shader.TileMode.CLAMP,
            )
        }
        canvas.drawRect(bounds, ambient)
    }

    private fun drawWeatherAtmosphere(canvas: Canvas, b: RectF, p: WeatherProfile) {
        when (p.family) {
            Family.CLEAR -> drawSolarAtmosphere(canvas, b, p)
            Family.CLOUD -> drawCloudAtmosphere(canvas, b, p)
            Family.FOG -> drawFogAtmosphere(canvas, b, p)
            Family.DRIZZLE -> {
                drawCloudAtmosphere(canvas, b, p)
                drawRainAtmosphere(canvas, b, p, drizzle = true)
            }
            Family.RAIN -> {
                drawCloudAtmosphere(canvas, b, p)
                drawRainAtmosphere(canvas, b, p, drizzle = false)
            }
            Family.STORM -> {
                drawStormAtmosphere(canvas, b, p)
                drawRainAtmosphere(canvas, b, p.copy(intensity = max(0.58f, p.intensity)), drizzle = false)
            }
            Family.SNOW -> {
                drawCloudAtmosphere(canvas, b, p)
                drawSnowAtmosphere(canvas, b, p)
            }
            Family.WIND -> drawWindAtmosphere(canvas, b, p)
            Family.NIGHT -> drawNightAtmosphere(canvas, b, p)
        }
    }

    private fun drawSolarAtmosphere(canvas: Canvas, b: RectF, p: WeatherProfile) {
        val r = min(b.width(), b.height()) * 0.40f
        val x = b.right - r * 0.55f
        val y = b.top + r * 0.35f
        val glow = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            shader = RadialGradient(x, y, r, withAlpha(p.accent, 88), Color.TRANSPARENT, Shader.TileMode.CLAMP)
        }
        canvas.drawCircle(x, y, r, glow)
        val ray = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            style = Paint.Style.STROKE
            strokeWidth = max(1f, min(b.width(), b.height()) * 0.0035f)
            color = withAlpha(SOLAR, 24)
        }
        for (i in 0 until 5) {
            val inset = r * (0.42f + i * 0.11f)
            canvas.drawArc(RectF(x - inset, y - inset, x + inset, y + inset), 110f, 135f, false, ray)
        }
    }

    private fun drawCloudAtmosphere(canvas: Canvas, b: RectF, p: WeatherProfile) {
        val baseR = min(b.width(), b.height()) * 0.17f
        val cloud = Paint(Paint.ANTI_ALIAS_FLAG)
        for (i in 0 until 8) {
            val x = b.left + b.width() * (0.08f + ((i * 17) % 83) / 100f)
            val y = b.top + b.height() * (0.20f + ((i * 11) % 29) / 100f)
            val r = baseR * (0.46f + (i % 4) * 0.11f)
            cloud.shader = RadialGradient(
                x,
                y,
                r,
                withAlpha(if (i % 2 == 0) CLOUD else p.accent, 22 + (i % 3) * 7),
                Color.TRANSPARENT,
                Shader.TileMode.CLAMP,
            )
            canvas.drawCircle(x, y, r, cloud)
        }
    }

    private fun drawFogAtmosphere(canvas: Canvas, b: RectF, p: WeatherProfile) {
        val fog = Paint(Paint.ANTI_ALIAS_FLAG)
        val bandH = max(9f, b.height() * 0.075f)
        for (i in 0 until 7) {
            val top = b.top + b.height() * (0.16f + i * 0.105f)
            val drift = if (i % 2 == 0) b.width() * 0.02f else -b.width() * 0.035f
            val rect = RectF(b.left - b.width() * 0.08f + drift, top, b.right + b.width() * 0.08f + drift, top + bandH)
            fog.shader = LinearGradient(
                rect.left,
                rect.centerY(),
                rect.right,
                rect.centerY(),
                intArrayOf(Color.TRANSPARENT, withAlpha(p.accent, 25 + i * 3), withAlpha(Color.WHITE, 16), Color.TRANSPARENT),
                floatArrayOf(0f, 0.24f, 0.65f, 1f),
                Shader.TileMode.CLAMP,
            )
            canvas.drawRoundRect(rect, bandH / 2f, bandH / 2f, fog)
        }
    }

    private fun drawRainAtmosphere(canvas: Canvas, b: RectF, p: WeatherProfile, drizzle: Boolean) {
        val count = when {
            drizzle -> 13
            p.intensity >= 0.78f -> 34
            p.intensity >= 0.52f -> 25
            else -> 18
        }
        val stroke = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            style = Paint.Style.STROKE
            strokeCap = Paint.Cap.ROUND
            strokeWidth = max(1f, min(b.width(), b.height()) * if (drizzle) 0.0022f else 0.0034f)
            color = withAlpha(if (drizzle) CYAN else COBALT, if (drizzle) 42 else 60)
        }
        val len = b.height() * if (drizzle) 0.055f else 0.095f
        for (i in 0 until count) {
            val x = b.left + ((i * 73 + 31) % 101) / 100f * b.width()
            val y = b.top + ((i * 47 + 17) % 93) / 100f * b.height()
            canvas.drawLine(x, y, x - len * 0.22f, y + len, stroke)
        }
    }

    private fun drawStormAtmosphere(canvas: Canvas, b: RectF, p: WeatherProfile) {
        drawCloudAtmosphere(canvas, b, p)
        val lightning = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            style = Paint.Style.STROKE
            strokeWidth = max(2f, min(b.width(), b.height()) * 0.006f)
            strokeCap = Paint.Cap.ROUND
            color = withAlpha(Color.WHITE, 64)
        }
        val x = b.right - b.width() * 0.18f
        val y = b.top + b.height() * 0.12f
        val bolt = Path().apply {
            moveTo(x, y)
            lineTo(x - b.width() * 0.055f, y + b.height() * 0.11f)
            lineTo(x - b.width() * 0.015f, y + b.height() * 0.105f)
            lineTo(x - b.width() * 0.085f, y + b.height() * 0.23f)
        }
        canvas.drawPath(bolt, lightning)
    }

    private fun drawSnowAtmosphere(canvas: Canvas, b: RectF, p: WeatherProfile) {
        val count = when {
            p.intensity >= 0.78f -> 34
            p.intensity >= 0.52f -> 26
            else -> 18
        }
        val snow = Paint(Paint.ANTI_ALIAS_FLAG).apply { color = withAlpha(ICE, 74) }
        for (i in 0 until count) {
            val x = b.left + ((i * 67 + 23) % 101) / 100f * b.width()
            val y = b.top + ((i * 43 + 19) % 97) / 100f * b.height()
            val r = max(1.1f, min(b.width(), b.height()) * (0.003f + (i % 4) * 0.0013f))
            canvas.drawCircle(x, y, r, snow)
        }
    }

    private fun drawWindAtmosphere(canvas: Canvas, b: RectF, p: WeatherProfile) {
        val wind = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            style = Paint.Style.STROKE
            strokeWidth = max(1.2f, min(b.width(), b.height()) * 0.0032f)
            strokeCap = Paint.Cap.ROUND
            color = withAlpha(p.accent, 46)
        }
        for (i in 0 until 7) {
            val y = b.top + b.height() * (0.18f + i * 0.105f)
            val path = Path().apply {
                moveTo(b.left - b.width() * 0.05f, y)
                cubicTo(
                    b.left + b.width() * 0.24f,
                    y - b.height() * 0.035f,
                    b.left + b.width() * 0.56f,
                    y + b.height() * 0.04f,
                    b.right + b.width() * 0.05f,
                    y - b.height() * 0.01f,
                )
            }
            canvas.drawPath(path, wind)
        }
    }

    private fun drawNightAtmosphere(canvas: Canvas, b: RectF, p: WeatherProfile) {
        val star = Paint(Paint.ANTI_ALIAS_FLAG)
        val side = min(b.width(), b.height())
        for (i in 0 until 26) {
            val x = b.left + ((i * 61 + 17) % 97) / 100f * b.width()
            val y = b.top + ((i * 37 + 11) % 83) / 100f * b.height() * 0.78f
            star.color = withAlpha(if (i % 4 == 0) CYAN else Color.WHITE, 35 + (i % 5) * 12)
            canvas.drawCircle(x, y, side * if (i % 5 == 0) 0.005f else 0.0028f, star)
        }
    }

    private fun drawMini(canvas: Canvas, context: Context, state: OrbiWidgetContract, b: RectF, p: WeatherProfile) {
        val u = min(b.width(), b.height()) / 100f
        drawBrand(canvas, state, b, compact = true)
        if (b.width() / b.height() > 1.20f) {
            val orbR = min(b.height() * 0.27f, b.width() * 0.18f)
            val orbX = b.left + b.width() * 0.25f
            val orbY = b.top + b.height() * 0.55f
            drawOrb(canvas, context, state, orbX, orbY, orbR, p)
            val left = b.left + b.width() * 0.48f
            drawFittedText(canvas, "${state.temperatureC}°", left, b.top + b.height() * 0.52f, b.width() * 0.42f, 13u, 8u, TEXT, true, Paint.Align.LEFT)
            drawFittedText(canvas, state.conditionLabel, left, b.top + b.height() * 0.66f, b.width() * 0.44f, 4.8u, 3.1u, p.accent, true, Paint.Align.LEFT)
            drawFittedText(canvas, state.locationName, left, b.top + b.height() * 0.77f, b.width() * 0.44f, 4u, 2.8u, MUTED, true, Paint.Align.LEFT)
        } else {
            val cx = b.centerX()
            val orbR = min(b.width(), b.height()) * 0.21f
            drawOrb(canvas, context, state, cx, b.top + b.height() * 0.39f, orbR, p)
            drawFittedText(canvas, "${state.temperatureC}°", cx, b.top + b.height() * 0.72f, b.width() * 0.80f, 13u, 8u, TEXT, true, Paint.Align.CENTER)
            drawFittedText(canvas, state.conditionLabel.uppercase(), cx, b.top + b.height() * 0.81f, b.width() * 0.82f, 4.6u, 2.6u, p.accent, true, Paint.Align.CENTER)
            drawFittedText(canvas, state.locationName, cx, b.top + b.height() * 0.88f, b.width() * 0.80f, 4u, 2.7u, MUTED, true, Paint.Align.CENTER)
        }
    }

    private fun drawPanel(canvas: Canvas, context: Context, state: OrbiWidgetContract, b: RectF, p: WeatherProfile) {
        val u = min(b.width(), b.height()) / 100f
        drawBrand(canvas, state, b)
        val wide = b.width() / b.height() >= 1.75f
        if (!wide) {
            drawMini(canvas, context, state, b, p)
            return
        }

        val orbX = b.left + b.width() * 0.16f
        val orbY = b.top + b.height() * 0.56f
        val orbR = min(b.height() * 0.27f, b.width() * 0.105f)
        drawOrb(canvas, context, state, orbX, orbY, orbR, p)

        val infoX = b.left + b.width() * 0.31f
        drawFittedText(canvas, "${state.temperatureC}°", infoX, b.top + b.height() * 0.47f, b.width() * 0.24f, 15u, 8u, TEXT, true, Paint.Align.LEFT)
        drawFittedText(canvas, state.conditionLabel, infoX, b.top + b.height() * 0.60f, b.width() * 0.25f, 5.1u, 3u, p.accent, true, Paint.Align.LEFT)
        drawFittedText(canvas, state.locationName, infoX, b.top + b.height() * 0.70f, b.width() * 0.25f, 4.2u, 2.8u, MUTED, true, Paint.Align.LEFT)
        drawFittedText(canvas, "Sensación ${state.feelsLikeC}°", infoX, b.top + b.height() * 0.79f, b.width() * 0.25f, 3.5u, 2.5u, DIM, false, Paint.Align.LEFT)

        val metricsLeft = b.left + b.width() * 0.59f
        val right = b.right - b.width() * 0.035f
        val gap = b.width() * 0.015f
        val cardW = (right - metricsLeft - gap) / 2f
        val top = b.top + b.height() * 0.28f
        val cardH = b.height() * 0.22f
        drawMetricCard(canvas, RectF(metricsLeft, top, metricsLeft + cardW, top + cardH), "HUMEDAD", "${state.humidity}%", CYAN, u)
        drawMetricCard(canvas, RectF(metricsLeft + cardW + gap, top, right, top + cardH), "LLUVIA", "${state.rainProbability}%", COBALT, u)
        drawMetricCard(canvas, RectF(metricsLeft, top + cardH + gap, metricsLeft + cardW, top + cardH * 2 + gap), "VIENTO", "${state.windSpeedKmh} km/h", VIOLET, u)
        drawMetricCard(canvas, RectF(metricsLeft + cardW + gap, top + cardH + gap, right, top + cardH * 2 + gap), "UV", state.uvIndex.toString(), SOLAR, u)
    }

    private fun drawCommand(
        canvas: Canvas,
        context: Context,
        state: OrbiWidgetContract,
        b: RectF,
        p: WeatherProfile,
        premium: Boolean,
    ) {
        val u = min(b.width(), b.height()) / 100f
        drawBrand(canvas, state, b)
        val cx = b.centerX()
        val cy = b.top + b.height() * 0.43f
        val orbR = min(b.width(), b.height()) * if (premium) 0.16f else 0.145f
        drawOrbitalRing(canvas, cx, cy, b.width() * 0.33f, b.height() * 0.16f, -12f, CYAN, 70, u)
        drawOrbitalRing(canvas, cx, cy, b.width() * 0.29f, b.height() * 0.205f, 16f, VIOLET, 56, u)

        val bubbleR = min(b.width(), b.height()) * 0.079f
        drawMetricBubble(canvas, b.left + b.width() * 0.16f, b.top + b.height() * 0.30f, bubbleR, "LLUVIA", "${state.rainProbability}%", COBALT, u)
        drawMetricBubble(canvas, b.right - b.width() * 0.16f, b.top + b.height() * 0.30f, bubbleR, "HUMEDAD", "${state.humidity}%", CYAN, u)
        drawMetricBubble(canvas, b.left + b.width() * 0.16f, b.top + b.height() * 0.57f, bubbleR, "VIENTO", "${state.windSpeedKmh}", VIOLET, u)
        drawMetricBubble(canvas, b.right - b.width() * 0.16f, b.top + b.height() * 0.57f, bubbleR, "UV", state.uvIndex.toString(), SOLAR, u)

        drawOrb(canvas, context, state, cx, cy, orbR, p)
        drawFittedText(canvas, "${state.temperatureC}°", cx, b.top + b.height() * 0.67f, b.width() * 0.48f, 12u, 7u, TEXT, true, Paint.Align.CENTER)
        drawFittedText(canvas, state.conditionLabel, cx, b.top + b.height() * 0.735f, b.width() * 0.64f, 4.2u, 2.6u, p.accent, true, Paint.Align.CENTER)
        drawFittedText(canvas, state.locationName, cx, b.top + b.height() * 0.785f, b.width() * 0.60f, 3.8u, 2.5u, MUTED, true, Paint.Align.CENTER)

        val panel = RectF(b.left + b.width() * 0.045f, b.top + b.height() * 0.82f, b.right - b.width() * 0.045f, b.bottom - b.height() * 0.035f)
        drawGlassPanel(canvas, panel, p.accent, u)
        drawFittedText(canvas, "ORBI IA", panel.left + panel.width() * 0.035f, panel.top + panel.height() * 0.39f, panel.width() * 0.16f, 3.3u, 2.2u, CYAN, true, Paint.Align.LEFT)
        drawFittedText(canvas, state.shortNarrative, panel.left + panel.width() * 0.20f, panel.top + panel.height() * 0.39f, panel.width() * 0.75f, 3.2u, 2.1u, TEXT, true, Paint.Align.LEFT)
        val timeline = "${state.nextHour1Label} ${state.nextHour1Temp}°  •  ${state.nextHour2Label} ${state.nextHour2Temp}°  •  ${state.nextHour3Label} ${state.nextHour3Temp}°"
        drawFittedText(canvas, timeline, panel.left + panel.width() * 0.035f, panel.top + panel.height() * 0.78f, panel.width() * 0.69f, 2.7u, 1.8u, MUTED, false, Paint.Align.LEFT)
        drawFittedText(canvas, if (premium) "COMMAND PREMIUM" else "SKYORB COMMAND", panel.right - panel.width() * 0.035f, panel.top + panel.height() * 0.78f, panel.width() * 0.28f, 2.4u, 1.6u, p.accent, true, Paint.Align.RIGHT)
    }

    private fun drawField(canvas: Canvas, context: Context, state: OrbiWidgetContract, b: RectF, p: WeatherProfile) {
        val u = min(b.width(), b.height()) / 100f
        drawBrand(canvas, state, b)
        drawFittedText(canvas, "FIELD COMMAND", b.left + b.width() * 0.05f, b.top + b.height() * 0.115f, b.width() * 0.40f, 3.6u, 2.2u, AMBER, true, Paint.Align.LEFT)

        val status = RectF(b.left + b.width() * 0.05f, b.top + b.height() * 0.145f, b.right - b.width() * 0.05f, b.top + b.height() * 0.27f)
        val decision = decisionColor(state)
        drawGlassPanel(canvas, status, decision, u)
        drawFittedText(canvas, "CONDICIÓN OPERATIVA", status.left + status.width() * 0.035f, status.top + status.height() * 0.38f, status.width() * 0.45f, 2.6u, 1.8u, DIM, true, Paint.Align.LEFT)
        drawFittedText(canvas, state.globalDecisionLabel.uppercase(), status.left + status.width() * 0.035f, status.top + status.height() * 0.79f, status.width() * 0.48f, 5.2u, 3.0u, decision, true, Paint.Align.LEFT)
        drawFittedText(canvas, "${state.temperatureC}° / SENS. ${state.feelsLikeC}°", status.right - status.width() * 0.035f, status.top + status.height() * 0.72f, status.width() * 0.42f, 4.2u, 2.5u, TEXT, true, Paint.Align.RIGHT)

        val orbX = b.left + b.width() * 0.22f
        val orbY = b.top + b.height() * 0.46f
        val orbR = min(b.width(), b.height()) * 0.125f
        drawOrb(canvas, context, state, orbX, orbY, orbR, p)
        drawFittedText(canvas, state.conditionLabel, orbX, b.top + b.height() * 0.625f, b.width() * 0.32f, 3.7u, 2.3u, p.accent, true, Paint.Align.CENTER)

        val left = b.left + b.width() * 0.40f
        val right = b.right - b.width() * 0.05f
        val gap = b.width() * 0.018f
        val cardW = (right - left - gap) / 2f
        val top = b.top + b.height() * 0.35f
        val cardH = b.height() * 0.115f
        drawMetricCard(canvas, RectF(left, top, left + cardW, top + cardH), "HUMEDAD", "${state.humidity}%", CYAN, u)
        drawMetricCard(canvas, RectF(left + cardW + gap, top, right, top + cardH), "VIENTO", "${state.windSpeedKmh} km/h", VIOLET, u)
        drawMetricCard(canvas, RectF(left, top + cardH + gap, left + cardW, top + cardH * 2 + gap), "UV", state.uvIndex.toString(), SOLAR, u)
        drawMetricCard(canvas, RectF(left + cardW + gap, top + cardH + gap, right, top + cardH * 2 + gap), "LLUVIA", "${state.rainProbability}%", COBALT, u)

        val advisory = RectF(b.left + b.width() * 0.05f, b.top + b.height() * 0.66f, b.right - b.width() * 0.05f, b.top + b.height() * 0.84f)
        val advisoryColor = if (hasAlert(state)) riskColor(state.mainAlertSeverity) else AMBER
        drawGlassPanel(canvas, advisory, advisoryColor, u)
        drawFittedText(canvas, if (hasAlert(state)) "ALERTA ACTIVA" else "ORBI SKYCORE · MITIGACIÓN", advisory.left + advisory.width() * 0.03f, advisory.top + advisory.height() * 0.28f, advisory.width() * 0.90f, 2.8u, 1.8u, advisoryColor, true, Paint.Align.LEFT)
        val message = if (hasAlert(state)) state.mainAlertMessage else state.technicalRecommendation
        drawWrappedText(canvas, message, advisory.left + advisory.width() * 0.03f, advisory.top + advisory.height() * 0.52f, advisory.width() * 0.94f, 3.0u, TEXT, true, 2)

        val footer = RectF(b.left + b.width() * 0.05f, b.top + b.height() * 0.87f, b.right - b.width() * 0.05f, b.bottom - b.height() * 0.035f)
        drawGlassPanel(canvas, footer, CYAN, u)
        drawFittedText(canvas, "VENTANA SEGURA", footer.left + footer.width() * 0.03f, footer.top + footer.height() * 0.40f, footer.width() * 0.25f, 2.4u, 1.7u, DIM, true, Paint.Align.LEFT)
        drawFittedText(canvas, state.bestWindow, footer.left + footer.width() * 0.03f, footer.top + footer.height() * 0.78f, footer.width() * 0.55f, 3.6u, 2.2u, CYAN, true, Paint.Align.LEFT)
        drawFittedText(canvas, sourceBadge(state), footer.right - footer.width() * 0.03f, footer.top + footer.height() * 0.70f, footer.width() * 0.28f, 3.0u, 2u, sourceBadgeColor(sourceBadge(state)), true, Paint.Align.RIGHT)
    }

    private fun drawCinematic(canvas: Canvas, context: Context, state: OrbiWidgetContract, b: RectF, p: WeatherProfile) {
        val u = min(b.width(), b.height()) / 100f
        drawBrand(canvas, state, b)
        val orbX = b.left + b.width() * 0.13f
        val orbY = b.top + b.height() * 0.55f
        val orbR = min(b.height() * 0.28f, b.width() * 0.09f)
        drawOrb(canvas, context, state, orbX, orbY, orbR, p)

        val infoX = b.left + b.width() * 0.25f
        drawFittedText(canvas, "${state.temperatureC}°", infoX, b.top + b.height() * 0.49f, b.width() * 0.19f, 14u, 8u, TEXT, true, Paint.Align.LEFT)
        drawFittedText(canvas, state.conditionLabel.uppercase(), infoX, b.top + b.height() * 0.62f, b.width() * 0.20f, 4.7u, 2.8u, p.accent, true, Paint.Align.LEFT)
        drawFittedText(canvas, state.locationName, infoX, b.top + b.height() * 0.73f, b.width() * 0.20f, 4.1u, 2.6u, MUTED, true, Paint.Align.LEFT)

        val narrativeX = b.left + b.width() * 0.47f
        drawFittedText(canvas, "ORBI CINEMATIC", narrativeX, b.top + b.height() * 0.33f, b.width() * 0.47f, 3.4u, 2.3u, CYAN, true, Paint.Align.LEFT)
        val narrative = if (hasAlert(state)) "${state.mainAlertTitle}: ${state.mainAlertMessage}" else state.shortNarrative
        drawWrappedText(canvas, narrative, narrativeX, b.top + b.height() * 0.45f, b.width() * 0.47f, 4.0u, TEXT, true, 2)

        val chipTop = b.top + b.height() * 0.70f
        val chipGap = b.width() * 0.012f
        val chipW = (b.width() * 0.47f - chipGap * 2) / 3f
        drawTimelineChip(canvas, RectF(narrativeX, chipTop, narrativeX + chipW, b.bottom - b.height() * 0.07f), state.nextHour1Label, "${state.nextHour1Temp}°", CYAN, u)
        drawTimelineChip(canvas, RectF(narrativeX + chipW + chipGap, chipTop, narrativeX + chipW * 2 + chipGap, b.bottom - b.height() * 0.07f), state.nextHour2Label, "${state.nextHour2Temp}°", VIOLET, u)
        drawTimelineChip(canvas, RectF(narrativeX + chipW * 2 + chipGap * 2, chipTop, b.right - b.width() * 0.04f, b.bottom - b.height() * 0.07f), state.nextHour3Label, "${state.nextHour3Temp}°", SOLAR, u)
    }

    private fun drawBrand(canvas: Canvas, state: OrbiWidgetContract, b: RectF, compact: Boolean = false) {
        val u = min(b.width(), b.height()) / 100f
        val left = b.left + b.width() * 0.04f
        val baseline = b.top + b.height() * if (compact) 0.105f else 0.115f
        val right = b.right - b.width() * 0.04f
        val titleSize = if (compact) 4.2u else 4.8u
        drawFittedText(canvas, "ORBI", left, baseline, b.width() * 0.16f, titleSize, 2.7u, TEXT, true, Paint.Align.LEFT)
        drawFittedText(canvas, "CLIMA IA", left + b.width() * if (compact) 0.12f else 0.105f, baseline, b.width() * 0.22f, titleSize, 2.7u, CYAN, true, Paint.Align.LEFT)

        val badge = sourceBadge(state)
        val badgeW = min(b.width() * 0.18f, 25u)
        val badgeH = max(6.5u, b.height() * 0.075f)
        val rect = RectF(right - badgeW, baseline - badgeH * 0.72f, right, baseline + badgeH * 0.28f)
        drawGlassPill(canvas, rect, sourceBadgeColor(badge), u)
        drawFittedText(canvas, badge, rect.centerX(), rect.centerY() + 1.4u, rect.width() * 0.82f, 2.8u, 1.8u, sourceBadgeColor(badge), true, Paint.Align.CENTER)
    }

    private fun drawOrb(canvas: Canvas, context: Context, state: OrbiWidgetContract, cx: Float, cy: Float, radius: Float, p: WeatherProfile) {
        val glow = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            shader = RadialGradient(cx, cy, radius * 1.55f, withAlpha(p.accent, 88), Color.TRANSPARENT, Shader.TileMode.CLAMP)
        }
        canvas.drawCircle(cx, cy, radius * 1.55f, glow)

        val sphere = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            shader = RadialGradient(
                cx - radius * 0.34f,
                cy - radius * 0.38f,
                radius * 1.35f,
                intArrayOf(lighten(p.accent, 0.42f), p.accent, darken(p.accent, 0.56f), 0xFF050A14.toInt()),
                floatArrayOf(0f, 0.28f, 0.68f, 1f),
                Shader.TileMode.CLAMP,
            )
        }
        canvas.drawCircle(cx, cy, radius, sphere)

        val rim = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            style = Paint.Style.STROKE
            strokeWidth = max(2f, radius * 0.04f)
            shader = LinearGradient(cx - radius, cy - radius, cx + radius, cy + radius, lighten(p.accent, 0.32f), p.secondary, Shader.TileMode.CLAMP)
        }
        canvas.drawCircle(cx, cy, radius, rim)

        val inner = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            style = Paint.Style.STROKE
            strokeWidth = max(1f, radius * 0.015f)
            color = withAlpha(Color.WHITE, 36)
        }
        canvas.drawCircle(cx, cy, radius * 0.83f, inner)

        val highlight = Paint(Paint.ANTI_ALIAS_FLAG).apply { color = withAlpha(Color.WHITE, 54) }
        canvas.drawOval(RectF(cx - radius * 0.57f, cy - radius * 0.66f, cx + radius * 0.08f, cy - radius * 0.28f), highlight)

        val drawable = ContextCompat.getDrawable(context, resolveOrbDrawable(state))
        if (drawable != null) {
            val iconSize = (radius * 1.03f).toInt()
            val left = (cx - iconSize / 2f).toInt()
            val top = (cy - iconSize / 2f).toInt()
            drawable.bounds = Rect(left, top, left + iconSize, top + iconSize)
            drawable.alpha = 178
            drawable.draw(canvas)
        }
        canvas.drawCircle(cx + radius * 0.36f, cy - radius * 0.40f, radius * 0.055f, Paint(Paint.ANTI_ALIAS_FLAG).apply { color = withAlpha(Color.WHITE, 210) })
    }

    private fun drawMetricCard(canvas: Canvas, rect: RectF, label: String, value: String, accent: Int, u: Float) {
        drawGlassPanel(canvas, rect, accent, u)
        drawFittedText(canvas, label, rect.left + rect.width() * 0.09f, rect.top + rect.height() * 0.36f, rect.width() * 0.72f, 2.8u, 1.7u, withAlpha(accent, 235), true, Paint.Align.LEFT)
        drawFittedText(canvas, value, rect.left + rect.width() * 0.09f, rect.bottom - rect.height() * 0.19f, rect.width() * 0.82f, 4.9u, 2.7u, TEXT, true, Paint.Align.LEFT)
        val beadR = min(rect.width(), rect.height()) * 0.10f
        canvas.drawCircle(rect.right - rect.width() * 0.12f, rect.top + rect.height() * 0.26f, beadR, Paint(Paint.ANTI_ALIAS_FLAG).apply {
            shader = RadialGradient(rect.right - rect.width() * 0.12f, rect.top + rect.height() * 0.26f, beadR, withAlpha(accent, 150), Color.TRANSPARENT, Shader.TileMode.CLAMP)
        })
    }

    private fun drawMetricBubble(canvas: Canvas, cx: Float, cy: Float, radius: Float, label: String, value: String, accent: Int, u: Float) {
        canvas.drawCircle(cx, cy, radius * 1.28f, Paint(Paint.ANTI_ALIAS_FLAG).apply {
            shader = RadialGradient(cx, cy, radius * 1.28f, withAlpha(accent, 52), Color.TRANSPARENT, Shader.TileMode.CLAMP)
        })
        canvas.drawCircle(cx, cy, radius, Paint(Paint.ANTI_ALIAS_FLAG).apply { color = CARD })
        canvas.drawCircle(cx, cy, radius, Paint(Paint.ANTI_ALIAS_FLAG).apply {
            style = Paint.Style.STROKE
            strokeWidth = max(1f, u * 0.42f)
            color = withAlpha(accent, 140)
        })
        drawFittedText(canvas, label, cx, cy - radius * 0.22f, radius * 1.55f, 2.8u, 1.7u, accent, true, Paint.Align.CENTER)
        drawFittedText(canvas, value, cx, cy + radius * 0.28f, radius * 1.55f, 5.0u, 2.8u, TEXT, true, Paint.Align.CENTER)
    }

    private fun drawTimelineChip(canvas: Canvas, rect: RectF, label: String, value: String, accent: Int, u: Float) {
        drawGlassPanel(canvas, rect, accent, u)
        drawFittedText(canvas, label.uppercase(), rect.left + rect.width() * 0.09f, rect.top + rect.height() * 0.39f, rect.width() * 0.55f, 2.6u, 1.6u, DIM, true, Paint.Align.LEFT)
        drawFittedText(canvas, value, rect.right - rect.width() * 0.09f, rect.bottom - rect.height() * 0.18f, rect.width() * 0.52f, 5.0u, 2.7u, accent, true, Paint.Align.RIGHT)
    }

    private fun drawGlassPanel(canvas: Canvas, rect: RectF, accent: Int, u: Float) {
        val radius = max(8f, min(rect.width(), rect.height()) * 0.22f)
        canvas.drawRoundRect(rect, radius, radius, Paint(Paint.ANTI_ALIAS_FLAG).apply {
            shader = LinearGradient(rect.left, rect.top, rect.right, rect.bottom, CARD_SOFT, CARD, Shader.TileMode.CLAMP)
        })
        canvas.drawRoundRect(rect, radius, radius, Paint(Paint.ANTI_ALIAS_FLAG).apply {
            style = Paint.Style.STROKE
            strokeWidth = max(1f, u * 0.32f)
            color = withAlpha(accent, 68)
        })
    }

    private fun drawGlassPill(canvas: Canvas, rect: RectF, accent: Int, u: Float) {
        canvas.drawRoundRect(rect, rect.height() / 2f, rect.height() / 2f, Paint(Paint.ANTI_ALIAS_FLAG).apply { color = withAlpha(accent, 24) })
        canvas.drawRoundRect(rect, rect.height() / 2f, rect.height() / 2f, Paint(Paint.ANTI_ALIAS_FLAG).apply {
            style = Paint.Style.STROKE
            strokeWidth = max(1f, u * 0.28f)
            color = withAlpha(accent, 108)
        })
    }

    private fun drawOrbitalRing(canvas: Canvas, cx: Float, cy: Float, rx: Float, ry: Float, rotation: Float, color: Int, alpha: Int, u: Float) {
        canvas.save()
        canvas.rotate(rotation, cx, cy)
        canvas.drawOval(RectF(cx - rx, cy - ry, cx + rx, cy + ry), Paint(Paint.ANTI_ALIAS_FLAG).apply {
            style = Paint.Style.STROKE
            strokeWidth = max(1f, u * 0.34f)
            this.color = withAlpha(color, alpha)
        })
        canvas.restore()
    }

    private fun drawEdge(canvas: Canvas, b: RectF, radius: Float, accent: Int) {
        val side = min(b.width(), b.height())
        val stroke = (side * 0.004f).coerceIn(1.3f, 4f)
        val inset = stroke / 2f + 1f
        canvas.drawRoundRect(RectF(b.left + inset, b.top + inset, b.right - inset, b.bottom - inset), radius - inset, radius - inset, Paint(Paint.ANTI_ALIAS_FLAG).apply {
            style = Paint.Style.STROKE
            strokeWidth = stroke
            shader = LinearGradient(b.left, b.top, b.right, b.bottom, intArrayOf(withAlpha(CYAN, 160), withAlpha(accent, 92), withAlpha(VIOLET, 78)), null, Shader.TileMode.CLAMP)
        })
    }

    private fun drawWrappedText(
        canvas: Canvas,
        text: String,
        x: Float,
        firstBaseline: Float,
        maxWidth: Float,
        size: Float,
        color: Int,
        bold: Boolean,
        maxLines: Int,
    ) {
        val paint = textPaint(size, color, bold, Paint.Align.LEFT)
        val words = text.trim().split(Regex("\\s+"))
        if (words.isEmpty()) return
        val lines = mutableListOf<String>()
        var current = ""
        for (word in words) {
            val candidate = if (current.isBlank()) word else "$current $word"
            if (paint.measureText(candidate) <= maxWidth || current.isBlank()) {
                current = candidate
            } else {
                lines += current
                current = word
                if (lines.size >= maxLines - 1) break
            }
        }
        if (current.isNotBlank() && lines.size < maxLines) lines += current
        lines.take(maxLines).forEachIndexed { index, line ->
            val fitted = fitText(line, paint, maxWidth)
            canvas.drawText(fitted, x, firstBaseline + index * size * 1.28f, paint)
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
        while (size > minSize && paint.measureText(text) > maxWidth) {
            size -= max(0.5f, (maxSize - minSize) / 10f)
            paint = textPaint(size, color, bold, align)
        }
        val finalText = fitText(text, paint, maxWidth)
        canvas.drawText(finalText, x, y, paint)
    }

    private fun fitText(text: String, paint: Paint, maxWidth: Float): String {
        if (paint.measureText(text) <= maxWidth) return text
        var candidate = text
        while (candidate.length > 2 && paint.measureText("$candidate…") > maxWidth) {
            candidate = candidate.dropLast(1)
        }
        return candidate.trimEnd() + "…"
    }

    private fun textPaint(size: Float, color: Int, bold: Boolean, align: Paint.Align): Paint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        this.color = color
        textSize = size
        textAlign = align
        typeface = Typeface.create("sans-serif", if (bold) Typeface.BOLD else Typeface.NORMAL)
        isSubpixelText = true
    }

    private fun weatherProfile(state: OrbiWidgetContract): WeatherProfile {
        val key = "${state.conditionCode} ${state.conditionLabel} ${state.orbAssetKey}".lowercase()
        val intensity = when {
            key.contains("violent") || key.contains("violento") || key.contains("intensa") || key.contains("intenso") || key.contains("fuerte") || key.contains("heavy") -> 0.92f
            key.contains("moder") || key.contains("media") -> 0.62f
            key.contains("liger") || key.contains("débil") || key.contains("debil") || key.contains("light") -> 0.34f
            else -> 0.50f
        }
        return when {
            key.contains("torment") || key.contains("thunder") || key.contains("granizo") || key.contains("hail") -> WeatherProfile(Family.STORM, VIOLET, COBALT, intensity)
            key.contains("nieve") || key.contains("nev") || key.contains("snow") || key.contains("frost") || key.contains("escarcha") || key.contains("cold") -> WeatherProfile(Family.SNOW, ICE, CYAN, intensity)
            key.contains("llovizna") || key.contains("drizzle") -> WeatherProfile(Family.DRIZZLE, CYAN_2, COBALT, intensity)
            key.contains("lluv") || key.contains("rain") || key.contains("chubasco") || key.contains("shower") -> WeatherProfile(Family.RAIN, COBALT, CYAN, intensity)
            key.contains("niebla") || key.contains("neblina") || key.contains("bruma") || key.contains("fog") || key.contains("mist") -> WeatherProfile(Family.FOG, FOG, CLOUD, intensity)
            key.contains("vient") || key.contains("wind") -> WeatherProfile(Family.WIND, CYAN_2, GREEN, intensity)
            key.contains("night") || key.contains("noche") -> WeatherProfile(Family.NIGHT, VIOLET, CYAN, intensity)
            key.contains("nubl") || key.contains("cubiert") || key.contains("cloud") || key.contains("parcial") -> WeatherProfile(Family.CLOUD, CLOUD, CYAN, intensity)
            else -> WeatherProfile(Family.CLEAR, SOLAR, CYAN, intensity)
        }
    }

    private fun hasAlert(state: OrbiWidgetContract): Boolean =
        state.mainAlertTitle.isNotBlank() &&
            state.mainAlertTitle != "Sin alertas relevantes" &&
            state.mainAlertTitle != "Sin alertas operativas críticas"

    private fun decisionColor(state: OrbiWidgetContract): Int = when (state.riskLevel.lowercase()) {
        "critical" -> RED
        "high", "warning" -> ORANGE
        "medium", "watch" -> AMBER
        else -> GREEN
    }

    private fun riskColor(risk: String): Int = when (risk.lowercase()) {
        "critical" -> RED
        "high", "warning" -> ORANGE
        "medium", "watch" -> AMBER
        else -> GREEN
    }

    @DrawableRes
    private fun resolveOrbDrawable(state: OrbiWidgetContract): Int {
        val key = "${state.orbAssetKey} ${state.conditionCode} ${state.conditionLabel}".lowercase()
        return when {
            key.contains("torment") || key.contains("thunder") || key.contains("granizo") || key.contains("hail") -> R.drawable.orbi_widget_orb_storm
            key.contains("nieve") || key.contains("nev") || key.contains("snow") || key.contains("frost") || key.contains("escarcha") || key.contains("cold") -> R.drawable.orbi_widget_orb_cold
            key.contains("lluv") || key.contains("rain") || key.contains("llovizna") || key.contains("drizzle") || key.contains("chubasco") -> R.drawable.orbi_widget_orb_rain
            key.contains("niebla") || key.contains("neblina") || key.contains("bruma") || key.contains("fog") || key.contains("mist") -> R.drawable.orbi_widget_orb_fog
            key.contains("nubl") || key.contains("cubiert") || key.contains("cloud") || key.contains("parcial") -> R.drawable.orbi_widget_orb_cloudy
            key.contains("vient") || key.contains("wind") -> R.drawable.orbi_widget_orb_wind
            key.contains("sun") || key.contains("sol") || key.contains("clear") || key.contains("despejado") || key.contains("hot") -> R.drawable.orbi_widget_orb_sunny
            else -> R.drawable.orbi_widget_orb_fallback
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

    private fun sourceBadgeColor(label: String): Int = when (label) {
        "LIVE" -> GREEN
        "GPS" -> CYAN
        "CACHE" -> COBALT
        "DEMO", "SEGURO" -> AMBER
        "DESTINO" -> VIOLET
        "GUARDADA" -> GREEN
        else -> CYAN
    }

    private fun lighten(color: Int, amount: Float): Int {
        val a = amount.coerceIn(0f, 1f)
        return Color.rgb(
            (Color.red(color) + (255 - Color.red(color)) * a).toInt().coerceIn(0, 255),
            (Color.green(color) + (255 - Color.green(color)) * a).toInt().coerceIn(0, 255),
            (Color.blue(color) + (255 - Color.blue(color)) * a).toInt().coerceIn(0, 255),
        )
    }

    private fun darken(color: Int, amount: Float): Int {
        val a = (1f - amount.coerceIn(0f, 1f))
        return Color.rgb(
            (Color.red(color) * a).toInt().coerceIn(0, 255),
            (Color.green(color) * a).toInt().coerceIn(0, 255),
            (Color.blue(color) * a).toInt().coerceIn(0, 255),
        )
    }

    private fun withAlpha(color: Int, alpha: Int): Int =
        Color.argb(alpha.coerceIn(0, 255), Color.red(color), Color.green(color), Color.blue(color))
}

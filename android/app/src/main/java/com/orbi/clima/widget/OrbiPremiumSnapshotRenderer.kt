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
import kotlin.math.cos
import kotlin.math.sin

/**
 * High-fidelity static renderer for the 4x4 ORBI SkyOrb Command Premium widget.
 *
 * Android launchers cannot reproduce the CSS/WebGL effects used by the React
 * experience. This renderer therefore paints the visual hierarchy into one
 * deterministic bitmap and lets Glance act only as the launcher host.
 *
 * No web/Golden Orb source is imported or modified here.
 */
object OrbiPremiumSnapshotRenderer {
    private const val SIZE = 768

    private const val OBSIDIAN = 0xFF050814.toInt()
    private const val OBSIDIAN_SOFT = 0xFF0B1020.toInt()
    private const val CYAN = 0xFF67E8F9.toInt()
    private const val CYAN_SOFT = 0xFF22D3EE.toInt()
    private const val VIOLET = 0xFF8B5CF6.toInt()
    private const val SOLAR = 0xFFFFD166.toInt()
    private const val GREEN = 0xFF22C55E.toInt()
    private const val AMBER = 0xFFFBBF24.toInt()
    private const val RED = 0xFFEF4444.toInt()
    private const val TEXT = 0xFFF8FAFC.toInt()
    private const val MUTED = 0xFFCBD5E1.toInt()
    private const val DIM = 0xFF64748B.toInt()

    fun render(context: Context, state: OrbiWidgetContract): Bitmap {
        val bitmap = Bitmap.createBitmap(SIZE, SIZE, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)
        val bounds = RectF(0f, 0f, SIZE.toFloat(), SIZE.toFloat())

        val clip = Path().apply { addRoundRect(bounds, 54f, 54f, Path.Direction.CW) }
        canvas.save()
        canvas.clipPath(clip)
        drawBackdrop(canvas, state)
        drawHeader(canvas, state)
        drawOrbitalStage(canvas, context, state)
        drawBottomIntelligence(canvas, state)
        canvas.restore()

        return bitmap
    }

    private fun drawBackdrop(canvas: Canvas, state: OrbiWidgetContract) {
        val background = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            shader = LinearGradient(
                0f,
                0f,
                SIZE.toFloat(),
                SIZE.toFloat(),
                intArrayOf(OBSIDIAN, 0xFF08142A.toInt(), OBSIDIAN),
                floatArrayOf(0f, 0.48f, 1f),
                Shader.TileMode.CLAMP,
            )
        }
        canvas.drawRect(0f, 0f, SIZE.toFloat(), SIZE.toFloat(), background)

        val riskColor = riskColor(state.riskLevel)
        val ambient = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            shader = RadialGradient(
                SIZE * 0.52f,
                SIZE * 0.43f,
                SIZE * 0.48f,
                intArrayOf(withAlpha(CYAN, 62), withAlpha(VIOLET, 28), Color.TRANSPARENT),
                floatArrayOf(0f, 0.56f, 1f),
                Shader.TileMode.CLAMP,
            )
        }
        canvas.drawRect(0f, 0f, SIZE.toFloat(), SIZE.toFloat(), ambient)

        val alertGlow = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            shader = RadialGradient(
                SIZE * 0.82f,
                SIZE * 0.12f,
                SIZE * 0.28f,
                withAlpha(riskColor, if (state.riskLevel.lowercase() in setOf("high", "critical", "warning")) 54 else 18),
                Color.TRANSPARENT,
                Shader.TileMode.CLAMP,
            )
        }
        canvas.drawRect(0f, 0f, SIZE.toFloat(), SIZE.toFloat(), alertGlow)

        val border = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            style = Paint.Style.STROKE
            strokeWidth = 2f
            shader = LinearGradient(0f, 0f, SIZE.toFloat(), SIZE.toFloat(), CYAN, withAlpha(VIOLET, 100), Shader.TileMode.CLAMP)
        }
        canvas.drawRoundRect(RectF(2f, 2f, SIZE - 2f, SIZE - 2f), 52f, 52f, border)
    }

    private fun drawHeader(canvas: Canvas, state: OrbiWidgetContract) {
        drawText(canvas, "ORBI Clima IA", 42f, 58f, 26f, TEXT, true, Paint.Align.LEFT)
        drawText(canvas, "SKYORB COMMAND", 42f, 84f, 14f, CYAN, true, Paint.Align.LEFT, 2.5f)

        val badge = sourceBadge(state)
        val badgeColor = sourceBadgeColor(badge)
        val badgeRect = RectF(590f, 40f, 726f, 84f)
        drawGlassPill(canvas, badgeRect, badgeColor)
        drawText(canvas, badge, badgeRect.centerX(), badgeRect.centerY() + 6f, 16f, badgeColor, true, Paint.Align.CENTER)

        val updated = state.lastUpdated.ifBlank { "SkyCore" }
        drawText(canvas, updated, 726f, 106f, 12f, DIM, false, Paint.Align.RIGHT)
    }

    private fun drawOrbitalStage(canvas: Canvas, context: Context, state: OrbiWidgetContract) {
        val cx = SIZE / 2f
        val cy = 335f

        val halo = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            shader = RadialGradient(
                cx,
                cy,
                190f,
                intArrayOf(withAlpha(CYAN, 72), withAlpha(VIOLET, 38), Color.TRANSPARENT),
                floatArrayOf(0.05f, 0.52f, 1f),
                Shader.TileMode.CLAMP,
            )
        }
        canvas.drawCircle(cx, cy, 190f, halo)

        drawOrbitalRing(canvas, cx, cy, 240f, 116f, -12f, CYAN, 66)
        drawOrbitalRing(canvas, cx, cy, 216f, 150f, 18f, VIOLET, 54)
        drawOrbitalRing(canvas, cx, cy, 174f, 174f, 0f, SOLAR, 34)

        drawOrbitAccent(canvas, cx, cy, 240f, 116f, -12f, 0.08f, CYAN)
        drawOrbitAccent(canvas, cx, cy, 216f, 150f, 18f, 0.57f, VIOLET)
        drawOrbitAccent(canvas, cx, cy, 174f, 174f, 0f, 0.83f, SOLAR)

        drawMetricBubble(canvas, 126f, 220f, "LLUVIA", "${state.rainProbability}%", CYAN)
        drawMetricBubble(canvas, 642f, 220f, "HUMEDAD", "${state.humidity}%", CYAN)
        drawMetricBubble(canvas, 126f, 425f, "VIENTO", "${state.windSpeedKmh}", VIOLET, "km/h")
        drawMetricBubble(canvas, 642f, 425f, "UV", state.uvIndex.toString(), SOLAR)

        drawCentralOrb(canvas, context, state, cx, cy)

        drawText(canvas, "${state.temperatureC}°", cx, 514f, 68f, TEXT, true, Paint.Align.CENTER)
        drawText(canvas, state.conditionLabel, cx, 548f, 19f, MUTED, true, Paint.Align.CENTER)
        drawText(canvas, state.locationName, cx, 576f, 19f, CYAN, true, Paint.Align.CENTER)
        drawText(canvas, "Sensación ${state.feelsLikeC}°", cx, 601f, 14f, DIM, false, Paint.Align.CENTER)
    }

    private fun drawCentralOrb(canvas: Canvas, context: Context, state: OrbiWidgetContract, cx: Float, cy: Float) {
        val glow = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            shader = RadialGradient(
                cx,
                cy,
                140f,
                intArrayOf(withAlpha(CYAN, 92), withAlpha(VIOLET, 54), Color.TRANSPARENT),
                floatArrayOf(0.25f, 0.62f, 1f),
                Shader.TileMode.CLAMP,
            )
        }
        canvas.drawCircle(cx, cy, 140f, glow)

        val glass = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            shader = RadialGradient(
                cx - 36f,
                cy - 42f,
                128f,
                intArrayOf(0xFF173253.toInt(), 0xFF0A172A.toInt(), 0xFF07101D.toInt()),
                floatArrayOf(0f, 0.62f, 1f),
                Shader.TileMode.CLAMP,
            )
        }
        canvas.drawCircle(cx, cy, 114f, glass)

        val rim = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            style = Paint.Style.STROKE
            strokeWidth = 4f
            shader = LinearGradient(cx - 100f, cy - 100f, cx + 100f, cy + 100f, CYAN, VIOLET, Shader.TileMode.CLAMP)
        }
        canvas.drawCircle(cx, cy, 114f, rim)

        val highlight = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = withAlpha(Color.WHITE, 66)
        }
        canvas.drawOval(RectF(cx - 66f, cy - 76f, cx + 16f, cy - 28f), highlight)

        val drawable = ContextCompat.getDrawable(context, resolveOrbDrawable(state)) ?: return
        val iconSize = 146
        val left = (cx - iconSize / 2f).toInt()
        val top = (cy - iconSize / 2f).toInt()
        drawable.bounds = Rect(left, top, left + iconSize, top + iconSize)
        drawable.draw(canvas)
    }

    private fun drawMetricBubble(
        canvas: Canvas,
        cx: Float,
        cy: Float,
        label: String,
        value: String,
        accent: Int,
        unit: String = "",
    ) {
        val glow = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            shader = RadialGradient(cx, cy, 78f, withAlpha(accent, 54), Color.TRANSPARENT, Shader.TileMode.CLAMP)
        }
        canvas.drawCircle(cx, cy, 78f, glow)

        val fill = Paint(Paint.ANTI_ALIAS_FLAG).apply { color = 0xC7142033.toInt() }
        canvas.drawCircle(cx, cy, 60f, fill)
        val stroke = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = withAlpha(accent, 150)
            style = Paint.Style.STROKE
            strokeWidth = 2f
        }
        canvas.drawCircle(cx, cy, 60f, stroke)

        drawText(canvas, label, cx, cy - 16f, 13f, withAlpha(accent, 230), true, Paint.Align.CENTER, 1.4f)
        drawText(canvas, value, cx, cy + 10f, 24f, TEXT, true, Paint.Align.CENTER)
        if (unit.isNotBlank()) {
            drawText(canvas, unit, cx, cy + 31f, 11f, DIM, false, Paint.Align.CENTER)
        }
    }

    private fun drawBottomIntelligence(canvas: Canvas, state: OrbiWidgetContract) {
        val panel = RectF(34f, 642f, 734f, 732f)
        val fill = Paint(Paint.ANTI_ALIAS_FLAG).apply { color = 0xD90A1220.toInt() }
        canvas.drawRoundRect(panel, 24f, 24f, fill)
        val border = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            style = Paint.Style.STROKE
            strokeWidth = 1.5f
            color = withAlpha(CYAN, 70)
        }
        canvas.drawRoundRect(panel, 24f, 24f, border)

        val chip = RectF(52f, 658f, 152f, 692f)
        drawGlassPill(canvas, chip, CYAN)
        drawText(canvas, "ORBI IA", chip.centerX(), chip.centerY() + 5f, 13f, CYAN, true, Paint.Align.CENTER)

        val narrative = ellipsize(state.shortNarrative, 58)
        drawText(canvas, narrative, 170f, 680f, 16f, TEXT, true, Paint.Align.LEFT)

        val timeline = "${state.nextHour1Label} ${state.nextHour1Temp}°   •   ${state.nextHour2Label} ${state.nextHour2Temp}°   •   ${state.nextHour3Label} ${state.nextHour3Temp}°"
        drawText(canvas, timeline, 52f, 714f, 13f, MUTED, false, Paint.Align.LEFT)
        drawText(canvas, sourceBadge(state), 716f, 714f, 12f, sourceBadgeColor(sourceBadge(state)), true, Paint.Align.RIGHT)
    }

    private fun drawOrbitalRing(
        canvas: Canvas,
        cx: Float,
        cy: Float,
        radiusX: Float,
        radiusY: Float,
        rotation: Float,
        color: Int,
        alpha: Int,
    ) {
        canvas.save()
        canvas.rotate(rotation, cx, cy)
        val paint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            style = Paint.Style.STROKE
            strokeWidth = 2f
            this.color = withAlpha(color, alpha)
        }
        canvas.drawOval(RectF(cx - radiusX, cy - radiusY, cx + radiusX, cy + radiusY), paint)
        canvas.restore()
    }

    private fun drawOrbitAccent(
        canvas: Canvas,
        cx: Float,
        cy: Float,
        radiusX: Float,
        radiusY: Float,
        rotation: Float,
        phase: Float,
        color: Int,
    ) {
        val theta = (phase * Math.PI * 2.0).toFloat()
        var x = cx + radiusX * cos(theta)
        var y = cy + radiusY * sin(theta)
        if (rotation != 0f) {
            val angle = Math.toRadians(rotation.toDouble())
            val dx = x - cx
            val dy = y - cy
            x = (cx + dx * kotlin.math.cos(angle) - dy * kotlin.math.sin(angle)).toFloat()
            y = (cy + dx * kotlin.math.sin(angle) + dy * kotlin.math.cos(angle)).toFloat()
        }
        val glow = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            shader = RadialGradient(x, y, 20f, withAlpha(color, 210), Color.TRANSPARENT, Shader.TileMode.CLAMP)
        }
        canvas.drawCircle(x, y, 20f, glow)
        canvas.drawCircle(x, y, 5f, Paint(Paint.ANTI_ALIAS_FLAG).apply { this.color = color })
    }

    private fun drawGlassPill(canvas: Canvas, rect: RectF, accent: Int) {
        val fill = Paint(Paint.ANTI_ALIAS_FLAG).apply { color = withAlpha(accent, 24) }
        canvas.drawRoundRect(rect, rect.height() / 2f, rect.height() / 2f, fill)
        val stroke = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = withAlpha(accent, 100)
            style = Paint.Style.STROKE
            strokeWidth = 1.5f
        }
        canvas.drawRoundRect(rect, rect.height() / 2f, rect.height() / 2f, stroke)
    }

    private fun drawText(
        canvas: Canvas,
        text: String,
        x: Float,
        y: Float,
        size: Float,
        color: Int,
        bold: Boolean,
        align: Paint.Align,
        letterSpacingPx: Float = 0f,
    ) {
        val paint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            this.color = color
            textSize = size
            textAlign = align
            typeface = Typeface.create("sans-serif", if (bold) Typeface.BOLD else Typeface.NORMAL)
        }
        if (letterSpacingPx <= 0f || text.length < 2) {
            canvas.drawText(text, x, y, paint)
            return
        }

        val widths = FloatArray(text.length)
        paint.getTextWidths(text, widths)
        val total = widths.sum() + letterSpacingPx * (text.length - 1)
        var cursor = when (align) {
            Paint.Align.CENTER -> x - total / 2f
            Paint.Align.RIGHT -> x - total
            else -> x
        }
        paint.textAlign = Paint.Align.LEFT
        text.forEachIndexed { index, char ->
            canvas.drawText(char.toString(), cursor, y, paint)
            cursor += widths[index] + letterSpacingPx
        }
    }

    @DrawableRes
    private fun resolveOrbDrawable(state: OrbiWidgetContract): Int {
        val key = state.orbAssetKey.ifBlank { state.conditionCode }.lowercase()
        return when (key) {
            "sunny", "clear", "hot" -> R.drawable.orbi_widget_orb_sunny
            "rain", "drizzle" -> R.drawable.orbi_widget_orb_rain
            "storm", "thunderstorm" -> R.drawable.orbi_widget_orb_storm
            "cloudy", "partly_cloudy" -> R.drawable.orbi_widget_orb_cloudy
            "fog", "mist" -> R.drawable.orbi_widget_orb_fog
            "cold", "frost", "snow" -> R.drawable.orbi_widget_orb_cold
            "wind" -> R.drawable.orbi_widget_orb_wind
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
        else -> state.sourceMode.uppercase().ifBlank { "LIVE" }
    }

    private fun sourceBadgeColor(label: String): Int = when (label) {
        "LIVE" -> GREEN
        "GPS" -> VIOLET
        "CACHE" -> CYAN
        "DEMO" -> AMBER
        else -> CYAN
    }

    private fun riskColor(risk: String): Int = when (risk.lowercase()) {
        "medium", "watch" -> AMBER
        "high", "warning" -> 0xFFF97316.toInt()
        "critical" -> RED
        else -> GREEN
    }

    private fun withAlpha(color: Int, alpha: Int): Int = Color.argb(
        alpha.coerceIn(0, 255),
        Color.red(color),
        Color.green(color),
        Color.blue(color),
    )

    private fun ellipsize(text: String, maxChars: Int): String {
        val normalized = text.trim().replace(Regex("\\s+"), " ")
        if (normalized.length <= maxChars) return normalized
        return normalized.take(maxChars - 1).trimEnd() + "…"
    }
}

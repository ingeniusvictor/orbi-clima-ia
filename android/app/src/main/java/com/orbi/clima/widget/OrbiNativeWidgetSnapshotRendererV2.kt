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
 * OC-22I native-first widget renderer.
 *
 * The launcher widget is the product. Web previews must mirror these layouts,
 * not the other way around. Every registered ORBI widget can therefore use one
 * deterministic Android Canvas renderer and keep Glance only as the host and
 * click surface.
 *
 * This renderer is completely isolated from the frozen Golden Orb sources.
 */
object OrbiNativeWidgetSnapshotRendererV2 {
    enum class Variant {
        MINI,
        PANEL,
        COMMAND,
        PREMIUM_COMMAND,
        FIELD_COMMAND,
        CINEMATIC_BAR,
    }

    private data class Surface(val width: Int, val height: Int, val radius: Float)

    private const val OBSIDIAN = 0xFF030712.toInt()
    private const val OBSIDIAN_2 = 0xFF07101F.toInt()
    private const val CARD = 0xE80B1425.toInt()
    private const val CARD_SOFT = 0xCC101C31.toInt()
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
    private const val TEXT = 0xFFF8FAFC.toInt()
    private const val MUTED = 0xFFCBD5E1.toInt()
    private const val DIM = 0xFF718096.toInt()

    fun renderForHint(context: Context, state: OrbiWidgetContract): Bitmap {
        val variant = when (state.visualVariantHint.lowercase()) {
            "skyorb_mini", "mini", "skyorb_2x2" -> Variant.MINI
            "skyorb_4x4" -> Variant.COMMAND
            "field_command", "field" -> Variant.FIELD_COMMAND
            "cinematic_bar", "cinematic" -> Variant.CINEMATIC_BAR
            "premium_command", "skyorb_command_premium" -> Variant.PREMIUM_COMMAND
            else -> Variant.PANEL
        }
        return render(context, state, variant)
    }

    fun renderMini(context: Context, state: OrbiWidgetContract): Bitmap = render(context, state, Variant.MINI)
    fun renderPanel(context: Context, state: OrbiWidgetContract): Bitmap = render(context, state, Variant.PANEL)
    fun renderCommand(context: Context, state: OrbiWidgetContract): Bitmap = render(context, state, Variant.COMMAND)
    fun renderPremiumCommand(context: Context, state: OrbiWidgetContract): Bitmap = render(context, state, Variant.PREMIUM_COMMAND)

    fun render(context: Context, state: OrbiWidgetContract, variant: Variant): Bitmap {
        val surface = when (variant) {
            Variant.MINI -> Surface(560, 560, 64f)
            Variant.PANEL -> Surface(980, 430, 54f)
            Variant.CINEMATIC_BAR -> Surface(1120, 430, 54f)
            Variant.FIELD_COMMAND -> Surface(820, 820, 62f)
            Variant.COMMAND -> Surface(820, 820, 62f)
            Variant.PREMIUM_COMMAND -> Surface(820, 820, 62f)
        }
        val bitmap = Bitmap.createBitmap(surface.width, surface.height, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)
        val bounds = RectF(0f, 0f, surface.width.toFloat(), surface.height.toFloat())
        val clip = Path().apply { addRoundRect(bounds, surface.radius, surface.radius, Path.Direction.CW) }

        canvas.save()
        canvas.clipPath(clip)
        drawBackdrop(canvas, state, surface)
        when (variant) {
            Variant.MINI -> drawMini(canvas, context, state, surface)
            Variant.PANEL -> drawPanel(canvas, context, state, surface)
            Variant.COMMAND -> drawCommand(canvas, context, state, surface, false)
            Variant.PREMIUM_COMMAND -> drawCommand(canvas, context, state, surface, true)
            Variant.FIELD_COMMAND -> drawFieldCommand(canvas, context, state, surface)
            Variant.CINEMATIC_BAR -> drawCinematic(canvas, context, state, surface)
        }
        canvas.restore()
        return bitmap
    }

    private fun drawBackdrop(canvas: Canvas, state: OrbiWidgetContract, s: Surface) {
        val accent = conditionAccent(state)
        val base = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            shader = LinearGradient(
                0f, 0f, s.width.toFloat(), s.height.toFloat(),
                intArrayOf(OBSIDIAN, OBSIDIAN_2, 0xFF050A16.toInt()),
                floatArrayOf(0f, 0.54f, 1f),
                Shader.TileMode.CLAMP,
            )
        }
        canvas.drawRect(0f, 0f, s.width.toFloat(), s.height.toFloat(), base)

        val ambient = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            shader = RadialGradient(
                s.width * 0.53f,
                s.height * 0.46f,
                maxOf(s.width, s.height) * 0.64f,
                intArrayOf(withAlpha(accent, 70), withAlpha(VIOLET, 24), Color.TRANSPARENT),
                floatArrayOf(0f, 0.55f, 1f),
                Shader.TileMode.CLAMP,
            )
        }
        canvas.drawRect(0f, 0f, s.width.toFloat(), s.height.toFloat(), ambient)

        val edge = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            style = Paint.Style.STROKE
            strokeWidth = 2.2f
            shader = LinearGradient(
                0f, 0f, s.width.toFloat(), s.height.toFloat(),
                intArrayOf(withAlpha(CYAN, 175), withAlpha(accent, 90), withAlpha(VIOLET, 95)),
                null,
                Shader.TileMode.CLAMP,
            )
        }
        canvas.drawRoundRect(RectF(2f, 2f, s.width - 2f, s.height - 2f), s.radius - 2f, s.radius - 2f, edge)

        // Deterministic micro-particles add depth without launcher-time animation.
        val dust = Paint(Paint.ANTI_ALIAS_FLAG)
        for (i in 0 until 22) {
            val x = ((i * 83 + 41) % s.width).toFloat()
            val y = ((i * 53 + 29) % s.height).toFloat()
            val r = if (i % 5 == 0) 2.2f else 1.1f
            dust.color = withAlpha(if (i % 3 == 0) accent else CYAN, 22 + (i % 4) * 9)
            canvas.drawCircle(x, y, r, dust)
        }
    }

    private fun drawMini(canvas: Canvas, context: Context, state: OrbiWidgetContract, s: Surface) {
        drawBrand(canvas, state, 34f, 48f, s.width - 34f, compact = true)
        val cx = s.width / 2f
        val cy = 222f
        drawOrbitalAura(canvas, cx, cy, 150f, conditionAccent(state))
        drawCentralOrb(canvas, context, state, cx, cy, 112f)

        drawText(canvas, "${state.temperatureC}°", cx, 392f, 72f, TEXT, true, Paint.Align.CENTER)
        drawText(canvas, state.conditionLabel.uppercase(), cx, 427f, 18f, conditionAccent(state), true, Paint.Align.CENTER, 1.4f)
        drawText(canvas, state.locationName, cx, 458f, 20f, MUTED, true, Paint.Align.CENTER)

        val decisionColor = decisionColor(state)
        val pill = RectF(92f, 486f, s.width - 92f, 536f)
        drawGlassPill(canvas, pill, decisionColor, 22)
        drawText(canvas, ellipsize(state.globalDecisionLabel, 22), pill.centerX(), pill.centerY() + 7f, 17f, decisionColor, true, Paint.Align.CENTER)
    }

    private fun drawPanel(canvas: Canvas, context: Context, state: OrbiWidgetContract, s: Surface) {
        drawBrand(canvas, state, 34f, 48f, s.width - 34f)
        val accent = conditionAccent(state)

        val orbX = 166f
        val orbY = 235f
        drawOrbitalAura(canvas, orbX, orbY, 132f, accent)
        drawCentralOrb(canvas, context, state, orbX, orbY, 96f)

        drawText(canvas, "${state.temperatureC}°", 316f, 205f, 70f, TEXT, true, Paint.Align.LEFT)
        drawText(canvas, state.conditionLabel, 318f, 244f, 22f, accent, true, Paint.Align.LEFT)
        drawText(canvas, state.locationName, 318f, 278f, 20f, MUTED, true, Paint.Align.LEFT)
        drawText(canvas, "Sensación ${state.feelsLikeC}°", 318f, 309f, 16f, DIM, false, Paint.Align.LEFT)

        val metricLeft = 590f
        drawMetricCard(canvas, RectF(metricLeft, 125f, 760f, 220f), "HUMEDAD", "${state.humidity}%", CYAN)
        drawMetricCard(canvas, RectF(776f, 125f, 946f, 220f), "LLUVIA", "${state.rainProbability}%", COBALT)
        drawMetricCard(canvas, RectF(metricLeft, 235f, 760f, 330f), "VIENTO", "${state.windSpeedKmh} km/h", VIOLET)
        drawMetricCard(canvas, RectF(776f, 235f, 946f, 330f), "UV", state.uvIndex.toString(), SOLAR)

        val intelligence = RectF(32f, 352f, s.width - 32f, 408f)
        drawGlassPanel(canvas, intelligence, accent, 18)
        drawText(canvas, "ORBI IA", 52f, 386f, 15f, CYAN, true, Paint.Align.LEFT, 1.2f)
        drawText(canvas, ellipsize(state.shortNarrative, 72), 148f, 386f, 16f, TEXT, true, Paint.Align.LEFT)
    }

    private fun drawCommand(
        canvas: Canvas,
        context: Context,
        state: OrbiWidgetContract,
        s: Surface,
        premium: Boolean,
    ) {
        drawBrand(canvas, state, 42f, 58f, s.width - 42f)
        val accent = conditionAccent(state)
        val cx = s.width / 2f
        val cy = if (premium) 338f else 326f

        drawOrbitalAura(canvas, cx, cy, if (premium) 226f else 204f, accent)
        drawOrbitalRing(canvas, cx, cy, 270f, 132f, -13f, CYAN, 80)
        drawOrbitalRing(canvas, cx, cy, 238f, 170f, 17f, VIOLET, 62)
        drawOrbitAccent(canvas, cx, cy, 270f, 132f, -13f, 0.08f, CYAN)
        drawOrbitAccent(canvas, cx, cy, 238f, 170f, 17f, 0.57f, VIOLET)

        drawMetricBubble(canvas, 125f, 232f, "LLUVIA", "${state.rainProbability}%", COBALT)
        drawMetricBubble(canvas, s.width - 125f, 232f, "HUMEDAD", "${state.humidity}%", CYAN)
        drawMetricBubble(canvas, 125f, 460f, "VIENTO", "${state.windSpeedKmh}", VIOLET, "km/h")
        drawMetricBubble(canvas, s.width - 125f, 460f, "UV", state.uvIndex.toString(), SOLAR)

        drawCentralOrb(canvas, context, state, cx, cy, if (premium) 128f else 116f)
        drawText(canvas, "${state.temperatureC}°", cx, 558f, 72f, TEXT, true, Paint.Align.CENTER)
        drawText(canvas, state.conditionLabel, cx, 596f, 21f, accent, true, Paint.Align.CENTER)
        drawText(canvas, state.locationName, cx, 628f, 20f, MUTED, true, Paint.Align.CENTER)

        val panel = RectF(34f, 668f, s.width - 34f, 786f)
        drawGlassPanel(canvas, panel, accent, 20)
        val chip = RectF(54f, 686f, 158f, 724f)
        drawGlassPill(canvas, chip, CYAN, 24)
        drawText(canvas, "ORBI IA", chip.centerX(), chip.centerY() + 6f, 14f, CYAN, true, Paint.Align.CENTER)
        drawText(canvas, ellipsize(state.shortNarrative, 60), 178f, 712f, 17f, TEXT, true, Paint.Align.LEFT)
        val timeline = "${state.nextHour1Label} ${state.nextHour1Temp}°   •   ${state.nextHour2Label} ${state.nextHour2Temp}°   •   ${state.nextHour3Label} ${state.nextHour3Temp}°"
        drawText(canvas, timeline, 54f, 758f, 14f, MUTED, false, Paint.Align.LEFT)
        drawText(canvas, if (premium) "COMMAND PREMIUM" else "SKYORB COMMAND", s.width - 54f, 758f, 12f, accent, true, Paint.Align.RIGHT, 1.1f)
    }

    private fun drawFieldCommand(canvas: Canvas, context: Context, state: OrbiWidgetContract, s: Surface) {
        drawBrand(canvas, state, 42f, 58f, s.width - 42f)
        drawText(canvas, "FIELD COMMAND", 42f, 98f, 16f, AMBER, true, Paint.Align.LEFT, 2f)

        val accent = decisionColor(state)
        val status = RectF(42f, 126f, s.width - 42f, 220f)
        drawGlassPanel(canvas, status, accent, 22)
        drawText(canvas, "CONDICIÓN OPERATIVA", 64f, 158f, 13f, DIM, true, Paint.Align.LEFT, 1.2f)
        drawText(canvas, state.globalDecisionLabel.uppercase(), 64f, 199f, 28f, accent, true, Paint.Align.LEFT)
        drawText(canvas, "${state.temperatureC}° / SENS. ${state.feelsLikeC}°", s.width - 64f, 191f, 24f, TEXT, true, Paint.Align.RIGHT)

        val cy = 350f
        drawOrbitalAura(canvas, 180f, cy, 116f, conditionAccent(state))
        drawCentralOrb(canvas, context, state, 180f, cy, 92f)
        drawText(canvas, state.conditionLabel, 180f, 488f, 18f, conditionAccent(state), true, Paint.Align.CENTER)

        drawMetricCard(canvas, RectF(330f, 270f, 536f, 365f), "HUMEDAD", "${state.humidity}%", CYAN)
        drawMetricCard(canvas, RectF(556f, 270f, 762f, 365f), "VIENTO", "${state.windSpeedKmh} km/h", VIOLET)
        drawMetricCard(canvas, RectF(330f, 385f, 536f, 480f), "UV", state.uvIndex.toString(), SOLAR)
        drawMetricCard(canvas, RectF(556f, 385f, 762f, 480f), "LLUVIA", "${state.rainProbability}%", COBALT)

        val alert = RectF(42f, 526f, s.width - 42f, 676f)
        val alertColor = if (hasAlert(state)) riskColor(state.mainAlertSeverity) else AMBER
        drawGlassPanel(canvas, alert, alertColor, 22)
        drawText(canvas, if (hasAlert(state)) "ALERTA ACTIVA" else "ORBI SKYCORE · MITIGACIÓN", 64f, 560f, 14f, alertColor, true, Paint.Align.LEFT, 1.2f)
        val text = if (hasAlert(state)) state.mainAlertMessage else state.technicalRecommendation
        drawWrappedText(canvas, ellipsize(text, 118), 64f, 596f, s.width - 128f, 18f, TEXT, true, 2)

        val footer = RectF(42f, 704f, s.width - 42f, 782f)
        drawGlassPanel(canvas, footer, CYAN, 16)
        drawText(canvas, "VENTANA SEGURA", 64f, 736f, 12f, DIM, true, Paint.Align.LEFT, 1f)
        drawText(canvas, state.bestWindow, 64f, 765f, 18f, CYAN, true, Paint.Align.LEFT)
        drawText(canvas, sourceBadge(state), s.width - 64f, 759f, 14f, sourceBadgeColor(sourceBadge(state)), true, Paint.Align.RIGHT)
    }

    private fun drawCinematic(canvas: Canvas, context: Context, state: OrbiWidgetContract, s: Surface) {
        val accent = conditionAccent(state)
        drawBrand(canvas, state, 34f, 48f, s.width - 34f)

        val cx = 145f
        val cy = 230f
        drawOrbitalAura(canvas, cx, cy, 128f, accent)
        drawCentralOrb(canvas, context, state, cx, cy, 92f)
        drawText(canvas, "${state.temperatureC}°", 276f, 208f, 62f, TEXT, true, Paint.Align.LEFT)
        drawText(canvas, state.conditionLabel.uppercase(), 280f, 248f, 18f, accent, true, Paint.Align.LEFT, 1f)
        drawText(canvas, state.locationName, 280f, 282f, 18f, MUTED, true, Paint.Align.LEFT)

        val narrative = if (hasAlert(state)) "${state.mainAlertTitle}: ${state.mainAlertMessage}" else state.shortNarrative
        drawText(canvas, "ORBI CINEMATIC", 520f, 138f, 14f, CYAN, true, Paint.Align.LEFT, 1.6f)
        drawWrappedText(canvas, ellipsize(narrative, 100), 520f, 180f, 560f, 20f, TEXT, true, 2)

        val y = 298f
        drawTimelineChip(canvas, RectF(520f, y, 686f, y + 72f), state.nextHour1Label, "${state.nextHour1Temp}°", CYAN)
        drawTimelineChip(canvas, RectF(704f, y, 870f, y + 72f), state.nextHour2Label, "${state.nextHour2Temp}°", VIOLET)
        drawTimelineChip(canvas, RectF(888f, y, 1054f, y + 72f), state.nextHour3Label, "${state.nextHour3Temp}°", SOLAR)

        drawText(canvas, "Mejor ventana: ${state.bestWindow}", 520f, 404f, 14f, DIM, true, Paint.Align.LEFT)
        drawText(canvas, sourceBadge(state), 1054f, 404f, 13f, sourceBadgeColor(sourceBadge(state)), true, Paint.Align.RIGHT)
    }

    private fun drawBrand(canvas: Canvas, state: OrbiWidgetContract, left: Float, baseline: Float, right: Float, compact: Boolean = false) {
        val titleSize = if (compact) 20f else 24f
        drawText(canvas, "ORBI", left, baseline, titleSize, TEXT, true, Paint.Align.LEFT)
        drawText(canvas, "CLIMA IA", left + if (compact) 62f else 74f, baseline, titleSize, CYAN, true, Paint.Align.LEFT)
        val badge = sourceBadge(state)
        val badgeColor = sourceBadgeColor(badge)
        val width = if (compact) 94f else 114f
        val badgeRect = RectF(right - width, baseline - 28f, right, baseline + 8f)
        drawGlassPill(canvas, badgeRect, badgeColor, 22)
        drawText(canvas, badge, badgeRect.centerX(), badgeRect.centerY() + 5f, if (compact) 12f else 13f, badgeColor, true, Paint.Align.CENTER, 0.8f)
    }

    private fun drawOrbitalAura(canvas: Canvas, cx: Float, cy: Float, radius: Float, accent: Int) {
        val halo = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            shader = RadialGradient(
                cx, cy, radius,
                intArrayOf(withAlpha(accent, 82), withAlpha(CYAN, 32), Color.TRANSPARENT),
                floatArrayOf(0.16f, 0.58f, 1f),
                Shader.TileMode.CLAMP,
            )
        }
        canvas.drawCircle(cx, cy, radius, halo)
        val ring = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            style = Paint.Style.STROKE
            strokeWidth = 2f
            color = withAlpha(accent, 96)
        }
        canvas.drawCircle(cx, cy, radius * 0.78f, ring)
        ring.color = withAlpha(CYAN, 42)
        canvas.drawCircle(cx, cy, radius * 0.94f, ring)
    }

    private fun drawCentralOrb(canvas: Canvas, context: Context, state: OrbiWidgetContract, cx: Float, cy: Float, radius: Float) {
        val accent = conditionAccent(state)
        val glow = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            shader = RadialGradient(cx, cy, radius * 1.35f, withAlpha(accent, 96), Color.TRANSPARENT, Shader.TileMode.CLAMP)
        }
        canvas.drawCircle(cx, cy, radius * 1.35f, glow)

        val sphere = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            shader = RadialGradient(
                cx - radius * 0.32f,
                cy - radius * 0.38f,
                radius * 1.32f,
                intArrayOf(lighten(accent, 0.34f), darken(accent, 0.38f), 0xFF07101D.toInt()),
                floatArrayOf(0f, 0.58f, 1f),
                Shader.TileMode.CLAMP,
            )
        }
        canvas.drawCircle(cx, cy, radius, sphere)

        val rim = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            style = Paint.Style.STROKE
            strokeWidth = maxOf(3f, radius * 0.035f)
            shader = LinearGradient(cx - radius, cy - radius, cx + radius, cy + radius, CYAN, accent, Shader.TileMode.CLAMP)
        }
        canvas.drawCircle(cx, cy, radius, rim)

        val highlight = Paint(Paint.ANTI_ALIAS_FLAG).apply { color = withAlpha(Color.WHITE, 62) }
        canvas.drawOval(RectF(cx - radius * 0.58f, cy - radius * 0.68f, cx + radius * 0.10f, cy - radius * 0.24f), highlight)

        val drawable = ContextCompat.getDrawable(context, resolveOrbDrawable(state))
        if (drawable != null) {
            val iconSize = (radius * 1.10f).toInt()
            val left = (cx - iconSize / 2f).toInt()
            val top = (cy - iconSize / 2f).toInt()
            drawable.bounds = Rect(left, top, left + iconSize, top + iconSize)
            drawable.alpha = 165
            drawable.draw(canvas)
        }

        // A small specular bead makes the sphere read as a premium glass object
        // even when the condition asset is muted by launcher scaling.
        canvas.drawCircle(cx + radius * 0.34f, cy - radius * 0.40f, radius * 0.055f, Paint(Paint.ANTI_ALIAS_FLAG).apply { color = withAlpha(Color.WHITE, 205) })
    }

    private fun drawMetricCard(canvas: Canvas, rect: RectF, label: String, value: String, accent: Int) {
        drawGlassPanel(canvas, rect, accent, 20)
        drawText(canvas, label, rect.left + 18f, rect.top + 30f, 13f, withAlpha(accent, 235), true, Paint.Align.LEFT, 1.2f)
        drawText(canvas, value, rect.left + 18f, rect.bottom - 22f, 22f, TEXT, true, Paint.Align.LEFT)
        val bead = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            shader = RadialGradient(rect.right - 26f, rect.top + 27f, 18f, withAlpha(accent, 180), Color.TRANSPARENT, Shader.TileMode.CLAMP)
        }
        canvas.drawCircle(rect.right - 26f, rect.top + 27f, 18f, bead)
        canvas.drawCircle(rect.right - 26f, rect.top + 27f, 4f, Paint(Paint.ANTI_ALIAS_FLAG).apply { color = accent })
    }

    private fun drawMetricBubble(canvas: Canvas, cx: Float, cy: Float, label: String, value: String, accent: Int, unit: String = "") {
        val glow = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            shader = RadialGradient(cx, cy, 88f, withAlpha(accent, 60), Color.TRANSPARENT, Shader.TileMode.CLAMP)
        }
        canvas.drawCircle(cx, cy, 88f, glow)
        val fill = Paint(Paint.ANTI_ALIAS_FLAG).apply { color = CARD }
        canvas.drawCircle(cx, cy, 65f, fill)
        val stroke = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            style = Paint.Style.STROKE
            strokeWidth = 2f
            color = withAlpha(accent, 145)
        }
        canvas.drawCircle(cx, cy, 65f, stroke)
        drawText(canvas, label, cx, cy - 18f, 12f, accent, true, Paint.Align.CENTER, 1f)
        drawText(canvas, value, cx, cy + 11f, 24f, TEXT, true, Paint.Align.CENTER)
        if (unit.isNotBlank()) drawText(canvas, unit, cx, cy + 33f, 11f, DIM, false, Paint.Align.CENTER)
    }

    private fun drawTimelineChip(canvas: Canvas, rect: RectF, label: String, value: String, accent: Int) {
        drawGlassPanel(canvas, rect, accent, 16)
        drawText(canvas, label.uppercase(), rect.left + 16f, rect.top + 27f, 11f, DIM, true, Paint.Align.LEFT)
        drawText(canvas, value, rect.right - 16f, rect.bottom - 17f, 22f, accent, true, Paint.Align.RIGHT)
    }

    private fun drawGlassPanel(canvas: Canvas, rect: RectF, accent: Int, alpha: Int) {
        val fill = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            shader = LinearGradient(rect.left, rect.top, rect.right, rect.bottom, CARD_SOFT, CARD, Shader.TileMode.CLAMP)
        }
        canvas.drawRoundRect(rect, 22f, 22f, fill)
        val border = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            style = Paint.Style.STROKE
            strokeWidth = 1.5f
            color = withAlpha(accent, 45 + alpha)
        }
        canvas.drawRoundRect(rect, 22f, 22f, border)
    }

    private fun drawGlassPill(canvas: Canvas, rect: RectF, accent: Int, alpha: Int) {
        val fill = Paint(Paint.ANTI_ALIAS_FLAG).apply { color = withAlpha(accent, alpha) }
        canvas.drawRoundRect(rect, rect.height() / 2f, rect.height() / 2f, fill)
        val stroke = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            style = Paint.Style.STROKE
            strokeWidth = 1.4f
            color = withAlpha(accent, 105)
        }
        canvas.drawRoundRect(rect, rect.height() / 2f, rect.height() / 2f, stroke)
    }

    private fun drawOrbitalRing(canvas: Canvas, cx: Float, cy: Float, rx: Float, ry: Float, rotation: Float, color: Int, alpha: Int) {
        canvas.save()
        canvas.rotate(rotation, cx, cy)
        val paint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            style = Paint.Style.STROKE
            strokeWidth = 2f
            this.color = withAlpha(color, alpha)
        }
        canvas.drawOval(RectF(cx - rx, cy - ry, cx + rx, cy + ry), paint)
        canvas.restore()
    }

    private fun drawOrbitAccent(canvas: Canvas, cx: Float, cy: Float, rx: Float, ry: Float, rotation: Float, phase: Float, color: Int) {
        val theta = (phase * Math.PI * 2.0).toFloat()
        var x = cx + rx * cos(theta)
        var y = cy + ry * sin(theta)
        if (rotation != 0f) {
            val angle = Math.toRadians(rotation.toDouble())
            val dx = x - cx
            val dy = y - cy
            x = (cx + dx * kotlin.math.cos(angle) - dy * kotlin.math.sin(angle)).toFloat()
            y = (cy + dx * kotlin.math.sin(angle) + dy * kotlin.math.cos(angle)).toFloat()
        }
        val glow = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            shader = RadialGradient(x, y, 22f, withAlpha(color, 215), Color.TRANSPARENT, Shader.TileMode.CLAMP)
        }
        canvas.drawCircle(x, y, 22f, glow)
        canvas.drawCircle(x, y, 5f, Paint(Paint.ANTI_ALIAS_FLAG).apply { this.color = color })
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
        var line = ""
        val lines = mutableListOf<String>()
        for (word in words) {
            val candidate = if (line.isEmpty()) word else "$line $word"
            if (paint.measureText(candidate) <= maxWidth || line.isEmpty()) {
                line = candidate
            } else {
                lines += line
                line = word
                if (lines.size == maxLines - 1) break
            }
        }
        if (line.isNotEmpty() && lines.size < maxLines) lines += line
        lines.take(maxLines).forEachIndexed { index, raw ->
            val finalLine = if (index == maxLines - 1 && paint.measureText(raw) > maxWidth) ellipsizeByWidth(raw, paint, maxWidth) else raw
            canvas.drawText(finalLine, x, firstBaseline + index * (size + 9f), paint)
        }
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
        val paint = textPaint(size, color, bold, align)
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

    private fun textPaint(size: Float, color: Int, bold: Boolean, align: Paint.Align): Paint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        this.color = color
        textSize = size
        textAlign = align
        typeface = Typeface.create("sans-serif", if (bold) Typeface.BOLD else Typeface.NORMAL)
        isSubpixelText = true
    }

    private fun ellipsizeByWidth(text: String, paint: Paint, maxWidth: Float): String {
        if (paint.measureText(text) <= maxWidth) return text
        var candidate = text
        while (candidate.length > 2 && paint.measureText("$candidate…") > maxWidth) candidate = candidate.dropLast(1)
        return candidate.trimEnd() + "…"
    }

    private fun ellipsize(text: String, maxChars: Int): String {
        val normalized = text.trim().replace(Regex("\\s+"), " ")
        if (normalized.length <= maxChars) return normalized
        return normalized.take(maxChars - 1).trimEnd() + "…"
    }

    private fun hasAlert(state: OrbiWidgetContract): Boolean = state.mainAlertTitle.isNotBlank() &&
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

    private fun conditionAccent(state: OrbiWidgetContract): Int {
        val key = state.orbAssetKey.ifBlank { state.conditionCode }.lowercase()
        return when (key) {
            "sunny", "clear", "hot" -> SOLAR
            "rain", "drizzle" -> COBALT
            "storm", "thunderstorm" -> VIOLET
            "snow", "cold", "frost" -> ICE
            "cloudy", "partly_cloudy" -> 0xFF94A3B8.toInt()
            "fog", "mist" -> 0xFFCBD5E1.toInt()
            "wind" -> CYAN_2
            "night" -> VIOLET
            else -> CYAN
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
        "fallback" -> "SEGURO"
        else -> state.sourceMode.uppercase().ifBlank { "LIVE" }
    }

    private fun sourceBadgeColor(label: String): Int = when (label) {
        "LIVE" -> GREEN
        "GPS" -> CYAN
        "CACHE" -> COBALT
        "DEMO" -> AMBER
        "SEGURO" -> AMBER
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
        val factor = 1f - amount.coerceIn(0f, 1f)
        return Color.rgb(
            (Color.red(color) * factor).toInt().coerceIn(0, 255),
            (Color.green(color) * factor).toInt().coerceIn(0, 255),
            (Color.blue(color) * factor).toInt().coerceIn(0, 255),
        )
    }

    private fun withAlpha(color: Int, alpha: Int): Int = Color.argb(
        alpha.coerceIn(0, 255),
        Color.red(color),
        Color.green(color),
        Color.blue(color),
    )
}

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
import kotlin.math.min
import kotlin.math.roundToInt
import kotlin.math.sqrt

/**
 * OC-22J launcher-adaptive snapshot wrapper.
 *
 * V2 owns the visual language. This layer only adapts that already-certified
 * composition to the exact launcher allocation so OEM cell geometry cannot
 * stretch the ORBI artwork horizontally or vertically.
 *
 * The output bitmap always matches the launcher aspect ratio. V2 content is
 * fit-centered with a uniform scale over a native obsidian/atmospheric surface.
 * That preserves circles, typography and orbital geometry during resize.
 */
object OrbiLauncherAdaptiveRenderer {
    private const val MIN_DIMENSION_PX = 180
    private const val MAX_DIMENSION_PX = 1440
    private const val MAX_BITMAP_PIXELS = 1_250_000

    fun variantForHint(state: OrbiWidgetContract): OrbiNativeWidgetSnapshotRendererV2.Variant =
        when (state.visualVariantHint.lowercase()) {
            "skyorb_mini", "mini", "skyorb_2x2" -> OrbiNativeWidgetSnapshotRendererV2.Variant.MINI
            "skyorb_4x4", "command" -> OrbiNativeWidgetSnapshotRendererV2.Variant.COMMAND
            "field_command", "field" -> OrbiNativeWidgetSnapshotRendererV2.Variant.FIELD_COMMAND
            "cinematic_bar", "cinematic" -> OrbiNativeWidgetSnapshotRendererV2.Variant.CINEMATIC_BAR
            "premium_command", "skyorb_command_premium" -> OrbiNativeWidgetSnapshotRendererV2.Variant.PREMIUM_COMMAND
            else -> OrbiNativeWidgetSnapshotRendererV2.Variant.PANEL
        }

    fun render(
        context: Context,
        state: OrbiWidgetContract,
        variant: OrbiNativeWidgetSnapshotRendererV2.Variant,
        launcherWidthDp: Float,
        launcherHeightDp: Float,
    ): Bitmap {
        val base = OrbiNativeWidgetSnapshotRendererV2.render(context, state, variant)
        val target = resolveTargetPixels(context, launcherWidthDp, launcherHeightDp, base.width, base.height)

        if (target.first == base.width && target.second == base.height) {
            return base
        }

        val output = Bitmap.createBitmap(target.first, target.second, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(output)
        val minSide = min(target.first, target.second).toFloat()
        val radius = (minSide * 0.075f).coerceAtLeast(18f)
        val outer = RectF(0f, 0f, target.first.toFloat(), target.second.toFloat())
        val clip = Path().apply {
            addRoundRect(outer, radius, radius, Path.Direction.CW)
        }

        canvas.save()
        canvas.clipPath(clip)
        drawAdaptiveBackdrop(canvas, state, outer)

        val uniformScale = min(
            target.first.toFloat() / base.width.toFloat(),
            target.second.toFloat() / base.height.toFloat(),
        )
        val fittedWidth = base.width * uniformScale
        val fittedHeight = base.height * uniformScale
        val left = (target.first - fittedWidth) / 2f
        val top = (target.second - fittedHeight) / 2f
        val destination = RectF(left, top, left + fittedWidth, top + fittedHeight)
        val bitmapPaint = Paint(Paint.ANTI_ALIAS_FLAG or Paint.FILTER_BITMAP_FLAG).apply {
            isDither = true
        }
        canvas.drawBitmap(base, null, destination, bitmapPaint)

        val edge = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            style = Paint.Style.STROKE
            strokeWidth = (minSide * 0.004f).coerceIn(1.5f, 4f)
            color = Color.argb(105, 103, 232, 249)
        }
        val inset = edge.strokeWidth / 2f + 1f
        canvas.drawRoundRect(
            RectF(inset, inset, target.first - inset, target.second - inset),
            radius - inset,
            radius - inset,
            edge,
        )
        canvas.restore()

        base.recycle()
        return output
    }

    private fun resolveTargetPixels(
        context: Context,
        widthDp: Float,
        heightDp: Float,
        fallbackWidth: Int,
        fallbackHeight: Int,
    ): Pair<Int, Int> {
        if (!widthDp.isFinite() || !heightDp.isFinite() || widthDp <= 1f || heightDp <= 1f) {
            return fallbackWidth to fallbackHeight
        }

        val density = context.resources.displayMetrics.density.coerceIn(1f, 4f)
        var width = (widthDp * density).roundToInt().coerceIn(MIN_DIMENSION_PX, MAX_DIMENSION_PX)
        var height = (heightDp * density).roundToInt().coerceIn(MIN_DIMENSION_PX, MAX_DIMENSION_PX)

        val pixels = width.toLong() * height.toLong()
        if (pixels > MAX_BITMAP_PIXELS) {
            val reduction = sqrt(MAX_BITMAP_PIXELS.toDouble() / pixels.toDouble()).toFloat()
            width = (width * reduction).roundToInt().coerceAtLeast(MIN_DIMENSION_PX)
            height = (height * reduction).roundToInt().coerceAtLeast(MIN_DIMENSION_PX)
        }
        return width to height
    }

    private fun drawAdaptiveBackdrop(canvas: Canvas, state: OrbiWidgetContract, bounds: RectF) {
        val accent = conditionAccent(state)
        val base = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            shader = LinearGradient(
                0f,
                0f,
                bounds.width(),
                bounds.height(),
                intArrayOf(0xFF030712.toInt(), 0xFF07101F.toInt(), 0xFF050A16.toInt()),
                floatArrayOf(0f, 0.55f, 1f),
                Shader.TileMode.CLAMP,
            )
        }
        canvas.drawRect(bounds, base)

        val ambient = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            shader = RadialGradient(
                bounds.centerX(),
                bounds.centerY(),
                maxOf(bounds.width(), bounds.height()) * 0.68f,
                intArrayOf(withAlpha(accent, 54), withAlpha(0xFF8B5CF6.toInt(), 18), Color.TRANSPARENT),
                floatArrayOf(0f, 0.6f, 1f),
                Shader.TileMode.CLAMP,
            )
        }
        canvas.drawRect(bounds, ambient)
    }

    private fun conditionAccent(state: OrbiWidgetContract): Int {
        val condition = "${state.conditionCode} ${state.conditionLabel}".lowercase()
        return when {
            condition.contains("snow") || condition.contains("nev") || condition.contains("frost") || condition.contains("cold") -> 0xFFBAE6FD.toInt()
            condition.contains("storm") || condition.contains("torment") -> 0xFF8B5CF6.toInt()
            condition.contains("rain") || condition.contains("lluv") -> 0xFF3B82F6.toInt()
            condition.contains("sun") || condition.contains("sol") || condition.contains("hot") || condition.contains("calor") -> 0xFFFFD166.toInt()
            condition.contains("wind") || condition.contains("vient") -> 0xFF2DD4BF.toInt()
            else -> 0xFF67E8F9.toInt()
        }
    }

    private fun withAlpha(color: Int, alpha: Int): Int =
        Color.argb(alpha.coerceIn(0, 255), Color.red(color), Color.green(color), Color.blue(color))
}

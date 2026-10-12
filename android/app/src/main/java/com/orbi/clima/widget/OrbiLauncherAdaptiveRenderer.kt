package com.orbi.clima.widget

import android.content.Context
import android.graphics.Bitmap
import kotlin.math.roundToInt
import kotlin.math.sqrt

/**
 * OC-22O launcher-adaptive renderer.
 *
 * V3 paints directly into the exact launcher bitmap. There is no fixed-size
 * intermediate composition and no fit-center scale in the healthy path.
 * This preserves visual hierarchy across OEM grids while keeping V2 available
 * only as a safe exceptional fallback.
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
        val fallback = fallbackSurface(variant)
        val target = resolveTargetPixels(
            context = context,
            widthDp = launcherWidthDp,
            heightDp = launcherHeightDp,
            fallbackWidth = fallback.first,
            fallbackHeight = fallback.second,
        )

        return try {
            OrbiFluidNativeWidgetRendererV3.render(
                context = context,
                state = state,
                variant = variant,
                width = target.first,
                height = target.second,
            )
        } catch (_: Throwable) {
            // V2 remains a deterministic emergency fallback only. It is not the
            // normal launcher path after OC-22O.
            OrbiNativeWidgetSnapshotRendererV2.render(context, state, variant)
        }
    }

    private fun fallbackSurface(
        variant: OrbiNativeWidgetSnapshotRendererV2.Variant,
    ): Pair<Int, Int> = when (variant) {
        OrbiNativeWidgetSnapshotRendererV2.Variant.MINI -> 560 to 560
        OrbiNativeWidgetSnapshotRendererV2.Variant.PANEL -> 980 to 430
        OrbiNativeWidgetSnapshotRendererV2.Variant.CINEMATIC_BAR -> 1120 to 430
        OrbiNativeWidgetSnapshotRendererV2.Variant.FIELD_COMMAND,
        OrbiNativeWidgetSnapshotRendererV2.Variant.COMMAND,
        OrbiNativeWidgetSnapshotRendererV2.Variant.PREMIUM_COMMAND -> 820 to 820
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
}

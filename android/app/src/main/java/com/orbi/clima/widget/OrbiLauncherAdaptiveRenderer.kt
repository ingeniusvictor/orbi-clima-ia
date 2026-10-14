package com.orbi.clima.widget

import android.content.Context
import android.graphics.Bitmap
import kotlin.math.min
import kotlin.math.roundToInt
import kotlin.math.sqrt

/**
 * OC-22O/P/Q launcher-adaptive renderer.
 *
 * Normal widgets paint directly into the exact launcher bitmap through Fluid V3.
 * Commander 4x4 receives the Orbital V4 composition when geometry is sufficient.
 * V3 and V2 remain deterministic fallbacks; no fixed-size fit-center scaling is
 * reintroduced. Official ORBI Clima branding is applied after rendering.
 */
object OrbiLauncherAdaptiveRenderer {
    private const val MIN_DIMENSION_PX = 180
    private const val MAX_DIMENSION_PX = 1440
    private const val MAX_BITMAP_PIXELS = 1_250_000
    private const val ORBITAL_V4_MIN_SIDE_PX = 300

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

        val rendered = try {
            if (isCommandVariant(variant) && supportsOrbitalV4(target.first, target.second)) {
                try {
                    OrbiOrbitalCommandRendererV4.render(
                        context = context,
                        state = state,
                        variant = variant,
                        width = target.first,
                        height = target.second,
                    )
                } catch (_: Throwable) {
                    // V4 is a progressive Commander enhancement. A failure must
                    // fall back to the already-certified Fluid V3 composition.
                    OrbiFluidNativeWidgetRendererV3.render(
                        context = context,
                        state = state,
                        variant = variant,
                        width = target.first,
                        height = target.second,
                    )
                }
            } else {
                OrbiFluidNativeWidgetRendererV3.render(
                    context = context,
                    state = state,
                    variant = variant,
                    width = target.first,
                    height = target.second,
                )
            }
        } catch (_: Throwable) {
            // V2 remains the final deterministic emergency fallback.
            OrbiNativeWidgetSnapshotRendererV2.render(context, state, variant)
        }

        return OrbiWidgetBrandOverlay.apply(
            context = context,
            source = rendered,
            variant = variant,
        )
    }

    private fun isCommandVariant(variant: OrbiNativeWidgetSnapshotRendererV2.Variant): Boolean =
        variant == OrbiNativeWidgetSnapshotRendererV2.Variant.COMMAND ||
            variant == OrbiNativeWidgetSnapshotRendererV2.Variant.PREMIUM_COMMAND

    private fun supportsOrbitalV4(width: Int, height: Int): Boolean {
        val side = min(width, height)
        if (side < ORBITAL_V4_MIN_SIDE_PX) return false
        val ratio = width.toFloat() / height.toFloat()
        return ratio in 0.72f..1.35f
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
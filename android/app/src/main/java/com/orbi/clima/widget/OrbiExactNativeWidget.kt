package com.orbi.clima.widget

import android.content.Context
import androidx.glance.GlanceId
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.SizeMode
import androidx.glance.appwidget.provideContent

/**
 * Shared OC-22J widget base.
 *
 * SizeMode.Exact asks Glance to compose for the actual launcher allocation.
 * Each update therefore regenerates the Canvas snapshot at the current widget
 * geometry instead of stretching a fixed design bitmap.
 */
open class OrbiExactNativeWidget(
    private val description: String,
    private val fixedVariant: OrbiNativeWidgetSnapshotRendererV2.Variant? = null,
) : GlanceAppWidget() {
    override val sizeMode: SizeMode = SizeMode.Exact

    override suspend fun provideGlance(context: Context, id: GlanceId) {
        val state = OrbiWidgetStateReader.read(context)
        provideContent {
            val variant = fixedVariant ?: OrbiLauncherAdaptiveRenderer.variantForHint(state)
            OrbiAdaptiveNativeWidgetSnapshotHost(
                context = context,
                state = state,
                variant = variant,
                description = description,
            )
        }
    }
}

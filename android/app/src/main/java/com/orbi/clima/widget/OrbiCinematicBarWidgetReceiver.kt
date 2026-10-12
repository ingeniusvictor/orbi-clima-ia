package com.orbi.clima.widget

import android.content.Context
import androidx.glance.GlanceId
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.GlanceAppWidgetReceiver
import androidx.glance.appwidget.provideContent

/** Dedicated panoramic launcher widget for the ORBI cinematic weather strip. */
class OrbiCinematicBarWidgetReceiver : GlanceAppWidgetReceiver() {
    override val glanceAppWidget: GlanceAppWidget = OrbiCinematicBarWidget()
}

class OrbiCinematicBarWidget : GlanceAppWidget() {
    override suspend fun provideGlance(context: Context, id: GlanceId) {
        val state = OrbiWidgetStateReader.read(context)
        val snapshot = OrbiNativeWidgetSnapshotRendererV2.render(
            context,
            state,
            OrbiNativeWidgetSnapshotRendererV2.Variant.CINEMATIC_BAR,
        )
        provideContent {
            OrbiNativeWidgetSnapshotHost(snapshot, "ORBI Cinematic Bar")
        }
    }
}

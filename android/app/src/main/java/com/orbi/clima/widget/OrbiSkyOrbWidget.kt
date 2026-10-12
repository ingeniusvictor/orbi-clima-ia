package com.orbi.clima.widget

import android.content.Context
import androidx.glance.GlanceId
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.provideContent

class OrbiSkyOrbWidget : GlanceAppWidget() {
    override suspend fun provideGlance(context: Context, id: GlanceId) {
        val state = OrbiWidgetStateReader.read(context)
        val snapshot = OrbiNativeWidgetSnapshotRendererV2.renderForHint(context, state)
        provideContent {
            OrbiNativeWidgetSnapshotHost(snapshot, "ORBI SkyOrb Widget")
        }
    }
}

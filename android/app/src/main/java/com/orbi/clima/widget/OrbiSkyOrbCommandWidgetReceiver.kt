package com.orbi.clima.widget

import android.content.Context
import androidx.glance.GlanceId
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.GlanceAppWidgetReceiver
import androidx.glance.appwidget.provideContent

class OrbiSkyOrbCommandWidgetReceiver : GlanceAppWidgetReceiver() {
    override val glanceAppWidget: GlanceAppWidget = OrbiSkyOrbCommandWidget()
}

class OrbiSkyOrbCommandWidget : GlanceAppWidget() {
    override suspend fun provideGlance(context: Context, id: GlanceId) {
        val state = OrbiWidgetStateReader.read(context)
        val snapshot = OrbiNativeWidgetSnapshotRendererV2.renderCommand(context, state)
        provideContent {
            OrbiNativeWidgetSnapshotHost(snapshot, "ORBI SkyOrb Command")
        }
    }
}

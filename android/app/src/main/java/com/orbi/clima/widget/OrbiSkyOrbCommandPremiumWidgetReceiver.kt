package com.orbi.clima.widget

import android.content.Context
import androidx.glance.GlanceId
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.GlanceAppWidgetReceiver
import androidx.glance.appwidget.provideContent

/**
 * ORBI SkyOrb Command Premium 4x4.
 * OC-22I uses the same native-first V2 rendering system as the other widgets,
 * eliminating the former quality gap between launcher variants.
 */
class OrbiSkyOrbCommandPremiumWidgetReceiver : GlanceAppWidgetReceiver() {
    override val glanceAppWidget: GlanceAppWidget = OrbiSkyOrbCommandPremiumWidget()
}

class OrbiSkyOrbCommandPremiumWidget : GlanceAppWidget() {
    override suspend fun provideGlance(context: Context, id: GlanceId) {
        val state = OrbiWidgetStateReader.read(context)
        val snapshot = OrbiNativeWidgetSnapshotRendererV2.renderPremiumCommand(context, state)
        provideContent {
            OrbiNativeWidgetSnapshotHost(snapshot, "ORBI SkyOrb Command Premium")
        }
    }
}

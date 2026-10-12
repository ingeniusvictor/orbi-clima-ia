package com.orbi.clima.widget

import android.content.Context
import androidx.glance.GlanceId
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.GlanceAppWidgetReceiver
import androidx.glance.appwidget.provideContent

/** Dedicated 4x4 field-operations widget for launcher parity. */
class OrbiFieldCommandWidgetReceiver : GlanceAppWidgetReceiver() {
    override val glanceAppWidget: GlanceAppWidget = OrbiFieldCommandWidget()
}

class OrbiFieldCommandWidget : GlanceAppWidget() {
    override suspend fun provideGlance(context: Context, id: GlanceId) {
        val state = OrbiWidgetStateReader.read(context)
        val snapshot = OrbiNativeWidgetSnapshotRendererV2.render(
            context,
            state,
            OrbiNativeWidgetSnapshotRendererV2.Variant.FIELD_COMMAND,
        )
        provideContent {
            OrbiNativeWidgetSnapshotHost(snapshot, "ORBI Field Command")
        }
    }
}

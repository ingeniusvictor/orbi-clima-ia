package com.orbi.clima.widget

import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.GlanceAppWidgetReceiver

/** Dedicated 4x4 field-operations widget with exact launcher-size rendering. */
class OrbiFieldCommandWidgetReceiver : GlanceAppWidgetReceiver() {
    override val glanceAppWidget: GlanceAppWidget = OrbiFieldCommandWidget()
}

class OrbiFieldCommandWidget : OrbiExactNativeWidget(
    description = "ORBI Field Command",
    fixedVariant = OrbiNativeWidgetSnapshotRendererV2.Variant.FIELD_COMMAND,
)

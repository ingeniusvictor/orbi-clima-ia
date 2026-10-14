package com.orbi.clima.widget

import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.GlanceAppWidgetReceiver

/** Dedicated panoramic widget with exact launcher-size native rendering. */
class OrbiCinematicBarWidgetReceiver : GlanceAppWidgetReceiver() {
    override val glanceAppWidget: GlanceAppWidget = OrbiCinematicBarWidget()
}

class OrbiCinematicBarWidget : OrbiExactNativeWidget(
    description = "ORBI Cinematic Bar",
    fixedVariant = OrbiNativeWidgetSnapshotRendererV2.Variant.CINEMATIC_BAR,
)

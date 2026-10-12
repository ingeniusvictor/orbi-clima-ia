package com.orbi.clima.widget

import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.GlanceAppWidgetReceiver

/**
 * ORBI SkyOrb Command Premium 4x4.
 * OC-22J preserves the native V2 composition and adapts it to exact launcher
 * geometry instead of stretching a fixed square bitmap.
 */
class OrbiSkyOrbCommandPremiumWidgetReceiver : GlanceAppWidgetReceiver() {
    override val glanceAppWidget: GlanceAppWidget = OrbiSkyOrbCommandPremiumWidget()
}

class OrbiSkyOrbCommandPremiumWidget : OrbiExactNativeWidget(
    description = "ORBI SkyOrb Command Premium",
    fixedVariant = OrbiNativeWidgetSnapshotRendererV2.Variant.PREMIUM_COMMAND,
)

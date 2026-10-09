package com.orbi.clima.widget

import android.content.Context
import androidx.glance.GlanceId
import androidx.glance.GlanceModifier
import androidx.glance.Image
import androidx.glance.ImageProvider
import androidx.glance.action.actionStartActivity
import androidx.glance.action.clickable
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.GlanceAppWidgetReceiver
import androidx.glance.appwidget.provideContent
import androidx.glance.layout.ContentScale
import androidx.glance.layout.fillMaxSize
import com.orbi.clima.MainActivity

/**
 * ORBI SkyOrb Command Premium 4x4.
 *
 * OC-15 replaces the previous Glance-only approximation with a deterministic
 * native bitmap snapshot. Glance remains the launcher host and click surface,
 * while Android Canvas handles the premium visual composition.
 */
class OrbiSkyOrbCommandPremiumWidgetReceiver : GlanceAppWidgetReceiver() {
    override val glanceAppWidget: GlanceAppWidget = OrbiSkyOrbCommandPremiumWidget()
}

class OrbiSkyOrbCommandPremiumWidget : GlanceAppWidget() {
    override suspend fun provideGlance(context: Context, id: GlanceId) {
        val state = OrbiWidgetStateReader.read(context)
        val snapshot = OrbiPremiumSnapshotRenderer.render(context, state)

        provideContent {
            Image(
                provider = ImageProvider(snapshot),
                contentDescription = "ORBI SkyOrb Command Premium",
                modifier = GlanceModifier
                    .fillMaxSize()
                    .clickable(actionStartActivity<MainActivity>()),
                contentScale = ContentScale.FillBounds,
            )
        }
    }
}

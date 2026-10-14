package com.orbi.clima.widget

import android.content.Context
import android.graphics.Bitmap
import androidx.compose.runtime.Composable
import androidx.glance.GlanceModifier
import androidx.glance.Image
import androidx.glance.ImageProvider
import androidx.glance.LocalSize
import androidx.glance.action.actionStartActivity
import androidx.glance.action.clickable
import androidx.glance.layout.ContentScale
import androidx.glance.layout.fillMaxSize
import com.orbi.clima.MainActivity

/**
 * Single Glance surface used by OC-22I/OC-22J widgets.
 * Visual composition is painted by native Canvas; Glance remains only the
 * launcher host and click surface.
 */
@Composable
fun OrbiNativeWidgetSnapshotHost(bitmap: Bitmap, description: String) {
    Image(
        provider = ImageProvider(bitmap),
        contentDescription = description,
        modifier = GlanceModifier
            .fillMaxSize()
            .clickable(actionStartActivity<MainActivity>()),
        contentScale = ContentScale.Fit,
    )
}

/**
 * OC-22J exact-size host.
 * LocalSize is supplied by Glance SizeMode.Exact and reflects the actual widget
 * allocation chosen by the launcher, including user resize operations.
 */
@Composable
fun OrbiAdaptiveNativeWidgetSnapshotHost(
    context: Context,
    state: OrbiWidgetContract,
    variant: OrbiNativeWidgetSnapshotRendererV2.Variant,
    description: String,
) {
    val launcherSize = LocalSize.current
    val snapshot = OrbiLauncherAdaptiveRenderer.render(
        context = context,
        state = state,
        variant = variant,
        launcherWidthDp = launcherSize.width.value,
        launcherHeightDp = launcherSize.height.value,
    )
    OrbiNativeWidgetSnapshotHost(snapshot, description)
}

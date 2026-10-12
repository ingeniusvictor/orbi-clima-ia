package com.orbi.clima.widget

import android.graphics.Bitmap
import androidx.compose.runtime.Composable
import androidx.glance.GlanceModifier
import androidx.glance.Image
import androidx.glance.ImageProvider
import androidx.glance.action.actionStartActivity
import androidx.glance.action.clickable
import androidx.glance.layout.ContentScale
import androidx.glance.layout.fillMaxSize
import com.orbi.clima.MainActivity

/**
 * Single Glance surface used by OC-22I widgets.
 * Visual composition is already painted by the native renderer, preventing
 * launcher-specific Glance layout differences from drifting away from preview.
 */
@Composable
fun OrbiNativeWidgetSnapshotHost(bitmap: Bitmap, description: String) {
    Image(
        provider = ImageProvider(bitmap),
        contentDescription = description,
        modifier = GlanceModifier
            .fillMaxSize()
            .clickable(actionStartActivity<MainActivity>()),
        contentScale = ContentScale.FillBounds,
    )
}

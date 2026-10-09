package com.orbi.clima.widget

import androidx.compose.runtime.Composable

@Composable
fun OrbiWidgetSizeRouter(state: OrbiWidgetContract) {
    when (state.visualVariantHint.lowercase()) {
        "skyorb_2x2" -> {
            OrbiSkyOrb2x2Content(state)
        }
        "skyorb_4x2" -> {
            OrbiSkyOrb4x2Content(state)
        }
        "skyorb_4x4" -> {
            OrbiSkyOrb4x4Content(state)
        }
        "skyorb_mini", "mini" -> {
            OrbiSkyOrbMiniContent(state)
        }
        "field_command", "field" -> {
            OrbiFieldCommandContent(state)
        }
        "cinematic_bar", "cinematic" -> {
            OrbiCinematicBarContent(state)
        }
        else -> {
            OrbiSkyPanelContent(state)
        }
    }
}

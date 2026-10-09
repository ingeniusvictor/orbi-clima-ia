package com.orbi.clima.widget

import android.content.Context

object OrbiWidgetStateReader {
    private const val PREFS_NAME = "orbi_clima_widget_prefs"
    private const val CONTRACT_KEY = "orbi_skyorb_widget_contract_v1"

    fun read(context: Context): OrbiWidgetContract {
        return try {
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val json = prefs.getString(CONTRACT_KEY, null)

            if (json.isNullOrBlank()) {
                OrbiWidgetContract()
            } else {
                OrbiWidgetContract.fromJson(json)
            }
        } catch (e: Exception) {
            OrbiWidgetContract(
                sourceMode = "fallback",
                shortNarrative = "ORBI mantiene modo de seguridad activo."
            )
        }
    }
}

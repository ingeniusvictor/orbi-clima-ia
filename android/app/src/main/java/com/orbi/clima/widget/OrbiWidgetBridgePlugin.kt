package com.orbi.clima.widget

import android.content.Context
import android.util.Log
import androidx.glance.appwidget.updateAll
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

@CapacitorPlugin(name = "OrbiWidgetBridge")
class OrbiWidgetBridgePlugin : Plugin() {

    @PluginMethod
    fun saveWidgetContract(call: PluginCall) {
        val contractJson = call.getString("contractJson")

        if (contractJson.isNullOrBlank()) {
            call.reject("Missing contractJson")
            return
        }

        try {
            val appContext = context.applicationContext
            appContext
                .getSharedPreferences("orbi_clima_widget_prefs", Context.MODE_PRIVATE)
                .edit()
                .putString("orbi_skyorb_widget_contract_v1", contractJson)
                .putLong("orbi_skyorb_widget_updated_at", System.currentTimeMillis())
                .apply()

            // OC-16: every native widget family consumes the same persisted contract,
            // so a weather-state change must fan out immediately instead of waiting
            // for each launcher's periodic update window.
            CoroutineScope(Dispatchers.Default).launch {
                refreshAllWidgetFamilies(appContext)
            }

            val ret = JSObject()
            ret.put("success", true)
            ret.put("refreshScheduled", true)
            ret.put("widgetFamilies", 5)
            call.resolve(ret)
        } catch (e: Exception) {
            call.reject("Failed to save contract", e)
        }
    }

    private suspend fun refreshAllWidgetFamilies(context: Context) {
        refreshSafely("SkyOrb") {
            OrbiSkyOrbWidget().updateAll(context)
        }
        refreshSafely("Mini") {
            OrbiSkyOrbMiniWidget().updateAll(context)
        }
        refreshSafely("Panel") {
            OrbiSkyOrbPanelWidget().updateAll(context)
        }
        refreshSafely("Command") {
            OrbiSkyOrbCommandWidget().updateAll(context)
        }
        refreshSafely("CommandPremium") {
            OrbiSkyOrbCommandPremiumWidget().updateAll(context)
        }
    }

    private suspend fun refreshSafely(name: String, refresh: suspend () -> Unit) {
        try {
            refresh()
        } catch (error: Exception) {
            // A launcher/OEM failure in one family must not prevent the remaining
            // widgets from receiving the same fresh weather contract.
            Log.w(TAG, "Widget refresh failed for $name", error)
        }
    }

    companion object {
        private const val TAG = "OrbiWidgetBridge"
    }
}

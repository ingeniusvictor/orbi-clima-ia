package com.orbi.clima.widget

import android.content.Context
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import androidx.glance.appwidget.updateAll
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
            val context = context
            context
                .getSharedPreferences("orbi_clima_widget_prefs", Context.MODE_PRIVATE)
                .edit()
                .putString("orbi_skyorb_widget_contract_v1", contractJson)
                .putLong("orbi_skyorb_widget_updated_at", System.currentTimeMillis())
                .apply()

            // Update all Glance AppWidget instances
            CoroutineScope(Dispatchers.Default).launch {
                try {
                    OrbiSkyOrbWidget().updateAll(context)
                } catch (e: Exception) {
                    e.printStackTrace()
                }
            }

            val ret = JSObject()
            ret.put("success", true)
            call.resolve(ret)
        } catch (e: Exception) {
            call.reject("Failed to save contract", e)
        }
    }
}

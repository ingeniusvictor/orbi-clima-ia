package com.orbi.clima.runtime

import android.Manifest
import android.app.ActivityManager
import android.app.NotificationManager
import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.PowerManager
import android.provider.Settings
import androidx.core.content.ContextCompat
import androidx.work.WorkInfo
import androidx.work.WorkManager
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import com.orbi.clima.alerts.OfficialAlertWatchStore
import com.orbi.clima.alerts.OfficialAlertWorker
import com.orbi.clima.widget.OrbiSkyOrbCommandPremiumWidgetReceiver
import com.orbi.clima.widget.OrbiSkyOrbCommandWidgetReceiver
import com.orbi.clima.widget.OrbiSkyOrbMiniWidgetReceiver
import com.orbi.clima.widget.OrbiSkyOrbPanelWidgetReceiver
import com.orbi.clima.widget.OrbiSkyOrbWidgetReceiver
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.util.concurrent.TimeUnit

@CapacitorPlugin(name = "OrbiRuntimeDiagnostics")
class OrbiRuntimeDiagnosticsPlugin : Plugin() {

    @PluginMethod
    fun getStatus(call: PluginCall) {
        CoroutineScope(Dispatchers.IO).launch {
            val payload = buildStatus()
            withContext(Dispatchers.Main) {
                call.resolve(payload)
            }
        }
    }

    @PluginMethod
    fun openAppSettings(call: PluginCall) {
        try {
            val intent = Intent(
                Settings.ACTION_APPLICATION_DETAILS_SETTINGS,
                Uri.fromParts("package", context.packageName, null),
            ).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(intent)
            call.resolve(JSObject().put("opened", true))
        } catch (error: Exception) {
            call.reject("Unable to open Android app settings", error)
        }
    }

    @PluginMethod
    fun openNotificationSettings(call: PluginCall) {
        try {
            val intent = Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS).apply {
                putExtra(Settings.EXTRA_APP_PACKAGE, context.packageName)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(intent)
            call.resolve(JSObject().put("opened", true))
        } catch (error: Exception) {
            call.reject("Unable to open Android notification settings", error)
        }
    }

    private fun buildStatus(): JSObject {
        val fineLocationGranted = hasPermission(Manifest.permission.ACCESS_FINE_LOCATION)
        val coarseLocationGranted = hasPermission(Manifest.permission.ACCESS_COARSE_LOCATION)
        val notificationPermissionGranted = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            hasPermission(Manifest.permission.POST_NOTIFICATIONS)
        } else {
            true
        }

        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        val officialChannel = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            notificationManager.getNotificationChannel(OfficialAlertWorker.CHANNEL_ID)
        } else {
            null
        }
        val officialChannelCreated = Build.VERSION.SDK_INT < Build.VERSION_CODES.O || officialChannel != null
        val officialChannelEnabled = Build.VERSION.SDK_INT < Build.VERSION_CODES.O ||
            (officialChannel != null && officialChannel.importance != NotificationManager.IMPORTANCE_NONE)

        val powerManager = context.getSystemService(Context.POWER_SERVICE) as PowerManager
        val batteryOptimizationActive = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            !powerManager.isIgnoringBatteryOptimizations(context.packageName)
        } else {
            false
        }

        val activityManager = context.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
        val backgroundRestricted = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            activityManager.isBackgroundRestricted
        } else {
            false
        }

        val workInfos = try {
            WorkManager.getInstance(context)
                .getWorkInfosByTag(OFFICIAL_WORK_TAG)
                .get(5, TimeUnit.SECONDS)
        } catch (_: Exception) {
            emptyList()
        }
        val activeWork = workInfos.count { info ->
            info.state == WorkInfo.State.ENQUEUED ||
                info.state == WorkInfo.State.RUNNING ||
                info.state == WorkInfo.State.BLOCKED
        }
        val runningWork = workInfos.count { it.state == WorkInfo.State.RUNNING }
        val workStates = workInfos
            .map { it.state.name }
            .distinct()
            .sorted()
            .joinToString(",")

        val widgetCounts = JSObject().apply {
            put("skyOrb", widgetCount(OrbiSkyOrbWidgetReceiver::class.java))
            put("mini", widgetCount(OrbiSkyOrbMiniWidgetReceiver::class.java))
            put("panel", widgetCount(OrbiSkyOrbPanelWidgetReceiver::class.java))
            put("command", widgetCount(OrbiSkyOrbCommandWidgetReceiver::class.java))
            put("commandPremium", widgetCount(OrbiSkyOrbCommandPremiumWidgetReceiver::class.java))
        }
        val placedWidgetCount = widgetCounts.getInt("skyOrb") +
            widgetCounts.getInt("mini") +
            widgetCounts.getInt("panel") +
            widgetCounts.getInt("command") +
            widgetCounts.getInt("commandPremium")

        val officialWatchStatus = OfficialAlertWatchStore.statusJson(context)
        val officialWatchEnabled = officialWatchStatus.optBoolean("enabled", false)

        return JSObject().apply {
            put("platform", "android")
            put("manufacturer", Build.MANUFACTURER ?: "")
            put("brand", Build.BRAND ?: "")
            put("model", Build.MODEL ?: "")
            put("sdkInt", Build.VERSION.SDK_INT)
            put("release", Build.VERSION.RELEASE ?: "")
            put("fineLocationGranted", fineLocationGranted)
            put("coarseLocationGranted", coarseLocationGranted)
            put("notificationPermissionGranted", notificationPermissionGranted)
            put("officialAlertChannelCreated", officialChannelCreated)
            put("officialAlertChannelEnabled", officialChannelEnabled)
            put("officialAlertChannelImportance", officialChannel?.importance ?: -1)
            put("batteryOptimizationActive", batteryOptimizationActive)
            put("backgroundRestricted", backgroundRestricted)
            put("officialWatchEnabled", officialWatchEnabled)
            put("officialWatchLastResult", officialWatchStatus.optString("lastResult", ""))
            put("officialWatchLastCheckAt", officialWatchStatus.optLong("lastCheckAt", 0L))
            put("officialWatchCoveragePartial", officialWatchStatus.optBoolean("coveragePartial", false))
            put("workItems", workInfos.size)
            put("activeWorkItems", activeWork)
            put("runningWorkItems", runningWork)
            put("workStates", workStates)
            put("workScheduled", !officialWatchEnabled || activeWork > 0)
            put("widgets", widgetCounts)
            put("placedWidgetCount", placedWidgetCount)
            put("usesBackgroundLocation", false)
            put("usesForegroundService", false)
            put("capturedAt", System.currentTimeMillis())
        }
    }

    private fun hasPermission(permission: String): Boolean =
        ContextCompat.checkSelfPermission(context, permission) == PackageManager.PERMISSION_GRANTED

    private fun widgetCount(receiverClass: Class<*>): Int {
        return try {
            AppWidgetManager.getInstance(context)
                .getAppWidgetIds(ComponentName(context, receiverClass))
                .size
        } catch (_: Exception) {
            0
        }
    }

    companion object {
        private const val OFFICIAL_WORK_TAG = "orbi_official_senapred"
    }
}

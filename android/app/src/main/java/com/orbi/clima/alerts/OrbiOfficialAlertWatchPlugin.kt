package com.orbi.clima.alerts

import androidx.work.BackoffPolicy
import androidx.work.Constraints
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.ExistingWorkPolicy
import androidx.work.NetworkType
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import java.util.concurrent.TimeUnit
import kotlin.math.abs

@CapacitorPlugin(name = "OrbiOfficialAlertWatch")
class OrbiOfficialAlertWatchPlugin : Plugin() {

    @PluginMethod
    fun configure(call: PluginCall) {
        val enabled = call.getBoolean("enabled", false) ?: false
        if (!enabled) {
            OfficialAlertWatchStore.setEnabled(context, false)
            val manager = WorkManager.getInstance(context)
            manager.cancelUniqueWork(UNIQUE_PERIODIC_WORK)
            manager.cancelUniqueWork(UNIQUE_IMMEDIATE_WORK)
            call.resolve(OfficialAlertWatchStore.statusJson(context).toJsObject())
            return
        }

        val latitude = call.getDouble("latitude")
        val longitude = call.getDouble("longitude")
        val country = call.getString("country", "Chile") ?: "Chile"

        if (latitude == null || longitude == null || !latitude.isFinite() || !longitude.isFinite()) {
            call.reject("Valid foreground-confirmed latitude/longitude are required.")
            return
        }
        if (!country.equals("Chile", ignoreCase = true)) {
            call.reject("SENAPRED background watch is available only for Chile locations.")
            return
        }

        val intervalMinutes = (call.getInt(
            "intervalMinutes",
            OfficialAlertWatchStore.DEFAULT_INTERVAL_MINUTES.toInt(),
        ) ?: OfficialAlertWatchStore.DEFAULT_INTERVAL_MINUTES.toInt())
            .toLong()
            .coerceAtLeast(OfficialAlertWatchStore.MIN_INTERVAL_MINUTES)

        val quiet = call.getObject("quietHours")
        val config = OfficialAlertWatchConfig(
            enabled = true,
            locationId = call.getString("locationId", "") ?: "",
            locationName = call.getString("locationName", "Ubicación guardada") ?: "Ubicación guardada",
            region = call.getString("region", "") ?: "",
            country = country,
            latitude = latitude,
            longitude = longitude,
            timezone = call.getString("timezone", "America/Santiago") ?: "America/Santiago",
            intervalMinutes = intervalMinutes,
            quietHoursEnabled = quiet?.getBool("enabled") ?: true,
            quietHoursMode = quiet?.getString("mode") ?: "critical_only",
            quietHoursStart = quiet?.getString("startTime") ?: "22:00",
            quietHoursEnd = quiet?.getString("endTime") ?: "07:00",
            allowCriticalDuringQuietHours = quiet?.getBool("allowCritical") ?: true,
        )

        val previous = OfficialAlertWatchStore.loadConfig(context)
        val wasDisabled = previous?.enabled != true
        val locationChanged = previous == null
            || previous.locationId != config.locationId
            || abs(previous.latitude - config.latitude) > 0.00001
            || abs(previous.longitude - config.longitude) > 0.00001
        val intervalChanged = previous?.intervalMinutes != config.intervalMinutes

        OfficialAlertWatchStore.saveConfig(context, config)

        // Do not reset/update the periodic WorkManager request on every normal
        // foreground SENAPRED refresh. The worker reads the latest snapshot from
        // SharedPreferences each time it runs.
        if (wasDisabled || intervalChanged) {
            schedulePeriodic(config.intervalMinutes)
        }
        if (wasDisabled || locationChanged) {
            enqueueImmediateCheck()
        }

        call.resolve(OfficialAlertWatchStore.statusJson(context).toJsObject())
    }

    @PluginMethod
    fun updateQuietHours(call: PluginCall) {
        val quiet = call.getObject("quietHours")
        if (quiet == null) {
            call.reject("Missing quietHours")
            return
        }
        OfficialAlertWatchStore.updateQuietHours(
            context = context,
            enabled = quiet.getBool("enabled") ?: true,
            mode = quiet.getString("mode") ?: "critical_only",
            startTime = quiet.getString("startTime") ?: "22:00",
            endTime = quiet.getString("endTime") ?: "07:00",
            allowCritical = quiet.getBool("allowCritical") ?: true,
        )
        call.resolve(OfficialAlertWatchStore.statusJson(context).toJsObject())
    }

    @PluginMethod
    fun getStatus(call: PluginCall) {
        call.resolve(OfficialAlertWatchStore.statusJson(context).toJsObject())
    }

    @PluginMethod
    fun runNow(call: PluginCall) {
        val config = OfficialAlertWatchStore.loadConfig(context)
        if (config == null || !config.enabled) {
            call.reject("Official alert background watch is not enabled.")
            return
        }
        enqueueImmediateCheck()
        call.resolve(JSObject().put("queued", true))
    }

    @PluginMethod
    fun isDelivered(call: PluginCall) {
        val dedupKey = call.getString("dedupKey")
        if (dedupKey.isNullOrBlank()) {
            call.reject("Missing dedupKey")
            return
        }
        call.resolve(JSObject().put("delivered", OfficialAlertWatchStore.isDelivered(context, dedupKey)))
    }

    @PluginMethod
    fun markDelivered(call: PluginCall) {
        val dedupKey = call.getString("dedupKey")
        if (dedupKey.isNullOrBlank()) {
            call.reject("Missing dedupKey")
            return
        }
        OfficialAlertWatchStore.markDelivered(context, dedupKey)
        call.resolve(JSObject().put("success", true))
    }

    private fun schedulePeriodic(intervalMinutes: Long) {
        val constraints = Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .build()

        val work = PeriodicWorkRequestBuilder<OfficialAlertWorker>(
            intervalMinutes.coerceAtLeast(OfficialAlertWatchStore.MIN_INTERVAL_MINUTES),
            TimeUnit.MINUTES,
        )
            .setConstraints(constraints)
            .setBackoffCriteria(BackoffPolicy.EXPONENTIAL, 15, TimeUnit.MINUTES)
            .addTag(WORK_TAG)
            .build()

        WorkManager.getInstance(context).enqueueUniquePeriodicWork(
            UNIQUE_PERIODIC_WORK,
            ExistingPeriodicWorkPolicy.UPDATE,
            work,
        )
    }

    private fun enqueueImmediateCheck() {
        val constraints = Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .build()
        val work = OneTimeWorkRequestBuilder<OfficialAlertWorker>()
            .setConstraints(constraints)
            .setBackoffCriteria(BackoffPolicy.EXPONENTIAL, 15, TimeUnit.MINUTES)
            .addTag(WORK_TAG)
            .build()
        WorkManager.getInstance(context).enqueueUniqueWork(
            UNIQUE_IMMEDIATE_WORK,
            ExistingWorkPolicy.REPLACE,
            work,
        )
    }

    private fun org.json.JSONObject.toJsObject(): JSObject = JSObject.fromJSONObject(this)

    companion object {
        private const val UNIQUE_PERIODIC_WORK = "orbi_official_senapred_periodic_v1"
        private const val UNIQUE_IMMEDIATE_WORK = "orbi_official_senapred_immediate_v1"
        private const val WORK_TAG = "orbi_official_senapred"
    }
}

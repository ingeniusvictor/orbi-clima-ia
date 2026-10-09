package com.orbi.clima.alerts

import android.Manifest
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.orbi.clima.MainActivity
import com.orbi.clima.R
import java.time.LocalTime
import java.time.ZoneId
import java.time.format.DateTimeFormatter

class OfficialAlertWorker(
    appContext: Context,
    workerParams: WorkerParameters,
) : CoroutineWorker(appContext, workerParams) {

    override suspend fun doWork(): Result {
        val config = OfficialAlertWatchStore.loadConfig(applicationContext)
        if (config == null || !config.enabled) {
            OfficialAlertWatchStore.recordCheck(applicationContext, "disabled")
            return Result.success()
        }

        if (!config.country.equals("Chile", ignoreCase = true)) {
            OfficialAlertWatchStore.recordCheck(
                applicationContext,
                "outside_chile",
                "La vigilancia SENAPRED sólo se ejecuta para ubicaciones guardadas en Chile.",
            )
            return Result.success()
        }

        val result = try {
            SenapredBackgroundClient.fetch(config)
        } catch (error: Exception) {
            OfficialAlertWatchStore.recordCheck(
                applicationContext,
                "network_retry",
                error.message ?: "Error consultando SENAPRED",
            )
            return Result.retry()
        }

        if (!result.hasVerifiedCoverage) {
            OfficialAlertWatchStore.recordCheck(
                applicationContext,
                "unverifiable",
                result.errorMessage ?: "No se pudo verificar ninguna capa oficial SENAPRED.",
                result.coveragePartial,
            )
            return if (runAttemptCount < 2) Result.retry() else Result.success()
        }

        if (result.alerts.isEmpty()) {
            OfficialAlertWatchStore.recordCheck(
                applicationContext,
                if (result.coveragePartial) "verified_partial_no_alert" else "verified_no_alert",
                coveragePartial = result.coveragePartial,
            )
            return Result.success()
        }

        // One genuinely new official alert per worker cycle. If several alerts
        // coexist, subsequent WorkManager cycles can deliver the remaining ones.
        val candidate = result.alerts.firstOrNull { alert ->
            !OfficialAlertWatchStore.isDelivered(applicationContext, alert.dedupKey())
        }

        if (candidate == null) {
            OfficialAlertWatchStore.recordCheck(
                applicationContext,
                "already_delivered",
                coveragePartial = result.coveragePartial,
            )
            return Result.success()
        }

        val dedupKey = candidate.dedupKey()
        OfficialAlertWatchStore.recordCandidate(
            applicationContext,
            dedupKey,
            candidate.level,
            candidate.area,
        )

        if (isBlockedByQuietHours(config, candidate.severity)) {
            OfficialAlertWatchStore.recordCheck(
                applicationContext,
                "quiet_hours",
                coveragePartial = result.coveragePartial,
            )
            // Do not mark delivered. It remains eligible when quiet hours end.
            return Result.success()
        }

        if (!canPostNotifications()) {
            OfficialAlertWatchStore.recordCheck(
                applicationContext,
                "notification_permission_missing",
                "Android no concedió POST_NOTIFICATIONS; la alerta queda pendiente.",
                result.coveragePartial,
            )
            // Keep it undelivered so it can surface after permission is granted.
            return Result.success()
        }

        return try {
            postOfficialNotification(candidate, dedupKey)
            OfficialAlertWatchStore.recordNotification(
                applicationContext,
                dedupKey,
                candidate.level,
                candidate.area,
            )
            Result.success()
        } catch (error: Exception) {
            OfficialAlertWatchStore.recordCheck(
                applicationContext,
                "notification_error",
                error.message ?: "No se pudo publicar la notificación oficial.",
                result.coveragePartial,
            )
            Result.retry()
        }
    }

    private fun canPostNotifications(): Boolean {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU) return true
        return applicationContext.checkSelfPermission(
            Manifest.permission.POST_NOTIFICATIONS,
        ) == PackageManager.PERMISSION_GRANTED
    }

    private fun isBlockedByQuietHours(config: OfficialAlertWatchConfig, severity: String): Boolean {
        if (!config.quietHoursEnabled || config.quietHoursMode == "disabled") return false

        val zone = try {
            ZoneId.of(config.timezone)
        } catch (_: Exception) {
            ZoneId.systemDefault()
        }
        val now = LocalTime.now(zone)
        val formatter = DateTimeFormatter.ofPattern("HH:mm")
        val start = try {
            LocalTime.parse(config.quietHoursStart, formatter)
        } catch (_: Exception) {
            LocalTime.of(22, 0)
        }
        val end = try {
            LocalTime.parse(config.quietHoursEnd, formatter)
        } catch (_: Exception) {
            LocalTime.of(7, 0)
        }

        val inside = if (start == end) {
            true
        } else if (start.isBefore(end)) {
            !now.isBefore(start) && now.isBefore(end)
        } else {
            !now.isBefore(start) || now.isBefore(end)
        }
        if (!inside) return false

        return when (config.quietHoursMode) {
            "enabled" -> true
            "critical_only" -> severity != "critical" || !config.allowCriticalDuringQuietHours
            else -> false
        }
    }

    private fun postOfficialNotification(alert: BackgroundSenapredAlert, dedupKey: String) {
        val manager = applicationContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        ensureOfficialChannel(manager)
        val notificationId = notificationId(dedupKey)

        val intent = Intent(applicationContext, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            putExtra("orbi_open_tab", "alerts")
            putExtra("orbi_official_alert_key", dedupKey)
        }
        val pendingIntent = PendingIntent.getActivity(
            applicationContext,
            notificationId,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )

        val notification = Notification.Builder(applicationContext, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_stat_orbi_alert)
            .setContentTitle("SENAPRED · ${alert.levelLabel}")
            .setContentText("${alert.area}: ${alert.causalidad}. Revisa la información oficial.")
            .setStyle(
                Notification.BigTextStyle().bigText(
                    "${alert.area}: ${alert.causalidad}. Revisa SENAPRED y sigue las instrucciones de la autoridad.",
                ),
            )
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)
            .setOnlyAlertOnce(true)
            .setCategory(Notification.CATEGORY_EVENT)
            .setVisibility(Notification.VISIBILITY_PUBLIC)
            .setPriority(Notification.PRIORITY_HIGH)
            .setWhen(System.currentTimeMillis())
            .build()

        // Untagged deterministic ID intentionally matches the foreground
        // Capacitor notification ID. If both runtimes race, Android replaces
        // the same notification instead of displaying a duplicate.
        manager.notify(notificationId, notification)
    }

    private fun ensureOfficialChannel(manager: NotificationManager) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
        val channel = NotificationChannel(
            CHANNEL_ID,
            "Alertas oficiales SENAPRED",
            NotificationManager.IMPORTANCE_HIGH,
        ).apply {
            description = "Alertas territoriales oficiales SENAPRED verificadas por ubicación"
            enableVibration(true)
            lockscreenVisibility = Notification.VISIBILITY_PUBLIC
        }
        manager.createNotificationChannel(channel)
    }

    private fun notificationId(dedupKey: String): Int {
        val raw = dedupKey.hashCode() and 0x7fffffff
        return if (raw == 0) 11011 else raw
    }

    companion object {
        const val CHANNEL_ID = "orbi_official_alerts"
    }
}

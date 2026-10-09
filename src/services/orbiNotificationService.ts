import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { OrbiNotificationCandidate, OrbiNotificationHistoryItem, WeatherProfile, SmartAlertSeverity, ScheduledAlertItem } from '../types/weatherTypes';
import { appendNotificationHistory, loadNotificationHistory } from './notificationHistoryService';
import { checkOrbiNotificationPermission } from './notificationPermissionService';
import { loadQuietHoursSettings } from './quietHoursService';
import { evaluateQuietHoursDecision } from '../utils/quietHoursGuard';
import { loadNotificationFrequencySettings, canSendByFrequency } from './notificationFrequencyService';
import { appendBlockedLog } from './notificationBlockLogService';
import { loadLastWeatherBundleTimestamp } from './weatherCacheService';
import { addDeferredAlert } from './deferredAlertQueueService';
import { buildOfficialAlertNotificationCandidates } from './officialAlertNotificationCandidateBuilder';
import {
  OfficialAlertsResult,
  ORBI_OFFICIAL_ALERTS_EVENT,
} from './officialWeatherAlertsService';
import {
  initializeOfficialAlertBackgroundWatchSync,
  isOfficialAlertDeliveredNative,
  markOfficialAlertDeliveredNative,
} from './officialAlertBackgroundWatchService';

let officialAlertBridgeInitialized = false;
const officialAlertInFlight = new Set<string>();

export function isWeatherFresh(updatedAt: string | number | undefined, maxAgeMinutes = 90): boolean {
  if (!updatedAt) return false;
  const lastTime = typeof updatedAt === 'number' ? updatedAt : new Date(updatedAt).getTime();
  const diffMs = Date.now() - lastTime;
  const diffMin = diffMs / (1000 * 60);
  return diffMin < maxAgeMinutes;
}

/**
 * Mirrors Java/Kotlin String.hashCode() for the normalized ASCII SENAPRED
 * dedup key. The native worker uses the same positive ID, so even a rare race
 * between WebView and WorkManager replaces one Android notification instead of
 * producing two visible cards.
 */
function stableOfficialAndroidNotificationId(dedupKey: string): number {
  let hash = 0;
  for (let index = 0; index < dedupKey.length; index += 1) {
    hash = (Math.imul(31, hash) + dedupKey.charCodeAt(index)) | 0;
  }
  const positive = hash & 0x7fffffff;
  return positive === 0 ? 11011 : positive;
}

function initializeOfficialAlertDeliveryBridge(): void {
  if (officialAlertBridgeInitialized || typeof window === 'undefined') return;
  officialAlertBridgeInitialized = true;

  window.addEventListener(ORBI_OFFICIAL_ALERTS_EVENT, (event: Event) => {
    const result = (event as CustomEvent<OfficialAlertsResult>).detail;
    if (!result?.hasVerifiedCoverage || !result.alerts?.length) return;

    const candidates = buildOfficialAlertNotificationCandidates({
      result,
      profile: 'person',
      allowWatch: true,
    });
    if (!candidates.length) return;

    const history = loadNotificationHistory();
    const candidate = candidates.find(item =>
      !history.some(entry => entry.dedupKey === item.dedupKey)
      && !officialAlertInFlight.has(item.dedupKey),
    );
    if (!candidate) return;

    officialAlertInFlight.add(candidate.dedupKey);
    void sendOrbiLocalNotification(candidate)
      .catch(error => {
        console.error('Official SENAPRED notification delivery failed:', error);
      })
      .finally(() => {
        officialAlertInFlight.delete(candidate.dedupKey);
      });
  });
}

export async function initializeOrbiNotificationChannels(): Promise<void> {
  // The event bridge is useful in both native builds and web preview. It is
  // registered before the platform return so the delivery policy can be QA'd
  // without an Android device.
  initializeOfficialAlertDeliveryBridge();
  initializeOfficialAlertBackgroundWatchSync();

  if (!Capacitor.isNativePlatform()) {
    console.log('Orbi Notification Service: Mocking channel initialization in Web Preview.');
    return;
  }

  try {
    // Channel 1: Weather Alerts (Person Profile)
    await LocalNotifications.createChannel({
      id: 'orbi_weather_alerts',
      name: 'Alertas climáticas ORBI',
      description: 'Alertas de clima y recomendaciones personalizadas',
      importance: 4,
      visibility: 1,
      vibration: true
    });

    // Channel 2: Field Alerts (Field Tech Profile)
    await LocalNotifications.createChannel({
      id: 'orbi_field_alerts',
      name: 'Alertas técnico terreno ORBI',
      description: 'Alertas de seguridad y directrices para operaciones en terreno',
      importance: 5,
      visibility: 1,
      vibration: true
    });

    // Channel 3: Authority-issued official alerts
    await LocalNotifications.createChannel({
      id: 'orbi_official_alerts',
      name: 'Alertas oficiales SENAPRED',
      description: 'Alertas territoriales oficiales verificadas de SENAPRED',
      importance: 5,
      visibility: 1,
      vibration: true
    });

    // Channel 4: System Status (Diagnostics & Tests)
    await LocalNotifications.createChannel({
      id: 'orbi_system_status',
      name: 'Estado ORBI Clima IA',
      description: 'Notificaciones de diagnóstico del sistema y pruebas rápidas',
      importance: 3,
      visibility: 1,
      vibration: false
    });

    console.log('Orbi Notification Service: Native channels initialized successfully.');
  } catch (error) {
    console.error('Error initializing native notification channels:', error);
  }
}

export async function sendOrbiLocalNotification(
  candidate: OrbiNotificationCandidate,
  bypassScheduler: boolean = false
): Promise<boolean> {
  const perm = await checkOrbiNotificationPermission();
  if (perm !== 'granted') {
    console.warn(`Cannot send notification: Permission state is "${perm}"`);
    return false;
  }

  const isOfficialAuthorityAlert = candidate.source === 'official_senapred';

  // Exact official alerts are one-shot until their normalized authority key
  // changes. The native ledger is shared with WorkManager so a background
  // delivery cannot be repeated when the WebView later becomes active.
  if (isOfficialAuthorityAlert) {
    const alreadySentInWebHistory = loadNotificationHistory().some(item => item.dedupKey === candidate.dedupKey);
    const alreadySentNatively = await isOfficialAlertDeliveredNative(candidate.dedupKey);
    if (alreadySentInWebHistory || alreadySentNatively) {
      console.log(`Official SENAPRED notification dedup: [${candidate.dedupKey}] already delivered.`);
      return false;
    }
  }

  // Módulo 6A: Smart Scheduler Guard
  if (!bypassScheduler) {
    // Model-derived alerts depend on the weather source mode. Official SENAPRED
    // alerts do not: their own verified authority feed is their data source.
    if (!isOfficialAuthorityAlert) {
      const rawState = localStorage.getItem('orbi_weather_source_state');
      const sourceState = rawState ? JSON.parse(rawState) : { mode: 'mock', lastUpdated: new Date().toISOString() };

      if (sourceState.mode === 'mock') {
        appendBlockedLog({
          title: candidate.title,
          body: candidate.body,
          profile: candidate.profile,
          severity: candidate.severity,
          reason: 'Restricción de Modo Demostración (automáticas bloqueadas en modo demo).',
          type: 'demo'
        });
        return false;
      }

      if (sourceState.mode === 'fallback') {
        appendBlockedLog({
          title: candidate.title,
          body: candidate.body,
          profile: candidate.profile,
          severity: candidate.severity,
          reason: 'Restricción de Modo Fallback (automáticas bloqueadas).',
          type: 'fallback'
        });
        return false;
      }

      // Forecast freshness only applies to model-derived alerts.
      const cacheTimestamp = loadLastWeatherBundleTimestamp();
      const isFresh = cacheTimestamp ? isWeatherFresh(cacheTimestamp) : false;
      if (sourceState.mode === 'cached' && !isFresh) {
        appendBlockedLog({
          title: candidate.title,
          body: candidate.body,
          profile: candidate.profile,
          severity: candidate.severity,
          reason: `Datos climáticos antiguos (${cacheTimestamp ? Math.round((Date.now() - cacheTimestamp) / 60000) : '?' } min, máx: 90 min).`,
          type: 'outdated'
        });
        return false;
      }
    }

    // Quiet hours remain a user safety/preference guard for both pipelines.
    const now = new Date();
    const qhSettings = loadQuietHoursSettings();
    const qhDecision = evaluateQuietHoursDecision({ now, severity: candidate.severity, settings: qhSettings });
    if (!qhDecision.allowed) {
      appendBlockedLog({
        title: candidate.title,
        body: candidate.body,
        profile: candidate.profile,
        severity: candidate.severity,
        reason: qhDecision.reason,
        type: 'quiet_hours'
      });

      // Official alerts are not copied into the legacy SkyCore deferred queue,
      // because that queue does not preserve authority/source metadata. A still-
      // active official alert can be retried on the next verified SENAPRED refresh.
      if (!isOfficialAuthorityAlert) {
        const isCriticalBlocked = candidate.severity === 'critical' && !qhSettings.allowCritical;
        const shouldDefer = candidate.severity === 'warning' || candidate.severity === 'watch' || isCriticalBlocked;

        if (shouldDefer) {
          let scheduledForStr = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString();
          try {
            const [eh, em] = qhSettings.endTime.split(':').map(Number);
            if (!isNaN(eh) && !isNaN(em)) {
              const d = new Date();
              d.setHours(eh, em, 0, 0);
              if (d.getTime() <= Date.now()) {
                d.setDate(d.getDate() + 1);
              }
              scheduledForStr = d.toISOString();
            }
          } catch (e) {}

          const deferredAlert: ScheduledAlertItem = {
            id: `deferred_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            candidateId: candidate.id,
            alertId: candidate.alertId,
            title: candidate.title,
            body: candidate.body,
            profile: candidate.profile,
            severity: candidate.severity,
            category: candidate.category || 'general',
            status: 'deferred',
            scheduledFor: scheduledForStr,
            createdAt: new Date().toISOString(),
            reason: qhDecision.reason,
            source: 'skycore_scheduler'
          };
          addDeferredAlert(deferredAlert);
        }
      }

      return false;
    }

    // Generic model-alert caps do not suppress a distinct authority-issued
    // notification. notificationFrequencyService explicitly recognizes source.
    const history = loadNotificationHistory();
    const freqSettings = loadNotificationFrequencySettings();
    const freqDecision = canSendByFrequency({ candidate, history, settings: freqSettings, now });
    if (!freqDecision.allowed) {
      appendBlockedLog({
        title: candidate.title,
        body: candidate.body,
        profile: candidate.profile,
        severity: candidate.severity,
        reason: freqDecision.reason,
        type: 'frequency'
      });
      return false;
    }
  }

  const historyItem: OrbiNotificationHistoryItem = {
    id: `hist_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    title: candidate.title,
    body: candidate.body,
    channel: candidate.channel,
    severity: candidate.severity,
    profile: candidate.profile,
    alertId: candidate.alertId,
    createdAt: candidate.createdAt,
    sentAt: new Date().toISOString(),
    dedupKey: candidate.dedupKey,
    source: candidate.source,
  };

  appendNotificationHistory(historyItem);

  // Trigger web simulation event so preview UI can catch it and display a toast.
  if (typeof window !== 'undefined') {
    const webEvent = new CustomEvent('orbi-web-notification', { detail: historyItem });
    window.dispatchEvent(webEvent);
  }

  if (!Capacitor.isNativePlatform()) {
    console.log('🔔 [Web Preview Local Notification]', {
      channel: candidate.channel,
      source: candidate.source,
      title: candidate.title,
      body: candidate.body,
      severity: candidate.severity,
      profile: candidate.profile
    });
    return true;
  }

  try {
    const channelId = candidate.channel === 'weather_alerts'
      ? 'orbi_weather_alerts'
      : candidate.channel === 'field_alerts'
        ? 'orbi_field_alerts'
        : candidate.channel === 'official_alerts'
          ? 'orbi_official_alerts'
          : 'orbi_system_status';

    const notificationId = isOfficialAuthorityAlert
      ? stableOfficialAndroidNotificationId(candidate.dedupKey)
      : Math.floor(Math.random() * 1000000) + 1;

    await LocalNotifications.schedule({
      notifications: [
        {
          id: notificationId,
          title: candidate.title,
          body: candidate.body,
          channelId,
          schedule: { at: new Date(Date.now() + 500) },
          sound: 'beep.wav',
          actionTypeId: 'OPEN_APP'
        }
      ]
    });

    if (isOfficialAuthorityAlert) {
      await markOfficialAlertDeliveredNative(candidate.dedupKey);
    }

    console.log(`Successfully scheduled native notification on channel "${channelId}":`, candidate.title);
    return true;
  } catch (error) {
    console.error('Error scheduling native local notification:', error);
    return false;
  }
}

export async function sendOrbiTestNotification(
  profile: WeatherProfile = 'person',
  severity: SmartAlertSeverity = 'info'
): Promise<void> {
  const title = profile === 'field_tech'
    ? 'ORBI Técnico Terreno — Prueba de Alerta'
    : 'ORBI Clima IA — Prueba de Notificación';

  const body = severity === 'critical'
    ? '🚨 ALERTA CRÍTICA SIMULADA: Condición climática extrema detectada. Valida protocolos HSE.'
    : 'Prueba de conexión local exitosa. Los canales de alertas ORBI están completamente configurados.';

  const candidate: OrbiNotificationCandidate = {
    id: `test_notif_${Date.now()}`,
    title,
    body,
    channel: severity === 'critical' ? 'field_alerts' : 'system_status',
    severity,
    profile,
    createdAt: new Date().toISOString(),
    dedupKey: `test_${profile}_${severity}_${Date.now()}`,
    source: 'skycore_alert'
  };

  await sendOrbiLocalNotification(candidate, true);
}

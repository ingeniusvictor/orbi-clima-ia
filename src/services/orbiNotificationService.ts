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

export function isWeatherFresh(updatedAt: string | number | undefined, maxAgeMinutes = 90): boolean {
  if (!updatedAt) return false;
  const lastTime = typeof updatedAt === 'number' ? updatedAt : new Date(updatedAt).getTime();
  const diffMs = Date.now() - lastTime;
  const diffMin = diffMs / (1000 * 60);
  return diffMin < maxAgeMinutes;
}

export async function initializeOrbiNotificationChannels(): Promise<void> {
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
      importance: 4, // High importance
      visibility: 1, // Public
      vibration: true
    });

    // Channel 2: Field Alerts (Field Tech Profile)
    await LocalNotifications.createChannel({
      id: 'orbi_field_alerts',
      name: 'Alertas técnico terreno ORBI',
      description: 'Alertas de seguridad y directrices para operaciones en terreno',
      importance: 5, // Max importance
      visibility: 1, // Public
      vibration: true
    });

    // Channel 3: System Status (Diagnostics & Tests)
    await LocalNotifications.createChannel({
      id: 'orbi_system_status',
      name: 'Estado ORBI Clima IA',
      description: 'Notificaciones de diagnóstico del sistema y pruebas rápidas',
      importance: 3, // Default importance
      visibility: 1, // Public
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

  // Módulo 6A: Smart Scheduler Guard
  if (!bypassScheduler) {
    // 1. Validate sourceMode
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

    // 2. Validate weather freshness
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

    // 3. Validate Quiet Hours
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

      // Módulo 6B: If warning, watch, or critical (which has been blocked), add to deferred queue
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

      return false;
    }

    // 4. Validate Frequency / Anti-Spam limits
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

  // Record to history
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
    dedupKey: candidate.dedupKey
  };

  appendNotificationHistory(historyItem);

  // Trigger web simulation event so preview UI can catch it and display a gorgeous toast!
  const webEvent = new CustomEvent('orbi-web-notification', { detail: historyItem });
  window.dispatchEvent(webEvent);

  if (!Capacitor.isNativePlatform()) {
    console.log('🔔 [Web Preview Local Notification]', {
      channel: candidate.channel,
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
      : (candidate.channel === 'field_alerts' ? 'orbi_field_alerts' : 'orbi_system_status');

    // Schedule notification
    await LocalNotifications.schedule({
      notifications: [
        {
          id: Math.floor(Math.random() * 1000000) + 1,
          title: candidate.title,
          body: candidate.body,
          channelId: channelId,
          schedule: { at: new Date(Date.now() + 500) }, // Send almost instantly
          sound: 'beep.wav',
          actionTypeId: 'OPEN_APP'
        }
      ]
    });
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

  await sendOrbiLocalNotification(candidate, true); // Bypass scheduler for manual tests!
}


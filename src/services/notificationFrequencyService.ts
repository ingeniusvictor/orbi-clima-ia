import { NotificationFrequencySettings, OrbiNotificationHistoryItem, OrbiNotificationCandidate, FrequencyDecision } from '../types/weatherTypes';
import { minutesBetween } from '../utils/schedulerTimeUtils';

export const FREQUENCY_STORAGE_KEY = 'orbi_notification_frequency_settings';

export const DEFAULT_NOTIFICATION_FREQUENCY: NotificationFrequencySettings = {
  maxPersonPerDay: 3,
  maxFieldPerDay: 5,
  minMinutesBetweenSimilar: 90,
  minMinutesBetweenAny: 30,
};

export function loadNotificationFrequencySettings(): NotificationFrequencySettings {
  try {
    const saved = localStorage.getItem(FREQUENCY_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error loading frequency settings:', e);
  }
  return { ...DEFAULT_NOTIFICATION_FREQUENCY };
}

export function saveNotificationFrequencySettings(settings: NotificationFrequencySettings): void {
  try {
    localStorage.setItem(FREQUENCY_STORAGE_KEY, JSON.stringify(settings));
    window.dispatchEvent(new Event('orbi-frequency-settings-changed'));
  } catch (e) {
    console.error('Error saving frequency settings:', e);
  }
}

/**
 * Validates if a notification candidate can be sent based on frequency rules.
 */
export function canSendByFrequency({
  candidate,
  history,
  settings,
  now = new Date(),
}: {
  candidate: OrbiNotificationCandidate;
  history: OrbiNotificationHistoryItem[];
  settings: NotificationFrequencySettings;
  now?: Date;
}): FrequencyDecision {
  // Authority-issued SENAPRED alerts are intentionally outside the generic
  // model-alert daily caps and spacing windows. Exact official-alert replay is
  // blocked persistently before delivery by dedupKey. This allows a distinct
  // escalation (for example Amarilla -> Roja) to reach the user immediately.
  if (candidate.source === 'official_senapred') {
    return {
      allowed: true,
      reason: 'Alerta oficial SENAPRED distinta: exenta de límites de frecuencia de alertas modeladas.',
    };
  }

  const isCritical = candidate.severity === 'critical';

  // 1. Daily cap check
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const profileHistoryToday = history.filter(item => {
    if (item.profile !== candidate.profile) return false;
    const sentDate = new Date(item.sentAt);
    return sentDate.getTime() >= startOfToday.getTime();
  });

  const maxPerDay = candidate.profile === 'person' ? settings.maxPersonPerDay : settings.maxFieldPerDay;
  if (profileHistoryToday.length >= maxPerDay) {
    return {
      allowed: false,
      reason: `Límite diario de notificaciones alcanzado (${profileHistoryToday.length}/${maxPerDay} para perfil ${candidate.profile}).`,
    };
  }

  // Filter history of this profile for time-based checks
  const profileHistory = history.filter(item => item.profile === candidate.profile);
  if (profileHistory.length === 0) {
    return { allowed: true, reason: 'Permitida: primera notificación para este perfil.' };
  }

  // Sort history newest first
  const sortedHistory = [...profileHistory].sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
  const lastSentItem = sortedHistory[0];
  const lastSentTime = new Date(lastSentItem.sentAt);
  const minSinceLast = minutesBetween(now, lastSentTime);

  // 2. Minimum minutes between ANY notification (default 30 mins)
  if (minSinceLast < settings.minMinutesBetweenAny) {
    if (isCritical) {
      // Check if last sent was the exact same critical alert
      const isSameCritical = lastSentItem.severity === 'critical' &&
        (lastSentItem.title === candidate.title || lastSentItem.body === candidate.body);

      if (!isSameCritical) {
        // A distinct critical model alert may bypass the interval cap.
      } else {
        return {
          allowed: false,
          reason: `Alerta crítica idéntica bloqueada por anti-spam (enviada hace ${Math.round(minSinceLast)} min).`,
        };
      }
    } else {
      return {
        allowed: false,
        reason: `Intervalo mínimo entre notificaciones no cumplido (${Math.round(minSinceLast)}/${settings.minMinutesBetweenAny} min).`,
      };
    }
  }

  // 3. Minimum minutes between SIMILAR notifications (default 90 mins)
  const similarItems = sortedHistory.filter(item => {
    const isSimilarCategory = item.channel && candidate.channel && item.channel === candidate.channel;
    const isSimilarTitle = item.title === candidate.title || item.title.includes(candidate.title) || candidate.title.includes(item.title);
    return isSimilarCategory || isSimilarTitle;
  });

  if (similarItems.length > 0) {
    const mostRecentSimilar = similarItems[0];
    const minutesSinceSimilar = minutesBetween(now, new Date(mostRecentSimilar.sentAt));
    if (minutesSinceSimilar < settings.minMinutesBetweenSimilar) {
      if (isCritical) {
        // If candidate is critical, check if the similar one was also critical.
        // If the similar one was not critical, let the critical override it.
        if (mostRecentSimilar.severity !== 'critical') {
          // Allowed: Critical overriding warning/info of same category
        } else {
          return {
            allowed: false,
            reason: `Alerta similar crítica ya enviada hace ${Math.round(minutesSinceSimilar)} min (mínimo ${settings.minMinutesBetweenSimilar} min).`,
          };
        }
      } else {
        return {
          allowed: false,
          reason: `Alerta similar de tipo "${candidate.category || 'general'}" enviada hace ${Math.round(minutesSinceSimilar)} min (mínimo ${settings.minMinutesBetweenSimilar} min).`,
        };
      }
    }
  }

  return {
    allowed: true,
    reason: 'Permitida por reglas de frecuencia y espaciado anti-spam.',
  };
}

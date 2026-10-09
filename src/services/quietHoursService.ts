import { QuietHoursSettings, QuietHoursMode, SmartAlertSeverity } from '../types/weatherTypes';
import { isTimeBetween } from '../utils/schedulerTimeUtils';

export const QUIET_HOURS_STORAGE_KEY = 'orbi_quiet_hours_settings';

export const DEFAULT_QUIET_HOURS: QuietHoursSettings = {
  enabled: true,
  mode: 'critical_only',
  startTime: '22:00',
  endTime: '07:00',
  allowCritical: true,
};

export function loadQuietHoursSettings(): QuietHoursSettings {
  try {
    const saved = localStorage.getItem(QUIET_HOURS_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error loading quiet hours settings:', e);
  }
  return { ...DEFAULT_QUIET_HOURS };
}

export function saveQuietHoursSettings(settings: QuietHoursSettings): void {
  try {
    localStorage.setItem(QUIET_HOURS_STORAGE_KEY, JSON.stringify(settings));
    window.dispatchEvent(new Event('orbi-quiet-hours-changed'));
  } catch (e) {
    console.error('Error saving quiet hours settings:', e);
  }
}

/**
 * Checks if a given time is within quiet hours.
 */
export function isWithinQuietHours(now: Date, settings: QuietHoursSettings): boolean {
  if (!settings.enabled) return false;
  return isTimeBetween(now, settings.startTime, settings.endTime);
}

/**
 * Checks if a notification should be blocked due to quiet hours.
 * Returns a reason string if blocked, or null if allowed.
 */
export function shouldBlockForQuietHours({
  now,
  severity,
  settings,
}: {
  now: Date;
  severity: SmartAlertSeverity;
  settings: QuietHoursSettings;
}): string | null {
  if (!settings.enabled || settings.mode === 'disabled') {
    return null;
  }

  const insideQuietHours = isWithinQuietHours(now, settings);
  if (!insideQuietHours) {
    return null; // Not in quiet hours, so not blocked
  }

  // Inside quiet hours!
  if (settings.mode === 'enabled') {
    return `Horario silencioso activo (${settings.startTime} - ${settings.endTime})`;
  }

  if (settings.mode === 'critical_only') {
    if (severity === 'critical') {
      if (settings.allowCritical) {
        return null; // Allowed critical
      } else {
        return `Horario silencioso activo (críticas bloqueadas por configuración)`;
      }
    } else {
      return `Alerta de severidad "${severity}" bloqueada durante horario silencioso (sólo críticas permitidas)`;
    }
  }

  return null;
}

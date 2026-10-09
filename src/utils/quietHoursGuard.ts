import { QuietHoursSettings, SmartAlertSeverity, QuietHoursDecision } from '../types/weatherTypes';
import { isWithinQuietHours, shouldBlockForQuietHours } from '../services/quietHoursService';

/**
 * Evaluates whether a notification is allowed during the current quiet hours state.
 */
export function evaluateQuietHoursDecision({
  now,
  severity,
  settings,
}: {
  now: Date;
  severity: SmartAlertSeverity;
  settings: QuietHoursSettings;
}): QuietHoursDecision {
  if (!settings.enabled || settings.mode === 'disabled') {
    return {
      allowed: true,
      shouldDefer: false,
      reason: 'Permitida fuera de horario silencioso (servicio inactivo).',
    };
  }

  const insideQuietHours = isWithinQuietHours(now, settings);
  if (!insideQuietHours) {
    return {
      allowed: true,
      shouldDefer: false,
      reason: 'Permitida fuera de horario silencioso.',
    };
  }

  // Inside quiet hours
  const blockReason = shouldBlockForQuietHours({ now, severity, settings });
  if (blockReason) {
    return {
      allowed: false,
      shouldDefer: true,
      reason: 'Diferida por horario silencioso.',
    };
  }

  // If inside quiet hours but allowed
  if (severity === 'critical' && settings.allowCritical) {
    return {
      allowed: true,
      shouldDefer: false,
      reason: 'Crítica permitida durante horario silencioso.',
    };
  }

  return {
    allowed: true,
    shouldDefer: false,
    reason: 'Permitida por configuración de horario silencioso.',
  };
}

import { ScheduledAlertItem, QuietHoursSettings } from '../types/weatherTypes';

export function formatSchedulerDecision(reason: string): string {
  if (!reason) return 'Sin restricciones';
  return reason;
}

export function formatNextScheduledAlert(item?: ScheduledAlertItem): string {
  if (!item) return 'No hay alertas programadas. SkyCore seguirá observando condiciones relevantes.';
  const timeStr = new Date(item.scheduledFor).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return `Próxima alerta programada: ${item.title} a las ${timeStr}`;
}

export function formatQuietHoursLabel(settings: QuietHoursSettings): string {
  if (!settings.enabled) return 'Horario silencioso inactivo';
  return `Horario silencioso activo desde las ${settings.startTime} hasta las ${settings.endTime}.`;
}

export function formatDeferredAlertReason(item: ScheduledAlertItem): string {
  if (item.reason) return item.reason;
  return 'Alerta diferida por horario silencioso u otra restricción de programación.';
}

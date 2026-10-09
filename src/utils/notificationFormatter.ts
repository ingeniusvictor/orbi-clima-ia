import { SmartWeatherAlert } from '../types/weatherTypes';

export function buildNotificationTitle(alert: SmartWeatherAlert): string {
  const prefix = alert.profile === 'field_tech' 
    ? 'ORBI Técnico Terreno' 
    : 'ORBI Clima IA';

  // Customize based on alert category & title
  return `${prefix} — ${alert.title}`;
}

export function buildNotificationBody(alert: SmartWeatherAlert): string {
  // Let's combine timeLabel, message, and recommendation in a concise format
  const message = alert.message;
  const recommendation = alert.recommendation;
  const time = alert.timeLabel ? `(${alert.timeLabel}) ` : '';

  // Ensure it's snappy and within notification size guidelines
  return `${time}${message}. Rec: ${recommendation}`;
}

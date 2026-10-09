import { SmartAlertSeverity, SmartAlertCategory, SmartWeatherAlert } from '../types/weatherTypes';

export function getAlertSeverityLabel(severity: SmartAlertSeverity): string {
  switch (severity) {
    case 'critical':
      return 'Crítico';
    case 'warning':
      return 'Precaución';
    case 'watch':
      return 'Observación';
    case 'info':
      return 'Info';
    default:
      return 'Info';
  }
}

export function getAlertSeverityColorToken(severity: SmartAlertSeverity): string {
  switch (severity) {
    case 'critical':
      return 'red';
    case 'warning':
      return 'orange';
    case 'watch':
      return 'amber';
    case 'info':
      return 'cyan';
    default:
      return 'cyan';
  }
}

export function getAlertCategoryIcon(category: SmartAlertCategory): string {
  switch (category) {
    case 'rain':
      return 'Umbrella';
    case 'wind':
    case 'gusts':
      return 'Wind';
    case 'uv':
      return 'Sun';
    case 'cold':
      return 'ThermometerSnowflake';
    case 'heat':
      return 'Flame';
    case 'humidity':
      return 'Droplets';
    case 'storm':
      return 'CloudLightning';
    case 'field_work':
      return 'HardHat';
    case 'electrical_work':
      return 'Zap';
    case 'solar_pv':
      return 'Cpu';
    default:
      return 'AlertCircle';
  }
}

export function formatAlertTimeWindow(alert: SmartWeatherAlert): string {
  if (alert.startsAt && alert.endsAt) {
    return `${alert.startsAt}–${alert.endsAt}`;
  }
  return alert.timeLabel || 'Hoy';
}

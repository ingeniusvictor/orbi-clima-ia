import { WeatherCondition } from '../types/weatherTypes';

export type OrbiPrecipitationKind =
  | 'none'
  | 'drizzle'
  | 'freezing_drizzle'
  | 'rain'
  | 'freezing_rain'
  | 'showers'
  | 'snow'
  | 'storm'
  | 'unknown';

export type OrbiPrecipitationIntensity = 'none' | 'trace' | 'light' | 'moderate' | 'heavy' | 'violent';

export function getWmoPrecipitationKind(code?: number): OrbiPrecipitationKind {
  if (code === undefined) return 'unknown';
  if ([51, 53, 55].includes(code)) return 'drizzle';
  if ([56, 57].includes(code)) return 'freezing_drizzle';
  if ([61, 63, 65].includes(code)) return 'rain';
  if ([66, 67].includes(code)) return 'freezing_rain';
  if ([80, 81, 82].includes(code)) return 'showers';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'snow';
  if ([95, 96, 99].includes(code)) return 'storm';
  if ([0, 1, 2, 3, 45, 48].includes(code)) return 'none';
  return 'unknown';
}

export function getWmoPrecipitationIntensity(code?: number, precipitationMm = 0): OrbiPrecipitationIntensity {
  if (!Number.isFinite(precipitationMm) || precipitationMm <= 0) return 'none';

  // WMO code keeps the phenomenon semantics while measured/modelled hourly
  // accumulation refines the impact severity.
  if (code === 82 || code === 99) return 'violent';
  if ([55, 57, 65, 67, 75, 86, 96].includes(code ?? -1) || precipitationMm >= 8) return 'heavy';
  if ([53, 63, 73, 81].includes(code ?? -1) || precipitationMm >= 2) return 'moderate';
  if (precipitationMm < 0.2) return 'trace';
  return 'light';
}

export function mapWmoCodeToOrbiCondition(code?: number, isDay?: boolean, precipitationMm?: number): WeatherCondition {
  if (code === undefined) return 'cloudy';

  // If the code is a rain/storm code but there is no actual current
  // precipitation, keep the visual conservative. The exact WMO phenomenon is
  // still preserved separately by the adapter for risk/narrative decisions.
  const isRainCode = [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code);
  if (isRainCode && (precipitationMm === undefined || precipitationMm <= 0)) {
    return 'cloudy';
  }

  switch (code) {
    case 0:
      return isDay !== false ? 'sunny' : 'night';
    case 1:
    case 2:
      return 'partly_cloudy';
    case 3:
    case 45:
    case 48:
      return 'cloudy';
    case 51:
    case 53:
    case 55:
    case 56:
    case 57:
    case 61:
    case 63:
    case 65:
    case 66:
    case 67:
    case 80:
    case 81:
    case 82:
      return 'rain';
    case 71:
    case 73:
    case 75:
    case 77:
    case 85:
    case 86:
      return 'cold';
    case 95:
    case 96:
    case 99:
      return 'storm';
    default:
      return 'cloudy';
  }
}

export function getWmoHumanLabel(code?: number): string {
  if (code === undefined) return 'Nublado';
  switch (code) {
    case 0: return 'Despejado';
    case 1: return 'Mayormente despejado';
    case 2: return 'Parcialmente nublado';
    case 3: return 'Cubierto';
    case 45: return 'Niebla';
    case 48: return 'Niebla con escarcha';
    case 51: return 'Llovizna ligera';
    case 53: return 'Llovizna moderada';
    case 55: return 'Llovizna densa';
    case 56: return 'Llovizna gélida ligera';
    case 57: return 'Llovizna gélida intensa';
    case 61: return 'Lluvia ligera';
    case 63: return 'Lluvia moderada';
    case 65: return 'Lluvia intensa';
    case 66: return 'Lluvia gélida ligera';
    case 67: return 'Lluvia gélida intensa';
    case 71: return 'Nevada ligera';
    case 73: return 'Nevada moderada';
    case 75: return 'Nevada intensa';
    case 77: return 'Granizo menudo';
    case 80: return 'Chubascos ligeros';
    case 81: return 'Chubascos moderados';
    case 82: return 'Chubascos violentos';
    case 85: return 'Chubascos de nieve ligeros';
    case 86: return 'Chubascos de nieve intensos';
    case 95: return 'Tormenta';
    case 96: return 'Tormenta con granizo ligero';
    case 99: return 'Tormenta con granizo fuerte';
    default: return 'Nublado';
  }
}

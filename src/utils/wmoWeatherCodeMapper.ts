import { WeatherCondition, WeatherPhenomenon, PrecipitationIntensity } from '../types/weatherTypes';

export interface WeatherPhenomenonDescriptor {
  code?: number;
  phenomenon: WeatherPhenomenon;
  intensity: PrecipitationIntensity;
  label: string;
  isPrecipitating: boolean;
  isConvective: boolean;
  isFreezing: boolean;
}

const LABELS: Record<number, string> = {
  0: 'Despejado',
  1: 'Mayormente despejado',
  2: 'Parcialmente nublado',
  3: 'Cubierto',
  45: 'Niebla',
  48: 'Niebla con escarcha',
  51: 'Llovizna ligera',
  53: 'Llovizna moderada',
  55: 'Llovizna densa',
  56: 'Llovizna gélida ligera',
  57: 'Llovizna gélida intensa',
  61: 'Lluvia ligera',
  63: 'Lluvia moderada',
  65: 'Lluvia intensa',
  66: 'Lluvia gélida ligera',
  67: 'Lluvia gélida intensa',
  71: 'Nevada ligera',
  73: 'Nevada moderada',
  75: 'Nevada intensa',
  77: 'Granos de nieve',
  80: 'Chubascos ligeros',
  81: 'Chubascos moderados',
  82: 'Chubascos violentos',
  85: 'Chubascos de nieve ligeros',
  86: 'Chubascos de nieve intensos',
  95: 'Tormenta',
  96: 'Tormenta con granizo ligero',
  99: 'Tormenta con granizo fuerte',
};

export function describeWmoWeatherCode(code?: number): WeatherPhenomenonDescriptor {
  const label = code === undefined ? 'Condición no disponible' : (LABELS[code] ?? 'Condición variable');

  if (code === undefined) {
    return { code, phenomenon: 'unknown', intensity: 'none', label, isPrecipitating: false, isConvective: false, isFreezing: false };
  }

  if (code === 0) return { code, phenomenon: 'clear', intensity: 'none', label, isPrecipitating: false, isConvective: false, isFreezing: false };
  if ([1, 2, 3].includes(code)) return { code, phenomenon: 'cloud', intensity: 'none', label, isPrecipitating: false, isConvective: false, isFreezing: false };
  if ([45, 48].includes(code)) return { code, phenomenon: 'fog', intensity: 'none', label, isPrecipitating: false, isConvective: false, isFreezing: code === 48 };

  if ([51, 53, 55].includes(code)) {
    const intensity: PrecipitationIntensity = code === 51 ? 'light' : code === 53 ? 'moderate' : 'heavy';
    return { code, phenomenon: 'drizzle', intensity, label, isPrecipitating: true, isConvective: false, isFreezing: false };
  }
  if ([56, 57].includes(code)) {
    return { code, phenomenon: 'freezing_drizzle', intensity: code === 56 ? 'light' : 'heavy', label, isPrecipitating: true, isConvective: false, isFreezing: true };
  }
  if ([61, 63, 65].includes(code)) {
    const intensity: PrecipitationIntensity = code === 61 ? 'light' : code === 63 ? 'moderate' : 'heavy';
    return { code, phenomenon: 'rain', intensity, label, isPrecipitating: true, isConvective: false, isFreezing: false };
  }
  if ([66, 67].includes(code)) {
    return { code, phenomenon: 'freezing_rain', intensity: code === 66 ? 'light' : 'heavy', label, isPrecipitating: true, isConvective: false, isFreezing: true };
  }
  if ([71, 73, 75, 77].includes(code)) {
    const intensity: PrecipitationIntensity = code === 71 ? 'light' : code === 73 || code === 77 ? 'moderate' : 'heavy';
    return { code, phenomenon: 'snow', intensity, label, isPrecipitating: true, isConvective: false, isFreezing: true };
  }
  if ([80, 81, 82].includes(code)) {
    const intensity: PrecipitationIntensity = code === 80 ? 'light' : code === 81 ? 'moderate' : 'violent';
    return { code, phenomenon: 'showers', intensity, label, isPrecipitating: true, isConvective: true, isFreezing: false };
  }
  if ([85, 86].includes(code)) {
    return { code, phenomenon: 'snow_showers', intensity: code === 85 ? 'light' : 'heavy', label, isPrecipitating: true, isConvective: true, isFreezing: true };
  }
  if ([95, 96, 99].includes(code)) {
    return { code, phenomenon: code === 95 ? 'thunderstorm' : 'thunderstorm_hail', intensity: code === 99 ? 'violent' : 'heavy', label, isPrecipitating: true, isConvective: true, isFreezing: false };
  }

  return { code, phenomenon: 'unknown', intensity: 'none', label, isPrecipitating: false, isConvective: false, isFreezing: false };
}

/**
 * Maps the richer WMO phenomenon into the smaller visual theme vocabulary used by the Golden Orb.
 * Semantic weather text must use `describeWmoWeatherCode()` instead of this coarse visual category.
 */
export function mapWmoCodeToOrbiCondition(code?: number, isDay?: boolean, _precipitationMm?: number): WeatherCondition {
  const descriptor = describeWmoWeatherCode(code);

  switch (descriptor.phenomenon) {
    case 'clear':
      return isDay !== false ? 'sunny' : 'night';
    case 'cloud':
      return code === 1 || code === 2 ? 'partly_cloudy' : 'cloudy';
    case 'fog':
      return 'cloudy';
    case 'drizzle':
    case 'freezing_drizzle':
    case 'rain':
    case 'freezing_rain':
    case 'showers':
      return 'rain';
    case 'snow':
    case 'snow_showers':
      return 'cold';
    case 'thunderstorm':
    case 'thunderstorm_hail':
      return 'storm';
    default:
      return 'cloudy';
  }
}

export function getWmoHumanLabel(code?: number): string {
  return describeWmoWeatherCode(code).label;
}

export function precipitationIntensityRank(intensity?: PrecipitationIntensity): number {
  switch (intensity) {
    case 'trace': return 1;
    case 'light': return 2;
    case 'moderate': return 3;
    case 'heavy': return 4;
    case 'violent': return 5;
    default: return 0;
  }
}

export function inferIntensityFromRate(rateMmH?: number): PrecipitationIntensity {
  const rate = Math.max(0, Number(rateMmH || 0));
  if (rate === 0) return 'none';
  if (rate < 0.2) return 'trace';
  if (rate < 2.5) return 'light';
  if (rate < 7.5) return 'moderate';
  if (rate < 30) return 'heavy';
  return 'violent';
}

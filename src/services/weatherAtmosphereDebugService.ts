import type { CurrentWeather, WeatherCondition } from '../types/weatherTypes';

export const ATMOSPHERE_DEBUG_KEY = 'orbi_living_atmosphere_debug_scene_v1';
export const ATMOSPHERE_DEBUG_EVENT = 'orbi-atmosphere-debug-changed';

export type AtmosphereDebugPreset = 'live' | WeatherCondition;

export const ATMOSPHERE_DEBUG_PRESETS: Array<{
  id: AtmosphereDebugPreset;
  label: string;
  description: string;
}> = [
  { id: 'live', label: 'LIVE', description: 'Clima real' },
  { id: 'sunny', label: 'Soleado', description: 'Cielo abierto + rayos' },
  { id: 'partly_cloudy', label: 'Parcial', description: 'Capas de nubes + luz' },
  { id: 'cloudy', label: 'Nublado', description: 'Nubes densas + bruma' },
  { id: 'rain', label: 'Lluvia', description: 'Lluvia + niebla fría' },
  { id: 'storm', label: 'Tormenta', description: 'Nubes oscuras + relámpago' },
  { id: 'wind', label: 'Viento', description: 'Corrientes de aire' },
  { id: 'cold', label: 'Frío', description: 'Atmósfera fría + partículas' },
  { id: 'hot', label: 'Calor', description: 'Luz intensa + ondas térmicas' },
  { id: 'night', label: 'Noche', description: 'Luna + estrellas' },
];

function isPreset(value: string | null): value is AtmosphereDebugPreset {
  return ATMOSPHERE_DEBUG_PRESETS.some((preset) => preset.id === value);
}

export function getAtmosphereDebugPreset(): AtmosphereDebugPreset {
  try {
    const stored = localStorage.getItem(ATMOSPHERE_DEBUG_KEY);
    return isPreset(stored) ? stored : 'live';
  } catch {
    return 'live';
  }
}

export function setAtmosphereDebugPreset(preset: AtmosphereDebugPreset): void {
  try {
    if (preset === 'live') {
      localStorage.removeItem(ATMOSPHERE_DEBUG_KEY);
    } else {
      localStorage.setItem(ATMOSPHERE_DEBUG_KEY, preset);
    }
    window.dispatchEvent(new Event(ATMOSPHERE_DEBUG_EVENT));
  } catch (error) {
    console.warn('Could not persist atmosphere debug preset:', error);
  }
}

export function applyAtmosphereDebugPreset(
  current: CurrentWeather,
  preset: AtmosphereDebugPreset,
): CurrentWeather {
  if (preset === 'live') return current;

  const base: CurrentWeather = {
    ...current,
    condition: preset,
    updatedAt: new Date().toISOString(),
  };

  switch (preset) {
    case 'sunny':
      return { ...base, temperatureC: 24, feelsLikeC: 24, humidity: 42, cloudCover: 3, precipitationMm: 0, windSpeedKmh: 7, windGustKmh: 12, uvIndex: 7 };
    case 'partly_cloudy':
      return { ...base, temperatureC: 21, feelsLikeC: 21, humidity: 58, cloudCover: 48, precipitationMm: 0, windSpeedKmh: 11, windGustKmh: 18, uvIndex: 4 };
    case 'cloudy':
      return { ...base, temperatureC: 18, feelsLikeC: 18, humidity: 84, cloudCover: 94, precipitationMm: 0, windSpeedKmh: 9, windGustKmh: 15, uvIndex: 2 };
    case 'rain':
      return { ...base, temperatureC: 13, feelsLikeC: 12, humidity: 95, cloudCover: 100, precipitationMm: 2.8, windSpeedKmh: 21, windGustKmh: 38, uvIndex: 1 };
    case 'storm':
      return { ...base, temperatureC: 12, feelsLikeC: 10, humidity: 97, cloudCover: 100, precipitationMm: 5.4, windSpeedKmh: 46, windGustKmh: 72, uvIndex: 0 };
    case 'wind':
      return { ...base, temperatureC: 17, feelsLikeC: 15, humidity: 57, cloudCover: 38, precipitationMm: 0, windSpeedKmh: 48, windGustKmh: 68, uvIndex: 3 };
    case 'cold':
      return { ...base, temperatureC: 3, feelsLikeC: -1, humidity: 82, cloudCover: 44, precipitationMm: 0, windSpeedKmh: 14, windGustKmh: 24, uvIndex: 1 };
    case 'hot':
      return { ...base, temperatureC: 35, feelsLikeC: 38, humidity: 28, cloudCover: 4, precipitationMm: 0, windSpeedKmh: 6, windGustKmh: 10, uvIndex: 10 };
    case 'night':
      return { ...base, temperatureC: 9, feelsLikeC: 8, humidity: 54, cloudCover: 5, precipitationMm: 0, windSpeedKmh: 5, windGustKmh: 9, uvIndex: 0 };
    default:
      return current;
  }
}

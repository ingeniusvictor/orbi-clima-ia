import { CurrentWeather, DailyForecast, WeatherCondition } from '../types/weatherTypes';

export type AtmosphereQuality = 'ultra' | 'high' | 'balanced' | 'low' | 'static';
export type AtmospherePhase = 'dawn' | 'day' | 'dusk' | 'night';
export type AtmosphereScene =
  | 'setup'
  | 'clear'
  | 'partly-cloudy'
  | 'cloudy'
  | 'rain'
  | 'storm'
  | 'wind'
  | 'cold'
  | 'hot';

export interface AtmosphereModel {
  scene: AtmosphereScene;
  phase: AtmospherePhase;
  quality: AtmosphereQuality;
  cloudOpacity: number;
  cloudSpeed: number;
  precipitationStrength: number;
  mistStrength: number;
  windStrength: number;
  luminance: number;
  accentTemperature: 'cool' | 'neutral' | 'warm';
}

interface NavigatorHints extends Navigator {
  deviceMemory?: number;
  connection?: {
    saveData?: boolean;
    effectiveType?: string;
  };
}

function parseClock(value?: string): number | null {
  if (!value) return null;
  const match = value.match(/(?:^|T|\s)(\d{1,2}):(\d{2})/);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

function getLocalMinutes(timezone?: string): number {
  try {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: timezone || undefined,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).formatToParts(new Date());
    const hour = Number(parts.find((part) => part.type === 'hour')?.value ?? '12');
    const minute = Number(parts.find((part) => part.type === 'minute')?.value ?? '0');
    return hour * 60 + minute;
  } catch {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  }
}

export function resolveAtmospherePhase(
  timezone?: string,
  daily?: DailyForecast,
): AtmospherePhase {
  const now = getLocalMinutes(timezone);
  const sunrise = parseClock(daily?.sunrise) ?? 7 * 60;
  const sunset = parseClock(daily?.sunset) ?? 19 * 60;

  if (now >= sunrise - 45 && now < sunrise + 55) return 'dawn';
  if (now >= sunset - 55 && now < sunset + 45) return 'dusk';
  if (now >= sunrise + 55 && now < sunset - 55) return 'day';
  return 'night';
}

export function resolveAtmosphereScene(condition: WeatherCondition | 'setup'): AtmosphereScene {
  switch (condition) {
    case 'sunny':
    case 'night':
      return 'clear';
    case 'partly_cloudy':
      return 'partly-cloudy';
    case 'cloudy':
      return 'cloudy';
    case 'rain':
      return 'rain';
    case 'storm':
      return 'storm';
    case 'wind':
      return 'wind';
    case 'cold':
      return 'cold';
    case 'hot':
      return 'hot';
    default:
      return 'setup';
  }
}

export function resolveAtmosphereQuality(): AtmosphereQuality {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return 'balanced';

  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  if (reduceMotion) return 'static';

  const nav = navigator as NavigatorHints;
  if (nav.connection?.saveData) return 'low';

  const memory = nav.deviceMemory ?? 4;
  const cores = navigator.hardwareConcurrency ?? 4;
  const pixelLoad = Math.max(1, window.devicePixelRatio || 1) * window.innerWidth * window.innerHeight;

  if (memory >= 8 && cores >= 8 && pixelLoad < 6_500_000) return 'ultra';
  if (memory >= 6 && cores >= 6) return 'high';
  if (memory >= 4 && cores >= 4) return 'balanced';
  return 'low';
}

export function buildWeatherAtmosphereModel(params: {
  current: CurrentWeather;
  daily?: DailyForecast;
  timezone?: string;
  quality?: AtmosphereQuality;
}): AtmosphereModel {
  const { current, daily, timezone } = params;
  const scene = resolveAtmosphereScene(current.condition as WeatherCondition | 'setup');
  const phase = current.condition === 'night'
    ? 'night'
    : resolveAtmospherePhase(timezone, daily);
  const quality = params.quality ?? resolveAtmosphereQuality();

  const cloudFraction = Math.min(1, Math.max(0, current.cloudCover / 100));
  const rainStrength = Math.min(1, Math.max(0, current.precipitationMm / 5));
  const windStrength = Math.min(1, Math.max(0, current.windSpeedKmh / 55));
  const humidityMist = Math.min(1, Math.max(0, (current.humidity - 58) / 42));

  const sceneCloudBias: Record<AtmosphereScene, number> = {
    setup: 0.28,
    clear: 0.08,
    'partly-cloudy': 0.48,
    cloudy: 0.82,
    rain: 0.9,
    storm: 1,
    wind: 0.38,
    cold: 0.44,
    hot: 0.12,
  };

  const cloudOpacity = Math.min(1, Math.max(sceneCloudBias[scene], cloudFraction));
  const precipitationStrength = scene === 'storm'
    ? Math.max(0.65, rainStrength)
    : scene === 'rain'
      ? Math.max(0.35, rainStrength)
      : rainStrength * 0.2;

  const mistStrength = scene === 'rain' || scene === 'storm' || scene === 'cloudy'
    ? Math.max(0.2, humidityMist)
    : humidityMist * 0.45;

  const luminanceBase = phase === 'night' ? 0.18 : phase === 'dawn' || phase === 'dusk' ? 0.55 : 0.82;
  const luminance = Math.max(0.12, luminanceBase - cloudOpacity * 0.24 - precipitationStrength * 0.12);

  const severeCoolScene = scene === 'cold' || scene === 'rain' || scene === 'storm';
  const accentTemperature: AtmosphereModel['accentTemperature'] =
    severeCoolScene || phase === 'night'
      ? 'cool'
      : scene === 'hot' || phase === 'dawn' || phase === 'dusk'
        ? 'warm'
        : 'neutral';

  return {
    scene,
    phase,
    quality,
    cloudOpacity,
    cloudSpeed: 44 - windStrength * 25,
    precipitationStrength,
    mistStrength,
    windStrength,
    luminance,
    accentTemperature,
  };
}

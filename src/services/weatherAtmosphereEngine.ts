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

export interface SolarLightingState {
  localMinutes: number;
  sunriseMinutes: number;
  sunsetMinutes: number;
  daylightProgress: number;
  sunAltitude: number;
  sunPositionX: number;
  sunPositionY: number;
  twilightWarmth: number;
  nightStrength: number;
}

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
  solar: SolarLightingState;
}

interface NavigatorHints extends Navigator {
  deviceMemory?: number;
  connection?: {
    saveData?: boolean;
    effectiveType?: string;
  };
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

function parseClock(value?: string): number | null {
  if (!value) return null;
  const match = value.match(/(?:^|T|\s)(\d{1,2}):(\d{2})/);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

function getLocalMinutes(timezone?: string, now: Date = new Date()): number {
  try {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: timezone || undefined,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).formatToParts(now);
    const hour = Number(parts.find((part) => part.type === 'hour')?.value ?? '12');
    const minute = Number(parts.find((part) => part.type === 'minute')?.value ?? '0');
    return hour * 60 + minute;
  } catch {
    return now.getHours() * 60 + now.getMinutes();
  }
}

export function resolveSolarLightingState(
  timezone?: string,
  daily?: DailyForecast,
  now: Date = new Date(),
  phaseOverride?: AtmospherePhase,
): SolarLightingState {
  const localMinutes = getLocalMinutes(timezone, now);
  const sunriseMinutes = parseClock(daily?.sunrise) ?? 7 * 60;
  const sunsetMinutes = parseClock(daily?.sunset) ?? 19 * 60;
  const dayLength = Math.max(180, sunsetMinutes - sunriseMinutes);

  if (phaseOverride) {
    const synthetic: Record<AtmospherePhase, Omit<SolarLightingState, 'localMinutes' | 'sunriseMinutes' | 'sunsetMinutes'>> = {
      dawn: {
        daylightProgress: 0.08,
        sunAltitude: 0.08,
        sunPositionX: 0.18,
        sunPositionY: 0.69,
        twilightWarmth: 0.96,
        nightStrength: 0.16,
      },
      day: {
        daylightProgress: 0.5,
        sunAltitude: 0.96,
        sunPositionX: 0.54,
        sunPositionY: 0.18,
        twilightWarmth: 0.06,
        nightStrength: 0,
      },
      dusk: {
        daylightProgress: 0.92,
        sunAltitude: 0.07,
        sunPositionX: 0.82,
        sunPositionY: 0.7,
        twilightWarmth: 1,
        nightStrength: 0.18,
      },
      night: {
        daylightProgress: 0.5,
        sunAltitude: -0.55,
        sunPositionX: 0.72,
        sunPositionY: 0.18,
        twilightWarmth: 0.02,
        nightStrength: 1,
      },
    };

    return {
      localMinutes,
      sunriseMinutes,
      sunsetMinutes,
      ...synthetic[phaseOverride],
    };
  }

  const daylightProgress = clamp01((localMinutes - sunriseMinutes) / dayLength);
  const inDaylight = localMinutes >= sunriseMinutes && localMinutes <= sunsetMinutes;
  const sunAltitude = inDaylight ? Math.sin(daylightProgress * Math.PI) : -0.42;
  const sunPositionX = 0.12 + daylightProgress * 0.76;
  const sunPositionY = 0.72 - Math.max(0, sunAltitude) * 0.56;

  const dawnDistance = Math.abs(localMinutes - sunriseMinutes);
  const duskDistance = Math.abs(localMinutes - sunsetMinutes);
  const twilightWarmth = clamp01(Math.max(1 - dawnDistance / 95, 1 - duskDistance / 95));

  let nightStrength = 0;
  if (localMinutes < sunriseMinutes) nightStrength = clamp01((sunriseMinutes - localMinutes) / 85);
  if (localMinutes > sunsetMinutes) nightStrength = clamp01((localMinutes - sunsetMinutes) / 85);

  return {
    localMinutes,
    sunriseMinutes,
    sunsetMinutes,
    daylightProgress,
    sunAltitude,
    sunPositionX,
    sunPositionY,
    twilightWarmth,
    nightStrength,
  };
}

export function resolveAtmospherePhase(
  timezone?: string,
  daily?: DailyForecast,
  now?: Date,
): AtmospherePhase {
  const localMinutes = getLocalMinutes(timezone, now);
  const sunrise = parseClock(daily?.sunrise) ?? 7 * 60;
  const sunset = parseClock(daily?.sunset) ?? 19 * 60;

  if (localMinutes >= sunrise - 45 && localMinutes < sunrise + 55) return 'dawn';
  if (localMinutes >= sunset - 55 && localMinutes < sunset + 45) return 'dusk';
  if (localMinutes >= sunrise + 55 && localMinutes < sunset - 55) return 'day';
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
  now?: Date;
  phaseOverride?: AtmospherePhase;
}): AtmosphereModel {
  const { current, daily, timezone, now, phaseOverride } = params;
  const scene = resolveAtmosphereScene(current.condition as WeatherCondition | 'setup');
  const phase = phaseOverride ?? (current.condition === 'night'
    ? 'night'
    : resolveAtmospherePhase(timezone, daily, now));
  const quality = params.quality ?? resolveAtmosphereQuality();
  const solar = resolveSolarLightingState(timezone, daily, now ?? new Date(), phaseOverride ?? (current.condition === 'night' ? 'night' : undefined));

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

  const solarLuminance = Math.max(0.14, (1 - solar.nightStrength) * (0.44 + Math.max(0, solar.sunAltitude) * 0.5));
  const phaseFloor = phase === 'night' ? 0.17 : phase === 'dawn' || phase === 'dusk' ? 0.48 : 0.74;
  const luminanceBase = Math.max(phaseFloor, solarLuminance);
  const luminance = Math.max(0.12, luminanceBase - cloudOpacity * 0.24 - precipitationStrength * 0.12);

  const severeCoolScene = scene === 'cold' || scene === 'rain' || scene === 'storm';
  const accentTemperature: AtmosphereModel['accentTemperature'] =
    severeCoolScene || phase === 'night'
      ? 'cool'
      : scene === 'hot' || solar.twilightWarmth > 0.34
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
    solar,
  };
}

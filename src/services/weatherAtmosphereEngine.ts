import { CurrentWeather, DailyForecast, WeatherCondition } from '../types/weatherTypes';
import type { OrbiPrecipitationIntensity, OrbiPrecipitationKind } from '../utils/wmoWeatherCodeMapper';

export type AtmosphereQuality = 'ultra' | 'high' | 'balanced' | 'low' | 'static';
export type AtmospherePhase = 'dawn' | 'day' | 'dusk' | 'night';
export type AtmosphereScene =
  | 'setup'
  | 'clear'
  | 'partly-cloudy'
  | 'cloudy'
  | 'fog'
  | 'rain'
  | 'snow'
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
  precipitationKind: OrbiPrecipitationKind;
  precipitationIntensity: OrbiPrecipitationIntensity;
  frostStrength: number;
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

type CurrentWeatherWithDaylightHint = CurrentWeather & {
  isDay?: boolean;
};

type CurrentWeatherWithSemantics = CurrentWeather & {
  precipitationKind?: OrbiPrecipitationKind;
  precipitationIntensity?: OrbiPrecipitationIntensity;
};

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

function parseClock(value?: string): number | null {
  if (!value) return null;
  const match = value.trim().match(/(?:^|T|\s)(\d{1,2}):(\d{2})(?:\s*([AP]M))?/i);
  if (!match) return null;

  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const meridiem = match[3]?.toUpperCase();
  if (!Number.isFinite(hour) || !Number.isFinite(minute) || minute < 0 || minute > 59) return null;

  if (meridiem === 'AM') {
    if (hour === 12) hour = 0;
    else if (hour < 1 || hour > 11) return null;
  } else if (meridiem === 'PM') {
    if (hour >= 1 && hour <= 11) hour += 12;
    else if (hour !== 12) return null;
  } else if (hour < 0 || hour > 23) {
    return null;
  }

  return hour * 60 + minute;
}

function resolveSolarClockWindow(daily?: DailyForecast): { sunriseMinutes: number; sunsetMinutes: number } {
  const fallbackSunrise = 7 * 60;
  const fallbackSunset = 19 * 60;
  const sunriseMinutes = parseClock(daily?.sunrise) ?? fallbackSunrise;
  const parsedSunset = parseClock(daily?.sunset);
  const sunsetMinutes = parsedSunset !== null && parsedSunset - sunriseMinutes >= 180
    ? parsedSunset
    : fallbackSunset;

  return { sunriseMinutes, sunsetMinutes };
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

function getProviderDaylightHint(current: CurrentWeather): boolean | null {
  const value = (current as CurrentWeatherWithDaylightHint).isDay;
  return typeof value === 'boolean' ? value : null;
}

function inferPrecipitationIntensity(current: CurrentWeather): OrbiPrecipitationIntensity {
  const explicit = (current as CurrentWeatherWithSemantics).precipitationIntensity;
  if (explicit) return explicit;
  const mm = Math.max(0, current.precipitationMm);
  if (mm <= 0) return 'none';
  if (mm < 0.2) return 'trace';
  if (mm < 2) return 'light';
  if (mm < 8) return 'moderate';
  return 'heavy';
}

function inferPrecipitationKind(current: CurrentWeather, scene: AtmosphereScene): OrbiPrecipitationKind {
  const explicit = (current as CurrentWeatherWithSemantics).precipitationKind;
  if (explicit && explicit !== 'unknown') return explicit;
  if (scene === 'snow') return 'snow';
  if (scene === 'storm') return 'storm';
  if (scene === 'rain') return 'rain';
  return 'none';
}

function intensityVisualFloor(intensity: OrbiPrecipitationIntensity): number {
  switch (intensity) {
    case 'trace': return 0.1;
    case 'light': return 0.2;
    case 'moderate': return 0.42;
    case 'heavy': return 0.7;
    case 'violent': return 0.94;
    case 'none':
    default:
      return 0;
  }
}

function kindVisualScale(kind: OrbiPrecipitationKind): number {
  switch (kind) {
    case 'drizzle': return 0.68;
    case 'freezing_drizzle': return 0.62;
    case 'freezing_rain': return 0.9;
    case 'showers': return 1.12;
    case 'storm': return 1.16;
    case 'snow': return 0.94;
    case 'rain': return 1;
    case 'none': return 0;
    case 'unknown':
    default:
      return 1;
  }
}

export function resolveSolarLightingState(
  timezone?: string,
  daily?: DailyForecast,
  now: Date = new Date(),
  phaseOverride?: AtmospherePhase,
): SolarLightingState {
  const localMinutes = getLocalMinutes(timezone, now);
  const { sunriseMinutes, sunsetMinutes } = resolveSolarClockWindow(daily);
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
  const { sunriseMinutes: sunrise, sunsetMinutes: sunset } = resolveSolarClockWindow(daily);

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
    case 'fog':
      return 'fog';
    case 'rain':
      return 'rain';
    case 'snow':
      return 'snow';
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
  const quality = params.quality ?? resolveAtmosphereQuality();

  const automaticPhase = current.condition === 'night'
    ? 'night'
    : resolveAtmospherePhase(timezone, daily, now);
  const providerDaylightHint = getProviderDaylightHint(current);
  let guardedAutomaticPhase = automaticPhase;

  if (current.condition !== 'night' && providerDaylightHint === true && automaticPhase === 'night') {
    guardedAutomaticPhase = 'day';
  } else if (providerDaylightHint === false && automaticPhase === 'day') {
    guardedAutomaticPhase = 'night';
  }

  const phase = phaseOverride ?? guardedAutomaticPhase;
  const solarGuardOverride = phaseOverride
    ?? (guardedAutomaticPhase !== automaticPhase ? guardedAutomaticPhase : undefined)
    ?? (current.condition === 'night' ? 'night' : undefined);
  const solar = resolveSolarLightingState(timezone, daily, now ?? new Date(), solarGuardOverride);

  const cloudFraction = Math.min(1, Math.max(0, current.cloudCover / 100));
  const precipitationBase = Math.min(1, Math.max(0, current.precipitationMm / 5));
  const precipitationKind = inferPrecipitationKind(current, scene);
  const precipitationIntensity = inferPrecipitationIntensity(current);
  const semanticStrength = clamp01(
    Math.max(precipitationBase, intensityVisualFloor(precipitationIntensity))
      * kindVisualScale(precipitationKind),
  );
  const windStrength = Math.min(1, Math.max(0, current.windSpeedKmh / 55));
  const humidityMist = Math.min(1, Math.max(0, (current.humidity - 58) / 42));

  const sceneCloudBias: Record<AtmosphereScene, number> = {
    setup: 0.28,
    clear: 0.08,
    'partly-cloudy': 0.48,
    cloudy: 0.82,
    fog: 0.76,
    rain: 0.9,
    snow: 0.9,
    storm: 1,
    wind: 0.38,
    cold: 0.44,
    hot: 0.12,
  };

  const cloudOpacity = Math.min(1, Math.max(sceneCloudBias[scene], cloudFraction));
  const precipitationStrength = scene === 'storm'
    ? Math.max(0.68, semanticStrength)
    : scene === 'rain'
      ? Math.max(0.08, semanticStrength)
      : scene === 'snow'
        ? Math.max(0.24, semanticStrength)
        : precipitationBase * 0.2;

  const frostStrength = scene === 'snow'
    ? clamp01(0.3 + precipitationStrength * 0.4 + windStrength * 0.08)
    : scene === 'cold'
      ? clamp01(0.08 + Math.max(0, -current.feelsLikeC) / 28)
      : 0;

  const mistStrength = scene === 'fog'
    ? Math.max(0.72, humidityMist)
    : scene === 'rain' || scene === 'storm' || scene === 'cloudy' || scene === 'snow'
      ? Math.max(scene === 'snow' ? 0.24 : 0.12 + precipitationStrength * 0.16, humidityMist)
      : humidityMist * 0.45;

  const solarLuminance = Math.max(0.14, (1 - solar.nightStrength) * (0.44 + Math.max(0, solar.sunAltitude) * 0.5));
  const phaseFloor = phase === 'night' ? 0.17 : phase === 'dawn' || phase === 'dusk' ? 0.48 : 0.74;
  const luminanceBase = Math.max(phaseFloor, solarLuminance);
  const snowDiffusePenalty = scene === 'snow' ? 0.06 : 0;
  const fogDiffusePenalty = scene === 'fog' ? 0.09 : 0;
  const luminance = Math.max(0.12, luminanceBase - cloudOpacity * 0.24 - precipitationStrength * 0.12 - snowDiffusePenalty - fogDiffusePenalty);

  const severeCoolScene = scene === 'cold' || scene === 'rain' || scene === 'snow' || scene === 'storm' || scene === 'fog';
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
    precipitationKind,
    precipitationIntensity,
    frostStrength,
    mistStrength,
    windStrength,
    luminance,
    accentTemperature,
    solar,
  };
}

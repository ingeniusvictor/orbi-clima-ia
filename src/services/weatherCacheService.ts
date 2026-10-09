import { DailyForecast, HourlyForecast, CurrentWeather, WeatherLocation } from '../types/weatherTypes';

const CACHE_KEY = 'orbi_clima_last_weather_bundle_v1';
export const WEATHER_CACHE_FRESH_MS = 90 * 60 * 1000;
export const WEATHER_CACHE_STALE_MS = 6 * 60 * 60 * 1000;

export interface WeatherBundleData {
  location: WeatherLocation;
  current: CurrentWeather;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
}

export interface CachedBundle {
  timestamp: number;
  data: WeatherBundleData;
}

export type LoadedWeatherBundle = WeatherBundleData & {
  timestamp: number;
  ageMs: number;
};

export function saveLastWeatherBundle(bundle: WeatherBundleData): void {
  try {
    const payload: CachedBundle = {
      timestamp: Date.now(),
      data: bundle
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch (e) {
    console.error('Failed to save weather bundle to cache:', e);
  }
}

export function loadLastWeatherBundle(): LoadedWeatherBundle | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedBundle;
    if (parsed && Number.isFinite(parsed.timestamp) && parsed.data?.location && parsed.data?.current) {
      return {
        ...parsed.data,
        timestamp: parsed.timestamp,
        ageMs: Math.max(0, Date.now() - parsed.timestamp),
      };
    }
  } catch (e) {
    console.error('Failed to load weather bundle from cache, clearing:', e);
    clearWeatherCache();
  }
  return null;
}

export function loadLastWeatherBundleTimestamp(): number | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedBundle;
    return Number.isFinite(parsed?.timestamp) ? parsed.timestamp : null;
  } catch (e) {
    return null;
  }
}

function toRadians(value: number): number {
  return value * Math.PI / 180;
}

export function distanceBetweenWeatherLocationsKm(a: WeatherLocation, b: WeatherLocation): number {
  const earthRadiusKm = 6371;
  const dLat = toRadians(b.latitude - a.latitude);
  const dLon = toRadians(b.longitude - a.longitude);
  const lat1 = toRadians(a.latitude);
  const lat2 = toRadians(b.latitude);
  const sinLat = Math.sin(dLat / 2);
  const sinLon = Math.sin(dLon / 2);
  const h = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLon * sinLon;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function cacheMatchesLocation(
  cached: LoadedWeatherBundle,
  target: WeatherLocation,
  maxDistanceKm = 5
): boolean {
  if (cached.location.id === target.id) return true;
  if (![cached.location.latitude, cached.location.longitude, target.latitude, target.longitude].every(Number.isFinite)) {
    return false;
  }
  return distanceBetweenWeatherLocationsKm(cached.location, target) <= maxDistanceKm;
}

export function clearWeatherCache(): void {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (e) {
    console.error('Failed to clear weather cache:', e);
  }
}

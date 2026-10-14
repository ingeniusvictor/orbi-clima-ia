const CACHE_KEY = 'orbi_clima_last_weather_bundle_v1';

export interface CachedBundle {
  timestamp: number;
  data: {
    location: any;
    current: any;
    hourly: any[];
    daily: any[];
  };
}

export function saveLastWeatherBundle(bundle: any): void {
  try {
    const payload: CachedBundle = {
      timestamp: Date.now(),
      data: bundle
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(payload));

    // Same-tab storage events are not emitted by browsers. Publish an explicit,
    // payload-free signal so visual consumers can refresh from the canonical cache
    // without coupling themselves to App state or duplicating weather data.
    window.dispatchEvent(new Event('orbi-weather-bundle-updated'));
  } catch (e) {
    console.error('Failed to save weather bundle to cache:', e);
  }
}

export function loadLastWeatherBundle(): any | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedBundle;
    if (parsed && parsed.data && parsed.data.location && parsed.data.current) {
      return parsed.data;
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
    return parsed?.timestamp || null;
  } catch (e) {
    return null;
  }
}

export function clearWeatherCache(): void {
  try {
    localStorage.removeItem(CACHE_KEY);
    window.dispatchEvent(new Event('orbi-weather-bundle-updated'));
  } catch (e) {
    console.error('Failed to clear weather cache:', e);
  }
}
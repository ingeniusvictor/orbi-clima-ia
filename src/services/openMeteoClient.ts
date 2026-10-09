import { OpenMeteoRawResponse, LocationSearchResult } from '../types/weatherTypes';

// Timeout fetch wrapper
async function fetchWithTimeout(resource: string, options: RequestInit & { timeout?: number } = {}) {
  const { timeout = 10000 } = options;
  
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export async function fetchOpenMeteoForecast(params: {
  latitude: number;
  longitude: number;
  timezone?: string;
  forecastDays?: number;
}): Promise<OpenMeteoRawResponse> {
  const { latitude, longitude, timezone = 'auto', forecastDays = 7 } = params;
  
  const queryParams = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    current: [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'is_day',
      'precipitation',
      'rain',
      'showers',
      'weather_code',
      'cloud_cover',
      'pressure_msl',
      'surface_pressure',
      'wind_speed_10m',
      'wind_direction_10m',
      'wind_gusts_10m'
    ].join(','),
    hourly: [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'precipitation_probability',
      'precipitation',
      'rain',
      'showers',
      'weather_code',
      'cloud_cover',
      'uv_index',
      'wind_speed_10m',
      'wind_direction_10m',
      'wind_gusts_10m'
    ].join(','),
    daily: [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'apparent_temperature_max',
      'apparent_temperature_min',
      'sunrise',
      'sunset',
      'uv_index_max',
      'precipitation_sum',
      'precipitation_probability_max',
      'wind_speed_10m_max',
      'wind_gusts_10m_max'
    ].join(','),
    timezone,
    forecast_days: forecastDays.toString(),
    temperature_unit: 'celsius',
    wind_speed_unit: 'kmh',
    precipitation_unit: 'mm'
  });

  const url = `https://api.open-meteo.com/v1/forecast?${queryParams.toString()}`;
  
  const response = await fetchWithTimeout(url, { timeout: 10000 });
  if (!response.ok) {
    throw new Error(`Open-Meteo API error: status ${response.status}`);
  }
  
  return await response.json() as OpenMeteoRawResponse;
}

export async function searchOpenMeteoLocations(query: string): Promise<LocationSearchResult[]> {
  if (!query || query.trim().length < 3) {
    return [];
  }
  
  const queryParams = new URLSearchParams({
    name: query.trim(),
    count: '8',
    language: 'es',
    format: 'json'
  });
  
  const url = `https://geocoding-api.open-meteo.com/v1/search?${queryParams.toString()}`;
  
  try {
    const response = await fetchWithTimeout(url, { timeout: 8000 });
    if (!response.ok) {
      throw new Error(`Open-Meteo Geocoding error: status ${response.status}`);
    }
    
    const data = await response.json();
    if (!data.results || !Array.isArray(data.results)) {
      return [];
    }
    
    return data.results.map((item: any) => ({
      id: item.id,
      name: item.name,
      region: item.admin1 || item.admin2 || item.country,
      country: item.country,
      latitude: item.latitude,
      longitude: item.longitude,
      timezone: item.timezone,
      source: 'open_meteo_geocoding' as const
    }));
  } catch (error) {
    console.error('Geocoding search error:', error);
    throw error;
  }
}

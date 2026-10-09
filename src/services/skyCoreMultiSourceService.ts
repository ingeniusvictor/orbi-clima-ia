import { CurrentWeather, HourlyForecast, DailyForecast, WeatherLocation, OpenMeteoRawResponse } from '../types/weatherTypes';
import { adaptOpenMeteoCurrent } from './weatherDataAdapter';

export interface MultiSourceWeatherData {
  current: CurrentWeather;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
}

export interface ModelProviderMeta {
  id: string;
  name: string;
  fullName: string;
  endpoint: string;
  role: 'primary' | 'comparison';
}

const MODEL_PROVIDERS: ModelProviderMeta[] = [
  {
    id: 'open_meteo',
    name: 'Best Match',
    fullName: 'Open-Meteo Best Match',
    endpoint: '',
    role: 'primary',
  },
  {
    id: 'ecmwf_ifs',
    name: 'ECMWF IFS',
    fullName: 'ECMWF IFS · Open-Meteo',
    endpoint: 'https://api.open-meteo.com/v1/ecmwf',
    role: 'comparison',
  },
  {
    id: 'gfs_global',
    name: 'NOAA GFS',
    fullName: 'NOAA GFS · Open-Meteo',
    endpoint: 'https://api.open-meteo.com/v1/gfs',
    role: 'comparison',
  },
  {
    id: 'icon_global',
    name: 'DWD ICON',
    fullName: 'DWD ICON Global · Open-Meteo',
    endpoint: 'https://api.open-meteo.com/v1/dwd-icon',
    role: 'comparison',
  },
];

export interface VariableComparison {
  name: string;
  label: string;
  unit: string;
  openMeteoValue: number | string;
  avgValue: number;
  maxDelta: number;
  providerValues: Record<string, number | string>;
}

export type SkyCoreConfidenceType = 'Alta' | 'Media' | 'Baja';

export interface ComparisonReport {
  timestamp: string;
  primaryProvider: string;
  /** Legacy field name kept for component compatibility; semantically this is model agreement, not forecast accuracy. */
  confidence: SkyCoreConfidenceType;
  /** 0-100 model-agreement score. It must never be presented as probability of correctness. */
  confidenceScore: number;
  variables: VariableComparison[];
  providersData: Record<string, CurrentWeather>;
  providers: ModelProviderMeta[];
  availableProviderIds: string[];
  failedProviderIds: string[];
}

async function fetchWithTimeout(url: string, timeoutMs = 8000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function fetchModelCurrent(provider: ModelProviderMeta, location: WeatherLocation): Promise<CurrentWeather> {
  const query = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    current: [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'precipitation',
      'weather_code',
      'cloud_cover',
      'wind_speed_10m',
      'wind_direction_10m',
      'wind_gusts_10m',
    ].join(','),
    timezone: location.timezone || 'auto',
    temperature_unit: 'celsius',
    wind_speed_unit: 'kmh',
    precipitation_unit: 'mm',
    forecast_days: '1',
  });

  const response = await fetchWithTimeout(`${provider.endpoint}?${query.toString()}`);
  if (!response.ok) throw new Error(`${provider.id} returned HTTP ${response.status}`);
  const raw = await response.json() as OpenMeteoRawResponse;
  return adaptOpenMeteoCurrent(raw);
}

function numericValues(values: Record<string, number | string>): number[] {
  return Object.values(values).map(Number).filter(Number.isFinite);
}

function classifyAgreement(score: number): SkyCoreConfidenceType {
  if (score >= 82) return 'Alta';
  if (score >= 62) return 'Media';
  return 'Baja';
}

/**
 * Compares genuinely independent numerical forecast models exposed through Open-Meteo.
 * It does NOT fabricate provider values and the resulting score is model agreement, not forecast accuracy.
 */
export async function runSkyCoreComparison(
  location: WeatherLocation,
  baseData: MultiSourceWeatherData
): Promise<ComparisonReport> {
  const reports: Record<string, CurrentWeather> = {
    open_meteo: baseData.current,
  };
  const failedProviderIds: string[] = [];

  const comparisons = MODEL_PROVIDERS.filter(p => p.role === 'comparison');
  const settled = await Promise.allSettled(comparisons.map(provider => fetchModelCurrent(provider, location)));
  settled.forEach((result, index) => {
    const provider = comparisons[index];
    if (result.status === 'fulfilled') reports[provider.id] = result.value;
    else {
      failedProviderIds.push(provider.id);
      console.warn(`[SkyCore] ${provider.name} unavailable:`, result.reason);
    }
  });

  const variables: VariableComparison[] = [
    { name: 'temperature', label: 'Temperatura', unit: '°C', openMeteoValue: baseData.current.temperatureC, avgValue: 0, maxDelta: 0, providerValues: {} },
    { name: 'humidity', label: 'Humedad', unit: '%', openMeteoValue: baseData.current.humidity, avgValue: 0, maxDelta: 0, providerValues: {} },
    { name: 'wind', label: 'Viento', unit: ' km/h', openMeteoValue: baseData.current.windSpeedKmh, avgValue: 0, maxDelta: 0, providerValues: {} },
    { name: 'gusts', label: 'Ráfagas', unit: ' km/h', openMeteoValue: baseData.current.windGustKmh, avgValue: 0, maxDelta: 0, providerValues: {} },
    { name: 'condition', label: 'Fenómeno', unit: '', openMeteoValue: baseData.current.conditionLabel || baseData.current.condition, avgValue: 0, maxDelta: 0, providerValues: {} },
  ];

  for (const [providerId, current] of Object.entries(reports)) {
    for (const variable of variables) {
      if (variable.name === 'temperature') variable.providerValues[providerId] = current.temperatureC;
      else if (variable.name === 'humidity') variable.providerValues[providerId] = current.humidity;
      else if (variable.name === 'wind') variable.providerValues[providerId] = current.windSpeedKmh;
      else if (variable.name === 'gusts') variable.providerValues[providerId] = current.windGustKmh;
      else if (variable.name === 'condition') variable.providerValues[providerId] = current.conditionLabel || current.condition;
    }
  }

  let score = 100;
  const availableProviderIds = Object.keys(reports);
  const missingModels = Math.max(0, MODEL_PROVIDERS.length - availableProviderIds.length);
  score -= missingModels * 10;

  for (const variable of variables) {
    if (variable.name === 'condition') {
      const primaryPhenomenon = baseData.current.phenomenon || baseData.current.condition;
      const comparisonsAvailable = availableProviderIds.filter(id => id !== 'open_meteo');
      if (comparisonsAvailable.length > 0) {
        const agreements = comparisonsAvailable.filter(id => {
          const current = reports[id];
          return (current.phenomenon || current.condition) === primaryPhenomenon;
        }).length;
        const ratio = agreements / comparisonsAvailable.length;
        score -= Math.round((1 - ratio) * 14);
      }
      continue;
    }

    const values = numericValues(variable.providerValues);
    if (values.length === 0) continue;
    variable.avgValue = Number((values.reduce((sum, v) => sum + v, 0) / values.length).toFixed(1));
    variable.maxDelta = Number((Math.max(...values) - Math.min(...values)).toFixed(1));

    if (variable.name === 'temperature') {
      if (variable.maxDelta > 2) score -= Math.min(18, Math.round((variable.maxDelta - 2) * 5));
    } else if (variable.name === 'humidity') {
      if (variable.maxDelta > 10) score -= Math.min(14, Math.round((variable.maxDelta - 10) * 0.8));
    } else if (variable.name === 'wind') {
      if (variable.maxDelta > 10) score -= Math.min(16, Math.round((variable.maxDelta - 10) * 0.8));
    } else if (variable.name === 'gusts') {
      if (variable.maxDelta > 15) score -= Math.min(16, Math.round((variable.maxDelta - 15) * 0.6));
    }
  }

  score = Math.max(20, Math.min(100, Math.round(score)));

  return {
    timestamp: baseData.current.updatedAt || new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
    primaryProvider: 'Open-Meteo Best Match',
    confidence: classifyAgreement(score),
    confidenceScore: score,
    variables,
    providersData: reports,
    providers: MODEL_PROVIDERS,
    availableProviderIds,
    failedProviderIds,
  };
}

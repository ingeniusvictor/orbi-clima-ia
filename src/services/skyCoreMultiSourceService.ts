import { CurrentWeather, HourlyForecast, DailyForecast, WeatherLocation } from '../types/weatherTypes';

export interface MultiSourceWeatherData {
  current: CurrentWeather;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
}

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
  confidence: SkyCoreConfidenceType;
  confidenceScore: number;
  variables: VariableComparison[];
  providersData: Record<string, CurrentWeather>;
  mode: 'single_source' | 'multi_source';
  sourceCount: number;
  note: string;
}

function buildPrimaryVariables(current: CurrentWeather): VariableComparison[] {
  const rows: Array<[string, string, string, number | string]> = [
    ['temperature', 'Temperatura', '°C', current.temperatureC],
    ['humidity', 'Humedad Relativa', '%', current.humidity],
    ['rain', 'Precipitación', ' mm', current.precipitationMm],
    ['wind', 'Velocidad de Viento', ' km/h', current.windSpeedKmh],
    ['gusts', 'Ráfagas de Viento', ' km/h', current.windGustKmh],
    ['uv', 'Índice UV', '', current.uvIndex],
    ['condition', 'Condición', '', current.condition],
  ];

  return rows.map(([name, label, unit, value]) => ({
    name,
    label,
    unit,
    openMeteoValue: value,
    avgValue: typeof value === 'number' ? value : 0,
    maxDelta: 0,
    providerValues: { open_meteo: value },
  }));
}

function calculateBundleIntegrity(baseData: MultiSourceWeatherData): number {
  let score = 55;

  const c = baseData.current;
  const numericCurrentValues = [
    c.temperatureC,
    c.feelsLikeC,
    c.humidity,
    c.windSpeedKmh,
    c.windGustKmh,
    c.pressureHpa,
    c.cloudCover,
    c.precipitationMm,
    c.uvIndex,
  ];

  const finiteRatio = numericCurrentValues.filter(Number.isFinite).length / numericCurrentValues.length;
  score += Math.round(finiteRatio * 10);

  if (baseData.hourly.length >= 6) score += 7;
  if (baseData.hourly.length >= 18) score += 3;
  if (baseData.daily.length >= 3) score += 5;

  // A single forecast source must never be presented as high-confidence
  // multi-model corroboration. This score measures payload integrity only.
  return Math.max(0, Math.min(80, score));
}

/**
 * Weather integrity report.
 *
 * IMPORTANT: v1.0.6 previously generated synthetic OpenWeather/DMC/Tomorrow.io/
 * Meteomatics values from Open-Meteo and treated the resulting spread as
 * independent corroboration. That behaviour was meteorologically invalid.
 *
 * Until genuine independent providers or real ensemble members are integrated,
 * this report deliberately remains single-source and caps confidence at 80.
 */
export async function runSkyCoreComparison(
  _location: WeatherLocation,
  baseData: MultiSourceWeatherData
): Promise<ComparisonReport> {
  const confidenceScore = calculateBundleIntegrity(baseData);
  const confidence: SkyCoreConfidenceType = confidenceScore >= 60 ? 'Media' : 'Baja';

  return {
    timestamp: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
    primaryProvider: 'Open-Meteo',
    confidence,
    confidenceScore,
    variables: buildPrimaryVariables(baseData.current),
    providersData: { open_meteo: baseData.current },
    mode: 'single_source',
    sourceCount: 1,
    note: 'Integridad del paquete Open-Meteo. No representa corroboración independiente ni exactitud observacional.',
  };
}

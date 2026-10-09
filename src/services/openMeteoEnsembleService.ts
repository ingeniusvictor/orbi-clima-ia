export type ForecastUncertaintyBand = 'low' | 'moderate' | 'high' | 'very_high' | 'unavailable';

export interface ForecastUncertaintyPoint {
  time: string;
  temperatureMeanC: number | null;
  temperatureSpreadC: number | null;
  precipitationMeanMm: number | null;
  precipitationSpreadMm: number | null;
  windMeanKmh: number | null;
  windSpreadKmh: number | null;
}

export interface ForecastUncertaintyReport {
  provider: 'open_meteo_ensemble_mean';
  model: string;
  sourceLabel: string;
  updatedAt: string;
  band: ForecastUncertaintyBand;
  label: string;
  stabilityScore: number;
  temperatureSpread6hC: number | null;
  precipitationSpread6hMm: number | null;
  windSpread6hKmh: number | null;
  interpretation: string;
  points: ForecastUncertaintyPoint[];
}

function finiteOrNull(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function maxFinite(values: Array<number | null>): number | null {
  const finite = values.filter((value): value is number => value !== null && Number.isFinite(value));
  return finite.length ? Math.max(...finite) : null;
}

function buildUncertaintyBand(params: {
  temperatureSpread: number | null;
  precipitationSpread: number | null;
  windSpread: number | null;
}): { band: ForecastUncertaintyBand; label: string; stabilityScore: number; interpretation: string } {
  const { temperatureSpread, precipitationSpread, windSpread } = params;
  if (temperatureSpread === null && precipitationSpread === null && windSpread === null) {
    return {
      band: 'unavailable',
      label: 'Sin ensemble',
      stabilityScore: 0,
      interpretation: 'No fue posible calcular dispersión del ensemble.',
    };
  }

  const tempPenalty = temperatureSpread === null ? 0 : Math.min(30, temperatureSpread * 10);
  const rainPenalty = precipitationSpread === null ? 0 : Math.min(40, precipitationSpread * 8);
  const windPenalty = windSpread === null ? 0 : Math.min(30, windSpread * 2.5);
  const stabilityScore = Math.max(0, Math.round(100 - tempPenalty - rainPenalty - windPenalty));

  if (stabilityScore >= 75) {
    return {
      band: 'low',
      label: 'Dispersión baja',
      stabilityScore,
      interpretation: 'Los miembros del ensemble están relativamente agrupados para las próximas horas. Esto indica menor dispersión de modelo, no garantiza exactitud local.',
    };
  }
  if (stabilityScore >= 50) {
    return {
      band: 'moderate',
      label: 'Dispersión moderada',
      stabilityScore,
      interpretation: 'Hay diferencias apreciables entre miembros del ensemble. Conviene vigilar actualizaciones de corto plazo.',
    };
  }
  if (stabilityScore >= 25) {
    return {
      band: 'high',
      label: 'Dispersión alta',
      stabilityScore,
      interpretation: 'Los escenarios meteorológicos divergen de forma importante. Evita interpretar un único valor horario como certeza.',
    };
  }
  return {
    band: 'very_high',
    label: 'Dispersión muy alta',
    stabilityScore,
    interpretation: 'Existe gran dispersión entre escenarios del ensemble. Las decisiones sensibles al clima deben apoyarse en actualizaciones frecuentes y fuentes oficiales cuando correspondan.',
  };
}

function findStartIndex(times: unknown[]): number {
  if (!Array.isArray(times) || !times.length) return -1;
  const now = new Date();
  const nowKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}`;
  const index = times.findIndex(time => String(time).slice(0, 13) >= nowKey);
  return index >= 0 ? index : 0;
}

export async function fetchForecastUncertainty(params: {
  latitude: number;
  longitude: number;
  timezone?: string;
}): Promise<ForecastUncertaintyReport> {
  const { latitude, longitude, timezone = 'auto' } = params;
  const model = 'dwd_icon_eps_ensemble_mean_seamless';
  const query = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    timezone,
    forecast_hours: '24',
    models: model,
    hourly: [
      'temperature_2m',
      'temperature_2m_spread',
      'precipitation',
      'precipitation_spread',
      'wind_speed_10m',
      'wind_speed_10m_spread',
    ].join(','),
    temperature_unit: 'celsius',
    wind_speed_unit: 'kmh',
    precipitation_unit: 'mm',
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`https://ensemble-api.open-meteo.com/v1/ensemble?${query.toString()}`, {
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Open-Meteo Ensemble error: ${response.status}`);

    const raw = await response.json();
    const hourly = raw.hourly ?? {};
    const times = Array.isArray(hourly.time) ? hourly.time : [];
    const start = findStartIndex(times);
    const points: ForecastUncertaintyPoint[] = [];

    if (start >= 0) {
      for (let i = start; i < Math.min(times.length, start + 12); i++) {
        points.push({
          time: String(times[i]),
          temperatureMeanC: finiteOrNull(hourly.temperature_2m?.[i]),
          temperatureSpreadC: finiteOrNull(hourly.temperature_2m_spread?.[i]),
          precipitationMeanMm: finiteOrNull(hourly.precipitation?.[i]),
          precipitationSpreadMm: finiteOrNull(hourly.precipitation_spread?.[i]),
          windMeanKmh: finiteOrNull(hourly.wind_speed_10m?.[i]),
          windSpreadKmh: finiteOrNull(hourly.wind_speed_10m_spread?.[i]),
        });
      }
    }

    const firstSix = points.slice(0, 6);
    const temperatureSpread6hC = maxFinite(firstSix.map(point => point.temperatureSpreadC));
    const precipitationSpread6hMm = maxFinite(firstSix.map(point => point.precipitationSpreadMm));
    const windSpread6hKmh = maxFinite(firstSix.map(point => point.windSpreadKmh));
    const classification = buildUncertaintyBand({
      temperatureSpread: temperatureSpread6hC,
      precipitationSpread: precipitationSpread6hMm,
      windSpread: windSpread6hKmh,
    });

    return {
      provider: 'open_meteo_ensemble_mean',
      model,
      sourceLabel: 'Open-Meteo Ensemble Mean · DWD ICON EPS Global',
      updatedAt: points[0]?.time ?? new Date().toISOString(),
      band: classification.band,
      label: classification.label,
      stabilityScore: classification.stabilityScore,
      temperatureSpread6hC,
      precipitationSpread6hMm,
      windSpread6hKmh,
      interpretation: classification.interpretation,
      points,
    };
  } finally {
    clearTimeout(timeout);
  }
}

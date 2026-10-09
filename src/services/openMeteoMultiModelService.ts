export type MultiModelAgreementBand = 'high' | 'moderate' | 'low' | 'unavailable';
export type MultiModelPrecipitationConsensus = 'wet' | 'dry' | 'mixed' | 'unavailable';

export interface MultiModelDefinition {
  id: string;
  label: string;
  provider: string;
  region: 'global';
}

export interface MultiModelSnapshot {
  modelId: string;
  label: string;
  provider: string;
  available: boolean;
  currentTemperatureC: number | null;
  currentWindKmh: number | null;
  currentWeatherCode: number | null;
  currentConditionGroup: string;
  precipitationNext3hMm: number | null;
  precipitationNext6hMm: number | null;
  maxWindNext6hKmh: number | null;
  minTemperatureNext6hC: number | null;
  maxTemperatureNext6hC: number | null;
}

export interface MultiModelForecastTarget {
  modelId: string;
  label: string;
  provider: string;
  issuedAt: string;
  validTimeLocal: string;
  validTimeEpochMs: number;
  leadHours: 1 | 3 | 6;
  temperatureC: number | null;
  windKmh: number | null;
  precipitationMm: number | null;
  weatherCode: number | null;
  conditionGroup: string;
  predictedWet: boolean | null;
}

export interface MultiModelConsensusReport {
  provider: 'open_meteo_multi_model';
  sourceLabel: string;
  requestedModels: number;
  availableModels: number;
  agreementBand: MultiModelAgreementBand;
  agreementLabel: string;
  agreementScore: number | null;
  precipitationConsensus: MultiModelPrecipitationConsensus;
  precipitationConsensusLabel: string;
  wetVotes: number;
  dryVotes: number;
  temperatureSpreadNowC: number | null;
  precipitationSpread6hMm: number | null;
  windSpreadNowKmh: number | null;
  conditionGroups: string[];
  interpretation: string;
  models: MultiModelSnapshot[];
  verificationTargets: MultiModelForecastTarget[];
  generatedAt: string;
}

export const ORBI_GLOBAL_FORECAST_MODELS: MultiModelDefinition[] = [
  { id: 'ecmwf_ifs025', label: 'ECMWF IFS 0.25°', provider: 'ECMWF', region: 'global' },
  { id: 'ncep_gfs_seamless', label: 'NOAA GFS', provider: 'NOAA/NCEP', region: 'global' },
  { id: 'icon_seamless', label: 'DWD ICON', provider: 'DWD', region: 'global' },
  { id: 'bom_access_global', label: 'BOM ACCESS-G', provider: 'BOM Australia', region: 'global' },
];

function finiteOrNull(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function valuesFor(hourly: Record<string, unknown>, variable: string, modelId: string): unknown[] {
  const candidates = [
    `${variable}_${modelId}`,
    `${variable}_${modelId.replace(/^ncep_/, '')}`,
    `${variable}_${modelId.replace(/^bom_/, '')}`,
  ];
  for (const key of candidates) {
    const value = hourly[key];
    if (Array.isArray(value)) return value;
  }
  return [];
}

function sumFinite(values: unknown[], start: number, count: number): number | null {
  let sum = 0;
  let seen = false;
  for (let i = start; i < Math.min(values.length, start + count); i++) {
    const value = finiteOrNull(values[i]);
    if (value === null) continue;
    seen = true;
    sum += value;
  }
  return seen ? Math.round(sum * 10) / 10 : null;
}

function minFinite(values: unknown[], start: number, count: number): number | null {
  const finite: number[] = [];
  for (let i = start; i < Math.min(values.length, start + count); i++) {
    const value = finiteOrNull(values[i]);
    if (value !== null) finite.push(value);
  }
  return finite.length ? Math.round(Math.min(...finite) * 10) / 10 : null;
}

function maxFinite(values: unknown[], start: number, count: number): number | null {
  const finite: number[] = [];
  for (let i = start; i < Math.min(values.length, start + count); i++) {
    const value = finiteOrNull(values[i]);
    if (value !== null) finite.push(value);
  }
  return finite.length ? Math.round(Math.max(...finite) * 10) / 10 : null;
}

function spread(values: Array<number | null>): number | null {
  const finite = values.filter((value): value is number => value !== null && Number.isFinite(value));
  if (finite.length < 2) return null;
  return Math.round((Math.max(...finite) - Math.min(...finite)) * 10) / 10;
}

function conditionGroup(code: number | null): string {
  if (code === null) return 'sin_dato';
  if (code >= 95) return 'tormenta';
  if (code >= 85 && code <= 86) return 'nieve_chubascos';
  if (code >= 80 && code <= 82) return 'chubascos';
  if (code >= 71 && code <= 77) return 'nieve';
  if (code >= 66 && code <= 67) return 'lluvia_engelante';
  if (code >= 61 && code <= 65) return 'lluvia';
  if (code >= 56 && code <= 57) return 'llovizna_engelante';
  if (code >= 51 && code <= 55) return 'llovizna';
  if (code >= 45 && code <= 48) return 'niebla';
  if (code === 3) return 'nublado';
  if (code === 2) return 'parcial';
  if (code === 1) return 'mayormente_despejado';
  if (code === 0) return 'despejado';
  return 'otro';
}

function isWetCondition(group: string): boolean {
  return [
    'llovizna',
    'llovizna_engelante',
    'lluvia',
    'lluvia_engelante',
    'chubascos',
    'nieve',
    'nieve_chubascos',
    'tormenta',
  ].includes(group);
}

function currentIndex(times: unknown[], utcOffsetSeconds = 0): number {
  if (!times.length) return 0;
  const localNow = new Date(Date.now() + utcOffsetSeconds * 1000);
  const localKey = `${localNow.getUTCFullYear()}-${String(localNow.getUTCMonth() + 1).padStart(2, '0')}-${String(localNow.getUTCDate()).padStart(2, '0')}T${String(localNow.getUTCHours()).padStart(2, '0')}`;
  const index = times.findIndex(time => String(time).slice(0, 13) >= localKey);
  return index >= 0 ? index : 0;
}

function localTimeToEpochMs(localIso: string, utcOffsetSeconds: number): number {
  const naiveUtcMs = Date.parse(`${localIso}:00Z`);
  if (!Number.isFinite(naiveUtcMs)) return Number.NaN;
  return naiveUtcMs - utcOffsetSeconds * 1000;
}

function buildSnapshot(
  model: MultiModelDefinition,
  hourly: Record<string, unknown>,
  index: number,
): MultiModelSnapshot {
  const temperature = valuesFor(hourly, 'temperature_2m', model.id);
  const precipitation = valuesFor(hourly, 'precipitation', model.id);
  const wind = valuesFor(hourly, 'wind_speed_10m', model.id);
  const weatherCode = valuesFor(hourly, 'weather_code', model.id);
  const currentTemperatureC = finiteOrNull(temperature[index]);
  const currentWindKmh = finiteOrNull(wind[index]);
  const currentWeatherCode = finiteOrNull(weatherCode[index]);
  const available = currentTemperatureC !== null || currentWindKmh !== null || currentWeatherCode !== null;

  return {
    modelId: model.id,
    label: model.label,
    provider: model.provider,
    available,
    currentTemperatureC,
    currentWindKmh,
    currentWeatherCode,
    currentConditionGroup: conditionGroup(currentWeatherCode),
    precipitationNext3hMm: sumFinite(precipitation, index, 3),
    precipitationNext6hMm: sumFinite(precipitation, index, 6),
    maxWindNext6hKmh: maxFinite(wind, index, 6),
    minTemperatureNext6hC: minFinite(temperature, index, 6),
    maxTemperatureNext6hC: maxFinite(temperature, index, 6),
  };
}

function buildVerificationTargets(params: {
  model: MultiModelDefinition;
  hourly: Record<string, unknown>;
  times: unknown[];
  index: number;
  utcOffsetSeconds: number;
  issuedAt: string;
}): MultiModelForecastTarget[] {
  const { model, hourly, times, index, utcOffsetSeconds, issuedAt } = params;
  const temperature = valuesFor(hourly, 'temperature_2m', model.id);
  const precipitation = valuesFor(hourly, 'precipitation', model.id);
  const wind = valuesFor(hourly, 'wind_speed_10m', model.id);
  const weatherCode = valuesFor(hourly, 'weather_code', model.id);
  const targets: MultiModelForecastTarget[] = [];

  for (const leadHours of [1, 3, 6] as const) {
    const targetIndex = index + leadHours;
    const validTimeLocal = String(times[targetIndex] ?? '');
    if (!validTimeLocal) continue;

    const temperatureC = finiteOrNull(temperature[targetIndex]);
    const windKmh = finiteOrNull(wind[targetIndex]);
    const precipitationMm = finiteOrNull(precipitation[targetIndex]);
    const code = finiteOrNull(weatherCode[targetIndex]);
    const group = conditionGroup(code);
    const hasAnyValue = temperatureC !== null || windKmh !== null || precipitationMm !== null || code !== null;
    if (!hasAnyValue) continue;

    const predictedWet = precipitationMm === null && code === null
      ? null
      : (precipitationMm ?? 0) >= 0.1 || isWetCondition(group);

    targets.push({
      modelId: model.id,
      label: model.label,
      provider: model.provider,
      issuedAt,
      validTimeLocal,
      validTimeEpochMs: localTimeToEpochMs(validTimeLocal, utcOffsetSeconds),
      leadHours,
      temperatureC,
      windKmh,
      precipitationMm,
      weatherCode: code,
      conditionGroup: group,
      predictedWet,
    });
  }

  return targets;
}

function precipitationConsensus(models: MultiModelSnapshot[]): {
  consensus: MultiModelPrecipitationConsensus;
  label: string;
  wetVotes: number;
  dryVotes: number;
} {
  const comparable = models.filter(model => model.available && model.precipitationNext3hMm !== null);
  if (!comparable.length) {
    return { consensus: 'unavailable', label: 'Sin comparación de precipitación', wetVotes: 0, dryVotes: 0 };
  }
  const wetVotes = comparable.filter(model => (model.precipitationNext3hMm ?? 0) >= 0.2).length;
  const dryVotes = comparable.length - wetVotes;
  if (wetVotes === comparable.length) {
    return { consensus: 'wet', label: `${wetVotes}/${comparable.length} modelos: precipitación`, wetVotes, dryVotes };
  }
  if (dryVotes === comparable.length) {
    return { consensus: 'dry', label: `${dryVotes}/${comparable.length} modelos: sin precipitación relevante`, wetVotes, dryVotes };
  }
  return { consensus: 'mixed', label: `${wetVotes}/${comparable.length} modelos prevén precipitación`, wetVotes, dryVotes };
}

function agreement(params: {
  availableModels: number;
  temperatureSpread: number | null;
  precipitationSpread: number | null;
  windSpread: number | null;
  precipitationConsensus: MultiModelPrecipitationConsensus;
  conditionGroupCount: number;
}): { band: MultiModelAgreementBand; label: string; score: number | null; interpretation: string } {
  if (params.availableModels < 2) {
    return {
      band: 'unavailable',
      label: 'Comparación insuficiente',
      score: null,
      interpretation: 'No hay al menos dos modelos globales disponibles para calcular consenso real.',
    };
  }

  const tempPenalty = params.temperatureSpread === null ? 0 : Math.min(30, params.temperatureSpread * 8);
  const precipPenalty = params.precipitationSpread === null ? 0 : Math.min(30, params.precipitationSpread * 5);
  const windPenalty = params.windSpread === null ? 0 : Math.min(20, params.windSpread * 1.2);
  const wetDryPenalty = params.precipitationConsensus === 'mixed' ? 12 : 0;
  const conditionPenalty = Math.min(18, Math.max(0, params.conditionGroupCount - 1) * 6);
  const score = Math.max(0, Math.round(100 - tempPenalty - precipPenalty - windPenalty - wetDryPenalty - conditionPenalty));

  if (score >= 78) {
    return {
      band: 'high',
      label: 'Acuerdo multi-modelo alto',
      score,
      interpretation: 'Los modelos globales independientes muestran un escenario relativamente consistente para las próximas horas. Esto reduce dispersión de modelo, pero no elimina errores locales.',
    };
  }
  if (score >= 50) {
    return {
      band: 'moderate',
      label: 'Acuerdo multi-modelo moderado',
      score,
      interpretation: 'Existen diferencias relevantes entre modelos. ORBI debe tratar valores horarios exactos con cautela y vigilar observaciones/actualizaciones.',
    };
  }
  return {
    band: 'low',
    label: 'Acuerdo multi-modelo bajo',
    score,
    interpretation: 'Los modelos divergen de forma importante. No conviene presentar un único escenario como certeza; la observación DMC y nuevas actualizaciones ganan importancia.',
  };
}

export async function fetchTrueMultiModelConsensus(params: {
  latitude: number;
  longitude: number;
  timezone?: string;
}): Promise<MultiModelConsensusReport> {
  const { latitude, longitude, timezone = 'auto' } = params;
  const query = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    timezone,
    forecast_hours: '24',
    hourly: ['temperature_2m', 'precipitation', 'weather_code', 'wind_speed_10m'].join(','),
    models: ORBI_GLOBAL_FORECAST_MODELS.map(model => model.id).join(','),
    temperature_unit: 'celsius',
    wind_speed_unit: 'kmh',
    precipitation_unit: 'mm',
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 11000);

  try {
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?${query.toString()}`, {
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Open-Meteo multi-model error: ${response.status}`);
    const raw = await response.json();
    const hourly = (raw.hourly ?? {}) as Record<string, unknown>;
    const times = Array.isArray(hourly.time) ? hourly.time : [];
    const utcOffsetSeconds = finiteOrNull(raw.utc_offset_seconds) ?? 0;
    const index = currentIndex(times, utcOffsetSeconds);
    const generatedAt = new Date().toISOString();
    const models = ORBI_GLOBAL_FORECAST_MODELS.map(model => buildSnapshot(model, hourly, index));
    const verificationTargets = ORBI_GLOBAL_FORECAST_MODELS.flatMap(model => buildVerificationTargets({
      model,
      hourly,
      times,
      index,
      utcOffsetSeconds,
      issuedAt: generatedAt,
    }));
    const available = models.filter(model => model.available);
    const precip = precipitationConsensus(models);
    const temperatureSpreadNowC = spread(available.map(model => model.currentTemperatureC));
    const precipitationSpread6hMm = spread(available.map(model => model.precipitationNext6hMm));
    const windSpreadNowKmh = spread(available.map(model => model.currentWindKmh));
    const conditionGroups = Array.from(new Set(
      available.map(model => model.currentConditionGroup).filter(group => group !== 'sin_dato'),
    ));
    const agreementResult = agreement({
      availableModels: available.length,
      temperatureSpread: temperatureSpreadNowC,
      precipitationSpread: precipitationSpread6hMm,
      windSpread: windSpreadNowKmh,
      precipitationConsensus: precip.consensus,
      conditionGroupCount: conditionGroups.length,
    });

    return {
      provider: 'open_meteo_multi_model',
      sourceLabel: 'Open-Meteo · ECMWF IFS + NOAA GFS + DWD ICON + BOM ACCESS-G',
      requestedModels: ORBI_GLOBAL_FORECAST_MODELS.length,
      availableModels: available.length,
      agreementBand: agreementResult.band,
      agreementLabel: agreementResult.label,
      agreementScore: agreementResult.score,
      precipitationConsensus: precip.consensus,
      precipitationConsensusLabel: precip.label,
      wetVotes: precip.wetVotes,
      dryVotes: precip.dryVotes,
      temperatureSpreadNowC,
      precipitationSpread6hMm,
      windSpreadNowKmh,
      conditionGroups,
      interpretation: agreementResult.interpretation,
      models,
      verificationTargets,
      generatedAt,
    };
  } finally {
    clearTimeout(timeout);
  }
}

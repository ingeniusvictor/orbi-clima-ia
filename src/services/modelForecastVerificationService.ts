import { WeatherLocation } from '../types/weatherTypes';
import { DmcObservationSnapshot } from './dmcObservationService';
import { MultiModelForecastTarget } from './openMeteoMultiModelService';
import { buildVerificationLocationKey } from './weatherVerificationService';

const STORAGE_KEY = 'orbi_model_forecast_verification_v1';
const MAX_RECORDS = 1200;
const MAX_AGE_MS = 60 * 24 * 60 * 60 * 1000;
const OBSERVATION_MATCH_TOLERANCE_MS = 50 * 60 * 1000;

export type ModelSkillEvidence = 'insufficient' | 'emerging' | 'established';
export type ModelSkillBand = 'strong' | 'acceptable' | 'variable' | 'weak' | 'unrated';

export interface ModelForecastVerificationRecord {
  id: string;
  locationKey: string;
  locationName: string;
  modelId: string;
  modelLabel: string;
  provider: string;
  leadHours: 1 | 3 | 6;
  issuedAt: string;
  validTimeLocal: string;
  validTimeEpochMs: number;
  predictedTemperatureC: number | null;
  predictedWindKmh: number | null;
  predictedPrecipitationMm: number | null;
  predictedWeatherCode: number | null;
  predictedConditionGroup: string;
  predictedWet: boolean | null;
  status: 'pending' | 'verified' | 'expired';
  verifiedAt: string | null;
  stationId: string | null;
  stationName: string | null;
  stationDistanceKm: number | null;
  observationReportTime: string | null;
  observedTemperatureC: number | null;
  observedWindKmh: number | null;
  observedWet: boolean | null;
  temperatureErrorC: number | null;
  windErrorKmh: number | null;
  precipitationHit: boolean | null;
  weight: number;
}

export interface ModelSkillRow {
  modelId: string;
  label: string;
  provider: string;
  sampleCount: number;
  effectiveWeight: number;
  evidence: ModelSkillEvidence;
  evidenceLabel: string;
  skillBand: ModelSkillBand;
  skillLabel: string;
  skillScore: number | null;
  temperatureMaeC: number | null;
  windMaeKmh: number | null;
  precipitationAccuracyPct: number | null;
  precipitationSamples: number;
  lead1Samples: number;
  lead3Samples: number;
  lead6Samples: number;
  medianStationDistanceKm: number | null;
}

export interface ModelSkillSummary {
  locationKey: string;
  locationName: string;
  pendingForecasts: number;
  verifiedForecasts: number;
  models: ModelSkillRow[];
  comparableModels: number;
  provisionalLeaderModelId: string | null;
  provisionalLeaderLabel: string | null;
  rankingStatus: 'calibrating' | 'provisional' | 'established';
  rankingLabel: string;
  interpretation: string;
  lastVerificationAt: string | null;
}

function storageAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function finiteOrNull(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function readRecords(): ModelForecastVerificationRecord[] {
  if (!storageAvailable()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const cutoff = Date.now() - MAX_AGE_MS;
    return parsed.filter((record: ModelForecastVerificationRecord) => {
      return Number.isFinite(record?.validTimeEpochMs) && record.validTimeEpochMs >= cutoff;
    });
  } catch (error) {
    console.warn('Model forecast verification ledger could not be read:', error);
    return [];
  }
}

function writeRecords(records: ModelForecastVerificationRecord[]): void {
  if (!storageAvailable()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records.slice(-MAX_RECORDS)));
  } catch (error) {
    console.warn('Model forecast verification ledger could not be saved:', error);
  }
}

function recordId(locationKey: string, target: MultiModelForecastTarget): string {
  return `${locationKey}|${target.modelId}|${target.leadHours}|${target.validTimeEpochMs}`;
}

export function registerMultiModelForecastTargets(
  location: WeatherLocation,
  targets: MultiModelForecastTarget[],
): ModelSkillSummary {
  const locationKey = buildVerificationLocationKey(location);
  const records = readRecords();
  const ids = new Set(records.map(record => record.id));
  let changed = false;

  for (const target of targets) {
    if (!Number.isFinite(target.validTimeEpochMs) || target.validTimeEpochMs <= Date.now()) continue;
    const id = recordId(locationKey, target);
    if (ids.has(id)) continue;

    records.push({
      id,
      locationKey,
      locationName: location.name,
      modelId: target.modelId,
      modelLabel: target.label,
      provider: target.provider,
      leadHours: target.leadHours,
      issuedAt: target.issuedAt,
      validTimeLocal: target.validTimeLocal,
      validTimeEpochMs: target.validTimeEpochMs,
      predictedTemperatureC: target.temperatureC,
      predictedWindKmh: target.windKmh,
      predictedPrecipitationMm: target.precipitationMm,
      predictedWeatherCode: target.weatherCode,
      predictedConditionGroup: target.conditionGroup,
      predictedWet: target.predictedWet,
      status: 'pending',
      verifiedAt: null,
      stationId: null,
      stationName: null,
      stationDistanceKm: null,
      observationReportTime: null,
      observedTemperatureC: null,
      observedWindKmh: null,
      observedWet: null,
      temperatureErrorC: null,
      windErrorKmh: null,
      precipitationHit: null,
      weight: 0,
    });
    ids.add(id);
    changed = true;
  }

  if (changed) writeRecords(records);
  return summarizeModelSkill(location, records);
}

function observedWetSignal(observation: DmcObservationSnapshot): boolean | null {
  const hasSignal = observation.precipitationRecentMm !== null || observation.presentWeatherLabel !== null;
  if (!hasSignal) return null;
  return (observation.precipitationRecentMm ?? 0) > 0
    || /llovizna|lluvia|chubasco|tormenta|nieve/i.test(observation.presentWeatherLabel ?? '');
}

function verificationWeight(record: ModelForecastVerificationRecord, observation: DmcObservationSnapshot): number {
  const distanceFactor = observation.distanceKm <= 15
    ? 1
    : observation.distanceKm <= 30
      ? 0.9
      : observation.distanceKm <= 50
        ? 0.75
        : 0.6;
  const ageFactor = observation.ageMinutes <= 60 ? 1 : observation.ageMinutes <= 90 ? 0.85 : 0.7;
  const leadFactor = record.leadHours === 1 ? 1 : record.leadHours === 3 ? 0.95 : 0.9;
  return Math.round(distanceFactor * ageFactor * leadFactor * 100) / 100;
}

function absoluteError(predicted: number | null, observed: number | null): number | null {
  if (predicted === null || observed === null) return null;
  return Math.round(Math.abs(predicted - observed) * 10) / 10;
}

export function verifyMatureForecastsAgainstDmc(
  location: WeatherLocation,
  observation: DmcObservationSnapshot,
): ModelSkillSummary {
  const locationKey = buildVerificationLocationKey(location);
  const records = readRecords();
  const reportEpoch = Date.parse(observation.reportTime);
  if (!Number.isFinite(reportEpoch) || !observation.isFresh || observation.distanceKm > 75 || observation.quality === 'stale') {
    return summarizeModelSkill(location, records);
  }

  const wetObserved = observedWetSignal(observation);
  let changed = false;
  const now = Date.now();

  for (const record of records) {
    if (record.locationKey !== locationKey || record.status !== 'pending') continue;

    const deltaMs = Math.abs(record.validTimeEpochMs - reportEpoch);
    if (deltaMs <= OBSERVATION_MATCH_TOLERANCE_MS) {
      const issuedEpoch = Date.parse(record.issuedAt);
      if (Number.isFinite(issuedEpoch) && issuedEpoch >= reportEpoch) continue;

      record.status = 'verified';
      record.verifiedAt = new Date().toISOString();
      record.stationId = observation.stationId;
      record.stationName = observation.stationName;
      record.stationDistanceKm = observation.distanceKm;
      record.observationReportTime = observation.reportTime;
      record.observedTemperatureC = finiteOrNull(observation.temperatureC);
      record.observedWindKmh = finiteOrNull(observation.windSpeedKmh);
      record.observedWet = wetObserved;
      record.temperatureErrorC = absoluteError(record.predictedTemperatureC, record.observedTemperatureC);
      record.windErrorKmh = absoluteError(record.predictedWindKmh, record.observedWindKmh);
      record.precipitationHit = record.predictedWet === null || wetObserved === null
        ? null
        : record.predictedWet === wetObserved;
      record.weight = verificationWeight(record, observation);
      changed = true;
      continue;
    }

    if (now - record.validTimeEpochMs > 3 * 60 * 60 * 1000) {
      record.status = 'expired';
      changed = true;
    }
  }

  if (changed) writeRecords(records);
  return summarizeModelSkill(location, records);
}

function weightedMae(
  records: ModelForecastVerificationRecord[],
  selector: (record: ModelForecastVerificationRecord) => number | null,
): number | null {
  let total = 0;
  let weight = 0;
  for (const record of records) {
    const value = selector(record);
    if (value === null || record.weight <= 0) continue;
    total += value * record.weight;
    weight += record.weight;
  }
  return weight > 0 ? Math.round((total / weight) * 10) / 10 : null;
}

function precipitationAccuracy(records: ModelForecastVerificationRecord[]): { accuracy: number | null; count: number } {
  const comparable = records.filter(record => record.precipitationHit !== null);
  if (!comparable.length) return { accuracy: null, count: 0 };
  const weightedTotal = comparable.reduce((sum, record) => sum + record.weight, 0);
  if (weightedTotal <= 0) return { accuracy: null, count: comparable.length };
  const weightedHits = comparable.reduce((sum, record) => sum + (record.precipitationHit ? record.weight : 0), 0);
  return {
    accuracy: Math.round((weightedHits / weightedTotal) * 100),
    count: comparable.length,
  };
}

function median(values: number[]): number | null {
  const finite = values.filter(Number.isFinite).sort((a, b) => a - b);
  if (!finite.length) return null;
  const middle = Math.floor(finite.length / 2);
  const value = finite.length % 2 ? finite[middle] : (finite[middle - 1] + finite[middle]) / 2;
  return Math.round(value * 10) / 10;
}

function evidenceFor(records: ModelForecastVerificationRecord[], effectiveWeight: number): ModelSkillEvidence {
  if (records.length >= 24 && effectiveWeight >= 16) return 'established';
  if (records.length >= 8 && effectiveWeight >= 5) return 'emerging';
  return 'insufficient';
}

function skillScore(params: {
  evidence: ModelSkillEvidence;
  temperatureMaeC: number | null;
  windMaeKmh: number | null;
  precipitationAccuracyPct: number | null;
}): { band: ModelSkillBand; label: string; score: number | null } {
  if (params.evidence === 'insufficient') return { band: 'unrated', label: 'Calibrando', score: null };

  const penalties: number[] = [];
  if (params.temperatureMaeC !== null) penalties.push(Math.min(42, params.temperatureMaeC * 14));
  if (params.windMaeKmh !== null) penalties.push(Math.min(30, params.windMaeKmh * 1.4));
  if (params.precipitationAccuracyPct !== null) penalties.push(Math.min(40, (100 - params.precipitationAccuracyPct) * 0.55));
  if (!penalties.length) return { band: 'unrated', label: 'Sin métricas suficientes', score: null };

  let score = Math.max(0, Math.round(100 - penalties.reduce((sum, value) => sum + value, 0) / penalties.length));
  if (params.evidence === 'emerging') score = Math.min(89, score);

  if (score >= 82) return { band: 'strong', label: 'Skill observado sólido', score };
  if (score >= 68) return { band: 'acceptable', label: 'Skill observado aceptable', score };
  if (score >= 50) return { band: 'variable', label: 'Skill observado variable', score };
  return { band: 'weak', label: 'Skill observado débil', score };
}

function buildModelRow(records: ModelForecastVerificationRecord[]): ModelSkillRow {
  const first = records[0];
  const effectiveWeight = Math.round(records.reduce((sum, record) => sum + record.weight, 0) * 10) / 10;
  const evidence = evidenceFor(records, effectiveWeight);
  const temperatureMaeC = weightedMae(records, record => record.temperatureErrorC);
  const windMaeKmh = weightedMae(records, record => record.windErrorKmh);
  const precipitation = precipitationAccuracy(records);
  const skill = skillScore({
    evidence,
    temperatureMaeC,
    windMaeKmh,
    precipitationAccuracyPct: precipitation.accuracy,
  });

  return {
    modelId: first.modelId,
    label: first.modelLabel,
    provider: first.provider,
    sampleCount: records.length,
    effectiveWeight,
    evidence,
    evidenceLabel: evidence === 'established'
      ? `Evidencia estable · ${records.length} verificaciones`
      : evidence === 'emerging'
        ? `Evidencia en formación · ${records.length} verificaciones`
        : `Calibrando · ${records.length}/8 mínimas`,
    skillBand: skill.band,
    skillLabel: skill.label,
    skillScore: skill.score,
    temperatureMaeC,
    windMaeKmh,
    precipitationAccuracyPct: precipitation.accuracy,
    precipitationSamples: precipitation.count,
    lead1Samples: records.filter(record => record.leadHours === 1).length,
    lead3Samples: records.filter(record => record.leadHours === 3).length,
    lead6Samples: records.filter(record => record.leadHours === 6).length,
    medianStationDistanceKm: median(records.flatMap(record => record.stationDistanceKm === null ? [] : [record.stationDistanceKm])),
  };
}

export function summarizeModelSkill(
  location: WeatherLocation,
  suppliedRecords?: ModelForecastVerificationRecord[],
): ModelSkillSummary {
  const locationKey = buildVerificationLocationKey(location);
  const all = suppliedRecords ?? readRecords();
  const local = all.filter(record => record.locationKey === locationKey);
  const verified = local.filter(record => record.status === 'verified');
  const pendingForecasts = local.filter(record => record.status === 'pending').length;

  const byModel = new Map<string, ModelForecastVerificationRecord[]>();
  for (const record of verified) {
    const list = byModel.get(record.modelId) ?? [];
    list.push(record);
    byModel.set(record.modelId, list);
  }

  const models = Array.from(byModel.values())
    .filter(records => records.length > 0)
    .map(buildModelRow)
    .sort((a, b) => {
      if (a.skillScore === null && b.skillScore === null) return b.sampleCount - a.sampleCount;
      if (a.skillScore === null) return 1;
      if (b.skillScore === null) return -1;
      return b.skillScore - a.skillScore;
    });

  const comparable = models.filter(model => model.skillScore !== null && model.evidence !== 'insufficient');
  const established = comparable.filter(model => model.evidence === 'established');
  const rankingStatus: ModelSkillSummary['rankingStatus'] = established.length >= 2
    ? 'established'
    : comparable.length >= 2
      ? 'provisional'
      : 'calibrating';

  const leader = rankingStatus === 'calibrating' ? null : comparable[0] ?? null;
  const latestVerification = verified
    .map(record => record.verifiedAt)
    .filter((value): value is string => Boolean(value))
    .sort()
    .at(-1) ?? null;

  let interpretation: string;
  if (rankingStatus === 'calibrating') {
    interpretation = 'ORBI está acumulando forecasts prospectivos. Aún no hay al menos dos modelos con evidencia suficiente para compararlos de forma responsable.';
  } else if (rankingStatus === 'provisional') {
    interpretation = 'Existe una clasificación provisional basada en forecasts que fueron guardados antes de su hora válida y verificados después contra DMC. Todavía puede cambiar con más muestras.';
  } else {
    interpretation = 'La clasificación tiene evidencia estable en al menos dos modelos. Sigue describiendo desempeño histórico local y no garantiza cuál acertará el próximo evento.';
  }

  return {
    locationKey,
    locationName: location.name,
    pendingForecasts,
    verifiedForecasts: verified.length,
    models,
    comparableModels: comparable.length,
    provisionalLeaderModelId: leader?.modelId ?? null,
    provisionalLeaderLabel: leader?.label ?? null,
    rankingStatus,
    rankingLabel: rankingStatus === 'established'
      ? 'Ranking observado estable'
      : rankingStatus === 'provisional'
        ? 'Ranking observado provisional'
        : 'Calibración prospectiva',
    interpretation,
    lastVerificationAt: latestVerification,
  };
}

export function clearModelForecastVerificationForLocation(location: WeatherLocation): ModelSkillSummary {
  const locationKey = buildVerificationLocationKey(location);
  const remaining = readRecords().filter(record => record.locationKey !== locationKey);
  writeRecords(remaining);
  return summarizeModelSkill(location, remaining);
}

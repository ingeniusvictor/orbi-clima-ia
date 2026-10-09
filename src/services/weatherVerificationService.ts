import { CurrentWeather, WeatherLocation } from '../types/weatherTypes';
import { DmcObservationSnapshot, ObservationComparison } from './dmcObservationService';

const STORAGE_KEY = 'orbi_weather_verification_history_v1';
const MAX_SAMPLES = 180;
const MAX_AGE_MS = 45 * 24 * 60 * 60 * 1000;

export type VerificationEvidenceLevel = 'insufficient' | 'emerging' | 'established';
export type ObservedPerformanceBand = 'strong' | 'acceptable' | 'variable' | 'weak' | 'unrated';

export interface WeatherVerificationSample {
  id: string;
  recordedAt: string;
  locationKey: string;
  locationName: string;
  stationId: string;
  stationName: string;
  stationDistanceKm: number;
  observationAgeMinutes: number;
  observationReportTime: string;
  modelUpdatedAt: string;
  timeOffsetMinutes: number;
  comparisonScore: number | null;
  temperatureErrorC: number | null;
  humidityErrorPct: number | null;
  windErrorKmh: number | null;
  pressureErrorHpa: number | null;
  observedWet: boolean | null;
  modeledWet: boolean | null;
  weight: number;
}

export interface LocalVerificationSummary {
  locationKey: string;
  locationName: string;
  stationId: string | null;
  stationName: string | null;
  sampleCount: number;
  effectiveSampleWeight: number;
  evidenceLevel: VerificationEvidenceLevel;
  evidenceLabel: string;
  performanceBand: ObservedPerformanceBand;
  performanceLabel: string;
  performanceScore: number | null;
  temperatureMaeC: number | null;
  humidityMaePct: number | null;
  windMaeKmh: number | null;
  pressureMaeHpa: number | null;
  precipitationAccuracyPct: number | null;
  precipitationSamples: number;
  medianStationDistanceKm: number | null;
  latestSampleAt: string | null;
  latestObservationAgeMinutes: number | null;
  interpretation: string;
}

function browserStorageAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function roundCoordinate(value: number): string {
  return Number.isFinite(value) ? value.toFixed(2) : '0.00';
}

export function buildVerificationLocationKey(location: WeatherLocation): string {
  return `${roundCoordinate(location.latitude)},${roundCoordinate(location.longitude)}`;
}

function readSamples(): WeatherVerificationSample[] {
  if (!browserStorageAvailable()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const cutoff = Date.now() - MAX_AGE_MS;
    return parsed.filter((sample: WeatherVerificationSample) => {
      const timestamp = Date.parse(sample?.recordedAt ?? '');
      return Number.isFinite(timestamp) && timestamp >= cutoff;
    });
  } catch (error) {
    console.warn('Weather verification history could not be read:', error);
    return [];
  }
}

function writeSamples(samples: WeatherVerificationSample[]): void {
  if (!browserStorageAvailable()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(samples.slice(-MAX_SAMPLES)));
  } catch (error) {
    console.warn('Weather verification history could not be saved:', error);
  }
}

function absoluteOrNull(value: number | null): number | null {
  if (value === null || !Number.isFinite(value)) return null;
  return Math.abs(value);
}

function timeDifferenceMinutes(a: string, b: string): number {
  const aMs = Date.parse(a);
  const bMs = Date.parse(b);
  if (!Number.isFinite(aMs) || !Number.isFinite(bMs)) return 9999;
  return Math.round(Math.abs(aMs - bMs) / 60000);
}

function sampleWeight(observation: DmcObservationSnapshot, timeOffsetMinutes: number): number {
  const distanceFactor = observation.distanceKm <= 15
    ? 1
    : observation.distanceKm <= 30
      ? 0.9
      : observation.distanceKm <= 50
        ? 0.75
        : 0.6;
  const ageFactor = observation.ageMinutes <= 60 ? 1 : observation.ageMinutes <= 90 ? 0.85 : 0.7;
  const alignmentFactor = timeOffsetMinutes <= 30 ? 1 : timeOffsetMinutes <= 60 ? 0.85 : 0.65;
  return Math.round(distanceFactor * ageFactor * alignmentFactor * 100) / 100;
}

function precipitationPair(
  observation: DmcObservationSnapshot,
  current: CurrentWeather,
): { observedWet: boolean | null; modeledWet: boolean | null } {
  const hasObservedSignal = observation.precipitationRecentMm !== null || observation.presentWeatherLabel !== null;
  if (!hasObservedSignal) return { observedWet: null, modeledWet: null };

  const observedWet = (observation.precipitationRecentMm ?? 0) > 0
    || /llovizna|lluvia|chubasco|tormenta|nieve/i.test(observation.presentWeatherLabel ?? '');
  const modeledWet = current.precipitationMm > 0 || current.condition === 'rain' || current.condition === 'storm';
  return { observedWet, modeledWet };
}

export function recordDmcVerificationSample(params: {
  location: WeatherLocation;
  current: CurrentWeather;
  observation: DmcObservationSnapshot;
  comparison: ObservationComparison;
}): LocalVerificationSummary {
  const { location, current, observation, comparison } = params;
  const locationKey = buildVerificationLocationKey(location);
  const existing = readSamples();

  if (!observation.isFresh || observation.distanceKm > 75 || observation.quality === 'stale') {
    return summarizeVerificationHistory(location, existing);
  }

  const timeOffsetMinutes = timeDifferenceMinutes(observation.reportTime, current.updatedAt);
  if (timeOffsetMinutes > 150) {
    return summarizeVerificationHistory(location, existing);
  }

  const id = `${locationKey}|${observation.stationId}|${observation.reportTime}`;
  if (!existing.some(sample => sample.id === id)) {
    const precipitation = precipitationPair(observation, current);
    const sample: WeatherVerificationSample = {
      id,
      recordedAt: new Date().toISOString(),
      locationKey,
      locationName: location.name,
      stationId: observation.stationId,
      stationName: observation.stationName,
      stationDistanceKm: observation.distanceKm,
      observationAgeMinutes: observation.ageMinutes,
      observationReportTime: observation.reportTime,
      modelUpdatedAt: current.updatedAt,
      timeOffsetMinutes,
      comparisonScore: comparison.score,
      temperatureErrorC: absoluteOrNull(comparison.temperatureDeltaC),
      humidityErrorPct: absoluteOrNull(comparison.humidityDeltaPct),
      windErrorKmh: absoluteOrNull(comparison.windDeltaKmh),
      pressureErrorHpa: absoluteOrNull(comparison.pressureDeltaHpa),
      observedWet: precipitation.observedWet,
      modeledWet: precipitation.modeledWet,
      weight: sampleWeight(observation, timeOffsetMinutes),
    };
    existing.push(sample);
    writeSamples(existing);
  }

  return summarizeVerificationHistory(location, existing);
}

function weightedMae(
  samples: WeatherVerificationSample[],
  selector: (sample: WeatherVerificationSample) => number | null,
): number | null {
  let weightedError = 0;
  let totalWeight = 0;
  for (const sample of samples) {
    const value = selector(sample);
    if (value === null || !Number.isFinite(value)) continue;
    weightedError += Math.abs(value) * sample.weight;
    totalWeight += sample.weight;
  }
  if (totalWeight <= 0) return null;
  return Math.round((weightedError / totalWeight) * 10) / 10;
}

function median(values: number[]): number | null {
  const finite = values.filter(Number.isFinite).sort((a, b) => a - b);
  if (!finite.length) return null;
  const middle = Math.floor(finite.length / 2);
  if (finite.length % 2) return Math.round(finite[middle] * 10) / 10;
  return Math.round(((finite[middle - 1] + finite[middle]) / 2) * 10) / 10;
}

function precipitationAccuracy(samples: WeatherVerificationSample[]): { accuracy: number | null; count: number } {
  const comparable = samples.filter(sample => sample.observedWet !== null && sample.modeledWet !== null);
  if (!comparable.length) return { accuracy: null, count: 0 };
  const correct = comparable.filter(sample => sample.observedWet === sample.modeledWet).length;
  return {
    accuracy: Math.round((correct / comparable.length) * 100),
    count: comparable.length,
  };
}

function evidenceLevel(sampleCount: number, effectiveWeight: number): VerificationEvidenceLevel {
  if (sampleCount >= 15 && effectiveWeight >= 10) return 'established';
  if (sampleCount >= 5 && effectiveWeight >= 3) return 'emerging';
  return 'insufficient';
}

function evidenceLabel(level: VerificationEvidenceLevel, sampleCount: number): string {
  if (level === 'established') return `Evidencia local estable · ${sampleCount} muestras`;
  if (level === 'emerging') return `Evidencia local en formación · ${sampleCount} muestras`;
  return `Calibración pendiente · ${sampleCount} muestra${sampleCount === 1 ? '' : 's'}`;
}

function performanceFromMetrics(params: {
  evidence: VerificationEvidenceLevel;
  temperatureMaeC: number | null;
  humidityMaePct: number | null;
  windMaeKmh: number | null;
  pressureMaeHpa: number | null;
  precipitationAccuracyPct: number | null;
}): { band: ObservedPerformanceBand; label: string; score: number | null } {
  if (params.evidence === 'insufficient') {
    return { band: 'unrated', label: 'Aún sin calificar', score: null };
  }

  const penalties: number[] = [];
  if (params.temperatureMaeC !== null) penalties.push(Math.min(35, params.temperatureMaeC * 12));
  if (params.humidityMaePct !== null) penalties.push(Math.min(25, params.humidityMaePct * 1.1));
  if (params.windMaeKmh !== null) penalties.push(Math.min(22, params.windMaeKmh * 1.1));
  if (params.pressureMaeHpa !== null) penalties.push(Math.min(12, params.pressureMaeHpa * 1.5));
  if (params.precipitationAccuracyPct !== null) penalties.push(Math.min(30, (100 - params.precipitationAccuracyPct) * 0.45));

  if (!penalties.length) {
    return { band: 'unrated', label: 'Datos insuficientes', score: null };
  }

  const averagePenalty = penalties.reduce((sum, value) => sum + value, 0) / penalties.length;
  let score = Math.max(0, Math.round(100 - averagePenalty));
  if (params.evidence === 'emerging') score = Math.min(score, 89);

  if (score >= 82) return { band: 'strong', label: 'Desempeño observado sólido', score };
  if (score >= 68) return { band: 'acceptable', label: 'Desempeño observado aceptable', score };
  if (score >= 50) return { band: 'variable', label: 'Desempeño observado variable', score };
  return { band: 'weak', label: 'Desempeño observado débil', score };
}

export function summarizeVerificationHistory(
  location: WeatherLocation,
  suppliedSamples?: WeatherVerificationSample[],
): LocalVerificationSummary {
  const locationKey = buildVerificationLocationKey(location);
  const samples = (suppliedSamples ?? readSamples())
    .filter(sample => sample.locationKey === locationKey)
    .sort((a, b) => Date.parse(a.recordedAt) - Date.parse(b.recordedAt));

  const effectiveSampleWeight = Math.round(samples.reduce((sum, sample) => sum + sample.weight, 0) * 10) / 10;
  const evidence = evidenceLevel(samples.length, effectiveSampleWeight);
  const temperatureMaeC = weightedMae(samples, sample => sample.temperatureErrorC);
  const humidityMaePct = weightedMae(samples, sample => sample.humidityErrorPct);
  const windMaeKmh = weightedMae(samples, sample => sample.windErrorKmh);
  const pressureMaeHpa = weightedMae(samples, sample => sample.pressureErrorHpa);
  const precip = precipitationAccuracy(samples);
  const performance = performanceFromMetrics({
    evidence,
    temperatureMaeC,
    humidityMaePct,
    windMaeKmh,
    pressureMaeHpa,
    precipitationAccuracyPct: precip.accuracy,
  });
  const latest = samples[samples.length - 1] ?? null;

  let interpretation: string;
  if (evidence === 'insufficient') {
    interpretation = 'ORBI todavía no tiene suficientes comparaciones estación-modelo en esta ubicación para calificar el desempeño local. Se mostrará procedencia y frescura sin inventar un score de precisión.';
  } else if (performance.band === 'strong') {
    interpretation = 'Las comparaciones observadas disponibles muestran buena concordancia local. Esto describe el historial medido y no garantiza que cada pronóstico futuro acierte.';
  } else if (performance.band === 'acceptable') {
    interpretation = 'El historial observado es razonablemente consistente, aunque persisten diferencias entre estación y modelo que deben considerarse en decisiones sensibles.';
  } else if (performance.band === 'variable') {
    interpretation = 'La concordancia local cambia de forma apreciable. ORBI debe mostrar cautela y priorizar observaciones/actualizaciones recientes para describir el estado actual.';
  } else {
    interpretation = 'El historial observado muestra discrepancias relevantes. ORBI no debe presentar alta confianza local hasta acumular evidencia mejor o usar modelos/fuentes que rindan mejor en esta zona.';
  }

  return {
    locationKey,
    locationName: location.name,
    stationId: latest?.stationId ?? null,
    stationName: latest?.stationName ?? null,
    sampleCount: samples.length,
    effectiveSampleWeight,
    evidenceLevel: evidence,
    evidenceLabel: evidenceLabel(evidence, samples.length),
    performanceBand: performance.band,
    performanceLabel: performance.label,
    performanceScore: performance.score,
    temperatureMaeC,
    humidityMaePct,
    windMaeKmh,
    pressureMaeHpa,
    precipitationAccuracyPct: precip.accuracy,
    precipitationSamples: precip.count,
    medianStationDistanceKm: median(samples.map(sample => sample.stationDistanceKm)),
    latestSampleAt: latest?.recordedAt ?? null,
    latestObservationAgeMinutes: latest?.observationAgeMinutes ?? null,
    interpretation,
  };
}

export function clearVerificationHistoryForLocation(location: WeatherLocation): LocalVerificationSummary {
  const key = buildVerificationLocationKey(location);
  const remaining = readSamples().filter(sample => sample.locationKey !== key);
  writeSamples(remaining);
  return summarizeVerificationHistory(location, remaining);
}

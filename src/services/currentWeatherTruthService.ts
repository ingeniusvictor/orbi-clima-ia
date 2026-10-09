import { OpenMeteoRawResponse, WeatherLocation } from '../types/weatherTypes';
import {
  DmcObservationSnapshot,
  fetchNearestDmcObservation,
} from './dmcObservationService';
import {
  fetchTrueMultiModelConsensus,
  MultiModelConsensusReport,
} from './openMeteoMultiModelService';

export type CurrentWeatherTruthBand =
  | 'observed'
  | 'corroborated'
  | 'conflicted'
  | 'model_only';

export interface CurrentWeatherTruthContext {
  dmc: DmcObservationSnapshot | null;
  multiModel: MultiModelConsensusReport | null;
  generatedAt: string;
}

export interface CurrentWeatherTruthMetadata {
  band: CurrentWeatherTruthBand;
  label: string;
  detail: string;
  conditionLabel: string;
  originalWeatherCode: number;
  resolvedWeatherCode: number;
  originalTemperatureC: number | null;
  resolvedTemperatureC: number | null;
  originalPrecipitationMm: number;
  resolvedPrecipitationMm: number;
  temperatureStrategy: 'dmc_observed' | 'multi_model_median' | 'primary_model';
  stationName: string | null;
  stationDistanceKm: number | null;
  stationAgeMinutes: number | null;
  stationQuality: string | null;
  multiModelAvailable: number;
  multiModelWetVotes: number;
  multiModelDryVotes: number;
  multiModelCurrentConsensus: 'wet' | 'dry' | 'mixed' | 'unavailable';
}

type RawWithTruth = OpenMeteoRawResponse & {
  orbi_current_truth?: CurrentWeatherTruthMetadata;
};

const WET_GROUPS = new Set([
  'llovizna',
  'llovizna_engelante',
  'lluvia',
  'lluvia_engelante',
  'chubascos',
  'nieve',
  'nieve_chubascos',
  'tormenta',
]);

function finiteOrNull(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function isChileCoordinate(location: WeatherLocation): boolean {
  return location.latitude >= -56
    && location.latitude <= -17
    && location.longitude >= -76
    && location.longitude <= -66;
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, fallback: T): Promise<T> {
  return await Promise.race([
    promise.catch(() => fallback),
    new Promise<T>(resolve => setTimeout(() => resolve(fallback), timeoutMs)),
  ]);
}

export async function fetchCurrentWeatherTruthContext(
  location: WeatherLocation,
): Promise<CurrentWeatherTruthContext> {
  const dmcPromise = isChileCoordinate(location)
    ? withTimeout(fetchNearestDmcObservation(location), 4500, null)
    : Promise.resolve(null);

  const multiModelPromise = withTimeout(
    fetchTrueMultiModelConsensus({
      latitude: location.latitude,
      longitude: location.longitude,
      timezone: location.timezone || 'auto',
    }),
    4500,
    null,
  );

  const [dmc, multiModel] = await Promise.all([dmcPromise, multiModelPromise]);
  return {
    dmc,
    multiModel,
    generatedAt: new Date().toISOString(),
  };
}

function isWetCode(code: number): boolean {
  return [
    51, 53, 55, 56, 57,
    61, 63, 65, 66, 67,
    71, 73, 75, 77,
    80, 81, 82, 85, 86,
    95, 96, 99,
  ].includes(code);
}

function modelCurrentConsensus(report: MultiModelConsensusReport | null): {
  available: number;
  wetVotes: number;
  dryVotes: number;
  consensus: 'wet' | 'dry' | 'mixed' | 'unavailable';
  dryCode: number | null;
  medianTemperatureC: number | null;
  temperatureSpreadC: number | null;
} {
  if (!report) {
    return {
      available: 0,
      wetVotes: 0,
      dryVotes: 0,
      consensus: 'unavailable',
      dryCode: null,
      medianTemperatureC: null,
      temperatureSpreadC: null,
    };
  }

  const availableModels = report.models.filter(model => model.available && model.currentWeatherCode !== null);
  const wetVotes = availableModels.filter(model => WET_GROUPS.has(model.currentConditionGroup)).length;
  const dryVotes = availableModels.length - wetVotes;
  const consensus = availableModels.length < 3
    ? 'unavailable'
    : wetVotes / availableModels.length >= 0.67
      ? 'wet'
      : dryVotes / availableModels.length >= 0.67
        ? 'dry'
        : 'mixed';

  const dryGroups = availableModels
    .filter(model => !WET_GROUPS.has(model.currentConditionGroup))
    .map(model => model.currentConditionGroup);
  const counts = new Map<string, number>();
  dryGroups.forEach(group => counts.set(group, (counts.get(group) ?? 0) + 1));
  const dominantDryGroup = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  const dryCodeByGroup: Record<string, number> = {
    despejado: 0,
    mayormente_despejado: 1,
    parcial: 2,
    nublado: 3,
    niebla: 45,
  };

  const temperatures = report.models
    .map(model => model.currentTemperatureC)
    .filter((value): value is number => value !== null && Number.isFinite(value))
    .sort((a, b) => a - b);
  const middle = Math.floor(temperatures.length / 2);
  const medianTemperatureC = temperatures.length === 0
    ? null
    : temperatures.length % 2 === 0
      ? (temperatures[middle - 1] + temperatures[middle]) / 2
      : temperatures[middle];
  const temperatureSpreadC = temperatures.length >= 2
    ? temperatures[temperatures.length - 1] - temperatures[0]
    : null;

  return {
    available: availableModels.length,
    wetVotes,
    dryVotes,
    consensus,
    dryCode: dominantDryGroup ? (dryCodeByGroup[dominantDryGroup] ?? 3) : null,
    medianTemperatureC,
    temperatureSpreadC,
  };
}

function observedPrecipitationState(observation: DmcObservationSnapshot | null): 'wet' | 'dry' | 'unknown' {
  if (!observation || !observation.isFresh) return 'unknown';
  const label = observation.presentWeatherLabel ?? '';
  if (/llovizna|lluvia|chubasco|tormenta|nieve/i.test(label)) return 'wet';
  if (observation.precipitationRecentMm !== null) {
    return observation.precipitationRecentMm > 0.05 ? 'wet' : 'dry';
  }
  return 'unknown';
}

function observedWeatherCode(observation: DmcObservationSnapshot): number {
  const label = (observation.presentWeatherLabel ?? '').toLowerCase();
  if (label.includes('tormenta')) return 95;
  if (label.includes('chubasco')) return 80;
  if (label.includes('llovizna')) return 51;
  if (label.includes('lluvia')) return 61;
  if (label.includes('nieve')) return 71;
  if (label.includes('niebla') || label.includes('neblina')) return 45;
  const cloud = observation.cloudCoverPct;
  if (cloud !== null) {
    if (cloud <= 15) return 0;
    if (cloud <= 55) return 2;
    return 3;
  }
  return 3;
}

function dryCodeFromCloudCover(current: Record<string, any>): number {
  const cloudCover = finiteOrNull(current.cloud_cover);
  if (cloudCover === null) return 3;
  if (cloudCover <= 15) return 0;
  if (cloudCover <= 55) return 2;
  return 3;
}

function humanLabelForCode(code: number): string {
  const labels: Record<number, string> = {
    0: 'Despejado',
    1: 'Mayormente despejado',
    2: 'Parcialmente nublado',
    3: 'Nublado',
    45: 'Niebla',
    51: 'Llovizna observada',
    61: 'Lluvia observada',
    71: 'Nieve observada',
    80: 'Chubasco observado',
    95: 'Tormenta observada',
  };
  return labels[code] ?? (isWetCode(code) ? 'Precipitación modelada' : 'Condición modelada');
}

function stationCanControlCurrent(observation: DmcObservationSnapshot | null): boolean {
  return !!observation
    && observation.isFresh
    && observation.quality === 'strong'
    && observation.distanceKm <= 25
    && observation.ageMinutes <= 90;
}

function applyObservedScalarFields(current: Record<string, any>, observation: DmcObservationSnapshot): void {
  if (observation.distanceKm > 15 || observation.ageMinutes > 90) return;

  const oldTemperature = finiteOrNull(current.temperature_2m);
  if (observation.temperatureC !== null) {
    current.temperature_2m = observation.temperatureC;
    const oldFeels = finiteOrNull(current.apparent_temperature);
    if (oldTemperature !== null && oldFeels !== null) {
      current.apparent_temperature = oldFeels + (observation.temperatureC - oldTemperature);
    }
  }
  if (observation.humidityPct !== null) current.relative_humidity_2m = observation.humidityPct;
  if (observation.windSpeedKmh !== null) current.wind_speed_10m = observation.windSpeedKmh;
  if (observation.pressureHpa !== null) current.pressure_msl = observation.pressureHpa;
  if (observation.visibilityM !== null) current.visibility = observation.visibilityM;
  if (observation.cloudCoverPct !== null) current.cloud_cover = observation.cloudCoverPct;
}

function clearCurrentPrecipitation(current: Record<string, any>): void {
  current.precipitation = 0;
  current.rain = 0;
  current.showers = 0;
}

export function applyCurrentWeatherTruth(
  rawInput: OpenMeteoRawResponse,
  context: CurrentWeatherTruthContext,
): OpenMeteoRawResponse {
  const raw = rawInput as RawWithTruth;
  const current = { ...(raw.current ?? {}) } as Record<string, any>;
  raw.current = current;

  const originalCode = finiteOrNull(current.weather_code) ?? 3;
  const originalTemperatureC = finiteOrNull(current.temperature_2m);
  const originalPrecipitationMm = finiteOrNull(current.precipitation) ?? 0;
  const modelWet = isWetCode(originalCode) || originalPrecipitationMm > 0.05;

  const multi = modelCurrentConsensus(context.multiModel);
  const observedState = observedPrecipitationState(context.dmc);
  const strongObservation = stationCanControlCurrent(context.dmc);

  let resolvedCode = originalCode;
  let band: CurrentWeatherTruthBand = 'model_only';
  let label = 'Modelo actual sin corroboración local';
  let detail = 'La condición actual proviene de un modelo meteorológico; no equivale a una observación física en el punto GPS.';

  if (strongObservation && context.dmc) {
    applyObservedScalarFields(current, context.dmc);

    if (observedState === 'wet') {
      resolvedCode = observedWeatherCode(context.dmc);
      current.weather_code = resolvedCode;
      current.precipitation = Math.max(originalPrecipitationMm, context.dmc.precipitationRecentMm ?? 0.1);
      current.rain = Math.max(finiteOrNull(current.rain) ?? 0, context.dmc.precipitationRecentMm ?? 0.1);
      band = 'observed';
      label = 'Condición corroborada por observación DMC';
      detail = `${context.dmc.stationName} · ${context.dmc.distanceKm.toFixed(1)} km · ${context.dmc.ageMinutes} min de antigüedad.`;
    } else if (observedState === 'dry') {
      if (modelWet && (multi.consensus === 'dry' || context.dmc.distanceKm <= 15)) {
        resolvedCode = multi.dryCode ?? observedWeatherCode(context.dmc);
        current.weather_code = resolvedCode;
        clearCurrentPrecipitation(current);
        band = 'observed';
        label = 'Condición seca corroborada localmente';
        detail = 'DMC no observa precipitación y el modelo de lluvia fue descartado para la lectura actual.';
      } else if (!modelWet) {
        band = 'corroborated';
        label = 'Condición seca corroborada';
        detail = 'Modelo y observación DMC coinciden en ausencia de precipitación actual.';
      } else {
        band = 'conflicted';
        label = 'Precipitación modelada · no confirmada';
        detail = 'El modelo indica precipitación, pero la estación DMC cercana no la confirma todavía.';
      }
    }
  } else if (modelWet && multi.consensus === 'dry') {
    if (originalPrecipitationMm <= 0.5) {
      resolvedCode = multi.dryCode ?? dryCodeFromCloudCover(current);
      current.weather_code = resolvedCode;
      clearCurrentPrecipitation(current);
    }
    band = 'conflicted';
    label = 'Precipitación modelada · consenso no la confirma';
    detail = `${multi.dryVotes}/${multi.available} modelos independientes indican condición seca en la hora actual.`;
  } else if (modelWet && multi.consensus === 'wet') {
    band = 'corroborated';
    label = 'Precipitación corroborada por modelos';
    detail = `${multi.wetVotes}/${multi.available} modelos independientes coinciden en condición húmeda actual.`;
  } else if (!modelWet && multi.consensus === 'dry') {
    band = 'corroborated';
    label = 'Condición seca corroborada por modelos';
    detail = `${multi.dryVotes}/${multi.available} modelos independientes coinciden en condición seca actual.`;
  } else if (modelWet) {
    band = 'conflicted';
    label = 'Precipitación modelada · sin corroboración suficiente';
    detail = 'ORBI evita tratar una señal modelada aislada como lluvia activa confirmada.';

    // The protected Golden Orb intentionally has only coarse visual themes.
    // A weak, uncorroborated model signal must therefore not be promoted to
    // its strong "active rain" state. Keep the original amount in truth
    // metadata while presenting current conditions conservatively.
    if (originalPrecipitationMm <= 0.5) {
      resolvedCode = dryCodeFromCloudCover(current);
      current.weather_code = resolvedCode;
      clearCurrentPrecipitation(current);
    }
  }

  current.weather_code = resolvedCode;

  let temperatureStrategy: CurrentWeatherTruthMetadata['temperatureStrategy'] = 'primary_model';
  if (
    strongObservation
    && context.dmc !== null
    && context.dmc.temperatureC !== null
    && context.dmc.distanceKm <= 15
  ) {
    temperatureStrategy = 'dmc_observed';
  } else if (
    multi.medianTemperatureC !== null
    && multi.temperatureSpreadC !== null
    && multi.temperatureSpreadC <= 2.5
    && originalTemperatureC !== null
    && Math.abs(originalTemperatureC - multi.medianTemperatureC) >= 2
  ) {
    const delta = multi.medianTemperatureC - originalTemperatureC;
    current.temperature_2m = multi.medianTemperatureC;
    const feels = finiteOrNull(current.apparent_temperature);
    if (feels !== null) current.apparent_temperature = feels + delta;
    temperatureStrategy = 'multi_model_median';
  }

  const resolvedTemperatureC = finiteOrNull(current.temperature_2m);
  const resolvedPrecipitationMm = finiteOrNull(current.precipitation) ?? 0;
  raw.orbi_current_truth = {
    band,
    label,
    detail,
    conditionLabel: humanLabelForCode(resolvedCode),
    originalWeatherCode: originalCode,
    resolvedWeatherCode: resolvedCode,
    originalTemperatureC,
    resolvedTemperatureC,
    originalPrecipitationMm,
    resolvedPrecipitationMm,
    temperatureStrategy,
    stationName: context.dmc?.stationName ?? null,
    stationDistanceKm: context.dmc?.distanceKm ?? null,
    stationAgeMinutes: context.dmc?.ageMinutes ?? null,
    stationQuality: context.dmc?.quality ?? null,
    multiModelAvailable: multi.available,
    multiModelWetVotes: multi.wetVotes,
    multiModelDryVotes: multi.dryVotes,
    multiModelCurrentConsensus: multi.consensus,
  };

  return raw;
}

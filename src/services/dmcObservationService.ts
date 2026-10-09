import { CurrentWeather, WeatherLocation } from '../types/weatherTypes';

const DMC_WIS2_BASE = 'https://wischile.meteochile.gob.cl/oapi';
const SYNOP_HOURLY_COLLECTION = 'urn:wmo:md:cl-meteochile:synop-onehours';

export type DmcObservationQuality = 'strong' | 'contextual' | 'distant' | 'stale';
export type ObservationAgreementBand = 'close' | 'mixed' | 'divergent' | 'unavailable';

export interface DmcObservationSnapshot {
  provider: 'dmc_meteochile_wis2';
  sourceLabel: string;
  stationId: string;
  stationName: string;
  stationLatitude: number;
  stationLongitude: number;
  distanceKm: number;
  reportTime: string;
  ageMinutes: number;
  quality: DmcObservationQuality;
  isFresh: boolean;
  temperatureC: number | null;
  dewPointC: number | null;
  humidityPct: number | null;
  windSpeedKmh: number | null;
  windDirectionDeg: number | null;
  pressureHpa: number | null;
  visibilityM: number | null;
  precipitationRecentMm: number | null;
  precipitation24hMm: number | null;
  cloudCoverPct: number | null;
  presentWeatherRaw: string | null;
  presentWeatherLabel: string | null;
  limitations: string[];
}

export interface ObservationComparison {
  band: ObservationAgreementBand;
  label: string;
  score: number | null;
  temperatureDeltaC: number | null;
  humidityDeltaPct: number | null;
  windDeltaKmh: number | null;
  pressureDeltaHpa: number | null;
  precipitationSignal: 'agree_wet' | 'agree_dry' | 'station_wetter' | 'model_wetter' | 'unknown';
  interpretation: string;
}

type GeoJsonFeature = {
  id?: string | number;
  geometry?: { type?: string; coordinates?: unknown } | null;
  properties?: Record<string, unknown>;
};

type GeoJsonCollection = {
  features?: GeoJsonFeature[];
};

interface StationCandidate {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
}

function finiteOrNull(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function stringOrNull(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

async function fetchJson(url: string, timeoutMs = 9000): Promise<unknown> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/geo+json, application/json' },
    });
    if (!response.ok) {
      throw new Error(`DMC WIS2 HTTP ${response.status}`);
    }
    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const earthRadiusKm = 6371;
  const toRad = (value: number) => value * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * earthRadiusKm * Math.asin(Math.sqrt(a));
}

function bboxForRadius(latitude: number, longitude: number, radiusKm: number): string {
  const latDelta = radiusKm / 111;
  const cosLat = Math.max(0.2, Math.cos(latitude * Math.PI / 180));
  const lonDelta = radiusKm / (111 * cosLat);
  return [
    longitude - lonDelta,
    latitude - latDelta,
    longitude + lonDelta,
    latitude + latDelta,
  ].map(value => value.toFixed(5)).join(',');
}

function coordinatesOf(feature: GeoJsonFeature): [number, number] | null {
  const coordinates = feature.geometry?.coordinates;
  if (!Array.isArray(coordinates) || coordinates.length < 2) return null;
  const longitude = Number(coordinates[0]);
  const latitude = Number(coordinates[1]);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  return [longitude, latitude];
}

function stationFromFeature(feature: GeoJsonFeature, location: WeatherLocation): StationCandidate | null {
  const coordinates = coordinatesOf(feature);
  if (!coordinates) return null;
  const properties = feature.properties ?? {};
  const id = String(properties.id ?? feature.id ?? '').trim();
  if (!id) return null;

  const topicText = String(properties.topics ?? properties.topic ?? '').toLowerCase();
  const status = String(properties.status ?? '').toLowerCase();
  if (status && status !== 'operational') return null;
  if (topicText && !topicText.includes('synop')) return null;

  const [longitude, latitude] = coordinates;
  return {
    id,
    name: String(properties.name ?? properties.station_name ?? id),
    latitude,
    longitude,
    distanceKm: haversineKm(location.latitude, location.longitude, latitude, longitude),
  };
}

async function findNearestDmcStation(location: WeatherLocation): Promise<StationCandidate | null> {
  for (const radiusKm of [30, 75, 150]) {
    const query = new URLSearchParams({
      f: 'json',
      limit: '200',
      bbox: bboxForRadius(location.latitude, location.longitude, radiusKm),
    });
    const raw = await fetchJson(`${DMC_WIS2_BASE}/collections/stations/items?${query.toString()}`) as GeoJsonCollection;
    const candidates = (raw.features ?? [])
      .map(feature => stationFromFeature(feature, location))
      .filter((station): station is StationCandidate => station !== null)
      .filter(station => station.distanceKm <= radiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    if (candidates.length) return candidates[0];
  }
  return null;
}

function isoHoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString().replace(/\.\d{3}Z$/, 'Z');
}

function isoNow(): string {
  return new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
}

async function fetchStationObservations(station: StationCandidate): Promise<GeoJsonFeature[]> {
  const common = {
    f: 'json',
    limit: '500',
    datetime: `${isoHoursAgo(6)}/${isoNow()}`,
  };

  const stationQuery = new URLSearchParams({
    ...common,
    wigos_station_identifier: station.id,
  });

  try {
    const raw = await fetchJson(
      `${DMC_WIS2_BASE}/collections/${encodeURIComponent(SYNOP_HOURLY_COLLECTION)}/items?${stationQuery.toString()}`,
    ) as GeoJsonCollection;
    const matches = (raw.features ?? []).filter(feature => {
      return String(feature.properties?.wigos_station_identifier ?? '') === station.id;
    });
    if (matches.length) return matches;
  } catch (error) {
    console.warn('DMC WIS2 station-filter query unavailable; trying bbox fallback.', error);
  }

  const bboxQuery = new URLSearchParams({
    ...common,
    bbox: bboxForRadius(station.latitude, station.longitude, 4),
  });
  const fallbackRaw = await fetchJson(
    `${DMC_WIS2_BASE}/collections/${encodeURIComponent(SYNOP_HOURLY_COLLECTION)}/items?${bboxQuery.toString()}`,
  ) as GeoJsonCollection;

  return (fallbackRaw.features ?? []).filter(feature => {
    return String(feature.properties?.wigos_station_identifier ?? '') === station.id;
  });
}

function latestReport(features: GeoJsonFeature[]): GeoJsonFeature[] {
  const byReport = new Map<string, GeoJsonFeature[]>();
  for (const feature of features) {
    const properties = feature.properties ?? {};
    const reportId = String(properties.reportId ?? properties.report_id ?? properties.reportTime ?? '');
    if (!reportId) continue;
    const list = byReport.get(reportId) ?? [];
    list.push(feature);
    byReport.set(reportId, list);
  }

  const reports = Array.from(byReport.values());
  reports.sort((a, b) => {
    const aTime = Date.parse(String(a[0]?.properties?.reportTime ?? a[0]?.properties?.phenomenonTime ?? 0));
    const bTime = Date.parse(String(b[0]?.properties?.reportTime ?? b[0]?.properties?.phenomenonTime ?? 0));
    return (Number.isFinite(bTime) ? bTime : 0) - (Number.isFinite(aTime) ? aTime : 0);
  });
  return reports[0] ?? [];
}

function observationByName(features: GeoJsonFeature[], names: string[]): GeoJsonFeature | null {
  const normalizedNames = names.map(name => name.toLowerCase());
  return features.find(feature => {
    const name = String(feature.properties?.name ?? '').toLowerCase();
    return normalizedNames.some(expected => name === expected || name.startsWith(expected));
  }) ?? null;
}

function valueByName(features: GeoJsonFeature[], names: string[]): number | null {
  const feature = observationByName(features, names);
  return finiteOrNull(feature?.properties?.value);
}

function translatePresentWeather(raw: string | null): string | null {
  if (!raw) return null;
  const upper = raw.toUpperCase();
  if (upper.includes('THUNDER')) return 'Tormenta observada';
  if (upper.includes('FREEZING') && upper.includes('RAIN')) return 'Lluvia engelante observada';
  if (upper.includes('FREEZING') && upper.includes('DRIZZLE')) return 'Llovizna engelante observada';
  if (upper.includes('DRIZZLE')) return 'Llovizna observada';
  if (upper.includes('SHOWER')) return 'Chubasco observado';
  if (upper.includes('RAIN')) return 'Lluvia observada';
  if (upper.includes('SNOW')) return 'Nieve observada';
  if (upper.includes('FOG')) return 'Niebla observada';
  if (upper.includes('MIST')) return 'Neblina observada';
  return 'Condición observada disponible';
}

function presentWeather(features: GeoJsonFeature[]): { raw: string | null; label: string | null } {
  const feature = observationByName(features, ['present_weather']);
  const raw = stringOrNull(feature?.properties?.description) ?? stringOrNull(feature?.properties?.value);
  return { raw, label: translatePresentWeather(raw) };
}

function classifyQuality(distanceKm: number, ageMinutes: number): DmcObservationQuality {
  if (ageMinutes > 150) return 'stale';
  if (distanceKm <= 25 && ageMinutes <= 90) return 'strong';
  if (distanceKm <= 75 && ageMinutes <= 120) return 'contextual';
  return 'distant';
}

export async function fetchNearestDmcObservation(location: WeatherLocation): Promise<DmcObservationSnapshot | null> {
  if ((location.country || '').toLowerCase() !== 'chile') return null;

  const station = await findNearestDmcStation(location);
  if (!station) return null;

  const observations = await fetchStationObservations(station);
  const report = latestReport(observations);
  if (!report.length) return null;

  const reportTime = String(report[0]?.properties?.reportTime ?? report[0]?.properties?.phenomenonTime ?? '');
  const reportTimestamp = Date.parse(reportTime);
  const ageMinutes = Number.isFinite(reportTimestamp)
    ? Math.max(0, Math.round((Date.now() - reportTimestamp) / 60000))
    : 9999;
  const weather = presentWeather(report);

  const windSpeedMs = valueByName(report, ['wind_speed']);
  const precipitationRecent = valueByName(report, ['total_precipitation_or_total_water_equivalent']);
  const precipitation24h = valueByName(report, ['total_precipitation_past24hours']);
  const quality = classifyQuality(station.distanceKm, ageMinutes);

  return {
    provider: 'dmc_meteochile_wis2',
    sourceLabel: 'Dirección Meteorológica de Chile · WIS2 SYNOP horario',
    stationId: station.id,
    stationName: station.name,
    stationLatitude: station.latitude,
    stationLongitude: station.longitude,
    distanceKm: Math.round(station.distanceKm * 10) / 10,
    reportTime,
    ageMinutes,
    quality,
    isFresh: ageMinutes <= 120,
    temperatureC: valueByName(report, ['air_temperature']),
    dewPointC: valueByName(report, ['dewpoint_temperature']),
    humidityPct: valueByName(report, ['relative_humidity']),
    windSpeedKmh: windSpeedMs === null ? null : Math.round(windSpeedMs * 36) / 10,
    windDirectionDeg: valueByName(report, ['wind_direction']),
    pressureHpa: valueByName(report, ['pressure_reduced_to_mean_sea_level', 'non_coordinate_pressure']),
    visibilityM: valueByName(report, ['horizontal_visibility']),
    precipitationRecentMm: precipitationRecent,
    precipitation24hMm: precipitation24h,
    cloudCoverPct: valueByName(report, ['cloud_cover_total']),
    presentWeatherRaw: weather.raw,
    presentWeatherLabel: weather.label,
    limitations: [
      'La estación DMC representa su emplazamiento físico; no necesariamente reproduce el microclima exacto de la ubicación GPS.',
      `Distancia aproximada entre la ubicación consultada y la estación: ${station.distanceKm.toFixed(1)} km.`,
      'La comparación estación-modelo sirve como control observacional y no debe tratarse como corrección automática cuando la estación está lejos, es antigua o existe diferencia importante de elevación/exposición.',
    ],
  };
}

function delta(observed: number | null, modeled: number | undefined): number | null {
  if (observed === null || modeled === undefined || !Number.isFinite(modeled)) return null;
  return Math.round((observed - modeled) * 10) / 10;
}

export function compareDmcObservationToModel(
  observation: DmcObservationSnapshot | null,
  modeled: CurrentWeather,
): ObservationComparison | null {
  if (!observation) return null;

  const temperatureDeltaC = delta(observation.temperatureC, modeled.temperatureC);
  const humidityDeltaPct = delta(observation.humidityPct, modeled.humidity);
  const windDeltaKmh = delta(observation.windSpeedKmh, modeled.windSpeedKmh);
  const pressureDeltaHpa = delta(observation.pressureHpa, modeled.pressureHpa);

  const observedWet = (observation.precipitationRecentMm ?? 0) > 0
    || /llovizna|lluvia|chubasco|tormenta|nieve/i.test(observation.presentWeatherLabel ?? '');
  const modeledWet = modeled.precipitationMm > 0 || modeled.condition === 'rain' || modeled.condition === 'storm';

  const precipitationSignal = observedWet && modeledWet
    ? 'agree_wet'
    : !observedWet && !modeledWet
      ? 'agree_dry'
      : observedWet
        ? 'station_wetter'
        : 'model_wetter';

  const availableDeltas = [
    temperatureDeltaC === null ? null : Math.min(35, Math.abs(temperatureDeltaC) * 8),
    humidityDeltaPct === null ? null : Math.min(25, Math.abs(humidityDeltaPct) * 0.9),
    windDeltaKmh === null ? null : Math.min(20, Math.abs(windDeltaKmh) * 0.8),
    pressureDeltaHpa === null ? null : Math.min(10, Math.abs(pressureDeltaHpa) * 1.2),
  ].filter((value): value is number => value !== null);

  if (!availableDeltas.length) {
    return {
      band: 'unavailable',
      label: 'Comparación parcial',
      score: null,
      temperatureDeltaC,
      humidityDeltaPct,
      windDeltaKmh,
      pressureDeltaHpa,
      precipitationSignal,
      interpretation: 'La estación oficial está disponible, pero no hay suficientes variables coincidentes para calcular concordancia.',
    };
  }

  const averagePenalty = availableDeltas.reduce((sum, value) => sum + value, 0) / availableDeltas.length;
  const precipPenalty = precipitationSignal === 'station_wetter' || precipitationSignal === 'model_wetter' ? 18 : 0;
  const distancePenalty = observation.distanceKm > 75 ? 12 : observation.distanceKm > 25 ? 6 : 0;
  const agePenalty = observation.ageMinutes > 120 ? 15 : observation.ageMinutes > 90 ? 7 : 0;
  const score = Math.max(0, Math.round(100 - averagePenalty - precipPenalty - distancePenalty - agePenalty));

  let band: ObservationAgreementBand;
  let label: string;
  let interpretation: string;
  if (score >= 80) {
    band = 'close';
    label = 'Concordancia alta';
    interpretation = 'El modelo y la estación oficial cercana muestran valores razonablemente consistentes. La estación sigue representando otro punto físico.';
  } else if (score >= 55) {
    band = 'mixed';
    label = 'Concordancia parcial';
    interpretation = 'Hay diferencias apreciables entre el modelo y la estación. ORBI debe mostrar mayor cautela al interpretar el clima local.';
  } else {
    band = 'divergent';
    label = 'Divergencia relevante';
    interpretation = 'El modelo y la observación oficial difieren de forma importante. Conviene priorizar la observación para describir la estación y evitar afirmar precisión microclimática en la ubicación GPS.';
  }

  return {
    band,
    label,
    score,
    temperatureDeltaC,
    humidityDeltaPct,
    windDeltaKmh,
    pressureDeltaHpa,
    precipitationSignal,
    interpretation,
  };
}

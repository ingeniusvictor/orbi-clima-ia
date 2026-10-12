import assert from 'node:assert/strict';
import {
  applyCurrentWeatherTruth,
  type CurrentWeatherTruthContext,
} from '../src/services/currentWeatherTruthService';
import type { OpenMeteoRawResponse } from '../src/types/weatherTypes';

function rawCurrent(overrides: Record<string, unknown> = {}): OpenMeteoRawResponse {
  return {
    latitude: -34.7,
    longitude: -71.0,
    current: {
      time: '2026-10-09T13:15',
      temperature_2m: 17,
      apparent_temperature: 17,
      relative_humidity_2m: 70,
      wind_speed_10m: 8,
      pressure_msl: 1014,
      cloud_cover: 30,
      weather_code: 61,
      precipitation: 0.2,
      rain: 0.2,
      showers: 0,
      ...overrides,
    },
  };
}

function codeForGroup(group: string): number {
  if (group === 'despejado') return 0;
  if (group === 'mayormente_despejado') return 1;
  if (group === 'parcial') return 2;
  if (group === 'nublado') return 3;
  if (group === 'niebla') return 45;
  if (group === 'llovizna') return 51;
  if (group === 'lluvia') return 61;
  if (group === 'nieve') return 71;
  if (group === 'chubascos') return 80;
  if (group === 'tormenta') return 95;
  return 3;
}

function models(groups: string[], temperatures = [14, 14.5, 15, 15.2]) {
  return {
    models: groups.map((group, index) => ({
      available: true,
      currentWeatherCode: codeForGroup(group),
      currentConditionGroup: group,
      currentTemperatureC: temperatures[index] ?? 15,
    })),
  } as any;
}

function context(overrides: Partial<CurrentWeatherTruthContext> = {}): CurrentWeatherTruthContext {
  return {
    dmc: null,
    multiModel: null,
    generatedAt: new Date().toISOString(),
    ...overrides,
  };
}

function dmcObservation(overrides: Record<string, unknown> = {}) {
  return {
    provider: 'dmc_meteochile_wis2',
    sourceLabel: 'DMC test',
    stationId: 'TEST',
    stationName: 'Estación Test',
    stationLatitude: -34.7,
    stationLongitude: -71.0,
    distanceKm: 8,
    reportTime: new Date().toISOString(),
    ageMinutes: 20,
    quality: 'strong',
    isFresh: true,
    temperatureC: 14,
    dewPointC: 9,
    humidityPct: 65,
    windSpeedKmh: 5,
    windDirectionDeg: 180,
    pressureHpa: 1015,
    visibilityM: 20000,
    precipitationRecentMm: 0,
    precipitation24hMm: 0,
    cloudCoverPct: 10,
    presentWeatherRaw: null,
    presentWeatherLabel: null,
    limitations: [],
    ...overrides,
  } as any;
}

// 1) The real failure mode seen on device: a weak primary-model rain signal
// must not become "active rain" when all independent models say dry.
{
  const raw = rawCurrent();
  const result = applyCurrentWeatherTruth(raw, context({
    multiModel: models(['despejado', 'parcial', 'despejado', 'parcial']),
  })) as any;
  assert.equal(result.current.precipitation, 0);
  assert.ok([0, 2, 3].includes(result.current.weather_code));
  assert.equal(result.orbi_current_truth.band, 'conflicted');
  assert.equal(result.orbi_current_truth.originalPrecipitationMm, 0.2);
  assert.equal(result.orbi_current_truth.precipitationEvidence, 'model_only');
}

// 2) Even without enough multi-model agreement, an isolated weak rain model
// signal is not promoted to the strong Golden Orb rain state.
{
  const raw = rawCurrent({ cloud_cover: 20 });
  const result = applyCurrentWeatherTruth(raw, context({
    multiModel: models(['lluvia', 'despejado', 'parcial', 'lluvia']),
  })) as any;
  assert.equal(result.current.precipitation, 0);
  assert.notEqual(result.current.weather_code, 61);
  assert.equal(result.orbi_current_truth.band, 'conflicted');
}

// 3) Strong independent wet agreement is allowed to preserve current rain when
// there is no authoritative local present-weather observation contradicting it.
{
  const raw = rawCurrent({ precipitation: 0.4, rain: 0.4 });
  const result = applyCurrentWeatherTruth(raw, context({
    multiModel: models(['lluvia', 'lluvia', 'lluvia', 'parcial']),
  })) as any;
  assert.equal(result.current.weather_code, 61);
  assert.equal(result.current.precipitation, 0.4);
  assert.equal(result.orbi_current_truth.band, 'corroborated');
  assert.equal(result.orbi_current_truth.precipitationEvidence, 'model_consensus_wet');
}

// 4) A nearby/fresh/strong DMC dry observation rejects modeled rain and may
// anchor temperature only when it is also coherent with the independent models.
{
  const raw = rawCurrent();
  const result = applyCurrentWeatherTruth(raw, context({
    dmc: dmcObservation(),
    multiModel: models(['despejado', 'parcial', 'despejado', 'parcial'], [13.8, 14.1, 14.4, 14.6]),
  })) as any;
  assert.equal(result.current.precipitation, 0);
  assert.equal(result.current.temperature_2m, 14);
  assert.equal(result.orbi_current_truth.temperatureStrategy, 'dmc_observed');
  assert.equal(result.orbi_current_truth.band, 'observed');
  assert.equal(result.orbi_current_truth.precipitationEvidence, 'observed_dry');
}

// 5) If no nearby station exists but independent model temperatures are tightly
// grouped and materially disagree with the primary model, use the median.
{
  const raw = rawCurrent({ weather_code: 0, precipitation: 0, rain: 0, temperature_2m: 17, apparent_temperature: 17 });
  const result = applyCurrentWeatherTruth(raw, context({
    multiModel: models(['despejado', 'parcial', 'despejado', 'parcial'], [14, 14.2, 14.5, 14.8]),
  })) as any;
  assert.equal(result.orbi_current_truth.temperatureStrategy, 'multi_model_median');
  assert.equal(Math.round(result.current.temperature_2m), 14);
}

// 6) A strong station 22 km away remains useful for regional pressure/truth
// metadata, but it must no longer overwrite the GPS temperature on its own.
{
  const raw = rawCurrent({
    weather_code: 3,
    precipitation: 0,
    rain: 0,
    temperature_2m: 17,
    apparent_temperature: 16,
    relative_humidity_2m: 70,
    wind_speed_10m: 9,
    cloud_cover: 88,
  });
  const result = applyCurrentWeatherTruth(raw, context({
    dmc: dmcObservation({
      distanceKm: 22,
      temperatureC: 14,
      pressureHpa: 1018,
      humidityPct: 61,
      windSpeedKmh: 4,
      cloudCoverPct: 100,
    }),
  })) as any;

  assert.equal(result.current.temperature_2m, 17);
  assert.equal(result.current.apparent_temperature, 16);
  assert.equal(result.orbi_current_truth.temperatureStrategy, 'primary_model');
  assert.equal(result.orbi_current_truth.stationDistanceKm, 22);
  assert.equal(result.current.pressure_msl, 1018, 'Regional pressure may still be observed out to 25 km.');
  assert.equal(result.current.relative_humidity_2m, 70, 'Humidity remains model-local beyond 15 km.');
  assert.equal(result.current.wind_speed_10m, 9, 'Wind remains model-local beyond 15 km.');
  assert.equal(result.current.cloud_cover, 88, 'Cloud cover remains model-local beyond 15 km.');
}

// 7) Physical-QA temperature failure: a nearby DMC station reports 13 C while
// tightly grouped numerical models center on 15 C. DMC must not force the UI
// down when it conflicts materially with the broader local field.
{
  const raw = rawCurrent({
    weather_code: 3,
    precipitation: 0,
    rain: 0,
    temperature_2m: 13,
    apparent_temperature: 13,
    cloud_cover: 90,
  });
  const result = applyCurrentWeatherTruth(raw, context({
    dmc: dmcObservation({
      distanceKm: 8,
      temperatureC: 13,
      cloudCoverPct: 95,
      presentWeatherLabel: 'Nublado',
    }),
    multiModel: models(['nublado', 'nublado', 'nublado', 'parcial'], [14.6, 14.9, 15.1, 15.3]),
  })) as any;

  assert.equal(result.orbi_current_truth.temperatureStrategy, 'multi_model_median');
  assert.equal(Math.round(result.current.temperature_2m), 15);
  assert.equal(result.current.weather_code, 3);
}

// 8) Positive recent accumulation is history, not evidence of rain happening now.
{
  const raw = rawCurrent({ weather_code: 61, precipitation: 0.3, rain: 0.3, cloud_cover: 96 });
  const result = applyCurrentWeatherTruth(raw, context({
    dmc: dmcObservation({
      distanceKm: 8,
      precipitationRecentMm: 1.4,
      cloudCoverPct: 100,
      presentWeatherLabel: null,
    }),
    multiModel: models(['lluvia', 'lluvia', 'nublado', 'lluvia'], [14.8, 15, 15.1, 15.3]),
  })) as any;

  assert.equal(result.current.weather_code, 3);
  assert.equal(result.current.precipitation, 0);
  assert.equal(result.current.rain, 0);
  assert.equal(result.orbi_current_truth.precipitationEvidence, 'recent_only');
  assert.equal(result.orbi_current_truth.band, 'conflicted');
}

// 9) An explicit present-weather label such as Nublado is stronger than recent
// rain accumulation and must suppress an active-rain scene.
{
  const raw = rawCurrent({ weather_code: 61, precipitation: 0.6, rain: 0.6, cloud_cover: 92 });
  const result = applyCurrentWeatherTruth(raw, context({
    dmc: dmcObservation({
      distanceKm: 7,
      precipitationRecentMm: 2.2,
      cloudCoverPct: 100,
      presentWeatherLabel: 'Nublado',
    }),
    multiModel: models(['lluvia', 'lluvia', 'lluvia', 'nublado']),
  })) as any;

  assert.equal(result.current.weather_code, 3);
  assert.equal(result.current.precipitation, 0);
  assert.equal(result.orbi_current_truth.precipitationEvidence, 'observed_dry');
  assert.equal(result.orbi_current_truth.band, 'observed');
}

// 10) Genuine present light rain remains first-class and preserves its exact
// WMO semantic label instead of collapsing to a generic "active rain" concept.
{
  const raw = rawCurrent({ weather_code: 3, precipitation: 0, rain: 0, cloud_cover: 100 });
  const result = applyCurrentWeatherTruth(raw, context({
    dmc: dmcObservation({
      distanceKm: 6,
      precipitationRecentMm: 0,
      cloudCoverPct: 100,
      presentWeatherLabel: 'Lluvia débil',
    }),
    multiModel: models(['nublado', 'lluvia', 'nublado', 'lluvia']),
  })) as any;

  assert.equal(result.current.weather_code, 61);
  assert.ok(result.current.precipitation > 0);
  assert.equal(result.orbi_current_truth.conditionLabel, 'Lluvia ligera');
  assert.equal(result.orbi_current_truth.precipitationEvidence, 'observed_now');
  assert.equal(result.orbi_current_truth.band, 'observed');
}

function assertObservedPhenomenon(label: string, expectedCode: number, expectedLabel: string) {
  const raw = rawCurrent({ weather_code: 3, precipitation: 0, rain: 0, showers: 0, cloud_cover: 100 });
  const result = applyCurrentWeatherTruth(raw, context({
    dmc: dmcObservation({
      distanceKm: 5,
      precipitationRecentMm: 0,
      cloudCoverPct: 100,
      presentWeatherLabel: label,
    }),
    multiModel: models(['nublado', 'lluvia', 'nublado', 'lluvia']),
  })) as any;

  assert.equal(result.current.weather_code, expectedCode, `${label} should resolve to WMO ${expectedCode}.`);
  assert.equal(result.orbi_current_truth.conditionLabel, expectedLabel, `${label} should retain a precise user-facing label.`);
  assert.equal(result.orbi_current_truth.precipitationEvidence, 'observed_now');
}

// 11) OC-22L precipitation semantic ladder: observed phenomena keep their
// actual class/intensity instead of collapsing to one generic rain state.
assertObservedPhenomenon('Llovizna moderada', 53, 'Llovizna moderada');
assertObservedPhenomenon('Llovizna densa', 55, 'Llovizna densa');
assertObservedPhenomenon('Lluvia moderada', 63, 'Lluvia moderada');
assertObservedPhenomenon('Lluvia intensa', 65, 'Lluvia intensa');
assertObservedPhenomenon('Lluvia gélida intensa', 67, 'Lluvia gélida intensa');
assertObservedPhenomenon('Chubasco moderado', 81, 'Chubascos moderados');
assertObservedPhenomenon('Chubasco fuerte', 82, 'Chubascos violentos');
assertObservedPhenomenon('Nieve moderada', 73, 'Nieve moderada');
assertObservedPhenomenon('Nieve intensa', 75, 'Nieve intensa');

console.log('OC-22L deterministic current-weather truth + precipitation semantics tests: PASS');
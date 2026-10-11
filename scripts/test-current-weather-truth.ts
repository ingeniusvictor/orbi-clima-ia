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

function models(groups: string[], temperatures = [14, 14.5, 15, 15.2]) {
  return {
    models: groups.map((group, index) => ({
      available: true,
      currentWeatherCode: group === 'despejado' ? 0 : group === 'parcial' ? 2 : group === 'lluvia' ? 61 : 3,
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

// 3) Strong independent wet agreement is allowed to preserve current rain.
{
  const raw = rawCurrent({ precipitation: 0.4, rain: 0.4 });
  const result = applyCurrentWeatherTruth(raw, context({
    multiModel: models(['lluvia', 'lluvia', 'lluvia', 'parcial']),
  })) as any;
  assert.equal(result.current.weather_code, 61);
  assert.equal(result.current.precipitation, 0.4);
  assert.equal(result.orbi_current_truth.band, 'corroborated');
}

// 4) A nearby/fresh/strong DMC dry observation can reject a weak modeled rain.
{
  const raw = rawCurrent();
  const result = applyCurrentWeatherTruth(raw, context({
    dmc: dmcObservation(),
    multiModel: models(['despejado', 'parcial', 'despejado', 'parcial']),
  })) as any;
  assert.equal(result.current.precipitation, 0);
  assert.equal(result.current.temperature_2m, 14);
  assert.equal(result.orbi_current_truth.temperatureStrategy, 'dmc_observed');
  assert.equal(result.orbi_current_truth.band, 'observed');
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

// 6) Physical QA exposed a consistency gap: DMC quality already defines a
// strong station out to 25 km, but scalar temperature previously stopped at
// 15 km. A fresh 22 km strong station must now anchor temperature while more
// micro-local humidity/wind/cloud values retain the tighter radius.
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
      humidityPct: 61,
      windSpeedKmh: 4,
      cloudCoverPct: 100,
    }),
  })) as any;

  assert.equal(result.current.temperature_2m, 14);
  assert.equal(result.current.apparent_temperature, 13);
  assert.equal(result.orbi_current_truth.temperatureStrategy, 'dmc_observed');
  assert.equal(result.orbi_current_truth.stationDistanceKm, 22);
  assert.equal(result.current.relative_humidity_2m, 70, 'Humidity remains model-local beyond 15 km.');
  assert.equal(result.current.wind_speed_10m, 9, 'Wind remains model-local beyond 15 km.');
  assert.equal(result.current.cloud_cover, 88, 'Cloud cover remains model-local beyond 15 km.');
}

console.log('OC-19 deterministic current-weather truth tests: PASS');

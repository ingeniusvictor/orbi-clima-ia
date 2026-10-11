import assert from 'node:assert/strict';
import { buildWeatherAtmosphereModel, resolveAtmosphereScene } from '../src/services/weatherAtmosphereEngine';
import type { CurrentWeather, DailyForecast } from '../src/types/weatherTypes';

const DAYTIME = new Date('2026-10-10T15:00:00Z');
const RANCAGUA_LATE_MORNING = new Date('2026-10-11T14:32:00Z');

function weather(overrides: Partial<CurrentWeather>): CurrentWeather {
  return {
    temperatureC: 18,
    feelsLikeC: 18,
    humidity: 65,
    windSpeedKmh: 8,
    windGustKmh: 12,
    pressureHpa: 1014,
    cloudCover: 20,
    precipitationMm: 0,
    uvIndex: 2,
    condition: 'sunny',
    updatedAt: new Date(0).toISOString(),
    ...overrides,
  };
}

function daily(overrides: Partial<DailyForecast> = {}): DailyForecast {
  return {
    date: 'Hoy',
    minTempC: 10,
    maxTempC: 19,
    precipitationProbability: 15,
    windMaxKmh: 22,
    uvMax: 5,
    sunrise: '07:12 AM',
    sunset: '07:43 PM',
    condition: 'cloudy',
    ...overrides,
  };
}

assert.equal(resolveAtmosphereScene('sunny'), 'clear');
assert.equal(resolveAtmosphereScene('partly_cloudy'), 'partly-cloudy');
assert.equal(resolveAtmosphereScene('cloudy'), 'cloudy');
assert.equal(resolveAtmosphereScene('rain'), 'rain');
assert.equal(resolveAtmosphereScene('snow'), 'snow');
assert.equal(resolveAtmosphereScene('storm'), 'storm');

const cloudy = buildWeatherAtmosphereModel({
  current: weather({ condition: 'cloudy', cloudCover: 92, humidity: 86 }),
  quality: 'balanced',
  timezone: 'UTC',
  now: DAYTIME,
});
assert.equal(cloudy.scene, 'cloudy');
assert.ok(cloudy.cloudOpacity >= 0.9, 'Cloudy scene should create a dense cloud field.');
assert.ok(cloudy.mistStrength >= 0.2, 'Cloudy scene should keep atmospheric depth.');

const rain = buildWeatherAtmosphereModel({
  current: weather({ condition: 'rain', precipitationMm: 1.2, cloudCover: 95, humidity: 91 }),
  quality: 'high',
  timezone: 'UTC',
  now: DAYTIME,
});
assert.equal(rain.scene, 'rain');
assert.ok(rain.precipitationStrength >= 0.35, 'Rain scene must remain visibly rainy even at modest measured intensity.');
assert.equal(rain.accentTemperature, 'cool');

const snow = buildWeatherAtmosphereModel({
  current: weather({ condition: 'snow', precipitationMm: 1.1, cloudCover: 96, humidity: 92, temperatureC: -1, feelsLikeC: -4 }),
  quality: 'balanced',
  timezone: 'UTC',
  now: DAYTIME,
});
assert.equal(snow.scene, 'snow');
assert.ok(snow.precipitationStrength >= 0.46, 'Snow scene should have an independent visible precipitation floor.');
assert.ok(snow.frostStrength > 0.4, 'Snow scene should drive frost independently from cold-only weather.');

const storm = buildWeatherAtmosphereModel({
  current: weather({ condition: 'storm', precipitationMm: 3.8, cloudCover: 100, windSpeedKmh: 46, humidity: 95 }),
  quality: 'ultra',
  timezone: 'UTC',
  now: DAYTIME,
});
assert.equal(storm.scene, 'storm');
assert.ok(storm.precipitationStrength >= 0.65, 'Storm scene should be visually unmistakable.');
assert.ok(storm.windStrength > 0.8, 'Strong storm wind should accelerate atmosphere motion.');
assert.ok(storm.cloudSpeed < cloudy.cloudSpeed, 'Higher wind should move clouds faster (shorter animation duration).');

const clearNight = buildWeatherAtmosphereModel({
  current: weather({ condition: 'night', cloudCover: 4, humidity: 45 }),
  quality: 'balanced',
  timezone: 'UTC',
  now: DAYTIME,
});
assert.equal(clearNight.scene, 'clear');
assert.equal(clearNight.phase, 'night');
assert.ok(clearNight.cloudOpacity < 0.2, 'Clear night should not be obscured by clouds.');

const cold = buildWeatherAtmosphereModel({
  current: weather({ condition: 'cold', temperatureC: 2, feelsLikeC: -1, humidity: 82 }),
  quality: 'balanced',
  timezone: 'UTC',
  now: DAYTIME,
});
assert.equal(cold.scene, 'cold');
assert.equal(cold.accentTemperature, 'cool');

const hot = buildWeatherAtmosphereModel({
  current: weather({ condition: 'hot', temperatureC: 34, feelsLikeC: 36, humidity: 34, cloudCover: 3 }),
  quality: 'balanced',
  timezone: 'UTC',
  now: DAYTIME,
});
assert.equal(hot.scene, 'hot');
assert.equal(hot.phase, 'day');
assert.equal(hot.accentTemperature, 'warm');

// Regression for 10621 physical QA: the adapter exposes sunrise/sunset in
// 12-hour strings such as "07:43 PM". AUTO must interpret PM correctly instead
// of treating sunset as 07:43 in the morning and rendering late morning as night.
const lateMorningCloudy = buildWeatherAtmosphereModel({
  current: Object.assign(
    weather({ condition: 'cloudy', cloudCover: 88, humidity: 81, temperatureC: 14, feelsLikeC: 14 }),
    { isDay: true },
  ),
  daily: daily(),
  quality: 'balanced',
  timezone: 'America/Santiago',
  now: RANCAGUA_LATE_MORNING,
});
assert.equal(lateMorningCloudy.phase, 'day', '11:32 in Rancagua must remain in AUTO daytime with a PM sunset string.');
assert.equal(lateMorningCloudy.solar.nightStrength, 0, 'Late-morning AUTO sky must not contain night exposure.');
assert.ok(lateMorningCloudy.solar.sunAltitude > 0.5, 'Late-morning sun altitude should be clearly above the horizon.');
assert.ok(lateMorningCloudy.luminance >= 0.5, 'Dense clouds may dim daytime, but must not collapse into night luminance.');

// Provider daylight is a final invariant against malformed/cached solar clock
// data. It must never override valid dawn/dusk, only an impossible day/night
// contradiction.
const daylightGuard = buildWeatherAtmosphereModel({
  current: Object.assign(weather({ condition: 'cloudy', cloudCover: 85 }), { isDay: true }),
  daily: daily({ sunrise: '10:45 PM', sunset: '11:45 PM' }),
  quality: 'balanced',
  timezone: 'America/Santiago',
  now: RANCAGUA_LATE_MORNING,
});
assert.equal(daylightGuard.phase, 'day', 'Provider is_day=true must guard AUTO against an impossible night classification.');
assert.equal(daylightGuard.solar.nightStrength, 0, 'Provider daylight guard must also repair the solar exposure state.');

console.log('OC-22 Living Weather Atmosphere behavior tests: PASS');

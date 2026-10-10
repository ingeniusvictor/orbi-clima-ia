import assert from 'node:assert/strict';
import { buildWeatherAtmosphereModel, resolveAtmosphereScene } from '../src/services/weatherAtmosphereEngine';
import type { CurrentWeather } from '../src/types/weatherTypes';

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

assert.equal(resolveAtmosphereScene('sunny'), 'clear');
assert.equal(resolveAtmosphereScene('partly_cloudy'), 'partly-cloudy');
assert.equal(resolveAtmosphereScene('cloudy'), 'cloudy');
assert.equal(resolveAtmosphereScene('rain'), 'rain');
assert.equal(resolveAtmosphereScene('storm'), 'storm');

const cloudy = buildWeatherAtmosphereModel({
  current: weather({ condition: 'cloudy', cloudCover: 92, humidity: 86 }),
  quality: 'balanced',
});
assert.equal(cloudy.scene, 'cloudy');
assert.ok(cloudy.cloudOpacity >= 0.9, 'Cloudy scene should create a dense cloud field.');
assert.ok(cloudy.mistStrength >= 0.2, 'Cloudy scene should keep atmospheric depth.');

const rain = buildWeatherAtmosphereModel({
  current: weather({ condition: 'rain', precipitationMm: 1.2, cloudCover: 95, humidity: 91 }),
  quality: 'high',
});
assert.equal(rain.scene, 'rain');
assert.ok(rain.precipitationStrength >= 0.35, 'Rain scene must remain visibly rainy even at modest measured intensity.');
assert.equal(rain.accentTemperature, 'cool');

const storm = buildWeatherAtmosphereModel({
  current: weather({ condition: 'storm', precipitationMm: 3.8, cloudCover: 100, windSpeedKmh: 46, humidity: 95 }),
  quality: 'ultra',
});
assert.equal(storm.scene, 'storm');
assert.ok(storm.precipitationStrength >= 0.65, 'Storm scene should be visually unmistakable.');
assert.ok(storm.windStrength > 0.8, 'Strong storm wind should accelerate atmosphere motion.');
assert.ok(storm.cloudSpeed < cloudy.cloudSpeed, 'Higher wind should move clouds faster (shorter animation duration).');

const clearNight = buildWeatherAtmosphereModel({
  current: weather({ condition: 'night', cloudCover: 4, humidity: 45 }),
  quality: 'balanced',
});
assert.equal(clearNight.scene, 'clear');
assert.equal(clearNight.phase, 'night');
assert.ok(clearNight.cloudOpacity < 0.2, 'Clear night should not be obscured by clouds.');

const cold = buildWeatherAtmosphereModel({
  current: weather({ condition: 'cold', temperatureC: 2, feelsLikeC: -1, humidity: 82 }),
  quality: 'balanced',
});
assert.equal(cold.scene, 'cold');
assert.equal(cold.accentTemperature, 'cool');

const hot = buildWeatherAtmosphereModel({
  current: weather({ condition: 'hot', temperatureC: 34, feelsLikeC: 36, humidity: 34, cloudCover: 3 }),
  quality: 'balanced',
});
assert.equal(hot.scene, 'hot');
assert.equal(hot.accentTemperature, 'warm');

console.log('OC-22 Living Weather Atmosphere behavior tests: PASS');

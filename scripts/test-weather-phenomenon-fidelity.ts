import assert from 'node:assert/strict';
import {
  getWmoHumanLabel,
  getWmoPrecipitationIntensity,
  getWmoPrecipitationKind,
  mapWmoCodeToOrbiCondition,
} from '../src/utils/wmoWeatherCodeMapper';
import type { WeatherCondition } from '../src/types/weatherTypes';

const exactLabels: Record<number, string> = {
  0: 'Despejado',
  1: 'Mayormente despejado',
  2: 'Parcialmente nublado',
  3: 'Cubierto',
  45: 'Niebla',
  48: 'Niebla con escarcha',
  51: 'Llovizna ligera',
  53: 'Llovizna moderada',
  55: 'Llovizna densa',
  56: 'Llovizna gélida ligera',
  57: 'Llovizna gélida intensa',
  61: 'Lluvia ligera',
  63: 'Lluvia moderada',
  65: 'Lluvia intensa',
  66: 'Lluvia gélida ligera',
  67: 'Lluvia gélida intensa',
  71: 'Nevada ligera',
  73: 'Nevada moderada',
  75: 'Nevada intensa',
  77: 'Granos de nieve',
  80: 'Chubascos ligeros',
  81: 'Chubascos moderados',
  82: 'Chubascos violentos',
  85: 'Chubascos de nieve ligeros',
  86: 'Chubascos de nieve intensos',
  95: 'Tormenta',
  96: 'Tormenta con granizo ligero',
  99: 'Tormenta con granizo fuerte',
};

for (const [codeText, expectedLabel] of Object.entries(exactLabels)) {
  const code = Number(codeText);
  assert.equal(
    getWmoHumanLabel(code),
    expectedLabel,
    `WMO ${code} must keep its exact user-facing phenomenon label.`,
  );
}

const familyCases: Array<[number, number, WeatherCondition]> = [
  [0, 0, 'sunny'],
  [1, 0, 'partly_cloudy'],
  [2, 0, 'partly_cloudy'],
  [3, 0, 'cloudy'],
  [45, 0, 'fog'],
  [48, 0, 'fog'],
  [51, 0.2, 'rain'],
  [53, 0.6, 'rain'],
  [55, 1.4, 'rain'],
  [56, 0.3, 'rain'],
  [57, 1.5, 'rain'],
  [61, 0.3, 'rain'],
  [63, 2.2, 'rain'],
  [65, 8.2, 'rain'],
  [66, 0.4, 'rain'],
  [67, 8.4, 'rain'],
  [71, 0.3, 'snow'],
  [73, 2.4, 'snow'],
  [75, 8.3, 'snow'],
  [77, 0.4, 'snow'],
  [80, 0.5, 'rain'],
  [81, 2.5, 'rain'],
  [82, 9.0, 'rain'],
  [85, 0.5, 'snow'],
  [86, 8.5, 'snow'],
  [95, 1.0, 'storm'],
  [96, 4.0, 'storm'],
  [99, 10.0, 'storm'],
];

for (const [code, precipitationMm, expectedCondition] of familyCases) {
  assert.equal(
    mapWmoCodeToOrbiCondition(code, true, precipitationMm),
    expectedCondition,
    `WMO ${code} must route to the correct ORBI visual family.`,
  );
}

assert.equal(mapWmoCodeToOrbiCondition(0, false, 0), 'night', 'Clear WMO 0 must preserve clear-night presentation when is_day=false.');
assert.equal(getWmoPrecipitationKind(51), 'drizzle');
assert.equal(getWmoPrecipitationKind(57), 'freezing_drizzle');
assert.equal(getWmoPrecipitationKind(61), 'rain');
assert.equal(getWmoPrecipitationKind(67), 'freezing_rain');
assert.equal(getWmoPrecipitationKind(82), 'showers');
assert.equal(getWmoPrecipitationKind(86), 'snow');
assert.equal(getWmoPrecipitationKind(99), 'storm');
assert.equal(getWmoPrecipitationIntensity(61, 0.3), 'light');
assert.equal(getWmoPrecipitationIntensity(63, 2.2), 'moderate');
assert.equal(getWmoPrecipitationIntensity(65, 8.2), 'heavy');
assert.equal(getWmoPrecipitationIntensity(82, 9), 'violent');
assert.equal(getWmoPrecipitationIntensity(99, 10), 'violent');

console.log('OC-22M Weather Phenomenon Fidelity matrix: PASS');
console.log(`- ${Object.keys(exactLabels).length} exact WMO labels certified`);
console.log('- clear/partly/cloudy/fog/rain/snow/storm visual families certified');
console.log('- drizzle/rain/showers/snow/storm type + intensity semantics certified');

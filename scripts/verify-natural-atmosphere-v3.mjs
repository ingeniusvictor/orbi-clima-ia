import { existsSync, readFileSync } from 'node:fs';

const read = (path) => readFileSync(path, 'utf8');
const fail = (message) => {
  console.error(`OC-22B Natural Atmosphere V3: FAIL\n${message}`);
  process.exit(1);
};
const expect = (condition, message) => {
  if (!condition) fail(message);
};

const main = read('src/main.tsx');
const css = read('src/styles/living-weather-natural-v3.css');

expect(main.includes("./styles/living-weather-natural-v3.css"), 'Natural Atmosphere V3 stylesheet is not loaded.');
expect(
  main.indexOf("living-weather-natural-v3.css") < main.indexOf("living-weather-android-safe.css"),
  'Android safety overrides must load after Natural Atmosphere V3.',
);

for (const asset of [
  'public/weather/clouds/cloud-bank-high-v3.svg',
  'public/weather/clouds/cloud-bank-mid-v3.svg',
  'public/weather/clouds/cloud-bank-low-v3.svg',
  'public/weather/clouds/cloud-bank-storm-v3.svg',
]) {
  expect(existsSync(asset), `Missing natural cloud-bank asset: ${asset}`);
}

for (const token of [
  "cloud-bank-high-v3.svg",
  "cloud-bank-mid-v3.svg",
  "cloud-bank-low-v3.svg",
  "cloud-bank-storm-v3.svg",
  'lwa-cloud-drift-natural',
]) {
  expect(css.includes(token), `Natural atmosphere CSS is missing ${token}.`);
}

expect(css.includes('.lwa-cloud-field .lwa-cloud'), 'V3 must explicitly retire individual cloud sprites.');
expect(css.includes('display: none !important'), 'Individual V2 cloud sprites must not remain visible in V3.');
expect(css.includes("html.capacitor-android .living-weather-atmosphere .lwa-wind-streams"), 'Android wind must avoid graphic ribbon effects.');
expect(css.includes("html.capacitor-android .living-weather-atmosphere .lwa-heat-waves"), 'Android heat must avoid graphic capsule effects.');
expect(css.includes("[data-scene='cloudy'] .lwa-sky"), 'Cloudy scene needs its own natural sky palette.');
expect(css.includes("[data-scene='rain'] .lwa-sky"), 'Rain scene needs its own natural sky palette.');
expect(css.includes("[data-scene='storm'] .lwa-sky"), 'Storm scene needs its own natural sky palette.');

for (const forbidden of ['backdrop-filter', 'mix-blend-mode', 'translateZ(0)', 'blur(']) {
  expect(!css.includes(forbidden), `Natural Atmosphere V3 must not use compositor-heavy/artificial token: ${forbidden}`);
}

console.log('OC-22B Natural Atmosphere V3 gate: PASS');

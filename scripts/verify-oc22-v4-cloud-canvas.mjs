import { readFileSync, existsSync } from 'node:fs';

const read = (path) => readFileSync(path, 'utf8');
const fail = (message) => {
  console.error(`OC-22C Natural Cloud Canvas V4: FAIL\n${message}`);
  process.exit(1);
};
const expect = (condition, message) => {
  if (!condition) fail(message);
};

const main = read('src/main.tsx');
const atmosphere = read('src/components/LivingWeatherAtmosphere.tsx');
const canvas = read('src/components/NaturalCloudCanvas.tsx');
const css = read('src/styles/living-weather-canvas-v4.css');

expect(!main.includes('orb-android-stability.css'), 'Golden Orb Android freeze stylesheet must never be imported again.');
expect(!existsSync('src/styles/orb-android-stability.css'), 'Golden Orb motion-freezing stylesheet must remain deleted.');
expect(main.includes('living-weather-canvas-v4.css'), 'Natural Cloud Canvas V4 stylesheet must be loaded.');
expect(atmosphere.includes('NaturalCloudCanvas'), 'Living Weather must render the canvas cloud system.');
expect(!atmosphere.includes('lwa-cloud-field lwa-cloud-field-far'), 'Illustrated cloud DOM fields must be retired from runtime markup.');

for (const token of ['fbm(', 'valueNoise(', 'createCloudTexture(', 'requestAnimationFrame', 'frameRate']) {
  expect(canvas.includes(token), `Canvas renderer missing ${token}.`);
}

for (const forbidden of ['filter: blur(', 'backdrop-filter', 'mix-blend-mode', 'translateZ(', 'will-change: transform']) {
  expect(!css.includes(forbidden), `V4 canvas stylesheet must not use compositor-heavy token: ${forbidden}`);
}

const protectedSelectors = [
  '#orbi-climate-core-container',
  '.mix-blend-screen',
  '.mix-blend-overlay',
  '.blur-3xl',
  '.blur-2xl',
];
for (const selector of protectedSelectors) {
  expect(!css.includes(selector), `V4 atmosphere must never target Golden Orb selector ${selector}.`);
}

console.log('OC-22C Natural Cloud Canvas V4 gate: PASS');

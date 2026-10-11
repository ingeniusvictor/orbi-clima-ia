import { readFileSync, existsSync } from 'node:fs';

const read = (path) => readFileSync(path, 'utf8');
const fail = (message) => {
  console.error(`OC-22F Volumetric Cloud Canvas V7: FAIL\n${message}`);
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
expect(main.includes('living-weather-canvas-v4.css'), 'Natural Cloud Canvas stylesheet must be loaded.');
expect(atmosphere.includes('NaturalCloudCanvas'), 'Living Weather must render the canvas cloud system.');
expect(!atmosphere.includes('lwa-cloud-field lwa-cloud-field-far'), 'Illustrated cloud DOM fields must stay retired from runtime markup.');

for (const token of [
  'fbm(',
  'ridgedFbm(',
  'evaluateCloudField(',
  'warpX',
  'warpY',
  'erosion',
  'densityField',
  'directional',
  'selfShadow',
  'verticalDrift',
  'requestAnimationFrame',
  'frameRate',
]) {
  expect(canvas.includes(token), `Volumetric cloud renderer missing ${token}.`);
}

expect(canvas.includes("android ? 12"), 'Android cloud animation must keep the conservative 12 fps cap.');
expect(canvas.includes('destination-out') === false, 'Cloud renderer must not reuse Golden Orb contour compositing tricks.');
expect(canvas.includes('createCloudTexture(textureWidth'), 'Cloud texture generation must remain precomputed, not per-frame.');
expect(canvas.includes('sampleDensity(x - 2, y - 2)'), 'Volumetric lighting must sample toward the virtual light source.');
expect(canvas.includes('sampleDensity(x + 3, y + 4)'), 'Volumetric lighting must sample the shadow-side density.');

for (const forbidden of ['filter: blur(', 'backdrop-filter', 'mix-blend-mode', 'translateZ(', 'will-change: transform']) {
  expect(!css.includes(forbidden), `Canvas stylesheet must not use compositor-heavy token: ${forbidden}`);
}

const protectedSelectors = [
  '#orbi-climate-core-container',
  '.mix-blend-screen',
  '.mix-blend-overlay',
  '.blur-3xl',
  '.blur-2xl',
];
for (const selector of protectedSelectors) {
  expect(!css.includes(selector), `Cloud atmosphere must never target Golden Orb selector ${selector}.`);
  expect(!canvas.includes(selector), `Cloud renderer must never inspect Golden Orb selector ${selector}.`);
}

console.log('OC-22F Volumetric Cloud Canvas V7 gate: PASS');

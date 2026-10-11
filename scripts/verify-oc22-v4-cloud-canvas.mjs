import { readFileSync, existsSync } from 'node:fs';

const read = (path) => readFileSync(path, 'utf8');
const fail = (message) => {
  console.error(`OC-22 Cloud Canvas V8: FAIL\n${message}`);
  process.exit(1);
};
const expect = (condition, message) => {
  if (!condition) fail(message);
};

const main = read('src/main.tsx');
const atmosphere = read('src/components/LivingWeatherAtmosphere.tsx');
const wrapper = read('src/components/NaturalCloudCanvas.tsx');
const canvas = read('src/components/NaturalCloudCanvasV8.tsx');
const css = read('src/styles/living-weather-canvas-v4.css');

expect(!main.includes('orb-android-stability.css'), 'Golden Orb Android freeze stylesheet must never be imported again.');
expect(!existsSync('src/styles/orb-android-stability.css'), 'Golden Orb motion-freezing stylesheet must remain deleted.');
expect(main.includes('living-weather-canvas-v4.css'), 'Natural Cloud Canvas stylesheet must remain loaded.');
expect(atmosphere.includes('NaturalCloudCanvas'), 'Living Weather must render the canvas cloud system.');
expect(wrapper.includes("NaturalCloudCanvasV8"), 'NaturalCloudCanvas wrapper must route runtime through V8.');
expect(!atmosphere.includes('lwa-cloud-field lwa-cloud-field-far'), 'Illustrated cloud DOM fields must remain retired from runtime markup.');

for (const token of ['fbm(', 'ridgedFbm(', 'evaluateCloudField(', 'createCloudTexture(', 'requestAnimationFrame', 'frameRate']) {
  expect(canvas.includes(token), `V8 canvas renderer missing ${token}.`);
}

for (const token of ['SCENE_PROFILES', 'seedBase', 'thresholdBias', 'towerWeight', 'layerHeight', 'layerWidth']) {
  expect(canvas.includes(token), `V8 scene morphology missing ${token}.`);
}

for (const scene of ['cloudy', 'rain', 'storm']) {
  expect(canvas.includes(`${scene}: {`), `V8 must define an independent ${scene} cloud profile.`);
}

expect(canvas.includes('seedBase: 503'), 'Cloudy must keep its own deterministic seed family.');
expect(canvas.includes('seedBase: 811'), 'Rain must keep its own deterministic seed family.');
expect(canvas.includes('seedBase: 1297'), 'Storm must keep its own deterministic seed family.');
expect(canvas.includes('towerWeight: 0.42'), 'Storm must preserve strong convective vertical structure.');
expect(canvas.includes('lowerDarkening: 0.43'), 'Rain must preserve a heavy dark cloud base.');

for (const forbidden of ['filter: blur(', 'backdrop-filter', 'mix-blend-mode', 'translateZ(', 'will-change: transform']) {
  expect(!css.includes(forbidden), `Cloud canvas stylesheet must not use compositor-heavy token: ${forbidden}`);
}

for (const selector of ['#orbi-climate-core-container', '.mix-blend-screen', '.mix-blend-overlay', '.blur-3xl', '.blur-2xl']) {
  expect(!css.includes(selector), `Atmosphere must never target Golden Orb selector ${selector}.`);
  expect(!canvas.includes(selector), `V8 renderer must never inspect Golden Orb selector ${selector}.`);
}

console.log('OC-22 Cloud Canvas V8 gate: PASS (scene-distinct volumetric cloud families)');

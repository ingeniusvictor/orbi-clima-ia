import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(path, 'utf8');
const fail = (message) => {
  console.error(`OC-22G Cinematic Sky V9: FAIL\n${message}`);
  process.exit(1);
};
const expect = (condition, message) => {
  if (!condition) fail(message);
};

const engine = read('src/services/weatherAtmosphereEngine.ts');
const atmosphere = read('src/components/LivingWeatherAtmosphere.tsx');
const sky = read('src/components/CinematicSkyCanvas.tsx');
const skyCss = read('src/styles/living-weather-cinematic-sky-v9.css');
const host = read('src/components/LivingWeatherAtmosphereHost.tsx');
const lab = read('src/components/AtmosphereLabOverlayV2.tsx');
const preview = read('src/components/AtmosphereLabPreviewScene.tsx');
const debug = read('src/services/weatherAtmosphereDebugService.ts');

for (const token of [
  'SolarLightingState',
  'resolveSolarLightingState',
  'sunAltitude',
  'sunPositionX',
  'sunPositionY',
  'twilightWarmth',
  'nightStrength',
]) {
  expect(engine.includes(token), `Solar lighting engine missing ${token}.`);
}

expect(atmosphere.includes('CinematicSkyCanvas'), 'Living Weather must mount CinematicSkyCanvas.');
expect(atmosphere.includes('data-sky-engine="v9"'), 'Living Weather must explicitly select the V9 sky engine.');
expect(atmosphere.includes('60_000'), 'Living Weather must refresh real solar lighting at minute cadence.');
expect(atmosphere.includes('phaseOverride'), 'Living Weather must accept a visual-only QA phase override.');

for (const token of ['ResizeObserver', 'createLinearGradient', 'createRadialGradient', 'sunPositionX', 'nightStrength']) {
  expect(sky.includes(token), `Cinematic sky renderer missing ${token}.`);
}
expect(sky.includes("android ? 8"), 'Android cinematic sky must remain capped at 8 fps.');
expect(!sky.includes('#orbi-climate-core-container'), 'Sky renderer must never inspect Golden Orb internals.');

for (const forbidden of ['filter: blur(', 'backdrop-filter', 'mix-blend-mode', 'translateZ(', 'will-change: transform']) {
  expect(!skyCss.includes(forbidden), `V9 sky CSS must not use compositor-heavy token: ${forbidden}`);
}
expect(!skyCss.includes('#orbi-climate-core-container'), 'V9 sky CSS must never target Golden Orb internals.');
expect(skyCss.includes("[data-sky-engine='v9']"), 'V9 must explicitly retire duplicate legacy sky layers.');

for (const phase of ['auto', 'dawn', 'day', 'dusk', 'night']) {
  expect(debug.includes(`id: '${phase}'`), `Atmosphere Lab missing visual phase preset: ${phase}`);
}
expect(debug.includes('ATMOSPHERE_PHASE_DEBUG_KEY'), 'Visual time override must have its own storage key.');
expect(debug.includes("localStorage.removeItem(ATMOSPHERE_PHASE_DEBUG_KEY)"), 'AUTO must remove the visual time override cleanly.');
expect(host.includes('getAtmosphereDebugPhase'), 'Atmosphere host must read visual phase overrides.');
expect(host.includes("phaseOverride={debugPhase === 'auto' ? undefined : debugPhase}"), 'Atmosphere host must apply visual phase override non-destructively.');
expect(lab.includes('Luz / hora visual'), 'ATM LAB must expose the time-of-day QA selector.');
expect(lab.includes("setAtmosphereDebugPhase('auto')"), 'Volver a LIVE must reset the visual phase to AUTO.');
expect(preview.includes('phaseOverride={phaseOverride}'), 'ATM LAB preview must render the selected time phase directly.');

console.log('OC-22G Cinematic Sky V9 gate: PASS');

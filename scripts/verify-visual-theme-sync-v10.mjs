import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(path, 'utf8');
const fail = (message) => {
  console.error(`OC-22 Visual Theme Sync V10: FAIL\n${message}`);
  process.exit(1);
};
const expect = (condition, message) => {
  if (!condition) fail(message);
};

const main = read('src/main.tsx');
const bridge = read('src/services/atmosphereVisualThemeBridge.ts');
const css = read('src/styles/atmosphere-visual-theme-sync-v10.css');
const skyWrapper = read('src/components/CinematicSkyCanvas.tsx');
const sky = read('src/components/CinematicSkyCanvasV10.tsx');

expect(main.includes('initializeAtmosphereVisualThemeBridge'), 'Visual weather theme bridge must initialize at app startup.');
expect(main.includes('atmosphere-visual-theme-sync-v10.css'), 'V10 visual theme stylesheet must be loaded.');
expect(bridge.includes('isDeveloperModeEnabled()'), 'ATM theme synchronization must be developer-only.');
expect(bridge.includes("preset === 'live'"), 'LIVE must remove the visual theme override.');
expect(bridge.includes('ATMOSPHERE_DEBUG_EVENT'), 'Theme bridge must react immediately to ATM LAB preset changes.');
expect(bridge.includes('dataset[ROOT_THEME_ATTRIBUTE]'), 'Theme bridge must use a visual-only root dataset rather than mutating Weather Truth.');

for (const preset of ['sunny', 'partly_cloudy', 'cloudy', 'rain', 'storm', 'wind', 'cold', 'hot', 'night']) {
  expect(css.includes(`data-orbi-atm-theme='${preset}'`), `Missing visual palette sync for ${preset}.`);
}
expect(css.includes('#welcome-hero-section h1 > span:first-child'), 'ORBI Clima title gradient must synchronize visually in ATM LAB.');
expect(!css.includes('#orbi-climate-core-container'), 'V10 theme sync must never target the frozen Golden Orb or its descendants.');
expect(!/\btransform\s*:/.test(css), 'V10 theme sync must never override transforms.');
expect(!/\banimation(?:-[a-z-]+)?\s*:/.test(css), 'V10 theme sync must never override animations.');
expect(!/\bclip-path\s*:/.test(css), 'V10 theme sync must never change the proven Android Orb clip.');
expect(!/\bfilter\s*:/.test(css), 'V10 theme sync must never change compositor filters.');
expect(!/\boverflow\s*:/.test(css), 'V10 theme sync must never change compositor overflow.');

expect(skyWrapper.includes('CinematicSkyCanvasV10'), 'Cinematic sky wrapper must route through V10.');
expect(sky.includes('const highSun ='), 'V10 sky must calculate high-sun altitude.');
expect(sky.includes('lerp(0.56, 0.08, highSun)'), 'High midday sun disc must dissolve instead of remaining opaque.');
expect(sky.includes('opaque floating button'), 'V10 must document the physical-device high-sun correction.');
expect(!sky.includes('backdrop-filter'), 'Cinematic Sky V10 must not use backdrop filters.');
expect(!sky.includes('mix-blend-mode'), 'Cinematic Sky V10 must not use blend compositing.');
expect(!sky.includes('translateZ'), 'Cinematic Sky V10 must not force 3D compositing.');

console.log('OC-22 Visual Theme Sync + Cinematic Sky V10 gate: PASS');

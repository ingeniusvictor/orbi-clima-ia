import { readFileSync } from 'node:fs';

const clipCss = readFileSync('src/styles/orb-android-clip-guard.css', 'utf8');
const skinCss = readFileSync('src/styles/orb-android-fluid-skin.css', 'utf8');
const service = readFileSync('src/services/androidGoldenOrbFluidSkin.ts', 'utf8');
const main = readFileSync('src/main.tsx', 'utf8');

const fail = (message) => {
  console.error(`Android Golden Orb live-motion gate: FAIL\n${message}`);
  process.exit(1);
};
const expect = (condition, message) => {
  if (!condition) fail(message);
};

expect(clipCss.includes('clip-path: circle(50% at 50% 50%)'), 'Android Orb core must keep the stable circular clip that eliminated black compositor tiles.');
expect(clipCss.includes('orbi-android-liquid-light'), 'Android Orb core must retain internal liquid-light motion.');
expect(clipCss.includes('orbi-android-optical-drift'), 'Android Orb core must retain moving optical highlight depth.');
expect(!clipCss.includes('orbi-android-safe-breathe'), 'Artificial wrapper breathing from 10612 must remain removed.');

expect(main.includes('initializeAndroidGoldenOrbFluidSkin'), 'Android Golden Orb fluid skin bootstrap must be initialized.');
expect(main.includes('orb-android-fluid-skin.css'), 'Android Golden Orb fluid skin stylesheet must be loaded.');
expect(service.includes('orbi-android-fluid-skin'), 'Fluid skin service must create the decorative companion layer.');
expect(service.includes('backgroundImage = style.backgroundImage'), 'Fluid skin must reuse the exact rendered Orb weather gradient.');
expect(service.includes('durationByScene'), 'Fluid skin must follow the weather-dependent Orb rhythm.');

for (const geometry of [
  '48% 52% 55% 45% / 48% 54% 46% 52%',
  '53% 47% 43% 57% / 55% 45% 55% 45%',
  '45% 55% 58% 42% / 42% 58% 42% 58%',
  '51% 49% 46% 54% / 53% 47% 53% 47%',
]) {
  expect(skinCss.includes(geometry), `Fluid skin is missing original Golden Orb geometry: ${geometry}`);
}

expect(skinCss.includes('orbi-fluid-skin-morph'), 'Fluid skin must animate the original silhouette morph.');
expect(skinCss.includes('z-index: 8'), 'Fluid skin must remain behind the protected Orb core.');
expect(skinCss.includes('pointer-events: none'), 'Fluid skin must never intercept touches.');

for (const css of [clipCss, skinCss]) {
  for (const forbidden of ['transform: none', 'display: none', 'opacity: 0 !important']) {
    expect(!css.includes(forbidden), `Golden Orb Android layers must not contain ${forbidden}.`);
  }
  expect(!/(^|\n)\s*filter\s*:\s*none\b/m.test(css), 'Golden Orb Android layers must not disable direct CSS filter effects.');
  expect(!css.includes('.blur-3xl'), 'Golden Orb Android layers must not disable the outer halo selectively.');
  expect(!css.includes('.blur-2xl'), 'Golden Orb Android layers must not disable the secondary halo selectively.');
  expect(!css.includes('.mix-blend-screen'), 'Golden Orb Android layers must not target the internal blend layer.');
  expect(!css.includes('.mix-blend-overlay'), 'Golden Orb Android layers must not target storm blend FX.');
}

console.log('Android Golden Orb live-motion gate: PASS (stable core + original fluid companion skin)');

import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(path, 'utf8');
const fail = (message) => {
  console.error(`OC-22 Living Weather Atmosphere: FAIL\n${message}`);
  process.exit(1);
};
const expect = (condition, message) => {
  if (!condition) fail(message);
};

const renderer = read('src/components/LivingWeatherAtmosphere.tsx');
const host = read('src/components/LivingWeatherAtmosphereHost.tsx');
const engine = read('src/services/weatherAtmosphereEngine.ts');
const cache = read('src/services/weatherCacheService.ts');
const css = read('src/styles/living-weather-atmosphere.css');
const hostCss = read('src/styles/living-weather-host.css');
const main = read('src/main.tsx');

for (const quality of ['ultra', 'high', 'balanced', 'low', 'static']) {
  expect(engine.includes(`'${quality}'`), `Missing adaptive quality mode: ${quality}`);
}

for (const scene of ['clear', 'partly-cloudy', 'cloudy', 'rain', 'storm', 'wind', 'cold', 'hot']) {
  expect(engine.includes(`'${scene}'`), `Missing weather scene mapping: ${scene}`);
}

expect(renderer.includes('document.visibilityState'), 'Animations must pause when the page is hidden.');
expect(renderer.includes("quality !== 'static'"), 'Static/reduced-motion mode must suppress particle animation.');
expect(host.includes("orbi_clima_first_launch_completed_v1"), 'Atmosphere host must stay out of first-launch onboarding.');
expect(cache.includes("orbi-weather-bundle-updated"), 'Weather cache must publish same-tab atmosphere refresh events.');
expect(main.includes('<LivingWeatherAtmosphereHost />'), 'Atmosphere host is not mounted at application root.');
expect(hostCss.includes('pointer-events: none'), 'Atmosphere host must never intercept gestures.');
expect(hostCss.includes('z-index: 2'), 'Atmosphere host must remain below the existing z-10 mobile content.');
expect(css.includes("prefers-reduced-motion: reduce"), 'Reduced-motion accessibility fallback is missing.');
expect(css.includes("data-quality='static'"), 'Static performance fallback is missing.');

const forbiddenCss = [
  ['backdrop-filter', 'Do not use backdrop-filter in OC-22: Android WebView compositing/scroll bleed risk.'],
  ['mix-blend-mode', 'Do not use mix-blend-mode in OC-22: keep weather layers isolated from Golden Orb compositing.'],
  ['background-attachment: fixed', 'Do not use fixed backgrounds inside Android WebView.'],
];

for (const [token, message] of forbiddenCss) {
  expect(!css.includes(token), message);
}

for (const protectedPath of [
  'src/components/OrbiClimateCore.tsx',
  'src/styles/skycore-fx.css',
  'src/components/WelcomeHeroSection.tsx',
]) {
  expect(!renderer.includes(protectedPath), `Atmosphere renderer must not depend on protected Golden Orb file ${protectedPath}.`);
}

console.log('OC-22 Living Weather Atmosphere source gate: PASS');

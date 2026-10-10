import { existsSync, readFileSync } from 'node:fs';

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
const lab = read('src/components/AtmosphereLabOverlay.tsx');
const debugService = read('src/services/weatherAtmosphereDebugService.ts');
const engine = read('src/services/weatherAtmosphereEngine.ts');
const cache = read('src/services/weatherCacheService.ts');
const coreCss = read('src/styles/living-weather-atmosphere.css');
const effectsCss = read('src/styles/living-weather-effects.css');
const visibilityCss = read('src/styles/living-weather-visibility.css');
const androidSafeCss = read('src/styles/living-weather-android-safe.css');
const cloudCss = read('src/styles/living-weather-clouds-v2.css');
const canvasCss = read('src/styles/living-weather-canvas-v4.css');
const cloudA = read('public/weather/clouds/cloud-soft-a.svg');
const cloudB = read('public/weather/clouds/cloud-soft-b.svg');
const cloudC = read('public/weather/clouds/cloud-soft-c.svg');
const stormCloud = read('public/weather/clouds/cloud-storm.svg');
const css = `${coreCss}\n${effectsCss}`;
const hostCss = read('src/styles/living-weather-host.css');
const compositorCss = read('src/styles/android-compositor-guard.css');
const main = read('src/main.tsx');

for (const quality of ['ultra', 'high', 'balanced', 'low', 'static']) {
  expect(engine.includes(`'${quality}'`), `Missing adaptive quality mode: ${quality}`);
}

for (const scene of ['clear', 'partly-cloudy', 'cloudy', 'rain', 'storm', 'wind', 'cold', 'hot']) {
  expect(engine.includes(`'${scene}'`), `Missing weather scene mapping: ${scene}`);
}

for (const preset of ['live', 'sunny', 'partly_cloudy', 'cloudy', 'rain', 'storm', 'wind', 'cold', 'hot', 'night']) {
  expect(debugService.includes(`id: '${preset}'`), `Atmosphere Lab is missing preset: ${preset}`);
}

expect(renderer.includes('document.visibilityState'), 'Animations must pause when the page is hidden.');
expect(renderer.includes("quality !== 'static'"), 'Static/reduced-motion mode must suppress particle animation.');
expect(renderer.includes('lwa-sun-rays'), 'Clear/hot weather must have a distinct sunlight signature.');
expect(renderer.includes('lwa-wind-streams'), 'Wind weather must have a distinct motion signature.');
expect(renderer.includes('lwa-heat-waves'), 'Hot weather must have a distinct heat signature.');
expect(renderer.includes('NaturalCloudCanvas'), 'Natural Cloud Canvas V4 must own the runtime cloud rendering path.');
expect(host.includes("orbi_clima_first_launch_completed_v1"), 'Atmosphere host must stay out of first-launch onboarding.');
expect(host.includes('MutationObserver'), 'Atmosphere host must observe Home visibility and stop work outside Home.');
expect(host.includes('active={homeVisible}'), 'Atmosphere renderer must pause/mute outside Home.');
expect(host.includes('applyAtmosphereDebugPreset'), 'Atmosphere host must support non-destructive developer scene overrides.');
expect(cache.includes("orbi-weather-bundle-updated"), 'Weather cache must publish same-tab atmosphere refresh events.');
expect(main.includes('<LivingWeatherAtmosphereHost />'), 'Atmosphere host is not mounted at application root.');
expect(main.includes('<AtmosphereLabOverlay />'), 'Developer Atmosphere Lab is not mounted.');
expect(main.includes("./styles/living-weather-visibility.css"), 'Physical-device atmosphere visibility tuning is not loaded.');
expect(main.includes("./styles/living-weather-android-safe.css"), 'Android-safe Living Weather compositor profile is not loaded.');
expect(main.includes("./styles/living-weather-canvas-v4.css"), 'Natural Cloud Canvas V4 styling is not loaded.');
expect(!main.includes("./styles/orb-android-stability.css"), 'Golden Orb motion-freezing stylesheet must never be loaded.');
expect(!existsSync('src/styles/orb-android-stability.css'), 'Golden Orb motion-freezing stylesheet must remain deleted.');
expect(lab.includes('isDeveloperModeEnabled()'), 'Atmosphere Lab must be hidden unless developer mode is unlocked and enabled.');
expect(lab.includes('no modifica el clima guardado'), 'Atmosphere Lab must explain that presets are visual-only.');
expect(debugService.includes("localStorage.removeItem(ATMOSPHERE_DEBUG_KEY)"), 'LIVE reset must remove the visual override cleanly.');
expect(hostCss.includes('pointer-events: none'), 'Atmosphere host must never intercept gestures.');
expect(hostCss.includes('z-index: 2'), 'Atmosphere host must remain below the existing z-10 mobile content.');
expect(css.includes("prefers-reduced-motion: reduce"), 'Reduced-motion accessibility fallback is missing.');
expect(css.includes("data-quality='static'"), 'Static performance fallback is missing.');
expect(effectsCss.includes("data-quality='low'"), 'Extended cinematic effects must degrade on LOW quality.');

expect(visibilityCss.includes('#orbi-mobile-home-screen > #welcome-hero-section'), 'Hero transparency override is missing.');
expect(visibilityCss.includes('.lwa-readable-veil'), 'Global readability veil must be explicitly tuned for physical visibility.');
expect(visibilityCss.includes('.lwa-vignette'), 'Atmosphere vignette must be explicitly tuned for physical visibility.');
expect(visibilityCss.includes('backdrop-filter: none !important'), 'Android Hero backdrop blur must be disabled to reveal weather detail and prevent scroll ghosting.');
expect(!visibilityCss.includes('rgba(5, 10, 24, 0.84)'), 'Do not reintroduce the nearly opaque Hero surface that hid Living Weather.');
expect(!visibilityCss.includes('rgba(2, 6, 18, 0.82)'), 'Do not reintroduce the nearly opaque Home surface that hid Living Weather.');

expect(main.includes("isAndroidNativeRuntime()"), 'Native Android runtime must be detected before rendering.');
expect(main.includes("classList.add('capacitor-android', 'android-webview')"), 'Android compositor guard classes are not activated before first React paint.');
expect(compositorCss.includes('#first-launch-onboarding'), 'Android onboarding compositor guard is missing.');
expect(compositorCss.includes('#orbi-mobile-home-screen'), 'Android Home compositor guard is missing.');
expect(compositorCss.includes('backdrop-filter: none'), 'Android compositor guard must disable backdrop-filter on risky surfaces.');

expect(androidSafeCss.includes('.lwa-cloud'), 'Android-safe profile must explicitly cover legacy cloud layers.');
expect(androidSafeCss.includes('.lwa-mist'), 'Android-safe profile must explicitly cover mist layers.');
expect(androidSafeCss.includes('filter: none !important'), 'Android-safe profile must remove heavy blur filters.');
expect(androidSafeCss.includes('will-change: auto !important'), 'Android-safe profile must remove persistent GPU promotion hints.');
expect(androidSafeCss.includes('contain: none !important'), 'Android-safe profile must not isolate the weather into stale compositor tiles.');
expect(androidSafeCss.includes('transform: none !important'), 'Android-safe profile must remove forced 3D promotion on full-screen atmosphere layers.');

// V2 assets remain only as rollback-compatible source material; V4 runtime hides
// their DOM fields and renders fractal clouds through one stable canvas.
for (const svg of [cloudA, cloudB, cloudC, stormCloud]) {
  expect(svg.includes('<path'), 'Rollback cloud assets must remain structurally valid.');
}
expect(cloudCss.includes("cloud-soft-a.svg"), 'Rollback cloud renderer asset A is missing.');
expect(canvasCss.includes('.lwa-natural-cloud-canvas'), 'V4 fixed cloud canvas style is missing.');
expect(canvasCss.includes('.lwa-cloud-field'), 'V4 must explicitly retire illustrated cloud fields.');
expect(canvasCss.includes('display: none !important'), 'Illustrated cloud fields must be hidden in V4.');
expect(!canvasCss.includes('blur('), 'V4 canvas must not depend on runtime blur filters.');
expect(!canvasCss.includes('#orbi-climate-core-container'), 'Living Weather must never override Golden Orb internals.');

const forbiddenCss = [
  ['backdrop-filter', 'Do not use backdrop-filter in OC-22 atmosphere layers: Android WebView compositing/scroll bleed risk.'],
  ['mix-blend-mode', 'Do not use mix-blend-mode in OC-22 atmosphere layers: keep weather layers isolated from Golden Orb compositing.'],
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

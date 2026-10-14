import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(path, 'utf8');
const fail = (message) => {
  console.error(`OC-22H Android compositor budget: FAIL\n${message}`);
  process.exit(1);
};
const expect = (condition, message) => {
  if (!condition) fail(message);
};

const transitionAtmosphere = read('src/components/LivingWeatherAtmosphereTransitionV11.tsx');
const orbCore = read('src/components/OrbiClimateCore.tsx');
const orbCss = read('src/styles/skycore-fx.css');
const hero = read('src/components/WelcomeHeroSection.tsx');

expect(transitionAtmosphere.includes('ANDROID_CLOUD_FAMILY_BUDGET = 2'), 'Android cloud-family budget must remain capped at two.');
expect(transitionAtmosphere.includes('ANDROID_CLOUD_MIN_WEIGHT = 0.035'), 'Android residual cloud-family threshold is missing.');
expect(transitionAtmosphere.includes("document.documentElement.classList.contains('capacitor-android')"), 'Android WebView detection is missing.');
expect(transitionAtmosphere.includes("document.documentElement.classList.contains('android-webview')"), 'Android WebView fallback detection is missing.');
expect(transitionAtmosphere.includes('.slice(0, ANDROID_CLOUD_FAMILY_BUDGET)'), 'Android cloud-family list must be hard-capped at two.');
expect(transitionAtmosphere.includes('scene === animatedCloudScene'), 'Only one cloud-family Canvas may animate during Android crossfade.');
expect(transitionAtmosphere.includes('data-android-cloud-budget'), 'Runtime diagnostics must expose the Android compositor budget.');
expect(transitionAtmosphere.includes('data-animated-cloud-family'), 'Runtime diagnostics must expose the single animated cloud family.');

for (const protectedSource of [orbCore, orbCss, hero]) {
  expect(!protectedSource.includes('ANDROID_CLOUD_FAMILY_BUDGET'), 'Android compositor mitigation leaked into a frozen Golden Orb surface.');
  expect(!protectedSource.includes('animatedCloudScene'), 'Cloud-family compositor state leaked into a frozen Golden Orb surface.');
}

console.log('OC-22H Android compositor budget gate: PASS');

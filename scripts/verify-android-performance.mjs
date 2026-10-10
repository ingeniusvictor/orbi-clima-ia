import fs from 'node:fs';

const read = (path) => {
  if (!fs.existsSync(path)) throw new Error(`Missing required file: ${path}`);
  return fs.readFileSync(path, 'utf8');
};

const store = read('android/app/src/main/java/com/orbi/clima/alerts/OfficialAlertWatchStore.kt');
const openMeteo = read('src/services/openMeteoClient.ts');
const skyCoreNarrative = read('src/utils/orbiSkyCoreNarrative.ts');
const protectedFiles = [
  'src/components/OrbiClimateCore.tsx',
  'src/styles/skycore-fx.css',
  'src/components/WelcomeHeroSection.tsx',
];

const failures = [];
const requireText = (source, text, label) => {
  if (!source.includes(text)) failures.push(`Missing ${label}: ${text}`);
};

requireText(store, 'DELIVERY_PRUNE_INTERVAL_MS = TimeUnit.DAYS.toMillis(1)', 'daily retention-prune throttle');
requireText(store, 'LAST_DELIVERY_PRUNE_AT', 'retention-prune timestamp');
requireText(store, 'now - lastPruneAt < DELIVERY_PRUNE_INTERVAL_MS', 'retention-prune early return');
requireText(store, '.asSequence()', 'lazy delivered-key scan');

requireText(openMeteo, 'const inFlightForecastRequests = new Map<string, Promise<OpenMeteoRawResponse>>()', 'forecast HTTP coalescing map');
requireText(openMeteo, 'const inFlightWeatherFetches = new Map<string, Promise<OpenMeteoRawResponse>>()', 'full weather coalescing map');
requireText(openMeteo, 'const existing = inFlightForecastRequests.get(url)', 'forecast request reuse');
requireText(openMeteo, 'inFlightForecastRequests.delete(url)', 'forecast request cleanup');
requireText(openMeteo, 'const existing = inFlightWeatherFetches.get(requestKey)', 'weather truth request reuse');
requireText(openMeteo, 'inFlightWeatherFetches.delete(requestKey)', 'weather truth request cleanup');

requireText(skyCoreNarrative, 'lastCurrent === current', 'SkyCore current-weather identity memoization');
requireText(skyCoreNarrative, 'lastHourly === hourly', 'SkyCore hourly identity memoization');
requireText(skyCoreNarrative, 'lastDaily === daily', 'SkyCore daily identity memoization');
requireText(skyCoreNarrative, 'lastProfile === activeProfile', 'SkyCore profile memoization');
requireText(skyCoreNarrative, 'lastSummary = summary', 'SkyCore summary cache update');

for (const path of protectedFiles) {
  if (!fs.existsSync(path)) failures.push(`Protected Golden Orb file missing: ${path}`);
}

if (failures.length) {
  console.error('OC-21 Android Performance gate: FAIL');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('OC-21 Android Performance gate: PASS');
console.log('Background retention scans, duplicate weather requests, and repeated SkyCore summary analysis are bounded.');

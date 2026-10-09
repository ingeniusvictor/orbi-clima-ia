import fs from 'node:fs';

const required = [
  ['android/app/src/main/java/com/orbi/clima/runtime/OrbiRuntimeDiagnosticsPlugin.kt', [
    '@CapacitorPlugin(name = "OrbiRuntimeDiagnostics")',
    'batteryOptimizationActive',
    'backgroundRestricted',
    'placedWidgetCount',
    'usesBackgroundLocation',
  ]],
  ['android/app/src/main/java/com/orbi/clima/MainActivity.java', [
    'OrbiRuntimeDiagnosticsPlugin',
    'registerPlugin(OrbiRuntimeDiagnosticsPlugin.class)',
  ]],
  ['src/services/androidRuntimeDiagnosticsService.ts', [
    "registerPlugin<RuntimeDiagnosticsPlugin>('OrbiRuntimeDiagnostics')",
    'getAndroidRuntimeDiagnostics',
  ]],
  ['src/components/AndroidRuntimeReadinessCard.tsx', [
    'Device Readiness',
    'WorkManager SENAPRED',
    'Premium 4×4',
  ]],
  ['src/components/MobileSettingsScreen.tsx', [
    'AndroidRuntimeReadinessCard',
  ]],
];

const failures = [];
for (const [path, needles] of required) {
  if (!fs.existsSync(path)) {
    failures.push(`missing file: ${path}`);
    continue;
  }
  const text = fs.readFileSync(path, 'utf8');
  for (const needle of needles) {
    if (!text.includes(needle)) failures.push(`${path}: missing ${needle}`);
  }
}

const manifest = fs.readFileSync('android/app/src/main/AndroidManifest.xml', 'utf8');
for (const forbidden of [
  'android.permission.ACCESS_BACKGROUND_LOCATION',
  'android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS',
  'android.permission.FOREGROUND_SERVICE',
]) {
  if (manifest.includes(forbidden)) failures.push(`forbidden permission introduced: ${forbidden}`);
}

if (failures.length) {
  console.error('OC-14 runtime readiness gate: FAIL');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('OC-14 runtime readiness gate: PASS');

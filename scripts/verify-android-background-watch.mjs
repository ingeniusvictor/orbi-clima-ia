import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];

function read(relativePath) {
  const absolute = path.join(root, relativePath);
  if (!fs.existsSync(absolute)) {
    failures.push(`Missing required file: ${relativePath}`);
    return '';
  }
  return fs.readFileSync(absolute, 'utf8');
}

function expectContains(relativePath, text, needle, label = needle) {
  if (!text.includes(needle)) {
    failures.push(`${relativePath}: missing ${label}`);
  }
}

function expectNotContains(relativePath, text, needle, label = needle) {
  if (text.includes(needle)) {
    failures.push(`${relativePath}: forbidden ${label}`);
  }
}

const manifestPath = 'android/app/src/main/AndroidManifest.xml';
const manifest = read(manifestPath);
for (const permission of [
  'android.permission.INTERNET',
  'android.permission.ACCESS_COARSE_LOCATION',
  'android.permission.ACCESS_FINE_LOCATION',
  'android.permission.POST_NOTIFICATIONS',
]) {
  expectContains(manifestPath, manifest, `android:name="${permission}"`, `permission ${permission}`);
}
for (const permission of [
  'android.permission.ACCESS_BACKGROUND_LOCATION',
  'android.permission.FOREGROUND_SERVICE',
  'android.permission.FOREGROUND_SERVICE_LOCATION',
]) {
  expectNotContains(manifestPath, manifest, `android:name="${permission}"`, `permission ${permission}`);
}

for (const receiver of [
  '.widget.OrbiSkyOrbWidgetReceiver',
  '.widget.OrbiSkyOrbMiniWidgetReceiver',
  '.widget.OrbiSkyOrbPanelWidgetReceiver',
  '.widget.OrbiSkyOrbCommandWidgetReceiver',
  '.widget.OrbiSkyOrbCommandPremiumWidgetReceiver',
]) {
  expectContains(manifestPath, manifest, receiver, `widget receiver ${receiver}`);
}

const mainActivityPath = 'android/app/src/main/java/com/orbi/clima/MainActivity.java';
const mainActivity = read(mainActivityPath);
expectContains(mainActivityPath, mainActivity, 'registerPlugin(OrbiWidgetBridgePlugin.class)', 'widget bridge registration');
expectContains(mainActivityPath, mainActivity, 'registerPlugin(OrbiOfficialAlertWatchPlugin.class)', 'official alert watch bridge registration');

const buildGradlePath = 'android/app/build.gradle';
const buildGradle = read(buildGradlePath);
expectContains(buildGradlePath, buildGradle, 'androidx.work:work-runtime-ktx:2.9.1', 'WorkManager dependency');
expectContains(buildGradlePath, buildGradle, "apply from: 'capacitor.build.gradle'", 'generated Capacitor plugin dependency application');
expectContains(buildGradlePath, buildGradle, 'androidx.glance:glance-appwidget:1.1.0', 'Glance widget dependency');

const requiredNativeFiles = [
  'android/app/src/main/java/com/orbi/clima/alerts/OfficialAlertWatchStore.kt',
  'android/app/src/main/java/com/orbi/clima/alerts/SenapredBackgroundClient.kt',
  'android/app/src/main/java/com/orbi/clima/alerts/OfficialAlertWorker.kt',
  'android/app/src/main/java/com/orbi/clima/alerts/OrbiOfficialAlertWatchPlugin.kt',
  'android/app/src/main/res/drawable/ic_stat_orbi_alert.xml',
];
for (const file of requiredNativeFiles) read(file);

const alertSource = requiredNativeFiles
  .filter(file => file.endsWith('.kt'))
  .map(file => read(file))
  .join('\n');
for (const forbidden of [
  'ACCESS_BACKGROUND_LOCATION',
  'FusedLocationProviderClient',
  'LocationManager',
  'requestLocationUpdates',
  'startForeground(',
]) {
  if (alertSource.includes(forbidden)) {
    failures.push(`Native alert watch violates privacy invariant: found ${forbidden}`);
  }
}
expectContains(
  'android/app/src/main/java/com/orbi/clima/alerts/OrbiOfficialAlertWatchPlugin.kt',
  alertSource,
  'PeriodicWorkRequestBuilder<OfficialAlertWorker>',
  'periodic WorkManager scheduling',
);
expectContains(
  'android/app/src/main/java/com/orbi/clima/alerts/OfficialAlertWorker.kt',
  alertSource,
  'hasVerifiedCoverage',
  'verified-coverage gate',
);
expectContains(
  'android/app/src/main/java/com/orbi/clima/alerts/OfficialAlertWorker.kt',
  alertSource,
  'isDelivered(applicationContext',
  'native persistent dedup gate',
);

const bridgeServicePath = 'src/services/officialAlertBackgroundWatchService.ts';
const bridgeService = read(bridgeServicePath);
expectContains(bridgeServicePath, bridgeService, "registerPlugin<OfficialAlertWatchPlugin>('OrbiOfficialAlertWatch')", 'Capacitor native bridge');
expectContains(bridgeServicePath, bridgeService, 'loadQuietHoursSettings()', 'quiet-hours synchronization');

const notificationServicePath = 'src/services/orbiNotificationService.ts';
const notificationService = read(notificationServicePath);
expectContains(notificationServicePath, notificationService, 'isOfficialAlertDeliveredNative', 'cross-runtime dedup lookup');
expectContains(notificationServicePath, notificationService, 'markOfficialAlertDeliveredNative', 'cross-runtime delivery ledger sync');

const rebuildPath = 'scripts/rebuild-android-clean.ps1';
const rebuild = read(rebuildPath);
for (const invariant of [
  'java/com/orbi/clima',
  'orbi_*_widget_info.xml',
  'ic_stat_orbi_alert.xml',
  'MainActivity.java',
  'verify-android-background-watch.mjs',
]) {
  expectContains(rebuildPath, rebuild, invariant, `rebuild preservation invariant ${invariant}`);
}

const patchPath = 'scripts/patch-android-manifest.ps1';
const patch = read(patchPath);
for (const forbiddenPermission of [
  'android.permission.ACCESS_BACKGROUND_LOCATION',
  'android.permission.FOREGROUND_SERVICE',
  'android.permission.FOREGROUND_SERVICE_LOCATION',
]) {
  expectContains(patchPath, patch, forbiddenPermission, `explicit removal rule ${forbiddenPermission}`);
}

if (failures.length > 0) {
  console.error('OC-11 Android background watch verification: FAILED');
  for (const failure of failures) console.error(` - ${failure}`);
  process.exit(1);
}

console.log('OC-11 Android background watch verification: PASS');
console.log(' - WorkManager native watch present');
console.log(' - foreground-confirmed location snapshot only');
console.log(' - no background-location / foreground-service permissions');
console.log(' - SENAPRED verified-coverage gate present');
console.log(' - web/native official-alert dedup synchronized');
console.log(' - all five Android widget receivers preserved');
console.log(' - clean Android rebuild preserves custom native sources');

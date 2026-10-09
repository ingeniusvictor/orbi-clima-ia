import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const failures = [];

function requireMatch(label, content, pattern) {
  if (!pattern.test(content)) failures.push(`${label}: missing ${pattern}`);
}

function forbidMatch(label, content, pattern) {
  if (pattern.test(content)) failures.push(`${label}: forbidden ${pattern}`);
}

const variables = read('android/variables.gradle');
const manifest = read('android/app/src/main/AndroidManifest.xml');
const mainActivity = read('android/app/src/main/java/com/orbi/clima/MainActivity.java');
const geoService = read('src/services/geolocationService.ts');
const notificationPermission = read('src/services/notificationPermissionService.ts');
const backgroundService = read('src/services/officialAlertBackgroundWatchService.ts');
const backgroundWorker = read('android/app/src/main/java/com/orbi/clima/alerts/OfficialAlertWorker.kt');
const backgroundPlugin = read('android/app/src/main/java/com/orbi/clima/alerts/OrbiOfficialAlertWatchPlugin.kt');

requireMatch('Gradle compile SDK', variables, /compileSdkVersion\s*=\s*36/);
requireMatch('Gradle target SDK', variables, /targetSdkVersion\s*=\s*36/);
requireMatch('Minimum SDK preserved', variables, /minSdkVersion\s*=\s*26/);

for (const permission of [
  'android.permission.INTERNET',
  'android.permission.ACCESS_COARSE_LOCATION',
  'android.permission.ACCESS_FINE_LOCATION',
  'android.permission.POST_NOTIFICATIONS',
]) {
  requireMatch(`Manifest permission ${permission}`, manifest, new RegExp(permission.replaceAll('.', '\\.')));
}

for (const permission of [
  'android.permission.ACCESS_BACKGROUND_LOCATION',
  'android.permission.SCHEDULE_EXACT_ALARM',
  'android.permission.USE_EXACT_ALARM',
  'android.permission.FOREGROUND_SERVICE',
  'android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS',
]) {
  forbidMatch(`Manifest least-privilege ${permission}`, manifest, new RegExp(permission.replaceAll('.', '\\.')));
}

requireMatch('Manifest keyboard resize', manifest, /android:windowSoftInputMode="adjustResize"/);
forbidMatch('Manifest edge-to-edge opt-out', manifest, /windowOptOutEdgeToEdgeEnforcement/);

requireMatch('MainActivity Android 15+ guard', mainActivity, /ANDROID_15_API\s*=\s*35/);
requireMatch('MainActivity system bar insets', mainActivity, /WindowInsetsCompat\.Type\.systemBars\(\)/);
requireMatch('MainActivity cutout insets', mainActivity, /WindowInsetsCompat\.Type\.displayCutout\(\)/);
requireMatch('MainActivity applies safe padding', mainActivity, /view\.setPadding\(/);
requireMatch('MainActivity preserves IME handling', mainActivity, /new WindowInsetsCompat\.Builder\(windowInsets\)/);

requireMatch('Foreground geolocation permission check', geoService, /Geolocation\.checkPermissions\(\)/);
requireMatch('Foreground geolocation permission request', geoService, /Geolocation\.requestPermissions\(\)/);
forbidMatch('Foreground geolocation must not request background permission', geoService, /backgroundLocation|ACCESS_BACKGROUND_LOCATION/);

requireMatch('Notification permission check', notificationPermission, /LocalNotifications\.checkPermissions\(\)/);
requireMatch('Notification permission request', notificationPermission, /LocalNotifications\.requestPermissions\(\)/);

requireMatch('Background watch reports background-location usage', backgroundService, /usesBackgroundLocation:\s*boolean/);
requireMatch('Background watch reports foreground-service usage', backgroundService, /usesForegroundService:\s*boolean/);
forbidMatch('Background worker must not acquire location', backgroundWorker, /LocationManager|FusedLocationProvider|requestLocationUpdates|getCurrentLocation/);
forbidMatch('Background plugin must not acquire location', backgroundPlugin, /LocationManager|FusedLocationProvider|requestLocationUpdates|getCurrentLocation/);
requireMatch('Background worker POST_NOTIFICATIONS guard', backgroundWorker, /Manifest\.permission\.POST_NOTIFICATIONS/);
requireMatch('Background worker WorkManager implementation', backgroundWorker, /CoroutineWorker/);

if (failures.length) {
  console.error('OC-13 Android modern-target gate: FAIL');
  for (const failure of failures) console.error(` - ${failure}`);
  process.exit(1);
}

console.log('OC-13 Android modern-target gate: PASS');
console.log(' - targetSdk/compileSdk 36');
console.log(' - foreground-only location permissions');
console.log(' - POST_NOTIFICATIONS runtime path present');
console.log(' - no exact-alarm / foreground-service privilege added');
console.log(' - Android 15/16 WebView system-bar and cutout insets handled natively');
console.log(' - OC-11 WorkManager watch remains snapshot-based, without background location');

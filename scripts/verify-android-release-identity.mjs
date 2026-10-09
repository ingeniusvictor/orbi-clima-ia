import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const failures = [];

function requireMatch(label, content, pattern) {
  if (!pattern.test(content)) failures.push(`${label}: missing ${pattern}`);
}

function forbidMatch(label, content, pattern) {
  if (pattern.test(content)) failures.push(`${label}: forbidden ${pattern}`);
}

function requireFile(file) {
  if (!exists(file)) failures.push(`required release resource missing: ${file}`);
}

const pkg = JSON.parse(read('package.json'));
const buildGradle = read('android/app/build.gradle');
const manifest = read('android/app/src/main/AndroidManifest.xml');
const strings = read('android/app/src/main/res/values/strings.xml');
const capacitorConfig = read('capacitor.config.ts');
const indexHtml = read('index.html');
const gitignore = read('.gitignore');

const versionNameMatch = buildGradle.match(/versionName\s+["']([^"']+)["']/);
const versionCodeMatch = buildGradle.match(/versionCode\s+(\d+)/);
const versionName = versionNameMatch?.[1] ?? '';
const versionCode = Number(versionCodeMatch?.[1] ?? 0);

if (!versionName) failures.push('Android versionName is missing');
if (versionName && versionName !== pkg.version) {
  failures.push(`Android versionName (${versionName}) must match package.json (${pkg.version})`);
}
if (!Number.isInteger(versionCode) || versionCode <= 0) {
  failures.push(`Android versionCode must be a positive integer, got ${versionCode}`);
}
forbidMatch('Release version must not carry temporary labels', buildGradle, /versionName\s+["'][^"']*(final-clean|draft|temp|test)[^"']*["']/i);

requireMatch('Android applicationId', buildGradle, /applicationId\s+["']com\.orbi\.clima["']/);
requireMatch('Capacitor appId', capacitorConfig, /appId:\s*["']com\.orbi\.clima["']/);
requireMatch('Capacitor appName', capacitorConfig, /appName:\s*["']ORBI Clima IA["']/);
requireMatch('Android app_name string', strings, /<string name="app_name">ORBI Clima IA<\/string>/);

requireMatch('Launcher app label', manifest, /android:label="@string\/app_name"/);
requireMatch('Adaptive launcher icon', manifest, /android:icon="@mipmap\/ic_launcher"/);
requireMatch('Round launcher icon', manifest, /android:roundIcon="@mipmap\/ic_launcher_round"/);
requireMatch('Local backup disabled', manifest, /android:allowBackup="false"/);
requireMatch('Android 12+ extraction rules', manifest, /android:dataExtractionRules="@xml\/data_extraction_rules"/);
requireMatch('Legacy backup rules', manifest, /android:fullBackupContent="@xml\/backup_rules"/);

for (const file of [
  'android/app/src/main/res/values/colors.xml',
  'android/app/src/main/res/drawable/ic_launcher_orbi_foreground.xml',
  'android/app/src/main/res/drawable/ic_launcher_orbi_monochrome.xml',
  'android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml',
  'android/app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml',
  'android/app/src/main/res/mipmap-anydpi-v33/ic_launcher.xml',
  'android/app/src/main/res/mipmap-anydpi-v33/ic_launcher_round.xml',
  'android/app/src/main/res/xml/backup_rules.xml',
  'android/app/src/main/res/xml/data_extraction_rules.xml',
]) requireFile(file);

requireMatch('Spanish HTML language', indexHtml, /<html lang="es">/);
requireMatch('Canonical HTML title', indexHtml, /<title>ORBI Clima IA<\/title>/);
requireMatch('Theme color', indexHtml, /name="theme-color" content="#050A13"/);
requireMatch('Edge-to-edge viewport fit', indexHtml, /viewport-fit=cover/);
forbidMatch('AI Studio placeholder title', indexHtml, /My Google AI Studio App/i);

for (const variable of [
  'ORBI_RELEASE_KEYSTORE_PATH',
  'ORBI_RELEASE_STORE_PASSWORD',
  'ORBI_RELEASE_KEY_ALIAS',
  'ORBI_RELEASE_KEY_PASSWORD',
]) {
  requireMatch(`External signing variable ${variable}`, buildGradle, new RegExp(variable));
}
requireMatch('Partial signing configuration must fail closed', buildGradle, /partially configured/);
requireMatch('Missing keystore must fail closed', buildGradle, /keystore was not found/);
forbidMatch('Hard-coded Gradle store password', buildGradle, /storePassword\s+["'][^"']+["']/);
forbidMatch('Hard-coded Gradle key password', buildGradle, /keyPassword\s+["'][^"']+["']/);
requireMatch('Ignore Java keystores', gitignore, /\*\.jks/);
requireMatch('Ignore generic keystores', gitignore, /\*\.keystore/);

if (failures.length) {
  console.error('OC-14 Android release identity gate: FAIL');
  for (const failure of failures) console.error(` - ${failure}`);
  process.exit(1);
}

console.log('OC-14 Android release identity gate: PASS');
console.log(` - package identity: com.orbi.clima / ORBI Clima IA`);
console.log(` - version: ${versionName} (${versionCode})`);
console.log(' - adaptive + themed launcher icon resources present');
console.log(' - local application backup disabled explicitly');
console.log(' - AI Studio placeholder metadata removed');
console.log(' - release signing is externalized and fail-closed when partially configured');
console.log(' - keystore material remains excluded from Git');

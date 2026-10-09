import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const root = process.cwd();
const androidDir = path.join(root, 'android');
const distIndex = path.join(root, 'dist', 'index.html');
const backupRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'orbi-clima-android-overlay-'));
const originalAndroid = path.join(backupRoot, 'android-original');
const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const node = process.execPath;
let completed = false;

function fail(message) {
  throw new Error(`[OC-12] ${message}`);
}

function run(command, args, label) {
  console.log(`\n[OC-12] ${label}`);
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: 'inherit',
    env: process.env,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    fail(`${label} failed with exit code ${result.status ?? 'unknown'}`);
  }
}

function copyRequired(source, destination) {
  if (!fs.existsSync(source)) fail(`Required overlay path is missing: ${path.relative(root, source)}`);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.cpSync(source, destination, { recursive: true, force: true });
}

function restoreOrbiOverlay() {
  const sourceApp = path.join(originalAndroid, 'app');
  const targetApp = path.join(androidDir, 'app');

  // Canonical module build file.
  copyRequired(path.join(sourceApp, 'build.gradle'), path.join(targetApp, 'build.gradle'));

  // Canonical ORBI manifest with all widget receivers and privacy permissions.
  copyRequired(
    path.join(sourceApp, 'src', 'main', 'AndroidManifest.xml'),
    path.join(targetApp, 'src', 'main', 'AndroidManifest.xml'),
  );

  // Replace generated package with the complete tracked ORBI package so local
  // bridges, widgets and OC-11 background worker are deterministic.
  const generatedPackage = path.join(targetApp, 'src', 'main', 'java', 'com', 'orbi', 'clima');
  fs.rmSync(generatedPackage, { recursive: true, force: true });
  copyRequired(
    path.join(sourceApp, 'src', 'main', 'java', 'com', 'orbi', 'clima'),
    generatedPackage,
  );

  // Merge ORBI resources over Capacitor's generated baseline. Generated icons,
  // themes and splash assets remain available when ORBI has no override.
  const sourceRes = path.join(sourceApp, 'src', 'main', 'res');
  const targetRes = path.join(targetApp, 'src', 'main', 'res');
  copyRequired(sourceRes, targetRes);
}

function writeLocalProperties() {
  const sdk = process.env.ANDROID_SDK_ROOT || process.env.ANDROID_HOME;
  if (!sdk) {
    console.log('[OC-12] ANDROID_SDK_ROOT / ANDROID_HOME not set; Gradle will resolve SDK by environment if available.');
    return;
  }
  const escaped = sdk.replace(/\\/g, '\\\\');
  fs.writeFileSync(path.join(androidDir, 'local.properties'), `sdk.dir=${escaped}\n`, 'utf8');
  console.log(`[OC-12] local.properties -> ${sdk}`);
}

try {
  if (!fs.existsSync(androidDir)) fail('Tracked Android overlay directory is missing.');
  if (!fs.existsSync(distIndex)) fail('dist/index.html is missing. Run npm run build before prepare-android-ci.');

  console.log(`[OC-12] Backing up tracked Android overlay to ${backupRoot}`);
  fs.cpSync(androidDir, originalAndroid, { recursive: true, force: true });

  console.log('[OC-12] Removing partial Android tree before Capacitor regeneration...');
  fs.rmSync(androidDir, { recursive: true, force: true });

  run(npx, ['cap', 'add', 'android'], 'Generate official Capacitor Android base');
  restoreOrbiOverlay();

  run(npx, ['cap', 'sync', 'android'], 'Synchronize Capacitor plugins and web assets');

  // Cap sync owns generated plugin files, while ORBI owns its module build,
  // manifest, package and resources. Reassert those files after sync.
  restoreOrbiOverlay();
  writeLocalProperties();

  run(node, ['scripts/verify-android-background-watch.mjs'], 'Verify ORBI native source invariants on regenerated project');

  const requiredGeneratedFiles = [
    'android/settings.gradle',
    'android/build.gradle',
    'android/variables.gradle',
    'android/gradlew',
    'android/gradle/wrapper/gradle-wrapper.properties',
    'android/app/capacitor.build.gradle',
  ];
  for (const relativePath of requiredGeneratedFiles) {
    if (!fs.existsSync(path.join(root, relativePath))) {
      fail(`Capacitor regeneration did not produce ${relativePath}`);
    }
  }

  completed = true;
  console.log('\n[OC-12] Android CI reconstruction: PASS');
  console.log('[OC-12] Full generated Gradle project is ready for native compilation.');
} finally {
  if (!completed && fs.existsSync(originalAndroid)) {
    console.error('[OC-12] Reconstruction failed; restoring the original tracked Android tree.');
    fs.rmSync(androidDir, { recursive: true, force: true });
    fs.cpSync(originalAndroid, androidDir, { recursive: true, force: true });
  }
  fs.rmSync(backupRoot, { recursive: true, force: true });
}

import fs from 'node:fs';

const gradle = fs.readFileSync('android/app/build.gradle', 'utf8');
const manifest = fs.readFileSync('android/app/src/main/AndroidManifest.xml', 'utf8');
const failures = [];

const requireText = (source, text, label) => {
  if (!source.includes(text)) failures.push(`Missing ${label}: ${text}`);
};

requireText(gradle, 'versionCode 10718', 'OC-18 versionCode');
requireText(gradle, 'versionName "1.0.7-oc18"', 'OC-18 versionName');
requireText(gradle, 'applicationIdSuffix ".qa18"', 'separate QA application id');
requireText(gradle, 'versionNameSuffix "-qa18"', 'QA version suffix');
requireText(gradle, 'ORBI Clima IA QA18', 'QA launcher label');
requireText(manifest, 'android:label="${appLabel}"', 'manifest app-label placeholder');

if (failures.length) {
  console.error('OC-18 QA install channel gate: FAIL');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('OC-18 QA install channel gate: PASS');
console.log('Debug APK installs beside the existing app as com.orbi.clima.qa18 / ORBI Clima IA QA18.');

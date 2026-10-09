# OC-14 — Release Identity & Signing Readiness

## Objective

Turn the reproducible Android build from OC-12/OC-13 into a professional release candidate identity without storing signing secrets in Git and without modifying the approved ORBI weather UI.

## Canonical identity

- Android / Capacitor package: `com.orbi.clima`
- Product name: `ORBI Clima IA`
- Package version: `1.0.6`
- Android `versionName`: `1.0.6`
- Android `versionCode`: `10602` (`1.0.6`, build 02)
- Target / compile SDK: API 36
- Minimum SDK: API 26

The previous temporary Android version label `1.0.6-final-clean` was removed.

## Launcher identity

OC-14 adds a native adaptive launcher identity based on the ORBI Golden Orb language:

- dark ORBI background;
- cyan/teal/blue orb core;
- cyan and gold orbital rings;
- red micro-accent;
- round adaptive icon;
- Android 13+ monochrome/themed icon.

Resources:

- `drawable/ic_launcher_orbi_foreground.xml`
- `drawable/ic_launcher_orbi_monochrome.xml`
- `mipmap-anydpi-v26/ic_launcher.xml`
- `mipmap-anydpi-v26/ic_launcher_round.xml`
- `mipmap-anydpi-v33/ic_launcher.xml`
- `mipmap-anydpi-v33/ic_launcher_round.xml`

The manifest now declares both `android:icon` and `android:roundIcon` and uses `@string/app_name` as the canonical label.

## Local-data backup policy

ORBI stores preferences, selected/saved locations, QA state and other local application state. OC-14 takes the conservative release posture and disables application backup by default:

- `android:allowBackup="false"`
- explicit legacy full-backup exclusions;
- explicit Android 12+ cloud-backup/device-transfer exclusions.

This can be revisited only as a deliberate product/privacy decision.

## Signing model

No upload key, password or keystore is committed to the repository.

A release workstation can opt into signing with all four environment variables:

- `ORBI_RELEASE_KEYSTORE_PATH`
- `ORBI_RELEASE_STORE_PASSWORD`
- `ORBI_RELEASE_KEY_ALIAS`
- `ORBI_RELEASE_KEY_PASSWORD`

Behavior is fail-closed:

- zero variables -> CI/developer build remains unsigned;
- partial variables -> Gradle fails;
- all variables but missing keystore -> Gradle fails;
- all variables + valid keystore -> release build uses `signingConfigs.release`.

`.gitignore` already excludes `*.jks` and `*.keystore`.

## Web/container metadata cleanup

The AI Studio placeholder metadata was removed:

- `<html lang="es">`
- title `ORBI Clima IA`
- ORBI theme color
- `viewport-fit=cover`
- ORBI product description/application name.

## Automated gate

`scripts/verify-android-release-identity.mjs` enforces:

- package/app identity agreement across Android + Capacitor;
- `package.json` version equals Android `versionName`;
- positive Android `versionCode`;
- no temporary `final-clean`, draft, test or temp version label;
- adaptive/round/themed launcher resources exist;
- manifest icon/label wiring exists;
- backup is disabled and exclusion rules exist;
- AI Studio placeholder metadata cannot return;
- release signing uses external `ORBI_RELEASE_*` variables;
- partial/missing signing configuration fails closed;
- no hard-coded Gradle signing password;
- keystore file extensions remain ignored by Git.

The gate runs before the web production build and again after `npx cap copy android` in native CI.

## Certified branch evidence

Run `37923577746` on branch head `52c7a3a8b7af232ac2f840cbadb6c06c0fef3eb4` completed GREEN:

- TypeScript gate;
- OC-11 background-watch gate;
- OC-13 Android 16 target/permission gate;
- OC-14 release identity/signing gate;
- production web build;
- Capacitor copy;
- all three post-copy gates;
- debug APK compile;
- unsigned release AAB compile;
- both artifact uploads.

## What is still not claimed

OC-14 does **not** claim Play-ready signing because an authorized upload key has not yet been supplied. CI intentionally keeps the AAB unsigned.

It also does not claim visual approval of the launcher icon on real OEM launchers until device QA is performed.

The next appropriate phase is device/release-candidate QA: install the debug APK on real Android hardware, verify launcher/system UI/widgets/permissions/alerts, and then establish the protected upload-key workflow for a signed internal-testing AAB.

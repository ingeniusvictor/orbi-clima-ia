# OC-12 — Reproducible Native Android Build Gate

## Objective

Make the Android side of ORBI Clima IA reproducible in CI and prove that the canonical repository can compile its real Kotlin/Java/Capacitor/Glance/WorkManager sources into Android deliverables without relying on a previously configured Android Studio workstation.

## Canonical build foundation

OC-12 restores and versions the Android Gradle root required by a clean checkout:

- `android/build.gradle`
- `android/settings.gradle`
- `android/variables.gradle`
- `android/gradle.properties`
- canonical `android/app/build.gradle`

The native CI toolchain is pinned to:

- JDK 21
- Gradle 8.14.3
- Android Gradle Plugin 8.13.0
- compileSdk 36
- targetSdk 34
- minSdk 26
- Kotlin 2.1.0
- Kotlin Compose compiler plugin 2.1.0

`targetSdk` intentionally remains 34 in OC-12. This phase proves reproducibility and native compilation; target-SDK migration changes runtime/platform behavior and is reserved for a separate QA phase.

## Kotlin / Capacitor 8 compatibility

The first real native compile exposed that Capacitor Geolocation 8 brings Kotlin 2.1 metadata. The former Kotlin 1.9.22 compiler could not consume those dependencies.

OC-12 therefore aligns the Android project with Kotlin 2.1.0, coroutines 1.10.2 and the official Kotlin Compose compiler Gradle plugin. After this alignment, the Capacitor Geolocation Kotlin compilation gate passes.

## Glance widget compatibility

The native compile then exposed twelve latent uses of `Alignment.SpaceBetween` in Glance layouts. Glance rows/columns do not provide Compose `Arrangement.SpaceBetween` through the `Alignment` API.

The affected widget layouts were migrated to supported Glance primitives while preserving the visual distribution intent:

- `OrbiCinematicBarContent.kt`
- `OrbiFieldCommandContent.kt`
- `OrbiSkyPanelContent.kt`
- `OrbiSkyOrbSnapshotContent.kt`
- `OrbiWidgetAtoms.kt`

Two-sided layouts now use `GlanceModifier.defaultWeight()` spacers between left/right content instead of collapsing content to one side.

## CI gate

`.github/workflows/quality-gate.yml` now contains two required execution layers.

### Web quality

1. `npm ci`
2. TypeScript gate
3. OC-11 background-watch source invariant gate
4. production Vite build

### Native Android build

1. checkout from clean runner
2. Node.js 22
3. JDK 21
4. Android SDK setup
5. Android platform/build-tools 36
6. pinned Gradle 8.14.3
7. `npm ci`
8. current web bundle build
9. `npx cap copy android`
10. OC-11 background-watch invariants revalidated after Capacitor copy
11. `:app:assembleDebug`
12. `:app:bundleRelease`
13. debug APK artifact upload
14. unsigned release AAB artifact upload

The native source is therefore tested *after* Capacitor has copied the current web bundle, which prevents a stale generated Android tree from masking regressions.

## Certified branch run

Workflow run: `37918995025`

Head commit certified: `2cdb2de4438219db287d510822a57721a3571c9b`

Result:

- `web-quality`: GREEN
- `android-native-build`: GREEN
- Kotlin/Java native compile: GREEN
- Capacitor Geolocation compile: GREEN
- OC-11 background-watch source guard: GREEN before native compile
- debug APK generated: YES
- unsigned release AAB generated: YES

### Build artifacts

`orbi-clima-debug-apk`

- artifact id: `11610879188`
- size: 16,457,936 bytes
- SHA-256 digest: `860af828c488cc2d2624bc3e5e486fe4cbfc2839ac6d51bb60defa51d84e8824`

`orbi-clima-release-aab-unsigned`

- artifact id: `11610664471`
- size: 14,481,254 bytes
- SHA-256 digest: `032a3361d65b478ae3e0e45d6f0bcc927165f8b98b6793a9ed8b39d4ea4b4489`

Artifacts from this CI run are retained for seven days. Release signing is intentionally not performed by CI in OC-12 because production signing credentials do not belong in repository code or an unsigned build-certification phase.

## OC-11 preservation

OC-12 preserves the Android Background Official Alert Watch added in OC-11. The CI executes `android:verify-background-watch` after Capacitor copy so a future `cap copy` cannot silently remove:

- WorkManager worker/source wiring
- SENAPRED background client
- native watch store
- Capacitor bridge/plugin registration
- privacy guardrails
- native notification / deduplication integration

## Visual protection

OC-12 does **not** modify the Golden Orb web visual system. In particular it does not touch:

- `src/components/OrbiClimateCore.tsx`
- `src/components/WelcomeHeroSection.tsx`
- `src/styles/skycore-fx.css`
- Golden Orb rings
- particles
- halos
- glow
- liquid deformation

The only visual-source changes are Android home-screen widget Glance compatibility fixes needed to make those already-existing native widgets compile.

## Exit criteria

OC-12 may merge only when both branch and pull-request executions show:

- web gate GREEN
- native Android gate GREEN
- APK artifact successfully uploaded
- unsigned AAB artifact successfully uploaded
- protected Golden Orb files absent from the diff

Once merged, a future change that breaks native Android compilation will be caught by GitHub Actions instead of being discovered only when building locally or preparing a release.

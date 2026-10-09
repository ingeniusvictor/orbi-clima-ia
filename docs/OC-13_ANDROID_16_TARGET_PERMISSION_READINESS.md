# OC-13 — Android 16 Target & Permission Readiness

## Objective

Move ORBI Clima IA from the preserved OC-12 runtime target (`targetSdk 34`) to Android 16 / API 36 without silently broadening permissions or changing the approved ORBI web visual system.

OC-13 is intentionally a platform-readiness phase. It does **not** redesign the Golden Orb, hero, weather cards, particles, glow, halos, mobile navigation, widgets, or SkyCore visual effects.

## Runtime target

- `minSdkVersion = 26` — preserved.
- `compileSdkVersion = 36` — already established by OC-12.
- `targetSdkVersion = 36` — migrated by OC-13.

## Least-privilege permission contract

The canonical manifest keeps only the Android permissions currently required by product behavior:

- `INTERNET`
- `ACCESS_COARSE_LOCATION`
- `ACCESS_FINE_LOCATION`
- `POST_NOTIFICATIONS`

OC-13 explicitly rejects these privileges unless a future product requirement is reviewed separately:

- `ACCESS_BACKGROUND_LOCATION`
- `SCHEDULE_EXACT_ALARM`
- `USE_EXACT_ALARM`
- `FOREGROUND_SERVICE`
- `REQUEST_IGNORE_BATTERY_OPTIMIZATIONS`

### Why background location is not required

The OC-11 SENAPRED background watch does not acquire device location in the worker. The user confirms/selects a real Chile location while ORBI is in the foreground; native code stores that location snapshot and WorkManager later checks the authority feed against the stored coordinates.

This remains a deliberate privacy invariant.

## Notification permission behavior

`notificationPermissionService.ts` keeps the native runtime flow:

1. `LocalNotifications.checkPermissions()`
2. user-driven `LocalNotifications.requestPermissions()` when needed
3. notification delivery only after permission is `granted`

`OfficialAlertWorker` independently checks `POST_NOTIFICATIONS` on Android 13+ before posting a SENAPRED background notification. If permission is missing, the official alert remains undelivered so it can surface after permission is granted.

## No exact-alarm privilege for immediate alerts

ORBI weather/SENAPRED foreground notifications are event notifications that should appear immediately; they are not alarm-clock or calendar reminders.

OC-13 removes the artificial `schedule: { at: now + 500ms }` delay from the Capacitor local-notification payload. This avoids coupling immediate alert delivery to Android's exact-alarm special-access flow and keeps the manifest free of exact-alarm permissions.

Deferred alert policy remains an ORBI application-level queue and is not converted into exact Android alarms in this phase.

## Android 15/16 edge-to-edge readiness

Android 15+ enforces edge-to-edge for modern target SDKs, and Android 16 removes the target-36 opt-out.

Rather than modifying the approved React/CSS composition, `MainActivity` handles safe areas at the native WebView boundary:

- reads `systemBars()` + `displayCutout()` insets;
- applies them as WebView padding on Android 15+;
- keeps the WebView background aligned to ORBI's dark shell;
- forces light system-bar icons for contrast;
- consumes only system-bar/cutout insets after applying native padding;
- leaves IME/keyboard insets available for modern WebView handling.

The activity also declares `android:windowSoftInputMode="adjustResize"`.

### Visual scope

No OC-13 code changes are made to:

- `src/components/OrbiClimateCore.tsx`
- `src/components/WelcomeHeroSection.tsx`
- `src/styles/skycore-fx.css`
- Golden Orb geometry/effects
- approved React weather layout

Native device QA is still required before claiming pixel-perfect Android 16 rendering.

## Predictive back

Android 16 enables predictive back by default for target 36. ORBI does not currently implement its own `onBackPressed`, `KEYCODE_BACK`, or custom native back interception, so OC-13 does not add an opt-out flag. Capacitor/Android system navigation remains the owner of back behavior.

A dedicated navigation regression test should be run on an Android 16 device/emulator before store release.

## WorkManager / SENAPRED watch on Android 16

Android 16 introduces runtime-quota changes that also apply to WorkManager. OC-11 uses normal periodic WorkManager with network constraints and no foreground service. The configured interval is therefore a requested/best-effort cadence, not a guarantee that Android will execute precisely every N minutes.

That is consistent with the background-watch design: official alerts are deduplicated and remain eligible on later worker cycles when delivery was not possible.

## Automated source gate

`scripts/verify-android-modern-target.mjs` enforces:

- compile SDK 36;
- target SDK 36;
- min SDK 26 preserved;
- required foreground permissions present;
- background location absent;
- exact-alarm permissions absent;
- foreground-service permission absent;
- battery-optimization exemption absent;
- `adjustResize` present;
- no edge-to-edge opt-out;
- native WebView system-bar/cutout handling present;
- foreground geolocation runtime check/request path present;
- notification runtime check/request path present;
- immediate local notifications do not reintroduce an `at:` exact-clock schedule;
- background worker/plugin do not acquire device location;
- background worker still checks `POST_NOTIFICATIONS`;
- WorkManager-based OC-11 worker remains present.

The gate is executed both before the production web build and again after `npx cap copy android` inside the native Android CI job.

## CI acceptance criteria

OC-13 can be merged only when the final branch head and pull-request head both complete:

- TypeScript gate — GREEN
- OC-11 background-watch source gate — GREEN
- OC-13 modern-target source gate — GREEN
- production web build — GREEN
- Capacitor copy — GREEN
- post-copy OC-11 gate — GREEN
- post-copy OC-13 gate — GREEN
- Android debug APK compile — GREEN
- Android release AAB compile — GREEN
- APK/AAB artifact upload — GREEN

## Remaining device-level QA

CI proves that the source and Android toolchain are internally consistent. Before a public store release, test on Android 16 (and at least one Android 15 device) for:

- status/navigation bar overlap;
- display cutout/notch handling;
- keyboard resizing on location/search/settings inputs;
- predictive-back navigation;
- notification permission denial/grant/regrant;
- foreground GPS permission denial and approximate/fine behavior;
- SENAPRED background watch after process removal and device idle;
- widgets after reboot/launcher refresh;
- notification behavior while the app is in foreground/background.

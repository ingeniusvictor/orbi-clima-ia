# OC-22 — Validated Physical Baseline

Status: **FROZEN REFERENCE — DO NOT REGRESS**

This document is the canonical development guardrail for the accepted OC-22 physical-QA line. It exists to prevent future work from accidentally reopening or redesigning functionality that has already been implemented and physically accepted.

## Repository / review policy

- Active development branch: `feature/oc-22-living-weather-atmosphere`.
- PR #27 remains **OPEN + DRAFT** until explicit final physical approval.
- Do not merge PR #27 automatically.
- Do not modify `main` from OC-22 work.
- Correctness takes priority over speed.
- A later roadmap document must not override this validated-baseline record when the roadmap is stale.

## Frozen physical baselines

### 10615 — ORB LAVA

**Status: PHYSICALLY APPROVED / FROZEN**

The Golden Orb visual and motion architecture is protected.

Historically protected files:

- `src/components/OrbiClimateCore.tsx`
- `src/styles/skycore-fx.css`
- `src/components/WelcomeHeroSection.tsx`

The narrow Weather Truth label authorization already completed after 10615 does not reopen Orb geometry, Lava Canvas, halo architecture, color architecture, motion or Android performance behavior.

Never reintroduce:

- `transform:none` / `animation:none` Orb freezes;
- animated Orb `border-radius` changes;
- external selectors targeting Orb internals;
- duplicate Orb surfaces;
- Android WebView black rectangles/tiles;
- CSS blur / backdrop-filter / mix-blend-mode / forced 3D fixes against the Orb.

### 10616 → 10621 — Living atmosphere foundation

**Status: IMPLEMENTED / ACCEPTED LINE**

Retain the established systems rather than recreating them:

- cinematic rain / storm foreground;
- scene-distinct natural cloud families;
- cinematic day / dawn / dusk / night sky and lighting;
- first-class snow / frost rendering;
- independent foreground and rear Canvas planes;
- Android-safe DPR / FPS limits and adaptive-quality behavior.

### 10622 / 10626 / 10627 — Weather Truth + phenomenon fidelity

**Status: IMPLEMENTED / CERTIFIED / FROZEN SEMANTICS**

Weather Truth remains authoritative. Preserve exact phenomenon semantics and labels for current, hourly and daily weather.

Do not collapse specific phenomena back into generic families. This includes drizzle, freezing precipitation, rain intensity variants, showers, snow variants, fog and storm / hail states.

Visual atmosphere family selection and exact user-facing phenomenon wording remain separate responsibilities.

### 10623 / 10624 — Native Widget Parity + launcher adaptation

**Status: IMPLEMENTED**

Retain native widget parity contracts, launcher-size adaptation and truthful weather rendering.

### 10629+ — Persistent physical-QA update channel

**Status: IMPLEMENTED / REQUIRED**

Physical-QA builds must preserve the persistent package / certificate update path. Do not regress to isolated packages for normal OC-22 physical iteration.

### 10631 — Fluid Native Canvas V3

**Status: IMPLEMENTED / CERTIFIED**

Retain native Canvas V3 scaling and Kotlin-safe launcher rendering as the fallback/native baseline.

### 10632 — Widget preview parity + official ORBI branding

**Status: IMPLEMENTED / CERTIFIED**

Retain official ORBI Clima icon / brand treatment and parity between in-app widget preview and native launcher surface.

### 10633 — SkyOrb Commander Orbital V4

**Status: PHYSICALLY APPROVED / FROZEN**

COMMAND 4x4 and PREMIUM COMMAND 4x4 use the approved Orbital V4 architecture, with V3 fallback.

Do not redesign or replace the accepted Commander architecture while working on unrelated OC-22 modules.

Retain:

- central climate core;
- orbital ring architecture;
- upper forecast satellites;
- lower metrics;
- ORBI premium brand treatment;
- ORBI IA narrative rail;
- exact Weather Truth labels in the widget contract;
- V3 fallback behavior.

### 10634 — Alerts Inbox UX

**Status: PHYSICALLY APPROVED / FROZEN FUNCTIONAL MODEL**

The alerts model is no longer `active condition count = unread badge`.

Retain these semantics:

- active weather condition and unread notification are different states;
- mobile/nav badge counts only unread/new notifications;
- reading an alert removes its unread state immediately;
- an ongoing condition remains under **Activas** after its notification is read;
- notification read state persists across restart;
- existing historical alerts do not flood **Nuevas** after upgrade;
- **Nuevas / Activas / Historial** remain distinct information states;
- history clearing keeps explicit confirmation / accessibility behavior.

Do not reopen the alerts architecture during unrelated atmosphere work.

## Known technical debt that is not a product regression

### Repository Zen audio integrity

The inherited repository Zen MP3 corruption remains a packaging / CI debt. Healthy physical-QA packages have used the certified Beneath the Crystal Arch source.

This debt must be resolved before release certification, but it must not be mistaken for a reason to reopen already accepted UI, Weather Truth, widgets, alerts or atmosphere behavior.

## Next functional phase

`OC-22H — Atmospheric Transitions` is the next genuinely unfinished visual-runtime phase.

OC-22H may consume existing atmosphere models and renderer inputs, but must not modify the frozen product surfaces above.

Preferred implementation boundaries remain:

- `src/services/atmosphereTransitionController.ts`
- `src/services/atmosphereTransitionProfiles.ts`
- `scripts/verify-atmospheric-transitions-v11.mjs`
- focused integration in `LivingWeatherAtmosphereHost` / `LivingWeatherAtmosphere` inputs only when required.

## OC-22H non-negotiable gates

Before any physical APK is promoted:

- Golden Orb frozen files remain untouched by the phase;
- Commander V4 and Alerts frozen behavior remain untouched;
- Weather Truth remains independent from visual transition state;
- ATM LAB remains visual-only and cannot leak stale semantics into LIVE;
- transition interruption must start from the current interpolated state rather than snap backward;
- precipitation intensity must ramp rather than hard-switch;
- cloud crossfade must be temporary / bounded and release outgoing resources;
- hidden/inactive lifecycle must avoid expensive background animation work;
- existing Android renderer FPS / DPR caps must remain unchanged;
- no integrity or quality gate may be weakened to obtain GREEN.

## Source of truth rule

When future documents, chat context or stale roadmap entries disagree about whether an OC-22 capability is already complete, check this file plus the actual branch history and current code before implementing anything.

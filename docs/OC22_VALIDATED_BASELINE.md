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

Do not collapse specific phenomena back into generic families. Visual atmosphere family selection and exact user-facing phenomenon wording remain separate responsibilities.

### 10623 / 10624 — Native Widget Parity + launcher adaptation

**Status: IMPLEMENTED**

### 10629+ — Persistent physical-QA update channel

**Status: IMPLEMENTED / REQUIRED**

Physical-QA builds must preserve the persistent package / certificate update path.

### 10631 — Fluid Native Canvas V3

**Status: IMPLEMENTED / CERTIFIED**

### 10632 — Widget preview parity + official ORBI branding

**Status: IMPLEMENTED / CERTIFIED**

### 10633 — SkyOrb Commander Orbital V4

**Status: PHYSICALLY APPROVED / FROZEN**

COMMAND 4x4 and PREMIUM COMMAND 4x4 use the approved Orbital V4 architecture, with V3 fallback. Do not redesign it during unrelated work.

### 10634 — Alerts Inbox UX

**Status: PHYSICALLY APPROVED / FROZEN FUNCTIONAL MODEL**

Retain `Nuevas / Activas / Historial`, unread-only badge semantics, persistent read state and active-condition separation.

## OC-22H — Atmospheric Transitions

### 10635 — PHYSICAL QA REJECTED

The transition runtime compiled and passed its functional gates, but physical Android QA exposed a compositor regression: while V11 was active, the Golden Orb body/gradient intermittently disappeared for one-frame intervals while its icon, temperature, labels and outline remained stable.

Evidence showed:

- the protected Golden Orb files were unchanged from the accepted baseline;
- the Orb body opacity was not intentionally animated;
- the adjacent background remained effectively stable during the one-frame Orb luminance drops;
- the regression appeared only after OC-22H added overlapping full-screen Canvas families.

**Classification:** `OC-22H / Android compositor regression`, not a Golden Orb redesign defect.

10635 is therefore **not** an accepted baseline.

### 10636 — Android Compositor Fix

**Status: IMPLEMENTED / CERTIFIED IN CI / PHYSICAL QA PENDING**

Candidate head at promotion:

`9a42bf6a347efbb79c3de63b35ae37acd0cbcc62`

Mitigation is intentionally outside the Golden Orb:

- desktop/web may retain up to three cloud families;
- Android is capped to **two** cloud families during crossfade;
- Android removes residual cloud-family weights below `0.035`;
- only **one** cloud-family Canvas remains animated during an Android crossfade;
- the outgoing family may remain visible while fading but is frozen;
- runtime diagnostics expose `data-android-cloud-budget` and `data-animated-cloud-family`;
- `scripts/verify-android-compositor-budget.mjs` prevents accidental regression.

Protected Golden Orb files were not modified by the mitigation.

#### Exact-head certification

Quality Gate run `38550653583` on `9a42bf6...`:

- `web-quality`: **GREEN** through TypeScript, Mobile Home, Premium Home, OC-22/OC-22H including the Android compositor budget gate, Weather Truth, Android background/performance/target/runtime gates, widget gates and production build.

Visual Preview run `38550653662` with OC-22H explicitly ON:

- TypeScript: PASS
- OC-22/OC-22H + Android compositor budget: PASS
- Weather Truth: PASS
- Native Widget Parity: PASS
- Premium Widget Snapshot: PASS
- native widget Kotlin compile: PASS
- physical-QA feature declaration: PASS
- V11 web build: PASS
- Capacitor copy: PASS
- non-installable 10636 Android Compositor Fix payload: PASS
- inherited repository Zen audio gate: FAIL
- non-audio recovery payload archive: PASS

No gate was weakened.

#### Physical QA priority

First reproduce the exact scenario that rejected 10635, especially **Niebla / atmospheric transition** while continuously watching the Golden Orb.

Acceptance requires:

1. Golden Orb body/gradient never disappears or flashes.
2. Orb 10615 appearance/motion remains unchanged.
3. Atmospheric transitions remain progressive instead of snapping.
4. Weather Truth labels remain exact.
5. Commander V4 remains unchanged.
6. Alerts 10634 remain unchanged.
7. No black WebView rectangles/tiles.
8. No obvious sustained performance/heat regression.

## Known technical debt that is not a product regression

### Repository Zen audio integrity

The inherited repository Zen MP3 corruption remains a packaging / CI debt. Healthy physical-QA packages use exactly two certified Beneath the Crystal Arch MP3s:

`sha256: 7717bd6f5461f6ab3a0e4a297fd9db4288656a183039d3d08f833ec167ff0341`

No `.ogg` Zen payload is allowed.

## Source of truth rule

When future documents, chat context or stale roadmap entries disagree about whether an OC-22 capability is already complete, check this file plus the actual branch history and current code before implementing anything.

## Merge rule

**DO NOT MERGE PR #27 before explicit physical approval.**

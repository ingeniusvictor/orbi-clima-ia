# OC-22H — Atmospheric Transitions

Status: **RUNTIME FOUNDATION ACTIVE — VISUAL RUNTIME FEATURE-GATED / PHYSICAL QA NOT YET PROMOTED**

The accepted OC-22 physical line is frozen in `docs/OC22_VALIDATED_BASELINE.md`. OC-22H runtime foundation work is now authorized, but visual activation remains opt-in until a dedicated physical-QA build is promoted and accepted.

## Non-negotiable invariants

- Golden Orb physical baseline remains **10615 — ORB LAVA**.
- Do not modify `src/components/OrbiClimateCore.tsx`.
- Do not modify `src/styles/skycore-fx.css`.
- Do not modify `src/components/WelcomeHeroSection.tsx`.
- Do not target Golden Orb internals from OC-22 transition CSS or services.
- Never use `transform:none`, `animation:none`, animated Orb `border-radius`, CSS blur, `backdrop-filter`, `mix-blend-mode`, or forced 3D transforms as transition fixes.
- Weather Truth is authoritative. ATM LAB overrides remain visual-only.
- Existing independent Canvas planes remain independent.
- Commander V4 10633 and Alerts Inbox 10634 remain frozen while OC-22H is developed.
- `VITE_OC22_ATMOSPHERIC_TRANSITIONS` is opt-in; an unset flag must preserve the approved baseline behavior.

## Goal

Weather changes must feel continuous rather than switching as discrete presets. OC-22H interpolates the atmosphere between stable scene families while preserving the approved V6 precipitation, V8 scene-cloud behavior, cinematic sky, Android performance limits, and Golden Orb isolation.

## Transition model

The transition controller owns a visual state with:

- `fromScene`
- `toScene`
- `startedAt`
- `durationMs`
- `progress` in `[0, 1]`
- `phase` (`stable`, `transitioning`)
- `reason` (`weather-truth`, `atm-lab`, `time-phase`)
- bounded `sceneWeights` for temporary scene-family overlap
- `wetGlassIntensity`
- `stormEnergy`

A new target received while a transition is active starts from the **current interpolated visual state**, not from the previous discrete scene. This avoids visible snapping when Weather Truth changes twice in a short period. Interrupted scene-family mixtures are also retained at retarget time and then normalized toward the new target.

## Interpolated channels

The controller should expose normalized channels instead of directly manipulating DOM/CSS internals:

- `skyExposure`
- `skyLuminance`
- `horizonWarmth`
- `nightVisibility`
- `starOpacity`
- `moonOpacity`
- `cloudCoverage`
- `cloudOpacity`
- `cloudDepth`
- `cloudDarkness`
- `cloudFamilyFromWeight`
- `cloudFamilyToWeight`
- `mistDensity`
- `hazeDensity`
- `precipitationIntensity`
- `wetGlassIntensity`
- `gustEnergy`
- `lightningEnergy` / `stormEnergy`
- `coldParticleIntensity`
- `heatHazeIntensity`

These channels are consumed by atmosphere renderers; the controller must not own Golden Orb rendering.

## Easing

Default interpolation uses smooth monotonic easing (`smoothstep` or equivalent). Avoid spring overshoot for weather channels because overshoot can create unnatural negative/over-range opacity, precipitation, exposure, or cloud density.

Recommended easing groups:

- sky/exposure: smoothstep
- cloud coverage: smootherstep
- mist/haze: ease-in-out
- precipitation: asymmetric ramp
- lightning: event-driven only; never continuously interpolate flashes
- stars/moon: slow ease-in-out

## Default transition durations

Durations are visual targets and may be tuned after physical Android QA.

| Transition family | Target duration |
| --- | ---: |
| Sunny ↔ Partly Cloudy | 12–18 s |
| Partly Cloudy ↔ Cloudy | 14–22 s |
| Cloudy → Rain | 18–28 s |
| Rain → Cloudy | 16–24 s |
| Rain → Storm | 18–30 s |
| Storm → Rain | 20–30 s |
| Cloudy → Sunny | 20–30 s |
| Wind overlay increase/decrease | 8–16 s |
| Cold / heat atmosphere | 15–25 s |
| Dawn → Day | continuous solar curve |
| Day → Dusk | continuous solar curve |
| Dusk → Night | continuous solar curve |

ATM LAB uses an accelerated QA multiplier so transitions can be validated without changing production timing.

## Scene sequences

### Cloudy → Rain

1. Lower exposure slightly.
2. Increase cloud coverage and dark lower cloud bases.
3. Increase mist/humidity impression.
4. Introduce sparse first drops.
5. Ramp foreground precipitation and wet-glass intensity.
6. Settle into stable rain.

### Rain → Storm

1. Increase gust energy.
2. Increase convective cloud-family weight.
3. Darken sky/cloud bases.
4. Increase precipitation intensity.
5. Enable storm lightning events only after the convective weight crosses a safe threshold.
6. Settle into stable storm.

### Cloudy → Partly Cloudy → Sunny

1. Reduce cloud darkness.
2. Open cloud coverage progressively.
3. Crossfade stratocumulus toward separated cumulus.
4. Raise sky exposure/luminance.
5. Reduce mist/haze.
6. Allow direct-sun contribution to increase naturally.

### Dusk → Night

Time-phase transition is driven by the solar curve rather than a weather-scene switch:

1. Warm horizon peaks and then decays.
2. Overall luminance falls continuously.
3. Stars fade in progressively.
4. Moon visibility follows astronomical/visual policy.
5. Cloud lighting shifts to night response without replacing the cloud family.

## Cloud crossfade architecture

Do not morph one procedural texture into another in place. Maintain bounded cloud-family render states during a scene-family transition. A normal transition uses outgoing + incoming families; interruption may temporarily preserve an additional current family, but the controller limits overlap to the three highest normalized family weights.

Texture regeneration occurs only when a family target changes, not every frame. Family overlap must be temporary and bounded to avoid sustained multi-rendering cost.

On Android:

- retain the existing cloud FPS cap;
- avoid simultaneous high-resolution regeneration;
- precompute an incoming texture once;
- release outgoing families after transition completion;
- lower crossfade resolution/complexity first under adaptive-quality pressure.

## Precipitation ramp

Foreground precipitation must remain the existing V6 system. OC-22H only supplies intensity targets.

Rules:

- intensity ramps up gradually from zero;
- first-drop phase may begin before full rain coverage;
- wet-glass accumulation lags rainfall onset slightly;
- stopping rain ramps particle spawn down before clearing residual wet-glass/rivulets;
- storm flashes remain discrete stochastic events and are gated by storm transition energy.

## Interruption policy

When a transition is interrupted:

1. sample the current interpolated channels and scene-family weights;
2. make those values the new transition origin;
3. replace only the target scene;
4. compute a duration proportional to remaining visual distance;
5. never snap back to the old scene baseline.

This applies to both Weather Truth updates and ATM LAB QA overrides.

## Weather Truth and ATM LAB

- Weather Truth remains untouched.
- LIVE follows real scene/time targets.
- ATM LAB scene override changes only visual target scene.
- ATM LAB visual phase override changes only visual time phase.
- Returning to LIVE transitions from the current QA visual state toward current Weather Truth instead of hard-resetting.

## Visibility and lifecycle

When the app/Home is hidden or inactive:

- pause expensive animation loops;
- do not advance via per-frame background work;
- the React transition sampler publishes at a bounded cadence and is cancelled while inactive;
- on resume, derive progress from monotonic elapsed time and current target;
- if elapsed time exceeds transition duration, resume directly at stable target state.

## Android performance envelope

OC-22H must not increase the established renderer caps merely to make transitions smoother.

Priority under adaptive-quality pressure:

1. preserve Weather Truth correctness;
2. preserve Golden Orb stability;
3. preserve foreground precipitation readability;
4. reduce cloud crossfade complexity/resolution;
5. reduce secondary mist/haze detail;
6. reduce decorative particles;
7. never solve load by freezing the Orb.

## Implementation boundaries

Runtime implementation remains outside frozen files. Current dedicated units:

- `src/services/atmosphereTransitionController.ts`
- `src/services/atmosphereTransitionProfiles.ts`
- `src/hooks/useAtmosphereTransition.ts`
- `src/config/oc22Features.ts`
- `scripts/verify-atmospheric-transitions-v11.mjs`
- `scripts/test-atmospheric-transitions.ts`

Focused visual integration may occur only through `LivingWeatherAtmosphereHost` / atmosphere renderer inputs or new transition-specific renderer units. Frozen Golden Orb, Commander V4 and Alerts surfaces are outside OC-22H scope.

## Source gates required before physical APK

The OC-22H gate verifies or must verify:

- validated physical-baseline guardrail remains present;
- no frozen Golden Orb file imports the transition runtime;
- no transition unit targets Golden Orb internals;
- no forbidden Orb/compositor workaround is added;
- Weather Truth remains independent from visual transition state;
- ATM LAB overrides remain visual-only;
- transition interruption starts from current interpolated state;
- interrupted scene-family blend is preserved;
- scene-family overlap stays bounded;
- precipitation uses ramped intensity rather than scene hard-switch;
- wet-glass accumulation lags precipitation onset;
- storm energy is available for delayed lightning gating;
- hidden/inactive lifecycle pauses transition sampling;
- visual runtime remains opt-in before physical QA;
- Android renderer FPS caps remain unchanged.

## Physical QA matrix for OC-22H

Only after the feature-gated visual runtime is complete and a dedicated QA build is promoted:

1. Sunny → Partly Cloudy
2. Partly Cloudy → Cloudy
3. Cloudy → Rain
4. Rain → Storm
5. Storm → Rain
6. Rain → Cloudy
7. Cloudy → Sunny
8. Dusk → Night
9. transition interrupted halfway by a different scene
10. ATM LAB override → LIVE return
11. app backgrounded mid-transition → resume
12. repeated scene changes while monitoring heat/battery

For every case verify:

- no scene snap;
- no black WebView rectangles/tiles;
- Golden Orb unchanged;
- icon/temperature stable;
- clouds remain visually distinct by family;
- rain/storm V6 remains intact;
- no stale QA override leaks into LIVE;
- no sustained multi-render performance penalty.

## Activation gate

The previously blocked design gate is satisfied by the accepted OC-22 baseline recorded in `docs/OC22_VALIDATED_BASELINE.md` and the explicit instruction to continue development. Runtime foundation is active, but **visual activation stays OFF by default** until the dedicated transition build is ready for physical QA. PR #27 remains OPEN + DRAFT and must not be merged before explicit final approval.

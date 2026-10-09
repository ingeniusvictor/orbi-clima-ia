# ORBI Clima IA — Weather Truth Audit

Baseline audited: `150ef10cd647e9414d10b3d8fbbac718f889375a` (`v1.0.6`)

## Objective

Make ORBI Clima IA truth-first: preserve the premium visual identity while ensuring that labels, risk levels, freshness, provenance and model-comparison surfaces do not overstate what the meteorological data can support.

This audit was triggered by a real Osorno comparison where ORBI displayed **“Precipitación Activa / ALTO”** for a small precipitation amount while the reference phone application described the condition as **llovizna**, and where the reference application exposed a separate flood warning that ORBI did not have.

## Critical findings in the preserved baseline

1. **WMO precipitation semantics were collapsed.** Codes for drizzle, rain, showers and freezing precipitation were mapped into the same coarse visual `rain` condition and that coarse condition was reused as semantic truth.
2. **Current precipitation units were overstated.** The provider current value is an accumulation over the current interval. The baseline displayed that amount as `mm/h` without using the provider interval.
3. **Any current precipitation could become a high rain risk.** The baseline risk path treated the coarse `rain` condition as equivalent to material active rain, so a drizzle WMO code could become `ALTO`.
4. **The “multi-source” layer was not genuinely multi-source.** Provider-like values were derived from the Open-Meteo base data with deterministic offsets and then used to calculate confidence. This has been removed.
5. **Source confidence was presented too strongly.** Fixed trust percentages could be read as forecast accuracy even though they only reflected application state.
6. **Cache provenance was broken.** `loadLastWeatherBundle()` discarded the saved timestamp while `App.tsx` later attempted to read it, making stale cache look freshly updated. A failed request could also substitute the last cached location even when the user requested a different point, or fall back to demo weather.
7. **Humidity was treated too readily as condensation.** Relative humidity alone is not proof of condensation. The revised logic uses temperature–dew-point spread when available and still requires physical verification.
8. **Some field recommendations were operationally absolute.** Weather model output must be context for HSE decisions, not authorization to perform or suspend a specific electrical task by itself.
9. **No official hazard channel existed.** Forecast heuristics cannot reproduce an authority-issued flood/emergency warning unless ORBI ingests an official warning source separately.
10. **No observed-station correction existed.** The baseline current condition was model-derived only; it did not compare against a nearby surface observation.

## Weather Truth Core changes

- Preserve exact WMO code, phenomenon, Spanish condition label and precipitation intensity.
- Keep the Golden Orb's coarse condition vocabulary only for visual rendering.
- Preserve precipitation interval and expose an *equivalent* hourly rate only when the interval is known.
- Request dew point, visibility, snowfall, rain/showers split, dominant wind, gusts and richer daily precipitation variables.
- Use the provider's local-time strings instead of reparsing them through the device timezone.
- Distinguish drizzle, rain, showers, freezing precipitation, snow and thunderstorms in risk/alert logic.
- Change person-level light drizzle from a high warning to informational/low risk while keeping field context appropriately more cautious.
- Use dew-point spread for condensation context and explicitly require physical inspection.
- Replace fabricated provider simulation with real model comparison: Open-Meteo Best Match + ECMWF IFS + NOAA GFS + DWD ICON when available.
- Rename the comparison metric conceptually to **model agreement**. It is not probability of forecast correctness.
- Remove fixed “accuracy confidence” percentages from provenance UI.
- Add a detailed current-conditions card with exact phenomenon, interval precipitation, next-hour probability, dew point, visibility, wind/gusts, pressure and model time.
- Fix cache timestamp preservation, location matching and stale-data labeling. Never substitute another city's cache or demo data as if it were the requested live weather.

## Validation performed

- TypeScript syntax/transpile pass across all TS/TSX source files in the working tree.
- Targeted deterministic weather-core smoke scenario:
  - WMO `51` => `Llovizna ligera` / `drizzle`.
  - `0.2 mm` over a `15 min` current interval => `~0.8 mm/h equivalent`, not `0.2 mm/h`.
  - Person risk => `LOW` drizzle rather than `HIGH` active rain.
  - Field profile => `MEDIUM` drizzle with task/HSE context.
  - Person smart alert => informational `Llovizna ligera`, not warning `Lluvia Activa`.
- Full dependency/type/build verification remains required in a clean Node install and Android Gradle environment before merge/release.

## Next premium layers

The Weather Truth Core intentionally does not fake capabilities that require independent data. The next layers should be implemented and tested separately:

1. Official Chile hazard channel (SENAPRED/DMC) with authority attribution and independent status from SkyCore heuristic risks.
2. Air-quality layer with AQI and pollutant detail.
3. Hydrology context for river discharge/flood potential, clearly labeled as model context rather than an official warning.
4. Nearby observed-station layer (for example METAR/DMC-compatible stations where available), including station distance and observation age.
5. Forecast uncertainty/ensemble and historical bias calibration rather than a single opaque confidence number.
6. Android background refresh/notification QA and only after that the premium widget redesign.

## Golden Orb protection

No protected Golden Orb implementation file is modified by this audit. Exact meteorological text is supplied upstream while the existing coarse visual condition continues to drive the protected orb theme. Any direct edit to the protected `WelcomeHeroSection` / `OrbiClimateCore` visual implementation requires explicit user confirmation under `AGENTS.md`.

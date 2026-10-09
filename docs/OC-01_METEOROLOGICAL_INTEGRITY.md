# OC-01 — Meteorological Integrity Foundation

## Objective

Make ORBI Clima IA meteorologically honest before adding new premium capabilities. This phase removes synthetic corroboration, preserves exact WMO precipitation semantics, recalibrates risk severity, and adds an automated quality gate.

## Corrected issues

- Removed deterministic synthetic copies of OpenWeather, DMC Chile, Tomorrow.io and Meteomatics from the active confidence calculation.
- Open-Meteo remains the only real active weather source until independent providers/models are integrated.
- Single-source status is displayed explicitly and is never presented as independent corroboration.
- WMO drizzle, freezing drizzle, rain, freezing rain, showers, snow and storm semantics are preserved through the data adapter.
- 0.2 mm/h drizzle is no longer automatically escalated to `Precipitación Activa / ALTO`.
- Rain/drizzle alerts now use phenomenon + intensity + short-term probability.
- Humidity alone is no longer treated as proof of condensation.
- Positive temperatures below 5 °C no longer claim generic freezing injury risk.
- PV weather context no longer estimates exact generation percentage from UV/cloud cover alone.
- Electrical recommendations no longer declare work "safe" from weather data alone; they defer to HSE procedures and physical verification.
- Source trust now measures provenance/freshness, not forecast accuracy.

## Quality gate

Every feature branch and pull request now runs:

1. `npm ci`
2. `npm run typecheck`
3. `npm run build`

TypeScript diagnostics are preserved as a workflow artifact when the typecheck fails.

## Golden Orb protection

No changes were made to:

- `src/components/OrbiClimateCore.tsx`
- Golden Orb animations/rings/particles/halos/glow/liquid deformation
- `src/styles/skycore-fx.css`
- Main Golden Orb visual structure in `WelcomeHeroSection`

## Remaining work

OC-02 should add real short-range intelligence such as air quality and measured model uncertainty/ensemble information. OC-03 should add hydrologic context and verified official-alert integrations where a stable source is available.

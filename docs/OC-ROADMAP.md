# ORBI Clima IA — Premium Weather Roadmap

## OC-01 — Meteorological Integrity Foundation

Status: implementation complete, quality-gated.

Focus:
- truthful source provenance
- exact WMO precipitation semantics
- calibrated risk/alert severity
- CI quality gate

## OC-02 — Nowcast, Air Quality & Uncertainty

Planned:
- air-quality data layer (AQI, PM2.5, PM10, ozone where available)
- short-range precipitation intelligence
- real model/ensemble uncertainty instead of synthetic provider offsets
- clearer hourly detail for precipitation, humidity, wind and confidence
- observation/forecast freshness metadata

## OC-03 — Hydrologic & Official Alert Context

Planned:
- hydrologic signal using verified river-discharge/flood datasets where applicable
- rainfall accumulation and terrain-context risk inputs
- verified official DMC/SENAPRED alert integration only when a stable, attributable source is confirmed
- strict separation between ORBI inferred risk and an official authority alert

## OC-04 — Premium UX Intelligence

Planned:
- improved weather detail surfaces inspired by best-in-class mobile weather UX
- risk explanation and evidence cards
- transparent source attribution
- accessibility and notification tuning

## OC-05 — Android Widgets

Only after weather truth layers are stable:
- native widget data contract
- premium 4x4 SkyOrb visual parity
- 2x2 / 4x2 variants
- launcher compatibility QA (HyperOS / One UI)
- battery/update scheduling validation

# OC-01 Regression Case — Osorno drizzle

Observed comparison supplied during the audit:

- Third-party phone weather UI: approximately 9 °C, drizzle, high humidity, light wind.
- ORBI v1.0.6: approximately 9 °C, 0.2 mm/h and `Precipitación Activa / ALTO`.

Root cause in baseline:

1. WMO drizzle codes (51/53/55) were collapsed to the generic visual condition `rain`.
2. The climate-risk engine promoted `condition === 'rain'` directly to a high active-precipitation risk, regardless of the low rate.
3. The smart-alert engine similarly promoted any non-zero precipitation/broad rain condition to `Lluvia Activa` warning.

Expected OC-01 behavior:

- preserve `drizzle` as the precipitation phenomenon;
- preserve the WMO human label (for example `Llovizna ligera`);
- use low impact for a person and watch/medium context for field operations unless freezing or another hazard raises severity;
- never call the condition a high active-rain event solely because 0.2 mm/h is non-zero.

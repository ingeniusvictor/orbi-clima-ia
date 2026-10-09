# OC-01 Acceptance Criteria

OC-01 is acceptable for merge when all of the following are true:

- [x] No synthetic provider is used as independent meteorological evidence.
- [x] Drizzle WMO codes remain distinguishable from rain downstream.
- [x] Light drizzle is not automatically escalated to a high rain risk.
- [x] Humidity alone is not described as confirmed condensation.
- [x] Positive cold temperatures do not generically claim freezing injury.
- [x] Weather context does not claim exact PV generation without plant measurement.
- [x] Weather context does not declare electrical work intrinsically safe.
- [x] Source trust is presented as provenance/freshness, not forecast accuracy.
- [x] Golden Orb protected files remain untouched.
- [x] TypeScript gate passes.
- [x] Production build passes.

Future official-alert and flood-risk capabilities are deliberately out of scope for OC-01 and must distinguish authority-issued alerts from ORBI-inferred risk.

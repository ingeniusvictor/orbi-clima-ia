# OC-02 — Weather Intelligence

## Objective

Add useful premium weather context using real, attributable data rather than synthetic provider copies.

## Added layers

### Precise weather semantics

The home hero now consumes the exact WMO human label already preserved by the adapter. A drizzle code can therefore display `Llovizna ligera` instead of the broad internal visual family `Lluvia`, without modifying the protected Golden Orb component.

### Air quality

ORBI queries the Open-Meteo Air Quality API and exposes:

- U.S. AQI
- PM2.5
- PM10
- ozone
- modelled dominant pollutant
- maximum modelled AQI over the next 12 hours

For ORBI's primary Chile deployment the UI uses conservative CAMS Global metadata (~45 km). It explicitly states that this is modelled air quality and **not an official local pollution alert**.

### Ensemble uncertainty

ORBI queries the Open-Meteo Ensemble Mean API using DWD ICON EPS and consumes the real ensemble spread (standard deviation) for:

- 2 m temperature
- precipitation
- 10 m wind speed

The UI reports 0–6 hour dispersion and a derived stability indicator. Low dispersion is never described as guaranteed forecast accuracy.

### Microclimate context

The main forecast request now includes:

- dew point
- dew-point depression
- visibility
- shortwave radiation GHI
- rain/showers accumulations
- precipitation hours

The microclimate panel explains proximity to saturation but does not claim that condensation exists unless physically verified.

## Protected visual system

OC-02 does not modify:

- `src/components/OrbiClimateCore.tsx`
- `src/components/WelcomeHeroSection.tsx`
- `src/styles/skycore-fx.css`
- Golden Orb rings, halos, particles, liquid deformation or layout

## Data-source notes

Open-Meteo documents DWD ICON EPS ensemble mean/spread as a real ensemble product. Air-quality forecasts outside the CAMS Europe domain use CAMS Global atmospheric composition data, which is coarser than a local station network.

## Next phase

OC-03 will add hydrologic context from verified datasets, rainfall accumulation signals and a strict architecture for official authority alerts. ORBI-inferred flood/hydrologic risk must never be presented as an official DMC/SENAPRED alert.

export const SKYCORE_THRESHOLDS = {
  humidity: {
    personNotice: 85,
    fieldCaution: 90,
    electricalCaution: 90,
    electricalHigh: 95,
  },
  windKmh: {
    personNotice: 25,
    fieldCaution: 30,
    fieldHigh: 40,
    fieldCritical: 55,
  },
  gustKmh: {
    caution: 40,
    high: 55,
    critical: 70,
  },
  uv: {
    moderate: 3,
    high: 6,
    veryHigh: 8,
    extreme: 11,
  },
  rainProbability: {
    notice: 40,
    caution: 60,
    high: 80,
  },
  precipitationMm: {
    // Approximate hourly impact bands. Exact WMO phenomenon semantics are
    // handled separately so drizzle is not promoted to heavy "rain" by rate alone.
    light: 1,
    moderate: 2.5,
    heavy: 7.5,
  },
  temperatureC: {
    cold: 5,
    veryCold: 0,
    heat: 30,
    extremeHeat: 35,
  },
  cloudCover: {
    high: 75,
    veryHigh: 90,
  },
};

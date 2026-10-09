export const SKYCORE_THRESHOLDS = {
  humidity: {
    personNotice: 80,
    fieldCaution: 85,
    electricalCaution: 85,
    electricalHigh: 90,
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
    light: 0.5,
    moderate: 2,
    heavy: 8,
  },
  temperatureC: {
    cold: 8,
    veryCold: 3,
    heat: 30,
    extremeHeat: 35,
  },
  cloudCover: {
    high: 75,
    veryHigh: 90,
  },
};

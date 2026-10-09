import { CurrentWeather, HourlyForecast, DailyForecast, WeatherCondition, WeatherLocation } from '../types/weatherTypes';

export interface MultiSourceWeatherData {
  current: CurrentWeather;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
}

export interface WeatherProvider {
  id: string;
  name: string;
  fullName: string;
  isDemo: boolean;
  fetchData: (latitude: number, longitude: number, baseData?: MultiSourceWeatherData) => Promise<MultiSourceWeatherData>;
}

// Deterministic hash based on latitude, longitude, current hour, and a string seed
function getDeterministicOffset(lat: number, lng: number, hourSeed: number, key: string, maxOffset: number): number {
  const coordString = `${lat.toFixed(4)}_${lng.toFixed(4)}_${hourSeed}_${key}`;
  let hash = 0;
  for (let i = 0; i < coordString.length; i++) {
    hash = coordString.charCodeAt(i) + ((hash << 5) - hash);
  }
  // Map hash to range [-maxOffset, maxOffset]
  const normalized = (Math.abs(hash) % 1000) / 1000; // [0, 1]
  return -maxOffset + normalized * (2 * maxOffset);
}

// Generate condition based on base and seed
function getSimulatedCondition(base: WeatherCondition, lat: number, lng: number, hour: number, providerId: string): WeatherCondition {
  const offset = Math.abs(getDeterministicOffset(lat, lng, hour, providerId + '_cond', 10));
  // Under extremely stable conditions, we agree
  if (base === 'sunny' && offset < 7) return 'sunny';
  if (base === 'sunny' && offset >= 7) return 'partly_cloudy';
  if (base === 'partly_cloudy' && offset < 5) return 'partly_cloudy';
  if (base === 'partly_cloudy' && offset >= 5) return 'cloudy';
  if (base === 'cloudy' && offset < 6) return 'cloudy';
  if (base === 'cloudy' && offset >= 6) return 'partly_cloudy';
  if (base === 'rain' && offset < 8) return 'rain';
  if (base === 'rain' && offset >= 8) return 'storm';
  if (base === 'storm' && offset < 7) return 'storm';
  if (base === 'storm' && offset >= 7) return 'rain';
  return base;
}

// 1. Open-Meteo Provider (Active Primary Source)
export const OpenMeteoProvider: WeatherProvider = {
  id: 'open_meteo',
  name: 'Open-Meteo',
  fullName: 'Global Open-Meteo Forecast System',
  isDemo: false,
  async fetchData(latitude: number, longitude: number, baseData?: MultiSourceWeatherData): Promise<MultiSourceWeatherData> {
    if (!baseData) {
      throw new Error('Base Open-Meteo data must be fetched and provided.');
    }
    return baseData;
  }
};

// 2. OpenWeather Provider (Simulated Secondary Source)
export const OpenWeatherProvider: WeatherProvider = {
  id: 'openweather',
  name: 'OpenWeather',
  fullName: 'OpenWeatherMap One Call Model',
  isDemo: true,
  async fetchData(latitude: number, longitude: number, baseData?: MultiSourceWeatherData): Promise<MultiSourceWeatherData> {
    if (!baseData) {
      throw new Error('Base weather data is required to run multi-source simulation.');
    }
    const currentHour = new Date().getHours();
    
    // Generate slight shifts in temperature and other variables
    const tempOffset = getDeterministicOffset(latitude, longitude, currentHour, 'openweather_temp', 0.8);
    const humOffset = getDeterministicOffset(latitude, longitude, currentHour, 'openweather_hum', 4);
    const windOffset = getDeterministicOffset(latitude, longitude, currentHour, 'openweather_wind', 3);
    const uvOffset = getDeterministicOffset(latitude, longitude, currentHour, 'openweather_uv', 0.5);

    const adaptedCurrent: CurrentWeather = {
      ...baseData.current,
      temperatureC: Math.round(baseData.current.temperatureC + tempOffset),
      feelsLikeC: Math.round(baseData.current.feelsLikeC + tempOffset * 1.1),
      humidity: Math.max(10, Math.min(100, Math.round(baseData.current.humidity + humOffset))),
      windSpeedKmh: Math.max(0, Math.round(baseData.current.windSpeedKmh + windOffset)),
      windGustKmh: Math.max(0, Math.round(baseData.current.windGustKmh + windOffset * 1.3)),
      precipitationMm: Number((baseData.current.precipitationMm * (1 + getDeterministicOffset(latitude, longitude, currentHour, 'openweather_precip', 0.15))).toFixed(1)),
      uvIndex: Math.max(0, Math.round(baseData.current.uvIndex + uvOffset)),
      condition: getSimulatedCondition(baseData.current.condition, latitude, longitude, currentHour, 'openweather')
    };

    return {
      current: adaptedCurrent,
      hourly: baseData.hourly.map((h, idx) => {
        const hourOffset = currentHour + idx;
        const hTemp = getDeterministicOffset(latitude, longitude, hourOffset, 'openweather_temp', 0.8);
        const hHum = getDeterministicOffset(latitude, longitude, hourOffset, 'openweather_hum', 4);
        return {
          ...h,
          temperatureC: Math.round(h.temperatureC + hTemp),
          humidity: Math.max(10, Math.min(100, Math.round(h.humidity + hHum))),
          condition: getSimulatedCondition(h.condition, latitude, longitude, hourOffset, 'openweather')
        };
      }),
      daily: baseData.daily.map((d, idx) => {
        const dTempMax = getDeterministicOffset(latitude, longitude, currentHour + idx * 24, 'openweather_temp_max', 0.6);
        const dTempMin = getDeterministicOffset(latitude, longitude, currentHour + idx * 24, 'openweather_temp_min', 0.6);
        return {
          ...d,
          maxTempC: Math.round(d.maxTempC + dTempMax),
          minTempC: Math.round(d.minTempC + dTempMin),
          condition: getSimulatedCondition(d.condition, latitude, longitude, currentHour + idx * 24, 'openweather')
        };
      })
    };
  }
};

// 3. DMC Chile / MeteoChile Provider (Simulated Secondary Source)
export const DmcChileProvider: WeatherProvider = {
  id: 'dmc_chile',
  name: 'MeteoChile / DMC',
  fullName: 'Dirección Meteorológica de Chile - Red Nacional',
  isDemo: true,
  async fetchData(latitude: number, longitude: number, baseData?: MultiSourceWeatherData): Promise<MultiSourceWeatherData> {
    if (!baseData) {
      throw new Error('Base weather data is required to run multi-source simulation.');
    }
    const currentHour = new Date().getHours();
    
    // DMC tends to report cooler morning minimums and slightly warmer valley maximums
    const tempOffset = getDeterministicOffset(latitude, longitude, currentHour, 'dmc_temp', 0.5);
    const humOffset = getDeterministicOffset(latitude, longitude, currentHour, 'dmc_hum', 3);
    const windOffset = getDeterministicOffset(latitude, longitude, currentHour, 'dmc_wind', 2);
    const uvOffset = getDeterministicOffset(latitude, longitude, currentHour, 'dmc_uv', 0.3);

    const adaptedCurrent: CurrentWeather = {
      ...baseData.current,
      temperatureC: Math.round(baseData.current.temperatureC + tempOffset),
      feelsLikeC: Math.round(baseData.current.feelsLikeC + tempOffset),
      humidity: Math.max(10, Math.min(100, Math.round(baseData.current.humidity + humOffset))),
      windSpeedKmh: Math.max(0, Math.round(baseData.current.windSpeedKmh + windOffset)),
      windGustKmh: Math.max(0, Math.round(baseData.current.windGustKmh + windOffset * 1.1)),
      precipitationMm: Number((baseData.current.precipitationMm * (1 + getDeterministicOffset(latitude, longitude, currentHour, 'dmc_precip', 0.1))).toFixed(1)),
      uvIndex: Math.max(0, Math.round(baseData.current.uvIndex + uvOffset)),
      condition: getSimulatedCondition(baseData.current.condition, latitude, longitude, currentHour, 'dmc_chile')
    };

    return {
      current: adaptedCurrent,
      hourly: baseData.hourly.map((h, idx) => {
        const hourOffset = currentHour + idx;
        const hTemp = getDeterministicOffset(latitude, longitude, hourOffset, 'dmc_temp', 0.5);
        const hHum = getDeterministicOffset(latitude, longitude, hourOffset, 'dmc_hum', 3);
        return {
          ...h,
          temperatureC: Math.round(h.temperatureC + hTemp),
          humidity: Math.max(10, Math.min(100, Math.round(h.humidity + hHum))),
          condition: getSimulatedCondition(h.condition, latitude, longitude, hourOffset, 'dmc_chile')
        };
      }),
      daily: baseData.daily.map((d, idx) => {
        const dTempMax = getDeterministicOffset(latitude, longitude, currentHour + idx * 24, 'dmc_temp_max', 0.4);
        const dTempMin = getDeterministicOffset(latitude, longitude, currentHour + idx * 24, 'dmc_temp_min', 0.5);
        return {
          ...d,
          maxTempC: Math.round(d.maxTempC + dTempMax),
          minTempC: Math.round(d.minTempC + dTempMin),
          condition: getSimulatedCondition(d.condition, latitude, longitude, currentHour + idx * 24, 'dmc_chile')
        };
      })
    };
  }
};

// 4. Tomorrow.io Provider (Simulated Secondary Source)
export const TomorrowIoProvider: WeatherProvider = {
  id: 'tomorrow_io',
  name: 'Tomorrow.io',
  fullName: 'Tomorrow.io High-Resolution Global Model',
  isDemo: true,
  async fetchData(latitude: number, longitude: number, baseData?: MultiSourceWeatherData): Promise<MultiSourceWeatherData> {
    if (!baseData) {
      throw new Error('Base weather data is required to run multi-source simulation.');
    }
    const currentHour = new Date().getHours();
    
    // Tomorrow.io reports slightly higher wind gusts and high uv estimates
    const tempOffset = getDeterministicOffset(latitude, longitude, currentHour, 'tomorrow_temp', 1.0);
    const humOffset = getDeterministicOffset(latitude, longitude, currentHour, 'tomorrow_hum', 5);
    const windOffset = getDeterministicOffset(latitude, longitude, currentHour, 'tomorrow_wind', 4);
    const uvOffset = getDeterministicOffset(latitude, longitude, currentHour, 'tomorrow_uv', 0.6);

    const adaptedCurrent: CurrentWeather = {
      ...baseData.current,
      temperatureC: Math.round(baseData.current.temperatureC + tempOffset),
      feelsLikeC: Math.round(baseData.current.feelsLikeC + tempOffset * 1.2),
      humidity: Math.max(10, Math.min(100, Math.round(baseData.current.humidity + humOffset))),
      windSpeedKmh: Math.max(0, Math.round(baseData.current.windSpeedKmh + windOffset)),
      windGustKmh: Math.max(0, Math.round(baseData.current.windGustKmh + windOffset * 1.5)),
      precipitationMm: Number((baseData.current.precipitationMm * (1 + getDeterministicOffset(latitude, longitude, currentHour, 'tomorrow_precip', 0.25))).toFixed(1)),
      uvIndex: Math.max(0, Math.round(baseData.current.uvIndex + uvOffset)),
      condition: getSimulatedCondition(baseData.current.condition, latitude, longitude, currentHour, 'tomorrow_io')
    };

    return {
      current: adaptedCurrent,
      hourly: baseData.hourly.map((h, idx) => {
        const hourOffset = currentHour + idx;
        const hTemp = getDeterministicOffset(latitude, longitude, hourOffset, 'tomorrow_temp', 1.0);
        const hHum = getDeterministicOffset(latitude, longitude, hourOffset, 'tomorrow_hum', 5);
        return {
          ...h,
          temperatureC: Math.round(h.temperatureC + hTemp),
          humidity: Math.max(10, Math.min(100, Math.round(h.humidity + hHum))),
          condition: getSimulatedCondition(h.condition, latitude, longitude, hourOffset, 'tomorrow_io')
        };
      }),
      daily: baseData.daily.map((d, idx) => {
        const dTempMax = getDeterministicOffset(latitude, longitude, currentHour + idx * 24, 'tomorrow_temp_max', 0.8);
        const dTempMin = getDeterministicOffset(latitude, longitude, currentHour + idx * 24, 'tomorrow_temp_min', 0.8);
        return {
          ...d,
          maxTempC: Math.round(d.maxTempC + dTempMax),
          minTempC: Math.round(d.minTempC + dTempMin),
          condition: getSimulatedCondition(d.condition, latitude, longitude, currentHour + idx * 24, 'tomorrow_io')
        };
      })
    };
  }
};

// 5. Meteomatics Provider (Simulated Secondary Source)
export const MeteomaticsProvider: WeatherProvider = {
  id: 'meteomatics',
  name: 'Meteomatics',
  fullName: 'Meteomatics High-Resolution Euro-Model',
  isDemo: true,
  async fetchData(latitude: number, longitude: number, baseData?: MultiSourceWeatherData): Promise<MultiSourceWeatherData> {
    if (!baseData) {
      throw new Error('Base weather data is required to run multi-source simulation.');
    }
    const currentHour = new Date().getHours();
    
    // Meteomatics is known for high terrain scaling resolution
    const tempOffset = getDeterministicOffset(latitude, longitude, currentHour, 'meteomatics_temp', 0.6);
    const humOffset = getDeterministicOffset(latitude, longitude, currentHour, 'meteomatics_hum', 3);
    const windOffset = getDeterministicOffset(latitude, longitude, currentHour, 'meteomatics_wind', 3);
    const uvOffset = getDeterministicOffset(latitude, longitude, currentHour, 'meteomatics_uv', 0.4);

    const adaptedCurrent: CurrentWeather = {
      ...baseData.current,
      temperatureC: Math.round(baseData.current.temperatureC + tempOffset),
      feelsLikeC: Math.round(baseData.current.feelsLikeC + tempOffset * 0.95),
      humidity: Math.max(10, Math.min(100, Math.round(baseData.current.humidity + humOffset))),
      windSpeedKmh: Math.max(0, Math.round(baseData.current.windSpeedKmh + windOffset)),
      windGustKmh: Math.max(0, Math.round(baseData.current.windGustKmh + windOffset * 1.25)),
      precipitationMm: Number((baseData.current.precipitationMm * (1 + getDeterministicOffset(latitude, longitude, currentHour, 'meteomatics_precip', 0.2))).toFixed(1)),
      uvIndex: Math.max(0, Math.round(baseData.current.uvIndex + uvOffset)),
      condition: getSimulatedCondition(baseData.current.condition, latitude, longitude, currentHour, 'meteomatics')
    };

    return {
      current: adaptedCurrent,
      hourly: baseData.hourly.map((h, idx) => {
        const hourOffset = currentHour + idx;
        const hTemp = getDeterministicOffset(latitude, longitude, hourOffset, 'meteomatics_temp', 0.6);
        const hHum = getDeterministicOffset(latitude, longitude, hourOffset, 'meteomatics_hum', 3);
        return {
          ...h,
          temperatureC: Math.round(h.temperatureC + hTemp),
          humidity: Math.max(10, Math.min(100, Math.round(h.humidity + hHum))),
          condition: getSimulatedCondition(h.condition, latitude, longitude, hourOffset, 'meteomatics')
        };
      }),
      daily: baseData.daily.map((d, idx) => {
        const dTempMax = getDeterministicOffset(latitude, longitude, currentHour + idx * 24, 'meteomatics_temp_max', 0.5);
        const dTempMin = getDeterministicOffset(latitude, longitude, currentHour + idx * 24, 'meteomatics_temp_min', 0.5);
        return {
          ...d,
          maxTempC: Math.round(d.maxTempC + dTempMax),
          minTempC: Math.round(d.minTempC + dTempMin),
          condition: getSimulatedCondition(d.condition, latitude, longitude, currentHour + idx * 24, 'meteomatics')
        };
      })
    };
  }
};

// Full list of registered providers
export const providersList: WeatherProvider[] = [
  OpenMeteoProvider,
  OpenWeatherProvider,
  DmcChileProvider,
  TomorrowIoProvider,
  MeteomaticsProvider
];

export interface VariableComparison {
  name: string;
  label: string;
  unit: string;
  openMeteoValue: number | string;
  avgValue: number;
  maxDelta: number;
  providerValues: Record<string, number | string>;
}

export type SkyCoreConfidenceType = 'Alta' | 'Media' | 'Baja';

export interface ComparisonReport {
  timestamp: string;
  primaryProvider: string;
  confidence: SkyCoreConfidenceType;
  confidenceScore: number; // 0 to 100
  variables: VariableComparison[];
  providersData: Record<string, CurrentWeather>;
}

// 4. SkyCoreSourceComparisonEngine
export async function runSkyCoreComparison(
  location: WeatherLocation,
  baseData: MultiSourceWeatherData
): Promise<ComparisonReport> {
  const reports: Record<string, CurrentWeather> = {};
  
  // Fetch data for all providers
  for (const provider of providersList) {
    try {
      const res = await provider.fetchData(location.latitude, location.longitude, baseData);
      reports[provider.id] = res.current;
    } catch (err) {
      console.error(`Error comparison data for ${provider.id}:`, err);
      // Fallback: use base data directly if error
      reports[provider.id] = baseData.current;
    }
  }

  // Set up variable comparison trackers
  const comparisons: VariableComparison[] = [
    {
      name: 'temperature',
      label: 'Temperatura',
      unit: '°C',
      openMeteoValue: baseData.current.temperatureC,
      avgValue: 0,
      maxDelta: 0,
      providerValues: {}
    },
    {
      name: 'humidity',
      label: 'Humedad Relativa',
      unit: '%',
      openMeteoValue: baseData.current.humidity,
      avgValue: 0,
      maxDelta: 0,
      providerValues: {}
    },
    {
      name: 'rain',
      label: 'Precipitación',
      unit: ' mm',
      openMeteoValue: baseData.current.precipitationMm,
      avgValue: 0,
      maxDelta: 0,
      providerValues: {}
    },
    {
      name: 'wind',
      label: 'Velocidad de Viento',
      unit: ' km/h',
      openMeteoValue: baseData.current.windSpeedKmh,
      avgValue: 0,
      maxDelta: 0,
      providerValues: {}
    },
    {
      name: 'gusts',
      label: 'Ráfagas de Viento',
      unit: ' km/h',
      openMeteoValue: baseData.current.windGustKmh,
      avgValue: 0,
      maxDelta: 0,
      providerValues: {}
    },
    {
      name: 'uv',
      label: 'Índice UV',
      unit: '',
      openMeteoValue: baseData.current.uvIndex,
      avgValue: 0,
      maxDelta: 0,
      providerValues: {}
    },
    {
      name: 'condition',
      label: 'Condición',
      unit: '',
      openMeteoValue: baseData.current.condition,
      avgValue: 0, // Not numeric, we will treat separately
      maxDelta: 0, // Not numeric, we will treat separately
      providerValues: {}
    }
  ];

  // Populate provider values
  for (const comp of comparisons) {
    for (const prov of providersList) {
      const currentOfProv = reports[prov.id];
      if (!currentOfProv) continue;

      if (comp.name === 'temperature') {
        comp.providerValues[prov.id] = currentOfProv.temperatureC;
      } else if (comp.name === 'humidity') {
        comp.providerValues[prov.id] = currentOfProv.humidity;
      } else if (comp.name === 'rain') {
        comp.providerValues[prov.id] = currentOfProv.precipitationMm;
      } else if (comp.name === 'wind') {
        comp.providerValues[prov.id] = currentOfProv.windSpeedKmh;
      } else if (comp.name === 'gusts') {
        comp.providerValues[prov.id] = currentOfProv.windGustKmh;
      } else if (comp.name === 'uv') {
        comp.providerValues[prov.id] = currentOfProv.uvIndex;
      } else if (comp.name === 'condition') {
        comp.providerValues[prov.id] = currentOfProv.condition;
      }
    }
  }

  // Calculate stats for numeric variables
  let totalConfidenceScore = 100;

  for (const comp of comparisons) {
    if (comp.name === 'condition') {
      // Condition comparison check: how many providers agree with primary?
      let agreements = 0;
      for (const prov of providersList) {
        if (comp.providerValues[prov.id] === comp.openMeteoValue) {
          agreements++;
        }
      }
      // Deduct score based on disagreement
      const disagreementFraction = (providersList.length - agreements) / providersList.length;
      totalConfidenceScore -= disagreementFraction * 15; // Max 15 points deduction
      continue;
    }

    const values = Object.values(comp.providerValues).map(Number).filter(v => !isNaN(v));
    if (values.length === 0) continue;

    const sum = values.reduce((a, b) => a + b, 0);
    comp.avgValue = Number((sum / values.length).toFixed(1));

    const min = Math.min(...values);
    const max = Math.max(...values);
    comp.maxDelta = Number((max - min).toFixed(1));

    // Deduct points based on max delta per variable
    if (comp.name === 'temperature') {
      if (comp.maxDelta > 1.2) {
        const excess = comp.maxDelta - 1.2;
        totalConfidenceScore -= Math.min(20, excess * 10);
      }
    } else if (comp.name === 'humidity') {
      if (comp.maxDelta > 8) {
        const excess = comp.maxDelta - 8;
        totalConfidenceScore -= Math.min(15, excess * 1.5);
      }
    } else if (comp.name === 'rain') {
      if (comp.maxDelta > 0.5) {
        const excess = comp.maxDelta - 0.5;
        totalConfidenceScore -= Math.min(20, excess * 8);
      }
    } else if (comp.name === 'wind' || comp.name === 'gusts') {
      if (comp.maxDelta > 6) {
        const excess = comp.maxDelta - 6;
        totalConfidenceScore -= Math.min(15, excess * 1.2);
      }
    } else if (comp.name === 'uv') {
      if (comp.maxDelta > 1) {
        const excess = comp.maxDelta - 1;
        totalConfidenceScore -= Math.min(15, excess * 8);
      }
    }
  }

  // Constrain total confidence score
  totalConfidenceScore = Math.max(10, Math.min(100, Math.round(totalConfidenceScore)));

  // Determine Confidence Index level
  let confidence: SkyCoreConfidenceType = 'Alta';
  if (totalConfidenceScore < 60) {
    confidence = 'Baja';
  } else if (totalConfidenceScore < 85) {
    confidence = 'Media';
  }

  return {
    timestamp: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
    primaryProvider: 'Open-Meteo',
    confidence,
    confidenceScore: totalConfidenceScore,
    variables: comparisons,
    providersData: reports
  };
}

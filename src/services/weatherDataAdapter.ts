import { 
  CurrentWeather, 
  HourlyForecast, 
  DailyForecast, 
  WeatherLocation,
  WeatherCondition,
  OpenMeteoRawResponse
} from '../types/weatherTypes';
import { mapWmoCodeToOrbiCondition } from '../utils/wmoWeatherCodeMapper';

function formatHourlyTime(isoString: string): string {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '12:00 PM';
  let hours = date.getHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
}

function formatDailyDate(isoString: string, index: number): string {
  if (index === 0) return 'Hoy';
  const date = new Date(isoString + 'T00:00:00');
  if (isNaN(date.getTime())) return 'Día';
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return days[date.getDay()];
}

function formatSunriseSunset(isoString: string): string {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '--:--';
  let hours = date.getHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
}

export function adaptOpenMeteoCurrent(raw: OpenMeteoRawResponse): CurrentWeather {
  const current = raw.current || {};
  
  // Find UV index from hourly data matching current hour if available
  let uvIndex = 1;
  if (raw.hourly && Array.isArray(raw.hourly.time) && Array.isArray(raw.hourly.uv_index)) {
    const curTimeStr = current.time ? String(current.time).substring(0, 13) : '';
    const matchIdx = raw.hourly.time.findIndex((t: any) => String(t).substring(0, 13) === curTimeStr);
    if (matchIdx !== -1) {
      uvIndex = Math.round(Number(raw.hourly.uv_index[matchIdx] || 0));
    } else {
      // Fallback: take the first daytime UV max or 3
      uvIndex = Math.round(Number(raw.daily?.uv_index_max?.[0] || 3));
    }
  }

  const wmoCode = current.weather_code !== undefined ? Number(current.weather_code) : 0;
  const isDay = current.is_day !== undefined ? Boolean(current.is_day) : true;

  return {
    temperatureC: Math.round(Number(current.temperature_2m || 0)),
    feelsLikeC: Math.round(Number(current.apparent_temperature || current.temperature_2m || 0)),
    humidity: Math.round(Number(current.relative_humidity_2m || 50)),
    windSpeedKmh: Math.round(Number(current.wind_speed_10m || 0)),
    windGustKmh: Math.round(Number(current.wind_gusts_10m || current.wind_speed_10m || 0)),
    pressureHpa: Math.round(Number(current.pressure_msl || 1013)),
    cloudCover: Math.round(Number(current.cloud_cover || 0)),
    precipitationMm: Number(current.precipitation || 0),
    uvIndex: uvIndex,
    condition: mapWmoCodeToOrbiCondition(wmoCode, isDay, Number(current.precipitation || 0)),
    updatedAt: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
  };
}

export function adaptOpenMeteoHourly(raw: OpenMeteoRawResponse): HourlyForecast[] {
  const hourly = raw.hourly;
  if (!hourly || !Array.isArray(hourly.time)) {
    return [];
  }

  const times = hourly.time;
  const temps = hourly.temperature_2m || [];
  const precProbs = hourly.precipitation_probability || [];
  const precMms = hourly.precipitation || [];
  const windSpeeds = hourly.wind_speed_10m || [];
  const humidities = hourly.relative_humidity_2m || [];
  const clouds = hourly.cloud_cover || [];
  const uvs = hourly.uv_index || [];
  const weatherCodes = hourly.weather_code || [];

  const nowMs = Date.now();
  const list: HourlyForecast[] = [];

  for (let i = 0; i < times.length; i++) {
    const timeVal = times[i];
    const itemDate = new Date(timeVal);
    
    // Filter out historical hours more than 1 hour in the past to keep current & future view
    if (itemDate.getTime() < nowMs - 3600000) {
      continue;
    }

    const hour = itemDate.getHours();
    const isDay = hour > 6 && hour < 19;
    const wmo = weatherCodes[i] !== undefined ? Number(weatherCodes[i]) : 3;

    list.push({
      time: formatHourlyTime(timeVal),
      temperatureC: Math.round(Number(temps[i] || 0)),
      precipitationProbability: Math.round(Number(precProbs[i] || 0)),
      precipitationMm: Number(precMms[i] || 0),
      windSpeedKmh: Math.round(Number(windSpeeds[i] || 0)),
      humidity: Math.round(Number(humidities[i] || 50)),
      cloudCover: Math.round(Number(clouds[i] || 0)),
      uvIndex: Math.round(Number(uvs[i] || 0)),
      condition: mapWmoCodeToOrbiCondition(wmo, isDay, Number(precMms[i] || 0))
    });

    // Limit to next 24 intervals for optimal UI spacing
    if (list.length >= 24) {
      break;
    }
  }

  return list;
}

export function adaptOpenMeteoDaily(raw: OpenMeteoRawResponse): DailyForecast[] {
  const daily = raw.daily;
  if (!daily || !Array.isArray(daily.time)) {
    return [];
  }

  const times = daily.time;
  const mins = daily.temperature_2m_min || [];
  const maxs = daily.temperature_2m_max || [];
  const precProbs = daily.precipitation_probability_max || [];
  const windMaxs = daily.wind_speed_10m_max || [];
  const uvMaxs = daily.uv_index_max || [];
  const sunrises = daily.sunrise || [];
  const sunsets = daily.sunset || [];
  const weatherCodes = daily.weather_code || [];

  const list: DailyForecast[] = [];

  for (let i = 0; i < times.length; i++) {
    const wmo = weatherCodes[i] !== undefined ? Number(weatherCodes[i]) : 0;
    
    list.push({
      date: formatDailyDate(times[i], i),
      minTempC: Math.round(Number(mins[i] || 0)),
      maxTempC: Math.round(Number(maxs[i] || 0)),
      precipitationProbability: Math.round(Number(precProbs[i] || 0)),
      windMaxKmh: Math.round(Number(windMaxs[i] || 0)),
      uvMax: Math.round(Number(uvMaxs[i] || 0)),
      sunrise: sunrises[i] ? formatSunriseSunset(sunrises[i]) : '07:30 AM',
      sunset: sunsets[i] ? formatSunriseSunset(sunsets[i]) : '06:00 PM',
      condition: mapWmoCodeToOrbiCondition(wmo, true)
    });
  }

  return list.slice(0, 7);
}

export function adaptOpenMeteoBundle(raw: OpenMeteoRawResponse, location: WeatherLocation) {
  return {
    location,
    current: adaptOpenMeteoCurrent(raw),
    hourly: adaptOpenMeteoHourly(raw),
    daily: adaptOpenMeteoDaily(raw)
  };
}

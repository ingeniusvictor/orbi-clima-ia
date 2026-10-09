import {
  CurrentWeather,
  HourlyForecast,
  DailyForecast,
  WeatherLocation,
  OpenMeteoRawResponse,
} from '../types/weatherTypes';
import {
  describeWmoWeatherCode,
  inferIntensityFromRate,
  mapWmoCodeToOrbiCondition,
} from '../utils/wmoWeatherCodeMapper';

function numberOr(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

/** Open-Meteo returns local-time ISO strings when timezone=auto. Keep them local instead of reparsing in the device timezone. */
function formatLocalClock(isoString?: string): string {
  if (!isoString || !isoString.includes('T')) return '--:--';
  return isoString.split('T')[1]?.substring(0, 5) || '--:--';
}

function formatDailyDate(isoString: string, index: number): string {
  if (index === 0) return 'Hoy';
  const date = new Date(`${isoString}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return 'Día';
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return days[date.getUTCDay()];
}

function currentHourUv(raw: OpenMeteoRawResponse): number {
  const current = raw.current || {};
  const hourly = raw.hourly;
  if (!hourly || !Array.isArray(hourly.time) || !Array.isArray(hourly.uv_index)) return 0;

  const currentHourKey = String(current.time || '').substring(0, 13);
  const matchIdx = hourly.time.findIndex((t: unknown) => String(t).substring(0, 13) === currentHourKey);
  if (matchIdx >= 0) return Math.max(0, numberOr(hourly.uv_index[matchIdx], 0));
  return 0;
}

export function adaptOpenMeteoCurrent(raw: OpenMeteoRawResponse): CurrentWeather {
  const current = raw.current || {};
  const precipitationMm = Math.max(0, numberOr(current.precipitation, 0));
  const intervalSeconds = Math.max(0, numberOr(current.interval, 0));
  const precipitationIntervalMinutes = intervalSeconds > 0 ? intervalSeconds / 60 : undefined;
  const precipitationRateMmH = intervalSeconds > 0
    ? Number((precipitationMm * (3600 / intervalSeconds)).toFixed(2))
    : undefined;

  const weatherCode = current.weather_code !== undefined ? numberOr(current.weather_code, 0) : undefined;
  const isDay = current.is_day !== undefined ? numberOr(current.is_day, 1) === 1 : true;
  const descriptor = describeWmoWeatherCode(weatherCode);
  const precipitationIntensity = descriptor.isPrecipitating
    ? descriptor.intensity
    : inferIntensityFromRate(precipitationRateMmH);

  return {
    temperatureC: Math.round(numberOr(current.temperature_2m, 0)),
    feelsLikeC: Math.round(numberOr(current.apparent_temperature, numberOr(current.temperature_2m, 0))),
    humidity: Math.round(numberOr(current.relative_humidity_2m, 50)),
    dewPointC: current.dew_point_2m !== undefined ? numberOr(current.dew_point_2m) : undefined,
    visibilityM: current.visibility !== undefined ? numberOr(current.visibility) : undefined,
    windSpeedKmh: Math.round(numberOr(current.wind_speed_10m, 0)),
    windGustKmh: Math.round(numberOr(current.wind_gusts_10m, numberOr(current.wind_speed_10m, 0))),
    windDirectionDeg: current.wind_direction_10m !== undefined ? Math.round(numberOr(current.wind_direction_10m)) : undefined,
    pressureHpa: Math.round(numberOr(current.pressure_msl, 1013)),
    cloudCover: Math.round(numberOr(current.cloud_cover, 0)),
    precipitationMm,
    precipitationIntervalMinutes,
    precipitationRateMmH,
    rainMm: Math.max(0, numberOr(current.rain, 0)),
    showersMm: Math.max(0, numberOr(current.showers, 0)),
    snowfallCm: Math.max(0, numberOr(current.snowfall, 0)),
    uvIndex: Math.round(currentHourUv(raw) * 10) / 10,
    weatherCode,
    conditionLabel: descriptor.label,
    phenomenon: descriptor.phenomenon,
    precipitationIntensity,
    condition: mapWmoCodeToOrbiCondition(weatherCode, isDay, precipitationMm),
    dataTime: current.time ? String(current.time) : undefined,
    updatedAt: formatLocalClock(current.time ? String(current.time) : undefined),
  };
}

export function adaptOpenMeteoHourly(raw: OpenMeteoRawResponse): HourlyForecast[] {
  const hourly = raw.hourly;
  if (!hourly || !Array.isArray(hourly.time)) return [];

  const times = hourly.time;
  const currentHourKey = String(raw.current?.time || '').substring(0, 13);
  const list: HourlyForecast[] = [];

  for (let i = 0; i < times.length; i++) {
    const timeVal = String(times[i]);
    if (currentHourKey && timeVal.substring(0, 13) < currentHourKey) continue;

    const precipitationMm = Math.max(0, numberOr(hourly.precipitation?.[i], 0));
    const weatherCode = hourly.weather_code?.[i] !== undefined ? numberOr(hourly.weather_code[i], 3) : undefined;
    const descriptor = describeWmoWeatherCode(weatherCode);
    const hour = numberOr(timeVal.substring(11, 13), 12);
    const isDay = hourly.is_day?.[i] !== undefined ? numberOr(hourly.is_day[i], 1) === 1 : (hour >= 7 && hour < 20);

    list.push({
      time: formatLocalClock(timeVal),
      isoTime: timeVal,
      temperatureC: Math.round(numberOr(hourly.temperature_2m?.[i], 0)),
      apparentTemperatureC: Math.round(numberOr(hourly.apparent_temperature?.[i], numberOr(hourly.temperature_2m?.[i], 0))),
      dewPointC: hourly.dew_point_2m?.[i] !== undefined ? numberOr(hourly.dew_point_2m[i]) : undefined,
      precipitationProbability: Math.round(numberOr(hourly.precipitation_probability?.[i], 0)),
      precipitationMm,
      rainMm: Math.max(0, numberOr(hourly.rain?.[i], 0)),
      showersMm: Math.max(0, numberOr(hourly.showers?.[i], 0)),
      snowfallCm: Math.max(0, numberOr(hourly.snowfall?.[i], 0)),
      windSpeedKmh: Math.round(numberOr(hourly.wind_speed_10m?.[i], 0)),
      windGustKmh: Math.round(numberOr(hourly.wind_gusts_10m?.[i], numberOr(hourly.wind_speed_10m?.[i], 0))),
      windDirectionDeg: hourly.wind_direction_10m?.[i] !== undefined ? Math.round(numberOr(hourly.wind_direction_10m[i])) : undefined,
      humidity: Math.round(numberOr(hourly.relative_humidity_2m?.[i], 50)),
      cloudCover: Math.round(numberOr(hourly.cloud_cover?.[i], 0)),
      visibilityM: hourly.visibility?.[i] !== undefined ? numberOr(hourly.visibility[i]) : undefined,
      uvIndex: Math.max(0, Math.round(numberOr(hourly.uv_index?.[i], 0) * 10) / 10),
      weatherCode,
      conditionLabel: descriptor.label,
      phenomenon: descriptor.phenomenon,
      precipitationIntensity: descriptor.isPrecipitating ? descriptor.intensity : inferIntensityFromRate(precipitationMm),
      condition: mapWmoCodeToOrbiCondition(weatherCode, isDay, precipitationMm),
    });

    if (list.length >= 24) break;
  }

  return list;
}

export function adaptOpenMeteoDaily(raw: OpenMeteoRawResponse): DailyForecast[] {
  const daily = raw.daily;
  if (!daily || !Array.isArray(daily.time)) return [];

  const list: DailyForecast[] = [];

  for (let i = 0; i < daily.time.length; i++) {
    const weatherCode = daily.weather_code?.[i] !== undefined ? numberOr(daily.weather_code[i], 0) : undefined;
    const descriptor = describeWmoWeatherCode(weatherCode);

    list.push({
      date: formatDailyDate(String(daily.time[i]), i),
      minTempC: Math.round(numberOr(daily.temperature_2m_min?.[i], 0)),
      maxTempC: Math.round(numberOr(daily.temperature_2m_max?.[i], 0)),
      precipitationProbability: Math.round(numberOr(daily.precipitation_probability_max?.[i], 0)),
      precipitationSumMm: Math.max(0, numberOr(daily.precipitation_sum?.[i], 0)),
      rainSumMm: Math.max(0, numberOr(daily.rain_sum?.[i], 0)),
      showersSumMm: Math.max(0, numberOr(daily.showers_sum?.[i], 0)),
      snowfallSumCm: Math.max(0, numberOr(daily.snowfall_sum?.[i], 0)),
      precipitationHours: Math.max(0, numberOr(daily.precipitation_hours?.[i], 0)),
      windMaxKmh: Math.round(numberOr(daily.wind_speed_10m_max?.[i], 0)),
      windGustMaxKmh: Math.round(numberOr(daily.wind_gusts_10m_max?.[i], 0)),
      windDirectionDominantDeg: daily.wind_direction_10m_dominant?.[i] !== undefined ? Math.round(numberOr(daily.wind_direction_10m_dominant[i])) : undefined,
      uvMax: Math.max(0, Math.round(numberOr(daily.uv_index_max?.[i], 0) * 10) / 10),
      sunrise: daily.sunrise?.[i] ? formatLocalClock(String(daily.sunrise[i])) : '--:--',
      sunset: daily.sunset?.[i] ? formatLocalClock(String(daily.sunset[i])) : '--:--',
      weatherCode,
      conditionLabel: descriptor.label,
      phenomenon: descriptor.phenomenon,
      condition: mapWmoCodeToOrbiCondition(weatherCode, true),
    });
  }

  return list.slice(0, 7);
}

export function adaptOpenMeteoBundle(raw: OpenMeteoRawResponse, location: WeatherLocation) {
  return {
    location,
    current: adaptOpenMeteoCurrent(raw),
    hourly: adaptOpenMeteoHourly(raw),
    daily: adaptOpenMeteoDaily(raw),
  };
}

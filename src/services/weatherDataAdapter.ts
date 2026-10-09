import {
  CurrentWeather,
  HourlyForecast,
  DailyForecast,
  WeatherLocation,
  OpenMeteoRawResponse,
} from '../types/weatherTypes';
import {
  mapWmoCodeToOrbiCondition,
  getWmoHumanLabel,
  getWmoPrecipitationKind,
  getWmoPrecipitationIntensity,
} from '../utils/wmoWeatherCodeMapper';

function formatHourlyTime(isoString: string): string {
  const rawTime = String(isoString).split('T')[1]?.slice(0, 5);
  if (!rawTime) return '--:--';

  const [hourText, minute = '00'] = rawTime.split(':');
  let hour = Number(hourText);
  if (!Number.isFinite(hour)) return rawTime;
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour %= 12;
  hour = hour || 12;
  return `${hour.toString().padStart(2, '0')}:${minute} ${ampm}`;
}

function formatDailyDate(isoString: string, index: number): string {
  if (index === 0) return 'Hoy';
  const date = new Date(`${isoString}T12:00:00`);
  if (Number.isNaN(date.getTime())) return 'Día';
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return days[date.getDay()];
}

function formatSunriseSunset(isoString: string): string {
  return formatHourlyTime(isoString);
}

function numberOr(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function attachWeatherSemantics<T extends object>(
  base: T,
  code: number,
  precipitationMm: number,
  extras: Record<string, unknown> = {},
): T {
  return Object.assign(base, {
    weatherCode: code,
    conditionLabel: getWmoHumanLabel(code),
    precipitationKind: getWmoPrecipitationKind(code),
    precipitationIntensity: getWmoPrecipitationIntensity(code, precipitationMm),
    ...extras,
  });
}

export function adaptOpenMeteoCurrent(raw: OpenMeteoRawResponse): CurrentWeather {
  const current = raw.current || {};

  let uvIndex = 0;
  if (raw.hourly && Array.isArray(raw.hourly.time) && Array.isArray(raw.hourly.uv_index)) {
    const currentHourKey = current.time ? String(current.time).slice(0, 13) : '';
    const matchIdx = raw.hourly.time.findIndex((t: unknown) => String(t).slice(0, 13) === currentHourKey);
    if (matchIdx >= 0) {
      uvIndex = Math.round(numberOr(raw.hourly.uv_index[matchIdx], 0));
    } else {
      uvIndex = Math.round(numberOr(raw.daily?.uv_index_max?.[0], 0));
    }
  }

  const precipitationMm = numberOr(current.precipitation, 0);
  const wmoCode = numberOr(current.weather_code, 0);
  const isDay = current.is_day !== undefined ? Boolean(current.is_day) : true;

  const result: CurrentWeather = {
    temperatureC: Math.round(numberOr(current.temperature_2m, 0)),
    feelsLikeC: Math.round(numberOr(current.apparent_temperature, numberOr(current.temperature_2m, 0))),
    humidity: Math.round(numberOr(current.relative_humidity_2m, 50)),
    windSpeedKmh: Math.round(numberOr(current.wind_speed_10m, 0)),
    windGustKmh: Math.round(numberOr(current.wind_gusts_10m, numberOr(current.wind_speed_10m, 0))),
    pressureHpa: Math.round(numberOr(current.pressure_msl, 1013)),
    cloudCover: Math.round(numberOr(current.cloud_cover, 0)),
    precipitationMm,
    uvIndex,
    condition: mapWmoCodeToOrbiCondition(wmoCode, isDay, precipitationMm),
    updatedAt: current.time ? String(current.time) : new Date().toISOString(),
  };

  return attachWeatherSemantics(result, wmoCode, precipitationMm, {
    rainMm: numberOr(current.rain, 0),
    showersMm: numberOr(current.showers, 0),
    isDay,
    sourceObservationTime: current.time ? String(current.time) : undefined,
  });
}

export function adaptOpenMeteoHourly(raw: OpenMeteoRawResponse): HourlyForecast[] {
  const hourly = raw.hourly;
  if (!hourly || !Array.isArray(hourly.time)) return [];

  const times = hourly.time;
  const currentHourKey = String(raw.current?.time ?? '').slice(0, 13);
  const list: HourlyForecast[] = [];

  for (let i = 0; i < times.length; i++) {
    const timeVal = String(times[i]);
    const hourKey = timeVal.slice(0, 13);
    if (currentHourKey && hourKey < currentHourKey) continue;

    const precipitationMm = numberOr(hourly.precipitation?.[i], 0);
    const wmoCode = numberOr(hourly.weather_code?.[i], 3);
    const rawHour = Number(timeVal.split('T')[1]?.slice(0, 2));
    const isDay = Number.isFinite(rawHour) ? rawHour >= 7 && rawHour < 19 : true;

    const item: HourlyForecast = {
      time: formatHourlyTime(timeVal),
      temperatureC: Math.round(numberOr(hourly.temperature_2m?.[i], 0)),
      precipitationProbability: Math.round(numberOr(hourly.precipitation_probability?.[i], 0)),
      precipitationMm,
      windSpeedKmh: Math.round(numberOr(hourly.wind_speed_10m?.[i], 0)),
      humidity: Math.round(numberOr(hourly.relative_humidity_2m?.[i], 50)),
      cloudCover: Math.round(numberOr(hourly.cloud_cover?.[i], 0)),
      uvIndex: Math.round(numberOr(hourly.uv_index?.[i], 0)),
      condition: mapWmoCodeToOrbiCondition(wmoCode, isDay, precipitationMm),
    };

    list.push(attachWeatherSemantics(item, wmoCode, precipitationMm, {
      rainMm: numberOr(hourly.rain?.[i], 0),
      showersMm: numberOr(hourly.showers?.[i], 0),
      sourceForecastTime: timeVal,
    }));

    if (list.length >= 24) break;
  }

  return list;
}

export function adaptOpenMeteoDaily(raw: OpenMeteoRawResponse): DailyForecast[] {
  const daily = raw.daily;
  if (!daily || !Array.isArray(daily.time)) return [];

  const list: DailyForecast[] = [];

  for (let i = 0; i < daily.time.length; i++) {
    const wmoCode = numberOr(daily.weather_code?.[i], 0);
    const precipitationMm = numberOr(daily.precipitation_sum?.[i], 0);

    const item: DailyForecast = {
      date: formatDailyDate(String(daily.time[i]), i),
      minTempC: Math.round(numberOr(daily.temperature_2m_min?.[i], 0)),
      maxTempC: Math.round(numberOr(daily.temperature_2m_max?.[i], 0)),
      precipitationProbability: Math.round(numberOr(daily.precipitation_probability_max?.[i], 0)),
      windMaxKmh: Math.round(numberOr(daily.wind_speed_10m_max?.[i], 0)),
      uvMax: Math.round(numberOr(daily.uv_index_max?.[i], 0)),
      sunrise: daily.sunrise?.[i] ? formatSunriseSunset(String(daily.sunrise[i])) : '--:--',
      sunset: daily.sunset?.[i] ? formatSunriseSunset(String(daily.sunset[i])) : '--:--',
      condition: mapWmoCodeToOrbiCondition(wmoCode, true, precipitationMm),
    };

    list.push(attachWeatherSemantics(item, wmoCode, precipitationMm, {
      precipitationSumMm: precipitationMm,
    }));
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

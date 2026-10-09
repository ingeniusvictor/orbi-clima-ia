export interface HydroPrecipPoint {
  time: string;
  precipitationMm: number;
  rainMm: number;
  showersMm: number;
  probability: number | null;
}

export interface HydroPrecipSnapshot {
  provider: 'open_meteo_forecast';
  sourceLabel: string;
  isOfficialAlert: false;
  past3hMm: number;
  past6hMm: number;
  past12hMm: number;
  past24hMm: number;
  next3hMm: number;
  next6hMm: number;
  next12hMm: number;
  next24hMm: number;
  next6hMaxProbability: number;
  next24hMaxHourlyMm: number;
  points: HydroPrecipPoint[];
}

function numberOr(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function targetHourKey(utcOffsetSeconds: number): string {
  return new Date(Date.now() + utcOffsetSeconds * 1000).toISOString().slice(0, 13);
}

function sumRange(points: HydroPrecipPoint[], start: number, end: number): number {
  return Number(points.slice(Math.max(0, start), Math.max(0, end)).reduce((sum, point) => sum + point.precipitationMm, 0).toFixed(1));
}

export async function fetchHydroPrecipContext(params: {
  latitude: number;
  longitude: number;
  timezone?: string;
}): Promise<HydroPrecipSnapshot> {
  const { latitude, longitude, timezone = 'auto' } = params;
  const query = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    timezone,
    past_hours: '24',
    forecast_hours: '24',
    hourly: ['precipitation', 'rain', 'showers', 'precipitation_probability'].join(','),
    precipitation_unit: 'mm',
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 9000);

  try {
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?${query.toString()}`, {
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Open-Meteo hydro precipitation error: ${response.status}`);

    const raw = await response.json();
    const hourly = raw.hourly ?? {};
    const times = Array.isArray(hourly.time) ? hourly.time : [];
    const points: HydroPrecipPoint[] = times.map((time: unknown, index: number) => ({
      time: String(time),
      precipitationMm: numberOr(hourly.precipitation?.[index], 0),
      rainMm: numberOr(hourly.rain?.[index], 0),
      showersMm: numberOr(hourly.showers?.[index], 0),
      probability: hourly.precipitation_probability?.[index] === undefined
        ? null
        : numberOr(hourly.precipitation_probability[index], 0),
    }));

    const nowKey = targetHourKey(numberOr(raw.utc_offset_seconds, 0));
    let currentIndex = points.findIndex(point => point.time.slice(0, 13) >= nowKey);
    if (currentIndex < 0) currentIndex = Math.max(0, points.length - 24);

    const future24 = points.slice(currentIndex, currentIndex + 24);
    const futureProbabilities = future24.slice(0, 6)
      .map(point => point.probability)
      .filter((value): value is number => value !== null);

    return {
      provider: 'open_meteo_forecast',
      sourceLabel: 'Open-Meteo · precipitación horaria modelada',
      isOfficialAlert: false,
      past3hMm: sumRange(points, currentIndex - 3, currentIndex),
      past6hMm: sumRange(points, currentIndex - 6, currentIndex),
      past12hMm: sumRange(points, currentIndex - 12, currentIndex),
      past24hMm: sumRange(points, currentIndex - 24, currentIndex),
      next3hMm: sumRange(points, currentIndex, currentIndex + 3),
      next6hMm: sumRange(points, currentIndex, currentIndex + 6),
      next12hMm: sumRange(points, currentIndex, currentIndex + 12),
      next24hMm: sumRange(points, currentIndex, currentIndex + 24),
      next6hMaxProbability: futureProbabilities.length ? Math.max(...futureProbabilities) : 0,
      next24hMaxHourlyMm: future24.length ? Math.max(...future24.map(point => point.precipitationMm)) : 0,
      points,
    };
  } finally {
    clearTimeout(timeout);
  }
}

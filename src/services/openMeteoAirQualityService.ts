export type AirQualityBand = 'good' | 'moderate' | 'sensitive' | 'unhealthy' | 'very_unhealthy' | 'hazardous' | 'unknown';

export interface AirQualityHourlyPoint {
  time: string;
  usAqi: number | null;
  pm25: number | null;
  pm10: number | null;
  ozone: number | null;
}

export interface AirQualitySnapshot {
  provider: 'open_meteo_cams';
  sourceLabel: string;
  isOfficialLocalAlert: false;
  resolutionKm: number;
  updatedAt: string;
  usAqi: number | null;
  europeanAqi: number | null;
  pm25: number | null;
  pm10: number | null;
  ozone: number | null;
  nitrogenDioxide: number | null;
  sulphurDioxide: number | null;
  carbonMonoxide: number | null;
  band: AirQualityBand;
  label: string;
  dominantPollutant: string | null;
  next12HoursMaxUsAqi: number | null;
  hourly: AirQualityHourlyPoint[];
}

function finiteOrNull(value: unknown): number | null {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

export function classifyUsAqi(aqi: number | null): { band: AirQualityBand; label: string } {
  if (aqi === null) return { band: 'unknown', label: 'Sin dato' };
  if (aqi <= 50) return { band: 'good', label: 'Buena' };
  if (aqi <= 100) return { band: 'moderate', label: 'Moderada' };
  if (aqi <= 150) return { band: 'sensitive', label: 'Dañina para grupos sensibles' };
  if (aqi <= 200) return { band: 'unhealthy', label: 'Dañina' };
  if (aqi <= 300) return { band: 'very_unhealthy', label: 'Muy dañina' };
  return { band: 'hazardous', label: 'Peligrosa' };
}

function dominantPollutant(current: Record<string, unknown>): string | null {
  const candidates: Array<[string, number | null]> = [
    ['PM2.5', finiteOrNull(current.us_aqi_pm2_5)],
    ['PM10', finiteOrNull(current.us_aqi_pm10)],
    ['Ozono', finiteOrNull(current.us_aqi_ozone)],
    ['NO₂', finiteOrNull(current.us_aqi_nitrogen_dioxide)],
    ['SO₂', finiteOrNull(current.us_aqi_sulphur_dioxide)],
    ['CO', finiteOrNull(current.us_aqi_carbon_monoxide)],
  ];

  const valid = candidates.filter((item): item is [string, number] => item[1] !== null);
  if (!valid.length) return null;
  valid.sort((a, b) => b[1] - a[1]);
  return valid[0][0];
}

function currentHourIndex(times: unknown[], currentTime?: unknown): number {
  if (!Array.isArray(times) || !times.length) return -1;
  const currentKey = String(currentTime ?? '').slice(0, 13);
  if (currentKey) {
    const exact = times.findIndex(time => String(time).slice(0, 13) === currentKey);
    if (exact >= 0) return exact;
  }
  return 0;
}

export async function fetchOpenMeteoAirQuality(params: {
  latitude: number;
  longitude: number;
  timezone?: string;
}): Promise<AirQualitySnapshot> {
  const { latitude, longitude, timezone = 'auto' } = params;

  const currentVariables = [
    'us_aqi',
    'us_aqi_pm2_5',
    'us_aqi_pm10',
    'us_aqi_ozone',
    'us_aqi_nitrogen_dioxide',
    'us_aqi_sulphur_dioxide',
    'us_aqi_carbon_monoxide',
    'european_aqi',
    'pm10',
    'pm2_5',
    'carbon_monoxide',
    'nitrogen_dioxide',
    'sulphur_dioxide',
    'ozone',
  ];

  const hourlyVariables = ['us_aqi', 'pm2_5', 'pm10', 'ozone'];
  const query = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    current: currentVariables.join(','),
    hourly: hourlyVariables.join(','),
    timezone,
    forecast_days: '2',
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 9000);

  try {
    const response = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?${query.toString()}`, {
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Open-Meteo Air Quality error: ${response.status}`);
    const raw = await response.json();
    const current = raw.current ?? {};
    const hourly = raw.hourly ?? {};

    const usAqi = finiteOrNull(current.us_aqi);
    const band = classifyUsAqi(usAqi);

    const startIndex = currentHourIndex(hourly.time ?? [], current.time);
    const hourlyPoints: AirQualityHourlyPoint[] = [];
    if (startIndex >= 0 && Array.isArray(hourly.time)) {
      for (let i = startIndex; i < Math.min(hourly.time.length, startIndex + 12); i++) {
        hourlyPoints.push({
          time: String(hourly.time[i]),
          usAqi: finiteOrNull(hourly.us_aqi?.[i]),
          pm25: finiteOrNull(hourly.pm2_5?.[i]),
          pm10: finiteOrNull(hourly.pm10?.[i]),
          ozone: finiteOrNull(hourly.ozone?.[i]),
        });
      }
    }

    const futureAqi = hourlyPoints.map(point => point.usAqi).filter((value): value is number => value !== null);

    return {
      provider: 'open_meteo_cams',
      sourceLabel: 'Open-Meteo / CAMS Global · calidad del aire modelada',
      isOfficialLocalAlert: false,
      // CAMS Global atmospheric composition is ~45 km. This conservative
      // metadata is appropriate for ORBI's primary Chile deployment and avoids
      // implying the ~11 km CAMS Europe resolution outside Europe.
      resolutionKm: 45,
      updatedAt: String(current.time ?? new Date().toISOString()),
      usAqi,
      europeanAqi: finiteOrNull(current.european_aqi),
      pm25: finiteOrNull(current.pm2_5),
      pm10: finiteOrNull(current.pm10),
      ozone: finiteOrNull(current.ozone),
      nitrogenDioxide: finiteOrNull(current.nitrogen_dioxide),
      sulphurDioxide: finiteOrNull(current.sulphur_dioxide),
      carbonMonoxide: finiteOrNull(current.carbon_monoxide),
      band: band.band,
      label: band.label,
      dominantPollutant: dominantPollutant(current),
      next12HoursMaxUsAqi: futureAqi.length ? Math.max(...futureAqi) : null,
      hourly: hourlyPoints,
    };
  } finally {
    clearTimeout(timeout);
  }
}

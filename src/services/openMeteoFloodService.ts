export interface RiverDischargeDay {
  date: string;
  discharge: number | null;
  mean: number | null;
  median: number | null;
  max: number | null;
  min: number | null;
  p25: number | null;
  p75: number | null;
}

export interface FloodContextSnapshot {
  provider: 'open_meteo_glofas';
  sourceLabel: string;
  modelLabel: string;
  isOfficialAlert: false;
  isFlashFloodNowcast: false;
  resolutionKm: number;
  requestedLatitude: number;
  requestedLongitude: number;
  gridLatitude: number | null;
  gridLongitude: number | null;
  riverSelectionCaveat: string;
  currentDischargeM3s: number | null;
  recent7DayMedianM3s: number | null;
  recent7DayMaxM3s: number | null;
  upcoming7DayPeakM3s: number | null;
  upcomingPeakDate: string | null;
  currentVsRecentMedianRatio: number | null;
  peakVsRecentMedianRatio: number | null;
  trend: 'rising' | 'falling' | 'stable' | 'unknown';
  days: RiverDischargeDay[];
}

function finiteOrNull(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function median(values: number[]): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}

function ratio(numerator: number | null, denominator: number | null): number | null {
  if (numerator === null || denominator === null || denominator <= 0) return null;
  return Number((numerator / denominator).toFixed(2));
}

function deriveTrend(values: Array<number | null>): FloodContextSnapshot['trend'] {
  const finite = values.filter((value): value is number => value !== null && Number.isFinite(value));
  if (finite.length < 3) return 'unknown';
  const first = finite.slice(0, Math.min(3, finite.length));
  const last = finite.slice(Math.max(0, finite.length - 3));
  const firstMean = first.reduce((sum, value) => sum + value, 0) / first.length;
  const lastMean = last.reduce((sum, value) => sum + value, 0) / last.length;
  if (firstMean <= 0) return 'unknown';
  const change = (lastMean - firstMean) / firstMean;
  if (change >= 0.12) return 'rising';
  if (change <= -0.12) return 'falling';
  return 'stable';
}

function localDateKey(timezone?: string): string {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone && timezone !== 'auto' ? timezone : undefined,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

export async function fetchOpenMeteoFloodContext(params: {
  latitude: number;
  longitude: number;
  timezone?: string;
}): Promise<FloodContextSnapshot> {
  const { latitude, longitude, timezone = 'auto' } = params;
  const query = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    daily: [
      'river_discharge',
      'river_discharge_mean',
      'river_discharge_median',
      'river_discharge_max',
      'river_discharge_min',
      'river_discharge_p25',
      'river_discharge_p75',
    ].join(','),
    past_days: '14',
    forecast_days: '7',
    timezone,
    cell_selection: 'land',
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`https://flood-api.open-meteo.com/v1/flood?${query.toString()}`, {
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Open-Meteo Flood API error: ${response.status}`);

    const raw = await response.json();
    const daily = raw.daily ?? {};
    const times: unknown[] = Array.isArray(daily.time) ? daily.time : [];
    const days: RiverDischargeDay[] = times.map((time, index) => ({
      date: String(time),
      discharge: finiteOrNull(daily.river_discharge?.[index]),
      mean: finiteOrNull(daily.river_discharge_mean?.[index]),
      median: finiteOrNull(daily.river_discharge_median?.[index]),
      max: finiteOrNull(daily.river_discharge_max?.[index]),
      min: finiteOrNull(daily.river_discharge_min?.[index]),
      p25: finiteOrNull(daily.river_discharge_p25?.[index]),
      p75: finiteOrNull(daily.river_discharge_p75?.[index]),
    }));

    const today = localDateKey(timezone);
    const todayIndex = Math.max(0, days.findIndex(day => day.date >= today));
    const recentDays = days.slice(Math.max(0, todayIndex - 7), todayIndex);
    const currentDay = days[todayIndex] ?? null;
    const futureDays = days.slice(todayIndex, Math.min(days.length, todayIndex + 7));

    const recentValues = recentDays
      .map(day => day.discharge)
      .filter((value): value is number => value !== null && Number.isFinite(value));
    const recent7DayMedianM3s = median(recentValues);
    const recent7DayMaxM3s = recentValues.length ? Math.max(...recentValues) : null;
    const currentDischargeM3s = currentDay?.discharge ?? currentDay?.mean ?? null;

    let upcoming7DayPeakM3s: number | null = null;
    let upcomingPeakDate: string | null = null;
    for (const day of futureDays) {
      const candidate = day.max ?? day.discharge ?? day.mean;
      if (candidate !== null && (upcoming7DayPeakM3s === null || candidate > upcoming7DayPeakM3s)) {
        upcoming7DayPeakM3s = candidate;
        upcomingPeakDate = day.date;
      }
    }

    return {
      provider: 'open_meteo_glofas',
      sourceLabel: 'Open-Meteo Flood API / GloFAS v4',
      modelLabel: 'GloFAS v4 seamless river discharge',
      isOfficialAlert: false,
      isFlashFloodNowcast: false,
      resolutionKm: 5,
      requestedLatitude: latitude,
      requestedLongitude: longitude,
      gridLatitude: finiteOrNull(raw.latitude),
      gridLongitude: finiteOrNull(raw.longitude),
      riverSelectionCaveat: 'GloFAS entrega el caudal del río más grande representado en una celda aproximada de 5 km. Puede no corresponder al cauce más cercano ni detectar inundación urbana repentina.',
      currentDischargeM3s,
      recent7DayMedianM3s,
      recent7DayMaxM3s,
      upcoming7DayPeakM3s,
      upcomingPeakDate,
      currentVsRecentMedianRatio: ratio(currentDischargeM3s, recent7DayMedianM3s),
      peakVsRecentMedianRatio: ratio(upcoming7DayPeakM3s, recent7DayMedianM3s),
      trend: deriveTrend(futureDays.map(day => day.discharge ?? day.mean)),
      days,
    };
  } finally {
    clearTimeout(timeout);
  }
}

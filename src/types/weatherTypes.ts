export type WeatherProfile = 'person' | 'field_tech';

export type WeatherCondition =
  | 'sunny'
  | 'partly_cloudy'
  | 'cloudy'
  | 'fog'
  | 'rain'
  | 'snow'
  | 'storm'
  | 'wind'
  | 'cold'
  | 'hot'
  | 'night';

export type WeatherPhenomenonKind =
  | 'none'
  | 'drizzle'
  | 'freezing_drizzle'
  | 'rain'
  | 'freezing_rain'
  | 'showers'
  | 'snow'
  | 'storm'
  | 'unknown';

export type WeatherPhenomenonIntensity = 'none' | 'trace' | 'light' | 'moderate' | 'heavy' | 'violent';

export interface WeatherPhenomenonSemantics {
  weatherCode?: number;
  conditionLabel?: string;
  precipitationKind?: WeatherPhenomenonKind;
  precipitationIntensity?: WeatherPhenomenonIntensity;
}

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface WeatherLocation {
  id: string;
  name: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface CurrentWeather extends WeatherPhenomenonSemantics {
  temperatureC: number;
  feelsLikeC: number;
  humidity: number;
  windSpeedKmh: number;
  windGustKmh: number;
  pressureHpa: number;
  cloudCover: number;
  precipitationMm: number;
  uvIndex: number;
  condition: WeatherCondition;
  updatedAt: string;
  isDay?: boolean;
}

export interface HourlyForecast extends WeatherPhenomenonSemantics {
  time: string;
  temperatureC: number;
  precipitationProbability: number;
  precipitationMm: number;
  windSpeedKmh: number;
  humidity: number;
  cloudCover: number;
  uvIndex: number;
  condition: WeatherCondition;
}

export interface DailyForecast extends WeatherPhenomenonSemantics {
  date: string;
  minTempC: number;
  maxTempC: number;
  precipitationProbability: number;
  windMaxKmh: number;
  uvMax: number;
  sunrise: string;
  sunset: string;
  condition: WeatherCondition;
}

export interface ClimateRisk {
  id: string;
  label: string;
  level: RiskLevel;
  description: string;
  recommendation: string;
  affectedProfile: WeatherProfile;
}

export interface SkyCoreSummary {
  generalSummary: string;
  mainRecommendation: string;
  warning?: string;
  bestWindow: string;
  widgetShortText: string;
}

export type WidgetType =
  | 'skyorb_mini'
  | 'skypanel'
  | 'field_command'
  | 'cinematic_bar';

export interface WidgetPreviewState {
  widgetType: WidgetType;
  locationName: string;
  temperatureC: number;
  condition: WeatherCondition;
  riskLevel: RiskLevel;
  shortNarrative: string;
  bestWindow: string;
  nextHours: HourlyForecast[];
  lastUpdated: string;
}

export type WeatherDataMode = 'mock' | 'live' | 'cached' | 'fallback';

export type WeatherProvider = 'open_meteo' | 'mock';

export type WeatherFetchStatus =
  | 'idle'
  | 'loading'
  | 'success'
  | 'cached'
  | 'fallback'
  | 'error';

export interface WeatherSourceState {
  provider: WeatherProvider;
  mode: WeatherDataMode;
  status: WeatherFetchStatus;
  lastUpdated?: string;
  errorMessage?: string;
  isLive: boolean;
}

export interface LocationSearchResult {
  id: number | string;
  name: string;
  region?: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone?: string;
  source: 'open_meteo_geocoding' | 'mock';
}

export interface OpenMeteoRawResponse {
  latitude: number;
  longitude: number;
  generationtime_ms?: number;
  utc_offset_seconds?: number;
  timezone?: string;
  timezone_abbreviation?: string;
  elevation?: number;
  current?: Record<string, any>;
  hourly?: Record<string, any[]>;
  daily?: Record<string, any[]>;
}

export type SkyCoreRiskCategory =
  | 'general'
  | 'temperature'
  | 'cold'
  | 'heat'
  | 'humidity'
  | 'wind'
  | 'gusts'
  | 'rain'
  | 'storm'
  | 'uv'
  | 'visibility'
  | 'field_work'
  | 'electrical_work'
  | 'inspection'
  | 'solar_pv';

export type SkyCoreDecision =
  | 'optimal'
  | 'favorable'
  | 'caution'
  | 'not_recommended'
  | 'critical';

export interface SkyCoreRiskScore {
  category: SkyCoreRiskCategory;
  score: number;
  level: RiskLevel;
  label: string;
  reason: string;
  recommendation: string;
  affectedProfile: WeatherProfile;
  priority: number;
}

export interface SkyCoreTimeWindow {
  id: string;
  label: string;
  startTime: string;
  endTime: string;
  decision: SkyCoreDecision;
  score: number;
  reason: string;
  recommendedFor: WeatherProfile;
}

export interface SkyCoreRecommendation {
  id: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  profile: WeatherProfile;
  category: SkyCoreRiskCategory;
  actionLabel?: string;
}

export interface AdvancedSkyCoreAnalysis {
  profile: WeatherProfile;
  globalDecision: SkyCoreDecision;
  globalRiskLevel: RiskLevel;
  globalScore: number;
  riskScores: SkyCoreRiskScore[];
  bestWindow?: SkyCoreTimeWindow;
  cautionWindows: SkyCoreTimeWindow[];
  recommendations: SkyCoreRecommendation[];
  widgetShortText: string;
  technicalSummary?: string;
  personSummary?: string;
}

export type SmartAlertSeverity =
  | 'info'
  | 'watch'
  | 'warning'
  | 'critical';

export type WeatherProfile = 'person' | 'field_tech';

export type WeatherCondition =
  | 'sunny'
  | 'partly_cloudy'
  | 'cloudy'
  | 'rain'
  | 'storm'
  | 'wind'
  | 'cold'
  | 'hot'
  | 'night';

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

export interface CurrentWeather {
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
}

export interface HourlyForecast {
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

export interface DailyForecast {
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

export type SmartAlertCategory =
  | 'rain'
  | 'wind'
  | 'gusts'
  | 'uv'
  | 'cold'
  | 'heat'
  | 'humidity'
  | 'storm'
  | 'field_work'
  | 'electrical_work'
  | 'solar_pv'
  | 'general';

export type SmartAlertStatus =
  | 'active'
  | 'upcoming'
  | 'expired'
  | 'dismissed';

export interface SmartWeatherAlert {
  id: string;
  title: string;
  message: string;
  severity: SmartAlertSeverity;
  category: SmartAlertCategory;
  profile: WeatherProfile;
  status: SmartAlertStatus;
  startsAt?: string;
  endsAt?: string;
  timeLabel: string;
  actionLabel?: string;
  recommendation: string;
  source: 'skycore';
  createdAt: string;
  priority: number;
  relatedRiskLevel?: RiskLevel;
}

export type OrbiNotificationPermissionState =
  | 'unknown'
  | 'granted'
  | 'denied'
  | 'prompt'
  | 'unsupported';

export type OrbiNotificationChannel =
  | 'weather_alerts'
  | 'field_alerts'
  | 'system_status';

export interface OrbiNotificationCandidate {
  id: string;
  title: string;
  body: string;
  channel: OrbiNotificationChannel;
  severity: SmartAlertSeverity;
  profile: WeatherProfile;
  alertId?: string;
  category?: SmartAlertCategory;
  createdAt: string;
  scheduledFor?: string;
  dedupKey: string;
  source: 'skycore_alert';
}

export interface OrbiNotificationHistoryItem {
  id: string;
  title: string;
  body: string;
  channel: OrbiNotificationChannel;
  severity: SmartAlertSeverity;
  profile: WeatherProfile;
  alertId?: string;
  createdAt: string;
  sentAt: string;
  dedupKey: string;
}

export type QuietHoursMode =
  | 'disabled'
  | 'enabled'
  | 'critical_only';

export interface QuietHoursSettings {
  enabled: boolean;
  mode: QuietHoursMode;
  startTime: string;
  endTime: string;
  allowCritical: boolean;
}

export interface NotificationFrequencySettings {
  maxPersonPerDay: number;
  maxFieldPerDay: number;
  minMinutesBetweenSimilar: number;
  minMinutesBetweenAny: number;
}

export interface QuietHoursDecision {
  allowed: boolean;
  shouldDefer: boolean;
  reason: string;
}

export interface FrequencyDecision {
  allowed: boolean;
  reason: string;
}

export interface OrbiBlockedNotificationLog {
  id: string;
  title: string;
  body: string;
  profile: WeatherProfile;
  severity: SmartAlertSeverity;
  reason: string;
  blockedAt: string;
  type: 'quiet_hours' | 'frequency' | 'demo' | 'outdated' | 'fallback';
}

export type ScheduledAlertStatus =
  | 'scheduled'
  | 'deferred'
  | 'sent'
  | 'blocked'
  | 'expired'
  | 'cancelled';

export type ScheduledSummaryType =
  | 'person_morning'
  | 'field_pre_shift'
  | 'evening_preview';

export interface ScheduledAlertItem {
  id: string;
  candidateId: string;
  alertId?: string;
  title: string;
  body: string;
  profile: WeatherProfile;
  severity: SmartAlertSeverity;
  category?: SmartAlertCategory;
  status: ScheduledAlertStatus;
  scheduledFor: string;
  createdAt: string;
  reason: string;
  source: 'skycore_scheduler';
}

export interface ScheduledSummarySettings {
  personMorningEnabled: boolean;
  personMorningTime: string;
  fieldPreShiftEnabled: boolean;
  fieldPreShiftTime: string;
  eveningPreviewEnabled: boolean;
  eveningPreviewTime: string;
}

export const DEFAULT_SUMMARY_SETTINGS: ScheduledSummarySettings = {
  personMorningEnabled: true,
  personMorningTime: '07:30',
  fieldPreShiftEnabled: false,
  fieldPreShiftTime: '08:00',
  eveningPreviewEnabled: false,
  eveningPreviewTime: '20:00',
};

export type PreferredThemeMode =
  | 'auto'
  | 'dark'
  | 'light';

export type PreferredWidgetVariant =
  | 'skyorb_mini'
  | 'skypanel'
  | 'field_command'
  | 'cinematic_bar'
  | 'skyorb_2x2'
  | 'skyorb_4x2'
  | 'skyorb_4x4';

export type AlertSensitivityMode =
  | 'low'
  | 'normal'
  | 'high';

export interface PreferredLocationSnapshot {
  id: string;
  name: string;
  region?: string;
  country: string;
  latitude?: number;
  longitude?: number;
  source: 'manual' | 'gps' | 'demo';
  savedAt: string;
}

export interface OrbiClimaUserPreferences {
  version: string;
  preferredProfile: WeatherProfile;
  preferredThemeMode: PreferredThemeMode;
  preferredWidgetVariant: PreferredWidgetVariant;
  alertSensitivity: AlertSensitivityMode;
  preferredLocation?: PreferredLocationSnapshot;
  favoriteAlertCategories: SmartAlertCategory[];
  morningSummaryEnabled: boolean;
  fieldSummaryEnabled: boolean;
  quietHoursEnabled: boolean;
  lastUpdated: string;
}

export interface WeatherMemoryLocationUse {
  id: string;
  name: string;
  region?: string;
  country: string;
  source: 'manual' | 'gps_confirmed' | 'demo';
  useCount: number;
  lastUsedAt: string;
}

export interface WeatherMemoryProfileUse {
  profile: WeatherProfile;
  useCount: number;
  lastUsedAt: string;
}

export interface WeatherMemoryWidgetUse {
  variant: PreferredWidgetVariant;
  useCount: number;
  lastUsedAt: string;
}

export interface WeatherMemoryInsight {
  id: string;
  title: string;
  message: string;
  type: 'location' | 'profile' | 'widget' | 'alert' | 'scheduler';
  createdAt: string;
}

export interface OrbiWeatherMemory {
  version: string;
  locations: WeatherMemoryLocationUse[];
  profileUses: WeatherMemoryProfileUse[];
  widgetUses: WeatherMemoryWidgetUse[];
  insights: WeatherMemoryInsight[];
  lastUpdated: string;
}

export interface SavedWeatherLocation {
  id: string;
  name: string;
  label: string; // editable custom name
  type: 'home' | 'work' | 'solar_park' | 'custom';
  latitude: number;
  longitude: number;
  region: string;
  country: string;
  createdAt: string;
  updatedAt: string;
  lastUsedAt: string;
  source: 'gps' | 'manual' | 'imported';
  isFavorite?: boolean;
}








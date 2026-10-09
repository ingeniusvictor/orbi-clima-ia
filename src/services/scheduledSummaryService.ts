import { 
  CurrentWeather, 
  DailyForecast, 
  SmartWeatherAlert, 
  AdvancedSkyCoreAnalysis, 
  OrbiNotificationCandidate, 
  ScheduledSummarySettings, 
  DEFAULT_SUMMARY_SETTINGS 
} from '../types/weatherTypes';
import { 
  buildPersonMorningBody, 
  buildFieldPreShiftBody, 
  buildEveningPreviewBody 
} from '../utils/summaryNotificationBuilder';

const SETTINGS_KEY = 'orbi_clima_summary_settings_v1';

export function loadScheduledSummarySettings(): ScheduledSummarySettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SUMMARY_SETTINGS;
    return { ...DEFAULT_SUMMARY_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Error loading summary settings', e);
    return DEFAULT_SUMMARY_SETTINGS;
  }
}

export function saveScheduledSummarySettings(settings: ScheduledSummarySettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    window.dispatchEvent(new Event('orbi-summary-settings-changed'));
  } catch (e) {
    console.error('Error saving summary settings', e);
  }
}

export function buildPersonMorningSummaryNotification(params: {
  current: CurrentWeather;
  daily: DailyForecast[];
  alerts: SmartWeatherAlert[];
  advancedAnalysis: AdvancedSkyCoreAnalysis;
}): OrbiNotificationCandidate {
  const body = buildPersonMorningBody({
    current: params.current,
    alerts: params.alerts,
    advancedAnalysis: params.advancedAnalysis
  });

  const todayStr = new Date().toISOString().split('T')[0];

  return {
    id: `summary_person_morning_${Date.now()}`,
    title: 'ORBI Clima IA — Resumen de la mañana',
    body,
    channel: 'weather_alerts',
    severity: 'info',
    profile: 'person',
    createdAt: new Date().toISOString(),
    dedupKey: `summary_person_morning_${todayStr}`,
    source: 'skycore_alert'
  };
}

export function buildFieldPreShiftSummaryNotification(params: {
  current: CurrentWeather;
  daily: DailyForecast[];
  alerts: SmartWeatherAlert[];
  advancedAnalysis: AdvancedSkyCoreAnalysis;
}): OrbiNotificationCandidate {
  const body = buildFieldPreShiftBody({
    current: params.current,
    alerts: params.alerts,
    advancedAnalysis: params.advancedAnalysis
  });

  const todayStr = new Date().toISOString().split('T')[0];

  return {
    id: `summary_field_pre_shift_${Date.now()}`,
    title: 'ORBI Técnico Terreno — Pre-jornada',
    body,
    channel: 'field_alerts',
    severity: 'info',
    profile: 'field_tech',
    createdAt: new Date().toISOString(),
    dedupKey: `summary_field_pre_shift_${todayStr}`,
    source: 'skycore_alert'
  };
}

export function buildEveningPreviewNotification(params: {
  current: CurrentWeather;
  daily: DailyForecast[];
  alerts: SmartWeatherAlert[];
  advancedAnalysis: AdvancedSkyCoreAnalysis;
}): OrbiNotificationCandidate {
  const body = buildEveningPreviewBody({
    daily: params.daily,
    alerts: params.alerts,
    advancedAnalysis: params.advancedAnalysis
  });

  const todayStr = new Date().toISOString().split('T')[0];

  return {
    id: `summary_evening_preview_${Date.now()}`,
    title: 'ORBI Clima IA — Vista previa nocturna',
    body,
    channel: 'weather_alerts',
    severity: 'info',
    profile: 'person',
    createdAt: new Date().toISOString(),
    dedupKey: `summary_evening_preview_${todayStr}`,
    source: 'skycore_alert'
  };
}

import { AdvancedSkyCoreAnalysis, WeatherProfile, WeatherDataMode } from '../types/weatherTypes';

export interface OrbiWidgetContract {
  version: string;
  appName: string;
  engineName: string;
  tagline: string;
  locationName: string;
  temperatureC: number;
  feelsLikeC: number;
  conditionLabel: string;
  conditionCode: string;
  globalDecisionLabel: string;
  riskLevel: string;
  mainRiskLabel: string;
  shortNarrative: string;
  bestWindow: string;
  sourceMode: string;
  lastUpdated: string;
  profile: string;

  humidity: number;
  windSpeedKmh: number;
  windGustKmh: number;
  uvIndex: number;
  rainProbability: number;
  technicalRecommendation: string;
  personRecommendation: string;

  // Next 3 hours — retained for compact widgets and fallback.
  nextHour1Label: string;
  nextHour1Temp: number;
  nextHour2Label: string;
  nextHour2Temp: number;
  nextHour3Label: string;
  nextHour3Temp: number;

  // OC-22Q orbital forecast satellites.
  forecastDay1Label: string;
  forecastDay1MinC: number;
  forecastDay1MaxC: number;
  forecastDay1ConditionCode: string;
  forecastDay1ConditionLabel: string;
  forecastDay2Label: string;
  forecastDay2MinC: number;
  forecastDay2MaxC: number;
  forecastDay2ConditionCode: string;
  forecastDay2ConditionLabel: string;
  forecastDay3Label: string;
  forecastDay3MinC: number;
  forecastDay3MaxC: number;
  forecastDay3ConditionCode: string;
  forecastDay3ConditionLabel: string;

  visualVariantHint: string;

  mainAlertTitle: string;
  mainAlertSeverity: string;
  mainAlertMessage: string;
  mainAlertTimeLabel: string;
}

function readCachedDailyForecast(): any[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem('orbi_clima_last_weather_bundle_v1');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const daily = parsed?.data?.daily;
    return Array.isArray(daily) ? daily : [];
  } catch {
    return [];
  }
}

function formatDayLabel(dateValue: string | undefined, index: number, fallback: string) {
  if (index === 0) return 'HOY';
  if (!dateValue) return fallback.toUpperCase();
  try {
    const date = new Date(`${dateValue}T12:00:00`);
    return date
      .toLocaleDateString('es-CL', { weekday: 'short' })
      .replace('.', '')
      .slice(0, 3)
      .toUpperCase();
  } catch {
    return fallback.toUpperCase();
  }
}

export function buildAndroidWidgetContract(params: {
  locationName: string;
  currentTemperatureC: number;
  conditionLabel: string;
  conditionCode: string;
  advancedAnalysis: AdvancedSkyCoreAnalysis;
  sourceMode: WeatherDataMode;
  lastUpdated: string;
  profile: WeatherProfile;
  currentFeelsLikeC?: number;
  currentHumidity?: number;
  currentWindSpeedKmh?: number;
  currentWindGustKmh?: number;
  currentUvIndex?: number;
  hourlyList?: any[];
  dailyList?: any[];
  visualVariantHint?: string;
  mainAlertTitle?: string;
  mainAlertSeverity?: string;
  mainAlertMessage?: string;
  mainAlertTimeLabel?: string;
}): OrbiWidgetContract {
  const mapDecisionToHumanLabel = (decision: string) => {
    switch (decision) {
      case 'optimal': return 'Óptimo';
      case 'favorable': return 'Favorable';
      case 'caution': return 'Precaución';
      case 'not_recommended': return 'No Recomendado';
      case 'critical': return 'Crítico';
      default: return 'Variable';
    }
  };

  const mainRisk = params.advancedAnalysis.riskScores[0]?.label ?? 'Condición estable';

  const list = params.hourlyList || [];
  const h1 = list[1] || { time: '10h', temperatureC: 18, precipitationProbability: 10 };
  const h2 = list[2] || { time: '11h', temperatureC: 19, precipitationProbability: 15 };
  const h3 = list[3] || { time: '12h', temperatureC: 20, precipitationProbability: 20 };

  const formatHourLabel = (timeStr: string) => {
    if (!timeStr) return '';
    if (timeStr.includes(':')) return timeStr.split(':')[0] + 'h';
    if (timeStr.includes(' ')) return timeStr.split(' ')[0];
    return timeStr.endsWith('h') ? timeStr : timeStr + 'h';
  };

  // Weather Truth fidelity: App historically supplied a family label to this
  // bridge. Prefer the exact current-hour label when it is more specific.
  const genericLabels = new Set([
    'soleado', 'parcial', 'nublado', 'lluvia', 'tormenta', 'ventoso',
    'fresco', 'frío', 'frio', 'caluroso', 'despejado', 'estable',
  ]);
  const requestedLabel = params.conditionLabel?.trim() || '';
  const hourlyExactLabel = list[0]?.conditionLabel?.trim() || '';
  const exactConditionLabel =
    hourlyExactLabel && (!requestedLabel || genericLabels.has(requestedLabel.toLowerCase()))
      ? hourlyExactLabel
      : requestedLabel || hourlyExactLabel || 'Estable';

  // Daily forecast comes from the caller when available; otherwise use the
  // same cached weather bundle that hydrates the app. If neither exists, the
  // satellite layer degrades to the certified next-hour data.
  const cachedDaily = params.dailyList?.length ? params.dailyList : readCachedDailyForecast();
  const dailyFallback = [h1, h2, h3].map((hour, index) => ({
    date: '',
    minTempC: hour.temperatureC,
    maxTempC: hour.temperatureC,
    condition: hour.condition || params.conditionCode,
    conditionLabel: hour.conditionLabel || exactConditionLabel,
    fallbackLabel: formatHourLabel(hour.time) || `+${index + 1}H`,
  }));
  const d1 = cachedDaily[0] || dailyFallback[0];
  const d2 = cachedDaily[1] || dailyFallback[1];
  const d3 = cachedDaily[2] || dailyFallback[2];

  const techRec = params.advancedAnalysis.recommendations.find(r => r.profile === 'field_tech')?.message
    || params.advancedAnalysis.technicalSummary
    || 'Siga protocolos estándar de terreno.';

  const personRec = params.advancedAnalysis.recommendations.find(r => r.profile === 'person')?.message
    || params.advancedAnalysis.personSummary
    || 'Día favorable para tus actividades.';

  return {
    version: '1.3.0',
    appName: 'ORBI Clima IA',
    engineName: 'Powered by ORBI SkyCore™',
    tagline: 'Tu núcleo climático inteligente.',
    locationName: params.locationName,
    temperatureC: Math.round(params.currentTemperatureC),
    feelsLikeC: Math.round(params.currentFeelsLikeC ?? params.currentTemperatureC),
    conditionLabel: exactConditionLabel,
    conditionCode: params.conditionCode,
    globalDecisionLabel: mapDecisionToHumanLabel(params.advancedAnalysis.globalDecision),
    riskLevel: params.advancedAnalysis.globalRiskLevel,
    mainRiskLabel: mainRisk,
    shortNarrative: params.advancedAnalysis.widgetShortText || params.advancedAnalysis.personSummary || 'Condiciones estables.',
    bestWindow: params.advancedAnalysis.bestWindow ? `${params.advancedAnalysis.bestWindow.startTime}–${params.advancedAnalysis.bestWindow.endTime}` : 'Variable',
    sourceMode: params.sourceMode,
    lastUpdated: params.lastUpdated || new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
    profile: params.profile,

    humidity: params.currentHumidity ?? 50,
    windSpeedKmh: Math.round(params.currentWindSpeedKmh ?? 10),
    windGustKmh: Math.round(params.currentWindGustKmh ?? 15),
    uvIndex: Math.round(params.currentUvIndex ?? 1),
    rainProbability: h1.precipitationProbability ?? 0,
    technicalRecommendation: techRec,
    personRecommendation: personRec,

    nextHour1Label: formatHourLabel(h1.time),
    nextHour1Temp: Math.round(h1.temperatureC),
    nextHour2Label: formatHourLabel(h2.time),
    nextHour2Temp: Math.round(h2.temperatureC),
    nextHour3Label: formatHourLabel(h3.time),
    nextHour3Temp: Math.round(h3.temperatureC),

    forecastDay1Label: formatDayLabel(d1.date, 0, d1.fallbackLabel || 'HOY'),
    forecastDay1MinC: Math.round(d1.minTempC ?? d1.temperatureC ?? params.currentTemperatureC),
    forecastDay1MaxC: Math.round(d1.maxTempC ?? d1.temperatureC ?? params.currentTemperatureC),
    forecastDay1ConditionCode: d1.condition || params.conditionCode,
    forecastDay1ConditionLabel: d1.conditionLabel || exactConditionLabel,
    forecastDay2Label: formatDayLabel(d2.date, 1, d2.fallbackLabel || '+2H'),
    forecastDay2MinC: Math.round(d2.minTempC ?? d2.temperatureC ?? params.currentTemperatureC),
    forecastDay2MaxC: Math.round(d2.maxTempC ?? d2.temperatureC ?? params.currentTemperatureC),
    forecastDay2ConditionCode: d2.condition || params.conditionCode,
    forecastDay2ConditionLabel: d2.conditionLabel || exactConditionLabel,
    forecastDay3Label: formatDayLabel(d3.date, 2, d3.fallbackLabel || '+3H'),
    forecastDay3MinC: Math.round(d3.minTempC ?? d3.temperatureC ?? params.currentTemperatureC),
    forecastDay3MaxC: Math.round(d3.maxTempC ?? d3.temperatureC ?? params.currentTemperatureC),
    forecastDay3ConditionCode: d3.condition || params.conditionCode,
    forecastDay3ConditionLabel: d3.conditionLabel || exactConditionLabel,

    visualVariantHint: params.visualVariantHint ?? 'skypanel',

    mainAlertTitle: params.mainAlertTitle || (params.profile === 'field_tech' ? 'Sin alertas operativas críticas' : 'Sin alertas relevantes'),
    mainAlertSeverity: params.mainAlertSeverity || 'info',
    mainAlertMessage: params.mainAlertMessage || 'Condición estable',
    mainAlertTimeLabel: params.mainAlertTimeLabel || 'Hoy'
  };
}

const LAST_SYNC_KEY = 'orbi_skyorb_widget_last_sync';
const SYNCED_CONTRACT_KEY = 'orbi_skyorb_widget_synced_contract';

export interface WidgetSyncStatus {
  lastSyncTime: string | null;
  bridgeAvailable: boolean;
  contract: OrbiWidgetContract | null;
  platformMode: 'Web Preview' | 'Android Native';
  widgetStatus: 'Planned' | 'Active' | 'Needs Android Build';
  statusLabel: 'Ready for Android Studio' | 'Synced' | 'Fallback';
}

export function getWidgetSyncStatus(): WidgetSyncStatus {
  const isCapacitor = typeof window !== 'undefined' && (window as any).Capacitor !== undefined;
  const bridgeAvailable = isCapacitor && (window as any).Capacitor?.Plugins?.OrbiWidgetBridge !== undefined;

  const lastSync = localStorage.getItem(LAST_SYNC_KEY);
  const syncedContractStr = localStorage.getItem(SYNCED_CONTRACT_KEY);
  let contract: OrbiWidgetContract | null = null;

  if (syncedContractStr) {
    try {
      contract = JSON.parse(syncedContractStr);
    } catch (e) {
      console.error(e);
    }
  }

  return {
    lastSyncTime: lastSync,
    bridgeAvailable,
    contract,
    platformMode: isCapacitor ? 'Android Native' : 'Web Preview',
    widgetStatus: bridgeAvailable ? 'Active' : isCapacitor ? 'Needs Android Build' : 'Planned',
    statusLabel: bridgeAvailable ? 'Synced' : isCapacitor ? 'Fallback' : 'Ready for Android Studio',
  };
}

export async function syncAndroidWidgetContract(contract: OrbiWidgetContract) {
  const timeStr = new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  localStorage.setItem(LAST_SYNC_KEY, timeStr);
  localStorage.setItem(SYNCED_CONTRACT_KEY, JSON.stringify(contract));

  try {
    const isCapacitor = typeof window !== 'undefined' && (window as any).Capacitor !== undefined;
    if (!isCapacitor) {
      console.log('[ORBI Widget Sync] Web simulation successful', contract);
      return;
    }

    const bridge = (window as any).Capacitor?.Plugins?.OrbiWidgetBridge;
    if (bridge && typeof bridge.saveWidgetContract === 'function') {
      await bridge.saveWidgetContract({
        contractJson: JSON.stringify(contract),
      });
      console.log('[ORBI Widget Sync] Synced with Android via Capacitor Plugin');
    } else {
      console.warn('[ORBI Widget Sync] Capacitor bridge is registered but OrbiWidgetBridge is not loaded yet');
    }
  } catch (error) {
    console.warn('[ORBI Widget Sync] Sync skipped safely:', error);
  }
}
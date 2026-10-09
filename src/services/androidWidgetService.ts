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

  // New fields for v1.1.0 (Refinements and technical support)
  humidity: number;
  windSpeedKmh: number;
  windGustKmh: number;
  uvIndex: number;
  rainProbability: number;
  technicalRecommendation: string;
  personRecommendation: string;

  // Next 3 hours
  nextHour1Label: string;
  nextHour1Temp: number;
  nextHour2Label: string;
  nextHour2Temp: number;
  nextHour3Label: string;
  nextHour3Temp: number;

  visualVariantHint: string;

  // New fields for v1.2.0 (Smart Alerts)
  mainAlertTitle: string;
  mainAlertSeverity: string;
  mainAlertMessage: string;
  mainAlertTimeLabel: string;
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

  // Extract next hours for visual micro timeline
  const list = params.hourlyList || [];
  const h1 = list[1] || { time: '10h', temperatureC: 18, precipitationProbability: 10 };
  const h2 = list[2] || { time: '11h', temperatureC: 19, precipitationProbability: 15 };
  const h3 = list[3] || { time: '12h', temperatureC: 20, precipitationProbability: 20 };

  const formatHourLabel = (timeStr: string) => {
    if (!timeStr) return '';
    // If it contains a space or colon, try to format
    if (timeStr.includes(':')) {
      return timeStr.split(':')[0] + 'h';
    }
    if (timeStr.includes(' ')) {
      return timeStr.split(' ')[0];
    }
    return timeStr + 'h';
  };

  const techRec = params.advancedAnalysis.recommendations.find(r => r.profile === 'field_tech')?.message 
    || params.advancedAnalysis.technicalSummary 
    || 'Siga protocolos estándar de terreno.';
    
  const personRec = params.advancedAnalysis.recommendations.find(r => r.profile === 'person')?.message 
    || params.advancedAnalysis.personSummary 
    || 'Día favorable para tus actividades.';

  return {
    version: '1.1.0',
    appName: 'ORBI Clima IA',
    engineName: 'Powered by ORBI SkyCore™',
    tagline: 'Tu núcleo climático inteligente.',
    locationName: params.locationName,
    temperatureC: Math.round(params.currentTemperatureC),
    feelsLikeC: Math.round(params.currentFeelsLikeC ?? params.currentTemperatureC),
    conditionLabel: params.conditionLabel,
    conditionCode: params.conditionCode,
    globalDecisionLabel: mapDecisionToHumanLabel(params.advancedAnalysis.globalDecision),
    riskLevel: params.advancedAnalysis.globalRiskLevel,
    mainRiskLabel: mainRisk,
    shortNarrative: params.advancedAnalysis.widgetShortText || params.advancedAnalysis.personSummary || 'Condiciones estables.',
    bestWindow: params.advancedAnalysis.bestWindow ? `${params.advancedAnalysis.bestWindow.startTime}–${params.advancedAnalysis.bestWindow.endTime}` : 'Variable',
    sourceMode: params.sourceMode,
    lastUpdated: params.lastUpdated || new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
    profile: params.profile,

    // Metric fields
    humidity: params.currentHumidity ?? 50,
    windSpeedKmh: Math.round(params.currentWindSpeedKmh ?? 10),
    windGustKmh: Math.round(params.currentWindGustKmh ?? 15),
    uvIndex: Math.round(params.currentUvIndex ?? 1),
    rainProbability: h1.precipitationProbability ?? 0,
    technicalRecommendation: techRec,
    personRecommendation: personRec,

    // Timelines
    nextHour1Label: formatHourLabel(h1.time),
    nextHour1Temp: Math.round(h1.temperatureC),
    nextHour2Label: formatHourLabel(h2.time),
    nextHour2Temp: Math.round(h2.temperatureC),
    nextHour3Label: formatHourLabel(h3.time),
    nextHour3Temp: Math.round(h3.temperatureC),

    visualVariantHint: params.visualVariantHint ?? 'skypanel',

    // New alert fields
    mainAlertTitle: params.mainAlertTitle || (params.profile === 'field_tech' ? 'Sin alertas operativas críticas' : 'Sin alertas relevantes'),
    mainAlertSeverity: params.mainAlertSeverity || 'info',
    mainAlertMessage: params.mainAlertMessage || 'Condición estable',
    mainAlertTimeLabel: params.mainAlertTimeLabel || 'Hoy'
  };
}

// Global storage keys for diagnostics
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

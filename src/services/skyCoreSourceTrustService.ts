import { WeatherLocation, WeatherSourceState } from '../types/weatherTypes';

export interface WeatherProvider {
  providerId: string;
  providerName: string;
  providerType: 'forecast' | 'observation' | 'climate_risk' | 'fallback';
  isFree: boolean;
  requiresApiKey: boolean;
  coverage: string;
  lastUpdated: string;
  status: 'active' | 'simulated' | 'inactive' | 'stub';
  attributionLabel: string;
}

export const OpenMeteoProviderRef: WeatherProvider = {
  providerId: 'open_meteo',
  providerName: 'Open-Meteo',
  providerType: 'forecast',
  isFree: true,
  requiresApiKey: false,
  coverage: 'Global',
  lastUpdated: 'Reciente',
  status: 'active',
  attributionLabel: 'Datos meteorológicos abiertos por Open-Meteo',
};

export const DmcChileProviderRef: WeatherProvider = {
  providerId: 'dmc_chile',
  providerName: 'Dirección Meteorológica de Chile (DMC)',
  providerType: 'observation',
  isFree: true,
  requiresApiKey: false,
  coverage: 'Nacional (Chile)',
  lastUpdated: 'Pendiente de integración verificable',
  status: 'stub',
  attributionLabel: 'Dirección Meteorológica de Chile',
};

export const RedMeteoChileProviderRef: WeatherProvider = {
  providerId: 'redmeteo_chile',
  providerName: 'RedMeteo Chile',
  providerType: 'observation',
  isFree: true,
  requiresApiKey: false,
  coverage: 'Chile',
  lastUpdated: 'Pendiente de integración verificable',
  status: 'stub',
  attributionLabel: 'Fuente comunitaria; no activa en el cálculo actual',
};

export const ArClimProviderRef: WeatherProvider = {
  providerId: 'arclim',
  providerName: 'Atlas de Riesgo Climático (ARClim)',
  providerType: 'climate_risk',
  isFree: true,
  requiresApiKey: false,
  coverage: 'Nacional (Chile)',
  lastUpdated: 'No es una fuente de tiempo actual',
  status: 'stub',
  attributionLabel: 'Ministerio del Medio Ambiente / CR2',
};

export const PremiumFutureProviderRef: WeatherProvider = {
  providerId: 'premium_future',
  providerName: 'ORBI SkyCore™ Premium Grid',
  providerType: 'forecast',
  isFree: false,
  requiresApiKey: true,
  coverage: 'Planificado',
  lastUpdated: 'No activo',
  status: 'stub',
  attributionLabel: 'No activo en producción',
};

export const registeredTrustProviders: WeatherProvider[] = [
  OpenMeteoProviderRef,
  DmcChileProviderRef,
  RedMeteoChileProviderRef,
  ArClimProviderRef,
  PremiumFutureProviderRef,
];

export interface SkyCoreTrustState {
  activePrimarySource: string;
  sourceStatus: 'live' | 'cache' | 'fallback' | 'demo';
  lastUpdatedMinutesText: string;
  dataQuality: 'Excelente' | 'Aceptable' | ' Degradada' | 'Crítica';
  confidenceLevel: 'Alta' | 'Media' | 'Baja';
  confidenceScore: number;
  userMessage: string;
  isExtensibleComparisonAvailable: boolean;
}

/**
 * Source trust describes provenance/freshness, not forecast accuracy.
 * A live response from one model is useful, but it is not evidence of
 * hyperlocal accuracy or independent multi-model agreement.
 */
export function calculateSkyCoreTrust(
  sourceState: WeatherSourceState,
  _location: WeatherLocation,
  connectionQuality: 'buena' | 'intermitente' | 'ninguna' = 'buena',
): SkyCoreTrustState {
  let activePrimarySource = 'Open-Meteo';
  let sourceStatus: SkyCoreTrustState['sourceStatus'] = 'live';
  let dataQuality: SkyCoreTrustState['dataQuality'] = 'Aceptable';
  let confidenceLevel: SkyCoreTrustState['confidenceLevel'] = 'Media';
  let confidenceScore = 78;
  let lastUpdatedMinutesText = sourceState.lastUpdated ? `actualizado ${sourceState.lastUpdated}` : 'actualización reciente';
  let userMessage = 'Datos en vivo de una fuente meteorológica real. La cobertura actual es single-source: útil para pronóstico, pero todavía sin corroboración independiente ni alertas oficiales integradas.';

  if (sourceState.provider === 'mock' || sourceState.mode === 'mock') {
    sourceStatus = 'demo';
    activePrimarySource = 'Datos Demo ORBI';
    dataQuality = 'Crítica';
    confidenceLevel = 'Baja';
    confidenceScore = 15;
    lastUpdatedMinutesText = 'simulación local';
    userMessage = 'Modo demostración. Estos valores no deben interpretarse como tiempo real ni usarse para decisiones operativas.';
  } else if (sourceState.mode === 'cached') {
    sourceStatus = 'cache';
    activePrimarySource = 'Open-Meteo (caché)';
    dataQuality = 'Aceptable';
    confidenceLevel = 'Media';
    confidenceScore = 60;
    lastUpdatedMinutesText = sourceState.lastUpdated ? `último dato ${sourceState.lastUpdated}` : 'último dato guardado';
    userMessage = 'Sin actualización en vivo. ORBI muestra el último paquete Open-Meteo guardado y debe tratarse como información potencialmente desactualizada.';
  } else if (sourceState.mode === 'fallback') {
    sourceStatus = 'fallback';
    activePrimarySource = sourceState.provider === 'mock' ? 'Fallback Demo ORBI' : 'Fallback local';
    dataQuality = ' Degradada';
    confidenceLevel = 'Baja';
    confidenceScore = 30;
    lastUpdatedMinutesText = 'sin fuente meteorológica en vivo';
    userMessage = 'Fuente en vivo no disponible. No uses este estado para decisiones críticas hasta recuperar datos meteorológicos actuales.';
  }

  if (connectionQuality === 'intermitente' && sourceStatus === 'live') {
    confidenceScore = Math.min(confidenceScore, 68);
    dataQuality = 'Aceptable';
    confidenceLevel = 'Media';
  } else if (connectionQuality === 'ninguna' && sourceStatus === 'live') {
    confidenceScore = Math.min(confidenceScore, 45);
    dataQuality = ' Degradada';
    confidenceLevel = 'Baja';
  }

  return {
    activePrimarySource,
    sourceStatus,
    lastUpdatedMinutesText,
    dataQuality,
    confidenceLevel,
    confidenceScore,
    userMessage,
    isExtensibleComparisonAvailable: false,
  };
}

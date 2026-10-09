import { WeatherLocation, WeatherSourceState } from '../types/weatherTypes';
import { LocalVerificationSummary } from './weatherVerificationService';

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
  attributionLabel: 'Pronóstico meteorológico abierto por Open-Meteo',
};

export const DmcChileProviderRef: WeatherProvider = {
  providerId: 'dmc_chile',
  providerName: 'Dirección Meteorológica de Chile (DMC)',
  providerType: 'observation',
  isFree: true,
  requiresApiKey: false,
  coverage: 'Nacional (Chile) · estaciones WIS2/SYNOP',
  lastUpdated: 'Observaciones horarias según disponibilidad de estación',
  status: 'active',
  attributionLabel: 'Observaciones oficiales DMC/MeteoChile vía WIS2/SYNOP',
};

export const RedMeteoChileProviderRef: WeatherProvider = {
  providerId: 'redmeteo_chile',
  providerName: 'RedMeteo Chile',
  providerType: 'observation',
  isFree: true,
  requiresApiKey: false,
  coverage: 'Chile',
  lastUpdated: 'No integrado',
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

export type DataVerificationQuality =
  | 'Verificada localmente'
  | 'Evidencia parcial'
  | 'Solo modelo'
  | 'Degradada'
  | 'Demo';

export interface SkyCoreTrustState {
  activePrimarySource: string;
  sourceStatus: 'live' | 'cache' | 'fallback' | 'demo';
  lastUpdatedMinutesText: string;
  dataQuality: DataVerificationQuality;
  confidenceLevel: 'Alta' | 'Media' | 'Baja' | 'Sin calibrar';
  confidenceScore: number | null;
  scoreLabel: string;
  userMessage: string;
  isExtensibleComparisonAvailable: boolean;
  verificationSamples: number;
  verificationEvidenceLabel: string;
  observedPerformanceLabel: string;
}

function measuredConfidenceLevel(summary: LocalVerificationSummary): SkyCoreTrustState['confidenceLevel'] {
  if (summary.evidenceLevel === 'insufficient' || summary.performanceScore === null) return 'Sin calibrar';
  if (summary.evidenceLevel === 'established' && summary.performanceScore >= 78) return 'Alta';
  if (summary.performanceScore >= 60) return 'Media';
  return 'Baja';
}

/**
 * Trust is intentionally split into two concepts:
 * - source/provenance/freshness;
 * - measured local verification against DMC observations.
 *
 * A live API response alone is never converted into an accuracy score.
 */
export function calculateSkyCoreTrust(
  sourceState: WeatherSourceState,
  _location: WeatherLocation,
  connectionQuality: 'buena' | 'intermitente' | 'ninguna' = 'buena',
  verification?: LocalVerificationSummary | null,
): SkyCoreTrustState {
  let activePrimarySource = 'Open-Meteo · forecast';
  let sourceStatus: SkyCoreTrustState['sourceStatus'] = 'live';
  let dataQuality: DataVerificationQuality = 'Solo modelo';
  let confidenceLevel: SkyCoreTrustState['confidenceLevel'] = 'Sin calibrar';
  let confidenceScore: number | null = null;
  let scoreLabel = 'Sin score observado';
  let lastUpdatedMinutesText = sourceState.lastUpdated
    ? `actualizado ${sourceState.lastUpdated}`
    : 'actualización reciente';
  let userMessage = 'Forecast en vivo disponible. Aún no hay suficiente historial observacional local para calificar su desempeño en esta ubicación.';
  let isExtensibleComparisonAvailable = false;
  let verificationSamples = verification?.sampleCount ?? 0;
  let verificationEvidenceLabel = verification?.evidenceLabel ?? 'Calibración pendiente';
  let observedPerformanceLabel = verification?.performanceLabel ?? 'Aún sin calificar';

  if (sourceState.provider === 'mock' || sourceState.mode === 'mock') {
    sourceStatus = 'demo';
    activePrimarySource = 'Datos Demo ORBI';
    dataQuality = 'Demo';
    confidenceLevel = 'Baja';
    confidenceScore = null;
    scoreLabel = 'No aplica';
    lastUpdatedMinutesText = 'simulación local';
    userMessage = 'Modo demostración. Estos valores no son tiempo real y no participan en la calibración meteorológica.';
    verificationSamples = 0;
    verificationEvidenceLabel = 'Sin verificación en modo demo';
    observedPerformanceLabel = 'No aplica';
  } else if (sourceState.mode === 'cached') {
    sourceStatus = 'cache';
    activePrimarySource = 'Open-Meteo · caché';
    dataQuality = 'Degradada';
    confidenceLevel = 'Baja';
    confidenceScore = null;
    scoreLabel = 'Dato no actual';
    lastUpdatedMinutesText = sourceState.lastUpdated ? `último dato ${sourceState.lastUpdated}` : 'último dato guardado';
    userMessage = 'Sin actualización en vivo. ORBI muestra el último paquete guardado; la calibración histórica no convierte un dato antiguo en una observación actual.';
  } else if (sourceState.mode === 'fallback') {
    sourceStatus = 'fallback';
    activePrimarySource = 'Fallback local';
    dataQuality = 'Degradada';
    confidenceLevel = 'Baja';
    confidenceScore = null;
    scoreLabel = 'Sin verificación actual';
    lastUpdatedMinutesText = 'sin fuente meteorológica en vivo';
    userMessage = 'Fuente en vivo no disponible. No uses este estado para decisiones críticas hasta recuperar datos meteorológicos actuales.';
  } else if (verification && verification.evidenceLevel !== 'insufficient') {
    activePrimarySource = verification.stationName
      ? `Open-Meteo + DMC ${verification.stationName}`
      : 'Open-Meteo + observación DMC';
    isExtensibleComparisonAvailable = true;
    confidenceScore = verification.performanceScore;
    scoreLabel = 'Desempeño observado';
    confidenceLevel = measuredConfidenceLevel(verification);
    observedPerformanceLabel = verification.performanceLabel;
    verificationEvidenceLabel = verification.evidenceLabel;
    dataQuality = verification.evidenceLevel === 'established' ? 'Verificada localmente' : 'Evidencia parcial';
    userMessage = verification.interpretation;
  } else if (verification && verification.sampleCount > 0) {
    activePrimarySource = verification.stationName
      ? `Open-Meteo + DMC ${verification.stationName}`
      : 'Open-Meteo + observación DMC';
    isExtensibleComparisonAvailable = true;
    dataQuality = 'Evidencia parcial';
    confidenceLevel = 'Sin calibrar';
    confidenceScore = null;
    scoreLabel = 'Muestras insuficientes';
    verificationEvidenceLabel = verification.evidenceLabel;
    observedPerformanceLabel = 'Aún sin calificar';
    userMessage = verification.interpretation;
  }

  if (connectionQuality === 'intermitente' && sourceStatus === 'live') {
    userMessage = `${userMessage} La conexión actual es intermitente, por lo que la frescura de nuevas actualizaciones puede degradarse.`;
  } else if (connectionQuality === 'ninguna' && sourceStatus === 'live') {
    dataQuality = 'Degradada';
    confidenceLevel = 'Baja';
    confidenceScore = null;
    scoreLabel = 'Sin conexión';
    userMessage = 'No hay conectividad para validar nuevas condiciones en vivo. El historial observado se conserva, pero no describe por sí solo el estado meteorológico actual.';
  }

  return {
    activePrimarySource,
    sourceStatus,
    lastUpdatedMinutesText,
    dataQuality,
    confidenceLevel,
    confidenceScore,
    scoreLabel,
    userMessage,
    isExtensibleComparisonAvailable,
    verificationSamples,
    verificationEvidenceLabel,
    observedPerformanceLabel,
  };
}

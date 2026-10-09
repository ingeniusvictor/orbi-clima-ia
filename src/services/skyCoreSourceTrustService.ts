import { WeatherSourceState } from '../types/weatherTypes';

export interface WeatherProviderReference {
  providerId: string;
  providerName: string;
  providerType: 'forecast' | 'comparison_model' | 'official_alert' | 'observation';
  coverage: string;
  status: 'active' | 'comparison' | 'planned';
  attributionLabel: string;
}

export const registeredTrustProviders: WeatherProviderReference[] = [
  {
    providerId: 'open_meteo',
    providerName: 'Open-Meteo Best Match',
    providerType: 'forecast',
    coverage: 'Global',
    status: 'active',
    attributionLabel: 'Pronóstico principal: Open-Meteo Best Match',
  },
  {
    providerId: 'ecmwf_ifs',
    providerName: 'ECMWF IFS',
    providerType: 'comparison_model',
    coverage: 'Global',
    status: 'comparison',
    attributionLabel: 'Modelo comparativo ECMWF IFS a través de Open-Meteo',
  },
  {
    providerId: 'gfs_global',
    providerName: 'NOAA GFS',
    providerType: 'comparison_model',
    coverage: 'Global',
    status: 'comparison',
    attributionLabel: 'Modelo comparativo NOAA GFS a través de Open-Meteo',
  },
  {
    providerId: 'icon_global',
    providerName: 'DWD ICON Global',
    providerType: 'comparison_model',
    coverage: 'Global',
    status: 'comparison',
    attributionLabel: 'Modelo comparativo DWD ICON a través de Open-Meteo',
  },
  {
    providerId: 'official_alerts_chile',
    providerName: 'Alertas oficiales Chile',
    providerType: 'official_alert',
    coverage: 'Chile',
    status: 'planned',
    attributionLabel: 'Capa oficial separada: DMC/SENAPRED cuando exista una fuente técnica estable y verificable',
  },
  {
    providerId: 'station_observation',
    providerName: 'Observación cercana',
    providerType: 'observation',
    coverage: 'Según disponibilidad de estación',
    status: 'planned',
    attributionLabel: 'Observación instrumental cercana; no activa aún en esta capa',
  },
];

export interface SkyCoreTrustState {
  activePrimarySource: string;
  sourceStatus: 'live' | 'cache' | 'fallback' | 'demo';
  lastUpdatedText: string;
  integrityLabel: 'En vivo' | 'Caché' | 'Respaldo' | 'Demo';
  userMessage: string;
  isModelComparisonAvailable: boolean;
}

/**
 * Describes provenance/freshness only. It intentionally does not fabricate an accuracy percentage.
 */
export function calculateSkyCoreTrust(sourceState: WeatherSourceState): SkyCoreTrustState {
  if (sourceState.provider === 'mock' || sourceState.mode === 'mock') {
    return {
      activePrimarySource: 'Datos Demo ORBI',
      sourceStatus: 'demo',
      lastUpdatedText: 'simulado',
      integrityLabel: 'Demo',
      userMessage: 'Modo demostración: estos valores no deben interpretarse como meteorología real.',
      isModelComparisonAvailable: false,
    };
  }

  if (sourceState.mode === 'cached') {
    const ageText = sourceState.ageMinutes !== undefined
      ? (sourceState.ageMinutes >= 60 ? `${Math.round(sourceState.ageMinutes / 60)} h` : `${sourceState.ageMinutes} min`)
      : undefined;
    return {
      activePrimarySource: 'Open-Meteo · caché local',
      sourceStatus: 'cache',
      lastUpdatedText: sourceState.lastUpdated ? `última carga ${sourceState.lastUpdated}${ageText ? ` · hace ${ageText}` : ''}` : 'última carga guardada',
      integrityLabel: 'Caché',
      userMessage: sourceState.isStale
        ? 'Datos guardados fuera de la ventana de frescura para condiciones actuales. Úsalos sólo como referencia histórica hasta recuperar conexión.'
        : 'Datos recientes guardados para esta misma zona. No son una actualización en vivo.',
      isModelComparisonAvailable: false,
    };
  }

  if (sourceState.mode === 'fallback') {
    return {
      activePrimarySource: 'Fuente en vivo no disponible',
      sourceStatus: 'fallback',
      lastUpdatedText: sourceState.lastUpdated ? `último estado ${sourceState.lastUpdated}` : 'sin actualización reciente',
      integrityLabel: 'Respaldo',
      userMessage: sourceState.errorMessage || 'La fuente en vivo no está disponible. ORBI no sustituye la lectura solicitada con datos simulados.',
      isModelComparisonAvailable: false,
    };
  }

  return {
    activePrimarySource: 'Open-Meteo Best Match',
    sourceStatus: 'live',
    lastUpdatedText: sourceState.lastUpdated ? `válido/actualizado ${sourceState.lastUpdated}` : 'actualización reciente',
    integrityLabel: 'En vivo',
    userMessage: 'Pronóstico modelado en vivo. La precisión local depende de resolución, topografía y disponibilidad de observaciones cercanas.',
    isModelComparisonAvailable: true,
  };
}

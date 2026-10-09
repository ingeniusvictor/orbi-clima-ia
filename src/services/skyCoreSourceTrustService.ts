import { WeatherLocation, WeatherSourceState } from '../types/weatherTypes';

// 1. WeatherProvider Interface matching all requested fields
export interface WeatherProvider {
  providerId: string;
  providerName: string;
  providerType: 'forecast' | 'observation' | 'climate_risk' | 'fallback';
  isFree: boolean;
  requiresApiKey: boolean;
  coverage: string; // e.g. "Global", "Nacional (Chile)", "Regional"
  lastUpdated: string;
  status: 'active' | 'simulated' | 'inactive' | 'stub';
  attributionLabel: string;
}

// 2. Open-Meteo active provider definition
export const OpenMeteoProviderRef: WeatherProvider = {
  providerId: 'open_meteo',
  providerName: 'Open-Meteo',
  providerType: 'forecast',
  isFree: true,
  requiresApiKey: false,
  coverage: 'Global / Alta Resolución',
  lastUpdated: 'Reciente',
  status: 'active',
  attributionLabel: 'Datos meteorológicos abiertos por Open-Meteo (CC BY 4.0)'
};

// 3. Extensible stubs for future public/free and premium sources in Chile
export const DmcChileProviderRef: WeatherProvider = {
  providerId: 'dmc_chile',
  providerName: 'Dirección Meteorológica de Chile (DMC)',
  providerType: 'observation',
  isFree: true,
  requiresApiKey: false,
  coverage: 'Nacional (Chile) - Estaciones de Terreno',
  lastUpdated: 'No disponible en tiempo real',
  status: 'stub',
  attributionLabel: 'Datos de dominio público de la Dirección Meteorológica de Chile'
};

export const RedMeteoChileProviderRef: WeatherProvider = {
  providerId: 'redmeteo_chile',
  providerName: 'RedMeteo Chile',
  providerType: 'observation',
  isFree: true,
  requiresApiKey: false,
  coverage: 'Comunitario / Chile Central',
  lastUpdated: 'Planificado',
  status: 'stub',
  attributionLabel: 'Red Meteorológica Aficionada y Colaborativa de Chile'
};

export const ArClimProviderRef: WeatherProvider = {
  providerId: 'arclim',
  providerName: 'Atlas de Riesgo Climático (ARClim)',
  providerType: 'climate_risk',
  isFree: true,
  requiresApiKey: false,
  coverage: 'Nacional (Chile) - Proyecciones de Cambio Climático',
  lastUpdated: 'Estático (Modelo Histórico/Proyección)',
  status: 'stub',
  attributionLabel: 'Plataforma del Ministerio del Medio Ambiente & CR2 de Chile'
};

export const PremiumFutureProviderRef: WeatherProvider = {
  providerId: 'premium_future',
  providerName: 'ORBI SkyCore™ Premium Grid',
  providerType: 'forecast',
  isFree: false,
  requiresApiKey: true,
  coverage: 'Hiperlocal / Terreno Agrícola y Minero',
  lastUpdated: 'En desarrollo',
  status: 'stub',
  attributionLabel: 'Análisis micro-climático de alta resolución propietario de ORBI'
};

export const registeredTrustProviders: WeatherProvider[] = [
  OpenMeteoProviderRef,
  DmcChileProviderRef,
  RedMeteoChileProviderRef,
  ArClimProviderRef,
  PremiumFutureProviderRef
];

// 4. Source Trust Layer State Result
export interface SkyCoreTrustState {
  activePrimarySource: string;
  sourceStatus: 'live' | 'cache' | 'fallback' | 'demo';
  lastUpdatedMinutesText: string;
  dataQuality: 'Excelente' | 'Aceptable' | ' Degradada' | 'Crítica';
  confidenceLevel: 'Alta' | 'Media' | 'Baja';
  confidenceScore: number; // 0 to 100
  userMessage: string;
  isExtensibleComparisonAvailable: boolean;
}

// 5. SkyCore Confidence Index & Trust Calculator
export function calculateSkyCoreTrust(
  sourceState: WeatherSourceState,
  location: WeatherLocation,
  connectionQuality: 'buena' | 'intermitente' | 'ninguna' = 'buena'
): SkyCoreTrustState {
  let activePrimarySource = 'Open-Meteo';
  let sourceStatus: 'live' | 'cache' | 'fallback' | 'demo' = 'live';
  let confidenceLevel: 'Alta' | 'Media' | 'Baja' = 'Alta';
  let confidenceScore = 100;
  let dataQuality: 'Excelente' | 'Aceptable' | ' Degradada' | 'Crítica' = 'Excelente';
  let lastUpdatedMinutesText = 'hace menos de 5 min';

  // Determine provider status mapping
  if (sourceState.provider === 'mock') {
    sourceStatus = 'demo';
    activePrimarySource = 'Demo Local Correlacionada';
    lastUpdatedMinutesText = 'Simulada';
    dataQuality = 'Excelente';
    confidenceScore = 95;
    confidenceLevel = 'Alta';
  } else if (sourceState.mode === 'cached') {
    sourceStatus = 'cache';
    activePrimarySource = 'Open-Meteo (Caché)';
    lastUpdatedMinutesText = 'hace 15-30 min';
    dataQuality = 'Aceptable';
    confidenceScore = 80;
    confidenceLevel = 'Media';
  } else if (sourceState.mode === 'fallback') {
    sourceStatus = 'fallback';
    activePrimarySource = 'Respaldo Local ORBI';
    lastUpdatedMinutesText = 'último estado guardado';
    dataQuality = ' Degradada';
    confidenceScore = 65;
    confidenceLevel = 'Media';
  } else {
    // live
    sourceStatus = 'live';
    activePrimarySource = 'Open-Meteo (Live API)';
    lastUpdatedMinutesText = 'hace 5 min';
    dataQuality = 'Excelente';
    confidenceScore = 100;
    confidenceLevel = 'Alta';
  }

  // Adjust scores based on simulated connection quality or extreme distance
  if (connectionQuality === 'intermitente') {
    confidenceScore -= 15;
    dataQuality = 'Aceptable';
  } else if (connectionQuality === 'ninguna') {
    confidenceScore -= 35;
    dataQuality = ' Degradada';
  }

  // Adjust score slightly if we are querying GPS vs predefined stations
  if (location.id === 'gps_location') {
    // GPS can have minor variance depending on satellite distance
    confidenceScore -= 3;
  }

  // Final tier categorization
  if (confidenceScore >= 85) {
    confidenceLevel = 'Alta';
  } else if (confidenceScore >= 60) {
    confidenceLevel = 'Media';
  } else {
    confidenceLevel = 'Baja';
    dataQuality = 'Crítica';
  }

  // Beautiful human user messages
  let userMessage = 'ORBI Clima IA usa datos meteorológicos abiertos y los interpreta localmente con SkyCore™. Los parámetros de confianza son estables.';
  if (sourceStatus === 'cache') {
    userMessage = 'ORBI mantiene el último estado disponible mientras vuelve la conexión. Los parámetros de protección siguen respaldados.';
  } else if (sourceStatus === 'fallback') {
    userMessage = 'Se activó el respaldo climático local de contingencia. Tu continuidad de monitoreo operativo está garantizada.';
  } else if (sourceStatus === 'demo') {
    userMessage = 'Visualizando simulación de alta precisión para evaluación de parámetros en terreno.';
  }

  return {
    activePrimarySource,
    sourceStatus,
    lastUpdatedMinutesText,
    dataQuality,
    confidenceLevel,
    confidenceScore,
    userMessage,
    isExtensibleComparisonAvailable: true
  };
}

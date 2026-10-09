import { WeatherLocation } from '../types/weatherTypes';

export type OfficialAlertSeverity = 'info' | 'watch' | 'warning' | 'severe' | 'extreme';

export interface OfficialWeatherAlert {
  id: string;
  authority: string;
  title: string;
  description: string;
  severity: OfficialAlertSeverity;
  area: string;
  issuedAt: string;
  startsAt?: string;
  endsAt?: string;
  sourceUrl?: string;
  sourceId?: string;
}

export interface OfficialAlertsProviderStatus {
  providerId: string;
  providerName: string;
  authority: string;
  configured: boolean;
  verifiedMachineFeed: boolean;
  status: 'active' | 'not_configured' | 'unavailable';
  message: string;
}

export interface OfficialAlertsResult {
  alerts: OfficialWeatherAlert[];
  providers: OfficialAlertsProviderStatus[];
  hasVerifiedCoverage: boolean;
  checkedAt: string;
}

/**
 * IMPORTANT:
 * This service intentionally returns NO official alerts until a stable,
 * attributable authority feed has been verified and implemented.
 *
 * Public MeteoChile WIS2/OGC endpoints verified during OC-03 expose weather
 * observations/data notifications, but they have not been validated here as
 * a definitive feed of active public warnings. ORBI must never convert a
 * model-derived risk into an authority-issued alert.
 */
export async function fetchOfficialWeatherAlerts(
  _location: WeatherLocation,
): Promise<OfficialAlertsResult> {
  return {
    alerts: [],
    providers: [
      {
        providerId: 'dmc_chile_official_alerts',
        providerName: 'Dirección Meteorológica de Chile',
        authority: 'DMC / MeteoChile',
        configured: false,
        verifiedMachineFeed: false,
        status: 'not_configured',
        message: 'Feed oficial de alertas vigentes aún no validado para consumo automático en ORBI.',
      },
      {
        providerId: 'senapred_official_alerts',
        providerName: 'Servicio Nacional de Prevención y Respuesta ante Desastres',
        authority: 'SENAPRED',
        configured: false,
        verifiedMachineFeed: false,
        status: 'not_configured',
        message: 'Feed oficial de alertas vigentes aún no validado para consumo automático en ORBI.',
      },
    ],
    hasVerifiedCoverage: false,
    checkedAt: new Date().toISOString(),
  };
}

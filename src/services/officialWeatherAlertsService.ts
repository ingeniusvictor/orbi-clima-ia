import { WeatherLocation } from '../types/weatherTypes';
import {
  SenapredOfficialAlert,
  fetchSenapredOfficialAlerts,
} from './senapredArcgisAlertService';

export type OfficialAlertSeverity = 'info' | 'watch' | 'warning' | 'severe' | 'extreme';

export interface OfficialWeatherAlert {
  id: string;
  authority: string;
  category: 'meteorologica';
  title: string;
  description: string;
  severity: OfficialAlertSeverity;
  alertLevel: string;
  eventType: string;
  area: string;
  region: string;
  comuna?: string;
  issuedAt: string;
  startsAt?: string;
  endsAt?: string;
  sourceUrl?: string;
  machineSourceUrl?: string;
  sourceId?: string;
  matchedBy: 'polygon_intersection';
  verifiedOfficial: true;
}

export interface OfficialAlertsProviderStatus {
  providerId: string;
  providerName: string;
  authority: string;
  configured: boolean;
  verifiedMachineFeed: boolean;
  status: 'active' | 'partial' | 'not_configured' | 'unavailable';
  message: string;
}

export interface OfficialAlertsResult {
  alerts: OfficialWeatherAlert[];
  providers: OfficialAlertsProviderStatus[];
  hasVerifiedCoverage: boolean;
  coveragePartial: boolean;
  checkedAt: string;
}

function formatArea(alert: SenapredOfficialAlert): string {
  return [alert.comuna, alert.provincia, alert.region].filter(Boolean).join(' · ');
}

function mapSenapredAlert(alert: SenapredOfficialAlert, checkedAt: string): OfficialWeatherAlert {
  const area = formatArea(alert) || alert.region;
  return {
    id: alert.id,
    authority: 'SENAPRED',
    category: 'meteorologica',
    title: `${alert.levelLabel} · ${alert.causalidad}`,
    description: `SENAPRED mantiene ${alert.levelLabel} por ${alert.causalidad} para ${area}. La coincidencia se determinó mediante el polígono territorial oficial del dashboard.`,
    severity: alert.severity,
    alertLevel: alert.level,
    eventType: alert.causalidad,
    area,
    region: alert.region,
    comuna: alert.comuna ?? undefined,
    issuedAt: alert.startsAt ? `${alert.startsAt}T12:00:00-03:00` : checkedAt,
    startsAt: alert.startsAt ?? undefined,
    sourceUrl: alert.publicSourceUrl,
    machineSourceUrl: alert.machineSourceUrl,
    sourceId: alert.sourceService,
    matchedBy: 'polygon_intersection',
    verifiedOfficial: true,
  };
}

/**
 * Official alert policy:
 *
 * - SENAPRED meteorological civil-protection alerts are read from the public
 *   ArcGIS FeatureServer layers that feed its alert dashboard.
 * - The user's point must intersect the authority polygon. We do not infer an
 *   official alert from model rain, HydroWatch, region name, or nearest city.
 * - DMC/MeteoChile observations are already integrated elsewhere. A definitive
 *   machine feed for DMC Avisos/Alertas/Alarmas has not yet been validated, so
 *   DMC remains explicitly not_configured in THIS authority-alert service.
 * - If SENAPRED coverage cannot be verified, an empty array MUST NOT be shown
 *   to the user as proof that there are no official alerts.
 */
export async function fetchOfficialWeatherAlerts(
  location: WeatherLocation,
): Promise<OfficialAlertsResult> {
  const checkedAt = new Date().toISOString();

  try {
    const senapred = await fetchSenapredOfficialAlerts(location);
    const alerts = senapred.alerts.map(alert => mapSenapredAlert(alert, checkedAt));

    const senapredStatus: OfficialAlertsProviderStatus = senapred.hasVerifiedCoverage
      ? {
          providerId: 'senapred_official_alerts',
          providerName: 'Servicio Nacional de Prevención y Respuesta ante Desastres',
          authority: 'SENAPRED',
          configured: true,
          verifiedMachineFeed: true,
          status: senapred.isPartial ? 'partial' : 'active',
          message: senapred.integrityMessage,
        }
      : {
          providerId: 'senapred_official_alerts',
          providerName: 'Servicio Nacional de Prevención y Respuesta ante Desastres',
          authority: 'SENAPRED',
          configured: true,
          verifiedMachineFeed: true,
          status: 'unavailable',
          message: senapred.integrityMessage,
        };

    return {
      alerts,
      providers: [
        {
          providerId: 'dmc_chile_official_alerts',
          providerName: 'Dirección Meteorológica de Chile',
          authority: 'DMC / MeteoChile',
          configured: false,
          verifiedMachineFeed: false,
          status: 'not_configured',
          message: 'DMC está integrada como observación oficial WIS2/SYNOP. El feed automático definitivo de Avisos/Alertas/Alarmas DMC aún no está validado como fuente de alertas públicas vigentes.',
        },
        senapredStatus,
      ],
      hasVerifiedCoverage: senapred.hasVerifiedCoverage,
      coveragePartial: senapred.isPartial,
      checkedAt,
    };
  } catch (error) {
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
          message: 'Feed automático definitivo de Avisos/Alertas/Alarmas DMC aún no validado.',
        },
        {
          providerId: 'senapred_official_alerts',
          providerName: 'Servicio Nacional de Prevención y Respuesta ante Desastres',
          authority: 'SENAPRED',
          configured: true,
          verifiedMachineFeed: true,
          status: 'unavailable',
          message: error instanceof Error
            ? `La consulta oficial SENAPRED no pudo verificarse: ${error.message}`
            : 'La consulta oficial SENAPRED no pudo verificarse.',
        },
      ],
      hasVerifiedCoverage: false,
      coveragePartial: false,
      checkedAt,
    };
  }
}

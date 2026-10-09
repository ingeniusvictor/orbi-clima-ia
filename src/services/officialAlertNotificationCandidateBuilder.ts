import { OrbiNotificationCandidate, SmartAlertSeverity, WeatherProfile } from '../types/weatherTypes';
import type { OfficialAlertsResult, OfficialWeatherAlert } from './officialWeatherAlertsService';

function normalizeToken(value: string | undefined): string {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90);
}

function severityFor(alert: OfficialWeatherAlert): SmartAlertSeverity {
  if (alert.severity === 'extreme') return 'critical';
  if (alert.severity === 'severe' || alert.severity === 'warning') return 'warning';
  if (alert.severity === 'watch') return 'watch';
  return 'info';
}

function severityWeight(alert: OfficialWeatherAlert): number {
  switch (severityFor(alert)) {
    case 'critical': return 4;
    case 'warning': return 3;
    case 'watch': return 2;
    default: return 1;
  }
}

export function officialAlertDedupKey(alert: OfficialWeatherAlert): string {
  const territory = alert.comuna || alert.area || alert.region;
  return [
    'senapred',
    normalizeToken(alert.alertLevel),
    normalizeToken(alert.eventType),
    normalizeToken(alert.region),
    normalizeToken(territory),
    normalizeToken(alert.startsAt || alert.issuedAt.slice(0, 10)),
  ].join(':');
}

export function buildOfficialAlertNotificationCandidates(params: {
  result: OfficialAlertsResult;
  profile?: WeatherProfile;
  allowWatch?: boolean;
}): OrbiNotificationCandidate[] {
  const {
    result,
    profile = 'person',
    allowWatch = true,
  } = params;

  // A failed/unverifiable authority query must never create a notification.
  if (!result.hasVerifiedCoverage || !result.alerts.length) return [];

  const eligible = result.alerts
    .filter(alert => alert.verifiedOfficial === true && alert.authority === 'SENAPRED')
    .filter(alert => {
      const severity = severityFor(alert);
      if (severity === 'critical' || severity === 'warning') return true;
      if (severity === 'watch') return allowWatch;
      return false;
    })
    .sort((a, b) => severityWeight(b) - severityWeight(a));

  if (!eligible.length) return [];

  // One official authority notification per refresh cycle. Distinct official
  // alerts remain eligible on later cycles because dedup happens against the
  // persistent notification history, not by dropping lower-priority records.
  const alert = eligible[0];
  const severity = severityFor(alert);
  const dedupKey = officialAlertDedupKey(alert);
  const area = alert.comuna || alert.area || alert.region;

  return [{
    id: `official_${normalizeToken(alert.id)}_${Date.now()}`,
    title: `SENAPRED · ${alert.title}`,
    body: `${area}: ${alert.eventType}. Revisa la información oficial y sigue las instrucciones de la autoridad.`,
    channel: 'official_alerts',
    severity,
    profile,
    alertId: alert.id,
    category: 'general',
    createdAt: new Date().toISOString(),
    dedupKey,
    source: 'official_senapred',
  }];
}

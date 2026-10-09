import { SmartWeatherAlert, WeatherProfile, OrbiNotificationCandidate, OrbiNotificationChannel } from '../types/weatherTypes';
import { buildNotificationTitle, buildNotificationBody } from '../utils/notificationFormatter';

interface BuildCandidatesParams {
  alerts: SmartWeatherAlert[];
  profile: WeatherProfile;
  allowWatch?: boolean;
}

export function buildNotificationCandidatesFromAlerts({
  alerts,
  profile,
  allowWatch = false
}: BuildCandidatesParams): OrbiNotificationCandidate[] {
  if (!alerts || alerts.length === 0) return [];

  // Filter alerts by profile
  const profileAlerts = alerts.filter(alert => alert.profile === profile);

  // Filter based on severity permissions
  // - critical -> always yes
  // - warning -> always yes
  // - watch -> only if allowed
  // - info -> never automatically
  const allowableAlerts = profileAlerts.filter(alert => {
    if (alert.severity === 'critical') return true;
    if (alert.severity === 'warning') return true;
    if (alert.severity === 'watch' && allowWatch) return true;
    return false;
  });

  if (allowableAlerts.length === 0) return [];

  // Prioritize alerts: 1. critical, 2. warning, 3. watch
  // Tie-breaker: priority or createdAt
  const sortedAlerts = [...allowableAlerts].sort((a, b) => {
    const severityWeight = { critical: 4, warning: 3, watch: 2, info: 1 };
    const weightA = severityWeight[a.severity] || 0;
    const weightB = severityWeight[b.severity] || 0;

    if (weightA !== weightB) {
      return weightB - weightA; // higher severity first
    }

    // Secondary: priority (higher priority first)
    if (a.priority !== b.priority) {
      return b.priority - a.priority;
    }

    // Tertiary: newest first
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // "Tomar máximo 1 alerta principal por ciclo"
  const topAlert = sortedAlerts[0];

  // Map profile to channel
  const channel: OrbiNotificationChannel = profile === 'field_tech'
    ? 'field_alerts'
    : 'weather_alerts';

  const dedupKey = `${topAlert.id}_${topAlert.severity}_${topAlert.profile}_${topAlert.timeLabel}`;

  const candidate: OrbiNotificationCandidate = {
    id: `notif_${topAlert.id}_${Date.now()}`,
    title: buildNotificationTitle(topAlert),
    body: buildNotificationBody(topAlert),
    channel,
    severity: topAlert.severity,
    profile,
    alertId: topAlert.id,
    category: topAlert.category,
    createdAt: new Date().toISOString(),
    dedupKey,
    source: 'skycore_alert'
  };

  return [candidate];
}

import { OrbiNotificationCandidate, OrbiNotificationHistoryItem } from '../types/weatherTypes';

interface ShouldSendParams {
  candidate: OrbiNotificationCandidate;
  history: OrbiNotificationHistoryItem[];
  cooldownMinutes?: number;
  isDemo?: boolean;
}

export function shouldSendNotification({
  candidate,
  history,
  cooldownMinutes = 90,
  isDemo = false
}: ShouldSendParams): boolean {
  // Rule 8: If the user is in demo mode, don't send real automatic notifications
  if (isDemo) {
    return false;
  }

  const now = new Date();

  // Find any previous delivery of the exact same notification candidate (by dedupKey)
  const sameCandidateHistory = history.filter(item => item.dedupKey === candidate.dedupKey);
  
  if (sameCandidateHistory.length > 0) {
    // Sort to get the most recent sent time
    const lastSentTime = new Date(sameCandidateHistory[0].sentAt);
    const diffMs = now.getTime() - lastSentTime.getTime();
    const diffMins = diffMs / (1000 * 60);

    // Rule: No repetir misma alerta en menos de 90 minutos
    if (diffMins < cooldownMinutes) {
      console.log(`Notification dedup: Candidate [${candidate.title}] throttled. Same alert sent ${Math.round(diffMins)} mins ago.`);
      return false;
    }
  }

  // Bypass 24-hour count limits for CRITICAL severity alerts to ensure safety ("Si una alerta crítica nueva aparece, permitir envío aunque exista alerta menor previa")
  if (candidate.severity === 'critical') {
    return true;
  }

  // Calculate notifications sent in the last 24 hours
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const sentInLast24Hours = history.filter(item => {
    const sentAt = new Date(item.sentAt);
    return sentAt >= oneDayAgo && item.profile === candidate.profile;
  });

  // Limit checks by profile
  if (candidate.profile === 'person') {
    // Rule: No enviar más de 3 notificaciones climáticas en 24 horas en Perfil Persona
    if (sentInLast24Hours.length >= 3) {
      console.log(`Notification frequency limit: Person profile cap of 3 notifications in 24 hours reached. Current count: ${sentInLast24Hours.length}.`);
      return false;
    }
  } else if (candidate.profile === 'field_tech') {
    // Rule: No enviar más de 5 notificaciones técnicas en 24 horas en Perfil Técnico Terreno
    if (sentInLast24Hours.length >= 5) {
      console.log(`Notification frequency limit: Field tech profile cap of 5 notifications in 24 hours reached. Current count: ${sentInLast24Hours.length}.`);
      return false;
    }
  }

  return true;
}

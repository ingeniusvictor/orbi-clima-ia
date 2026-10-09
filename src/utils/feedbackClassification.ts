import { PilotFeedbackItem, PilotFeedbackType, PilotFeedbackSeverity } from '../services/pilotFeedbackService';

export const FEEDBACK_TYPE_LABELS: Record<PilotFeedbackType, string> = {
  bug: '🐛 Bug / Falla',
  ux_observation: '🎨 Observación UX',
  performance: '⚡ Rendimiento / Performance',
  privacy_question: '🔒 Pregunta de Privacidad',
  widget_issue: '📱 Falla de Widget',
  notification_issue: '🔔 Falla de Notificación',
  offline_issue: '📡 Falla de Modo Offline',
  text_microcopy: '✏️ Microcopy / Texto',
  suggestion: '💡 Sugerencia',
  other: '❓ Otro'
};

export const SEVERITY_LABELS: Record<PilotFeedbackSeverity, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
  critical: 'Crítica 🚨'
};

export function getFeedbackTypeStats(items: PilotFeedbackItem[]): Record<PilotFeedbackType, number> {
  const stats: Record<PilotFeedbackType, number> = {
    bug: 0,
    ux_observation: 0,
    performance: 0,
    privacy_question: 0,
    widget_issue: 0,
    notification_issue: 0,
    offline_issue: 0,
    text_microcopy: 0,
    suggestion: 0,
    other: 0
  };

  items.forEach(item => {
    stats[item.type] = (stats[item.type] || 0) + 1;
  });

  return stats;
}

export function getFeedbackSeverityStats(items: PilotFeedbackItem[]): Record<PilotFeedbackSeverity, number> {
  const stats: Record<PilotFeedbackSeverity, number> = {
    low: 0,
    medium: 0,
    high: 0,
    critical: 0
  };

  items.forEach(item => {
    stats[item.severity] = (stats[item.severity] || 0) + 1;
  });

  return stats;
}

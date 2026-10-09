import { PilotFeedbackSeverity, PilotFeedbackType } from '../services/pilotFeedbackService';

export type FixPriority = 'p0' | 'p1' | 'p2' | 'p3';

export const PRIORITY_LABELS: Record<FixPriority, { label: string; desc: string; color: string }> = {
  p0: { label: 'P0', desc: 'Bloquea Release', color: 'text-rose-500 bg-rose-500/10 border-rose-500/20' },
  p1: { label: 'P1', desc: 'Crítico / Pre-Externo', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
  p2: { label: 'P2', desc: 'Importante UX / Ajuste', color: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20' },
  p3: { label: 'P3', desc: 'Menor / Monitoreo / Futuro', color: 'text-slate-400 bg-slate-500/10 border-slate-500/20' }
};

export function calculatePriority(
  severity: PilotFeedbackSeverity,
  type: PilotFeedbackType,
  description: string = ''
): FixPriority {
  const isCritical = severity === 'critical';
  const isHigh = severity === 'high';
  const isMedium = severity === 'medium';
  const isLow = severity === 'low';

  const descLower = description.toLowerCase();
  
  // Rule: Critical + reproducible = P0
  // (In our case, we treat all critical severe bugs as P0 if they are bugs, widget issues, crashes, or offline issues)
  if (isCritical) {
    return 'p0';
  }

  // Rule: High + afecta instalación, crash, clima, widget o notificación = P1
  const matchesP1Keyword =
    type === 'bug' ||
    type === 'widget_issue' ||
    type === 'notification_issue' ||
    type === 'offline_issue' ||
    descLower.includes('crash') ||
    descLower.includes('instala') ||
    descLower.includes('clima');

  if (isHigh && matchesP1Keyword) {
    return 'p1';
  }

  if (isHigh) {
    return 'p2';
  }

  // Rule: Medium + afecta UX o microcopy importante = P2
  if (isMedium) {
    return 'p2';
  }

  // Rule: Low o sugerencia = P3
  return 'p3';
}

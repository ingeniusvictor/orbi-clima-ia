import { RiskLevel, SkyCoreDecision } from '../types/weatherTypes';

export function scoreToRiskLevel(score: number): RiskLevel {
  if (score < 25) return 'low';
  if (score < 50) return 'medium';
  if (score < 75) return 'high';
  return 'critical';
}

export function scoreToDecision(score: number): SkyCoreDecision {
  if (score <= 20) return 'optimal';
  if (score <= 40) return 'favorable';
  if (score <= 60) return 'caution';
  if (score <= 80) return 'not_recommended';
  return 'critical';
}

export function getDecisionLabel(decision: SkyCoreDecision): string {
  switch (decision) {
    case 'optimal': return 'Óptimo';
    case 'favorable': return 'Favorable';
    case 'caution': return 'Con precaución';
    case 'not_recommended': return 'No recomendado';
    case 'critical': return 'Crítico';
    default: return 'No determinado';
  }
}

export function getRiskLevelBadgeClass(level: RiskLevel): string {
  switch (level) {
    case 'low': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case 'medium': return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
    case 'high': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    case 'critical': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
  }
}

export function getDecisionBadgeClass(decision: SkyCoreDecision): string {
  switch (decision) {
    case 'optimal': return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
    case 'favorable': return 'bg-teal-500/15 text-teal-300 border-teal-500/30';
    case 'caution': return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
    case 'not_recommended': return 'bg-orange-500/15 text-orange-300 border-orange-500/30';
    case 'critical': return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
  }
}

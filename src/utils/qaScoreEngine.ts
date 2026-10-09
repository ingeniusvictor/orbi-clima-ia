import { QaReleaseState, QaTestCase, QaBugItem } from '../services/qaStateService';

export interface QaScoreStats {
  totalTests: number;
  passedCount: number;
  failedCount: number;
  blockedCount: number;
  needsReviewCount: number;
  openBugsCount: number;
  criticalBugsCount: number;
  score: number;
  statusLabel: 'Needs Work' | 'QA In Progress' | 'Almost Ready' | 'Candidate Ready';
  statusColor: string;
}

export function getQaScoreStats(state: QaReleaseState): QaScoreStats {
  const { tests, bugs, qaScore } = state;
  const totalTests = tests.length;
  const passedCount = tests.filter(t => t.status === 'passed').length;
  const failedCount = tests.filter(t => t.status === 'failed').length;
  const blockedCount = tests.filter(t => t.status === 'blocked').length;
  const needsReviewCount = tests.filter(t => t.status === 'needs_review').length;
  
  const openBugsCount = bugs.filter(b => b.status === 'open').length;
  const criticalBugsCount = bugs.filter(b => b.status === 'open' && b.severity === 'critical').length;

  let statusLabel: 'Needs Work' | 'QA In Progress' | 'Almost Ready' | 'Candidate Ready' = 'Needs Work';
  let statusColor = 'text-amber-500 bg-amber-500/10 border-amber-500/20';

  if (qaScore >= 95 && criticalBugsCount === 0 && failedCount === 0) {
    statusLabel = 'Candidate Ready';
    statusColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
  } else if (qaScore >= 80) {
    statusLabel = 'Almost Ready';
    statusColor = 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
  } else if (qaScore >= 60) {
    statusLabel = 'QA In Progress';
    statusColor = 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
  } else {
    statusLabel = 'Needs Work';
    statusColor = 'text-rose-400 bg-rose-500/10 border-rose-500/20';
  }

  return {
    totalTests,
    passedCount,
    failedCount,
    blockedCount,
    needsReviewCount,
    openBugsCount,
    criticalBugsCount,
    score: qaScore,
    statusLabel,
    statusColor,
  };
}

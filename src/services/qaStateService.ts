import { getInitialQaTestCases } from '../utils/qaTestCatalog';

export type QaStatus =
  | 'not_started'
  | 'passed'
  | 'failed'
  | 'blocked'
  | 'needs_review';

export type QaSeverity =
  | 'low'
  | 'medium'
  | 'high'
  | 'critical';

export interface QaTestCase {
  id: string;
  module: string;
  title: string;
  description: string;
  expectedResult: string;
  status: QaStatus;
  severity: QaSeverity;
  notes?: string;
  updatedAt?: string;
}

export interface QaBugItem {
  id: string;
  title: string;
  description: string;
  severity: QaSeverity;
  status: 'open' | 'fixed' | 'wont_fix' | 'monitoring';
  relatedModule?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QaEvidenceItem {
  id: string;
  label: string;
  description: string;
  type: 'text' | 'screenshot_note' | 'manual_result' | 'build_log';
  createdAt: string;
}

export interface QaReleaseState {
  versionName: string;
  candidateLabel: string;
  qaScore: number;
  tests: QaTestCase[];
  bugs: QaBugItem[];
  evidence: QaEvidenceItem[];
  lastUpdated: string;
}

const STORAGE_KEY = 'orbi_clima_release_candidate_qa_v1';

const DEFAULT_EVIDENCE: QaEvidenceItem[] = [
  {
    id: 'e1',
    label: 'Build de producción Web limpio',
    description: 'La compilación del sitio web con "npm run build" finalizó con éxito en el contenedor de Cloud Run.',
    type: 'build_log',
    createdAt: new Date().toISOString()
  },
  {
    id: 'e2',
    label: 'Build de empaquetado Android limpio',
    description: 'Los módulos se compilaron exitosamente a nivel web, listos para la inyección del bridge de Android nativo.',
    type: 'build_log',
    createdAt: new Date().toISOString()
  }
];

export function calculateQaScore(tests: QaTestCase[], bugs: QaBugItem[]): number {
  if (tests.length === 0) return 0;
  
  // Total tests score base calculation
  const totalWeight = tests.length * 10;
  let scorePoints = 0;

  tests.forEach(test => {
    if (test.status === 'passed') {
      scorePoints += 10;
    } else if (test.status === 'failed') {
      // Failed subtracts depending on severity
      if (test.severity === 'critical') scorePoints -= 12;
      else if (test.severity === 'high') scorePoints -= 8;
      else if (test.severity === 'medium') scorePoints -= 4;
      else scorePoints -= 2;
    } else if (test.status === 'blocked') {
      scorePoints -= 3; // Blocked subtracts 3
    } else if (test.status === 'needs_review') {
      scorePoints += 5; // Needs review gives half points
    }
  });

  // Open bugs subtract from the score
  bugs.forEach(bug => {
    if (bug.status === 'open') {
      if (bug.severity === 'critical') scorePoints -= 15;
      else if (bug.severity === 'high') scorePoints -= 10;
      else if (bug.severity === 'medium') scorePoints -= 5;
      else scorePoints -= 2;
    } else if (bug.status === 'monitoring') {
      scorePoints -= 1; // Monitoring subtracts slightly
    }
  });

  const percentage = Math.round((scorePoints / totalWeight) * 100);
  return Math.max(0, Math.min(100, percentage));
}

export function loadQaState(): QaReleaseState {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const state: QaReleaseState = JSON.parse(saved);
      // Ensure all initial tests are present in case catalog was updated
      const initialTests = getInitialQaTestCases();
      const existingIds = new Set(state.tests.map(t => t.id));
      
      const missingTests = initialTests.filter(t => !existingIds.has(t.id));
      if (missingTests.length > 0) {
        state.tests = [...state.tests, ...missingTests];
      }
      
      state.qaScore = calculateQaScore(state.tests, state.bugs);
      return state;
    } catch (e) {
      console.error('Error loading QA State, restoring defaults:', e);
    }
  }

  const defaultTests = getInitialQaTestCases();
  const defaultState: QaReleaseState = {
    versionName: '1.0.0-rc.1',
    candidateLabel: 'ORBI Clima IA Alpha Release',
    qaScore: 100,
    tests: defaultTests,
    bugs: [],
    evidence: DEFAULT_EVIDENCE,
    lastUpdated: new Date().toISOString()
  };
  
  defaultState.qaScore = calculateQaScore(defaultState.tests, defaultState.bugs);
  saveQaState(defaultState);
  return defaultState;
}

export function saveQaState(state: QaReleaseState): void {
  state.lastUpdated = new Date().toISOString();
  state.qaScore = calculateQaScore(state.tests, state.bugs);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetQaState(): QaReleaseState {
  const defaultTests = getInitialQaTestCases();
  const defaultState: QaReleaseState = {
    versionName: '1.0.0-rc.1',
    candidateLabel: 'ORBI Clima IA Alpha Release',
    qaScore: 100,
    tests: defaultTests,
    bugs: [],
    evidence: DEFAULT_EVIDENCE,
    lastUpdated: new Date().toISOString()
  };
  defaultState.qaScore = calculateQaScore(defaultState.tests, defaultState.bugs);
  saveQaState(defaultState);
  return defaultState;
}

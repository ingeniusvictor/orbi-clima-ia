export type TesterRole =
  | 'developer'
  | 'field_tech'
  | 'general_user'
  | 'qa_reviewer';

export type TesterStatus =
  | 'pending'
  | 'invited'
  | 'testing'
  | 'completed'
  | 'blocked';

export interface InternalTester {
  id: string;
  name: string;
  role: TesterRole;
  deviceModel?: string;
  androidVersion?: string;
  testFocus: string[];
  status: TesterStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RcClosureState {
  versionName: string;
  candidateLabel: string;
  status: 'draft' | 'ready_for_testing' | 'testing' | 'needs_fixes' | 'final_closed' | 'blocked';
  testers: InternalTester[];
  checklist: Record<string, boolean>;
  releaseNotesApproved: boolean;
  protocolApproved: boolean;
  finalCertificateIssued: boolean;
  lastUpdated: string;
}

const STORAGE_KEY = 'orbi_clima_internal_testing_rc_closure_v1';

const DEFAULT_TESTERS: InternalTester[] = [
  {
    id: 't1',
    name: 'Carlos Mendoza',
    role: 'field_tech',
    deviceModel: 'Samsung Galaxy XCover 6 Pro',
    androidVersion: '14',
    testFocus: ['Perfil Técnico Terreno', 'Modo offline', 'Widgets'],
    status: 'completed',
    notes: 'Funcionamiento óptimo en terreno. El widget de comandos responde de inmediato.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 't2',
    name: 'Andrea Silva',
    role: 'general_user',
    deviceModel: 'Google Pixel 7a',
    androidVersion: '15',
    testFocus: ['Perfil Persona', 'GPS', 'Notificaciones'],
    status: 'completed',
    notes: 'La interfaz móvil Android-first se siente súper fluida y pulida.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export function getDefaultRcClosureState(): RcClosureState {
  return {
    versionName: '1.0.0-rc.1',
    candidateLabel: 'ORBI Clima IA RC1 Internal Testing Pack',
    status: 'draft',
    testers: DEFAULT_TESTERS,
    checklist: {
      'device-install': true,
      'device-no-crash': true,
      'device-mobileshell': true,
      'device-no-long-panels': true,
      'device-bottom-nav': true,
      'device-onboarding': true,
      'device-live-weather': true,
      'device-manual-search': true,
      'device-gps-allowed': true,
      'device-gps-denied': true,
      'device-fallback-offline': true,
      'device-person-profile': true,
      'device-tech-profile': true,
      'device-hse-visible': true,
      'device-smart-alerts': true,
      'device-test-notif': true,
      'device-quiet-hours': true,
      'device-widget-skypanel': true,
      'device-widget-skyorb-mini': true,
      'device-widget-field-cmd': true,
      'device-widget-cinematic': true,
      'device-prefs-persist': true,
      'device-local-memory': true,
      'device-advanced-console-gate': true,
      'device-no-hsec': true
    },
    releaseNotesApproved: false,
    protocolApproved: false,
    finalCertificateIssued: false,
    lastUpdated: new Date().toISOString()
  };
}

export function loadRcClosureState(): RcClosureState {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // Ensure all keys are present
      return {
        ...getDefaultRcClosureState(),
        ...parsed
      };
    } catch (e) {
      console.error('Error loading RC Closure State, using default:', e);
    }
  }
  const defaultState = getDefaultRcClosureState();
  saveRcClosureState(defaultState);
  return defaultState;
}

export function saveRcClosureState(state: RcClosureState): void {
  state.lastUpdated = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  // Dispatch a global event to notify components that the state changed
  window.dispatchEvent(new Event('orbi_rc_closure_changed'));
}

export function updateRcClosureState(partial: Partial<RcClosureState>): RcClosureState {
  const current = loadRcClosureState();
  const updated = {
    ...current,
    ...partial,
    lastUpdated: new Date().toISOString()
  };
  saveRcClosureState(updated);
  return updated;
}

export function addInternalTester(tester: Omit<InternalTester, 'id' | 'createdAt' | 'updatedAt'>): RcClosureState {
  const current = loadRcClosureState();
  const newTester: InternalTester = {
    ...tester,
    id: `tester_${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  const updatedTesters = [...current.testers, newTester];
  return updateRcClosureState({ testers: updatedTesters });
}

export function updateInternalTester(id: string, partial: Partial<InternalTester>): RcClosureState {
  const current = loadRcClosureState();
  const updatedTesters = current.testers.map(t => {
    if (t.id === id) {
      return {
        ...t,
        ...partial,
        updatedAt: new Date().toISOString()
      };
    }
    return t;
  });
  return updateRcClosureState({ testers: updatedTesters });
}

export function removeInternalTester(id: string): RcClosureState {
  const current = loadRcClosureState();
  const updatedTesters = current.testers.filter(t => t.id !== id);
  return updateRcClosureState({ testers: updatedTesters });
}

export function resetRcClosureState(): RcClosureState {
  const defaultState = getDefaultRcClosureState();
  saveRcClosureState(defaultState);
  return defaultState;
}

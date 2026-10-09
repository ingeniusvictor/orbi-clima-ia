export type PilotFeedbackType =
  | 'bug'
  | 'ux_observation'
  | 'performance'
  | 'privacy_question'
  | 'widget_issue'
  | 'notification_issue'
  | 'offline_issue'
  | 'text_microcopy'
  | 'suggestion'
  | 'other';

export type PilotFeedbackSeverity =
  | 'low'
  | 'medium'
  | 'high'
  | 'critical';

export type PilotFeedbackStatus =
  | 'new'
  | 'triaged'
  | 'accepted'
  | 'rejected'
  | 'needs_fix'
  | 'monitoring'
  | 'fixed'
  | 'validated'
  | 'closed';

export interface PilotFeedbackItem {
  id: string;
  testerName?: string;
  testerRole?: string;
  deviceModel?: string;
  androidVersion?: string;
  appVersion: string;
  type: PilotFeedbackType;
  severity: PilotFeedbackSeverity;
  title: string;
  description: string;
  reproductionSteps?: string;
  expectedBehavior?: string;
  actualBehavior?: string;
  status: PilotFeedbackStatus;
  linkedFixId?: string;
  createdAt: string;
  updatedAt: string;
}

export type PostRcFixStatus =
  | 'open'
  | 'in_progress'
  | 'ready_for_test'
  | 'validated'
  | 'wont_fix'
  | 'monitoring'
  | 'closed';

export interface PostRcFixItem {
  id: string;
  title: string;
  description: string;
  sourceFeedbackIds: string[];
  priority: 'p0' | 'p1' | 'p2' | 'p3';
  severity: PilotFeedbackSeverity;
  status: PostRcFixStatus;
  owner?: string;
  fixSummary?: string;
  validationNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PilotFeedbackState {
  versionName: string;
  candidateLabel: string;
  feedback: PilotFeedbackItem[];
  fixes: PostRcFixItem[];
  postRcStatus:
    | 'waiting_feedback'
    | 'needs_triage'
    | 'fixing'
    | 'ready_for_retest'
    | 'closed'
    | 'blocked';
  lastUpdated: string;
}

const FEEDBACK_STORAGE_KEY = 'orbi_clima_pilot_feedback_loop_v1';

const DEFAULT_FEEDBACK: PilotFeedbackItem[] = [
  {
    id: 'fb1',
    testerName: 'Carlos Mendoza',
    testerRole: 'field_tech',
    deviceModel: 'Samsung Galaxy XCover 6 Pro',
    androidVersion: '14',
    appVersion: '1.0.0-rc.1',
    type: 'ux_observation',
    severity: 'medium',
    title: 'Scroll excesivo en Home Móvil',
    description: 'En pantallas medianas hay que hacer mucho scroll para ver las alertas inferiores porque las tarjetas están algo espaciadas.',
    reproductionSteps: '1. Abrir Home en un celular mediano.\n2. Navegar hacia abajo.\n3. Ver espaciados.',
    expectedBehavior: 'Mayor compactación y secciones colapsables en Home.',
    actualBehavior: 'Mucho espacio en blanco vertical.',
    status: 'validated',
    linkedFixId: 'fix1',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    id: 'fb2',
    testerName: 'Andrea Silva',
    testerRole: 'general_user',
    deviceModel: 'Google Pixel 7a',
    androidVersion: '15',
    appVersion: '1.0.0-rc.1',
    type: 'text_microcopy',
    severity: 'low',
    title: 'Texto de modo fallback confuso',
    description: 'El microcopy de advertencia de fallback de internet dice "Estable", pero podría ser más descriptivo sobre el origen de los datos en caché.',
    status: 'fixed',
    linkedFixId: 'fix2',
    createdAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 6).toISOString()
  }
];

const DEFAULT_FIXES: PostRcFixItem[] = [
  {
    id: 'fix1',
    title: 'Compactar y ocultar secciones avanzadas de Home Móvil',
    description: 'Se colapsaron o removieron los paneles innecesarios de MobileHomeScreen para Android para evitar scroll excesivo en terreno.',
    sourceFeedbackIds: ['fb1'],
    priority: 'p2',
    severity: 'medium',
    status: 'validated',
    owner: 'Equipo UX',
    fixSummary: 'Se implementó un diseño de una sola columna compacto con sections colapsables mediante CompactSectionCard.',
    validationNotes: 'Probado en simulador y dispositivo real. Altura de scroll reducida en un 40%.',
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 10).toISOString()
  },
  {
    id: 'fix2',
    title: 'Ajustar microcopy descriptivo de origen de datos cached/fallback',
    description: 'Reemplazar etiquetas genéricas con mensajes amigables y de preservación de seguridad.',
    sourceFeedbackIds: ['fb2'],
    priority: 'p2',
    severity: 'low',
    status: 'closed',
    owner: 'Desarrollador',
    fixSummary: 'Modificadas las funciones auxiliares de traducción en MobileHomeScreen y mapeo de clima.',
    validationNotes: 'Revisado el linter, los textos cortos se ven impecables.',
    createdAt: new Date(Date.now() - 3600000 * 15).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 5).toISOString()
  }
];

export function getDefaultPilotFeedbackState(): PilotFeedbackState {
  return {
    versionName: '1.0.0-rc.1',
    candidateLabel: 'ORBI Clima IA RC1 Internal Testing Pack',
    feedback: DEFAULT_FEEDBACK,
    fixes: DEFAULT_FIXES,
    postRcStatus: 'waiting_feedback',
    lastUpdated: new Date().toISOString()
  };
}

export function loadPilotFeedbackState(): PilotFeedbackState {
  const saved = localStorage.getItem(FEEDBACK_STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return {
        ...getDefaultPilotFeedbackState(),
        ...parsed
      };
    } catch (e) {
      console.error('Error loading pilot feedback state:', e);
    }
  }
  const defaultState = getDefaultPilotFeedbackState();
  savePilotFeedbackState(defaultState);
  return defaultState;
}

export function savePilotFeedbackState(state: PilotFeedbackState): void {
  state.lastUpdated = new Date().toISOString();
  localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new Event('orbi_pilot_feedback_changed'));
}

export function addPilotFeedback(item: Omit<PilotFeedbackItem, 'id' | 'createdAt' | 'updatedAt'>): PilotFeedbackState {
  const state = loadPilotFeedbackState();
  const newItem: PilotFeedbackItem = {
    ...item,
    id: `fb_${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  state.feedback = [...state.feedback, newItem];
  savePilotFeedbackState(state);
  return state;
}

export function updatePilotFeedback(id: string, partial: Partial<PilotFeedbackItem>): PilotFeedbackState {
  const state = loadPilotFeedbackState();
  state.feedback = state.feedback.map(item => {
    if (item.id === id) {
      return {
        ...item,
        ...partial,
        updatedAt: new Date().toISOString()
      };
    }
    return item;
  });
  savePilotFeedbackState(state);
  return state;
}

export function deletePilotFeedback(id: string): PilotFeedbackState {
  const state = loadPilotFeedbackState();
  state.feedback = state.feedback.filter(item => item.id !== id);
  // Also un-link from any fixes
  state.fixes = state.fixes.map(fix => {
    if (fix.sourceFeedbackIds.includes(id)) {
      return {
        ...fix,
        sourceFeedbackIds: fix.sourceFeedbackIds.filter(fId => fId !== id),
        updatedAt: new Date().toISOString()
      };
    }
    return fix;
  });
  savePilotFeedbackState(state);
  return state;
}

export function classifyPilotFeedback(id: string): PilotFeedbackState {
  // Simple triage helper: upgrade status to triaged
  return updatePilotFeedback(id, { status: 'triaged' });
}

export function resetPilotFeedbackState(): PilotFeedbackState {
  const defaultState = getDefaultPilotFeedbackState();
  savePilotFeedbackState(defaultState);
  return defaultState;
}

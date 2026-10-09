export interface FinalReleaseSealState {
  versionName: string;
  versionCode: number;
  releaseLabel: string;
  freezeStatus:
    | 'draft'
    | 'freeze_pending'
    | 'freeze_ready'
    | 'frozen'
    | 'local_release_sealed'
    | 'blocked';
  featureFreezeActive: boolean;
  localSealIssued: boolean;
  localSealIssuedAt?: string;
  moduleMatrixConfirmed: boolean;
  certificatesConfirmed: boolean;
  finalRiskReviewConfirmed: boolean;
  masterChangelogGenerated: boolean;
  noMoreFeaturesGateAccepted: boolean;
  lastUpdated: string;
}

const STORAGE_KEY = 'orbi_clima_v1_local_release_seal_v1';

export function getDefaultFinalReleaseSealState(): FinalReleaseSealState {
  return {
    versionName: '1.0.0-local-release',
    versionCode: 10000,
    releaseLabel: 'ORBI Clima IA v1.0 Local Release',
    freezeStatus: 'draft',
    featureFreezeActive: false,
    localSealIssued: false,
    moduleMatrixConfirmed: false,
    certificatesConfirmed: false,
    finalRiskReviewConfirmed: false,
    masterChangelogGenerated: false,
    noMoreFeaturesGateAccepted: false,
    lastUpdated: new Date().toISOString()
  };
}

export function loadFinalReleaseSealState(): FinalReleaseSealState {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return {
        ...getDefaultFinalReleaseSealState(),
        ...parsed
      };
    } catch (e) {
      console.error('Error loading final release seal state:', e);
    }
  }
  const defaultState = getDefaultFinalReleaseSealState();
  saveFinalReleaseSealState(defaultState);
  return defaultState;
}

export function saveFinalReleaseSealState(state: FinalReleaseSealState): void {
  state.lastUpdated = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new Event('orbi_release_seal_changed'));
}

export function updateFinalReleaseSealState(partial: Partial<FinalReleaseSealState>): FinalReleaseSealState {
  const state = loadFinalReleaseSealState();
  const updated = {
    ...state,
    ...partial,
    lastUpdated: new Date().toISOString()
  };
  saveFinalReleaseSealState(updated);
  return updated;
}

export function issueLocalReleaseSeal(): FinalReleaseSealState {
  return updateFinalReleaseSealState({
    localSealIssued: true,
    localSealIssuedAt: new Date().toISOString(),
    freezeStatus: 'local_release_sealed'
  });
}

export function resetLocalReleaseSeal(): FinalReleaseSealState {
  const defaultState = getDefaultFinalReleaseSealState();
  saveFinalReleaseSealState(defaultState);
  return defaultState;
}

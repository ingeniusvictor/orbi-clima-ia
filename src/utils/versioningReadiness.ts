export interface VersioningInfo {
  packageName: string;
  versionName: string;
  versionCode: number;
  candidateLabel: string;
  appName: string;
}

const STORAGE_KEY = 'orbi_clima_versioning_info_v1';

export const DEFAULT_VERSIONING: VersioningInfo = {
  packageName: 'com.orbi.clima',
  versionName: '1.0.0-rc.1',
  versionCode: 10001,
  candidateLabel: 'ORBI Clima IA RC1',
  appName: 'ORBI Clima IA',
};

export function loadVersioningInfo(): VersioningInfo {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Error parsing versioning info, returning default:', e);
    }
  }
  return DEFAULT_VERSIONING;
}

export function saveVersioningInfo(info: VersioningInfo): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(info));
}

export interface VersioningCheckItem {
  id: string;
  label: string;
  completed: boolean;
  rule: string;
}

export function getInitialVersioningChecklist(): VersioningCheckItem[] {
  return [
    {
      id: 'v-pkg',
      label: 'Application ID / Package Name revisado',
      completed: true,
      rule: 'Debe ser com.orbi.clima o un identificador estable y único para Google Play.',
    },
    {
      id: 'v-name',
      label: 'VersionName definido y legible',
      completed: true,
      rule: 'Debe seguir semver, p. ej., 1.0.0-rc.1. Visible para los usuarios.',
    },
    {
      id: 'v-code',
      label: 'VersionCode definido como entero',
      completed: true,
      rule: 'Debe ser un número entero estrictamente mayor que la versión anterior (p. ej., 10001).',
    },
    {
      id: 'v-label',
      label: 'Release Candidate label establecido',
      completed: true,
      rule: 'Debe identificar el compilado interno actual de manera inequívoca.',
    },
    {
      id: 'v-appname',
      label: 'App Display Name correcto',
      completed: true,
      rule: 'Debe ser "ORBI Clima IA" y coincidir en las cadenas de recursos y el manifiesto.',
    },
  ];
}

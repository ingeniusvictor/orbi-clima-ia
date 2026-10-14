import { isDeveloperModeEnabled } from '../components/DeveloperModeGate';
import {
  ATMOSPHERE_DEBUG_EVENT,
  getAtmosphereDebugPreset,
} from './weatherAtmosphereDebugService';

const ROOT_THEME_ATTRIBUTE = 'orbiAtmTheme';

function applyVisualTheme(): void {
  const root = document.documentElement;
  const preset = getAtmosphereDebugPreset();
  const developerEnabled = isDeveloperModeEnabled();

  if (!developerEnabled || preset === 'live') {
    delete root.dataset[ROOT_THEME_ATTRIBUTE];
    root.removeAttribute('data-orbi-atm-theme-sync');
    return;
  }

  root.dataset[ROOT_THEME_ATTRIBUTE] = preset;
  root.setAttribute('data-orbi-atm-theme-sync', 'v10');
}

export function initializeAtmosphereVisualThemeBridge(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  applyVisualTheme();
  window.addEventListener(ATMOSPHERE_DEBUG_EVENT, applyVisualTheme);
  window.addEventListener('orbi_dev_mode_changed', applyVisualTheme);
  window.addEventListener('storage', (event) => {
    if (event.key?.startsWith('orbi_living_atmosphere_debug_')) applyVisualTheme();
  });
}

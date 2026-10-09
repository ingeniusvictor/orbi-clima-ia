import { OrbiClimaUserPreferences, PreferredLocationSnapshot } from '../types/weatherTypes';
import { DEFAULT_ORBI_CLIMA_PREFERENCES } from '../utils/preferencesDefaults';
import { validateUserPreferences, sanitizePreferredLocation } from '../utils/preferencesValidation';

const PREFS_KEY = 'orbi_clima_user_preferences_v1';

export function loadUserPreferences(): OrbiClimaUserPreferences {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) {
      return DEFAULT_ORBI_CLIMA_PREFERENCES;
    }
    const parsed = JSON.parse(raw);
    return validateUserPreferences(parsed);
  } catch (e) {
    console.error('Error loading user preferences, resetting to default', e);
    return DEFAULT_ORBI_CLIMA_PREFERENCES;
  }
}

export function saveUserPreferences(preferences: OrbiClimaUserPreferences): void {
  try {
    const validated = validateUserPreferences(preferences);
    validated.lastUpdated = new Date().toISOString();
    localStorage.setItem(PREFS_KEY, JSON.stringify(validated));
    
    // Dispatch event so active components can adapt in real-time
    window.dispatchEvent(new Event('orbi-user-preferences-changed'));
  } catch (e) {
    console.error('Error saving user preferences', e);
  }
}

export function updateUserPreferences(
  partial: Partial<OrbiClimaUserPreferences>
): OrbiClimaUserPreferences {
  const current = loadUserPreferences();
  const merged = {
    ...current,
    ...partial,
    lastUpdated: new Date().toISOString()
  };
  saveUserPreferences(merged);
  return merged;
}

export function resetUserPreferences(): OrbiClimaUserPreferences {
  saveUserPreferences(DEFAULT_ORBI_CLIMA_PREFERENCES);
  return DEFAULT_ORBI_CLIMA_PREFERENCES;
}

export function savePreferredLocation(location: PreferredLocationSnapshot): void {
  try {
    const sanitized = sanitizePreferredLocation(location);
    const current = loadUserPreferences();
    current.preferredLocation = sanitized;
    saveUserPreferences(current);
  } catch (e) {
    console.error('Error saving preferred location', e);
  }
}

export function clearPreferredLocation(): void {
  const current = loadUserPreferences();
  current.preferredLocation = undefined;
  saveUserPreferences(current);
}

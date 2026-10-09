import { OrbiClimaUserPreferences } from '../types/weatherTypes';
import { loadUserPreferences, saveUserPreferences } from './userPreferencesService';
import { validateUserPreferences } from '../utils/preferencesValidation';

export function exportPreferencesAsJson(): string {
  try {
    const prefs = loadUserPreferences();
    
    // We export a clean configuration snapshot. 
    // If the location source is 'gps', we check if it was confirmed (it is already confirmed if it's in preferredLocation).
    // Let's create a clean copy of the configuration to export.
    const exportPayload = {
      version: prefs.version,
      preferredProfile: prefs.preferredProfile,
      preferredThemeMode: prefs.preferredThemeMode,
      preferredWidgetVariant: prefs.preferredWidgetVariant,
      alertSensitivity: prefs.alertSensitivity,
      preferredLocation: prefs.preferredLocation,
      favoriteAlertCategories: prefs.favoriteAlertCategories,
      morningSummaryEnabled: prefs.morningSummaryEnabled,
      fieldSummaryEnabled: prefs.fieldSummaryEnabled,
      quietHoursEnabled: prefs.quietHoursEnabled,
      lastUpdated: prefs.lastUpdated
    };

    return JSON.stringify(exportPayload, null, 2);
  } catch (e) {
    console.error('Error exporting preferences', e);
    throw new Error('Error al exportar preferencias.');
  }
}

export function importPreferencesFromJson(json: string): OrbiClimaUserPreferences {
  try {
    const parsed = JSON.parse(json);
    const validated = validateUserPreferences(parsed);
    
    // Save imported preferences
    saveUserPreferences(validated);
    return validated;
  } catch (e) {
    console.error('Error importing preferences', e);
    throw new Error('El archivo importado no es un formato de configuración de ORBI válido.');
  }
}

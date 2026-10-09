import { 
  OrbiClimaUserPreferences, 
  PreferredLocationSnapshot, 
  WeatherProfile, 
  PreferredThemeMode, 
  PreferredWidgetVariant, 
  AlertSensitivityMode, 
  SmartAlertCategory 
} from '../types/weatherTypes';
import { DEFAULT_ORBI_CLIMA_PREFERENCES } from './preferencesDefaults';

const VALID_PROFILES: WeatherProfile[] = ['person', 'field_tech'];
const VALID_THEMES: PreferredThemeMode[] = ['auto', 'dark', 'light'];
const VALID_WIDGETS: PreferredWidgetVariant[] = ['skyorb_mini', 'skypanel', 'field_command', 'cinematic_bar', 'skyorb_2x2', 'skyorb_4x2', 'skyorb_4x4'];
const VALID_SENSITIVITIES: AlertSensitivityMode[] = ['low', 'normal', 'high'];
const VALID_CATEGORIES: SmartAlertCategory[] = [
  'rain', 'wind', 'gusts', 'uv', 'cold', 'heat', 'humidity', 'storm', 'field_work', 'electrical_work', 'solar_pv', 'general'
];

export function validateUserPreferences(input: unknown): OrbiClimaUserPreferences {
  const defaults = DEFAULT_ORBI_CLIMA_PREFERENCES;
  if (!input || typeof input !== 'object') {
    return { ...defaults, lastUpdated: new Date().toISOString() };
  }

  const obj = input as Record<string, any>;

  // Profile validation
  let preferredProfile: WeatherProfile = defaults.preferredProfile;
  if (VALID_PROFILES.includes(obj.preferredProfile)) {
    preferredProfile = obj.preferredProfile;
  }

  // Theme validation
  let preferredThemeMode: PreferredThemeMode = defaults.preferredThemeMode;
  if (VALID_THEMES.includes(obj.preferredThemeMode)) {
    preferredThemeMode = obj.preferredThemeMode;
  }

  // Widget validation
  let preferredWidgetVariant: PreferredWidgetVariant = defaults.preferredWidgetVariant;
  if (VALID_WIDGETS.includes(obj.preferredWidgetVariant)) {
    preferredWidgetVariant = obj.preferredWidgetVariant;
  }

  // Sensitivity validation
  let alertSensitivity: AlertSensitivityMode = defaults.alertSensitivity;
  if (VALID_SENSITIVITIES.includes(obj.alertSensitivity)) {
    alertSensitivity = obj.alertSensitivity;
  }

  // Favorite categories validation
  let favoriteAlertCategories: SmartAlertCategory[] = [...defaults.favoriteAlertCategories];
  if (Array.isArray(obj.favoriteAlertCategories)) {
    const validPassed = obj.favoriteAlertCategories.filter((c: any) => VALID_CATEGORIES.includes(c));
    if (validPassed.length > 0) {
      favoriteAlertCategories = validPassed;
    }
  }

  // Boolean toggles
  const morningSummaryEnabled = typeof obj.morningSummaryEnabled === 'boolean' 
    ? obj.morningSummaryEnabled 
    : defaults.morningSummaryEnabled;

  const fieldSummaryEnabled = typeof obj.fieldSummaryEnabled === 'boolean' 
    ? obj.fieldSummaryEnabled 
    : defaults.fieldSummaryEnabled;

  const quietHoursEnabled = typeof obj.quietHoursEnabled === 'boolean' 
    ? obj.quietHoursEnabled 
    : defaults.quietHoursEnabled;

  // Location Snapshot validation
  let preferredLocation: PreferredLocationSnapshot | undefined = undefined;
  if (obj.preferredLocation && typeof obj.preferredLocation === 'object') {
    try {
      preferredLocation = sanitizePreferredLocation(obj.preferredLocation);
    } catch (e) {
      console.warn('Invalid preferredLocation in saved preferences, clearing it.');
    }
  }

  return {
    version: typeof obj.version === 'string' ? obj.version : defaults.version,
    preferredProfile,
    preferredThemeMode,
    preferredWidgetVariant,
    alertSensitivity,
    preferredLocation,
    favoriteAlertCategories,
    morningSummaryEnabled,
    fieldSummaryEnabled,
    quietHoursEnabled,
    lastUpdated: typeof obj.lastUpdated === 'string' ? obj.lastUpdated : new Date().toISOString(),
  };
}

export function sanitizePreferredLocation(
  location: PreferredLocationSnapshot
): PreferredLocationSnapshot {
  if (!location || typeof location !== 'object') {
    throw new Error('Invalid location object');
  }

  const id = typeof location.id === 'string' || typeof location.id === 'number' 
    ? String(location.id) 
    : `loc_${Date.now()}`;
  
  const name = typeof location.name === 'string' ? location.name : 'Ubicación';
  const region = typeof location.region === 'string' ? location.region : undefined;
  const country = typeof location.country === 'string' ? location.country : 'Chile';
  const latitude = typeof location.latitude === 'number' ? location.latitude : undefined;
  const longitude = typeof location.longitude === 'number' ? location.longitude : undefined;
  
  const validSources: ('manual' | 'gps' | 'demo')[] = ['manual', 'gps', 'demo'];
  const source = validSources.includes(location.source) ? location.source : 'manual';
  
  const savedAt = typeof location.savedAt === 'string' ? location.savedAt : new Date().toISOString();

  return {
    id,
    name,
    region,
    country,
    latitude,
    longitude,
    source,
    savedAt,
  };
}

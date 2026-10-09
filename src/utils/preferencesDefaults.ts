import { OrbiClimaUserPreferences } from '../types/weatherTypes';

export const DEFAULT_ORBI_CLIMA_PREFERENCES: OrbiClimaUserPreferences = {
  version: '1.0.0',
  preferredProfile: 'person',
  preferredThemeMode: 'dark',
  preferredWidgetVariant: 'skypanel',
  alertSensitivity: 'normal',
  favoriteAlertCategories: ['rain', 'uv', 'wind'],
  morningSummaryEnabled: true,
  fieldSummaryEnabled: false,
  quietHoursEnabled: true,
  lastUpdated: '2026-06-30T21:00:00.000Z', // Safe static ISO date or dynamic
};

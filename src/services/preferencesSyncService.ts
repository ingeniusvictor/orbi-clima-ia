import { OrbiClimaUserPreferences, ScheduledSummarySettings, QuietHoursSettings, NotificationFrequencySettings } from '../types/weatherTypes';
import { loadUserPreferences, saveUserPreferences, updateUserPreferences } from './userPreferencesService';
import { loadScheduledSummarySettings, saveScheduledSummarySettings } from './scheduledSummaryService';
import { loadQuietHoursSettings, saveQuietHoursSettings } from './quietHoursService';
import { loadNotificationFrequencySettings, saveNotificationFrequencySettings, FREQUENCY_STORAGE_KEY } from './notificationFrequencyService';

let isSyncing = false;

export function initializePreferencesSync(): () => void {
  const syncPreferencesToModules = () => {
    if (isSyncing) return;
    isSyncing = true;
    try {
      const prefs = loadUserPreferences();

      // 1. Sync to Scheduled Summary Settings
      const summarySettings = loadScheduledSummarySettings();
      if (
        summarySettings.personMorningEnabled !== prefs.morningSummaryEnabled ||
        summarySettings.fieldPreShiftEnabled !== prefs.fieldSummaryEnabled
      ) {
        summarySettings.personMorningEnabled = prefs.morningSummaryEnabled;
        summarySettings.fieldPreShiftEnabled = prefs.fieldSummaryEnabled;
        saveScheduledSummarySettings(summarySettings);
      }

      // 2. Sync to Quiet Hours
      const quietHours = loadQuietHoursSettings();
      if (quietHours.enabled !== prefs.quietHoursEnabled) {
        quietHours.enabled = prefs.quietHoursEnabled;
        if (!prefs.quietHoursEnabled) {
          quietHours.mode = 'disabled';
        } else if (quietHours.mode === 'disabled') {
          quietHours.mode = 'critical_only';
        }
        saveQuietHoursSettings(quietHours);
      }

      // 3. Sync Alert Sensitivity to Frequency settings
      const freqSettings = loadNotificationFrequencySettings();
      let targetFreq: NotificationFrequencySettings;

      if (prefs.alertSensitivity === 'low') {
        targetFreq = {
          maxPersonPerDay: 1,
          maxFieldPerDay: 2,
          minMinutesBetweenSimilar: 180,
          minMinutesBetweenAny: 60,
        };
      } else if (prefs.alertSensitivity === 'high') {
        targetFreq = {
          maxPersonPerDay: 5,
          maxFieldPerDay: 8,
          minMinutesBetweenSimilar: 45,
          minMinutesBetweenAny: 15,
        };
      } else {
        // normal
        targetFreq = {
          maxPersonPerDay: 3,
          maxFieldPerDay: 5,
          minMinutesBetweenSimilar: 90,
          minMinutesBetweenAny: 30,
        };
      }

      if (
        freqSettings.maxPersonPerDay !== targetFreq.maxPersonPerDay ||
        freqSettings.maxFieldPerDay !== targetFreq.maxFieldPerDay ||
        freqSettings.minMinutesBetweenSimilar !== targetFreq.minMinutesBetweenSimilar ||
        freqSettings.minMinutesBetweenAny !== targetFreq.minMinutesBetweenAny
      ) {
        saveNotificationFrequencySettings(targetFreq);
      }

    } catch (e) {
      console.error('Error during preferences to modules sync:', e);
    } finally {
      isSyncing = false;
    }
  };

  const syncModulesToPreferences = () => {
    if (isSyncing) return;
    isSyncing = true;
    try {
      const prefs = loadUserPreferences();
      const summarySettings = loadScheduledSummarySettings();
      const quietHours = loadQuietHoursSettings();

      let hasChanged = false;

      if (prefs.morningSummaryEnabled !== summarySettings.personMorningEnabled) {
        prefs.morningSummaryEnabled = summarySettings.personMorningEnabled;
        hasChanged = true;
      }
      if (prefs.fieldSummaryEnabled !== summarySettings.fieldPreShiftEnabled) {
        prefs.fieldSummaryEnabled = summarySettings.fieldPreShiftEnabled;
        hasChanged = true;
      }
      if (prefs.quietHoursEnabled !== quietHours.enabled) {
        prefs.quietHoursEnabled = quietHours.enabled;
        hasChanged = true;
      }

      if (hasChanged) {
        saveUserPreferences(prefs);
      }
    } catch (e) {
      console.error('Error during modules to preferences sync:', e);
    } finally {
      isSyncing = false;
    }
  };

  // Attach event listeners for bidirectional synchronization
  window.addEventListener('orbi-user-preferences-changed', syncPreferencesToModules);
  window.addEventListener('orbi-summary-settings-changed', syncModulesToPreferences);
  window.addEventListener('orbi-quiet-hours-changed', syncModulesToPreferences);

  // Initial sync on startup (sync modules to prefs or prefs to modules as baseline, let's establish user prefs as source of truth)
  syncPreferencesToModules();

  // Return a cleanup function
  return () => {
    window.removeEventListener('orbi-user-preferences-changed', syncPreferencesToModules);
    window.removeEventListener('orbi-summary-settings-changed', syncModulesToPreferences);
    window.removeEventListener('orbi-quiet-hours-changed', syncModulesToPreferences);
  };
}

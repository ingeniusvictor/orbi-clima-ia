import { Capacitor, registerPlugin } from '@capacitor/core';
import { WeatherLocation } from '../types/weatherTypes';
import { loadQuietHoursSettings, QuietHoursSettings } from './quietHoursService';

const ENABLED_STORAGE_KEY = 'orbi_official_alert_background_watch_enabled_v1';
const DEFAULT_INTERVAL_MINUTES = 30;

export interface OfficialAlertBackgroundWatchStatus {
  enabled: boolean;
  configured: boolean;
  locationName: string | null;
  region: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  timezone: string | null;
  intervalMinutes: number;
  lastCheckAt: number | null;
  lastNotificationAt: number | null;
  lastResult: string | null;
  lastError: string | null;
  lastAlertLevel: string | null;
  lastAlertArea: string | null;
  coveragePartial: boolean;
  deliveryRetentionDays: number;
  usesBackgroundLocation: boolean;
  usesForegroundService: boolean;
}

interface OfficialAlertWatchPlugin {
  configure(options: {
    enabled: boolean;
    locationId?: string;
    locationName?: string;
    region?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
    timezone?: string;
    intervalMinutes?: number;
    quietHours?: QuietHoursSettings;
  }): Promise<OfficialAlertBackgroundWatchStatus>;
  getStatus(): Promise<OfficialAlertBackgroundWatchStatus>;
  runNow(): Promise<{ queued: boolean }>;
  isDelivered(options: { dedupKey: string }): Promise<{ delivered: boolean }>;
  markDelivered(options: { dedupKey: string }): Promise<{ success: boolean }>;
  updateQuietHours(options: { quietHours: QuietHoursSettings }): Promise<OfficialAlertBackgroundWatchStatus>;
}

const NativeOfficialAlertWatch = registerPlugin<OfficialAlertWatchPlugin>('OrbiOfficialAlertWatch');

export function isOfficialAlertBackgroundWatchEnabled(): boolean {
  try {
    return localStorage.getItem(ENABLED_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setOfficialAlertBackgroundWatchEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(ENABLED_STORAGE_KEY, enabled ? 'true' : 'false');
    window.dispatchEvent(new Event('orbi-official-background-watch-changed'));
  } catch (error) {
    console.warn('Could not persist official alert background watch preference:', error);
  }
}

export function isNativeOfficialAlertWatchAvailable(): boolean {
  try {
    return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
  } catch {
    return false;
  }
}

function hasUsableLocation(location: WeatherLocation): boolean {
  return Number.isFinite(location.latitude)
    && Number.isFinite(location.longitude)
    && location.country?.trim().toLowerCase() === 'chile'
    && location.id !== 'initial_setup';
}

export async function syncOfficialAlertBackgroundWatch(
  location: WeatherLocation,
): Promise<OfficialAlertBackgroundWatchStatus | null> {
  if (!isNativeOfficialAlertWatchAvailable()) return null;

  const enabled = isOfficialAlertBackgroundWatchEnabled();
  if (!enabled) {
    return NativeOfficialAlertWatch.configure({ enabled: false });
  }

  if (!hasUsableLocation(location)) {
    return getOfficialAlertBackgroundWatchStatus();
  }

  const quietHours = loadQuietHoursSettings();
  return NativeOfficialAlertWatch.configure({
    enabled: true,
    locationId: location.id,
    locationName: location.name,
    region: location.region || '',
    country: location.country || 'Chile',
    latitude: location.latitude,
    longitude: location.longitude,
    timezone: location.timezone || 'America/Santiago',
    intervalMinutes: DEFAULT_INTERVAL_MINUTES,
    quietHours,
  });
}

export async function disableOfficialAlertBackgroundWatch(): Promise<OfficialAlertBackgroundWatchStatus | null> {
  setOfficialAlertBackgroundWatchEnabled(false);
  if (!isNativeOfficialAlertWatchAvailable()) return null;
  return NativeOfficialAlertWatch.configure({ enabled: false });
}

export async function enableOfficialAlertBackgroundWatch(
  location: WeatherLocation,
): Promise<OfficialAlertBackgroundWatchStatus | null> {
  if (!hasUsableLocation(location)) {
    throw new Error('Selecciona primero una ubicación real en Chile para activar la vigilancia SENAPRED.');
  }
  setOfficialAlertBackgroundWatchEnabled(true);
  return syncOfficialAlertBackgroundWatch(location);
}

export async function getOfficialAlertBackgroundWatchStatus(): Promise<OfficialAlertBackgroundWatchStatus | null> {
  if (!isNativeOfficialAlertWatchAvailable()) return null;
  try {
    return await NativeOfficialAlertWatch.getStatus();
  } catch (error) {
    console.warn('Official alert background watch status unavailable:', error);
    return null;
  }
}

export async function runOfficialAlertBackgroundCheckNow(): Promise<boolean> {
  if (!isNativeOfficialAlertWatchAvailable()) return false;
  const result = await NativeOfficialAlertWatch.runNow();
  return result.queued === true;
}

export async function isOfficialAlertDeliveredNative(dedupKey: string): Promise<boolean> {
  if (!isNativeOfficialAlertWatchAvailable()) return false;
  try {
    const result = await NativeOfficialAlertWatch.isDelivered({ dedupKey });
    return result.delivered === true;
  } catch (error) {
    console.warn('Native official-alert dedup lookup unavailable:', error);
    return false;
  }
}

export async function markOfficialAlertDeliveredNative(dedupKey: string): Promise<void> {
  if (!isNativeOfficialAlertWatchAvailable()) return;
  try {
    await NativeOfficialAlertWatch.markDelivered({ dedupKey });
  } catch (error) {
    console.warn('Could not synchronize official-alert delivery ledger:', error);
  }
}

export async function syncOfficialAlertBackgroundQuietHours(): Promise<void> {
  if (!isNativeOfficialAlertWatchAvailable()) return;
  try {
    await NativeOfficialAlertWatch.updateQuietHours({ quietHours: loadQuietHoursSettings() });
  } catch (error) {
    // The native watch may not be configured yet; this is intentionally soft.
    console.debug('Official-alert background quiet-hours sync skipped:', error);
  }
}

let quietHoursSyncRegistered = false;

export function initializeOfficialAlertBackgroundWatchSync(): () => void {
  if (quietHoursSyncRegistered || typeof window === 'undefined') return () => undefined;
  quietHoursSyncRegistered = true;

  const syncQuietHours = () => {
    void syncOfficialAlertBackgroundQuietHours();
  };
  window.addEventListener('orbi-quiet-hours-changed', syncQuietHours);
  void syncOfficialAlertBackgroundQuietHours();

  return () => {
    window.removeEventListener('orbi-quiet-hours-changed', syncQuietHours);
    quietHoursSyncRegistered = false;
  };
}

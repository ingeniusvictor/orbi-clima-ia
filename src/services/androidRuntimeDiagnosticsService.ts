import { Capacitor, registerPlugin } from '@capacitor/core';

export interface OrbiRuntimeWidgetCounts {
  skyOrb: number;
  mini: number;
  panel: number;
  command: number;
  commandPremium: number;
}

export interface OrbiRuntimeDiagnosticsStatus {
  platform: 'android' | 'web';
  manufacturer: string;
  brand: string;
  model: string;
  sdkInt: number;
  release: string;
  fineLocationGranted: boolean;
  coarseLocationGranted: boolean;
  notificationPermissionGranted: boolean;
  officialAlertChannelCreated: boolean;
  officialAlertChannelEnabled: boolean;
  officialAlertChannelImportance: number;
  batteryOptimizationActive: boolean;
  backgroundRestricted: boolean;
  officialWatchEnabled: boolean;
  officialWatchLastResult: string;
  officialWatchLastCheckAt: number;
  officialWatchCoveragePartial: boolean;
  workItems: number;
  activeWorkItems: number;
  runningWorkItems: number;
  workStates: string;
  workScheduled: boolean;
  widgets: OrbiRuntimeWidgetCounts;
  placedWidgetCount: number;
  usesBackgroundLocation: boolean;
  usesForegroundService: boolean;
  capturedAt: number;
}

interface RuntimeDiagnosticsPlugin {
  getStatus(): Promise<OrbiRuntimeDiagnosticsStatus>;
  openAppSettings(): Promise<{ opened: boolean }>;
  openNotificationSettings(): Promise<{ opened: boolean }>;
}

const RuntimeDiagnostics = registerPlugin<RuntimeDiagnosticsPlugin>('OrbiRuntimeDiagnostics');

export function isAndroidNativeRuntime(): boolean {
  try {
    return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
  } catch {
    return false;
  }
}

export async function getAndroidRuntimeDiagnostics(): Promise<OrbiRuntimeDiagnosticsStatus | null> {
  if (!isAndroidNativeRuntime()) return null;
  return RuntimeDiagnostics.getStatus();
}

export async function openAndroidAppSettings(): Promise<boolean> {
  if (!isAndroidNativeRuntime()) return false;
  const result = await RuntimeDiagnostics.openAppSettings();
  return result.opened === true;
}

export async function openAndroidNotificationSettings(): Promise<boolean> {
  if (!isAndroidNativeRuntime()) return false;
  const result = await RuntimeDiagnostics.openNotificationSettings();
  return result.opened === true;
}

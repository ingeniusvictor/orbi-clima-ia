import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { OrbiNotificationPermissionState } from '../types/weatherTypes';

const MOCK_PERMISSION_KEY = 'orbi_mock_notification_permission';

export async function checkOrbiNotificationPermission(): Promise<OrbiNotificationPermissionState> {
  if (!Capacitor.isNativePlatform()) {
    // Web Preview Simulation
    const saved = localStorage.getItem(MOCK_PERMISSION_KEY);
    if (saved === 'granted') return 'granted';
    if (saved === 'denied') return 'denied';
    return 'prompt'; // default is prompt on web preview to let users activate it
  }

  try {
    const status = await LocalNotifications.checkPermissions();
    const display = status.display;
    
    if (display === 'granted') return 'granted';
    if (display === 'denied') return 'denied';
    if (display === 'prompt' || display === 'prompt-with-rationale') return 'prompt';
    return 'unknown';
  } catch (error) {
    console.error('Error checking native notification permissions:', error);
    return 'unsupported';
  }
}

export async function requestOrbiNotificationPermission(): Promise<OrbiNotificationPermissionState> {
  if (!Capacitor.isNativePlatform()) {
    // Web Preview Simulation
    localStorage.setItem(MOCK_PERMISSION_KEY, 'granted');
    return 'granted';
  }

  try {
    const status = await LocalNotifications.requestPermissions();
    const display = status.display;
    
    if (display === 'granted') return 'granted';
    if (display === 'denied') return 'denied';
    if (display === 'prompt' || display === 'prompt-with-rationale') return 'prompt';
    return 'unknown';
  } catch (error) {
    console.error('Error requesting native notification permissions:', error);
    return 'unsupported';
  }
}

export function resetMockPermission(): void {
  localStorage.removeItem(MOCK_PERMISSION_KEY);
}

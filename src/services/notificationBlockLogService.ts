import { OrbiBlockedNotificationLog } from '../types/weatherTypes';

const BLOCKED_LOGS_KEY = 'orbi_blocked_notifications_log';

export function loadBlockedLogs(): OrbiBlockedNotificationLog[] {
  try {
    const saved = localStorage.getItem(BLOCKED_LOGS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error loading blocked logs:', e);
  }
  return [];
}

export function saveBlockedLogs(logs: OrbiBlockedNotificationLog[]): void {
  try {
    localStorage.setItem(BLOCKED_LOGS_KEY, JSON.stringify(logs));
    window.dispatchEvent(new Event('orbi-blocked-notifications-changed'));
  } catch (e) {
    console.error('Error saving blocked logs:', e);
  }
}

export function appendBlockedLog(log: Omit<OrbiBlockedNotificationLog, 'id' | 'blockedAt'>): void {
  const logs = loadBlockedLogs();
  const newLog: OrbiBlockedNotificationLog = {
    ...log,
    id: `block_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    blockedAt: new Date().toISOString(),
  };
  
  // Keep only the last 30 logs
  const updated = [newLog, ...logs].slice(0, 30);
  saveBlockedLogs(updated);
}

export function clearBlockedLogs(): void {
  saveBlockedLogs([]);
}

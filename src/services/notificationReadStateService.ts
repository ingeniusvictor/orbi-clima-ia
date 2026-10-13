import { OrbiNotificationHistoryItem } from '../types/weatherTypes';

const READ_STATE_STORAGE_KEY = 'orbi_clima_notification_read_state_v1';
export const ORBI_NOTIFICATION_READ_STATE_EVENT = 'orbi-notification-read-state-changed';

type NotificationReadState = {
  version: 1;
  initializedAt: string;
  readIds: string[];
};

function emitReadStateChanged(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(ORBI_NOTIFICATION_READ_STATE_EVENT));
}

function saveState(state: NotificationReadState): void {
  try {
    localStorage.setItem(READ_STATE_STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('Unable to persist notification read state:', error);
  }
}

function loadState(historyForMigration: OrbiNotificationHistoryItem[] = []): NotificationReadState {
  try {
    const raw = localStorage.getItem(READ_STATE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<NotificationReadState>;
      if (parsed.version === 1 && Array.isArray(parsed.readIds)) {
        return {
          version: 1,
          initializedAt: typeof parsed.initializedAt === 'string' ? parsed.initializedAt : new Date().toISOString(),
          readIds: parsed.readIds.filter((id): id is string => typeof id === 'string'),
        };
      }
    }
  } catch (error) {
    console.warn('Unable to load notification read state:', error);
  }

  // Migration rule: notifications that already existed before this inbox model
  // are treated as read. Only notifications delivered after the upgrade should
  // create a new red badge for the user.
  const migrated: NotificationReadState = {
    version: 1,
    initializedAt: new Date().toISOString(),
    readIds: historyForMigration.map(item => item.id),
  };
  saveState(migrated);
  return migrated;
}

export function initializeNotificationReadState(history: OrbiNotificationHistoryItem[]): void {
  loadState(history);
}

export function getUnreadNotifications(history: OrbiNotificationHistoryItem[]): OrbiNotificationHistoryItem[] {
  const state = loadState(history);
  const readIds = new Set(state.readIds);
  return history.filter(item => !readIds.has(item.id));
}

export function getUnreadNotificationCount(history: OrbiNotificationHistoryItem[]): number {
  return getUnreadNotifications(history).length;
}

export function isNotificationRead(item: OrbiNotificationHistoryItem, history: OrbiNotificationHistoryItem[]): boolean {
  const state = loadState(history);
  return state.readIds.includes(item.id);
}

export function markNotificationRead(id: string): void {
  const state = loadState();
  if (state.readIds.includes(id)) return;
  saveState({ ...state, readIds: [...state.readIds, id] });
  emitReadStateChanged();
}

export function markAllNotificationsRead(history: OrbiNotificationHistoryItem[]): void {
  const state = loadState(history);
  const merged = new Set(state.readIds);
  history.forEach(item => merged.add(item.id));
  saveState({ ...state, readIds: Array.from(merged) });
  emitReadStateChanged();
}

export function resetNotificationReadState(): void {
  // Keep an initialized empty state instead of deleting the key. Otherwise the
  // first notification after clearing history could be mistaken for migration data.
  saveState({
    version: 1,
    initializedAt: new Date().toISOString(),
    readIds: [],
  });
  emitReadStateChanged();
}

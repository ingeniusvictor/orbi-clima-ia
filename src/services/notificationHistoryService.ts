import { OrbiNotificationHistoryItem } from '../types/weatherTypes';

const HISTORY_STORAGE_KEY = 'orbi_clima_notification_history_v1';
const MAX_HISTORY_LIMIT = 50;

export function loadNotificationHistory(): OrbiNotificationHistoryItem[] {
  try {
    const data = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading notification history:', error);
    return [];
  }
}

export function saveNotificationHistory(items: OrbiNotificationHistoryItem[]): void {
  try {
    // Keep only the most recent items up to the limit
    const trimmed = items.slice(0, MAX_HISTORY_LIMIT);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.error('Error saving notification history:', error);
  }
}

export function appendNotificationHistory(item: OrbiNotificationHistoryItem): void {
  const history = loadNotificationHistory();
  // Insert at the beginning to have descending chronological order
  const updated = [item, ...history];
  saveNotificationHistory(updated);
}

export function clearNotificationHistory(): void {
  try {
    localStorage.removeItem(HISTORY_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing notification history:', error);
  }
}

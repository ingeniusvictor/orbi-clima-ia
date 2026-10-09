import { ScheduledAlertItem } from '../types/weatherTypes';

const STORAGE_KEY = 'orbi_clima_deferred_alerts_v1';

export function loadDeferredAlerts(): ScheduledAlertItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ScheduledAlertItem[];
  } catch (e) {
    console.error('Error loading deferred alerts', e);
    return [];
  }
}

export function saveDeferredAlerts(items: ScheduledAlertItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event('orbi-deferred-alerts-changed'));
  } catch (e) {
    console.error('Error saving deferred alerts', e);
  }
}

export function addDeferredAlert(item: ScheduledAlertItem): void {
  let items = loadDeferredAlerts();

  // Guard rules:
  // 1. If alert already exists by candidateId or alertId, do not duplicate
  const exists = items.some(
    x => 
      x.candidateId === item.candidateId || 
      (item.alertId && x.alertId === item.alertId)
  );
  if (exists) {
    return;
  }

  // 2. If a critical alert replaces a warning of the same category, keep only the critical
  if (item.severity === 'critical') {
    items = items.filter(x => !(x.category === item.category && x.severity === 'warning'));
  } else if (item.severity === 'warning') {
    // If we already have a critical of this category, don't add the warning
    const hasCritical = items.some(x => x.category === item.category && x.severity === 'critical');
    if (hasCritical) {
      return;
    }
  }

  // Push new item
  items.push(item);

  // 3. Keep max 20 deferred alerts
  if (items.length > 20) {
    items = items.slice(items.length - 20);
  }

  saveDeferredAlerts(items);
}

export function clearDeferredAlerts(): void {
  saveDeferredAlerts([]);
}

export function expireOldDeferredAlerts(now: Date): ScheduledAlertItem[] {
  const items = loadDeferredAlerts();
  const SIX_HOURS_MS = 6 * 60 * 60 * 1000;
  
  const validItems = items.filter(item => {
    const createdTime = new Date(item.createdAt).getTime();
    const ageMs = now.getTime() - createdTime;
    return ageMs < SIX_HOURS_MS;
  });

  if (validItems.length !== items.length) {
    saveDeferredAlerts(validItems);
  }

  return validItems;
}

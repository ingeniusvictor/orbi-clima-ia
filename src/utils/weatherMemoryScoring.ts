import { OrbiWeatherMemory, WeatherMemoryLocationUse, WeatherProfile, PreferredWidgetVariant } from '../types/weatherTypes';

export function scoreLocationUse(item: WeatherMemoryLocationUse): number {
  if (!item) return 0;
  const useCountWeight = item.useCount * 10;
  const lastUsedTime = new Date(item.lastUsedAt).getTime();
  const diffHours = (Date.now() - lastUsedTime) / (1000 * 60 * 60);
  
  let recencyBoost = 0;
  if (diffHours <= 1) {
    recencyBoost = 100; // instant high relevance
  } else if (diffHours <= 24) {
    recencyBoost = 50;
  } else if (diffHours <= 24 * 7) {
    recencyBoost = 20;
  } else {
    recencyBoost = 5;
  }

  return useCountWeight + recencyBoost;
}

export function getMostUsedLocation(memory: OrbiWeatherMemory): WeatherMemoryLocationUse | undefined {
  if (!memory || !memory.locations || memory.locations.length === 0) return undefined;
  
  // Return location with highest custom score
  return [...memory.locations].sort((a, b) => scoreLocationUse(b) - scoreLocationUse(a))[0];
}

export function getMostUsedProfile(memory: OrbiWeatherMemory): WeatherProfile | undefined {
  if (!memory || !memory.profileUses || memory.profileUses.length === 0) return undefined;
  
  // Find profile with maximum useCount
  const sorted = [...memory.profileUses].sort((a, b) => b.useCount - a.useCount);
  return sorted[0]?.profile;
}

export function getMostUsedWidget(memory: OrbiWeatherMemory): PreferredWidgetVariant | undefined {
  if (!memory || !memory.widgetUses || memory.widgetUses.length === 0) return undefined;
  
  // Find widget with maximum useCount
  const sorted = [...memory.widgetUses].sort((a, b) => b.useCount - a.useCount);
  return sorted[0]?.variant;
}

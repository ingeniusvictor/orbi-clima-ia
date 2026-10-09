import { OrbiWeatherMemory, WeatherMemoryLocationUse, WeatherMemoryProfileUse, WeatherMemoryWidgetUse, WeatherMemoryInsight, WeatherProfile, PreferredWidgetVariant } from '../types/weatherTypes';

export const STORAGE_KEY_MEMORY = 'orbi_clima_weather_memory_v1';

export const DEFAULT_ORBI_WEATHER_MEMORY: OrbiWeatherMemory = {
  version: '1.0.0',
  locations: [],
  profileUses: [],
  widgetUses: [],
  insights: [],
  lastUpdated: new Date().toISOString(),
};

// Dispatch event helper to keep tabs and components synced
function dispatchMemoryChangeEvent() {
  const event = new CustomEvent('orbi-weather-memory-changed');
  window.dispatchEvent(event);
}

export function loadWeatherMemory(): OrbiWeatherMemory {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MEMORY);
    if (!raw) return { ...DEFAULT_ORBI_WEATHER_MEMORY };
    const parsed = JSON.parse(raw) as OrbiWeatherMemory;
    if (parsed && parsed.version) {
      // Ensure sub-arrays exist
      return {
        ...DEFAULT_ORBI_WEATHER_MEMORY,
        ...parsed,
        locations: parsed.locations || [],
        profileUses: parsed.profileUses || [],
        widgetUses: parsed.widgetUses || [],
        insights: parsed.insights || [],
      };
    }
  } catch (e) {
    console.error('Error loading ORBI Clima memory:', e);
  }
  return { ...DEFAULT_ORBI_WEATHER_MEMORY };
}

export function saveWeatherMemory(memory: OrbiWeatherMemory): void {
  try {
    memory.lastUpdated = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY_MEMORY, JSON.stringify(memory));
    dispatchMemoryChangeEvent();
  } catch (e) {
    console.error('Error saving ORBI Clima memory:', e);
  }
}

export function recordLocationUse(loc: Partial<WeatherMemoryLocationUse> & { id: string; name: string; country: string }): OrbiWeatherMemory {
  const memory = loadWeatherMemory();
  
  // Find index of location
  const idx = memory.locations.findIndex(l => l.id === loc.id);
  const nowStr = new Date().toISOString();

  if (idx > -1) {
    // Exclude actual latitude/longitude coordinates from memory for complete safety (per privacy rules, no raw coords)
    memory.locations[idx] = {
      ...memory.locations[idx],
      useCount: memory.locations[idx].useCount + 1,
      lastUsedAt: nowStr,
      source: loc.source || memory.locations[idx].source || 'manual',
    };
  } else {
    // Add new location (max 10)
    const newLoc: WeatherMemoryLocationUse = {
      id: loc.id,
      name: loc.name,
      region: loc.region,
      country: loc.country,
      source: loc.source || 'manual',
      useCount: 1,
      lastUsedAt: nowStr
    };
    memory.locations.push(newLoc);
  }

  // Sort by useCount and recency, slice to max 10
  memory.locations.sort((a, b) => b.useCount - a.useCount || new Date(b.lastUsedAt).getTime() - new Date(a.lastUsedAt).getTime());
  if (memory.locations.length > 10) {
    memory.locations = memory.locations.slice(0, 10);
  }

  saveWeatherMemory(memory);
  return memory;
}

export function recordProfileUse(profile: WeatherProfile): OrbiWeatherMemory {
  const memory = loadWeatherMemory();
  const idx = memory.profileUses.findIndex(p => p.profile === profile);
  const nowStr = new Date().toISOString();

  if (idx > -1) {
    memory.profileUses[idx] = {
      ...memory.profileUses[idx],
      useCount: memory.profileUses[idx].useCount + 1,
      lastUsedAt: nowStr,
    };
  } else {
    memory.profileUses.push({
      profile,
      useCount: 1,
      lastUsedAt: nowStr
    });
  }

  // Sort profileUses by useCount
  memory.profileUses.sort((a, b) => b.useCount - a.useCount);
  saveWeatherMemory(memory);
  return memory;
}

export function recordWidgetUse(variant: PreferredWidgetVariant): OrbiWeatherMemory {
  const memory = loadWeatherMemory();
  const idx = memory.widgetUses.findIndex(w => w.variant === variant);
  const nowStr = new Date().toISOString();

  if (idx > -1) {
    memory.widgetUses[idx] = {
      ...memory.widgetUses[idx],
      useCount: memory.widgetUses[idx].useCount + 1,
      lastUsedAt: nowStr,
    };
  } else {
    memory.widgetUses.push({
      variant,
      useCount: 1,
      lastUsedAt: nowStr
    });
  }

  // Sort by useCount
  memory.widgetUses.sort((a, b) => b.useCount - a.useCount);
  saveWeatherMemory(memory);
  return memory;
}

export function addWeatherMemoryInsight(insight: WeatherMemoryInsight): OrbiWeatherMemory {
  const memory = loadWeatherMemory();
  
  // Prevent exact duplicate message
  const duplicateIdx = memory.insights.findIndex(i => i.message === insight.message);
  if (duplicateIdx > -1) {
    // update time
    memory.insights[duplicateIdx].createdAt = new Date().toISOString();
  } else {
    memory.insights.unshift(insight); // Add to beginning
  }

  // Limit to 20 insights
  if (memory.insights.length > 20) {
    memory.insights = memory.insights.slice(0, 20);
  }

  saveWeatherMemory(memory);
  return memory;
}

export function clearWeatherMemory(): OrbiWeatherMemory {
  const empty = { ...DEFAULT_ORBI_WEATHER_MEMORY, lastUpdated: new Date().toISOString() };
  try {
    localStorage.setItem(STORAGE_KEY_MEMORY, JSON.stringify(empty));
    dispatchMemoryChangeEvent();
  } catch (e) {
    console.error('Error clearing weather memory:', e);
  }
  return empty;
}

export function removeLocationFromMemory(id: string): OrbiWeatherMemory {
  const memory = loadWeatherMemory();
  memory.locations = memory.locations.filter(loc => loc.id !== id);
  saveWeatherMemory(memory);
  return memory;
}


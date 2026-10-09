import { SavedWeatherLocation } from '../types/weatherTypes';

const LOCAL_STORAGE_KEY = 'orbi_frequent_locations';

export function getSavedLocations(): SavedWeatherLocation[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading saved locations', e);
    return [];
  }
}

export function saveLocations(locations: SavedWeatherLocation[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(locations));
  } catch (e) {
    console.error('Error saving locations', e);
  }
}

export function addSavedLocation(location: Omit<SavedWeatherLocation, 'id' | 'createdAt' | 'updatedAt' | 'lastUsedAt'>): SavedWeatherLocation {
  const locations = getSavedLocations();
  const now = new Date().toISOString();
  
  const newLoc: SavedWeatherLocation = {
    ...location,
    id: `saved_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: now,
    updatedAt: now,
    lastUsedAt: now,
  };

  locations.push(newLoc);
  saveLocations(locations);
  return newLoc;
}

export function updateSavedLocation(id: string, updates: Partial<SavedWeatherLocation>): SavedWeatherLocation[] {
  const locations = getSavedLocations();
  const now = new Date().toISOString();
  const updated = locations.map(loc => {
    if (loc.id === id) {
      return {
        ...loc,
        ...updates,
        updatedAt: now
      };
    }
    return loc;
  });
  saveLocations(updated);
  return updated;
}

export function deleteSavedLocation(id: string): SavedWeatherLocation[] {
  const locations = getSavedLocations();
  const filtered = locations.filter(loc => loc.id !== id);
  saveLocations(filtered);
  return filtered;
}

export function markLocationAsUsed(id: string): void {
  const locations = getSavedLocations();
  const now = new Date().toISOString();
  const updated = locations.map(loc => {
    if (loc.id === id) {
      return {
        ...loc,
        lastUsedAt: now
      };
    }
    return loc;
  });
  saveLocations(updated);
}

/**
 * Calculates the geodetic distance between two coordinates in kilometers using the Haversine formula.
 */
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Finds the closest saved location within the specified radius (in kilometers)
 */
export function findNearbySavedLocation(
  lat: number,
  lon: number,
  maxDistanceKm = 5.0
): { location: SavedWeatherLocation; distanceKm: number } | null {
  const locations = getSavedLocations();
  if (locations.length === 0) return null;

  let closest: SavedWeatherLocation | null = null;
  let minDistance = Infinity;

  for (const loc of locations) {
    const dist = calculateDistanceKm(lat, lon, loc.latitude, loc.longitude);
    if (dist < minDistance) {
      minDistance = dist;
      closest = loc;
    }
  }

  if (closest && minDistance <= maxDistanceKm) {
    return {
      location: closest,
      distanceKm: minDistance
    };
  }

  return null;
}

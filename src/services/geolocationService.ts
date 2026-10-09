import { Geolocation } from '@capacitor/geolocation';

export async function requestCurrentPosition(): Promise<{
  latitude: number;
  longitude: number;
  accuracy?: number;
}> {
  // Try Capacitor Geolocation if running natively or if Geolocation is available
  try {
    const permStatus = await Geolocation.checkPermissions();
    if (permStatus.location !== 'granted') {
      const reqStatus = await Geolocation.requestPermissions();
      if (reqStatus.location !== 'granted') {
        throw new Error('Permiso de ubicación denegado. Puedes buscar tu ciudad manualmente.');
      }
    }
    const position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000
    });
    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy
    };
  } catch (err: any) {
    // If Capacitor plugin fails (e.g., in a non-Capacitor web browser environment), fall back to Web Geolocation API
    console.warn('Capacitor Geolocation not available or failed, falling back to Web Geolocation:', err);

    if (typeof window === 'undefined' || !navigator || !navigator.geolocation) {
      throw new Error('La geolocalización no está soportada por tu navegador o dispositivo actual.');
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          let errorMessage = 'No pudimos acceder a tu ubicación.';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Permiso denegado. Puedes buscar tu ciudad manualmente.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'La información de ubicación no está disponible actualmente. Puedes buscar tu ciudad manualmente.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Se agotó el tiempo de espera para obtener tu ubicación.';
              break;
          }
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  }
}

export async function reverseGeocode(lat: number, lon: number): Promise<{ name: string, region: string }> {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`, {
      headers: {
        'User-Agent': 'OrbiClimateIA/1.0 (orbiecosystem@gmail.com)'
      }
    });
    if (res.ok) {
      const data = await res.json();
      const address = data.address || {};
      const city = address.city || address.town || address.village || address.municipality || address.suburb || address.city_district || address.county || 'Santiago';
      const state = address.state || address.region || 'Chile';
      return { name: city, region: state };
    }
  } catch (e) {
    console.warn('Reverse geocoding failed:', e);
  }
  return { name: 'Mi Ubicación', region: 'Chile' };
}

export async function checkGeolocationPermissionOnly(): Promise<boolean> {
  try {
    const permStatus = await Geolocation.checkPermissions();
    return permStatus.location === 'granted';
  } catch (e) {
    try {
      if (typeof navigator !== 'undefined' && navigator.permissions) {
        const result = await navigator.permissions.query({ name: 'geolocation' as any });
        return result.state === 'granted';
      }
    } catch (e2) {
      console.warn('Browser permissions query failed:', e2);
    }
    return false;
  }
}



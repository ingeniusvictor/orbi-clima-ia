import { WeatherCondition } from '../types/weatherTypes';

export function mapWmoCodeToOrbiCondition(code?: number, isDay?: boolean, precipitationMm?: number): WeatherCondition {
  if (code === undefined) return 'cloudy';
  
  // If the code is a rain/storm code but there is no actual current precipitation, we map to cloudy to avoid false rain visuals
  const isRainCode = [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code);
  if (isRainCode && (precipitationMm === undefined || precipitationMm <= 0)) {
    return 'cloudy';
  }
  
  switch (code) {
    case 0:
      return isDay !== false ? 'sunny' : 'night';
    case 1:
    case 2:
      return 'partly_cloudy';
    case 3:
    case 45:
    case 48:
      return 'cloudy';
    case 51:
    case 53:
    case 55:
    case 56:
    case 57:
    case 61:
    case 63:
    case 65:
    case 66:
    case 67:
    case 80:
    case 81:
    case 82:
      return 'rain';
    case 71:
    case 73:
    case 75:
    case 77:
    case 85:
    case 86:
      return 'cold';
    case 95:
    case 96:
    case 99:
      return 'storm';
    default:
      return 'cloudy';
  }
}

export function getWmoHumanLabel(code?: number): string {
  if (code === undefined) return 'Nublado';
  switch (code) {
    case 0: return 'Despejado';
    case 1: return 'Mayormente despejado';
    case 2: return 'Parcialmente nublado';
    case 3: return 'Cubierto';
    case 45: return 'Niebla';
    case 48: return 'Niebla con escarcha';
    case 51: return 'Llovizna ligera';
    case 53: return 'Llovizna moderada';
    case 55: return 'Llovizna densa';
    case 56: return 'Llovizna gélida ligera';
    case 57: return 'Llovizna gélida intensa';
    case 61: return 'Lluvia ligera';
    case 63: return 'Lluvia moderada';
    case 65: return 'Lluvia intensa';
    case 66: return 'Lluvia gélida ligera';
    case 67: return 'Lluvia gélida intensa';
    case 71: return 'Nevada ligera';
    case 73: return 'Nevada moderada';
    case 75: return 'Nevada intensa';
    case 77: return 'Granizo menudo';
    case 80: return 'Chubascos ligeros';
    case 81: return 'Chubascos de lluvia moderados';
    case 82: return 'Chubascos de lluvia violentos';
    case 85: return 'Chubascos de nieve ligeros';
    case 86: return 'Chubascos de nieve intensos';
    case 95: return 'Tormenta';
    case 96: return 'Tormenta con granizo ligero';
    case 99: return 'Tormenta con granizo fuerte';
    default: return 'Nublado';
  }
}

import { WeatherSourceState, WeatherProvider, WeatherFetchStatus, WeatherDataMode } from '../types/weatherTypes';

export function buildWeatherSourceState(params: {
  provider: WeatherProvider;
  status: WeatherFetchStatus;
  lastUpdated?: string;
  errorMessage?: string;
}): WeatherSourceState {
  let mode: WeatherDataMode = 'mock';
  
  if (params.provider === 'mock') {
    mode = 'mock';
  } else {
    if (params.status === 'success') {
      mode = 'live';
    } else if (params.status === 'cached') {
      mode = 'cached';
    } else if (params.status === 'fallback' || params.status === 'error') {
      mode = 'fallback';
    }
  }

  return {
    provider: params.provider,
    mode,
    status: params.status,
    lastUpdated: params.lastUpdated || new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
    errorMessage: params.errorMessage,
    isLive: mode === 'live' || mode === 'cached'
  };
}

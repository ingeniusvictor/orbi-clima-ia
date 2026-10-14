import type { AtmosphereScene } from './weatherAtmosphereEngine';

export type AtmosphereTransitionReason = 'weather-truth' | 'atm-lab' | 'time-phase';

export interface AtmosphereTransitionProfile {
  durationMs: number;
  precipitationRampStart: number;
  precipitationRampEnd: number;
  cloudCrossfadeStart: number;
  cloudCrossfadeEnd: number;
}

const DEFAULT_DURATION_MS = 18_000;
export const ATM_LAB_TRANSITION_MULTIPLIER = 0.2;

const key = (from: AtmosphereScene, to: AtmosphereScene) => `${from}->${to}`;

const DURATION_MS = new Map<string, number>([
  [key('clear', 'partly-cloudy'), 15_000],
  [key('partly-cloudy', 'clear'), 15_000],
  [key('partly-cloudy', 'cloudy'), 18_000],
  [key('cloudy', 'partly-cloudy'), 18_000],
  [key('cloudy', 'rain'), 23_000],
  [key('rain', 'cloudy'), 20_000],
  [key('rain', 'storm'), 24_000],
  [key('storm', 'rain'), 25_000],
  [key('cloudy', 'clear'), 25_000],
  [key('clear', 'cloudy'), 22_000],
  [key('fog', 'cloudy'), 18_000],
  [key('cloudy', 'fog'), 18_000],
  [key('snow', 'cloudy'), 21_000],
  [key('cloudy', 'snow'), 22_000],
  [key('wind', 'cloudy'), 12_000],
  [key('cloudy', 'wind'), 12_000],
  [key('cold', 'cloudy'), 19_000],
  [key('cloudy', 'cold'), 19_000],
  [key('hot', 'clear'), 18_000],
  [key('clear', 'hot'), 18_000],
]);

export function resolveAtmosphereTransitionProfile(
  fromScene: AtmosphereScene,
  toScene: AtmosphereScene,
  reason: AtmosphereTransitionReason,
): AtmosphereTransitionProfile {
  const baseDuration = fromScene === toScene
    ? 10_000
    : DURATION_MS.get(key(fromScene, toScene)) ?? DEFAULT_DURATION_MS;
  const durationMs = Math.max(
    1_200,
    Math.round(baseDuration * (reason === 'atm-lab' ? ATM_LAB_TRANSITION_MULTIPLIER : 1)),
  );

  const precipitationIncreasing = (toScene === 'rain' || toScene === 'storm' || toScene === 'snow')
    && !(fromScene === 'rain' || fromScene === 'storm' || fromScene === 'snow');
  const precipitationStopping = (fromScene === 'rain' || fromScene === 'storm' || fromScene === 'snow')
    && !(toScene === 'rain' || toScene === 'storm' || toScene === 'snow');

  return {
    durationMs,
    precipitationRampStart: precipitationIncreasing ? 0.2 : 0,
    precipitationRampEnd: precipitationStopping ? 0.7 : 1,
    cloudCrossfadeStart: 0.08,
    cloudCrossfadeEnd: 0.92,
  };
}

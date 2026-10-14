import type { AtmosphereModel, AtmosphereScene, SolarLightingState } from './weatherAtmosphereEngine';
import {
  AtmosphereTransitionReason,
  AtmosphereTransitionProfile,
  resolveAtmosphereTransitionProfile,
} from './atmosphereTransitionProfiles';

export type AtmosphereTransitionPhase = 'stable' | 'transitioning';
export type AtmosphereSceneWeights = Partial<Record<AtmosphereScene, number>>;

export interface AtmosphereTransitionSnapshot {
  phase: AtmosphereTransitionPhase;
  reason: AtmosphereTransitionReason;
  fromScene: AtmosphereScene;
  toScene: AtmosphereScene;
  startedAt: number;
  durationMs: number;
  progress: number;
  cloudFamilyFromWeight: number;
  cloudFamilyToWeight: number;
  sceneWeights: AtmosphereSceneWeights;
  wetGlassIntensity: number;
  stormEnergy: number;
  model: AtmosphereModel;
}

const SCENES: AtmosphereScene[] = [
  'setup',
  'clear',
  'partly-cloudy',
  'cloudy',
  'fog',
  'rain',
  'snow',
  'storm',
  'wind',
  'cold',
  'hot',
];

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const lerp = (from: number, to: number, t: number) => from + (to - from) * t;
const smoothstep = (t: number) => {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
};
const smootherstep = (t: number) => {
  const x = clamp01(t);
  return x * x * x * (x * (x * 6 - 15) + 10);
};
const remap01 = (value: number, start: number, end: number) => {
  if (end <= start) return value >= end ? 1 : 0;
  return clamp01((value - start) / (end - start));
};

function oneHotScene(scene: AtmosphereScene): AtmosphereSceneWeights {
  return { [scene]: 1 };
}

function normalizeSceneWeights(weights: AtmosphereSceneWeights): AtmosphereSceneWeights {
  const candidates = SCENES
    .map((scene) => [scene, clamp01(weights[scene] ?? 0)] as const)
    .filter(([, weight]) => weight > 0.001)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  const total = candidates.reduce((sum, [, weight]) => sum + weight, 0);
  if (total <= 0) return { setup: 1 };
  return Object.fromEntries(candidates.map(([scene, weight]) => [scene, weight / total])) as AtmosphereSceneWeights;
}

function interpolateSceneWeights(
  origin: AtmosphereSceneWeights,
  targetScene: AtmosphereScene,
  t: number,
): AtmosphereSceneWeights {
  const next: AtmosphereSceneWeights = {};
  for (const scene of SCENES) {
    const fromWeight = origin[scene] ?? 0;
    const toWeight = scene === targetScene ? 1 : 0;
    const weight = lerp(fromWeight, toWeight, t);
    if (weight > 0.001) next[scene] = weight;
  }
  return normalizeSceneWeights(next);
}

function dominantScene(weights: AtmosphereSceneWeights): AtmosphereScene {
  let selected: AtmosphereScene = 'setup';
  let selectedWeight = -1;
  for (const scene of SCENES) {
    const weight = weights[scene] ?? 0;
    if (weight > selectedWeight) {
      selected = scene;
      selectedWeight = weight;
    }
  }
  return selected;
}

function interpolateSolar(from: SolarLightingState, to: SolarLightingState, t: number): SolarLightingState {
  return {
    localMinutes: lerp(from.localMinutes, to.localMinutes, t),
    sunriseMinutes: lerp(from.sunriseMinutes, to.sunriseMinutes, t),
    sunsetMinutes: lerp(from.sunsetMinutes, to.sunsetMinutes, t),
    daylightProgress: lerp(from.daylightProgress, to.daylightProgress, t),
    sunAltitude: lerp(from.sunAltitude, to.sunAltitude, t),
    sunPositionX: lerp(from.sunPositionX, to.sunPositionX, t),
    sunPositionY: lerp(from.sunPositionY, to.sunPositionY, t),
    twilightWarmth: lerp(from.twilightWarmth, to.twilightWarmth, t),
    nightStrength: lerp(from.nightStrength, to.nightStrength, t),
  };
}

function interpolateModel(
  from: AtmosphereModel,
  to: AtmosphereModel,
  easedProgress: number,
  precipitationProgress: number,
  sceneWeights: AtmosphereSceneWeights,
): AtmosphereModel {
  const discreteTarget = easedProgress >= 0.5;
  return {
    scene: dominantScene(sceneWeights),
    phase: discreteTarget ? to.phase : from.phase,
    quality: to.quality,
    cloudOpacity: lerp(from.cloudOpacity, to.cloudOpacity, easedProgress),
    cloudSpeed: lerp(from.cloudSpeed, to.cloudSpeed, easedProgress),
    precipitationStrength: lerp(from.precipitationStrength, to.precipitationStrength, precipitationProgress),
    precipitationKind: to.precipitationKind,
    precipitationIntensity: to.precipitationIntensity,
    frostStrength: lerp(from.frostStrength, to.frostStrength, easedProgress),
    mistStrength: lerp(from.mistStrength, to.mistStrength, easedProgress),
    windStrength: lerp(from.windStrength, to.windStrength, easedProgress),
    luminance: lerp(from.luminance, to.luminance, easedProgress),
    accentTemperature: discreteTarget ? to.accentTemperature : from.accentTemperature,
    solar: interpolateSolar(from.solar, to.solar, easedProgress),
  };
}

function visualDistance(from: AtmosphereModel, to: AtmosphereModel): number {
  const numeric = [
    Math.abs(from.cloudOpacity - to.cloudOpacity),
    Math.abs(from.precipitationStrength - to.precipitationStrength),
    Math.abs(from.frostStrength - to.frostStrength),
    Math.abs(from.mistStrength - to.mistStrength),
    Math.abs(from.windStrength - to.windStrength),
    Math.abs(from.luminance - to.luminance),
    Math.abs(from.solar.nightStrength - to.solar.nightStrength),
    Math.abs(from.solar.twilightWarmth - to.solar.twilightWarmth),
  ];
  const channelDistance = numeric.reduce((sum, value) => sum + value, 0) / numeric.length;
  const sceneDistance = from.scene === to.scene ? 0 : 0.55;
  const phaseDistance = from.phase === to.phase ? 0 : 0.25;
  return clamp01(Math.max(channelDistance, sceneDistance, phaseDistance));
}

function materiallyEqual(from: AtmosphereModel, to: AtmosphereModel): boolean {
  if (from.scene !== to.scene || from.phase !== to.phase || from.quality !== to.quality) return false;
  if (from.precipitationKind !== to.precipitationKind || from.precipitationIntensity !== to.precipitationIntensity) return false;
  return visualDistance(from, to) < 0.015;
}

export class AtmosphereTransitionController {
  private origin: AtmosphereModel | null = null;
  private target: AtmosphereModel | null = null;
  private originSceneWeights: AtmosphereSceneWeights = { setup: 1 };
  private fromScene: AtmosphereScene = 'setup';
  private toScene: AtmosphereScene = 'setup';
  private reason: AtmosphereTransitionReason = 'weather-truth';
  private startedAt = 0;
  private durationMs = 0;
  private profile: AtmosphereTransitionProfile = resolveAtmosphereTransitionProfile('setup', 'setup', 'weather-truth');
  private transitionPhase: AtmosphereTransitionPhase = 'stable';

  setTarget(target: AtmosphereModel, nowMs: number, reason: AtmosphereTransitionReason): AtmosphereTransitionSnapshot {
    if (!this.target) {
      this.origin = target;
      this.target = target;
      this.originSceneWeights = oneHotScene(target.scene);
      this.fromScene = target.scene;
      this.toScene = target.scene;
      this.reason = reason;
      this.startedAt = nowMs;
      this.durationMs = 0;
      this.transitionPhase = 'stable';
      return this.sample(nowMs);
    }

    const previous = this.sample(nowMs);
    if (materiallyEqual(previous.model, target)) {
      this.origin = target;
      this.target = target;
      this.originSceneWeights = oneHotScene(target.scene);
      this.fromScene = target.scene;
      this.toScene = target.scene;
      this.reason = reason;
      this.startedAt = nowMs;
      this.durationMs = 0;
      this.transitionPhase = 'stable';
      return this.sample(nowMs);
    }

    if (target.quality === 'static') {
      this.origin = target;
      this.target = target;
      this.originSceneWeights = oneHotScene(target.scene);
      this.fromScene = target.scene;
      this.toScene = target.scene;
      this.reason = reason;
      this.startedAt = nowMs;
      this.durationMs = 0;
      this.transitionPhase = 'stable';
      return this.sample(nowMs);
    }

    const wasInterrupted = previous.phase === 'transitioning';
    const nextFromScene = dominantScene(previous.sceneWeights);
    const nextProfile = resolveAtmosphereTransitionProfile(nextFromScene, target.scene, reason);
    const remainingDistance = visualDistance(previous.model, target);
    const interruptionScale = wasInterrupted ? Math.max(0.25, remainingDistance) : 1;

    this.origin = previous.model;
    this.target = target;
    this.originSceneWeights = previous.sceneWeights;
    this.fromScene = nextFromScene;
    this.toScene = target.scene;
    this.reason = reason;
    this.startedAt = nowMs;
    this.durationMs = Math.max(900, Math.round(nextProfile.durationMs * interruptionScale));
    this.profile = nextProfile;
    this.transitionPhase = 'transitioning';
    return this.sample(nowMs);
  }

  sample(nowMs: number): AtmosphereTransitionSnapshot {
    if (!this.origin || !this.target) {
      throw new Error('AtmosphereTransitionController requires setTarget() before sample().');
    }

    if (this.transitionPhase === 'stable' || this.durationMs <= 0) {
      const stableWeights = oneHotScene(this.target.scene);
      return {
        phase: 'stable',
        reason: this.reason,
        fromScene: this.target.scene,
        toScene: this.target.scene,
        startedAt: this.startedAt,
        durationMs: 0,
        progress: 1,
        cloudFamilyFromWeight: 0,
        cloudFamilyToWeight: 1,
        sceneWeights: stableWeights,
        wetGlassIntensity: this.target.precipitationStrength,
        stormEnergy: this.target.scene === 'storm' ? 1 : 0,
        model: this.target,
      };
    }

    const rawProgress = clamp01((nowMs - this.startedAt) / this.durationMs);
    const easedProgress = smootherstep(rawProgress);
    const precipitationProgress = smoothstep(remap01(
      rawProgress,
      this.profile.precipitationRampStart,
      this.profile.precipitationRampEnd,
    ));
    const cloudProgress = smoothstep(remap01(
      rawProgress,
      this.profile.cloudCrossfadeStart,
      this.profile.cloudCrossfadeEnd,
    ));
    const sceneWeights = interpolateSceneWeights(this.originSceneWeights, this.target.scene, cloudProgress);
    const model = interpolateModel(this.origin, this.target, easedProgress, precipitationProgress, sceneWeights);
    const precipitationRising = this.target.precipitationStrength > this.origin.precipitationStrength;
    const wetGlassProgress = smoothstep(remap01(
      rawProgress,
      precipitationRising ? Math.min(0.82, this.profile.precipitationRampStart + 0.14) : 0.28,
      1,
    ));
    const wetGlassIntensity = lerp(
      this.origin.precipitationStrength,
      this.target.precipitationStrength,
      wetGlassProgress,
    );
    const targetSceneWeight = sceneWeights[this.toScene] ?? 0;

    if (rawProgress >= 1) {
      this.origin = this.target;
      this.originSceneWeights = oneHotScene(this.target.scene);
      this.fromScene = this.target.scene;
      this.toScene = this.target.scene;
      this.durationMs = 0;
      this.transitionPhase = 'stable';
      return {
        phase: 'stable',
        reason: this.reason,
        fromScene: this.target.scene,
        toScene: this.target.scene,
        startedAt: this.startedAt,
        durationMs: 0,
        progress: 1,
        cloudFamilyFromWeight: 0,
        cloudFamilyToWeight: 1,
        sceneWeights: oneHotScene(this.target.scene),
        wetGlassIntensity: this.target.precipitationStrength,
        stormEnergy: this.target.scene === 'storm' ? 1 : 0,
        model: this.target,
      };
    }

    return {
      phase: 'transitioning',
      reason: this.reason,
      fromScene: this.fromScene,
      toScene: this.toScene,
      startedAt: this.startedAt,
      durationMs: this.durationMs,
      progress: rawProgress,
      cloudFamilyFromWeight: 1 - targetSceneWeight,
      cloudFamilyToWeight: targetSceneWeight,
      sceneWeights,
      wetGlassIntensity,
      stormEnergy: sceneWeights.storm ?? 0,
      model,
    };
  }
}

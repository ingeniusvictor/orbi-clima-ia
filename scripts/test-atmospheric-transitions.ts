import assert from 'node:assert/strict';
import { AtmosphereTransitionController } from '../src/services/atmosphereTransitionController';
import { resolveAtmosphereTransitionProfile } from '../src/services/atmosphereTransitionProfiles';
import type { AtmosphereModel, AtmosphereScene } from '../src/services/weatherAtmosphereEngine';

function model(scene: AtmosphereScene, overrides: Partial<AtmosphereModel> = {}): AtmosphereModel {
  const wet = scene === 'rain' || scene === 'storm' || scene === 'snow';
  return {
    scene,
    phase: 'day',
    quality: 'balanced',
    cloudOpacity: scene === 'clear' ? 0.08 : scene === 'partly-cloudy' ? 0.48 : scene === 'storm' ? 1 : 0.86,
    cloudSpeed: scene === 'storm' ? 22 : 38,
    precipitationStrength: wet ? (scene === 'storm' ? 0.82 : 0.56) : 0,
    precipitationKind: scene === 'snow' ? 'snow' : scene === 'storm' ? 'storm' : scene === 'rain' ? 'rain' : 'none',
    precipitationIntensity: wet ? 'moderate' : 'none',
    frostStrength: scene === 'snow' ? 0.58 : 0,
    mistStrength: scene === 'fog' ? 0.8 : wet ? 0.3 : 0.08,
    windStrength: scene === 'storm' ? 0.82 : 0.16,
    luminance: scene === 'clear' ? 0.88 : scene === 'storm' ? 0.35 : 0.62,
    accentTemperature: scene === 'clear' ? 'neutral' : 'cool',
    solar: {
      localMinutes: 720,
      sunriseMinutes: 420,
      sunsetMinutes: 1140,
      daylightProgress: 0.5,
      sunAltitude: 0.9,
      sunPositionX: 0.5,
      sunPositionY: 0.2,
      twilightWarmth: 0.05,
      nightStrength: 0,
    },
    ...overrides,
  };
}

function sceneWeightSum(weights: Partial<Record<AtmosphereScene, number>>): number {
  return Object.values(weights).reduce((sum, value) => sum + (value ?? 0), 0);
}

const controller = new AtmosphereTransitionController();
const clear = model('clear');
const cloudy = model('cloudy');

const initial = controller.setTarget(clear, 1_000, 'weather-truth');
assert.equal(initial.phase, 'stable');
assert.equal(initial.model.scene, 'clear');
assert.equal(initial.sceneWeights.clear, 1);

const started = controller.setTarget(cloudy, 2_000, 'weather-truth');
assert.equal(started.phase, 'transitioning');
assert.equal(started.progress, 0);
assert.equal(started.fromScene, 'clear');
assert.equal(started.toScene, 'cloudy');

const midpoint = controller.sample(2_000 + started.durationMs / 2);
assert.ok(midpoint.model.cloudOpacity > clear.cloudOpacity, 'Cloud opacity must rise continuously during clear → cloudy.');
assert.ok(midpoint.model.cloudOpacity < cloudy.cloudOpacity, 'Cloud opacity must not jump directly to the target.');
assert.ok(midpoint.cloudFamilyFromWeight > 0, 'Outgoing cloud family must remain temporarily visible.');
assert.ok(midpoint.cloudFamilyToWeight > 0, 'Incoming cloud family must crossfade in before completion.');
assert.ok((midpoint.sceneWeights.clear ?? 0) > 0, 'Outgoing clear family weight must remain present mid-transition.');
assert.ok((midpoint.sceneWeights.cloudy ?? 0) > 0, 'Incoming cloudy family weight must be present mid-transition.');
assert.ok(Math.abs(sceneWeightSum(midpoint.sceneWeights) - 1) < 1e-9, 'Scene-family weights must stay normalized.');
assert.ok(Object.keys(midpoint.sceneWeights).length <= 3, 'Scene-family blending must remain bounded to at most three families.');

const rainController = new AtmosphereTransitionController();
rainController.setTarget(cloudy, 0, 'weather-truth');
const rain = model('rain');
const rainStart = rainController.setTarget(rain, 10_000, 'weather-truth');
const earlyRain = rainController.sample(10_000 + rainStart.durationMs * 0.1);
assert.ok(earlyRain.model.precipitationStrength < rain.precipitationStrength * 0.2, 'Rain onset must keep a first-drop delay instead of hard-switching.');
const glassLagSample = rainController.sample(10_000 + rainStart.durationMs * 0.45);
assert.ok(glassLagSample.model.precipitationStrength > 0, 'Rain must already be ramping before the wet-glass layer catches up.');
assert.ok(glassLagSample.wetGlassIntensity < glassLagSample.model.precipitationStrength, 'Wet-glass accumulation must lag rainfall onset.');
const lateRain = rainController.sample(10_000 + rainStart.durationMs * 0.8);
assert.ok(lateRain.model.precipitationStrength > earlyRain.model.precipitationStrength, 'Precipitation ramp must be monotonic.');
assert.ok(lateRain.wetGlassIntensity > glassLagSample.wetGlassIntensity, 'Wet-glass accumulation must rise progressively after rainfall starts.');

const interruptionController = new AtmosphereTransitionController();
interruptionController.setTarget(clear, 0, 'weather-truth');
const towardRain = interruptionController.setTarget(rain, 1_000, 'weather-truth');
const interruptedAt = 1_000 + towardRain.durationMs * 0.45;
const beforeInterrupt = interruptionController.sample(interruptedAt);
const storm = model('storm');
const afterRetarget = interruptionController.setTarget(storm, interruptedAt, 'weather-truth');
assert.equal(afterRetarget.phase, 'transitioning');
assert.ok(Math.abs(afterRetarget.model.cloudOpacity - beforeInterrupt.model.cloudOpacity) < 1e-9, 'Interrupted transition must restart from the current interpolated cloud state.');
assert.ok(Math.abs(afterRetarget.model.precipitationStrength - beforeInterrupt.model.precipitationStrength) < 1e-9, 'Interrupted transition must not snap precipitation backward.');
for (const scene of ['clear', 'rain', 'storm'] as const) {
  assert.ok(
    Math.abs((afterRetarget.sceneWeights[scene] ?? 0) - (beforeInterrupt.sceneWeights[scene] ?? 0)) < 1e-9,
    `Interrupted transition must preserve the current ${scene} family weight at retarget time.`,
  );
}
assert.ok(Math.abs(sceneWeightSum(afterRetarget.sceneWeights) - 1) < 1e-9, 'Retargeted scene-family weights must remain normalized.');

const stormMidpoint = interruptionController.sample(interruptedAt + afterRetarget.durationMs * 0.55);
assert.ok(stormMidpoint.stormEnergy > 0 && stormMidpoint.stormEnergy < 1, 'Storm energy must rise continuously instead of enabling lightning at retarget time.');
assert.ok((stormMidpoint.sceneWeights.storm ?? 0) > 0, 'Storm family must crossfade into the interrupted blend.');
assert.ok(Object.keys(stormMidpoint.sceneWeights).length <= 3, 'Interrupted crossfade must remain bounded to at most three scene families.');

const finished = interruptionController.sample(interruptedAt + afterRetarget.durationMs + 1);
assert.equal(finished.phase, 'stable');
assert.equal(finished.model.scene, 'storm');
assert.equal(finished.model.precipitationStrength, storm.precipitationStrength);
assert.equal(finished.sceneWeights.storm, 1);
assert.equal(finished.stormEnergy, 1);

const labProfile = resolveAtmosphereTransitionProfile('cloudy', 'rain', 'atm-lab');
const liveProfile = resolveAtmosphereTransitionProfile('cloudy', 'rain', 'weather-truth');
assert.ok(labProfile.durationMs < liveProfile.durationMs, 'ATM LAB must use accelerated visual QA timing.');
assert.ok(labProfile.durationMs >= 1_200, 'ATM LAB timing must remain observable rather than becoming an instant switch.');

const reducedMotionController = new AtmosphereTransitionController();
reducedMotionController.setTarget(clear, 0, 'weather-truth');
const staticTarget = model('storm', { quality: 'static' });
const staticResult = reducedMotionController.setTarget(staticTarget, 500, 'weather-truth');
assert.equal(staticResult.phase, 'stable', 'Reduced-motion/static quality must not force animated transitions.');
assert.equal(staticResult.model.scene, 'storm');
assert.equal(staticResult.stormEnergy, 1);

console.log('OC-22H Atmospheric Transition Controller tests: PASS');

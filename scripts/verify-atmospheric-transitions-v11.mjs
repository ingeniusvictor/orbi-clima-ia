import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(path, 'utf8');
const fail = (message) => {
  console.error(`OC-22H Atmospheric Transitions: FAIL\n${message}`);
  process.exit(1);
};
const expect = (condition, message) => {
  if (!condition) fail(message);
};

const baseline = read('docs/OC22_VALIDATED_BASELINE.md');
const design = read('docs/oc-22h-atmospheric-transitions-design.md');
const controller = read('src/services/atmosphereTransitionController.ts');
const profiles = read('src/services/atmosphereTransitionProfiles.ts');
const featureFlags = read('src/config/oc22Features.ts');
const transitionHook = read('src/hooks/useAtmosphereTransition.ts');
const transitionHost = read('src/components/LivingWeatherAtmosphereHost.tsx');
const transitionAtmosphere = read('src/components/LivingWeatherAtmosphereTransitionV11.tsx');
const transitionSky = read('src/components/CinematicSkyTransitionCanvasV11.tsx');
const foregroundHost = read('src/components/ImmersiveWeatherForegroundHost.tsx');
const transitionForeground = read('src/components/ImmersiveWeatherForegroundTransitionV11.tsx');
const precipitationCanvas = read('src/components/ImmersivePrecipitationCanvas.tsx');
const snowCanvas = read('src/components/SnowFrostCanvas.tsx');
const viteEnv = read('src/vite-env.d.ts');
const packageJson = read('package.json');
const orbCore = read('src/components/OrbiClimateCore.tsx');
const orbCss = read('src/styles/skycore-fx.css');
const hero = read('src/components/WelcomeHeroSection.tsx');

expect(baseline.includes('FROZEN REFERENCE — DO NOT REGRESS'), 'Validated physical baseline guardrail is missing.');
expect(baseline.includes('10633 — SkyOrb Commander Orbital V4'), 'Commander V4 physical baseline is not frozen.');
expect(baseline.includes('10634 — Alerts Inbox UX'), 'Alerts physical baseline is not frozen.');
expect(design.includes('current interpolated visual state'), 'Transition interruption policy must remain explicit in the design.');
expect(design.includes('VISUAL RUNTIME FEATURE-GATED'), 'OC-22H design must state that visual runtime remains feature-gated before physical QA.');

expect(controller.includes('class AtmosphereTransitionController'), 'Transition controller class is missing.');
expect(controller.includes('previous.model'), 'Retargeting must use the sampled current interpolated model.');
expect(controller.includes("previous.phase === 'transitioning'"), 'Interrupted transition handling is missing.');
expect(controller.includes('originSceneWeights = previous.sceneWeights'), 'Interrupted scene-family blends must be preserved exactly at retarget time.');
expect(controller.includes('sceneWeights'), 'Transition snapshot must expose scene-family weights.');
expect(controller.includes('.slice(0, 3)'), 'Scene-family overlap must remain bounded to at most three families.');
expect(controller.includes('cloudFamilyFromWeight'), 'Bounded outgoing cloud-family weight is missing.');
expect(controller.includes('cloudFamilyToWeight'), 'Bounded incoming cloud-family weight is missing.');
expect(controller.includes('wetGlassIntensity'), 'Delayed wet-glass transition channel is missing.');
expect(controller.includes('stormEnergy'), 'Storm transition energy channel is missing for delayed lightning gating.');
expect(controller.includes('precipitationRampStart'), 'Precipitation ramp timing is not consumed by the controller.');
expect(controller.includes('precipitationRampEnd'), 'Precipitation ramp completion is not consumed by the controller.');
expect(controller.includes("target.quality === 'static'"), 'Reduced-motion/static mode must not force animated transitions.');
expect(!controller.includes('document.'), 'Pure transition controller must not own DOM lifecycle or rendering.');
expect(!controller.includes('window.'), 'Pure transition controller must not own browser scheduling.');
expect(!controller.includes('#orbi-climate-core-container'), 'Transition controller must never target Golden Orb internals.');
expect(!controller.includes('OrbiClimateCore'), 'Transition controller must not depend on Golden Orb implementation.');
expect(!controller.includes('WelcomeHeroSection'), 'Transition controller must not depend on protected Hero implementation.');

expect(profiles.includes("'weather-truth' | 'atm-lab' | 'time-phase'"), 'All transition reasons must remain explicit.');
expect(profiles.includes('ATM_LAB_TRANSITION_MULTIPLIER'), 'ATM LAB accelerated QA timing is missing.');
expect(profiles.includes("key('cloudy', 'rain')"), 'Cloudy → rain profile is missing.');
expect(profiles.includes("key('rain', 'storm')"), 'Rain → storm profile is missing.');
expect(profiles.includes("key('storm', 'rain')"), 'Storm → rain profile is missing.');
expect(profiles.includes("key('cloudy', 'clear')"), 'Cloudy → clear profile is missing.');

expect(viteEnv.includes('VITE_OC22_ATMOSPHERIC_TRANSITIONS'), 'Vite transition feature flag declaration is missing.');
expect(featureFlags.includes('VITE_OC22_ATMOSPHERIC_TRANSITIONS'), 'OC-22H runtime must be controlled by an explicit opt-in flag.');
expect(featureFlags.includes("['1', 'true', 'on', 'enabled']"), 'OC-22H feature flag must remain false unless explicitly enabled.');
expect(!featureFlags.includes("?? '1'"), 'OC-22H feature flag must never default to enabled.');
expect(transitionHook.includes('useAtmosphereTransition'), 'Feature-gated transition sampler hook is missing.');
expect(transitionHook.includes('REACT_SAMPLE_INTERVAL_MS = 100'), 'Transition sampler must remain throttled to 10Hz React publication.');
expect(transitionHook.includes('if (!enabled)'), 'Transition sampler must preserve the approved baseline when the feature flag is disabled.');
expect(transitionHook.includes('if (!enabled || !active'), 'Transition sampler must pause expensive scheduling while inactive.');
expect(transitionHook.includes('cancelAnimationFrame(raf)'), 'Transition sampler must cancel scheduled work on lifecycle cleanup.');
expect(transitionHook.includes("return 'time-phase'"), 'Automatic time-phase transition classification is missing.');
expect(!transitionHook.includes('OrbiClimateCore'), 'Transition sampler must not depend on Golden Orb implementation.');
expect(!transitionHook.includes('WelcomeHeroSection'), 'Transition sampler must not depend on protected Hero implementation.');

expect(transitionHost.includes('OC22_ATMOSPHERIC_TRANSITIONS_ENABLED ? ('), 'Atmosphere Host must explicitly branch between V11 and the approved baseline.');
expect(transitionHost.includes('<LivingWeatherAtmosphereTransitionV11'), 'Feature-enabled Host path must mount the V11 transition atmosphere.');
expect(transitionHost.includes('<LivingWeatherAtmosphere'), 'Feature-disabled Host path must retain the approved baseline renderer.');
expect(transitionHost.includes("data-oc22-transitions={OC22_ATMOSPHERIC_TRANSITIONS_ENABLED ? 'enabled' : 'baseline'}"), 'Host must expose transition/baseline diagnostics.');
expect(transitionHost.includes("phaseOverride={debugPhase === 'auto' ? undefined : debugPhase}"), 'Atmosphere Host must preserve the canonical non-destructive phase override contract.');

expect(transitionAtmosphere.includes('useAtmosphereTransition(targetModel, !paused, transitionReason, true)'), 'V11 atmosphere must use the transition sampler only inside the opt-in component.');
expect(transitionAtmosphere.includes('.slice(0, 3)'), 'V11 atmosphere must never render more than three cloud families.');
expect(transitionAtmosphere.includes("transition.phase !== 'stable'"), 'V11 atmosphere must release transient scene-family models after completion.');
expect(transitionAtmosphere.includes('sceneModelsRef.current = new Map([[stableModel.scene, stableModel]])'), 'V11 atmosphere must release outgoing cloud-family state when stable.');
expect(transitionAtmosphere.includes('<NaturalCloudCanvas'), 'V11 must reuse the certified natural-cloud renderer rather than replace its procedural family design.');
expect(transitionAtmosphere.includes('transition.stormEnergy > 0.62'), 'V11 background lightning must be delayed until storm energy crosses a safe threshold.');
expect(!transitionAtmosphere.includes('OrbiClimateCore'), 'V11 atmosphere must not import or manipulate the Golden Orb.');
expect(!transitionAtmosphere.includes('WelcomeHeroSection'), 'V11 atmosphere must not import or manipulate the protected Hero.');

expect(transitionSky.includes('liveStateRef.current'), 'V11 sky must consume interpolated values through a live ref rather than recreating its Canvas each transition tick.');
expect(transitionSky.includes("android ? 8"), 'V11 sky must retain the certified Android 8 FPS cap.');
expect(transitionSky.includes("android ? 1.1"), 'V11 sky must retain the certified Android DPR cap.');
expect(transitionSky.includes('weightedSceneExposure'), 'V11 sky exposure must blend scene-family weights rather than hard-switch.');
expect(transitionSky.includes('sunnyDayWeight'), 'V11 clear-sky treatment must blend continuously by clear-family weight.');
expect(transitionSky.includes('snowWeight'), 'V11 snow-sky treatment must blend continuously by snow-family weight.');
expect(transitionSky.includes('}, [quality, active]);'), 'V11 sky Canvas lifecycle must not restart for every interpolated weather sample.');

expect(foregroundHost.includes('if (OC22_ATMOSPHERIC_TRANSITIONS_ENABLED)'), 'Foreground Host must explicitly preserve baseline rendering unless OC-22H is enabled.');
expect(foregroundHost.includes('<ImmersiveWeatherForegroundTransitionV11'), 'Feature-enabled foreground path must mount V11.');
expect(foregroundHost.includes('<ImmersivePrecipitationCanvas'), 'Feature-disabled foreground path must retain the certified precipitation renderer.');
expect(foregroundHost.includes('<SnowFrostCanvas'), 'Feature-disabled foreground path must retain the certified snow/frost renderer.');
expect(foregroundHost.indexOf('if (OC22_ATMOSPHERIC_TRANSITIONS_ENABLED)') < foregroundHost.indexOf('if (!snowScene && !rainScene) return null;'), 'V11 foreground must receive dry targets so outgoing precipitation can fade instead of disappearing early.');

expect(transitionForeground.includes('useAtmosphereTransition(targetModel, active, transitionReason, true)'), 'V11 foreground must consume the same transition-controller contract.');
expect(transitionForeground.includes('.slice(0, 2)'), 'V11 foreground overlap must remain bounded to at most two wet families.');
expect(transitionForeground.includes('sceneModelsRef.current = new Map([[targetModel.scene, targetModel]])'), 'V11 foreground must release transient wet-family state after settling.');
expect(transitionForeground.includes('<ImmersivePrecipitationCanvas'), 'V11 foreground must reuse the certified V6 precipitation renderer.');
expect(transitionForeground.includes('<SnowFrostCanvas'), 'V11 foreground must reuse the certified snow/frost renderer.');
expect(transitionForeground.includes('transition.stormEnergy > 0.62'), 'V11 foreground must delay storm lightning until storm energy crosses the safe threshold.');
expect(transitionForeground.includes('transition.wetGlassIntensity'), 'V11 foreground must use the delayed wet-glass transition channel.');
expect(transitionForeground.includes("const canvasScene: AtmosphereScene = lightningReady ? 'storm' : 'rain'"), 'V11 must prevent the certified V6 renderer from flashing lightning before storm formation.');
expect(!transitionForeground.includes('OrbiClimateCore'), 'V11 foreground must not import or manipulate the Golden Orb.');
expect(!transitionForeground.includes('WelcomeHeroSection'), 'V11 foreground must not import or manipulate the protected Hero.');

expect(precipitationCanvas.includes("android ? 24"), 'Certified V6 precipitation Android FPS cap must remain 24.');
expect(precipitationCanvas.includes("android ? 1.35"), 'Certified V6 precipitation Android DPR cap must remain 1.35.');
expect(snowCanvas.includes('? 18'), 'Certified snow/frost Android FPS cap must remain 18.');
expect(snowCanvas.includes("android ? 1.05"), 'Certified snow/frost Android DPR cap must remain 1.05.');

for (const forbidden of ['transform:none', 'animation:none', 'backdrop-filter', 'mix-blend-mode', 'translateZ']) {
  expect(!controller.includes(forbidden), `Transition controller contains forbidden compositor token: ${forbidden}`);
  expect(!profiles.includes(forbidden), `Transition profiles contain forbidden compositor token: ${forbidden}`);
  expect(!transitionHook.includes(forbidden), `Transition sampler contains forbidden compositor token: ${forbidden}`);
  expect(!transitionAtmosphere.includes(forbidden), `V11 atmosphere contains forbidden compositor token: ${forbidden}`);
  expect(!transitionSky.includes(forbidden), `V11 sky contains forbidden compositor token: ${forbidden}`);
  expect(!transitionForeground.includes(forbidden), `V11 foreground contains forbidden compositor token: ${forbidden}`);
}

expect(packageJson.includes('ui:verify-atmospheric-transitions'), 'Dedicated OC-22H verification command is not wired into package scripts.');
expect(packageJson.includes('verify-atmospheric-transitions-v11.mjs'), 'OC-22H source gate is not wired into package scripts.');
expect(packageJson.includes('test-atmospheric-transitions.ts'), 'OC-22H transition tests are not wired into package scripts.');

// Guardrail: transition implementation must stay outside frozen Golden Orb files.
for (const protectedSource of [orbCore, orbCss, hero]) {
  expect(!protectedSource.includes('AtmosphereTransitionController'), 'Frozen Golden Orb surface imports the OC-22H controller.');
  expect(!protectedSource.includes('atmosphereTransitionProfiles'), 'Frozen Golden Orb surface imports OC-22H transition profiles.');
  expect(!protectedSource.includes('useAtmosphereTransition'), 'Frozen Golden Orb surface imports the OC-22H transition sampler.');
  expect(!protectedSource.includes('LivingWeatherAtmosphereTransitionV11'), 'Frozen Golden Orb surface imports the OC-22H V11 atmosphere renderer.');
  expect(!protectedSource.includes('ImmersiveWeatherForegroundTransitionV11'), 'Frozen Golden Orb surface imports the OC-22H V11 foreground renderer.');
}

console.log('OC-22H Atmospheric Transitions source gate: PASS');

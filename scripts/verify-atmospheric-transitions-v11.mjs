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
const packageJson = read('package.json');
const orbCore = read('src/components/OrbiClimateCore.tsx');
const orbCss = read('src/styles/skycore-fx.css');
const hero = read('src/components/WelcomeHeroSection.tsx');

expect(baseline.includes('FROZEN REFERENCE — DO NOT REGRESS'), 'Validated physical baseline guardrail is missing.');
expect(baseline.includes('10633 — SkyOrb Commander Orbital V4'), 'Commander V4 physical baseline is not frozen.');
expect(baseline.includes('10634 — Alerts Inbox UX'), 'Alerts physical baseline is not frozen.');
expect(design.includes('current interpolated visual state'), 'Transition interruption policy must remain explicit in the design.');

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

for (const forbidden of ['transform:none', 'animation:none', 'backdrop-filter', 'mix-blend-mode', 'translateZ']) {
  expect(!controller.includes(forbidden), `Transition controller contains forbidden compositor token: ${forbidden}`);
  expect(!profiles.includes(forbidden), `Transition profiles contain forbidden compositor token: ${forbidden}`);
}

expect(packageJson.includes('ui:verify-atmospheric-transitions'), 'Dedicated OC-22H verification command is not wired into package scripts.');
expect(packageJson.includes('verify-atmospheric-transitions-v11.mjs'), 'OC-22H source gate is not wired into package scripts.');
expect(packageJson.includes('test-atmospheric-transitions.ts'), 'OC-22H transition tests are not wired into package scripts.');

// Guardrail: transition implementation must stay outside frozen Golden Orb files.
for (const protectedSource of [orbCore, orbCss, hero]) {
  expect(!protectedSource.includes('AtmosphereTransitionController'), 'Frozen Golden Orb surface imports the OC-22H controller.');
  expect(!protectedSource.includes('atmosphereTransitionProfiles'), 'Frozen Golden Orb surface imports OC-22H transition profiles.');
}

console.log('OC-22H Atmospheric Transitions source gate: PASS');

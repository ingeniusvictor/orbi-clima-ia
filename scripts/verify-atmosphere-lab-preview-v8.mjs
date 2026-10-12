import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(path, 'utf8');
const fail = (message) => {
  console.error(`OC-22 Atmosphere Lab Preview V8: FAIL\n${message}`);
  process.exit(1);
};
const expect = (condition, message) => {
  if (!condition) fail(message);
};

const wrapper = read('src/components/AtmosphereLabOverlay.tsx');
const lab = read('src/components/AtmosphereLabOverlayV2.tsx');
const preview = read('src/components/AtmosphereLabPreviewScene.tsx');
const debug = read('src/services/weatherAtmosphereDebugService.ts');

expect(wrapper.includes('AtmosphereLabOverlayV2'), 'AtmosphereLabOverlay wrapper must route through V2.');
expect(lab.includes('AtmosphereLabPreviewScene'), 'ATM LAB must mount the complete preview scene.');
expect(lab.includes('setAtmosphereDebugPreset(item.id)'), 'Preset buttons must publish the debug scene immediately.');
expect(lab.includes('setPreset(item.id)'), 'Preset buttons must update local preview state immediately.');
expect(lab.includes('applyAtmosphereDebugPreset(bundle.current, preset)'), 'Preview weather must be recomputed from the selected preset.');
expect(lab.includes('Preview en vivo'), 'ATM LAB must identify the preview as live.');
expect(preview.includes('LivingWeatherAtmosphere'), 'Preview must include the rear weather atmosphere.');
expect(preview.includes('PreviewPrecipitationCanvas'), 'Preview must include foreground precipitation.');
expect(preview.includes("scene === 'storm'"), 'Preview must render storm-specific behavior.');
expect(preview.includes('createLinearGradient'), 'Preview rain must keep depth gradients.');
expect(preview.includes('createRadialGradient'), 'Preview glass droplets must keep optical shading.');
expect(preview.includes('ResizeObserver'), 'Preview canvas must size itself to the ATM LAB window rather than the phone viewport.');
expect(!preview.includes('#orbi-climate-core-container'), 'ATM LAB preview must remain independent from Golden Orb internals.');

// OC-22M: ATM LAB is also a semantic QA tool. Forced scenes must never carry
// a stale LIVE label or precipitation semantics from the previous real scene.
expect(debug.includes("{ id: 'fog', label: 'Niebla'"), 'ATM LAB must expose first-class fog for physical phenomenon QA.');
expect(debug.includes("conditionLabel: 'Despejado'"), 'Sunny/night debug scenes must publish coherent exact labels.');
expect(debug.includes("conditionLabel: 'Parcialmente nublado'"), 'Partly cloudy debug scene must publish its exact label.');
expect(debug.includes("conditionLabel: 'Cubierto'"), 'Cloudy debug scene must publish the overcast label.');
expect(debug.includes("conditionLabel: 'Lluvia moderada'"), 'Rain debug scene must publish a concrete intensity.');
expect(debug.includes("precipitationKind: 'rain'"), 'Rain debug scene must publish rain semantics.');
expect(debug.includes("conditionLabel: 'Nevada moderada'"), 'Snow debug scene must publish a concrete intensity.');
expect(debug.includes("precipitationKind: 'snow'"), 'Snow debug scene must publish snow semantics.');
expect(debug.includes("weatherCode: 95"), 'Storm debug scene must publish a coherent WMO storm code.');
expect(debug.includes("weatherCode: undefined"), 'Non-WMO synthetic debug families must clear stale provider weather codes.');

console.log('OC-22 Atmosphere Lab Preview V8 gate: PASS (visual + phenomenon semantics)');

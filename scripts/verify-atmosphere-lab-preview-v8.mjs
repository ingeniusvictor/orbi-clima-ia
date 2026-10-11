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

expect(wrapper.includes('AtmosphereLabOverlayV2'), 'AtmosphereLabOverlay wrapper must route through V2.');
expect(lab.includes('AtmosphereLabPreviewScene'), 'ATM LAB must mount the complete preview scene.');
expect(lab.includes('key={`${preset}-${weatherRevision}`}'), 'Preview must remount immediately when the preset changes.');
expect(lab.includes('Preview en vivo'), 'ATM LAB must identify the preview as live.');
expect(preview.includes('LivingWeatherAtmosphere'), 'Preview must include the rear weather atmosphere.');
expect(preview.includes('PreviewPrecipitationCanvas'), 'Preview must include foreground precipitation.');
expect(preview.includes("scene === 'storm'"), 'Preview must render storm-specific behavior.');
expect(preview.includes('createLinearGradient'), 'Preview rain must keep depth gradients.');
expect(preview.includes('createRadialGradient'), 'Preview glass droplets must keep optical shading.');
expect(preview.includes('ResizeObserver'), 'Preview canvas must size itself to the ATM LAB window rather than the phone viewport.');
expect(!preview.includes('#orbi-climate-core-container'), 'ATM LAB preview must remain independent from Golden Orb internals.');

console.log('OC-22 Atmosphere Lab Preview V8 gate: PASS');

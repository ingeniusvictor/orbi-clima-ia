import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(path, 'utf8');
const fail = (message) => {
  console.error(`OC-22D Immersive Precipitation V5: FAIL\n${message}`);
  process.exit(1);
};
const expect = (condition, message) => {
  if (!condition) fail(message);
};

const main = read('src/main.tsx');
const host = read('src/components/ImmersiveWeatherForegroundHost.tsx');
const canvas = read('src/components/ImmersivePrecipitationCanvas.tsx');
const css = read('src/styles/immersive-weather-foreground.css');

expect(main.includes('<ImmersiveWeatherForegroundHost />'), 'Foreground weather host must be mounted beside App at root.');
expect(host.includes("model.scene === 'rain'"), 'Foreground precipitation must react to rain scenes.');
expect(host.includes("model.scene === 'storm'"), 'Foreground precipitation must react to storm scenes.');
expect(host.includes('precipitationStrength'), 'Foreground precipitation must use measured/model precipitation strength.');
expect(host.includes('MutationObserver'), 'Foreground effect must stop when Home unmounts.');
expect(host.includes('orbi_clima_first_launch_completed_v1'), 'Foreground weather must stay out of onboarding.');
expect(canvas.includes('requestAnimationFrame'), 'Foreground rain must animate inside canvas, not through DOM rain sprites.');
expect(canvas.includes('createLinearGradient'), 'Rain streaks must have depth/fade gradients.');
expect(canvas.includes('createRadialGradient'), 'Glass droplets must use optical bead shading.');
expect(canvas.includes('GlassDrop'), 'Screen-glass droplet model is missing.');
expect(canvas.includes('RainParticle'), 'Foreground rain particle model is missing.');
expect(canvas.includes("quality === 'static'"), 'Reduced-motion/static mode must degrade precipitation motion.');
expect(canvas.includes("document.visibilityState"), 'Foreground animation must stop while the app is hidden.');
expect(css.includes('z-index: 24'), 'Foreground rain must sit above the z-10 app glass surfaces.');
expect(css.includes('pointer-events: none'), 'Foreground weather must never block scrolling or taps.');
expect(!css.includes('backdrop-filter'), 'Foreground weather must not use backdrop-filter.');
expect(!css.includes('mix-blend-mode'), 'Foreground weather must not use mix-blend-mode.');
expect(!css.includes('#orbi-climate-core-container'), 'Foreground weather must never target Golden Orb internals.');
expect(!canvas.includes('orbi-climate-core-container'), 'Canvas renderer must remain independent from Golden Orb internals.');

console.log('OC-22D Immersive Precipitation V5 gate: PASS');

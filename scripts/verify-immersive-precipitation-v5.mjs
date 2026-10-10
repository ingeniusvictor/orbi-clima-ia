import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(path, 'utf8');
const fail = (message) => {
  console.error(`OC-22E Cinematic Precipitation V6: FAIL\n${message}`);
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
expect(canvas.includes('slideThreshold'), 'Wet-glass drops must accumulate weight before sliding.');
expect(canvas.includes('resetGlassDrop'), 'Wet-glass drops must recycle after running off the virtual glass.');
expect(canvas.includes('mergeTick % 12'), 'Wet-glass drops must support low-frequency coalescence without per-frame O(n²) work.');
expect(canvas.includes('Math.sqrt(a.radius * a.radius + b.radius * b.radius)'), 'Coalescing drops must conserve visible drop area approximately.');
expect(canvas.includes('const gust = clamp01'), 'Rain direction/speed must react to cinematic gust modulation.');
expect(canvas.includes('dynamicWind'), 'Rain angle must vary with wind and gust strength.');
expect(canvas.includes('lightningFlash'), 'Storm scenes must include irregular global exposure flashes.');
expect(canvas.includes("scene === 'storm'"), 'Cinematic flash logic must remain storm-only.');
expect(canvas.includes("quality === 'static'"), 'Reduced-motion/static mode must degrade precipitation motion.');
expect(canvas.includes('document.visibilityState'), 'Foreground animation must stop while the app is hidden.');

expect(css.includes('z-index: 24'), 'Foreground rain must sit above the z-10 app glass surfaces.');
expect(css.includes('pointer-events: none'), 'Foreground weather must never block scrolling or taps.');
expect(!css.includes('backdrop-filter'), 'Foreground weather must not use backdrop-filter.');
expect(!css.includes('mix-blend-mode'), 'Foreground weather must not use mix-blend-mode.');
expect(!css.includes('#orbi-climate-core-container'), 'Foreground weather must never target Golden Orb internals.');
expect(!canvas.includes('orbi-climate-core-container'), 'Canvas renderer must remain independent from Golden Orb internals.');
expect(!canvas.includes('filter ='), 'Cinematic canvas must not rely on Canvas filter/blur effects on Android.');

console.log('OC-22E Cinematic Precipitation V6 gate: PASS');

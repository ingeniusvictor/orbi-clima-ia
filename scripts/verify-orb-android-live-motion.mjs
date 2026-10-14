import { readFileSync, existsSync } from 'node:fs';

const clipCss = readFileSync('src/styles/orb-android-clip-guard.css', 'utf8');
const contourService = readFileSync('src/services/androidGoldenOrbFluidContour.ts', 'utf8');
const main = readFileSync('src/main.tsx', 'utf8');
const orb = readFileSync('src/components/OrbiClimateCore.tsx', 'utf8');
const welcome = readFileSync('src/components/WelcomeHeroSection.tsx', 'utf8');

const fail = (message) => {
  console.error(`Android Golden Orb live-motion gate: FAIL\n${message}`);
  process.exit(1);
};
const expect = (condition, message) => {
  if (!condition) fail(message);
};

expect(clipCss.includes('clip-path: circle(50% at 50% 50%)'), 'Android Orb core must keep the stable circular clip that eliminated black compositor tiles.');
expect(!clipCss.includes('@keyframes'), 'Android Orb core guard must not add synthetic animation to the real Orb.');
expect(!clipCss.includes('::after'), 'Android Orb core guard must not add a second optical surface inside the Orb.');

expect(main.includes('initializeAndroidGoldenOrbFluidContour'), 'Android Golden Orb contour bootstrap must be initialized.');
expect(!main.includes('initializeAndroidGoldenOrbFluidSkin'), 'Legacy full duplicate Orb skin must remain removed.');
expect(!main.includes('orb-android-fluid-skin.css'), 'Legacy full duplicate Orb stylesheet must remain removed.');
expect(!existsSync('src/services/androidGoldenOrbFluidSkin.ts'), 'Legacy duplicate Orb skin service must not exist.');
expect(!existsSync('src/styles/orb-android-fluid-skin.css'), 'Legacy duplicate Orb skin stylesheet must not exist.');

expect(contourService.includes('orbi-android-fluid-contour-canvas'), 'Canvas contour service must create the Android fluid contour.');
expect(contourService.includes("globalCompositeOperation = 'destination-out'"), 'Canvas contour must punch out the stable Orb interior so it can never become a second full Orb.');
expect(contourService.includes('orb.style.borderRadius'), 'Canvas contour should mirror the original Motion border-radius when available.');
expect(contourService.includes('MAX_FPS = 24'), 'Android contour animation must remain frame-rate capped.');
expect(contourService.includes("pointerEvents: 'none'"), 'Canvas contour must never intercept touches.');
expect(contourService.includes("zIndex: '9'"), 'Canvas contour must stay behind the protected z-10 Orb core.');

// 10615: make the contour visibly lava-like while preserving the punched-out center.
expect(contourService.includes('widthScale = 1.075'), 'Lava contour must visibly extend beyond the stable Orb horizontally.');
expect(contourService.includes('heightScale = 1.065'), 'Lava contour must visibly extend beyond the stable Orb vertically.');
expect(contourService.includes('driftX ='), 'Lava contour must retain slow horizontal viscous drift.');
expect(contourService.includes('driftY ='), 'Lava contour must retain slow vertical viscous drift.');
expect(contourService.includes('stableRadius * 0.972'), 'Lava contour must keep the real Orb interior punched out with the approved safety inset.');
expect(contourService.includes('pad = Math.ceil(cssSize * 0.17)'), 'Canvas must reserve enough space for larger fluid lobes without clipping.');

for (const geometry of [
  '48% 52% 55% 45% / 48% 54% 46% 52%',
  '53% 47% 43% 57% / 55% 45% 55% 45%',
  '45% 55% 58% 42% / 42% 58% 42% 58%',
  '51% 49% 46% 54% / 53% 47% 53% 47%',
]) {
  expect(contourService.includes(geometry), `Canvas fallback is missing original Golden Orb geometry: ${geometry}`);
}

for (const forbidden of ['transform: none', 'display: none', 'opacity: 0 !important']) {
  expect(!clipCss.includes(forbidden), `Golden Orb Android guard must not contain ${forbidden}.`);
}
expect(!/(^|\n)\s*filter\s*:\s*none\b/m.test(clipCss), 'Golden Orb Android guard must not disable direct CSS filter effects.');
expect(!clipCss.includes('.blur-3xl'), 'Golden Orb Android guard must not disable the outer halo selectively.');
expect(!clipCss.includes('.blur-2xl'), 'Golden Orb Android guard must not disable the secondary halo selectively.');
expect(!clipCss.includes('.mix-blend-screen'), 'Golden Orb Android guard must not target the internal blend layer.');
expect(!clipCss.includes('.mix-blend-overlay'), 'Golden Orb Android guard must not target storm blend FX.');

// OC-22M: the broad family remains responsible for visual theme, while Weather
// Truth owns the exact human label. This prevents rain, fog, snow, cloud and
// storm variants from collapsing back into generic Orb copy.
expect(orb.includes('conditionLabel?: string'), 'Golden Orb must accept an exact Weather Truth condition label.');
expect(orb.includes('displayConditionLabel'), 'Golden Orb must resolve the exact condition label before falling back to family copy.');
expect(orb.includes("conditionLabel?.trim()"), 'Golden Orb must ignore empty semantic labels safely.');
expect(welcome.includes('conditionLabel={conditionText}'), 'Welcome hero must route its exact condition text into the Golden Orb.');
expect(welcome.includes('Fenómeno actual'), 'Weather Truth diagnostic must describe the exact current phenomenon.');

console.log('Android Golden Orb live-motion gate: PASS (10615 motion preserved + OC-22M exact phenomenon labels)');

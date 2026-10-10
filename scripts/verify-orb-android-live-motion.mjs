import { readFileSync } from 'node:fs';

const css = readFileSync('src/styles/orb-android-clip-guard.css', 'utf8');
const fail = (message) => {
  console.error(`Android Golden Orb live-motion gate: FAIL\n${message}`);
  process.exit(1);
};
const expect = (condition, message) => {
  if (!condition) fail(message);
};

expect(css.includes('clip-path: circle(50% at 50% 50%)'), 'Android Orb must keep the stable circular clip that eliminated black compositor tiles.');
expect(css.includes('orbi-android-safe-breathe'), 'Android Orb must retain a visible safe breathing motion.');
expect(css.includes('orbi-android-liquid-light'), 'Android Orb must retain internal liquid-light motion.');
expect(css.includes('orbi-android-optical-drift'), 'Android Orb must retain moving optical highlight depth.');

for (const forbidden of [
  'transform: none',
  'display: none',
  'filter: none',
  'opacity: 0 !important',
]) {
  expect(!css.includes(forbidden), `Orb live-motion guard must not contain ${forbidden}.`);
}

expect(!css.includes('.blur-3xl'), 'Android Orb live-motion guard must not disable the outer halo selectively.');
expect(!css.includes('.blur-2xl'), 'Android Orb live-motion guard must not disable the secondary halo selectively.');
expect(!css.includes('.mix-blend-screen'), 'Android Orb live-motion guard must not target the internal blend layer.');
expect(!css.includes('.mix-blend-overlay'), 'Android Orb live-motion guard must not target storm blend FX.');

console.log('Android Golden Orb live-motion gate: PASS');

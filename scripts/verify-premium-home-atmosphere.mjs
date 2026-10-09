import fs from 'node:fs';

const mustRead = (path) => {
  if (!fs.existsSync(path)) throw new Error(`Missing required file: ${path}`);
  return fs.readFileSync(path, 'utf8');
};

const main = mustRead('src/main.tsx');
const css = mustRead('src/styles/home-atmosphere.css');
const density = mustRead('src/styles/home-density.css');
const hero = mustRead('src/components/WelcomeHeroSection.tsx');
const orb = mustRead('src/components/OrbiClimateCore.tsx');

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

assert(main.includes("import './styles/home-atmosphere.css';"), 'Premium atmosphere stylesheet is not loaded by src/main.tsx');
assert(main.includes("import './styles/home-density.css';"), 'Compact mobile Home density stylesheet is not loaded after atmosphere');
assert(css.includes('#orbi-mobile-home-screen'), 'Home atmosphere root selector missing');
assert(css.includes(':has(#welcome-hero-section .from-amber-300)'), 'Sunny weather-reactive atmosphere mapping missing');
assert(css.includes(':has(#welcome-hero-section .from-blue-400)'), 'Rain weather-reactive atmosphere mapping missing');
assert(css.includes('#welcome-hero-section::before'), 'Hero aurora layer missing');
assert(css.includes('backdrop-filter: blur(18px)'), 'Premium glass blur missing');
assert(css.includes('@media (prefers-reduced-motion: reduce)'), 'Reduced-motion guard missing');
assert(css.includes('pointer-events: none'), 'Atmosphere layers must remain non-interactive');

assert(density.includes('@media (max-width: 640px)'), 'Phone-specific compact Home density breakpoint missing');
assert(density.includes('#orbi-mobile-home-screen > * + *'), 'Compact Home inter-section rhythm guard missing');
assert(density.includes('#orbi-mobile-home-screen > #welcome-hero-section'), 'Hero shell density guard missing');
assert(density.includes('#orbi-mobile-home-screen > section:nth-of-type(2) > .grid'), 'Duplicate recommendation metric-row suppression missing');
assert(density.includes('#orbi-mobile-home-screen > section:nth-of-type(3) p:last-of-type'), 'Compact risk-card duplicate-copy suppression missing');
assert(!density.includes('OrbiClimateCore'), 'Home density stylesheet must not target the protected Golden Orb component');
assert(!density.includes('skycore-fx'), 'Home density stylesheet must not target protected Golden Orb CSS internals');

assert(hero.includes('<OrbiClimateCore'), 'WelcomeHeroSection must still delegate Orb rendering to OrbiClimateCore');
assert(orb.includes('export default function OrbiClimateCore') || orb.includes('export default'), 'Protected Orb component is not structurally present');

console.log('OC-20B Premium Home + compact density source gate: PASS');

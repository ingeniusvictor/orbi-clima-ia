import fs from 'node:fs';

const mustRead = (path) => {
  if (!fs.existsSync(path)) throw new Error(`Missing required file: ${path}`);
  return fs.readFileSync(path, 'utf8');
};

const main = mustRead('src/main.tsx');
const css = mustRead('src/styles/home-atmosphere.css');
const hero = mustRead('src/components/WelcomeHeroSection.tsx');
const orb = mustRead('src/components/OrbiClimateCore.tsx');

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

assert(main.includes("import './styles/home-atmosphere.css';"), 'Premium atmosphere stylesheet is not loaded by src/main.tsx');
assert(css.includes('#orbi-mobile-home-screen'), 'Home atmosphere root selector missing');
assert(css.includes(':has(#welcome-hero-section .from-amber-300)'), 'Sunny weather-reactive atmosphere mapping missing');
assert(css.includes(':has(#welcome-hero-section .from-blue-400)'), 'Rain weather-reactive atmosphere mapping missing');
assert(css.includes('#welcome-hero-section::before'), 'Hero aurora layer missing');
assert(css.includes('backdrop-filter: blur(18px)'), 'Premium glass blur missing');
assert(css.includes('@media (prefers-reduced-motion: reduce)'), 'Reduced-motion guard missing');
assert(css.includes('pointer-events: none'), 'Atmosphere layers must remain non-interactive');
assert(hero.includes('<OrbiClimateCore'), 'WelcomeHeroSection must still delegate Orb rendering to OrbiClimateCore');
assert(orb.includes('export default function OrbiClimateCore') || orb.includes('export default'), 'Protected Orb component is not structurally present');

console.log('OC-20A Premium Home Atmosphere source gate: PASS');

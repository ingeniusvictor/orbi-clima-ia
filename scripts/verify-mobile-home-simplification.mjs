import fs from 'node:fs';

const file = 'src/components/MobileHomeScreen.tsx';
const source = fs.readFileSync(file, 'utf8');

const failures = [];
const requireText = (text, label) => {
  if (!source.includes(text)) failures.push(`Missing ${label}: ${text}`);
};
const forbidText = (text, label) => {
  if (source.includes(text)) failures.push(`Forbidden ${label}: ${text}`);
};

requireText('const [showAdvanced, setShowAdvanced] = useState(false);', 'advanced analysis closed-by-default state');
requireText('id="home-advanced-analysis"', 'advanced analysis container');
requireText('{showAdvanced && (', 'advanced analysis conditional rendering');
requireText('WeatherIntelligencePanel', 'advanced Weather Intelligence capability');
requireText('SkyCoreSummaryCard', 'advanced SkyCore summary capability');
requireText('SkyCoreTrustCard', 'advanced source trust capability');
requireText('ClimateRiskPanel risks={activeRisks}', 'advanced full risk capability');
requireText("setActiveProfile('person')", 'compact Persona selector');
requireText("setActiveProfile('field_tech')", 'compact Technical selector');
requireText('compactHourlyForecast = hourlyForecast.slice(0, 4)', 'compact hourly forecast');
requireText('Ver alertas y detalles', 'compact alerts CTA');
requireText('{isLocationExpanded && (', 'location manager on-demand rendering');

forbidText('Smart Action Layer', 'duplicated Smart Action Layer');
forbidText('Widget Sincronizado', 'duplicated widget sync card');
forbidText("import ProfileSelector", 'large ProfileSelector import');
forbidText("import HomeDailyRecommendation", 'large HomeDailyRecommendation import');

const advancedIndex = source.indexOf('{showAdvanced && (');
const intelligenceIndex = source.indexOf('<WeatherIntelligencePanel', advancedIndex);
if (advancedIndex < 0 || intelligenceIndex < advancedIndex) {
  failures.push('WeatherIntelligencePanel must remain behind the advanced-analysis disclosure.');
}

const heroIndex = source.indexOf('<WelcomeHeroSection');
const forecastIndex = source.indexOf('id="home-forecast-title"');
const recommendationIndex = source.indexOf('id="home-recommendation-title"');
const riskIndex = source.indexOf('id="home-risk-title"');
if (!(heroIndex >= 0 && forecastIndex > heroIndex && recommendationIndex > forecastIndex && riskIndex > recommendationIndex)) {
  failures.push('Essential Home order must remain Hero -> Forecast -> Recommendation -> Alerts/Risks.');
}

if (failures.length) {
  console.error('OC-17 Mobile Home Experience gate: FAIL');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('OC-17 Mobile Home Experience gate: PASS');
console.log('Essential-first hierarchy preserved; advanced diagnostics remain opt-in.');

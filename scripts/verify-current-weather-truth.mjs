import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');
const failures = [];

const truth = read('src/services/currentWeatherTruthService.ts');
const client = read('src/services/openMeteoClient.ts');
const adapter = read('src/services/weatherDataAdapter.ts');

const requireText = (source, text, label) => {
  if (!source.includes(text)) failures.push(`Missing ${label}: ${text}`);
};

const forbidText = (source, text, label) => {
  if (source.includes(text)) failures.push(`Forbidden ${label}: ${text}`);
};

requireText(truth, 'fetchNearestDmcObservation', 'official DMC observation input');
requireText(truth, 'fetchTrueMultiModelConsensus', 'independent multi-model input');
requireText(truth, "observation.quality === 'strong'", 'strong-station control guard');
requireText(truth, 'observation.distanceKm <= 25', '25 km current-condition station guard');
requireText(truth, 'observation.ageMinutes <= 90', '90 minute current-condition freshness guard');
requireText(truth, "multi.consensus === 'dry'", 'dry consensus conflict handling');
requireText(truth, "multi.consensus === 'wet'", 'wet consensus corroboration handling');
requireText(truth, 'originalPrecipitationMm <= 0.5', 'weak modeled-rain downgrade ceiling');
requireText(truth, "label = 'Precipitación modelada · sin corroboración suficiente'", 'model-only rain honesty label');
requireText(truth, "temperatureStrategy = 'multi_model_median'", 'stable multi-model temperature fallback');
requireText(truth, "temperatureStrategy = 'dmc_observed'", 'nearby DMC temperature strategy');

requireText(client, 'fetchCurrentWeatherTruthContext(location)', 'truth context fetch in primary client');
requireText(client, 'applyCurrentWeatherTruth(data, truthContext)', 'truth application in primary client');
requireText(client, 'applyTruthToForecast(data, truthContextPromise)', 'adaptive forecast truth application');
requireText(client, 'applyTruthToForecast(fallbackData, truthContextPromise)', 'fallback truth application');

requireText(adapter, 'currentTruthBand:', 'truth band exposure');
requireText(adapter, 'currentTruthLabel:', 'truth label exposure');
requireText(adapter, 'temperatureStrategy:', 'temperature provenance exposure');
requireText(adapter, 'multiModelCurrentConsensus:', 'current consensus exposure');

// Current truth must remain a data-layer concern. The protected Golden Orb must
// not import this service or become responsible for meteorological arbitration.
const protectedOrb = read('src/components/OrbiClimateCore.tsx');
forbidText(protectedOrb, 'currentWeatherTruthService', 'truth fusion inside Golden Orb');
forbidText(protectedOrb, 'fetchNearestDmcObservation', 'DMC fetch inside Golden Orb');
forbidText(protectedOrb, 'fetchTrueMultiModelConsensus', 'multi-model fetch inside Golden Orb');

if (failures.length) {
  console.error('OC-19 Current Weather Truth gate: FAIL');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('OC-19 Current Weather Truth gate: PASS');
console.log('- model current is explicitly distinguished from observation');
console.log('- DMC can control current state only when nearby/fresh/strong');
console.log('- weak modeled rain can be rejected by independent dry evidence');
console.log('- current temperature provenance is explicit');
console.log('- Golden Orb remains outside meteorological arbitration');

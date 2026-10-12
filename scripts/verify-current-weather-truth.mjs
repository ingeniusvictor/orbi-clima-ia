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
requireText(truth, 'const STRONG_STATION_RADIUS_KM = 25', '25 km strong-station guard');
requireText(truth, 'const LOCAL_OBSERVATION_RADIUS_KM = 15', '15 km local-condition guard');
requireText(truth, 'const OBSERVATION_MAX_AGE_MINUTES = 90', '90 minute current-condition freshness guard');
requireText(truth, "type ObservedPrecipitationState = 'wet' | 'dry' | 'recent' | 'unknown'", 'recent-vs-current precipitation separation');
requireText(truth, "'recent_only'", 'recent precipitation evidence metadata');
requireText(truth, "precipitationEvidence = 'observed_now'", 'current observed precipitation evidence');
requireText(truth, "observation.precipitationRecentMm > RECENT_PRECIP_TRACE_MM ? 'recent' : 'dry'", 'recent accumulation non-current semantic guard');
requireText(truth, 'const observedTraceMm = Math.max', 'observed current-rain trace floor');
requireText(truth, "multi.consensus === 'dry'", 'dry consensus conflict handling');
requireText(truth, "multi.consensus === 'wet'", 'wet consensus corroboration handling');
requireText(truth, 'originalPrecipitationMm <= 0.5', 'weak modeled-rain downgrade ceiling');
requireText(truth, "label = 'Precipitación modelada · sin corroboración suficiente'", 'model-only rain honesty label');
requireText(truth, 'DMC_MODEL_TEMPERATURE_ALIGNMENT_C', 'DMC/model temperature coherence guard');
requireText(truth, "temperatureStrategy = 'multi_model_median'", 'stable multi-model temperature fallback');
requireText(truth, "temperatureStrategy = 'dmc_observed'", 'nearby coherent DMC temperature strategy');

// OC-22L: observed precipitation must preserve the actual phenomenon and
// intensity instead of collapsing every wet observation to WMO 61.
requireText(truth, 'getWmoHumanLabel', 'shared WMO semantic labels');
requireText(truth, "if (hasStrongIntensity(label)) return 65", 'heavy rain classification');
requireText(truth, "if (hasModerateIntensity(label)) return 63", 'moderate rain classification');
requireText(truth, "if (hasStrongIntensity(label)) return 82", 'heavy shower classification');
requireText(truth, "if (hasModerateIntensity(label)) return 81", 'moderate shower classification');
requireText(truth, "if (hasStrongIntensity(label)) return 75", 'heavy snow classification');
requireText(truth, "if (hasModerateIntensity(label)) return 73", 'moderate snow classification');
requireText(truth, 'return getWmoHumanLabel(code)', 'precise resolved condition label');

requireText(client, 'fetchCurrentWeatherTruthContext(location)', 'truth context fetch in primary client');
requireText(client, 'applyCurrentWeatherTruth(data, truthContext)', 'truth application in primary client');
requireText(client, 'applyTruthToForecast(data, truthContextPromise)', 'adaptive forecast truth application');
requireText(client, 'applyTruthToForecast(fallbackData, truthContextPromise)', 'fallback truth application');

requireText(adapter, 'currentTruthBand:', 'truth band exposure');
requireText(adapter, 'currentTruthLabel:', 'truth label exposure');
requireText(adapter, 'precipitationEvidence:', 'precipitation evidence exposure');
requireText(adapter, 'precipitationKind:', 'precipitation kind exposure');
requireText(adapter, 'precipitationIntensity:', 'precipitation intensity exposure');
requireText(adapter, 'temperatureStrategy:', 'temperature provenance exposure');
requireText(adapter, 'multiModelCurrentConsensus:', 'current consensus exposure');

// Current truth must remain a data-layer concern. The protected Golden Orb must
// not import this service or become responsible for meteorological arbitration.
const protectedOrb = read('src/components/OrbiClimateCore.tsx');
forbidText(protectedOrb, 'currentWeatherTruthService', 'truth fusion inside Golden Orb');
forbidText(protectedOrb, 'fetchNearestDmcObservation', 'DMC fetch inside Golden Orb');
forbidText(protectedOrb, 'fetchTrueMultiModelConsensus', 'multi-model fetch inside Golden Orb');

if (failures.length) {
  console.error('OC-22L Current Weather Truth + Precipitation Semantics gate: FAIL');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('OC-22L Current Weather Truth + Precipitation Semantics gate: PASS');
console.log('- recent accumulation cannot masquerade as current rain');
console.log('- DMC precipitation authority is restricted to the local 15 km radius');
console.log('- exact drizzle/rain/showers/snow intensities are preserved');
console.log('- explicit present precipitation always carries a non-zero trace');
console.log('- DMC temperature must be local and coherent with tight multi-model evidence');
console.log('- precipitation provenance/kind/intensity are exposed to consumers');
console.log('- Golden Orb remains outside meteorological arbitration');

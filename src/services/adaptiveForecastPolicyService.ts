import { WeatherLocation } from '../types/weatherTypes';
import {
  ModelSkillRow,
  ModelSkillSummary,
  summarizeModelSkill,
} from './modelForecastVerificationService';

export type AdaptiveForecastMode = 'best_match' | 'adaptive_model';
export type AdaptiveForecastDecisionReason =
  | 'insufficient_evidence'
  | 'insufficient_model_count'
  | 'leader_not_established'
  | 'lead_coverage_incomplete'
  | 'station_too_distant'
  | 'skill_below_threshold'
  | 'margin_too_small'
  | 'adaptive_selected';

export interface AdaptiveForecastPolicyDecision {
  mode: AdaptiveForecastMode;
  selectedModelId: string | null;
  selectedModelLabel: string;
  reason: AdaptiveForecastDecisionReason;
  reasonLabel: string;
  evidenceSummary: string;
  leaderScore: number | null;
  runnerUpScore: number | null;
  scoreMargin: number | null;
  verifiedForecasts: number;
  safetyThresholds: {
    minSkillScore: number;
    minScoreMargin: number;
    minLeadSamplesPerHorizon: number;
    maxMedianStationDistanceKm: number;
  };
}

export interface AdaptiveForecastRuntimeTrace {
  requestedAt: string;
  latitude: number;
  longitude: number;
  policyMode: AdaptiveForecastMode;
  requestedModelId: string | null;
  requestedModelLabel: string;
  effectiveMode: 'best_match' | 'adaptive_model' | 'best_match_fallback';
  effectiveModelId: string | null;
  effectiveModelLabel: string;
  fallbackUsed: boolean;
  fallbackReason: string | null;
  policyReason: AdaptiveForecastDecisionReason;
  policyReasonLabel: string;
}

const MIN_SKILL_SCORE = 72;
const MIN_SCORE_MARGIN = 6;
const MIN_LEAD_SAMPLES = 4;
const MAX_MEDIAN_STATION_DISTANCE_KM = 50;
const RUNTIME_STORAGE_KEY = 'orbi_adaptive_forecast_runtime_v1';

function fallbackDecision(
  summary: ModelSkillSummary,
  reason: AdaptiveForecastDecisionReason,
  reasonLabel: string,
  leader?: ModelSkillRow | null,
  runner?: ModelSkillRow | null,
): AdaptiveForecastPolicyDecision {
  const leaderScore = leader?.skillScore ?? null;
  const runnerUpScore = runner?.skillScore ?? null;
  const scoreMargin = leaderScore !== null && runnerUpScore !== null
    ? Math.round((leaderScore - runnerUpScore) * 10) / 10
    : null;

  return {
    mode: 'best_match',
    selectedModelId: null,
    selectedModelLabel: 'Open-Meteo Best Match',
    reason,
    reasonLabel,
    evidenceSummary: `${summary.verifiedForecasts} forecasts verificados · ${summary.comparableModels} modelos comparables`,
    leaderScore,
    runnerUpScore,
    scoreMargin,
    verifiedForecasts: summary.verifiedForecasts,
    safetyThresholds: {
      minSkillScore: MIN_SKILL_SCORE,
      minScoreMargin: MIN_SCORE_MARGIN,
      minLeadSamplesPerHorizon: MIN_LEAD_SAMPLES,
      maxMedianStationDistanceKm: MAX_MEDIAN_STATION_DISTANCE_KM,
    },
  };
}

export function resolveAdaptiveForecastPolicy(
  location: WeatherLocation,
  suppliedSummary?: ModelSkillSummary,
): AdaptiveForecastPolicyDecision {
  const summary = suppliedSummary ?? summarizeModelSkill(location);
  const ranked = summary.models.filter(model => model.skillScore !== null);
  const leader = ranked[0] ?? null;
  const runner = ranked[1] ?? null;

  if (summary.rankingStatus === 'calibrating') {
    return fallbackDecision(
      summary,
      'insufficient_evidence',
      'Calibración prospectiva insuficiente: ORBI mantiene Best Match.',
      leader,
      runner,
    );
  }

  if (ranked.length < 2 || !leader || !runner) {
    return fallbackDecision(
      summary,
      'insufficient_model_count',
      'No existen al menos dos modelos con skill comparable.',
      leader,
      runner,
    );
  }

  if (summary.rankingStatus !== 'established' || leader.evidence !== 'established') {
    return fallbackDecision(
      summary,
      'leader_not_established',
      'El líder aún no tiene evidencia estable; el ranking sigue siendo provisional.',
      leader,
      runner,
    );
  }

  if (
    leader.lead1Samples < MIN_LEAD_SAMPLES
    || leader.lead3Samples < MIN_LEAD_SAMPLES
    || leader.lead6Samples < MIN_LEAD_SAMPLES
  ) {
    return fallbackDecision(
      summary,
      'lead_coverage_incomplete',
      'El líder no tiene cobertura mínima en +1 h, +3 h y +6 h.',
      leader,
      runner,
    );
  }

  if (
    leader.medianStationDistanceKm === null
    || leader.medianStationDistanceKm > MAX_MEDIAN_STATION_DISTANCE_KM
  ) {
    return fallbackDecision(
      summary,
      'station_too_distant',
      'La evidencia del líder proviene de estaciones demasiado distantes para activar selección automática.',
      leader,
      runner,
    );
  }

  if ((leader.skillScore ?? 0) < MIN_SKILL_SCORE) {
    return fallbackDecision(
      summary,
      'skill_below_threshold',
      `El skill del líder no supera el umbral operativo de ${MIN_SKILL_SCORE}/100.`,
      leader,
      runner,
    );
  }

  const scoreMargin = (leader.skillScore ?? 0) - (runner.skillScore ?? 0);
  if (scoreMargin < MIN_SCORE_MARGIN) {
    return fallbackDecision(
      summary,
      'margin_too_small',
      `La ventaja del líder es menor a ${MIN_SCORE_MARGIN} puntos; ORBI evita sobreajustarse a una diferencia pequeña.`,
      leader,
      runner,
    );
  }

  return {
    mode: 'adaptive_model',
    selectedModelId: leader.modelId,
    selectedModelLabel: leader.label,
    reason: 'adaptive_selected',
    reasonLabel: `Selección adaptativa habilitada: ${leader.label} tiene evidencia estable y ventaja material observada.`,
    evidenceSummary: `${summary.verifiedForecasts} forecasts verificados · skill ${leader.skillScore}/100 · ventaja ${scoreMargin.toFixed(1)} pts`,
    leaderScore: leader.skillScore,
    runnerUpScore: runner.skillScore,
    scoreMargin: Math.round(scoreMargin * 10) / 10,
    verifiedForecasts: summary.verifiedForecasts,
    safetyThresholds: {
      minSkillScore: MIN_SKILL_SCORE,
      minScoreMargin: MIN_SCORE_MARGIN,
      minLeadSamplesPerHorizon: MIN_LEAD_SAMPLES,
      maxMedianStationDistanceKm: MAX_MEDIAN_STATION_DISTANCE_KM,
    },
  };
}

export function recordAdaptiveForecastRuntime(trace: AdaptiveForecastRuntimeTrace): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    localStorage.setItem(RUNTIME_STORAGE_KEY, JSON.stringify(trace));
    window.dispatchEvent(new CustomEvent<AdaptiveForecastRuntimeTrace>('orbi-adaptive-forecast-runtime-updated', {
      detail: trace,
    }));
  } catch (error) {
    console.warn('Adaptive forecast runtime trace could not be stored:', error);
  }
}

export function loadAdaptiveForecastRuntime(): AdaptiveForecastRuntimeTrace | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    const raw = localStorage.getItem(RUNTIME_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AdaptiveForecastRuntimeTrace;
    return parsed && typeof parsed.requestedAt === 'string' ? parsed : null;
  } catch (error) {
    console.warn('Adaptive forecast runtime trace could not be read:', error);
    return null;
  }
}

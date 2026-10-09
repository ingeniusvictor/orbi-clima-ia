import { CurrentWeather, HourlyForecast, DailyForecast, WeatherProfile, SkyCoreSummary } from '../types/weatherTypes';
import { buildAdvancedSkyCoreAnalysis } from './weatherRiskEngine';
import { getDecisionLabel } from './skyCoreRiskLabels';

let lastCurrent: CurrentWeather | null = null;
let lastHourly: HourlyForecast[] | null = null;
let lastDaily: DailyForecast[] | null = null;
let lastProfile: WeatherProfile | null = null;
let lastSummary: SkyCoreSummary | null = null;

export function buildSkyCoreSummary(
  current: CurrentWeather,
  hourly: HourlyForecast[],
  daily: DailyForecast[],
  activeProfile: WeatherProfile
): SkyCoreSummary {
  if (
    lastSummary
    && lastCurrent === current
    && lastHourly === hourly
    && lastDaily === daily
    && lastProfile === activeProfile
  ) {
    return lastSummary;
  }

  const analysis = buildAdvancedSkyCoreAnalysis({ current, hourly, daily, profile: activeProfile });

  const isPerson = activeProfile === 'person';
  const mainRec = analysis.recommendations[0];
  const highRisk = analysis.riskScores
    .filter(r => r.score >= 50)
    .sort((a, b) => b.score - a.score)[0];

  let generalSummary = '';
  if (isPerson) {
    generalSummary = `El análisis SkyCore determina condiciones generales de nivel [${getDecisionLabel(analysis.globalDecision)}]. ${analysis.personSummary}`;
  } else {
    generalSummary = `Análisis Técnico Operativo: Nivel [${getDecisionLabel(analysis.globalDecision)}]. ${analysis.technicalSummary}`;
  }

  const summary: SkyCoreSummary = {
    generalSummary,
    mainRecommendation: mainRec ? mainRec.message : 'Siga las precauciones estándar del día.',
    warning: highRisk ? `Riesgo elevado de ${highRisk.label}: ${highRisk.reason}` : undefined,
    bestWindow: analysis.bestWindow
      ? `Mejor ventana (${analysis.bestWindow.label}): ${analysis.bestWindow.startTime} a ${analysis.bestWindow.endTime}. Motivo: ${analysis.bestWindow.reason}`
      : 'Sin ventana óptima ideal detectada en las próximas horas.',
    widgetShortText: analysis.widgetShortText,
  };

  lastCurrent = current;
  lastHourly = hourly;
  lastDaily = daily;
  lastProfile = activeProfile;
  lastSummary = summary;
  return summary;
}

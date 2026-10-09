import { FloodContextSnapshot } from '../services/openMeteoFloodService';
import { HydroPrecipSnapshot } from '../services/openMeteoHydroPrecipService';

export type HydrologicRiskLevel = 'none' | 'low' | 'medium' | 'high';
export type HydrologicConfidence = 'low' | 'medium';

export interface HydrologicEvidence {
  id: string;
  label: string;
  value: string;
  contribution: number;
}

export interface HydrologicRiskAssessment {
  level: HydrologicRiskLevel;
  score: number;
  title: string;
  summary: string;
  recommendation: string;
  confidence: HydrologicConfidence;
  isOfficialAlert: false;
  isFlashFloodNowcast: false;
  evidence: HydrologicEvidence[];
  limitations: string[];
}

function rainScore(precip: HydroPrecipSnapshot, evidence: HydrologicEvidence[]): number {
  let score = 0;

  const add = (id: string, label: string, value: string, contribution: number) => {
    score += contribution;
    evidence.push({ id, label, value, contribution });
  };

  if (precip.past24hMm >= 50) add('past24', 'Acumulado modelado últimas 24 h', `${precip.past24hMm} mm`, 30);
  else if (precip.past24hMm >= 30) add('past24', 'Acumulado modelado últimas 24 h', `${precip.past24hMm} mm`, 22);
  else if (precip.past24hMm >= 15) add('past24', 'Acumulado modelado últimas 24 h', `${precip.past24hMm} mm`, 12);

  if (precip.past6hMm >= 25) add('past6', 'Acumulado modelado últimas 6 h', `${precip.past6hMm} mm`, 20);
  else if (precip.past6hMm >= 12) add('past6', 'Acumulado modelado últimas 6 h', `${precip.past6hMm} mm`, 12);

  if (precip.next6hMm >= 35) add('next6', 'Lluvia prevista próximas 6 h', `${precip.next6hMm} mm`, 30);
  else if (precip.next6hMm >= 20) add('next6', 'Lluvia prevista próximas 6 h', `${precip.next6hMm} mm`, 20);
  else if (precip.next6hMm >= 10) add('next6', 'Lluvia prevista próximas 6 h', `${precip.next6hMm} mm`, 10);

  if (precip.next24hMm >= 60) add('next24', 'Lluvia prevista próximas 24 h', `${precip.next24hMm} mm`, 20);
  else if (precip.next24hMm >= 35) add('next24', 'Lluvia prevista próximas 24 h', `${precip.next24hMm} mm`, 12);

  if (precip.next24hMaxHourlyMm >= 20) add('hourly_peak', 'Máximo horario previsto', `${precip.next24hMaxHourlyMm} mm/h`, 25);
  else if (precip.next24hMaxHourlyMm >= 10) add('hourly_peak', 'Máximo horario previsto', `${precip.next24hMaxHourlyMm} mm/h`, 15);
  else if (precip.next24hMaxHourlyMm >= 5) add('hourly_peak', 'Máximo horario previsto', `${precip.next24hMaxHourlyMm} mm/h`, 8);

  if (precip.next6hMaxProbability >= 80 && precip.next6hMm >= 10) {
    add('probability', 'Probabilidad máxima próximas 6 h', `${precip.next6hMaxProbability}%`, 8);
  }

  return score;
}

function dischargeScore(flood: FloodContextSnapshot | null, evidence: HydrologicEvidence[]): number {
  if (!flood) return 0;
  let score = 0;
  const add = (id: string, label: string, value: string, contribution: number) => {
    score += contribution;
    evidence.push({ id, label, value, contribution });
  };

  const currentRatio = flood.currentVsRecentMedianRatio;
  if (currentRatio !== null) {
    if (currentRatio >= 2) add('river_current', 'Caudal vs mediana reciente', `${currentRatio.toFixed(1)}×`, 25);
    else if (currentRatio >= 1.5) add('river_current', 'Caudal vs mediana reciente', `${currentRatio.toFixed(1)}×`, 16);
    else if (currentRatio >= 1.25) add('river_current', 'Caudal vs mediana reciente', `${currentRatio.toFixed(1)}×`, 8);
  }

  const peakRatio = flood.peakVsRecentMedianRatio;
  if (peakRatio !== null) {
    if (peakRatio >= 3) add('river_peak', 'Pico GloFAS vs mediana reciente', `${peakRatio.toFixed(1)}×`, 30);
    else if (peakRatio >= 2) add('river_peak', 'Pico GloFAS vs mediana reciente', `${peakRatio.toFixed(1)}×`, 20);
    else if (peakRatio >= 1.5) add('river_peak', 'Pico GloFAS vs mediana reciente', `${peakRatio.toFixed(1)}×`, 10);
  }

  if (flood.trend === 'rising') {
    add('river_trend', 'Tendencia de caudal', 'Ascendente', 8);
  }

  return score;
}

function classify(score: number): HydrologicRiskLevel {
  if (score >= 65) return 'high';
  if (score >= 42) return 'medium';
  if (score >= 20) return 'low';
  return 'none';
}

function wording(level: HydrologicRiskLevel): Pick<HydrologicRiskAssessment, 'title' | 'summary' | 'recommendation'> {
  switch (level) {
    case 'high':
      return {
        title: 'Riesgo hidrológico elevado · ORBI',
        summary: 'Coinciden varias señales modeladas de lluvia acumulada/intensa y/o aumento de caudal. Esto requiere mayor vigilancia, pero no constituye una alerta oficial de inundación repentina.',
        recommendation: 'Evita zonas bajas, cauces y pasos susceptibles a anegamiento si las condiciones empeoran. Revisa alertas oficiales de DMC/SENAPRED y condiciones reales del terreno antes de desplazarte.',
      };
    case 'medium':
      return {
        title: 'Atención hidrológica · ORBI',
        summary: 'Hay señales modeladas que justifican seguimiento de lluvia acumulada, intensidad o caudal durante las próximas horas.',
        recommendation: 'Monitorea actualizaciones, drenajes y cauces cercanos. Confirma cualquier advertencia relevante en fuentes oficiales.',
      };
    case 'low':
      return {
        title: 'Vigilancia hidrológica leve · ORBI',
        summary: 'Existe una señal hidrológica menor, sin evidencia suficiente para elevarla a riesgo medio o alto.',
        recommendation: 'Mantén atención al pronóstico de corto plazo si estarás en una zona propensa a anegamientos.',
      };
    default:
      return {
        title: 'Sin señal hidrológica destacada',
        summary: 'Los indicadores modelados disponibles no muestran una combinación relevante de lluvia acumulada/intensa o aumento de caudal.',
        recommendation: 'Continúa revisando el pronóstico y las alertas oficiales, especialmente si el entorno local tiene historial de inundaciones.',
      };
  }
}

export function buildHydrologicRiskAssessment(params: {
  precipitation: HydroPrecipSnapshot;
  flood: FloodContextSnapshot | null;
}): HydrologicRiskAssessment {
  const { precipitation, flood } = params;
  const evidence: HydrologicEvidence[] = [];
  const rawScore = rainScore(precipitation, evidence) + dischargeScore(flood, evidence);
  const score = Math.min(100, rawScore);
  const level = classify(score);
  const text = wording(level);

  const limitations = [
    'Este resultado es una inferencia de ORBI basada en modelos meteorológicos e hidrológicos; no es una alerta oficial.',
    'Los acumulados históricos de precipitación usados aquí son contexto modelado y no sustituyen un pluviómetro local u observación certificada.',
    'No equivale a un radar de inundación repentina, sensor de calle, drenaje urbano ni evaluación hidráulica local.',
  ];

  if (flood) {
    limitations.push(flood.riverSelectionCaveat);
  } else {
    limitations.push('El contexto de caudal GloFAS no estuvo disponible; la evaluación se apoya solo en precipitación modelada.');
  }

  return {
    level,
    score,
    title: text.title,
    summary: text.summary,
    recommendation: text.recommendation,
    confidence: flood ? 'medium' : 'low',
    isOfficialAlert: false,
    isFlashFloodNowcast: false,
    evidence: evidence.sort((a, b) => b.contribution - a.contribution),
    limitations,
  };
}

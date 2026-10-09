import { CurrentWeather, HourlyForecast, DailyForecast, WeatherProfile, ClimateRisk, RiskLevel, AdvancedSkyCoreAnalysis, SkyCoreDecision } from '../types/weatherTypes';
import { calculateSkyCoreRiskScores } from './skyCoreRiskScoring';
import { analyzeBestWindows } from './skyCoreWindowAnalyzer';
import { buildSkyCoreRecommendations } from './skyCoreRecommendationEngine';
import { scoreToRiskLevel, scoreToDecision } from './skyCoreRiskLabels';
import { precipitationIntensityRank } from './wmoWeatherCodeMapper';

function precipitationLevel(current: CurrentWeather, profile: WeatherProfile): RiskLevel {
  const rank = precipitationIntensityRank(current.precipitationIntensity);
  const freezing = current.phenomenon === 'freezing_drizzle' || current.phenomenon === 'freezing_rain';
  const storm = current.phenomenon === 'thunderstorm' || current.phenomenon === 'thunderstorm_hail';

  if (storm) return 'critical';
  if (freezing) return 'high';
  if (current.phenomenon === 'drizzle') return profile === 'field_tech' ? 'medium' : 'low';
  if (current.phenomenon === 'snow' || current.phenomenon === 'snow_showers') return rank >= 4 ? 'high' : 'medium';
  if (rank >= 5) return 'critical';
  if (rank >= 3) return 'high';
  if (rank >= 2) return profile === 'field_tech' ? 'high' : 'medium';
  return 'low';
}

function precipitationDescription(current: CurrentWeather): string {
  const label = current.conditionLabel || 'Precipitación';
  const amount = Number(current.precipitationMm || 0);
  const interval = current.precipitationIntervalMinutes;
  const rate = current.precipitationRateMmH;

  if (amount <= 0) return `${label} detectada por el modelo en el intervalo actual.`;
  if (interval && rate !== undefined) {
    return `${label}: ${amount.toFixed(1)} mm acumulados en los últimos ${Math.round(interval)} min (equivalente aproximado ${rate.toFixed(1)} mm/h).`;
  }
  return `${label}: ${amount.toFixed(1)} mm en el intervalo actual.`;
}

function nextHoursAccumulation(hourly: HourlyForecast[], count: number): number {
  return Number(hourly.slice(0, count).reduce((sum, h) => sum + Math.max(0, Number(h.precipitationMm || 0)), 0).toFixed(1));
}

export function buildClimateRisks(
  current: CurrentWeather,
  hourly: HourlyForecast[],
  daily: DailyForecast[],
  activeProfile: WeatherProfile
): ClimateRisk[] {
  const risks: ClimateRisk[] = [];
  const dewPointSpread = current.dewPointC !== undefined ? current.temperatureC - current.dewPointC : undefined;
  const hasPrecipPhenomenon = Boolean(current.phenomenon && [
    'drizzle', 'freezing_drizzle', 'rain', 'freezing_rain', 'showers', 'snow', 'snow_showers', 'thunderstorm', 'thunderstorm_hail'
  ].includes(current.phenomenon));
  const precipActive = hasPrecipPhenomenon || current.precipitationMm > 0;
  const next3hRain = nextHoursAccumulation(hourly, 3);
  const next6hRain = nextHoursAccumulation(hourly, 6);
  const next6hMaxProbability = Math.max(0, ...hourly.slice(0, 6).map(h => Number(h.precipitationProbability || 0)));

  // 1. Humedad / condensación: RH alta no equivale por sí sola a condensación.
  if (activeProfile === 'field_tech') {
    if ((dewPointSpread !== undefined && dewPointSpread <= 2) || current.humidity >= 95) {
      risks.push({
        id: 'condensation_risk',
        label: 'Condiciones Favorables a Condensación',
        level: 'high',
        description: dewPointSpread !== undefined
          ? `Temperatura ${current.temperatureC}°C y punto de rocío ${current.dewPointC?.toFixed(1)}°C (margen ${dewPointSpread.toFixed(1)}°C).`
          : `Humedad relativa muy alta (${current.humidity}%).`,
        recommendation: 'Antes de intervenir equipos eléctricos, verificar físicamente humedad/condensación, aplicar el procedimiento HSE y las condiciones del fabricante. El clima por sí solo no autoriza una maniobra.',
        affectedProfile: 'field_tech',
      });
    } else if (current.humidity >= 85) {
      risks.push({
        id: 'high_humidity_tech',
        label: 'Ambiente Muy Húmedo',
        level: 'medium',
        description: `Humedad relativa de ${current.humidity}%. No confirma condensación, pero amerita verificación en terreno.`,
        recommendation: 'Inspeccionar superficies, sellos y gabinetes antes de trabajos sensibles; mantener los controles HSE habituales.',
        affectedProfile: 'field_tech',
      });
    }
  } else if (current.humidity >= 90) {
    risks.push({
      id: 'high_humidity_person',
      label: 'Sensación de Humedad',
      level: 'medium',
      description: `Humedad relativa de ${current.humidity}%.`,
      recommendation: 'Considera abrigo que resista humedad y viento; ventila cuando las condiciones exteriores mejoren.',
      affectedProfile: 'person',
    });
  }

  // 2. Visibilidad, cuando el proveedor la entrega.
  if (current.visibilityM !== undefined && current.visibilityM < 3000) {
    const severe = current.visibilityM < 1000;
    risks.push({
      id: 'low_visibility',
      label: severe ? 'Visibilidad Muy Reducida' : 'Visibilidad Reducida',
      level: severe ? 'high' : 'medium',
      description: `Visibilidad modelada aproximada: ${(current.visibilityM / 1000).toFixed(1)} km.`,
      recommendation: activeProfile === 'field_tech'
        ? 'Reevaluar desplazamientos, trabajos en altura y conducción interna según procedimiento de faena y observación real en terreno.'
        : 'Conduce con mayor distancia de seguridad y confirma las condiciones reales antes de viajar.',
      affectedProfile: activeProfile,
    });
  }

  // 3. Viento y ráfagas.
  if (current.windSpeedKmh > 30 || current.windGustKmh > 45) {
    const isCritical = current.windGustKmh > 60 || current.windSpeedKmh > 45;
    risks.push({
      id: 'high_wind',
      label: current.windGustKmh > 45 ? 'Ráfagas Fuertes' : 'Viento Sostenido Fuerte',
      level: isCritical ? 'high' : 'medium',
      description: `Viento ${current.windSpeedKmh} km/h; ráfagas hasta ${current.windGustKmh} km/h.`,
      recommendation: activeProfile === 'field_tech'
        ? 'Aplicar los límites de viento definidos para cada tarea/equipo. No usar ORBI como autorización para trabajos en altura o izajes.'
        : 'Asegura objetos sueltos y ten precaución cerca de árboles, techumbres y letreros.',
      affectedProfile: activeProfile,
    });
  } else if (current.windSpeedKmh > 20) {
    risks.push({
      id: 'moderate_wind',
      label: 'Viento Perceptible',
      level: 'low',
      description: `Viento cercano a ${current.windSpeedKmh} km/h.`,
      recommendation: activeProfile === 'field_tech'
        ? 'Monitorear ráfagas y aplicar el límite específico de la actividad.'
        : 'Una prenda cortavientos puede mejorar el confort al aire libre.',
      affectedProfile: activeProfile,
    });
  }

  // 4. Radiación UV.
  if (current.uvIndex >= 8) {
    risks.push({
      id: 'extreme_uv',
      label: 'Radiación UV Muy Alta',
      level: 'high',
      description: `Índice UV modelado: ${current.uvIndex}.`,
      recommendation: activeProfile === 'field_tech'
        ? 'Aplicar el programa de protección UV de la empresa: protección solar, ropa adecuada, hidratación y pausas según procedimiento.'
        : 'Usa protección solar, sombrero y lentes; reduce exposición directa en las horas de mayor UV.',
      affectedProfile: activeProfile,
    });
  } else if (current.uvIndex >= 6) {
    risks.push({
      id: 'high_uv',
      label: 'Radiación UV Alta',
      level: 'medium',
      description: `Índice UV modelado: ${current.uvIndex}.`,
      recommendation: 'Usa protección solar adecuada si permanecerás al aire libre.',
      affectedProfile: activeProfile,
    });
  }

  // 5. Precipitación actual con semántica WMO e intensidad; no confundir llovizna con lluvia fuerte.
  if (precipActive) {
    const level = precipitationLevel(current, activeProfile);
    const label = current.conditionLabel || (current.phenomenon === 'drizzle' ? 'Llovizna Activa' : 'Precipitación Activa');
    risks.push({
      id: 'active_precipitation',
      label,
      level,
      description: precipitationDescription(current),
      recommendation: activeProfile === 'field_tech'
        ? (current.phenomenon === 'drizzle'
            ? 'Llovizna presente: verificar superficie, herramientas y exigencias HSE antes de actividades sensibles o eléctricas.'
            : 'Precipitación presente: reevaluar trabajos expuestos y seguir los criterios HSE/equipo aplicables a la tarea.')
        : (current.phenomenon === 'drizzle'
            ? 'Llovizna ligera: un impermeable liviano puede ser suficiente; conduce considerando pavimento húmedo.'
            : 'Lleva protección para la lluvia y adapta traslados a la intensidad observada.'),
      affectedProfile: activeProfile,
    });
  } else if (next6hMaxProbability >= 60 || (daily[0]?.precipitationProbability || 0) >= 60) {
    risks.push({
      id: 'precipitation_likely',
      label: 'Precipitación Probable',
      level: next6hMaxProbability >= 80 ? 'medium' : 'low',
      description: `Probabilidad máxima próxima: ${Math.max(next6hMaxProbability, daily[0]?.precipitationProbability || 0)}%. Acumulación modelada próximas 3 h: ${next3hRain.toFixed(1)} mm.`,
      recommendation: activeProfile === 'field_tech'
        ? 'Preparar protección de equipos y revisar la ventana de trabajo antes de iniciar tareas expuestas.'
        : 'Considera paraguas o impermeable y revisa la evolución horaria antes de salir.',
      affectedProfile: activeProfile,
    });
  }

  // 6. Acumulación prevista: aviso derivado, nunca equivalente a una alerta oficial de inundación.
  if (next6hRain >= 20) {
    risks.push({
      id: 'heavy_accumulation_watch',
      label: 'Acumulación Importante Prevista',
      level: next6hRain >= 40 ? 'high' : 'medium',
      description: `El modelo acumula aproximadamente ${next6hRain.toFixed(1)} mm en las próximas 6 h. Este cálculo no sustituye alertas oficiales ni evalúa por sí solo riesgo de inundación.`,
      recommendation: 'Revisa avisos oficiales vigentes y presta atención a cauces, zonas bajas, drenajes y condiciones locales.',
      affectedProfile: activeProfile,
    });
  }

  // 7. Temperatura.
  if (current.temperatureC < 5) {
    risks.push({
      id: 'extreme_cold',
      label: 'Temperatura Muy Baja',
      level: 'high',
      description: `Temperatura actual ${current.temperatureC}°C; sensación ${current.feelsLikeC}°C.`,
      recommendation: activeProfile === 'field_tech'
        ? 'Aplicar controles de exposición al frío definidos por la organización y verificar condiciones reales en terreno.'
        : 'Abrígate por capas y limita exposición prolongada si la sensación térmica es baja.',
      affectedProfile: activeProfile,
    });
  } else if (current.temperatureC < 10) {
    risks.push({
      id: 'moderate_cold',
      label: 'Frío Matutino/Persistente',
      level: 'medium',
      description: `Temperatura ${current.temperatureC}°C; sensación ${current.feelsLikeC}°C.`,
      recommendation: 'Lleva abrigo adecuado y considera viento/humedad antes de actividades prolongadas al aire libre.',
      affectedProfile: activeProfile,
    });
  }

  if (current.temperatureC > 32) {
    risks.push({
      id: 'extreme_heat',
      label: 'Calor Intenso',
      level: 'high',
      description: `Temperatura actual ${current.temperatureC}°C; sensación ${current.feelsLikeC}°C.`,
      recommendation: activeProfile === 'field_tech'
        ? 'Aplicar el plan de estrés térmico de la organización, hidratación y pausas según evaluación de riesgo.'
        : 'Mantente hidratado, busca sombra y reduce actividad intensa en las horas más calurosas.',
      affectedProfile: activeProfile,
    });
  }

  // 8. Contexto eléctrico: sólo aptitud meteorológica, nunca autorización operativa.
  if (activeProfile === 'field_tech') {
    const weatherSensitive = precipActive || (dewPointSpread !== undefined && dewPointSpread <= 2) || current.humidity >= 90;
    risks.push({
      id: weatherSensitive ? 'electrical_weather_caution' : 'electrical_weather_window',
      label: weatherSensitive ? 'Cautela Meteorológica para Maniobras' : 'Ventana Meteorológica Favorable',
      level: weatherSensitive ? 'high' : 'low',
      description: weatherSensitive
        ? 'Las condiciones meteorológicas pueden aumentar humedad superficial, resbalamiento o exposición de equipos.'
        : 'No se observan precipitaciones y los indicadores meteorológicos actuales son relativamente estables.',
      recommendation: weatherSensitive
        ? 'No iniciar una maniobra basándose sólo en ORBI. Aplicar LOTO, procedimiento HSE, inspección física, límites del fabricante y autorización de trabajo.'
        : 'El clima es sólo una condición de contexto. Confirmar LOTO, inspección física, permisos y criterios HSE antes de cualquier intervención.',
      affectedProfile: 'field_tech',
    });
  }

  // 9. Fotovoltaica: no usar UV como sustituto de irradiancia.
  if (activeProfile === 'field_tech') {
    if (current.cloudCover >= 80 || precipActive) {
      risks.push({
        id: 'solar_pv_low',
        label: 'Potencial FV Reducido',
        level: 'medium',
        description: `Nubosidad ${current.cloudCover}%${precipActive ? ' y precipitación presente' : ''}.`,
        recommendation: 'Esperar producción variable/reducida. Para estimar potencia usar irradiancia medida o un modelo solar dedicado, no el índice UV.',
        affectedProfile: 'field_tech',
      });
    } else if (current.cloudCover <= 30) {
      risks.push({
        id: 'solar_pv_favorable',
        label: 'Potencial FV Favorable',
        level: 'low',
        description: `Nubosidad baja (${current.cloudCover}%).`,
        recommendation: 'Condición atmosférica favorable para recurso solar; confirmar con piranómetro/SCADA o irradiancia modelada antes de estimar generación.',
        affectedProfile: 'field_tech',
      });
    }
  }

  const hasSignificantRisks = risks.some(r => r.level === 'high' || r.level === 'critical');
  if (!hasSignificantRisks && activeProfile === 'person' && current.temperatureC >= 15 && current.temperatureC <= 25 && !precipActive) {
    risks.push({
      id: 'favorable_person',
      label: 'Condiciones Favorables',
      level: 'low',
      description: `Temperatura ${current.temperatureC}°C y sin precipitación activa detectada.`,
      recommendation: 'Buenas condiciones generales para actividades al aire libre; revisa UV y viento según el horario.',
      affectedProfile: 'person',
    });
  }

  return risks.filter(r => r.affectedProfile === activeProfile);
}

export function buildAdvancedSkyCoreAnalysis(params: {
  current: CurrentWeather;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  profile: WeatherProfile;
}): AdvancedSkyCoreAnalysis {
  const { current, hourly, daily, profile } = params;

  // 1. Calculate Risk Scores
  const riskScores = calculateSkyCoreRiskScores({ current, hourly, daily, profile });

  // 2. Global Score (average of top 3 scores)
  const sortedScores = [...riskScores].map(r => r.score).sort((a, b) => b - a);
  const topScores = sortedScores.slice(0, 3);
  const globalScore = topScores.length > 0
    ? Math.round(topScores.reduce((acc, s) => acc + s, 0) / topScores.length)
    : 10;

  // 3. Risk Level and Decision
  const globalRiskLevel = scoreToRiskLevel(globalScore);
  const globalDecision = scoreToDecision(globalScore);

  // 4. Windows Analysis
  const { bestWindow, cautionWindows } = analyzeBestWindows({ hourly, profile });

  // 5. Build Recommendations
  const recommendations = buildSkyCoreRecommendations({
    profile,
    riskScores,
    bestWindow,
    hourly,
    current
  });

  // 6. Generate Short Text for Widgets
  let widgetShortText = '';
  if (profile === 'field_tech') {
    const criticalHazard = riskScores.find(r => r.score >= 75);
    const highHazard = riskScores.find(r => r.score >= 50);
    if (criticalHazard) {
      widgetShortText = `Alerta: ${criticalHazard.label}`;
    } else if (highHazard) {
      widgetShortText = `Terreno: ${highHazard.label}`;
    } else {
      widgetShortText = bestWindow ? `Terreno óptimo: ${bestWindow.startTime}` : 'Terreno estable';
    }
  } else {
    const highHazard = riskScores.find(r => r.score >= 60);
    if (highHazard) {
      widgetShortText = `Atención: ${highHazard.label}`;
    } else {
      widgetShortText = bestWindow ? `Recomendado salir: ${bestWindow.startTime}` : 'Día tranquilo';
    }
  }

  // 7. Profile-specific summaries
  let personSummary = '';
  let technicalSummary = '';

  if (profile === 'person') {
    const tempRisk = riskScores.find(r => r.category === 'temperature');
    const rainRisk = riskScores.find(r => r.category === 'rain');
    const uvRisk = riskScores.find(r => r.category === 'uv');

    const tempPart = tempRisk && tempRisk.score >= 50 ? `${tempRisk.label}. ` : '';
    const rainPart = rainRisk && rainRisk.score >= 40 ? `Considera probabilidad de lluvia durante el día. ` : '';
    const uvPart = uvRisk && uvRisk.score >= 50 ? `UV alto al mediodía, usa protección. ` : 'UV controlado para actividades normales. ';
    const windPart = current.windSpeedKmh >= 25 ? 'Brisa fresca perceptible.' : '';

    personSummary = `${tempPart}${rainPart}${uvPart}${windPart}`.trim() || 'Condiciones climáticas excelentes para una jornada tranquila.';
  } else {
    const elecRisk = riskScores.find(r => r.category === 'electrical_work');
    const fieldRisk = riskScores.find(r => r.category === 'field_work');
    const solarRisk = riskScores.find(r => r.category === 'solar_pv');

    const elecPart = elecRisk && elecRisk.score >= 50 ? `Evitar apertura de tableros por ${elecRisk.label}. ` : 'Sin restricciones eléctricas severas. ';
    const fieldPart = fieldRisk && fieldRisk.score >= 50 ? `Trabajos en terreno con precaución. ` : 'Condiciones operativas en exteriores favorables. ';
    const solarPart = solarRisk && solarRisk.score >= 50 ? `FV: ${solarRisk.label}. ` : '';
    const winPart = bestWindow ? `Mejor ventana técnica: ${bestWindow.startTime}–${bestWindow.endTime}.` : '';

    technicalSummary = `${elecPart}${fieldPart}${solarPart}${winPart}`.trim() || 'Operaciones estándar estables sin alertas meteorológicas.';
  }

  return {
    profile,
    globalDecision,
    globalRiskLevel,
    globalScore,
    riskScores,
    bestWindow,
    cautionWindows,
    recommendations,
    widgetShortText,
    personSummary,
    technicalSummary
  };
}

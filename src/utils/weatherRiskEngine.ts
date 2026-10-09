import {
  CurrentWeather,
  HourlyForecast,
  DailyForecast,
  WeatherProfile,
  ClimateRisk,
  RiskLevel,
  AdvancedSkyCoreAnalysis,
} from '../types/weatherTypes';
import { calculateSkyCoreRiskScores } from './skyCoreRiskScoring';
import { analyzeBestWindows } from './skyCoreWindowAnalyzer';
import { buildSkyCoreRecommendations } from './skyCoreRecommendationEngine';
import { scoreToRiskLevel, scoreToDecision } from './skyCoreRiskLabels';

type WeatherSemantics = {
  weatherCode?: number;
  conditionLabel?: string;
  precipitationKind?: 'none' | 'drizzle' | 'freezing_drizzle' | 'rain' | 'freezing_rain' | 'showers' | 'snow' | 'storm' | 'unknown';
  precipitationIntensity?: 'none' | 'trace' | 'light' | 'moderate' | 'heavy' | 'violent';
};

function getSemantics(current: CurrentWeather): WeatherSemantics {
  return current as CurrentWeather & WeatherSemantics;
}

function isActivePrecipitation(current: CurrentWeather): boolean {
  return Number.isFinite(current.precipitationMm) && current.precipitationMm > 0;
}

function nextHoursMaxRainProbability(hourly: HourlyForecast[], hours = 6): number {
  if (!hourly.length) return 0;
  return Math.max(0, ...hourly.slice(0, hours).map(h => h.precipitationProbability || 0));
}

export function buildClimateRisks(
  current: CurrentWeather,
  hourly: HourlyForecast[],
  daily: DailyForecast[],
  activeProfile: WeatherProfile,
): ClimateRisk[] {
  const risks: ClimateRisk[] = [];
  const semantics = getSemantics(current);
  const precipKind = semantics.precipitationKind ?? (current.condition === 'rain' ? 'rain' : 'none');
  const precipIntensity = semantics.precipitationIntensity ?? (current.precipitationMm > 0 ? 'light' : 'none');
  const conditionLabel = semantics.conditionLabel || (current.condition === 'rain' ? 'Lluvia' : 'Condición meteorológica');
  const activePrecip = isActivePrecipitation(current);
  const next6hRainProbability = nextHoursMaxRainProbability(hourly, 6);

  // 1. Humedad: humedad relativa alta no equivale por sí sola a condensación.
  if (current.humidity >= 90) {
    risks.push({
      id: activeProfile === 'field_tech' ? 'high_humidity' : 'high_humidity_person',
      label: activeProfile === 'field_tech' ? 'Humedad Muy Alta' : 'Sensación de Humedad',
      level: activeProfile === 'field_tech' ? 'medium' : 'low',
      description: `Humedad relativa de ${current.humidity}%. Puede favorecer condensación si superficies o equipos están por debajo del punto de rocío.`,
      recommendation: activeProfile === 'field_tech'
        ? 'Antes de abrir tableros, comprobar visualmente condensación y respetar el procedimiento eléctrico/HSE aplicable.'
        : 'El ambiente puede sentirse más húmedo o frío. Ventila cuando las condiciones exteriores mejoren.',
      affectedProfile: activeProfile,
    });
  } else if (current.humidity >= 80 && activeProfile === 'person') {
    risks.push({
      id: 'moderate_humidity_person',
      label: 'Ambiente Húmedo',
      level: 'low',
      description: `Humedad relativa de ${current.humidity}%.`,
      recommendation: 'Considera una capa exterior que proteja de humedad y viento si estarás fuera varias horas.',
      affectedProfile: 'person',
    });
  }

  // 2. Viento y ráfagas.
  if (current.windSpeedKmh > 40 || current.windGustKmh > 55) {
    risks.push({
      id: 'high_wind',
      label: current.windGustKmh > 55 ? 'Ráfagas Fuertes' : 'Viento Fuerte',
      level: 'high',
      description: `Viento de ${current.windSpeedKmh} km/h con ráfagas de hasta ${current.windGustKmh} km/h.`,
      recommendation: activeProfile === 'field_tech'
        ? 'Evaluar suspensión de trabajos en altura, izajes y manipulación de elementos de gran superficie según procedimiento HSE.'
        : 'Asegura objetos sueltos y ten precaución cerca de árboles, letreros o estructuras ligeras.',
      affectedProfile: activeProfile,
    });
  } else if (current.windSpeedKmh >= 25 || current.windGustKmh >= 40) {
    risks.push({
      id: 'moderate_wind',
      label: 'Viento Moderado',
      level: 'medium',
      description: `Viento de ${current.windSpeedKmh} km/h y ráfagas de ${current.windGustKmh} km/h.`,
      recommendation: activeProfile === 'field_tech'
        ? 'Monitorea ráfagas y aplica los límites operacionales definidos para cada tarea.'
        : 'Una prenda cortavientos puede resultar útil.',
      affectedProfile: activeProfile,
    });
  }

  // 3. Radiación UV.
  if (current.uvIndex >= 11) {
    risks.push({
      id: 'extreme_uv',
      label: 'Radiación UV Extrema',
      level: 'high',
      description: `Índice UV actual: ${current.uvIndex}.`,
      recommendation: 'Protección solar completa, sombra y reducción de exposición directa en horas de máxima radiación.',
      affectedProfile: activeProfile,
    });
  } else if (current.uvIndex >= 8) {
    risks.push({
      id: 'very_high_uv',
      label: 'Radiación UV Muy Alta',
      level: 'medium',
      description: `Índice UV actual: ${current.uvIndex}.`,
      recommendation: 'Usa protector solar, lentes, sombrero y busca sombra durante exposiciones prolongadas.',
      affectedProfile: activeProfile,
    });
  } else if (current.uvIndex >= 6) {
    risks.push({
      id: 'high_uv',
      label: 'Radiación UV Alta',
      level: 'medium',
      description: `Índice UV actual: ${current.uvIndex}.`,
      recommendation: 'Usa protección solar si estarás al aire libre.',
      affectedProfile: activeProfile,
    });
  }

  // 4. Precipitación: fenómeno + intensidad, no un simple booleano lluvia/no lluvia.
  if (current.condition === 'storm' || precipKind === 'storm') {
    risks.push({
      id: 'critical_storm',
      label: 'Tormenta Activa',
      level: 'critical',
      description: `${conditionLabel}. Se requiere atención por actividad convectiva/eléctrica.`,
      recommendation: activeProfile === 'field_tech'
        ? 'Aplicar inmediatamente el protocolo HSE de tormenta y suspender trabajos expuestos cuando corresponda.'
        : 'Busca refugio seguro y sigue las alertas e instrucciones oficiales vigentes.',
      affectedProfile: activeProfile,
    });
  } else if (activePrecip && (precipKind === 'drizzle' || precipKind === 'freezing_drizzle')) {
    const freezing = precipKind === 'freezing_drizzle';
    const level: RiskLevel = freezing ? 'high' : activeProfile === 'field_tech' ? 'medium' : 'low';
    risks.push({
      id: freezing ? 'freezing_drizzle_active' : 'drizzle_active',
      label: conditionLabel,
      level,
      description: `${conditionLabel} activa (${current.precipitationMm} mm/h).${freezing ? ' Puede formarse hielo sobre superficies.' : ' Precipitación débil en curso.'}`,
      recommendation: freezing
        ? 'Evita superficies expuestas con posible hielo y extrema precauciones de conducción y trabajo.'
        : activeProfile === 'field_tech'
          ? 'Superficies pueden humedecerse. Verifica adherencia y protege herramientas/equipos sensibles al agua.'
          : 'Un impermeable ligero puede ser suficiente; conduce con precaución si el pavimento está mojado.',
      affectedProfile: activeProfile,
    });
  } else if (activePrecip && (precipKind === 'rain' || precipKind === 'showers' || precipKind === 'freezing_rain' || current.condition === 'rain')) {
    const severe = precipIntensity === 'heavy' || precipIntensity === 'violent' || current.precipitationMm >= 8;
    const moderate = precipIntensity === 'moderate' || current.precipitationMm >= 2;
    const freezing = precipKind === 'freezing_rain';
    const level: RiskLevel = freezing || severe ? 'high' : moderate ? 'high' : 'medium';
    risks.push({
      id: freezing ? 'freezing_rain_active' : 'active_rain',
      label: conditionLabel,
      level,
      description: `${conditionLabel} activa (${current.precipitationMm} mm/h).`,
      recommendation: activeProfile === 'field_tech'
        ? level === 'high'
          ? 'Reevaluar trabajos a la intemperie y maniobras eléctricas expuestas según procedimiento HSE.'
          : 'Protege herramientas y verifica superficies resbaladizas antes de continuar tareas exteriores.'
        : level === 'high'
          ? 'Reduce traslados innecesarios y conduce con mayor distancia de seguridad.'
          : 'Lleva protección impermeable y considera pavimento húmedo.',
      affectedProfile: activeProfile,
    });
  } else if (next6hRainProbability >= 70) {
    risks.push({
      id: 'rain_threat',
      label: 'Precipitación Probable',
      level: 'medium',
      description: `Probabilidad máxima de precipitación de ${next6hRainProbability}% durante las próximas 6 horas.`,
      recommendation: activeProfile === 'field_tech'
        ? 'Planifica tareas exteriores considerando una posible interrupción y protege materiales sensibles.'
        : 'Lleva paraguas o impermeable si vas a estar fuera durante las próximas horas.',
      affectedProfile: activeProfile,
    });
  } else if (next6hRainProbability >= 40) {
    risks.push({
      id: 'rain_watch',
      label: 'Posibilidad de Precipitación',
      level: 'low',
      description: `Probabilidad máxima de ${next6hRainProbability}% durante las próximas 6 horas.`,
      recommendation: 'Mantén atención al pronóstico de corto plazo antes de actividades sensibles al clima.',
      affectedProfile: activeProfile,
    });
  }

  // 5. Temperatura: evitar afirmar congelamiento con temperaturas positivas moderadas.
  if (current.temperatureC < 0) {
    risks.push({
      id: 'freezing_temperature',
      label: 'Temperatura Bajo Cero',
      level: 'high',
      description: `Temperatura actual de ${current.temperatureC}°C. Existe riesgo de hielo y exposición al frío.`,
      recommendation: activeProfile === 'field_tech'
        ? 'Verifica hielo en superficies, usa abrigo térmico y aplica los controles HSE de exposición al frío.'
        : 'Abrígate por capas y extrema precaución ante hielo en superficies y rutas.',
      affectedProfile: activeProfile,
    });
  } else if (current.temperatureC < 5) {
    risks.push({
      id: 'cold_temperature',
      label: 'Temperatura Muy Baja',
      level: 'medium',
      description: `Temperatura actual de ${current.temperatureC}°C.`,
      recommendation: 'Usa abrigo adecuado y considera el efecto adicional del viento y la humedad.',
      affectedProfile: activeProfile,
    });
  } else if (current.temperatureC < 10) {
    risks.push({
      id: 'cool_temperature',
      label: 'Ambiente Frío',
      level: 'low',
      description: `Temperatura actual de ${current.temperatureC}°C.`,
      recommendation: 'Una chaqueta abrigada puede ser necesaria durante las primeras horas.',
      affectedProfile: activeProfile,
    });
  }

  if (current.temperatureC >= 35) {
    risks.push({
      id: 'extreme_heat',
      label: 'Calor Extremo',
      level: 'high',
      description: `Temperatura ambiente de ${current.temperatureC}°C.`,
      recommendation: 'Reduce exposición y esfuerzo físico, mantén hidratación frecuente y busca sombra o ambientes frescos.',
      affectedProfile: activeProfile,
    });
  } else if (current.temperatureC >= 30) {
    risks.push({
      id: 'high_heat',
      label: 'Calor Elevado',
      level: 'medium',
      description: `Temperatura ambiente de ${current.temperatureC}°C.`,
      recommendation: 'Mantén hidratación y evita sobreesfuerzo durante las horas más cálidas.',
      affectedProfile: activeProfile,
    });
  }

  // 6. Condición favorable: solo si no hay precipitación activa ni riesgos relevantes.
  const hasSignificantRisks = risks.some(r => r.level === 'high' || r.level === 'critical');
  if (!hasSignificantRisks && !activePrecip) {
    if (activeProfile === 'person' && current.temperatureC >= 15 && current.temperatureC <= 25 && current.uvIndex < 8 && current.windSpeedKmh < 25) {
      risks.push({
        id: 'favorable_person',
        label: 'Condiciones Favorables',
        level: 'low',
        description: 'Temperatura, viento y precipitación se encuentran en rangos cómodos para actividades habituales.',
        recommendation: 'Buenas condiciones generales para actividades al aire libre; revisa igualmente el pronóstico horario.',
        affectedProfile: 'person',
      });
    }
  }

  // 7. Seguridad eléctrica: el clima aporta contexto, pero no declara una tarea "segura" por sí solo.
  if (activeProfile === 'field_tech') {
    const wet = activePrecip || current.condition === 'storm';
    if (wet || current.humidity >= 90) {
      risks.push({
        id: 'electrical_weather_caution',
        label: 'Precaución Climática para Maniobras Eléctricas',
        level: current.condition === 'storm' || precipIntensity === 'heavy' || precipIntensity === 'violent' ? 'high' : 'medium',
        description: wet
          ? 'Hay precipitación o tormenta que puede afectar superficies y equipos expuestos.'
          : `Humedad relativa muy alta (${current.humidity}%).`,
        recommendation: 'Aplicar el procedimiento eléctrico/HSE correspondiente y verificar físicamente humedad, condensación y protección IP antes de intervenir.',
        affectedProfile: 'field_tech',
      });
    }
  }

  // 8. Contexto fotovoltaico: nubosidad/precipitación, sin inferir potencia exacta desde UV.
  if (activeProfile === 'field_tech') {
    if (activePrecip || current.cloudCover >= 80) {
      risks.push({
        id: 'solar_resource_reduced',
        label: 'Recurso Solar Reducido',
        level: 'medium',
        description: `Nubosidad ${current.cloudCover}%${activePrecip ? ' con precipitación activa' : ''}.`,
        recommendation: 'Es esperable menor irradiancia disponible; valida la producción real con SCADA/piranómetro antes de atribuir pérdidas al clima.',
        affectedProfile: 'field_tech',
      });
    } else if (current.cloudCover <= 30) {
      risks.push({
        id: 'solar_resource_favorable',
        label: 'Recurso Solar Favorable',
        level: 'low',
        description: `Nubosidad baja (${current.cloudCover}%) y sin precipitación activa.`,
        recommendation: 'Condiciones atmosféricas favorables para irradiancia; confirma desempeño con medición de planta.',
        affectedProfile: 'field_tech',
      });
    }
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

  const riskScores = calculateSkyCoreRiskScores({ current, hourly, daily, profile });

  const sortedScores = [...riskScores].map(r => r.score).sort((a, b) => b - a);
  const topScores = sortedScores.slice(0, 3);
  const globalScore = topScores.length > 0
    ? Math.round(topScores.reduce((acc, s) => acc + s, 0) / topScores.length)
    : 10;

  const globalRiskLevel = scoreToRiskLevel(globalScore);
  const globalDecision = scoreToDecision(globalScore);

  const { bestWindow, cautionWindows } = analyzeBestWindows({ hourly, profile });

  const recommendations = buildSkyCoreRecommendations({
    profile,
    riskScores,
    bestWindow,
    hourly,
    current,
  });

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

  let personSummary = '';
  let technicalSummary = '';

  if (profile === 'person') {
    const tempRisk = riskScores.find(r => r.category === 'temperature');
    const rainRisk = riskScores.find(r => r.category === 'rain');
    const uvRisk = riskScores.find(r => r.category === 'uv');

    const tempPart = tempRisk && tempRisk.score >= 50 ? `${tempRisk.label}. ` : '';
    const rainPart = rainRisk && rainRisk.score >= 40 ? 'Considera precipitación posible durante el día. ' : '';
    const uvPart = uvRisk && uvRisk.score >= 50 ? 'UV alto, usa protección. ' : 'UV sin alerta destacada. ';
    const windPart = current.windSpeedKmh >= 25 ? 'Viento perceptible.' : '';

    personSummary = `${tempPart}${rainPart}${uvPart}${windPart}`.trim() || 'Condiciones generales estables.';
  } else {
    const elecRisk = riskScores.find(r => r.category === 'electrical_work');
    const fieldRisk = riskScores.find(r => r.category === 'field_work');
    const solarRisk = riskScores.find(r => r.category === 'solar_pv');

    const elecPart = elecRisk && elecRisk.score >= 50 ? `Contexto eléctrico: ${elecRisk.label}. ` : 'Sin alerta meteorológica eléctrica severa. ';
    const fieldPart = fieldRisk && fieldRisk.score >= 50 ? 'Trabajos en terreno requieren evaluación adicional. ' : 'Condiciones exteriores favorables. ';
    const solarPart = solarRisk && solarRisk.score >= 50 ? `FV: ${solarRisk.label}. ` : '';
    const winPart = bestWindow ? `Mejor ventana estimada: ${bestWindow.startTime}–${bestWindow.endTime}.` : '';

    technicalSummary = `${elecPart}${fieldPart}${solarPart}${winPart}`.trim() || 'Operaciones sin alerta meteorológica destacada.';
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
    technicalSummary,
  };
}

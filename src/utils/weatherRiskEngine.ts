import { CurrentWeather, HourlyForecast, DailyForecast, WeatherProfile, ClimateRisk, RiskLevel, AdvancedSkyCoreAnalysis, SkyCoreDecision } from '../types/weatherTypes';
import { calculateSkyCoreRiskScores } from './skyCoreRiskScoring';
import { analyzeBestWindows } from './skyCoreWindowAnalyzer';
import { buildSkyCoreRecommendations } from './skyCoreRecommendationEngine';
import { scoreToRiskLevel, scoreToDecision } from './skyCoreRiskLabels';


export function buildClimateRisks(
  current: CurrentWeather,
  hourly: HourlyForecast[],
  daily: DailyForecast[],
  activeProfile: WeatherProfile
): ClimateRisk[] {
  const risks: ClimateRisk[] = [];

  // --- ANALISIS DE CONDICIONES GENERALES Y ESPECIFICAS ---

  // 1. Humedad Alta
  if (current.humidity >= 85) {
    risks.push({
      id: 'high_humidity',
      label: 'Humedad Extrema',
      level: 'high',
      description: `Humedad relativa del ${current.humidity}%. Hay alta condensación en el ambiente.`,
      recommendation: activeProfile === 'field_tech'
        ? 'Evitar apertura de tableros eléctricos o manipulación de cableado expuesto hasta que disminuya de 80%.'
        : 'La mañana se sentirá más helada y húmeda. Evita secar ropa afuera y ventila en horas de sol.',
      affectedProfile: 'field_tech',
    });
    // Add for person too if high humidity affects daily life
    if (activeProfile === 'person') {
      risks.push({
        id: 'high_humidity_person',
        label: 'Sensación de Humedad',
        level: 'medium',
        description: `Humedad de ${current.humidity}%. El frío se intensifica y la ropa tarda más en secar.`,
        recommendation: 'Usa ropa con buena barrera contra el viento y la humedad temprana.',
        affectedProfile: 'person',
      });
    }
  } else if (current.humidity >= 75) {
    risks.push({
      id: 'moderate_humidity',
      label: 'Humedad Elevada',
      level: 'medium',
      description: `Humedad de ${current.humidity}%. Humedad considerable típica del amanecer o valles costeros.`,
      recommendation: activeProfile === 'field_tech'
        ? 'Tomar precauciones en tableros eléctricos. Idealmente postergar maniobras de precisión.'
        : 'Sensación térmica fresca. Lleva abrigo que resista la humedad de la mañana.',
      affectedProfile: 'field_tech',
    });
  }

  // 2. Viento Fuerte y Ráfagas
  if (current.windSpeedKmh > 30 || current.windGustKmh > 45) {
    const isCritical = current.windGustKmh > 55 || current.windSpeedKmh > 40;
    const level: RiskLevel = isCritical ? 'high' : 'medium';
    
    risks.push({
      id: 'high_wind',
      label: current.windGustKmh > 45 ? 'Ráfagas de Viento Peligrosas' : 'Viento Sostenido Fuerte',
      level: level,
      description: `Viento de ${current.windSpeedKmh} km/h con ráfagas de hasta ${current.windGustKmh} km/h.`,
      recommendation: activeProfile === 'field_tech'
        ? 'Evitar trabajos en altura, izajes con grúas o manipulación de láminas ligeras. Sujeta herramientas.'
        : 'Asegura elementos sueltos en balcones o patios. Ten precaución al caminar cerca de árboles o letreros.',
      affectedProfile: activeProfile,
    });
  } else if (current.windSpeedKmh > 20) {
    risks.push({
      id: 'moderate_wind',
      label: 'Brisa Firme',
      level: 'low',
      description: `Viento regular de ${current.windSpeedKmh} km/h.`,
      recommendation: activeProfile === 'field_tech'
        ? 'Monitorear ráfagas si se realizan trabajos de altura menor.'
        : 'Día fresco al aire libre. Una chaqueta cortavientos es recomendable.',
      affectedProfile: activeProfile,
    });
  }

  // 3. Radiación UV
  if (current.uvIndex >= 8) {
    risks.push({
      id: 'extreme_uv',
      label: 'Radiación UV Extrema',
      level: 'high',
      description: `Índice UV actual: ${current.uvIndex}. Exposición desprotegida altamente nociva.`,
      recommendation: activeProfile === 'field_tech'
        ? 'Uso obligatorio de bloqueador solar FPS 50+, protector de cuello (legionario), lentes con filtro UV y rotar personal en sombra cada 45 min.'
        : 'Usa sombrero, lentes de sol, bloqueador solar obligatorio y evita exponerte directamente al sol entre las 11:00 y las 15:00.',
      affectedProfile: activeProfile,
    });
  } else if (current.uvIndex >= 6) {
    risks.push({
      id: 'high_uv',
      label: 'Radiación UV Alta',
      level: 'medium',
      description: `Índice UV actual: ${current.uvIndex}. Riesgo de quemaduras rápido.`,
      recommendation: activeProfile === 'field_tech'
        ? 'Usar bloqueador solar de terreno y casco con visera. Mantener hidratación continua.'
        : 'Aplica bloqueador solar de amplio espectro. Busca la sombra si vas a estar afuera por mucho tiempo.',
      affectedProfile: activeProfile,
    });
  } else if (current.uvIndex >= 3 && activeProfile === 'person') {
    risks.push({
      id: 'moderate_uv',
      label: 'Radiación UV Moderada',
      level: 'low',
      description: `Índice UV actual: ${current.uvIndex}.`,
      recommendation: 'Usa bloqueador solar básico si estarás expuesto por más de 30 minutos.',
      affectedProfile: 'person',
    });
  }

  // 4. Lluvia y Probabilidad de Lluvia
  const rainyDay = daily[0]?.precipitationProbability > 50 || current.precipitationMm > 0;
  if (current.condition === 'storm') {
    risks.push({
      id: 'critical_storm',
      label: 'Alerta de Tormenta Activa',
      level: 'critical',
      description: 'Condiciones de tormenta eléctrica y lluvia fuerte.',
      recommendation: activeProfile === 'field_tech'
        ? 'SUSPENDER toda actividad en terreno descubierto de inmediato. Refugiarse en zonas seguras. No tocar estructuras metálicas.'
        : 'Quédate en casa. Evita salir de no ser estrictamente necesario. Desconecta equipos electrónicos sensibles.',
      affectedProfile: activeProfile,
    });
  } else if (current.condition === 'rain' || current.precipitationMm > 1) {
    risks.push({
      id: 'active_rain',
      label: 'Precipitación Activa',
      level: 'high',
      description: `Lluvia cayendo en terreno (${current.precipitationMm} mm/h). Superficies resbaladizas y visibilidad reducida.`,
      recommendation: activeProfile === 'field_tech'
        ? 'Pisos mojados, riesgo de resbalamiento y problemas con herramientas eléctricas. Detener trabajos a la intemperie.'
        : 'Lleva paraguas y calzado impermeable. Conduce con extrema precaución por asfalto resbaladizo.',
      affectedProfile: activeProfile,
    });
  } else if (rainyDay) {
    risks.push({
      id: 'rain_threat',
      label: 'Probabilidad de Lluvia',
      level: 'medium',
      description: `Probabilidad de lluvia del ${Math.max(daily[0]?.precipitationProbability || 0, current.precipitationMm > 0 ? 90 : 30)}% para la jornada.`,
      recommendation: activeProfile === 'field_tech'
        ? 'Asegurar carpas, sellar acopios de material soluble y preparar equipo impermeable para el personal.'
        : 'Lleva un paraguas en la mochila y planifica actividades bajo techo para la tarde.',
      affectedProfile: activeProfile,
    });
  }

  // 5. Frío Extremo o Calor Extremo
  if (current.temperatureC < 5) {
    risks.push({
      id: 'extreme_cold',
      label: 'Bajas Temperaturas Severas',
      level: 'high',
      description: `Temperatura actual de ${current.temperatureC}°C. Peligro de entumecimiento y congelamiento ligero.`,
      recommendation: activeProfile === 'field_tech'
        ? 'Uso de ropa térmica por capas (3 capas estándar), guantes de protección climática y pausas para tomar líquidos calientes.'
        : 'Abrígate bien con primera capa térmica, bufanda y guantes. Protege a niños y mascotas.',
      affectedProfile: activeProfile,
    });
  } else if (current.temperatureC < 10) {
    risks.push({
      id: 'moderate_cold',
      label: 'Frío Matutino/Persistente',
      level: 'medium',
      description: `Temperatura de ${current.temperatureC}°C con sensación térmica baja.`,
      recommendation: activeProfile === 'field_tech'
        ? 'Precalentar herramientas y motores de terreno antes de iniciar operaciones pesadas.'
        : 'Lleva una buena chaqueta temprano. El aire frío se mantendrá por varias horas.',
      affectedProfile: activeProfile,
    });
  }

  if (current.temperatureC > 32) {
    risks.push({
      id: 'extreme_heat',
      label: 'Calor Extremo y Estrés Térmico',
      level: 'high',
      description: `Temperatura ambiente de ${current.temperatureC}°C. Alto riesgo de deshidratación y fatiga térmica.`,
      recommendation: activeProfile === 'field_tech'
        ? 'Beber 1 vaso de agua fría cada 15-20 minutos de forma obligatoria. Pausas de 10 min en sombra por cada hora de trabajo continuo.'
        : 'Mantente hidratado constantemente, evita actividad física intensa al aire libre y mantén ambientes ventilados.',
      affectedProfile: activeProfile,
    });
  }

  // 6. Condiciones Favorables
  const hasSignificantRisks = risks.some(r => r.level === 'high' || r.level === 'critical');
  
  if (!hasSignificantRisks) {
    if (activeProfile === 'person' && current.temperatureC >= 15 && current.temperatureC <= 25 && current.uvIndex < 8 && current.condition !== 'rain') {
      risks.push({
        id: 'favorable_person',
        label: 'Clima Altamente Favorable',
        level: 'low',
        description: `Temperatura ideal de ${current.temperatureC}°C, viento templado y buena visibilidad.`,
        recommendation: '¡Excelente día para actividades al aire libre! Aprovecha de caminar, hacer deporte o pasear.',
        affectedProfile: 'person',
      });
    }

    if (activeProfile === 'field_tech' && current.temperatureC >= 10 && current.temperatureC <= 28 && current.windSpeedKmh < 25 && current.humidity < 75 && current.condition !== 'rain') {
      risks.push({
        id: 'favorable_tech',
        label: 'Ventana Operativa Óptima',
        level: 'low',
        description: 'Parámetros de viento, temperatura y humedad perfectamente estables para tareas de precisión.',
        recommendation: 'Aprovechar para mantenimientos preventivos complejos, trabajos en altura y calibraciones de sensores.',
        affectedProfile: 'field_tech',
      });
    }
  }

  // 7. Trabajos Eléctricos
  if (activeProfile === 'field_tech') {
    const isElectricSafe = current.humidity < 75 && current.precipitationMm === 0 && current.condition !== 'rain' && current.condition !== 'storm';
    if (!isElectricSafe) {
      risks.push({
        id: 'electrical_caution',
        label: 'Restricción de Maniobras Eléctricas',
        level: current.humidity >= 85 || current.condition === 'rain' || current.condition === 'storm' ? 'high' : 'medium',
        description: `Humedad de ${current.humidity}% o probabilidad de chubascos activa.`,
        recommendation: 'Restringir apertura de gabinetes o celdas de media/baja tensión. Priorizar reparaciones internas o inspecciones de software.',
        affectedProfile: 'field_tech',
      });
    } else {
      risks.push({
        id: 'electrical_safe',
        label: 'Trabajos Eléctricos Aptos',
        level: 'low',
        description: `Humedad moderada (${current.humidity}%) y ausencia de precipitaciones.`,
        recommendation: 'Seguro abrir gabinetes de control para mantención, siguiendo protocolos estándar de bloqueo (LOTO).',
        affectedProfile: 'field_tech',
      });
    }
  }

  // 8. Condición Solar Fotovoltaica (FV) dentro de Perfil Técnico Terreno
  if (activeProfile === 'field_tech') {
    const isPvOptimum = current.uvIndex >= 6 && current.cloudCover < 30;
    const isPvLow = current.cloudCover > 70 || current.condition === 'rain' || current.condition === 'storm';
    
    if (isPvOptimum) {
      risks.push({
        id: 'solar_pv_optimum',
        label: 'Generación Fotovoltaica Máxima',
        level: 'low', // low risk = good condition
        description: `Cielos despejados (nubosidad ${current.cloudCover}%) y alta radiación (UV ${current.uvIndex}).`,
        recommendation: 'Monitorear picos de inyección en inversores. Se prevé máxima eficiencia del parque solar.',
        affectedProfile: 'field_tech',
      });
    } else if (isPvLow) {
      risks.push({
        id: 'solar_pv_low',
        label: 'Generación Fotovoltaica Reducida',
        level: 'medium', // moderate risk of low yield
        description: `Alta nubosidad (${current.cloudCover}%) o lluvia limitan el recurso solar disponible.`,
        recommendation: 'La generación caerá hasta un 70-90% de la capacidad nominal. Ajustar proyecciones de despacho de red.',
        affectedProfile: 'field_tech',
      });
    } else {
      risks.push({
        id: 'solar_pv_moderate',
        label: 'Generación Fotovoltaica Estable',
        level: 'low',
        description: `Nubosidad parcial de ${current.cloudCover}%. Radiación fluctuante pero aceptable.`,
        recommendation: 'Generación nominal moderada. Buen momento para limpieza física de paneles gracias a temperaturas más bajas.',
        affectedProfile: 'field_tech',
      });
    }
  }

  // Filter to return only risks that are useful/tagged for the active profile
  // Note: we can show all risks but filter based on the affected profile
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

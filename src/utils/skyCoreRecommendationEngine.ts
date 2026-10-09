import { WeatherProfile, SkyCoreRiskScore, SkyCoreTimeWindow, HourlyForecast, CurrentWeather, SkyCoreRecommendation, SkyCoreRiskCategory } from '../types/weatherTypes';

export function buildSkyCoreRecommendations(params: {
  profile: WeatherProfile;
  riskScores: SkyCoreRiskScore[];
  bestWindow?: SkyCoreTimeWindow;
  hourly: HourlyForecast[];
  current: CurrentWeather;
}): SkyCoreRecommendation[] {
  const { profile, riskScores, bestWindow, hourly, current } = params;
  const recommendations: SkyCoreRecommendation[] = [];

  // Sort risk scores by priority * score to find the most pressing hazards
  const sortedHazards = [...riskScores].sort((a, b) => {
    const scoreA = a.score * a.priority;
    const scoreB = b.score * b.priority;
    return scoreB - scoreA;
  });

  // 1. Add recommendations from major hazards (risk score >= 25)
  sortedHazards.forEach((hazard) => {
    if (hazard.score >= 25) {
      // Map hazard levels to recommendation priority
      let priority: 'low' | 'medium' | 'high' | 'critical' = 'low';
      if (hazard.score >= 75) priority = 'critical';
      else if (hazard.score >= 50) priority = 'high';
      else if (hazard.score >= 25) priority = 'medium';

      recommendations.push({
        id: `rec_hazard_${hazard.category}`,
        title: hazard.label,
        message: `${hazard.reason} ${hazard.recommendation}`,
        priority,
        profile,
        category: hazard.category,
        actionLabel: getActionLabelForCategory(hazard.category, profile),
      });
    }
  });

  // 2. Add Best Window recommendation if available and has favorable score
  if (bestWindow && bestWindow.score >= 55) {
    recommendations.push({
      id: 'rec_best_window',
      title: `Ventana Recomendada: ${bestWindow.startTime} a ${bestWindow.endTime}`,
      message: profile === 'field_tech'
        ? `Bloque de tiempo con las mejores condiciones operativas del día (${bestWindow.label}). Motivo: ${bestWindow.reason}.`
        : `Bloque ideal para tus actividades programadas al aire libre (${bestWindow.label}). Motivo: ${bestWindow.reason}.`,
      priority: 'medium',
      profile,
      category: 'general',
      actionLabel: profile === 'field_tech' ? 'Programar Terreno' : 'Planificar Salida',
    });
  }

  // 3. Fallback recommendations if nothing major is going on
  if (recommendations.length === 0) {
    if (profile === 'field_tech') {
      recommendations.push({
        id: 'rec_tech_standard',
        title: 'Condición Operativa Estable',
        message: 'Clima propicio para actividades regulares en terreno y mantenimientos preventivos. Seguir protocolos estándar de protección de cables e inversores.',
        priority: 'low',
        profile: 'field_tech',
        category: 'field_work',
        actionLabel: 'Ver Protocolo',
      });
    } else {
      recommendations.push({
        id: 'rec_person_standard',
        title: 'Día Confortable y Estable',
        message: 'No se detectan riesgos meteorológicos. Buen día para realizar paseos, caminatas urbanas o actividades recreacionales al aire libre.',
        priority: 'low',
        profile: 'person',
        category: 'general',
        actionLabel: 'Disfrutar Día',
      });
    }
  }

  // De-duplicate and sort recommendations by priority level
  const priorityWeight = { critical: 4, high: 3, medium: 2, low: 1 };
  return recommendations
    .filter((v, i, a) => a.findIndex((t) => t.id === v.id) === i)
    .sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority]);
}

function getActionLabelForCategory(cat: SkyCoreRiskCategory, profile: WeatherProfile): string | undefined {
  if (profile === 'field_tech') {
    switch (cat) {
      case 'electrical_work': return 'Validar Protocolo HSE';
      case 'field_work': return 'Revisar Criterios';
      case 'solar_pv': return 'Verificar SCADA';
      case 'humidity': return 'Secar Condensación';
      case 'wind':
      case 'gusts': return 'Medir Anemómetro';
      case 'uv': return 'Bloqueador e Hidratación';
      default: return 'Ver Medidas';
    }
  } else {
    switch (cat) {
      case 'uv': return 'Usar Bloqueador';
      case 'rain': return 'Llevar Paraguas';
      case 'cold': return 'Llevar Abrigo';
      case 'heat': return 'Tomar Agua';
      default: return 'Detalles';
    }
  }
}

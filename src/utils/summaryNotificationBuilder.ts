import { CurrentWeather, DailyForecast, SmartWeatherAlert, AdvancedSkyCoreAnalysis } from '../types/weatherTypes';

export function truncateNotificationText(text: string, maxLength: number = 180): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

export function buildPersonMorningBody(params: {
  current: CurrentWeather;
  alerts: SmartWeatherAlert[];
  advancedAnalysis: AdvancedSkyCoreAnalysis;
}): string {
  const { current, alerts, advancedAnalysis } = params;

  // 1. Temp description
  const temp = Math.round(current.temperatureC);
  let tempDesc = `${temp}°C`;
  if (temp < 10) tempDesc = `Mañana fría (${temp}°C)`;
  else if (temp < 20) tempDesc = `Mañana templada (${temp}°C)`;
  else tempDesc = `Mañana calurosa (${temp}°C)`;

  // 2. Main risk
  let mainRisk = 'sin alertas activas';
  const activeAlerts = alerts.filter(a => a.profile === 'person' && a.severity !== 'info');
  if (activeAlerts.length > 0) {
    mainRisk = activeAlerts[0].title;
  } else if (current.uvIndex >= 6) {
    mainRisk = 'UV alto al mediodía';
  } else if (current.precipitationMm > 0) {
    mainRisk = 'lluvia intermitente';
  } else if (current.windSpeedKmh > 25) {
    mainRisk = 'viento moderado';
  }

  // 3. Best window
  let bestWindowStr = '10:00–14:00';
  if (advancedAnalysis.bestWindow) {
    bestWindowStr = advancedAnalysis.bestWindow.label;
  }

  // 4. Recommendation
  let recommendation = 'Disfruta tu día.';
  if (advancedAnalysis.recommendations && advancedAnalysis.recommendations.length > 0) {
    const rec = advancedAnalysis.recommendations.find(r => r.profile === 'person');
    if (rec) {
      recommendation = rec.message;
    }
  }

  const rawText = `${tempDesc}, ${mainRisk}. Mejor ventana: ${bestWindowStr}. ${recommendation}`;
  return truncateNotificationText(rawText);
}

export function buildFieldPreShiftBody(params: {
  current: CurrentWeather;
  alerts: SmartWeatherAlert[];
  advancedAnalysis: AdvancedSkyCoreAnalysis;
}): string {
  const { current, alerts, advancedAnalysis } = params;

  // 1. Operational condition based on SkyCore globalDecision
  let opCondition = 'favorable';
  if (advancedAnalysis.globalDecision === 'optimal') opCondition = 'óptima';
  else if (advancedAnalysis.globalDecision === 'caution') opCondition = 'con precaución';
  else if (advancedAnalysis.globalDecision === 'not_recommended') opCondition = 'no recomendada';
  else if (advancedAnalysis.globalDecision === 'critical') opCondition = 'crítica';

  // 2. Main risk
  let mainRisk = 'sin riesgos críticos';
  const activeTechAlerts = alerts.filter(a => a.profile === 'field_tech' && a.severity !== 'info');
  if (activeTechAlerts.length > 0) {
    mainRisk = activeTechAlerts[0].title;
  } else if (current.humidity > 80) {
    mainRisk = 'humedad alta';
  } else if (current.windGustKmh > 40) {
    mainRisk = 'rachas de viento';
  } else if (current.uvIndex >= 8) {
    mainRisk = 'radiación UV crítica';
  }

  // 3. Best window
  let bestWindowStr = '09:00–15:00';
  if (advancedAnalysis.bestWindow) {
    bestWindowStr = advancedAnalysis.bestWindow.label;
  }

  // 4. Criterio HSE and parameters
  const windText = current.windSpeedKmh > 0 ? `, viento ${Math.round(current.windSpeedKmh)} km/h` : '';
  const humidityText = current.humidity > 0 ? `, humedad ${current.humidity}%` : '';

  const rawText = `Condición ${opCondition} por ${mainRisk}${windText}${humidityText}. Mejor ventana: ${bestWindowStr}. Mantener criterio HSE en terreno.`;
  return truncateNotificationText(rawText);
}

export function buildEveningPreviewBody(params: {
  daily: DailyForecast[];
  alerts: SmartWeatherAlert[];
  advancedAnalysis: AdvancedSkyCoreAnalysis;
}): string {
  const { daily } = params;

  if (!daily || daily.length === 0) {
    return 'Mañana se espera clima estable. ORBI recomienda revisar el resumen matutino.';
  }

  const tomorrow = daily[0];
  const minT = Math.round(tomorrow.minTempC);
  const maxT = Math.round(tomorrow.maxTempC);

  let tempTrend = `fresco temprano (${minT}°C)`;
  if (minT < 5) tempTrend = `frío temprano (${minT}°C)`;
  else if (minT > 18) tempTrend = `cálido temprano (${minT}°C)`;

  let uvTrend = '';
  if (tomorrow.uvMax >= 7) {
    uvTrend = ' y UV alto al mediodía';
  } else if (tomorrow.precipitationProbability > 50) {
    uvTrend = ' y probabilidad de lluvia';
  }

  const rawText = `Mañana se espera ${tempTrend}${uvTrend}. ORBI recomienda revisar el resumen matutino.`;
  return truncateNotificationText(rawText);
}

import { HourlyForecast, WeatherProfile, SkyCoreTimeWindow, SkyCoreDecision } from '../types/weatherTypes';

function parseHourFromFormattedTime(timeStr: string): number {
  const match = timeStr.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
  if (!match) return 12;
  let hr = parseInt(match[1], 10);
  const isPM = match[3].toUpperCase() === 'PM';
  if (isPM && hr < 12) hr += 12;
  if (!isPM && hr === 12) hr = 0;
  return hr;
}

export function analyzeBestWindows(params: {
  hourly: HourlyForecast[];
  profile: WeatherProfile;
}): {
  bestWindow?: SkyCoreTimeWindow;
  cautionWindows: SkyCoreTimeWindow[];
} {
  const { hourly, profile } = params;
  if (!hourly || hourly.length === 0) {
    return { cautionWindows: [] };
  }

  // Define 4 daily blocks
  const blocks = [
    { id: 'morning_early', label: 'Mañana Temprana', startHour: 6, endHour: 9, startTime: '06:00 AM', endTime: '09:00 AM' },
    { id: 'morning_mid', label: 'Mañana Operativa', startHour: 9, endHour: 13, startTime: '09:00 AM', endTime: '01:00 PM' },
    { id: 'midday_peak', label: 'Mediodía y Tarde', startHour: 13, endHour: 17, startTime: '01:00 PM', endTime: '05:00 PM' },
    { id: 'evening_relax', label: 'Tarde Noche', startHour: 17, endHour: 21, startTime: '05:00 PM', endTime: '09:00 PM' },
  ];

  const analyzedWindows: SkyCoreTimeWindow[] = [];

  for (const block of blocks) {
    // Find hourly forecasts in this block
    const blockHours = hourly.filter(h => {
      const hr = parseHourFromFormattedTime(h.time);
      return hr >= block.startHour && hr < block.endHour;
    });

    if (blockHours.length === 0) continue;

    // Calculate average metrics in the block
    const avgTemp = blockHours.reduce((acc, h) => acc + h.temperatureC, 0) / blockHours.length;
    const avgHum = blockHours.reduce((acc, h) => acc + h.humidity, 0) / blockHours.length;
    const avgWind = blockHours.reduce((acc, h) => acc + h.windSpeedKmh, 0) / blockHours.length;
    const maxRainProb = Math.max(...blockHours.map(h => h.precipitationProbability));
    const maxRainMm = Math.max(...blockHours.map(h => h.precipitationMm));
    const maxUv = Math.max(...blockHours.map(h => h.uvIndex));
    const hasStorm = blockHours.some(h => h.condition === 'storm');

    let score = 100;
    const reasons: string[] = [];

    if (profile === 'field_tech') {
      // Field Tech scoring
      if (hasStorm) {
        score -= 75;
        reasons.push('Riesgo crítico de tormenta eléctrica');
      }
      if (maxRainProb >= 60) {
        score -= 30;
        reasons.push('Probabilidad de precipitaciones');
      } else if (maxRainProb >= 30) {
        score -= 15;
        reasons.push('Llovizna potencial');
      }
      if (avgHum >= 85) {
        score -= 25;
        reasons.push('Humedad muy alta (condensación)');
      } else if (avgHum >= 75) {
        score -= 10;
        reasons.push('Humedad moderada');
      }
      if (avgWind >= 35) {
        score -= 35;
        reasons.push('Viento fuerte inhabilitante');
      } else if (avgWind >= 20) {
        score -= 15;
        reasons.push('Viento regular perceptible');
      }
      if (maxUv >= 8) {
        score -= 20;
        reasons.push('Radiación UV muy alta');
      }
      if (avgTemp <= 5 || avgTemp >= 33) {
        score -= 20;
        reasons.push('Temperatura extrema para terreno');
      }

      // Contextual reason builder if favorable
      if (score >= 75) {
        reasons.push('Menor humedad, sin lluvias y viento controlado para maniobras');
      } else if (score >= 50 && reasons.length === 0) {
        reasons.push('Condiciones operativas estables de terreno');
      }
    } else {
      // Person scoring
      if (hasStorm) {
        score -= 70;
        reasons.push('Riesgo de tormentas');
      }
      if (maxRainProb >= 50) {
        score -= 25;
        reasons.push('Inestabilidad y probabilidad de lluvia');
      }
      if (avgTemp < 8) {
        score -= 20;
        reasons.push('Ambiente muy helado');
      } else if (avgTemp > 31) {
        score -= 20;
        reasons.push('Calor intenso bajo el sol');
      }
      if (avgWind >= 25) {
        score -= 15;
        reasons.push('Ráfagas de viento molestas');
      }
      if (maxUv >= 7) {
        score -= 15;
        reasons.push('Índice UV nocivo sin bloqueador');
      }

      if (score >= 75) {
        reasons.push('Temperatura agradable, brisas leves y cielo óptimo para salir');
      } else if (score >= 50 && reasons.length === 0) {
        reasons.push('Condiciones generales estables para paseo');
      }
    }

    score = Math.max(0, Math.min(100, score));

    // Map score to decision
    let decision: SkyCoreDecision = 'caution';
    if (score >= 80) decision = 'optimal';
    else if (score >= 60) decision = 'favorable';
    else if (score >= 40) decision = 'caution';
    else if (score >= 20) decision = 'not_recommended';
    else decision = 'critical';

    // Format final reason
    let reasonText = reasons.join(', ');
    if (!reasonText) reasonText = 'Condiciones meteorológicas templadas.';

    analyzedWindows.push({
      id: block.id,
      label: block.label,
      startTime: block.startTime,
      endTime: block.endTime,
      decision,
      score,
      reason: reasonText,
      recommendedFor: profile
    });
  }

  // Sort by score descending to get the best window
  const sortedWindows = [...analyzedWindows].sort((a, b) => b.score - a.score);
  const bestWindow = sortedWindows[0] && sortedWindows[0].score >= 45 ? sortedWindows[0] : undefined;

  // Caution windows are those with decisions like caution, not_recommended, critical
  const cautionWindows = analyzedWindows.filter(w => 
    w.decision === 'caution' || w.decision === 'not_recommended' || w.decision === 'critical'
  );

  return {
    bestWindow,
    cautionWindows
  };
}

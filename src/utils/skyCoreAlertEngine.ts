import { 
  CurrentWeather, 
  HourlyForecast, 
  DailyForecast, 
  WeatherProfile, 
  AdvancedSkyCoreAnalysis, 
  SmartWeatherAlert,
  SmartAlertSeverity,
  SmartAlertCategory
} from '../types/weatherTypes';
import { dedupeSmartAlerts } from './skyCoreAlertDedup';
import { precipitationIntensityRank } from './wmoWeatherCodeMapper';

/**
 * Generador principal de alertas climáticas inteligentes basadas en el motor ORBI SkyCore™
 */
export function buildSmartWeatherAlerts(params: {
  current: CurrentWeather;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  profile: WeatherProfile;
  advancedAnalysis: AdvancedSkyCoreAnalysis;
}): SmartWeatherAlert[] {
  const { current, hourly, daily, profile, advancedAnalysis } = params;
  const alerts: SmartWeatherAlert[] = [];
  const nowStr = new Date().toISOString();

  // Helper para crear estructura de alerta de forma segura
  const createAlert = (args: {
    id: string;
    title: string;
    message: string;
    severity: SmartAlertSeverity;
    category: SmartAlertCategory;
    startsAt?: string;
    endsAt?: string;
    timeLabel: string;
    actionLabel?: string;
    recommendation: string;
    priority: number;
  }): SmartWeatherAlert => {
    return {
      id: args.id,
      title: args.title,
      message: args.message,
      severity: args.severity,
      category: args.category,
      profile: profile,
      status: 'active',
      startsAt: args.startsAt,
      endsAt: args.endsAt,
      timeLabel: args.timeLabel,
      actionLabel: args.actionLabel,
      recommendation: args.recommendation,
      source: 'skycore',
      createdAt: nowStr,
      priority: args.priority,
      relatedRiskLevel: args.severity === 'critical' ? 'critical' : args.severity === 'warning' ? 'high' : args.severity === 'watch' ? 'medium' : 'low'
    };
  };

  // ----------------------------------------------------
  // REGLAS GENERALES & DIPLICADAS SEGÚN EL PERFIL ACTIVO
  // ----------------------------------------------------

  if (profile === 'person') {
    // 1. Precipitación próxima o actual con semántica WMO (llovizna != lluvia intensa)
    const next6HoursRain = hourly.slice(0, 6);
    const rainHour = next6HoursRain.find(h => h.precipitationProbability >= 60);
    const precipPhenomena = ['drizzle', 'freezing_drizzle', 'rain', 'freezing_rain', 'showers', 'snow', 'snow_showers', 'thunderstorm', 'thunderstorm_hail'];
    const hasCurrentPrecip = current.precipitationMm > 0 || Boolean(current.phenomenon && precipPhenomena.includes(current.phenomenon));

    if (hasCurrentPrecip) {
      const rank = precipitationIntensityRank(current.precipitationIntensity);
      const isDrizzle = current.phenomenon === 'drizzle';
      const isFreezing = current.phenomenon === 'freezing_drizzle' || current.phenomenon === 'freezing_rain';
      const isStorm = current.phenomenon === 'thunderstorm' || current.phenomenon === 'thunderstorm_hail';
      const severity: SmartAlertSeverity = isStorm || rank >= 4 || isFreezing ? 'warning' : isDrizzle || rank <= 2 ? 'info' : 'watch';
      const amountContext = current.precipitationIntervalMinutes
        ? `${current.precipitationMm.toFixed(1)} mm/${Math.round(current.precipitationIntervalMinutes)} min`
        : `${current.precipitationMm.toFixed(1)} mm`;

      alerts.push(createAlert({
        id: 'p_precip_now',
        title: current.conditionLabel || (isDrizzle ? 'Llovizna Activa' : 'Precipitación Activa'),
        message: `${current.conditionLabel || 'Precipitación'} en el intervalo actual (${amountContext}).`,
        severity,
        category: 'rain',
        timeLabel: 'Ahora',
        actionLabel: 'Ver detalle',
        recommendation: isDrizzle
          ? 'Llovizna ligera: considera impermeable liviano y pavimento húmedo.'
          : 'Adapta tus traslados a la intensidad observada y revisa la evolución horaria.',
        priority: isStorm ? 98 : isDrizzle ? 45 : rank >= 3 ? 82 : 60
      }));
    } else if (rainHour) {
      alerts.push(createAlert({
        id: 'p_rain_upcoming',
        title: 'Precipitación Probable',
        message: `Probabilidad de precipitación de ${rainHour.precipitationProbability}% cerca de las ${rainHour.time}${rainHour.conditionLabel ? ` (${rainHour.conditionLabel.toLowerCase()})` : ''}.`,
        severity: rainHour.precipitationProbability >= 80 ? 'watch' : 'info',
        category: 'rain',
        startsAt: rainHour.isoTime || rainHour.time,
        timeLabel: 'Próximas horas',
        actionLabel: 'Ver pronóstico',
        recommendation: 'Lleva protección para la lluvia si vas a estar fuera y revisa la actualización antes de salir.',
        priority: rainHour.precipitationProbability >= 80 ? 72 : 55
      }));
    }

    // 2. UV Alto
    const maxUV = Math.max(current.uvIndex, ...hourly.slice(0, 8).map(h => h.uvIndex));
    if (maxUV >= 6) {
      alerts.push(createAlert({
        id: 'p_uv_high',
        title: 'Radiación UV Alta',
        message: 'UV alto entre 12:00 y 15:00. Usa protección solar si estarás al aire libre.',
        severity: 'warning',
        category: 'uv',
        startsAt: '12:00',
        endsAt: '15:00',
        timeLabel: 'Mediodía',
        actionLabel: 'Protección UV',
        recommendation: 'Aplica protector solar FPS 50+, usa sombrero de ala ancha y gafas con filtro UV.',
        priority: 90
      }));
    }

    // 3. Frío Temprano
    const morningHours = hourly.slice(0, 5); // primeras horas del pronóstico
    const coldMorningHour = morningHours.find(h => h.temperatureC <= 8);
    const isColdCurrent = current.temperatureC <= 8;

    if (isColdCurrent || coldMorningHour) {
      alerts.push(createAlert({
        id: 'p_cold_early',
        title: 'Mañana Fría',
        message: 'Mañana fría. Lleva chaqueta abrigada si sales temprano.',
        severity: 'watch',
        category: 'cold',
        timeLabel: 'Mañana',
        actionLabel: 'Ver evolución',
        recommendation: 'Vístete en capas. La temperatura aumentará progresivamente hacia la tarde.',
        priority: 60
      }));
    }

    // 4. Calor Fuerte
    const maxTempToday = Math.max(current.temperatureC, ...hourly.slice(0, 12).map(h => h.temperatureC));
    if (maxTempToday >= 30) {
      alerts.push(createAlert({
        id: 'p_heat_strong',
        title: 'Calor Intenso',
        message: 'Calor durante la tarde. Hidrátate bien y evita exposición directa y prolongada al sol.',
        severity: 'warning',
        category: 'heat',
        timeLabel: 'Tarde',
        actionLabel: 'Ver hidratación',
        recommendation: 'Bebe abundante agua, busca ambientes sombreados y prefiere ropa ligera de colores claros.',
        priority: 75
      }));
    }

    // 5. Viento Molesto
    if (current.windSpeedKmh >= 25) {
      alerts.push(createAlert({
        id: 'p_wind_gusty',
        title: 'Viento Concurrente',
        message: 'Viento perceptible durante el día. Considera abrigo adicional si sales.',
        severity: 'watch',
        category: 'wind',
        timeLabel: 'Hoy',
        actionLabel: 'Ver detalles',
        recommendation: 'Usa una prenda cortavientos y ten precaución con objetos ligeros o volátiles en exteriores.',
        priority: 50
      }));
    }

  } else {
    // ----------------------------------------------------
    // PERFIL TÉCNICO TERRENO
    // ----------------------------------------------------

    // 1. Tormenta (CRITICAL)
    const isStormActive = current.condition === 'storm';
    const hasUpcomingStorm = hourly.slice(0, 6).some(h => h.condition === 'storm');

    if (isStormActive || hasUpcomingStorm) {
      alerts.push(createAlert({
        id: 't_storm_critical',
        title: 'Alerta Eléctrica: Tormenta Activa',
        message: 'Riesgo de tormenta detectado. No se recomiendan trabajos eléctricos expuestos ni actividades exteriores sin evaluación de seguridad.',
        severity: 'critical',
        category: 'storm',
        timeLabel: 'Inmediato',
        actionLabel: 'Protocolo HSE',
        recommendation: 'Aplicar inmediatamente el protocolo HSE de tormenta de la faena. Suspender actividades cuando el procedimiento o la evaluación en terreno así lo exijan y buscar refugio seguro.',
        priority: 100
      }));
    }

    // 2. Condensación: usar margen temperatura-punto de rocío cuando esté disponible.
    const dewPointSpread = current.dewPointC !== undefined ? current.temperatureC - current.dewPointC : undefined;
    const condensationLikely = (dewPointSpread !== undefined && dewPointSpread <= 2) || current.humidity >= 95;
    if (condensationLikely) {
      alerts.push(createAlert({
        id: 't_condensation_watch',
        title: 'Condiciones Favorables a Condensación',
        message: dewPointSpread !== undefined
          ? `Margen temperatura–punto de rocío de ${dewPointSpread.toFixed(1)}°C. Verifica físicamente equipos y superficies.`
          : `Humedad relativa muy alta (${current.humidity}%). Verifica físicamente equipos y superficies.`,
        severity: 'warning',
        category: 'humidity',
        timeLabel: 'Actual',
        actionLabel: 'Verificar terreno',
        recommendation: 'El clima no autoriza una maniobra: aplicar LOTO, procedimiento HSE, inspección física y criterios del fabricante.',
        priority: 86
      }));
    } else if (current.humidity >= 85) {
      alerts.push(createAlert({
        id: 't_humidity_high',
        title: 'Ambiente Muy Húmedo',
        message: `Humedad relativa de ${current.humidity}%. No confirma condensación por sí sola.`,
        severity: 'watch',
        category: 'humidity',
        timeLabel: 'Actual',
        actionLabel: 'Verificar terreno',
        recommendation: 'Inspeccionar físicamente antes de intervenir equipos sensibles y mantener los controles HSE habituales.',
        priority: 65
      }));
    }

    // 3. Viento Terreno / Ráfagas
    const isWindSevere = current.windSpeedKmh >= 35 || current.windGustKmh >= 45;
    const isWindModerate = current.windSpeedKmh >= 25 || current.windGustKmh >= 35;

    if (isWindSevere) {
      alerts.push(createAlert({
        id: 't_wind_severe',
        title: 'Viento Crítico en Faena',
        message: 'Precaución por viento y ráfagas. Evalúa trabajos en altura, manipulación de elementos livianos y equipos expuestos.',
        severity: 'warning',
        category: 'gusts',
        timeLabel: 'Operativo',
        actionLabel: 'Protocolo Altura',
        recommendation: 'Aplicar los límites de viento definidos para izaje, altura y equipos. Asegurar componentes ligeros y confirmar ráfagas reales en terreno.',
        priority: 90
      }));
    } else if (isWindModerate) {
      alerts.push(createAlert({
        id: 't_wind_moderate',
        title: 'Viento Moderado Terreno',
        message: 'Ráfagas de viento de hasta ' + current.windGustKmh + ' km/h. Monitorea elementos suspendidos.',
        severity: 'watch',
        category: 'wind',
        timeLabel: 'Hoy',
        recommendation: 'Asegurar andamios y evitar traslado manual de planchas de gran superficie.',
        priority: 70
      }));
    }

    // 4. Precipitación operativa: diferenciar llovizna, lluvia, chubascos y severidad.
    const next6HoursRainTech = hourly.slice(0, 6);
    const rainHourTech = next6HoursRainTech.find(h => h.precipitationProbability >= 60);
    const precipPhenomenaTech = ['drizzle', 'freezing_drizzle', 'rain', 'freezing_rain', 'showers', 'snow', 'snow_showers', 'thunderstorm', 'thunderstorm_hail'];
    const currentPrecipTech = current.precipitationMm > 0 || Boolean(current.phenomenon && precipPhenomenaTech.includes(current.phenomenon));

    if (currentPrecipTech) {
      const rank = precipitationIntensityRank(current.precipitationIntensity);
      const isDrizzle = current.phenomenon === 'drizzle';
      const severity: SmartAlertSeverity = isDrizzle ? 'watch' : rank >= 3 ? 'warning' : 'watch';
      alerts.push(createAlert({
        id: 't_precip_active',
        title: current.conditionLabel ? `${current.conditionLabel} en Faena` : 'Precipitación en Faena',
        message: `${current.conditionLabel || 'Precipitación'} detectada. La criticidad operativa depende de la tarea, superficie, IP del equipo y procedimiento HSE.`,
        severity,
        category: 'rain',
        timeLabel: 'En curso',
        recommendation: 'Reevaluar tareas expuestas y aplicar el procedimiento específico. ORBI no reemplaza la inspección física ni la autorización de trabajo.',
        priority: isDrizzle ? 68 : rank >= 3 ? 90 : 78
      }));
    } else if (rainHourTech) {
      alerts.push(createAlert({
        id: 't_rain_upcoming',
        title: 'Precipitación Operativa Probable',
        message: `Probabilidad ${rainHourTech.precipitationProbability}% cerca de ${rainHourTech.time}${rainHourTech.conditionLabel ? ` (${rainHourTech.conditionLabel.toLowerCase()})` : ''}.`,
        severity: rainHourTech.precipitationProbability >= 80 ? 'watch' : 'info',
        category: 'rain',
        startsAt: rainHourTech.isoTime || rainHourTech.time,
        timeLabel: 'Próximo',
        recommendation: 'Revisar la ventana operativa, proteger equipos sensibles y revalidar el pronóstico antes de iniciar tareas expuestas.',
        priority: 72
      }));
    }

    // 5. UV Alto en Faena
    const maxUVTech = Math.max(current.uvIndex, ...hourly.slice(0, 8).map(h => h.uvIndex));
    if (maxUVTech >= 6) {
      alerts.push(createAlert({
        id: 't_uv_faena',
        title: 'Radiación UV Crítica en Faena',
        message: 'UV alto durante la jornada. Planifica pausas de sombra, hidratación constante y protección para tareas expuestas.',
        severity: 'warning',
        category: 'uv',
        timeLabel: 'Jornada',
        actionLabel: 'EPP UV',
        recommendation: 'Uso obligatorio de casco con cubre nuca (legionario), mangas protectoras, bloqueador FPS 50+ y antiparras oscuras certificadas.',
        priority: 80
      }));
    }

    // 6. Ventana técnica favorable
    if (advancedAnalysis.bestWindow && (advancedAnalysis.globalDecision === 'optimal' || advancedAnalysis.globalDecision === 'favorable')) {
      const windowStr = `${advancedAnalysis.bestWindow.startTime}–${advancedAnalysis.bestWindow.endTime}`;
      alerts.push(createAlert({
        id: 't_best_window_info',
        title: 'Ventana Operativa Recomendada',
        message: `Mejor ventana técnica: ${windowStr}. Menor humedad, viento controlado y baja probabilidad de lluvia.`,
        severity: 'info',
        category: 'general',
        timeLabel: 'Establecido',
        recommendation: 'Usar esta ventana sólo como contexto meteorológico; confirmar permisos, LOTO, condiciones físicas y criterios HSE antes de cualquier maniobra.',
        priority: 65
      }));
    }

    // ----------------------------------------------------
    // REGLAS FV (FOTOVOLTAICA) DENTRO DE TÉCNICO TERRENO
    // ----------------------------------------------------

    // A. Nubosidad alta
    const avgCloudCover = current.cloudCover;
    if (avgCloudCover >= 70) {
      alerts.push(createAlert({
        id: 't_fv_clouds',
        title: 'FV: Pérdida por Nubosidad',
        message: 'Nubosidad alta puede reducir la generación fotovoltaica estimada durante la tarde.',
        severity: 'watch',
        category: 'solar_pv',
        timeLabel: 'Fotovoltaico',
        recommendation: 'Monitorear curvas de inversores en SCADA. Se prevén descensos puntuales de potencia activa por sombreado temporal de nubes. ' + 
                         'Nota: Estimación climática orientativa. No reemplaza medición SCADA ni modelos calibrados de producción.',
        priority: 45
      }));
    }

    // B. Lluvia útil (limpieza superficial)
    const isRainModerate = current.precipitationMm > 0
      && current.condition !== 'storm'
      && precipitationIntensityRank(current.precipitationIntensity) <= 3;
    const isRainUpcomingModerate = hourly.slice(0, 6).some(h => h.precipitationMm > 0
      && h.condition !== 'storm'
      && precipitationIntensityRank(h.precipitationIntensity) <= 3);
    
    if (isRainModerate || isRainUpcomingModerate) {
      alerts.push(createAlert({
        id: 't_fv_rain_clean',
        title: 'FV: Limpieza Natural de Módulos',
        message: 'Lluvia prevista podría apoyar la limpieza natural superficial de paneles, sin reemplazar inspección técnica.',
        severity: 'info',
        category: 'solar_pv',
        timeLabel: 'Limpieza',
        recommendation: 'Inspeccionar nivel de polvo acumulado (soiling) tras el evento lluvioso para verificar la remoción de suciedad adherida. ' +
                         'Nota: Estimación climática orientativa. No reemplaza medición SCADA ni modelos calibrados de producción.',
        priority: 40
      }));
    }

    // C. Calor y eficiencia de celdas
    if (current.temperatureC >= 28) {
      alerts.push(createAlert({
        id: 't_fv_heat_efficiency',
        title: 'FV: Pérdida por Coeficiente Térmico',
        message: 'Temperatura alta puede afectar la eficiencia de conversión de los módulos de silicio.',
        severity: 'watch',
        category: 'solar_pv',
        timeLabel: 'Módulos',
        recommendation: 'Monitorear la temperatura de celda. Temperaturas elevadas reducen la tensión de circuito abierto y merman el rendimiento de producción. ' +
                         'Nota: Estimación climática orientativa. No reemplaza medición SCADA ni modelos calibrados de producción.',
        priority: 42
      }));
    }
  }

  // Deduplicar, filtrar y ordenar
  return dedupeSmartAlerts(alerts);
}

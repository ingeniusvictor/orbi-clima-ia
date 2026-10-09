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
    // 1. Lluvia próxima o actual
    const next6HoursRain = hourly.slice(0, 6);
    const rainHour = next6HoursRain.find(h => h.precipitationProbability >= 60);
    const hasCurrentRain = current.precipitationMm > 0 || current.condition === 'rain';
    
    if (hasCurrentRain) {
      alerts.push(createAlert({
        id: 'p_rain_now',
        title: 'Lluvia Activa',
        message: 'Precipitación en curso. Lleva paraguas o prefiere actividades en interiores.',
        severity: 'warning',
        category: 'rain',
        timeLabel: 'Ahora',
        actionLabel: 'Ver radar',
        recommendation: 'Lleva paraguas, prefiere calzado impermeable y maneja con precaución.',
        priority: 95
      }));
    } else if (rainHour) {
      alerts.push(createAlert({
        id: 'p_rain_upcoming',
        title: 'Lluvia Probable',
        message: `Lluvia probable durante las próximas horas (${rainHour.time}). Lleva paraguas o planifica salir antes.`,
        severity: 'watch',
        category: 'rain',
        startsAt: rainHour.time,
        timeLabel: 'Próximas horas',
        actionLabel: 'Ver pronóstico',
        recommendation: 'Lleva paraguas o impermeable y planifica tus traslados con anticipación.',
        priority: 80
      }));
    }

    // 2. UV Alto
    const maxUV = Math.max(current.uvIndex, ...hourly.slice(0, 8).map(h => h.uvIndex));
    if (maxUV >= 6) {
      alerts.push(createAlert({
        id: 'p_uv_high',
        title: 'Radiación UV Extrema',
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
        actionLabel: 'Rebajar capas',
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
        recommendation: 'Detener de inmediato trabajos en altura y maniobras eléctricas en intemperie. Evacuar a zonas seguras.',
        priority: 100
      }));
    }

    // 2. Humedad Crítica (Condensación)
    if (current.humidity >= 85) {
      alerts.push(createAlert({
        id: 't_humidity_high',
        title: 'Riesgo Humedad de Condensación',
        message: 'Humedad alta detectada. Para trabajos eléctricos, valida presencia de condensación antes de abrir tableros.',
        severity: 'warning',
        category: 'humidity',
        timeLabel: 'Mañana/Actual',
        actionLabel: 'Verificar tablero',
        recommendation: 'Validar exhaustivamente condensación en gabinetes, herramientas y superficies metálicas antes de operar.',
        priority: 85
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
        recommendation: 'Suspender trabajos de izaje o en altura física. Asegurar planchas de zinc, lonas y componentes ligeros.',
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

    // 4. Lluvia Operativa
    const next6HoursRainTech = hourly.slice(0, 6);
    const rainHourTech = next6HoursRainTech.find(h => h.precipitationProbability >= 60);

    if (current.precipitationMm > 0) {
      alerts.push(createAlert({
        id: 't_rain_active',
        title: 'Lluvia Operativa Activa',
        message: 'Precipitación afectando la zona de faena. Evita mantener gabinetes o componentes desprotegidos al exterior.',
        severity: 'warning',
        category: 'rain',
        timeLabel: 'En curso',
        recommendation: 'Asegurar sellos de estanqueidad IP y detener montajes expuestos que requieran condiciones secas.',
        priority: 88
      }));
    } else if (rainHourTech) {
      alerts.push(createAlert({
        id: 't_rain_upcoming',
        title: 'Precipitación Operativa Inminente',
        message: `Probabilidad de lluvia en la ventana operativa (${rainHourTech.time}). Prioriza trabajos exteriores antes del evento.`,
        severity: 'watch',
        category: 'rain',
        startsAt: rainHourTech.time,
        timeLabel: 'Próximo',
        recommendation: 'Acelerar sellado de ductos exteriores y reprogramar pintura o vaciado de hormigón si aplica.',
        priority: 78
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
        recommendation: 'Priorizar maniobras de calibración, montajes de precisión o aperturas de tableros durante este intervalo.',
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
    const isRainModerate = current.precipitationMm > 0 && current.precipitationMm < 8 && current.condition !== 'storm';
    const isRainUpcomingModerate = hourly.slice(0, 6).some(h => h.precipitationMm > 0 && h.precipitationMm < 8 && h.condition !== 'storm');
    
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

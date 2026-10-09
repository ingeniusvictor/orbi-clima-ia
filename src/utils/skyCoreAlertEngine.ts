import {
  CurrentWeather,
  HourlyForecast,
  DailyForecast,
  WeatherProfile,
  AdvancedSkyCoreAnalysis,
  SmartWeatherAlert,
  SmartAlertSeverity,
  SmartAlertCategory,
} from '../types/weatherTypes';
import { dedupeSmartAlerts } from './skyCoreAlertDedup';

type WeatherSemantics = {
  conditionLabel?: string;
  precipitationKind?: 'none' | 'drizzle' | 'freezing_drizzle' | 'rain' | 'freezing_rain' | 'showers' | 'snow' | 'storm' | 'unknown';
  precipitationIntensity?: 'none' | 'trace' | 'light' | 'moderate' | 'heavy' | 'violent';
};

export function buildSmartWeatherAlerts(params: {
  current: CurrentWeather;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  profile: WeatherProfile;
  advancedAnalysis: AdvancedSkyCoreAnalysis;
}): SmartWeatherAlert[] {
  const { current, hourly, profile } = params;
  const alerts: SmartWeatherAlert[] = [];
  const nowStr = new Date().toISOString();
  const semantics = current as CurrentWeather & WeatherSemantics;
  const precipKind = semantics.precipitationKind ?? (current.condition === 'rain' ? 'rain' : 'none');
  const precipIntensity = semantics.precipitationIntensity ?? (current.precipitationMm > 0 ? 'light' : 'none');
  const conditionLabel = semantics.conditionLabel || (current.condition === 'rain' ? 'Lluvia' : 'Precipitación');

  const createAlert = (args: {
    id: string;
    title: string;
    message: string;
    severity: SmartAlertSeverity;
    category: SmartAlertCategory;
    timeLabel: string;
    actionLabel?: string;
    recommendation: string;
    priority: number;
  }): SmartWeatherAlert => ({
    id: args.id,
    title: args.title,
    message: args.message,
    severity: args.severity,
    category: args.category,
    profile,
    status: 'active',
    timeLabel: args.timeLabel,
    actionLabel: args.actionLabel,
    recommendation: args.recommendation,
    source: 'skycore',
    createdAt: nowStr,
    priority: args.priority,
    relatedRiskLevel: args.severity === 'critical'
      ? 'critical'
      : args.severity === 'warning'
        ? 'high'
        : args.severity === 'watch'
          ? 'medium'
          : 'low',
  });

  const activePrecipitation = current.precipitationMm > 0;
  const next6 = hourly.slice(0, 6);
  const maxRainProbability = next6.length
    ? Math.max(0, ...next6.map(h => h.precipitationProbability || 0))
    : 0;
  const likelyRainHour = next6.find(h => h.precipitationProbability >= 70);

  // Storm is the only precipitation state promoted directly to critical.
  if (current.condition === 'storm' || precipKind === 'storm') {
    alerts.push(createAlert({
      id: profile === 'field_tech' ? 't_storm_critical' : 'p_storm_critical',
      title: 'Tormenta Activa',
      message: 'Se detecta condición de tormenta. Verifica alertas oficiales y limita exposición en exteriores.',
      severity: 'critical',
      category: 'storm',
      timeLabel: 'Ahora',
      actionLabel: 'Revisar seguridad',
      recommendation: profile === 'field_tech'
        ? 'Aplicar el protocolo HSE de tormenta y suspender trabajos expuestos cuando corresponda.'
        : 'Busca refugio seguro y sigue instrucciones de las autoridades si existe una alerta vigente.',
      priority: 100,
    }));
  } else if (activePrecipitation && (precipKind === 'drizzle' || precipKind === 'freezing_drizzle')) {
    const freezing = precipKind === 'freezing_drizzle';
    alerts.push(createAlert({
      id: freezing ? 'freezing_drizzle_now' : 'drizzle_now',
      title: conditionLabel,
      message: `${conditionLabel} en curso (${current.precipitationMm} mm/h).`,
      severity: freezing ? 'warning' : profile === 'field_tech' ? 'watch' : 'info',
      category: 'rain',
      timeLabel: 'Ahora',
      actionLabel: 'Ver pronóstico',
      recommendation: freezing
        ? 'Extrema precauciones por posible hielo en superficies.'
        : profile === 'field_tech'
          ? 'Verifica superficies húmedas y protege equipos sensibles al agua.'
          : 'Un impermeable ligero puede ser suficiente si vas a salir.',
      priority: freezing ? 95 : profile === 'field_tech' ? 65 : 35,
    }));
  } else if (activePrecipitation && (precipKind === 'rain' || precipKind === 'showers' || precipKind === 'freezing_rain' || current.condition === 'rain')) {
    const severe = precipIntensity === 'heavy' || precipIntensity === 'violent' || precipKind === 'freezing_rain';
    const moderate = precipIntensity === 'moderate' || current.precipitationMm >= 2;
    alerts.push(createAlert({
      id: profile === 'field_tech' ? 't_rain_active' : 'p_rain_active',
      title: conditionLabel,
      message: `${conditionLabel} en curso (${current.precipitationMm} mm/h).`,
      severity: severe || moderate ? 'warning' : 'watch',
      category: 'rain',
      timeLabel: 'Ahora',
      actionLabel: 'Ver pronóstico',
      recommendation: profile === 'field_tech'
        ? 'Reevalúa tareas exteriores y maniobras expuestas conforme al procedimiento HSE.'
        : 'Lleva protección impermeable y conduce con precaución sobre pavimento mojado.',
      priority: severe ? 92 : moderate ? 82 : 65,
    }));
  } else if (likelyRainHour && maxRainProbability >= 70) {
    alerts.push(createAlert({
      id: profile === 'field_tech' ? 't_rain_upcoming' : 'p_rain_upcoming',
      title: 'Precipitación Probable',
      message: `Probabilidad máxima de ${maxRainProbability}% en las próximas 6 horas.`,
      severity: 'watch',
      category: 'rain',
      timeLabel: 'Próximas horas',
      actionLabel: 'Ver pronóstico',
      recommendation: profile === 'field_tech'
        ? 'Planifica las tareas sensibles al agua considerando una posible interrupción.'
        : 'Lleva paraguas o impermeable si vas a estar fuera varias horas.',
      priority: 60,
    }));
  }

  // UV.
  const maxUV = Math.max(current.uvIndex, ...hourly.slice(0, 8).map(h => h.uvIndex || 0));
  if (maxUV >= 11) {
    alerts.push(createAlert({
      id: 'uv_extreme',
      title: 'Radiación UV Extrema',
      message: `Índice UV previsto/actual de hasta ${maxUV}.`,
      severity: 'warning',
      category: 'uv',
      timeLabel: 'Hoy',
      actionLabel: 'Protección UV',
      recommendation: 'Reduce exposición directa, busca sombra y usa protección solar completa.',
      priority: 88,
    }));
  } else if (maxUV >= 8) {
    alerts.push(createAlert({
      id: 'uv_very_high',
      title: 'Radiación UV Muy Alta',
      message: `Índice UV previsto/actual de hasta ${maxUV}.`,
      severity: 'watch',
      category: 'uv',
      timeLabel: 'Hoy',
      actionLabel: 'Protección UV',
      recommendation: 'Usa protector solar, lentes, sombrero y busca sombra durante exposiciones prolongadas.',
      priority: 70,
    }));
  }

  // Temperature.
  if (current.temperatureC < 0) {
    alerts.push(createAlert({
      id: 'temperature_below_zero',
      title: 'Temperatura Bajo Cero',
      message: `Temperatura actual de ${current.temperatureC}°C.`,
      severity: 'warning',
      category: 'cold',
      timeLabel: 'Ahora',
      recommendation: 'Abrígate por capas y considera riesgo de hielo en superficies expuestas.',
      priority: 86,
    }));
  } else if (current.temperatureC < 5) {
    alerts.push(createAlert({
      id: 'temperature_very_cold',
      title: 'Temperatura Muy Baja',
      message: `Temperatura actual de ${current.temperatureC}°C.`,
      severity: 'watch',
      category: 'cold',
      timeLabel: 'Ahora',
      recommendation: 'Usa abrigo adecuado y considera el efecto adicional del viento y la humedad.',
      priority: 55,
    }));
  }

  if (current.temperatureC >= 35) {
    alerts.push(createAlert({
      id: 'temperature_extreme_heat',
      title: 'Calor Extremo',
      message: `Temperatura actual de ${current.temperatureC}°C.`,
      severity: 'warning',
      category: 'heat',
      timeLabel: 'Ahora',
      recommendation: 'Reduce esfuerzo físico, mantén hidratación frecuente y busca ambientes frescos.',
      priority: 86,
    }));
  } else if (current.temperatureC >= 30) {
    alerts.push(createAlert({
      id: 'temperature_high_heat',
      title: 'Calor Elevado',
      message: `Temperatura actual de ${current.temperatureC}°C.`,
      severity: 'watch',
      category: 'heat',
      timeLabel: 'Ahora',
      recommendation: 'Mantén hidratación y evita sobreesfuerzo durante las horas más cálidas.',
      priority: 55,
    }));
  }

  // Wind.
  if (current.windSpeedKmh > 40 || current.windGustKmh > 55) {
    alerts.push(createAlert({
      id: 'wind_high',
      title: 'Viento Fuerte',
      message: `Viento ${current.windSpeedKmh} km/h; ráfagas hasta ${current.windGustKmh} km/h.`,
      severity: 'warning',
      category: current.windGustKmh > 55 ? 'gusts' : 'wind',
      timeLabel: 'Ahora',
      recommendation: profile === 'field_tech'
        ? 'Evalúa límites operacionales HSE antes de trabajos en altura o manipulación de elementos expuestos.'
        : 'Asegura objetos sueltos y evita zonas expuestas si las ráfagas aumentan.',
      priority: 80,
    }));
  } else if (current.windSpeedKmh >= 25 || current.windGustKmh >= 40) {
    alerts.push(createAlert({
      id: 'wind_moderate',
      title: 'Viento Moderado',
      message: `Viento ${current.windSpeedKmh} km/h; ráfagas hasta ${current.windGustKmh} km/h.`,
      severity: 'watch',
      category: 'wind',
      timeLabel: 'Ahora',
      recommendation: 'Monitorea la evolución de las ráfagas si realizarás actividades sensibles al viento.',
      priority: 50,
    }));
  }

  // Humidity is context, not proof of condensation.
  if (profile === 'field_tech' && current.humidity >= 90) {
    alerts.push(createAlert({
      id: 'humidity_high_tech',
      title: 'Humedad Muy Alta',
      message: `Humedad relativa actual de ${current.humidity}%.`,
      severity: 'watch',
      category: 'humidity',
      timeLabel: 'Ahora',
      recommendation: 'Comprueba físicamente condensación antes de abrir equipos o gabinetes eléctricos.',
      priority: 58,
    }));
  }

  return dedupeSmartAlerts(alerts);
}

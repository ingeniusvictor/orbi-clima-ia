import { CurrentWeather, HourlyForecast, DailyForecast, WeatherProfile, SkyCoreRiskScore, SkyCoreRiskCategory, RiskLevel } from '../types/weatherTypes';
import { SKYCORE_THRESHOLDS } from './skyCoreThresholds';
import { scoreToRiskLevel } from './skyCoreRiskLabels';

export function calculateSkyCoreRiskScores(params: {
  current: CurrentWeather;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  profile: WeatherProfile;
}): SkyCoreRiskScore[] {
  const { current, hourly, daily, profile } = params;
  const t = SKYCORE_THRESHOLDS;
  const scores: SkyCoreRiskScore[] = [];

  // Helper to add a score
  const addScore = (
    category: SkyCoreRiskCategory,
    score: number,
    label: string,
    reason: string,
    recommendation: string,
    affectedProfile: WeatherProfile,
    priority: number
  ) => {
    scores.push({
      category,
      score,
      level: scoreToRiskLevel(score),
      label,
      reason,
      recommendation,
      affectedProfile,
      priority,
    });
  };

  // --- 1. TEMPERATURE (COLD & HEAT) ---
  const temp = current.temperatureC;
  let coldScore = 10;
  let coldLabel = 'Frío Calmo';
  let coldReason = 'Temperatura confortable.';
  let coldRec = 'Vestimenta cómoda de temporada.';

  if (temp <= t.temperatureC.veryCold) {
    coldScore = 85;
    coldLabel = 'Frío Extremo';
    coldReason = `Temperatura muy baja registrada (${temp}°C).`;
    coldRec = profile === 'field_tech'
      ? 'Ropa térmica multicapa obligatoria. Realizar pausas activas para mantener temperatura corporal.'
      : 'Usa ropa térmica gruesa y evita salir si no es estrictamente necesario.';
  } else if (temp <= t.temperatureC.cold) {
    coldScore = 55;
    coldLabel = 'Frío Intenso';
    coldReason = `Baja temperatura ambiental (${temp}°C) típica de primeras horas o invierno.`;
    coldRec = profile === 'field_tech'
      ? 'Usa chaqueta térmica de alta visibilidad, guantes y protección contra el viento frío.'
      : 'Abrígate bien con chaqueta, bufanda y guantes si sales temprano.';
  } else if (temp <= 14) {
    coldScore = 30;
    coldLabel = 'Ambiente Fresco';
    coldReason = `Temperatura fresca de mañana (${temp}°C).`;
    coldRec = 'Llevar una chaqueta ligera o sweater para las primeras horas.';
  }

  let heatScore = 10;
  let heatLabel = 'Templado';
  let heatReason = 'Sin estrés por calor.';
  let heatRec = 'Hidratación estándar.';

  if (temp >= t.temperatureC.extremeHeat) {
    heatScore = 90;
    heatLabel = 'Calor Extremo';
    heatReason = `Temperatura crítica detectada (${temp}°C). Peligro de insolación rápida.`;
    heatRec = profile === 'field_tech'
      ? 'Suspender tareas físicas pesadas al sol directo, hidratación obligatoria cada 20 min y pausas en sombra.'
      : 'Evita exponerte al sol, mantente hidratado constantemente con agua fría y permanece bajo techo fresco.';
  } else if (temp >= t.temperatureC.heat) {
    heatScore = 65;
    heatLabel = 'Calor Elevado';
    heatReason = `Ambiente muy caluroso (${temp}°C).`;
    heatRec = profile === 'field_tech'
      ? 'Indispensable contar con hidratación constante, pausas de descanso programadas y bloqueador FPS 50+.'
      : 'Toma abundante agua, busca lugares con sombra y prefiere ropa ligera de colores claros.';
  } else if (temp >= 24) {
    heatScore = 30;
    heatLabel = 'Cálido Agradable';
    heatReason = `Tarde templada a cálida (${temp}°C).`;
    heatRec = 'Mantener hidratación básica regular.';
  }

  // Add cold and heat separately, and general temperature
  addScore('cold', coldScore, coldLabel, coldReason, coldRec, profile, 4);
  addScore('heat', heatScore, heatLabel, heatReason, heatRec, profile, 4);
  addScore(
    'temperature',
    Math.max(coldScore, heatScore),
    coldScore > heatScore ? coldLabel : heatLabel,
    coldScore > heatScore ? coldReason : heatReason,
    coldScore > heatScore ? coldRec : heatRec,
    profile,
    5
  );

  // --- 2. HUMIDITY ---
  const hum = current.humidity;
  if (profile === 'field_tech') {
    if (hum >= t.humidity.electricalHigh) {
      addScore(
        'humidity',
        85,
        'Humedad Crítica',
        `Humedad relativa extremadamente elevada (${hum}%). Condensación de rocío inminente.`,
        'Evitar estrictamente la apertura de tableros eléctricos y ductos expuestos sin carpa o protección estanca.',
        'field_tech',
        8
      );
    } else if (hum >= t.humidity.electricalCaution) {
      addScore(
        'humidity',
        60,
        'Humedad Elevada',
        `Humedad relativa alta (${hum}%) que podría causar humedad en superficies frías.`,
        'Validar minuciosamente si hay presencia de condensación en tableros y usar guantes dieléctricos según protocolo.',
        'field_tech',
        6
      );
    } else {
      addScore(
        'humidity',
        15,
        'Humedad Confortable',
        `Humedad óptima para maniobras (${hum}%).`,
        'Proceder con mantenimientos estándar respetando protecciones de ingreso de agua.',
        'field_tech',
        2
      );
    }
  } else {
    if (hum >= t.humidity.personNotice) {
      addScore(
        'humidity',
        40,
        'Ambiente Muy Húmedo',
        `La alta humedad (${hum}%) acentúa la sensación térmica fría o bochornosa.`,
        'Prefiere abrigarte en capas ya que el frío se sentirá más penetrante hoy.',
        'person',
        3
      );
    } else {
      addScore(
        'humidity',
        10,
        'Humedad Óptima',
        `Porcentaje de humedad cómodo (${hum}%).`,
        'Sin precauciones de humedad requeridas.',
        'person',
        1
      );
    }
  }

  // --- 3. WIND & GUSTS ---
  const wind = current.windSpeedKmh;
  const gust = current.windGustKmh;

  if (profile === 'field_tech') {
    // Wind
    if (wind >= t.windKmh.fieldCritical) {
      addScore('wind', 90, 'Viento Crítico', `Viento sostenido peligroso de ${wind} km/h.`, 'PROHIBIDO realizar trabajos en altura física, andamios o izajes.', 'field_tech', 9);
    } else if (wind >= t.windKmh.fieldHigh) {
      addScore('wind', 65, 'Viento Fuerte', `Viento de velocidad elevada (${wind} km/h).`, 'Evitar manipulación de materiales planos expuestos y restringir trabajos en techumbres.', 'field_tech', 7);
    } else if (wind >= t.windKmh.fieldCaution) {
      addScore('wind', 45, 'Viento Moderado', `Brisa fuerte de ${wind} km/h en terreno.`, 'Asegurar láminas fotovoltaicas, cubiertas sueltas y utilizar arnés de seguridad con anclaje firme.', 'field_tech', 5);
    } else {
      addScore('wind', 15, 'Viento Operativo', `Brisa leve de ${wind} km/h.`, 'Operación normal de grúas e instalaciones en altura sin impedimentos climáticos.', 'field_tech', 1);
    }

    // Gusts
    if (gust >= t.gustKmh.critical) {
      addScore('gusts', 95, 'Ráfagas Peligrosas', `Ráfagas extremas detectadas (${gust} km/h). Impactos mecánicos probables.`, 'Suspender trabajos que impliquen manipulación de paneles o materiales ligeros.', 'field_tech', 9);
    } else if (gust >= t.gustKmh.high) {
      addScore('gusts', 70, 'Ráfagas Fuertes', `Ráfagas repentinas de hasta ${gust} km/h.`, 'Asegurar herramientas manuales y equipos livianos en el suelo para evitar voladuras.', 'field_tech', 7);
    } else if (gust >= t.gustKmh.caution) {
      addScore('gusts', 40, 'Ráfagas de Alerta', `Ráfagas intermitentes de ${gust} km/h.`, 'Mantener concentración en escaleras de mano y andamios por empujes de viento repentinos.', 'field_tech', 4);
    } else {
      addScore('gusts', 10, 'Ráfagas Leves', `Ráfagas mínimas de ${gust} km/h.`, 'Sin advertencia de ráfagas repentinas.', 'field_tech', 1);
    }
  } else {
    // Person Wind/Gusts
    if (wind >= t.windKmh.personNotice) {
      addScore('wind', 35, 'Brisa Fuerte', `Viento sostenido perceptible (${wind} km/h).`, 'Asegura cortavientos y ten precaución con puertas y objetos sueltos en balcones.', 'person', 3);
    } else {
      addScore('wind', 10, 'Viento Ligero', 'Viento agradable y suave.', 'Condición muy agradable para pasear.', 'person', 1);
    }

    if (gust >= t.gustKmh.caution) {
      addScore('gusts', 30, 'Ráfaga Ocasional', `Ráfagas de viento de hasta ${gust} km/h.`, 'Sujeta bien sombrillas o sombreros si estás al aire libre.', 'person', 2);
    } else {
      addScore('gusts', 10, 'Ráfagas Calmas', 'Sin ráfagas de importancia.', 'Sin viento racheado.', 'person', 1);
    }
  }

  // --- 4. UV INDEX ---
  const uv = current.uvIndex;
  if (uv >= t.uv.extreme) {
    addScore(
      'uv',
      95,
      'Radiación UV Extrema',
      `Índice UV crítico de ${uv}. Daño cutáneo en menos de 10 minutos.`,
      profile === 'field_tech'
        ? 'Establecer descansos obligatorios bajo sombra, rehidratación con electrolitos y uso estricto de gorro legionario con FPS 50.'
        : 'Evita exponerte al aire libre de 11:00 a 16:00. Usa protector solar FPS 50+ de amplio espectro, lentes con filtro UV y sombrero de ala ancha.',
      profile,
      8
    );
  } else if (uv >= t.uv.veryHigh) {
    addScore(
      'uv',
      75,
      'Radiación UV Muy Alta',
      `Índice UV muy alto (${uv}). Alta radiación eritemática.`,
      profile === 'field_tech'
        ? 'Programar las tareas físicas pesadas antes o después del bloque crítico de radiación.'
        : 'Indispensable usar bloqueador solar, lentes oscuros y buscar la sombra si realizas caminatas.',
      profile,
      7
    );
  } else if (uv >= t.uv.high) {
    addScore(
      'uv',
      55,
      'Radiación UV Alta',
      `Índice UV alto de ${uv}. Requiere cuidado activo.`,
      profile === 'field_tech'
        ? 'Obligatorio uso de mangas de protección solar y protector labial con filtro.'
        : 'Aplica bloqueador solar en cara, cuello y extremidades antes de salir a la calle.',
      profile,
      5
    );
  } else if (uv >= t.uv.moderate) {
    addScore(
      'uv',
      30,
      'Radiación UV Moderada',
      `Índice UV en nivel ${uv}. Radiación estándar.`,
      'Usar protector solar habitual en exposiciones de más de 30 minutos al sol.',
      profile,
      2
    );
  } else {
    addScore(
      'uv',
      10,
      'Radiación UV Mínima',
      `Índice UV bajo (${uv}). Muy bajo riesgo eritemático.`,
      'Protección estándar regular diaria.',
      profile,
      1
    );
  }

  // --- 5. RAIN & STORM ---
  // Look at upcoming hourly precipitation probability
  const upcomingRainProb = hourly.length > 0
    ? Math.max(...hourly.slice(0, 6).map(h => h.precipitationProbability))
    : 0;
  const currentRainMm = current.precipitationMm;

  let rainScore = 15;
  let rainLabel = 'Sin Precipitaciones';
  let rainReason = 'Sin reportes de lluvia inmediata.';
  let rainRec = 'Sin precauciones de lluvia.';

  if (currentRainMm >= t.precipitationMm.heavy) {
    rainScore = 90;
    rainLabel = 'Lluvia Torrencial Activa';
    rainReason = `Precipitación activa muy intensa de ${currentRainMm} mm/h.`;
    rainRec = profile === 'field_tech'
      ? 'Suspender todas las operaciones exteriores por anegamiento inminente y baja adherencia de terreno.'
      : 'Permanece bajo techo, evita cruzar calles inundadas y reduce traslados vehiculares.';
  } else if (currentRainMm >= t.precipitationMm.moderate) {
    rainScore = 70;
    rainLabel = 'Lluvia Moderada Activa';
    rainReason = `Precipitación regular de ${currentRainMm} mm/h activa.`;
    rainRec = profile === 'field_tech'
      ? 'Resguardar materiales sensibles, cables expuestos e instrumentos de precisión en contenedores estancos.'
      : 'Usa chaqueta impermeable con capucha o paraguas grueso. Conduce con precaución por pavimento resbaladizo.';
  } else if (currentRainMm >= t.precipitationMm.light) {
    rainScore = 45;
    rainLabel = 'Lluvia Débil Activa';
    rainReason = `Llovizna persistente de ${currentRainMm} mm/h activa.`;
    rainRec = profile === 'field_tech'
      ? 'Cuidado con superficies metálicas resbaladizas y escaleras exteriores. Usar calzado antideslizante.'
      : 'Lleva un paraguas ligero o parka con gorro para evitar humedecerte.';
  } else if (upcomingRainProb >= t.rainProbability.high) {
    rainScore = 60;
    rainLabel = 'Lluvia Altamente Probable';
    rainReason = `Pronóstico detecta un ${upcomingRainProb}% de probabilidad de lluvia en las próximas horas.`;
    rainRec = profile === 'field_tech'
      ? 'Priorizar las tareas de exterior ahora antes del inicio de la lluvia y asegurar materiales hidrófilos.'
      : 'Lleva paraguas hoy de manera preventiva al salir de casa.';
  } else if (upcomingRainProb >= t.rainProbability.caution) {
    rainScore = 40;
    rainLabel = 'Probabilidad de Chubascos';
    rainReason = `Existe un ${upcomingRainProb}% de probabilidad de chubascos ligeros próximamente.`;
    rainRec = profile === 'field_tech'
      ? 'Monitorear el radar o la dirección del viento y mantener herramientas resguardadas en bodegas.'
      : 'Tener a mano un cortaviento impermeable por si acaso.';
  }

  addScore('rain', rainScore, rainLabel, rainReason, rainRec, profile, 6);

  // Storm
  const isStormActive = current.condition === 'storm' || hourly.slice(0, 4).some(h => h.condition === 'storm');
  const stormScore = isStormActive ? (profile === 'field_tech' ? 95 : 85) : 10;
  const stormLabel = isStormActive ? 'Alerta de Tormenta Eléctrica' : 'Estable sin Tormentas';
  const stormReason = isStormActive ? 'Presencia de descargas de rayos y viento racheado severo.' : 'Sin indicios de actividad eléctrica o granizo.';
  const stormRec = isStormActive
    ? (profile === 'field_tech'
        ? 'DETENER de inmediato todo trabajo en altura, cercanía a metales o tableros expuestos. Desconectar inversores si aplica protocolo HSE.'
        : 'Permanece adentro de edificios de estructura sólida. Evita utilizar agua corriente o dispositivos conectados a la red eléctrica.')
    : 'Seguir protocolos normales de seguridad.';

  addScore('storm', stormScore, stormLabel, stormReason, stormRec, profile, 9);

  // --- 6. VISIBILITY ---
  // Look at cloud cover and condition
  let visScore = 15;
  let visLabel = 'Visibilidad Excelente';
  let visReason = 'Atmósfera limpia y buena luz natural.';
  let visRec = 'Iluminación natural ideal para tareas al aire libre.';

  if (current.cloudCover >= t.cloudCover.veryHigh) {
    visScore = 45;
    visLabel = 'Cielo Muy Cubierto';
    visReason = `Cielo nublado al ${current.cloudCover}%. Iluminación natural reducida.`;
    visRec = profile === 'field_tech'
      ? 'Utilizar focos de asistencia o linternas frontales para inspecciones en detalle.'
      : 'Bajo contraste visual para conducir. Encender luces del vehículo.';
  } else if (current.cloudCover >= t.cloudCover.high) {
    visScore = 30;
    visLabel = 'Cielo Parcial a Cubierto';
    visReason = `Iluminación difusa por nubosidad parcial del ${current.cloudCover}%.`;
    visRec = 'Condiciones visuales adecuadas para la mayoría de tareas.';
  }

  addScore('visibility', visScore, visLabel, visReason, visRec, profile, 2);

  // --- 7. SPECIALIZED OPERATIONAL RISKS (TECHNICAL ONLY) ---
  if (profile === 'field_tech') {
    // A. Electrical Work (Peligro de Arco / Intervención)
    // Severe risk if wet (rain active) or storm active, or humidity extremely high
    let elecScore = 15;
    let elecLabel = 'Trabajo Eléctrico Seguro';
    let elecReason = 'Atmósfera seca, sin precipitaciones ni riesgo de tormenta eléctrica.';
    let elecRec = 'Proceder con implementos EPP básicos de la clase técnica standard.';

    if (stormScore >= 75) {
      elecScore = 95;
      elecLabel = 'Trabajo Eléctrico Prohibido';
      elecReason = 'Tormenta eléctrica en curso o inminente en el perímetro.';
      elecRec = 'PROHIBIDO abrir tableros, transformadores o cablear inversores exteriores. Resguardo HSE inmediato.';
    } else if (rainScore >= 70) {
      elecScore = 90;
      elecLabel = 'Trabajo Eléctrico Crítico';
      elecReason = 'Lluvia moderada o fuerte activa. Agua líquida conductora presente.';
      elecRec = 'PROHIBIDA la apertura de gabinetes o celdas expuestas al exterior sin carpa protectora y autorización expresa.';
    } else if (hum >= t.humidity.electricalHigh) {
      elecScore = 75;
      elecLabel = 'Trabajo Eléctrico con Riesgo Alto';
      elecReason = `Humedad relativa extrema (${hum}%) que propicia la condensación en partes metálicas internas.`;
      elecRec = 'Validar con higrómetro, secar superficies con paño dieléctrico y mantener ventilación encendida antes de energizar.';
    } else if (hum >= t.humidity.electricalCaution || rainScore >= 40) {
      elecScore = 55;
      elecLabel = 'Trabajo Eléctrico con Precaución';
      elecReason = 'Humedad ambiental elevada o probabilidad alta de lloviznas cortas.';
      elecRec = 'Comprobar hermeticidad de sellos de goma del tablero y verificar ausencia de agua acumulada.';
    }
    addScore('electrical_work', elecScore, elecLabel, elecReason, elecRec, 'field_tech', 9);

    // B. Field Work (Trabajos Exteriores / Altura)
    let fieldScore = 15;
    let fieldLabel = 'Terreno Óptimo';
    let fieldReason = 'Clima templado, vientos bajos y sin lluvias.';
    let fieldRec = 'Excelente jornada para avanzar con el plan operativo semanal.';

    const localWindScore = wind >= t.windKmh.fieldCritical ? 90
      : wind >= t.windKmh.fieldHigh ? 65
      : wind >= t.windKmh.fieldCaution ? 45
      : 15;

    const localGustScore = gust >= t.gustKmh.critical ? 95
      : gust >= t.gustKmh.high ? 70
      : gust >= t.gustKmh.caution ? 40
      : 10;

    const maxDangerousRisk = Math.max(localWindScore, localGustScore, rainScore, coldScore, heatScore);
    if (maxDangerousRisk >= 85) {
      fieldScore = 85;
      fieldLabel = 'Terreno Crítico';
      fieldReason = 'Al menos una condición crítica (temperatura extrema, ráfagas, viento o lluvia) compromete la vida o salud.';
      fieldRec = 'Suspender de inmediato actividades a la intemperie. Derivar personal a bodegas de mantenimiento cerrado.';
    } else if (maxDangerousRisk >= 55) {
      fieldScore = 55;
      fieldLabel = 'Terreno Restringido';
      fieldReason = 'Condiciones ambientales rigurosas por viento, llovizna o calor.';
      fieldRec = 'Estructurar pausas frecuentes, asegurar anclajes triples de andamios y equipar capas impermeables/bloqueador.';
    } else if (maxDangerousRisk >= 35) {
      fieldScore = 35;
      fieldLabel = 'Terreno con Alertas';
      fieldReason = 'Presencia de frío matutino, brisas perceptibles o radiación solar activa.';
      fieldRec = 'Monitorear evolución climática y mantener equipo de abrigo a mano en camionetas.';
    }
    addScore('field_work', fieldScore, fieldLabel, fieldReason, fieldRec, 'field_tech', 8);

    // C. Inspection (Inspecciones visuales)
    let inspScore = 15;
    let inspLabel = 'Inspección Óptima';
    let inspReason = 'Cielo despejado o parcial que aporta luz constante sin reflejos distorsionadores.';
    let inspRec = 'Ideal para inspección de fisuras en soldaduras, grietas de módulos y revisión de pernos.';

    if (rainScore >= 70 || stormScore >= 70) {
      inspScore = 80;
      inspLabel = 'Inspección Suspendida';
      inspReason = 'Precipitación u oscuridad de tormenta imposibilita la detección de anomalías.';
      inspRec = 'Postergar la inspección ocular exterior para evitar accidentes por resbalones en pasarelas.';
    } else if (visScore >= 45) {
      inspScore = 40;
      inspLabel = 'Inspección de Dificultad Media';
      inspReason = 'Nubosidad alta reduce el contraste natural para ver daños de aisladores.';
      inspRec = 'Utilizar linterna de alta intensidad y lente polarizado para evitar encandilamiento difuso.';
    }
    addScore('inspection', inspScore, inspLabel, inspReason, inspRec, 'field_tech', 6);

    // D. Solar PV (Capa Fotovoltaica Básica)
    let solarScore = 15;
    let solarLabel = 'Rendimiento Solar Alto';
    let solarReason = 'Alta radiación incidente con baja nubosidad que permite excelente eficiencia.';
    let solarRec = 'Ventana ideal para contrastar generación máxima con el SCADA. *Estimación orientativa, no reemplaza SCADA.';

    if (current.cloudCover >= t.cloudCover.veryHigh) {
      solarScore = 65;
      solarLabel = 'Rendimiento Solar Muy Bajo';
      solarReason = `Nubosidad del ${current.cloudCover}% dispersa más del 70% de la luz directa de paneles.`;
      solarRec = 'Monitorear desvíos de generación FV en SCADA y comprobar estado de inversores por cargas parciales.';
    } else if (current.cloudCover >= t.cloudCover.high) {
      solarScore = 45;
      solarLabel = 'Rendimiento Solar Parcial';
      solarReason = `Nubes de paso rápido causan fluctuaciones constantes en inversores (ramping).`;
      solarRec = 'Cuidado con picos térmicos alternados. Mantener disipadores limpios. *Estimación orientativa.';
    } else if (temp >= t.temperatureC.heat) {
      // High temperatures reduce panel efficiency (around -0.4% per degree above 25°C)
      solarScore = 40;
      solarLabel = 'Pérdida por Eficiencia Térmica';
      solarReason = `Temperatura ambiente elevada (${temp}°C) eleva la celda a ~55°C disminuyendo rendimiento.`;
      solarRec = 'Verificar el correcto flujo de extractores de aire en casetas de inversores FV. *Estimación orientativa.';
    }
    addScore('solar_pv', solarScore, solarLabel, solarReason, solarRec, 'field_tech', 7);
  }

  return scores;
}

// Helper to rate gusts internally
function gustsScoreRating(gust: number): number {
  const t = SKYCORE_THRESHOLDS.gustKmh;
  if (gust >= t.critical) return 90;
  if (gust >= t.high) return 70;
  if (gust >= t.caution) return 40;
  return 10;
}

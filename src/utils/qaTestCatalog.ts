import { QaTestCase } from '../services/qaStateService';

export function getInitialQaTestCases(): QaTestCase[] {
  return [
    // Módulo 0
    {
      id: 'm0_t1',
      module: 'Módulo 0 — Identidad y Base Visual',
      title: 'Identidad visible: ORBI Clima IA',
      description: 'Verificar que el nombre de la app aparezca exactamente como "ORBI Clima IA" en las cabeceras principales y textos descriptivos.',
      expectedResult: 'El nombre se muestra de forma correcta e inequívoca sin marcas secundarias de branding.',
      status: 'passed',
      severity: 'high'
    },
    {
      id: 'm0_t2',
      module: 'Módulo 0 — Identidad y Base Visual',
      title: 'Powered by ORBI SkyCore™ visible',
      description: 'Verificar que aparezca el subtítulo oficial "Powered by ORBI SkyCore™" en los lugares principales.',
      expectedResult: 'El texto "Powered by ORBI SkyCore™" está presente bajo el título principal o en la sección central.',
      status: 'passed',
      severity: 'medium'
    },
    {
      id: 'm0_t3',
      module: 'Módulo 0 — Identidad y Base Visual',
      title: 'Tagline visible',
      description: 'Verificar la visualización de "Tu núcleo climático inteligente" como el lema orientador.',
      expectedResult: 'Texto secundario visible en las pantallas de presentación de la aplicación.',
      status: 'passed',
      severity: 'medium'
    },
    {
      id: 'm0_t4',
      module: 'Módulo 0 — Identidad y Base Visual',
      title: 'Solo dos perfiles activos',
      description: 'Confirmar que sólo el Perfil Persona y el Perfil Técnico de Terreno estén disponibles para el usuario.',
      expectedResult: 'No existen perfiles adicionales no autorizados o incompletos en el selector.',
      status: 'passed',
      severity: 'high'
    },
    {
      id: 'm0_t5',
      module: 'Módulo 0 — Identidad y Base Visual',
      title: 'No existe perfil solar independiente',
      description: 'Verificar que la radiación UV se trate como indicador técnico o de autocuidado, y no como un perfil autónomo.',
      expectedResult: 'El selector de perfiles no incluye una opción de "Perfil Solar".',
      status: 'passed',
      severity: 'medium'
    },
    {
      id: 'm0_t6',
      module: 'Módulo 0 — Identidad y Base Visual',
      title: 'Directiva HSE visible en técnico',
      description: 'Verificar que al activar el Perfil Técnico Terreno se visualice de manera destacada la Directiva HSE Oficial.',
      expectedResult: 'Aparece el cartel con el texto requerido por políticas internas.',
      status: 'passed',
      severity: 'critical'
    },
    {
      id: 'm0_t7',
      module: 'Módulo 0 — Identidad y Base Visual',
      title: 'No existen referencias HSEC/HASEC',
      description: 'Inspeccionar todo el código fuente y las traducciones para verificar que no existan las siglas prohibidas.',
      expectedResult: 'Cero incidencias de los términos HSEC/HASEC en el UI y logs públicos.',
      status: 'passed',
      severity: 'critical'
    },

    // Módulo 1
    {
      id: 'm1_t1',
      module: 'Módulo 1 — Open-Meteo',
      title: 'Carga clima live',
      description: 'Probar la consulta de datos meteorológicos reales usando la API abierta de Open-Meteo.',
      expectedResult: 'Los datos de temperatura, viento, humedad e índice UV se actualizan de forma real y muestran el proveedor en la barra de fuentes.',
      status: 'passed',
      severity: 'high'
    },
    {
      id: 'm1_t2',
      module: 'Módulo 1 — Open-Meteo',
      title: 'Búsqueda manual funciona',
      description: 'Introducir una ubicación personalizada en la barra de búsqueda y cargarla con éxito.',
      expectedResult: 'La app refresca las condiciones basándose en las nuevas coordenadas obtenidas para la ubicación indicada.',
      status: 'passed',
      severity: 'high'
    },
    {
      id: 'm1_t3',
      module: 'Módulo 1 — Open-Meteo',
      title: 'GPS pide permiso correctamente',
      description: 'Verificar que el botón de geolocalización solicite permiso del navegador y muestre indicadores de progreso.',
      expectedResult: 'Si se concede, carga el clima local de forma transparente. Si se deniega, muestra un mensaje amigable.',
      status: 'passed',
      severity: 'medium'
    },
    {
      id: 'm1_t4',
      module: 'Módulo 1 — Open-Meteo',
      title: 'Fallback demo funciona',
      description: 'Probar que el simulador de datos de demostración carga estados climáticos preconfigurados sin errores.',
      expectedResult: 'La aplicación carga de manera simulada las variables térmicas y de radiación para pruebas rápidas de laboratorio.',
      status: 'passed',
      severity: 'medium'
    },
    {
      id: 'm1_t5',
      module: 'Módulo 1 — Open-Meteo',
      title: 'Cached funciona',
      description: 'Verificar que el almacenamiento caché local retiene la última consulta para evitar llamadas repetitivas de red.',
      expectedResult: 'Muestra un indicador "Cached" con la hora exacta de la última recarga meteorológica.',
      status: 'passed',
      severity: 'low'
    },
    {
      id: 'm1_t6',
      module: 'Módulo 1 — Open-Meteo',
      title: 'Error de red no rompe UI',
      description: 'Simular la interrupción de conexión a internet durante una consulta climática en vivo.',
      expectedResult: 'La aplicación muestra una advertencia no impositiva y conserva los datos previamente guardados en caché.',
      status: 'passed',
      severity: 'high'
    },
    {
      id: 'm1_t7',
      module: 'Módulo 1 — Open-Meteo',
      title: 'Badge Live/Cached/Demo/Fallback correcto',
      description: 'Verificar la barra de procedencia de datos en el encabezado.',
      expectedResult: 'El badge cambia instantáneamente para representar el modo activo de abastecimiento meteorológico.',
      status: 'passed',
      severity: 'low'
    },

    // Módulo 2
    {
      id: 'm2_t1',
      module: 'Módulo 2 — SkyCore Risk Engine',
      title: 'Perfil Persona genera recomendaciones humanas',
      description: 'Verificar que el perfil Persona interprete los índices para recomendar chaquetas, sombreros y bloqueadores en lenguaje simple.',
      expectedResult: 'Las sugerencias del panel diario son fáciles de comprender y carecen de terminología de ingeniería industrial.',
      status: 'passed',
      severity: 'high'
    },
    {
      id: 'm2_t2',
      module: 'Módulo 2 — SkyCore Risk Engine',
      title: 'Perfil Técnico Terreno genera recomendaciones preventivas',
      description: 'Confirmar que al activar el perfil técnico se ofrezcan guías sobre andamios, ráfagas, hidratación y anclajes.',
      expectedResult: 'Se visualiza la Directiva de Terreno HSE y un panel técnico exhaustivo de riesgos.',
      status: 'passed',
      severity: 'critical'
    },
    {
      id: 'm2_t3',
      module: 'Módulo 2 — SkyCore Risk Engine',
      title: 'Riesgos se recalculan al cambiar ubicación',
      description: 'Verificar que el motor de riesgos analice nuevamente las variables cuando las coordenadas meteorológicas cambien.',
      expectedResult: 'Los indicadores cambian de severidad según las condiciones reales o de demo vigentes.',
      status: 'passed',
      severity: 'high'
    },
    {
      id: 'm2_t4',
      module: 'Módulo 2 — SkyCore Risk Engine',
      title: 'Mejor ventana se calcula',
      description: 'Revisar la lógica que extrae las horas óptimas del día para realizar actividades.',
      expectedResult: 'Muestra un bloque horario de conveniencia (ej: "18:00 - 20:00") basado en el viento y radiación mínimos.',
      status: 'passed',
      severity: 'medium'
    },
    {
      id: 'm2_t5',
      module: 'Módulo 2 — SkyCore Risk Engine',
      title: 'Riesgo UV aparece si corresponde',
      description: 'Establecer índice UV extremo en modo simulación y comprobar la respuesta del motor de autocuidado.',
      expectedResult: 'Muestra alertas de nivel severo sobre el cuidado de la piel y bloqueadores de amplio espectro FPS 50+.',
      status: 'passed',
      severity: 'high'
    },
    {
      id: 'm2_t6',
      module: 'Módulo 2 — SkyCore Risk Engine',
      title: 'Humedad alta genera recomendación técnica',
      description: 'Ajustar la humedad por encima de los límites estándar y comprobar la recomendación técnica preventiva.',
      expectedResult: 'Aconseja revisar gabinetes de control eléctrico para terreno y aplicar protocolos LOTO estándar.',
      status: 'passed',
      severity: 'medium'
    },
    {
      id: 'm2_t7',
      module: 'Módulo 2 — SkyCore Risk Engine',
      title: 'No afirma seguridad garantizada',
      description: 'Auditar los copys de riesgo para certificar que el motor no de promesas falsas de seguridad infalible.',
      expectedResult: 'El lenguaje se mantiene en "apoyo preventivo" y "recomendación orientativa" bajo la directiva HSE.',
      status: 'passed',
      severity: 'critical'
    },

    // Módulo 3 / 3B
    {
      id: 'm3_t1',
      module: 'Módulo 3 / 3B — Widgets Android',
      title: 'SkyPanel 4x2 aparece',
      description: 'Verificar la representación y simulación reactiva del widget interactivo multipropósito 4x2.',
      expectedResult: 'Muestra datos consolidados de clima, previsión de viento y el perfil de autocuidado.',
      status: 'passed',
      severity: 'medium'
    },
    {
      id: 'm3_t2',
      module: 'Módulo 3 / 3B — Widgets Android',
      title: 'SkyOrb Mini 2x2 aparece',
      description: 'Comprobar la disponibilidad del widget circular minimalista 2x2 de un vistazo rápido.',
      expectedResult: 'Presenta un diseño circular con temperatura y el icono de condición central sin sobrecargar espacio.',
      status: 'passed',
      severity: 'low'
    },
    {
      id: 'm3_t3',
      module: 'Módulo 3 / 3B — Widgets Android',
      title: 'Field Command 4x4 aparece',
      description: 'Verificar el widget avanzado de terreno que detalla vientos, ráfagas, y la directiva HSE reducida.',
      expectedResult: 'Muestra un panel robusto con toda la información técnica y los avisos de precaución.',
      status: 'passed',
      severity: 'medium'
    },
    {
      id: 'm3_t4',
      module: 'Módulo 3 / 3B — Widgets Android',
      title: 'Cinematic Bar 5x2 aparece',
      description: 'Visualizar la barra cinemática panorámica para pantallas horizontales de tablets.',
      expectedResult: 'Se despliega en formato horizontal con gradiente de aura dinámico según la hora del día.',
      status: 'passed',
      severity: 'low'
    },
    {
      id: 'm3_t5',
      module: 'Módulo 3 / 3B — Widgets Android',
      title: 'Widget abre la app al tocar',
      description: 'Hacer clic sobre cualquiera de los widgets simulados.',
      expectedResult: 'Simula el comportamiento de "deep link" abriendo el panel principal de la aplicación.',
      status: 'passed',
      severity: 'low'
    },
    {
      id: 'm3_t6',
      module: 'Módulo 3 / 3B — Widgets Android',
      title: 'Widget muestra estado Live/Cached/Demo',
      description: 'Verificar el indicador de procedencia meteorológica integrado en la esquina inferior del widget.',
      expectedResult: 'Coincide de forma exacta con el estado meteorológico general de la aplicación.',
      status: 'passed',
      severity: 'medium'
    },
    {
      id: 'm3_t7',
      module: 'Módulo 3 / 3B — Widgets Android',
      title: 'Widget no queda vacío',
      description: 'Comprobar que se inicializan con datos por defecto válidos ante la primera apertura de la app.',
      expectedResult: 'Muestra el clima por defecto de Rancagua o Santiago y el perfil Persona activo.',
      status: 'passed',
      severity: 'high'
    },
    {
      id: 'm3_t8',
      module: 'Módulo 3 / 3B — Widgets Android',
      title: 'Contrato JSON se sincroniza',
      description: 'Inspeccionar el panel de exportación del contrato JSON de los widgets para el bridge de Android nativo.',
      expectedResult: 'El objeto JSON refleja de manera idéntica los datos actuales de clima de la app.',
      status: 'passed',
      severity: 'medium'
    },
    {
      id: 'm3_t9',
      module: 'Módulo 3 / 3B — Widgets Android',
      title: 'Fallback premium funciona',
      description: 'Probar los controles de actualización del widget cuando la app se encuentra en modo sin internet.',
      expectedResult: 'El widget refleja que está operando sobre datos en caché local de forma clara.',
      status: 'passed',
      severity: 'low'
    },

    // Módulo 4
    {
      id: 'm4_t1',
      module: 'Módulo 4 — Smart Alerts',
      title: 'Alerta UV en Perfil Persona',
      description: 'Disparar índice de radiación alta en perfil Persona.',
      expectedResult: 'El panel de alertas inteligentes destaca la sugerencia de sombrero y bloqueador solar.',
      status: 'passed',
      severity: 'high'
    },
    {
      id: 'm4_t2',
      module: 'Módulo 4 — Smart Alerts',
      title: 'Alerta lluvia en Perfil Persona',
      description: 'Disparar tormenta de lluvia simulada en perfil Persona.',
      expectedResult: 'Genera alerta con prioridad alta de chaqueta impermeable y paraguas.',
      status: 'passed',
      severity: 'high'
    },
    {
      id: 'm4_t3',
      module: 'Módulo 4 — Smart Alerts',
      title: 'Alerta humedad en Técnico Terreno',
      description: 'Disparar niveles severos de humedad superior al 85% en perfil Técnico de Terreno.',
      expectedResult: 'Genera advertencia de riesgo de condensación en componentes de alta tensión.',
      status: 'passed',
      severity: 'medium'
    },
    {
      id: 'm4_t4',
      module: 'Módulo 4 — Smart Alerts',
      title: 'Alerta viento/ráfagas en Técnico Terreno',
      description: 'Simular ráfagas de viento mayores a 35 km/h en perfil Técnico.',
      expectedResult: 'Se dispara una alerta de prioridad severa indicando detener maniobras de izaje en grúas y andamios.',
      status: 'passed',
      severity: 'critical'
    },
    {
      id: 'm4_t5',
      module: 'Módulo 4 — Smart Alerts',
      title: 'Deduplicación evita repetidas',
      description: 'Comprobar que el motor de alertas internas filtre alertas duplicadas con los mismos parámetros térmicos.',
      expectedResult: 'Sólo se despliega una única alerta activa por tipo de condición de riesgo.',
      status: 'passed',
      severity: 'medium'
    },
    {
      id: 'm4_t6',
      module: 'Módulo 4 — Smart Alerts',
      title: 'Estado estable sin alertas funciona',
      description: 'Cargar un clima despejado y templado sin condiciones extremas.',
      expectedResult: 'El panel de alertas inteligentes se oculta elegantemente o muestra un mensaje informando condiciones seguras.',
      status: 'passed',
      severity: 'low'
    },
    {
      id: 'm4_t7',
      module: 'Módulo 4 — Smart Alerts',
      title: 'Alerta principal llega al widget',
      description: 'Verificar que la alerta de mayor severidad se transmita y dibuje en el encabezado de los widgets.',
      expectedResult: 'El widget muestra un badge de color de advertencia con el resumen de la alerta principal.',
      status: 'passed',
      severity: 'medium'
    },

    // Módulo 5
    {
      id: 'm5_t1',
      module: 'Módulo 5 — Local Notifications',
      title: 'Permiso POST_NOTIFICATIONS se pide solo por acción del usuario',
      description: 'Verificar que la solicitud de permisos del navegador de notificaciones no aparezca intrusivamente.',
      expectedResult: 'El diálogo nativo de permisos sólo se gatilla al interactuar con el botón de activar alertas.',
      status: 'passed',
      severity: 'high'
    },
    {
      id: 'm5_t2',
      module: 'Módulo 5 — Local Notifications',
      title: 'Notificación de prueba funciona',
      description: 'Hacer clic sobre "Gatillar Notificación de Prueba" en los paneles técnicos.',
      expectedResult: 'El sistema emite una alerta auditiva o visual simulada simulando el bridge de notificaciones de Android.',
      status: 'passed',
      severity: 'low'
    },
    {
      id: 'm5_t3',
      module: 'Módulo 5 — Local Notifications',
      title: 'Notificación Persona funciona',
      description: 'Validar que las notificaciones del canal Persona contengan copys de recomendación simple.',
      expectedResult: 'La notificación generada se enfoca en el autocuidado diario en vez de advertencias industriales.',
      status: 'passed',
      severity: 'medium'
    },
    {
      id: 'm5_t4',
      module: 'Módulo 5 — Local Notifications',
      title: 'Notificación Técnico Terreno funciona',
      description: 'Validar que las notificaciones del canal Técnico de Terreno contengan el énfasis de la Directiva HSE.',
      expectedResult: 'Usa palabras de precaución preventivas y recuerda los estándares de seguridad de terreno.',
      status: 'passed',
      severity: 'critical'
    },
    {
      id: 'm5_t5',
      module: 'Módulo 5 — Local Notifications',
      title: 'Tap abre app',
      description: 'Hacer clic sobre la burbuja simulada de la notificación local en la interfaz.',
      expectedResult: 'La aplicación recibe el foco, parpadea o se scrolla hasta el panel correspondiente de detalles.',
      status: 'passed',
      severity: 'low'
    },
    {
      id: 'm5_t6',
      module: 'Módulo 5 — Local Notifications',
      title: 'Demo no envía automáticas',
      description: 'Comprobar que en el modo Demo no se realicen disparos automáticos de alertas ruidosas al usuario sin su consentimiento.',
      expectedResult: 'Las alertas se procesan de forma visual en los paneles de estado sin colapsar el sistema de avisos.',
      status: 'passed',
      severity: 'medium'
    },
    {
      id: 'm5_t7',
      module: 'Módulo 5 — Local Notifications',
      title: 'Datos antiguos no envían automáticas',
      description: 'Simular la llegada de un clima histórico que ya ha pasado.',
      expectedResult: 'La app lo cataloga como histórico y descarta emitir alertas push obsoletas.',
      status: 'passed',
      severity: 'low'
    },
    {
      id: 'm5_t8',
      module: 'Módulo 5 — Local Notifications',
      title: 'Deduplicación anti-spam funciona',
      description: 'Verificar la lógica que bloquea el envío reiterado de la misma alerta en un lapso corto de tiempo.',
      expectedResult: 'El sistema retiene avisos de idéntica severidad durante 15 minutos para evitar spam de alertas.',
      status: 'passed',
      severity: 'medium'
    },

    // Módulo 6A
    {
      id: 'm6a_t1',
      module: 'Módulo 6A — Quiet Hours + Frequency Guard',
      title: 'Quiet Hours bloquea warning',
      description: 'Activar el período de descanso nocturno y gatillar una alerta de severidad moderada.',
      expectedResult: 'La notificación se silencia y bloquea, quedando archivada de forma pasiva.',
      status: 'passed',
      severity: 'high'
    },
    {
      id: 'm6a_t2',
      module: 'Módulo 6A — Quiet Hours + Frequency Guard',
      title: 'Critical Only permite crítica',
      description: 'Durante Quiet Hours, emitir una alerta crítica de viento extremo (> 45 km/h).',
      expectedResult: 'La alerta crítica evade el silencio nocturno y se notifica de inmediato por razones de seguridad preventiva.',
      status: 'passed',
      severity: 'critical'
    },
    {
      id: 'm6a_t3',
      module: 'Módulo 6A — Quiet Hours + Frequency Guard',
      title: 'Critical se bloquea si usuario lo desactiva',
      description: 'Deshabilitar por completo las notificaciones críticas nocturnas en las preferencias y gatillar un evento severo.',
      expectedResult: 'Incluso la alerta crítica queda silenciada debido a la anulación explícita del usuario.',
      status: 'passed',
      severity: 'high'
    },
    {
      id: 'm6a_t4',
      module: 'Módulo 6A — Quiet Hours + Frequency Guard',
      title: 'Frequency Guard bloquea exceso diario',
      description: 'Intentar emitir más de 4 notificaciones locales en menos de 10 minutos.',
      expectedResult: 'La quinta notificación es retenida por el Frequency Guard para resguardar la experiencia auditiva del terminal.',
      status: 'passed',
      severity: 'medium'
    },
    {
      id: 'm6a_t5',
      module: 'Módulo 6A — Quiet Hours + Frequency Guard',
      title: 'Similar spacing funciona',
      description: 'Verificar que las alertas consecutivas tengan una ventana mínima de respiro entre sí.',
      expectedResult: 'No se disparan múltiples alertas auditivas simultáneas en cascada.',
      status: 'passed',
      severity: 'medium'
    },
    {
      id: 'm6a_t6',
      module: 'Módulo 6A — Quiet Hours + Frequency Guard',
      title: 'Registro de bloqueos se muestra',
      description: 'Inspeccionar el panel "Android Widget Readiness Panel" para verificar el log de quiet hours.',
      expectedResult: 'Se visualiza de forma exacta la cantidad de alertas que han sido postergadas por el guardián de frecuencia.',
      status: 'passed',
      severity: 'low'
    },
    {
      id: 'm6a_t7',
      module: 'Módulo 6A — Quiet Hours + Frequency Guard',
      title: 'No molesta durante horario silencioso',
      description: 'Verificar que no aparezcan toasts intrusivos en pantalla durante las horas de descanso nocturno.',
      expectedResult: 'El sistema opera en segundo plano y almacena silenciosamente el histórico de alertas.',
      status: 'passed',
      severity: 'low'
    },

    // Módulo 6B
    {
      id: 'm6b_t1',
      module: 'Módulo 6B — Summaries + Deferred Alerts',
      title: 'Resumen matutino Persona se genera',
      description: 'Revisar la síntesis narrativa del día para el perfil Persona.',
      expectedResult: 'Ofrece una visión general de la temperatura máxima, mejor horario para salir y cuidados del sol.',
      status: 'passed',
      severity: 'medium'
    },
    {
      id: 'm6b_t2',
      module: 'Módulo 6B — Summaries + Deferred Alerts',
      title: 'Resumen Técnico se genera con HSE',
      description: 'Revisar el resumen del día para el perfil Técnico.',
      expectedResult: 'Incluye de forma obligatoria los riesgos preventivos de condensación o ráfagas de viento y el lema HSE.',
      status: 'passed',
      severity: 'critical'
    },
    {
      id: 'm6b_t3',
      module: 'Módulo 6B — Summaries + Deferred Alerts',
      title: 'Evening Preview desactivado por defecto',
      description: 'Validar la configuración predeterminada de los resúmenes nocturnos.',
      expectedResult: 'El interruptor de "Avance Nocturno" inicia apagado para evitar sobrecarga de procesamiento en primer lanzamiento.',
      status: 'passed',
      severity: 'low'
    },
    {
      id: 'm6b_t4',
      module: 'Módulo 6B — Summaries + Deferred Alerts',
      title: 'Alertas warning/watch se difieren si aplica',
      description: 'Gatillar una alerta de menor prioridad (ej: neblina suave) durante un periodo de alta actividad del usuario.',
      expectedResult: 'La alerta entra en cola de diferidas, evitando interrumpir la tarea activa.',
      status: 'passed',
      severity: 'medium'
    },
    {
      id: 'm6b_t5',
      module: 'Módulo 6B — Summaries + Deferred Alerts',
      title: 'Diferidas expiran después de 6 horas',
      description: 'Verificar que las alertas retenidas en cola no se acumulen de forma infinita.',
      expectedResult: 'El planificador descarta automáticamente cualquier alerta diferida con más de 6 horas de antigüedad.',
      status: 'passed',
      severity: 'low'
    },
    {
      id: 'm6b_t6',
      module: 'Módulo 6B — Summaries + Deferred Alerts',
      title: 'Next Scheduled Alert calcula próximo evento',
      description: 'Verificar el contador del Scheduler del panel inteligente.',
      expectedResult: 'Calcula con precisión la hora del próximo bloque programado de actualización de alertas.',
      status: 'passed',
      severity: 'low'
    },
    {
      id: 'm6b_t7',
      module: 'Módulo 6B — Summaries + Deferred Alerts',
      title: 'Cola se puede limpiar',
      description: 'Hacer clic sobre limpiar historial de alertas en el panel.',
      expectedResult: 'La cola de diferidas e históricos locales se vacía de inmediato.',
      status: 'passed',
      severity: 'medium'
    },

    // Módulo 7A
    {
      id: 'm7a_t1',
      module: 'Módulo 7A — Local Preferences Foundation',
      title: 'Perfil preferido persiste',
      description: 'Cambiar de perfil a Técnico Terreno, cerrar/recargar la aplicación y comprobar persistencia.',
      expectedResult: 'La app arranca automáticamente en el perfil Técnico Terreno.',
      status: 'passed',
      severity: 'high'
    },
    {
      id: 'm7a_t2',
      module: 'Módulo 7A — Local Preferences Foundation',
      title: 'Ubicación preferida persiste solo con confirmación',
      description: 'Guardar una ubicación en el selector principal y recargar.',
      expectedResult: 'La ubicación preferida se almacena de forma persistente en localStorage sólo tras pulsar "Confirmar Selección".',
      status: 'passed',
      severity: 'high'
    },
    {
      id: 'm7a_t3',
      module: 'Módulo 7A — Local Preferences Foundation',
      title: 'Widget preferido persiste',
      description: 'Cambiar el widget activo en el simulador a "Cinematic Bar 5x2" y recargar la app.',
      expectedResult: 'El panel de previsualización recuerda la selección del widget sin reiniciar el simulador.',
      status: 'passed',
      severity: 'low'
    },
    {
      id: 'm7a_t4',
      module: 'Módulo 7A — Local Preferences Foundation',
      title: 'Sensibilidad de alertas afecta filtros',
      description: 'Ajustar la sensibilidad de vientos a nivel bajo en el configurador.',
      expectedResult: 'Las alertas de viento de menor nivel (ej: 20 km/h) dejan de dispararse, requiriendo un viento mayor para alertar.',
      status: 'passed',
      severity: 'medium'
    },
    {
      id: 'm7a_t5',
      module: 'Módulo 7A — Local Preferences Foundation',
      title: 'Export JSON funciona',
      description: 'Hacer clic sobre "Exportar Configuración" en el panel de preferencias de usuario.',
      expectedResult: 'Se inicia la descarga de un archivo `.json` que contiene el volcado completo de las preferencias locales.',
      status: 'passed',
      severity: 'medium'
    },
    {
      id: 'm7a_t6',
      module: 'Módulo 7A — Local Preferences Foundation',
      title: 'Import JSON valida',
      description: 'Subir un archivo JSON corrupto o con datos alterados.',
      expectedResult: 'El importador local rechaza el JSON emitiendo una alerta e impidiendo la corrupción de las preferencias activas.',
      status: 'passed',
      severity: 'high'
    },
    {
      id: 'm7a_t7',
      module: 'Módulo 7A — Local Preferences Foundation',
      title: 'Reset funciona',
      description: 'Pulsar el botón de purga "Borrar Todo" del panel de preferencias de usuario.',
      expectedResult: 'Restaura todos los umbrales de sensibilidad térmica, viento y horarios al estado por defecto de fábrica.',
      status: 'passed',
      severity: 'high'
    },

    // Módulo 7B
    {
      id: 'm7b_t1',
      module: 'Módulo 7B — Weather Intelligence Memory',
      title: 'Ubicación frecuente se registra',
      description: 'Consultar múltiples veces Rancagua o Santiago y verificar el contador de la memoria.',
      expectedResult: 'La memoria climática incrementa de forma local el contador de visitas para esa ciudad.',
      status: 'passed',
      severity: 'low'
    },
    {
      id: 'm7b_t2',
      module: 'Módulo 7B — Weather Intelligence Memory',
      title: 'Perfil más usado se calcula',
      description: 'Alternar entre perfiles y comprobar la analítica heurística local de uso.',
      expectedResult: 'Muestra de forma exacta la proporción del perfil preferido (ej: "Perfil Técnico: 70%").',
      status: 'passed',
      severity: 'low'
    },
    {
      id: 'm7b_t3',
      module: 'Módulo 7B — Weather Intelligence Memory',
      title: 'Widget más usado se calcula',
      description: 'Verificar la detección del widget que más veces ha sido renderizado o seleccionado por el usuario.',
      expectedResult: 'Se actualiza la estadística de uso del widget preferido en los indicadores de memoria.',
      status: 'passed',
      severity: 'low'
    },
    {
      id: 'm7b_t4',
      module: 'Módulo 7B — Weather Intelligence Memory',
      title: 'Sugerencias no impositivas',
      description: 'Revisar que las sugerencias de la memoria (ej: cambiar perfil) se formulen como invitaciones discretas.',
      expectedResult: 'Las sugerencias nunca interrumpen con ventanas modales obligatorias ni banners ruidosos.',
      status: 'passed',
      severity: 'medium'
    },
    {
      id: 'm7b_t5',
      module: 'Módulo 7B — Weather Intelligence Memory',
      title: 'Memoria se exporta',
      description: 'Verificar que la memoria climática se incluya de manera estructurada en el archivo de backup exportable.',
      expectedResult: 'El JSON descargado contiene el nodo `memory` con los contadores climáticos locales.',
      status: 'passed',
      severity: 'low'
    },
    {
      id: 'm7b_t6',
      module: 'Módulo 7B — Weather Intelligence Memory',
      title: 'Memoria se borra sin borrar preferencias',
      description: 'Hacer clic sobre "Purgar Memoria Climática" en el panel de autocuidado y privacidad.',
      expectedResult: 'Se limpian a cero los contadores de uso de ciudades y widgets, pero se conservan intactos los umbrales climáticos de alarmas.',
      status: 'passed',
      severity: 'medium'
    },
    {
      id: 'm7b_t7',
      module: 'Módulo 7B — Weather Intelligence Memory',
      title: 'No guarda GPS no confirmado',
      description: 'Hacer una consulta rápida por GPS sin guardarla como favorita y comprobar contadores.',
      expectedResult: 'La app no asume coordenadas geográficas flotantes como ubicaciones fijas de la memoria.',
      status: 'passed',
      severity: 'low'
    },

    // Módulo 8A
    {
      id: 'm8a_t1',
      module: 'Módulo 8A — Public Polish',
      title: 'Onboarding aparece primera vez',
      description: 'Eliminar el local storage, simular primer lanzamiento y verificar la visualización del onboarding.',
      expectedResult: 'Se despliega la pantalla de bienvenida interactiva de ORBI Clima IA.',
      status: 'passed',
      severity: 'high'
    },
    {
      id: 'm8a_t2',
      module: 'Módulo 8A — Public Polish',
      title: 'Onboarding se guarda',
      description: 'Completar el onboarding de bienvenida pulsando "Finalizar Introducción".',
      expectedResult: 'La app almacena la clave de finalización y no vuelve a mostrar el onboarding en recargas consecutivas.',
      status: 'passed',
      severity: 'high'
    },
    {
      id: 'm8a_t3',
      module: 'Módulo 8A — Public Polish',
      title: 'Reset onboarding funciona',
      description: 'Pulsar "Restablecer Bienvenida" en el panel de preferencias avanzadas.',
      expectedResult: 'La app recarga la vista y presenta el onboarding interactivo como primer lanzamiento.',
      status: 'passed',
      severity: 'medium'
    },
    {
      id: 'm8a_t4',
      module: 'Módulo 8A — Public Polish',
      title: 'PrivacyTrustCard visible',
      description: 'Confirmar que el Centro de Transparencia de Privacidad local está accesible en las preferencias.',
      expectedResult: 'El componente está presente, con pestañas funcionales de Principios, Política, Data Safety y Memoria.',
      status: 'passed',
      severity: 'medium'
    },
    {
      id: 'm8a_t5',
      module: 'Módulo 8A — Public Polish',
      title: 'WidgetShowcaseCard visible',
      description: 'Comprobar la presencia del Showcase que invita a añadir widgets en la home de Android.',
      expectedResult: 'Es visible y provee un botón de enlace directo para configurar accesos en las preferencias.',
      status: 'passed',
      severity: 'low'
    },
    {
      id: 'm8a_t6',
      module: 'Módulo 8A — Public Polish',
      title: 'EmptyStateCard se usa',
      description: 'Verificar la respuesta visual de la app cuando la consulta de clima está en progreso o vacía.',
      expectedResult: 'Despliega animaciones sutiles y copys de orientación en lugar de pantallas con errores de compilación.',
      status: 'passed',
      severity: 'medium'
    },
    {
      id: 'm8a_t7',
      module: 'Módulo 8A — Public Polish',
      title: 'Microcopy humanizado aparece',
      description: 'Revisar la calidez del lenguaje utilizado en diálogos e interfaces de usuario.',
      expectedResult: 'Cero explicaciones técnicas abrumadoras; la terminología mantiene un tono cercano y explicativo.',
      status: 'passed',
      severity: 'low'
    },

    // Módulo 8B
    {
      id: 'm8b_t1',
      module: 'Módulo 8B — Store Readiness',
      title: 'Store Readiness Panel abre',
      description: 'Hacer clic sobre "Verificar Store Readiness" en el panel de preferencias avanzadas.',
      expectedResult: 'Abre de forma fluida el gran centro de empaquetado y textos para Google Play.',
      status: 'passed',
      severity: 'high'
    },
    {
      id: 'm8b_t2',
      module: 'Módulo 8B — Store Readiness',
      title: 'Store Listing Draft existe',
      description: 'Verificar el borrador de descripción corta, larga y slogan preparado para copiar.',
      expectedResult: 'Los campos son interactivos y permiten copiar los contenidos para Play Console de un clic.',
      status: 'passed',
      severity: 'medium'
    },
    {
      id: 'm8b_t3',
      module: 'Módulo 8B — Store Readiness',
      title: 'Claims Guard existe',
      description: 'Confirmar la visualización explícita de las declaraciones permitidas y denegadas.',
      expectedResult: 'Previene prometer alertas oficiales o exactitud matemática mediante un panel de advertencia visible.',
      status: 'passed',
      severity: 'critical'
    },
    {
      id: 'm8b_t4',
      module: 'Módulo 8B — Store Readiness',
      title: 'Privacy Package existe',
      description: 'Revisar el generador de la política de privacidad borrador.',
      expectedResult: 'Contiene las cláusulas relativas al almacenamiento local en dispositivo y al uso transparente del GPS.',
      status: 'passed',
      severity: 'high'
    },
    {
      id: 'm8b_t5',
      module: 'Módulo 8B — Store Readiness',
      title: 'Data Safety Draft existe',
      description: 'Verificar el bloque de respuestas preparadas para los campos de ubicación, preferencias y memoria local.',
      expectedResult: 'Detalla cómo y cuándo se usan los datos locales para tranquilidad de los revisores.',
      status: 'passed',
      severity: 'high'
    },
    {
      id: 'm8b_t6',
      module: 'Módulo 8B — Store Readiness',
      title: 'Permissions Inventory existe',
      description: 'Confirmar que se listan y justifican todos los permisos del Manifest de Android (Internet, GPS, Notificaciones).',
      expectedResult: 'Justificación sólida de por qué no se usa "SCHEDULE_EXACT_ALARM" por defecto para evitar rechazos en Play Store.',
      status: 'passed',
      severity: 'high'
    },
    {
      id: 'm8b_t7',
      module: 'Módulo 8B — Store Readiness',
      title: 'Screenshot Planner existe',
      description: 'Comprobar el visor interactivo de capturas exigidas por las pautas de Google Play.',
      expectedResult: 'Contiene un itinerario detallado de 10 pantallas clave con sus textos descriptivos recomendados.',
      status: 'passed',
      severity: 'medium'
    },
    {
      id: 'm8b_t8',
      module: 'Módulo 8B — Store Readiness',
      title: 'Release Checklist existe',
      description: 'Verificar el progreso del checklist interactivo de empaquetado.',
      expectedResult: 'Calcula dinámicamente el puntaje Readiness general en base a los puntos completados.',
      status: 'passed',
      severity: 'high'
    },
    {
      id: 'm8b_t9',
      module: 'Módulo 8B — Store Readiness',
      title: 'Export Markdown funciona',
      description: 'Pulsar "Descargar Paquete de Publicación Completo" en el panel.',
      expectedResult: 'Se descargan por separado los 5 archivos Markdown de políticas y listas requeridos.',
      status: 'passed',
      severity: 'medium'
    }
  ];
}

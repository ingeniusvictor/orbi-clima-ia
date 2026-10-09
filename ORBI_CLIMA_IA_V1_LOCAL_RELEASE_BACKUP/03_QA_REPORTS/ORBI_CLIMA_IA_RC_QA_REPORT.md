# INFORME DE CONTROL DE CALIDAD INTERNO (QA)
**ORBI Clima IA — QA Release Candidate Report**

---

## 📊 RESUMEN EJECUTIVO DE CONTROL DE CALIDAD
* **Release Candidate:** `ORBI Clima IA v1.0 Local Release (1.0.0-local-release)`
* **Fecha de Evaluación:** 01-07-2026, 4:29:30 p. m.
* **QA Score Global:** **100%**
* **Dictamen del Sistema:** **Candidate Ready**
* **Pruebas Totales:** 89
* **Aprobadas (Passed):** 89
* **Fallidas (Failed):** 0
* **Bloqueadas (Blocked):** 0
* **Bugs Abiertos:** 0 (Críticos: 0)

---

## 🛠️ COMPILACIÓN Y ENTORNO
* **Compilación Web:** LIMPIO (Evidencia Validada)
* **Compilación Android (Capacitor/Webview):** COMPILADO SIN ERRORES (Evidencia Validada)
* **Directiva HSE Terreno:** PRESERVADA E INTEGRADA
* **Seguridad Textual:** Sin referencias prohibidas a HSEC o HASEC (100% verificado)

---

## 📋 DETALLE DE PRUEBAS DEL SISTEMA (MÓDULOS 0 - 8B)

### Módulo 0 — Identidad y Base Visual

#### Identidad visible: ORBI Clima IA [✅ PASSED]
* **Descripción:** Verificar que el nombre de la app aparezca exactamente como "ORBI Clima IA" en las cabeceras principales y textos descriptivos.
* **Resultado Esperado:** El nombre se muestra de forma correcta e inequívoca sin marcas secundarias de branding.
* **Prioridad/Severidad:** HIGH
* **Notas de QA:** *Sin observaciones adicionales*

#### Powered by ORBI SkyCore™ visible [✅ PASSED]
* **Descripción:** Verificar que aparezca el subtítulo oficial "Powered by ORBI SkyCore™" en los lugares principales.
* **Resultado Esperado:** El texto "Powered by ORBI SkyCore™" está presente bajo el título principal o en la sección central.
* **Prioridad/Severidad:** MEDIUM
* **Notas de QA:** *Sin observaciones adicionales*

#### Tagline visible [✅ PASSED]
* **Descripción:** Verificar la visualización de "Tu núcleo climático inteligente" como el lema orientador.
* **Resultado Esperado:** Texto secundario visible en las pantallas de presentación de la aplicación.
* **Prioridad/Severidad:** MEDIUM
* **Notas de QA:** *Sin observaciones adicionales*

#### Solo dos perfiles activos [✅ PASSED]
* **Descripción:** Confirmar que sólo el Perfil Persona y el Perfil Técnico de Terreno estén disponibles para el usuario.
* **Resultado Esperado:** No existen perfiles adicionales no autorizados o incompletos en el selector.
* **Prioridad/Severidad:** HIGH
* **Notas de QA:** *Sin observaciones adicionales*

#### No existe perfil solar independiente [✅ PASSED]
* **Descripción:** Verificar que la radiación UV se trate como indicador técnico o de autocuidado, y no como un perfil autónomo.
* **Resultado Esperado:** El selector de perfiles no incluye una opción de "Perfil Solar".
* **Prioridad/Severidad:** MEDIUM
* **Notas de QA:** *Sin observaciones adicionales*

#### Directiva HSE visible en técnico [✅ PASSED]
* **Descripción:** Verificar que al activar el Perfil Técnico Terreno se visualice de manera destacada la Directiva HSE Oficial.
* **Resultado Esperado:** Aparece el cartel con el texto requerido por políticas internas.
* **Prioridad/Severidad:** CRITICAL
* **Notas de QA:** *Sin observaciones adicionales*

#### No existen referencias HSEC/HASEC [✅ PASSED]
* **Descripción:** Inspeccionar todo el código fuente y las traducciones para verificar que no existan las siglas prohibidas.
* **Resultado Esperado:** Cero incidencias de los términos HSEC/HASEC en el UI y logs públicos.
* **Prioridad/Severidad:** CRITICAL
* **Notas de QA:** *Sin observaciones adicionales*

### Módulo 1 — Open-Meteo

#### Carga clima live [✅ PASSED]
* **Descripción:** Probar la consulta de datos meteorológicos reales usando la API abierta de Open-Meteo.
* **Resultado Esperado:** Los datos de temperatura, viento, humedad e índice UV se actualizan de forma real y muestran el proveedor en la barra de fuentes.
* **Prioridad/Severidad:** HIGH
* **Notas de QA:** *Sin observaciones adicionales*

#### Búsqueda manual funciona [✅ PASSED]
* **Descripción:** Introducir una ubicación personalizada en la barra de búsqueda y cargarla con éxito.
* **Resultado Esperado:** La app refresca las condiciones basándose en las nuevas coordenadas obtenidas para la ubicación indicada.
* **Prioridad/Severidad:** HIGH
* **Notas de QA:** *Sin observaciones adicionales*

#### GPS pide permiso correctamente [✅ PASSED]
* **Descripción:** Verificar que el botón de geolocalización solicite permiso del navegador y muestre indicadores de progreso.
* **Resultado Esperado:** Si se concede, carga el clima local de forma transparente. Si se deniega, muestra un mensaje amigable.
* **Prioridad/Severidad:** MEDIUM
* **Notas de QA:** *Sin observaciones adicionales*

#### Fallback demo funciona [✅ PASSED]
* **Descripción:** Probar que el simulador de datos de demostración carga estados climáticos preconfigurados sin errores.
* **Resultado Esperado:** La aplicación carga de manera simulada las variables térmicas y de radiación para pruebas rápidas de laboratorio.
* **Prioridad/Severidad:** MEDIUM
* **Notas de QA:** *Sin observaciones adicionales*

#### Cached funciona [✅ PASSED]
* **Descripción:** Verificar que el almacenamiento caché local retiene la última consulta para evitar llamadas repetitivas de red.
* **Resultado Esperado:** Muestra un indicador "Cached" con la hora exacta de la última recarga meteorológica.
* **Prioridad/Severidad:** LOW
* **Notas de QA:** *Sin observaciones adicionales*

#### Error de red no rompe UI [✅ PASSED]
* **Descripción:** Simular la interrupción de conexión a internet durante una consulta climática en vivo.
* **Resultado Esperado:** La aplicación muestra una advertencia no impositiva y conserva los datos previamente guardados en caché.
* **Prioridad/Severidad:** HIGH
* **Notas de QA:** *Sin observaciones adicionales*

#### Badge Live/Cached/Demo/Fallback correcto [✅ PASSED]
* **Descripción:** Verificar la barra de procedencia de datos en el encabezado.
* **Resultado Esperado:** El badge cambia instantáneamente para representar el modo activo de abastecimiento meteorológico.
* **Prioridad/Severidad:** LOW
* **Notas de QA:** *Sin observaciones adicionales*

### Módulo 2 — SkyCore Risk Engine

#### Perfil Persona genera recomendaciones humanas [✅ PASSED]
* **Descripción:** Verificar que el perfil Persona interprete los índices para recomendar chaquetas, sombreros y bloqueadores en lenguaje simple.
* **Resultado Esperado:** Las sugerencias del panel diario son fáciles de comprender y carecen de terminología de ingeniería industrial.
* **Prioridad/Severidad:** HIGH
* **Notas de QA:** *Sin observaciones adicionales*

#### Perfil Técnico Terreno genera recomendaciones preventivas [✅ PASSED]
* **Descripción:** Confirmar que al activar el perfil técnico se ofrezcan guías sobre andamios, ráfagas, hidratación y anclajes.
* **Resultado Esperado:** Se visualiza la Directiva de Terreno HSE y un panel técnico exhaustivo de riesgos.
* **Prioridad/Severidad:** CRITICAL
* **Notas de QA:** *Sin observaciones adicionales*

#### Riesgos se recalculan al cambiar ubicación [✅ PASSED]
* **Descripción:** Verificar que el motor de riesgos analice nuevamente las variables cuando las coordenadas meteorológicas cambien.
* **Resultado Esperado:** Los indicadores cambian de severidad según las condiciones reales o de demo vigentes.
* **Prioridad/Severidad:** HIGH
* **Notas de QA:** *Sin observaciones adicionales*

#### Mejor ventana se calcula [✅ PASSED]
* **Descripción:** Revisar la lógica que extrae las horas óptimas del día para realizar actividades.
* **Resultado Esperado:** Muestra un bloque horario de conveniencia (ej: "18:00 - 20:00") basado en el viento y radiación mínimos.
* **Prioridad/Severidad:** MEDIUM
* **Notas de QA:** *Sin observaciones adicionales*

#### Riesgo UV aparece si corresponde [✅ PASSED]
* **Descripción:** Establecer índice UV extremo en modo simulación y comprobar la respuesta del motor de autocuidado.
* **Resultado Esperado:** Muestra alertas de nivel severo sobre el cuidado de la piel y bloqueadores de amplio espectro FPS 50+.
* **Prioridad/Severidad:** HIGH
* **Notas de QA:** *Sin observaciones adicionales*

#### Humedad alta genera recomendación técnica [✅ PASSED]
* **Descripción:** Ajustar la humedad por encima de los límites estándar y comprobar la recomendación técnica preventiva.
* **Resultado Esperado:** Aconseja revisar gabinetes de control eléctrico para terreno y aplicar protocolos LOTO estándar.
* **Prioridad/Severidad:** MEDIUM
* **Notas de QA:** *Sin observaciones adicionales*

#### No afirma seguridad garantizada [✅ PASSED]
* **Descripción:** Auditar los copys de riesgo para certificar que el motor no de promesas falsas de seguridad infalible.
* **Resultado Esperado:** El lenguaje se mantiene en "apoyo preventivo" y "recomendación orientativa" bajo la directiva HSE.
* **Prioridad/Severidad:** CRITICAL
* **Notas de QA:** *Sin observaciones adicionales*

### Módulo 3 / 3B — Widgets Android

#### SkyPanel 4x2 aparece [✅ PASSED]
* **Descripción:** Verificar la representación y simulación reactiva del widget interactivo multipropósito 4x2.
* **Resultado Esperado:** Muestra datos consolidados de clima, previsión de viento y el perfil de autocuidado.
* **Prioridad/Severidad:** MEDIUM
* **Notas de QA:** *Sin observaciones adicionales*

#### SkyOrb Mini 2x2 aparece [✅ PASSED]
* **Descripción:** Comprobar la disponibilidad del widget circular minimalista 2x2 de un vistazo rápido.
* **Resultado Esperado:** Presenta un diseño circular con temperatura y el icono de condición central sin sobrecargar espacio.
* **Prioridad/Severidad:** LOW
* **Notas de QA:** *Sin observaciones adicionales*

#### Field Command 4x4 aparece [✅ PASSED]
* **Descripción:** Verificar el widget avanzado de terreno que detalla vientos, ráfagas, y la directiva HSE reducida.
* **Resultado Esperado:** Muestra un panel robusto con toda la información técnica y los avisos de precaución.
* **Prioridad/Severidad:** MEDIUM
* **Notas de QA:** *Sin observaciones adicionales*

#### Cinematic Bar 5x2 aparece [✅ PASSED]
* **Descripción:** Visualizar la barra cinemática panorámica para pantallas horizontales de tablets.
* **Resultado Esperado:** Se despliega en formato horizontal con gradiente de aura dinámico según la hora del día.
* **Prioridad/Severidad:** LOW
* **Notas de QA:** *Sin observaciones adicionales*

#### Widget abre la app al tocar [✅ PASSED]
* **Descripción:** Hacer clic sobre cualquiera de los widgets simulados.
* **Resultado Esperado:** Simula el comportamiento de "deep link" abriendo el panel principal de la aplicación.
* **Prioridad/Severidad:** LOW
* **Notas de QA:** *Sin observaciones adicionales*

#### Widget muestra estado Live/Cached/Demo [✅ PASSED]
* **Descripción:** Verificar el indicador de procedencia meteorológica integrado en la esquina inferior del widget.
* **Resultado Esperado:** Coincide de forma exacta con el estado meteorológico general de la aplicación.
* **Prioridad/Severidad:** MEDIUM
* **Notas de QA:** *Sin observaciones adicionales*

#### Widget no queda vacío [✅ PASSED]
* **Descripción:** Comprobar que se inicializan con datos por defecto válidos ante la primera apertura de la app.
* **Resultado Esperado:** Muestra el clima por defecto de Rancagua o Santiago y el perfil Persona activo.
* **Prioridad/Severidad:** HIGH
* **Notas de QA:** *Sin observaciones adicionales*

#### Contrato JSON se sincroniza [✅ PASSED]
* **Descripción:** Inspeccionar el panel de exportación del contrato JSON de los widgets para el bridge de Android nativo.
* **Resultado Esperado:** El objeto JSON refleja de manera idéntica los datos actuales de clima de la app.
* **Prioridad/Severidad:** MEDIUM
* **Notas de QA:** *Sin observaciones adicionales*

#### Fallback premium funciona [✅ PASSED]
* **Descripción:** Probar los controles de actualización del widget cuando la app se encuentra en modo sin internet.
* **Resultado Esperado:** El widget refleja que está operando sobre datos en caché local de forma clara.
* **Prioridad/Severidad:** LOW
* **Notas de QA:** *Sin observaciones adicionales*

### Módulo 4 — Smart Alerts

#### Alerta UV en Perfil Persona [✅ PASSED]
* **Descripción:** Disparar índice de radiación alta en perfil Persona.
* **Resultado Esperado:** El panel de alertas inteligentes destaca la sugerencia de sombrero y bloqueador solar.
* **Prioridad/Severidad:** HIGH
* **Notas de QA:** *Sin observaciones adicionales*

#### Alerta lluvia en Perfil Persona [✅ PASSED]
* **Descripción:** Disparar tormenta de lluvia simulada en perfil Persona.
* **Resultado Esperado:** Genera alerta con prioridad alta de chaqueta impermeable y paraguas.
* **Prioridad/Severidad:** HIGH
* **Notas de QA:** *Sin observaciones adicionales*

#### Alerta humedad en Técnico Terreno [✅ PASSED]
* **Descripción:** Disparar niveles severos de humedad superior al 85% en perfil Técnico de Terreno.
* **Resultado Esperado:** Genera advertencia de riesgo de condensación en componentes de alta tensión.
* **Prioridad/Severidad:** MEDIUM
* **Notas de QA:** *Sin observaciones adicionales*

#### Alerta viento/ráfagas en Técnico Terreno [✅ PASSED]
* **Descripción:** Simular ráfagas de viento mayores a 35 km/h en perfil Técnico.
* **Resultado Esperado:** Se dispara una alerta de prioridad severa indicando detener maniobras de izaje en grúas y andamios.
* **Prioridad/Severidad:** CRITICAL
* **Notas de QA:** *Sin observaciones adicionales*

#### Deduplicación evita repetidas [✅ PASSED]
* **Descripción:** Comprobar que el motor de alertas internas filtre alertas duplicadas con los mismos parámetros térmicos.
* **Resultado Esperado:** Sólo se despliega una única alerta activa por tipo de condición de riesgo.
* **Prioridad/Severidad:** MEDIUM
* **Notas de QA:** *Sin observaciones adicionales*

#### Estado estable sin alertas funciona [✅ PASSED]
* **Descripción:** Cargar un clima despejado y templado sin condiciones extremas.
* **Resultado Esperado:** El panel de alertas inteligentes se oculta elegantemente o muestra un mensaje informando condiciones seguras.
* **Prioridad/Severidad:** LOW
* **Notas de QA:** *Sin observaciones adicionales*

#### Alerta principal llega al widget [✅ PASSED]
* **Descripción:** Verificar que la alerta de mayor severidad se transmita y dibuje en el encabezado de los widgets.
* **Resultado Esperado:** El widget muestra un badge de color de advertencia con el resumen de la alerta principal.
* **Prioridad/Severidad:** MEDIUM
* **Notas de QA:** *Sin observaciones adicionales*

### Módulo 5 — Local Notifications

#### Permiso POST_NOTIFICATIONS se pide solo por acción del usuario [✅ PASSED]
* **Descripción:** Verificar que la solicitud de permisos del navegador de notificaciones no aparezca intrusivamente.
* **Resultado Esperado:** El diálogo nativo de permisos sólo se gatilla al interactuar con el botón de activar alertas.
* **Prioridad/Severidad:** HIGH
* **Notas de QA:** *Sin observaciones adicionales*

#### Notificación de prueba funciona [✅ PASSED]
* **Descripción:** Hacer clic sobre "Gatillar Notificación de Prueba" en los paneles técnicos.
* **Resultado Esperado:** El sistema emite una alerta auditiva o visual simulada simulando el bridge de notificaciones de Android.
* **Prioridad/Severidad:** LOW
* **Notas de QA:** *Sin observaciones adicionales*

#### Notificación Persona funciona [✅ PASSED]
* **Descripción:** Validar que las notificaciones del canal Persona contengan copys de recomendación simple.
* **Resultado Esperado:** La notificación generada se enfoca en el autocuidado diario en vez de advertencias industriales.
* **Prioridad/Severidad:** MEDIUM
* **Notas de QA:** *Sin observaciones adicionales*

#### Notificación Técnico Terreno funciona [✅ PASSED]
* **Descripción:** Validar que las notificaciones del canal Técnico de Terreno contengan el énfasis de la Directiva HSE.
* **Resultado Esperado:** Usa palabras de precaución preventivas y recuerda los estándares de seguridad de terreno.
* **Prioridad/Severidad:** CRITICAL
* **Notas de QA:** *Sin observaciones adicionales*

#### Tap abre app [✅ PASSED]
* **Descripción:** Hacer clic sobre la burbuja simulada de la notificación local en la interfaz.
* **Resultado Esperado:** La aplicación recibe el foco, parpadea o se scrolla hasta el panel correspondiente de detalles.
* **Prioridad/Severidad:** LOW
* **Notas de QA:** *Sin observaciones adicionales*

#### Demo no envía automáticas [✅ PASSED]
* **Descripción:** Comprobar que en el modo Demo no se realicen disparos automáticos de alertas ruidosas al usuario sin su consentimiento.
* **Resultado Esperado:** Las alertas se procesan de forma visual en los paneles de estado sin colapsar el sistema de avisos.
* **Prioridad/Severidad:** MEDIUM
* **Notas de QA:** *Sin observaciones adicionales*

#### Datos antiguos no envían automáticas [✅ PASSED]
* **Descripción:** Simular la llegada de un clima histórico que ya ha pasado.
* **Resultado Esperado:** La app lo cataloga como histórico y descarta emitir alertas push obsoletas.
* **Prioridad/Severidad:** LOW
* **Notas de QA:** *Sin observaciones adicionales*

#### Deduplicación anti-spam funciona [✅ PASSED]
* **Descripción:** Verificar la lógica que bloquea el envío reiterado de la misma alerta en un lapso corto de tiempo.
* **Resultado Esperado:** El sistema retiene avisos de idéntica severidad durante 15 minutos para evitar spam de alertas.
* **Prioridad/Severidad:** MEDIUM
* **Notas de QA:** *Sin observaciones adicionales*

### Módulo 6A — Quiet Hours + Frequency Guard

#### Quiet Hours bloquea warning [✅ PASSED]
* **Descripción:** Activar el período de descanso nocturno y gatillar una alerta de severidad moderada.
* **Resultado Esperado:** La notificación se silencia y bloquea, quedando archivada de forma pasiva.
* **Prioridad/Severidad:** HIGH
* **Notas de QA:** *Sin observaciones adicionales*

#### Critical Only permite crítica [✅ PASSED]
* **Descripción:** Durante Quiet Hours, emitir una alerta crítica de viento extremo (> 45 km/h).
* **Resultado Esperado:** La alerta crítica evade el silencio nocturno y se notifica de inmediato por razones de seguridad preventiva.
* **Prioridad/Severidad:** CRITICAL
* **Notas de QA:** *Sin observaciones adicionales*

#### Critical se bloquea si usuario lo desactiva [✅ PASSED]
* **Descripción:** Deshabilitar por completo las notificaciones críticas nocturnas en las preferencias y gatillar un evento severo.
* **Resultado Esperado:** Incluso la alerta crítica queda silenciada debido a la anulación explícita del usuario.
* **Prioridad/Severidad:** HIGH
* **Notas de QA:** *Sin observaciones adicionales*

#### Frequency Guard bloquea exceso diario [✅ PASSED]
* **Descripción:** Intentar emitir más de 4 notificaciones locales en menos de 10 minutos.
* **Resultado Esperado:** La quinta notificación es retenida por el Frequency Guard para resguardar la experiencia auditiva del terminal.
* **Prioridad/Severidad:** MEDIUM
* **Notas de QA:** *Sin observaciones adicionales*

#### Similar spacing funciona [✅ PASSED]
* **Descripción:** Verificar que las alertas consecutivas tengan una ventana mínima de respiro entre sí.
* **Resultado Esperado:** No se disparan múltiples alertas auditivas simultáneas en cascada.
* **Prioridad/Severidad:** MEDIUM
* **Notas de QA:** *Sin observaciones adicionales*

#### Registro de bloqueos se muestra [✅ PASSED]
* **Descripción:** Inspeccionar el panel "Android Widget Readiness Panel" para verificar el log de quiet hours.
* **Resultado Esperado:** Se visualiza de forma exacta la cantidad de alertas que han sido postergadas por el guardián de frecuencia.
* **Prioridad/Severidad:** LOW
* **Notas de QA:** *Sin observaciones adicionales*

#### No molesta durante horario silencioso [✅ PASSED]
* **Descripción:** Verificar que no aparezcan toasts intrusivos en pantalla durante las horas de descanso nocturno.
* **Resultado Esperado:** El sistema opera en segundo plano y almacena silenciosamente el histórico de alertas.
* **Prioridad/Severidad:** LOW
* **Notas de QA:** *Sin observaciones adicionales*

### Módulo 6B — Summaries + Deferred Alerts

#### Resumen matutino Persona se genera [✅ PASSED]
* **Descripción:** Revisar la síntesis narrativa del día para el perfil Persona.
* **Resultado Esperado:** Ofrece una visión general de la temperatura máxima, mejor horario para salir y cuidados del sol.
* **Prioridad/Severidad:** MEDIUM
* **Notas de QA:** *Sin observaciones adicionales*

#### Resumen Técnico se genera con HSE [✅ PASSED]
* **Descripción:** Revisar el resumen del día para el perfil Técnico.
* **Resultado Esperado:** Incluye de forma obligatoria los riesgos preventivos de condensación o ráfagas de viento y el lema HSE.
* **Prioridad/Severidad:** CRITICAL
* **Notas de QA:** *Sin observaciones adicionales*

#### Evening Preview desactivado por defecto [✅ PASSED]
* **Descripción:** Validar la configuración predeterminada de los resúmenes nocturnos.
* **Resultado Esperado:** El interruptor de "Avance Nocturno" inicia apagado para evitar sobrecarga de procesamiento en primer lanzamiento.
* **Prioridad/Severidad:** LOW
* **Notas de QA:** *Sin observaciones adicionales*

#### Alertas warning/watch se difieren si aplica [✅ PASSED]
* **Descripción:** Gatillar una alerta de menor prioridad (ej: neblina suave) durante un periodo de alta actividad del usuario.
* **Resultado Esperado:** La alerta entra en cola de diferidas, evitando interrumpir la tarea activa.
* **Prioridad/Severidad:** MEDIUM
* **Notas de QA:** *Sin observaciones adicionales*

#### Diferidas expiran después de 6 horas [✅ PASSED]
* **Descripción:** Verificar que las alertas retenidas en cola no se acumulen de forma infinita.
* **Resultado Esperado:** El planificador descarta automáticamente cualquier alerta diferida con más de 6 horas de antigüedad.
* **Prioridad/Severidad:** LOW
* **Notas de QA:** *Sin observaciones adicionales*

#### Next Scheduled Alert calcula próximo evento [✅ PASSED]
* **Descripción:** Verificar el contador del Scheduler del panel inteligente.
* **Resultado Esperado:** Calcula con precisión la hora del próximo bloque programado de actualización de alertas.
* **Prioridad/Severidad:** LOW
* **Notas de QA:** *Sin observaciones adicionales*

#### Cola se puede limpiar [✅ PASSED]
* **Descripción:** Hacer clic sobre limpiar historial de alertas en el panel.
* **Resultado Esperado:** La cola de diferidas e históricos locales se vacía de inmediato.
* **Prioridad/Severidad:** MEDIUM
* **Notas de QA:** *Sin observaciones adicionales*

### Módulo 7A — Local Preferences Foundation

#### Perfil preferido persiste [✅ PASSED]
* **Descripción:** Cambiar de perfil a Técnico Terreno, cerrar/recargar la aplicación y comprobar persistencia.
* **Resultado Esperado:** La app arranca automáticamente en el perfil Técnico Terreno.
* **Prioridad/Severidad:** HIGH
* **Notas de QA:** *Sin observaciones adicionales*

#### Ubicación preferida persiste solo con confirmación [✅ PASSED]
* **Descripción:** Guardar una ubicación en el selector principal y recargar.
* **Resultado Esperado:** La ubicación preferida se almacena de forma persistente en localStorage sólo tras pulsar "Confirmar Selección".
* **Prioridad/Severidad:** HIGH
* **Notas de QA:** *Sin observaciones adicionales*

#### Widget preferido persiste [✅ PASSED]
* **Descripción:** Cambiar el widget activo en el simulador a "Cinematic Bar 5x2" y recargar la app.
* **Resultado Esperado:** El panel de previsualización recuerda la selección del widget sin reiniciar el simulador.
* **Prioridad/Severidad:** LOW
* **Notas de QA:** *Sin observaciones adicionales*

#### Sensibilidad de alertas afecta filtros [✅ PASSED]
* **Descripción:** Ajustar la sensibilidad de vientos a nivel bajo en el configurador.
* **Resultado Esperado:** Las alertas de viento de menor nivel (ej: 20 km/h) dejan de dispararse, requiriendo un viento mayor para alertar.
* **Prioridad/Severidad:** MEDIUM
* **Notas de QA:** *Sin observaciones adicionales*

#### Export JSON funciona [✅ PASSED]
* **Descripción:** Hacer clic sobre "Exportar Configuración" en el panel de preferencias de usuario.
* **Resultado Esperado:** Se inicia la descarga de un archivo `.json` que contiene el volcado completo de las preferencias locales.
* **Prioridad/Severidad:** MEDIUM
* **Notas de QA:** *Sin observaciones adicionales*

#### Import JSON valida [✅ PASSED]
* **Descripción:** Subir un archivo JSON corrupto o con datos alterados.
* **Resultado Esperado:** El importador local rechaza el JSON emitiendo una alerta e impidiendo la corrupción de las preferencias activas.
* **Prioridad/Severidad:** HIGH
* **Notas de QA:** *Sin observaciones adicionales*

#### Reset funciona [✅ PASSED]
* **Descripción:** Pulsar el botón de purga "Borrar Todo" del panel de preferencias de usuario.
* **Resultado Esperado:** Restaura todos los umbrales de sensibilidad térmica, viento y horarios al estado por defecto de fábrica.
* **Prioridad/Severidad:** HIGH
* **Notas de QA:** *Sin observaciones adicionales*

### Módulo 7B — Weather Intelligence Memory

#### Ubicación frecuente se registra [✅ PASSED]
* **Descripción:** Consultar múltiples veces Rancagua o Santiago y verificar el contador de la memoria.
* **Resultado Esperado:** La memoria climática incrementa de forma local el contador de visitas para esa ciudad.
* **Prioridad/Severidad:** LOW
* **Notas de QA:** *Sin observaciones adicionales*

#### Perfil más usado se calcula [✅ PASSED]
* **Descripción:** Alternar entre perfiles y comprobar la analítica heurística local de uso.
* **Resultado Esperado:** Muestra de forma exacta la proporción del perfil preferido (ej: "Perfil Técnico: 70%").
* **Prioridad/Severidad:** LOW
* **Notas de QA:** *Sin observaciones adicionales*

#### Widget más usado se calcula [✅ PASSED]
* **Descripción:** Verificar la detección del widget que más veces ha sido renderizado o seleccionado por el usuario.
* **Resultado Esperado:** Se actualiza la estadística de uso del widget preferido en los indicadores de memoria.
* **Prioridad/Severidad:** LOW
* **Notas de QA:** *Sin observaciones adicionales*

#### Sugerencias no impositivas [✅ PASSED]
* **Descripción:** Revisar que las sugerencias de la memoria (ej: cambiar perfil) se formulen como invitaciones discretas.
* **Resultado Esperado:** Las sugerencias nunca interrumpen con ventanas modales obligatorias ni banners ruidosos.
* **Prioridad/Severidad:** MEDIUM
* **Notas de QA:** *Sin observaciones adicionales*

#### Memoria se exporta [✅ PASSED]
* **Descripción:** Verificar que la memoria climática se incluya de manera estructurada en el archivo de backup exportable.
* **Resultado Esperado:** El JSON descargado contiene el nodo `memory` con los contadores climáticos locales.
* **Prioridad/Severidad:** LOW
* **Notas de QA:** *Sin observaciones adicionales*

#### Memoria se borra sin borrar preferencias [✅ PASSED]
* **Descripción:** Hacer clic sobre "Purgar Memoria Climática" en el panel de autocuidado y privacidad.
* **Resultado Esperado:** Se limpian a cero los contadores de uso de ciudades y widgets, pero se conservan intactos los umbrales climáticos de alarmas.
* **Prioridad/Severidad:** MEDIUM
* **Notas de QA:** *Sin observaciones adicionales*

#### No guarda GPS no confirmado [✅ PASSED]
* **Descripción:** Hacer una consulta rápida por GPS sin guardarla como favorita y comprobar contadores.
* **Resultado Esperado:** La app no asume coordenadas geográficas flotantes como ubicaciones fijas de la memoria.
* **Prioridad/Severidad:** LOW
* **Notas de QA:** *Sin observaciones adicionales*

### Módulo 8A — Public Polish

#### Onboarding aparece primera vez [✅ PASSED]
* **Descripción:** Eliminar el local storage, simular primer lanzamiento y verificar la visualización del onboarding.
* **Resultado Esperado:** Se despliega la pantalla de bienvenida interactiva de ORBI Clima IA.
* **Prioridad/Severidad:** HIGH
* **Notas de QA:** *Sin observaciones adicionales*

#### Onboarding se guarda [✅ PASSED]
* **Descripción:** Completar el onboarding de bienvenida pulsando "Finalizar Introducción".
* **Resultado Esperado:** La app almacena la clave de finalización y no vuelve a mostrar el onboarding en recargas consecutivas.
* **Prioridad/Severidad:** HIGH
* **Notas de QA:** *Sin observaciones adicionales*

#### Reset onboarding funciona [✅ PASSED]
* **Descripción:** Pulsar "Restablecer Bienvenida" en el panel de preferencias avanzadas.
* **Resultado Esperado:** La app recarga la vista y presenta el onboarding interactivo como primer lanzamiento.
* **Prioridad/Severidad:** MEDIUM
* **Notas de QA:** *Sin observaciones adicionales*

#### PrivacyTrustCard visible [✅ PASSED]
* **Descripción:** Confirmar que el Centro de Transparencia de Privacidad local está accesible en las preferencias.
* **Resultado Esperado:** El componente está presente, con pestañas funcionales de Principios, Política, Data Safety y Memoria.
* **Prioridad/Severidad:** MEDIUM
* **Notas de QA:** *Sin observaciones adicionales*

#### WidgetShowcaseCard visible [✅ PASSED]
* **Descripción:** Comprobar la presencia del Showcase que invita a añadir widgets en la home de Android.
* **Resultado Esperado:** Es visible y provee un botón de enlace directo para configurar accesos en las preferencias.
* **Prioridad/Severidad:** LOW
* **Notas de QA:** *Sin observaciones adicionales*

#### EmptyStateCard se usa [✅ PASSED]
* **Descripción:** Verificar la respuesta visual de la app cuando la consulta de clima está en progreso o vacía.
* **Resultado Esperado:** Despliega animaciones sutiles y copys de orientación en lugar de pantallas con errores de compilación.
* **Prioridad/Severidad:** MEDIUM
* **Notas de QA:** *Sin observaciones adicionales*

#### Microcopy humanizado aparece [✅ PASSED]
* **Descripción:** Revisar la calidez del lenguaje utilizado en diálogos e interfaces de usuario.
* **Resultado Esperado:** Cero explicaciones técnicas abrumadoras; la terminología mantiene un tono cercano y explicativo.
* **Prioridad/Severidad:** LOW
* **Notas de QA:** *Sin observaciones adicionales*

### Módulo 8B — Store Readiness

#### Store Readiness Panel abre [✅ PASSED]
* **Descripción:** Hacer clic sobre "Verificar Store Readiness" en el panel de preferencias avanzadas.
* **Resultado Esperado:** Abre de forma fluida el gran centro de empaquetado y textos para Google Play.
* **Prioridad/Severidad:** HIGH
* **Notas de QA:** *Sin observaciones adicionales*

#### Store Listing Draft existe [✅ PASSED]
* **Descripción:** Verificar el borrador de descripción corta, larga y slogan preparado para copiar.
* **Resultado Esperado:** Los campos son interactivos y permiten copiar los contenidos para Play Console de un clic.
* **Prioridad/Severidad:** MEDIUM
* **Notas de QA:** *Sin observaciones adicionales*

#### Claims Guard existe [✅ PASSED]
* **Descripción:** Confirmar la visualización explícita de las declaraciones permitidas y denegadas.
* **Resultado Esperado:** Previene prometer alertas oficiales o exactitud matemática mediante un panel de advertencia visible.
* **Prioridad/Severidad:** CRITICAL
* **Notas de QA:** *Sin observaciones adicionales*

#### Privacy Package existe [✅ PASSED]
* **Descripción:** Revisar el generador de la política de privacidad borrador.
* **Resultado Esperado:** Contiene las cláusulas relativas al almacenamiento local en dispositivo y al uso transparente del GPS.
* **Prioridad/Severidad:** HIGH
* **Notas de QA:** *Sin observaciones adicionales*

#### Data Safety Draft existe [✅ PASSED]
* **Descripción:** Verificar el bloque de respuestas preparadas para los campos de ubicación, preferencias y memoria local.
* **Resultado Esperado:** Detalla cómo y cuándo se usan los datos locales para tranquilidad de los revisores.
* **Prioridad/Severidad:** HIGH
* **Notas de QA:** *Sin observaciones adicionales*

#### Permissions Inventory existe [✅ PASSED]
* **Descripción:** Confirmar que se listan y justifican todos los permisos del Manifest de Android (Internet, GPS, Notificaciones).
* **Resultado Esperado:** Justificación sólida de por qué no se usa "SCHEDULE_EXACT_ALARM" por defecto para evitar rechazos en Play Store.
* **Prioridad/Severidad:** HIGH
* **Notas de QA:** *Sin observaciones adicionales*

#### Screenshot Planner existe [✅ PASSED]
* **Descripción:** Comprobar el visor interactivo de capturas exigidas por las pautas de Google Play.
* **Resultado Esperado:** Contiene un itinerario detallado de 10 pantallas clave con sus textos descriptivos recomendados.
* **Prioridad/Severidad:** MEDIUM
* **Notas de QA:** *Sin observaciones adicionales*

#### Release Checklist existe [✅ PASSED]
* **Descripción:** Verificar el progreso del checklist interactivo de empaquetado.
* **Resultado Esperado:** Calcula dinámicamente el puntaje Readiness general en base a los puntos completados.
* **Prioridad/Severidad:** HIGH
* **Notas de QA:** *Sin observaciones adicionales*

#### Export Markdown funciona [✅ PASSED]
* **Descripción:** Pulsar "Descargar Paquete de Publicación Completo" en el panel.
* **Resultado Esperado:** Se descargan por separado los 5 archivos Markdown de políticas y listas requeridos.
* **Prioridad/Severidad:** MEDIUM
* **Notas de QA:** *Sin observaciones adicionales*

---

## 🔍 REGISTRO DE EVIDENCIA REGISTRADA
### 📄 Build de producción Web limpio
* **Tipo de Evidencia:** BUILD_LOG
* **Fecha de Registro:** 01-07-2026, 4:29:30 p. m.
* **Descripción/Evidencia:** La compilación del sitio web con "npm run build" finalizó con éxito en el contenedor de Cloud Run.

### 📄 Build de empaquetado Android limpio
* **Tipo de Evidencia:** BUILD_LOG
* **Fecha de Registro:** 01-07-2026, 4:29:30 p. m.
* **Descripción/Evidencia:** Los módulos se compilaron exitosamente a nivel web, listos para la inyección del bridge de Android nativo.


---
*Este reporte fue generado automáticamente por el QA Center Local de ORBI Clima IA de manera interna.*
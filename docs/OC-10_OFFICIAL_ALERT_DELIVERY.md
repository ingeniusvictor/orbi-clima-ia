# OC-10 — Official Alert Delivery & Notification Guardrails

## Objetivo

Entregar alertas territoriales oficiales SENAPRED a la capa de notificaciones de ORBI Clima IA sin mezclarlas con alertas modeladas SkyCore y sin degradar la integridad introducida en OC-09.

## Dos pipelines separados

ORBI mantiene dos flujos explícitos:

### SkyCore / modelo

`forecast + heurística ORBI -> SmartWeatherAlert -> weather_alerts / field_alerts`

Este flujo depende de:

- modo de datos meteorológicos;
- frescura del forecast;
- perfil activo;
- sensibilidad configurada;
- límites diarios y anti-spam.

### SENAPRED / autoridad

`ArcGIS oficial verificado -> OfficialAlertsResult -> official_senapred -> official_alerts`

Este flujo solo puede comenzar cuando OC-09 confirma una alerta oficial territorial.

## Regla de elegibilidad

No se construye ningún candidato de notificación oficial si:

- `hasVerifiedCoverage !== true`;
- no existen alertas coincidentes;
- la alerta no tiene `verifiedOfficial === true`;
- la autoridad no es `SENAPRED`.

Por tanto un estado `NO VERIFICABLE` nunca puede producir una notificación crítica ni una falsa notificación de ausencia de riesgo.

## Mapeo de severidad

- SENAPRED Roja / `extreme` -> `critical`;
- SENAPRED Amarilla / `warning` o `severe` -> `warning`;
- SENAPRED Temprana Preventiva / `watch` -> `watch`;
- `info` no se entrega automáticamente.

## Canal Android independiente

OC-10 crea:

`orbi_official_alerts`

Nombre visible:

`Alertas oficiales SENAPRED`

Características:

- importancia máxima;
- visible públicamente;
- vibración habilitada;
- completamente separado de `orbi_weather_alerts`, `orbi_field_alerts` y `orbi_system_status`.

## Evento interno

Cada consulta terminada de `fetchOfficialWeatherAlerts()` publica:

`orbi-official-alerts-updated`

El evento contiene el `OfficialAlertsResult` completo.

El bridge de notificaciones se registra una sola vez durante `initializeOrbiNotificationChannels()` y funciona también en Web Preview para QA.

## Deduplicación persistente

Cada alerta oficial genera un `dedupKey` estable compuesto por:

- autoridad SENAPRED;
- nivel;
- causalidad/evento;
- región;
- territorio/comuna;
- fecha de inicio.

El identificador volátil de la capa ArcGIS no define la deduplicación.

Si el mismo `dedupKey` ya existe en el historial de notificaciones, no se vuelve a entregar.

Esto es más estricto que el cooldown de 90 minutos de alertas modeladas.

## Escalamiento

El nivel forma parte del `dedupKey`.

Por ello una alerta Amarilla ya entregada no bloquea una posterior Roja para el mismo evento y territorio.

Una escalada oficial genera una nueva clave y queda habilitada para entrega inmediata.

## Múltiples alertas simultáneas

El builder conserva todos los candidatos oficiales elegibles, ordenados por severidad.

El bridge entrega como máximo una alerta oficial nueva por ciclo de refresh y salta cualquier clave ya entregada o actualmente en vuelo.

En refreshes posteriores puede entregar otra alerta oficial distinta sin repetir la anterior.

## Protección contra carreras

Existe un `Set` de `dedupKey` en vuelo.

Esto evita que dos eventos concurrentes del mismo refresh programen dos veces la misma alerta antes de que el historial haya sido persistido.

## Separación de frescura meteorológica

Una alerta SENAPRED verificada NO depende de:

- `orbi_weather_source_state`;
- Open-Meteo Best Match;
- edad del cache meteorológico;
- modo cached del forecast.

Su fuente de verdad es el propio feed oficial verificado por OC-09.

En cambio, las alertas SkyCore conservan todas las guardas anteriores.

## Quiet Hours

Quiet Hours sigue aplicándose como preferencia de usuario.

OC-10 no copia alertas oficiales bloqueadas por Quiet Hours a la cola legacy `skycore_scheduler`, porque esa cola no conserva identidad de autoridad/origen.

Si una alerta oficial continúa activa, puede volver a evaluarse en un refresh posterior.

Las alertas críticas pueden atravesar Quiet Hours únicamente según la configuración existente `allowCritical`.

## Límites de frecuencia

Las alertas oficiales SENAPRED distintas están exentas de:

- máximo Person por día;
- máximo Field Tech por día;
- intervalo mínimo entre alertas modeladas;
- cooldown de categorías SkyCore.

La protección anti-spam para autoridad es el `dedupKey` persistente.

Esto evita que una alerta Roja nueva sea bloqueada porque el usuario ya recibió varias recomendaciones meteorológicas modeladas durante el día.

## Historial

`OrbiNotificationHistoryItem` admite ahora `source` opcional para mantener compatibilidad con registros antiguos.

Nuevos valores de fuente:

- `skycore_alert`;
- `official_senapred`.

El canal nuevo es:

- `official_alerts`.

## Modos demo/fallback

`WeatherIntelligencePanel` no consulta la capa premium oficial cuando el provider está en mock o fallback.

Además el builder exige cobertura oficial verificada, por lo que una alerta oficial no se puede fabricar desde datos demo.

## Web Preview

El bridge se inicializa también fuera de Android.

Cuando existe permiso en el entorno de prueba, la entrega se refleja por el evento existente `orbi-web-notification`, permitiendo validar:

- título;
- cuerpo;
- severidad;
- canal;
- source;
- dedup.

## Limitaciones actuales

- La app debe ejecutar un refresh oficial para detectar una alerta nueva; OC-10 no implementa todavía un worker Android autónomo de background polling.
- DMC Avisos/Alertas/Alarmas sigue fuera de este pipeline hasta validar su feed automático específico.
- La cola diferida legacy aún es SkyCore-only; por diseño OC-10 no degrada una alerta oficial para hacerla compatible con esa estructura.

## Validación

OC-10 debe cerrar con:

- TypeScript GREEN;
- build de producción GREEN;
- PR gate GREEN;
- diff sin archivos protegidos de Golden Orb.

## Protección visual

OC-10 no modifica:

- `OrbiClimateCore.tsx`;
- `WelcomeHeroSection.tsx`;
- `skycore-fx.css`;
- Golden Orb;
- aros;
- partículas;
- halos;
- glow;
- deformación líquida.

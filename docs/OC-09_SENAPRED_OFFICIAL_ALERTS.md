# OC-09 — SENAPRED Official Alerts

## Objetivo

Integrar alertas meteorológicas territoriales oficiales de SENAPRED sin convertir inferencias de ORBI, HydroWatch o pronósticos modelados en una alerta de autoridad.

## Fuente oficial integrada

OC-09 consume las capas públicas ArcGIS FeatureServer utilizadas por el dashboard oficial de SENAPRED para alertas meteorológicas.

Niveles tratados:

- Alerta Temprana Preventiva;
- Alerta Amarilla;
- Alerta Roja.

La coincidencia se calcula por intersección geoespacial entre la ubicación consultada y los polígonos oficiales publicados por SENAPRED.

## Regla de integridad principal

ORBI solo muestra `ALERTA OFICIAL · SENAPRED` cuando la ubicación intersecta un polígono oficial devuelto por la fuente machine-readable.

ORBI NO genera una alerta oficial a partir de:

- HydroWatch;
- lluvia prevista;
- GloFAS;
- consenso multi-modelo;
- score de riesgo propio;
- coincidencia de nombre de región o ciudad;
- proximidad a una alerta cercana.

## Descubrimiento defensivo de capas

El servicio ya no depende únicamente de tres nombres rígidos.

Antes de consultar alertas:

1. consulta el directorio ArcGIS oficial;
2. busca primero las capas canónicas `METEOROLOGICAS_VERDE`, `METEOROLOGICAS_AMARILLA` y `METEOROLOGICAS_ROJA`;
3. si una capa canónica no existe, acepta solo snapshots fechados recientes del mismo nivel;
4. los snapshots fechados deben tener como máximo 21 días de antigüedad;
5. se toleran hasta 2 días hacia el futuro por diferencias de publicación/nomenclatura;
6. si el directorio no está disponible, se intenta fallback a las rutas canónicas.

El modo utilizado queda expuesto como:

- `directory`;
- `canonical_fallback`.

## Consulta territorial

Cada capa se consulta usando:

- `geometryType=esriGeometryPoint`;
- coordenadas de la ubicación activa;
- `inSR=4326`;
- `spatialRel=esriSpatialRelIntersects`;
- `returnGeometry=false`.

Los campos relevantes son:

- `FID`;
- `CUT_REG`;
- `CUT_PROV`;
- `CUT_COM`;
- `REGION`;
- `PROVINCIA`;
- `COMUNA`;
- `TIPO_ALERT`;
- `CAUSALIDAD`;
- `FECHA_INI`.

## Normalización

`TIPO_ALERT` es la fuente primaria para determinar el nivel. El nombre de la capa funciona como respaldo.

Se normalizan los niveles a:

- `temprana_preventiva`;
- `amarilla`;
- `roja`.

Las alertas se deduplican por nivel, causalidad, región, comuna y fecha de inicio.

## Protección frente a datos antiguos

Se aplican límites conservadores de antigüedad a `FECHA_INI` para evitar presentar residuos históricos como alertas vigentes:

- Roja: 60 días;
- Amarilla: 120 días;
- Temprana Preventiva: 365 días.

Una fecha no parseable no se descarta automáticamente; se conserva para no eliminar una alerta real por un cambio de formato.

## Estados de cobertura

OC-09 diferencia claramente:

### Feed verificado

Al menos una capa meteorológica oficial respondió correctamente y la cobertura pudo comprobarse.

Si no existe intersección, ORBI puede mostrar:

`Sin alerta meteorológica SENAPRED coincidente en el punto consultado.`

### Cobertura parcial

Existe cobertura oficial verificada, pero una o más capas fallaron.

ORBI muestra las alertas oficiales confirmadas y advierte que la cobertura es parcial.

### No verificable

No pudo verificarse ninguna capa válida.

En este caso ORBI NO traduce un array vacío como “sin alertas”. Muestra que el estado oficial no pudo confirmarse.

## Separación DMC / SENAPRED

DMC/MeteoChile ya está integrada como fuente observacional oficial mediante WIS2/SYNOP.

OC-09 mantiene separado el feed de Avisos/Alertas/Alarmas DMC porque todavía no se ha validado una fuente automática definitiva para esa función.

Por tanto:

- DMC: observación meteorológica oficial;
- SENAPRED: alerta territorial oficial de protección civil;
- HydroWatch: inferencia propia de riesgo, nunca alerta oficial.

## UI

Se incorpora `OfficialAlertsCard` al inicio de `WeatherIntelligencePanel`.

La tarjeta distingue visualmente:

- alerta oficial activa;
- feed verificado sin alerta coincidente;
- cobertura parcial;
- estado no verificable.

Cuando existe una alerta oficial, muestra:

- autoridad;
- nivel;
- causalidad;
- territorio;
- fecha de inicio;
- enlace público SENAPRED.

## Integración con HydroWatch

HydroWatch permanece independiente.

Su tarjeta ahora diferencia tres situaciones:

1. existe alerta SENAPRED coincidente → prevalece la información oficial;
2. SENAPRED fue verificado pero no hay alerta → HydroWatch sigue siendo solo señal modelada;
3. SENAPRED no pudo verificarse → ORBI no afirma ausencia de alertas.

## Disponibilidad y fallos

Cada consulta tiene timeout propio.

Errores 400/404 de una capa se interpretan como capa inactiva/no disponible, no como fallo global automático.

Si una o más capas responden correctamente y otras fallan, el resultado se marca como parcial.

Si ninguna puede verificarse, el sistema entra en estado `unavailable` y evita una falsa sensación de seguridad.

## Validación

La rama OC-09 debe cerrar con:

- TypeScript GREEN;
- build de producción GREEN;
- diff sin cambios en la Golden Orb.

## Protección visual

OC-09 no modifica:

- `OrbiClimateCore.tsx`;
- `WelcomeHeroSection.tsx`;
- `skycore-fx.css`;
- Golden Orb;
- aros;
- partículas;
- halos;
- glow;
- deformación líquida.

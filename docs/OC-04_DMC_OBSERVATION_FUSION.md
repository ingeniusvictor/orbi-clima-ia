# OC-04 — DMC Official Observation Fusion

## Objetivo

Incorporar una fuente observacional oficial e independiente al núcleo meteorológico de ORBI Clima IA para comparar lo que el modelo estima con lo que una estación chilena realmente reporta.

OC-04 no reemplaza el forecast por una estación. Añade una capa de verificación observacional con procedencia explícita.

## Fuente oficial

La Dirección Meteorológica de Chile publica observaciones meteorológicas a través de su infraestructura WIS2 / OGC API.

ORBI utiliza:

- catálogo de estaciones DMC;
- colección SYNOP horaria `urn:wmo:md:cl-meteochile:synop-onehours`;
- identificadores WIGOS para conservar la procedencia de la estación y del reporte.

Esta fuente es distinta de los modelos de Open-Meteo usados por el forecast principal. Por tanto, por primera vez ORBI puede contrastar modelo versus observación real sin fabricar proveedores ni offsets sintéticos.

## Búsqueda de estación

`dmcObservationService.ts` busca estaciones operacionales con observaciones SYNOP alrededor de la ubicación consultada.

Radios progresivos:

1. 30 km;
2. 75 km;
3. 150 km.

Los candidatos se ordenan por distancia Haversine y se selecciona el más cercano compatible.

La distancia se conserva y se muestra al usuario. ORBI no oculta que una estación puede estar lejos de la ubicación GPS.

## Variables observadas

Cuando están presentes en el reporte SYNOP más reciente, ORBI consume:

- temperatura del aire;
- punto de rocío;
- humedad relativa;
- velocidad y dirección del viento;
- presión reducida al nivel del mar / presión disponible;
- visibilidad horizontal;
- precipitación reciente;
- precipitación de 24 horas cuando la estación la publica;
- nubosidad;
- tiempo presente WMO.

El tiempo presente se traduce a etiquetas de producto como:

- llovizna observada;
- lluvia observada;
- chubasco observado;
- tormenta observada;
- nieve observada;
- niebla/neblina observada.

## Calidad de la referencia observacional

La estación se clasifica como:

- **strong**: <=25 km y <=90 minutos de antigüedad;
- **contextual**: <=75 km y <=120 minutos;
- **distant**: fuera de esos rangos espaciales;
- **stale**: reporte >150 minutos.

Esta clasificación no afirma que una estación cercana represente exactamente el microclima GPS.

## Comparación estación vs modelo

`compareDmcObservationToModel()` compara, cuando hay datos compatibles:

- delta de temperatura;
- delta de humedad;
- delta de viento;
- delta de presión;
- señal húmeda/seca de precipitación.

El resultado se expresa como concordancia:

- alta;
- parcial;
- divergente;
- comparación parcial/no disponible.

### Regla crítica

El puntaje de concordancia **no es una medida de exactitud absoluta**.

Una diferencia entre estación y modelo puede deberse a:

- distancia;
- altitud;
- topografía;
- exposición al viento;
- isla de calor urbana;
- costa/interior;
- horario del reporte;
- variabilidad real a microescala.

Por eso OC-04 no sobrescribe automáticamente `CurrentWeather` con la estación DMC.

## Caso llovizna vs lluvia

OC-01 corrigió la semántica WMO del modelo. OC-04 añade ahora una señal observacional independiente.

Ejemplo:

- modelo ORBI: precipitación débil / lluvia;
- estación DMC cercana: `present_weather = drizzle`;

La interfaz puede mostrar que la estación oficial reporta **Llovizna observada** y que existe divergencia con el modelo, en lugar de presentar una falsa certeza microclimática.

## Open-Meteo 15 minutos

ORBI no presentará `minutely_15` de Open-Meteo como un nowcast real en Chile cuando esos valores provienen de interpolación horaria fuera de las regiones con modelos nativos de 15 minutos.

Interpolar a 15 minutos no crea nueva información meteorológica y no debe comercializarse como mayor precisión microclimática.

## Tolerancia a fallos

La capa DMC es auxiliar y no bloqueante:

- si WIS2 no responde;
- si CORS/red impide la consulta;
- si no existe estación cercana;
- si no hay reporte reciente;

el forecast principal continúa funcionando normalmente.

En pruebas Android reales se debe verificar expresamente comportamiento de red/CORS de WIS2 desde WebView/Capacitor.

## UI

`DmcObservationCard.tsx` muestra:

- nombre de estación;
- WIGOS;
- distancia;
- antigüedad del reporte;
- calidad de referencia;
- tiempo presente oficial;
- variables observadas;
- diferencias estación-modelo;
- concordancia y limitaciones.

La tarjeta se ubica al inicio de `ORBI Weather Intelligence` porque una observación oficial reciente aporta contexto directo sobre el estado actual.

## Protección visual

OC-04 no modifica:

- `OrbiClimateCore.tsx`;
- `WelcomeHeroSection.tsx`;
- `skycore-fx.css`;
- aros;
- partículas;
- halos;
- glow;
- deformación líquida;
- layout de la Golden Orb.

## Próximo paso recomendado

OC-05 debe convertir estas observaciones en un sistema de calidad meteorológica medible a largo plazo:

- historial estación-modelo;
- MAE de temperatura;
- error de humedad y viento;
- skill de detección de precipitación;
- estabilidad por ubicación/estación;
- selección o ponderación de modelos basada en rendimiento observado real.

Ese sistema reemplazará definitivamente cualquier etiqueta antigua de “Calidad Excelente” que no estuviera respaldada por métricas observadas.

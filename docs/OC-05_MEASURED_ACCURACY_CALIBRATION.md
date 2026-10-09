# OC-05 — Measured Accuracy & Local Calibration

## Objetivo

Eliminar cualquier score de “calidad” o “confianza” que no esté respaldado por observaciones reales y construir un historial local medible de desempeño modelo vs estación oficial DMC.

## Problema anterior

La versión original podía mostrar una confianza alta o una calidad “Excelente/Aceptable” por el simple hecho de recibir una respuesta live de Open-Meteo.

Una API disponible no demuestra precisión meteorológica.

OC-05 separa definitivamente:

1. **procedencia/frescura de la fuente**;
2. **desempeño observado histórico**.

## Historial de verificación

`weatherVerificationService.ts` conserva localmente muestras DMC vs modelo.

Una muestra solo puede entrar al historial cuando:

- la observación DMC está fresca;
- la estación se encuentra como máximo a 75 km;
- el reporte no está marcado como stale;
- la observación y el `CurrentWeather` modelado tienen una separación temporal <=150 minutos;
- la combinación ubicación + estación + reportTime no existe previamente.

Esto evita inflar el historial refrescando varias veces el mismo reporte SYNOP.

## Ponderación

Cada muestra recibe un peso por:

- distancia a la estación;
- antigüedad de la observación;
- diferencia temporal estación-modelo.

Una estación muy cercana y un reporte reciente pesan más que una referencia regional lejana.

## Métricas observadas

Cuando existen variables comparables, ORBI calcula:

- MAE de temperatura (°C);
- MAE de humedad (puntos porcentuales);
- MAE de viento (km/h);
- MAE de presión (hPa);
- acierto de detección húmedo/seco para precipitación.

El historial se conserva hasta 45 días y un máximo de 180 muestras locales.

## Niveles de evidencia

### Insufficient

Menos de 5 muestras válidas o peso efectivo insuficiente.

Comportamiento de producto:

- muestra `Sin calibrar`;
- no muestra score de desempeño;
- no permite afirmar alta confianza local.

### Emerging

Al menos 5 muestras y peso efectivo mínimo.

Comportamiento:

- comienza a mostrar métricas;
- el score queda limitado mientras la evidencia sigue en formación.

### Established

Al menos 15 muestras y peso efectivo >=10.

Comportamiento:

- la evaluación local tiene evidencia suficiente para catalogarse como estable;
- sigue siendo desempeño histórico, nunca garantía de pronóstico futuro.

## Score de desempeño observado

El score solo existe si hay evidencia suficiente.

Se deriva de errores observados y skill de precipitación. No se deriva de:

- que la API esté online;
- GPS activo;
- número de providers declarados;
- offsets simulados;
- disponibilidad de internet por sí sola.

Bandas internas:

- sólido;
- aceptable;
- variable;
- débil;
- sin calificar.

El producto evita llamar a este número “precisión garantizada”.

## SkyCore Trust 2.0

`SkyCoreTrustCard.tsx` pasa a llamarse visualmente **Evidencia Meteorológica SkyCore™**.

Muestra:

- fuentes activas;
- estado live/cache/fallback/demo;
- nivel de evidencia local;
- score solo cuando existe evidencia;
- MAE observados;
- acierto de precipitación;
- número de muestras;
- distancia mediana de estación;
- explicación metodológica.

`Calidad: Excelente` deja de ser una afirmación automática.

## DMC como provider activo

`skyCoreSourceTrustService.ts` actualiza DMC de `stub` a `active` porque OC-04 implementó la integración real WIS2/SYNOP.

La atribución activa distingue:

- Open-Meteo: forecast modelado;
- DMC/MeteoChile: observación oficial.

## Persistencia y privacidad

El historial de calibración se guarda en `localStorage` del dispositivo/aplicación.

No se requiere una cuenta ni enviar ese historial a un backend para calcular las métricas locales.

## Limitaciones

- Una estación DMC no es el microclima GPS exacto.
- La elevación y topografía pueden explicar diferencias legítimas.
- El error histórico no garantiza el próximo evento.
- La precipitación es especialmente espacial y puede variar fuertemente entre estación y usuario.
- Un score alto nunca reemplaza alertas oficiales, observación física ni instrumentos certificados.

## Protección visual

OC-05 no modifica:

- `OrbiClimateCore.tsx`;
- `WelcomeHeroSection.tsx`;
- `skycore-fx.css`;
- la Golden Orb, sus aros, partículas, halos, glow o deformación líquida.

## Próximo paso

Una vez acumulado historial real, ORBI podrá evaluar diferentes modelos meteorológicos por ubicación y seleccionar/ponderar el que demuestre mejor desempeño observado, en lugar de asumir que un único modelo es siempre el mejor.

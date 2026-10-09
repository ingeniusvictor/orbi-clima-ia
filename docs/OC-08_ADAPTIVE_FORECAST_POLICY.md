# OC-08 — Adaptive Forecast Policy

## Objetivo

Permitir que ORBI Clima IA utilice un modelo meteorológico específico cuando ese modelo haya demostrado prospectivamente mejor desempeño local, sin abandonar las salvaguardas de Open-Meteo Best Match cuando la evidencia aún no sea suficiente.

OC-08 es la primera fase que puede influir en el forecast principal a partir del aprendizaje local de OC-07.

## Principio

La selección adaptativa NO se activa porque:

- un modelo coincida mejor “ahora”;
- un modelo gane una sola vez;
- exista consenso entre modelos;
- el nombre del modelo sea considerado prestigioso;
- una API esté disponible.

Solo se activa con **skill prospectivo observado**.

## Política por defecto

La política por defecto siempre es:

**Open-Meteo Best Match**

Best Match permanece activo mientras cualquier safeguard adaptativo no se cumpla.

## Condiciones para seleccionar un modelo adaptativo

Todas deben cumplirse simultáneamente:

1. el ranking OC-07 debe estar en estado `established`;
2. el líder debe tener evidencia `established`;
3. deben existir al menos dos modelos con skill comparable;
4. el líder debe tener como mínimo 4 verificaciones en cada horizonte:
   - +1 h;
   - +3 h;
   - +6 h;
5. la distancia mediana de estación del líder debe ser <=50 km;
6. el skill del líder debe ser >=72/100;
7. la ventaja frente al segundo modelo debe ser >=6 puntos.

Si falla cualquiera de estas condiciones, ORBI mantiene Best Match.

## Razones explícitas de no activación

La política registra una causa machine-readable:

- `insufficient_evidence`;
- `insufficient_model_count`;
- `leader_not_established`;
- `lead_coverage_incomplete`;
- `station_too_distant`;
- `skill_below_threshold`;
- `margin_too_small`;
- `adaptive_selected`.

La UI muestra una explicación humana equivalente.

## Ejecución en el cliente meteorológico

`openMeteoClient.ts` resuelve la política justo antes de cada forecast.

### Best Match

Si la política no habilita selección adaptativa, la consulta se realiza sin parámetro explícito `models` y Open-Meteo conserva su lógica Best Match.

### Modelo adaptativo

Si la política se habilita, ORBI añade:

`models=<selectedModelId>`

al forecast principal.

El modelo seleccionado solo puede provenir de resultados prospectivamente verificados por OC-07.

## Fallback obligatorio

Una selección adaptativa nunca puede dejar la aplicación sin forecast.

Si la consulta al modelo seleccionado falla:

1. ORBI registra el fallo;
2. repite la consulta inmediatamente con Best Match;
3. conserva el resultado Best Match como forecast operativo;
4. expone que se utilizó fallback.

Esto evita que una política aprendida degrade disponibilidad.

## Runtime trace

Cada refresh meteorológico registra localmente:

- hora de solicitud;
- coordenadas;
- política solicitada;
- modelo solicitado;
- modo realmente utilizado;
- modelo realmente utilizado;
- si hubo fallback;
- causa del fallback;
- razón de la decisión de política.

Storage key:

`orbi_adaptive_forecast_runtime_v1`

La traza también se publica mediante evento interno para que la interfaz pueda actualizarse sin acoplar App.tsx a la lógica adaptativa.

## Adaptive Forecast Policy Card

La tarjeta muestra:

- `BEST MATCH` o `ADAPTATIVO`;
- modelo seleccionado;
- causa de la decisión;
- evidencia disponible;
- skill mínimo;
- margen mínimo;
- muestras mínimas por horizonte;
- distancia máxima mediana de estación;
- modelo usado realmente en el último refresh;
- fallback, si ocurrió.

## Separación con otros scores

### Multi-model agreement — OC-06

Mide cuánto coinciden los modelos entre sí.

No activa por sí solo selección adaptativa.

### Forecast skill — OC-07

Mide qué tan bien pronosticó cada modelo antes del evento frente a DMC después del evento.

Es la evidencia principal para OC-08.

### DMC current comparison — OC-04/OC-05

Mide concordancia del estado actual y desempeño histórico general del forecast principal.

No sustituye la verificación prospectiva por modelo.

## Anti-overfitting

OC-08 exige una ventaja mínima de 6 puntos frente al segundo modelo.

Esto evita cambiar de modelo por pequeñas diferencias que pueden ser ruido estadístico.

La exigencia de muestras en los tres horizontes evita elegir un modelo que solo haya funcionado en +1 h pero no tenga evidencia a +3/+6 h.

## Comportamiento inicial

En una instalación nueva, la política permanecerá en Best Match.

Esto es esperado: OC-07 necesita acumular verificaciones reales antes de habilitar una selección adaptativa responsable.

## Limitaciones

- la estación DMC sigue siendo una referencia espacial, no el GPS exacto;
- el skill puede cambiar por estación del año o régimen meteorológico;
- los modelos evolucionan y cambian de versión;
- una política estable hoy no garantiza permanencia indefinida;
- la selección adaptativa no reemplaza observaciones oficiales ni alertas.

Una fase futura puede introducir decaimiento temporal, segmentación estacional y detección de drift antes de mantener una selección durante periodos largos.

## Protección visual

OC-08 no modifica:

- `OrbiClimateCore.tsx`;
- `WelcomeHeroSection.tsx`;
- `skycore-fx.css`;
- Golden Orb, aros, partículas, halos, glow o deformación líquida.

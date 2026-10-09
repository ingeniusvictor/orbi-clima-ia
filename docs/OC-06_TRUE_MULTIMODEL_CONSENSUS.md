# OC-06 — True Multi-Model Forecast Consensus

## Objetivo

Reemplazar definitivamente cualquier idea de “multi-source” sintético por una comparación real entre modelos meteorológicos determinísticos de instituciones diferentes.

OC-06 no intenta decidir arbitrariamente qué modelo es “el mejor”. Primero mide acuerdo y desacuerdo entre modelos. La selección adaptativa por desempeño observado se reserva para una fase posterior, cuando exista evidencia histórica de forecasts emitidos versus observaciones DMC posteriores.

## Modelos consultados

ORBI consulta explícitamente cuatro modelos globales mediante Open-Meteo:

- `ecmwf_ifs025` — ECMWF IFS 0.25°;
- `ncep_gfs_seamless` — NOAA/NCEP GFS;
- `icon_seamless` — DWD ICON;
- `bom_access_global` — Bureau of Meteorology Australia ACCESS-G.

Estos modelos provienen de sistemas de predicción distintos. No son offsets ni perturbaciones inventadas sobre una sola serie.

## Variables comparadas

Para las próximas horas se comparan:

- temperatura a 2 m;
- precipitación;
- código meteorológico WMO;
- viento a 10 m.

Por modelo se deriva:

- temperatura actual modelada;
- viento actual modelado;
- grupo de condición actual;
- precipitación acumulada próximas 3 h;
- precipitación acumulada próximas 6 h;
- viento máximo próximas 6 h;
- temperatura mínima/máxima próximas 6 h.

## Consenso de precipitación

Los modelos emiten un voto húmedo/seco para las próximas 3 horas.

Un modelo se considera “húmedo” cuando acumula al menos 0,2 mm en esa ventana. El resultado se expresa como:

- consenso húmedo;
- consenso seco;
- consenso mixto;
- comparación no disponible.

La interfaz muestra el conteo, por ejemplo `3/4 modelos prevén precipitación`.

## Spread multi-modelo

ORBI calcula la diferencia entre máximo y mínimo entre modelos disponibles para:

- temperatura actual;
- precipitación acumulada 6 h;
- viento actual.

También considera cuántos grupos meteorológicos diferentes aparecen simultáneamente entre los modelos.

## Índice de acuerdo

El índice 0–100 de OC-06 mide únicamente **acuerdo entre modelos**.

Penaliza:

- spread de temperatura;
- spread de precipitación;
- spread de viento;
- desacuerdo húmedo/seco;
- diversidad de grupos meteorológicos.

Bandas:

- acuerdo alto;
- acuerdo moderado;
- acuerdo bajo;
- comparación insuficiente.

### Regla de integridad

Un acuerdo alto NO significa que el pronóstico sea correcto.

Cuatro modelos pueden coincidir y aun así fallar en un evento local. Por eso este índice nunca debe presentarse como “precisión” o “probabilidad de acierto”.

La precisión observada continúa siendo responsabilidad de OC-05 mediante comparación con estaciones DMC.

## Diferencia entre OC-02, OC-05 y OC-06

### OC-02 — Ensemble

Mide dispersión entre miembros de un mismo sistema ensemble (DWD ICON EPS).

Pregunta que responde:

> ¿Cuánto varían los escenarios probabilísticos dentro de ese ensemble?

### OC-05 — Verificación observada

Mide historial modelo versus observaciones DMC reales.

Pregunta que responde:

> ¿Cómo se ha comportado el forecast frente a observaciones reales en esta ubicación durante el historial disponible?

### OC-06 — Multi-modelo determinístico

Compara modelos globales independientes.

Pregunta que responde:

> ¿Los grandes modelos determinísticos están contando una historia meteorológica parecida o están divergiendo?

Las tres señales son complementarias y no deben mezclarse en un único número sin semántica clara.

## UI

`MultiModelConsensusCard.tsx` muestra:

- modelos disponibles / solicitados;
- índice de acuerdo;
- spread de temperatura, precipitación y viento;
- votos de precipitación;
- fila por modelo con institución, condición, temperatura y lluvia 6 h;
- explicación de limitaciones.

Se integra en `WeatherIntelligencePanel` después de la observación oficial DMC, para mantener una jerarquía clara:

1. observación real;
2. consenso determinístico;
3. calidad del aire;
4. ensemble probabilístico;
5. microclima modelado;
6. HydroWatch.

## Tolerancia a fallos

La capa multi-modelo es auxiliar y no bloqueante.

Si la consulta falla o solo uno de los modelos responde:

- el forecast principal sigue operativo;
- el consenso se oculta o declara insuficiente;
- ORBI no inventa valores de modelos ausentes.

## Limitación actual

OC-06 no almacena aún cada forecast por modelo con su tiempo válido para evaluarlo horas después contra DMC.

Por eso ORBI todavía no debe afirmar:

- “ECMWF es el mejor para Osorno”;
- “ICON es el más preciso en Rancagua”;
- “GFS tiene 92% de precisión”.

Esas conclusiones requieren un historial de verificación prospectiva por modelo.

## Próxima fase

**OC-07 — Per-Model Forecast Verification & Adaptive Selection**

Debe:

- guardar forecasts emitidos por modelo para +1 h / +3 h / +6 h;
- esperar el tiempo válido;
- emparejarlos con observaciones DMC posteriores;
- calcular MAE y skill de precipitación por modelo y ubicación;
- exigir una cantidad mínima de muestras;
- solo entonces ordenar o ponderar modelos por desempeño observado.

## Protección visual

OC-06 no modifica:

- `OrbiClimateCore.tsx`;
- `WelcomeHeroSection.tsx`;
- `skycore-fx.css`;
- Golden Orb, aros, partículas, halos, glow o deformación líquida.

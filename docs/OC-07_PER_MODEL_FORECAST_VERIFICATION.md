# OC-07 — Per-Model Forecast Verification

## Objetivo

Medir prospectivamente el desempeño de ECMWF, GFS, ICON y ACCESS-G en cada ubicación ORBI.

La regla fundamental es:

> **predice primero, observa después, mide el error.**

OC-07 no compara un modelo con el clima actual para declararlo ganador. Guarda forecasts antes de que ocurra el evento y solo los califica cuando posteriormente aparece una observación oficial DMC compatible con la hora válida.

## Flujo

1. OC-06 obtiene los cuatro modelos determinísticos reales.
2. Para cada modelo OC-07 congela targets a:
   - +1 h;
   - +3 h;
   - +6 h.
3. El target conserva:
   - modelo/proveedor;
   - hora de emisión;
   - hora válida local y epoch absoluto;
   - temperatura prevista;
   - viento previsto;
   - precipitación prevista;
   - weather code WMO;
   - grupo meteorológico;
   - señal prevista húmedo/seco.
4. El forecast queda `pending` y no puede reescribirse por una actualización posterior para esa misma combinación ubicación/modelo/lead/hora válida.
5. Cuando llega una observación DMC posterior, ORBI busca targets cuya hora válida esté dentro de ±50 minutos del reportTime oficial.
6. Solo entonces el registro pasa a `verified` y se calculan errores.

## Criterios de observación válida

Una observación DMC solo puede verificar forecasts si:

- es fresca;
- no está marcada como stale;
- la estación está a <=75 km;
- existe una hora oficial de reporte válida.

Si no se obtiene una observación compatible, el forecast no recibe score.

Un forecast pendiente que excede ampliamente su ventana sin observación compatible pasa a `expired`.

### Regla anti-sesgo

Un forecast expirado no se rellena posteriormente con observaciones convenientes.

Esto evita backfilling retrospectivo y protege la integridad del ranking.

## Variables verificadas

### Temperatura

Error absoluto por forecast:

`|temperatura prevista - temperatura observada DMC|`

Se resume como MAE ponderado.

### Viento

Error absoluto de velocidad de viento en km/h, resumido como MAE ponderado.

### Precipitación

Se verifica la clasificación húmedo/seco cuando ambas señales son comparables.

La observación se considera húmeda cuando DMC reporta precipitación cuantificada o un present weather compatible con:

- llovizna;
- lluvia;
- chubasco;
- tormenta;
- nieve.

El forecast se considera húmedo a partir de precipitación horaria modelada o weather code húmedo.

## Peso de las verificaciones

Cada muestra se pondera por:

- distancia de la estación;
- antigüedad de la observación;
- horizonte de forecast.

Los targets +1 h pesan ligeramente más que +3 h y +6 h, sin impedir que los tres horizontes participen.

## Evidencia por modelo

### Insufficient

Menos de 8 forecasts verificados o peso efectivo insuficiente.

No existe score de skill.

### Emerging

Al menos 8 forecasts verificados y peso efectivo >=5.

Se permite un score provisional, limitado mientras la evidencia está en formación.

### Established

Al menos 24 forecasts verificados y peso efectivo >=16.

El modelo puede participar en un ranking observado estable.

## Skill por modelo

El score combina, cuando existen:

- MAE de temperatura;
- MAE de viento;
- precisión húmedo/seco de precipitación.

Bandas:

- skill observado sólido;
- aceptable;
- variable;
- débil;
- sin calificar.

El score representa desempeño histórico observado para la ubicación, estación y horizonte muestreados. No garantiza el siguiente evento.

## Ranking

ORBI solo muestra ranking cuando al menos dos modelos tienen evidencia comparable.

Estados:

- `calibrating` — no existe ranking responsable todavía;
- `provisional` — al menos dos modelos tienen evidencia emerging;
- `established` — al menos dos modelos alcanzan evidencia established.

Aunque exista ranking, OC-07 **no modifica todavía el forecast principal**.

La selección adaptativa requiere una fase posterior con salvaguardas adicionales.

## Persistencia

`modelForecastVerificationService.ts` conserva localmente:

- forecasts pending;
- forecasts verified;
- forecasts expired;
- errores observados;
- peso de verificación;
- procedencia DMC.

Retención:

- hasta 60 días;
- máximo 1200 registros.

No se necesita un backend para acumular el historial local.

## Forecast Skill Lab

`ModelForecastSkillCard.tsx` muestra:

- forecasts pendientes;
- forecasts verificados;
- skill por modelo;
- MAE temperatura;
- MAE viento;
- acierto de precipitación;
- muestras +1/+3/+6 h;
- peso efectivo;
- líder provisional/estable únicamente cuando corresponde.

## Mejora adicional de tiempo

OC-07 corrige la selección de hora del multi-modelo usando `utc_offset_seconds` de Open-Meteo.

Así, la serie horaria se alinea con la hora local de la ubicación consultada en vez de asumir que el reloj del dispositivo y el destino están en la misma zona horaria.

## Limitaciones

- Una estación DMC puede representar un microclima distinto al GPS.
- La verificación solo ocurre cuando ORBI obtiene una observación válida alrededor de la hora objetivo.
- Si la aplicación permanece cerrada y no dispone de ejecución de fondo, algunos targets pueden expirar sin muestra.
- La precipitación es espacialmente variable y el score húmedo/seco no sustituye un radar/local sensor.
- Los scores no son probabilidades de acierto futuro.

## Próximas fases recomendadas

### OC-08 — Adaptive Forecast Policy

Podrá utilizar el skill prospectivo para ponderar modelos únicamente cuando:

- exista evidencia established suficiente;
- la diferencia entre modelos sea material;
- existan salvaguardas de fallback;
- la selección sea visible y explicable al usuario.

### Android Background Verification

Para aumentar muestras sin exigir que la app permanezca abierta, una fase Android posterior puede programar refreshes de bajo consumo y cerrar targets pendientes en background, respetando límites de batería/WorkManager.

## Protección visual

OC-07 no modifica:

- `OrbiClimateCore.tsx`;
- `WelcomeHeroSection.tsx`;
- `skycore-fx.css`;
- Golden Orb, aros, partículas, halos, glow o deformación líquida.

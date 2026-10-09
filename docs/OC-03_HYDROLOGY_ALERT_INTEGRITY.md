# OC-03 — HydroWatch & Official Alert Integrity

## Objetivo

Añadir contexto hidrológico útil a ORBI Clima IA sin confundir una inferencia de modelos con una alerta oficial de emergencia.

## Arquitectura implementada

### 1. Contexto de precipitación

`openMeteoHydroPrecipService.ts` obtiene una ventana horaria que permite calcular:

- acumulado modelado 3/6/12/24 h anteriores;
- acumulado previsto 3/6/12/24 h;
- probabilidad máxima de precipitación en 6 h;
- pico horario previsto en 24 h.

Los valores históricos de esta capa son **contexto meteorológico modelado**. No deben presentarse como lectura de un pluviómetro local o estación certificada.

### 2. Contexto fluvial GloFAS

`openMeteoFloodService.ts` consulta Open-Meteo Flood API / GloFAS y deriva:

- caudal modelado actual;
- mediana y máximo recientes;
- pico previsto a 7 días;
- razón entre caudal actual/pico y mediana reciente;
- tendencia ascendente, estable o descendente.

Limitación crítica: el dato corresponde al río representado por la celda de aproximadamente 5 km. Puede no corresponder al cauce más cercano y no representa drenaje urbano, calles anegadas ni inundación repentina de pequeña escala.

### 3. HydroWatch ORBI

`hydrologicRiskEngine.ts` combina señales de lluvia e hidrología en un índice 0–100 con niveles:

- sin señal;
- bajo;
- medio;
- alto.

Este índice es siempre:

- `isOfficialAlert: false`;
- `isFlashFloodNowcast: false`.

No se permite convertir una inferencia de ORBI en una alerta de autoridad.

### 4. Alertas oficiales

`officialWeatherAlertsService.ts` define el contrato de integración para DMC/MeteoChile y SENAPRED, pero ambas fuentes permanecen `not_configured` hasta validar un feed machine-readable de alertas públicas vigentes con semántica, cobertura y actualización suficientemente confiables.

Hasta entonces, la interfaz muestra explícitamente:

**NO ES UNA ALERTA OFICIAL**

## Integración UI

`WeatherIntelligencePanel.tsx` carga en paralelo y de forma no bloqueante:

- calidad del aire;
- dispersión de ensemble;
- precipitación hidrológica;
- contexto GloFAS;
- estado de fuentes oficiales.

`HydrologicRiskCard.tsx` muestra HydroWatch, sus evidencias y limitaciones sin modificar la Golden Orb.

## Caso que motivó OC-03

En Osorno, una aplicación meteorológica del teléfono mostró “Riesgo de inundación repentina” mientras ORBI no presentaba una señal equivalente. OC-03 no intenta copiar esa alerta sin fuente verificable: agrega contexto hidrometeorológico real para que ORBI pueda elevar vigilancia cuando las señales lo justifican, manteniendo una frontera estricta entre riesgo inferido y alerta oficial.

## Política de producto

ORBI puede decir:

- “Riesgo hidrológico elevado · ORBI”;
- “Atención hidrológica · ORBI”;
- “Vigilancia hidrológica leve · ORBI”.

ORBI no puede decir:

- “Alerta oficial DMC”;
- “Alerta SENAPRED”;
- “Alerta de inundación repentina”; 

salvo que exista un evento recibido y validado desde un proveedor oficial configurado.

## Protección visual

OC-03 no modifica:

- `OrbiClimateCore.tsx`;
- `WelcomeHeroSection.tsx`;
- `skycore-fx.css`;
- aros, partículas, halos, glow, deformación líquida ni layout de la Golden Orb.

## Gate de aceptación

Antes de fusionar OC-03:

1. TypeScript debe pasar sin errores.
2. `vite build` debe pasar.
3. HydroWatch debe permanecer no bloqueante.
4. Ninguna inferencia modelada puede mostrarse como alerta oficial.
5. Los acumulados históricos deben identificarse como modelados.
6. La Golden Orb debe permanecer sin cambios.

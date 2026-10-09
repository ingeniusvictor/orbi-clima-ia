# OC-17 — Home Experience Simplification

## Objetivo
Reducir la saturación de información de la pestaña Inicio en Android sin eliminar capacidades ni modificar la Golden Orb.

## Problema observado en dispositivo
La pantalla Inicio mostraba de forma secuencial, y abierta por defecto, demasiadas capas: hero, pronóstico, Weather Intelligence, recomendación completa, riesgos, selector de perfil, resumen SkyCore, confianza de fuentes, Smart Action Layer, ubicación/estaciones y estado del widget. En móvil esto obligaba a recorrer muchas pantallas para entender el estado básico del clima.

## Nueva jerarquía por defecto
1. Golden Orb / clima actual.
2. Próximas horas, con pronóstico extendido bajo demanda.
3. Recomendación compacta del día, con selector Persona/Técnico integrado.
4. Resumen de alertas y riesgos, con acceso directo a la pestaña Alertas.
5. Análisis avanzado, cerrado por defecto.

## Qué se mueve detrás de “Análisis avanzado”
- SENAPRED y Weather Intelligence detallado.
- AQI.
- Forecast Skill Lab.
- Ensemble e incertidumbre.
- Microclima.
- HydroWatch.
- Riesgos completos.
- Resumen SkyCore.
- Integridad/confianza de fuentes.
- Acceso a Widgets.

## Qué deja de ocupar espacio por defecto
- Smart Action Layer duplicado.
- Tarjeta independiente “Widget Sincronizado”.
- Selector de perfil de dos tarjetas grandes.
- Gestión de ubicación/estaciones, salvo cuando el usuario solicita cambiar ciudad.

## Principio UX
El Home debe responder rápidamente:
- ¿Qué tiempo hace?
- ¿Qué viene en las próximas horas?
- ¿Qué me conviene hacer hoy?
- ¿Hay algo importante que deba revisar?

La información técnica permanece disponible, pero pasa a ser opt-in.

## Golden Orb
OC-17 no modifica archivos protegidos de la Golden Orb ni su estructura visual.

## Gate
`npm run ui:verify-mobile-home` protege la jerarquía esencial, exige que el análisis avanzado permanezca cerrado por defecto y evita que regresen al Home los bloques duplicados eliminados.

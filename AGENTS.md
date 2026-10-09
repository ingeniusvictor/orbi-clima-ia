# ORBI CLIMA IA - Reglas del Agente / Agent Rules

## REGLA PERMANENTE — ORBI CLIMA IA GOLDEN ORB PROTECTION (PROTECCIÓN DE LA ESFERA DORADA)

La esfera climática premium actual de ORBI Clima IA queda protegida.

### NO TOCAR / DO NOT TOUCH:
* `src/components/OrbiClimateCore.tsx`
* Animaciones de la esfera (animations of the sphere)
* Aros orbitales (orbital rings)
* Partículas internas (internal particles)
* Halos
* Glow
* Deformación líquida (liquid deformation)
* CSS asociado a la esfera en `src/styles/skycore-fx.css` (CSS associated with the sphere)
* Estructura visual principal de la esfera dentro de `WelcomeHeroSection` (main visual structure of the sphere inside `WelcomeHeroSection`)

### Objetivo / Objective:
Seguir mejorando ORBI Clima IA como aplicación Android premium sin modificar la esfera climática lograda.
(Keep improving ORBI Clima IA as a premium Android application without modifying the achieved climate sphere.)

### Permitido mejorar / Allowed to improve:
* Flujo Live API (Live API flow)
* Búsqueda manual (Manual location search)
* GPS denied UX (UX for denied GPS permissions)
* Alertas (Alerts)
* Widgets
* Notificaciones (Notifications)
* Perfil Persona (Persona profile)
* Perfil Técnico Terreno (Field Tech profile)
* Recomendaciones (Recommendations)
* Microcopy
* Rendimiento (Performance)
* Accesibilidad (Accessibility)
* Ajustes (Settings)
* Privacidad (Privacy)
* Build Android
* Documentación (Documentation)

### Prohibido / Forbidden:
* Rediseñar la esfera (Redesigning the sphere)
* Reemplazar `OrbiClimateCore` (Replacing OrbiClimateCore)
* Crear otra orb (Creating another orb)
* Cambiar a `OrbiClimateOrbV2` (Changing to OrbiClimateOrbV2)
* Crear `LegacyOrbiWeatherBubble` (Creating LegacyOrbiWeatherBubble)
* Tocar los keyframes de la esfera (Touching the keyframes of the sphere)
* Cambiar los colores, aros o efectos internos de la esfera sin autorización explícita (Changing the colors, rings, or internal effects of the sphere without explicit authorization)

**CRITICAL**: Antes de modificar cualquier archivo relacionado con la esfera, detenerse y pedir confirmación al usuario. (Before modifying any file related to the sphere, stop and request explicit confirmation from the user.)

## REGLA DE VERSIONADO PERMANENTE — ORBI APP VERSION VISIBILITY STANDARD
Toda aplicación del ecosistema ORBI debe exponer su versión de manera visible al usuario final y técnica para QA/desarrollo.

### Ubicaciones Mínimas Requeridas:
1. **Ajustes / Acerca de:** Sección dedicada que muestre de forma premium la versión actual, el canal de compilación y la tecnología motor.
2. **Footer o Signature:** Línea compacta de metadata (ej: `v1.0.6A-FIX2-FINAL-CLEAN · ORBI SkyCore™`).
3. **Developer Mode / Advanced Console:** Panel detallado con la metadata técnica del build completa (`versionCode`, `releaseLabel`, `buildDate`, `creator`, etc.) para QA y verificación del compilado nativo.


# OC-15 — Premium Widget Fidelity & Device Hardening

## Objetivo

Reemplazar la aproximación visual Glance del widget `ORBI SkyOrb Command Premium` 4x4 por un snapshot bitmap nativo de alta fidelidad, sin modificar la Golden Orb web.

## Problema confirmado

El receiver premium seguía llamando `OrbiSkyOrb4x4Content(state)`. Por lo tanto, el roadmap de snapshot documentado en el archivo no estaba implementado: el launcher recibía únicamente filas, columnas, textos e imágenes Glance.

## Arquitectura OC-15

`OrbiWidgetContract -> OrbiPremiumSnapshotRenderer -> Bitmap ARGB 768x768 -> Glance ImageProvider -> Launcher`

El renderer Android Canvas pinta:

- fondo obsidiana con iluminación radial;
- borde premium;
- tres anillos orbitales;
- acentos luminosos sobre las órbitas;
- esfera central basada en los assets meteorológicos existentes;
- halos y cristal estático;
- satélites de lluvia, humedad, viento y UV;
- temperatura, condición, ubicación y sensación térmica;
- narrativa ORBI IA;
- microtimeline de las próximas tres horas;
- badge de origen de datos.

## Principios

- Sin WebView dentro del widget.
- Sin animaciones continuas en launcher.
- Sin nuevos permisos.
- Sin servicios foreground.
- Sin background location.
- Sin dependencia de red durante el render del snapshot.
- Se reutiliza el mismo `OrbiWidgetContract` ya persistido por la app.
- Se reutilizan drawables meteorológicos existentes.
- El toque sobre el snapshot abre `MainActivity`.

## Golden Orb

OC-15 no modifica:

- `src/components/OrbiClimateCore.tsx`;
- `WelcomeHeroSection`;
- `src/styles/skycore-fx.css`;
- estructura, aros, partículas, halos, glow o deformación líquida de la Golden Orb web.

El renderer nativo es una representación estática independiente para las restricciones del launcher Android.

## Gate

`npm run android:verify-premium-widget` comprueba que:

- el receiver premium invoque el renderer bitmap;
- Glance consuma el `Bitmap` mediante `ImageProvider`;
- no exista fallback accidental a `OrbiSkyOrb4x4Content(state)`;
- el renderer conserve orb central, anillos, métricas y assets meteorológicos;
- el provider siga declarado 4x4 con refresco de sistema de 30 minutos.

El gate corre antes del build web y de nuevo después de `cap copy android`.

## Límite de certificación

El build GREEN demuestra integridad de código y compilación, no fidelidad visual específica de launcher. La certificación final exige instalar el APK en al menos:

1. Xiaomi/HyperOS o MIUI reciente.
2. Samsung/One UI reciente.

En cada dispositivo se debe capturar el widget 4x4 y comparar tamaño útil, recorte, redondeo, densidad, legibilidad y presencia de todos los elementos. Los ajustes OEM posteriores deben realizarse sin degradar el renderer base.

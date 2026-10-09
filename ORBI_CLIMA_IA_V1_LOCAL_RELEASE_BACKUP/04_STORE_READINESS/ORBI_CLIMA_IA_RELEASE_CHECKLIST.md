# ORBI Clima IA - Checklist de Lanzamiento de Producción (Release Checklist)

Este checklist contiene los puntos críticos de verificación técnica, funcional, de privacidad y textual antes del lanzamiento de la aplicación en Google Play.

---

## Verificación de Compilación & Empaquetado (Build)

- [x] **tsc --noEmit limpio**: El compilador TypeScript no arroja errores en el código.
- [x] **vite build limpio**: El empaquetador web genera el bundle de distribución sin errores.
- [ ] **Gradle sync limpio**: Las dependencias nativas del proyecto de Android están sincronizadas y sin conflictos.
- [ ] **APK debug compila**: Se genera un archivo APK ejecutable para pruebas locales en dispositivos de desarrollo.
- [ ] **AAB release preparado**: Se configuró el Android App Bundle optimizado para la carga en Google Play Console.
- [ ] **Firma release configurada**: Se creó y enlazó la clave Keystore segura para la firma digital de producción.
- [x] **Target SDK revisado**: La aplicación apunta a Android 15 (API level 35) según los requisitos actuales de Google Play.
- [x] **VersionCode y VersionName actualizados**: Se asignó un código incremental único y nombre legible en build.gradle.

## Verificación de Integridad Funcional (Functional)

- [x] **Open-Meteo funciona**: La consulta a la API de Open-Meteo se realiza con éxito y recupera datos climáticos en tiempo real.
- [x] **Fallback funciona**: Si falla el proveedor externo, la aplicación activa datos heurísticos y de caché locales de forma inmediata.
- [x] **Modo demo funciona**: El simulador climático permite probar todos los escenarios críticos con presets realistas.
- [x] **GPS con permiso funciona**: El flujo de obtención de coordenadas por GPS maneja rechazo, carga progresiva y éxito de forma robusta.
- [x] **Widgets funcionan**: Los simuladores del widget Android interactivo SkyOrb™ responden instantáneamente a cambios de perfil y ciudad.
- [x] **Notificaciones funcionan**: Las alertas locales del sistema simulan el comportamiento del canal de notificaciones nativas de Android.
- [x] **Quiet Hours funciona**: La lógica de horario silencioso bloquea notificaciones de baja prioridad en el período configurado.
- [x] **Memoria local funciona**: Se registran y procesan ubicaciones, widgets y perfiles más usados para generar sugerencias heurísticas.
- [x] **Export/import funciona**: Se exporta e importa el archivo JSON de configuración local sin alterar la integridad de los datos.

## Verificación de Privacidad & Consentimiento (Privacy)

- [x] **Política de privacidad visible**: El borrador de política es visible y legible de forma pública y accesible dentro de la aplicación.
- [x] **Data Safety draft completo**: Se definieron con total claridad los flujos de recolección y uso de ubicación y preferencias.
- [x] **Permisos justificados**: Se documentó la justificación técnica de cada permiso que usará la aplicación.
- [x] **Sin backend no declarado**: Se garantiza que no se transmiten datos privados a servidores externos o nubes de almacenamiento.
- [x] **Sin tracking externo**: La app no contiene librerías analíticas invasivas ni SDKs de terceros para rastrear actividades fuera del terminal.
- [x] **GPS con consentimiento**: No se leen coordenadas en segundo plano de manera automatizada sin una acción explícita previa.
- [x] **Borrado de memoria funciona**: La purga de memoria climática y preferencias del dispositivo limpia de forma total el localStorage del navegador.

## Verificación de Seguridad Textual & Políticas (Safety / Textual)

- [x] **Sin referencias HSEC/HASEC**: No existen términos regulatorios restringidos como HSEC o HASEC en ninguna interfaz pública.
- [x] **Directiva HSE visible**: Se muestra la Directiva de Terreno que recuerda cumplir con los protocolos de seguridad de la empresa.
- [x] **Sin prometer emergencia oficial**: Se explicita claramente que las alertas SkyCore no sustituyen los canales ni sirenas oficiales de rescate.
- [x] **Sin prometer seguridad garantizada**: No se utiliza lenguaje de seguridad infalible ni de protección climatológica absoluta de instalaciones.
- [x] **Sin prometer precisión absoluta**: Se describe el origen de los pronósticos indicando que son aproximaciones provistas por Open-Meteo.

---
*Lanzamiento preliminar preparado y calificado. Revisar exhaustivamente antes de la firma final.*
# ORBI Clima IA v1.0.6A-FIX2 — Guía de Compilación Android y Parche de Seguridad (Hardening)

Esta documentación técnica describe detalladamente el procedimiento paso a paso para recrear, limpiar, empaquetar y compilar la aplicación **ORBI Clima IA** como un archivo APK nativo de Android reproducible desde la fuente exportada.

---

## 📂 Carpeta Fuente y Estructura

El código fuente exportado contiene:
* **Web Source (React + TypeScript + Vite + Tailwind CSS)**: Localizado en `/src`.
* **Capacitor Configuration**: `capacitor.config.ts` y dependencias en `package.json`.
* **PowerShell Scripts de Automatización**:
  * `scripts/rebuild-android-clean.ps1`: Automatiza la regeneración limpia de la carpeta `android`, instalación de dependencias, sincronización y empaquetado final de Android.
  * `scripts/patch-android-manifest.ps1`: Aplica de forma robusta los permisos mínimos necesarios y la orientación vertical fija (portrait lock) en el archivo `AndroidManifest.xml`.

---

## 🛠️ Procedimiento de Compilación Completo

Sigue estos pasos en tu sistema local (Windows con PowerShell o macOS/Linux con terminal equivalente):

### 1. Preparar el Entorno e Instalar Dependencias
En la carpeta raíz del proyecto, ejecuta:
```bash
npm install
```
Esto instalará todas las dependencias del proyecto, incluyendo el CLI de Capacitor (`@capacitor/cli`) y el SDK core de Capacitor.

### 2. Generar el Build Web de Producción
Compila la SPA web de producción en la carpeta `/dist`:
```bash
npm run build
```

### 3. Saneamiento y Regeneración Limpia de Android
Si el archivo exportado no trae la carpeta `android` completa (por ejemplo, si falta el wrapper de Gradle `gradlew.bat`), debes regenerarla limpiamente utilizando el CLI de Capacitor y nuestros scripts de seguridad:

* **Método Automatizado (PowerShell - Recomendado)**:
  Ejecuta el script interactivo desde la terminal con privilegios suficientes:
  ```powershell
  npm run android:clean-build
  ```
  *Este script limpiará la carpeta corrupta, generará una nueva estructura de Android, buscará tu SDK de Android en variables de entorno, configurará `local.properties`, ejecutará el parche del manifiesto, verificará la presencia de `gradlew.bat` y compilará opcionalmente el APK final.*

* **Método Manual (Pasos Equivalentes)**:
  Si deseas realizarlo manualmente paso a paso:
  ```bash
  # Elimina la carpeta android si está incompleta o corrupta
  rm -rf android
  
  # Agrega la plataforma Android de manera limpia
  npx cap add android
  
  # Sincroniza el build web (/dist) con el proyecto nativo
  npx cap sync android
  ```

### 4. Aplicar Parche de Permisos y Diseño (AndroidManifest.xml)
Es de carácter crítico asegurar los permisos correctos en el manifiesto nativo y fijar el bloqueo de orientación.

* **Ejecutar el Parche de PowerShell**:
  ```powershell
  powershell -ExecutionPolicy Bypass -File scripts/patch-android-manifest.ps1
  ```
* **Alineación de Permisos de Seguridad**:
  El parche garantiza únicamente los siguientes permisos estándar, cumpliendo estrictamente con la política de privacidad de Google Play Store (sin solicitar rastreo en segundo plano intrusivo):
  * `android.permission.INTERNET` (Acceso a las API de Clima y Mapas en vivo)
  * `android.permission.ACCESS_COARSE_LOCATION` (Ubicación aproximada por red para GPS inicial)
  * `android.permission.ACCESS_FINE_LOCATION` (Ubicación exacta para posicionamiento de alta precisión)
  * `android.permission.POST_NOTIFICATIONS` (Requerido para el motor heurístico de alertas climáticas en Android 13+)
  * **Exclusiones de Seguridad**: Se prohíbe explícitamente el uso de `ACCESS_BACKGROUND_LOCATION` y servicios permanentes en segundo plano para evitar rechazos en tienda y optimizar el consumo de batería.

* **Fijar Bloqueo de Orientación (Portrait Lock)**:
  El parche añade `android:screenOrientation="portrait"` a la actividad `MainActivity` en `AndroidManifest.xml` para asegurar que la interfaz premium optimizada para teléfonos móviles no sufra deformaciones o rotaciones accidentales.

---

## 📦 Compilación nativa de APK y Ejecución

Una vez que el proyecto esté sincronizado y parchado correctamente, puedes compilarlo directamente:

### 1. Compilación directa mediante Gradle
Para generar el APK de depuración (Debug APK) directamente desde la terminal:
```bash
npm run android:build
```
*(En Windows, esto ejecutará de forma interna `cd android && gradlew.bat assembleDebug`)*

### 2. Ruta de Entrega del Archivo Compilado
Una vez completado con éxito, encontrarás el APK de Android listo para instalar en:
`android/app/build/outputs/apk/debug/app-debug.apk`

### 3. Instalación Directa mediante ADB (Android Debug Bridge)
Con tu teléfono Android en modo de depuración USB conectado a tu computador, ejecuta:
```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 🎯 ORBI Clima IA v1.0.6A-FIX2 Final Clean Checklist

A continuación se detalla la lista de verificación final aplicada sobre el código de producción de **ORBI Clima IA** para garantizar una experiencia óptima, reproducible y libre de errores:

- [x] **No Rancagua DEMO por Defecto**: La app se inicia de forma limpia con el estado inicial `“Configurar ubicación”` / `“Ubicación inicial”` en lugar de una simulación pre-cargada.
- [x] **Soporte de Ubicación Inicial**: El sistema muestra con claridad el badge `⚙️ INICIAL` y proporciona llamadas de acción intuitivas para el usuario.
- [x] **GPS Activo en Foreground**: El flujo de sincronización de GPS funciona de forma limpia en primer plano y ofrece soporte de reconexión automática si los permisos ya fueron otorgados previamente.
- [x] **Smart Locations Integrado**: Capacidad completa para guardar, actualizar y recuperar coordenadas personalizadas (Hogar, Trabajo, Parque Solar) con retroalimentación en tiempo real.
- [x] **Zen Sound Inteligente ON/OFF**: El reproductor de sonido ambiental meditativo solfeggio local se mantiene apagado de forma predeterminada, es 100% opcional, desactivable al instante y cuenta con un sistema robusto de reanudación al volver del fondo de Android.
- [x] **Sin Duplicación de Mejor Ventana**: Se eliminó de manera definitiva el bloque de código redundante `id="home-best-window-section"` en `MobileHomeScreen.tsx` para evitar confusión visual en la UI.
- [x] **ORBI Signature™ Protegida**: Se integró la firma de autoría corporativa oficial de la marca y de Victor León en la sección inferior de la pantalla de inicio con espaciado inteligente (`padding-bottom`) para evitar superposiciones con la barra de navegación nativa.
- [x] **Pestaña de Widgets Limpia**: La interfaz de visualización de widgets para el usuario final presenta un diseño premium minimalista (Simulador Jetpack Glance) ocultando cualquier volcado de código JSON técnico o depuración, los cuales quedan accesibles de forma exclusiva en el panel de desarrollador `AdvancedOrbiConsole`.
- [x] **Bloqueo Portrait Nativo**: Garantizado a través de los parches de hardening que aplican la configuración nativa a la estructura de Android Studio.
- [x] **Cumplimiento de Permisos GPS**: Se solicitan y declaran únicamente los permisos esenciales de ubicación de primer plano requeridos, resguardando la privacidad y seguridad del usuario.
- [x] **Esfera Climática Core Intacta (GOLDEN ORB PROTECTION)**: Se respetaron rigurosamente las animaciones, aros orbitales, luces, efectos internos, sombras volumétricas y deformación de fluidos de `OrbiClimateCore.tsx`, manteniendo la asombrosa identidad visual insignia sin alteraciones.
- [x] **Build y Typecheck 100% Limpios**: Verificado mediante la ejecución de validaciones estrictas de TypeScript (`tsc --noEmit`) sin advertencias ni errores en consola.

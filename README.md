# ORBI Clima IA - Guía de Compilación Local y Despliegue en Android (VS Code)

Esta guía documenta el flujo de trabajo seguro, repetible y endurecido para compilar y desplegar la aplicación móvil **ORBI Clima IA** en dispositivos físicos Android directamente desde tu entorno local (VS Code).

---

## 🚀 Flujo de Compilación Rápida (Recomendado)

Hemos creado un script automatizado para PowerShell en Windows que configura las variables de entorno, genera el archivo `local.properties` local, valida tipos, compila la interfaz web con Vite, sincroniza los activos con Capacitor y compila el APK con Gradle.

### Paso 1: Ejecutar el script de configuración y compilación
Ejecuta el siguiente comando en la terminal de VS Code:
```bash
npm run android:vscode-setup
```

### Paso 2: Instalar el APK resultante en tu dispositivo
Una vez finalizada la compilación, puedes instalar el APK firmado de depuración (`debug`) directamente en tu dispositivo conectado mediante **ADB (Android Debug Bridge)** ejecutando:
```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 🛠️ Comandos de Utilidad Disponibles

Puedes ejecutar comandos específicos directamente desde NPM para diferentes fases de desarrollo:

* **Verificación de tipos (TypeScript):**
  ```bash
  npm run typecheck
  ```
* **Sincronizar activos con Android (Capacitor):**
  ```bash
  npm run android:sync
  ```
* **Ejecutar diagnóstico de configuración de Capacitor:**
  ```bash
  npm run android:doctor
  ```
* **Compilar APK manual desde CLI:**
  ```bash
  npm run android:debug
  ```

---

## 🔐 Directivas de Seguridad del Repositorio

Para garantizar la privacidad de los datos locales y la seguridad del código, sigue estrictamente las siguientes directivas:

1. **Ignorar Archivos Locales Propios:** 
   El archivo `android/local.properties` contiene rutas absolutas locales a tu Android SDK. Este archivo está explícitamente excluido en el `.gitignore` y **NUNCA** debe ser subido al repositorio.
2. **Keystore y Credenciales:**
   Nunca guardes archivos `.keystore`, `.jks`, contraseñas en texto plano o claves de API dentro de este repositorio. Las firmas de producción deben ser manejadas en variables de entorno seguras de tu pipeline de CI/CD o configuradas en tu máquina local privada.
3. **Control de Claves en Código:**
   Toda clave o credencial externa de servicios debe consumirse mediante variables de entorno descritas en el archivo `.env.example`.

---

## 📲 Permisos Registrados en el Dispositivo

Esta aplicación cuenta con los permisos nativos de Android requeridos e identificados para una experiencia móvil completa:
* `android.permission.INTERNET` — Para recuperar los pronósticos del satélite Open-Meteo en tiempo real.
* `android.permission.ACCESS_COARSE_LOCATION` — Permiso de ubicación aproximada para geolocalización meteorológica.
* `android.permission.ACCESS_FINE_LOCATION` — Permiso de ubicación exacta por GPS.
* `android.permission.POST_NOTIFICATIONS` — Para emitir las alertas de emergencias climatológicas y HSE en terreno.

---

## 🏷️ Estándar de Versionado Permanente ORBI (ORBI App Version Visibility Standard)

Toda aplicación del ecosistema ORBI debe exponer su versión de manera visible al usuario final y técnica para QA/desarrollo.

### Ubicaciones Mínimas Requeridas:
1. **Ajustes / Acerca de:** Una sección dedicada que muestre de forma premium la versión actual, el canal de compilación y la tecnología motor.
2. **Footer o Signature:** Una línea compacta de metadata (ej: `v1.0.6A-FIX2-FINAL-CLEAN · ORBI SkyCore™`).
3. **Developer Mode / Advanced Console:** Un panel detallado con la metadata técnica del build completa (`versionCode`, `releaseLabel`, `buildDate`, `creator`, etc.) para QA y verificación del compilado nativo.

---

## 🔒 Nota de Seguridad del Developer Lock
Developer Lock es una protección UX local para evitar acceso accidental. No reemplaza seguridad criptográfica ni backend autenticado. El PIN de acceso de desarrollo por defecto es `orbi2026`.


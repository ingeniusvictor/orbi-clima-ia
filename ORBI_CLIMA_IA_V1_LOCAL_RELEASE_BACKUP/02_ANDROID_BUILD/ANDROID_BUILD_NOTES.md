# ORBI Clima IA — Android Build Notes

Este directorio está reservado para almacenar los archivos binarios compilados de forma manual para pruebas o lanzamientos de prueba.

## Archivos Recomendados a Resguardar:
1. `app-debug.apk` (APK de prueba para instalación directa en dispositivos de testing).
2. `app-release.aab` (Android App Bundle listo para subir al track de pruebas internas en Google Play Console).
3. `mapping.txt` (Archivo de ofuscación de ProGuard para interpretación de stacktraces de crashes).

## Instrucciones de Compilación de Producción:
1. Asegurar que las dependencias estén instaladas y el build web esté limpio:
   ```bash
   npm run build
   ```
2. Sincronizar el contenido web compilado con el proyecto Android nativo de Capacitor:
   ```bash
   npx cap sync android
   ```
3. Abrir el proyecto en Android Studio:
   ```bash
   npx cap open android
   ```
4. En Android Studio, seleccionar **Build > Generate Signed Bundle / APK...** para compilar la versión definitiva con su llave de firma de producción.
5. Guardar los artefactos finales compilados en este directorio.

---
*No subir archivos de contraseñas, variables de entorno locales de desarrollo o llaves keystore a repositorios públicos.*

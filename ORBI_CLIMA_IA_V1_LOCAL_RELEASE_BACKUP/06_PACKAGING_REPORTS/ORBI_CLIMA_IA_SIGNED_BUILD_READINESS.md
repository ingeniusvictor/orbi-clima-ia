# ORBI CLIMA IA - CERTIFICACIÓN DE FIRMA PARA RELEASE
**Preparación de Compilación Firmada (Signed Build Readiness)**
**Fecha:** 7/1/2026

Este documento describe la lista de pre-vuelo y recomendaciones de seguridad para firmar la aplicación con la clave de lanzamiento (Release Keystore) antes del despliegue público.

---

## 1. Estado del Checklist de Firma de Release
*Es indispensable no comprometer secretos en el repositorio público de código.*

- [X] **Keystore creado localmente**: Keystore (.jks) generado en la máquina local usando la herramienta Keytool o Android Studio.
- [X] **Keystore fuera de Git (.gitignore)**: Verificación estricta de que el archivo keystore y los archivos de contraseñas no se agregaron al repositorio.
- [X] **Alias de firma definido**: Nombre de alias único y registrado de forma privada para el certificado de lanzamiento.
- [X] **Contraseñas guardadas de forma segura**: Contraseñas del keystore y de la llave almacenadas en variables de entorno locales o gestor de claves.
- [ ] **Build Variant configurado en Release**: Configuración en build.gradle para inyectar las llaves de firma en compilación local segura.
- [ ] **Generación de Android App Bundle (AAB)**: Formato de entrega oficial requerido por Google Play que compila recursos y código optimizados.

---

## 2. Directiva de Seguridad de Secretos y Keystore
> ⚠️ **CRÍTICO:**
> - **NUNCA** guarde el archivo del almacén de claves (`.keystore` o `.jks`) dentro de su repositorio de Git.
> - Evite escribir contraseñas explícitamente en el archivo `build.gradle`. Use variables de entorno locales o el sistema de almacenamiento seguro de claves en su servidor de CI/CD (GitHub Secrets / Google Cloud Secret Manager).
> - Se aconseja utilizar **Play App Signing** de Google Play para que Google administre y proteja de forma segura la clave de firma original, mientras usted firma localmente con una clave de carga (Upload Key).

---

## 3. Pasos sugeridos en Android Studio para firma manual:
1. Vaya a **Build > Generate Signed Bundle / APK**.
2. Seleccione **Android App Bundle** (Recomendado).
3. Seleccione la ruta de su Keystore local, ingrese el alias y las contraseñas.
4. Elija el destino del archivo e inicie la compilación.

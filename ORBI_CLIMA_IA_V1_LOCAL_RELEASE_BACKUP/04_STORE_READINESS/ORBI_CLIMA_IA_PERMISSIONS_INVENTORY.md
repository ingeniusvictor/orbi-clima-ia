# ORBI Clima IA - Inventario y Justificación de Permisos Android

Este documento detalla los permisos técnicos requeridos por el APK/AAB en Android y sus justificaciones operacionales para la Play Store.

---

### 1. `android.permission.INTERNET`
- **Estado actual**: Declarado
- **Necesita Declaración de Play Console**: No
- **Propósito**: Permite a la aplicación consultar el pronóstico climático en tiempo real a través del servicio Open-Meteo.
- **Impacto si se deniega**: Esencial para el funcionamiento. Sin este permiso, la aplicación no puede actualizar datos meteorológicos en vivo.

---

### 2. `android.permission.ACCESS_FINE_LOCATION`
- **Estado actual**: Declarado
- **Necesita Declaración de Play Console**: No
- **Propósito**: Permite detectar la ubicación precisa del dispositivo vía GPS para cargar las estaciones climáticas de manera inteligente si el usuario otorga su consentimiento.
- **Impacto si se deniega**: Opcional. Permite autodetectar la estación climática más cercana de forma local.

---

### 3. `android.permission.ACCESS_COARSE_LOCATION`
- **Estado actual**: Declarado
- **Necesita Declaración de Play Console**: No
- **Propósito**: Permite detectar la ubicación aproximada del dispositivo utilizando antenas de red y Wi-Fi para un posicionamiento rápido y de bajo consumo.
- **Impacto si se deniega**: Opcional. Proporciona una estimación de ubicación para el clima sin activar el GPS de alta precisión.

---

### 4. `android.permission.POST_NOTIFICATIONS`
- **Estado actual**: Declarado
- **Necesita Declaración de Play Console**: No
- **Propósito**: Requerido en Android 13+ (API 33) o superior para poder registrar y mostrar alertas climáticas inteligentes directamente en el área de notificaciones del dispositivo.
- **Impacto si se deniega**: Esencial para Smart Alerts locales de ORBI SkyCore™.

---

### 5. `android.permission.RECEIVE_BOOT_COMPLETED`
- **Estado actual**: No declarado
- **Necesita Declaración de Play Console**: No
- **Propósito**: Permite restaurar los alarmas del scheduler local y actualizar los widgets climáticos nativos SkyOrb™ inmediatamente después de reiniciar el dispositivo.
- **Impacto si se deniega**: Bajo. Permite la persistencia de widgets en el inicio del sistema.

---

### 6. `android.permission.SCHEDULE_EXACT_ALARM`
- **Estado actual**: No declarado
- **Necesita Declaración de Play Console**: Sí (Needs Play Console Review)
- **Propósito**: Permite configurar temporizadores de alta precisión para actualizar las notificaciones del Scheduler sin demoras de energía.
- **Impacto si se deniega**: Alto. Google Play exige justificar estrictamente este permiso para evitar el drenaje de batería. ORBI prefiere usar alarmas inexactas para evitar bloqueos en Play Store.

---


*Nota: Los permisos marcados como "No declarado" son opcionales y solo deben añadirse en el AndroidManifest.xml si se implementa su lógica nativa de soporte futuro.*
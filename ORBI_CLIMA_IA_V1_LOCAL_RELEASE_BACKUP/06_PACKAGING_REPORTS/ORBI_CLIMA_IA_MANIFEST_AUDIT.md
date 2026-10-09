# ORBI CLIMA IA - AUDITORÍA DEL MANIFEST DE ANDROID
**Motor de Seguridad Orbi SkyCore™**
**Fecha:** 7/1/2026

Este reporte contiene la auditoría completa del archivo `AndroidManifest.xml` para el Release Candidate de la aplicación Android.

---

## 1. Permisos Declarados en el Manifiesto
Se auditan los permisos solicitados para garantizar el cumplimiento de las políticas de privacidad de Google Play:

### android.permission.INTERNET
* **Propósito:** Permite consultar el clima en vivo mediante el servicio meteorológico Open-Meteo.
* **Requerido:** Sí (Crítico)
* **Estado en Auditoría:** ✅ Verificado (Aprobado)

### android.permission.ACCESS_COARSE_LOCATION
* **Propósito:** Permite determinar la región aproximada para buscar datos meteorológicos del satélite.
* **Requerido:** Sí (Crítico)
* **Estado en Auditoría:** ✅ Verificado (Aprobado)

### android.permission.ACCESS_FINE_LOCATION
* **Propósito:** Requerido para la ubicación precisa en el perfil Técnico de Terreno y alertas de riesgo climático.
* **Requerido:** Sí (Crítico)
* **Estado en Auditoría:** ✅ Verificado (Aprobado)

### android.permission.POST_NOTIFICATIONS
* **Propósito:** Permite mostrar alertas inteligentes, reportes de turno y resúmenes climáticos en Android 13+.
* **Requerido:** Sí (Crítico)
* **Estado en Auditoría:** ✅ Verificado (Aprobado)

### android.permission.RECEIVE_BOOT_COMPLETED
* **Propósito:** Permite que el planificador de alertas (scheduler) se re-registre de manera autónoma al reiniciar el celular.
* **Requerido:** No (Opcional)
* **Estado en Auditoría:** ✅ Verificado (Aprobado)

### android.permission.SCHEDULE_EXACT_ALARM
* **Propósito:** Requerido para disparar las alarmas de cambio de turno y avisos en el minuto exacto (opcional).
* **Requerido:** No (Opcional)
* **Estado en Auditoría:** ✅ Verificado (Aprobado)


---

## 2. Componentes de la Aplicación y Atributos de Seguridad
Auditoría de las declaraciones de Activities, Receivers y configuraciones de red:

### [IDENTITY] Nombre de la aplicación
* **Descripción:** Declarado como android:label="@string/app_name", apuntando a "ORBI Clima IA" en res/values/strings.xml.
* **Estado:** ✅ Cumplido
* **Detalles Técnicos:** El nombre se encuentra alineado con la identidad corporativa y no contiene prefijos de test o desarrollo.

### [ACTIVITIES] MainActivity y Launcher Intent Filter
* **Descripción:** Declarado con android.intent.action.MAIN y android.intent.category.LAUNCHER.
* **Estado:** ✅ Cumplido
* **Detalles Técnicos:** Tiene android:exported="true" debido a que contiene un intent-filter para el inicio del sistema operativo.

### [RECEIVERS] OrbiSkyOrbWidgetProvider Receiver
* **Descripción:** Declarado para el soporte del widget del clima con el intent-filter android.appwidget.action.APPWIDGET_UPDATE.
* **Estado:** ✅ Cumplido
* **Detalles Técnicos:** Declarado con android:exported="true" y el metadato del proveedor asociado a la especificación XML del widget.

### [RECEIVERS] BootReceiver para Alarmas y Alertas
* **Descripción:** Filtrado por android.intent.action.BOOT_COMPLETED para reconfigurar el planificador de notificaciones.
* **Estado:** ✅ Cumplido
* **Detalles Técnicos:** Tiene android:exported="false" para prevenir que aplicaciones externas disparen eventos de arranque artificiales.

### [SECURITY] Auditoría de android:exported (Android 12+)
* **Descripción:** Se valida que todo componente con intent-filter defina explícitamente android:exported.
* **Estado:** ✅ Cumplido
* **Detalles Técnicos:** Cumplido con éxito en MainActivity, WidgetProvider y BootReceiver. Previene fallas de instalación en Android 12, 13, 14 y 15.

### [SECURITY] Network Security (Cleartext Traffic)
* **Descripción:** Establecido android:usesCleartextTraffic="false" para forzar conexiones HTTPS seguras con Open-Meteo.
* **Estado:** ✅ Cumplido
* **Detalles Técnicos:** Evita transferencias en texto plano de coordenadas GPS u otros datos sensibles del técnico de terreno.

### [IDENTITY] Tema de Aplicación e Icono
* **Descripción:** Declarados android:icon="@mipmap/ic_launcher" y android:theme="@style/Theme.OrbiClima.NoActionBar".
* **Estado:** ✅ Cumplido
* **Detalles Técnicos:** Soportado correctamente para evitar barras de herramientas redundantes del sistema nativo en favor de la interfaz web.


---

## 3. Directiva sobre Android 12+ (Seguridad de Exportación)
Toda actividad o receptor con filtros de intent (`intent-filter`) tiene declarado explícitamente `android:exported="true"` o `android:exported="false"`. Esto evita bloqueos críticos durante la instalación de la aplicación en dispositivos modernos.

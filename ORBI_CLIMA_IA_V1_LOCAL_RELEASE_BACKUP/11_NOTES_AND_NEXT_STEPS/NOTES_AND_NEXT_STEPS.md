# ORBI Clima IA — Notas Técnicas y Próximos Pasos

Este documento delinea los planes de mantenimiento y evolución técnica de la plataforma tras consolidar la versión de resguardo v1.0.

## 📌 Resumen de Versión
* **Línea Actual:** v1.0 (Local Release Sealed)
* **Objetivo:** Pruebas internas locales y piloto controlado sin almacenamiento en servidores públicos.
* **Paradigma de Almacenamiento:** Totalmente local e inteligente en el dispositivo.

## 🛠️ Planificación de Próximas Versiones

### 1. Rama v1.0.x (Mantenimiento Crítico)
* **Foco:** Estabilidad pura.
* **Cambios autorizados:**
  - Ajustes de márgenes y paddings en dispositivos de pantalla ultra pequeña.
  - Corrección de bugs menores de renderizado de gráficos.
  - Actualización de urls de la política de privacidad si cambia la dirección de alojamiento.
* **Restricción:** No se permiten nuevas funcionalidades ni adición de pantallas secundarias.

### 2. Rama v1.1.x (Mejoras Planificadas)
* **Foco:** Optimización de usabilidad.
* **Funciones bajo revisión:**
  - Integración de API adicional de radar para mapas interactivos locales (de forma opcional y consentida).
  - Alertas auditivas configurables personalizadas.
  - Soporte multi-idioma nativo para equipos técnicos internacionales.

### 3. Versión v2.0 (Evolución Estructural)
* **Foco:** Sincronización corporativa híbrida.
* **Ideas de diseño:**
  - Soporte de base de datos SQL relacional opcional mediante almacenamiento en la nube (Cloud SQL/Firestore) para equipos industriales.
  - Sistema de cuentas corporativas con autenticación segura OAuth2.
  - Consola web administrativa centralizada para coordinadores de prevención de riesgos.

---
*ORBI Clima IA — Tu núcleo climático inteligente.*

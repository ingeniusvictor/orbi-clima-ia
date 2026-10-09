# ORBI CLIMA IA - PLAY CONSOLE PREFLIGHT REPORT
**Lista de Preparación para Publicación e Pruebas Internas**
**Fecha:** 7/1/2026

Este informe resume la preparación de la consola de Google Play, la validación del binario compilado y el borrador preliminar de las Notas de Lanzamiento.

---

## 1. Validación de Binarios (AAB / APK)
Verificaciones técnicas en el dispositivo físico y soporte funcional en compilados release:

- [ ] **AAB release generado con éxito**: Compilado final .aab libre de errores de ensamble.
- [ ] **APK de prueba universal generado**: APK generado a partir del AAB (usando bundletool) o de manera directa para pruebas locales.
- [ ] **Instalación en dispositivo físico verificada**: Prueba en dispositivo físico Android real para validar rendimiento y tiempos de carga.
- [ ] **Widget responde en compilado release**: Comprobación de que el Widget del clima de ORBI se añade y actualiza correctamente.
- [ ] **Notificaciones funcionan en release**: Recepción y despliegue correcto de alertas inteligentes con el canal de notificación definido.
- [ ] **GPS y Open-Meteo funcionales**: Acceso a coordenadas y fetch de datos climáticos estables sin fallos de red en modo release.

---

## 2. Preparación de Google Play Console (Preflight)
Revisiones de datos de la tienda, categorías y cumplimiento legal:

- [X] **Cuenta Google Play Developer activa**: Cuenta de desarrollador registrada y verificada en la consola de Google Play.
- [X] **Ficha de Google Play (Ficha Principal) lista**: Nombre de la aplicación, descripción corta y descripción larga completadas en la sección de presencia.
- [X] **Categoría y etiquetas asignadas**: Asignado a la categoría "Weather/Clima" con etiquetas relevantes para máxima visibilidad.
- [ ] **URL de Política de Privacidad preparada**: La política de privacidad local exportada debe alojarse en un sitio web público antes de enviar la app.
- [X] **Data Safety Declarado en borrador**: Declaración de seguridad de datos de Google Play que especifica qué datos de ubicación se recolectan.
- [ ] **Track de pruebas internas preparado**: Configuración de la lista de correos de testers autorizados para el canal de pruebas inicial.

---

## 3. Borrador de Notas de Lanzamiento (Release Notes Draft)
Copie este texto en la sección de "Notas de Lanzamiento" al crear su primera prueba en Google Play Console:

```txt
Primera versión candidata de ORBI Clima IA.

Incluye:
- Pronóstico climático en vivo.
- Perfil Persona.
- Perfil Técnico Terreno.
- ORBI SkyCore™ Risk Engine.
- Alertas inteligentes.
- Widgets Android ORBI SkyOrb™.
- Notificaciones locales.
- Horarios silenciosos.
- Preferencias y memoria local.
- Privacidad local sin cuenta ni backend.
```

# ORBI SkyOrb Command Premium Widget — Android Snapshot Roadmap

Este documento detalla la estrategia de ingeniería para portar el diseño premium de **ORBI SkyOrb Command Premium** (con composición radial de burbujas flotantes, aros de brillo y esferas de vidrio líquido de alta fidelidad) hacia el ecosistema nativo de Android Launcher a través de **Jetpack Glance**.

## Desafío Técnico en Android Launcher
Los widgets nativos de Android mediante `AppWidgetProvider` y **Jetpack Glance** operan sobre `RemoteViews`, lo cual impone severas restricciones técnicas:
* **Sin animaciones complejas**: No se permiten animaciones fluidas CSS/JS continuas ni rotaciones por fotograma clave para los aros orbitales.
* **Sin desenfoque dinámico avanzado**: Las propiedades de `backdrop-filter: blur` no se renderizan de forma consistente en sistemas operativos anteriores a Android 12.
* **Limitaciones de UI Declarativa**: Compose Glance no soporta todas las primitivas de diseño y sombras complejas de Jetpack Compose tradicional.

## Solución Propuesta: High-Fidelity Snapshot Strategy

Para mantener la calidad visual idéntica a la maqueta web en el teléfono real, implementamos la siguiente arquitectura de **Renderizado en Caché**:

```
+---------------------------+
| ORBI Clima IA (React/App) | ---- (Gatilla al recibir nuevo clima)
+---------------------------+
              |
              v
+---------------------------+
| Renderizador Off-screen   | ---- (Compone el HTML/Canvas premium invisible)
+---------------------------+
              |
              v
+---------------------------+
| Captura de Bitmap (.PNG)  | ---- (Genera archivo de imagen transparente en caché)
+---------------------------+
              |
              v
+---------------------------+
| Android Shared Storage    | ---- (Escribe la ruta local en SharedPreferences)
+---------------------------+
              |
              v
+---------------------------+
| Jetpack Glance Provider   | ---- (Lee el bitmap de caché y lo dibuja en pantalla)
+---------------------------+
```

### Pasos de la Pipeline
1. **Detección de Cambios**: Cuando el receptor `OrbiSkyOrbCommandPremiumWidgetReceiver` se activa (por tiempo o push), solicita al fondo actualizar el estado climático.
2. **Generación del Snapshot**: Un servicio nativo dibuja la interfaz circular premium con sus gradientes, aros orbitales e iconos en un Canvas en memoria con la resolución del widget de destino (4x4, típicamente `512x512` px).
3. **Caché Física**: El Canvas se almacena como `premium_widget_snapshot.png` en el directorio de archivos internos seguros del dispositivo.
4. **Carga Ultrarrápida**: Glance carga el archivo binario utilizando `ImageProvider(uri)` de forma instantánea, logrando un consumo de batería prácticamente nulo.

## Especificaciones de Archivos Registrados
* **Receiver**: `OrbiSkyOrbCommandPremiumWidgetReceiver`
* **Provider XML**: `orbi_skyorb_command_premium_widget_info.xml`
* **Tamaño**: 4x4 Celdas (`targetCellWidth="4"`, `targetCellHeight="4"`)
* **Versión de Motor**: `ORBI SkyCore™ Engine v1.0.6A-FIX4H`

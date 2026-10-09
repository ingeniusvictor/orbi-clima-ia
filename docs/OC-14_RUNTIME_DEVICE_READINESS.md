# OC-14 — Runtime Device Readiness & Field QA

## Objetivo

Separar la certificación automática de CI de la evidencia que sólo puede obtenerse en un teléfono Android real. OC-14 no declara QA físico sin dispositivo.

## Diagnóstico nativo de solo lectura

`OrbiRuntimeDiagnostics` expone al WebView únicamente estado operativo local:

- fabricante, modelo, versión Android y API;
- permisos coarse/fine de ubicación;
- permiso de notificaciones;
- existencia/habilitación del canal oficial SENAPRED;
- restricción de background de Android;
- estado de optimización de batería (sin pedir excepción automática);
- trabajos WorkManager etiquetados para vigilancia oficial;
- cantidad real de instancias colocadas de cada widget ORBI;
- confirmación de que ORBI no usa background location ni foreground service.

No expone coordenadas, identificadores publicitarios, IMEI, serial, cuentas ni información personal.

## Matriz física mínima

Para cerrar QA de dispositivo debe probarse al menos una implementación HyperOS/MIUI y una One UI reciente.

### Caso A — primer arranque
1. Instalar APK limpio.
2. Abrir ORBI Clima IA.
3. Conceder ubicación foreground.
4. Conceder notificaciones.
5. Confirmar que Device Readiness refleja los permisos sin reiniciar la app.
6. Confirmar Home, Alertas, Widgets y Ajustes sin clipping de edge-to-edge.

### Caso B — SENAPRED background
1. Activar vigilancia oficial con ubicación chilena confirmada en foreground.
2. Confirmar `WorkManager SENAPRED = OK`.
3. Cerrar la app desde recientes sin forzar detención.
4. Esperar una ventana de WorkManager o usar `runNow` desde la app.
5. Confirmar actualización de `lastResult` / `lastCheckAt`.
6. Verificar que una falta de permiso de notificaciones deja la alerta pendiente y no la marca como entregada.

### Caso C — restricciones OEM
1. Mantener optimización de batería por defecto y registrar estado.
2. Si el OEM restringe background, Device Readiness debe mostrar `REVISAR`.
3. El usuario puede abrir Ajustes de la app; ORBI no solicita exclusiones de batería automáticamente.
4. Repetir tras cambiar manualmente la política del OEM.

### Caso D — widgets launcher
1. Añadir cada widget desde el selector del launcher.
2. Confirmar que `placedWidgetCount` aumenta.
3. Confirmar individualmente 4x1, 2x2, 4x2, Command 4x4 y Command Premium 4x4.
4. Redimensionar donde el launcher lo permita.
5. Forzar refresh meteorológico y comprobar que contrato/datos se actualizan.
6. Tomar capturas del Premium 4x4 para comparación posterior con el diseño objetivo; OC-14 no declara todavía paridad visual pixel-perfect.

## Criterio de salida

OC-14 puede fusionarse cuando:

- TypeScript está GREEN;
- build web está GREEN;
- `cap copy android` está GREEN;
- invariantes OC-11/OC-13 permanecen GREEN;
- Kotlin/Java Android compila APK debug y AAB release;
- el plugin runtime está registrado en `MainActivity`;
- la Golden Orb web permanece intacta.

La etiqueta **DEVICE QA COMPLETE** sólo puede emitirse después de ejecutar la matriz física y guardar evidencia por dispositivo.

# OC-11 — Android Background Official Alert Watch

## Objetivo

OC-11 permite que ORBI Clima IA mantenga una vigilancia periódica de alertas territoriales oficiales SENAPRED en Android aunque el WebView de la aplicación no esté abierto.

La fase conserva dos principios no negociables:

1. una alerta oficial sólo puede nacer de una respuesta SENAPRED verificable;
2. la vigilancia no utiliza ubicación oculta en segundo plano ni un servicio permanente.

## Arquitectura

El flujo nativo queda separado del motor climático modelado:

```text
Ubicación confirmada en foreground
        │
        ▼
Capacitor OrbiOfficialAlertWatch
        │ guarda snapshot local
        ▼
Android WorkManager (~30 min, best effort, red requerida)
        │
        ▼
SenapredBackgroundClient
        │
        ├─ directorio ArcGIS dinámico
        ├─ fallback a capas canónicas
        ├─ intersección punto → polígono
        └─ validación de cobertura
        │
        ▼
OfficialAlertWorker
        │
        ├─ hasVerifiedCoverage = false → NO notificar
        ├─ sin alerta coincidente → registrar estado
        ├─ quiet hours → conservar como pendiente
        ├─ sin POST_NOTIFICATIONS → conservar como pendiente
        └─ alerta nueva → canal Android oficial SENAPRED
```

El pipeline existente de OC-10 continúa funcionando cuando la aplicación está abierta:

```text
SENAPRED web/foreground → official_senapred → Local Notifications
```

Ambos pipelines comparten identidad de alerta y ledger de deduplicación.

## WorkManager

Se agregó `androidx.work:work-runtime-ktx:2.9.1`.

La vigilancia usa:

- `PeriodicWorkRequest` con objetivo de 30 minutos;
- mínimo técnico protegido de 15 minutos;
- restricción `NetworkType.CONNECTED`;
- `ExistingPeriodicWorkPolicy.UPDATE`;
- backoff exponencial de 15 minutos;
- un `OneTimeWorkRequest` al activar la función o al cambiar realmente la ubicación;
- `runNow()` para QA/manual check.

El intervalo es **best effort**. Android puede diferir el trabajo por Doze, App Standby, ahorro de batería o políticas del fabricante. ORBI no promete ejecución exacta cada 30 minutos.

## Privacidad y ubicación

OC-11 NO solicita:

- `ACCESS_BACKGROUND_LOCATION`;
- `FOREGROUND_SERVICE`;
- `FOREGROUND_SERVICE_LOCATION`.

Tampoco usa:

- `LocationManager` en el worker;
- `FusedLocationProviderClient` en el worker;
- `requestLocationUpdates`;
- un servicio foreground permanente.

El worker recibe exclusivamente un **snapshot de la última ubicación real que el usuario confirmó/consultó mientras la app estaba en primer plano**.

Cuando la ubicación consultada cambia en foreground, `officialWeatherAlertsService` sincroniza el nuevo snapshot con el bridge nativo. Un refresh normal sobre la misma ubicación no reinicia WorkManager ni dispara otra consulta nativa inmediata.

## Integridad SENAPRED

`SenapredBackgroundClient.kt` replica la política conservadora de OC-09:

- consulta el directorio público ArcGIS SENAPRED;
- prioriza capas canónicas `METEOROLOGICAS_VERDE`, `AMARILLA`, `ROJA`;
- admite snapshots fechados recientes con máximo 21 días;
- utiliza intersección geográfica de punto con polígono oficial;
- normaliza nivel, causalidad, región, provincia, comuna y fecha;
- filtra registros antiguos;
- deduplica coincidencias territoriales;
- distingue capa inactiva, error y cobertura verificable.

Si ninguna capa oficial puede verificarse, el worker registra `unverifiable` y **no transforma ese fallo en “sin alertas”**.

## Mapeo de severidad

| SENAPRED | ORBI notification severity |
| --- | --- |
| Alerta Roja | `critical` |
| Alerta Amarilla | `warning` |
| Alerta Temprana Preventiva | `watch` |

HydroWatch, GloFAS, Open-Meteo, modelos de lluvia, consenso multi-modelo o cualquier score ORBI no pueden entrar en este worker como alerta oficial.

## Canal Android

Canal:

`orbi_official_alerts`

Nombre visible:

`Alertas oficiales SENAPRED`

Se utiliza un icono monocromo propio:

`android/app/src/main/res/drawable/ic_stat_orbi_alert.xml`

## Deduplicación de tres capas

### 1. Identidad normalizada

La clave contiene:

```text
senapred:<nivel>:<evento>:<region>:<territorio>:<fecha_inicio>
```

TypeScript y Kotlin aplican el mismo criterio. Una escalada Amarilla → Roja cambia la clave y permanece entregable.

### 2. Ledger persistente nativo

`OfficialAlertWatchStore` guarda un SHA-256 de las claves entregadas durante 180 días.

El WebView consulta este ledger antes de emitir una alerta oficial; después de una entrega foreground exitosa también marca la clave en el ledger nativo.

### 3. ID Android determinístico

Kotlin usa `String.hashCode()` positivo sobre la clave normalizada.

TypeScript implementa el mismo algoritmo Java mediante `Math.imul(31, hash)`.

El worker y Local Notifications usan por tanto el mismo ID para una misma alerta. Si ocurriera una carrera extrema entre ambos runtimes, Android reemplaza la misma notificación en lugar de presentar dos tarjetas visibles.

## Quiet Hours

La configuración de horario silencioso de ORBI se sincroniza al almacenamiento nativo.

Comportamiento:

- modo desactivado → alertas permitidas;
- modo silencioso completo → se retienen durante el horario;
- `critical_only` → sólo se permite Roja/critical si `allowCritical=true`;
- una alerta bloqueada no se marca como entregada;
- podrá volver a evaluarse en un ciclo posterior.

## Permiso de notificaciones

En Android 13+ se valida `POST_NOTIFICATIONS` antes de publicar.

Si falta permiso:

- no se genera una notificación invisible/fallida;
- la alerta no se marca como entregada;
- el estado queda como `notification_permission_missing`;
- podrá volver a aparecer cuando el usuario conceda el permiso y siga vigente.

## Ajustes de usuario

La función es **opt-in**.

En `Ajustes → Seguridad y Privacidad` se añadió `Vigilancia oficial SENAPRED` con:

- toggle ON/OFF;
- ubicación vigilada;
- ciclo objetivo;
- último resultado;
- última revisión;
- última zona de alerta;
- error de fuente si existe;
- botón `Verificar ahora`;
- aviso explícito de que no se usa GPS oculto ni servicio permanente.

No se permite activar desde:

- ubicación inicial sin configurar;
- modo mock/demo;
- fallback;
- ubicación fuera de Chile.

## Registro de plugins nativos

Se añadió un `MainActivity.java` canónico que registra explícitamente:

- `OrbiWidgetBridgePlugin`;
- `OrbiOfficialAlertWatchPlugin`.

Esto también fortalece el bridge de widgets ya existente, evitando depender de descubrimiento implícito de plugins locales.

## Rebuild Android reproducible

`scripts/rebuild-android-clean.ps1` ahora preserva durante una regeneración de Capacitor:

- paquete completo `com/orbi/clima`;
- `MainActivity.java`;
- paquete `widget`;
- paquete `alerts`;
- todos los `orbi_*_widget_info.xml`;
- layouts ORBI;
- drawables de widgets;
- `ic_stat_orbi_alert.xml`;
- values custom;
- `android/app/build.gradle`.

También restaura los cinco receivers de widget en el manifiesto.

`android/app/build.gradle` aplica nuevamente `capacitor.build.gradle`, requerido para que `npx cap sync android` aporte las dependencias oficiales de Capacitor como Geolocation y Local Notifications.

## Hardening del manifiesto

`scripts/patch-android-manifest.ps1` elimina explícitamente si aparecieran por accidente:

- `ACCESS_BACKGROUND_LOCATION`;
- `FOREGROUND_SERVICE`;
- `FOREGROUND_SERVICE_LOCATION`.

Y conserva sólo los permisos requeridos:

- INTERNET;
- ACCESS_COARSE_LOCATION;
- ACCESS_FINE_LOCATION;
- POST_NOTIFICATIONS.

## Gate CI OC-11

Se añadió:

```bash
npm run android:verify-background-watch
```

El verificador comprueba:

- permisos permitidos/prohibidos;
- cinco widget receivers;
- registro de bridges en `MainActivity`;
- dependencia WorkManager;
- aplicación de `capacitor.build.gradle`;
- presencia de todos los archivos nativos OC-11;
- ausencia de APIs de tracking/background GPS en el worker;
- gate `hasVerifiedCoverage`;
- deduplicación persistente;
- ID determinístico compartido;
- preservación de fuentes nativas en clean rebuild;
- reglas de hardening.

El Quality Gate ejecuta ahora:

1. TypeScript;
2. Android background-watch source invariants;
3. build web de producción.

## Estado de validación de OC-11

En esta fase se valida automáticamente la coherencia de fuente Android y la integración TypeScript/web.

El repositorio Android histórico sigue siendo una estructura parcialmente conservada/regenerable, por lo que **OC-11 no afirma todavía que GitHub Actions compile el APK con Gradle**. El build nativo reproducible completo debe convertirse en un gate separado para evitar una falsa certificación.

Esa será la finalidad natural de **OC-12 — Reproducible Native Android CI / APK-AAB Gate**.

## Protección visual

OC-11 no modifica:

- `src/components/OrbiClimateCore.tsx`;
- estructura visual de Golden Orb en `WelcomeHeroSection`;
- `src/styles/skycore-fx.css`;
- aros;
- partículas;
- halos;
- glow;
- deformación líquida.

La identidad visual Golden Orb permanece fuera del alcance de esta fase.

# OC-18 — QA Install Channel

## Problema
Los APK debug generados por runners efímeros de GitHub pueden no conservar la misma firma debug entre ejecuciones. Además, OC-17 compartía el mismo `applicationId` y `versionCode` de builds anteriores, lo que hacía ambiguo saber qué APK estaba ejecutando Android durante pruebas físicas.

## Solución para pruebas
La build `debug` usa una identidad separada:

- `applicationId`: `com.orbi.clima.qa18`
- launcher label: `ORBI Clima IA QA18`
- `versionCode`: `10718`
- `versionName`: `1.0.7-oc18-qa18`

La build `release` conserva `com.orbi.clima` y la etiqueta pública `ORBI Clima IA`.

## Objetivo
Permitir instalar la build QA al lado de la aplicación existente sin sustituirla ni borrar sus datos. La presencia del sufijo QA18 hace inequívoca la build que se está validando.

## Seguridad
No se incorpora ninguna clave privada de firma de producción al repositorio. El AAB release continúa separado del canal QA debug.

## Limitación
Este canal QA versionado resuelve la validación física actual. Una política de actualización QA persistente entre múltiples builds requiere una clave QA estable administrada como secreto CI, no comprometida en el repositorio.

## Gate
`npm run android:verify-qa-channel` verifica que la identidad QA, la versión y el label permanezcan presentes y que el manifest use el placeholder de etiqueta.

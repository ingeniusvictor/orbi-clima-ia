# OC-16 — Immediate Multi-Widget Refresh

## Objetivo

Garantizar que cada nuevo contrato meteorológico persistido por ORBI actualice inmediatamente todas las familias de widgets Android colocadas, incluida `ORBI SkyOrb Command Premium` 4x4.

## Hallazgo

El flujo React ya reconstruía `activeContract` ante cambios relevantes y ejecutaba `syncAndroidWidgetContract(activeContract)`. El bridge nativo persistía correctamente el JSON, pero después solo llamaba:

`OrbiSkyOrbWidget().updateAll(context)`

Eso dejaba Mini, Panel, Command y Command Premium sujetos al refresco periódico del launcher, cuyo provider permite hasta 30 minutos.

## Arquitectura OC-16

`activeContract change -> syncAndroidWidgetContract -> OrbiWidgetBridge.saveWidgetContract -> SharedPreferences -> fan-out updateAll`

El fan-out incluye:

- `OrbiSkyOrbWidget`;
- `OrbiSkyOrbMiniWidget`;
- `OrbiSkyOrbPanelWidget`;
- `OrbiSkyOrbCommandWidget`;
- `OrbiSkyOrbCommandPremiumWidget`.

Cada familia se refresca mediante `refreshSafely`. Un fallo específico de launcher/OEM en una variante no impide actualizar las restantes.

## Comportamiento

- El contrato se persiste una sola vez.
- El refresco se programa inmediatamente en `Dispatchers.Default`.
- No se añade red, permisos, servicios foreground ni background location.
- El bitmap Premium OC-15 se regenera al recibir el nuevo contrato en vez de depender exclusivamente del `updatePeriodMillis` del launcher.
- El refresco periódico de Android permanece como red de seguridad.

## Gate

`npm run android:verify-widget-refresh` comprueba:

- que `App.tsx` siga sincronizando `activeContract`;
- que el servicio web invoque `saveWidgetContract`;
- que el bridge persista el contrato;
- que las cinco familias ejecuten `updateAll(context)`;
- que los fallos se aíslen por familia;
- que el bridge declare cinco familias programadas.

El gate corre antes del build web y nuevamente después de `cap copy android`.

## Golden Orb

OC-16 no modifica ningún archivo protegido de Golden Orb ni cambia su renderizado web.

## Límite de certificación

La lógica de refresco puede certificarse por código y compilación. La latencia observada del launcher y la fidelidad visual siguen requiriendo prueba física en HyperOS/MIUI y One UI.

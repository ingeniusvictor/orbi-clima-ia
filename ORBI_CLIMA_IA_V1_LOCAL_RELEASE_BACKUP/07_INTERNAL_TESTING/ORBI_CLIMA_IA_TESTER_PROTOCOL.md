# ORBI Clima IA — Protocolo de Prueba Interna Android

Este documento establece los pasos operativos recomendados para el equipo de desarrollo y control de calidad antes de considerar cerrado el Release Candidate para su eventual publicación.

## Flujo Operativo de Pruebas Cerradas
1. **Confirmar QA Score >= 95%**: Revisar que el Release Candidate QA Center esté validado.
2. **Confirmar Packaging Score >= 95%**: Asegurar que las configuraciones de Gradle, manifiesto y recursos adaptativos estén completadas.
3. **Confirmar Store Readiness >= 90%**: Asegurar que la ficha de tienda, políticas de privacidad y Data Safety local estén aprobadas.
4. **Confirmar Mobile UX Re-Lock activo**: El Shell móvil (Mobile Shell) debe estar forzado en pantalla y con navegación por pestañas.
5. **Generar AAB release manualmente**: Compilar el paquete de distribución final (.aab) de forma manual en Android Studio o CLI, utilizando firmas de producción.
6. **Mantener keystore fuera de Git**: No subir la clave privada de firma de la aplicación bajo ninguna circunstancia.
7. **Cargar AAB manualmente en Google Play Console**: Dirigirse al canal "Pruebas internas" (Internal Testing) de la consola del desarrollador y subir el AAB de forma privada.
8. **Asignar Testers Internos**: Incluir las cuentas de correo autorizadas en el track interno en Play Console.
9. **Compartir enlace de prueba**: Distribuir el enlace de invitación de Play Store a los testers oficiales.
10. **Recopilar Feedback**: Utilizar la plantilla oficial de feedback para resumir resultados individuales.
11. **Evaluar Cierre de RC**: Verificar el cumplimiento del 100% de los criterios de la compuerta de cierre (Closure Gate) para emitir el certificado final.

---

## Nota de Privacidad y Seguridad
**ORBI Clima IA** no maneja logins en la nube, bases de datos remotas ni almacenamiento de credenciales. La retención se maneja exclusivamente en el almacenamiento local seguro del dispositivo.

import { RcClosureState } from './rcClosureStateService';

export function buildInternalTestingPackMarkdown(state: RcClosureState): string {
  const testerList = state.testers.map(t => 
    `- **${t.name}** (${t.role}): ${t.deviceModel || 'N/A'} (Android ${t.androidVersion || 'N/A'}) - Estado: **${t.status.toUpperCase()}** - Focos: ${t.testFocus.join(', ')} (Notas: ${t.notes || 'Sin notas'})`
  ).join('\n');

  return `# ORBI Clima IA — Paquete de Pruebas Internas (Internal Testing Pack)

## Información General de la Release
- **Versión**: ${state.versionName}
- **Etiqueta Candidata**: ${state.candidateLabel}
- **Estado de Pruebas**: ${state.status.toUpperCase()}
- **Última Actualización del Paquete**: ${new Date(state.lastUpdated).toLocaleString('es-CL')}

---

## Directiva de Seguridad y Salud Ocupacional (HSE)
> **Directiva HSE Terreno**: Las alertas ORBI son apoyo preventivo. No reemplazan protocolos HSE, evaluación en terreno ni instrucciones del empleador.

---

## Registro de Testers Internos Autorizados (Tester Roster)
Actualmente hay ${state.testers.length} testers registrados para participar en la validación local:

${testerList}

---

## Resumen del Protocolo y Checklist de Aceptación
Para cada dispositivo móvil o sesión de prueba, el tester debe certificar que los 25 ítems de aceptación mínima están correctos en su dispositivo Android real.

*Este paquete se genera para uso interno y de QA. Las pruebas se realizan de forma manual en Google Play Console en el canal cerrado "Internal Testing Track".*
`;
}

export function buildTesterProtocolMarkdown(): string {
  return `# ORBI Clima IA — Protocolo de Prueba Interna Android

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
`;
}

export function buildTesterFeedbackTemplateMarkdown(): string {
  return `# ORBI Clima IA — Plantilla de Feedback del Tester (Internal Testing)

Copie y complete esta plantilla después de realizar las pruebas en su dispositivo móvil.

\`\`\`txt
ORBI Clima IA — Feedback Tester

Nombre del Tester:
Rol del Tester:
Modelo del Dispositivo:
Versión de Android:
Versión de ORBI probada:
Fecha de Evaluación:

Por favor, marque con [X] según corresponda:

[ ] 1. ¿La app instaló correctamente en el dispositivo?
[ ] 2. ¿La app abrió rápidamente y sin congelamientos o crashes?
[ ] 3. ¿La interfaz se adapta perfectamente simulando ser un dispositivo nativo?
[ ] 4. ¿La pantalla de inicio se entiende y tiene buena densidad de información?
[ ] 5. ¿Los datos climáticos se actualizaron correctamente?
[ ] 6. ¿Funciona la búsqueda manual de estaciones y ciudades?
[ ] 7. ¿Funciona la geolocalización por GPS al conceder el permiso?
[ ] 8. ¿La aplicación funciona de forma degradada/fallback al denegar el GPS?
[ ] 9. ¿El Perfil Persona muestra consejos comprensibles?
[ ] 10. ¿El Perfil Técnico Terreno muestra riesgos correctos sin términos prohibidos (HSEC/HASEC)?
[ ] 11. ¿La directiva oficial de seguridad HSE de terreno está visible en los paneles?
[ ] 12. ¿Los avisos de riesgos se entienden con claridad humana?
[ ] 13. ¿Funciona el simulador de alertas de notificación en segundo plano?
[ ] 14. ¿La opción de Quiet Hours bloquea la simulación de avisos en horas no permitidas?
[ ] 15. ¿Los 4 Widgets Android de previsualización (SkyPanel, SkyOrb, Field Command, Cinematic) responden y cargan los datos?
[ ] 16. ¿Las preferencias de inicio persisten al recargar o reiniciar la app?
[ ] 17. ¿La memoria climática permite eliminar búsquedas antiguas de forma transparente?
[ ] 18. ¿El Centro Avanzado de Consola (Developer Console) requiere activar el gate oculto en Ajustes?
[ ] 19. ¿Confirmas que no se muestran barras técnicas largas o basura de logs en la pantalla de inicio principal?
[ ] 20. ¿Recomendarías pasar esta versión RC a producción de forma general?

Resultado final del Tester:
[ ] APROBADO (App lista para producción)
[ ] OBSERVADO (Se requieren correcciones menores pero no bloqueantes)
[ ] RECHAZADO (Hay fallos graves o bloqueos críticos de funcionalidad)

Comentarios adicionales y notas de fallos:

Capturas de pantalla recomendadas a adjuntar:
- Pantalla de inicio con Perfil Activo.
- Sección de Widgets seleccionados.
- Notificación de alerta simulada recibida.
\`\`\`
`;
}

export function buildFinalRcClosureCertificateMarkdown(state: RcClosureState): string {
  const testersCompleted = state.testers.filter(t => t.status === 'completed');

  return `# CERTIFICADO DE CIERRE DE RELEASE CANDIDATE (FINAL RC CLOSURE CERTIFICATE)

## Declaración de Cierre Exitoso
Por medio de la presente, se certifica que la versión candidata **${state.versionName}** de **ORBI Clima IA** ha completado de forma satisfactoria todos los controles y filtros del protocolo de integración de SkyCore™. 

Se autoriza su paso a la fase de pruebas internas en circuito cerrado y se da por cerrado formalmente el Release Candidate.

---

## Identificación del Software
- **Aplicación**: ORBI Clima IA
- **Núcleo de Inteligencia**: Powered by ORBI SkyCore™
- **Lanzamiento Certificado**: ${state.versionName} (${state.candidateLabel})
- **Fecha de Emisión**: ${new Date().toLocaleString('es-CL')}

---

## Validaciones Técnicas e Inventarios Aprobados
- **QA Score**: Aprobado (QA Center con validaciones completas).
- **Android Packaging Readiness**: Aprobado (Estructura Gradle, iconos adaptativos y variables de compilación locales revisadas).
- **Ficha de Tienda y Privacidad**: Aprobado (Declaración de seguridad de datos, permisos justificados y política de privacidad in-app cargada).
- **Mobile UX Guard**: Aprobado (Bottom nav de 4 pestañas activo, con el Centro Avanzado resguardado para el desarrollador).
- **Cumplimiento de Directivas HSE**: Certificado. Se mantiene la visualización informativa preventiva. Se certifica la ausencia total de términos regulatorios prohibidos (no HSEC ni HASEC).
- **Seguridad de Datos**: Certificado. Cero almacenamiento de contraseñas, keystores o claves privadas en el repositorio de código. No hay backends vulnerables expuestos.

---

## Verificación de Testers Internos de Control
Se registra la validación exitosa de los siguientes testers en terreno:
${testersCompleted.map(t => `- **${t.name}** (${t.role}): Dispositivo ${t.deviceModel || 'N/A'} con Android ${t.androidVersion || 'N/A'}`).join('\n')}

---

*Este certificado es una declaración local de preparación para tiendas y empaquetamiento final, garantizando que el software cumple con los rigurosos estándares definidos por el ecosistema de ORBI.*
`;
}

// Helper to trigger file download
function triggerDownload(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadInternalTestingReleasePack(state: RcClosureState): void {
  const md = buildInternalTestingPackMarkdown(state);
  triggerDownload(md, 'ORBI_CLIMA_IA_INTERNAL_TESTING_PACK.md');
}

export function downloadTesterProtocol(): void {
  const md = buildTesterProtocolMarkdown();
  triggerDownload(md, 'ORBI_CLIMA_IA_TESTER_PROTOCOL.md');
}

export function downloadTesterFeedbackTemplate(): void {
  const md = buildTesterFeedbackTemplateMarkdown();
  triggerDownload(md, 'ORBI_CLIMA_IA_TESTER_FEEDBACK_TEMPLATE.md');
}

export function downloadFinalRcCertificate(state: RcClosureState): void {
  const md = buildFinalRcClosureCertificateMarkdown(state);
  triggerDownload(md, 'ORBI_CLIMA_IA_FINAL_RC_CERTIFICATE.md');
}

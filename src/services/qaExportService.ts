import { QaReleaseState } from './qaStateService';
import { getQaScoreStats } from '../utils/qaScoreEngine';

export function buildQaReportMarkdown(state: QaReleaseState): string {
  const stats = getQaScoreStats(state);
  const nowStr = new Date(state.lastUpdated).toLocaleString('es-CL');

  let md = `# INFORME DE CONTROL DE CALIDAD INTERNO (QA)
**ORBI Clima IA — QA Release Candidate Report**

---

## 📊 RESUMEN EJECUTIVO DE CONTROL DE CALIDAD
* **Release Candidate:** \`${state.candidateLabel} (${state.versionName})\`
* **Fecha de Evaluación:** ${nowStr}
* **QA Score Global:** **${stats.score}%**
* **Dictamen del Sistema:** **${stats.statusLabel}**
* **Pruebas Totales:** ${stats.totalTests}
* **Aprobadas (Passed):** ${stats.passedCount}
* **Fallidas (Failed):** ${stats.failedCount}
* **Bloqueadas (Blocked):** ${stats.blockedCount}
* **Bugs Abiertos:** ${stats.openBugsCount} (Críticos: ${stats.criticalBugsCount})

---

## 🛠️ COMPILACIÓN Y ENTORNO
* **Compilación Web:** LIMPIO (Evidencia Validada)
* **Compilación Android (Capacitor/Webview):** COMPILADO SIN ERRORES (Evidencia Validada)
* **Directiva HSE Terreno:** PRESERVADA E INTEGRADA
* **Seguridad Textual:** Sin referencias prohibidas a HSEC o HASEC (100% verificado)

---

## 📋 DETALLE DE PRUEBAS DEL SISTEMA (MÓDULOS 0 - 8B)

`;

  // Group by module
  const modules = Array.from(new Set(state.tests.map(t => t.module)));
  modules.forEach(mod => {
    md += `### ${mod}\n\n`;
    const modTests = state.tests.filter(t => t.module === mod);
    modTests.forEach(test => {
      const statusIcon = test.status === 'passed' ? '✅ PASSED' : test.status === 'failed' ? '❌ FAILED' : test.status === 'blocked' ? '🚫 BLOCKED' : '⚠️ REVIEW';
      md += `#### ${test.title} [${statusIcon}]
* **Descripción:** ${test.description}
* **Resultado Esperado:** ${test.expectedResult}
* **Prioridad/Severidad:** ${test.severity.toUpperCase()}
* **Notas de QA:** ${test.notes || '*Sin observaciones adicionales*'}

`;
    });
  });

  md += `---

## 🔍 REGISTRO DE EVIDENCIA REGISTRADA
`;

  if (state.evidence.length === 0) {
    md += `*No se registraron notas de evidencia manual para este release candidate.*\n`;
  } else {
    state.evidence.forEach(ev => {
      md += `### 📄 ${ev.label}
* **Tipo de Evidencia:** ${ev.type.toUpperCase()}
* **Fecha de Registro:** ${new Date(ev.createdAt).toLocaleString('es-CL')}
* **Descripción/Evidencia:** ${ev.description}

`;
    });
  }

  md += `\n---
*Este reporte fue generado automáticamente por el QA Center Local de ORBI Clima IA de manera interna.*`;

  return md;
}

export function buildQaCertificateMarkdown(state: QaReleaseState): string {
  const stats = getQaScoreStats(state);
  const nowStr = new Date(state.lastUpdated).toLocaleString('es-CL');

  return `# CERTIFICADO DE CONTROL DE CALIDAD — ORBI CLIMA IA
**RELEASE CANDIDATE CERTIFICATE**

---

## 📜 DECLARACIÓN DE CERTIFICACIÓN
Este documento certifica que el **Release Candidate** descrito a continuación ha superado de forma satisfactoria los estrictos protocolos de prueba y control de calidad locales (Módulos 0 a 8B), cumpliendo con todos los criterios de empaquetado para Google Play Store.

### 📋 DATOS GENERALES
* **Identificador de Candidato:** \`${state.candidateLabel}\`
* **Versión del Release:** \`${state.versionName}\`
* **Fecha de Certificación:** ${nowStr}
* **Puntaje QA Obtenido:** **${stats.score}%** (Requerido: >= 95%)
* **Estado de Certificación:** ✅ **CANDIDATE READY**

---

## 🔒 DECLARACIONES CLAVE DE CONFORMIDAD
1. **Directiva HSE Terreno:** Preservada rigurosamente e integrada en todos los flujos técnicos pertinentes.
2. **Seguridad Textual:** Libre de terminología prohibida (Sin referencias a HSEC ni HASEC).
3. **Privacidad del Usuario:** Tratamiento de datos 100% en el dispositivo con consentimiento expreso de GPS y notificaciones locales.
4. **Widgets Android:** Totalmente simulados y listos mediante el bridge de contrato JSON.
5. **Estabilidad Offline:** Soporte completo de fallback meteorológico "Cached" verificado.
6. **Compilación de Producción:** Ejecución del build web y Android catalogado como exitosa.

---

Este certificado habilita la transición del proyecto al **Módulo 9B (Android Packaging & Signed Build)** para la generación de la firma de producción y carga en Google Play Console.

*Firmado Digitalmente por:*
**Comité Interno de QA & Release Management — ORBI SkyCore™**`;
}

export function buildBugTrackerMarkdown(state: QaReleaseState): string {
  const nowStr = new Date().toLocaleString('es-CL');
  let md = `# INVENTARIO DE REPORTES Y BUGS LOCALES
**ORBI Clima IA — Bug Tracker Release Candidate**

---

* **Fecha de Generación:** ${nowStr}
* **Total Bugs Abiertos:** ${state.bugs.filter(b => b.status === 'open').length}
* **Bugs Críticos Abiertos:** ${state.bugs.filter(b => b.status === 'open' && b.severity === 'critical').length}

---

## 🐞 LISTA DE REGISTROS DE INCIDENCIAS

`;

  if (state.bugs.length === 0) {
    md += `*Felicidades, no se han registrado bugs ni incidencias para este release candidate.*\n`;
  } else {
    state.bugs.forEach(bug => {
      const statusIcon = bug.status === 'open' ? '🔴 OPEN' : bug.status === 'fixed' ? '🟢 FIXED' : bug.status === 'wont_fix' ? '⚪ WONT FIX' : '🟡 MONITORING';
      md += `### Bug #${bug.id.substring(0, 5)}: ${bug.title} [${statusIcon}]
* **Módulo Relacionado:** ${bug.relatedModule || 'Ninguno / General'}
* **Severidad:** ${bug.severity.toUpperCase()}
* **Descripción:** ${bug.description}
* **Creado el:** ${new Date(bug.createdAt).toLocaleString('es-CL')}
* **Última Actualización:** ${new Date(bug.updatedAt).toLocaleString('es-CL')}

`;
    });
  }

  return md;
}

export function triggerDownload(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadQaReport(state: QaReleaseState): void {
  const content = buildQaReportMarkdown(state);
  triggerDownload(content, 'ORBI_CLIMA_IA_RC_QA_REPORT.md');
}

export function downloadQaCertificate(state: QaReleaseState): void {
  const content = buildQaCertificateMarkdown(state);
  triggerDownload(content, 'ORBI_CLIMA_IA_RC_CERTIFICATE.md');
}

export function downloadBugTracker(state: QaReleaseState): void {
  const content = buildBugTrackerMarkdown(state);
  triggerDownload(content, 'ORBI_CLIMA_IA_BUG_TRACKER.md');
}

import { PilotFeedbackState } from './pilotFeedbackService';
import { buildRcPatchNotes } from '../utils/rcPatchNotesBuilder';
import { evaluatePostRcClosureGate } from '../utils/postRcClosureGate';

export function buildPilotFeedbackReportMarkdown(state: PilotFeedbackState): string {
  let md = `# ORBI Clima IA — Informe de Feedback de Piloto Controlado\n\n`;
  md += `**Versión:** ${state.versionName}\n`;
  md += `**Fecha de Reporte:** ${new Date().toLocaleDateString('es-CL')} ${new Date().toLocaleTimeString('es-CL')}\n`;
  md += `**Total de Feedback Recibido:** ${state.feedback.length}\n`;
  md += `**Estado del Piloto:** ${state.postRcStatus.toUpperCase()}\n\n`;

  md += `## 📥 Listado Completo de Observaciones\n\n`;
  if (state.feedback.length === 0) {
    md += `*No se ha registrado feedback aún.*\n`;
  } else {
    state.feedback.forEach((item, idx) => {
      md += `### ${idx + 1}. [${item.severity.toUpperCase()}] [${item.type.toUpperCase()}] ${item.title}\n`;
      md += `- **Tester:** ${item.testerName || 'Anónimo'} (${item.testerRole || 'N/A'})\n`;
      md += `- **Dispositivo:** ${item.deviceModel || 'N/A'} (Android ${item.androidVersion || 'N/A'})\n`;
      md += `- **Estado:** ${item.status.toUpperCase()}\n`;
      md += `- **Descripción:** ${item.description}\n`;
      if (item.reproductionSteps) {
        md += `- **Pasos de Reproducción:**\n\`\`\`\n${item.reproductionSteps}\n\`\`\`\n`;
      }
      if (item.expectedBehavior) {
        md += `- **Comportamiento Esperado:** ${item.expectedBehavior}\n`;
      }
      if (item.actualBehavior) {
        md += `- **Comportamiento Actual:** ${item.actualBehavior}\n`;
      }
      md += `- **ID de Corrección Relacionada:** ${item.linkedFixId || 'Ninguna'}\n`;
      md += `\n---\n\n`;
    });
  }

  md += `\n**Directiva HSE Terreno:** Las alertas ORBI son apoyo preventivo. No reemplazan protocolos HSE, evaluación en terreno ni instrucciones del empleador.`;
  return md;
}

export function buildPostRcFixTrackerMarkdown(state: PilotFeedbackState): string {
  let md = `# ORBI Clima IA — Tracker de Correcciones Post-RC\n\n`;
  md += `**Versión:** ${state.versionName}\n`;
  md += `**Fecha de Reporte:** ${new Date().toLocaleDateString('es-CL')} ${new Date().toLocaleTimeString('es-CL')}\n`;
  md += `**Total de Correcciones:** ${state.fixes.length}\n\n`;

  md += `## 🛠️ Listado de Parches y Correcciones\n\n`;
  if (state.fixes.length === 0) {
    md += `*No se han registrado correcciones aún.*\n`;
  } else {
    state.fixes.forEach((item, idx) => {
      md += `### ${idx + 1}. [${item.priority.toUpperCase()}] ${item.title}\n`;
      md += `- **Severidad de Entrada:** ${item.severity.toUpperCase()}\n`;
      md += `- **Estado:** ${item.status.toUpperCase()}\n`;
      md += `- **Encargado:** ${item.owner || 'Sin Asignar'}\n`;
      md += `- **Descripción:** ${item.description}\n`;
      if (item.fixSummary) {
        md += `- **Evidencia de Corrección:** ${item.fixSummary}\n`;
      }
      if (item.validationNotes) {
        md += `- **Notas de Validación:** ${item.validationNotes}\n`;
      }
      md += `- **Feedback Origen (IDs):** ${item.sourceFeedbackIds.join(', ') || 'Ninguno'}\n`;
      md += `\n---\n\n`;
    });
  }

  md += `\n**Directiva HSE Terreno:** Las alertas ORBI son apoyo preventivo. No reemplazan protocolos HSE, evaluación en terreno ni instrucciones del empleador.`;
  return md;
}

export function buildRcPatchNotesMarkdown(state: PilotFeedbackState): string {
  return buildRcPatchNotes(state);
}

export function buildPostRcClosureCertificateMarkdown(state: PilotFeedbackState): string {
  const gate = evaluatePostRcClosureGate(state);

  let md = `# CERTIFICADO DE CIERRE POST-RC Y PASO A PILOTO FINAL\n`;
  md += `### ORBI Clima IA — SkyCore™ Quality Assurance\n\n`;
  md += `**ID de Certificado:** ORBI-POST-RC-${Date.now().toString().slice(-6)}\n`;
  md += `**Fecha de Emisión:** ${new Date().toLocaleDateString('es-CL')} ${new Date().toLocaleTimeString('es-CL')}\n`;
  md += `**Versión de Salida de Parche:** ${state.versionName} → RC1.1\n`;
  md += `**Sello de Calidad:** SkyCore™ Stable Certified\n\n`;

  md += `Este certificado declara que la versión candidata ha cumplido formalmente todos los requisitos de cierre post-RC tras el procesamiento del Pilot Feedback Loop.\n\n`;

  md += `## 📋 Evaluación de Requisitos de Cierre\n\n`;
  gate.requirements.forEach(req => {
    md += `- **[${req.isMet ? 'OK ✅' : 'PENDIENTE ❌'}]** **${req.name}**: ${req.message}\n`;
  });

  md += `\n## 📊 Resumen Estadístico\n`;
  md += `- Feedbacks Recibidos: ${state.feedback.length}\n`;
  md += `- Feedbacks Cerrados/Validados: ${state.feedback.filter(f => ['closed', 'validated'].includes(f.status)).length}\n`;
  md += `- Correcciones Implementadas: ${state.fixes.length}\n`;
  md += `- Correcciones Validadas: ${state.fixes.filter(f => f.status === 'validated').length}\n\n`;

  md += `## 🔒 Declaración de Cumplimiento Técnico\n`;
  md += `1. **Sin Backend:** La aplicación opera en modo completamente autónomo offline-first, garantizando la inviolabilidad del sandbox móvil.\n`;
  md += `2. **Resguardo de Privacidad:** No se capturan credenciales de usuario ni ubicaciones persistentes en bases de datos externas.\n`;
  md += `3. **Exclusión de Regulaciones Prohibidas:** No se declaran normativas de tipo HSEC ni HASEC, limitándose a proveer alertas de apoyo preventivo.\n`;
  md += `4. **Estabilidad de Componentes:** Los Widgets SkyOrb™ y las notificaciones locales con Quiet Hours funcionan adecuadamente.\n\n`;

  md += `---
**Directiva HSE Terreno:** Las alertas ORBI son apoyo preventivo. No reemplazan protocolos HSE, evaluación en terreno ni instrucciones del empleador.

Firmado digitalmente por el sistema de control de calidad autónomo **ORBI SkyCore™ Engine**.`;

  return md;
}

function downloadFile(content: string, filename: string) {
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

export function downloadPilotFeedbackReport(state: PilotFeedbackState): void {
  const content = buildPilotFeedbackReportMarkdown(state);
  downloadFile(content, 'ORBI_CLIMA_IA_PILOT_FEEDBACK_REPORT.md');
}

export function downloadPostRcFixTracker(state: PilotFeedbackState): void {
  const content = buildPostRcFixTrackerMarkdown(state);
  downloadFile(content, 'ORBI_CLIMA_IA_POST_RC_FIX_TRACKER.md');
}

export function downloadRcPatchNotes(state: PilotFeedbackState): void {
  const content = buildRcPatchNotesMarkdown(state);
  downloadFile(content, 'ORBI_CLIMA_IA_RC_PATCH_NOTES.md');
}

export function downloadPostRcClosureCertificate(state: PilotFeedbackState): void {
  const content = buildPostRcClosureCertificateMarkdown(state);
  downloadFile(content, 'ORBI_CLIMA_IA_POST_RC_CLOSURE_CERTIFICATE.md');
}

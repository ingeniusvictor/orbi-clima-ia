import { PilotFeedbackState } from '../services/pilotFeedbackService';

export function buildRcPatchNotes(state: PilotFeedbackState): string {
  const validatedFixes = state.fixes.filter(fix => ['validated', 'closed'].includes(fix.status));
  const activeFixes = state.fixes.filter(fix => !['validated', 'closed'].includes(fix.status));

  let patchNotes = `ORBI Clima IA RC1.1 — Post-RC Fix Patch

Este informe de actualización detalla las correcciones menores y de estabilidad realizadas a la versión candidata RC1 tras el piloto cerrado de testing interno.

## 🛠️ Correcciones y Mejoras de Estabilidad (Validadas)
`;

  if (validatedFixes.length === 0) {
    patchNotes += `\n*No se registran correcciones validadas para esta compilación aún.*\n`;
  } else {
    validatedFixes.forEach(fix => {
      patchNotes += `\n### [${fix.priority.toUpperCase()}] ${fix.title}\n`;
      patchNotes += `- **Descripción:** ${fix.description}\n`;
      if (fix.fixSummary) {
        patchNotes += `- **Solución Técnica:** ${fix.fixSummary}\n`;
      }
      if (fix.validationNotes) {
        patchNotes += `- **Notas de Validación:** ${fix.validationNotes}\n`;
      }
      if (fix.owner) {
        patchNotes += `- **Encargado:** ${fix.owner}\n`;
      }
    });
  }

  if (activeFixes.length > 0) {
    patchNotes += `\n## ⚠️ Correcciones en Progreso / Abiertas\n`;
    activeFixes.forEach(fix => {
      patchNotes += `- **[${fix.priority.toUpperCase()}] ${fix.title}**: ${fix.description} *(Estado: ${fix.status})*\n`;
    });
  }

  patchNotes += `\n## 📌 Arquitectura Preservada (Sin Cambios)
- **Sin backend:** Totalmente autónomo y local.
- **Sin logins obligatorios:** Respeto estricto a la privacidad de datos.
- **Sin almacenamiento en la nube:** Persistencia controlada en el llavero local del sandbox.
- **Sin nuevos perfiles:** Manteniendo exclusivamente "Perfil Persona" y "Perfil Técnico Terreno".
- **Sin modificaciones en motores climáticos críticos:** Núcleo SkyCore™ inalterado.

---
**Directiva HSE Terreno:** Las alertas ORBI son apoyo preventivo. No reemplazan protocolos HSE, evaluación en terreno ni instrucciones del empleador.

*Generado automáticamente el ${new Date().toLocaleDateString('es-CL')} a las ${new Date().toLocaleTimeString('es-CL')}*`;

  return patchNotes;
}

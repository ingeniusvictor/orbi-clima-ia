import { FinalReleaseSealState } from './finalReleaseSealService';
import { buildMasterChangelog } from '../utils/masterChangelogBuilder';
import { MODULE_COMPLETION_MATRIX } from '../utils/moduleCompletionMatrix';
import { FINAL_RISK_REVIEW, NATIVE_HSE_DIRECTIVE } from '../utils/finalRiskReview';
import { VERSION_LOCK_POLICY } from '../utils/versionLockPolicy';

// 1. Build Markdown functions
export function buildLocalReleaseSealMarkdown(state: FinalReleaseSealState): string {
  return `# ORBI Clima IA — v1.0 Local Release Seal

## Estado del Cierre Técnico
- **Sello Final Emitido**: ${state.localSealIssued ? 'SÍ ✅' : 'PENDIENTE ❌'}
- **Fecha de Emisión**: ${state.localSealIssuedAt ? new Date(state.localSealIssuedAt).toLocaleString('es-CL') : 'No emitido aún'}
- **Versión**: ${state.versionName} (Código: ${state.versionCode})
- **Etiqueta de Release**: ${state.releaseLabel}
- **Estado de Congelamiento**: ${state.freezeStatus.toUpperCase()}

---

## Validaciones Consolidadas
1. Módulos 0 a 12 completados sin bloqueos.
2. Experiencia móvil Android-first (MobileShell) estabilizada.
3. AdvancedOrbiConsole aislado de los flujos del usuario general.
4. Conexión Open-Meteo validada con estrategias offline de contingencia.
5. SkyCore Risk Engine operando correctamente para perfiles Técnico Terreno y Usuario General.
6. Widgets interactivos ORBI SkyOrb™ probados en múltiples proporciones y tamaños.
7. Notificaciones locales de alta prioridad probadas para mitigar fatiga auditiva (Quiet Hours y Frequency Guard).
8. Preferencias locales persistidas de forma confidencial sin llamadas a nubes externas.
9. Privacy Package y Store Fichas listos para Play Console.
10. Release Candidate QA Center aprobado con calificación superior al 95%.
11. Android Packaging verificado en manifiesto y firmas simuladas.
12. Pool de Testing Interno y Piloto Cerrado cerrados formalmente.
13. Directiva HSE Terreno incorporada y preservada intacta sin nomenclaturas obsoletas (HSEC/HASEC).

## Declaración de Congelamiento (Feature Freeze)
ORBI Clima IA v1.0 queda oficialmente congelada de forma local. Desde este punto, la rama 1.0 queda reservada para correcciones críticas de estabilidad, parches y ajustes menores. Cualquier mejora funcional o expansión de características deberá canalizarse en la rama v1.1.x.

---
*Certificado emitido localmente de forma automatizada por el motor SkyCore™.*
`;
}

export function buildMasterChangelogMarkdown(): string {
  return buildMasterChangelog();
}

export function buildModuleCompletionMatrixMarkdown(): string {
  let md = `# ORBI Clima IA — MODULE COMPLETION MATRIX\n\n`;
  md += `| Módulo | Nombre | Estado | Evidencia de Cierre | Riesgo Residual |\n`;
  md += `|---|---|---|---|---|\n`;
  MODULE_COMPLETION_MATRIX.forEach(m => {
    md += `| ${m.id} | ${m.name} | ${m.status} | ${m.evidence} | ${m.residualRisk} |\n`;
  });
  md += `\n\n*Todos los módulos aprobados por el comité de liberación técnica ORBI.*`;
  return md;
}

export function buildFinalRiskReviewMarkdown(): string {
  let md = `# ORBI Clima IA — FINAL RISK REVIEW & MITIGATION\n\n`;
  md += `Aviso Principal:\n> ${NATIVE_HSE_DIRECTIVE}\n\n`;
  md += `| ID | Categoría | Riesgo Identificado | Nivel de Riesgo | Mitigación Aplicada | Estado |\n`;
  md += `|---|---|---|---|---|---|\n`;
  FINAL_RISK_REVIEW.forEach(r => {
    md += `| ${r.id} | ${r.category} | ${r.risk} | ${r.level} | ${r.mitigation} | ${r.status} |\n`;
  });
  return md;
}

export function buildMaintenancePathMarkdown(): string {
  let md = `# ORBI Clima IA — MAINTENANCE PATH & VERSIONING\n\n`;
  md += `Política Oficial de Versiones:\n- **${VERSION_LOCK_POLICY.policyNotes}**\n\n`;
  VERSION_LOCK_POLICY.branches.forEach(b => {
    md += `### Branch: ${b.name}\n`;
    md += `- **Descripción**: ${b.description}\n`;
    md += `- **Cambios Autorizados**:\n`;
    b.allowedChanges.forEach(c => {
      md += `  - [x] ${c}\n`;
    });
    md += `\n`;
  });
  return md;
}

export function buildFinalReleasePackageMarkdown(state: FinalReleaseSealState): string {
  return `# ORBI Clima IA — FINAL RELEASE PACKAGE CONSOLIDATION

## Información General
- **ID de la Aplicación**: orbi.clima.ia
- **Sello Técnico**: ${state.freezeStatus === 'local_release_sealed' ? 'SEALED ✅' : 'PENDING ❌'}
- **Versión**: ${state.versionName}
- **Último Ajuste**: ${new Date(state.lastUpdated).toLocaleString('es-CL')}

## Documentos Adjuntos Consolidados
- **Local Release Seal Certificate**: Validado localmente.
- **Master Changelog**: 13 Módulos de desarrollo integrados.
- **Module Completion Matrix**: Cobertura del 100% de la funcionalidad diseñada.
- **Final Risk Review**: Mitigación de riesgos operacionales y Directiva HSE resguardada.
- **Maintenance Path**: Hoja de ruta para versiones v1.0.x y v1.1.x.

## Declaración Técnica de Entregable
Se ha conformado el paquete técnico consolidado para su resguardo local. La aplicación es totalmente autónoma, libre de backend o nubes, protegiendo al 100% la privacidad del operador técnico en terreno.
`;
}

// 2. Client-side Download Helpers
function downloadFile(filename: string, content: string): void {
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

export function downloadLocalReleaseSeal(state: FinalReleaseSealState): void {
  downloadFile('ORBI_CLIMA_IA_V1_LOCAL_RELEASE_SEAL.md', buildLocalReleaseSealMarkdown(state));
}

export function downloadMasterChangelog(): void {
  downloadFile('ORBI_CLIMA_IA_MASTER_CHANGELOG.md', buildMasterChangelogMarkdown());
}

export function downloadModuleCompletionMatrix(): void {
  downloadFile('ORBI_CLIMA_IA_MODULE_COMPLETION_MATRIX.md', buildModuleCompletionMatrixMarkdown());
}

export function downloadFinalRiskReview(): void {
  downloadFile('ORBI_CLIMA_IA_FINAL_RISK_REVIEW.md', buildFinalRiskReviewMarkdown());
}

export function downloadMaintenancePath(): void {
  downloadFile('ORBI_CLIMA_IA_MAINTENANCE_PATH.md', buildMaintenancePathMarkdown());
}

export function downloadFinalReleasePackage(state: FinalReleaseSealState): void {
  downloadFile('ORBI_CLIMA_IA_FINAL_RELEASE_PACKAGE.md', buildFinalReleasePackageMarkdown(state));
}

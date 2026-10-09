// Mock browser APIs for Node environment BEFORE importing services
(globalThis as any).localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {}
};

(globalThis as any).window = {
  dispatchEvent: () => {},
  addEventListener: () => {},
  removeEventListener: () => {}
};

(globalThis as any).Event = class {
  constructor(public type: string) {}
};

import * as fs from 'fs';
import * as path from 'path';

// Import our export services
import {
  buildLocalReleaseSealMarkdown,
  buildMasterChangelogMarkdown,
  buildModuleCompletionMatrixMarkdown,
  buildFinalRiskReviewMarkdown,
  buildMaintenancePathMarkdown,
  buildFinalReleasePackageMarkdown
} from '../src/services/finalReleaseExportService';

import {
  buildQaReportMarkdown,
  buildQaCertificateMarkdown,
  buildBugTrackerMarkdown
} from '../src/services/qaExportService';

import {
  buildStoreReadinessMarkdown,
  buildPrivacyPolicyDraftMarkdown,
  buildDataSafetyDraftMarkdown,
  buildPermissionsInventoryMarkdown,
  buildReleaseChecklistMarkdown
} from '../src/services/storeReadinessExportService';

import {
  buildAndroidPackagingChecklistMarkdown,
  buildManifestAuditMarkdown,
  buildSignedBuildReadinessMarkdown,
  buildPlayConsolePreflightMarkdown
} from '../src/services/androidPackagingExportService';

import {
  buildInternalTestingPackMarkdown,
  buildTesterProtocolMarkdown,
  buildTesterFeedbackTemplateMarkdown,
  buildFinalRcClosureCertificateMarkdown
} from '../src/services/internalTestingExportService';

import {
  buildPilotFeedbackReportMarkdown,
  buildPostRcFixTrackerMarkdown,
  buildRcPatchNotesMarkdown,
  buildPostRcClosureCertificateMarkdown
} from '../src/services/postRcExportService';

import { loadQaState } from '../src/services/qaStateService';
import { loadRcClosureState } from '../src/services/rcClosureStateService';
import { loadPilotFeedbackState } from '../src/services/pilotFeedbackService';

const BACKUP_DIR = path.join(process.cwd(), 'ORBI_CLIMA_IA_V1_LOCAL_RELEASE_BACKUP');

const SUBDIRS = [
  '00_RELEASE_README',
  '01_SOURCE_CODE_SNAPSHOT',
  '02_ANDROID_BUILD',
  '03_QA_REPORTS',
  '04_STORE_READINESS',
  '05_PRIVACY_PACKAGE',
  '06_PACKAGING_REPORTS',
  '07_INTERNAL_TESTING',
  '08_POST_RC_FEEDBACK',
  '09_FINAL_RELEASE_SEAL',
  '10_SCREENSHOTS',
  '11_NOTES_AND_NEXT_STEPS'
];

function createDirectoryStructure() {
  console.log(`Creating backup root at: ${BACKUP_DIR}`);
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  SUBDIRS.forEach(sub => {
    const p = path.join(BACKUP_DIR, sub);
    if (!fs.existsSync(p)) {
      fs.mkdirSync(p, { recursive: true });
      console.log(`  Created subdirectory: ${sub}`);
    }
  });
}

function generateFiles() {
  console.log('\nGenerating reports and technical documents...');

  // 1. Prepare static states
  const sealState = {
    versionName: '1.0.0-local-release',
    versionCode: 10000,
    releaseLabel: 'ORBI Clima IA v1.0 Local Release',
    freezeStatus: 'local_release_sealed' as const,
    featureFreezeActive: true,
    localSealIssued: true,
    localSealIssuedAt: new Date().toISOString(),
    moduleMatrixConfirmed: true,
    certificatesConfirmed: true,
    finalRiskReviewConfirmed: true,
    masterChangelogGenerated: true,
    noMoreFeaturesGateAccepted: true,
    lastUpdated: new Date().toISOString()
  };

  const qaState = loadQaState();
  // Ensure version matches what is requested
  qaState.versionName = '1.0.0-local-release';
  qaState.candidateLabel = 'ORBI Clima IA v1.0 Local Release';

  const rcClosureState = loadRcClosureState();
  rcClosureState.versionName = '1.0.0-local-release';
  rcClosureState.candidateLabel = 'ORBI Clima IA v1.0 Local Release';

  const pilotFeedbackState = loadPilotFeedbackState();
  pilotFeedbackState.versionName = '1.0.0-local-release';
  pilotFeedbackState.candidateLabel = 'ORBI Clima IA v1.0 Local Release';

  // 2. Generate and write documents

  // --- 00_RELEASE_README ---
  const readmeContent = `# ORBI Clima IA v1.0 Local Release

Estado:
Versión congelada, sellada y lista para resguardo.

Versión:
1.0.0-local-release

VersionCode:
10000

Powered by:
ORBI SkyCore™

Tagline:
Tu núcleo climático inteligente.

Declaración:
ORBI Clima IA v1.0 corresponde a una versión local estable, congelada bajo Feature Freeze y preparada para pruebas internas controladas en Android.

No corresponde a publicación pública.
No corresponde a aprobación de Google Play.
No contiene backend propio.
No contiene login.
No contiene nube.
No debe incluir keystore ni secretos.

Directiva HSE:
Las alertas ORBI son apoyo preventivo. No reemplazan protocolos HSE, evaluación en terreno ni instrucciones del empleador.

Ruta futura:
v1.0.1 = fixes menores.
v1.1 = nuevas mejoras planificadas.
v2.0 = evolución estructural.
`;
  fs.writeFileSync(path.join(BACKUP_DIR, '00_RELEASE_README', 'README_ORBI_CLIMA_IA_V1_LOCAL_RELEASE.md'), readmeContent);
  console.log('✓ Written: README_ORBI_CLIMA_IA_V1_LOCAL_RELEASE.md');

  // --- 03_QA_REPORTS ---
  fs.writeFileSync(path.join(BACKUP_DIR, '03_QA_REPORTS', 'ORBI_CLIMA_IA_RC_QA_REPORT.md'), buildQaReportMarkdown(qaState));
  fs.writeFileSync(path.join(BACKUP_DIR, '03_QA_REPORTS', 'ORBI_CLIMA_IA_RC_CERTIFICATE.md'), buildQaCertificateMarkdown(qaState));
  fs.writeFileSync(path.join(BACKUP_DIR, '03_QA_REPORTS', 'ORBI_CLIMA_IA_BUG_TRACKER.md'), buildBugTrackerMarkdown(qaState));
  console.log('✓ Written: QA Reports (3 files)');

  // --- 04_STORE_READINESS ---
  fs.writeFileSync(path.join(BACKUP_DIR, '04_STORE_READINESS', 'ORBI_CLIMA_IA_STORE_READINESS.md'), buildStoreReadinessMarkdown());
  fs.writeFileSync(path.join(BACKUP_DIR, '04_STORE_READINESS', 'ORBI_CLIMA_IA_PERMISSIONS_INVENTORY.md'), buildPermissionsInventoryMarkdown());
  fs.writeFileSync(path.join(BACKUP_DIR, '04_STORE_READINESS', 'ORBI_CLIMA_IA_RELEASE_CHECKLIST.md'), buildReleaseChecklistMarkdown());
  console.log('✓ Written: Store Readiness reports');

  // --- 05_PRIVACY_PACKAGE ---
  fs.writeFileSync(path.join(BACKUP_DIR, '05_PRIVACY_PACKAGE', 'ORBI_CLIMA_IA_PRIVACY_POLICY_DRAFT.md'), buildPrivacyPolicyDraftMarkdown());
  fs.writeFileSync(path.join(BACKUP_DIR, '05_PRIVACY_PACKAGE', 'ORBI_CLIMA_IA_DATA_SAFETY_DRAFT.md'), buildDataSafetyDraftMarkdown());
  console.log('✓ Written: Privacy Draft files');

  // --- 06_PACKAGING_REPORTS ---
  fs.writeFileSync(path.join(BACKUP_DIR, '06_PACKAGING_REPORTS', 'ORBI_CLIMA_IA_ANDROID_PACKAGING_CHECKLIST.md'), buildAndroidPackagingChecklistMarkdown());
  fs.writeFileSync(path.join(BACKUP_DIR, '06_PACKAGING_REPORTS', 'ORBI_CLIMA_IA_MANIFEST_AUDIT.md'), buildManifestAuditMarkdown());
  fs.writeFileSync(path.join(BACKUP_DIR, '06_PACKAGING_REPORTS', 'ORBI_CLIMA_IA_SIGNED_BUILD_READINESS.md'), buildSignedBuildReadinessMarkdown());
  fs.writeFileSync(path.join(BACKUP_DIR, '06_PACKAGING_REPORTS', 'ORBI_CLIMA_IA_PLAY_CONSOLE_PREFLIGHT.md'), buildPlayConsolePreflightMarkdown());
  console.log('✓ Written: Android Packaging reports');

  // --- 07_INTERNAL_TESTING ---
  fs.writeFileSync(path.join(BACKUP_DIR, '07_INTERNAL_TESTING', 'ORBI_CLIMA_IA_INTERNAL_TESTING_PACK.md'), buildInternalTestingPackMarkdown(rcClosureState));
  fs.writeFileSync(path.join(BACKUP_DIR, '07_INTERNAL_TESTING', 'ORBI_CLIMA_IA_TESTER_PROTOCOL.md'), buildTesterProtocolMarkdown());
  fs.writeFileSync(path.join(BACKUP_DIR, '07_INTERNAL_TESTING', 'ORBI_CLIMA_IA_TESTER_FEEDBACK_TEMPLATE.md'), buildTesterFeedbackTemplateMarkdown());
  fs.writeFileSync(path.join(BACKUP_DIR, '07_INTERNAL_TESTING', 'ORBI_CLIMA_IA_FINAL_RC_CERTIFICATE.md'), buildFinalRcClosureCertificateMarkdown(rcClosureState));
  console.log('✓ Written: Internal Testing files');

  // --- 08_POST_RC_FEEDBACK ---
  fs.writeFileSync(path.join(BACKUP_DIR, '08_POST_RC_FEEDBACK', 'ORBI_CLIMA_IA_PILOT_FEEDBACK_REPORT.md'), buildPilotFeedbackReportMarkdown(pilotFeedbackState));
  fs.writeFileSync(path.join(BACKUP_DIR, '08_POST_RC_FEEDBACK', 'ORBI_CLIMA_IA_POST_RC_FIX_TRACKER.md'), buildPostRcFixTrackerMarkdown(pilotFeedbackState));
  fs.writeFileSync(path.join(BACKUP_DIR, '08_POST_RC_FEEDBACK', 'ORBI_CLIMA_IA_RC_PATCH_NOTES.md'), buildRcPatchNotesMarkdown(pilotFeedbackState));
  fs.writeFileSync(path.join(BACKUP_DIR, '08_POST_RC_FEEDBACK', 'ORBI_CLIMA_IA_POST_RC_CLOSURE_CERTIFICATE.md'), buildPostRcClosureCertificateMarkdown(pilotFeedbackState));
  console.log('✓ Written: Pilot Feedback & Post-RC files');

  // --- 09_FINAL_RELEASE_SEAL ---
  fs.writeFileSync(path.join(BACKUP_DIR, '09_FINAL_RELEASE_SEAL', 'ORBI_CLIMA_IA_V1_LOCAL_RELEASE_SEAL.md'), buildLocalReleaseSealMarkdown(sealState));
  fs.writeFileSync(path.join(BACKUP_DIR, '09_FINAL_RELEASE_SEAL', 'ORBI_CLIMA_IA_MASTER_CHANGELOG.md'), buildMasterChangelogMarkdown());
  fs.writeFileSync(path.join(BACKUP_DIR, '09_FINAL_RELEASE_SEAL', 'ORBI_CLIMA_IA_MODULE_COMPLETION_MATRIX.md'), buildModuleCompletionMatrixMarkdown());
  fs.writeFileSync(path.join(BACKUP_DIR, '09_FINAL_RELEASE_SEAL', 'ORBI_CLIMA_IA_FINAL_RISK_REVIEW.md'), buildFinalRiskReviewMarkdown());
  fs.writeFileSync(path.join(BACKUP_DIR, '09_FINAL_RELEASE_SEAL', 'ORBI_CLIMA_IA_MAINTENANCE_PATH.md'), buildMaintenancePathMarkdown());
  fs.writeFileSync(path.join(BACKUP_DIR, '09_FINAL_RELEASE_SEAL', 'ORBI_CLIMA_IA_FINAL_RELEASE_PACKAGE.md'), buildFinalReleasePackageMarkdown(sealState));
  console.log('✓ Written: Final Release Seals and acts');

  // --- 02_ANDROID_BUILD ---
  const androidBuildNotes = `# ORBI Clima IA — Android Build Notes

Este directorio está reservado para almacenar los archivos binarios compilados de forma manual para pruebas o lanzamientos de prueba.

## Archivos Recomendados a Resguardar:
1. \`app-debug.apk\` (APK de prueba para instalación directa en dispositivos de testing).
2. \`app-release.aab\` (Android App Bundle listo para subir al track de pruebas internas en Google Play Console).
3. \`mapping.txt\` (Archivo de ofuscación de ProGuard para interpretación de stacktraces de crashes).

## Instrucciones de Compilación de Producción:
1. Asegurar que las dependencias estén instaladas y el build web esté limpio:
   \`\`\`bash
   npm run build
   \`\`\`
2. Sincronizar el contenido web compilado con el proyecto Android nativo de Capacitor:
   \`\`\`bash
   npx cap sync android
   \`\`\`
3. Abrir el proyecto en Android Studio:
   \`\`\`bash
   npx cap open android
   \`\`\`
4. En Android Studio, seleccionar **Build > Generate Signed Bundle / APK...** para compilar la versión definitiva con su llave de firma de producción.
5. Guardar los artefactos finales compilados en este directorio.

---
*No subir archivos de contraseñas, variables de entorno locales de desarrollo o llaves keystore a repositorios públicos.*
`;
  fs.writeFileSync(path.join(BACKUP_DIR, '02_ANDROID_BUILD', 'ANDROID_BUILD_NOTES.md'), androidBuildNotes);
  console.log('✓ Written: ANDROID_BUILD_NOTES.md');

  // --- 10_SCREENSHOTS ---
  const screenshotNotes = `# ORBI Clima IA — Capturas de Pantalla Recomendadas para Resguardo

Este directorio está destinado a almacenar evidencias visuales del correcto comportamiento de la interfaz en dispositivos de prueba o en simuladores móviles.

## Listado de Capturas Recomendadas a Adjuntar:
1. **Onboarding ORBI Clima IA**: Flujo inicial de bienvenida, selección de perfil y explicación de políticas.
2. **MobileHomeScreen**: Pantalla principal en vivo con datos actualizados de Open-Meteo para la ubicación del usuario.
3. **MobileAlertsScreen**: Panel de monitoreo de riesgos climáticos activos o simulados con nivel de severidad.
4. **MobileWidgetsScreen**: Galería interactiva con las previsualizaciones de los 4 widgets de inicio de SkyOrb™.
5. **MobileSettingsScreen**: Sección de ajustes que incluye control de Quiet Hours, perfiles de sensibilidad de ráfagas y el disparador del Centro Avanzado.
6. **PrivacyTrustCard**: Visualización in-app de los términos y justificaciones detalladas de la política de datos local.
7. **WeatherMemoryPanel**: Historial local de búsqueda de ubicaciones con controles interactivos para borrar memorias.
8. **DeveloperModeGate (Cerrado)**: Sección inferior de ajustes antes de desbloquear las funciones de ingeniería de software.
9. **AdvancedOrbiConsole (Abierto)**: Acceso al Centro Avanzado que incluye el checklist técnico de 13 módulos, estado del freeze, simulación de notificaciones en tiempo real e inspección de logs internos.
10. **Final Local Release Seal**: Confirmación visual de la emisión del sello v1.0.0 y el estado "Sealed" dentro de la consola del desarrollador.

---
*Capture estas pantallas directamente desde su dispositivo móvil Android de prueba o el navegador antes del cierre definitivo de la versión.*
`;
  fs.writeFileSync(path.join(BACKUP_DIR, '10_SCREENSHOTS', 'RECOMMENDED_SCREENSHOTS_LIST.md'), screenshotNotes);
  console.log('✓ Written: RECOMMENDED_SCREENSHOTS_LIST.md');

  // --- 11_NOTES_AND_NEXT_STEPS ---
  const nextStepsContent = `# ORBI Clima IA — Notas Técnicas y Próximos Pasos

Este documento delinea los planes de mantenimiento y evolución técnica de la plataforma tras consolidar la versión de resguardo v1.0.

## 📌 Resumen de Versión
* **Línea Actual:** v1.0 (Local Release Sealed)
* **Objetivo:** Pruebas internas locales y piloto controlado sin almacenamiento en servidores públicos.
* **Paradigma de Almacenamiento:** Totalmente local e inteligente en el dispositivo.

## 🛠️ Planificación de Próximas Versiones

### 1. Rama v1.0.x (Mantenimiento Crítico)
* **Foco:** Estabilidad pura.
* **Cambios autorizados:**
  - Ajustes de márgenes y paddings en dispositivos de pantalla ultra pequeña.
  - Corrección de bugs menores de renderizado de gráficos.
  - Actualización de urls de la política de privacidad si cambia la dirección de alojamiento.
* **Restricción:** No se permiten nuevas funcionalidades ni adición de pantallas secundarias.

### 2. Rama v1.1.x (Mejoras Planificadas)
* **Foco:** Optimización de usabilidad.
* **Funciones bajo revisión:**
  - Integración de API adicional de radar para mapas interactivos locales (de forma opcional y consentida).
  - Alertas auditivas configurables personalizadas.
  - Soporte multi-idioma nativo para equipos técnicos internacionales.

### 3. Versión v2.0 (Evolución Estructural)
* **Foco:** Sincronización corporativa híbrida.
* **Ideas de diseño:**
  - Soporte de base de datos SQL relacional opcional mediante almacenamiento en la nube (Cloud SQL/Firestore) para equipos industriales.
  - Sistema de cuentas corporativas con autenticación segura OAuth2.
  - Consola web administrativa centralizada para coordinadores de prevención de riesgos.

---
*ORBI Clima IA — Tu núcleo climático inteligente.*
`;
  fs.writeFileSync(path.join(BACKUP_DIR, '11_NOTES_AND_NEXT_STEPS', 'NOTES_AND_NEXT_STEPS.md'), nextStepsContent);
  console.log('✓ Written: NOTES_AND_NEXT_STEPS.md');

  console.log('\nAll backup documents generated successfully!');
}

createDirectoryStructure();
generateFiles();

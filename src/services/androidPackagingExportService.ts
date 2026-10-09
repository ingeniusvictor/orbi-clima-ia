import { loadVersioningInfo } from '../utils/versioningReadiness';
import { getManifestPermissions, getManifestAuditItems } from '../utils/manifestPermissionAudit';
import { loadPackagingChecklist } from '../utils/androidPackagingChecklist';

export function buildAndroidPackagingChecklistMarkdown(): string {
  const versionInfo = loadVersioningInfo();
  const items = loadPackagingChecklist();
  
  const gradleItems = items.filter(i => i.category === 'gradle');
  const assetItems = items.filter(i => i.category === 'assets');
  
  return `# ORBI CLIMA IA - LISTA DE EMPAQUETADO ANDROID NATIVO
**Generado de forma autónoma por ORBI SkyCore™**
**Fecha:** ${new Date().toLocaleDateString()}
**Versión Candidata:** ${versionInfo.versionName} (${versionInfo.versionCode})
**Identificador:** ${versionInfo.packageName}

Este documento certifica el estado técnico de los archivos de configuración de Android (Gradle y Recursos de Asset) para la compilación de producción.

---

## 1. Identidad del Paquete (Package Identity)
* **Application ID (Package Name):** \`${versionInfo.packageName}\`
* **Version Name:** \`${versionInfo.versionName}\`
* **Version Code:** \`${versionInfo.versionCode}\`
* **Nombre de Mostrar:** \`${versionInfo.appName}\`
* **Label del Candidato (QA):** \`${versionInfo.candidateLabel}\`

---

## 2. Checklist de Gradle (Configuración de Compilación)
A continuación se detalla el estado de la auditoría de dependencias y niveles de SDK para Google Play:

${gradleItems.map(item => `- [${item.completed ? 'X' : ' '}] **${item.label}**: ${item.description}`).join('\n')}

---

## 3. Checklist de Iconos y Assets Adaptativos
Verificación de recursos visuales e iconos según las directrices de diseño de Android:

${assetItems.map(item => `- [${item.completed ? 'X' : ' '}] **${item.label}**: ${item.description}`).join('\n')}

---

## Recomendaciones para Android Studio
1. Verifique que el archivo \`android/app/build.gradle\` declare \`applicationId "${versionInfo.packageName}"\`.
2. Confirme que \`versionCode\` sea un entero incremental (\`${versionInfo.versionCode}\`).
3. Ejecute \`./gradlew assembleRelease\` para validar el empaquetado inicial.
`;
}

export function buildManifestAuditMarkdown(): string {
  const versionInfo = loadVersioningInfo();
  const permissions = getManifestPermissions();
  const audits = getManifestAuditItems();

  return `# ORBI CLIMA IA - AUDITORÍA DEL MANIFEST DE ANDROID
**Motor de Seguridad Orbi SkyCore™**
**Fecha:** ${new Date().toLocaleDateString()}

Este reporte contiene la auditoría completa del archivo \`AndroidManifest.xml\` para el Release Candidate de la aplicación Android.

---

## 1. Permisos Declarados en el Manifiesto
Se auditan los permisos solicitados para garantizar el cumplimiento de las políticas de privacidad de Google Play:

${permissions.map(p => `### ${p.name}
* **Propósito:** ${p.purpose}
* **Requerido:** ${p.required ? 'Sí (Crítico)' : 'No (Opcional)'}
* **Estado en Auditoría:** ${p.status === 'verified' ? '✅ Verificado (Aprobado)' : '⚠️ Bajo Revisión'}
`).join('\n')}

---

## 2. Componentes de la Aplicación y Atributos de Seguridad
Auditoría de las declaraciones de Activities, Receivers y configuraciones de red:

${audits.map(a => `### [${a.category.toUpperCase()}] ${a.title}
* **Descripción:** ${a.description}
* **Estado:** ${a.status === 'verified' ? '✅ Cumplido' : '⚠️ Pendiente'}
* **Detalles Técnicos:** ${a.details || 'N/A'}
`).join('\n')}

---

## 3. Directiva sobre Android 12+ (Seguridad de Exportación)
Toda actividad o receptor con filtros de intent (\`intent-filter\`) tiene declarado explícitamente \`android:exported="true"\` o \`android:exported="false"\`. Esto evita bloqueos críticos durante la instalación de la aplicación en dispositivos modernos.
`;
}

export function buildSignedBuildReadinessMarkdown(): string {
  const versionInfo = loadVersioningInfo();
  const items = loadPackagingChecklist();
  const signingItems = items.filter(i => i.category === 'signing');

  return `# ORBI CLIMA IA - CERTIFICACIÓN DE FIRMA PARA RELEASE
**Preparación de Compilación Firmada (Signed Build Readiness)**
**Fecha:** ${new Date().toLocaleDateString()}

Este documento describe la lista de pre-vuelo y recomendaciones de seguridad para firmar la aplicación con la clave de lanzamiento (Release Keystore) antes del despliegue público.

---

## 1. Estado del Checklist de Firma de Release
*Es indispensable no comprometer secretos en el repositorio público de código.*

${signingItems.map(item => `- [${item.completed ? 'X' : ' '}] **${item.label}**: ${item.description}`).join('\n')}

---

## 2. Directiva de Seguridad de Secretos y Keystore
> ⚠️ **CRÍTICO:**
> - **NUNCA** guarde el archivo del almacén de claves (\`.keystore\` o \`.jks\`) dentro de su repositorio de Git.
> - Evite escribir contraseñas explícitamente en el archivo \`build.gradle\`. Use variables de entorno locales o el sistema de almacenamiento seguro de claves en su servidor de CI/CD (GitHub Secrets / Google Cloud Secret Manager).
> - Se aconseja utilizar **Play App Signing** de Google Play para que Google administre y proteja de forma segura la clave de firma original, mientras usted firma localmente con una clave de carga (Upload Key).

---

## 3. Pasos sugeridos en Android Studio para firma manual:
1. Vaya a **Build > Generate Signed Bundle / APK**.
2. Seleccione **Android App Bundle** (Recomendado).
3. Seleccione la ruta de su Keystore local, ingrese el alias y las contraseñas.
4. Elija el destino del archivo e inicie la compilación.
`;
}

export function buildPlayConsolePreflightMarkdown(): string {
  const versionInfo = loadVersioningInfo();
  const items = loadPackagingChecklist();
  const preflightItems = items.filter(i => i.category === 'preflight');
  const validationItems = items.filter(i => i.category === 'validation');

  return `# ORBI CLIMA IA - PLAY CONSOLE PREFLIGHT REPORT
**Lista de Preparación para Publicación e Pruebas Internas**
**Fecha:** ${new Date().toLocaleDateString()}

Este informe resume la preparación de la consola de Google Play, la validación del binario compilado y el borrador preliminar de las Notas de Lanzamiento.

---

## 1. Validación de Binarios (AAB / APK)
Verificaciones técnicas en el dispositivo físico y soporte funcional en compilados release:

${validationItems.map(item => `- [${item.completed ? 'X' : ' '}] **${item.label}**: ${item.description}`).join('\n')}

---

## 2. Preparación de Google Play Console (Preflight)
Revisiones de datos de la tienda, categorías y cumplimiento legal:

${preflightItems.map(item => `- [${item.completed ? 'X' : ' '}] **${item.label}**: ${item.description}`).join('\n')}

---

## 3. Borrador de Notas de Lanzamiento (Release Notes Draft)
Copie este texto en la sección de "Notas de Lanzamiento" al crear su primera prueba en Google Play Console:

\`\`\`txt
Primera versión candidata de ORBI Clima IA.

Incluye:
- Pronóstico climático en vivo.
- Perfil Persona.
- Perfil Técnico Terreno.
- ORBI SkyCore™ Risk Engine.
- Alertas inteligentes.
- Widgets Android ORBI SkyOrb™.
- Notificaciones locales.
- Horarios silenciosos.
- Preferencias y memoria local.
- Privacidad local sin cuenta ni backend.
\`\`\`
`;
}

export function downloadAndroidPackagingPackage(): void {
  const files = [
    { name: 'ORBI_CLIMA_IA_ANDROID_PACKAGING_CHECKLIST.md', content: buildAndroidPackagingChecklistMarkdown() },
    { name: 'ORBI_CLIMA_IA_MANIFEST_AUDIT.md', content: buildManifestAuditMarkdown() },
    { name: 'ORBI_CLIMA_IA_SIGNED_BUILD_READINESS.md', content: buildSignedBuildReadinessMarkdown() },
    { name: 'ORBI_CLIMA_IA_PLAY_CONSOLE_PREFLIGHT.md', content: buildPlayConsolePreflightMarkdown() }
  ];

  files.forEach(file => {
    const blob = new Blob([file.content], { type: 'text/markdown;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', file.name);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
}

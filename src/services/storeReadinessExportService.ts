import { getPrivacyDisclosureText } from '../utils/privacyDisclosureBuilder';
import { getPermissionsInventory } from '../utils/permissionsInventoryBuilder';
import { getDefaultChecklist } from '../utils/storeReadinessChecklist';

export function buildStoreReadinessMarkdown(): string {
  return `# ORBI Clima IA - Ficha Técnica de Lanzamiento (Store Listing Draft)

## Nombre de la Aplicación
**ORBI Clima IA**

## Línea de Producto
*Powered by ORBI SkyCore™*

## Slogan / Tagline
**Tu núcleo climático inteligente.**

## Categoría Sugerida
*Weather / Clima*

## Audiencia Objetivo
Usuarios generales y técnicos de terreno que necesitan interpretar condiciones climáticas de forma simple, preventiva y proactiva.

## Descripción Propósito
ORBI Clima IA transforma datos climáticos en recomendaciones simples para la vida diaria y el trabajo en terreno, manteniendo la privacidad local y otorgando control total al usuario.

---

## Descripción Corta (Google Play Draft)
Pronóstico inteligente, alertas locales y widgets Android para tu día y terreno.

---

## Descripción Larga (Google Play Draft)
ORBI Clima IA es una aplicación climática inteligente diseñada para transformar el pronóstico tradicional en decisiones simples, útiles y preventivas.

Con ORBI SkyCore™, la app interpreta condiciones como temperatura, lluvia, viento, humedad, radiación UV y tormentas para entregar recomendaciones claras según tu perfil de uso.

### Perfil Persona:
Recibe orientación diaria sobre el tipo de vestimenta, protección ante lluvia, índice UV, alertas de frío o calor extremo y la mejor hora para realizar actividades al aire libre.

### Perfil Técnico Terreno:
Obtén apoyo preventivo para trabajos en el exterior mediante análisis de humedad, viento de ráfaga, lluvia, radiación UV extrema, riesgo de tormenta eléctrica y recomendación de ventanas operativas seguras.

### Funciones Principales:
- **Pronóstico Climático en Vivo**: Respaldado por el motor meteorológico global de Open-Meteo.
- **Perfiles Personalizados**: Perfil Persona y Perfil Técnico Terreno para adaptarse a tus necesidades.
- **ORBI SkyCore™ Risk Engine**: Motor heurístico de análisis de riesgo que evalúa la severidad de las condiciones.
- **Alertas Inteligentes Internas**: Resúmenes detallados de riesgos menores, moderados y severos.
- **Notificaciones Locales de Android**: Mantente alerta de manera inmediata sin depender de servidores push externos.
- **Horarios Silenciosos**: Configura periodos de descanso para bloquear notificaciones de menor prioridad.
- **Resúmenes Climáticos**: Mensajes de audio sintético y narrativas breves para entender el día de un vistazo.
- **Widgets Android ORBI SkyOrb™**: Diseños interactivos directo en tu pantalla de inicio.
- **Preferencias Locales**: Configura umbrales de sensibilidad térmica, viento y humedad.
- **Memoria Climática Local Controlable**: Sugerencias personalizadas basadas en tu historial local de uso.
- **Arquitectura Privada**: Sin cuentas obligatorias, sin registro de datos en la nube y sin trackers externos.

### Privacidad y Control:
ORBI Clima IA almacena tus datos y preferencias localmente en tu dispositivo. Puedes exportar, importar o borrar esta información cuando desees desde el panel de configuración local.

---

## CLAIMS GUARD (Control de Declaraciones para Google Play)

### Declaraciones Permitidas (Verificadas):
1. Pronóstico en tiempo real mediante Open-Meteo.
2. Alertas locales generadas por el motor interno de la app basándose en datos recibidos.
3. Simulación de widgets Android nativos interactivos.
4. Almacenamiento 100% local en dispositivo (localStorage).
5. Memoria local de uso controlable y borrable.
6. Apoyo preventivo y orientativo para terreno y vida diaria.

### Declaraciones Bloqueadas (Prohibidas):
1. Alertas oficiales de emergencia civil o gubernamental.
2. Garantía absoluta de seguridad física ante tormentas o rayos.
3. Predicción propia basada en satélites o radares propios.
4. Sustitución de servicios meteorológicos oficiales de cada país.
5. Sustitución de protocolos de prevención de riesgos HSE del empleador.
6. Monitoreo constante 24/7 en segundo plano garantizado sin limitaciones del sistema operativo.
7. Precisión climática micrométrica o infalible.

---

*Ficha técnica de preparación pre-lanzamiento. Generada automáticamente por ORBI Clima IA.*`;
}

export function buildPrivacyPolicyDraftMarkdown(): string {
  const bodyText = getPrivacyDisclosureText();
  return `# ORBI Clima IA - Política de Privacidad

${bodyText}

---
*Este documento es un borrador operacional para revisión previa a la carga oficial en Google Play Console.*`;
}

export function buildDataSafetyDraftMarkdown(): string {
  return `# ORBI Clima IA - Borrador de Declaración Data Safety (Google Play)

Este documento contiene las respuestas orientativas preparadas para rellenar el formulario de Seguridad de Datos (Data Safety) en Google Play Console.

---

## Sección 1: Ubicación (Location)

### Tipo de Datos:
- **Ubicación aproximada (Approximate Location)**
- **Ubicación precisa (Precise Location)**

### ¿Se recopila este tipo de datos?
**Sí**.

### ¿Se comparten estos datos?
**No**. La app no los transmite a ningún backend propio ni a terceros. Las coordenadas se envían directamente de forma anónima al proveedor público Open-Meteo para obtener el clima de la posición consultada.

### ¿Se procesan de forma efímera?
**Sí**. Las coordenadas obtenidas por GPS no se registran persistentemente a menos que el usuario guarde la ubicación de forma manual en su dispositivo como "Ubicación preferida".

### Finalidades de uso declaradas:
- **Funcionalidad de la app (App Functionality)**: Necesario para mostrar el pronóstico meteorológico local correcto al usuario.

---

## Sección 2: Configuración y Preferencias (App Preferences)

### Tipo de Datos:
- **Preferencias de la aplicación (App Preferences / Settings)**

### ¿Se recopila este tipo de datos?
**Sí**, se almacenan en el almacenamiento local del dispositivo.

### ¿Se comparten estos datos?
**No**. No se envían a ningún servidor en la nube ni backend de terceros.

### Finalidades de uso declaradas:
- **Personalización (Personalization)**: Se utiliza para recordar el perfil seleccionado (Persona o Técnico), umbrales de sensibilidad de alertas, horario silencioso y widgets favoritos.

---

## Sección 3: Historial y Notificaciones (Notification Preferences)

### Tipo de Datos:
- **Preferencias de Notificaciones e Historial de Alertas Locales**

### ¿Se recopila este tipo de datos?
**Sí**, localmente en el dispositivo.

### ¿Se comparten estos datos?
**No**.

### Finalidades de uso declaradas:
- **Funcionalidad de la app (App Functionality)**: Permite almacenar el historial de notificaciones enviadas para que el usuario pueda revisarlas y verificar el estado del Scheduler.

---

## Sección 4: Memoria de Uso (Usage History / Local Patterns)

### Tipo de Datos:
- **Patrones simples de uso (Ubicaciones frecuentes, perfil más usado, widgets favoritos)**

### ¿Se recopila este tipo de datos?
**Sí**, únicamente en la memoria climática local en localStorage.

### ¿Se comparten estos datos?
**No**.

### Finalidades de uso declaradas:
- **Personalización (Personalization)**: Se utiliza para sugerir de forma no invasiva cambios de perfil o widgets que se adapten mejor al patrón local del usuario.

---

### NOTA IMPORTANTE PARA EL DESARROLLADOR:
La declaración de Data Safety en Google Play Console es vinculante. Asegúrate de que no se incluyan SDKs de anuncios, analíticas de terceros u otros plugins que recopilen datos sin ser declarados.`;
}

export function buildPermissionsInventoryMarkdown(): string {
  const inventory = getPermissionsInventory();
  let md = `# ORBI Clima IA - Inventario y Justificación de Permisos Android

Este documento detalla los permisos técnicos requeridos por el APK/AAB en Android y sus justificaciones operacionales para la Play Store.

---

`;

  inventory.forEach((p, idx) => {
    md += `### ${idx + 1}. \`${p.name}\`
- **Estado actual**: ${p.status}
- **Necesita Declaración de Play Console**: ${p.playConsoleReview ? 'Sí (Needs Play Console Review)' : 'No'}
- **Propósito**: ${p.purpose}
- **Impacto si se deniega**: ${p.impact}

---

`;
  });

  md += `\n*Nota: Los permisos marcados como "No declarado" son opcionales y solo deben añadirse en el AndroidManifest.xml si se implementa su lógica nativa de soporte futuro.*`;
  return md;
}

export function buildReleaseChecklistMarkdown(): string {
  const list = getDefaultChecklist();
  
  let md = `# ORBI Clima IA - Checklist de Lanzamiento de Producción (Release Checklist)

Este checklist contiene los puntos críticos de verificación técnica, funcional, de privacidad y textual antes del lanzamiento de la aplicación en Google Play.

---

`;

  const categories = {
    build: 'Verificación de Compilación & Empaquetado (Build)',
    functional: 'Verificación de Integridad Funcional (Functional)',
    privacy: 'Verificación de Privacidad & Consentimiento (Privacy)',
    textual: 'Verificación de Seguridad Textual & Políticas (Safety / Textual)'
  };

  Object.entries(categories).forEach(([key, title]) => {
    md += `## ${title}\n\n`;
    const items = list.filter(i => i.category === key);
    items.forEach(item => {
      md += `- [${item.completed ? 'x' : ' '}] **${item.title}**: ${item.description}\n`;
    });
    md += `\n`;
  });

  md += `---
*Lanzamiento preliminar preparado y calificado. Revisar exhaustivamente antes de la firma final.*`;
  return md;
}

// Helper to trigger download of a single file
function triggerDownload(content: string, filename: string) {
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

export function downloadStoreReadinessPackage(): void {
  // Download the 5 files in sequence
  triggerDownload(buildStoreReadinessMarkdown(), 'ORBI_CLIMA_IA_STORE_READINESS.md');
  triggerDownload(buildPrivacyPolicyDraftMarkdown(), 'ORBI_CLIMA_IA_PRIVACY_POLICY_DRAFT.md');
  triggerDownload(buildDataSafetyDraftMarkdown(), 'ORBI_CLIMA_IA_DATA_SAFETY_DRAFT.md');
  triggerDownload(buildPermissionsInventoryMarkdown(), 'ORBI_CLIMA_IA_PERMISSIONS_INVENTORY.md');
  triggerDownload(buildReleaseChecklistMarkdown(), 'ORBI_CLIMA_IA_RELEASE_CHECKLIST.md');
}

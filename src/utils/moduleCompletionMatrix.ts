export interface ModuleCompletionItem {
  id: string;
  name: string;
  status: 'Completed' | 'Needs Review' | 'Blocked' | 'Frozen';
  evidence: string;
  residualRisk: string;
  notes: string;
}

export const MODULE_COMPLETION_MATRIX: ModuleCompletionItem[] = [
  {
    id: 'M0',
    name: 'SkyCore Foundation',
    status: 'Completed',
    evidence: 'Estructura modular en src/ implementada con TypeScript y React.',
    residualRisk: 'Ninguno. Estabilidad de base establecida.',
    notes: 'Inicialización de UI, Shell de componentes, y ruteo interno estable.'
  },
  {
    id: 'M1',
    name: 'Open-Meteo Live Forecast Integration',
    status: 'Completed',
    evidence: 'Llamadas API reales en terreno con cache y fallback robusto de demostración.',
    residualRisk: 'Dependencia de conectividad de red e interrupciones del proveedor Open-Meteo.',
    notes: 'Configurado con tolerancia a fallas de red offline.'
  },
  {
    id: 'M2',
    name: 'SkyCore Risk Engine Advanced',
    status: 'Completed',
    evidence: 'Clasificación matemática de riesgos por perfiles (Técnico Terreno vs Usuario General).',
    residualRisk: 'Percepción subjetiva de las recomendaciones personalizadas.',
    notes: 'Cumple con directrices de salud y seguridad físicas.'
  },
  {
    id: 'M3',
    name: 'Android Native SkyOrb Widget',
    status: 'Completed',
    evidence: 'Implementación visual de widgets interactivos simulados con consistencia de sistema.',
    residualRisk: 'Políticas restrictivas de consumo de batería en terminales reales.',
    notes: 'Representa fielmente el ciclo nativo de widgets de Android.'
  },
  {
    id: 'M3B',
    name: 'Widget Multi-size Variants',
    status: 'Completed',
    evidence: 'Soporte para tamaños compactos, medianos, y expandidos con micro-paneles.',
    residualRisk: 'Diferencias menores de escalado en layouts de launchers personalizados.',
    notes: 'Diseño responsive y denso en información.'
  },
  {
    id: 'M4',
    name: 'Smart Weather Alerts',
    status: 'Completed',
    evidence: 'Filtros avanzados de alertas por perfil y umbrales personalizables de riesgo.',
    residualRisk: 'Inacción de usuarios ante alertas críticas.',
    notes: 'Incluye Directiva HSE visible y mandatoria.'
  },
  {
    id: 'M5',
    name: 'Android Local Notifications Foundation',
    status: 'Completed',
    evidence: 'Simulación del NotificationManager con prioridad alta e hilos de servicio.',
    residualRisk: 'Bloqueos de notificaciones a nivel de sistema operativo por el usuario.',
    notes: 'Permisos dinámicos inventariados correctamente.'
  },
  {
    id: 'M6A',
    name: 'Quiet Hours + Frequency Guard',
    status: 'Completed',
    evidence: 'Restricciones horarias configurables y límite de alertas por hora para fatiga auditiva.',
    residualRisk: 'Silenciado involuntario de alertas críticas en terreno de noche.',
    notes: 'Posee override de emergencia de noche para factores de riesgo crítico.'
  },
  {
    id: 'M6B',
    name: 'Smart Summaries + Deferred Alerts',
    status: 'Completed',
    evidence: 'Consolidación inteligente de alertas demoradas al despertar y resúmenes estructurados.',
    residualRisk: 'Retraso de la lectura de alertas informadas tardíamente.',
    notes: 'Optimiza la atención ejecutiva en jornadas extensas.'
  },
  {
    id: 'M7A',
    name: 'Local Preferences Foundation',
    status: 'Completed',
    evidence: 'Persistencia en localStorage de configuraciones del sistema sin cookies intrusivas.',
    residualRisk: 'Borrado involuntario del caché del navegador por parte del usuario.',
    notes: 'Sin login, sin bases de datos en la nube para máxima confidencialidad.'
  },
  {
    id: 'M7B',
    name: 'Weather Intelligence Memory',
    status: 'Completed',
    evidence: 'Persistencia de alertas leídas e historial de navegación climática offline.',
    residualRisk: 'Consumo marginal de memoria en localStorage.',
    notes: 'Reciclaje autónomo de registros antiguos.'
  },
  {
    id: 'M8A',
    name: 'Public Polish + First Launch Experience',
    status: 'Completed',
    evidence: 'Proceso guiado de bienvenida (First Launch) y animaciones de transición fluidas.',
    residualRisk: 'Saltado rápido del tutorial por el operador técnico.',
    notes: 'Alineado con directivas de diseño limpio de alta resolución.'
  },
  {
    id: 'M8B',
    name: 'Store Readiness + Privacy Package',
    status: 'Completed',
    evidence: 'Consolidación de políticas de privacidad locales y fichas descriptivas oficiales.',
    residualRisk: 'Actualizaciones de directivas legales requeridas periódicamente.',
    notes: 'Declaración estricta de "Sin recolección de datos".'
  },
  {
    id: 'M9A',
    name: 'Release Candidate QA Center',
    status: 'Completed',
    evidence: 'Suite de pruebas locales automatizadas y checklist manual de control de calidad.',
    residualRisk: 'Sesgo de pruebas autodeclaradas.',
    notes: 'Permite forzar simulación de incidentes y validar estabilidad.'
  },
  {
    id: 'M9B',
    name: 'Android Packaging + Signed Build Readiness',
    status: 'Completed',
    evidence: 'Estructura xml de manifiestos, firmas y preparación técnica de archivos base de compilación.',
    residualRisk: 'Firmado manual final requerido por parte del desarrollador.',
    notes: 'Sin keystores o llaves privadas comprometidas en código fuente.'
  },
  {
    id: 'M9C',
    name: 'Android Mobile UX Re-Lock',
    status: 'Completed',
    evidence: 'Encapsulado UI estricto que asemeja una experiencia de aplicación móvil instalada.',
    residualRisk: 'Limitaciones menores de navegación táctil en navegadores antiguos.',
    notes: 'Inhabilita scrolles desmedidos y bordes ásperos.'
  },
  {
    id: 'M10',
    name: 'Internal Testing Release Pack + Final RC Closure',
    status: 'Completed',
    evidence: 'Cierre del control del QA de la tienda y firmas de cierre técnico emitidas.',
    residualRisk: 'Cambios técnicos imprevistos entre el testing interno y la publicación.',
    notes: 'Certificado de calidad SkyCore™ sellado.'
  },
  {
    id: 'M11',
    name: 'Controlled Pilot Feedback Loop + Post-RC Fix Tracker',
    status: 'Completed',
    evidence: 'Ingreso, tipificación, priorización, y evidencias de solución de parches en terreno.',
    residualRisk: 'Bajo volumen de feedback de testers en etapas iniciales.',
    notes: 'Bandeja de entrada activa de retroalimentación de técnicos de terreno.'
  },
  {
    id: 'M12',
    name: 'Final Stabilization Freeze + Local Release Seal',
    status: 'Completed',
    evidence: 'Este panel de cierre que bloquea el ciclo actual de desarrollo v1.0.',
    residualRisk: 'Nuevas ideas requerirán bifurcar a la rama de desarrollo v1.1.',
    notes: 'Sello final emitido localmente con doble confirmación.'
  }
];

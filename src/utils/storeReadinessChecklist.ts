export interface ChecklistItem {
  id: string;
  category: 'build' | 'functional' | 'privacy' | 'textual';
  title: string;
  description: string;
  completed: boolean;
}

export function getDefaultChecklist(): ChecklistItem[] {
  return [
    // Build
    {
      id: 'b1',
      category: 'build',
      title: 'tsc --noEmit limpio',
      description: 'El compilador TypeScript no arroja errores en el código.',
      completed: true,
    },
    {
      id: 'b2',
      category: 'build',
      title: 'vite build limpio',
      description: 'El empaquetador web genera el bundle de distribución sin errores.',
      completed: true,
    },
    {
      id: 'b3',
      category: 'build',
      title: 'Gradle sync limpio',
      description: 'Las dependencias nativas del proyecto de Android están sincronizadas y sin conflictos.',
      completed: false,
    },
    {
      id: 'b4',
      category: 'build',
      title: 'APK debug compila',
      description: 'Se genera un archivo APK ejecutable para pruebas locales en dispositivos de desarrollo.',
      completed: false,
    },
    {
      id: 'b5',
      category: 'build',
      title: 'AAB release preparado',
      description: 'Se configuró el Android App Bundle optimizado para la carga en Google Play Console.',
      completed: false,
    },
    {
      id: 'b6',
      category: 'build',
      title: 'Firma release configurada',
      description: 'Se creó y enlazó la clave Keystore segura para la firma digital de producción.',
      completed: false,
    },
    {
      id: 'b7',
      category: 'build',
      title: 'Target SDK revisado',
      description: 'La aplicación apunta a Android 15 (API level 35) según los requisitos actuales de Google Play.',
      completed: true,
    },
    {
      id: 'b8',
      category: 'build',
      title: 'VersionCode y VersionName actualizados',
      description: 'Se asignó un código incremental único y nombre legible en build.gradle.',
      completed: true,
    },

    // Funcional
    {
      id: 'f1',
      category: 'functional',
      title: 'Open-Meteo funciona',
      description: 'La consulta a la API de Open-Meteo se realiza con éxito y recupera datos climáticos en tiempo real.',
      completed: true,
    },
    {
      id: 'f2',
      category: 'functional',
      title: 'Fallback funciona',
      description: 'Si falla el proveedor externo, la aplicación activa datos heurísticos y de caché locales de forma inmediata.',
      completed: true,
    },
    {
      id: 'f3',
      category: 'functional',
      title: 'Modo demo funciona',
      description: 'El simulador climático permite probar todos los escenarios críticos con presets realistas.',
      completed: true,
    },
    {
      id: 'f4',
      category: 'functional',
      title: 'GPS con permiso funciona',
      description: 'El flujo de obtención de coordenadas por GPS maneja rechazo, carga progresiva y éxito de forma robusta.',
      completed: true,
    },
    {
      id: 'f5',
      category: 'functional',
      title: 'Widgets funcionan',
      description: 'Los simuladores del widget Android interactivo SkyOrb™ responden instantáneamente a cambios de perfil y ciudad.',
      completed: true,
    },
    {
      id: 'f6',
      category: 'functional',
      title: 'Notificaciones funcionan',
      description: 'Las alertas locales del sistema simulan el comportamiento del canal de notificaciones nativas de Android.',
      completed: true,
    },
    {
      id: 'f7',
      category: 'functional',
      title: 'Quiet Hours funciona',
      description: 'La lógica de horario silencioso bloquea notificaciones de baja prioridad en el período configurado.',
      completed: true,
    },
    {
      id: 'f8',
      category: 'functional',
      title: 'Memoria local funciona',
      description: 'Se registran y procesan ubicaciones, widgets y perfiles más usados para generar sugerencias heurísticas.',
      completed: true,
    },
    {
      id: 'f9',
      category: 'functional',
      title: 'Export/import funciona',
      description: 'Se exporta e importa el archivo JSON de configuración local sin alterar la integridad de los datos.',
      completed: true,
    },

    // Privacidad
    {
      id: 'p1',
      category: 'privacy',
      title: 'Política de privacidad visible',
      description: 'El borrador de política es visible y legible de forma pública y accesible dentro de la aplicación.',
      completed: true,
    },
    {
      id: 'p2',
      category: 'privacy',
      title: 'Data Safety draft completo',
      description: 'Se definieron con total claridad los flujos de recolección y uso de ubicación y preferencias.',
      completed: true,
    },
    {
      id: 'p3',
      category: 'privacy',
      title: 'Permisos justificados',
      description: 'Se documentó la justificación técnica de cada permiso que usará la aplicación.',
      completed: true,
    },
    {
      id: 'p4',
      category: 'privacy',
      title: 'Sin backend no declarado',
      description: 'Se garantiza que no se transmiten datos privados a servidores externos o nubes de almacenamiento.',
      completed: true,
    },
    {
      id: 'p5',
      category: 'privacy',
      title: 'Sin tracking externo',
      description: 'La app no contiene librerías analíticas invasivas ni SDKs de terceros para rastrear actividades fuera del terminal.',
      completed: true,
    },
    {
      id: 'p6',
      category: 'privacy',
      title: 'GPS con consentimiento',
      description: 'No se leen coordenadas en segundo plano de manera automatizada sin una acción explícita previa.',
      completed: true,
    },
    {
      id: 'p7',
      category: 'privacy',
      title: 'Borrado de memoria funciona',
      description: 'La purga de memoria climática y preferencias del dispositivo limpia de forma total el localStorage del navegador.',
      completed: true,
    },

    // Seguridad Textual
    {
      id: 't1',
      category: 'textual',
      title: 'Sin referencias HSEC/HASEC',
      description: 'No existen términos regulatorios restringidos como HSEC o HASEC en ninguna interfaz pública.',
      completed: true,
    },
    {
      id: 't2',
      category: 'textual',
      title: 'Directiva HSE visible',
      description: 'Se muestra la Directiva de Terreno que recuerda cumplir con los protocolos de seguridad de la empresa.',
      completed: true,
    },
    {
      id: 't3',
      category: 'textual',
      title: 'Sin prometer emergencia oficial',
      description: 'Se explicita claramente que las alertas SkyCore no sustituyen los canales ni sirenas oficiales de rescate.',
      completed: true,
    },
    {
      id: 't4',
      category: 'textual',
      title: 'Sin prometer seguridad garantizada',
      description: 'No se utiliza lenguaje de seguridad infalible ni de protección climatológica absoluta de instalaciones.',
      completed: true,
    },
    {
      id: 't5',
      category: 'textual',
      title: 'Sin prometer precisión absoluta',
      description: 'Se describe el origen de los pronósticos indicando que son aproximaciones provistas por Open-Meteo.',
      completed: true,
    },
  ];
}

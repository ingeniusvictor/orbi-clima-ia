export interface VersionLockPolicy {
  versionName: string;
  versionCode: number;
  releaseLabel: string;
  releaseChannel: string;
  policyNotes: string;
  branches: {
    name: string;
    description: string;
    allowedChanges: string[];
  }[];
}

export const VERSION_LOCK_POLICY: VersionLockPolicy = {
  versionName: '1.0.0-local-release',
  versionCode: 10000,
  releaseLabel: 'ORBI Clima IA v1.0 Local Release',
  releaseChannel: 'Local / Internal Testing Ready',
  policyNotes: 'La versión 1.0 no acepta nuevas features. Solo se permiten correcciones críticas, fixes post-RC o ajustes menores.',
  branches: [
    {
      name: 'v1.0.x (Estabilización / Parches)',
      description: 'Mantenimiento preventivo, corrección de bugs menores de terreno y cumplimiento regulatorio.',
      allowedChanges: [
        'Correcciones críticas de crashes',
        'Ajustes menores de microcopy técnico',
        'Ajustes de permisos del sistema',
        'Correcciones menores en widgets y notificaciones',
        'Políticas de privacidad y Store Packaging'
      ]
    },
    {
      name: 'v1.1.x (Nuevas Características)',
      description: 'Futuras mejoras y adición de valor técnico menor.',
      allowedChanges: [
        'Nuevos tipos de perfiles ocupacionales',
        'Gráficos meteorológicos adicionales',
        'Nuevos tamaños de widgets',
        'Mejoras en el motor de alertas'
      ]
    },
    {
      name: 'v2.0.x (Evolución Estructural)',
      description: 'Cambios estructurales significativos en la arquitectura general.',
      allowedChanges: [
        'Autenticación en la nube (opcional)',
        'Bases de datos relacionales robustas (SQL/Firestore centralizado)',
        'Monitoreo centralizado de flotas de técnicos'
      ]
    }
  ]
};

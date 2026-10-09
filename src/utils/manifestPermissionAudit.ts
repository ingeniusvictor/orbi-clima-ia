export interface ManifestPermission {
  name: string;
  purpose: string;
  required: boolean;
  status: 'verified' | 'warning' | 'not_used';
}

export interface ManifestAuditItem {
  id: string;
  category: 'identity' | 'activities' | 'receivers' | 'security' | 'permissions';
  title: string;
  description: string;
  status: 'verified' | 'needs_review' | 'warning';
  details?: string;
}

export function getManifestPermissions(): ManifestPermission[] {
  return [
    {
      name: 'android.permission.INTERNET',
      purpose: 'Permite consultar el clima en vivo mediante el servicio meteorológico Open-Meteo.',
      required: true,
      status: 'verified',
    },
    {
      name: 'android.permission.ACCESS_COARSE_LOCATION',
      purpose: 'Permite determinar la región aproximada para buscar datos meteorológicos del satélite.',
      required: true,
      status: 'verified',
    },
    {
      name: 'android.permission.ACCESS_FINE_LOCATION',
      purpose: 'Requerido para la ubicación precisa en el perfil Técnico de Terreno y alertas de riesgo climático.',
      required: true,
      status: 'verified',
    },
    {
      name: 'android.permission.POST_NOTIFICATIONS',
      purpose: 'Permite mostrar alertas inteligentes, reportes de turno y resúmenes climáticos en Android 13+.',
      required: true,
      status: 'verified',
    },
    {
      name: 'android.permission.RECEIVE_BOOT_COMPLETED',
      purpose: 'Permite que el planificador de alertas (scheduler) se re-registre de manera autónoma al reiniciar el celular.',
      required: false,
      status: 'verified',
    },
    {
      name: 'android.permission.SCHEDULE_EXACT_ALARM',
      purpose: 'Requerido para disparar las alarmas de cambio de turno y avisos en el minuto exacto (opcional).',
      required: false,
      status: 'verified',
    },
  ];
}

export function getManifestAuditItems(): ManifestAuditItem[] {
  return [
    {
      id: 'ma-name',
      category: 'identity',
      title: 'Nombre de la aplicación',
      description: 'Declarado como android:label="@string/app_name", apuntando a "ORBI Clima IA" en res/values/strings.xml.',
      status: 'verified',
      details: 'El nombre se encuentra alineado con la identidad corporativa y no contiene prefijos de test o desarrollo.',
    },
    {
      id: 'ma-main',
      category: 'activities',
      title: 'MainActivity y Launcher Intent Filter',
      description: 'Declarado con android.intent.action.MAIN y android.intent.category.LAUNCHER.',
      status: 'verified',
      details: 'Tiene android:exported="true" debido a que contiene un intent-filter para el inicio del sistema operativo.',
    },
    {
      id: 'ma-widget',
      category: 'receivers',
      title: 'OrbiSkyOrbWidgetProvider Receiver',
      description: 'Declarado para el soporte del widget del clima con el intent-filter android.appwidget.action.APPWIDGET_UPDATE.',
      status: 'verified',
      details: 'Declarado con android:exported="true" y el metadato del proveedor asociado a la especificación XML del widget.',
    },
    {
      id: 'ma-boot',
      category: 'receivers',
      title: 'BootReceiver para Alarmas y Alertas',
      description: 'Filtrado por android.intent.action.BOOT_COMPLETED para reconfigurar el planificador de notificaciones.',
      status: 'verified',
      details: 'Tiene android:exported="false" para prevenir que aplicaciones externas disparen eventos de arranque artificiales.',
    },
    {
      id: 'ma-exported',
      category: 'security',
      title: 'Auditoría de android:exported (Android 12+)',
      description: 'Se valida que todo componente con intent-filter defina explícitamente android:exported.',
      status: 'verified',
      details: 'Cumplido con éxito en MainActivity, WidgetProvider y BootReceiver. Previene fallas de instalación en Android 12, 13, 14 y 15.',
    },
    {
      id: 'ma-cleartext',
      category: 'security',
      title: 'Network Security (Cleartext Traffic)',
      description: 'Establecido android:usesCleartextTraffic="false" para forzar conexiones HTTPS seguras con Open-Meteo.',
      status: 'verified',
      details: 'Evita transferencias en texto plano de coordenadas GPS u otros datos sensibles del técnico de terreno.',
    },
    {
      id: 'ma-theme',
      category: 'identity',
      title: 'Tema de Aplicación e Icono',
      description: 'Declarados android:icon="@mipmap/ic_launcher" y android:theme="@style/Theme.OrbiClima.NoActionBar".',
      status: 'verified',
      details: 'Soportado correctamente para evitar barras de herramientas redundantes del sistema nativo en favor de la interfaz web.',
    },
  ];
}

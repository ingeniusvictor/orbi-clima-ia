export interface PermissionItem {
  name: string;
  purpose: string;
  playConsoleReview: boolean;
  status: 'Declarado' | 'No declarado';
  impact: string;
}

export function getPermissionsInventory(): PermissionItem[] {
  return [
    {
      name: 'android.permission.INTERNET',
      purpose: 'Permite a la aplicación consultar el pronóstico climático en tiempo real a través del servicio Open-Meteo.',
      playConsoleReview: false,
      status: 'Declarado',
      impact: 'Esencial para el funcionamiento. Sin este permiso, la aplicación no puede actualizar datos meteorológicos en vivo.'
    },
    {
      name: 'android.permission.ACCESS_FINE_LOCATION',
      purpose: 'Permite detectar la ubicación precisa del dispositivo vía GPS para cargar las estaciones climáticas de manera inteligente si el usuario otorga su consentimiento.',
      playConsoleReview: false,
      status: 'Declarado',
      impact: 'Opcional. Permite autodetectar la estación climática más cercana de forma local.'
    },
    {
      name: 'android.permission.ACCESS_COARSE_LOCATION',
      purpose: 'Permite detectar la ubicación aproximada del dispositivo utilizando antenas de red y Wi-Fi para un posicionamiento rápido y de bajo consumo.',
      playConsoleReview: false,
      status: 'Declarado',
      impact: 'Opcional. Proporciona una estimación de ubicación para el clima sin activar el GPS de alta precisión.'
    },
    {
      name: 'android.permission.POST_NOTIFICATIONS',
      purpose: 'Requerido en Android 13+ (API 33) o superior para poder registrar y mostrar alertas climáticas inteligentes directamente en el área de notificaciones del dispositivo.',
      playConsoleReview: false,
      status: 'Declarado',
      impact: 'Esencial para Smart Alerts locales de ORBI SkyCore™.'
    },
    {
      name: 'android.permission.RECEIVE_BOOT_COMPLETED',
      purpose: 'Permite restaurar los alarmas del scheduler local y actualizar los widgets climáticos nativos SkyOrb™ inmediatamente después de reiniciar el dispositivo.',
      playConsoleReview: false,
      status: 'No declarado',
      impact: 'Bajo. Permite la persistencia de widgets en el inicio del sistema.'
    },
    {
      name: 'android.permission.SCHEDULE_EXACT_ALARM',
      purpose: 'Permite configurar temporizadores de alta precisión para actualizar las notificaciones del Scheduler sin demoras de energía.',
      playConsoleReview: true,
      status: 'No declarado',
      impact: 'Alto. Google Play exige justificar estrictamente este permiso para evitar el drenaje de batería. ORBI prefiere usar alarmas inexactas para evitar bloqueos en Play Store.'
    }
  ];
}

export interface TestingChecklistItem {
  id: string;
  label: string;
}

export const DEVICE_ACCEPTANCE_CHECKLIST: TestingChecklistItem[] = [
  { id: 'device-install', label: 'Instala correctamente en dispositivo Android' },
  { id: 'device-no-crash', label: 'Abre sin colgarse ni crashear' },
  { id: 'device-mobileshell', label: 'MobileShell se ve y se siente como app Android' },
  { id: 'device-no-long-panels', label: 'No aparecen paneles técnicos largos en Home' },
  { id: 'device-bottom-nav', label: 'Bottom navigation con 4 pestañas funciona' },
  { id: 'device-onboarding', label: 'Onboarding aparece o se mantiene completado' },
  { id: 'device-live-weather', label: 'Carga clima live desde Open-Meteo' },
  { id: 'device-manual-search', label: 'Funciona búsqueda manual de estaciones/ciudades' },
  { id: 'device-gps-allowed', label: 'Funciona geolocalización por GPS con permiso' },
  { id: 'device-gps-denied', label: 'Funciona correctamente con GPS denegado (fallback)' },
  { id: 'device-fallback-offline', label: 'Funciona en modo sin internet/offline' },
  { id: 'device-person-profile', label: 'Perfil Persona activo y funcional' },
  { id: 'device-tech-profile', label: 'Perfil Técnico Terreno activo y funcional' },
  { id: 'device-hse-visible', label: 'Directiva HSE de terreno visible en paneles' },
  { id: 'device-smart-alerts', label: 'Alertas climáticas inteligentes visibles' },
  { id: 'device-test-notif', label: 'Notificación de prueba en segundo plano funciona' },
  { id: 'device-quiet-hours', label: 'Quiet Hours y Frequency Guard activos' },
  { id: 'device-widget-skypanel', label: 'Widget SkyPanel (Previsualización) funciona' },
  { id: 'device-widget-skyorb-mini', label: 'Widget SkyOrb Mini (Previsualización) funciona' },
  { id: 'device-widget-field-cmd', label: 'Widget Field Command (Previsualización) funciona' },
  { id: 'device-widget-cinematic', label: 'Widget Cinematic Bar (Previsualización) funciona' },
  { id: 'device-prefs-persist', label: 'Preferencias de usuario persisten localmente' },
  { id: 'device-local-memory', label: 'Memoria local funciona (búsquedas editables/eliminables)' },
  { id: 'device-advanced-console-gate', label: 'AdvancedOrbiConsole solo abre tras pasar DeveloperModeGate' },
  { id: 'device-no-hsec', label: 'Sin referencias prohibidas a regulaciones (No HSEC ni HASEC)' }
];

import { OrbiWeatherMemory, OrbiClimaUserPreferences, WeatherMemoryInsight } from '../types/weatherTypes';
import { getMostUsedLocation, getMostUsedProfile, getMostUsedWidget } from './weatherMemoryScoring';

export function buildWeatherMemoryInsights(params: {
  memory: OrbiWeatherMemory;
  preferences: OrbiClimaUserPreferences;
}): WeatherMemoryInsight[] {
  const { memory, preferences } = params;
  const insights: WeatherMemoryInsight[] = [];
  const nowStr = new Date().toISOString();

  // 1. Suggest preferred location if there is a dominant used location different from the saved preferred location
  const dominantLocation = getMostUsedLocation(memory);
  if (dominantLocation && dominantLocation.useCount >= 3) {
    const preferredLocId = preferences.preferredLocation?.id;
    if (preferredLocId !== dominantLocation.id) {
      insights.push({
        id: `suggest_pref_loc_${dominantLocation.id}`,
        title: 'Sugerencia de Ubicación Preferida',
        message: `${dominantLocation.name} aparece como tu ubicación más frecuente (${dominantLocation.useCount} consultas). ¿Quieres fijarla como tu ubicación preferida de inicio?`,
        type: 'location',
        createdAt: nowStr
      });
    }
  }

  // 2. Suggest startup profile based on dominance
  const dominantProfile = getMostUsedProfile(memory);
  if (dominantProfile && dominantProfile !== preferences.preferredProfile) {
    const dominantProfileLabel = dominantProfile === 'person' ? 'Persona' : 'Técnico Terreno';
    const memoryUses = memory.profileUses.find(p => p.profile === dominantProfile)?.useCount || 0;
    
    if (memoryUses >= 3) {
      insights.push({
        id: `suggest_pref_profile_${dominantProfile}`,
        title: 'Optimización de Perfil de Inicio',
        message: `Has usado el Perfil ${dominantProfileLabel} con mayor frecuencia recientemente (${memoryUses} veces). ORBI puede iniciar directamente en este perfil para ahorrar clics.`,
        type: 'profile',
        createdAt: nowStr
      });
    }
  }

  // 3. Suggest widget preference based on usage
  const dominantWidget = getMostUsedWidget(memory);
  if (dominantWidget && dominantWidget !== preferences.preferredWidgetVariant) {
    const widgetLabels: Record<string, string> = {
      skyorb_mini: 'SkyOrb Mini',
      skypanel: 'SkyPanel',
      field_command: 'Field Command',
      cinematic_bar: 'Cinematic Bar'
    };
    const widgetLabel = widgetLabels[dominantWidget] || dominantWidget;
    const memoryUses = memory.widgetUses.find(w => w.variant === dominantWidget)?.useCount || 0;

    if (memoryUses >= 3) {
      insights.push({
        id: `suggest_pref_widget_${dominantWidget}`,
        title: 'Sugerencia de Widget Predeterminado',
        message: `${widgetLabel} es tu widget más usado actualmente (${memoryUses} veces). ¿Deseas establecerlo como tu variante recomendada por defecto?`,
        type: 'widget',
        createdAt: nowStr
      });
    }
  }

  // 4. Heuristic warning if alert sensitivity is low but user has many favorite categories or vice versa
  if (preferences.alertSensitivity === 'low' && preferences.favoriteAlertCategories.length > 5) {
    insights.push({
      id: 'suggest_sensitivity_normal',
      title: 'Ajuste de Sensibilidad de Alertas',
      message: 'Tienes seleccionadas más de 5 categorías de alerta favoritas, pero la sensibilidad está en "Bajo". Se recomienda subir a "Normal" para no perder avisos importantes.',
      type: 'alert',
      createdAt: nowStr
    });
  } else if (preferences.alertSensitivity === 'high' && preferences.favoriteAlertCategories.length <= 2) {
    insights.push({
      id: 'suggest_sensitivity_low',
      title: 'Ajuste de Ruido de Alertas',
      message: 'Tu sensibilidad está configurada en "Alto", pero solo sigues 1 o 2 categorías. Puedes cambiar la sensibilidad a "Normal" o "Bajo" para evitar notificaciones innecesarias de otras variables.',
      type: 'alert',
      createdAt: nowStr
    });
  }

  // 5. Default generic guidance if memory is empty
  if (insights.length === 0) {
    // Add default feedback
    if (memory.locations.length === 0) {
      insights.push({
        id: 'memory_learning_start',
        title: 'Aprendizaje en Progreso',
        message: 'ORBI todavía está aprendiendo tus patrones locales de uso. Consulta el clima de tus ciudades favoritas para ver sugerencias personalizadas.',
        type: 'scheduler',
        createdAt: nowStr
      });
    } else {
      insights.push({
        id: 'memory_healthy_sync',
        title: 'Memoria Local Saludable',
        message: 'Tus preferencias y tu memoria climática local están perfectamente sincronizadas. ORBI funciona en modo ultra-privado.',
        type: 'scheduler',
        createdAt: nowStr
      });
    }
  }

  return insights;
}

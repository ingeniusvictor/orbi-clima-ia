import { SmartWeatherAlert } from '../types/weatherTypes';

/**
 * Deduplica y filtra alertas para quedarse con las más relevantes, priorizadas por severidad.
 * Reglas de negocio:
 * - No mostrar dos alertas de la misma categoría si una es más severa o si son redundantes.
 * - Si hay tormenta (crítica), ocultar o subsumir alertas menores de lluvia.
 * - Mantener máximo 5 alertas principales activas.
 * - Ordenar por:
 *   1. Severidad (critical > warning > watch > info)
 *   2. Prioridad interna
 *   3. Proximidad temporal / startsAt
 */
export function dedupeSmartAlerts(alerts: SmartWeatherAlert[]): SmartWeatherAlert[] {
  if (alerts.length === 0) return [];

  // Mapear severidad a valores numéricos para ordenación
  const severityValue = {
    critical: 4,
    warning: 3,
    watch: 2,
    info: 1
  };

  // Ordenar preliminarmente por severidad y prioridad descendente
  const sorted = [...alerts].sort((a, b) => {
    const sevA = severityValue[a.severity] || 0;
    const sevB = severityValue[b.severity] || 0;
    if (sevB !== sevA) {
      return sevB - sevA; // Mayor severidad primero
    }
    return b.priority - a.priority; // Mayor prioridad primero
  });

  const deduped: SmartWeatherAlert[] = [];
  const categoriesSeen = new Set<string>();

  for (const alert of sorted) {
    // Si ya tenemos una alerta crítica/importante para esta categoría en el set, omitimos las de menor severidad
    const categoryKey = `${alert.profile}_${alert.category}`;
    
    // Regla especial: si hay tormenta crítica en curso o próxima, omitir alertas de lluvia regulares
    if (alert.category === 'rain' && categoriesSeen.has(`${alert.profile}_storm`)) {
      continue;
    }
    if (alert.category === 'storm' && alert.severity === 'critical') {
      // Remover de deduped cualquier lluvia menos crítica si acabamos de procesar una tormenta
      const rainIdx = deduped.findIndex(a => a.category === 'rain' && a.profile === alert.profile);
      if (rainIdx !== -1) {
        deduped.splice(rainIdx, 1);
      }
    }

    if (categoriesSeen.has(categoryKey)) {
      // Ya mostramos una alerta de esta categoría para este perfil (que tiene igual o mayor severidad por el orden previo)
      continue;
    }

    deduped.push(alert);
    categoriesSeen.add(categoryKey);
  }

  // Limitar a máximo 5 alertas principales activas
  return deduped.slice(0, 5);
}

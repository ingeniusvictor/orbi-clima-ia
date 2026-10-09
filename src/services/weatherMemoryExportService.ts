import { OrbiWeatherMemory } from '../types/weatherTypes';
import { loadWeatherMemory, saveWeatherMemory, DEFAULT_ORBI_WEATHER_MEMORY } from './weatherMemoryService';

export function exportWeatherMemoryAsJson(): string {
  try {
    const memory = loadWeatherMemory();
    return JSON.stringify(memory, null, 2);
  } catch (e: any) {
    throw new Error('Error al generar la exportación de memoria: ' + e.message);
  }
}

export function importWeatherMemoryFromJson(jsonText: string): OrbiWeatherMemory {
  try {
    if (!jsonText || !jsonText.trim()) {
      throw new Error('El archivo de respaldo está vacío.');
    }

    const parsed = JSON.parse(jsonText);

    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Formato JSON no válido.');
    }

    // Basic structure check
    if (parsed.version === undefined) {
      throw new Error('Falta el atributo "version" en el archivo de memoria.');
    }

    const importedMemory: OrbiWeatherMemory = {
      version: typeof parsed.version === 'string' ? parsed.version : '1.0.0',
      locations: Array.isArray(parsed.locations) ? parsed.locations : [],
      profileUses: Array.isArray(parsed.profileUses) ? parsed.profileUses : [],
      widgetUses: Array.isArray(parsed.widgetUses) ? parsed.widgetUses : [],
      insights: Array.isArray(parsed.insights) ? parsed.insights : [],
      lastUpdated: new Date().toISOString(),
    };

    // Sanitize locations: remove latitude/longitude and cap to max 10
    importedMemory.locations = importedMemory.locations
      .filter((loc: any) => loc && typeof loc === 'object' && loc.id && loc.name)
      .map((loc: any) => ({
        id: String(loc.id),
        name: String(loc.name),
        region: loc.region ? String(loc.region) : undefined,
        country: String(loc.country || 'Chile'),
        source: (loc.source === 'gps_confirmed' || loc.source === 'demo') ? loc.source : 'manual',
        useCount: typeof loc.useCount === 'number' && loc.useCount > 0 ? loc.useCount : 1,
        lastUsedAt: typeof loc.lastUsedAt === 'string' ? loc.lastUsedAt : new Date().toISOString(),
      }))
      .slice(0, 10);

    // Sanitize profile uses
    importedMemory.profileUses = importedMemory.profileUses
      .filter((pu: any) => pu && typeof pu === 'object' && (pu.profile === 'person' || pu.profile === 'field_work'))
      .map((pu: any) => ({
        profile: pu.profile,
        useCount: typeof pu.useCount === 'number' && pu.useCount > 0 ? pu.useCount : 1,
        lastUsedAt: typeof pu.lastUsedAt === 'string' ? pu.lastUsedAt : new Date().toISOString(),
      }));

    // Sanitize widget uses
    const validVariants = ['skyorb_mini', 'skypanel', 'field_command', 'cinematic_bar'];
    importedMemory.widgetUses = importedMemory.widgetUses
      .filter((wu: any) => wu && typeof wu === 'object' && validVariants.includes(wu.variant))
      .map((wu: any) => ({
        variant: wu.variant,
        useCount: typeof wu.useCount === 'number' && wu.useCount > 0 ? wu.useCount : 1,
        lastUsedAt: typeof wu.lastUsedAt === 'string' ? wu.lastUsedAt : new Date().toISOString(),
      }));

    // Sanitize insights: cap to max 20
    importedMemory.insights = importedMemory.insights
      .filter((ins: any) => ins && typeof ins === 'object' && ins.id && ins.title && ins.message)
      .map((ins: any) => ({
        id: String(ins.id),
        title: String(ins.title),
        message: String(ins.message),
        type: ['location', 'profile', 'widget', 'alert', 'scheduler'].includes(ins.type) ? ins.type : 'general',
        createdAt: typeof ins.createdAt === 'string' ? ins.createdAt : new Date().toISOString(),
      }))
      .slice(0, 20);

    // Save imported memory and trigger state refresh
    saveWeatherMemory(importedMemory);
    return importedMemory;
  } catch (e: any) {
    console.error('Error importing weather memory:', e);
    throw new Error('Error al importar la memoria climática: ' + (e.message || 'Formato corrupto o inconsistente.'));
  }
}

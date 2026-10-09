import React from 'react';
import { MapPin, Star, Trash2, History } from 'lucide-react';
import { WeatherMemoryLocationUse, OrbiClimaUserPreferences } from '../types/weatherTypes';
import { removeLocationFromMemory } from '../services/weatherMemoryService';
import { savePreferredLocation } from '../services/userPreferencesService';
import { scoreLocationUse } from '../utils/weatherMemoryScoring';

interface FrequentLocationsCardProps {
  locations: WeatherMemoryLocationUse[];
  preferences: OrbiClimaUserPreferences;
  onRefresh: () => void;
}

export default function FrequentLocationsCard({ locations, preferences, onRefresh }: FrequentLocationsCardProps) {
  const preferredLocId = preferences.preferredLocation?.id;

  const handleSetAsPreferred = (loc: WeatherMemoryLocationUse) => {
    savePreferredLocation({
      id: loc.id,
      name: loc.name,
      region: loc.region,
      country: loc.country,
      source: loc.source === 'gps_confirmed' ? 'gps' : 'manual',
      savedAt: new Date().toISOString()
    });
    onRefresh();
  };

  const handleRemove = (id: string) => {
    removeLocationFromMemory(id);
    onRefresh();
  };

  const formatLastUsed = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      const diffMs = Date.now() - d.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      
      if (diffMins < 1) return 'Hace unos instantes';
      if (diffMins < 60) return `Hace ${diffMins} min`;
      
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `Hace ${diffHours} h`;
      
      return d.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' });
    } catch {
      return 'Recientemente';
    }
  };

  return (
    <div id="frequent-locations-card" className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl transition-all hover:border-slate-700">
      <div className="flex items-center justify-between gap-3 mb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100 font-sans uppercase tracking-wider">Ubicaciones Frecuentes</h3>
            <p className="text-[10px] text-slate-400 font-sans">Historial de consultas locales (sin coordenadas GPS)</p>
          </div>
        </div>
      </div>

      {locations.length === 0 ? (
        <div className="py-4 px-4 rounded-xl bg-slate-950/40 border border-dashed border-slate-800/80 text-center">
          <span className="text-[10.5px] text-slate-500 italic font-sans">Aún no hay ubicaciones registradas en la memoria local.</span>
        </div>
      ) : (
        <div className="space-y-2">
          {locations.map((loc) => {
            const isPreferred = preferredLocId === loc.id;
            const score = scoreLocationUse(loc);
            
            return (
              <div
                key={loc.id}
                className={`p-2.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-all ${
                  isPreferred
                    ? 'border-cyan-500/20 bg-cyan-500/5'
                    : 'border-slate-800 bg-slate-950/40 hover:border-slate-700/60'
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold text-slate-200 font-sans truncate">
                      {loc.name}
                    </span>
                    {loc.region && (
                      <span className="text-[10px] text-slate-400 truncate font-sans">
                        ({loc.region})
                      </span>
                    )}
                    {isPreferred && (
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-bold font-mono bg-cyan-500/20 text-cyan-400 border border-cyan-500/15">
                        PREFERIDA
                      </span>
                    )}
                  </div>
                  
                  {/* Stats line */}
                  <div className="flex items-center gap-2.5 mt-1 text-[9.5px] text-slate-500 font-mono">
                    <span>Usos: <strong className="text-slate-300">{loc.useCount}</strong></span>
                    <span>·</span>
                    <span>Último: <strong className="text-slate-300">{formatLastUsed(loc.lastUsedAt)}</strong></span>
                    <span>·</span>
                    <span>Score: <strong className="text-cyan-400/90">{score.toFixed(0)}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                  {!isPreferred && (
                    <button
                      onClick={() => handleSetAsPreferred(loc)}
                      className="flex items-center gap-1 px-2 py-0.5 bg-cyan-500/10 hover:bg-cyan-500 text-cyan-400 hover:text-white border border-cyan-500/20 hover:border-cyan-500 rounded-lg text-[9.5px] font-bold transition-all cursor-pointer select-none"
                      title="Fijar como predeterminada al inicio"
                    >
                      <Star className="w-3 h-3" /> Fijar de inicio
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleRemove(loc.id)}
                    className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg border border-transparent hover:border-rose-500/10 transition-all cursor-pointer select-none"
                    title="Eliminar de la memoria"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

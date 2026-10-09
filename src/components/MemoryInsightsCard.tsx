import React from 'react';
import { Lightbulb, CheckCircle2, ArrowRight } from 'lucide-react';
import { WeatherMemoryInsight, OrbiClimaUserPreferences, OrbiWeatherMemory } from '../types/weatherTypes';
import { buildWeatherMemoryInsights } from '../utils/weatherMemoryInsights';
import { savePreferredLocation, updateUserPreferences } from '../services/userPreferencesService';

interface MemoryInsightsCardProps {
  memory: OrbiWeatherMemory;
  preferences: OrbiClimaUserPreferences;
  onRefresh: () => void;
}

export default function MemoryInsightsCard({ memory, preferences, onRefresh }: MemoryInsightsCardProps) {
  const insights = buildWeatherMemoryInsights({ memory, preferences }).slice(0, 3);

  const handleAction = (insightId: string, type: string) => {
    try {
      if (insightId.startsWith('suggest_pref_loc_')) {
        const locId = insightId.replace('suggest_pref_loc_', '');
        const loc = memory.locations.find(l => l.id === locId);
        if (loc) {
          savePreferredLocation({
            id: loc.id,
            name: loc.name,
            region: loc.region,
            country: loc.country,
            source: loc.source === 'gps_confirmed' ? 'gps' : 'manual',
            savedAt: new Date().toISOString()
          });
        }
      } else if (insightId.startsWith('suggest_pref_profile_')) {
        const profile = insightId.replace('suggest_pref_profile_', '') as any;
        updateUserPreferences({ preferredProfile: profile });
      } else if (insightId.startsWith('suggest_pref_widget_')) {
        const variant = insightId.replace('suggest_pref_widget_', '') as any;
        updateUserPreferences({ preferredWidgetVariant: variant });
      } else if (insightId === 'suggest_sensitivity_normal') {
        updateUserPreferences({ alertSensitivity: 'normal' });
      } else if (insightId === 'suggest_sensitivity_low') {
        updateUserPreferences({ alertSensitivity: 'low' });
      }
      onRefresh();
    } catch (err) {
      console.error('Error applying insight action:', err);
    }
  };

  const hasAction = (id: string) => {
    return id.startsWith('suggest_pref_') || id.startsWith('suggest_sensitivity_');
  };

  return (
    <div id="memory-insights-card" className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl transition-all hover:border-slate-700">
      <div className="flex items-center gap-2.5 mb-3.5">
        <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
          <Lightbulb className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-xs font-bold text-slate-100 font-sans uppercase tracking-wider">Insights de Memoria</h3>
          <p className="text-[10px] text-slate-400 font-sans">Patrones locales e inferencias de optimización automática</p>
        </div>
      </div>

      {insights.length === 0 || (insights.length === 1 && insights[0].id === 'memory_learning_start') ? (
        <div className="py-4 px-4 rounded-xl bg-slate-950/40 border border-dashed border-slate-800/80 text-center">
          <span className="text-[10.5px] text-slate-400 block font-sans italic">
            ORBI todavía está aprendiendo tus patrones locales de uso para sugerirte optimizaciones.
          </span>
        </div>
      ) : (
        <div className="space-y-2">
          {insights.map((ins) => {
            const clickable = hasAction(ins.id);
            return (
              <div
                key={ins.id}
                className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80 hover:border-slate-700/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[9.5px] font-mono font-bold text-amber-400/90 uppercase tracking-wider">
                      {ins.title}
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className="text-[9px] font-mono text-slate-500 capitalize">{ins.type}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed font-sans mt-0.5">
                    {ins.message}
                  </p>
                </div>

                {clickable && (
                  <button
                    onClick={() => handleAction(ins.id, ins.type)}
                    className="shrink-0 self-end sm:self-center flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-slate-950 text-[10px] font-bold tracking-wide uppercase transition-all cursor-pointer select-none"
                  >
                    Aplicar <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

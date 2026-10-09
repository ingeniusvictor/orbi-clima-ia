import React from 'react';
import { Sparkles, CheckCircle, ShieldAlert } from 'lucide-react';
import { OrbiWeatherMemory, OrbiClimaUserPreferences, PreferredWidgetVariant } from '../types/weatherTypes';
import { getMostUsedWidget } from '../utils/weatherMemoryScoring';
import { updateUserPreferences } from '../services/userPreferencesService';

interface WidgetSuggestionCardProps {
  memory: OrbiWeatherMemory;
  preferences: OrbiClimaUserPreferences;
  onRefresh: () => void;
}

const WIDGET_LABELS: Record<PreferredWidgetVariant, string> = {
  skyorb_mini: 'SkyOrb Mini (Compacto)',
  skypanel: 'SkyPanel (Estándar)',
  field_command: 'Field Command (Técnico)',
  cinematic_bar: 'Cinematic Bar (Visual)',
  skyorb_2x2: 'SkyOrb 2x2 (Snapshot Mini)',
  skyorb_4x2: 'SkyOrb 4x2 (Snapshot Panel)',
  skyorb_4x4: 'SkyOrb 4x4 (Snapshot Premium)'
};

export default function WidgetSuggestionCard({ memory, preferences, onRefresh }: WidgetSuggestionCardProps) {
  const dominantWidget = getMostUsedWidget(memory);
  const currentPrefWidget = preferences.preferredWidgetVariant;

  const handleApplyWidgetPref = (variant: PreferredWidgetVariant) => {
    updateUserPreferences({ preferredWidgetVariant: variant });
    onRefresh();
  };

  const dominantCount = memory.widgetUses.find(wu => wu.variant === dominantWidget)?.useCount || 0;
  const showSuggestion = dominantWidget && dominantWidget !== currentPrefWidget && dominantCount >= 3;

  return (
    <div id="widget-suggestion-card" className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl transition-all hover:border-slate-700">
      {/* Header with Icon, Title, and Subtitle stacked */}
      <div className="flex items-center gap-2.5 mb-2.5">
        <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-xs font-bold text-slate-100 font-sans uppercase tracking-wider">Optimización de Widget</h3>
          <p className="text-[10px] text-slate-400 font-sans">Adaptabilidad de vista por defecto</p>
        </div>
      </div>

      {/* Description / Content directly below the title */}
      <div className="mb-3.5">
        {showSuggestion ? (
          <p className="text-[11px] text-teal-300 font-sans leading-relaxed">
            Tu widget más visualizado en memoria es <strong className="text-slate-100">{WIDGET_LABELS[dominantWidget]}</strong> ({dominantCount} visualizaciones). Tu configuración actual tiene <strong className="text-slate-100">{WIDGET_LABELS[currentPrefWidget]}</strong>. ¿Deseas fijarlo como predeterminado en tu panel?
          </p>
        ) : (
          <p className="text-[11px] text-emerald-400 font-sans leading-relaxed">
            Tu widget preseleccionado ({WIDGET_LABELS[currentPrefWidget]}) coincide con tus patrones de visualización más altos en la memoria.
          </p>
        )}
      </div>

      {/* Footer Actions and Stats at the bottom */}
      <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-slate-800/60">
        {/* History small counters */}
        <div className="flex gap-1.5 text-[9px] font-mono text-slate-500">
          {memory.widgetUses.slice(0, 3).map((wu) => (
            <span key={wu.variant} className="bg-slate-950/60 px-1.5 py-0.5 rounded border border-slate-800" title={WIDGET_LABELS[wu.variant]}>
              {wu.variant.replace('skyorb_', '').replace('skypanel', 'panel').replace('field_command', 'field').replace('cinematic_bar', 'bar')}: {wu.useCount}
            </span>
          ))}
        </div>

        {showSuggestion ? (
          <button
            onClick={() => handleApplyWidgetPref(dominantWidget)}
            className="px-3 py-1 bg-teal-600 hover:bg-teal-500 text-white text-[10px] font-bold rounded-lg shadow-md transition-all active:scale-98 cursor-pointer select-none"
          >
            Fijar {WIDGET_LABELS[dominantWidget].split(' ')[0]}
          </button>
        ) : (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-[10px] font-medium border border-emerald-500/10">
            <CheckCircle className="w-3 h-3" /> Todo Listo
          </div>
        )}
      </div>
    </div>
  );
}

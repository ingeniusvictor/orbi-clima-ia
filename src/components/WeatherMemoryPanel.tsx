import React, { useState, useEffect } from 'react';
import { BrainCircuit, Upload, ShieldAlert, Sparkles, RefreshCw } from 'lucide-react';
import { loadWeatherMemory, saveWeatherMemory } from '../services/weatherMemoryService';
import { loadUserPreferences } from '../services/userPreferencesService';
import { importWeatherMemoryFromJson } from '../services/weatherMemoryExportService';
import { OrbiWeatherMemory } from '../types/weatherTypes';

// Sub components
import FrequentLocationsCard from './FrequentLocationsCard';
import ProfileSuggestionCard from './ProfileSuggestionCard';
import WidgetSuggestionCard from './WidgetSuggestionCard';
import MemoryInsightsCard from './MemoryInsightsCard';
import MemoryPrivacyCard from './MemoryPrivacyCard';
import EmptyStateCard from './EmptyStateCard';

export default function WeatherMemoryPanel() {
  const [memory, setMemory] = useState<OrbiWeatherMemory>(() => loadWeatherMemory());
  const [preferences, setPreferences] = useState(() => loadUserPreferences());
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  const isMemoryEmpty = 
    (!memory.locations || memory.locations.length === 0) &&
    (!memory.profileUses || memory.profileUses.length === 0) &&
    (!memory.widgetUses || memory.widgetUses.length === 0);

  const refreshData = () => {
    setMemory(loadWeatherMemory());
    setPreferences(loadUserPreferences());
  };

  useEffect(() => {
    refreshData();
    
    // Add event listeners to sync changes dynamically
    window.addEventListener('orbi-weather-memory-changed', refreshData);
    window.addEventListener('orbi-user-preferences-changed', refreshData);

    return () => {
      window.removeEventListener('orbi-weather-memory-changed', refreshData);
      window.removeEventListener('orbi-user-preferences-changed', refreshData);
    };
  }, []);

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError(null);
    setImportSuccess(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const imported = importWeatherMemoryFromJson(text);
        setMemory(imported);
        setImportSuccess('Memoria importada exitosamente.');
        setTimeout(() => setImportSuccess(null), 3500);
        if (e.target) {
          e.target.value = '';
        }
      } catch (err: any) {
        setImportError(err.message || 'Error al importar.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div id="weather-memory-panel" className="space-y-6">
      
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-[#1e1b4b]/40 p-5 rounded-2xl border border-indigo-500/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
            <BrainCircuit className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="font-bold text-sm text-slate-100 tracking-wide uppercase font-sans flex items-center gap-2">
              Memoria Climática Inteligente
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-normal py-0.5 px-2 rounded-full border border-indigo-500/10">
                ORBI SkyCore™
              </span>
            </h2>
            <span className="text-[11px] text-indigo-300/80 block font-mono">Heurísticas Locales Coherentes (Módulo 7B)</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* File input for JSON import */}
          <label className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950/60 hover:bg-slate-950 hover:text-white border border-slate-800 rounded-xl text-[11px] font-medium text-slate-300 cursor-pointer transition-all">
            <Upload className="w-3.5 h-3.5 text-indigo-400" /> Importar Memoria
            <input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>

          <button
            onClick={refreshData}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl transition-all"
            title="Refrescar estado"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Import feedback */}
      {importError && (
        <div className="p-3.5 rounded-xl bg-rose-500/5 border border-rose-500/15 text-xs text-rose-400 flex items-center gap-2 font-sans">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{importError}</span>
        </div>
      )}

      {importSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/15 text-xs text-emerald-400 flex items-center gap-2 font-sans">
          <Sparkles className="w-4 h-4 shrink-0 text-emerald-300" />
          <span>{importSuccess}</span>
        </div>
      )}

      {/* Single-column vertical list of horizontal sub-windows */}
      {isMemoryEmpty ? (
        <div className="p-8 rounded-3xl bg-[#070b13]/60 border border-slate-800/80 flex items-center justify-center min-h-[260px]">
          <EmptyStateCard
            iconType="memory"
            title="ORBI todavía está aprendiendo tus patrones locales"
            message="No hay suficiente historial de interacción local guardado en este dispositivo. Explora el clima de diferentes ciudades, guarda ubicaciones preferidas o cambia de perfil para comenzar a poblar tu memoria local."
          />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          
          <FrequentLocationsCard 
            locations={memory.locations} 
            preferences={preferences} 
            onRefresh={refreshData} 
          />
          
          <MemoryInsightsCard 
            memory={memory} 
            preferences={preferences} 
            onRefresh={refreshData} 
          />

          <ProfileSuggestionCard 
            memory={memory} 
            preferences={preferences} 
            onRefresh={refreshData} 
          />

          <WidgetSuggestionCard 
            memory={memory} 
            preferences={preferences} 
            onRefresh={refreshData} 
          />
          
          <MemoryPrivacyCard 
            memory={memory} 
            onRefresh={refreshData} 
          />

        </div>
      )}

      {/* HSE Terreno Directive Section */}
      <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 flex gap-3 items-start">
        <ShieldAlert className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
        <p className="text-[11px] text-amber-400/90 font-sans leading-relaxed">
          <strong>Directiva HSE Terreno:</strong> Las alertas ORBI son apoyo preventivo. No reemplazan protocolos HSE, evaluación en terreno ni instrucciones del empleador.
        </p>
      </div>

    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Sliders, BellRing, Sparkles, Star } from 'lucide-react';
import { WeatherLocation, SmartAlertCategory } from '../types/weatherTypes';
import { loadUserPreferences, updateUserPreferences } from '../services/userPreferencesService';

// Nested cards
import PreferredLocationCard from './PreferredLocationCard';
import ProfilePreferenceCard from './ProfilePreferenceCard';
import WidgetPreferenceCard from './WidgetPreferenceCard';
import AlertSensitivityCard from './AlertSensitivityCard';
import PreferencesBackupCard from './PreferencesBackupCard';
import WeatherMemoryPanel from './WeatherMemoryPanel';
import PrivacyTrustCard from './PrivacyTrustCard';

interface UserPreferencesPanelProps {
  currentLocation: WeatherLocation;
  weatherSourceMode: 'mock' | 'live' | 'cached' | 'fallback';
}

const CATEGORY_LABELS: { id: SmartAlertCategory; label: string; desc: string; color: string }[] = [
  { id: 'rain', label: 'Lluvia y Nieve', desc: 'Precipitación y humedad crítica.', color: 'border-blue-500/20 text-blue-400 bg-blue-500/5' },
  { id: 'wind', label: 'Viento Continuo', desc: 'Velocidades sostenidas.', color: 'border-teal-500/20 text-teal-400 bg-teal-500/5' },
  { id: 'gusts', label: 'Ráfagas de Viento', desc: 'Avisos por rachas cortas.', color: 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5' },
  { id: 'uv', label: 'Radiación UV', desc: 'Riesgo solar e índice extremo.', color: 'border-amber-500/20 text-amber-400 bg-amber-500/5' },
  { id: 'cold', label: 'Frío Extremo', desc: 'Temperaturas bajo cero.', color: 'border-sky-500/20 text-sky-400 bg-sky-500/5' },
  { id: 'heat', label: 'Ola de Calor', desc: 'Altas temperaturas AM/PM.', color: 'border-orange-500/20 text-orange-400 bg-orange-500/5' },
  { id: 'humidity', label: 'Humedad Extrema', desc: 'Humedad relativa en terreno.', color: 'border-indigo-500/20 text-indigo-400 bg-indigo-500/5' },
  { id: 'storm', label: 'Tormentas', desc: 'Descargas y viento eléctrico.', color: 'border-purple-500/20 text-purple-400 bg-purple-500/5' },
  { id: 'field_work', label: 'Faena Agrícola/Terreno', desc: 'Restricciones de trabajo.', color: 'border-yellow-500/20 text-yellow-400 bg-yellow-500/5' },
  { id: 'electrical_work', label: 'Trabajo Eléctrico', desc: 'Riesgo de descargas o ráfagas.', color: 'border-rose-500/20 text-rose-400 bg-rose-500/5' },
  { id: 'solar_pv', label: 'Energía Fotovoltaica', desc: 'Ventanas óptimas de radiación.', color: 'border-amber-500/20 text-amber-500 bg-amber-500/5' },
  { id: 'general', label: 'General / Operación', desc: 'Cualquier otra actualización preventiva.', color: 'border-slate-500/20 text-slate-400 bg-slate-500/5' }
];

export default function UserPreferencesPanel({ currentLocation, weatherSourceMode }: UserPreferencesPanelProps) {
  const [prefs, setPrefs] = useState(() => loadUserPreferences());

  useEffect(() => {
    const handleUpdate = () => {
      setPrefs(loadUserPreferences());
    };
    window.addEventListener('orbi-user-preferences-changed', handleUpdate);
    return () => {
      window.removeEventListener('orbi-user-preferences-changed', handleUpdate);
    };
  }, []);

  const handleCategoryToggle = (category: SmartAlertCategory) => {
    const current = [...prefs.favoriteAlertCategories];
    const index = current.indexOf(category);
    if (index > -1) {
      // Don't empty completely, keep at least one
      if (current.length > 1) {
        current.splice(index, 1);
      }
    } else {
      current.push(category);
    }
    updateUserPreferences({ favoriteAlertCategories: current });
  };

  return (
    <div id="user-preferences-panel" className="space-y-6">
      
      {/* Title block */}
      <div className="flex items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-[#0e172a] p-4.5 rounded-2xl border border-white/5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
            <Sliders className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="font-bold text-sm text-slate-100 tracking-wide uppercase font-sans">Preferencias ORBI Clima IA</h2>
            <span className="text-[11px] text-slate-400 block font-mono">Memoria Local & Ajustes de Estilo (Módulo 7A)</span>
          </div>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/15">
          PREFS VERSION: {prefs.version}
        </span>
      </div>

      {/* Grid containing core settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Row 1: Location & Profile defaults */}
        <PreferredLocationCard 
          currentLocation={currentLocation} 
          weatherSourceMode={weatherSourceMode} 
        />
        <ProfilePreferenceCard />

        {/* Row 2: Layout options & sensitivity levels */}
        <WidgetPreferenceCard />
        <AlertSensitivityCard />

      </div>

      {/* Row 3: Favorite Alert Categories selection block */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
            <Star className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100 font-sans">Categorías de Alerta Favoritas</h3>
            <p className="text-xs text-slate-400 mt-0.5">Alertas priorizadas para notificaciones rápidas</p>
          </div>
        </div>

        <p className="text-xs text-slate-300 mb-4 leading-relaxed font-sans">
          Estas categorías tendrán prioridad de entrega en tu perfil seleccionado y se destacarán en tu panel principal. Elige al menos una.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {CATEGORY_LABELS.map((item) => {
            const isFav = prefs.favoriteAlertCategories.includes(item.id);
            return (
              <button
                key={item.id}
                onClick={() => handleCategoryToggle(item.id)}
                className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${
                  isFav
                    ? 'border-cyan-500/40 bg-cyan-500/5 text-slate-100'
                    : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className={`mt-0.5 p-1 rounded-md border text-[9px] font-mono font-bold uppercase shrink-0 ${
                  isFav ? 'border-cyan-400/30 text-cyan-400 bg-cyan-400/10' : 'border-slate-800 text-slate-500 bg-slate-900'
                }`}>
                  ★
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold font-sans block leading-none">{item.label}</span>
                  <span className="text-[10px] text-slate-500 mt-1 block font-sans leading-relaxed">{item.desc}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Memoria Climática Inteligente (Módulo 7B) */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        <WeatherMemoryPanel />
      </div>

      {/* Privacy & Security */}
      <PrivacyTrustCard />

      {/* Row 4: Data export & reset controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <PreferencesBackupCard />
        
        {/* Privacidad y preparación pública */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between gap-4">
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase font-sans tracking-wide">Privacidad y preparación pública</h4>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed font-sans">
              Revisa si tu aplicación cumple con los requisitos técnicos de Google Play, descarga los borradores de políticas y gestiona el inventario de permisos.
            </p>
          </div>
          <div>
            <button
              onClick={() => {
                const element = document.getElementById('store-readiness-panel-container');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="w-full flex items-center justify-center gap-2 p-2.5 bg-cyan-500/10 hover:bg-cyan-500/15 border border-cyan-500/20 hover:border-cyan-500/30 text-cyan-400 rounded-xl text-xs font-bold transition-all cursor-pointer font-sans active:scale-95 animate-pulse"
            >
              Verificar Store Readiness
            </button>
          </div>
        </div>

        {/* QA Center Release Candidate */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between gap-4">
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase font-sans tracking-wide">QA Center Interno</h4>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed font-sans">
              Pruebas de cámara gris y verificación de cumplimiento técnico del Módulo 0 al Módulo 8B antes del empaquetado final.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => {
                const element = document.getElementById('orbi-qa-center-panel');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="w-full flex items-center justify-center gap-2 p-2.5 bg-indigo-500/10 hover:bg-indigo-500/15 border border-indigo-500/20 hover:border-indigo-500/30 text-indigo-400 rounded-xl text-xs font-bold transition-all cursor-pointer font-sans active:scale-95"
            >
              🛠️ Abrir QA Center
            </button>
            <button
              onClick={() => {
                const element = document.getElementById('orbi-packaging-panel-container');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="w-full flex items-center justify-center gap-2 p-2.5 bg-blue-500/10 hover:bg-blue-500/15 border border-blue-500/20 hover:border-blue-500/30 text-blue-400 rounded-xl text-xs font-bold transition-all cursor-pointer font-sans active:scale-95"
            >
              📦 Empaquetado Android (9B)
            </button>
          </div>
        </div>

        {/* Reset Onboarding Block */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between gap-4">
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase font-sans tracking-wide">Presentación de Inicio</h4>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed font-sans">
              ¿Quieres volver a ver la introducción? Puedes restablecer la experiencia de onboarding de inicio para revisar las características de ORBI Clima IA, la política de privacidad local y el soporte de widgets interactivos.
            </p>
          </div>
          <div>
            <button
              onClick={() => {
                localStorage.removeItem('orbi_clima_first_launch_completed_v1');
                window.location.reload();
              }}
              className="w-full flex items-center justify-center gap-2 p-2.5 bg-indigo-500/10 hover:bg-indigo-500/15 border border-indigo-500/20 hover:border-indigo-500/30 text-indigo-400 rounded-xl text-xs font-bold transition-all cursor-pointer font-sans active:scale-95"
            >
              Reiniciar Onboarding y Recargar
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}

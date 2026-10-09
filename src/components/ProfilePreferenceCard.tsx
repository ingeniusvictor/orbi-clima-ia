import React, { useState, useEffect } from 'react';
import { User, Cpu, CheckCircle } from 'lucide-react';
import { WeatherProfile } from '../types/weatherTypes';
import { loadUserPreferences, updateUserPreferences } from '../services/userPreferencesService';

export default function ProfilePreferenceCard() {
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

  const handleProfileChange = (profile: WeatherProfile) => {
    updateUserPreferences({ preferredProfile: profile });
  };

  return (
    <div id="profile-preference-card" className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl transition-all hover:border-slate-700">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
          <User className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-100 font-sans">Perfil de Inicio</h3>
          <p className="text-xs text-slate-400 mt-0.5">Perfil predeterminado de la app</p>
        </div>
      </div>

      <p className="text-xs text-slate-300 mb-4 leading-relaxed font-sans">
        ORBI puede iniciar siempre en el perfil que más usas.
      </p>

      <div className="grid grid-cols-2 gap-3">
        {/* Profile Person */}
        <button
          onClick={() => handleProfileChange('person')}
          className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between gap-1.5 ${
            prefs.preferredProfile === 'person'
              ? 'bg-amber-500/5 border-amber-500/40 text-slate-200'
              : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-400'
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <User className={`w-4 h-4 ${prefs.preferredProfile === 'person' ? 'text-amber-400' : 'text-slate-500'}`} />
            {prefs.preferredProfile === 'person' && (
              <span className="text-[9px] font-mono font-bold text-amber-400">INICIO</span>
            )}
          </div>
          <div>
            <span className="text-xs font-bold block">Perfil Persona</span>
            <span className="text-[10px] text-slate-500">Uso diario e informativo</span>
          </div>
        </button>

        {/* Profile Tech */}
        <button
          onClick={() => handleProfileChange('field_tech')}
          className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between gap-1.5 ${
            prefs.preferredProfile === 'field_tech'
              ? 'bg-blue-500/5 border-blue-500/40 text-slate-200'
              : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-400'
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <Cpu className={`w-4 h-4 ${prefs.preferredProfile === 'field_tech' ? 'text-blue-400' : 'text-slate-500'}`} />
            {prefs.preferredProfile === 'field_tech' && (
              <span className="text-[9px] font-mono font-bold text-blue-400">INICIO</span>
            )}
          </div>
          <div>
            <span className="text-xs font-bold block">Perfil Técnico</span>
            <span className="text-[10px] text-slate-500">Operación técnica y HSE</span>
          </div>
        </button>
      </div>
    </div>
  );
}

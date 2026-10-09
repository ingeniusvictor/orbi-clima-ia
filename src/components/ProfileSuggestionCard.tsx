import React from 'react';
import { Sparkles, ShieldCheck } from 'lucide-react';
import { OrbiWeatherMemory, OrbiClimaUserPreferences, WeatherProfile } from '../types/weatherTypes';
import { getMostUsedProfile } from '../utils/weatherMemoryScoring';
import { updateUserPreferences } from '../services/userPreferencesService';

interface ProfileSuggestionCardProps {
  memory: OrbiWeatherMemory;
  preferences: OrbiClimaUserPreferences;
  onRefresh: () => void;
}

export default function ProfileSuggestionCard({ memory, preferences, onRefresh }: ProfileSuggestionCardProps) {
  const dominantProfile = getMostUsedProfile(memory);
  const currentPrefProfile = preferences.preferredProfile;

  const handleApplyProfilePref = (profile: WeatherProfile) => {
    updateUserPreferences({ preferredProfile: profile });
    onRefresh();
  };

  const getProfileLabel = (p: WeatherProfile) => {
    return p === 'person' ? 'Persona' : 'Técnico Terreno';
  };

  const dominantCount = memory.profileUses.find(pu => pu.profile === dominantProfile)?.useCount || 0;
  const showSuggestion = dominantProfile && dominantProfile !== currentPrefProfile && dominantCount >= 3;

  return (
    <div id="profile-suggestion-card" className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl transition-all hover:border-slate-700">
      {/* Header with Icon, Title, and Subtitle stacked */}
      <div className="flex items-center gap-2.5 mb-2.5">
        <div className="p-2 rounded-xl bg-pink-500/10 text-pink-400">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-xs font-bold text-slate-100 font-sans uppercase tracking-wider">Optimización de Perfil</h3>
          <p className="text-[10px] text-slate-400 font-sans">Alineación del flujo de inicio</p>
        </div>
      </div>

      {/* Description / Content directly below the title */}
      <div className="mb-3.5">
        {showSuggestion ? (
          <p className="text-[11px] text-pink-300 font-sans leading-relaxed">
            Has usado más el perfil <strong className="text-slate-100">{getProfileLabel(dominantProfile)}</strong> recientemente ({dominantCount} consultas). Tu perfil de inicio actual es <strong className="text-slate-100">{getProfileLabel(currentPrefProfile)}</strong>. ¿Deseas cambiar tu perfil de inicio preferido?
          </p>
        ) : (
          <p className="text-[11px] text-emerald-400 font-sans leading-relaxed">
            Tu perfil de inicio coincide con tus hábitos de consulta más recurrentes (<strong className="text-slate-200">{getProfileLabel(currentPrefProfile)}</strong>).
          </p>
        )}
      </div>

      {/* Footer Actions and Stats at the bottom */}
      <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-slate-800/60">
        {/* History small counters */}
        <div className="flex gap-1.5 text-[9px] font-mono text-slate-500">
          {memory.profileUses.map((pu) => (
            <span key={pu.profile} className="bg-slate-950/60 px-1.5 py-0.5 rounded border border-slate-800" title={`Consultas de perfil ${getProfileLabel(pu.profile)}`}>
              {pu.profile === 'person' ? 'Pers' : 'Tec'}: {pu.useCount}
            </span>
          ))}
        </div>

        {showSuggestion ? (
          <button
            onClick={() => handleApplyProfilePref(dominantProfile)}
            className="px-3 py-1 bg-pink-600 hover:bg-pink-500 text-white text-[10px] font-bold rounded-lg shadow-md transition-all active:scale-98 cursor-pointer select-none"
          >
            Iniciar en {getProfileLabel(dominantProfile)}
          </button>
        ) : (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-[10px] font-medium border border-emerald-500/10">
            <ShieldCheck className="w-3 h-3" /> Todo Listo
          </div>
        )}
      </div>
    </div>
  );
}

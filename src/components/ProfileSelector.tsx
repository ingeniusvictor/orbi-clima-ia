import { WeatherProfile } from '../types/weatherTypes';
import { User, HardHat, Sparkles } from 'lucide-react';

interface ProfileSelectorProps {
  activeProfile: WeatherProfile;
  onChange: (profile: WeatherProfile) => void;
}

export default function ProfileSelector({ activeProfile, onChange }: ProfileSelectorProps) {
  return (
    <div className="w-full flex flex-col gap-3" id="profile-selector-container">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-white/50 uppercase font-mono tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Configuración de Núcleo</span>
        </div>
        <span className="text-[11px] font-mono text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-md border border-cyan-400/20">
          Modo Activo: {activeProfile === 'person' ? 'PERSONA' : 'TÉCNICO TERRENO'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Person Profile */}
        <button
          onClick={() => onChange('person')}
          className={`relative overflow-hidden flex flex-col items-start p-4 rounded-2xl border text-left transition-all duration-300 ${
            activeProfile === 'person'
              ? 'bg-gradient-to-br from-cyan-950/40 to-slate-900/40 border-cyan-500/50 shadow-lg shadow-cyan-950/20'
              : 'bg-white/5 hover:bg-white/10 border-white/5 hover:border-white/10'
          }`}
          id="profile-btn-person"
        >
          {activeProfile === 'person' && (
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-cyan-400/10 to-transparent rounded-full blur-xl" />
          )}
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-2 rounded-xl ${
              activeProfile === 'person' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-white/5 text-white/60'
            }`}>
              <User className="w-5 h-5" />
            </div>
            <span className={`font-sans font-medium text-sm md:text-base ${
              activeProfile === 'person' ? 'text-white' : 'text-white/70'
            }`}>
              Perfil Persona
            </span>
          </div>
          <p className="text-xs text-white/50 leading-relaxed min-h-[48px]">
            Uso diario, familiar y personal. Responde sobre abrigo, salidas, lluvias inminentes y UV para tu cuidado personal.
          </p>
        </button>

        {/* Field Tech Profile */}
        <button
          onClick={() => onChange('field_tech')}
          className={`relative overflow-hidden flex flex-col items-start p-4 rounded-2xl border text-left transition-all duration-300 ${
            activeProfile === 'field_tech'
              ? 'bg-gradient-to-br from-amber-950/40 to-slate-900/40 border-amber-500/50 shadow-lg shadow-amber-950/20'
              : 'bg-white/5 hover:bg-white/10 border-white/5 hover:border-white/10'
          }`}
          id="profile-btn-tech"
        >
          {activeProfile === 'field_tech' && (
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-amber-400/10 to-transparent rounded-full blur-xl" />
          )}
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-2 rounded-xl ${
              activeProfile === 'field_tech' ? 'bg-amber-500/20 text-amber-300' : 'bg-white/5 text-white/60'
            }`}>
              <HardHat className="w-5 h-5" />
            </div>
            <span className={`font-sans font-medium text-sm md:text-base ${
              activeProfile === 'field_tech' ? 'text-white' : 'text-white/70'
            }`}>
              Técnico Terreno
            </span>
          </div>
          <p className="text-xs text-white/50 leading-relaxed min-h-[48px]">
            Operaciones de campo. Evalúa seguridad exterior, vientos, humedad para maniobras eléctricas y rendimiento fotovoltaico.
          </p>
        </button>
      </div>
    </div>
  );
}

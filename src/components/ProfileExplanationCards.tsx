import React from 'react';
import { Users, HardHat, ShieldAlert, Sparkles } from 'lucide-react';
import { WeatherProfile } from '../types/weatherTypes';

interface ProfileExplanationCardsProps {
  activeProfile: WeatherProfile;
  onChangeProfile: (profile: WeatherProfile) => void;
}

export default function ProfileExplanationCards({ activeProfile, onChangeProfile }: ProfileExplanationCardsProps) {
  return (
    <div id="profile-explanation-cards" className="grid grid-cols-1 md:grid-cols-2 gap-4">
      
      {/* Perfil Persona */}
      <div
        onClick={() => onChangeProfile('person')}
        className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
          activeProfile === 'person'
            ? 'border-cyan-500 bg-cyan-500/5 shadow-lg shadow-cyan-500/5'
            : 'border-slate-800 bg-[#070b13]/60 hover:border-slate-700'
        }`}
      >
        {activeProfile === 'person' && (
          <div className="absolute top-0 right-0 bg-cyan-500 text-slate-950 px-2 py-0.5 rounded-bl-xl text-[8px] font-bold font-mono uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" /> ACTIVO
          </div>
        )}
        
        <div className="flex items-center gap-3 mb-3">
          <div className={`p-2.5 rounded-xl ${activeProfile === 'person' ? 'bg-cyan-500/15 text-cyan-400' : 'bg-slate-800 text-slate-400'}`}>
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-200 font-sans">Perfil Persona</h4>
            <span className="text-[10px] font-mono text-cyan-400/90 block">Para tu día a día</span>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          ORBI resume el clima en decisiones humanas y simples: tipo de ropa recomendada, necesidad de paraguas, nivel de radiación UV, sensaciones de frío/calor extremo y la mejor hora estimada para salir o hacer deporte.
        </p>
      </div>

      {/* Perfil Técnico Terreno */}
      <div
        onClick={() => onChangeProfile('field_tech')}
        className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
          activeProfile === 'field_tech'
            ? 'border-amber-500 bg-amber-500/5 shadow-lg shadow-amber-500/5'
            : 'border-slate-800 bg-[#070b13]/60 hover:border-slate-700'
        }`}
      >
        {activeProfile === 'field_tech' && (
          <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 px-2 py-0.5 rounded-bl-xl text-[8px] font-bold font-mono uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" /> ACTIVO
          </div>
        )}

        <div className="flex items-center gap-3 mb-3">
          <div className={`p-2.5 rounded-xl ${activeProfile === 'field_tech' ? 'bg-amber-500/15 text-amber-400' : 'bg-slate-800 text-slate-400'}`}>
            <HardHat className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-200 font-sans">Perfil Técnico Terreno</h4>
            <span className="text-[10px] font-mono text-amber-400/90 block">Para operaciones en terreno</span>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed font-sans mb-3">
          ORBI interpreta con precisión humedad relativa, ráfagas de viento crítico, tasas de lluvia, radiación UV extrema y riesgo de tormentas para dar soporte en decisiones de prevención y operación técnica al aire libre.
        </p>

        <div className="flex gap-1.5 items-start bg-amber-500/10 p-2.5 rounded-lg text-[9px] text-amber-300 leading-relaxed font-sans border border-amber-500/5">
          <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
          <span>Las recomendaciones técnicas son apoyo preventivo y no reemplazan protocolos HSE ni decisiones profesionales en faena.</span>
        </div>
      </div>

    </div>
  );
}

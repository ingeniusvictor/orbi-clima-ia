import React, { useState } from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';

export type FxQuality = 'high' | 'medium' | 'low';

export function getFxQuality(): FxQuality {
  const saved = localStorage.getItem('orbi_clima_skycore_fx_performance_v1');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed.mode === 'battery_saver' || parsed.mode === 'low') return 'low';
      if (parsed.mode === 'balanced' || parsed.mode === 'medium') return 'medium';
      return 'high';
    } catch (e) {
      // Fallback
    }
  }
  
  const savedDirect = localStorage.getItem('orbi-fx-quality');
  if (savedDirect === 'high' || savedDirect === 'medium' || savedDirect === 'low') {
    return savedDirect as FxQuality;
  }
  return 'medium';
}

export default function FxQualitySettingsCard() {
  const [quality, setQuality] = useState<FxQuality>(() => getFxQuality());

  const handleModeChange = (mode: FxQuality) => {
    localStorage.setItem('orbi-fx-quality', mode);
    localStorage.setItem('orbi_clima_skycore_fx_performance_v1', JSON.stringify({
      mode: mode === 'low' ? 'battery_saver' : (mode === 'medium' ? 'balanced' : 'high'),
      particlesEnabled: mode !== 'low',
      overlaysEnabled: mode !== 'low',
      orbMotionEnabled: mode !== 'low',
      reducedMotion: mode === 'low'
    }));
    setQuality(mode);
    window.dispatchEvent(new CustomEvent('orbi-fx-quality-changed', { detail: mode }));
  };

  const OPTIONS = [
    {
      id: 'high' as FxQuality,
      label: 'Alto',
      desc: 'Esfera climática viva con anillos orbitales, chorros de partículas y efectos visuales de alto realismo.',
      badge: 'MÁXIMA CALIDAD'
    },
    {
      id: 'medium' as FxQuality,
      label: 'Equilibrado',
      desc: 'Partículas moderadas y órbita reactiva balanceada. Ideal para un rendimiento fluido y autonomía media.',
      badge: 'POR DEFECTO'
    },
    {
      id: 'low' as FxQuality,
      label: 'Ahorro',
      desc: 'Esfera climática estática, sin partículas pesadas ni efectos animados. Reduce drásticamente el uso de batería.',
      badge: 'AHORRO ENERGÍA'
    }
  ];

  return (
    <div id="fx-quality-preference-card" className="p-5 rounded-2xl bg-[#090f1e]/80 border border-white/5 shadow-xl transition-all hover:border-white/10">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
          <Sparkles className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-100 font-sans">Efectos SkyCore</h3>
          <p className="text-xs text-slate-400 mt-0.5">Control visual y ahorro de energía</p>
        </div>
      </div>

      <p className="text-xs text-slate-300 mb-4 leading-relaxed font-sans">
        Controla la intensidad visual de la esfera climática y efectos ambientales.
      </p>

      <div className="space-y-2.5">
        {OPTIONS.map((opt) => {
          const isSelected = quality === opt.id;

          return (
            <button
              key={opt.id}
              onClick={() => handleModeChange(opt.id)}
              className={`w-full p-3 rounded-xl border text-left flex items-start justify-between gap-3 transition-all ${
                isSelected
                  ? 'bg-cyan-500/5 border-cyan-500/40 text-slate-200'
                  : 'bg-[#050914] border-white/5 hover:border-white/10 text-slate-400'
              }`}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-200 font-sans">{opt.label}</span>
                  <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                    opt.id === 'high' 
                      ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/15'
                      : opt.id === 'medium'
                        ? 'text-indigo-400 bg-indigo-500/10 border-indigo-500/15'
                        : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/15'
                  }`}>
                    {opt.badge}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5 font-sans leading-relaxed">{opt.desc}</p>
              </div>

              {isSelected && (
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

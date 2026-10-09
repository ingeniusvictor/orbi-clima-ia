import React, { useState } from 'react';
import { ShieldCheck, Info, RefreshCw, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';
import { WeatherLocation, WeatherSourceState } from '../types/weatherTypes';
import { calculateSkyCoreTrust, registeredTrustProviders } from '../services/skyCoreSourceTrustService';

interface SkyCoreTrustCardProps {
  sourceState: WeatherSourceState;
  location: WeatherLocation;
}

export default function SkyCoreTrustCard({ sourceState, location }: SkyCoreTrustCardProps) {
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const trust = calculateSkyCoreTrust(sourceState);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'live': return { label: 'EN VIVO', bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400', dot: 'bg-emerald-400 animate-pulse' };
      case 'cache': return { label: 'CACHÉ', bg: 'bg-amber-500/15 border-amber-500/30 text-amber-400', dot: 'bg-amber-400' };
      case 'fallback': return { label: 'RESPALDO', bg: 'bg-rose-500/15 border-rose-500/30 text-rose-400', dot: 'bg-rose-400 animate-pulse' };
      default: return { label: 'DEMO', bg: 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400', dot: 'bg-indigo-400' };
    }
  };

  const statusBadge = getStatusBadge(trust.sourceStatus);
  const live = trust.sourceStatus === 'live';

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-tr from-slate-900/40 via-[#0a1122]/70 to-[#0e172e]/40 border border-white/5 space-y-3 shadow-md shadow-black/20" id="skycore-weather-trust-layer">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="text-[10px] font-mono text-slate-300 font-bold uppercase tracking-wider">Proveniencia Meteorológica</span>
        </div>
        <button onClick={() => setShowDisclaimer(!showDisclaimer)} className="p-1 rounded-md text-slate-400 hover:text-cyan-400 hover:bg-white/5 transition-all cursor-pointer" title="Ver fuentes y límites">
          <Info className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 text-left">
        <div className="p-2.5 rounded-xl bg-white/2 border border-white/5">
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">Fuente Principal</span>
            <div className={`px-1.5 py-0.5 text-[8px] font-mono rounded-md border font-bold flex items-center gap-1 ${statusBadge.bg}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />{statusBadge.label}
            </div>
          </div>
          <span className="text-[11px] font-sans font-bold text-white mt-1.5 block truncate">{trust.activePrimarySource}</span>
        </div>

        <div className="p-2.5 rounded-xl bg-white/2 border border-white/5">
          <span className="text-[9px] font-mono text-slate-400 block uppercase tracking-wider">Integridad de Fuente</span>
          <div className="flex items-center gap-1.5 mt-1.5">
            {live ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : trust.sourceStatus === 'cache' ? <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> : <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />}
            <span className={`text-xs font-sans font-bold ${live ? 'text-emerald-400' : trust.sourceStatus === 'cache' ? 'text-amber-400' : 'text-rose-400'}`}>{trust.integrityLabel}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 px-1 border-t border-white/5 pt-2">
        <div className="flex items-center gap-1"><RefreshCw className="w-2.5 h-2.5 text-cyan-400" /><span>{trust.lastUpdatedText}</span></div>
        <span className="text-slate-500 truncate max-w-[45%]">{location.name}</span>
      </div>

      <p className="text-[9px] text-slate-400 leading-relaxed">{trust.userMessage}</p>

      {showDisclaimer && (
        <div className="mt-2.5 p-3 bg-slate-950/80 border border-white/5 rounded-xl space-y-2.5 animate-fadeIn text-left text-[9px] text-slate-300 font-sans leading-relaxed">
          <p><strong className="text-cyan-400">Fuentes activas:</strong> {registeredTrustProviders.filter(p => p.status !== 'planned').map(p => p.providerName).join(' · ')}.</p>
          <p>ORBI diferencia ahora procedencia, frescura y acuerdo de modelos. Ninguno de esos indicadores equivale por sí solo a una medición instrumental en la ubicación exacta.</p>
          <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[9px] leading-normal text-amber-200">
            <strong className="text-amber-400 uppercase font-mono block mb-0.5">Directiva HSE Terreno</strong>
            Las alertas ORBI son apoyo preventivo. No reemplazan protocolos HSE, evaluación en terreno, mediciones instrumentales ni instrucciones de autoridades o del empleador.
          </div>
        </div>
      )}
    </div>
  );
}

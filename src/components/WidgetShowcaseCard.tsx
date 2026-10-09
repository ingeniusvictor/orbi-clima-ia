import React from 'react';
import { Smartphone, Sparkles, Layers, Terminal, ChevronRight, Eye } from 'lucide-react';

interface WidgetShowcaseCardProps {
  onNavigateToWidgets: () => void;
}

export default function WidgetShowcaseCard({ onNavigateToWidgets }: WidgetShowcaseCardProps) {
  const variants = [
    { name: 'SkyOrb Mini', size: '2x2', desc: 'Resumen orbital simple con clima y temperatura.', color: 'from-cyan-500/20 to-indigo-500/10 text-cyan-400' },
    { name: 'SkyPanel', size: '4x2', desc: 'Panel completo: clima, ráfagas, humedad y alertas.', color: 'from-purple-500/20 to-indigo-500/10 text-purple-400' },
    { name: 'Field Command', size: '4x3', desc: 'Máximo detalle con matriz de riesgo y ventana HSE.', color: 'from-amber-500/20 to-indigo-500/10 text-amber-400' },
    { name: 'Cinematic Weather Bar', size: '4x1', desc: 'Elegante barra panorámica con gradientes del cielo.', color: 'from-emerald-500/20 to-indigo-500/10 text-emerald-400' },
  ];

  return (
    <div id="widget-showcase-card" className="p-5 rounded-2xl bg-[#090d19]/90 border border-slate-800 flex flex-col justify-between gap-4 font-sans relative overflow-hidden">
      {/* Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-200">ORBI SkyOrb Widget™</h3>
            <p className="text-[10px] font-mono text-indigo-400/90 uppercase tracking-wider">Acceso Directo Inteligente</p>
          </div>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Lleva las decisiones climáticas de SkyCore a tu pantalla de inicio con widgets Android interactivos y adaptables. No necesitas abrir la aplicación para saber cuándo es óptimo actuar.
        </p>
      </div>

      {/* Grid of micro-cards */}
      <div className="grid grid-cols-2 gap-2 pt-2">
        {variants.map((v, i) => (
          <div key={i} className="p-3 rounded-xl bg-[#070b13]/80 border border-slate-900/60 flex flex-col justify-between gap-2 text-left">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-200 truncate pr-1">{v.name}</span>
              <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border border-white/5 bg-gradient-to-r ${v.color}`}>
                {v.size}
              </span>
            </div>
            <p className="text-[9.5px] text-slate-400 leading-normal line-clamp-2">
              {v.desc}
            </p>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-2 border-t border-slate-900">
        <button
          onClick={onNavigateToWidgets}
          className="flex items-center gap-1 px-4 py-2 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-all font-sans rounded-lg hover:bg-indigo-500/5"
        >
          <span>Configurar y Ver Widgets</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

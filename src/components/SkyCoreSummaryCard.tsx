import React, { useState } from 'react';
import { SkyCoreSummary, WeatherProfile } from '../types/weatherTypes';
import { ComparisonReport } from '../services/skyCoreMultiSourceService';
import { Cpu, Lightbulb, Compass, AlertCircle, Layers, ChevronDown, ChevronUp, CheckCircle, AlertTriangle, ShieldAlert } from 'lucide-react';

interface SkyCoreSummaryCardProps {
  summary: SkyCoreSummary;
  profile: WeatherProfile;
  comparisonReport?: ComparisonReport | null;
}

export default function SkyCoreSummaryCard({ summary, profile, comparisonReport }: SkyCoreSummaryCardProps) {
  const isTech = profile === 'field_tech';
  const [showComparisonDetails, setShowComparisonDetails] = useState(false);

  // Confidence styling helper
  const getConfidenceStyle = (level: string) => {
    switch (level) {
      case 'Alta':
        return {
          text: 'text-emerald-400',
          bg: 'bg-emerald-500/10 border-emerald-500/20',
          icon: <CheckCircle className="w-3 h-3 text-emerald-400" />
        };
      case 'Media':
        return {
          text: 'text-amber-400',
          bg: 'bg-amber-500/10 border-amber-500/20',
          icon: <AlertTriangle className="w-3 h-3 text-amber-400" />
        };
      case 'Baja':
        default:
        return {
          text: 'text-rose-400',
          bg: 'bg-rose-500/10 border-rose-500/20',
          icon: <ShieldAlert className="w-3 h-3 text-rose-400" />
        };
    }
  };

  const confStyle = comparisonReport 
    ? getConfidenceStyle(comparisonReport.confidence) 
    : getConfidenceStyle('Alta');

  return (
    <div
      className={`relative overflow-hidden p-5 rounded-3xl border transition-all duration-300 ${
        isTech
          ? 'bg-gradient-to-tr from-amber-950/20 via-slate-900/50 to-slate-900/40 border-amber-500/20 shadow-md shadow-amber-950/10'
          : 'bg-gradient-to-tr from-cyan-950/20 via-slate-900/50 to-slate-900/40 border-cyan-500/20 shadow-md shadow-cyan-950/10'
      }`}
      id="skycore-summary-card"
    >
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 ${isTech ? 'bg-amber-500' : 'bg-cyan-500'}`} />

      <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2.5 relative z-10">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${isTech ? 'bg-amber-500/10 text-amber-400' : 'bg-cyan-500/10 text-cyan-400'}`}>
            <Cpu className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h4 className="text-[11px] font-mono uppercase tracking-widest text-white/50">Análisis Generativo</h4>
            <span className="text-xs font-sans font-bold text-white block">ORBI SkyCore™ Engine</span>
          </div>
        </div>
        <span className="text-[9px] font-mono bg-white/5 px-2 py-0.5 rounded border border-white/10 text-white/60">V0.8.2 ACTIVE</span>
      </div>

      <div className="relative z-10 flex flex-col gap-3">
        <div>
          <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest block mb-1">Resumen General</span>
          <p className="text-sm md:text-base text-white/90 leading-relaxed font-sans font-normal">{summary.generalSummary}</p>
        </div>

        {summary.warning && (
          <div className="p-3 rounded-2xl bg-red-500/5 border border-red-500/20 flex gap-2.5 items-start mt-1">
            <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-red-300 font-medium leading-relaxed">{summary.warning}</p>
          </div>
        )}

        <div className="mt-2 p-4 rounded-2xl bg-white/5 border border-white/5 flex gap-3">
          <div className={`p-1.5 rounded-xl h-fit ${isTech ? 'bg-amber-400/15 text-amber-400' : 'bg-cyan-400/15 text-cyan-400'}`}>
            <Lightbulb className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest block">Recomendación Principal</span>
            <p className="text-xs text-white/80 leading-relaxed mt-0.5 font-sans">{summary.mainRecommendation}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 text-xs text-white/60 mt-1 pl-1">
          <Compass className={`w-3.5 h-3.5 ${isTech ? 'text-amber-400' : 'text-cyan-400'}`} />
          <span className="font-sans"><strong className="text-white">Ventana segura:</strong> {summary.bestWindow}</span>
        </div>

        <div className="mt-2 pt-3 border-t border-white/5 space-y-2">
          <div className="flex items-center gap-1.5 text-[9px] font-mono text-white/40 uppercase tracking-widest">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>SkyCore Model Agreement</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex flex-col justify-between">
              <span className="text-[9px] font-mono text-slate-400 block uppercase tracking-wider">Fuente Principal</span>
              <span className="text-xs font-sans font-bold text-white mt-1">Open-Meteo Best Match</span>
            </div>

            <div className={`p-2.5 rounded-xl border flex flex-col justify-between ${confStyle.bg}`}>
              <span className="text-[9px] font-mono text-slate-400 block uppercase tracking-wider">Acuerdo de Modelos</span>
              <div className="flex items-center gap-1.5 mt-1">
                {confStyle.icon}
                <span className={`text-xs font-sans font-bold ${confStyle.text}`}>{comparisonReport ? comparisonReport.confidence : 'Alta'}</span>
                {comparisonReport && <span className="text-[9px] font-mono text-white/30">({comparisonReport.confidenceScore}%)</span>}
              </div>
            </div>
          </div>

          {comparisonReport && (
            <div className="mt-1">
              <button
                onClick={() => setShowComparisonDetails(!showComparisonDetails)}
                className="w-full py-1.5 px-3 flex items-center justify-between text-[10px] font-mono text-indigo-300 hover:text-indigo-200 bg-indigo-500/5 hover:bg-indigo-500/10 rounded-xl border border-indigo-500/10 cursor-pointer transition-all"
              >
                <span>VER CONSENSO DE MODELOS</span>
                {showComparisonDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showComparisonDetails && (
                <div className="mt-2 p-3 bg-[#040812]/90 border border-white/5 rounded-2xl space-y-3 text-left animate-fadeIn">
                  <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                    ORBI compara modelos numéricos reales: Best Match, ECMWF IFS, NOAA GFS y DWD ICON cuando están disponibles. El acuerdo entre modelos mide consistencia, no garantiza exactitud local.
                  </p>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[520px]">
                      <thead>
                        <tr className="border-b border-white/5">
                          <th className="py-1 pr-2 text-[9px] font-mono text-slate-400 uppercase">Variable</th>
                          {comparisonReport.availableProviderIds.map((providerId) => {
                            const provider = comparisonReport.providers.find(p => p.id === providerId);
                            return <th key={providerId} className={`py-1 px-2 text-[9px] font-mono uppercase ${providerId === 'open_meteo' ? 'text-indigo-400' : 'text-slate-500'}`}>{provider?.name || providerId}</th>;
                          })}
                        </tr>
                      </thead>
                      <tbody>
                        {comparisonReport.variables.map((v) => (
                          <tr key={v.name} className="border-b border-white/5 last:border-0 hover:bg-white/2">
                            <td className="py-1.5 pr-2 text-[10px] font-sans text-slate-200 font-medium">{v.label}</td>
                            {comparisonReport.availableProviderIds.map((providerId) => {
                              const value = v.providerValues[providerId];
                              return <td key={providerId} className={`py-1.5 px-2 text-[10px] font-mono ${providerId === 'open_meteo' ? 'text-indigo-300 font-bold' : 'text-slate-400'}`}>{value === undefined ? '—' : v.name === 'condition' ? String(value) : `${value}${v.unit}`}</td>;
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {comparisonReport.failedProviderIds.length > 0 && (
                    <p className="text-[9px] font-mono text-amber-400/80">Modelos temporalmente no disponibles: {comparisonReport.failedProviderIds.join(', ')}.</p>
                  )}

                  <div className="p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/10 flex gap-2 items-start mt-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[9px] font-mono text-amber-400 uppercase tracking-wider block font-bold">Directiva HSE Terreno</span>
                      <p className="text-[9px] text-amber-300 leading-normal mt-0.5 font-sans">Este módulo compara pronósticos numéricos independientes. El acuerdo entre modelos no es una probabilidad de acierto y no constituye una alerta oficial de DMC, SENAPRED ni otra autoridad.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { SkyCoreSummary, WeatherProfile, WeatherCondition } from '../types/weatherTypes';
import { ComparisonReport } from '../services/skyCoreMultiSourceService';
import {
  Cpu,
  Lightbulb,
  Compass,
  AlertCircle,
  Database,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';

interface SkyCoreSummaryCardProps {
  summary: SkyCoreSummary;
  profile: WeatherProfile;
  comparisonReport?: ComparisonReport | null;
}

export default function SkyCoreSummaryCard({ summary, profile, comparisonReport }: SkyCoreSummaryCardProps) {
  const isTech = profile === 'field_tech';
  const [showSourceDetails, setShowSourceDetails] = useState(false);

  const getConditionEmoji = (cond: WeatherCondition | string): string => {
    switch (cond) {
      case 'sunny': return '☀️';
      case 'partly_cloudy': return '⛅';
      case 'cloudy': return '☁️';
      case 'rain': return '🌧️';
      case 'storm': return '⛈️';
      case 'wind': return '💨';
      case 'cold': return '❄️';
      case 'hot': return '🔥';
      case 'night': return '🌙';
      default: return '☁️';
    }
  };

  const getConditionNameSpanish = (cond: WeatherCondition | string): string => {
    switch (cond) {
      case 'sunny': return 'Soleado';
      case 'partly_cloudy': return 'Parcial';
      case 'cloudy': return 'Nublado';
      case 'rain': return 'Lluvia';
      case 'storm': return 'Tormenta';
      case 'wind': return 'Viento';
      case 'cold': return 'Frío';
      case 'hot': return 'Calor';
      case 'night': return 'Despejado';
      default: return String(cond);
    }
  };

  const sourceScore = comparisonReport?.confidenceScore ?? 0;
  const sourceMode = comparisonReport?.mode ?? 'single_source';

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
        <span className="text-[9px] font-mono bg-white/5 px-2 py-0.5 rounded border border-white/10 text-white/60">
          METEO INTEGRITY
        </span>
      </div>

      <div className="relative z-10 flex flex-col gap-3">
        <div>
          <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest block mb-1">Resumen General</span>
          <p className="text-sm md:text-base text-white/90 leading-relaxed font-sans font-normal">
            {summary.generalSummary}
          </p>
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
            <Database className="w-3.5 h-3.5 text-indigo-400" />
            <span>Integridad de Fuente Meteorológica</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex flex-col justify-between">
              <span className="text-[9px] font-mono text-slate-400 block uppercase tracking-wider">Fuente Real Activa</span>
              <span className="text-xs font-sans font-bold text-white mt-1">
                {comparisonReport?.primaryProvider ?? 'Open-Meteo'}
              </span>
            </div>

            <div className="p-2.5 rounded-xl border border-amber-500/20 bg-amber-500/10 flex flex-col justify-between">
              <span className="text-[9px] font-mono text-slate-400 block uppercase tracking-wider">Cobertura de Validación</span>
              <div className="flex items-center gap-1.5 mt-1">
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                <span className="text-xs font-sans font-bold text-amber-400">
                  {sourceMode === 'single_source' ? '1 fuente real' : `${comparisonReport?.sourceCount ?? 1} fuentes`}
                </span>
                {comparisonReport && (
                  <span className="text-[9px] font-mono text-white/30">({sourceScore}/80)</span>
                )}
              </div>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-indigo-500/5 border border-indigo-500/10 flex gap-2 items-start">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-300 shrink-0 mt-0.5" />
            <p className="text-[10px] leading-relaxed text-slate-300">
              ORBI ya no genera proveedores meteorológicos simulados para aparentar corroboración. Hasta integrar modelos o fuentes independientes reales, SkyCore identifica honestamente este análisis como <strong className="text-white">single-source</strong>.
            </p>
          </div>

          {comparisonReport && (
            <div className="mt-1">
              <button
                onClick={() => setShowSourceDetails(!showSourceDetails)}
                className="w-full py-1.5 px-3 flex items-center justify-between text-[10px] font-mono text-indigo-300 hover:text-indigo-200 bg-indigo-500/5 hover:bg-indigo-500/10 rounded-xl border border-indigo-500/10 cursor-pointer transition-all"
              >
                <span>VER DATOS DE LA FUENTE</span>
                {showSourceDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showSourceDetails && (
                <div className="mt-2 p-3 bg-[#040812]/90 border border-white/5 rounded-2xl space-y-3 text-left animate-fadeIn">
                  <p className="text-[10px] text-slate-400 leading-relaxed font-sans">{comparisonReport.note}</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/5">
                          <th className="py-1 text-[9px] font-mono text-slate-400 uppercase">Variable</th>
                          <th className="py-1 text-[9px] font-mono text-indigo-400 uppercase">Open-Meteo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {comparisonReport.variables.map((v) => {
                          const isCondition = v.name === 'condition';
                          return (
                            <tr key={v.name} className="border-b border-white/5 last:border-0 hover:bg-white/2">
                              <td className="py-1.5 text-[10px] font-sans text-slate-200 font-medium">{v.label}</td>
                              <td className="py-1.5 text-[10px] font-mono text-indigo-300 font-bold">
                                {isCondition
                                  ? `${getConditionEmoji(v.openMeteoValue as string)} ${getConditionNameSpanish(v.openMeteoValue as string)}`
                                  : `${v.openMeteoValue}${v.unit}`}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-[9px] text-amber-300/90 leading-relaxed">
                    Los riesgos calculados por ORBI son apoyo de decisión. No sustituyen alertas oficiales de DMC, SENAPRED u otras autoridades competentes.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

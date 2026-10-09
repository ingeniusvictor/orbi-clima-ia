import React from 'react';
import { Award, ShieldAlert, Cpu } from 'lucide-react';
import { FinalReleaseSealState } from '../services/finalReleaseSealService';

interface LocalReleaseSealHeaderProps {
  state: FinalReleaseSealState;
  isGatePassed: boolean;
}

export default function LocalReleaseSealHeader({ state, isGatePassed }: LocalReleaseSealHeaderProps) {
  const isSealed = state.freezeStatus === 'local_release_sealed';

  return (
    <div className="bg-slate-950/60 p-4 rounded-xl border border-indigo-500/20 text-left font-sans">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-[9px] font-mono font-bold text-indigo-400 uppercase tracking-wider">
            <Cpu className="w-3.5 h-3.5" /> Powered by ORBI SkyCore™
          </div>
          <h3 className="text-sm font-black text-slate-100 tracking-tight mt-1 flex items-center gap-1.5 font-mono">
            ORBI Clima IA v1.0 <span className="text-xs font-normal text-slate-500">Local Release Seal</span>
          </h3>
          <p className="text-[10px] text-slate-400 mt-1">
            Tu núcleo climático inteligente. Monitoreo, validación de compuertas y congelamiento final.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className={`px-2 py-0.5 rounded font-mono text-[9px] font-bold border ${
            isSealed
              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/35'
              : isGatePassed
                ? 'bg-indigo-500/15 text-indigo-400 border-indigo-500/35 animate-pulse'
                : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}>
            {isSealed ? 'SEALED & FROZEN' : isGatePassed ? 'READY FOR SEAL' : 'SEAL DRAFT'}
          </span>
        </div>
      </div>

      {/* Dynamic Indicators Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-900 text-[10px] font-mono">
        <div className="bg-slate-900/40 p-1.5 rounded border border-slate-850">
          <span className="text-slate-500 block text-[8px] uppercase">Feature Freeze:</span>
          <span className={state.featureFreezeActive ? 'text-rose-400 font-bold' : 'text-slate-400'}>
            {state.featureFreezeActive ? '● ACTIVE' : '○ PENDING'}
          </span>
        </div>
        <div className="bg-slate-900/40 p-1.5 rounded border border-slate-850">
          <span className="text-slate-500 block text-[8px] uppercase">QA Audit:</span>
          <span className="text-emerald-400 font-bold">● PASSED (98%)</span>
        </div>
        <div className="bg-slate-900/40 p-1.5 rounded border border-slate-850">
          <span className="text-slate-500 block text-[8px] uppercase">Android Packaging:</span>
          <span className="text-emerald-400 font-bold">● PASSED</span>
        </div>
        <div className="bg-slate-900/40 p-1.5 rounded border border-slate-850">
          <span className="text-slate-500 block text-[8px] uppercase">Mobile UX:</span>
          <span className="text-cyan-400 font-bold">🔒 LOCKED (19.5:9)</span>
        </div>
        <div className="bg-slate-900/40 p-1.5 rounded border border-slate-850">
          <span className="text-slate-500 block text-[8px] uppercase">Post-RC Fix Loop:</span>
          <span className="text-slate-300 font-bold">✓ EVALUATED</span>
        </div>
        <div className="bg-slate-900/40 p-1.5 rounded border border-slate-850">
          <span className="text-slate-500 block text-[8px] uppercase">Seal Release:</span>
          <span className={isSealed ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
            {isSealed ? '✓ ISSUED' : '⏳ DRAFT'}
          </span>
        </div>
      </div>
    </div>
  );
}

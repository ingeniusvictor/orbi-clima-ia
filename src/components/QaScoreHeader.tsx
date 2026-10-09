import React from 'react';
import { QaReleaseState, resetQaState } from '../services/qaStateService';
import { getQaScoreStats } from '../utils/qaScoreEngine';
import { ShieldCheck, Bug, CheckCircle2, XCircle, AlertTriangle, AlertOctagon, RefreshCw, Activity } from 'lucide-react';

interface QaScoreHeaderProps {
  state: QaReleaseState;
  onReset: () => void;
}

export default function QaScoreHeader({ state, onReset }: QaScoreHeaderProps) {
  const stats = getQaScoreStats(state);

  return (
    <div className="p-6 rounded-2xl bg-[#090e1a]/80 border border-slate-800 flex flex-col gap-6">
      {/* Upper line: Identity and Status */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/15 px-2.5 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider">
              {state.versionName}
            </span>
            <span className="text-[10px] bg-slate-800 text-slate-400 border border-slate-700 px-2.5 py-0.5 rounded-full font-mono">
              LOCAL TESTING
            </span>
          </div>
          <h2 className="text-xl font-bold font-sans text-slate-100 tracking-tight">
            {state.candidateLabel}
          </h2>
          <p className="text-xs text-slate-400 font-sans">
            Última actualización local: <span className="text-slate-300 font-mono">{new Date(state.lastUpdated).toLocaleTimeString('es-CL')} {new Date(state.lastUpdated).toLocaleDateString('es-CL')}</span>
          </p>
        </div>

        {/* Global Circle Score */}
        <div className="flex items-center gap-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-900">
          <div className="text-right">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">QA READINESS</span>
            <span className={`px-2.5 py-0.5 mt-1 rounded text-[10px] font-mono font-bold block border ${stats.statusColor}`}>
              {stats.statusLabel}
            </span>
          </div>
          <div className="text-4xl font-black font-sans text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 tracking-tighter">
            {stats.score}%
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[11px] font-mono text-slate-400">
          <span>COBERTURA DE PRUEBAS DE RELEASE</span>
          <span>{stats.passedCount} / {stats.totalTests} APROBADAS</span>
        </div>
        <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-900">
          <div
            className="bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500 h-full transition-all duration-500"
            style={{ width: `${(stats.passedCount / stats.totalTests) * 100}%` }}
          />
        </div>
      </div>

      {/* Stats Matrix Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3.5 pt-2">
        <div className="p-3 bg-slate-950/40 border border-slate-900 rounded-xl flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-500 block">PASSED</span>
            <span className="text-sm font-sans font-bold text-emerald-400">{stats.passedCount}</span>
          </div>
        </div>

        <div className="p-3 bg-slate-950/40 border border-slate-900 rounded-xl flex items-center gap-3">
          <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg">
            <XCircle className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-500 block">FAILED</span>
            <span className="text-sm font-sans font-bold text-rose-400">{stats.failedCount}</span>
          </div>
        </div>

        <div className="p-3 bg-slate-950/40 border border-slate-900 rounded-xl flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-500 block">BLOCKED</span>
            <span className="text-sm font-sans font-bold text-amber-400">{stats.blockedCount}</span>
          </div>
        </div>

        <div className="p-3 bg-slate-950/40 border border-slate-900 rounded-xl flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-500 block">REVIEW</span>
            <span className="text-sm font-sans font-bold text-indigo-400">{stats.needsReviewCount}</span>
          </div>
        </div>

        <div className="p-3 bg-slate-950/40 border border-slate-900 rounded-xl flex items-center gap-3">
          <div className="p-2 bg-orange-500/10 text-orange-400 rounded-lg">
            <Bug className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-500 block">OPEN BUGS</span>
            <span className="text-sm font-sans font-bold text-orange-400">{stats.openBugsCount}</span>
          </div>
        </div>

        <div className="p-3 bg-slate-950/40 border border-slate-900 rounded-xl flex items-center gap-3">
          <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg animate-pulse">
            <AlertOctagon className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-500 block">CRITICAL BUGS</span>
            <span className={`text-sm font-sans font-bold ${stats.criticalBugsCount > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
              {stats.criticalBugsCount}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom info and actions */}
      <div className="flex flex-wrap justify-between items-center text-[11px] text-slate-400 border-t border-slate-800/60 pt-4 gap-4">
        <span className="flex items-center gap-1.5 text-amber-400/90">
          <AlertOctagon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Regla de Producción: Los bugs críticos abiertos o pruebas fallidas bloquean la certificación de Candidate Ready.</span>
        </span>
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-lg font-mono font-bold transition-all cursor-pointer active:scale-95"
        >
          <RefreshCw className="w-3.5 h-3.5" /> REINICIAR QA LOCAL
        </button>
      </div>
    </div>
  );
}

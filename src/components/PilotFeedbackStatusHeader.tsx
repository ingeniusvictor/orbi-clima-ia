import React from 'react';
import { Sparkles, MessageSquare, AlertOctagon, Wrench, CheckCircle, Lock } from 'lucide-react';
import { PilotFeedbackState } from '../services/pilotFeedbackService';

interface PilotFeedbackStatusHeaderProps {
  state: PilotFeedbackState;
}

export default function PilotFeedbackStatusHeader({ state }: PilotFeedbackStatusHeaderProps) {
  const totalFeedback = state.feedback.length;
  const criticalCount = state.feedback.filter(fb => fb.severity === 'critical').length;
  
  const totalFixes = state.fixes.length;
  const closedFixes = state.fixes.filter(fix => ['validated', 'closed'].includes(fix.status)).length;
  const openFixes = totalFixes - closedFixes;

  // Re-test calculation
  const needsReTestCount = state.fixes.filter(fix => fix.status === 'ready_for_test').length;
  const isReTestReady = needsReTestCount > 0;

  const isPostRcClosed = state.postRcStatus === 'closed';

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-left font-sans">
      {/* Brand Column */}
      <div className="md:col-span-1 border-r border-slate-800/80 pr-3 flex flex-col justify-center">
        <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-pink-400 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" /> Módulo 11
        </div>
        <h3 className="text-sm font-bold text-slate-100 tracking-tight mt-1">ORBI Clima IA RC1</h3>
        <p className="text-[10px] text-pink-400 font-medium tracking-tight">Pilot Feedback Loop</p>
        <span className="text-[9px] text-slate-500 font-mono mt-1">Powered by ORBI SkyCore™</span>
      </div>

      {/* Stats indicators */}
      {/* 1. Feedback */}
      <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-800/50 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] font-mono uppercase">Feedback</span>
          <MessageSquare className="w-4 h-4 text-pink-400" />
        </div>
        <div className="mt-2">
          <div className="text-xl font-mono font-bold text-slate-100">{totalFeedback}</div>
          <span className="text-[9px] text-slate-500 font-mono">Recibidos en total</span>
        </div>
      </div>

      {/* 2. Críticos */}
      <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-800/50 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] font-mono uppercase">Críticos</span>
          <AlertOctagon className="w-4 h-4 text-rose-500" />
        </div>
        <div className="mt-2">
          <div className="text-xl font-mono font-bold text-rose-400">{criticalCount}</div>
          <span className="text-[9px] text-slate-500 font-mono">Reportados de alto riesgo</span>
        </div>
      </div>

      {/* 3. Fixes */}
      <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-800/50 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] font-mono uppercase">Fixes Abiertos/Cerrados</span>
          <Wrench className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="mt-2">
          <div className="text-base font-mono font-bold text-slate-100">
            <span className="text-amber-400">{openFixes}</span>
            <span className="text-slate-500 mx-1">/</span>
            <span className="text-emerald-400">{closedFixes}</span>
          </div>
          <span className="text-[9px] text-slate-500 font-mono">Pendientes vs Solucionados</span>
        </div>
      </div>

      {/* 4. Re-test & Post-RC Status */}
      <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-800/50 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] font-mono uppercase">Estado Post-RC</span>
          {isPostRcClosed ? (
            <Lock className="w-4 h-4 text-emerald-400" />
          ) : (
            <CheckCircle className="w-4 h-4 text-slate-400" />
          )}
        </div>
        <div className="mt-2">
          <div className={`text-xs font-bold font-mono uppercase ${isPostRcClosed ? 'text-emerald-400' : 'text-amber-400'}`}>
            {isPostRcClosed ? 'Post-RC Cerrado' : 'Abierto (Abierto)'}
          </div>
          <div className="text-[9px] text-slate-500 font-mono mt-0.5">
            {isReTestReady ? `⚠️ ${needsReTestCount} por Re-Test` : 'Re-test al día'}
          </div>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { Cpu, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface InternalTestingStatusHeaderProps {
  qaScore: number;
  packagingScore: number;
  storeScore: number;
  status: string;
}

export default function InternalTestingStatusHeader({
  qaScore,
  packagingScore,
  storeScore,
  status
}: InternalTestingStatusHeaderProps) {
  const isQaPassed = qaScore >= 95;
  const isPackagingPassed = packagingScore >= 95;
  const isStorePassed = storeScore >= 90;

  return (
    <div className="p-4 rounded-2xl bg-[#090d19] border border-slate-800 flex flex-col gap-3 font-sans relative overflow-hidden">
      {/* Decorative Blur */}
      <div className="absolute -top-12 -left-12 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl pointer-events-none" />

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white shadow-md shadow-cyan-950/40">
            <Cpu className="w-5 h-5" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-sans font-black text-slate-100 uppercase tracking-wider">ORBI Clima IA RC1</h3>
              <span className="text-[8px] font-mono font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-1 py-0.5 rounded">
                INTERNAL TESTING PACK
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono leading-none mt-1">
              Powered by <span className="text-cyan-400 font-bold">ORBI SkyCore™</span> · Tu núcleo climático inteligente.
            </p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <span className={`text-[9px] font-mono font-bold px-2 py-1 rounded-full border ${
            status === 'final_closed'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
          }`}>
            {status === 'final_closed' ? 'RC CERRADO' : 'BORRADOR'}
          </span>
        </div>
      </div>

      {/* Grid of Indicators */}
      <div className="grid grid-cols-2 xs:grid-cols-5 gap-2 pt-2 border-t border-slate-800/60 text-center font-mono text-[9px]">
        {/* QA */}
        <div className={`p-2 rounded-xl border ${
          isQaPassed ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400' : 'bg-amber-500/5 border-amber-500/10 text-amber-400'
        }`}>
          <span className="text-[8px] text-slate-500 block">QA SYSTEM</span>
          <div className="flex items-center justify-center gap-1 font-bold mt-0.5">
            {isQaPassed ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
            <span>{isQaPassed ? 'PASSED' : 'REVIEW'} ({qaScore}%)</span>
          </div>
        </div>

        {/* Packaging */}
        <div className={`p-2 rounded-xl border ${
          isPackagingPassed ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400' : 'bg-amber-500/5 border-amber-500/10 text-amber-400'
        }`}>
          <span className="text-[8px] text-slate-500 block">PACKAGING</span>
          <div className="flex items-center justify-center gap-1 font-bold mt-0.5">
            {isPackagingPassed ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
            <span>{isPackagingPassed ? 'PASSED' : 'REVIEW'} ({packagingScore}%)</span>
          </div>
        </div>

        {/* Store */}
        <div className={`p-2 rounded-xl border ${
          isStorePassed ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400' : 'bg-amber-500/5 border-amber-500/10 text-amber-400'
        }`}>
          <span className="text-[8px] text-slate-500 block">STORE DATA</span>
          <div className="flex items-center justify-center gap-1 font-bold mt-0.5">
            {isStorePassed ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
            <span>{isStorePassed ? 'PASSED' : 'REVIEW'} ({storeScore}%)</span>
          </div>
        </div>

        {/* Mobile UX */}
        <div className="p-2 rounded-xl border bg-cyan-500/5 border-cyan-500/10 text-cyan-400">
          <span className="text-[8px] text-slate-500 block">MOBILE UX</span>
          <div className="flex items-center justify-center gap-1 font-bold mt-0.5">
            <ShieldCheck className="w-3 h-3" />
            <span>LOCKED</span>
          </div>
        </div>

        {/* RC Closure */}
        <div className={`p-2 rounded-xl border col-span-2 xs:col-span-1 ${
          status === 'final_closed' ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400' : 'bg-amber-500/5 border-amber-500/10 text-amber-400'
        }`}>
          <span className="text-[8px] text-slate-500 block">RC CLOSURE</span>
          <div className="flex items-center justify-center gap-1 font-bold mt-0.5">
            {status === 'final_closed' ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
            <span>{status === 'final_closed' ? 'CLOSED' : 'DRAFT'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { ShieldCheck, ShieldAlert, Lock } from 'lucide-react';
import { VERSION_LOCK_POLICY } from '../utils/versionLockPolicy';

export default function VersionLockCard() {
  return (
    <div className="space-y-3 font-sans text-left">
      <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800 space-y-2">
        <h5 className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-900 pb-1.5">
          <Lock className="w-3.5 h-3.5 text-indigo-400" /> Registro de Bloqueo de Versión
        </h5>

        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
          <div className="p-1.5 bg-slate-900 rounded border border-slate-850">
            <span className="text-slate-500 block text-[8px]">versionName</span>
            <span className="text-slate-300 font-bold">{VERSION_LOCK_POLICY.versionName}</span>
          </div>
          <div className="p-1.5 bg-slate-900 rounded border border-slate-850">
            <span className="text-slate-500 block text-[8px]">versionCode</span>
            <span className="text-slate-300 font-bold">{VERSION_LOCK_POLICY.versionCode}</span>
          </div>
          <div className="p-1.5 bg-slate-900 rounded border border-slate-850 col-span-2">
            <span className="text-slate-500 block text-[8px]">releaseLabel</span>
            <span className="text-slate-300 font-bold">{VERSION_LOCK_POLICY.releaseLabel}</span>
          </div>
          <div className="p-1.5 bg-slate-900 rounded border border-slate-850 col-span-2">
            <span className="text-slate-500 block text-[8px]">releaseChannel</span>
            <span className="text-slate-300 font-bold">{VERSION_LOCK_POLICY.releaseChannel}</span>
          </div>
        </div>
      </div>

      {/* Policy guidelines banner */}
      <div className="p-3 bg-rose-500/5 rounded-lg border border-rose-500/20 text-[10px]">
        <p className="font-bold text-rose-400 flex items-center gap-1 mb-1 font-mono uppercase text-[9px]">
          <ShieldAlert className="w-3.5 h-3.5" /> Política de Estabilización de Versión 1.0
        </p>
        <p className="text-slate-400">
          {VERSION_LOCK_POLICY.policyNotes}
        </p>
      </div>

      {/* Branch rules display */}
      <div className="space-y-2 pt-1">
        <h6 className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">Hoja de Ruta de Ramificación</h6>
        {VERSION_LOCK_POLICY.branches.map((b, idx) => (
          <div key={idx} className="p-2.5 bg-slate-950/20 rounded-lg border border-slate-850 text-[10px]">
            <p className="font-bold text-slate-300 font-mono text-[9px]">{b.name}</p>
            <p className="text-slate-500 text-[9px] mb-1.5">{b.description}</p>
            <div className="flex flex-wrap gap-1">
              {b.allowedChanges.map((item, iIdx) => (
                <span key={iIdx} className="bg-slate-900/60 border border-slate-800 text-slate-400 text-[8px] font-mono px-1.5 py-0.2 rounded">
                  ✓ {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

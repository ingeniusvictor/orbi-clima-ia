import React from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle, HelpCircle, Key } from 'lucide-react';
import { getPermissionsInventory, PermissionItem } from '../utils/permissionsInventoryBuilder';

export default function PermissionsInventoryCard() {
  const permissions = getPermissionsInventory();

  return (
    <div className="p-6 rounded-2xl bg-[#090e1a]/80 border border-slate-800 flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-teal-500/10 text-teal-400 rounded-xl">
          <Key className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-sans font-bold text-slate-100 uppercase tracking-wider">Permissions Inventory</h3>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">DECLARACIONES DE PERMISOS DE MANIFEST DE ANDROID</p>
        </div>
      </div>

      <div className="space-y-3.5">
        {permissions.map((p, idx) => (
          <div key={idx} className="p-4 rounded-xl bg-[#060a12]/70 border border-slate-800/80 hover:border-slate-700 transition-all">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/60 pb-2">
              <code className="text-[11px] font-mono font-bold text-emerald-400">{p.name}</code>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                  p.status === 'Declarado' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400 border border-slate-700/50'
                }`}>
                  {p.status}
                </span>
                {p.playConsoleReview && (
                  <span className="px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded text-[9px] font-mono font-bold flex items-center gap-1">
                    <AlertTriangle className="w-2.5 h-2.5" /> Needs Play Console review
                  </span>
                )}
              </div>
            </div>

            <div className="mt-3 space-y-2 text-xs">
              <p className="text-slate-300 font-sans leading-relaxed">
                <span className="font-semibold text-slate-400 mr-1">Propósito:</span>
                {p.purpose}
              </p>
              <p className="text-[11px] text-slate-400 italic">
                <span className="font-semibold text-slate-500 mr-1">Impacto:</span>
                {p.impact}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 rounded-xl bg-teal-500/5 border border-teal-500/10 flex gap-2 items-start">
        <HelpCircle className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
        <span className="text-[10px] text-slate-400 font-sans leading-relaxed">
          Los permisos declarados como "No declarado" son opcionales y solo se activan si decides empaquetar funciones avanzadas de reinicio o alarmas exactas que demanden políticas adicionales en Google Play Console.
        </span>
      </div>
    </div>
  );
}

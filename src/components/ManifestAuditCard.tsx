import React from 'react';
import { getManifestPermissions, getManifestAuditItems } from '../utils/manifestPermissionAudit';
import { FileCode, Shield, CheckCircle2, AlertTriangle, Cpu } from 'lucide-react';

export default function ManifestAuditCard() {
  const permissions = getManifestPermissions();
  const audits = getManifestAuditItems();

  return (
    <div className="p-6 rounded-2xl bg-[#0a1122]/40 border border-white/5 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <FileCode className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-sans font-bold text-slate-100 uppercase tracking-wider">Manifest Audit</h3>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">ESTADO Y SEGURIDAD DEL ANDROIDMANIFEST.XML</p>
          </div>
        </div>
        <span className="px-2.5 py-1 text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 rounded-full uppercase tracking-wider">
          Auditoría de Manifiesto OK
        </span>
      </div>

      <div className="p-3.5 rounded-xl bg-indigo-500/5 border border-indigo-500/10 flex gap-2.5 items-start">
        <Cpu className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <p className="text-[10px] text-indigo-300/90 font-sans leading-relaxed">
          <span className="font-bold text-indigo-400">Auditoría Android 12+:</span> Toda Activity, Service o Receiver con <span className="font-mono">intent-filter</span> declara explícitamente <span className="font-mono">android:exported</span> en este RC para evitar bloqueos de instalación.
        </p>
      </div>

      {/* Permissions Audit sub-section */}
      <div className="space-y-2.5">
        <span className="text-[10px] font-bold text-slate-400 uppercase font-sans tracking-wide block">PERMISOS AUDITADOS EN EL RC</span>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
          {permissions.map((p, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-[#060a12]/50 border border-white/5 space-y-1 hover:border-emerald-500/20 transition-all">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-mono font-bold text-emerald-400 truncate max-w-[80%]" title={p.name}>
                  {p.name.replace('android.permission.', '')}
                </span>
                <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                  {p.required ? 'Crítico' : 'Opcional'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-sans leading-relaxed">{p.purpose}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Key Components Audit matrix */}
      <div className="space-y-2.5">
        <span className="text-[10px] font-bold text-slate-400 uppercase font-sans tracking-wide block">COMPONENTES Y POLÍTICAS DE RED</span>
        
        <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
          {audits.map((a, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-[#060a12]/30 border border-white/5 space-y-1.5">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-mono uppercase bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                    {a.category}
                  </span>
                  <span className="text-xs font-sans font-bold text-slate-200">{a.title}</span>
                </div>
                <div className="flex items-center gap-1 text-emerald-400 font-mono text-[10px] font-bold shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 fill-emerald-500/10" /> Verificado
                </div>
              </div>
              <p className="text-[10px] text-slate-400 font-sans leading-relaxed">{a.description}</p>
              {a.details && (
                <div className="text-[9px] text-slate-500 font-sans pl-2 border-l border-emerald-500/30">
                  {a.details}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

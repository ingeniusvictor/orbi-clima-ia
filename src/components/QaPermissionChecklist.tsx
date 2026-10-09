import React, { useState, useEffect } from 'react';
import { ShieldAlert, Check, X, Info } from 'lucide-react';

interface PermissionItem {
  name: string;
  purpose: string;
  declared: boolean;
  used: boolean;
  justified: boolean;
  needsReview: boolean;
}

export default function QaPermissionChecklist() {
  const [permissions, setPermissions] = useState<PermissionItem[]>(() => {
    const saved = localStorage.getItem('orbi_clima_qa_permission_cl_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        name: 'android.permission.INTERNET',
        purpose: 'Permitir descargas del clima en vivo desde Open-Meteo.',
        declared: true,
        used: true,
        justified: true,
        needsReview: false
      },
      {
        name: 'android.permission.ACCESS_FINE_LOCATION',
        purpose: 'Geolocalización GPS precisa para el clima local automático.',
        declared: true,
        used: true,
        justified: true,
        needsReview: false
      },
      {
        name: 'android.permission.ACCESS_COARSE_LOCATION',
        purpose: 'Geolocalización aproximada (redes/celdas) de bajo consumo.',
        declared: true,
        used: true,
        justified: true,
        needsReview: false
      },
      {
        name: 'android.permission.POST_NOTIFICATIONS',
        purpose: 'Emitir alertas inteligentes y resúmenes de turno (Android 13+).',
        declared: true,
        used: true,
        justified: true,
        needsReview: false
      },
      {
        name: 'android.permission.RECEIVE_BOOT_COMPLETED',
        purpose: 'Restablecer alarmas de resúmenes climáticos tras encender celular.',
        declared: true,
        used: true,
        justified: true,
        needsReview: false
      },
      {
        name: 'android.permission.SCHEDULE_EXACT_ALARM',
        purpose: 'Uso denegado. Se utiliza temporizador inexacto para evitar rechazos en Play Store.',
        declared: false,
        used: false,
        justified: true,
        needsReview: false
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('orbi_clima_qa_permission_cl_v1', JSON.stringify(permissions));
  }, [permissions]);

  const toggleStatus = (index: number, key: 'declared' | 'used' | 'justified' | 'needsReview') => {
    setPermissions(prev => prev.map((item, idx) => {
      if (idx === index) {
        return { ...item, [key]: !item[key] };
      }
      return item;
    }));
  };

  return (
    <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col gap-4">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-200 block uppercase tracking-wider font-sans">Auditoría de Permisos</span>
            <span className="text-[9px] text-slate-500 font-mono">MANIFEST PERMISSIONS JUSTIFICATION</span>
          </div>
        </div>
        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/15">
          {permissions.filter(p => p.justified && !p.needsReview).length} / {permissions.length} JUSTIFICADOS
        </span>
      </div>

      <div className="space-y-3 max-h-[290px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
        {permissions.map((perm, idx) => (
          <div key={perm.name} className="p-3 rounded-xl bg-slate-950/40 border border-slate-900 flex flex-col gap-2.5">
            <div className="flex flex-col gap-1">
              <code className="text-[10px] font-mono text-cyan-400 font-bold break-all">{perm.name}</code>
              <p className="text-[10.5px] text-slate-400 font-sans leading-relaxed">{perm.purpose}</p>
            </div>

            {/* Matrix control bar */}
            <div className="grid grid-cols-4 gap-1 border-t border-slate-900 pt-2 text-center text-[9px] font-mono">
              <button
                onClick={() => toggleStatus(idx, 'declared')}
                className={`py-1 rounded font-bold cursor-pointer transition-all border ${
                  perm.declared
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    : 'bg-slate-900 border-transparent text-slate-600 hover:text-slate-400'
                }`}
              >
                DECLARED
              </button>

              <button
                onClick={() => toggleStatus(idx, 'used')}
                className={`py-1 rounded font-bold cursor-pointer transition-all border ${
                  perm.used
                    ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                    : 'bg-slate-900 border-transparent text-slate-600 hover:text-slate-400'
                }`}
              >
                USED
              </button>

              <button
                onClick={() => toggleStatus(idx, 'justified')}
                className={`py-1 rounded font-bold cursor-pointer transition-all border ${
                  perm.justified
                    ? 'bg-teal-500/10 border-teal-500/20 text-teal-400'
                    : 'bg-slate-900 border-transparent text-slate-600 hover:text-slate-400'
                }`}
              >
                JUSTIFIED
              </button>

              <button
                onClick={() => toggleStatus(idx, 'needsReview')}
                className={`py-1 rounded font-bold cursor-pointer transition-all border ${
                  perm.needsReview
                    ? 'bg-rose-500/10 border-rose-500/20 text-rose-400 animate-pulse'
                    : 'bg-slate-900 border-transparent text-slate-600 hover:text-slate-400'
                }`}
              >
                REVIEW
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="p-2.5 rounded bg-amber-500/[0.02] border border-amber-500/10 text-[9px] text-amber-400/85 font-sans leading-relaxed flex gap-1.5">
        <Info className="w-3.5 h-3.5 shrink-0" />
        <span>Importante: Google Play requiere una justificación estricta si se declara SCHEDULE_EXACT_ALARM. Para ORBI Clima IA, lo evitamos usando alarmas inexactas programadas por el sistema operativo.</span>
      </div>
    </div>
  );
}

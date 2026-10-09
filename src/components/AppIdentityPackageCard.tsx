import React, { useState } from 'react';
import { ShieldCheck, Info, Copy, Check } from 'lucide-react';

export default function AppIdentityPackageCard() {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const identityFields = [
    { label: 'Nombre de la aplicación', value: 'ORBI Clima IA', key: 'name' },
    { label: 'Línea de marca', value: 'Powered by ORBI SkyCore™', key: 'line' },
    { label: 'Slogan / Tagline', value: 'Tu núcleo climático inteligente.', key: 'tagline' },
    { label: 'Categoría sugerida', value: 'Weather / Clima', key: 'category' },
    { label: 'Audiencia de destino', value: 'Usuarios generales y técnicos de terreno que necesitan interpretar condiciones climáticas de forma simple, preventiva y proactiva.', key: 'audience' },
    { label: 'Propósito esencial', value: 'ORBI Clima IA transforma datos climáticos en recomendaciones simples para la vida diaria y el trabajo en terreno, manteniendo la privacidad local y otorgando control total al usuario.', key: 'purpose' }
  ];

  return (
    <div className="p-6 rounded-2xl bg-[#090e1a]/80 border border-slate-800 flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-sans font-bold text-slate-100 uppercase tracking-wider">App Identity Package</h3>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">ESTRATEGIA DE MARCA & FICHA PLAY STORE</p>
        </div>
      </div>

      <div className="space-y-4">
        {identityFields.map((field) => (
          <div key={field.key} className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/60 flex flex-col gap-1.5 hover:border-indigo-500/20 transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-sans font-bold text-indigo-400 uppercase tracking-wide">{field.label}</span>
              <button
                onClick={() => copyToClipboard(field.value, field.key)}
                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-indigo-400 transition-all duration-200 cursor-pointer"
                title="Copiar texto"
              >
                {copiedField === field.key ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-xs text-slate-200 font-sans leading-relaxed selection:bg-indigo-500/20">{field.value}</p>
          </div>
        ))}
      </div>

      <div className="p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/10 flex gap-2 items-start">
        <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <span className="text-[10px] text-slate-400 font-sans leading-relaxed">
          Este paquete establece la identidad pública consolidada. Debe registrarse de manera idéntica tanto en la Play Store como en el sitio web de soporte y la documentación del bundle de Android.
        </span>
      </div>
    </div>
  );
}

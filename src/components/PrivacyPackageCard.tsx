import React, { useState } from 'react';
import { Eye, Copy, Check, ShieldCheck, AlertCircle } from 'lucide-react';
import { getPrivacyDisclosureText } from '../utils/privacyDisclosureBuilder';

export default function PrivacyPackageCard() {
  const [copied, setCopied] = useState(false);
  const privacyText = getPrivacyDisclosureText();

  const handleCopy = () => {
    navigator.clipboard.writeText(privacyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 rounded-2xl bg-[#090e1a]/80 border border-slate-800 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-sans font-bold text-slate-100 uppercase tracking-wider">Privacy Policy Draft</h3>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">BORRADOR DE POLÍTICA DE PRIVACIDAD LOCAL</p>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/20 hover:border-emerald-500/30 text-emerald-400 text-xs rounded-xl font-bold transition-all cursor-pointer font-sans active:scale-95"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" /> Copiado
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" /> Copiar Borrador
            </>
          )}
        </button>
      </div>

      <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/15 flex gap-2.5 items-start">
        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <p className="text-[10px] text-amber-400/90 font-sans leading-relaxed">
          <span className="font-bold">Aviso Operativo:</span> Este texto es un borrador operativo diseñado según las prácticas técnicas actuales de ORBI y debe ser revisado antes de su publicación oficial en Google Play Console para validar el cumplimiento de normativas locales específicas.
        </p>
      </div>

      <div className="p-4 rounded-xl bg-[#060a12]/90 border border-slate-800/80">
        <div className="max-h-72 overflow-y-auto text-xs text-slate-300 font-sans leading-relaxed space-y-3.5 pr-2.5 scrollbar-thin scrollbar-thumb-slate-800">
          <h4 className="font-bold text-sm text-slate-100 border-b border-slate-800 pb-2">Política de Privacidad — Borrador Operativo</h4>
          {privacyText.split('\n\n').map((para, i) => {
            if (para.startsWith('Datos usados:') || para.startsWith('Uso de datos:') || para.startsWith('Almacenamiento:') || para.startsWith('Compartición:') || para.startsWith('Ubicación:') || para.startsWith('Notificaciones:') || para.startsWith('Limitaciones:')) {
              const [title, ...rest] = para.split('\n');
              return (
                <div key={i} className="space-y-1 mt-3">
                  <span className="font-bold text-slate-200 block text-[11px] uppercase tracking-wider text-emerald-400/90">{title}</span>
                  <div className="text-slate-300 pl-1 space-y-1">
                    {rest.map((line, lidx) => (
                      <p key={lidx}>{line}</p>
                    ))}
                  </div>
                </div>
              );
            }
            return <p key={i}>{para}</p>;
          })}
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Sparkles, FileText, Copy, Check, ShieldAlert, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function StoreListingDraftCard() {
  const [copiedState, setCopiedState] = useState<string | null>(null);

  const shortDesc = 'Pronóstico inteligente, alertas locales y widgets Android para tu día y terreno.';
  const longDesc = `ORBI Clima IA es una aplicación climática inteligente diseñada para transformar el pronóstico en decisiones simples.

Con ORBI SkyCore™, la app interpreta condiciones como temperatura, lluvia, viento, humedad, radiación UV y tormentas para entregar recomendaciones claras según tu perfil.

Perfil Persona:
Recibe orientación diaria sobre chaqueta, lluvia, UV, frío, calor y mejor hora para salir.

Perfil Técnico Terreno:
Obtén apoyo preventivo para trabajo exterior mediante análisis de humedad, viento, lluvia, UV, tormentas y ventanas operativas.

Funciones principales:
- Pronóstico climático en vivo mediante Open-Meteo.
- Perfil Persona y Perfil Técnico Terreno.
- ORBI SkyCore™ Risk Engine.
- Alertas inteligentes internas.
- Notificaciones locales Android.
- Horarios silenciosos.
- Resúmenes climáticos.
- Widgets Android ORBI SkyOrb™.
- Preferencias locales.
- Memoria climática local controlable.
- Sin cuenta, sin login y sin backend propio.

Privacidad:
ORBI Clima IA guarda preferencias y memoria de uso localmente en tu dispositivo. Puedes exportar o borrar estos datos cuando quieras.

Importante:
Las recomendaciones técnicas son apoyo preventivo. No reemplazan protocolos HSE, evaluación en terreno, instrucciones del empleador ni información meteorológica oficial.`;

  const copyText = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedState(type);
    setTimeout(() => setCopiedState(null), 2000);
  };

  const allowedClaims = [
    'Pronóstico mediante Open-Meteo.',
    'Alertas locales basadas en datos climáticos disponibles.',
    'Widgets Android nativos.',
    'Preferencias locales.',
    'Memoria local controlable.',
    'Apoyo preventivo para terreno.'
  ];

  const blockedClaims = [
    'Alertas oficiales de emergencia.',
    'Garantía de seguridad climática.',
    'Predicción propia certificada.',
    'Reemplazo de servicios meteorológicos oficiales.',
    'Reemplazo de protocolos HSE.',
    'Monitoreo 24/7 garantizado.',
    'Precisión absoluta de pronóstico.'
  ];

  return (
    <div className="p-6 rounded-2xl bg-[#090e1a]/80 border border-slate-800 flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl">
          <FileText className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-sans font-bold text-slate-100 uppercase tracking-wider">Store Listing Draft & Claims</h3>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">TEXTOS FORMULARES GOOGLE PLAY CONSOLE</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Short Description */}
        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 flex flex-col gap-2 relative group hover:border-slate-700 transition-all">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-sans font-bold text-cyan-400 uppercase tracking-wide">Descripción Corta (Max 80 car.)</span>
            <button
              onClick={() => copyText(shortDesc, 'short')}
              className="text-slate-400 hover:text-cyan-400 transition-all cursor-pointer"
            >
              {copiedState === 'short' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <p className="text-xs text-slate-200 font-sans italic">"{shortDesc}"</p>
        </div>

        {/* Long Description */}
        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 flex flex-col gap-2 relative group hover:border-slate-700 transition-all">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-sans font-bold text-cyan-400 uppercase tracking-wide">Descripción Larga Draft (Max 4000 car.)</span>
            <button
              onClick={() => copyText(longDesc, 'long')}
              className="text-slate-400 hover:text-cyan-400 transition-all cursor-pointer flex items-center gap-1 text-[11px] font-mono bg-cyan-500/5 hover:bg-cyan-500/10 border border-cyan-500/20 px-2 py-1 rounded-lg"
            >
              {copiedState === 'long' ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400 text-[10px]">Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span className="text-[10px]">Copiar Todo</span>
                </>
              )}
            </button>
          </div>
          <div className="max-h-60 overflow-y-auto text-xs text-slate-300 font-sans leading-relaxed space-y-2 pr-2 scrollbar-thin scrollbar-thumb-slate-800">
            {longDesc.split('\n\n').map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </div>

        {/* Claims Guard Panel */}
        <div className="border border-slate-800/80 rounded-xl overflow-hidden">
          <div className="bg-slate-900/80 px-4 py-2.5 border-b border-slate-800 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            <span className="text-[11px] font-sans font-bold text-slate-300 uppercase tracking-wider">Claims Guard (Control de Declaraciones)</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800/80 bg-slate-950/30">
            {/* Allowed */}
            <div className="p-4 space-y-2.5">
              <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Declaraciones Permitidas
              </span>
              <ul className="space-y-1.5 text-[11px] text-slate-400 font-sans list-inside">
                {allowedClaims.map((claim, idx) => (
                  <li key={idx} className="flex gap-1.5 items-start">
                    <span className="text-emerald-400/70 shrink-0">•</span>
                    <span>{claim}</span>
                  </li>
                ))}
              </ul>
            </div>
            {/* Blocked */}
            <div className="p-4 space-y-2.5">
              <span className="text-[10px] font-mono text-rose-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Declaraciones Prohibidas
              </span>
              <ul className="space-y-1.5 text-[11px] text-slate-400 font-sans list-inside">
                {blockedClaims.map((claim, idx) => (
                  <li key={idx} className="flex gap-1.5 items-start">
                    <span className="text-rose-400/70 shrink-0">×</span>
                    <span>{claim}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { HelpCircle, Star } from 'lucide-react';
import { ORBI_APP_VERSION } from '../config/orbiAppVersion';

export default function OrbiSignatureClimate() {
  return (
    <footer
      className="w-full flex flex-col items-center justify-center text-center py-3 px-4 mt-2.5 border-t border-white/5 relative overflow-hidden"
      id="orbi-signature-footer"
    >
      {/* Background radial soft aura */}
      <div className="absolute bottom-0 w-64 h-24 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Symbol ORBI logo representation */}
      <div className="relative mb-2.5 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center bg-white/5 relative">
          <div className="w-5 h-5 rounded-full border border-cyan-400/30 flex items-center justify-center animate-spin-slow">
            <div className="w-2 h-2 rounded-full bg-cyan-400" />
          </div>
        </div>
        <Star className="w-3 text-amber-400 absolute -top-0.5 -right-0.5 animate-pulse" />
      </div>

      {/* Signature Text Pairings */}
      <div className="flex flex-col gap-1 max-w-lg relative z-10">
        <h4 className="text-xs font-sans font-extrabold text-white tracking-widest uppercase">
          ORBI SIGNATURE™
        </h4>
        
        <p className="text-[10px] font-mono uppercase tracking-widest text-cyan-400">
          DISEÑADO EN CHILE, PENSADO PARA EL MUNDO.
        </p>

        <p className="text-[11px] text-white/60 font-sans font-medium mt-0.5">
          Creado por <span className="text-white font-bold">Victor Marcel León Pacheco</span>.
        </p>

        <p className="text-[10.5px] text-white/40 leading-relaxed font-sans mt-2 px-4 max-w-md mx-auto">
          ORBI Clima IA forma parte del ecosistema ORBI: herramientas inteligentes creadas para resolver problemas reales y convertir información compleja en decisiones simples.
        </p>

        <div className="text-[9px] font-mono font-bold text-cyan-400/50 mt-2 uppercase tracking-wide">
          {ORBI_APP_VERSION.version} · {ORBI_APP_VERSION.poweredBy}
        </div>

        <div className="text-[8px] font-mono text-white/20 mt-1 uppercase tracking-widest">
          © 2026 ORBI SKYCORE™ · All rights reserved.
        </div>
      </div>
    </footer>
  );
}

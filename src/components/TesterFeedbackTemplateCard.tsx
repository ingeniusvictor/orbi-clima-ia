import React, { useState } from 'react';
import { Clipboard, Download, Check, Copy } from 'lucide-react';
import { downloadTesterFeedbackTemplate } from '../services/internalTestingExportService';

const FEEDBACK_TEMPLATE_TEXT = `ORBI Clima IA — Feedback Tester

Nombre:
Rol:
Dispositivo:
Android:
Versión probada:
Fecha:

1. ¿La app instaló correctamente?
2. ¿La app abrió sin crash?
3. ¿La interfaz se siente como app Android móvil?
4. ¿El Home se entiende rápidamente?
5. ¿El clima cargó correctamente?
6. ¿Probaste búsqueda manual?
7. ¿Probaste GPS permitido y GPS denegado?
8. ¿Probaste Perfil Persona?
9. ¿Probaste Perfil Técnico Terreno?
10. ¿Probaste widgets Android?
11. ¿Probaste notificaciones?
12. ¿Probaste Quiet Hours?
13. ¿Probaste modo sin internet?
14. ¿La privacidad local se entiende?
15. ¿Encontraste textos confusos?
16. ¿Encontraste errores visuales?
17. ¿Encontraste barras o paneles demasiado largos?
18. ¿Encontraste crashes?
19. ¿Recomendarías avanzar a RC final?

Resultado final:
Aprobado / Observado / Bloqueado

Notas:
Capturas sugeridas:`;

export default function TesterFeedbackTemplateCard() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(FEEDBACK_TEMPLATE_TEXT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    downloadTesterFeedbackTemplate();
  };

  return (
    <div className="p-4 rounded-2xl bg-[#090d19]/90 border border-slate-800 font-sans text-left space-y-3.5">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Clipboard className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Plantilla de Feedback para Testers</h4>
            <p className="text-[10px] text-slate-400">Cuestionario estándar de evaluación</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[10px] rounded-lg cursor-pointer transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'COPIADO' : 'COPIAR'}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1 px-2.5 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 font-mono text-[10px] font-bold rounded-lg cursor-pointer transition-all border border-indigo-500/15"
          >
            <Download className="w-3.5 h-3.5" /> DESCARGAR
          </button>
        </div>
      </div>

      <div className="relative">
        <pre className="p-3 bg-black/40 rounded-xl border border-slate-800/80 text-[10px] text-slate-400 font-mono leading-relaxed whitespace-pre-wrap max-h-[150px] overflow-y-auto scrollbar-thin">
          {FEEDBACK_TEMPLATE_TEXT}
        </pre>
      </div>
    </div>
  );
}

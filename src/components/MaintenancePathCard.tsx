import React from 'react';
import { Compass, GitFork, ArrowRight, ShieldCheck } from 'lucide-react';

export default function MaintenancePathCard() {
  return (
    <div className="space-y-4 font-sans text-left">
      <p className="text-[10px] text-slate-400">
        Ruta formal de evolución del código fuente para garantizar que la versión estable <strong className="text-pink-400">v1.0</strong> no sufra degradaciones operativas imprevistas en terreno.
      </p>

      {/* Strict lock rule */}
      <div className="p-3 bg-pink-500/5 rounded-xl border border-pink-500/20 text-[10px] flex gap-2.5 items-start">
        <GitFork className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-pink-400 font-mono uppercase text-[9px]">Regla de Oro de Versiones</p>
          <p className="text-slate-300 mt-0.5 font-medium">
            "Todo lo que no corresponda a un fix crítico, remediación de privacidad o ajuste estricto de empaquetado Android debe ser excluido de v1.0 y ser redirigido a las ramas v1.1 o superior."
          </p>
        </div>
      </div>

      {/* Visual Roadmap Path */}
      <div className="space-y-3 pt-1">
        {/* v1.0.x */}
        <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-850 space-y-1.5 text-[10px]">
          <div className="flex justify-between items-center">
            <span className="font-mono font-bold text-slate-200 text-[9.5px]">Rama v1.0.x</span>
            <span className="bg-emerald-500/10 text-emerald-400 px-1.5 py-0.2 rounded font-mono text-[8px] font-bold">ESTABILIZADA</span>
          </div>
          <p className="text-slate-400">Correcciones críticas y estabilidad de producción.</p>
          <ul className="grid grid-cols-2 gap-x-2 gap-y-1 text-slate-500 text-[9px] list-disc list-inside">
            <li>Correcciones críticas.</li>
            <li>Ajustes visuales menores.</li>
            <li>Microcopy técnico.</li>
            <li>Fixes de permisos.</li>
            <li>Fixes de widgets.</li>
            <li>Fixes de notificaciones.</li>
            <li>Fixes de packaging.</li>
          </ul>
        </div>

        {/* v1.1.x */}
        <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-850 space-y-1.5 text-[10px]">
          <div className="flex justify-between items-center">
            <span className="font-mono font-bold text-slate-200 text-[9.5px]">Rama v1.1.x</span>
            <span className="bg-blue-500/10 text-blue-400 px-1.5 py-0.2 rounded font-mono text-[8px] font-bold">PLANIFICADA</span>
          </div>
          <p className="text-slate-400">Nuevas funciones de carácter menor y mejoras complementarias.</p>
          <ul className="grid grid-cols-2 gap-x-2 gap-y-1 text-slate-500 text-[9px] list-disc list-inside">
            <li>Nuevas funciones menores.</li>
            <li>Mejoras de widgets.</li>
            <li>Personalización extra.</li>
            <li>Mejoras de reportes.</li>
          </ul>
        </div>

        {/* v2.0.x */}
        <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-850 space-y-1.5 text-[10px]">
          <div className="flex justify-between items-center">
            <span className="font-mono font-bold text-slate-200 text-[9.5px]">Rama v2.0.x</span>
            <span className="bg-purple-500/10 text-purple-400 px-1.5 py-0.2 rounded font-mono text-[8px] font-bold">CONCEPTUAL</span>
          </div>
          <p className="text-slate-400">Rediseño estructural completo y escalabilidad empresarial.</p>
          <ul className="grid grid-cols-2 gap-x-2 gap-y-1 text-slate-500 text-[9px] list-disc list-inside">
            <li>Cambios de arquitectura.</li>
            <li>Backend opcional futuro.</li>
            <li>Integraciones de terceros.</li>
            <li>Evolución comercial.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Camera, Layers, CheckSquare, Sparkles } from 'lucide-react';

interface ScreenshotPlan {
  num: number;
  screen: string;
  objective: string;
  textDraft: string;
  statusRequired: string;
}

export default function ScreenshotPlannerCard() {
  const [activeTab, setActiveTab] = useState<number>(1);

  const plans: ScreenshotPlan[] = [
    {
      num: 1,
      screen: 'Onboarding ORBI Clima IA',
      objective: 'Presentar el valor inicial, la filosofía offline-first y la protección de datos locales.',
      textDraft: 'Bienvenido a ORBI Clima IA: Tu núcleo climático preventivo e inteligente.',
      statusRequired: 'onboarding_first_launch_v1'
    },
    {
      num: 2,
      screen: 'Dashboard principal con ORBI Climate Core',
      objective: 'Mostrar el diseño de temperatura central, aura lumínica, y el gráfico de pronóstico horario.',
      textDraft: 'Toda la información meteorológica en un dashboard limpio e interactivo.',
      statusRequired: 'rancagua_live_v1'
    },
    {
      num: 3,
      screen: 'Perfil Persona',
      objective: 'Visualizar las recomendaciones heurísticas de la vida cotidiana (chaqueta, lluvia, sol).',
      textDraft: 'Orientación inteligente para tu día a día sin registrar cuentas.',
      statusRequired: 'active_profile_persona'
    },
    {
      num: 4,
      screen: 'Perfil Técnico Terreno con Directiva HSE',
      objective: 'Demostrar los umbrales de seguridad, ráfagas de viento de riesgo y la Directiva de Terreno.',
      textDraft: 'Apoyo preventivo para trabajos exteriores bajo estándares rigurosos.',
      statusRequired: 'active_profile_terrain'
    },
    {
      num: 5,
      screen: 'Smart Alerts',
      objective: 'Mostrar el feed de alertas dinámicas categorizadas por severidad (Llovizna, Viento, UV).',
      textDraft: 'Detecta riesgos climáticos antes de salir con alertas de severidad.',
      statusRequired: 'alerts_feed_populated'
    },
    {
      num: 6,
      screen: 'Widgets Android SkyOrb™',
      objective: 'Exhibir la interactividad de los widgets móviles nativos simulados.',
      textDraft: 'Widgets elegantes y reactivos para tu pantalla de inicio Android.',
      statusRequired: 'widget_preview_panel'
    },
    {
      num: 7,
      screen: 'Notificaciones/Quiet Hours',
      objective: 'Destacar la configuración de horario silencioso y la simulación de notificaciones.',
      textDraft: 'Recibe alertas del sistema controlando las horas de descanso.',
      statusRequired: 'notification_settings_panel'
    },
    {
      num: 8,
      screen: 'Preferencias y Privacidad Local',
      objective: 'Verificar la solidez del almacenamiento local, backup manual y los botones de exportación.',
      textDraft: 'Control total de tu configuración con exportación e importación local.',
      statusRequired: 'user_preferences_panel'
    },
    {
      num: 9,
      screen: 'Memoria Climática Local',
      objective: 'Exhibir la inteligencia de sugerencias basadas en el historial de uso puramente local.',
      textDraft: 'ORBI aprende de tus patrones locales para entregarte mejores consejos.',
      statusRequired: 'weather_memory_panel'
    },
    {
      num: 10,
      screen: 'Store Readiness / Firma ORBI',
      objective: 'Mostrar la madurez técnica del producto con su panel de preparación pre-publicación.',
      textDraft: 'Un producto consolidado, seguro y listo para la Play Store.',
      statusRequired: 'store_readiness_panel'
    }
  ];

  const currentPlan = plans.find(p => p.num === activeTab) || plans[0];

  return (
    <div className="p-6 rounded-2xl bg-[#090e1a]/80 border border-slate-800 flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-pink-500/10 text-pink-400 rounded-xl">
          <Camera className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-sans font-bold text-slate-100 uppercase tracking-wider">Screenshot Planner</h3>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">GUÍA DE CAPTURAS DE PANTALLA EXIGIDA</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-5 items-stretch">
        {/* Step Selector Column */}
        <div className="md:w-1/3 flex md:flex-col gap-1.5 overflow-x-auto md:overflow-y-auto max-h-72 pr-1 pb-2 md:pb-0 scrollbar-thin scrollbar-thumb-slate-800 shrink-0">
          {plans.map((p) => (
            <button
              key={p.num}
              onClick={() => setActiveTab(p.num)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-left cursor-pointer transition-all shrink-0 md:shrink font-sans ${
                activeTab === p.num
                  ? 'bg-pink-500/15 border-pink-500/30 text-pink-300 font-bold'
                  : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700 text-slate-400 text-xs'
              }`}
            >
              <span className="font-mono text-[10px] opacity-70">#{p.num}</span>
              <span className="truncate text-xs">{p.screen}</span>
            </button>
          ))}
        </div>

        {/* Selected Plan Detail Column */}
        <div className="flex-1 p-4 rounded-xl bg-slate-950/40 border border-slate-800/80 flex flex-col justify-between gap-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <span className="text-xs font-mono text-pink-400 font-bold uppercase tracking-wider">PLANIFICACIÓN CAPTURA #{currentPlan.num}</span>
              <span className="px-2 py-0.5 bg-slate-800 rounded text-[9px] font-mono text-slate-400 border border-slate-700/50">Requerido</span>
            </div>

            <div className="space-y-2">
              <div>
                <span className="text-[10px] uppercase font-mono text-slate-500 font-bold block">Pantalla Clave</span>
                <span className="text-xs font-sans font-semibold text-slate-100">{currentPlan.screen}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono text-slate-500 font-bold block">Objetivo Visual</span>
                <p className="text-xs text-slate-300 font-sans leading-relaxed mt-0.5">{currentPlan.objective}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-pink-500/5 border border-pink-500/10">
                <span className="text-[10px] uppercase font-mono text-pink-400 font-bold block">Texto sugerido (Pie de foto)</span>
                <p className="text-xs text-slate-200 font-sans italic mt-0.5">"{currentPlan.textDraft}"</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 border-t border-slate-800/60 pt-2">
            <span>Estado del Simulador:</span>
            <span className="text-slate-300 font-bold">`{currentPlan.statusRequired}`</span>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { WeatherSourceState } from '../types/weatherTypes';
import { AlertCircle, HelpCircle, RefreshCw, Radio } from 'lucide-react';

interface WeatherDataModeBannerProps {
  state: WeatherSourceState;
  onResetToDemo?: () => void;
  onRetry?: () => Promise<void> | void;
}

export default function WeatherDataModeBanner({ state, onResetToDemo, onRetry }: WeatherDataModeBannerProps) {
  const { mode } = state;
  const [isRetrying, setIsRetrying] = useState(false);

  if (mode === 'live') {
    return null;
  }

  let text = '';
  let colorClass = '';
  let title = '';
  let icon = null;

  if (mode === 'mock') {
    title = 'Modo Demostración Activo';
    text = 'Explorando ORBI Clima IA mediante simulación de datos pregrabados. Conéctate a la red en vivo buscando cualquier ubicación o activando el GPS.';
    colorClass = 'from-blue-600/10 to-indigo-600/5 border-blue-500/20 text-blue-200';
    icon = <HelpCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5 animate-pulse" />;
  } else if (mode === 'cached') {
    title = 'Último Pronóstico Guardado';
    text = `ORBI mantiene el último estado disponible mientras vuelve la conexión. (Último reporte: ${state.lastUpdated}). No logramos conectar con el satélite climático en este momento, pero tus parámetros de protección siguen respaldados.`;
    colorClass = 'from-amber-600/10 to-yellow-600/5 border-amber-500/20 text-amber-200';
    icon = <RefreshCw className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 animate-spin" style={{ animationDuration: '4s' }} />;
  } else if (mode === 'fallback') {
    title = 'Modo Contingencia Seguro';
    text = `Se activó el respaldo de contingencia integrado. ORBI mantiene el último estado disponible mientras vuelve la conexión. (Último reporte: ${state.lastUpdated}).`;
    colorClass = 'from-cyan-600/10 to-teal-600/5 border-cyan-500/20 text-cyan-200';
    icon = <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5 animate-bounce" />;
  }

  const handleRetryClick = async () => {
    if (!onRetry || isRetrying) return;
    setIsRetrying(true);
    try {
      await onRetry();
    } catch (err) {
      console.error(err);
    } finally {
      // Keep loading spinner briefly to give user sensory confirmation
      setTimeout(() => {
        setIsRetrying(false);
      }, 800);
    }
  };

  return (
    <div 
      className={`bg-gradient-to-r ${colorClass} border rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center text-xs leading-relaxed shadow-lg shadow-[#070b14]/50 animate-fadeIn`}
      id="weather-mode-banner"
    >
      <div className="flex gap-3 items-start flex-1">
        {icon}
        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest block font-bold text-white mb-0.5 flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${mode === 'mock' ? 'bg-blue-400' : (mode === 'cached' ? 'bg-amber-400' : 'bg-cyan-400')}`}></span>
              <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${mode === 'mock' ? 'bg-blue-500' : (mode === 'cached' ? 'bg-amber-500' : 'bg-cyan-500')}`}></span>
            </span>
            {title}
          </span>
          <p className="opacity-80 font-sans font-normal text-[11px] leading-relaxed text-slate-300">{text}</p>
        </div>
      </div>

      <div className="flex gap-2 w-full sm:w-auto shrink-0 mt-2 sm:mt-0 justify-end">
        {onRetry && mode !== 'mock' && (
          <button
            onClick={handleRetryClick}
            disabled={isRetrying}
            className="px-3 py-1.5 text-[10px] font-mono font-bold bg-cyan-500/15 hover:bg-cyan-500/25 active:bg-cyan-500/35 border border-cyan-500/35 rounded-xl text-cyan-300 shrink-0 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isRetrying ? 'animate-spin' : ''}`} />
            {isRetrying ? 'Conectando...' : 'Reintentar ahora'}
          </button>
        )}

        {onResetToDemo && mode !== 'mock' && (
          <button
            onClick={onResetToDemo}
            className="px-3 py-1.5 text-[10px] font-mono font-bold bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 rounded-xl text-white shrink-0 transition-all cursor-pointer"
          >
            Cargar Demo
          </button>
        )}
      </div>
    </div>
  );
}

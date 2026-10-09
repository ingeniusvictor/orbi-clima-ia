import React from 'react';
import { Wifi, WifiOff, ShieldAlert, FileText } from 'lucide-react';

interface LiveWeatherStatusBadgeProps {
  provider: 'open_meteo' | 'mock';
  mode: 'live' | 'cached' | 'fallback' | 'mock';
  lastUpdated?: string;
}

export default function LiveWeatherStatusBadge({
  provider,
  mode,
  lastUpdated = '12:00 PM'
}: LiveWeatherStatusBadgeProps) {
  if (provider === 'open_meteo' && mode === 'live') {
    return (
      <div className="flex flex-col gap-1 items-start animate-fadeIn" id="weather-badge-live">
        <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-full px-3 py-1 flex items-center gap-2 text-[11px] font-sans font-medium text-emerald-300">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-400 font-bold">LIVE API</span>
          <span className="text-white/20">|</span>
          <span className="text-white/50 font-mono text-[9.5px]">OPEN-METEO {lastUpdated}</span>
        </div>
        <span className="text-[10px] text-emerald-400/80 font-sans pl-1">✓ Datos climáticos actualizados.</span>
      </div>
    );
  }

  if (mode === 'cached') {
    return (
      <div className="flex flex-col gap-1 items-start animate-fadeIn" id="weather-badge-cached">
        <div className="bg-amber-500/10 border border-amber-500/25 rounded-full px-3 py-1 flex items-center gap-2 text-[11px] font-sans font-medium text-amber-300">
          <WifiOff className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span className="font-mono text-[10px] uppercase tracking-wider text-amber-400 font-bold">CACHED</span>
          <span className="text-white/20">|</span>
          <span className="text-white/50 font-mono text-[9.5px]">CACHÉ: {lastUpdated}</span>
        </div>
        <span className="text-[10px] text-amber-400/80 font-sans pl-1">⚠ Usando último pronóstico guardado.</span>
      </div>
    );
  }

  if (mode === 'fallback') {
    return (
      <div className="flex flex-col gap-1 items-start animate-fadeIn" id="weather-badge-fallback">
        <div className="bg-cyan-500/10 border border-cyan-500/25 rounded-full px-3 py-1 flex items-center gap-2 text-[11px] font-sans font-medium text-cyan-300">
          <ShieldAlert className="w-3.5 h-3.5 text-cyan-400 animate-bounce" />
          <span className="font-mono text-[10px] uppercase tracking-wider text-cyan-400 font-bold">FALLBACK</span>
          <span className="text-white/20">|</span>
          <span className="text-white/50 font-mono text-[9.5px]">AUTO-FALLBACK</span>
        </div>
        <span className="text-[10px] text-cyan-400/80 font-sans pl-1">ℹ Modo seguro por conexión inestable.</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 items-start animate-fadeIn" id="weather-badge-mock">
      <div className="bg-purple-500/10 border border-purple-500/25 rounded-full px-3 py-1 flex items-center gap-2 text-[11px] font-sans font-medium text-purple-300">
        <FileText className="w-3.5 h-3.5 text-purple-400" />
        <span className="font-mono text-[10px] uppercase tracking-wider text-purple-400 font-bold">DEMO LOCAL</span>
        <span className="text-white/20">|</span>
        <span className="text-white/40 font-mono text-[9.5px]">NÚCLEO LOCAL</span>
      </div>
      <span className="text-[10px] text-purple-400/80 font-sans pl-1">⚙ Datos de prueba locales.</span>
    </div>
  );
}

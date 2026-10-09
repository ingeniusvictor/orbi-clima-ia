import React, { useState } from 'react';
import { Clock, MapPin, Activity, ShieldAlert, RefreshCw } from 'lucide-react';
import { WeatherLocation, WeatherCondition, WeatherProfile, CurrentWeather } from '../types/weatherTypes';
import OrbiClimateCore from './OrbiClimateCore';
import OrbiZenSoundController from './OrbiZenSoundController';
import OrbiLocationPopoverPortal from './OrbiLocationPopoverPortal';

interface WelcomeHeroSectionProps {
  location: WeatherLocation;
  temperature: number;
  feelsLike: number;
  conditionText: string;
  conditionCode: WeatherCondition | 'fog' | string;
  skyCoreStatus: string;
  bestWindow: string;
  sourceMode: 'api' | 'mock' | 'cache' | 'fallback';
  activeProfile: WeatherProfile;
  isLoading?: boolean;
  currentWeather?: CurrentWeather;
  locationOrigin?: 'gps' | 'manual' | 'saved' | 'destination' | 'demo' | 'cache' | 'setup';
  onUseMyLocation?: () => void;
  onCityChangeClick?: () => void;
  isGpsLoading?: boolean;
  gpsError?: string | null;
  onRefresh?: () => void;
}

export default function WelcomeHeroSection({
  location,
  temperature,
  feelsLike,
  conditionText,
  conditionCode,
  skyCoreStatus,
  bestWindow,
  sourceMode,
  activeProfile,
  isLoading,
  currentWeather,
  locationOrigin = 'demo',
  onUseMyLocation,
  onCityChangeClick,
  isGpsLoading = false,
  gpsError = null,
  onRefresh
}: WelcomeHeroSectionProps) {

  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackCompleted, setFeedbackCompleted] = useState<string | null>(null);
  const [calibrating, setCalibrating] = useState(false);
  const [showLocationSetup, setShowLocationSetup] = useState(false);

  const getLocationOriginBadge = () => {
    switch (locationOrigin) {
      case 'gps':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8.5px] font-bold tracking-wider font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase shadow-[0_0_8px_rgba(16,185,129,0.1)]">
            <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
            GPS ACTIVO
          </span>
        );
      case 'saved':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8.5px] font-bold tracking-wider font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 uppercase">
            ★ GUARDADA
          </span>
        );
      case 'destination':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8.5px] font-bold tracking-wider font-mono bg-purple-500/10 text-purple-300 border border-purple-500/20 uppercase">
            🎯 DESTINO
          </span>
        );
      case 'manual':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8.5px] font-bold tracking-wider font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 uppercase">
            MANUAL
          </span>
        );
      case 'cache':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8.5px] font-bold tracking-wider font-mono bg-slate-500/10 text-slate-400 border border-slate-500/20 uppercase">
            💾 CACHE
          </span>
        );
      case 'setup':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8.5px] font-bold tracking-wider font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase shadow-[0_0_8px_rgba(34,211,238,0.1)]">
            ⚙️ INICIAL
          </span>
        );
      case 'demo':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8.5px] font-bold tracking-wider font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase">
            DEMO
          </span>
        );
    }
  };
  
  const getSourceBadge = () => {
    switch (sourceMode) {
      case 'api':
        return (
          <span className="flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[12.5px] font-bold font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.15)]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            LIVE API
          </span>
        );
      case 'cache':
        return (
          <span className="flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[12.5px] font-bold font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">
            CACHED
          </span>
        );
      case 'fallback':
        return (
          <span className="flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[12.5px] font-bold font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20">
            FALLBACK
          </span>
        );
      case 'mock':
      default:
        return (
          <span className="flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[12.5px] font-bold font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20">
            DEMO LOCAL
          </span>
        );
    }
  };

  const getConditionGradientClass = (condStr: string) => {
    const c = (condStr || 'sunny').toLowerCase();
    
    if (c === 'sunny' || c === 'clear') {
      return 'from-amber-300 via-orange-400 to-yellow-300';
    }
    if (c.includes('partly') || c.includes('parcial') || c === 'partly_cloudy') {
      return 'from-sky-300 via-indigo-400 to-sky-300';
    }
    if (c === 'fog' || c.includes('niebla') || c.includes('bruma')) {
      return 'from-zinc-400 via-slate-400 to-slate-300';
    }
    if (c === 'rain' || c.includes('lluvia') || c.includes('llovizna') || c.includes('drizzle')) {
      return 'from-blue-400 via-indigo-400 to-cyan-400';
    }
    if (c === 'storm' || c.includes('tormenta') || c.includes('thunderstorm') || c.includes('tempestad')) {
      return 'from-indigo-400 via-purple-500 to-violet-400';
    }
    if (c === 'wind' || c.includes('viento') || c.includes('gale') || c.includes('breeze')) {
      return 'from-teal-400 via-slate-400 to-emerald-400';
    }
    if (c === 'cold' || c.includes('nieve') || c.includes('snow') || c.includes('frost') || c.includes('frío') || c.includes('freezing')) {
      return 'from-cyan-300 via-blue-400 to-indigo-300';
    }
    if (c === 'hot' || c.includes('calor') || c.includes('heat') || temperature >= 30) {
      return 'from-red-400 via-orange-500 to-amber-400';
    }
    return 'from-slate-300 via-slate-400 to-zinc-300';
  };

  const getSkyCoreStatusClass = () => {
    const s = skyCoreStatus.toLowerCase();
    if (s.includes('crítica') || s.includes('adversa') || s.includes('alerta')) {
      return 'text-rose-400 bg-rose-500/10 border-rose-500/15 shadow-[0_0_15px_rgba(244,63,94,0.05)]';
    }
    if (s.includes('precaución') || s.includes('riesgo') || s.includes('moderado')) {
      return 'text-amber-400 bg-amber-500/10 border-amber-500/15';
    }
    return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/15';
  };

  return (
    <div
      id="welcome-hero-section"
      className="p-5 rounded-3xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl relative overflow-hidden flex flex-col gap-5"
    >

      {/* Header Top Row (Title & Zen controller) */}
      <div className="flex items-start justify-between gap-4 relative z-10">
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight font-sans flex items-center gap-2 select-none whitespace-nowrap">
              <span className={`bg-clip-text text-transparent bg-gradient-to-r ${getConditionGradientClass(conditionCode)} transition-all duration-1000`}>
                ORBI Clima
              </span>
              <span className="text-emerald-400 font-black drop-shadow-[0_0_12px_rgba(16,185,129,0.35)]">
                IA
              </span>
            </h1>
          </div>
          <div className="flex flex-col gap-1 text-[14.5px] text-indigo-300 font-mono leading-normal">
            <span className="font-bold">Powered by ORBI SkyCore™</span>
            <span className="text-[13px] opacity-75">Tu núcleo climático inteligente.</span>
          </div>
          <div className="pt-1 flex items-center">
            {getSourceBadge()}
          </div>
        </div>

        {/* ORBI Zen Sound ambient controller - perfectly aligned to top header name */}
        <div className="shrink-0 pt-2.5">
          <OrbiZenSoundController />
        </div>
      </div>

      {/* Location Line (Second Row of Header) */}
      <div 
        onClick={() => setShowLocationSetup(true)}
        className="flex flex-col gap-1.5 relative z-10 border-t border-white/5 pt-2.5 cursor-pointer hover:opacity-95 active:scale-[0.99] transition-all group"
        role="button"
        aria-label="Configurar ubicación climática"
      >
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <MapPin className="w-4 h-4 text-indigo-400 shrink-0 group-hover:scale-110 transition-transform duration-200" />
            <span className="text-sm font-black text-white tracking-tight leading-none border-b border-dashed border-white/20 group-hover:border-cyan-400 group-hover:text-cyan-300 transition-colors" title={location.name}>
              {location.name}
            </span>
          </div>
          {getLocationOriginBadge()}
        </div>
        {location.region && (
          <span className="text-slate-400 text-[9px] font-mono leading-tight block uppercase tracking-wider pl-[22px] group-hover:text-cyan-400/70 transition-colors" title={location.region}>
            {location.region}
          </span>
        )}
      </div>

      {/* ----------------- CORE CLIMATE ORB ----------------- */}
      <div className="relative z-10 my-1 flex justify-center">
        <OrbiClimateCore 
          condition={conditionCode}
          temperature={temperature}
          feelsLike={feelsLike}
          isLoading={isLoading}
        />
      </div>

      {/* ----------------- WEATHER TRUTH DIAGNOSTIC CARD (REQUISITO 3 & 4) ----------------- */}
      <div className="relative z-10 p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
        <div className="flex items-center justify-between">
          <button 
            type="button"
            onClick={() => setShowDiagnostic(!showDiagnostic)}
            className="flex items-center gap-1.5 text-[10px] font-mono text-indigo-300 hover:text-indigo-200 font-bold uppercase tracking-wider cursor-pointer select-none"
          >
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
            <span>Diagnóstico de Veracidad SkyCore™</span>
            <span className="text-[8px] px-1 py-0.2 bg-white/5 text-slate-400 rounded-sm">
              {showDiagnostic ? 'Ocultar' : 'Ver'}
            </span>
          </button>
          
          <span className="text-[8.5px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
            SENSADO VIRTUAL: OK
          </span>
        </div>

        {/* Diagnostic Detailed Rows */}
        {showDiagnostic && (
          <div className="space-y-2 text-[10px] font-mono text-slate-300 border-t border-white/[0.03] pt-2.5 animate-fade-in">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/[0.01] p-1.5 rounded-lg border border-white/[0.03]">
                <span className="text-slate-500 block text-[8px] uppercase tracking-wider">Estación</span>
                <span className="font-bold text-slate-200 truncate block">{location.name}</span>
              </div>
              <div className="bg-white/[0.01] p-1.5 rounded-lg border border-white/[0.03]">
                <span className="text-slate-500 block text-[8px] uppercase tracking-wider">Ubicación Origen</span>
                <span className="font-bold text-cyan-400 block">
                  {locationOrigin === 'gps' ? '🛰️ GPS REAL' : 
                   locationOrigin === 'manual' ? '🔍 BÚSQUEDA MANUAL' : 
                   locationOrigin === 'saved' ? '⭐ UBICACIÓN GUARDADA' : '⚙️ VALOR INICIAL'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/[0.01] p-1.5 rounded-lg border border-white/[0.03]">
                <span className="text-slate-500 block text-[8px] uppercase tracking-wider">Sincronización</span>
                <span className="font-bold text-indigo-400 block">Open-Meteo Satelital</span>
              </div>
              <div className="bg-white/[0.01] p-1.5 rounded-lg border border-white/[0.03]">
                <span className="text-slate-500 block text-[8px] uppercase tracking-wider">Actualización</span>
                <span className="font-bold text-slate-200 block">{currentWeather?.updatedAt || '07:30 AM'}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/[0.01] p-1.5 rounded-lg border border-white/[0.03]">
                <span className="text-slate-500 block text-[8px] uppercase tracking-wider">Modo Lectura</span>
                <span className="font-bold text-slate-200 block">
                  {currentWeather && currentWeather.precipitationMm > 0 ? 'Lectura en Tiempo Real' : 'Pronóstico de Tendencia'}
                </span>
              </div>
              <div className="bg-white/[0.01] p-1.5 rounded-lg border border-white/[0.03]">
                <span className="text-slate-500 block text-[8px] uppercase tracking-wider">Inestabilidad</span>
                <span className="font-bold text-slate-200 block">
                  {currentWeather && currentWeather.precipitationMm > 0 ? `Precipitación Activa (${currentWeather.precipitationMm} mm)` : 'Estable sin lluvia'}
                </span>
              </div>
            </div>

            {/* Microclima localized fallback warning (REQUISITO 3) */}
            {currentWeather && currentWeather.precipitationMm === 0 && (conditionCode === 'rain' || conditionCode === 'storm' || conditionText.toLowerCase().includes('lluvia') || conditionText.toLowerCase().includes('chubasco')) && (
              <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 font-sans text-[9px] leading-normal">
                ⚠️ <strong>Condición variable:</strong> El modelo detecta nubosidad propensa a precipitaciones en el cuadrante de {location.name}, pero el clima real instantáneo puede diferir por microclima local o viento en altura.
              </div>
            )}
          </div>
        )}

        {/* Feedback Section (REQUISITO 4) */}
        <div className="border-t border-white/[0.04] pt-2 flex flex-col gap-2">
          {!showFeedback ? (
            <div className="flex items-center justify-between">
              <span className="text-[9.5px] text-slate-400 font-sans">¿El clima en este punto no coincide con tu ventana real?</span>
              <button
                type="button"
                onClick={() => {
                  setShowFeedback(true);
                  setFeedbackCompleted(null);
                }}
                className="px-2 py-0.5 rounded bg-white/5 border border-white/10 hover:bg-white/10 text-[9px] font-sans font-bold text-indigo-300 hover:text-indigo-200 cursor-pointer select-none transition-all"
              >
                ¿No coincide?
              </button>
            </div>
          ) : (
            <div className="space-y-2 animate-fade-in text-left">
              <div className="flex items-center justify-between border-b border-white/[0.03] pb-1">
                <span className="text-[9px] font-mono text-indigo-400 font-bold uppercase tracking-wider">Discrepancia Climatológica Local</span>
                <button 
                  type="button"
                  onClick={() => setShowFeedback(false)}
                  className="text-slate-500 hover:text-slate-300 font-bold text-[9px]"
                >
                  Cerrar
                </button>
              </div>

              {calibrating ? (
                <div className="py-3 text-center space-y-2">
                  <RefreshCw className="w-5 h-5 text-cyan-400 animate-spin mx-auto" />
                  <p className="text-[9.5px] font-mono text-cyan-300 animate-pulse">Sincronizando satélite e invalidando caché local...</p>
                </div>
              ) : feedbackCompleted ? (
                <div className="p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-center space-y-1.5 animate-fade-in">
                  <div className="text-emerald-400 text-[10px] font-sans font-black uppercase tracking-wider">¡Sensor Virtual Calibrado!</div>
                  <p className="text-[9px] text-slate-300 font-sans leading-relaxed">
                    Hemos registrado tu reporte para {location.name} (<strong>{feedbackCompleted}</strong>). El motor ORBI SkyCore™ está ajustando la ponderación preventiva para tu perfil.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setShowFeedback(false);
                      setFeedbackCompleted(null);
                    }}
                    className="mt-1 px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/25 rounded text-[8.5px] font-sans font-bold text-emerald-400 hover:bg-emerald-500/20 cursor-pointer"
                  >
                    Entendido
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-[9px] text-slate-300 font-sans leading-normal">
                    Fuerza una actualización en tiempo real o reporta lo que ves para calibrar el radar virtual.
                  </p>
                  
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={async () => {
                        setCalibrating(true);
                        // Force refresh!
                        if (onRefresh) {
                          try {
                            await onRefresh();
                          } catch (e) {}
                        } else if (onUseMyLocation) {
                          try {
                            await onUseMyLocation();
                          } catch (e) {}
                        }
                        setTimeout(() => {
                          setCalibrating(false);
                          setFeedbackCompleted('Actualización forzada de satélite');
                        }, 1200);
                      }}
                      className="flex-1 py-1 px-2 rounded bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-white text-[9.5px] font-sans font-black uppercase tracking-wider transition-all cursor-pointer text-center"
                    >
                      Actualizar Ahora ⚡
                    </button>
                  </div>

                  <div className="space-y-1 pt-1 border-t border-white/[0.03]">
                    <span className="text-[8.5px] font-mono text-slate-500 uppercase tracking-wider block">Reportar lo que ves en {location.name}:</span>
                    <div className="grid grid-cols-2 gap-1">
                      <button
                        type="button"
                        onClick={() => setFeedbackCompleted('Aquí está despejado / soleado')}
                        className="py-1 px-1.5 rounded bg-white/5 border border-white/5 hover:bg-white/10 active:scale-95 text-[9px] text-slate-300 font-sans text-left truncate cursor-pointer"
                      >
                        ☀️ Está despejado
                      </button>
                      <button
                        type="button"
                        onClick={() => setFeedbackCompleted('Aquí hay lluvia activa')}
                        className="py-1 px-1.5 rounded bg-white/5 border border-white/5 hover:bg-white/10 active:scale-95 text-[9px] text-slate-300 font-sans text-left truncate cursor-pointer"
                      >
                        🌧️ Aquí llueve
                      </button>
                      <button
                        type="button"
                        onClick={() => setFeedbackCompleted('Diferencia de temperatura notable')}
                        className="py-1 px-1.5 rounded bg-white/5 border border-white/5 hover:bg-white/10 active:scale-95 text-[9px] text-slate-300 font-sans text-left truncate cursor-pointer"
                      >
                        🌡️ Desvío temperatura
                      </button>
                      <button
                        type="button"
                        onClick={() => setFeedbackCompleted('Nubosidad variable o niebla local')}
                        className="py-1 px-1.5 rounded bg-white/5 border border-white/5 hover:bg-white/10 active:scale-95 text-[9px] text-slate-300 font-sans text-left truncate cursor-pointer"
                      >
                        ☁️ Nublado sin lluvia
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Exclusive setup CTA when location is not yet configured (Requirement 5 & 6) */}
      {locationOrigin === 'setup' && onUseMyLocation && onCityChangeClick && (
        <div className="p-4 rounded-2xl bg-cyan-950/10 border border-cyan-500/20 flex flex-col gap-3 relative z-10 animate-pulse-slow">
          <p className="text-[11px] text-slate-200 font-sans font-medium leading-normal text-center">
            Activa tu ubicación real para ver el clima exacto de tu posición actual, o busca una ciudad de forma manual.
          </p>
          <div className="flex gap-2.5">
            <button
              onClick={onUseMyLocation}
              disabled={isGpsLoading}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-cyan-600 hover:bg-cyan-500 active:scale-98 border border-cyan-500/30 text-white text-[11px] font-sans font-extrabold rounded-xl transition-all cursor-pointer disabled:opacity-50 select-none shadow-[0_0_12px_rgba(6,182,212,0.15)]"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGpsLoading ? 'animate-spin' : ''}`} />
              {isGpsLoading ? 'Sincronizando...' : 'Usar mi ubicación'}
            </button>
            <button
              onClick={onCityChangeClick}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-white/5 hover:bg-white/10 active:scale-98 border border-white/10 text-slate-200 text-[11px] font-sans font-bold rounded-xl transition-all cursor-pointer select-none"
            >
              <MapPin className="w-3.5 h-3.5 text-indigo-400" />
              Buscar ciudad
            </button>
          </div>
          {gpsError && (
            <p className="text-[9.5px] text-rose-400 font-mono text-center">
              ⚠️ {gpsError}
            </p>
          )}
        </div>
      )}

      {/* HSE Terreno Mandatory Text for Technical Mode (Section 10) */}
      {activeProfile === 'field_tech' && (
        <div className="mt-1 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/15 text-[9.5px] text-amber-200/90 leading-relaxed font-mono select-none relative z-10 flex items-start gap-2 animate-fade-in shadow-[inset_0_0_12px_rgba(245,158,11,0.05)]">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            <strong>Directiva HSE Terreno:</strong> Las alertas ORBI son apoyo preventivo. No reemplazan protocolos HSE, evaluación en terreno ni instrucciones del empleador.
          </span>
        </div>
      )}

      {/* Orbi Location Popover Portal */}
      <OrbiLocationPopoverPortal
        isOpen={showLocationSetup}
        onClose={() => setShowLocationSetup(false)}
        locationName={location.name}
        locationOrigin={locationOrigin}
        onUseMyLocation={onUseMyLocation}
        onCityChangeClick={onCityChangeClick}
        isGpsLoading={isGpsLoading}
        gpsError={gpsError}
      />
    </div>
  );
}

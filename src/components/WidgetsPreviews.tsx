import React, { useState } from 'react';
import { CurrentWeather, HourlyForecast, WeatherCondition, RiskLevel, WeatherProfile } from '../types/weatherTypes';
import { Sun, CloudSun, Cloud, CloudRain, ShieldAlert, Wind, Snowflake, Flame, Moon, Zap, Cpu, Compass, Sliders, Smartphone, HardHat, Eye, RefreshCw, Info, Sparkles, HelpCircle } from 'lucide-react';
import { buildAdvancedSkyCoreAnalysis } from '../utils/weatherRiskEngine';
import { getDecisionLabel, getRiskLevelBadgeClass } from '../utils/skyCoreRiskLabels';
import { OrbiSkyOrbCommandPremiumPreview } from './widgets/OrbiSkyOrbCommandPremiumPreview';

// Helper for customizable widget background glass transparency
function WidgetBackgroundOverlay({ condition, transparency }: { condition: WeatherCondition; transparency: number }) {
  let gradientClass = "bg-gradient-to-br from-slate-900/40 via-slate-950/95 to-zinc-950/90";
  
  if (condition === 'storm') {
    gradientClass = "bg-gradient-to-br from-[#12082f]/70 via-[#070514]/90 to-[#100624]/90";
  } else if (condition === 'rain') {
    gradientClass = "bg-gradient-to-br from-[#061435]/70 via-[#030613]/90 to-[#07112d]/90";
  } else if (condition === 'cold') {
    gradientClass = "bg-gradient-to-br from-[#051c33]/70 via-[#030814]/90 to-[#031525]/90";
  } else if (condition === 'hot') {
    gradientClass = "bg-gradient-to-br from-[#2b080f]/70 via-[#0a0305]/90 to-[#1d0509]/90";
  } else if (condition === 'sunny' || condition === 'night') {
    gradientClass = "bg-gradient-to-br from-[#1f1003]/70 via-[#06040a]/95 to-[#120a02]/90";
  } else if (condition === 'wind') {
    gradientClass = "bg-gradient-to-br from-[#05221c]/70 via-[#03070b]/95 to-[#041b16]/90";
  }

  return (
    <div 
      className={`absolute inset-0 ${gradientClass} pointer-events-none z-0 transition-opacity duration-300`} 
      style={{ opacity: transparency / 100 }}
    />
  );
}

// Helper for premium animated weather landscapes/backgrounds in widgets
function WidgetClimateBackground({ condition, enabled }: { condition: WeatherCondition; enabled: boolean }) {
  if (!enabled) return null;

  switch (condition) {
    case 'sunny':
    case 'hot':
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {/* Pulsing solar center */}
          <div className="absolute top-0 right-0 w-36 h-36 bg-amber-400/10 rounded-full blur-3xl" />
          
          {/* Animated solar rays */}
          <div className="absolute -top-10 -right-10 w-48 h-48 border border-amber-400/5 rounded-full animate-[spin_60s_linear_infinite]" />
          <div className="absolute -top-10 -right-10 w-48 h-48 border border-dashed border-amber-300/5 rounded-full animate-[spin_45s_linear_infinite_reverse]" />
          
          {/* Ray beam simulations */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-1/4 w-[1px] h-[150%] bg-gradient-to-b from-amber-300/40 via-amber-300/5 to-transparent rotate-[25deg] origin-top animate-[pulse_4s_ease-in-out_infinite]" />
            <div className="absolute top-0 left-1/2 w-[2px] h-[150%] bg-gradient-to-b from-amber-300/30 via-amber-300/5 to-transparent rotate-[25deg] origin-top animate-[pulse_6s_ease-in-out_infinite_1s]" />
            <div className="absolute top-0 left-3/4 w-[1px] h-[150%] bg-gradient-to-b from-amber-200/50 via-amber-200/5 to-transparent rotate-[25deg] origin-top animate-[pulse_5s_ease-in-out_infinite_2s]" />
          </div>
        </div>
      );

    case 'rain':
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {/* Ambient rainy dark glow */}
          <div className="absolute inset-0 bg-blue-950/25" />
          
          {/* 8 falling rain lines with staggered left positions, delays and durations */}
          <div className="absolute inset-0 opacity-40">
            {[...Array(8)].map((_, i) => {
              const left = `${(i * 12) + 5}%`;
              const delay = `${i * 0.3}s`;
              const duration = `${1.0 + (i % 3) * 0.3}s`;
              const height = `${15 + (i % 4) * 8}px`;
              return (
                <div
                  key={i}
                  className="absolute w-[1px] bg-gradient-to-b from-blue-300/60 to-transparent rounded animate-widget-rain"
                  style={{
                    left,
                    height,
                    animationDelay: delay,
                    animationDuration: duration,
                    top: '-40px',
                  } as React.CSSProperties}
                />
              );
            })}
          </div>
        </div>
      );

    case 'storm':
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {/* Ambient storm backdrop */}
          <div className="absolute inset-0 bg-purple-950/20" />
          
          {/* Interactive lightning flash simulator */}
          <div className="absolute inset-0 bg-white/10 opacity-0 animate-widget-lightning" />
          
          {/* Falling heavy rain */}
          <div className="absolute inset-0 opacity-50">
            {[...Array(10)].map((_, i) => {
              const left = `${(i * 10) + 5}%`;
              const delay = `${i * 0.2}s`;
              const duration = `${0.8 + (i % 3) * 0.2}s`;
              const height = `${20 + (i % 3) * 10}px`;
              return (
                <div
                  key={i}
                  className="absolute w-[1px] bg-gradient-to-b from-cyan-200/50 to-transparent rounded animate-widget-rain"
                  style={{
                    left,
                    height,
                    animationDelay: delay,
                    animationDuration: duration,
                    top: '-40px',
                    transform: 'rotate(15deg)',
                  } as React.CSSProperties}
                />
              );
            })}
          </div>
        </div>
      );

    case 'cloudy':
    case 'partly_cloudy':
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {/* Drifting misty cloud layers */}
          <div className="absolute top-1/4 -left-12 w-32 h-16 bg-indigo-500/5 rounded-full blur-2xl animate-widget-cloud-1" style={{ animationDuration: '30s' }} />
          <div className="absolute top-1/2 -right-12 w-40 h-20 bg-slate-400/5 rounded-full blur-2xl animate-widget-cloud-2" style={{ animationDuration: '40s' }} />
        </div>
      );

    case 'wind':
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {/* Swaying wind streamlines */}
          <div className="absolute inset-0 opacity-30">
            {[...Array(4)].map((_, i) => {
              const top = `${20 + i * 22}%`;
              const delay = `${i * 1.2}s`;
              const duration = `${4 + i * 1.5}s`;
              return (
                <div
                  key={i}
                  className="absolute left-[-150px] w-[120px] h-[1px] bg-gradient-to-r from-transparent via-teal-300/30 to-transparent rounded animate-widget-wind"
                  style={{
                    top,
                    animationDelay: delay,
                    animationDuration: duration,
                  } as React.CSSProperties}
                />
              );
            })}
          </div>
        </div>
      );

    case 'cold':
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {/* Soft ice blue ambient glow */}
          <div className="absolute inset-0 bg-cyan-950/10" />
          
          {/* Falling crystalline frost stars */}
          <div className="absolute inset-0 opacity-45">
            {[...Array(10)].map((_, i) => {
              const left = `${(i * 11) + 4}%`;
              const delay = `${i * 0.5}s`;
              const duration = `${2.5 + (i % 3) * 1.0}s`;
              return (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-cyan-200/50 rounded-full blur-[0.5px] animate-widget-snow"
                  style={{
                    left,
                    animationDelay: delay,
                    animationDuration: duration,
                    top: '-10px',
                  } as React.CSSProperties}
                />
              );
            })}
          </div>
        </div>
      );

    case 'night':
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {/* Twinkling stars */}
          <div className="absolute inset-0 opacity-50">
            {[...Array(10)].map((_, i) => {
              const top = `${(i * 9) + 5}%`;
              const left = `${(i * 11 + 7) % 95}%`;
              const delay = `${i * 0.4}s`;
              const duration = `${1.5 + (i % 3) * 0.8}s`;
              return (
                <div
                  key={i}
                  className="absolute w-0.5 h-0.5 bg-white rounded-full animate-pulse"
                  style={{
                    top,
                    left,
                    animationDelay: delay,
                    animationDuration: duration,
                  } as React.CSSProperties}
                />
              );
            })}
          </div>
          {/* Silver moon shadow glow */}
          <div className="absolute -top-12 -right-12 w-24 h-24 bg-violet-400/5 rounded-full blur-2xl" />
        </div>
      );

    default:
      return null;
  }
}

interface WidgetsPreviewsProps {
  current: CurrentWeather;
  hourly: HourlyForecast[];
  locationName: string;
  riskLevel: RiskLevel;
  shortNarrative: string;
  bestWindow: string;
  activeProfile: WeatherProfile;
  weatherSourceState?: any;
}

export default function WidgetsPreviews({
  current,
  hourly,
  locationName,
  riskLevel,
  shortNarrative,
  bestWindow,
  activeProfile,
  weatherSourceState
}: WidgetsPreviewsProps) {
  const [selectedWidget, setSelectedWidget] = useState<'skyorb_mini' | 'skypanel' | 'field_command' | 'cinematic_bar' | 'skyorb_2x2' | 'skyorb_4x2' | 'skyorb_4x4'>('skyorb_2x2');
  const [showDevSpecs, setShowDevSpecs] = useState<boolean>(false);
  const [transparency, setTransparency] = useState<number>(85); // background glass opacity percentage, default 85%
  const [showClimateEffects, setShowClimateEffects] = useState<boolean>(true); // animated Landscapes

  // Compute live advanced analysis
  const analysis = buildAdvancedSkyCoreAnalysis({ current, hourly, daily: [], profile: activeProfile });

  const getOrbAssetKey = (cond: WeatherCondition) => {
    switch(cond) {
      case 'sunny':
      case 'hot':
        return 'sunny';
      case 'rain':
        return 'rain';
      case 'storm':
        return 'storm';
      case 'cloudy':
      case 'partly_cloudy':
        return 'cloudy';
      case 'wind':
        return 'wind';
      case 'cold':
        return 'cold';
      default:
        return 'fallback';
    }
  };

  const getSourceBadgeText = () => {
    if (!weatherSourceState) return 'DEMO';
    if (weatherSourceState.provider === 'mock') return 'DEMO';
    if (weatherSourceState.mode === 'cached') return 'CACHE';
    if (weatherSourceState.mode === 'fallback') return 'FALLBACK';
    return 'LIVE';
  };

  const getSourceBadgeClass = () => {
    const text = getSourceBadgeText();
    if (text === 'LIVE') return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20';
    if (text === 'CACHE') return 'bg-blue-500/15 text-blue-400 border-blue-500/20';
    if (text === 'FALLBACK') return 'bg-amber-500/15 text-amber-400 border-amber-500/20';
    return 'bg-purple-500/15 text-purple-400 border-purple-500/20';
  };

  // Mini Climate Orb with atmospheric halos matching the weather condition
  const renderWidgetCoreSphere = (cond: WeatherCondition, sizeClass = "w-11 h-11") => {
    let bgGradient = "from-amber-400 via-orange-500 to-amber-600";
    let glowColor = "rgba(245, 158, 11, 0.55)";
    let ringColor = "border-amber-400/30";
    let dotColor = "bg-amber-300";
    let atmosphericColor = "bg-orange-500/10";
    
    if (cond === 'partly_cloudy') {
      bgGradient = "from-sky-300 via-indigo-400 to-indigo-600";
      glowColor = "rgba(56, 189, 248, 0.45)";
      ringColor = "border-sky-300/30";
      dotColor = "bg-sky-200";
      atmosphericColor = "bg-indigo-500/10";
    } else if (cond === 'cloudy') {
      bgGradient = "from-slate-400 via-zinc-400 to-slate-600";
      glowColor = "rgba(148, 163, 184, 0.35)";
      ringColor = "border-slate-300/20";
      dotColor = "bg-slate-200";
      atmosphericColor = "bg-slate-500/5";
    } else if (cond === 'rain') {
      bgGradient = "from-blue-600 via-teal-500 to-indigo-900";
      glowColor = "rgba(37, 99, 235, 0.55)";
      ringColor = "border-blue-400/30";
      dotColor = "bg-cyan-300";
      atmosphericColor = "bg-blue-500/15";
    } else if (cond === 'storm') {
      bgGradient = "from-purple-600 via-violet-750 to-indigo-950";
      glowColor = "rgba(139, 92, 246, 0.6)";
      ringColor = "border-purple-400/35";
      dotColor = "bg-cyan-300";
      atmosphericColor = "bg-purple-500/15";
    } else if (cond === 'wind') {
      bgGradient = "from-teal-400 via-slate-500 to-slate-700";
      glowColor = "rgba(20, 184, 166, 0.45)";
      ringColor = "border-teal-300/30";
      dotColor = "bg-teal-200";
      atmosphericColor = "bg-teal-500/10";
    } else if (cond === 'cold') {
      bgGradient = "from-cyan-200 via-cyan-400 to-blue-600";
      glowColor = "rgba(6, 182, 212, 0.55)";
      ringColor = "border-cyan-300/30";
      dotColor = "bg-white";
      atmosphericColor = "bg-cyan-500/15";
    } else if (cond === 'hot') {
      bgGradient = "from-red-500 via-orange-500 to-yellow-600";
      glowColor = "rgba(239, 68, 68, 0.55)";
      ringColor = "border-red-400/30";
      dotColor = "bg-yellow-300";
      atmosphericColor = "bg-red-500/15";
    } else if (cond === 'night') {
      bgGradient = "from-indigo-950 via-slate-900 to-black";
      glowColor = "rgba(79, 70, 229, 0.35)";
      ringColor = "border-indigo-500/25";
      dotColor = "bg-violet-400";
      atmosphericColor = "bg-indigo-500/10";
    }

    return (
      <div className="relative shrink-0 flex items-center justify-center group">
        {/* Layer 1: Multi-layered background soft glow (outermost halo) */}
        <div 
          className="absolute rounded-full blur-xl animate-[pulse_3s_ease-in-out_infinite] pointer-events-none transition-all duration-700" 
          style={{ 
            width: '160%', 
            height: '160%', 
            backgroundColor: glowColor,
            opacity: 0.25 
          }} 
        />
        <div 
          className="absolute rounded-full blur-md animate-[pulse_2s_ease-in-out_infinite] pointer-events-none transition-all duration-700" 
          style={{ 
            width: '130%', 
            height: '130%', 
            backgroundColor: glowColor,
            opacity: 0.4 
          }} 
        />
        
        {/* Layer 2: Atmospheric outer boundary ring (ultra-thin custom ring) */}
        <div className={`absolute w-[145%] h-[145%] rounded-full border border-white/[0.04] ${atmosphericColor} pointer-events-none`} />

        {/* Layer 3: Elegant Orbital Track with micro-particle (spins seamlessly) */}
        <div className={`absolute w-[125%] h-[125%] rounded-full border ${ringColor} border-dashed animate-[spin_15s_linear_infinite] opacity-70 pointer-events-none`}>
          {/* Orbital stardust particle with inner core and soft shadow glow */}
          <div className={`absolute w-1.5 h-1.5 rounded-full ${dotColor} -top-[3.5px] left-1/2 -translate-x-1/2 shadow-[0_0_10px_2px_${glowColor}]`} />
        </div>

        {/* Layer 4: Second opposite orbital track (ultra-thin, slower, clockwise) for depth */}
        <div className="absolute w-[112%] h-[112%] rounded-full border border-white/[0.03] animate-[spin_25s_linear_infinite_reverse] opacity-40 pointer-events-none">
          <div className="absolute w-1 h-1 rounded-full bg-white/60 -bottom-[2px] right-1/2 translate-x-1/2" />
        </div>

        {/* Layer 5: Main core body with glass volume and breathing scaling */}
        <div 
          className={`${sizeClass} rounded-full bg-gradient-to-tr ${bgGradient} border border-white/25 flex items-center justify-center overflow-hidden relative animate-[pulse_6s_ease-in-out_infinite]`}
          style={{ 
            boxShadow: `inset 0 3px 6px rgba(255,255,255,0.45), inset 0 -3px 6px rgba(0,0,0,0.4), 0 8px 20px -3px ${glowColor}`,
          }}
        >
          {/* Ambient high-luminosity overlay layer */}
          <div className="absolute inset-0 bg-white/15 mix-blend-overlay" />
          
          {/* Internal rotating fluid liquid simulation shimmer */}
          <div className="absolute -inset-2 bg-gradient-to-tr from-white/0 via-white/10 to-white/20 mix-blend-color-dodge rotate-12 animate-[spin_8s_linear_infinite] opacity-60" />
          
          {/* Glass light reflection dome (creates incredible 3D glass look) */}
          <div className="w-5 h-2.5 rounded-full bg-gradient-to-b from-white/40 to-white/0 blur-[0.3px] absolute top-[2px] left-[12%] rotate-[15deg] pointer-events-none" />
          
          {/* Internal core heartbeat pulse */}
          <div className="absolute inset-1 rounded-full border border-white/10 animate-[ping_3s_ease-in-out_infinite] opacity-25" />
        </div>
      </div>
    );
  };

  const getConditionName = (cond: WeatherCondition) => {
    switch (cond) {
      case 'sunny': return 'Soleado';
      case 'partly_cloudy': return 'Parcial';
      case 'cloudy': return 'Nublado';
      case 'rain': return 'Lluvia';
      case 'storm': return 'Tormenta';
      case 'wind': return 'Ventoso';
      case 'cold': return 'Fresco';
      case 'hot': return 'Caluroso';
      case 'night': return 'Despejado';
      default: return 'Estable';
    }
  };

  const getRiskLabel = (lvl: RiskLevel) => {
    switch (lvl) {
      case 'critical': return 'Riesgo Crítico';
      case 'high': return 'Riesgo Alto';
      case 'medium': return 'Riesgo Medio';
      case 'low':
      default:
        return 'Riesgo Bajo';
    }
  };

  const getRiskColor = (lvl: RiskLevel) => {
    switch (lvl) {
      case 'critical': return 'text-red-400 bg-red-500/15 border-red-500/20';
      case 'high': return 'text-orange-400 bg-orange-500/15 border-orange-500/20';
      case 'medium': return 'text-amber-400 bg-amber-500/15 border-amber-500/20';
      case 'low':
      default:
        return 'text-emerald-400 bg-emerald-500/15 border-emerald-500/20';
    }
  };

  // Reactive glassmorphism container helper
  const getWidgetBgClass = (cond: WeatherCondition) => {
    // Elegant translucent dark frosted feel with weather-reactive color backdrops
    let baseStyle = 'backdrop-blur-2xl border transition-all duration-500 shadow-2xl relative overflow-hidden';
    
    if (cond === 'storm') {
      return `${baseStyle} border-purple-500/25 shadow-[0_20px_50px_rgba(139,92,246,0.22)]`;
    }
    if (cond === 'rain') {
      return `${baseStyle} border-blue-400/25 shadow-[0_20px_50px_rgba(37,99,235,0.22)]`;
    }
    if (cond === 'cold') {
      return `${baseStyle} border-cyan-400/25 shadow-[0_20px_50px_rgba(6,182,212,0.22)]`;
    }
    if (cond === 'hot') {
      return `${baseStyle} border-red-500/25 shadow-[0_20px_50px_rgba(239,68,68,0.22)]`;
    }
    if (cond === 'sunny' || cond === 'night') {
      return `${baseStyle} border-amber-500/25 shadow-[0_20px_50px_rgba(245,158,11,0.18)]`;
    }
    if (cond === 'wind') {
      return `${baseStyle} border-teal-500/25 shadow-[0_20px_50px_rgba(20,184,166,0.18)]`;
    }
    return `${baseStyle} border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.55)]`;
  };

  // 1. SkyOrb Mini 2x2
  const SkyOrbMiniWidget = () => (
    <div className="w-[160px] h-[160px] rounded-full bg-gradient-to-br from-slate-900/60 to-zinc-950/95 border border-cyan-400/30 flex flex-col items-center justify-center text-center relative select-none shadow-[0_0_36px_rgba(6,182,212,0.2)] group transition-all duration-300 hover:scale-[1.04]">
      <WidgetBackgroundOverlay condition={current.condition} transparency={transparency} />
      {renderWidgetCoreSphere(current.condition, "w-20 h-20")}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
        <span className="text-xl font-display font-black text-white bg-slate-950/60 px-2 py-0.5 rounded-full border border-white/10 shadow-lg translate-y-12 leading-none">
          {current.temperatureC}°
        </span>
      </div>
      {/* Tiny clean badge top */}
      <span className="absolute top-2.5 text-[7px] font-mono tracking-widest text-cyan-400 font-extrabold z-20">MINI ORB</span>
    </div>
  );

  // 2. SkyPanel 4x2
  const SkyPanelWidget = () => {
    const liveSummary = activeProfile === 'person' ? analysis.personSummary : analysis.technicalSummary;
    return (
      <div className="w-full max-w-[360px] rounded-[32px] bg-[#030712]/90 border border-cyan-500/15 p-5 flex items-stretch gap-4 relative overflow-hidden select-none shadow-[0_0_24px_rgba(34,211,238,0.08)] group transition-all duration-300 hover:scale-[1.02]">
        <WidgetBackgroundOverlay condition={current.condition} transparency={transparency} />
        {/* Neon vertical accent line */}
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-cyan-400 to-purple-500" />
        
        {/* Left column: Sphere + Temp */}
        <div className="flex flex-col items-center justify-center gap-2 bg-white/[0.02] border border-white/[0.04] p-3 rounded-2xl z-10 min-w-[100px]">
          {renderWidgetCoreSphere(current.condition, "w-11 h-11")}
          <span className="text-2xl font-display font-black text-white leading-none mt-1">{current.temperatureC}°C</span>
          <span className="text-[8px] font-mono text-cyan-300 font-bold uppercase">{getConditionName(current.condition)}</span>
        </div>

        {/* Right column: Content details */}
        <div className="flex-1 flex flex-col justify-between text-left z-10">
          <div className="flex items-center justify-between">
            <span className="text-[8.5px] font-mono font-extrabold text-white/50 tracking-wider">SKYPANEL v1.0.6</span>
            <span className="text-[7.5px] font-sans font-black text-cyan-400">{locationName.toUpperCase()}</span>
          </div>

          <p className="text-[10px] text-slate-100 font-sans font-semibold leading-relaxed border-l border-cyan-400 pl-2 my-1 line-clamp-2">
            "{liveSummary || 'Ventana horaria favorable detectada para trabajos en terreno.'}"
          </p>

          <div className="flex items-center justify-between text-[7.5px] font-mono text-slate-400/80 border-t border-white/5 pt-1.5 mt-1">
            <span>VENTANA: {analysis.bestWindow ? `${analysis.bestWindow.startTime}–${analysis.bestWindow.endTime}` : 'Variable'}</span>
            <span className="text-cyan-400 font-black">ACTIVE</span>
          </div>
        </div>
      </div>
    );
  };

  // 3. Field Command 4x4
  const FieldCommandWidget = () => {
    const mainRec = analysis.recommendations[0]?.message || 'Siga los protocolos estándar de terreno.';
    const isApt = analysis.globalDecision === 'optimal' || analysis.globalDecision === 'favorable';
    return (
      <div className="w-full max-w-[340px] rounded-[38px] bg-gradient-to-br from-slate-950 via-[#0a0f1d] to-black border border-amber-500/30 p-5.5 flex flex-col gap-3.5 shadow-[0_0_32px_rgba(245,158,11,0.12)] select-none text-left relative overflow-hidden group transition-all duration-300 hover:scale-[1.01]">
        <WidgetBackgroundOverlay condition={current.condition} transparency={transparency} />
        
        {/* Tech grid texture overlay */}
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-2.5 z-10">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-amber-500/10 border border-amber-500/30 animate-pulse">
              <HardHat className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div>
              <span className="text-[7.5px] font-mono text-amber-400 uppercase tracking-widest block font-black">HSE OPERATIVE FIELD</span>
              <span className="text-[12px] font-sans font-black text-white mt-0.5 block tracking-wide">{locationName.toUpperCase()}</span>
            </div>
          </div>
          <span className="text-[7.5px] font-mono text-white/40 bg-white/5 px-2 py-0.5 rounded-md border border-white/10 font-bold uppercase shrink-0">HSE TERMINAL</span>
        </div>

        {/* Safety grid */}
        <div className="grid grid-cols-2 gap-2.5 z-10">
          <div className={`p-2.5 rounded-xl border ${isApt ? 'border-emerald-500/25 bg-emerald-500/5 text-emerald-400' : 'border-amber-500/25 bg-amber-500/5 text-amber-400'} flex flex-col justify-between`}>
            <span className="text-[7px] font-mono text-white/50 uppercase leading-none">Índice Operativo</span>
            <span className="text-[11px] font-display font-black mt-1 uppercase">{getDecisionLabel(analysis.globalDecision)}</span>
          </div>
          <div className="p-2.5 rounded-xl border border-white/10 bg-white/5 flex flex-col justify-between">
            <span className="text-[7px] font-mono text-white/50 leading-none uppercase">Establecimiento</span>
            <span className="text-[11px] font-display font-black text-white mt-1">{current.temperatureC}°C / Sens. {current.feelsLikeC}°</span>
          </div>
        </div>

        {/* Center operational window capsule */}
        <div className="bg-[#0b1020]/80 border border-white/5 p-3 rounded-2xl flex items-center justify-between gap-3 z-10">
          <div className="flex items-center gap-2.5">
            {renderWidgetCoreSphere(current.condition, "w-9 h-9")}
            <div>
              <span className="text-[9px] font-sans font-black text-slate-100 block">PARÁMETROS LOCALES</span>
              <span className="text-[7.5px] font-mono text-slate-400 block mt-0.5">SINCRO INMEDIATA</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[7px] font-mono text-white/40 block">VENTANA SEGURA</span>
            <span className="text-[10px] font-mono font-black text-amber-400 block mt-0.5">{analysis.bestWindow ? `${analysis.bestWindow.startTime}–${analysis.bestWindow.endTime}` : 'N/A'}</span>
          </div>
        </div>

        {/* Technical specs grid */}
        <div className="grid grid-cols-3 gap-2 text-center z-10">
          <div className="bg-white/5 p-1.5 rounded-xl border border-white/[0.04] flex flex-col justify-center">
            <span className="text-[6.5px] font-mono text-white/40 block uppercase">Viento</span>
            <span className="text-xs font-display font-black text-white mt-0.5 block">{current.windSpeedKmh} km/h</span>
          </div>
          <div className="bg-white/5 p-1.5 rounded-xl border border-white/[0.04] flex flex-col justify-center">
            <span className="text-[6.5px] font-mono text-white/40 block uppercase">UV Max</span>
            <span className="text-xs font-display font-black text-amber-400 mt-0.5 block">{current.uvIndex} UV</span>
          </div>
          <div className="bg-white/5 p-1.5 rounded-xl border border-white/[0.04] flex flex-col justify-center">
            <span className="text-[6.5px] font-mono text-white/40 block uppercase">Humedad</span>
            <span className="text-xs font-display font-black text-cyan-400 mt-0.5 block">{current.humidity}%</span>
          </div>
        </div>

        {/* HSE instructions capsule */}
        <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/15 z-10">
          <span className="text-[8px] font-mono text-amber-400 uppercase tracking-wider block font-bold">Protocolo de Prevención Terreno</span>
          <p className="text-[9.5px] text-white/90 leading-relaxed mt-1 font-sans font-semibold">
            "{mainRec}"
          </p>
        </div>
      </div>
    );
  };

  // 4. Cinematic Weather Bar 5x2
  const CinematicWeatherBarWidget = () => {
    const liveSummary = activeProfile === 'person' ? analysis.personSummary : analysis.technicalSummary;
    return (
      <div className="w-full max-w-[430px] rounded-[28px] bg-[#030610]/95 border border-cyan-400/25 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden select-none shadow-[0_0_32px_rgba(6,182,212,0.15)] group transition-all duration-300 hover:scale-[1.01]">
        <WidgetBackgroundOverlay condition={current.condition} transparency={transparency} />
        
        {/* Glow point */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-cyan-500/[0.05] rounded-full blur-2xl pointer-events-none" />

        {/* Left segment: Sphere + Temperature display */}
        <div className="flex items-center gap-3.5 bg-white/[0.03] border border-white/5 px-3 py-2 rounded-2xl shrink-0 z-10 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-2.5">
            {renderWidgetCoreSphere(current.condition, "w-10 h-10")}
            <div className="text-left">
              <span className="text-[7.5px] font-mono text-cyan-400 tracking-wider uppercase block font-black">ORBI CORE</span>
              <span className="text-[10px] font-sans font-black text-slate-200 uppercase leading-none block">{locationName}</span>
            </div>
          </div>
          <span className="text-3xl font-display font-black text-white tracking-tighter leading-none">{current.temperatureC}°</span>
        </div>

        {/* Middle segment: AI Recommendation & Condition */}
        <div className="flex-1 text-left px-1.5 z-10 w-full">
          <div className="flex items-center gap-1.5">
            <span className="text-[7.5px] font-mono font-black text-cyan-400 bg-cyan-500/15 px-1.5 py-0.2 rounded-sm uppercase tracking-widest leading-none">ORBI IA</span>
            <span className="text-[10.5px] font-sans font-bold text-white/80 capitalize">{getConditionName(current.condition)}</span>
          </div>
          <p className="text-[10.5px] text-white font-sans font-bold leading-relaxed tracking-wide mt-1.5 line-clamp-2">
            "{liveSummary || 'Ventana horaria óptima para tus actividades al aire libre.'}"
          </p>
        </div>

        {/* Right segment: Tiny risk indicator */}
        <div className="shrink-0 flex items-center justify-center bg-white/[0.02] border border-white/5 px-2.5 py-2 rounded-xl z-10 self-stretch justify-self-stretch sm:w-auto w-full">
          <span className={`text-[8px] font-mono px-2 py-1 rounded font-black uppercase tracking-wider ${getRiskColor(analysis.globalRiskLevel)}`}>
            {getRiskLabel(analysis.globalRiskLevel)}
          </span>
        </div>
      </div>
    );
  };

  // 5. SkyOrb 2x2 Snapshot Widget
  const SkyOrb2x2Widget = () => {
    const badgeText = getSourceBadgeText();
    return (
      <div className="w-[170px] h-[170px] rounded-[36px] bg-[#030712]/80 border border-cyan-500/20 backdrop-blur-xl p-4 flex flex-col items-center justify-between relative overflow-hidden select-none shadow-[0_0_24px_rgba(34,211,238,0.1)] group transition-all duration-300 hover:scale-[1.03]">
        <WidgetBackgroundOverlay condition={current.condition} transparency={transparency} />
        <WidgetClimateBackground condition={current.condition} enabled={showClimateEffects} />
        {/* Glow halo */}
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
        
        {/* Status Badge */}
        <div className="flex justify-between items-center w-full z-10">
          <span className="text-[8px] font-mono tracking-widest text-cyan-400 font-extrabold">SKYORB</span>
          <span className={`text-[7px] font-mono px-1.5 py-0.5 rounded-md border font-extrabold uppercase scale-90 ${getSourceBadgeClass()}`}>
            {badgeText}
          </span>
        </div>

        {/* Sphere & Temp */}
        <div className="flex flex-col items-center my-auto z-10 gap-1.5">
          {renderWidgetCoreSphere(current.condition, "w-14 h-14")}
          <div className="flex flex-col items-center">
            <span className="text-3xl font-display font-black text-white tracking-tighter leading-none">
              {current.temperatureC}°
            </span>
            <span className="text-[9.5px] font-sans font-extrabold text-cyan-300 uppercase tracking-wider leading-none mt-1">
              {getConditionName(current.condition)}
            </span>
          </div>
        </div>

        {/* Bottom Tag */}
        <div className="w-full text-center z-10">
          <span className="text-[8px] font-mono text-white/45 tracking-widest uppercase">
            {locationName}
          </span>
        </div>
      </div>
    );
  };

  // 6. SkyOrb 4x2 Snapshot Widget
  const SkyOrb4x2Widget = () => {
    return (
      <div className="w-full max-w-[340px] h-[170px] rounded-[36px] bg-[#030712]/85 border border-purple-500/20 backdrop-blur-xl p-4.5 flex flex-col justify-between relative overflow-hidden select-none shadow-[0_0_32px_rgba(139,92,246,0.12)] group transition-all duration-300 hover:scale-[1.02]">
        <WidgetBackgroundOverlay condition={current.condition} transparency={transparency} />
        <WidgetClimateBackground condition={current.condition} enabled={showClimateEffects} />
        {/* Beautiful cyber gradient mesh */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-purple-500/10 via-cyan-500/5 to-transparent pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between z-10">
          <span className="text-[9px] font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 tracking-wider uppercase">ORBI SKYORB PANEL</span>
          <span className={`text-[7px] font-mono px-2 py-0.5 rounded-md border font-extrabold uppercase ${getSourceBadgeClass()}`}>
            {getSourceBadgeText()}
          </span>
        </div>

        {/* Main split row: Left sphere, middle text, right mini-bubbles */}
        <div className="flex items-center justify-between gap-3 my-auto z-10">
          {/* Left: Climate Orb */}
          <div className="flex items-center justify-center">
            {renderWidgetCoreSphere(current.condition, "w-16 h-16")}
          </div>

          {/* Middle: Temperature and condition name */}
          <div className="flex-1 flex flex-col justify-center text-left pl-1">
            <span className="text-4xl font-display font-black text-white tracking-tighter leading-none">
              {current.temperatureC}°C
            </span>
            <span className="text-xs font-sans font-extrabold text-purple-300 tracking-wide mt-1 capitalize">
              {getConditionName(current.condition)}
            </span>
            <span className="text-[8.5px] font-mono text-white/50 block mt-1 truncate max-w-[100px]">
              {locationName.toUpperCase()}
            </span>
          </div>

          {/* Right: Three small horizontal/vertical cyber capsules (Viento, Lluvia, Humedad) with neon touch */}
          <div className="flex flex-col gap-1.5 min-w-[75px]">
            {/* Wind capsule */}
            <div className="flex items-center justify-between bg-white/[0.04] border border-white/[0.03] px-2 py-1 rounded-xl">
              <span className="text-[7px] font-mono text-purple-300 font-bold uppercase">VIEN</span>
              <span className="text-[9.5px] font-sans font-bold text-white">{current.windSpeedKmh}k</span>
            </div>
            {/* Rain probability capsule */}
            <div className="flex items-center justify-between bg-white/[0.04] border border-white/[0.03] px-2 py-1 rounded-xl">
              <span className="text-[7px] font-mono text-cyan-300 font-bold uppercase">RAIN</span>
              <span className="text-[9.5px] font-sans font-bold text-white">{current.precipitationMm > 0 ? "100%" : "0%"}</span>
            </div>
            {/* Humidity capsule */}
            <div className="flex items-center justify-between bg-white/[0.04] border border-white/[0.03] px-2 py-1 rounded-xl">
              <span className="text-[7px] font-mono text-white/45 font-bold uppercase">HUMD</span>
              <span className="text-[9.5px] font-sans font-bold text-white">{current.humidity}%</span>
            </div>
          </div>
        </div>

        {/* Bottom text */}
        <div className="flex justify-between items-center text-[8px] font-mono text-white/40 border-t border-white/5 pt-2 z-10">
          <span>SENSACIÓN: {current.feelsLikeC}°C</span>
          <span className="text-purple-400 font-black">ORBI CYAN/VIOLET™</span>
        </div>
      </div>
    );
  };

  // Helper for 4x4 bubbles
  const RenderOrbitalBubble = ({ title, value, subtext, icon: IconComponent, colorClass }: { title: string; value: string; subtext: string; icon: any; colorClass: string }) => (
    <div className="flex flex-col items-center justify-center bg-white/[0.03] border border-white/[0.04] rounded-2xl p-2 w-[72px] text-center shadow-lg">
      <div className={`p-1.5 rounded-full bg-white/[0.03] mb-1`}>
        <IconComponent className={`w-3.5 h-3.5 ${colorClass}`} />
      </div>
      <span className="text-[7px] font-mono text-white/40 font-bold uppercase tracking-wider">{title}</span>
      <span className="text-[10px] font-sans font-black text-white mt-0.5">{value}</span>
      <span className="text-[6.5px] font-mono text-slate-400/80 leading-none mt-0.5">{subtext}</span>
    </div>
  );

  // 7. SkyOrb 4x4 Snapshot Widget
  const SkyOrb4x4Widget = () => {
    const badgeText = getSourceBadgeText();
    return (
      <div className="w-full max-w-[340px] min-h-[340px] rounded-[42px] bg-[#030612] border border-cyan-500/30 backdrop-blur-2xl p-5 flex flex-col justify-between relative overflow-hidden select-none shadow-[0_0_40px_rgba(34,211,238,0.18)] group transition-all duration-300 hover:scale-[1.01]">
        <WidgetBackgroundOverlay condition={current.condition} transparency={transparency} />
        <WidgetClimateBackground condition={current.condition} enabled={showClimateEffects} />
        
        {/* Glow ring backing */}
        <div className="absolute inset-0 bg-radial-gradient from-cyan-500/5 via-purple-500/3 to-transparent pointer-events-none" />

        {/* 1. Premium Header Row */}
        <div className="flex items-center justify-between z-10 border-b border-white/5 pb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-sans font-extrabold text-white">ORBI Clima IA</span>
            <span className="text-[8px] font-mono font-black text-cyan-400 bg-cyan-500/10 px-1.5 py-0.2 rounded-sm border border-cyan-500/10">v1.0.6</span>
          </div>
          <span className={`text-[7.5px] font-mono px-2 py-0.5 rounded-md border font-extrabold uppercase ${getSourceBadgeClass()}`}>
            {badgeText}
          </span>
        </div>

        {/* 2. Symmetric Orbital Grid (Left, Centerpiece, Right) */}
        <div className="flex items-center justify-between gap-2 my-auto z-10">
          
          {/* LEFT COLUMN: Lluvia & Viento */}
          <div className="flex flex-col gap-3">
            <RenderOrbitalBubble
              title="LLUVIA"
              value={`${current.precipitationMm > 0 ? "100" : "15"}%`}
              subtext="Probab."
              icon={CloudRain}
              colorClass="text-cyan-400"
            />
            <RenderOrbitalBubble
              title="VIENTO"
              value={`${current.windSpeedKmh} km/h`}
              subtext="Velocidad"
              icon={Wind}
              colorClass="text-purple-400"
            />
          </div>

          {/* CENTER COLUMN: Giant Sphere, Temp, Condition, Location */}
          <div className="flex-1 flex flex-col items-center text-center px-1">
            {renderWidgetCoreSphere(current.condition, "w-18 h-18")}
            <span className="text-3xl font-display font-black text-white tracking-tighter leading-none mt-2.5">
              {current.temperatureC}°
            </span>
            <span className="text-[10px] font-sans font-bold text-slate-300 uppercase tracking-wide mt-1">
              {getConditionName(current.condition)}
            </span>
            <span className="text-[10px] font-sans font-black text-cyan-400 block tracking-wider mt-0.5 truncate max-w-[120px]">
              {locationName.toUpperCase()}
            </span>
            <span className="text-[7.5px] font-mono text-white/40 block mt-1">
              Sensación {current.feelsLikeC}° • UV {current.uvIndex}
            </span>
          </div>

          {/* RIGHT COLUMN: Humedad & Forecast Mañana */}
          <div className="flex flex-col gap-3">
            <RenderOrbitalBubble
              title="HUMEDAD"
              value={`${current.humidity}%`}
              subtext="Normal"
              icon={Cloud}
              colorClass="text-cyan-400"
            />
            <RenderOrbitalBubble
              title="MAÑANA"
              value={`${hourly[1]?.temperatureC || current.temperatureC + 2}°C`}
              subtext="Estable"
              icon={Sun}
              colorClass="text-amber-400"
            />
          </div>

        </div>

        {/* 3. Bottom Cinematic AI narrative capsule */}
        <div className="bg-[#0b1020]/90 border border-white/5 rounded-2xl p-2.5 flex items-center gap-2 z-10 shadow-inner">
          <span className="text-[7px] font-mono font-black text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20 shrink-0">ORBI IA</span>
          <span className="text-[9px] text-slate-200 font-sans font-semibold truncate flex-1 leading-none">
            {shortNarrative || "Operaciones estables. Ventana favorable recomendada para la jornada."}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col gap-5 animate-fade-in" id="orbi-sky-widget-preview-section">
      {/* Title & Description */}
      <div className="flex flex-col gap-1 border-b border-white/5 pb-2">
        <div className="flex items-center gap-2">
          <Smartphone className="text-cyan-400 w-4.5 h-4.5" />
          <h3 className="text-sm font-sans font-bold text-white uppercase tracking-wider">
            ORBI SkyOrb Widget™ Previews
          </h3>
        </div>
        <p className="text-xs text-white/50 leading-relaxed">
          Widgets premium ORBI SkyOrb listos para Android. Algunas variantes usan vista previa visual y versión nativa optimizada.
        </p>
      </div>

      {/* 🚀 NUEVA GENERACIÓN PREMIUM */}
      <div className="flex flex-col gap-4 border border-cyan-500/20 bg-cyan-950/5 p-4 md:p-6 rounded-[32px] shadow-[inset_0_2px_12px_rgba(34,211,238,0.05)] text-left">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-[8px] md:text-[9px] font-mono font-black bg-cyan-500 text-slate-950 px-2 py-0.5 rounded-sm tracking-widest uppercase">
              NUEVA GENERACIÓN PREMIUM
            </span>
            <span className="text-[8.5px] md:text-[9.5px] font-mono font-bold text-cyan-400">v1.0.6A-FIX4H</span>
          </div>
          <h2 className="text-base md:text-lg font-display font-black text-white tracking-wide mt-1">
            ORBI SkyOrb Command Premium
          </h2>
          <p className="text-[11.5px] text-slate-400 leading-relaxed max-w-xl">
            Inspirado en la órbita celeste de precisión radial. Integra una gran esfera climática central y burbujas de estado flotantes suspendidas sobre anillos concéntricos fluorescentes.
          </p>
        </div>

        {/* Central Display Container */}
        <div className="flex justify-center items-center p-1 md:p-3 bg-slate-950/20 rounded-[48px] border border-white/5 relative overflow-hidden">
          {/* Neon radial backdrop shadow */}
          <div className="absolute w-[300px] h-[300px] rounded-full bg-cyan-500/5 blur-[90px] pointer-events-none" />
          
          <OrbiSkyOrbCommandPremiumPreview
            current={current}
            hourly={hourly}
            locationName={locationName}
            activeProfile={activeProfile}
            transparency={transparency}
            showClimateEffects={showClimateEffects}
          />
        </div>
      </div>

      {/* 🔮 WIDGETS CLÁSICOS (LEGACY) */}
      <div className="flex flex-col gap-4 mt-4 border-t border-white/5 pt-6 text-left">
        <div className="flex flex-col gap-1.5 mb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[8px] md:text-[9px] font-mono font-bold text-slate-500 tracking-wider uppercase border border-slate-500/20 px-2 py-0.5 rounded">
              WIDGETS CLÁSICOS (LEGACY)
            </span>
          </div>
          <h3 className="text-xs md:text-sm font-sans font-black text-slate-300 uppercase tracking-wider">
            Simulador de Widgets Clásicos
          </h3>
          <p className="text-[11px] text-slate-500">
            Nuestros diseños anteriores de widgets, disponibles como variantes clásicas secundarias de menor resolución visual.
          </p>
        </div>

      {/* Widget Tabs selectors */}
      <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-1.5">
        <button
          onClick={() => setSelectedWidget('skyorb_2x2')}
          className={`px-1.5 py-2 rounded-xl text-[10px] sm:text-[11px] md:text-xs font-sans border transition-all text-center flex flex-col items-center justify-center gap-0.5 cursor-pointer select-none ${
            selectedWidget === 'skyorb_2x2'
              ? 'bg-cyan-500/10 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.15)] font-bold'
              : 'bg-white/5 border-white/5 hover:bg-white/10 text-white/60'
          }`}
        >
          <span className="flex items-center gap-0.5 flex-wrap justify-center font-bold tracking-tight leading-tight">
            SkyOrb 2x2 
            <span className="text-[7.5px] bg-cyan-500 text-slate-950 px-1 rounded-sm font-sans font-extrabold leading-none py-0.5">NEW</span>
          </span>
          <span className="text-[8px] sm:text-[8.5px] opacity-50 font-normal tracking-tighter leading-none">Snapshot Mini</span>
        </button>

        <button
          onClick={() => setSelectedWidget('skyorb_4x2')}
          className={`px-1.5 py-2 rounded-xl text-[10px] sm:text-[11px] md:text-xs font-sans border transition-all text-center flex flex-col items-center justify-center gap-0.5 cursor-pointer select-none ${
            selectedWidget === 'skyorb_4x2'
              ? 'bg-cyan-500/10 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.15)] font-bold'
              : 'bg-white/5 border-white/5 hover:bg-white/10 text-white/60'
          }`}
        >
          <span className="flex items-center gap-0.5 flex-wrap justify-center font-bold tracking-tight leading-tight">
            SkyOrb 4x2 
            <span className="text-[7.5px] bg-cyan-500 text-slate-950 px-1 rounded-sm font-sans font-extrabold leading-none py-0.5">NEW</span>
          </span>
          <span className="text-[8px] sm:text-[8.5px] opacity-50 font-normal tracking-tighter leading-none">Snapshot Panel</span>
        </button>

        <button
          onClick={() => setSelectedWidget('skyorb_4x4')}
          className={`px-1.5 py-2 rounded-xl text-[10px] sm:text-[11px] md:text-xs font-sans border transition-all text-center flex flex-col items-center justify-center gap-0.5 cursor-pointer select-none ${
            selectedWidget === 'skyorb_4x4'
              ? 'bg-cyan-500/10 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.15)] font-bold'
              : 'bg-white/5 border-white/5 hover:bg-white/10 text-white/60'
          }`}
        >
          <span className="flex items-center gap-0.5 flex-wrap justify-center font-bold tracking-tight leading-tight">
            SkyOrb 4x4 
            <span className="text-[7.5px] bg-cyan-500 text-slate-950 px-1 rounded-sm font-sans font-extrabold leading-none py-0.5">NEW</span>
          </span>
          <span className="text-[8px] sm:text-[8.5px] opacity-50 font-normal tracking-tighter leading-none">Snapshot Premium</span>
        </button>

        <button
          onClick={() => setSelectedWidget('skyorb_mini')}
          className={`px-1.5 py-2 rounded-xl text-[10px] sm:text-[11px] md:text-xs font-sans border transition-all text-center flex flex-col items-center justify-center gap-0.5 cursor-pointer select-none ${
            selectedWidget === 'skyorb_mini'
              ? 'bg-cyan-500/10 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.15)] font-bold'
              : 'bg-white/5 border-white/5 hover:bg-white/10 text-white/60'
          }`}
        >
          <span className="font-bold tracking-tight leading-tight">SkyOrb Mini</span>
          <span className="text-[8px] sm:text-[8.5px] opacity-50 font-normal tracking-tighter leading-none">Tamaño 2x2</span>
        </button>

        <button
          onClick={() => setSelectedWidget('skypanel')}
          className={`px-1.5 py-2 rounded-xl text-[10px] sm:text-[11px] md:text-xs font-sans border transition-all text-center flex flex-col items-center justify-center gap-0.5 cursor-pointer select-none ${
            selectedWidget === 'skypanel'
              ? 'bg-cyan-500/10 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.15)] font-bold'
              : 'bg-white/5 border-white/5 hover:bg-white/10 text-white/60'
          }`}
        >
          <span className="font-bold tracking-tight leading-tight">SkyPanel</span>
          <span className="text-[8px] sm:text-[8.5px] opacity-50 font-normal tracking-tighter leading-none">Tamaño 4x2</span>
        </button>

        <button
          onClick={() => setSelectedWidget('field_command')}
          className={`px-1.5 py-2 rounded-xl text-[10px] sm:text-[11px] md:text-xs font-sans border transition-all text-center flex flex-col items-center justify-center gap-0.5 cursor-pointer select-none ${
            selectedWidget === 'field_command'
              ? 'bg-cyan-500/10 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.15)] font-bold'
              : 'bg-white/5 border-white/5 hover:bg-white/10 text-white/60'
          }`}
        >
          <span className="font-bold tracking-tight leading-tight">Field Command</span>
          <span className="text-[8px] sm:text-[8.5px] opacity-50 font-normal tracking-tighter leading-none">Tamaño 4x4</span>
        </button>

        <button
          onClick={() => setSelectedWidget('cinematic_bar')}
          className={`px-1.5 py-2 rounded-xl text-[10px] sm:text-[11px] md:text-xs font-sans border transition-all text-center flex flex-col items-center justify-center gap-0.5 cursor-pointer select-none ${
            selectedWidget === 'cinematic_bar'
              ? 'bg-cyan-500/10 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.15)] font-bold'
              : 'bg-white/5 border-white/5 hover:bg-white/10 text-white/60'
          }`}
        >
          <span className="font-bold tracking-tight leading-tight">Cinematic Bar</span>
          <span className="text-[8px] sm:text-[8.5px] opacity-50 font-normal tracking-tighter leading-none">Tamaño 5x2</span>
        </button>
      </div>

      {/* Panel de Personalización de Widgets (Transparency & Weather Effects) */}
      <div className="p-4 rounded-2xl bg-[#090f1e]/80 border border-white/5 space-y-4 text-left">
        <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-sans font-bold text-slate-100 uppercase tracking-wider">Personalización del Widget</span>
          </div>
          <span className="text-[9px] font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">PREMIUM</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Opacidad Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[11px] font-mono">
              <span className="text-slate-400">Transparencia del Fondo:</span>
              <span className="text-cyan-400 font-bold">{100 - transparency}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 font-mono">Opaco</span>
              <input
                type="range"
                min="10"
                max="100"
                value={transparency}
                onChange={(e) => setTransparency(Number(e.target.value))}
                className="flex-1 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 font-mono">Limpio</span>
            </div>
          </div>

          {/* Efecto de Paisaje Climatológico Activo */}
          <div className="flex items-center justify-between bg-white/[0.02] border border-white/[0.04] p-2.5 rounded-xl">
            <div className="space-y-0.5 text-left">
              <span className="text-[11px] font-sans font-bold text-slate-200 block">Paisajes de Fondo Animados</span>
              <span className="text-[9px] font-mono text-slate-500 block">Simulación de clima en tiempo real</span>
            </div>
            <button
              onClick={() => setShowClimateEffects(!showClimateEffects)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-black border transition-all cursor-pointer ${
                showClimateEffects
                  ? 'bg-cyan-500/10 border-cyan-400 text-cyan-300'
                  : 'bg-white/5 border-white/5 text-white/40'
              }`}
            >
              {showClimateEffects ? 'ACTIVOS' : 'APAGADOS'}
            </button>
          </div>
        </div>
      </div>

      {/* Simulated Android Home Screen Workspace */}
      <div className="relative w-full rounded-3xl bg-slate-950 border border-white/10 overflow-hidden shadow-2xl" id="android-desktop-preview">
        {/* Background image/gradient simulation */}
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/70 via-slate-900 to-zinc-950 pointer-events-none z-0" />
        {/* Subtle grid mesh */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.03)_1px,_transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        {/* Android Status Bar */}
        <div className="relative z-10 px-6 py-2 flex items-center justify-between text-[10px] font-mono text-white/50 bg-black/10">
          <span>12:45 PM</span>
          <div className="flex items-center gap-2">
            <span>5G LTE</span>
            <span className="bg-white/30 px-1 py-0.2 rounded text-[8px] text-white">94%</span>
          </div>
        </div>

        {/* Live Widget Showcase Area */}
        <div className="relative z-10 px-6 py-12 flex flex-col items-center justify-center min-h-[260px] max-w-lg mx-auto">
          {selectedWidget === 'skyorb_2x2' && <SkyOrb2x2Widget />}
          {selectedWidget === 'skyorb_4x2' && <SkyOrb4x2Widget />}
          {selectedWidget === 'skyorb_4x4' && <SkyOrb4x4Widget />}
          {selectedWidget === 'skyorb_mini' && <SkyOrbMiniWidget />}
          {selectedWidget === 'skypanel' && <SkyPanelWidget />}
          {selectedWidget === 'field_command' && <FieldCommandWidget />}
          {selectedWidget === 'cinematic_bar' && <CinematicWeatherBarWidget />}

          {/* Android Desktop Search Bar Simulator */}
          <div className="w-full max-w-[280px] bg-white/5 border border-white/10 px-4 py-2 rounded-2xl text-[10px] font-sans text-white/40 mt-10 text-center pointer-events-none">
            Google Search...
          </div>
        </div>

        {/* Home Screen indicator pill */}
        <div className="relative z-10 flex justify-center py-2.5 bg-black/10">
          <div className="w-24 h-1 rounded-full bg-white/20" />
        </div>
      </div>

      {/* Premium End User Widgets Guide */}
      <div className="p-5 rounded-2xl border border-white/5 bg-[#090f1e]/60 flex flex-col gap-4 text-left font-sans" id="widget-user-guide-panel">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-sans font-extrabold text-white uppercase tracking-wider">
                Widgets ORBI
              </h4>
              <p className="text-[10px] text-slate-400 font-sans">
                Lleva el núcleo inteligente de ORBI Clima IA a tu pantalla principal.
              </p>
            </div>
          </div>
          <span className="text-[8px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded uppercase tracking-wider">
            SkyCore™ Link
          </span>
        </div>

        {/* Explicación simple de cómo agregar widgets */}
        <div className="p-4 rounded-xl bg-cyan-950/10 border border-cyan-500/10 flex flex-col gap-2.5">
          <span className="text-[10px] font-mono text-cyan-400 font-black uppercase tracking-wider flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5" /> ¿Cómo agregar un widget al inicio?
          </span>
          <p className="text-xs text-slate-300 leading-normal font-medium">
            Para agregar un widget, mantén presionada la pantalla de inicio de tu dispositivo Android, selecciona <strong className="text-white font-extrabold">Widgets</strong>, busca <strong className="text-white font-extrabold">ORBI Clima IA</strong> en la lista y arrastra tu diseño preferido.
          </p>
        </div>

        {/* Catálogo de Bloques de Widgets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-[#050914] border border-white/5 space-y-1">
            <span className="text-[10px] font-sans font-bold text-white block">Widget Compacto</span>
            <span className="text-[9px] font-mono text-slate-500 uppercase block">Tamaño 2x2 · SkyOrb Mini</span>
            <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
              La esfera climática de diseño líquido junto con la temperatura actual y radiación UV en tiempo real.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-[#050914] border border-white/5 space-y-1">
            <span className="text-[10px] font-sans font-bold text-white block">Resumen Diario</span>
            <span className="text-[9px] font-mono text-slate-500 uppercase block">Tamaño 4x2 · SkyPanel</span>
            <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
              El pronóstico heurístico de hoy resumido, junto con la mejor ventana horaria para planificar tu terreno.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-[#050914] border border-white/5 space-y-1">
            <span className="text-[10px] font-sans font-bold text-white block">Alertas Climáticas</span>
            <span className="text-[9px] font-mono text-slate-500 uppercase block">Tamaño 4x4 · Field Command</span>
            <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
              Para técnicos y operadores de terreno. Muestra riesgos críticos, ráfagas de viento y avisos de seguridad.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-[#050914]/50 border border-white/5 border-dashed space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-sans font-bold text-slate-400 block">Próximamente: SkyOrb Snapshot</span>
              <span className="text-[7.5px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1 py-0.2 rounded uppercase">
                Beta
              </span>
            </div>
            <span className="text-[9px] font-mono text-slate-600 uppercase block">FUTURO ESTILO INTERACTIVO</span>
            <p className="text-[10px] text-slate-500 leading-relaxed font-sans">
              Acceso directo con un solo toque a análisis solar detallado, porcentaje de radiación y alertas dinámicas en Android 14+.
            </p>
          </div>
        </div>

        {/* Estado climático usado por los widgets */}
        <div className="pt-3 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
          <div className="space-y-0.5">
            <span className="text-[9px] font-mono text-slate-500 uppercase block">Estado Climático Sincronizado</span>
            <div className="text-[11px] font-sans font-bold text-slate-200">
              📍 <span className="text-white font-black">{locationName}</span> · <span className="text-cyan-400">{current.temperatureC}°C</span> · <span className="text-slate-300 capitalize">{current.condition === 'sunny' ? 'Soleado' : current.condition === 'partly_cloudy' ? 'Parcial' : current.condition === 'cloudy' ? 'Nublado' : current.condition === 'rain' ? 'Lluvia' : current.condition === 'storm' ? 'Tormenta' : current.condition === 'wind' ? 'Ventoso' : current.condition === 'cold' ? 'Frío' : current.condition === 'hot' ? 'Caluroso' : 'Estable'}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[9.5px] font-mono font-bold text-emerald-400 bg-emerald-500/5 px-2.5 py-1 rounded-lg border border-emerald-500/10 self-start sm:self-center">
            <RefreshCw className="w-3 h-3 animate-spin-slow text-emerald-400" />
            <span>SINCRO EN TIEMPO REAL ACTIVA</span>
          </div>
        </div>

        {/* Developer specifications panel toggles */}
        <div className="border-t border-white/5 pt-3 mt-1 flex flex-col gap-2">
          {(() => {
            const isDevMode = typeof localStorage !== 'undefined' && localStorage.getItem('orbi_clima_developer_mode_enabled_v1') === 'true';
            
            if (isDevMode) {
              return (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-indigo-400 uppercase font-black">
                      🛠️ Modo Desarrollador Activo
                    </span>
                    <button
                      onClick={() => setShowDevSpecs(!showDevSpecs)}
                      className="px-3 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 active:scale-95 border border-indigo-500/20 text-indigo-400 font-bold text-[10.5px] rounded-lg transition-all cursor-pointer font-sans"
                    >
                      {showDevSpecs ? 'Ocultar Contrato & Glance Specs' : 'Ver Contrato JSON & Glance Specs'}
                    </button>
                  </div>

                  {showDevSpecs && (
                    <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-950/10 flex flex-col gap-3 animate-fade-in text-left">
                      <div className="flex items-center gap-2 border-b border-indigo-500/15 pb-2">
                        <Sliders className="w-4 h-4 text-cyan-400" />
                        <h4 className="text-[10.5px] font-mono uppercase tracking-wider text-white font-extrabold">
                          Especificaciones Técnicas de Widget (Android Glance)
                        </h4>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Este contrato visual define la serialización que enviará la aplicación hacia el receptor Glance Widget de Android. Los estados son pre-compilados del motor <strong>ORBI SkyCore™</strong> para evitar consumos de batería excesivos en segundo plano.
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1.5">
                        <div className="p-3 rounded-xl bg-black/30 text-[11px] font-mono text-white/60 flex flex-col gap-1.5">
                          <span className="text-cyan-400 font-bold block">Contrato de Datos JSON (SharedPreferences):</span>
                          <pre className="text-[9.5px] text-cyan-100 overflow-x-auto bg-black/40 p-2.5 rounded-lg leading-normal">
{`{
  "version": "1.1.0",
  "widgetId": "${selectedWidget}",
  "temperatureC": ${current.temperatureC},
  "conditionCode": "${current.condition}",
  "riskLevel": "${analysis.globalRiskLevel}",
  "bestWindow": "${analysis.bestWindow ? `${analysis.bestWindow.startTime}–${analysis.bestWindow.endTime}` : 'N/A'}",
  "orbAssetKey": "${getOrbAssetKey(current.condition)}",
  "weatherMood": "${getOrbAssetKey(current.condition)}",
  "sourceMode": "${getSourceBadgeText().toLowerCase()}",
  "visualTheme": "premium"
}`}
                          </pre>
                        </div>

                        <div className="p-3 rounded-xl bg-black/30 text-[11px] text-white/60 flex flex-col justify-between gap-3">
                          <div>
                            <span className="text-amber-400 font-bold font-mono block mb-1">Guías de Renderizado Glance:</span>
                            <ul className="list-disc pl-4 space-y-1.5 text-xs text-slate-300">
                              <li>Material You Dynamic Coloring habilitado.</li>
                              <li>Esfera climática rasterizada como VectorDrawable.</li>
                              <li>Actualizaciones gatilladas por Alarma cada 30 minutos.</li>
                              <li>Acción directa al presionar: lanza pantalla principal.</li>
                            </ul>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] font-mono text-cyan-400/80 bg-cyan-400/5 p-1 px-2 rounded border border-cyan-400/10">
                            <RefreshCw className="w-3 h-3 animate-spin-slow" />
                            <span>Sincronizado con base local SkyCore™</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            } else {
              return (
                <div className="flex items-center justify-between">
                  <span className="text-[9.5px] font-mono text-slate-600 uppercase">
                    ¿Eres desarrollador?
                  </span>
                  <button
                    onClick={() => alert("💡 Para ver diagramas Glance, contratos JSON y VectorDrawables de este widget, ve a la pestaña Ajustes, activa el Modo Desarrollador ORBI, y desbloquearás las especificaciones completas.")}
                    className="text-[9.5px] font-sans font-bold text-slate-400 hover:text-white flex items-center gap-1 transition-all cursor-pointer bg-white/5 hover:bg-white/10 px-2 py-1 rounded"
                  >
                    Ver especificaciones técnicas de widget
                  </button>
                </div>
              );
            }
          })()}
        </div>
      </div>
      </div>
    </div>
  );
}

import React from 'react';
import { CurrentWeather, HourlyForecast, WeatherCondition, RiskLevel, WeatherProfile } from '../../types/weatherTypes';
import { Sun, CloudSun, Cloud, CloudRain, Wind, Droplets, ShieldAlert, Sparkles, ChevronRight, Moon } from 'lucide-react';

interface OrbiSkyOrbCommandPremiumPreviewProps {
  current: CurrentWeather;
  hourly: HourlyForecast[];
  locationName: string;
  activeProfile: WeatherProfile;
  transparency: number;
  showClimateEffects: boolean;
}

export function OrbiSkyOrbCommandPremiumPreview({
  current,
  hourly,
  locationName,
  activeProfile,
  transparency,
  showClimateEffects,
}: OrbiSkyOrbCommandPremiumPreviewProps) {
  
  // Custom weather mapping for condition-specific premium visuals
  const getConditionStyles = (cond: WeatherCondition) => {
    switch (cond) {
      case 'sunny':
      case 'hot':
        return {
          glow: 'rgba(245, 158, 11, 0.45)',
          glowClass: 'from-amber-500/10 via-amber-600/5 to-transparent',
          sphereGradient: 'from-amber-500 via-orange-500 to-amber-900',
          dotColor: 'bg-amber-300',
          ringColor: 'border-amber-400/20',
          label: 'Soleado',
        };
      case 'rain':
        return {
          glow: 'rgba(37, 99, 235, 0.45)',
          glowClass: 'from-blue-500/10 via-blue-600/5 to-transparent',
          sphereGradient: 'from-blue-500 via-teal-500 to-indigo-950',
          dotColor: 'bg-cyan-300',
          ringColor: 'border-blue-400/20',
          label: 'Lluvia',
        };
      case 'storm':
        return {
          glow: 'rgba(139, 92, 246, 0.45)',
          glowClass: 'from-purple-500/10 via-purple-600/5 to-transparent',
          sphereGradient: 'from-purple-600 via-violet-750 to-indigo-950',
          dotColor: 'bg-cyan-300',
          ringColor: 'border-purple-400/20',
          label: 'Tormenta',
        };
      case 'wind':
        return {
          glow: 'rgba(20, 184, 166, 0.4)',
          glowClass: 'from-teal-500/10 via-teal-600/5 to-transparent',
          sphereGradient: 'from-teal-400 via-slate-500 to-slate-700',
          dotColor: 'bg-teal-200',
          ringColor: 'border-teal-300/20',
          label: 'Ventoso',
        };
      case 'cold':
        return {
          glow: 'rgba(6, 182, 212, 0.45)',
          glowClass: 'from-cyan-500/10 via-cyan-600/5 to-transparent',
          sphereGradient: 'from-cyan-200 via-cyan-400 to-blue-600',
          dotColor: 'bg-white',
          ringColor: 'border-cyan-300/20',
          label: 'Fresco',
        };
      case 'cloudy':
      case 'partly_cloudy':
        return {
          glow: 'rgba(6, 182, 212, 0.4)',
          glowClass: 'from-cyan-500/10 via-purple-500/5 to-transparent',
          sphereGradient: 'from-cyan-500 via-sky-600 to-indigo-950',
          dotColor: 'bg-cyan-200',
          ringColor: 'border-cyan-400/20',
          label: cond === 'cloudy' ? 'Nublado' : 'Parcialmente nublado',
        };
      case 'night':
      default:
        return {
          glow: 'rgba(79, 70, 229, 0.4)',
          glowClass: 'from-indigo-500/10 via-purple-600/5 to-transparent',
          sphereGradient: 'from-indigo-950 via-slate-900 to-black',
          dotColor: 'bg-violet-400',
          ringColor: 'border-indigo-500/20',
          label: 'Despejado',
        };
    }
  };

  const weatherStyles = getConditionStyles(current.condition);

  // Helper for floating orbital bubble rendering
  const OrbitalBubble = ({
    label,
    icon: IconComponent,
    value,
    subtext,
    className = '',
  }: {
    label: string;
    icon: any;
    value: string;
    subtext: string;
    className?: string;
  }) => (
    <div
      className={`absolute w-[78px] h-[78px] xs:w-[84px] xs:h-[84px] md:w-[88px] md:h-[88px] rounded-full bg-[#030712]/90 border border-cyan-400/25 flex flex-col items-center justify-center text-center relative overflow-hidden backdrop-blur-xl shadow-[inset_0_2px_4px_rgba(255,255,255,0.1),0_8px_16px_rgba(0,0,0,0.6)] group transition-all duration-300 hover:scale-[1.08] hover:border-cyan-400/50 z-20 ${className}`}
    >
      {/* Glossy highlight layer */}
      <div className="absolute top-1 left-[20%] w-[60%] h-[20%] rounded-full bg-gradient-to-b from-white/20 to-transparent blur-[0.6px] pointer-events-none" />
      
      {/* Light particle pulse */}
      <div className="absolute inset-0 rounded-full border border-white/5 opacity-40 group-hover:animate-ping pointer-events-none" />
      
      {/* Subtle inner blue gradient */}
      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/5 via-transparent to-white/5 pointer-events-none" />

      {/* Bubble Label */}
      <span className="text-[8px] xs:text-[8.5px] font-sans font-black text-white/60 tracking-wider uppercase leading-none mb-1">
        {label}
      </span>

      {/* Weather Icon / Accent */}
      <div className="p-0.5 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
        <IconComponent className="w-4.5 h-4.5 text-cyan-300 drop-shadow-[0_0_4px_rgba(34,211,238,0.4)]" />
      </div>

      {/* Value */}
      <span className="text-[11px] xs:text-[12px] md:text-[12.5px] font-display font-black text-white mt-0.5 leading-none tracking-tight">
        {value}
      </span>

      {/* Subtext */}
      <span className="text-[7.5px] xs:text-[8px] md:text-[8.5px] font-mono text-slate-400 leading-none mt-1 truncate max-w-[70px]">
        {subtext}
      </span>
    </div>
  );

  return (
    <div className="w-full max-w-[480px] aspect-square rounded-[44px] bg-gradient-to-b from-[#030611] via-[#02050f] to-[#040813] border border-cyan-400/25 p-5 md:p-6 flex flex-col justify-between relative overflow-hidden select-none shadow-[0_0_50px_rgba(6,182,212,0.22)] font-sans">
      
      {/* Glass glossy reflections and overlays */}
      <div className="absolute inset-0 bg-radial-gradient from-cyan-500/10 via-purple-500/5 to-transparent pointer-events-none z-0" />
      
      {/* Outer ambient glow based on current weather condition */}
      <div 
        className="absolute rounded-full blur-[90px] pointer-events-none transition-all duration-700 opacity-25 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2" 
        style={{ 
          width: '80%', 
          height: '80%', 
          backgroundColor: weatherStyles.glow,
        }} 
      />

      {/* Star field stardust simulator (glowing tiny points) */}
      <div className="absolute inset-0 opacity-30 pointer-events-none z-0">
        <div className="absolute w-1 h-1 bg-white rounded-full left-[15%] top-[25%] animate-pulse" />
        <div className="absolute w-0.5 h-0.5 bg-white rounded-full left-[85%] top-[18%] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute w-1 h-1 bg-cyan-300 rounded-full left-[78%] top-[72%] animate-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="absolute w-0.5 h-0.5 bg-white rounded-full left-[22%] top-[82%] animate-pulse" style={{ animationDelay: '0.5s' }} />
        <div className="absolute w-1 h-1 bg-purple-400 rounded-full left-[48%] top-[12%] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header Row: ORBI Logo + Clock */}
      <div className="flex items-center justify-between z-10 border-b border-white/5 pb-2.5 px-1 shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="text-base font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-cyan-400 tracking-wider">
            ORBI
          </span>
          <span className="text-[11px] font-sans font-bold text-cyan-400 tracking-wider">Clima IA <span className="text-cyan-400 animate-pulse">•</span></span>
        </div>
        <div className="text-right flex flex-col items-end">
          <span className="text-[9px] font-mono font-bold text-white/50 uppercase tracking-widest leading-none">
            LUNES, 24 JUN
          </span>
          <span className="text-[13px] font-display font-black text-cyan-300 tracking-tight leading-none mt-1">
            10:42 AM
          </span>
          <span className="text-[7.5px] font-mono text-white/30 block mt-0.5 leading-none">
            Actualizado 10:41 AM
          </span>
        </div>
      </div>

      {/* Radial Grid Arena */}
      <div className="relative flex-1 flex items-center justify-center min-h-[250px] xs:min-h-[280px] md:min-h-[300px] my-2 z-10">
        
        {/* Layer 1: Concentric orbital track rings for futuristic alignment */}
        <div className="absolute w-[86%] h-[86%] rounded-full border border-cyan-400/[0.05] pointer-events-none z-0 animate-[spin_120s_linear_infinite]" />
        
        {/* Animated Dashed Outer Ring */}
        <div className="absolute w-[80%] h-[80%] rounded-full border border-dashed border-cyan-400/[0.12] animate-[spin_80s_linear_infinite] pointer-events-none z-0" />
        
        {/* Thin Inner Ring with glowing particle */}
        <div className="absolute w-[68%] h-[68%] rounded-full border border-cyan-400/15 pointer-events-none z-0 animate-[spin_35s_linear_infinite_reverse]">
          <div className="absolute w-2 h-2 rounded-full bg-cyan-400 -top-1 left-1/2 -translate-x-1/2 shadow-[0_0_12px_rgba(34,211,238,0.9)]" />
        </div>

        {/* Floating Bubble System (5 highly readable and spaced orbital bubbles) */}
        {/* 1. TOP: HOY Forecast */}
        <OrbitalBubble
          label="HOY"
          icon={CloudSun}
          value={`${current.temperatureC}° / 14°`}
          subtext="Hoy"
          className="top-[-4%] left-1/2 -translate-x-1/2"
        />

        {/* 2. TOP-RIGHT: MAR */}
        <OrbitalBubble
          label="MAR"
          icon={Sun}
          value="26° / 15°"
          subtext="Soleado"
          className="top-[15%] right-[1%] xs:right-[3%] md:right-[5%]"
        />

        {/* 3. BOTTOM-RIGHT: HUMEDAD */}
        <OrbitalBubble
          label="HUMEDAD"
          icon={Droplets}
          value={`${current.humidity}%`}
          subtext="Normal"
          className="bottom-[14%] right-[2%] xs:right-[4%] md:right-[6%]"
        />

        {/* 4. BOTTOM-LEFT: LLUVIA */}
        <OrbitalBubble
          label="LLUVIA"
          icon={CloudRain}
          value={`${current.precipitationMm > 0 ? '100%' : '20%'}`}
          subtext="Probabil."
          className="bottom-[14%] left-[2%] xs:left-[4%] md:left-[6%]"
        />

        {/* 5. TOP-LEFT: DOM */}
        <OrbitalBubble
          label="DOM"
          icon={CloudRain}
          value="18° / 12°"
          subtext="Lluvia"
          className="top-[15%] left-[1%] xs:left-[3%] md:left-[5%]"
        />

        {/* --- CENTRAL PIECE: GIANT GLASS WEATHER GLOBE --- */}
        <div className="relative flex items-center justify-center w-[180px] h-[180px] xs:w-[200px] xs:h-[200px] md:w-[215px] md:h-[215px] rounded-full z-10 transition-all duration-300">
          
          {/* Sphere deep shadow backing */}
          <div className="absolute inset-0 rounded-full bg-slate-950/90 pointer-events-none" />

          {/* Central Sphere glass texture and gradient */}
          <div 
            className={`absolute inset-0 rounded-full bg-gradient-to-tr ${weatherStyles.sphereGradient} border border-white/20 shadow-[inset_0_6px_12px_rgba(255,255,255,0.45),inset_0_-6px_12px_rgba(0,0,0,0.8),0_16px_32px_rgba(6,182,212,0.35)] overflow-hidden flex flex-col items-center justify-center text-center p-3`}
          >
            {/* Ambient luminosity filter */}
            <div className="absolute inset-0 bg-white/10 mix-blend-overlay pointer-events-none" />
            
            {/* Shimmer water-sweep animation */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-transparent via-white/15 to-transparent rotate-12 animate-[spin_12s_linear_infinite] opacity-60 pointer-events-none" />
            
            {/* Real 3D Glass Dome reflection arc */}
            <div className="w-[140px] h-[70px] rounded-full bg-gradient-to-b from-white/30 to-transparent blur-[0.8px] absolute top-[4px] left-[15%] rotate-[12deg] pointer-events-none z-10" />

            {/* Weather Icon centered */}
            <div className="mt-1 text-white drop-shadow-[0_3px_6px_rgba(0,0,0,0.6)] z-10 flex items-center justify-center">
              {current.condition === 'sunny' && <Sun className="w-8 h-8 animate-[spin_20s_linear_infinite]" />}
              {current.condition === 'partly_cloudy' && <CloudSun className="w-8 h-8" />}
              {current.condition === 'cloudy' && <Cloud className="w-8 h-8" />}
              {current.condition === 'rain' && <CloudRain className="w-8 h-8" />}
              {current.condition === 'storm' && <ShieldAlert className="w-8 h-8 text-purple-200" />}
              {current.condition === 'wind' && <Wind className="w-8 h-8 text-teal-200" />}
              {current.condition === 'cold' && <Cloud className="w-8 h-8 text-cyan-200" />}
              {current.condition === 'hot' && <Sun className="w-8 h-8 text-orange-200" />}
              {current.condition === 'night' && <Moon className="w-8 h-8 text-indigo-200" />}
            </div>

            {/* Giant Temp Display */}
            <span className="text-4xl xs:text-5xl md:text-5xl font-display font-black text-white tracking-tighter leading-none mt-1.5 drop-shadow-[0_4px_8px_rgba(0,0,0,0.7)] z-10 select-none">
              {current.temperatureC}°
            </span>

            {/* Condition label inside */}
            <span className="text-[10px] xs:text-[11px] font-sans font-black text-white/95 uppercase tracking-widest leading-none mt-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] z-10 px-1 truncate max-w-[150px]">
              {weatherStyles.label}
            </span>

            {/* Location inside sphere (Cyan Glow) */}
            <span className="text-[10px] xs:text-[11px] font-sans font-black text-cyan-300 uppercase tracking-wide mt-1.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] z-10 px-2 truncate max-w-[160px]">
              {locationName}
            </span>

            {/* Sensación inside sphere */}
            <span className="text-[8px] xs:text-[8.5px] font-mono text-slate-300 mt-1 leading-none drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.6)] z-10">
              Sensación {current.feelsLikeC}°
            </span>

            {/* Divider line inside sphere */}
            <div className="w-[50%] h-[1px] bg-white/15 my-2 z-10 pointer-events-none" />

            {/* UV Index inside sphere */}
            <div className="flex flex-col items-center justify-center z-10">
              <span className="text-[7.5px] xs:text-[8px] font-mono text-white/70 uppercase tracking-wider leading-none">
                Índice UV
              </span>
              <span className="text-[9px] xs:text-[9.5px] font-black text-amber-400 mt-0.5 leading-none">
                {current.uvIndex} Alto
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Center Details Capsule - Clean and Minimal */}
      <div className="flex flex-col items-center justify-center text-center z-10 mb-1.5 shrink-0 pointer-events-none">
        <span className="text-[8px] font-mono text-cyan-400 tracking-wider uppercase bg-cyan-950/60 px-2 py-0.5 rounded-sm border border-cyan-500/15 leading-none">
          GPS ACTIVE • REAL-TIME DATA
        </span>
      </div>

      {/* Bottom Row: AI ORBI Recommendation Bar */}
      <div className="flex flex-col gap-1.5 z-10 shrink-0">
        <div className="flex items-center justify-between bg-gradient-to-r from-cyan-950/40 via-slate-950/85 to-cyan-950/40 border border-cyan-500/25 rounded-full px-4 py-2.5 text-[10px] text-slate-100 hover:border-cyan-400/45 transition-all cursor-pointer">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="font-mono font-black text-cyan-400">ORBI IA</span>
            <span className="font-sans font-semibold text-white/90 line-clamp-1 text-[10px] xs:text-[10.5px]">
              Cielos parcialmente nublados el resto del día. Máx. 24°.
            </span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
        </div>
        
        {/* Footer Signature */}
        <div className="flex items-center justify-between text-[7px] font-mono text-white/30 px-1 mt-0.5">
          <span>ORBI SkyCore™ Engine</span>
          <span>v1.0.6A-FIX4H</span>
        </div>
      </div>

    </div>
  );
}

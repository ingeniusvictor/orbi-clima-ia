import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WeatherCondition } from '../types/weatherTypes';
import { 
  Sun, CloudSun, Cloud, CloudRain, Wind, Snowflake, Flame, Moon, Zap, Eye, HelpCircle, AlertTriangle 
} from 'lucide-react';
import { getFxQuality, FxQuality } from './FxQualitySettingsCard';

interface OrbiClimateCoreProps {
  condition: WeatherCondition | 'fog' | string;
  temperature: number;
  feelsLike: number;
  isLoading?: boolean;
}

export default function OrbiClimateCore({ condition, temperature, feelsLike, isLoading }: OrbiClimateCoreProps) {
  const [fxQuality, setFxQuality] = useState<FxQuality>(() => getFxQuality());

  useEffect(() => {
    const handleFxChange = (e: Event) => {
      const customEvent = e as CustomEvent<FxQuality>;
      if (customEvent.detail) {
        setFxQuality(customEvent.detail);
      } else {
        setFxQuality(getFxQuality());
      }
    };
    window.addEventListener('orbi-fx-quality-changed', handleFxChange);
    return () => {
      window.removeEventListener('orbi-fx-quality-changed', handleFxChange);
    };
  }, []);

  // Map meteorological code to a safe internal theme
  const getThemeConfig = (condStr: string) => {
    const c = (condStr || 'sunny').toLowerCase();
    
    // Conditions mapper
    if (c === 'sunny' || c === 'clear') {
      return {
        key: 'sunny',
        gradient: 'from-amber-400 via-orange-500 to-yellow-300',
        glowColor: 'rgba(245, 158, 11, 0.7)',
        haloColor: 'bg-amber-500/10',
        coronaColor: 'border-amber-400/30',
        icon: Sun,
        iconColor: 'text-amber-100',
        labelText: 'Cielo Despejado',
        ambientMood: 'Sol radiante, radiación activa',
        pulseScale: [1, 1.04, 1.01, 1.05, 1],
        animationDuration: 6,
        particleColor: 'bg-amber-300/60',
        rippleColor: 'border-amber-400/20'
      };
    }
    if (c.includes('partly') || c.includes('parcial') || c === 'partly_cloudy') {
      return {
        key: 'partly_cloudy',
        gradient: 'from-sky-400 via-indigo-500 to-sky-300',
        glowColor: 'rgba(56, 189, 248, 0.6)',
        haloColor: 'bg-sky-500/10',
        coronaColor: 'border-sky-400/20',
        icon: CloudSun,
        iconColor: 'text-sky-100',
        labelText: 'Nubosidad Parcial',
        ambientMood: 'Brillo solar filtrado',
        pulseScale: [1, 1.03, 1],
        animationDuration: 7,
        particleColor: 'bg-sky-200/40',
        rippleColor: 'border-sky-300/15'
      };
    }
    if (c === 'fog' || c.includes('niebla') || c.includes('bruma')) {
      return {
        key: 'fog',
        gradient: 'from-zinc-500 via-slate-600 to-slate-400',
        glowColor: 'rgba(156, 163, 175, 0.45)',
        haloColor: 'bg-slate-500/5',
        coronaColor: 'border-slate-400/15',
        icon: Eye,
        iconColor: 'text-zinc-200',
        labelText: 'Niebla / Visibilidad Reducida',
        ambientMood: 'Humedad extrema en el aire',
        pulseScale: [1, 1.015, 1],
        animationDuration: 10,
        particleColor: 'bg-zinc-300/30',
        rippleColor: 'border-slate-500/10'
      };
    }
    if (c === 'rain' || c.includes('lluvia') || c.includes('llovizna') || c.includes('drizzle')) {
      return {
        key: 'rain',
        gradient: 'from-blue-600 via-indigo-950 to-cyan-700',
        glowColor: 'rgba(37, 99, 235, 0.65)',
        haloColor: 'bg-blue-500/15',
        coronaColor: 'border-blue-400/30',
        icon: CloudRain,
        iconColor: 'text-cyan-200 animate-bounce',
        labelText: 'Lluvia Activa',
        ambientMood: 'Precipitaciones constantes',
        pulseScale: [1, 1.03, 0.99, 1.04, 1],
        animationDuration: 5,
        particleColor: 'bg-cyan-300/70',
        rippleColor: 'border-cyan-300/25'
      };
    }
    if (c === 'storm' || c.includes('tormenta') || c.includes('thunderstorm') || c.includes('tempestad')) {
      return {
        key: 'storm',
        gradient: 'from-indigo-900 via-purple-950 to-violet-800',
        glowColor: 'rgba(168, 85, 247, 0.75)',
        haloColor: 'bg-purple-500/15',
        coronaColor: 'border-purple-400/40',
        icon: Zap,
        iconColor: 'text-yellow-300 drop-shadow-[0_0_8px_rgba(234,179,8,0.8)]',
        labelText: 'Tormenta Eléctrica',
        ambientMood: 'Inestabilidad severa activa',
        pulseScale: [0.97, 1.05, 0.98, 1.06, 0.97],
        animationDuration: 3,
        particleColor: 'bg-yellow-200/80',
        rippleColor: 'border-yellow-400/30'
      };
    }
    if (c === 'wind' || c.includes('viento') || c.includes('gale') || c.includes('breeze')) {
      return {
        key: 'wind',
        gradient: 'from-teal-500 via-slate-900 to-emerald-700',
        glowColor: 'rgba(20, 184, 166, 0.6)',
        haloColor: 'bg-teal-500/10',
        coronaColor: 'border-teal-400/25',
        icon: Wind,
        iconColor: 'text-teal-200',
        labelText: 'Viento Fuerte',
        ambientMood: 'Flujos de aire de alta velocidad',
        pulseScale: [1, 1.04, 1],
        animationDuration: 5.5,
        particleColor: 'bg-teal-300/40',
        rippleColor: 'border-teal-300/20'
      };
    }
    if (c === 'cold' || c.includes('nieve') || c.includes('snow') || c.includes('frost') || c.includes('frío') || c.includes('freezing')) {
      return {
        key: 'cold',
        gradient: 'from-cyan-300 via-blue-900 to-indigo-800',
        glowColor: 'rgba(34, 211, 238, 0.6)',
        haloColor: 'bg-cyan-500/10',
        coronaColor: 'border-cyan-400/30',
        icon: Snowflake,
        iconColor: 'text-cyan-100',
        labelText: 'Helada / Frío Severo',
        ambientMood: 'Riesgo de congelamiento térmico',
        pulseScale: [0.99, 1.02, 0.99],
        animationDuration: 8,
        particleColor: 'bg-white/70',
        rippleColor: 'border-cyan-300/20'
      };
    }
    if (c === 'hot' || c.includes('calor') || c.includes('heat') || temperature >= 30) {
      return {
        key: 'hot',
        gradient: 'from-red-500 via-orange-600 to-amber-500',
        glowColor: 'rgba(239, 68, 68, 0.7)',
        haloColor: 'bg-red-500/15',
        coronaColor: 'border-red-400/30',
        icon: Flame,
        iconColor: 'text-red-100 animate-pulse',
        labelText: 'Calor Extremo',
        ambientMood: 'Alerta de fatiga por calor',
        pulseScale: [1, 1.05, 1.01, 1.07, 1],
        animationDuration: 4,
        particleColor: 'bg-orange-300/60',
        rippleColor: 'border-red-400/20'
      };
    }
    if (c === 'night' || c.includes('noche')) {
      return {
        key: 'night',
        gradient: 'from-violet-950 via-slate-950 to-indigo-900',
        glowColor: 'rgba(139, 92, 246, 0.55)',
        haloColor: 'bg-violet-500/5',
        coronaColor: 'border-violet-400/15',
        icon: Moon,
        iconColor: 'text-violet-200',
        labelText: 'Noche Despejada',
        ambientMood: 'Sin nubosidad, radiación térmica',
        pulseScale: [1, 1.02, 1],
        animationDuration: 9,
        particleColor: 'bg-white/50',
        rippleColor: 'border-violet-500/10'
      };
    }

    if (c === 'neutral' || c === 'setup' || c === 'initial_setup' || c === 'loading') {
      return {
        key: 'neutral',
        gradient: 'from-slate-700 via-slate-900 to-[#0a1020]',
        glowColor: 'rgba(99, 102, 241, 0.45)',
        haloColor: 'bg-indigo-500/5',
        coronaColor: 'border-indigo-400/20',
        icon: HelpCircle,
        iconColor: 'text-indigo-200 animate-pulse',
        labelText: 'Preparando lectura climática',
        ambientMood: 'Sin ubicación activa',
        pulseScale: [1, 1.015, 1],
        animationDuration: 8,
        particleColor: 'bg-indigo-300/30',
        rippleColor: 'border-indigo-400/10'
      };
    }

    // Default Cloudy / general fallback
    return {
      key: 'cloudy',
      gradient: 'from-slate-500 via-slate-800 to-zinc-600',
      glowColor: 'rgba(148, 163, 184, 0.5)',
      haloColor: 'bg-slate-500/10',
      coronaColor: 'border-slate-400/20',
      icon: Cloud,
      iconColor: 'text-slate-200',
      labelText: 'Cubierto / Nublado',
      ambientMood: 'Atmósfera estable y templada',
      pulseScale: [1, 1.02, 1],
      animationDuration: 7,
      particleColor: 'bg-slate-300/30',
      rippleColor: 'border-slate-400/15'
    };
  };

  const currentTheme = getThemeConfig(condition);
  const IconComponent = currentTheme.icon;

  // Particle list configuration based on FX quality
  const getParticleCount = () => {
    if (fxQuality === 'low') return 0;
    if (fxQuality === 'medium') return 6;
    return 14; // 'high'
  };

  const particleCount = getParticleCount();

  // Create static array for particles to prevent client re-renders with bad dependencies
  const particlesArray = Array.from({ length: particleCount }, (_, idx) => {
    const seed = idx + 1;
    // Pseudorandom layouts
    return {
      id: seed,
      left: `${(seed * 23) % 85 + 5}%`,
      top: `${(seed * 17) % 85 + 5}%`,
      delay: (seed * 0.4) % 3,
      duration: 2 + ((seed * 1.5) % 4),
      size: (seed % 3) + 2 // 2px - 4px
    };
  });

  // Calculate fluid shape morphing
  const getFluidBorderRadii = () => {
    if (fxQuality === 'low') return "50%"; // Static circles
    // Shifting borders over keyframes
    return [
      "48% 52% 55% 45% / 48% 54% 46% 52%",
      "53% 47% 43% 57% / 55% 45% 55% 45%",
      "45% 55% 58% 42% / 42% 58% 42% 58%",
      "51% 49% 46% 54% / 53% 47% 53% 47%",
      "48% 52% 55% 45% / 48% 54% 46% 52%"
    ];
  };

  return (
    <div className="flex flex-col items-center justify-center py-6" id="orbi-climate-core-container">
      {/* Outer pulsing atmospheric glow layer */}
      <div className="relative flex items-center justify-center w-64 h-64 md:w-72 md:h-72">
        
        {/* HALO 1 (Outer Deep Glow) */}
        {fxQuality !== 'low' && (
          <motion.div
            animate={{ scale: [1, 1.15, 0.98, 1.18, 1], opacity: [0.35, 0.15, 0.35] }}
            transition={{ 
              repeat: Infinity, 
              duration: currentTheme.animationDuration + 3, 
              ease: 'easeInOut' 
            }}
            className={`absolute w-[122%] h-[122%] rounded-full blur-3xl ${currentTheme.haloColor} pointer-events-none`}
            style={{
              boxShadow: fxQuality === 'high' ? `0 0 65px 20px ${currentTheme.glowColor}` : 'none'
            }}
          />
        )}

        {/* HALO 2 (Secondary Glow) */}
        <motion.div
          animate={{ scale: [1, 1.08, 1.01, 1.1, 1], opacity: [0.5, 0.25, 0.5] }}
          transition={{ 
            repeat: Infinity, 
            duration: currentTheme.animationDuration, 
            ease: 'easeInOut' 
          }}
          className={`absolute w-[105%] h-[105%] rounded-full blur-2xl ${currentTheme.haloColor} pointer-events-none`}
        />

        {/* ORBITAL RINGS (Only high/medium quality) */}
        {fxQuality !== 'low' && (
          <>
            {/* Outer Orbit */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 24, ease: 'linear' }}
              className={`absolute w-[114%] h-[114%] border-2 border-dashed ${currentTheme.coronaColor} rounded-full opacity-40 pointer-events-none`}
            />
            {/* Inner Orbit */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 16, ease: 'linear' }}
              className={`absolute w-[94%] h-[94%] border border-dotted ${currentTheme.coronaColor} rounded-full opacity-60 pointer-events-none`}
            />
          </>
        )}

        {/* ----------------- CORE LIVING SPHERE 2.0 ----------------- */}
        <motion.div
          animate={fxQuality !== 'low' ? {
            scale: currentTheme.pulseScale,
            borderRadius: getFluidBorderRadii()
          } : {
            scale: 1,
            borderRadius: "50%"
          }}
          transition={{
            repeat: Infinity,
            duration: currentTheme.animationDuration,
            ease: 'easeInOut',
          }}
          style={{
            boxShadow: `0 0 60px 15px ${currentTheme.glowColor}, inset 0 6px 20px 0 rgba(255,255,255,0.35)`,
            transition: 'box-shadow 0.6s ease'
          }}
          className={`relative w-48 h-48 md:w-52 md:h-52 rounded-full bg-gradient-to-tr ${currentTheme.gradient} flex flex-col items-center justify-center p-6 border border-white/25 select-none cursor-pointer z-10 overflow-hidden`}
        >
          {/* Weather FX Overlay Inside Orb */}
          {fxQuality !== 'low' && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-full mix-blend-screen opacity-70">
              
              {/* Rain Drops */}
              {currentTheme.key === 'rain' && (
                <div className="absolute inset-0">
                  {[1, 2, 3, 4].map((i) => (
                    <motion.div
                      key={`rain-d-${i}`}
                      animate={{ y: [-15, 200] }}
                      transition={{
                        repeat: Infinity,
                        duration: 0.8 + i * 0.2,
                        delay: i * 0.2,
                        ease: 'linear',
                      }}
                      style={{ left: `${25 * i - 15}%` }}
                      className="absolute w-[1.2px] h-6 bg-cyan-300"
                    />
                  ))}
                </div>
              )}

              {/* Storm Lightning Flash */}
              {currentTheme.key === 'storm' && (
                <motion.div
                  animate={{ opacity: [0, 0.1, 0.9, 0.1, 0, 0, 0.8, 0, 0] }}
                  transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
                  className="absolute inset-0 bg-yellow-100 mix-blend-overlay"
                />
              )}

              {/* Fog Drift */}
              {currentTheme.key === 'fog' && (
                <motion.div
                  animate={{ x: [-50, 50, -50] }}
                  transition={{ repeat: Infinity, duration: 12, ease: 'easeInOut' }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent blur-md scale-125"
                />
              )}

              {/* Cold Frost Shimmer */}
              {currentTheme.key === 'cold' && (
                <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(255,255,255,0.25)_1px,_transparent_1px)] bg-[size:12px_12px] opacity-70" />
              )}

              {/* Wind ribbons */}
              {currentTheme.key === 'wind' && (
                <motion.div
                  animate={{ x: [-80, 220], y: [-5, 5, -5] }}
                  transition={{ repeat: Infinity, duration: 2.2, ease: 'linear' }}
                  className="absolute w-24 h-[1px] bg-gradient-to-r from-transparent via-teal-200/40 to-transparent top-1/3"
                />
              )}

              {/* Twinkling Particles */}
              {particlesArray.map((p) => (
                <motion.div
                  key={`pt-${p.id}`}
                  animate={{
                    y: [0, -25, 0],
                    opacity: [0.2, 0.8, 0.2],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: p.duration,
                    delay: p.delay,
                    ease: 'easeInOut'
                  }}
                  style={{
                    left: p.left,
                    top: p.top,
                    width: `${p.size}px`,
                    height: `${p.size}px`,
                  }}
                  className={`absolute rounded-full ${currentTheme.particleColor}`}
                />
              ))}
            </div>
          )}

          {/* Icon with elegant display drop-shadow */}
          <div className="relative mb-2.5 z-20">
            <IconComponent className={`w-14 h-14 md:w-16 md:h-16 ${currentTheme.iconColor} drop-shadow-[0_4px_12px_rgba(0,0,0,0.45)] transition-all duration-500`} />
          </div>

          {/* Temperature & Sensación Display */}
          <div className="relative z-20 flex flex-col items-center">
            <span className="text-4xl md:text-5xl font-display font-bold tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.4)]">
              {condition === 'setup' || condition === 'neutral' || condition === 'initial_setup' ? '--' : temperature}°C
            </span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-white/90 mt-1.5 px-2 py-0.5 rounded-full bg-black/15 border border-white/5 backdrop-blur-sm">
              {condition === 'setup' || condition === 'neutral' || condition === 'initial_setup' ? 'SENS. --' : `SENS. ${feelsLike}°C`}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Sphere Label & Atmospheric Status Footer */}
      <div className="text-center mt-4.5 z-10 flex flex-col items-center gap-1.5 animate-fadeIn">
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#0a1020]/85 border border-white/15 text-[15.5px] text-slate-200 font-sans backdrop-blur-md shadow-lg">
          <span className={`w-3 h-3 rounded-full ${isLoading ? 'bg-cyan-400 animate-spin' : 'bg-emerald-400 animate-pulse'}`} />
          <span className="font-mono tracking-wide font-medium">
            {isLoading ? 'Sincronizando satélite...' : currentTheme.labelText}
          </span>
        </div>
        <span className="text-[14px] text-slate-300 font-sans italic opacity-90 tracking-wide mt-0.5">
          {currentTheme.ambientMood}
        </span>
      </div>
    </div>
  );
}

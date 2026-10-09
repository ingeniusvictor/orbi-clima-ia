import { HourlyForecast } from '../types/weatherTypes';
import { Sun, CloudSun, Cloud, CloudRain, ShieldAlert, Wind, Snowflake, Flame, Moon, Zap, Droplets } from 'lucide-react';

interface HourlyForecastStripProps {
  hourly: HourlyForecast[];
}

export default function HourlyForecastStrip({ hourly }: HourlyForecastStripProps) {
  const getConditionIcon = (cond: string) => {
    switch (cond) {
      case 'sunny': return <Sun className="w-5 h-5 text-amber-400" />;
      case 'partly_cloudy': return <CloudSun className="w-5 h-5 text-sky-400" />;
      case 'cloudy': return <Cloud className="w-5 h-5 text-slate-400" />;
      case 'rain': return <CloudRain className="w-5 h-5 text-blue-400" />;
      case 'storm': return <Zap className="w-5 h-5 text-purple-400 animate-pulse" />;
      case 'wind': return <Wind className="w-5 h-5 text-teal-400" />;
      case 'cold': return <Snowflake className="w-5 h-5 text-cyan-300" />;
      case 'hot': return <Flame className="w-5 h-5 text-rose-500" />;
      case 'night': return <Moon className="w-5 h-5 text-violet-300" />;
      default: return <CloudSun className="w-5 h-5 text-sky-400" />;
    }
  };

  const getConditionStyles = (cond: string) => {
    switch (cond) {
      case 'sunny':
        return {
          bg: 'bg-gradient-to-b from-amber-500/10 to-[#0c1424]/40 border-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.06)] hover:border-amber-500/40',
          effect: (
            <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
              <div className="absolute -top-8 -right-8 w-16 h-16 bg-amber-400/10 rounded-full blur-xl animate-pulse" />
              <div className="absolute top-1.5 right-1.5 w-1 h-1 bg-amber-300 rounded-full animate-ping" />
            </div>
          )
        };
      case 'partly_cloudy':
        return {
          bg: 'bg-gradient-to-b from-sky-500/10 to-[#0c1424]/40 border-sky-500/20 shadow-[0_0_12px_rgba(14,165,233,0.06)] hover:border-sky-500/40',
          effect: (
            <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
              <div className="absolute -top-6 -left-6 w-12 h-12 bg-sky-400/10 rounded-full blur-lg animate-pulse" />
              <div className="absolute top-1 right-2 w-3 h-1 bg-white/10 rounded-full blur-[0.5px]" />
            </div>
          )
        };
      case 'cloudy':
        return {
          bg: 'bg-gradient-to-b from-slate-500/10 to-[#0c1424]/40 border-slate-500/15 shadow-[0_0_12px_rgba(148,163,184,0.04)] hover:border-slate-500/30',
          effect: (
            <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
              <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-b from-slate-400/20 to-transparent" />
            </div>
          )
        };
      case 'rain':
        return {
          bg: 'bg-gradient-to-b from-blue-500/10 to-[#0c1424]/40 border-blue-500/20 shadow-[0_0_12px_rgba(59,130,246,0.06)] hover:border-blue-500/40',
          effect: (
            <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
              <div className="absolute top-1.5 left-2 w-[1px] h-3 bg-blue-400/35 transform rotate-12 animate-pulse" />
              <div className="absolute top-3 right-4 w-[1px] h-2.5 bg-blue-300/25 transform rotate-12" />
              <div className="absolute bottom-6 left-5 w-[1px] h-3.5 bg-blue-400/15 transform rotate-12" />
            </div>
          )
        };
      case 'storm':
        return {
          bg: 'bg-gradient-to-b from-purple-500/10 to-[#0c1424]/40 border-purple-500/20 shadow-[0_0_12px_rgba(168,85,247,0.08)] hover:border-purple-500/40',
          effect: (
            <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
              <div className="absolute inset-0 bg-purple-500/5 animate-[pulse_2s_infinite]" />
              <div className="absolute top-1 left-5 w-4 h-[1px] bg-purple-400/30 blur-[0.5px]" />
            </div>
          )
        };
      case 'wind':
        return {
          bg: 'bg-gradient-to-b from-teal-500/10 to-[#0c1424]/40 border-teal-500/20 shadow-[0_0_12px_rgba(20,184,166,0.06)] hover:border-teal-500/40',
          effect: (
            <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
              <div className="absolute top-1.5 right-3 w-4 h-[1px] bg-teal-400/15 rounded-full animate-[pulse_2s_infinite]" />
              <div className="absolute bottom-6 left-2 w-5 h-[1px] bg-teal-300/10 rounded-full" />
            </div>
          )
        };
      case 'cold':
        return {
          bg: 'bg-gradient-to-b from-cyan-500/10 to-[#0c1424]/40 border-cyan-500/20 shadow-[0_0_12px_rgba(6,182,212,0.06)] hover:border-cyan-500/40',
          effect: (
            <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
              <div className="absolute top-1.5 right-1.5 w-1 h-1 bg-cyan-300/50 rounded-full animate-[ping_3s_infinite]" />
              <div className="absolute bottom-4 left-1.5 w-1 h-1 bg-white/30 rounded-full animate-pulse" />
            </div>
          )
        };
      case 'hot':
        return {
          bg: 'bg-gradient-to-b from-red-500/10 to-[#0c1424]/40 border-red-500/20 shadow-[0_0_12px_rgba(239,68,68,0.08)] hover:border-red-500/40',
          effect: (
            <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
              <div className="absolute inset-0 bg-red-500/5 animate-pulse" />
              <div className="absolute -bottom-8 inset-x-0 h-8 bg-red-500/10 rounded-full blur-md" />
            </div>
          )
        };
      case 'night':
        return {
          bg: 'bg-gradient-to-b from-violet-500/10 to-[#0c1424]/40 border-violet-500/20 shadow-[0_0_12px_rgba(139,92,246,0.06)] hover:border-violet-500/40',
          effect: (
            <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
              <div className="absolute top-1.5 right-3 w-0.5 h-0.5 bg-white rounded-full animate-pulse" />
              <div className="absolute top-4 left-1.5 w-0.5 h-0.5 bg-white rounded-full animate-ping" />
            </div>
          )
        };
      default:
        return {
          bg: 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10',
          effect: null
        };
    }
  };

  return (
    <div className="w-full flex flex-col gap-3.5" id="hourly-forecast-strip-container">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase font-mono tracking-wider text-white/40">Línea del Tiempo Horaria</span>
        <span className="text-[10px] font-mono text-cyan-400/80">Desliza horizontalmente →</span>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-3 pt-1 scrollbar-thin scrollbar-thumb-white/10" style={{ scrollbarWidth: 'thin' }}>
        {hourly.map((hour, index) => {
          const isHighUv = hour.uvIndex >= 6;
          const isHighPrecip = hour.precipitationProbability >= 45;
          const styles = getConditionStyles(hour.condition);

          return (
            <div
              key={index}
              className={`flex-shrink-0 w-[105px] p-3 rounded-2xl border flex flex-col items-center justify-between text-center transition-all hover:scale-[1.03] relative overflow-hidden select-none ${styles.bg}`}
              id={`hourly-card-${index}`}
            >
              {/* Dynamic ambient effect overlay */}
              {styles.effect}

              {/* Time */}
              <span className="text-[11px] font-mono text-white/60 tracking-tight z-10">{hour.time}</span>

              {/* Icon */}
              <div className="my-2.5 z-10 relative">
                {getConditionIcon(hour.condition)}
              </div>

              {/* Temp */}
              <span className="text-base font-sans font-bold text-white tracking-tight z-10">{hour.temperatureC}°</span>

              {/* Quick stats badges */}
              <div className="w-full flex flex-col gap-1 mt-2.5 pt-2 border-t border-white/5 z-10 relative">
                {/* Rain Prob */}
                <div className="flex items-center justify-center gap-1">
                  <Droplets className={`w-3 h-3 ${isHighPrecip ? 'text-blue-400' : 'text-white/30'}`} />
                  <span className={`text-[10px] font-mono ${isHighPrecip ? 'text-blue-300 font-bold' : 'text-white/50'}`}>
                    {hour.precipitationProbability}%
                  </span>
                </div>

                {/* UV / Wind */}
                <div className="text-[9px] font-mono text-white/40">
                  {hour.uvIndex > 0 ? (
                    <span className={isHighUv ? 'text-amber-400 font-bold' : 'text-white/50'}>
                      UV {hour.uvIndex}
                    </span>
                  ) : (
                    <span>{hour.windSpeedKmh} km/h</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

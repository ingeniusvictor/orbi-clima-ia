import { DailyForecast } from '../types/weatherTypes';
import { Sun, CloudSun, Cloud, CloudRain, ShieldAlert, Wind, Snowflake, Flame, Moon, Zap, Sunrise, Sunset } from 'lucide-react';

interface DailyForecastListProps {
  daily: DailyForecast[];
}

export default function DailyForecastList({ daily }: DailyForecastListProps) {
  const getConditionIcon = (cond: string) => {
    switch (cond) {
      case 'sunny': return <Sun className="w-4 h-4 text-amber-400" />;
      case 'partly_cloudy': return <CloudSun className="w-4 h-4 text-sky-400" />;
      case 'cloudy': return <Cloud className="w-4 h-4 text-slate-400" />;
      case 'rain': return <CloudRain className="w-4 h-4 text-blue-400" />;
      case 'storm': return <Zap className="w-4 h-4 text-purple-400" />;
      case 'wind': return <Wind className="w-4 h-4 text-teal-400" />;
      case 'cold': return <Snowflake className="w-4 h-4 text-cyan-300" />;
      case 'hot': return <Flame className="w-4 h-4 text-rose-500" />;
      case 'night': return <Moon className="w-4 h-4 text-violet-300" />;
      default: return <CloudSun className="w-4 h-4 text-sky-400" />;
    }
  };

  return (
    <div className="w-full flex flex-col gap-3" id="daily-forecast-list-container">
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <span className="text-xs uppercase font-mono tracking-wider text-white/40">Tendencia Semanal</span>
        <span className="text-[10px] font-mono text-cyan-400/80">Proyección de 7 Días</span>
      </div>

      <div className="flex flex-col gap-2">
        {daily.map((day, index) => {
          return (
            <div
              key={index}
              className="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 transition-all hover:bg-white/10"
              id={`daily-row-${index}`}
            >
              {/* Day & Condition */}
              <div className="flex items-center gap-3 w-32">
                <div className="p-2 rounded-xl bg-white/5 flex items-center justify-center">
                  {getConditionIcon(day.condition)}
                </div>
                <div>
                  <span className="text-sm font-sans font-semibold text-white block">{day.date}</span>
                  <span className="text-[10px] font-mono text-white/40 block uppercase">
                    {day.condition.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Progress/Margin bar of temperature */}
              <div className="flex-1 flex items-center gap-3">
                <span className="text-xs font-mono text-white/40 w-8 text-right">{day.minTempC}°C</span>
                <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden relative">
                  <div
                    className="absolute h-full rounded-full bg-gradient-to-r from-cyan-400 to-amber-400"
                    style={{
                      left: `${Math.max(0, (day.minTempC / 35) * 100)}%`,
                      right: `${Math.max(0, (1 - (day.maxTempC / 35)) * 100)}%`,
                    }}
                  />
                </div>
                <span className="text-xs font-mono text-white/90 w-8">{day.maxTempC}°C</span>
              </div>

              {/* Day specifications */}
              <div className="flex items-center gap-4 text-right justify-between sm:justify-end">
                {/* Rain */}
                <div className="flex flex-col text-right">
                  <span className="text-[10px] font-mono text-white/40 uppercase">Precipitación</span>
                  <span className={`text-xs font-sans font-medium mt-0.5 ${day.precipitationProbability > 30 ? 'text-blue-400' : 'text-white/60'}`}>
                    {day.precipitationProbability}%
                  </span>
                </div>

                {/* UV */}
                <div className="flex flex-col text-right">
                  <span className="text-[10px] font-mono text-white/40 uppercase">UV Máx</span>
                  <span className={`text-xs font-sans font-medium mt-0.5 ${day.uvMax >= 8 ? 'text-red-400 font-bold' : day.uvMax >= 6 ? 'text-amber-400' : 'text-white/60'}`}>
                    {day.uvMax}
                  </span>
                </div>

                {/* Sun schedules */}
                <div className="hidden md:flex items-center gap-2.5 text-white/40 border-l border-white/5 pl-4 text-[11px] font-mono">
                  <div className="flex items-center gap-1">
                    <Sunrise className="w-3.5 h-3.5 text-amber-500/80" />
                    <span>{day.sunrise}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Sunset className="w-3.5 h-3.5 text-violet-400/80" />
                    <span>{day.sunset}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import { HourlyForecast } from '../types/weatherTypes';
import { Sun, Wind, Umbrella, CloudLightning, ShieldCheck, Thermometer, Droplets } from 'lucide-react';

interface AlertTimelineStripProps {
  hourly: HourlyForecast[];
}

export default function AlertTimelineStrip({ hourly }: AlertTimelineStripProps) {
  // Take next 6-8 hours for display
  const timelineHours = hourly.slice(0, 8);

  const getHourAlertState = (hour: HourlyForecast) => {
    if (hour.condition === 'storm') {
      return { label: 'Tormenta', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20', icon: <CloudLightning className="w-3 h-3 text-purple-400" /> };
    }
    if (hour.precipitationProbability >= 60) {
      return { label: 'Lluvia', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20', icon: <Umbrella className="w-3 h-3 text-cyan-400" /> };
    }
    if (hour.uvIndex >= 6) {
      return { label: 'UV Alto', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', icon: <Sun className="w-3 h-3 text-amber-400" /> };
    }
    if (hour.windSpeedKmh >= 30) {
      return { label: 'Viento', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20', icon: <Wind className="w-3 h-3 text-orange-400" /> };
    }
    if (hour.temperatureC <= 8) {
      return { label: 'Frío', color: 'text-sky-400 bg-sky-500/10 border-sky-500/20', icon: <Thermometer className="w-3 h-3 text-sky-400" /> };
    }
    if (hour.humidity >= 85) {
      return { label: 'Humedad', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20', icon: <Droplets className="w-3 h-3 text-indigo-400" /> };
    }
    return { label: 'OK', color: 'text-emerald-400 bg-emerald-500/5 border-emerald-500/10', icon: <ShieldCheck className="w-3 h-3 text-emerald-400" /> };
  };

  const formatHour = (timeStr: string) => {
    if (!timeStr) return '';
    if (timeStr.includes(':')) {
      return timeStr.split(':')[0] + 'h';
    }
    if (timeStr.includes(' ')) {
      return timeStr.split(' ')[0];
    }
    return timeStr + 'h';
  };

  return (
    <div className="w-full bg-white/[0.01] border border-white/5 rounded-2xl p-3.5 flex flex-col gap-2.5" id="alert-timeline-strip">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono font-bold text-white/45 uppercase tracking-wider">
          LÍNEA DE TIEMPO HORARIA · ALERTAS SKYCORE™
        </span>
        <span className="text-[9px] font-mono text-cyan-400 bg-cyan-500/5 px-2 py-0.5 rounded border border-cyan-500/10">
          PROYECCIÓN 8 HORAS
        </span>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {timelineHours.map((hour, idx) => {
          const state = getHourAlertState(hour);
          return (
            <div 
              key={idx} 
              className={`flex-1 min-w-[76px] p-2 rounded-xl border flex flex-col items-center text-center gap-1.5 transition-all ${state.color}`}
            >
              <span className="text-[10px] font-mono font-bold text-white">
                {formatHour(hour.time)}
              </span>
              <div className="p-1 rounded-lg bg-black/45 border border-white/5">
                {state.icon}
              </div>
              <span className="text-[10px] font-sans font-bold block truncate max-w-full">
                {hour.temperatureC}°C
              </span>
              <span className="text-[8px] font-mono font-bold uppercase tracking-tight block">
                {state.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

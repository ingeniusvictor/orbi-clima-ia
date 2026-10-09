import { useState } from 'react';
import { SmartWeatherAlert } from '../types/weatherTypes';
import { getAlertSeverityLabel, getAlertSeverityColorToken } from '../utils/skyCoreAlertFormatter';
import { Umbrella, Wind, Sun, Thermometer, Flame, Droplets, CloudLightning, HardHat, Zap, AlertTriangle, Info, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface SmartAlertCardProps {
  alert: SmartWeatherAlert;
  onDismiss?: (id: string) => void;
  key?: string | number;
}

export default function SmartAlertCard({ alert, onDismiss }: SmartAlertCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const label = getAlertSeverityLabel(alert.severity);
  const colorToken = getAlertSeverityColorToken(alert.severity);

  // Map category to Lucide Icon component
  const getIcon = () => {
    switch (alert.category) {
      case 'rain':
        return <Umbrella className="w-5 h-5 text-cyan-400" />;
      case 'wind':
      case 'gusts':
        return <Wind className="w-5 h-5 text-cyan-400" />;
      case 'uv':
        return <Sun className="w-5 h-5 text-amber-400 animate-pulse" />;
      case 'cold':
        return <Thermometer className="w-5 h-5 text-sky-400" />;
      case 'heat':
        return <Flame className="w-5 h-5 text-orange-400" />;
      case 'humidity':
        return <Droplets className="w-5 h-5 text-indigo-400" />;
      case 'storm':
        return <CloudLightning className="w-5 h-5 text-purple-400" />;
      case 'field_work':
        return <HardHat className="w-5 h-5 text-amber-500" />;
      case 'electrical_work':
        return <Zap className="w-5 h-5 text-yellow-400" />;
      case 'solar_pv':
        return <Zap className="w-5 h-5 text-emerald-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-slate-400" />;
    }
  };

  // Border & background styling based on severity
  const getSeverityStyles = () => {
    switch (alert.severity) {
      case 'critical':
        return {
          bg: 'bg-red-500/10 hover:bg-red-500/15 border-red-500/30',
          text: 'text-red-400',
          badge: 'bg-red-500/20 text-red-300 border-red-500/30'
        };
      case 'warning':
        return {
          bg: 'bg-orange-500/10 hover:bg-orange-500/15 border-orange-500/30',
          text: 'text-orange-400',
          badge: 'bg-orange-500/20 text-orange-300 border-orange-500/30'
        };
      case 'watch':
        return {
          bg: 'bg-amber-500/10 hover:bg-amber-500/15 border-amber-500/25',
          text: 'text-amber-400',
          badge: 'bg-amber-500/10 text-amber-300 border-amber-500/25'
        };
      case 'info':
        return {
          bg: 'bg-cyan-500/5 hover:bg-cyan-500/10 border-cyan-500/20',
          text: 'text-cyan-400',
          badge: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20'
        };
      default:
        return {
          bg: 'bg-white/5 hover:bg-white/10 border-white/10',
          text: 'text-white/80',
          badge: 'bg-white/10 text-white/90 border-white/10'
        };
    }
  };

  const styles = getSeverityStyles();

  return (
    <div 
      className={`p-4 rounded-2xl border ${styles.bg} transition-all duration-300 flex flex-col gap-3 text-left`}
      id={`smart-alert-card-${alert.id}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-black/45 border border-white/5">
            {getIcon()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${styles.badge}`}>
                {label}
              </span>
              <span className="text-[10px] font-mono text-white/45">
                {alert.timeLabel}
              </span>
            </div>
            <h4 className="text-sm font-sans font-bold text-white mt-1">
              {alert.title}
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onDismiss && (
            <button
              onClick={() => onDismiss(alert.id)}
              className="text-[10px] font-mono text-white/30 hover:text-white/70 bg-white/5 hover:bg-white/10 px-2 py-1 rounded-md transition-all cursor-pointer"
            >
              OCULTAR
            </button>
          )}
        </div>
      </div>

      <p className="text-xs text-white/80 leading-relaxed font-sans">
        {alert.message}
      </p>

      {/* Accordion Toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between py-1.5 px-2 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-mono font-bold text-slate-300 transition-all cursor-pointer"
      >
        <span>{isExpanded ? 'OCULTAR ACCIONES Y DETALLES' : 'VER ACCIONES DE MITIGACIÓN'}</span>
        {isExpanded ? <ChevronUp className="w-3 h-3 text-cyan-400" /> : <ChevronDown className="w-3 h-3 text-cyan-400" />}
      </button>

      {isExpanded && (
        <div className="flex flex-col gap-3 animate-fadeIn">
          {/* Recommended Action / Active Mitigation */}
          <div className="p-3 rounded-xl bg-black/35 border border-white/5 flex flex-col gap-1">
            <span className="text-[9px] font-mono text-amber-400/80 uppercase font-bold tracking-wider block">
              MITIGACIÓN RECOMENDADA SKYCORE
            </span>
            <p className="text-[11px] text-white/70 leading-normal font-sans">
              {alert.recommendation}
            </p>
          </div>

          {/* Applicable Profile badge and status */}
          <div className="flex items-center justify-between border-t border-white/5 pt-2.5 text-[9px] font-mono text-white/40">
            <span>ORIGEN: SKYCORE ANALYTICS</span>
            <span className="uppercase">
              PERFIL: {alert.profile === 'field_tech' ? 'TÉCNICO TERRENO' : 'PERSONA'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

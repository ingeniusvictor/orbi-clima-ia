import React from 'react';
import { ClimateRisk, RiskLevel } from '../types/weatherTypes';
import { AlertCircle, AlertTriangle, CheckCircle2, ShieldAlert, HeartHandshake } from 'lucide-react';

interface ClimateRiskPanelProps {
  risks: ClimateRisk[];
}

export default function ClimateRiskPanel({ risks }: ClimateRiskPanelProps) {
  const getRiskMetadata = (level: RiskLevel) => {
    switch (level) {
      case 'critical':
        return {
          bg: 'bg-red-950/20 border-red-500/30',
          text: 'text-red-400',
          accentBg: 'bg-red-500/20',
          icon: ShieldAlert,
          badgeText: 'Crítico',
        };
      case 'high':
        return {
          bg: 'bg-orange-950/20 border-orange-500/30',
          text: 'text-orange-400',
          accentBg: 'bg-orange-500/20',
          icon: AlertTriangle,
          badgeText: 'Alto',
        };
      case 'medium':
        return {
          bg: 'bg-amber-950/20 border-amber-500/30',
          text: 'text-amber-400',
          accentBg: 'bg-amber-500/20',
          icon: AlertCircle,
          badgeText: 'Moderado',
        };
      case 'low':
      default:
        return {
          bg: 'bg-emerald-950/15 border-emerald-500/20',
          text: 'text-emerald-400',
          accentBg: 'bg-emerald-500/10',
          icon: CheckCircle2,
          badgeText: 'Estable',
        };
    }
  };

  const levelPriority: Record<RiskLevel, number> = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1
  };

  const sortedRisks = [...risks].sort((a, b) => {
    const prioA = levelPriority[a.level] || 0;
    const prioB = levelPriority[b.level] || 0;
    return prioB - prioA;
  });

  const [showAll, setShowAll] = React.useState(false);

  const hasRisks = sortedRisks.length > 0;
  const mainRisk = hasRisks ? sortedRisks[0] : null;
  const otherRisks = hasRisks ? sortedRisks.slice(1) : [];

  return (
    <div className="w-full flex flex-col gap-3" id="climate-risk-panel-container">
      <div className="flex items-center gap-1.5 text-xs text-white/50 uppercase font-mono tracking-wider">
        <HeartHandshake className="w-3.5 h-3.5 text-amber-500" />
        <span>Riesgos Climáticos Detectados</span>
      </div>

      {!hasRisks ? (
        <div className="p-4 rounded-2xl border border-white/5 bg-white/5 flex items-center justify-center text-center">
          <p className="text-xs text-white/40 font-mono">No se detectaron riesgos activos.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {/* Main (most important) risk */}
          {mainRisk && (
            (() => {
              const meta = getRiskMetadata(mainRisk.level);
              const Icon = meta.icon;
              return (
                <div
                  className={`p-4 rounded-2xl border ${meta.bg} flex gap-3.5 transition-all`}
                  id={`risk-box-${mainRisk.id}`}
                >
                  <div className={`p-2 rounded-xl h-fit ${meta.accentBg} ${meta.text}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-sans font-bold text-white tracking-tight">
                        {mainRisk.label}
                      </span>
                      <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded border ${meta.accentBg} ${meta.text} border-current/20`}>
                        {meta.badgeText}
                      </span>
                    </div>
                    <p className="text-xs text-white/70 mt-1 leading-relaxed">
                      {mainRisk.description}
                    </p>
                    <div className="mt-2.5 pt-2.5 border-t border-white/5 flex flex-col gap-1">
                      <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
                        Instrucción / Mitigación
                      </span>
                      <p className={`text-xs ${meta.text} font-medium leading-relaxed mt-0.5`}>
                        {mainRisk.recommendation}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()
          )}

          {/* Accordion toggle for other risks */}
          {otherRisks.length > 0 && (
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setShowAll(!showAll)}
                className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-mono font-bold text-amber-400 hover:text-amber-300 bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/10 rounded-xl transition-all cursor-pointer"
              >
                <span>
                  {showAll 
                    ? 'MOSTRAR SOLO RIESGO PRINCIPAL' 
                    : `VER OTROS RIESGOS DISPONIBLES (${otherRisks.length})`}
                </span>
                <span>{showAll ? '▲' : '▼'}</span>
              </button>

              {showAll && (
                <div className="flex flex-col gap-3 animate-fadeIn">
                  {otherRisks.map((risk) => {
                    const meta = getRiskMetadata(risk.level);
                    const Icon = meta.icon;
                    return (
                      <div
                        key={risk.id}
                        className={`p-4 rounded-2xl border ${meta.bg} flex gap-3.5 transition-all`}
                        id={`risk-box-${risk.id}`}
                      >
                        <div className={`p-2 rounded-xl h-fit ${meta.accentBg} ${meta.text}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-sans font-bold text-white tracking-tight">
                              {risk.label}
                            </span>
                            <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded border ${meta.accentBg} ${meta.text} border-current/20`}>
                              {meta.badgeText}
                            </span>
                          </div>
                          <p className="text-xs text-white/70 mt-1 leading-relaxed">
                            {risk.description}
                          </p>
                          <div className="mt-2.5 pt-2.5 border-t border-white/5 flex flex-col gap-1">
                            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
                              Instrucción / Mitigación
                            </span>
                            <p className={`text-xs ${meta.text} font-medium leading-relaxed mt-0.5`}>
                              {risk.recommendation}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

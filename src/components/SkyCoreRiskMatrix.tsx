import { Thermometer, Droplets, Wind, Zap, Sun, Activity, Eye, AlertTriangle } from 'lucide-react';
import { SkyCoreRiskScore, SkyCoreRiskCategory } from '../types/weatherTypes';
import { getRiskLevelBadgeClass } from '../utils/skyCoreRiskLabels';

interface SkyCoreRiskMatrixProps {
  scores: SkyCoreRiskScore[];
}

export default function SkyCoreRiskMatrix({ scores }: SkyCoreRiskMatrixProps) {
  // Map category to icon
  const getCategoryIcon = (category: SkyCoreRiskCategory) => {
    switch (category) {
      case 'temperature':
      case 'cold':
      case 'heat':
        return <Thermometer className="w-4 h-4" />;
      case 'humidity':
        return <Droplets className="w-4 h-4" />;
      case 'wind':
      case 'gusts':
        return <Wind className="w-4 h-4" />;
      case 'uv':
        return <Sun className="w-4 h-4" />;
      case 'rain':
      case 'storm':
        return <Zap className="w-4 h-4" />;
      case 'electrical_work':
        return <Zap className="w-4 h-4 text-amber-400" />;
      case 'field_work':
        return <Activity className="w-4 h-4 text-emerald-400" />;
      case 'inspection':
        return <Eye className="w-4 h-4 text-blue-400" />;
      case 'solar_pv':
        return <Sun className="w-4 h-4 text-yellow-400" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  // We filter categories to show a nice selected set of primary dimensions to avoid clutter
  const visibleCategories: SkyCoreRiskCategory[] = [
    'temperature',
    'humidity',
    'wind',
    'gusts',
    'uv',
    'rain',
    'storm',
    'electrical_work',
    'field_work',
    'solar_pv'
  ];

  const displayedScores = scores.filter(s => visibleCategories.includes(s.category));

  return (
    <div id="skycore-risk-matrix" className="flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <h4 className="text-xs font-mono font-bold tracking-wider text-white/50 uppercase">
          Matriz de Riesgo SkyCore
        </h4>
        <span className="text-[10px] font-mono text-white/30">Escala 0–100</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {displayedScores.map((item) => {
          const badgeClass = getRiskLevelBadgeClass(item.level);
          
          return (
            <div
              key={item.category}
              className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-between gap-3 hover:bg-white/[0.04] transition-all"
            >
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-white/5 text-white/60">
                  {getCategoryIcon(item.category)}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-mono text-white/40 uppercase truncate">
                    {item.category === 'solar_pv' ? 'Rendimiento FV' : item.category}
                  </span>
                  <span className="text-[11px] font-sans font-bold text-white leading-tight truncate">
                    {item.label}
                  </span>
                </div>
              </div>

              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-mono font-bold text-white tracking-tight">
                  {item.score}
                </span>
                <span className={`px-1.5 py-0.5 text-[8px] font-mono font-bold uppercase rounded-md border ${badgeClass}`}>
                  {item.level === 'low' ? 'Bajo' : item.level === 'medium' ? 'Mod' : item.level === 'high' ? 'Alto' : 'Crit'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

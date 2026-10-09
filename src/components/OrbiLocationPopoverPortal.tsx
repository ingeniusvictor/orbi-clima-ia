import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MapPin, X, RefreshCw, Star, Compass, Info } from 'lucide-react';

interface OrbiLocationPopoverPortalProps {
  isOpen: boolean;
  onClose: () => void;
  locationName: string;
  locationOrigin: 'gps' | 'manual' | 'saved' | 'destination' | 'demo' | 'cache' | 'setup';
  onUseMyLocation?: () => void;
  onCityChangeClick?: () => void;
  isGpsLoading?: boolean;
  gpsError?: string | null;
}

export default function OrbiLocationPopoverPortal({
  isOpen,
  onClose,
  locationName,
  locationOrigin,
  onUseMyLocation,
  onCityChangeClick,
  isGpsLoading = false,
  gpsError = null
}: OrbiLocationPopoverPortalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Close on ESC key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    panelRef.current?.focus();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Reset success message when modal opens or closes
  useEffect(() => {
    if (isOpen) {
      setSuccessMsg(null);
    }
  }, [isOpen, locationOrigin]);

  if (!isOpen) return null;

  const handleActionWithFeedback = (msg: string, actionFn?: () => void) => {
    if (actionFn) {
      actionFn();
    }
    setSuccessMsg(msg);
    setTimeout(() => {
      setSuccessMsg(null);
      onClose();
    }, 1500);
  };

  const renderContent = () => {
    if (successMsg) {
      return (
        <div className="py-6 text-center space-y-3 animate-fade-in">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(16,185,129,0.15)]">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <p className="text-[11px] font-mono text-emerald-300 uppercase tracking-wider font-bold">{successMsg}</p>
          <p className="text-[9.5px] text-slate-400">Sincronizando satélite...</p>
        </div>
      );
    }

    if (isGpsLoading) {
      return (
        <div className="py-8 text-center space-y-3">
          <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin mx-auto" />
          <p className="text-[11px] font-mono text-cyan-300 animate-pulse font-bold uppercase tracking-wider">
            Buscando Señal Satelital...
          </p>
          <p className="text-[9.5px] text-slate-400 font-sans">
            Solicitando coordenadas GPS al dispositivo de forma segura.
          </p>
        </div>
      );
    }

    switch (locationOrigin) {
      case 'gps':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 bg-emerald-500/5 border border-emerald-500/15 p-2.5 rounded-xl">
              <Compass className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="text-left">
                <span className="text-[8px] font-mono text-emerald-400 block uppercase tracking-wider font-black">Sincronización GPS</span>
                <span className="text-[10px] text-slate-200 font-sans leading-normal">
                  Ubicación activa por GPS real para <strong>{locationName}</strong>.
                </span>
              </div>
            </div>
            
            <p className="text-[10px] text-slate-300 leading-normal font-sans">
              Tu clima está sincronizado en tiempo real mediante el GPS de tu dispositivo para la estación más cercana.
            </p>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (onUseMyLocation) onUseMyLocation();
                }}
                className="w-full py-2 bg-emerald-500/10 hover:bg-emerald-500/20 active:scale-98 border border-emerald-500/20 text-emerald-300 text-[10px] font-sans font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Actualizar ahora
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onCityChangeClick) onCityChangeClick();
                }}
                className="w-full py-2 bg-white/5 hover:bg-white/10 active:scale-98 border border-white/10 text-slate-200 text-[10px] font-sans font-bold rounded-lg transition-all cursor-pointer"
              >
                Cambiar ciudad
              </button>
              <button
                type="button"
                onClick={() => handleActionWithFeedback('¡Ubicación guardada!')}
                className="w-full py-1.5 bg-white/[0.01] hover:bg-white/5 text-indigo-300 text-[9.5px] font-sans font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                <Star className="w-3 h-3 text-indigo-400 fill-indigo-400/20" />
                Guardar como frecuente
              </button>
            </div>
          </div>
        );

      case 'saved':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 bg-indigo-500/5 border border-indigo-500/15 p-2.5 rounded-xl">
              <Star className="w-4 h-4 text-indigo-400 shrink-0 fill-indigo-400/20" />
              <div className="text-left">
                <span className="text-[8px] font-mono text-indigo-300 block uppercase tracking-wider font-black">Ubicación guardada</span>
                <span className="text-[10px] text-slate-200 font-sans leading-normal">
                  Visualizando tu ubicación preferida: <strong>{locationName}</strong>.
                </span>
              </div>
            </div>

            <p className="text-[10px] text-slate-300 leading-normal font-sans">
              Estás visualizando una de tus ubicaciones preferidas guardadas en tu perfil.
            </p>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (onUseMyLocation) onUseMyLocation();
                }}
                className="w-full py-2 bg-cyan-500/10 hover:bg-cyan-500/20 active:scale-98 border border-cyan-500/20 text-cyan-300 text-[10px] font-sans font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                Usar GPS actual
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onCityChangeClick) onCityChangeClick();
                }}
                className="w-full py-2 bg-white/5 hover:bg-white/10 active:scale-98 border border-white/10 text-slate-200 text-[10px] font-sans font-bold rounded-lg transition-all cursor-pointer"
              >
                Cambiar ciudad
              </button>
              <button
                type="button"
                onClick={() => handleActionWithFeedback('Cargando lista...')}
                className="w-full py-1.5 bg-white/[0.01] hover:bg-white/5 text-slate-400 text-[9.5px] font-sans font-semibold rounded-lg transition-all cursor-pointer"
              >
                Ver mis ubicaciones
              </button>
            </div>
          </div>
        );

      case 'destination':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 bg-purple-500/5 border border-purple-500/15 p-2.5 rounded-xl">
              <MapPin className="w-4 h-4 text-purple-400 shrink-0" />
              <div className="text-left">
                <span className="text-[8px] font-mono text-purple-400 block uppercase tracking-wider font-black">Ubicación destino</span>
                <span className="text-[10px] text-slate-200 font-sans leading-normal">
                  Visualizando punto de destino: <strong>{locationName}</strong>.
                </span>
              </div>
            </div>

            <p className="text-[10px] text-slate-300 leading-normal font-sans">
              Estás visualizando el pronóstico de tu punto de destino programado para tus labores o viaje.
            </p>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (onUseMyLocation) onUseMyLocation();
                }}
                className="w-full py-2 bg-cyan-500/10 hover:bg-cyan-500/20 active:scale-98 border border-cyan-500/20 text-cyan-300 text-[10px] font-sans font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                Usar GPS actual
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onCityChangeClick) onCityChangeClick();
                }}
                className="w-full py-2 bg-white/5 hover:bg-white/10 active:scale-98 border border-white/10 text-slate-200 text-[10px] font-sans font-bold rounded-lg transition-all cursor-pointer"
              >
                Cambiar ciudad
              </button>
              <button
                type="button"
                onClick={() => handleActionWithFeedback('¡Destino guardado con éxito!')}
                className="w-full py-1.5 bg-white/[0.01] hover:bg-white/5 text-purple-300 text-[9.5px] font-sans font-semibold rounded-lg transition-all cursor-pointer"
              >
                Guardar destino frecuente
              </button>
            </div>
          </div>
        );

      case 'setup':
      default:
        return (
          <div className="space-y-4">
            <p className="text-[10px] text-slate-300 leading-normal font-sans">
              Activa tu ubicación real para ver el clima exacto de donde estás, o busca una ciudad manualmente.
            </p>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  if (onUseMyLocation) onUseMyLocation();
                }}
                className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 active:scale-98 border border-cyan-500/30 text-white text-[10.5px] font-sans font-extrabold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.15)]"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Usar mi ubicación
              </button>
              
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onCityChangeClick) onCityChangeClick();
                }}
                className="w-full py-2.5 bg-white/5 hover:bg-white/10 active:scale-98 border border-white/10 text-slate-200 text-[10.5px] font-sans font-bold rounded-xl transition-all cursor-pointer"
              >
                Buscar ciudad
              </button>
            </div>

            <div className="flex gap-2 p-2 rounded-xl bg-white/[0.01] border border-white/5 text-[8.5px] text-slate-400 font-sans leading-normal">
              <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
              <span>Tu ubicación se usa solo para consultar el clima. No usamos ubicación en segundo plano.</span>
            </div>
          </div>
        );
    }
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-[99998] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in text-left pointer-events-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="location-setup-title"
    >
      <div 
        ref={panelRef}
        tabIndex={-1}
        className="relative w-full max-w-sm p-5 rounded-2xl border border-indigo-500/20 bg-[#090f1e]/95 backdrop-blur-xl shadow-2xl space-y-4 max-h-[calc(100vh-4rem)] overflow-y-auto outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button 
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-4 right-4 p-1 rounded-lg bg-white/[0.03] hover:bg-white/10 active:scale-95 transition-all text-slate-400 hover:text-slate-200 cursor-pointer"
          aria-label="Cerrar configuración de ubicación"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <div className="flex items-center justify-between border-b border-white/5 pb-2 pr-6">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span id="location-setup-title" className="text-[11px] font-mono font-bold text-slate-100 uppercase tracking-widest">
              {locationOrigin === 'setup' ? 'Configurar ubicación' : 'Gestionar ubicación'}
            </span>
          </div>
          <span className="text-[8px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20 uppercase">
            {locationOrigin === 'setup' ? 'INICIAL' : locationOrigin}
          </span>
        </div>

        {/* Render body */}
        {renderContent()}

        {/* GPS Error message helper if any */}
        {gpsError && !successMsg && !isGpsLoading && (
          <p className="text-[9.5px] text-rose-400 font-mono text-center p-2 rounded bg-rose-950/10 border border-rose-500/15 leading-normal animate-fade-in">
            ⚠️ {gpsError}
          </p>
        )}
      </div>
    </div>,
    document.body
  );
}

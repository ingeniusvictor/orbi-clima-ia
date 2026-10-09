import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Headphones, X } from 'lucide-react';

interface ZenSoundPopoverPortalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTrackId: string;
  setSelectedTrackId: (id: string) => void;
  customFileName: string | null;
  originalAudioMissing: boolean;
  isPlaying: boolean;
  isEnabled: boolean;
  isBlocked: boolean;
  volumeLevel: 'low' | 'medium' | 'high';
  setVolumeLevel: (level: 'low' | 'medium' | 'high') => void;
  handleToggleState: () => void;
  onSelectFileClick: () => void;
  handleResetOrbi: () => void;
}

export default function ZenSoundPopoverPortal({
  isOpen,
  onClose,
  selectedTrackId,
  setSelectedTrackId,
  customFileName,
  originalAudioMissing,
  isPlaying,
  isEnabled,
  isBlocked,
  volumeLevel,
  setVolumeLevel,
  handleToggleState,
  onSelectFileClick,
  handleResetOrbi
}: ZenSoundPopoverPortalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on ESC key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    // Focus panel for accessibility
    panelRef.current?.focus();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[99998] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in text-left pointer-events-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="zen-sound-title"
    >
      <div 
        ref={panelRef}
        tabIndex={-1}
        className="relative w-full max-w-sm p-5 rounded-2xl border border-cyan-500/20 bg-[#090f1e]/95 backdrop-blur-xl shadow-2xl space-y-4 max-h-[calc(100vh-4rem)] overflow-y-auto outline-none"
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
          aria-label="Cerrar ORBI Zen Sound"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <div className="flex items-center justify-between border-b border-white/5 pb-2 pr-6">
          <div className="flex items-center gap-1.5">
            <Headphones className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span id="zen-sound-title" className="text-[11px] font-mono font-bold text-slate-100 uppercase tracking-widest">ORBI ZEN SOUND</span>
          </div>
          <span className="text-[8px] font-mono font-bold text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">PREMIUM</span>
        </div>

        {/* Description */}
        <p className="text-[10px] text-slate-300 leading-normal font-sans">
          Sonido ambiental opcional para acompañar la experiencia climática.
        </p>

        <div className="space-y-2 border-t border-white/5 pt-2.5">
          {/* Status & Track Display */}
          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
            <div className="bg-white/[0.02] p-1.5 rounded-lg border border-white/5">
              <span className="text-slate-500 block text-[8px] uppercase tracking-wider">Estado</span>
              <span className={`font-bold ${isPlaying ? 'text-emerald-400' : isEnabled && isBlocked ? 'text-amber-400' : 'text-slate-400'}`}>
                {isPlaying ? '● Zen Activo' : isEnabled && isBlocked ? '▲ Tocar para Activar' : '○ Zen Apagado'}
              </span>
            </div>
            <div className="bg-white/[0.02] p-1.5 rounded-lg border border-white/5">
              <span className="text-slate-500 block text-[8px] uppercase tracking-wider">Fuente</span>
              <span className="text-cyan-300 font-bold truncate block" title={
                selectedTrackId === 'custom' ? `Local: ${customFileName || 'Cargando...'}` :
                selectedTrackId === 'zen_loop' ? 'ORBI Original' :
                selectedTrackId === 'classic_ambient' ? 'Classic Ambient' :
                selectedTrackId === 'none' ? 'Sin audio' : 'Crystal Arch'
              }>
                {selectedTrackId === 'custom' ? (customFileName ? `📁 ${customFileName}` : '📁 Mi Música') :
                 selectedTrackId === 'zen_loop' ? '🎼 ORBI Original' :
                 selectedTrackId === 'classic_ambient' ? '🎵 Classic Ambient' :
                 selectedTrackId === 'none' ? '🔇 Sin audio' : '🎼 Crystal Arch'}
              </span>
            </div>
          </div>

          {/* Warn if original file is missing */}
          {originalAudioMissing && selectedTrackId === 'zen_loop' && (
            <div className="bg-amber-950/20 border border-amber-500/15 p-2 rounded-lg text-[9px] text-amber-300 font-sans leading-normal">
              ⚠️ Audio ORBI original no encontrado. Puedes seleccionar un archivo local.
            </div>
          )}
        </div>

        {/* 1. Fuente de Audio Selection Pills */}
        <div className="space-y-1">
          <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block">Fuente de Audio</span>
          <div className="grid grid-cols-3 gap-1">
            <button
              type="button"
              onClick={() => {
                setSelectedTrackId('zen_loop');
                localStorage.setItem('orbiZenSoundTrackId', 'zen_loop');
                window.dispatchEvent(new Event('orbi_zen_sound_preference_changed'));
              }}
              className={`py-1 rounded-lg text-[9px] font-sans font-bold border transition-all cursor-pointer text-center ${
                selectedTrackId === 'zen_loop'
                  ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.1)]'
                  : 'bg-white/[0.02] border-white/5 text-slate-400 hover:bg-white/5'
              }`}
            >
              Original
            </button>
            <button
              type="button"
              onClick={async () => {
                onSelectFileClick();
              }}
              className={`py-1 rounded-lg text-[9px] font-sans font-bold border transition-all cursor-pointer text-center truncate px-0.5 ${
                selectedTrackId === 'custom'
                  ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.1)]'
                  : 'bg-white/[0.02] border-white/5 text-slate-400 hover:bg-white/5'
              }`}
            >
              Mi música
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedTrackId('none');
                localStorage.setItem('orbiZenSoundTrackId', 'none');
                window.dispatchEvent(new Event('orbi_zen_sound_preference_changed'));
              }}
              className={`py-1 rounded-lg text-[9px] font-sans font-bold border transition-all cursor-pointer text-center ${
                selectedTrackId === 'none'
                  ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.1)]'
                  : 'bg-white/[0.02] border-white/5 text-slate-400 hover:bg-white/5'
              }`}
            >
              Sin audio
            </button>
          </div>
        </div>

        {/* 2. Volumen Selection Pills */}
        <div className="space-y-1">
          <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block">Volumen</span>
          <div className="grid grid-cols-3 gap-1">
            <button
              type="button"
              onClick={() => setVolumeLevel('low')}
              className={`py-1 rounded-lg text-[9px] font-sans font-bold border transition-all cursor-pointer text-center ${
                volumeLevel === 'low'
                  ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                  : 'bg-white/[0.02] border-white/5 text-slate-400 hover:bg-white/5'
              }`}
            >
              Bajo
            </button>
            <button
              type="button"
              onClick={() => setVolumeLevel('medium')}
              className={`py-1 rounded-lg text-[9px] font-sans font-bold border transition-all cursor-pointer text-center ${
                volumeLevel === 'medium'
                  ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                  : 'bg-white/[0.02] border-white/5 text-slate-400 hover:bg-white/5'
              }`}
            >
              Medio
            </button>
            <button
              type="button"
              onClick={() => setVolumeLevel('high')}
              className={`py-1 rounded-lg text-[9px] font-sans font-bold border transition-all cursor-pointer text-center ${
                volumeLevel === 'high'
                  ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                  : 'bg-white/[0.02] border-white/5 text-slate-400 hover:bg-white/5'
              }`}
            >
              Alto
            </button>
          </div>
        </div>

        {/* Action buttons list */}
        <div className="pt-2 border-t border-white/5 space-y-1.5">
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleState();
              }}
              className={`flex-1 py-1.5 rounded-full text-[10px] font-sans font-bold cursor-pointer transition-all border text-center ${
                isEnabled
                  ? 'bg-rose-950/20 border-rose-500/30 text-rose-300 hover:bg-rose-950/40'
                  : 'bg-cyan-950/20 border-cyan-500/30 text-cyan-300 hover:bg-cyan-950/40'
              }`}
            >
              {isEnabled ? 'Desactivar Zen' : 'Activar Zen'}
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectFileClick();
              }}
              className="flex-1 py-1.5 rounded-full text-[10px] font-sans font-bold bg-white/[0.02] border border-white/10 text-slate-300 hover:bg-white/5 cursor-pointer transition-all text-center"
            >
              Seleccionar
            </button>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleResetOrbi();
            }}
            className="w-full py-1 rounded-lg text-[9.5px] font-sans font-semibold bg-white/[0.01] border border-white/5 text-slate-400 hover:bg-white/5 hover:text-slate-300 cursor-pointer transition-all text-center"
          >
            Restablecer sonido ORBI
          </button>
        </div>

        {/* Android Persistence Disclaimer if Selected custom */}
        {selectedTrackId === 'custom' && (
          <p className="text-[8px] text-slate-500 leading-tight font-sans">
            ℹ️ Por seguridad de Android, puede que debas volver a seleccionar el archivo después de cerrar la app.
          </p>
        )}

        {/* Privacy line */}
        <div className="pt-2 border-t border-white/[0.03] flex flex-col gap-1 text-[8px] text-slate-500 font-mono">
          <div className="flex items-center justify-between">
            <span>🛡️ Audio local · 100% privado</span>
            <span>Tu música no se comparte</span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

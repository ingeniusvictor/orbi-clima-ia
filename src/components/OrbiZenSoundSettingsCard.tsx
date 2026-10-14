import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Headphones, Music, ShieldCheck, Trash2, Upload } from 'lucide-react';
import { deleteCustomAudioTrack, saveCustomAudioTrack } from '../utils/audioDb';

const BUILT_IN_TRACK_ID = 'crystal_arch';

export default function OrbiZenSoundSettingsCard() {
  const [isEnabled, setIsEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('orbiZenSoundEnabled') === 'true';
    } catch {
      return false;
    }
  });

  const [selectedTrackId, setSelectedTrackId] = useState<string>(() => {
    try {
      const stored = localStorage.getItem('orbiZenSoundTrackId') || BUILT_IN_TRACK_ID;
      return stored === 'custom' ? 'custom' : BUILT_IN_TRACK_ID;
    } catch {
      return BUILT_IN_TRACK_ID;
    }
  });

  const [customFileName, setCustomFileName] = useState<string>(() => {
    try {
      return localStorage.getItem('orbiZenSoundCustomName') || '';
    } catch {
      return '';
    }
  });

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handlePreferenceChange = () => {
      try {
        setIsEnabled(localStorage.getItem('orbiZenSoundEnabled') === 'true');
        const stored = localStorage.getItem('orbiZenSoundTrackId') || BUILT_IN_TRACK_ID;
        setSelectedTrackId(stored === 'custom' ? 'custom' : BUILT_IN_TRACK_ID);
        setCustomFileName(localStorage.getItem('orbiZenSoundCustomName') || '');
      } catch {
        // Keep current UI state when local storage is unavailable.
      }
    };

    window.addEventListener('orbi_zen_sound_preference_changed', handlePreferenceChange);
    return () => window.removeEventListener('orbi_zen_sound_preference_changed', handlePreferenceChange);
  }, []);

  const notifyPreferenceChanged = () => {
    window.dispatchEvent(new Event('orbi_zen_sound_preference_changed'));
  };

  const handleToggle = () => {
    const nextValue = !isEnabled;
    setIsEnabled(nextValue);
    try {
      localStorage.setItem('orbiZenSoundEnabled', nextValue ? 'true' : 'false');
      notifyPreferenceChanged();
    } catch (error) {
      console.warn('Could not save Zen Sound preference:', error);
    }
  };

  const handleSelectTrack = (trackId: 'crystal_arch' | 'custom') => {
    if (trackId === 'custom' && !customFileName) {
      fileInputRef.current?.click();
      return;
    }

    setSelectedTrackId(trackId);
    try {
      localStorage.setItem('orbiZenSoundTrackId', trackId);
      notifyPreferenceChanged();
    } catch (error) {
      console.warn('Could not save Zen Sound source:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      setUploadError('Selecciona un archivo de audio válido del dispositivo.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      await saveCustomAudioTrack(file);
      setCustomFileName(file.name);
      setSelectedTrackId('custom');
      localStorage.setItem('orbiZenSoundCustomName', file.name);
      localStorage.setItem('orbiZenSoundTrackId', 'custom');
      notifyPreferenceChanged();
    } catch (error) {
      console.error('Error storing custom Zen audio:', error);
      setUploadError('No fue posible guardar este audio en ORBI Zen.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteCustomTrack = async (event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      await deleteCustomAudioTrack();
      setCustomFileName('');
      localStorage.removeItem('orbiZenSoundCustomName');

      if (selectedTrackId === 'custom') {
        setSelectedTrackId(BUILT_IN_TRACK_ID);
        localStorage.setItem('orbiZenSoundTrackId', BUILT_IN_TRACK_ID);
      }

      notifyPreferenceChanged();
    } catch (error) {
      console.error('Error deleting custom Zen audio:', error);
      setUploadError('No fue posible eliminar el audio local.');
    }
  };

  return (
    <div
      id="orbi-zen-sound-settings-card"
      className="p-5 rounded-2xl bg-[#090f1e]/80 border border-white/5 shadow-xl transition-all hover:border-white/10 text-left"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
          <Headphones className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-100 font-sans">ORBI Zen Sound</h3>
          <p className="text-xs text-slate-400 mt-0.5">Ambiente relajante opcional</p>
        </div>
      </div>

      <p className="text-xs text-slate-300 mb-4 leading-relaxed font-sans">
        Añade un fondo sonoro suave a la experiencia climática. Usa la pista Zen incluida de ORBI o elige un audio de tu propio dispositivo.
      </p>

      <button
        onClick={handleToggle}
        className={`w-full p-4 rounded-xl border text-left flex items-start justify-between gap-4 transition-all duration-300 cursor-pointer mb-5 ${
          isEnabled
            ? 'bg-cyan-500/5 border-cyan-500/40 text-slate-200 shadow-[0_0_15px_rgba(34,211,238,0.05)]'
            : 'bg-[#050914] border-white/5 hover:border-white/10 text-slate-400'
        }`}
        id="zen-sound-settings-toggle-btn"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-200 font-sans">Sonido Zen</span>
            <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${
              isEnabled
                ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/15'
                : 'text-slate-500 bg-white/5 border-white/5'
            }`}>
              {isEnabled ? 'Activo' : 'Inactivo'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed font-sans">
            {isEnabled
              ? 'Reproducción ambiental activa en segundo plano.'
              : 'Actívalo cuando quieras acompañar la experiencia con audio relajante.'}
          </p>
        </div>

        <div className={`shrink-0 flex items-center justify-center w-5 h-5 rounded-full border transition-all ${
          isEnabled
            ? 'border-cyan-400 bg-cyan-500/20 text-cyan-400'
            : 'border-white/10 bg-black/40 text-slate-600'
        }`}>
          {isEnabled && <CheckCircle2 className="w-3.5 h-3.5" />}
        </div>
      </button>

      <div className="space-y-2.5">
        <h4 className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
          Fuente de audio
        </h4>

        <button
          onClick={() => handleSelectTrack(BUILT_IN_TRACK_ID)}
          className={`w-full p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
            selectedTrackId === BUILT_IN_TRACK_ID
              ? 'bg-cyan-500/10 border-cyan-500/30 text-slate-100'
              : 'bg-white/[0.01] border-white/5 hover:bg-white/[0.03] text-slate-400'
          }`}
        >
          <Music className={`w-4 h-4 shrink-0 ${selectedTrackId === BUILT_IN_TRACK_ID ? 'text-cyan-400' : 'text-slate-500'}`} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-[11px] font-semibold text-slate-200">Beneath the Crystal Arch</p>
              <span className="text-[8px] font-mono font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/15 px-1.5 py-0.5 rounded uppercase">
                ORBI
              </span>
            </div>
            <p className="text-[9px] text-slate-500 mt-0.5">Pista Zen integrada · lista para usar</p>
          </div>
          {selectedTrackId === BUILT_IN_TRACK_ID && <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />}
        </button>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="audio/*"
          className="hidden"
        />

        {customFileName ? (
          <div
            onClick={() => handleSelectTrack('custom')}
            className={`w-full p-3 rounded-xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${
              selectedTrackId === 'custom'
                ? 'bg-purple-500/10 border-purple-500/30 text-slate-100'
                : 'bg-white/[0.01] border-white/5 hover:bg-white/[0.03] text-slate-400'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Music className={`w-4 h-4 shrink-0 ${selectedTrackId === 'custom' ? 'text-purple-400' : 'text-slate-500'}`} />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold text-slate-200 truncate">{customFileName}</p>
                <p className="text-[9px] text-slate-500 mt-0.5">Audio elegido desde tu dispositivo</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="px-2 py-1 rounded-lg bg-purple-500/10 border border-purple-500/15 text-[9px] font-semibold text-purple-300 hover:bg-purple-500/20 active:scale-95 transition-all cursor-pointer"
              >
                Cambiar
              </button>
              <button
                type="button"
                onClick={handleDeleteCustomTrack}
                className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 active:scale-95 transition-all cursor-pointer"
                title="Eliminar audio local de ORBI Zen"
                aria-label="Eliminar audio local de ORBI Zen"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full p-3 rounded-xl border border-dashed border-white/10 bg-white/[0.01] hover:bg-white/[0.03] hover:border-purple-500/30 text-left flex items-center gap-3 transition-all cursor-pointer disabled:opacity-50"
          >
            <Upload className="w-4 h-4 text-purple-400 shrink-0" />
            <div>
              <p className="text-[11px] font-semibold text-slate-300">Elegir audio de mi celular</p>
              <p className="text-[9px] text-slate-500 mt-0.5">MP3, M4A, OGG, WAV u otro formato compatible</p>
            </div>
          </button>
        )}

        {isUploading && (
          <p className="text-[10px] font-mono text-slate-400">Guardando audio local en ORBI Zen…</p>
        )}

        {uploadError && (
          <p className="text-[10px] font-medium text-red-400">{uploadError}</p>
        )}
      </div>

      <div className="mt-4 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <span className="text-[9.5px] font-mono text-emerald-400 uppercase font-bold tracking-wider">
            Audio local privado
          </span>
          <p className="text-[10.5px] text-slate-400 leading-normal font-sans mt-0.5">
            Si eliges un audio del teléfono, ORBI lo conserva solo dentro de la aplicación. No se sube ni se comparte con servidores.
          </p>
        </div>
      </div>
    </div>
  );
}

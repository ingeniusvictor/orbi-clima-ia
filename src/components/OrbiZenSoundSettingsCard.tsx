import React, { useState, useEffect, useRef } from 'react';
import { Headphones, ShieldCheck, Music, CheckCircle2, Upload, Play, Pause, Trash2 } from 'lucide-react';
import { saveCustomAudioTrack, getCustomAudioTrack, deleteCustomAudioTrack } from '../utils/audioDb';

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
      return localStorage.getItem('orbiZenSoundTrackId') || 'crystal_arch';
    } catch {
      return 'crystal_arch';
    }
  });

  const [customFileName, setCustomFileName] = useState<string>(() => {
    try {
      return localStorage.getItem('orbiZenSoundCustomName') || '';
    } catch {
      return '';
    }
  });

  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handlePreferenceChange = () => {
      try {
        setIsEnabled(localStorage.getItem('orbiZenSoundEnabled') === 'true');
        setSelectedTrackId(localStorage.getItem('orbiZenSoundTrackId') || 'crystal_arch');
        setCustomFileName(localStorage.getItem('orbiZenSoundCustomName') || '');
      } catch (e) {
        // Fallback
      }
    };

    window.addEventListener('orbi_zen_sound_preference_changed', handlePreferenceChange);
    return () => {
      window.removeEventListener('orbi_zen_sound_preference_changed', handlePreferenceChange);
    };
  }, []);

  const handleToggle = () => {
    const nextVal = !isEnabled;
    setIsEnabled(nextVal);
    try {
      localStorage.setItem('orbiZenSoundEnabled', nextVal ? 'true' : 'false');
      window.dispatchEvent(new Event('orbi_zen_sound_preference_changed'));
    } catch (e) {
      console.warn('Could not save Zen Sound preference:', e);
    }
  };

  const handleSelectTrack = (trackId: string) => {
    setSelectedTrackId(trackId);
    try {
      localStorage.setItem('orbiZenSoundTrackId', trackId);
      window.dispatchEvent(new Event('orbi_zen_sound_preference_changed'));
    } catch (e) {
      console.warn('Could not save track selection:', e);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate type (should be audio)
    if (!file.type.startsWith('audio/')) {
      setUploadError('Por favor selecciona un archivo de audio válido (.mp3, .ogg, .wav, .m4a, etc.)');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      await saveCustomAudioTrack(file);
      setCustomFileName(file.name);
      localStorage.setItem('orbiZenSoundCustomName', file.name);
      localStorage.setItem('orbiZenSoundTrackId', 'custom');
      setSelectedTrackId('custom');
      
      // Dispatch event to notify controller on the main screen to update the track source immediately
      window.dispatchEvent(new Event('orbi_zen_sound_preference_changed'));
    } catch (err) {
      console.error('Error storing custom track:', err);
      setUploadError('Error al guardar el archivo de música local en la base de datos de tu celular.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteCustomTrack = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid selecting track
    try {
      await deleteCustomAudioTrack();
      setCustomFileName('');
      localStorage.removeItem('orbiZenSoundCustomName');
      
      if (selectedTrackId === 'custom') {
        setSelectedTrackId('crystal_arch');
        localStorage.setItem('orbiZenSoundTrackId', 'crystal_arch');
      }
      
      window.dispatchEvent(new Event('orbi_zen_sound_preference_changed'));
    } catch (err) {
      console.error('Error deleting custom track:', err);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const tracks = [
    { id: 'crystal_arch', name: 'Beneath the Crystal Arch', desc: 'Melodía premium inmersiva (Recomendada)', isLocal: true },
    { id: 'zen_loop', name: 'Orbi Zen Loop v1', desc: 'Tonos solfeggio armónicos puros', isLocal: true },
    { id: 'classic_ambient', name: 'Orbi Zen Ambient', desc: 'Frecuencia ambiental clásica suave', isLocal: true }
  ];

  return (
    <div id="orbi-zen-sound-settings-card" className="p-5 rounded-2xl bg-[#090f1e]/80 border border-white/5 shadow-xl transition-all hover:border-white/10 text-left">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
          <Headphones className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-100 font-sans">ORBI Zen Sound</h3>
          <p className="text-xs text-slate-400 mt-0.5">Música y sonidos ambientales</p>
        </div>
      </div>

      <p className="text-xs text-slate-300 mb-4 leading-relaxed font-sans">
        Acompaña la experiencia visual de la esfera climática con un sonido ambiental armónico relajante en segundo plano. ¡Puedes usar nuestras pistas premium o elegir tu propia música desde tu celular!
      </p>

      {/* Main Toggle Action Card */}
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
            <span className="text-xs font-bold text-slate-200 font-sans">
              Sonido de Fondo en la Esfera
            </span>
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
              ? 'Sonando de forma sutil mientras contemplas el clima en tiempo real.' 
              : 'Silenciado. Toca aquí para activar y comenzar la reproducción ambiental.'}
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

      {/* Track Selection Section */}
      <div className="space-y-3 mb-4">
        <h4 className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider mb-2">
          Seleccionar Pista Musical
        </h4>

        {/* Predefined Tracks */}
        <div className="grid grid-cols-1 gap-2">
          {tracks.map((track) => (
            <button
              key={track.id}
              onClick={() => handleSelectTrack(track.id)}
              className={`w-full p-2.5 rounded-xl border text-left flex items-center gap-3 transition-all ${
                selectedTrackId === track.id
                  ? 'bg-cyan-500/10 border-cyan-500/30 text-slate-100'
                  : 'bg-white/[0.01] border-white/5 hover:bg-white/[0.03] text-slate-400'
              }`}
            >
              <Music className={`w-3.5 h-3.5 shrink-0 ${selectedTrackId === track.id ? 'text-cyan-400' : 'text-slate-500'}`} />
              <div className="min-w-0 flex-1">
                <p className={`text-[11px] font-medium leading-tight ${selectedTrackId === track.id ? 'text-cyan-300' : 'text-slate-300'}`}>
                  {track.name}
                </p>
                <p className="text-[9px] text-slate-500 mt-0.5 truncate">{track.desc}</p>
              </div>
              {selectedTrackId === track.id && (
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
              )}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-white/5 my-3"></div>

        {/* Custom Track option */}
        <div className="space-y-2">
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
                <Music className={`w-3.5 h-3.5 shrink-0 ${selectedTrackId === 'custom' ? 'text-purple-400' : 'text-slate-500'}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-mono text-purple-400 uppercase font-black tracking-wider bg-purple-500/10 px-1 py-0.2 rounded border border-purple-500/20">Mi Música</span>
                    <span className="text-[10px] text-slate-400 font-sans font-medium truncate">Música del Celular</span>
                  </div>
                  <p className="text-[11px] text-slate-200 truncate mt-1 font-mono">{customFileName}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {selectedTrackId === 'custom' && (
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                )}
                <button
                  onClick={handleDeleteCustomTrack}
                  className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 active:scale-95 transition-all cursor-pointer"
                  title="Eliminar música importada"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={triggerFileSelect}
              disabled={isUploading}
              className="w-full p-3 rounded-xl border border-dashed border-white/10 bg-white/[0.01] hover:bg-white/[0.03] hover:border-cyan-500/30 text-center flex flex-col items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <Upload className="w-5 h-5 text-slate-500 animate-bounce" />
              <div>
                <p className="text-[11px] font-medium text-slate-300 font-sans">Elegir música de mi celular</p>
                <p className="text-[9px] text-slate-500 mt-0.5">Sube cualquier archivo .mp3, .ogg o .wav</p>
              </div>
            </button>
          )}

          {isUploading && (
            <div className="flex items-center justify-center gap-2 py-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              <span className="text-[10px] font-mono text-slate-400">Importando y guardando de forma segura en tu celular...</span>
            </div>
          )}

          {uploadError && (
            <p className="text-[10px] font-medium text-red-400 mt-1">{uploadError}</p>
          )}
        </div>
      </div>

      {/* Privacy and UX Microcopy */}
      <div className="mt-4 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="text-[9.5px] font-mono text-emerald-400 uppercase font-bold tracking-wider">
            Garantía de Privacidad y UX
          </span>
          <p className="text-[10.5px] text-slate-400 leading-normal font-sans">
            La música importada se guarda directamente en la memoria local de la aplicación dentro de tu dispositivo. No se sube a internet ni se comparte con ningún servidor.
          </p>
        </div>
      </div>
    </div>
  );
}


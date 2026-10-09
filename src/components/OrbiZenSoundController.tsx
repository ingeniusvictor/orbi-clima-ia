import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Headphones, Info, X } from 'lucide-react';
import { getCustomAudioTrack, saveCustomAudioTrack } from '../utils/audioDb';
import ZenSoundPopoverPortal from './ZenSoundPopoverPortal';

// Globally cached single audio instance to avoid duplicate playbacks,
// dangling streams, or memory leaks during React's mount/unmount lifecycles.
function getGlobalAudioInstance(): HTMLAudioElement {
  if (typeof window === 'undefined') {
    return {} as HTMLAudioElement;
  }
  const win = window as any;
  if (!win._orbiZenAudio) {
    win._orbiZenAudio = new Audio();
    win._orbiZenAudio.loop = true;
    
    // Default to medium volume (0.35) or read saved preference
    let savedLevel = 'medium';
    try {
      savedLevel = localStorage.getItem('orbiZenSoundVolumeLevel') || 'medium';
    } catch {}
    const volMap: Record<string, number> = { low: 0.10, medium: 0.35, high: 0.65 };
    win._orbiZenAudio.volume = volMap[savedLevel] || 0.35;
  }
  return win._orbiZenAudio;
}

export default function OrbiZenSoundController() {
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

  const [customTrackUpdatedAt, setCustomTrackUpdatedAt] = useState<number>(0);
  const [customFileName, setCustomFileName] = useState<string | null>(null);
  
  const [isBlocked, setIsBlocked] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const [originalAudioMissing, setOriginalAudioMissing] = useState<boolean>(false);

  const [volumeLevel, setVolumeLevel] = useState<'low' | 'medium' | 'high'>(() => {
    try {
      return (localStorage.getItem('orbiZenSoundVolumeLevel') as 'low' | 'medium' | 'high') || 'medium';
    } catch {
      return 'medium';
    }
  });
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const customUrlRef = useRef<string | null>(null);
  const wasPlayingBeforeBackground = useRef<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Subscribe to changes in settings (e.g. tracks, enabling/disabling, new uploads)
  useEffect(() => {
    const handlePreferenceChange = () => {
      try {
        setIsEnabled(localStorage.getItem('orbiZenSoundEnabled') === 'true');
        setSelectedTrackId(localStorage.getItem('orbiZenSoundTrackId') || 'crystal_arch');
        setCustomTrackUpdatedAt(Date.now());
        const savedVol = localStorage.getItem('orbiZenSoundVolumeLevel') as 'low' | 'medium' | 'high';
        if (savedVol) {
          setVolumeLevel(savedVol);
        }
      } catch (e) {
        // Fallback
      }
    };

    window.addEventListener('orbi_zen_sound_preference_changed', handlePreferenceChange);
    return () => {
      window.removeEventListener('orbi_zen_sound_preference_changed', handlePreferenceChange);
    };
  }, []);

  // Check if original audio file is accessible
  useEffect(() => {
    fetch(`${window.location.origin}/audio/orbi-zen-loop-v1.mp3`, { method: 'HEAD' })
      .then(res => {
        if (!res.ok) {
          setOriginalAudioMissing(true);
        }
      })
      .catch(() => {
        setOriginalAudioMissing(true);
      });
  }, []);

  // Set the audio track custom name
  useEffect(() => {
    const loadTrackName = async () => {
      try {
        const track = await getCustomAudioTrack();
        if (track) {
          setCustomFileName(track.name);
        } else {
          setCustomFileName(null);
        }
      } catch (e) {
        console.warn(e);
      }
    };
    loadTrackName();
  }, [customTrackUpdatedAt, selectedTrackId]);

  // Handle dynamic volume configuration
  useEffect(() => {
    const audio = audioRef.current || getGlobalAudioInstance();
    if (audio) {
      const volMap = { low: 0.10, medium: 0.35, high: 0.65 };
      audio.volume = volMap[volumeLevel];
    }
    try {
      localStorage.setItem('orbiZenSoundVolumeLevel', volumeLevel);
    } catch (e) {}
  }, [volumeLevel]);

  // Handle dynamic audio sourcing and playing/pausing state
  useEffect(() => {
    const audio = getGlobalAudioInstance();
    audioRef.current = audio;

    let isSubscribed = true;

    // Handle fallback errors gracefully for bundled audio files
    const handleError = () => {
      if (!isSubscribed) return;
      const currentSrc = audio.src;
      console.warn('Zen audio error loading source:', currentSrc);

      if (currentSrc.startsWith('blob:')) {
        console.warn('Custom track failed, falling back to ambient...');
        audio.src = `${window.location.origin}/audio/orbi-zen-ambient.mp3`;
        if (isEnabled && isSubscribed) {
          audio.play().catch(e => console.warn('Fallback play failed:', e));
        }
      } else if (currentSrc.includes('orbi-zen-ambient.mp3')) {
        audio.src = `${window.location.origin}/audio/orbi-zen-loop-v1.mp3`;
        if (isEnabled && isSubscribed) {
          audio.play().catch(e => console.warn('Fallback play failed:', e));
        }
      } else if (currentSrc.includes('orbi-zen-loop-v1.mp3')) {
        audio.src = `${window.location.origin}/audio/orbi-zen-ambient.mp3`;
        if (isEnabled && isSubscribed) {
          audio.play().catch(e => console.warn('Fallback play failed:', e));
        }
      }
    };

    audio.addEventListener('error', handleError);

    const configureAudioSource = async () => {
      if (!isEnabled) {
        audio.pause();
        if (isSubscribed) {
          setIsPlaying(false);
        }
        return;
      }

      if (!isSubscribed) return;

      // Release the previous object URL to avoid memory leaks
      if (customUrlRef.current) {
        URL.revokeObjectURL(customUrlRef.current);
        customUrlRef.current = null;
      }

      if (selectedTrackId === 'custom') {
        try {
          const trackData = await getCustomAudioTrack();
          if (!isSubscribed) return;

          if (trackData && trackData.blob) {
            const objectUrl = URL.createObjectURL(trackData.blob);
            customUrlRef.current = objectUrl;
            audio.src = objectUrl;
          } else {
            console.warn('No custom audio found in local database, falling back to ambient');
            audio.src = `${window.location.origin}/audio/orbi-zen-ambient.mp3`;
          }
        } catch (err) {
          console.error('Failed to load custom audio from database:', err);
          if (isSubscribed) {
            audio.src = `${window.location.origin}/audio/orbi-zen-ambient.mp3`;
          }
        }
      } else if (selectedTrackId === 'zen_loop') {
        audio.src = `${window.location.origin}/audio/orbi-zen-loop-v1.mp3`;
      } else if (selectedTrackId === 'classic_ambient' || selectedTrackId === 'crystal_arch') {
        audio.src = `${window.location.origin}/audio/orbi-zen-ambient.mp3`;
      } else {
        // default
        audio.src = `${window.location.origin}/audio/orbi-zen-ambient.mp3`;
      }

      if (!isSubscribed) return;

      // Explicitly load the newly configured source
      audio.load();

      // Trigger playback if enabled
      if (isEnabled && isSubscribed) {
        try {
          await audio.play();
          if (isSubscribed) {
            setIsPlaying(true);
            setIsBlocked(false);
          } else {
            audio.pause();
          }
        } catch (err) {
          console.log('Playback blocked or failed. User gesture required:', err);
          if (isSubscribed) {
            setIsPlaying(false);
            setIsBlocked(true); // User must tap to start
          }
        }
      } else {
        audio.pause();
        if (isSubscribed) {
          setIsPlaying(false);
        }
      }
    };

    configureAudioSource();

    // Persist preference
    try {
      localStorage.setItem('orbiZenSoundEnabled', isEnabled ? 'true' : 'false');
    } catch (e) {
      console.warn('Could not persist Zen Sound preference:', e);
    }

    return () => {
      isSubscribed = false;
      audio.removeEventListener('error', handleError);
    };
  }, [isEnabled, selectedTrackId, customTrackUpdatedAt]);

  // Handle visibility changes (Android background / foreground cycle)
  useEffect(() => {
    const handleVisibilityChange = () => {
      const audio = audioRef.current;
      if (!audio) return;

      if (document.hidden) {
        // App went to background
        if (isPlaying) {
          wasPlayingBeforeBackground.current = true;
          audio.pause();
          setIsPlaying(false);
        } else {
          wasPlayingBeforeBackground.current = false;
        }
      } else {
        // App returned to foreground
        if (wasPlayingBeforeBackground.current && isEnabled) {
          // Attempt to resume playback silently
          audio.play()
            .then(() => {
              setIsPlaying(true);
              setIsBlocked(false);
            })
            .catch((err) => {
              console.log('Autoplay restriction after foreground resume:', err);
              setIsPlaying(false);
              setIsBlocked(true);
            });
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isPlaying, isEnabled]);

  // Clean up audio element on unmount
  useEffect(() => {
    return () => {
      const audio = audioRef.current || getGlobalAudioInstance();
      if (audio) {
        audio.pause();
      }
      if (customUrlRef.current) {
        URL.revokeObjectURL(customUrlRef.current);
        customUrlRef.current = null;
      }
    };
  }, []);

  const handleToggle = async () => {
    const audio = audioRef.current || getGlobalAudioInstance();
    if (!audio) return;

    if (isEnabled) {
      // Toggle off
      setIsEnabled(false);
      audio.pause();
      setIsPlaying(false);
      try {
        localStorage.setItem('orbiZenSoundEnabled', 'false');
        window.dispatchEvent(new Event('orbi_zen_sound_preference_changed'));
      } catch (e) {}
    } else {
      // Toggle on: ensure context / audio starts
      setIsEnabled(true);
      try {
        localStorage.setItem('orbiZenSoundEnabled', 'true');
        window.dispatchEvent(new Event('orbi_zen_sound_preference_changed'));
      } catch (e) {}
      // Explicitly trigger play on user click to bypass browser/Android autoplay block
      try {
        await audio.play();
        setIsPlaying(true);
        setIsBlocked(false);
      } catch (err) {
        console.warn('First-tap play triggered block:', err);
        setIsBlocked(true);
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate formats: mp3, ogg, wav, m4a
    const allowedExtensions = ['mp3', 'ogg', 'wav', 'm4a'];
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    if (!fileExt || !allowedExtensions.includes(fileExt)) {
      alert('Formato no permitido. Solo se permiten archivos .mp3, .ogg, .wav, .m4a');
      return;
    }

    try {
      await saveCustomAudioTrack(file);
      setSelectedTrackId('custom');
      localStorage.setItem('orbiZenSoundTrackId', 'custom');
      setCustomTrackUpdatedAt(Date.now());
      setIsEnabled(true);
      localStorage.setItem('orbiZenSoundEnabled', 'true');
      
      // Dispatch sync event
      window.dispatchEvent(new Event('orbi_zen_sound_preference_changed'));
      
      const audio = audioRef.current || getGlobalAudioInstance();
      if (audio) {
        audio.load();
        setTimeout(() => {
          audio.play().then(() => {
            setIsPlaying(true);
            setIsBlocked(false);
          }).catch(err => {
            console.warn(err);
            setIsBlocked(true);
          });
        }, 100);
      }
    } catch (err) {
      console.error('Error saving local music file:', err);
    }
  };

  const handleResetOrbi = () => {
    setSelectedTrackId('zen_loop');
    localStorage.setItem('orbiZenSoundTrackId', 'zen_loop');
    window.dispatchEvent(new Event('orbi_zen_sound_preference_changed'));
  };

  const handleToggleState = async () => {
    await handleToggle();
  };

  return (
    <div className="relative flex items-center gap-1.5" id="orbi-zen-sound-control-root">
      {/* Main toggle button */}
      <button
        onClick={handleToggle}
        className={`relative flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-all duration-300 cursor-pointer select-none h-7 min-w-[72px] justify-center ${
          isPlaying
            ? 'bg-cyan-950/40 border-cyan-500/30 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.15)]'
            : isEnabled && isBlocked
            ? 'bg-amber-950/40 border-amber-500/30 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.15)]'
            : 'bg-white/[0.02] border-white/5 text-slate-400 hover:bg-white/5 hover:text-slate-300'
        }`}
        aria-label={isPlaying ? 'Desactivar sonido ambiental' : 'Activar sonido ambiental'}
        id="zen-sound-toggle-btn"
      >
        {isPlaying ? (
          <>
            <div className="flex items-center gap-0.5 h-1.5">
              <span className="w-0.5 bg-cyan-400 rounded-full animate-soundwave-bar-1 h-full"></span>
              <span className="w-0.5 bg-cyan-400 rounded-full animate-soundwave-bar-2 h-full"></span>
              <span className="w-0.5 bg-cyan-400 rounded-full animate-soundwave-bar-3 h-full"></span>
            </div>
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider">ZEN</span>
          </>
        ) : isEnabled && isBlocked ? (
          <>
            <Headphones className="w-3 h-3 shrink-0 animate-bounce" />
            <span className="text-[8px] font-mono font-bold uppercase tracking-tight">TOCAR</span>
          </>
        ) : (
          <>
            <VolumeX className="w-3 h-3 shrink-0 opacity-60" />
            <span className="text-[9px] font-mono font-semibold uppercase tracking-wider opacity-65">OFF</span>
          </>
        ) as any}
      </button>

      {/* Tooltip trigger or info */}
      <button
        onClick={() => setShowTooltip(!showTooltip)}
        className="p-1 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/5 active:scale-95 transition-all text-slate-500 hover:text-slate-300 cursor-pointer select-none h-7 w-7 flex items-center justify-center"
        aria-label="Información de sonido ambiental"
        title="Información de sonido ambiental"
        id="zen-sound-info-btn"
      >
        <Info className="w-3 h-3" />
      </button>      {/* Zen sound portal render */}
      <ZenSoundPopoverPortal
        isOpen={showTooltip}
        onClose={() => setShowTooltip(false)}
        selectedTrackId={selectedTrackId}
        setSelectedTrackId={setSelectedTrackId}
        customFileName={customFileName}
        originalAudioMissing={originalAudioMissing}
        isPlaying={isPlaying}
        isEnabled={isEnabled}
        isBlocked={isBlocked}
        volumeLevel={volumeLevel}
        setVolumeLevel={setVolumeLevel}
        handleToggleState={handleToggleState}
        onSelectFileClick={() => fileInputRef.current?.click()}
        handleResetOrbi={handleResetOrbi}
      />

      {/* Hidden input for local file selection */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".mp3,.ogg,.wav,.m4a,audio/*"
        className="hidden"
      />
    </div>
  );
}

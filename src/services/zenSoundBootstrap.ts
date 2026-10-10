declare global {
  interface Window {
    _orbiZenAudio?: HTMLAudioElement;
  }
}

const ORIGINAL_ORBI_ZEN_PATH = '/audio/orbi-zen-ambient.mp3';

const BUILT_IN_TRACKS: Record<string, string> = {
  crystal_arch: ORIGINAL_ORBI_ZEN_PATH,
  classic_ambient: ORIGINAL_ORBI_ZEN_PATH,
  zen_loop: ORIGINAL_ORBI_ZEN_PATH,
};

const TRACK_KEY = 'orbiZenSoundTrackId';

function normalizeBuiltInTrackId(trackId: string): string {
  if (trackId === 'classic_ambient' || trackId === 'zen_loop') {
    return 'crystal_arch';
  }
  return trackId;
}

function resolveBuiltInUrl(trackId: string): string | null {
  const path = BUILT_IN_TRACKS[normalizeBuiltInTrackId(trackId)];
  if (!path) return null;
  return new URL(path, document.baseURI).href;
}

function primeSelectedBuiltInTrack(): void {
  const storedTrackId = localStorage.getItem(TRACK_KEY) || 'crystal_arch';
  const selectedTrackId = normalizeBuiltInTrackId(storedTrackId);

  if (selectedTrackId !== storedTrackId) {
    localStorage.setItem(TRACK_KEY, selectedTrackId);
  }

  if (selectedTrackId === 'custom') return;

  const audio = window._orbiZenAudio ?? new Audio();
  window._orbiZenAudio = audio;
  audio.loop = true;
  audio.preload = 'auto';

  if (selectedTrackId === 'none') {
    audio.pause();
    audio.removeAttribute('src');
    return;
  }

  const sourceUrl = resolveBuiltInUrl(selectedTrackId);
  if (!sourceUrl) return;

  if (audio.src !== sourceUrl) {
    audio.src = sourceUrl;
    audio.load();
  }
}

/**
 * Prepares the bundled ORBI Zen track even while Zen is OFF and migrates
 * deprecated built-in track ids to the verified Crystal Arch source.
 */
export function initializeZenSoundBootstrap(): () => void {
  if (typeof window === 'undefined' || typeof Audio === 'undefined') {
    return () => undefined;
  }

  try {
    primeSelectedBuiltInTrack();
  } catch (error) {
    console.warn('ORBI Zen bootstrap skipped:', error);
  }

  const handlePreferenceChanged = () => {
    queueMicrotask(() => {
      try {
        primeSelectedBuiltInTrack();
      } catch (error) {
        console.warn('ORBI Zen source refresh skipped:', error);
      }
    });
  };

  window.addEventListener('orbi_zen_sound_preference_changed', handlePreferenceChanged);
  return () => window.removeEventListener('orbi_zen_sound_preference_changed', handlePreferenceChanged);
}

declare global {
  interface Window {
    _orbiZenAudio?: HTMLAudioElement;
  }
}

// Keep the long-standing bundled asset path so existing controller/runtime code
// remains compatible. The bytes at this path are the verified original
// Beneath the Crystal Arch track once the binary source restoration lands.
const ORIGINAL_ORBI_ZEN_PATH = '/audio/orbi-zen-ambient.mp3';

const BUILT_IN_TRACKS: Record<string, string> = {
  crystal_arch: ORIGINAL_ORBI_ZEN_PATH,
  // Legacy ids are intentionally migrated to the verified original track.
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

  // The controller owns custom IndexedDB Blob URLs. Do not replace them here.
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
 * Prepares the bundled ORBI Zen track even while Zen is OFF.
 *
 * The existing controller starts playback synchronously from the user's first tap.
 * Priming the verified original source here keeps the first tap inside
 * Android/WebView's allowed user gesture and migrates deprecated built-in ids.
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

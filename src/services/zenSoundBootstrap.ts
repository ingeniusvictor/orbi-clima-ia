declare global {
  interface Window {
    _orbiZenAudio?: HTMLAudioElement;
  }
}

const BUILT_IN_TRACKS: Record<string, string> = {
  crystal_arch: '/audio/orbi-zen-ambient.mp3',
  classic_ambient: '/audio/orbi-zen-ambient.mp3',
  zen_loop: '/audio/orbi-zen-loop-v1.mp3',
};

const TRACK_KEY = 'orbiZenSoundTrackId';

function resolveBuiltInUrl(trackId: string): string | null {
  const path = BUILT_IN_TRACKS[trackId];
  if (!path) return null;
  return new URL(path, document.baseURI).href;
}

function primeSelectedBuiltInTrack(): void {
  const selectedTrackId = localStorage.getItem(TRACK_KEY) || 'crystal_arch';

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
 * Previously the built-in source was assigned only after React observed the enabled
 * state, so that first tap could call play() on an empty Audio element. A custom file
 * worked because selecting it assigned a Blob source first. Priming the built-in source
 * here keeps the first tap inside Android/WebView's allowed user gesture.
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

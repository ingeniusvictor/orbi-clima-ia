import { isAndroidNativeRuntime } from './androidRuntimeDiagnosticsService';

const SKIN_CLASS = 'orbi-android-fluid-skin';
const ORB_SELECTOR = '#orbi-climate-core-container > div.relative > div.relative.overflow-hidden.z-10';
const ATMOSPHERE_SELECTOR = '#orbi-living-weather-atmosphere';

const durationByScene: Record<string, number> = {
  storm: 3,
  hot: 4,
  rain: 5,
  wind: 5.5,
  sunny: 6,
  clear: 6,
  partly_cloudy: 7,
  cloudy: 7,
  cold: 8,
  night: 9,
  fog: 10,
};

function resolveFluidDurationSeconds() {
  const scene = document.querySelector<HTMLElement>(ATMOSPHERE_SELECTOR)?.dataset.scene || 'cloudy';
  return durationByScene[scene] ?? 7;
}

function syncSkinFromOrb(orb: HTMLElement, skin: HTMLDivElement) {
  const style = window.getComputedStyle(orb);

  // Reuse the exact rendered weather gradient and glow produced by the protected
  // Golden Orb. The skin is decorative only and never contains text/icon content.
  skin.style.backgroundImage = style.backgroundImage;
  skin.style.backgroundColor = style.backgroundColor;
  skin.style.boxShadow = style.boxShadow;
  skin.style.borderColor = style.borderColor;
  skin.style.width = `${orb.offsetWidth}px`;
  skin.style.height = `${orb.offsetHeight}px`;
  skin.style.setProperty('--orbi-fluid-duration', `${resolveFluidDurationSeconds()}s`);
}

function attachSkin(): (() => void) | null {
  const orb = document.querySelector<HTMLElement>(ORB_SELECTOR);
  if (!orb) return null;

  const parent = orb.parentElement;
  if (!parent) return null;

  let skin = parent.querySelector<HTMLDivElement>(`:scope > .${SKIN_CLASS}`);
  if (!skin) {
    skin = document.createElement('div');
    skin.className = SKIN_CLASS;
    skin.setAttribute('aria-hidden', 'true');
    parent.insertBefore(skin, orb);
  }

  syncSkinFromOrb(orb, skin);

  const resizeObserver = new ResizeObserver(() => syncSkinFromOrb(orb, skin!));
  resizeObserver.observe(orb);

  const orbObserver = new MutationObserver(() => syncSkinFromOrb(orb, skin!));
  orbObserver.observe(orb, {
    attributes: true,
    attributeFilter: ['class', 'style'],
  });

  const atmosphere = document.querySelector<HTMLElement>(ATMOSPHERE_SELECTOR);
  const atmosphereObserver = atmosphere
    ? new MutationObserver(() => syncSkinFromOrb(orb, skin!))
    : null;
  atmosphereObserver?.observe(atmosphere!, {
    attributes: true,
    attributeFilter: ['data-scene'],
  });

  return () => {
    resizeObserver.disconnect();
    orbObserver.disconnect();
    atmosphereObserver?.disconnect();
    skin?.remove();
  };
}

/**
 * Android-only visual companion for the Golden Orb.
 *
 * The real Orb keeps a stable circular clip so WebView never rasterizes the
 * icon/temperature inside a deforming overflow-hidden surface. This companion
 * layer sits behind it and carries the original fluid silhouette motion only.
 */
export function initializeAndroidGoldenOrbFluidSkin(): () => void {
  if (!isAndroidNativeRuntime() || typeof window === 'undefined') {
    return () => undefined;
  }

  let detachSkin: (() => void) | null = null;

  const ensureSkin = () => {
    const orbExists = Boolean(document.querySelector(ORB_SELECTOR));
    const skinExists = Boolean(document.querySelector(`.${SKIN_CLASS}`));

    if (orbExists && !skinExists) {
      detachSkin?.();
      detachSkin = attachSkin();
    } else if (!orbExists && skinExists) {
      detachSkin?.();
      detachSkin = null;
    }
  };

  const root = document.getElementById('root');
  const rootObserver = root ? new MutationObserver(ensureSkin) : null;
  rootObserver?.observe(root!, { childList: true, subtree: true });

  // React has not necessarily committed Home yet when bootstrap runs.
  const firstAttach = window.requestAnimationFrame(ensureSkin);

  return () => {
    window.cancelAnimationFrame(firstAttach);
    rootObserver?.disconnect();
    detachSkin?.();
  };
}

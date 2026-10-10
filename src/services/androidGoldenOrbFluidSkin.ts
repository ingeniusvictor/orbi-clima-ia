import { isAndroidNativeRuntime } from './androidRuntimeDiagnosticsService';

const SKIN_CLASS = 'orbi-android-fluid-skin';
const ORB_SELECTOR = '#orbi-climate-core-container > div.relative > div.relative.overflow-hidden.z-10';

function syncSkinFromOrb(orb: HTMLElement, skin: HTMLDivElement) {
  const style = window.getComputedStyle(orb);

  // Reuse the exact rendered weather gradient and glow produced by the protected
  // Golden Orb. The skin is decorative only and never contains text/icon content.
  skin.style.backgroundImage = style.backgroundImage;
  skin.style.backgroundColor = style.backgroundColor;
  skin.style.boxShadow = style.boxShadow;
  skin.style.borderColor = style.borderColor;

  const duration = style.getPropertyValue('--orbi-fluid-duration').trim();
  if (duration) {
    skin.style.setProperty('--orbi-fluid-duration', duration);
  }
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

  const resizeObserver = new ResizeObserver(() => {
    skin!.style.width = `${orb.offsetWidth}px`;
    skin!.style.height = `${orb.offsetHeight}px`;
  });
  resizeObserver.observe(orb);

  skin.style.width = `${orb.offsetWidth}px`;
  skin.style.height = `${orb.offsetHeight}px`;

  const mutationObserver = new MutationObserver(() => syncSkinFromOrb(orb, skin!));
  mutationObserver.observe(orb, {
    attributes: true,
    attributeFilter: ['class', 'style'],
  });

  return () => {
    resizeObserver.disconnect();
    mutationObserver.disconnect();
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
  let raf = 0;

  const ensureSkin = () => {
    if (!document.hidden && !document.querySelector(`.${SKIN_CLASS}`)) {
      detachSkin = attachSkin();
    }
    raf = window.requestAnimationFrame(ensureSkin);
  };

  raf = window.requestAnimationFrame(ensureSkin);

  return () => {
    window.cancelAnimationFrame(raf);
    detachSkin?.();
  };
}

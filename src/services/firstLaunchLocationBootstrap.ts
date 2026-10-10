import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';

const ONBOARDING_KEY = 'orbi_clima_first_launch_completed_v1';
const BOOTSTRAP_SESSION_KEY = 'orbi_clima_first_location_bootstrap_v1';
const POLL_MS = 150;
const MAX_WAIT_MS = 10 * 60 * 1000;

function hasGrantedLocation(status: { location?: string; coarseLocation?: string }): boolean {
  return status.location === 'granted' || status.coarseLocation === 'granted';
}

/**
 * Fresh-install Android location bootstrap.
 *
 * It deliberately starts only when the app booted before onboarding was complete.
 * Existing users are never surprised by a new permission dialog. Once the fourth
 * onboarding slide is completed, Android asks for foreground location immediately.
 * When granted we reload once; App's existing granted-permission startup path then
 * resolves GPS + weather automatically. Denial leaves the normal manual city/GPS
 * controls available and never traps the user.
 */
export function initializeFirstLaunchLocationBootstrap(): () => void {
  if (typeof window === 'undefined') return () => undefined;

  try {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') {
      return () => undefined;
    }
  } catch {
    return () => undefined;
  }

  const completedAtBoot = localStorage.getItem(ONBOARDING_KEY) === 'true';
  if (completedAtBoot || sessionStorage.getItem(BOOTSTRAP_SESSION_KEY) === 'done') {
    return () => undefined;
  }

  let stopped = false;
  let requesting = false;
  const startedAt = Date.now();

  const stop = () => {
    stopped = true;
    window.clearInterval(intervalId);
  };

  const attemptBootstrap = async () => {
    if (stopped || requesting) return;
    if (Date.now() - startedAt > MAX_WAIT_MS) {
      stop();
      return;
    }
    if (localStorage.getItem(ONBOARDING_KEY) !== 'true') return;

    requesting = true;
    stop();

    try {
      let permission = await Geolocation.checkPermissions();
      if (!hasGrantedLocation(permission)) {
        permission = await Geolocation.requestPermissions();
      }

      sessionStorage.setItem(BOOTSTRAP_SESSION_KEY, 'done');

      if (hasGrantedLocation(permission)) {
        // Reload once so App's existing startup flow sees a granted permission and
        // immediately resolves the device position + live weather without scrolling.
        window.setTimeout(() => window.location.reload(), 80);
      }
    } catch (error) {
      sessionStorage.setItem(BOOTSTRAP_SESSION_KEY, 'done');
      console.warn('First-launch location bootstrap skipped:', error);
    }
  };

  const intervalId = window.setInterval(() => {
    void attemptBootstrap();
  }, POLL_MS);

  return stop;
}

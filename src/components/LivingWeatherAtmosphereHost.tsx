import { useEffect, useMemo, useState } from 'react';
import LivingWeatherAtmosphere from './LivingWeatherAtmosphere';
import { CurrentWeather, DailyForecast, WeatherLocation } from '../types/weatherTypes';
import { loadLastWeatherBundle } from '../services/weatherCacheService';
import {
  ATMOSPHERE_DEBUG_EVENT,
  applyAtmosphereDebugPreset,
  getAtmosphereDebugPreset,
} from '../services/weatherAtmosphereDebugService';
import '../styles/living-weather-host.css';

interface WeatherAtmosphereSnapshot {
  location: WeatherLocation;
  current: CurrentWeather;
  daily: DailyForecast[];
}

function readSnapshot(): WeatherAtmosphereSnapshot | null {
  const bundle = loadLastWeatherBundle();
  if (!bundle?.location || !bundle?.current) return null;
  return {
    location: bundle.location,
    current: bundle.current,
    daily: Array.isArray(bundle.daily) ? bundle.daily : [],
  };
}

function isHomeScreenMounted(): boolean {
  return typeof document !== 'undefined' && Boolean(document.getElementById('orbi-mobile-home-screen'));
}

export default function LivingWeatherAtmosphereHost() {
  const [snapshot, setSnapshot] = useState<WeatherAtmosphereSnapshot | null>(() => readSnapshot());
  const [homeVisible, setHomeVisible] = useState(() => isHomeScreenMounted());
  const [debugPreset, setDebugPreset] = useState(() => getAtmosphereDebugPreset());
  const [onboardingDone, setOnboardingDone] = useState(() => {
    try {
      return localStorage.getItem('orbi_clima_first_launch_completed_v1') === 'true';
    } catch {
      return true;
    }
  });

  useEffect(() => {
    const refresh = () => setSnapshot(readSnapshot());
    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'orbi_clima_last_weather_bundle_v1') refresh();
    };
    const handleWeatherUpdate = () => refresh();
    const handleDebugChange = () => setDebugPreset(getAtmosphereDebugPreset());

    window.addEventListener('storage', handleStorage);
    window.addEventListener('orbi-weather-bundle-updated', handleWeatherUpdate);
    window.addEventListener(ATMOSPHERE_DEBUG_EVENT, handleDebugChange);

    // Observe only mount/unmount changes so the atmosphere can pause as soon as
    // the user leaves Home, without coupling this host to App navigation state.
    const navigationObserver = new MutationObserver(() => {
      setHomeVisible(isHomeScreenMounted());
    });
    navigationObserver.observe(document.body, { childList: true, subtree: true });
    queueMicrotask(() => setHomeVisible(isHomeScreenMounted()));

    // First-launch completion currently lives inside the onboarding component.
    // Short-lived polling keeps this host decoupled from that protected flow and
    // prevents atmosphere layers from appearing over the onboarding slides.
    const onboardingWatch = window.setInterval(() => {
      try {
        const done = localStorage.getItem('orbi_clima_first_launch_completed_v1') === 'true';
        if (done) {
          setOnboardingDone(true);
          window.clearInterval(onboardingWatch);
          refresh();
        }
      } catch {
        window.clearInterval(onboardingWatch);
      }
    }, 750);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('orbi-weather-bundle-updated', handleWeatherUpdate);
      window.removeEventListener(ATMOSPHERE_DEBUG_EVENT, handleDebugChange);
      navigationObserver.disconnect();
      window.clearInterval(onboardingWatch);
    };
  }, []);

  const renderedCurrent = useMemo(() => {
    if (!snapshot) return null;
    return applyAtmosphereDebugPreset(snapshot.current, debugPreset);
  }, [snapshot, debugPreset]);

  if (!onboardingDone || !snapshot || !renderedCurrent) return null;

  return (
    <div
      className="orbi-living-weather-host"
      data-debug-scene={debugPreset}
      aria-hidden="true"
    >
      <LivingWeatherAtmosphere
        currentWeather={renderedCurrent}
        dailyForecast={snapshot.daily[0]}
        timezone={snapshot.location.timezone}
        active={homeVisible}
      />
    </div>
  );
}
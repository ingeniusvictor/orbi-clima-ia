import { useEffect, useState } from 'react';
import LivingWeatherAtmosphere from './LivingWeatherAtmosphere';
import { CurrentWeather, DailyForecast, WeatherLocation } from '../types/weatherTypes';
import { loadLastWeatherBundle } from '../services/weatherCacheService';
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

export default function LivingWeatherAtmosphereHost() {
  const [snapshot, setSnapshot] = useState<WeatherAtmosphereSnapshot | null>(() => readSnapshot());
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

    window.addEventListener('storage', handleStorage);
    window.addEventListener('orbi-weather-bundle-updated', handleWeatherUpdate);

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
      window.clearInterval(onboardingWatch);
    };
  }, []);

  if (!onboardingDone || !snapshot) return null;

  return (
    <div className="orbi-living-weather-host" aria-hidden="true">
      <LivingWeatherAtmosphere
        currentWeather={snapshot.current}
        dailyForecast={snapshot.daily[0]}
        timezone={snapshot.location.timezone}
      />
    </div>
  );
}

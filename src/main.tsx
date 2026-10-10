import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import LivingWeatherAtmosphereHost from './components/LivingWeatherAtmosphereHost';
import AtmosphereLabOverlay from './components/AtmosphereLabOverlay';
import { initializeFirstLaunchLocationBootstrap } from './services/firstLaunchLocationBootstrap';
import { initializeZenSoundBootstrap } from './services/zenSoundBootstrap';
import { isAndroidNativeRuntime } from './services/androidRuntimeDiagnosticsService';
import './index.css';
import './styles/home-atmosphere.css';
import './styles/home-density.css';
import './styles/android-compositor-guard.css';
import './styles/living-weather-visibility.css';
import './styles/living-weather-clouds-v2.css';
import './styles/living-weather-natural-v3.css';
import './styles/living-weather-android-safe.css';

// Activate the Android compositor guard before React's first paint. App also
// re-checks platform after mount; this early class closes the first-frame gap.
if (isAndroidNativeRuntime()) {
  document.documentElement.classList.add('capacitor-android', 'android-webview');
}

initializeFirstLaunchLocationBootstrap();
initializeZenSoundBootstrap();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LivingWeatherAtmosphereHost />
    <App />
    <AtmosphereLabOverlay />
  </StrictMode>,
);

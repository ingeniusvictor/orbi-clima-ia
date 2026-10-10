import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { initializeFirstLaunchLocationBootstrap } from './services/firstLaunchLocationBootstrap';
import { initializeZenSoundBootstrap } from './services/zenSoundBootstrap';
import './index.css';
import './styles/home-atmosphere.css';
import './styles/home-density.css';
import './styles/android-compositor-guard.css';

initializeFirstLaunchLocationBootstrap();
initializeZenSoundBootstrap();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

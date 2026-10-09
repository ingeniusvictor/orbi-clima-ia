import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.orbi.clima',
  appName: 'ORBI Clima IA',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;

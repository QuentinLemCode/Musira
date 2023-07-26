import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.musira.app',
  appName: 'Musira',
  webDir: '../../dist/apps/musira',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',
  },
};

export default config;

import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lynupstock.app',
  appName: 'Lynup Stock',
  webDir: 'dist',
  server: {
    androidScheme: 'http',
    cleartext: true, // Pour le développement local
  },
  plugins: {
    CapacitorCookies: {
      enabled: true,
    },
    CapacitorHttp: {
      enabled: true,
    },
  },
};

export default config;

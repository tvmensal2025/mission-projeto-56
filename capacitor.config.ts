import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.94a97375ac4d47f4bf1da6ea0bef1040',
  appName: 'mission-health-nexus-32',
  webDir: 'dist',
  server: {
    url: 'https://94a97375-ac4d-47f4-bf1d-a6ea0bef1040.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    }
  }
};

export default config;
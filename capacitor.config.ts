import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.budgeting.financial',
  appName: 'Budgeting',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;

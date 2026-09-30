import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.budgeting.financial',
  appName: 'Budgeting',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    allowNavigation: [
      'gen-lang-client-0744448280.firebaseapp.com',
      '*.firebaseapp.com',
      '*.googleapis.com',
      'accounts.google.com',
      '*.google.com',
    ],
  },
  android: {
    allowMixedContent: true,
  },
};

export default config;

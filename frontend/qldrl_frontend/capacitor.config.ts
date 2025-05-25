import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.huit.drl',
  appName: 'DiemRenLuyenApp',
  webDir: 'build',
  server: {
    androidScheme: 'https'
  }
};

export default config;
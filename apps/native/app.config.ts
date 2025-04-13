import type { ConfigContext, ExpoConfig } from 'expo/config'

const configs = ({ config }: ConfigContext) =>
  ({
    ...config,
    name: 'native',
    slug: 'native',
    scheme: 'native',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    userInterfaceStyle: 'automatic',
    updates: { fallbackToCacheTimeout: 0 },
    assetBundlePatterns: ['assets/**/*'],
    newArchEnabled: true,
    ios: {
      bundleIdentifier: 'com.yuki.native',
      supportsTablet: true,
    },
    android: {
      package: 'com.yuki.native',
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      edgeToEdgeEnabled: true,
    },
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          backgroundColor: '#ffffff',
          image: './assets/images/splash-icon.png',
          dark: {
            backgroundColor: '#000000',
            image: './assets/images/splash-icon.png',
          },
        },
      ],
    ],
    experiments: {
      tsconfigPaths: true,
      typedRoutes: true,
    },
  }) satisfies ExpoConfig

export default configs

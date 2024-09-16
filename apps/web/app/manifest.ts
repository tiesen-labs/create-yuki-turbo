/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { MetadataRoute } from 'next'

import { seo } from '@/lib/seo'

const manifest = (): MetadataRoute.Manifest => ({
  name: seo({}).applicationName!,
  short_name: seo({}).applicationName!,
  description: seo({}).description!,
  display: 'standalone',
  start_url: '/',
  background_color: '#ffffff',
  theme_color: '#ffffff',
  icons: [
    { src: '/favicon.ico', sizes: 'any', type: 'image/x-icon' },
    { src: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    { src: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    { src: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    { src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
    { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
  ],
})

export default manifest

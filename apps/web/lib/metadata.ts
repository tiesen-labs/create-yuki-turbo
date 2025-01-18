import type { Metadata } from 'next'

import { getBaseUrl } from '@/lib/utils'

export const createMetadata = (
  overides: Omit<Metadata, 'title'> & { title: string },
): Metadata => {
  const siteName = 'Create Yuki Turbo'

  const url = overides.openGraph?.url
    ? `${getBaseUrl()}${overides.openGraph.url}`
    : getBaseUrl()
  const images = [
    ...((overides.openGraph?.images as [] | null) ?? []),
    'https://tiesen.id.vn/api/og', // Or create your own API route to generate OG images in `/app/api/og`
  ]

  return {
    ...overides,
    metadataBase: new URL(getBaseUrl()),
    title: overides.title ? `${siteName} | ${overides.title}` : siteName,
    description:
      overides.description ??
      'Clean and typesafe starter monorepo using Turborepo along with Next.js and tRPC ',
    applicationName: siteName,
    alternates: { canonical: url },
    twitter: { card: 'summary_large_image' },
    openGraph: { url, images, siteName, type: 'website', ...overides.openGraph },
    icons: {
      // Replace with your own icons
      icon: 'https://tiesen.id.vn/favicon.ico',
      shortcut: 'https://tiesen.id.vn/favicon-16x16.png',
      apple: 'https://tiesen.id.vn/apple-touch-icon.png',
    },
  }
}

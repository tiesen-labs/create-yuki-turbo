import type { Metadata as NextMetadata } from 'next'

import { getBaseUrl } from '@/lib/utils'

type Metadata = Omit<NextMetadata, 'title' | 'keywords'> & {
  title: string
  keywords: string[]
}

export const createMetadata = (override: Partial<Metadata> = {}): Metadata => {
  const siteName = 'Create Yuki Turbo'
  const title = override.title ? `${override.title} | ${siteName}` : siteName
  const description =
    override.description ??
    'Clean and typesafe starter monorepo using Turborepo along with Next.js and tRPC '

  const url = `${getBaseUrl()}${override.openGraph?.url ?? ''}`

  return {
    ...override,
    metadataBase: new URL(getBaseUrl()),
    applicationName: siteName,
    title,
    description,
    keywords: [...(override.keywords ?? []), 'TypeScript', 'Turborepo'],
    openGraph: {
      type: 'website',
      url,
      title,
      description,
      siteName,
      images: [
        { url: '/api/og', alt: title },
        ...(Array.isArray(override.openGraph?.images)
          ? override.openGraph.images
          : override.openGraph?.images
            ? [override.openGraph.images]
            : []),
      ],
      ...override.openGraph,
    },
    twitter: {
      card: 'summary_large_image',
      ...override.twitter,
    },
    icons: {
      icon: 'https://tiesen.id.vn/favicon.ico',
      shortcut: 'https://tiesen.id.vn/favicon-16x16.png',
      apple: 'https://tiesen.id.vn/apple-touch-icon.png',
    },
    alternates: {
      canonical: url,
      ...override.alternates,
    },
    assets: '/assets',
  }
}

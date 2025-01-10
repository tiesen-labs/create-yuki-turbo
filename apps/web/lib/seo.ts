import type { Metadata as NextMetadata } from 'next'

import { env } from '@/env'

export const getBaseUrl = () => {
  if (typeof window !== 'undefined') return window.location.origin
  if (env.VERCEL_PROJECT_PRODUCTION_URL)
    return `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`
  if (env.VERCEL_URL) return `https://${env.VERCEL_URL}`
  // eslint-disable-next-line no-restricted-properties
  return `http://localhost:${process.env.PORT ?? 3000}`
}

interface Metadata extends Omit<NextMetadata, 'title'> {
  title?: string
}

export const seo = (params: Metadata): Metadata => {
  const siteName = 'Create Yuki Turbo'
  const title = params.title ? `${siteName} | ${params.title}` : siteName
  const description =
    params.description ??
    'Clean and typesafe starter monorepo using Turborepo along with Next.js and tRPC '
  const url = params.openGraph?.url
    ? `${getBaseUrl()}${params.openGraph.url}`
    : getBaseUrl()
  const images = [...((params.openGraph?.images as [] | null) ?? []), '/api/og']

  return {
    ...params,
    metadataBase: new URL(getBaseUrl()),
    title,
    description,
    applicationName: siteName,
    alternates: { canonical: url },
    twitter: { card: 'summary_large_image' },
    openGraph: { url, images, siteName, type: 'website' },
    icons: {
      icon: 'https://tiesen.id.vn/favicon.ico',
      shortcut: 'https://tiesen.id.vn/favicon-16x16.png',
      apple: 'https://tiesen.id.vn/apple-touch-icon.png',
    },
  }
}

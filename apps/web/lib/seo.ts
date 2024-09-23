import type { Metadata } from 'next'
import type { OpenGraph } from 'next/dist/lib/metadata/types/opengraph-types'

import { getBaseUrl } from '@/lib/utils'

interface Params {
  title?: string
  description?: string
  images?: OpenGraph['images']
  url?: string
}

export const seo = (params: Params): Metadata => {
  const title = params.title ? `${params.title} | Create Yuki Turbo` : 'Create Yuki Turbo'
  const description =
    params.description ?? 'Clean and typesafe starter monorepo using Turborepo along with Next.js'
  const images = params.images ?? ['/api/og']
  const url = params.url ? `${getBaseUrl()}${params.url}` : getBaseUrl()

  return {
    metadataBase: new URL(getBaseUrl()),
    title,
    description,
    alternates: { canonical: url },
    applicationName: 'Create Yuki Turbo',
    twitter: { card: 'summary_large_image' },
    openGraph: { url, images, type: 'website', siteName: 'Yuki' },
    icons: { icon: '/favicon.ico' },
  }
}

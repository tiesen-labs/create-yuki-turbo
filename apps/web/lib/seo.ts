import type { Metadata } from 'next'

import { getBaseUrl } from '@/lib/utils'

interface Prams {
  title?: string
  description?: string
  url?: string
  images?: string[]
}

export const seo = (params: Prams): Metadata => {
  const title = params.title ? `${params.title} | Create Yuki Turbo` : 'Create Yuki Turbo'
  const description =
    params.description ?? 'Clean and typesafe starter monorepo using Turborepo along with Next.js'
  const url = params.url ? `${getBaseUrl()}${params.url}` : getBaseUrl()
  const images = [...(params.images ?? ''), '/api/og']

  return {
    metadataBase: new URL(getBaseUrl()),
    title,
    description,
    applicationName: 'Create Yuki Turbo',
    alternates: { canonical: url },
    openGraph: { url, images, type: 'website' },
    twitter: { card: 'summary_large_image' },
    icons: { icon: 'https://tiesen.id.vn/favicon.ico' },
  }
}

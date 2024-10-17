import type { Metadata } from 'next'
import type { OpenGraph } from 'next/dist/lib/metadata/types/opengraph-types'

import { getBaseUrl } from '@/lib/utils'

interface Prams {
  title?: string
  description?: string
  url?: string
  images?: OpenGraph['images']
}

export const seo = (params: Prams): Metadata => {
  const title = params.title ? `${params.title} | Create Yuki Turbo` : 'Create Yuki Turbo'
  const description =
    params.description ?? 'A Next.js template with TypeScript, Tailwind CSS, ESLint and Prettier'
  const images = params.images ?? ['/api/og']
  const url = params.url ? `${getBaseUrl()}${params.url}` : getBaseUrl()

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

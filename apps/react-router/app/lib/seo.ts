import type { MetaFunction } from 'react-router'

import { getBaseUrl } from '@/lib/utils'

export const seo = (params: {
  title?: string
  description?: string
  images?: string[]
  url?: string
}): MetaFunction => {
  const siteName = 'Create Yuki Turbo'
  const title = params.title ? `${siteName} | ${params.title}` : siteName
  const description =
    params.description ??
    'Clean and typesafe starter monorepo using Turborepo along with Next.js and tRPC '
  const url = params.url ? `${getBaseUrl()}${params.url}` : getBaseUrl()
  const images = [...(params.images ?? []), '/api/og']

  return () => [
    { title },
    { name: 'application-name', content: siteName },
    { name: 'description', content: description },
    { name: 'og:title', content: title },
    { name: 'og:description', content: description },
    { name: 'og:type', content: 'website' },
    { name: 'og:url', content: url },
    ...images.map((image) => ({ name: 'og:image', content: image })),
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    ...images.map((image) => ({ name: 'twitter:image', content: image })),
  ]
}

export const icons = [
  { rel: 'icon', href: 'https://tiesen.id.vn/favicon.ico' },
  { rel: 'shortcut icon', href: 'https://tiesen.id.vn/favicon-16x16.png' },
  { rel: 'apple-touch-icon', href: 'https://tiesen.id.vn/apple-touch-icon.png' },
]

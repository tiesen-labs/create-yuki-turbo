import type { MetaFunction } from 'react-router'

import { getBaseUrl } from '@/lib/utils'

export const seo = (params: {
  title?: string
  description?: string
  images?: string[]
  url?: string
}): ReturnType<MetaFunction> => {
  const siteName = 'Create Yuki Turbo'
  const title = params.title ? `${siteName} | ${params.title}` : siteName
  const description =
    params.description ??
    'Clean and typesafe starter monorepo using Turborepo along with Next.js and tRPC '
  const url = params.url ? `${getBaseUrl()}${params.url}` : getBaseUrl()
  const images = [...(params.images ?? []), '/api/og']

  return [
    { title },
    { name: 'description', content: description },
    { name: 'application-name', content: siteName },

    // Open-Graph
    { name: 'og:title', content: title },
    { name: 'og:description', content: description },
    { name: 'og:url', content: url },
    { name: 'og:site-name', content: siteName },
    { name: 'og:images', content: images },
    { name: 'og:type', content: 'website' },

    // Twitter
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:images', content: images },
  ]
}

export const favicon = [
  { rel: 'icon', href: 'https://tiesen.id.vn/favicon.ico' },
  { rel: 'shortcut icon', href: 'https://tiesen.id.vn/favicon-16x16.png' },
  { rel: 'apple-touch-icon', href: 'https://tiesen.id.vn/apple-touch-icon.png' },
]

//     metadataBase: new URL(getBaseUrl()),
//     title,
//     description,
//     applicationName: siteName,
//     alternates: { canonical: url },
//     twitter: { card: 'summary_large_image' },
//     openGraph: { url, images, siteName, type: 'website' },
//     icons: {
//       icon: 'https://tiesen.id.vn/favicon.ico',
//       shortcut: 'https://tiesen.id.vn/favicon-16x16.png',
//       apple: 'https://tiesen.id.vn/apple-touch-icon.png',
//     },

import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  transpilePackages: ['@yuki/ui', '@yuki/db', '@yuki/api', '@yuki/auth'],

  images: { remotePatterns: [{ protocol: 'https', hostname: 'tiesen.id.vn' }] },
}

export default nextConfig

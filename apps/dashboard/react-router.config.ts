import type { Config } from '@react-router/dev/config'
import { vercelPreset } from '@vercel/react-router/vite'

declare module 'react-router' {
  interface Future {
    unstable_middleware: true // 👈 Enable middleware types
  }
}

export default {
  // Config options...
  // Server-side render by default, to enable SPA mode set this to `false`
  ssr: true,
  future: { unstable_middleware: true },
  presets: [vercelPreset()],
} satisfies Config

import type { Config } from 'tailwindcss'
import { fontFamily } from 'tailwindcss/defaultTheme'

import baseConfig from '@yuki/tailwind-config/web'

export default {
  content: [...baseConfig.content, '../../packages/ui/src/**/*.{ts,tsx}'],
  // We need to append the path to the UI package to the content array so that
  // those classes are included correctly.
  presets: [baseConfig],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)', ...fontFamily.sans],
        mono: ['var(--font-geist-mono)', ...fontFamily.mono],
      },
    },
  },
  plugins: [],
} satisfies Config

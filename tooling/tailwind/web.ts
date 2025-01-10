import type { Config } from 'tailwindcss'
import animate from 'tailwindcss-animate'
import { fontFamily } from 'tailwindcss/defaultTheme'

import base from './base'

export default {
  content: ['app/**/*.{ts,tsx}', 'components/**/*.{ts,tsx}'],
  presets: [base],
  theme: {
    container: { center: true, padding: '2rem', screens: { '2xl': '1400px' } },
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', ...fontFamily.sans],
        mono: ['var(--font-mono)', ...fontFamily.mono],
      },

      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [animate],
} satisfies Config

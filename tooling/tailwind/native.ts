import type { Config } from 'tailwindcss'

import base from './base'

export default {
  content: ['app/**/*.{ts,tsx}', 'components/**/*.{ts,tsx}'],
  presets: [base],
  theme: {},
} satisfies Config

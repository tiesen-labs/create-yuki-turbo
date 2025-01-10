import type { Config } from 'tailwindcss'

import base from './base'

export default {
  content: ['src/**/*.{ts,tsx}'],
  presets: [base],
  theme: {},
} satisfies Config

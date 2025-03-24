/* eslint-disable no-restricted-properties */
import { reactRouter } from '@react-router/dev/vite'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig(({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) }

  return {
    envDir: '../../',
    plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
    define: {
      'process.env': process.env,
    },
  }
})

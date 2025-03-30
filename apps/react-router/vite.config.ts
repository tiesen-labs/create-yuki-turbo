import path from 'path'
import { reactRouter } from '@react-router/dev/vite'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    envDir: path.resolve(__dirname, '../../'),
    define: { 'process.env': JSON.stringify(env) },
    plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  }
})

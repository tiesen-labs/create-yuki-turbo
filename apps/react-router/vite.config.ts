import { reactRouter } from '@react-router/dev/vite'
import autoprefixer from 'autoprefixer'
import tailwindcss from 'tailwindcss'
import { defineConfig, loadEnv } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig(({ isSsrBuild, command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    build: {
      rollupOptions: isSsrBuild
        ? {
            input: './server/app.ts',
          }
        : undefined,
    },
    css: {
      postcss: {
        plugins: [tailwindcss, autoprefixer],
      },
    },
    ssr: {
      noExternal: command === 'build' ? true : undefined,
    },
    define: {
      'process.env': JSON.stringify(env),
    },
    plugins: [reactRouter(), tsconfigPaths()],
  }
})

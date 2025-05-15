import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/**/*.ts', 'src/**/*.tsx'],
  copy: ['src/tailwind.css'],
  dts: true,
  hooks(hooks) {
    hooks.hook('build:done', async () => {
      const fs = require('fs')
      const path = require('path')
      const glob = require('fast-glob')

      const outDir = 'dist'
      const files = await glob(['**/*.js'], { cwd: outDir })

      for (const file of files) {
        const filePath = path.join(outDir, file)
        const content = fs.readFileSync(filePath, 'utf-8')

        // Extract directives
        const clientDirective = content.includes("'use client';")
          ? "'use client';"
          : content.includes('"use client";')
            ? '"use client";'
            : null
        const serverDirective = content.includes("'use server';")
          ? "'use server';"
          : content.includes('"use server";')
            ? '"use server";'
            : null

        if (clientDirective || serverDirective) {
          // Remove existing directives
          let newContent = content
            .replace(/(['"]use client['"]);?|(['"]use server['"]);?/g, '')
            .trim()

          // Add directives at the top
          const directives = [clientDirective, serverDirective]
            .filter(Boolean)
            .join('\n')

          newContent = `${directives}\n\n${newContent}`

          // Write back to file
          fs.writeFileSync(filePath, newContent, 'utf-8')
        }
      }
    })
  },
})

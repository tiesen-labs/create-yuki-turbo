import fs from 'fs'
import path from 'path'

const clientPath = path.resolve(__dirname, '../src/generated/client/client.ts')
const content = fs.readFileSync(clientPath, 'utf8')

if (!content.startsWith('// @ts-nocheck')) {
  fs.writeFileSync(clientPath, `// @ts-nocheck\n${content}`)
  console.log('✅ Patched Prisma client with // @ts-nocheck')
} else {
  console.log('ℹ️  Prisma client already patched')
}

const indexPath = path.resolve(__dirname, '../src/generated/client/index.ts')
const indexContent = fs.readFileSync(indexPath, 'utf8')
const regex = /(from\s+['"])([^'"]+\.ts)(['"])/g
const updatedIndexContent = indexContent.replace(
  regex,
  (_match, prefix, importPath, suffix) =>
    `${prefix}${importPath.replace(/\.ts$/, '')}${suffix}`,
)

if (indexContent !== updatedIndexContent) {
  fs.writeFileSync(indexPath, updatedIndexContent)
  console.log('✅ Removed file extensions from imports in index.ts')
} else {
  console.log('ℹ️  No file extensions to remove in index.ts')
}

import sharp from 'sharp'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const publicDir = path.join(root, 'public')
const assetsDir = path.join(__dirname, 'assets')

const iconTargets = [
  {
    input: path.join(publicDir, 'favicon.svg'),
    output: path.join(publicDir, 'favicon-16x16.png'),
    size: 16,
  },
  {
    input: path.join(publicDir, 'favicon.svg'),
    output: path.join(publicDir, 'favicon-32x32.png'),
    size: 32,
  },
  {
    input: path.join(assetsDir, 'app-icon-square.svg'),
    output: path.join(publicDir, 'apple-touch-icon.png'),
    size: 180,
  },
  {
    input: path.join(assetsDir, 'app-icon-square.svg'),
    output: path.join(publicDir, 'android-chrome-192x192.png'),
    size: 192,
  },
  {
    input: path.join(assetsDir, 'app-icon-square.svg'),
    output: path.join(publicDir, 'android-chrome-512x512.png'),
    size: 512,
  },
]

async function run() {
  for (const { input, output, size } of iconTargets) {
    // Higher density tells librsvg to rasterize before downscaling, avoiding blurry small icons.
    await sharp(input, { density: 384 }).resize(size, size).png().toFile(output)
    console.log(`wrote ${path.relative(root, output)}`)
  }

  await sharp(path.join(assetsDir, 'og-card.svg'), { density: 144 })
    .resize(1200, 630)
    .png()
    .toFile(path.join(publicDir, 'og-image.png'))
  console.log('wrote public/og-image.png')
}

run().catch((err) => {
  console.error(err)
  process.exitCode = 1
})

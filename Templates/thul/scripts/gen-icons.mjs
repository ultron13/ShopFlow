/**
 * Generates ShopFlow SA PWA icons from an SVG template.
 *
 * Outputs:
 *   apps/web/public/icon-192.png   (PWA)
 *   apps/web/public/icon-512.png   (PWA)
 *   apps/web/public/icon-180.png   (Apple touch icon)
 *   apps/web/public/favicon-32.png (browser tab fallback)
 *   apps/web/favicon.ico           (Next.js picks up root favicon.ico)
 *   apps/web/public/favicon.ico    (static fallback)
 *
 * Design: indigo square with rounded corners, white shopping basket + "SA" tag.
 */

import sharp from '../node_modules/sharp/lib/index.js'
import { writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dir = dirname(fileURLToPath(import.meta.url))
const PUBLIC = resolve(__dir, '../apps/web/public')
const APP    = resolve(__dir, '../apps/web/app')

function makeSvg(size) {
  const r  = Math.round(size * 0.18)   // corner radius
  const cx = size / 2
  const cy = size / 2

  // Basket proportions scale with icon size
  const bw   = size * 0.52   // basket width
  const bh   = size * 0.36   // basket body height
  const bx   = cx - bw / 2
  const by   = cy - bh / 2 + size * 0.06
  const sw   = Math.max(2, size * 0.045) // stroke width

  // Handle arc: sits above the basket
  const hry  = bh * 0.55   // handle y-radius
  const hrx  = bw * 0.38   // handle x-radius
  const hcy  = by - hry * 0.15

  // "SA" label pill
  const pw   = size * 0.28
  const ph   = size * 0.155
  const px   = cx - pw / 2
  const py   = by + bh - ph * 0.42
  const pr   = ph * 0.38

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%"   stop-color="#4338ca"/>
      <stop offset="100%" stop-color="#6d28d9"/>
    </linearGradient>
    <linearGradient id="pill" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="#fde68a"/>
      <stop offset="100%" stop-color="#f59e0b"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="${size}" height="${size}" rx="${r}" ry="${r}" fill="url(#bg)"/>

  <!-- Basket handle (arc) -->
  <path d="M ${cx - hrx} ${hcy} A ${hrx} ${hry} 0 0 1 ${cx + hrx} ${hcy}"
        fill="none" stroke="white" stroke-width="${sw}" stroke-linecap="round" opacity="0.95"/>

  <!-- Basket body (rounded rect) -->
  <rect x="${bx}" y="${by}" width="${bw}" height="${bh}"
        rx="${sw * 1.4}" ry="${sw * 1.4}"
        fill="white" opacity="0.95"/>

  <!-- Basket vertical lines -->
  <line x1="${cx - bw*0.19}" y1="${by}" x2="${cx - bw*0.19}" y2="${by + bh}"
        stroke="#c7d2fe" stroke-width="${sw * 0.65}" opacity="0.7"/>
  <line x1="${cx + bw*0.19}" y1="${by}" x2="${cx + bw*0.19}" y2="${by + bh}"
        stroke="#c7d2fe" stroke-width="${sw * 0.65}" opacity="0.7"/>

  <!-- SA pill badge -->
  <rect x="${px}" y="${py}" width="${pw}" height="${ph}" rx="${pr}" ry="${pr}" fill="url(#pill)"/>
  <text x="${cx}" y="${py + ph * 0.72}"
        font-family="system-ui,Arial,sans-serif" font-weight="800"
        font-size="${ph * 0.62}" fill="#78350f"
        text-anchor="middle" letter-spacing="${ph * 0.05}">SA</text>
</svg>`
}

async function pngAt(size, outPath) {
  const svg = Buffer.from(makeSvg(size))
  await sharp(svg).resize(size, size).png({ compressionLevel: 9 }).toFile(outPath)
  console.log(`  ✓ ${outPath.replace(resolve(__dir, '..'), '')} (${size}×${size})`)
}

// Build a minimal 32×32 favicon.ico (single frame ICO via raw BMP)
async function favicoAt(outPath) {
  const png32 = await sharp(Buffer.from(makeSvg(32))).resize(32, 32).png().toBuffer()
  // We'll write a valid 1-image ICO file wrapping the 32×32 PNG.
  // ICO format: 6-byte header + 16-byte dir entry + PNG data
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)      // reserved
  header.writeUInt16LE(1, 2)      // type: 1 = ICO
  header.writeUInt16LE(1, 4)      // image count

  const entry = Buffer.alloc(16)
  entry.writeUInt8(32, 0)         // width  (0 = 256, we use 32)
  entry.writeUInt8(32, 1)         // height
  entry.writeUInt8(0, 2)          // color count
  entry.writeUInt8(0, 3)          // reserved
  entry.writeUInt16LE(1, 4)       // color planes
  entry.writeUInt16LE(32, 6)      // bits per pixel
  entry.writeUInt32LE(png32.length, 8)   // size of image data
  entry.writeUInt32LE(22, 12)     // offset to image data (6 + 16)

  writeFileSync(outPath, Buffer.concat([header, entry, png32]))
  console.log(`  ✓ ${outPath.replace(resolve(__dir, '..'), '')} (ICO 32×32)`)
}

console.log('Generating ShopFlow SA icons…')
await pngAt(192, `${PUBLIC}/icon-192.png`)
await pngAt(512, `${PUBLIC}/icon-512.png`)
await pngAt(180, `${PUBLIC}/icon-180.png`)
await pngAt(32,  `${PUBLIC}/favicon-32.png`)
await favicoAt(`${PUBLIC}/favicon.ico`)
// Next.js serves favicon.ico from app/ directory at the root
await favicoAt(`${APP}/favicon.ico`)
console.log('Done.')

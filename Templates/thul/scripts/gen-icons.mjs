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
  const r  = Math.round(size * 0.20)   // background corner radius
  const cx = size / 2
  const sw = Math.max(2, size * 0.048) // stroke width

  // ── Shopping bag body ──────────────────────────────────────────────
  // A clean rectangle with two punched-out handle slots at the top
  const bw   = size * 0.54
  const bh   = size * 0.46
  const bx   = cx - bw / 2
  const by   = size * 0.34            // bag starts ~34% down
  const br   = size * 0.045           // bag corner radius

  // Handles: two small rounded arches punched into the top of the bag
  const hw   = bw * 0.22             // handle slot width
  const hh   = size * 0.10           // handle slot height (arch)
  const hgap = bw * 0.10             // gap from bag edge
  const hyl  = by - hh * 0.55        // top of arch

  // Handle top strip (the part above the bag opening) – two short lines
  const hl1x1 = bx + hgap
  const hl1x2 = bx + hgap + hw
  const hl2x1 = bx + bw - hgap - hw
  const hl2x2 = bx + bw - hgap

  // ── "SA" pill badge ────────────────────────────────────────────────
  const pw = size * 0.26
  const ph = size * 0.14
  const px = cx - pw / 2
  const py = by + bh - ph * 0.55
  const pr = ph * 0.42

  // ── Horizontal stripe across mid-bag ──────────────────────────────
  const stripeY = by + bh * 0.42

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%"   stop-color="#4338ca"/>
      <stop offset="100%" stop-color="#5b21b6"/>
    </linearGradient>
    <linearGradient id="pill" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="#fde68a"/>
      <stop offset="100%" stop-color="#f59e0b"/>
    </linearGradient>
  </defs>

  <!-- Background square with rounded corners -->
  <rect width="${size}" height="${size}" rx="${r}" ry="${r}" fill="url(#bg)"/>

  <!-- Bag body -->
  <rect x="${bx}" y="${by}" width="${bw}" height="${bh}"
        rx="${br}" ry="${br}" fill="white" opacity="0.95"/>

  <!-- Horizontal accent stripe -->
  <rect x="${bx}" y="${stripeY}" width="${bw}" height="${sw * 0.9}"
        fill="#c7d2fe" opacity="0.6"/>

  <!-- Left handle arch -->
  <path d="M ${hl1x1} ${by}
           Q ${hl1x1} ${hyl} ${hl1x1 + hw/2} ${hyl}
           Q ${hl1x2} ${hyl} ${hl1x2} ${by}"
        fill="none" stroke="white" stroke-width="${sw}" stroke-linecap="round"
        stroke-linejoin="round" opacity="0.95"/>

  <!-- Right handle arch -->
  <path d="M ${hl2x1} ${by}
           Q ${hl2x1} ${hyl} ${hl2x1 + hw/2} ${hyl}
           Q ${hl2x2} ${hyl} ${hl2x2} ${by}"
        fill="none" stroke="white" stroke-width="${sw}" stroke-linecap="round"
        stroke-linejoin="round" opacity="0.95"/>

  <!-- SA amber pill badge -->
  <rect x="${px}" y="${py}" width="${pw}" height="${ph}" rx="${pr}" ry="${pr}" fill="url(#pill)"/>
  <text x="${cx}" y="${py + ph * 0.73}"
        font-family="Arial Black,system-ui,sans-serif" font-weight="900"
        font-size="${ph * 0.64}" fill="#92400e"
        text-anchor="middle" letter-spacing="${ph * 0.06}">SA</text>
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

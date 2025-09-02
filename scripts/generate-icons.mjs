import { createWriteStream } from 'node:fs'
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import zlib from 'node:zlib'

function crc32(buf) {
  let c = ~0
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i]
    for (let k = 0; k < 8; k++) {
      c = (c >>> 1) ^ (0xedb88320 & -(c & 1))
    }
  }
  return ~c >>> 0
}

function u32(n) {
  const b = Buffer.alloc(4)
  b.writeUInt32BE(n >>> 0, 0)
  return b
}

function chunk(type, data = Buffer.alloc(0)) {
  const typeBuf = Buffer.from(type, 'ascii')
  const len = u32(data.length)
  const crc = u32(crc32(Buffer.concat([typeBuf, data])))
  return Buffer.concat([len, typeBuf, data, crc])
}

function pngSolid(width, height, rgba) {
  const [r, g, b, a] = rgba
  // Build raw image data with filter byte per row (0 = none)
  const row = Buffer.alloc(1 + width * 4)
  row[0] = 0
  for (let x = 0; x < width; x++) {
    const o = 1 + x * 4
    row[o + 0] = r
    row[o + 1] = g
    row[o + 2] = b
    row[o + 3] = a
  }
  const raw = Buffer.alloc(row.length * height)
  for (let y = 0; y < height; y++) row.copy(raw, y * row.length)

  const idatData = zlib.deflateSync(raw)

  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  const ihdr = Buffer.concat([
    u32(width),
    u32(height),
    Buffer.from([8, 6, 0, 0, 0]), // bit depth 8, color RGBA, compression 0, filter 0, interlace 0
  ])

  const png = Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', idatData),
    chunk('IEND'),
  ])
  return png
}

function writeFileSyncBinary(path, buf) {
  mkdirSync(dirname(path), { recursive: true })
  const ws = createWriteStream(path)
  ws.write(buf)
  ws.end()
}

function main() {
  const out192 = resolve('public/icons/icon-192.png')
  const out512 = resolve('public/icons/icon-512.png')
  // Colors roughly matching brand neutrals
  writeFileSyncBinary(out192, pngSolid(192, 192, [37, 99, 235, 255])) // blue-600
  writeFileSyncBinary(out512, pngSolid(512, 512, [15, 23, 42, 255])) // slate-900
  console.log('Generated icons:', out192, out512)
}

main()


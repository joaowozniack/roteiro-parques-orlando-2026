// Dependency-free rasterization of the project's own compass icon.
import { mkdirSync, writeFileSync } from 'node:fs'
import { deflateSync } from 'node:zlib'
const crcTable = Array.from({ length: 256 }, (_, n) => { for (let k = 0; k < 8; k++) n = n & 1 ? 0xedb88320 ^ (n >>> 1) : n >>> 1; return n >>> 0 })
function chunk(type, data) {
  const name = Buffer.from(type), length = Buffer.alloc(4), checksum = Buffer.alloc(4)
  length.writeUInt32BE(data.length)
  let crc = 0xffffffff
  for (const byte of Buffer.concat([name, data])) crc = crcTable[(crc ^ byte) & 255] ^ (crc >>> 8)
  checksum.writeUInt32BE((crc ^ 0xffffffff) >>> 0)
  return Buffer.concat([length, name, data, checksum])
}
function inside(x, y, points) {
  let result = false
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const [xi, yi] = points[i], [xj, yj] = points[j]
    if (((yi > y) !== (yj > y)) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) result = !result
  }
  return result
}
function icon(size, filename) {
  const rows = Buffer.alloc((size * 4 + 1) * size)
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const sum = [0, 0, 0]
    for (const [sx, sy] of [[.25, .25], [.75, .25], [.25, .75], [.75, .75]]) {
      const px = (x + sx) / size, py = (y + sy) / size, radius = Math.hypot(px - .5, py - .5)
      let color = [11, 20, 35]
      if (radius < .332 && radius > .308) color = [107, 228, 195]
      if (inside(px, py, [[.68,.30],[.58,.59],[.30,.70],[.41,.41]])) color = [107,228,195]
      if (inside(px, py, [[.5,.5],[.68,.30],[.58,.59]])) color = [38,155,143]
      if (radius < .027) color = [11,20,35]
      color.forEach((v, i) => { sum[i] += v })
    }
    const offset = y * (size * 4 + 1) + x * 4 + 1
    rows[offset] = sum[0] / 4; rows[offset + 1] = sum[1] / 4; rows[offset + 2] = sum[2] / 4; rows[offset + 3] = 255
  }
  const header = Buffer.alloc(13); header.writeUInt32BE(size); header.writeUInt32BE(size, 4); header[8] = 8; header[9] = 6
  writeFileSync(filename, Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',deflateSync(rows)),chunk('IEND',Buffer.alloc(0))]))
}
mkdirSync('public/icons', { recursive: true })
for (const size of [192, 512]) icon(size, `public/icons/icon-${size}.png`)
icon(512, 'public/icons/maskable-512.png')
icon(180, 'public/icons/apple-touch-icon.png')
console.log('Ícones PNG gerados em public/icons.')

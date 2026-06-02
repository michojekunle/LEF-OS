// Generates two minimal PNG icons (192x192 and 512x512) with a dark background
// and a stylised "LEF" wordmark in gold. No external dependencies — emits a
// hand-written PNG using node's zlib + crc32. Quick and deterministic.

import { writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
import { resolve } from 'node:path';

const BG = [0x0d, 0x0d, 0x0d];
const FG = [0xc8, 0xa9, 0x6e];

// Tiny 5x7 bitmap font for LEF.
const FONT = {
  L: [
    '#....',
    '#....',
    '#....',
    '#....',
    '#....',
    '#....',
    '#####',
  ],
  E: [
    '#####',
    '#....',
    '#....',
    '####.',
    '#....',
    '#....',
    '#####',
  ],
  F: [
    '#####',
    '#....',
    '#....',
    '####.',
    '#....',
    '#....',
    '#....',
  ],
};

function makeIconPixels(size) {
  const pixels = new Uint8Array(size * size * 3);
  for (let i = 0; i < size * size; i++) {
    pixels[i * 3] = BG[0];
    pixels[i * 3 + 1] = BG[1];
    pixels[i * 3 + 2] = BG[2];
  }

  // Draw "LEF" centred. Use a scale relative to icon size.
  const chars = ['L', 'E', 'F'];
  const charW = 5;
  const charH = 7;
  const gap = 1;
  const text = chars.length * charW + (chars.length - 1) * gap;
  const scale = Math.max(1, Math.floor(size / (text + 6)));
  const drawW = text * scale;
  const drawH = charH * scale;
  const xStart = Math.floor((size - drawW) / 2);
  const yStart = Math.floor((size - drawH) / 2);

  function setPixel(x, y) {
    if (x < 0 || y < 0 || x >= size || y >= size) return;
    const i = (y * size + x) * 3;
    pixels[i] = FG[0];
    pixels[i + 1] = FG[1];
    pixels[i + 2] = FG[2];
  }

  for (let c = 0; c < chars.length; c++) {
    const glyph = FONT[chars[c]];
    const glyphX = xStart + c * (charW + gap) * scale;
    for (let row = 0; row < charH; row++) {
      const line = glyph[row];
      for (let col = 0; col < charW; col++) {
        if (line[col] === '#') {
          for (let sy = 0; sy < scale; sy++) {
            for (let sx = 0; sx < scale; sx++) {
              setPixel(glyphX + col * scale + sx, yStart + row * scale + sy);
            }
          }
        }
      }
    }
  }

  // Subtle 1px gold border ring 6% inset.
  const inset = Math.floor(size * 0.06);
  for (let i = inset; i < size - inset; i++) {
    setPixel(i, inset);
    setPixel(i, size - inset - 1);
    setPixel(inset, i);
    setPixel(size - inset - 1, i);
  }
  return pixels;
}

// PNG encoding ---------------------------------------------------------------
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = data.length;
  const out = Buffer.alloc(8 + len + 4);
  out.writeUInt32BE(len, 0);
  out.write(type, 4, 4, 'ascii');
  data.copy(out, 8);
  const crc = crc32(Buffer.concat([Buffer.from(type, 'ascii'), data]));
  out.writeUInt32BE(crc, 8 + len);
  return out;
}

function encodePNG(size, pixels) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 2;  // RGB
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace
  const ihdrChunk = chunk('IHDR', ihdr);

  // Raw scanlines: filter byte 0 then RGB.
  const stride = size * 3;
  const raw = Buffer.alloc((stride + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (stride + 1)] = 0;
    pixels.subarray(y * stride, (y + 1) * stride && (y + 1) * stride).forEach((v, i) => {
      raw[y * (stride + 1) + 1 + i] = v;
    });
  }
  const idat = chunk('IDAT', deflateSync(raw));
  const iend = chunk('IEND', Buffer.alloc(0));
  return Buffer.concat([sig, ihdrChunk, idat, iend]);
}

function writeIcon(size, path) {
  const px = makeIconPixels(size);
  const png = encodePNG(size, Buffer.from(px));
  writeFileSync(path, png);
  console.log(`wrote ${path} (${png.length} bytes)`);
}

writeIcon(32, resolve('public/icon-32.png'));
writeIcon(192, resolve('public/icon-192.png'));
writeIcon(512, resolve('public/icon-512.png'));

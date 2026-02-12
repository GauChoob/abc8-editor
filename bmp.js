export const createBMP = (sprite, palette) => {
  const width = sprite.width;
  const height = sprite.height;
  const pixels = sprite.pixels;

  const rowSize = Math.ceil(width / 4) * 4; // 4-byte aligned
  const pixelArraySize = rowSize * height;
  const fileSize = 14 + 40 + 256 * 4 + pixelArraySize;

  const buffer = new ArrayBuffer(fileSize);
  const view = new DataView(buffer);
  let offset = 0;

  // --- BMP File Header (14 bytes) ---
  view.setUint8(offset++, 0x42); // 'B'
  view.setUint8(offset++, 0x4d); // 'M'
  view.setUint32(offset, fileSize, true);
  offset += 4; // file size
  view.setUint16(offset, 0, true);
  offset += 2; // reserved1
  view.setUint16(offset, 0, true);
  offset += 2; // reserved2
  view.setUint32(offset, 14 + 40 + 256 * 4, true);
  offset += 4; // pixel data offset

  // --- DIB Header (BITMAPINFOHEADER, 40 bytes) ---
  view.setUint32(offset, 40, true);
  offset += 4; // header size
  view.setInt32(offset, width, true);
  offset += 4; // width
  view.setInt32(offset, height, true);
  offset += 4; // height
  view.setUint16(offset, 1, true);
  offset += 2; // planes
  view.setUint16(offset, 8, true);
  offset += 2; // bits per pixel
  view.setUint32(offset, 0, true);
  offset += 4; // compression (0 = none)
  view.setUint32(offset, pixelArraySize, true);
  offset += 4; // image size
  view.setInt32(offset, 2834, true);
  offset += 4; // x pixels per meter (72 DPI)
  view.setInt32(offset, 2834, true);
  offset += 4; // y pixels per meter
  view.setUint32(offset, 0, true);
  offset += 4; // colors used
  view.setUint32(offset, 0, true);
  offset += 4; // important colors

  // --- Color Palette (256 entries × 4 bytes) ---
  for (let i = 0; i < 256; i++) {
    view.setUint8(offset++, palette[i*3 + 2]); // BMP uses BGR
    view.setUint8(offset++, palette[i*3 + 1]);
    view.setUint8(offset++, palette[i*3 + 0]);
    view.setUint8(offset++, 0); // reserved
  }

  // --- Pixel Data (bottom-up, each row 4-byte aligned) ---
  for (let y = height - 1; y >= 0; y--) {
    for (let x = 0; x < width; x++) {
      view.setUint8(offset++, pixels[y * width + x]);
    }
    // padding for 4-byte alignment
    while ((offset - (14 + 40 + 256 * 4)) % 4 !== 0) offset++;
  }

  return new Uint8Array(buffer);
};

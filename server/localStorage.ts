// Local storage helper for images (alternative to S3)
// Saves images to /uploads/images/ directory

import fs from 'fs';
import path from 'path';

const UPLOADS_DIR = process.env.UPLOADS_DIR || '/var/www/landing-editor/uploads/images';
const BASE_URL = process.env.BASE_URL || 'http://199.247.10.137';

export async function localStoragePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  // Ensure uploads directory exists
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }

  const key = relKey.replace(/^\/+/, '');
  const fileName = key.split('/').pop() || `${Date.now()}.png`;
  const filePath = path.join(UPLOADS_DIR, fileName);

  // Convert data to Buffer if needed
  let buffer: Buffer;
  if (typeof data === 'string') {
    buffer = Buffer.from(data);
  } else if (data instanceof Uint8Array) {
    buffer = Buffer.from(data);
  } else {
    buffer = data;
  }

  // Write file to disk
  fs.writeFileSync(filePath, buffer);

  // Return public URL
  const url = `${BASE_URL}/uploads/images/${fileName}`;
  
  console.log(`[LocalStorage] Saved image: ${filePath} -> ${url}`);
  
  return { key: fileName, url };
}

export async function localStorageGet(relKey: string): Promise<{ key: string; url: string }> {
  const key = relKey.replace(/^\/+/, '');
  const fileName = key.split('/').pop() || key;
  const url = `${BASE_URL}/uploads/images/${fileName}`;
  
  return { key: fileName, url };
}

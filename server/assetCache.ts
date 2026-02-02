/**
 * Asset Cache System
 * 
 * Caches downloaded assets to avoid re-downloading images from previously cloned websites.
 * Uses a simple file-based cache with URL hashing.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

const CACHE_DIR = '/home/ubuntu/landing-editor/cache/assets';
const CACHE_INDEX_FILE = path.join(CACHE_DIR, 'index.json');
const MAX_CACHE_SIZE_MB = 500; // Maximum cache size in MB
const MAX_CACHE_AGE_DAYS = 30; // Maximum age of cached items in days

interface CacheEntry {
  url: string;
  localPath: string;
  mimeType: string;
  size: number;
  createdAt: string;
  lastAccessed: string;
  sourceUrl: string; // The website URL where this asset was found
}

interface CacheIndex {
  entries: Record<string, CacheEntry>;
  totalSize: number;
  lastCleanup: string;
}

/**
 * Initialize the cache directory and index
 */
function initCache(): CacheIndex {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }

  if (fs.existsSync(CACHE_INDEX_FILE)) {
    try {
      const data = fs.readFileSync(CACHE_INDEX_FILE, 'utf-8');
      return JSON.parse(data) as CacheIndex;
    } catch (e) {
      console.error('[AssetCache] Error reading cache index:', e);
    }
  }

  const newIndex: CacheIndex = {
    entries: {},
    totalSize: 0,
    lastCleanup: new Date().toISOString()
  };
  
  saveCacheIndex(newIndex);
  return newIndex;
}

/**
 * Save the cache index to disk
 */
function saveCacheIndex(index: CacheIndex): void {
  try {
    fs.writeFileSync(CACHE_INDEX_FILE, JSON.stringify(index, null, 2));
  } catch (e) {
    console.error('[AssetCache] Error saving cache index:', e);
  }
}

/**
 * Generate a hash for a URL to use as cache key
 */
function hashUrl(url: string): string {
  return crypto.createHash('md5').update(url).digest('hex');
}

/**
 * Get the file extension from a URL or mime type
 */
function getExtension(url: string, mimeType?: string): string {
  // Try to get from URL
  const urlPath = new URL(url).pathname;
  const ext = path.extname(urlPath).toLowerCase();
  if (ext && ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.ico'].includes(ext)) {
    return ext;
  }

  // Try to get from mime type
  if (mimeType) {
    const mimeMap: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/webp': '.webp',
      'image/svg+xml': '.svg',
      'image/x-icon': '.ico',
      'image/vnd.microsoft.icon': '.ico'
    };
    if (mimeMap[mimeType]) {
      return mimeMap[mimeType];
    }
  }

  return '.bin';
}

/**
 * Check if an asset is in the cache
 */
export function getCachedAsset(url: string): CacheEntry | null {
  const index = initCache();
  const hash = hashUrl(url);
  const entry = index.entries[hash];

  if (entry) {
    // Check if file still exists
    if (fs.existsSync(entry.localPath)) {
      // Update last accessed time
      entry.lastAccessed = new Date().toISOString();
      saveCacheIndex(index);
      console.log('[AssetCache] Cache hit for:', url);
      return entry;
    } else {
      // File was deleted, remove from index
      delete index.entries[hash];
      index.totalSize -= entry.size;
      saveCacheIndex(index);
    }
  }

  console.log('[AssetCache] Cache miss for:', url);
  return null;
}

/**
 * Add an asset to the cache
 */
export function cacheAsset(
  url: string,
  data: Buffer,
  mimeType: string,
  sourceUrl: string
): CacheEntry {
  const index = initCache();
  const hash = hashUrl(url);
  const ext = getExtension(url, mimeType);
  const filename = `${hash}${ext}`;
  const localPath = path.join(CACHE_DIR, filename);

  // Check if we need to clean up the cache
  const newSize = index.totalSize + data.length;
  if (newSize > MAX_CACHE_SIZE_MB * 1024 * 1024) {
    cleanupCache(index, data.length);
  }

  // Write file to cache
  try {
    fs.writeFileSync(localPath, data);
  } catch (e) {
    console.error('[AssetCache] Error writing cache file:', e);
    throw e;
  }

  // Add entry to index
  const entry: CacheEntry = {
    url,
    localPath,
    mimeType,
    size: data.length,
    createdAt: new Date().toISOString(),
    lastAccessed: new Date().toISOString(),
    sourceUrl
  };

  index.entries[hash] = entry;
  index.totalSize += data.length;
  saveCacheIndex(index);

  console.log('[AssetCache] Cached asset:', url, `(${(data.length / 1024).toFixed(1)} KB)`);
  return entry;
}

/**
 * Clean up old cache entries to make room for new ones
 */
function cleanupCache(index: CacheIndex, neededSpace: number): void {
  console.log('[AssetCache] Running cache cleanup...');
  
  const now = new Date();
  const maxAge = MAX_CACHE_AGE_DAYS * 24 * 60 * 60 * 1000;
  const entries = Object.entries(index.entries);
  
  // Sort by last accessed time (oldest first)
  entries.sort((a, b) => {
    return new Date(a[1].lastAccessed).getTime() - new Date(b[1].lastAccessed).getTime();
  });

  let freedSpace = 0;
  const targetFreeSpace = neededSpace + (50 * 1024 * 1024); // Free 50MB extra

  for (const [hash, entry] of entries) {
    // Check if entry is too old
    const age = now.getTime() - new Date(entry.createdAt).getTime();
    const shouldDelete = age > maxAge || freedSpace < targetFreeSpace;

    if (shouldDelete) {
      try {
        if (fs.existsSync(entry.localPath)) {
          fs.unlinkSync(entry.localPath);
        }
        freedSpace += entry.size;
        index.totalSize -= entry.size;
        delete index.entries[hash];
        console.log('[AssetCache] Removed old entry:', entry.url);
      } catch (e) {
        console.error('[AssetCache] Error removing cache file:', e);
      }
    }

    if (freedSpace >= targetFreeSpace) {
      break;
    }
  }

  index.lastCleanup = new Date().toISOString();
  saveCacheIndex(index);
  console.log('[AssetCache] Cleanup complete. Freed:', (freedSpace / 1024 / 1024).toFixed(1), 'MB');
}

/**
 * Get cache statistics
 */
export function getCacheStats(): {
  totalEntries: number;
  totalSizeMB: number;
  oldestEntry: string | null;
  newestEntry: string | null;
} {
  const index = initCache();
  const entries = Object.values(index.entries);
  
  let oldest: string | null = null;
  let newest: string | null = null;

  if (entries.length > 0) {
    entries.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    oldest = entries[0].createdAt;
    newest = entries[entries.length - 1].createdAt;
  }

  return {
    totalEntries: entries.length,
    totalSizeMB: index.totalSize / 1024 / 1024,
    oldestEntry: oldest,
    newestEntry: newest
  };
}

/**
 * Clear the entire cache
 */
export function clearCache(): void {
  console.log('[AssetCache] Clearing entire cache...');
  
  const index = initCache();
  
  for (const entry of Object.values(index.entries)) {
    try {
      if (fs.existsSync(entry.localPath)) {
        fs.unlinkSync(entry.localPath);
      }
    } catch (e) {
      console.error('[AssetCache] Error removing cache file:', e);
    }
  }

  const newIndex: CacheIndex = {
    entries: {},
    totalSize: 0,
    lastCleanup: new Date().toISOString()
  };
  
  saveCacheIndex(newIndex);
  console.log('[AssetCache] Cache cleared');
}

/**
 * Get all cached assets from a specific source URL
 */
export function getCachedAssetsFromSource(sourceUrl: string): CacheEntry[] {
  const index = initCache();
  return Object.values(index.entries).filter(e => e.sourceUrl === sourceUrl);
}

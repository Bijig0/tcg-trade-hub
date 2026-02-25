/**
 * Caches external card images into a Supabase Storage bucket.
 *
 * Storage path convention: {tcg}/{safeExternalId}.{ext}
 *   - pokemon/sv3-223.png
 *   - mtg/9a879b60-4381-447d-8a5a-8e0b6a1d49ca.jpg
 *   - yugioh/46986414.jpg
 *
 * If caching fails at any step, the original external URL is returned.
 */
import { supabaseAdmin } from './supabaseAdmin.ts';

const BUCKET = 'card-images';
const DOWNLOAD_TIMEOUT_MS = 5000;

const CONTENT_TYPE_TO_EXT: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
};

/**
 * Extracts file extension from a URL path or falls back to 'jpg'.
 */
const extFromUrl = (url: string): string => {
  try {
    const pathname = new URL(url).pathname;
    const dot = pathname.lastIndexOf('.');
    if (dot !== -1) {
      const ext = pathname.slice(dot + 1).toLowerCase();
      if (['png', 'jpg', 'jpeg', 'webp'].includes(ext)) {
        return ext === 'jpeg' ? 'jpg' : ext;
      }
    }
  } catch {
    // ignore
  }
  return 'jpg';
};

/**
 * Makes the external ID safe for use as a storage path segment.
 */
const safeId = (externalId: string): string =>
  externalId.replace(/[^a-zA-Z0-9_-]/g, '_');

type CacheResult = {
  cachedUrl: string;
};

/**
 * Caches a single card image into Supabase Storage.
 *
 * 1. If externalUrl is empty, returns it unchanged.
 * 2. HEAD-checks the storage bucket — if already cached, returns our URL.
 * 3. Downloads from external URL with a 5-second timeout.
 * 4. Uploads to storage and returns the public URL.
 * 5. On ANY error, logs a warning and returns the original external URL.
 */
export const cacheCardImage = async (
  tcg: string,
  externalId: string,
  externalUrl: string,
): Promise<CacheResult> => {
  if (!externalUrl) {
    return { cachedUrl: externalUrl };
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  if (!supabaseUrl) {
    return { cachedUrl: externalUrl };
  }

  try {
    const ext = extFromUrl(externalUrl);
    const storagePath = `${tcg}/${safeId(externalId)}.${ext}`;
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${storagePath}`;

    // Check if already cached
    const headRes = await fetch(publicUrl, { method: 'HEAD' });
    if (headRes.ok) {
      return { cachedUrl: publicUrl };
    }

    // Download from external URL
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), DOWNLOAD_TIMEOUT_MS);
    let downloadRes: Response;
    try {
      downloadRes = await fetch(externalUrl, { signal: controller.signal });
    } finally {
      clearTimeout(timeout);
    }

    if (!downloadRes.ok) {
      console.warn(
        `cacheCardImage: external download failed (${downloadRes.status}) for ${externalUrl}`,
      );
      return { cachedUrl: externalUrl };
    }

    const buffer = await downloadRes.arrayBuffer();
    const contentType = downloadRes.headers.get('content-type') ?? 'image/jpeg';
    const resolvedExt = CONTENT_TYPE_TO_EXT[contentType] ?? ext;
    const finalPath =
      resolvedExt !== ext
        ? `${tcg}/${safeId(externalId)}.${resolvedExt}`
        : storagePath;

    const { error } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(finalPath, buffer, {
        contentType,
        upsert: true,
      });

    if (error) {
      console.warn(`cacheCardImage: upload failed for ${finalPath}:`, error.message);
      return { cachedUrl: externalUrl };
    }

    return {
      cachedUrl: `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${finalPath}`,
    };
  } catch (err) {
    console.warn(
      `cacheCardImage: unexpected error for ${externalId}:`,
      err instanceof Error ? err.message : err,
    );
    return { cachedUrl: externalUrl };
  }
};

type CardForCaching = {
  tcg: string;
  externalId: string;
  imageUrl: string;
};

/**
 * Caches images for multiple cards, processing in batches for concurrency control.
 * Returns a Map from externalId to the resolved (cached or original) URL.
 */
export const cacheCardImages = async (
  cards: CardForCaching[],
  concurrency = 5,
): Promise<Map<string, string>> => {
  const urlMap = new Map<string, string>();

  for (let i = 0; i < cards.length; i += concurrency) {
    const batch = cards.slice(i, i + concurrency);
    const results = await Promise.allSettled(
      batch.map(async (card) => {
        const { cachedUrl } = await cacheCardImage(
          card.tcg,
          card.externalId,
          card.imageUrl,
        );
        return { externalId: card.externalId, cachedUrl };
      }),
    );

    for (const result of results) {
      if (result.status === 'fulfilled') {
        urlMap.set(result.value.externalId, result.value.cachedUrl);
      }
    }
  }

  return urlMap;
};

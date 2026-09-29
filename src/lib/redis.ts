import Redis from "ioredis";

let client: Redis | null = null;
let initFailed = false;

function getRedis(): Redis | null {
  if (initFailed) return null;
  if (client) return client;

  const url = process.env.REDIS_URL;
  if (!url || url === "REDIS_URL=" || !url.startsWith("redis")) {
    return null;
  }

  // Handle accidental "REDIS_URL=rediss://..." pasted as the value
  const cleaned = url.replace(/^REDIS_URL=/, "").trim();
  if (!cleaned.startsWith("redis")) return null;

  try {
    client = new Redis(cleaned, {
      maxRetriesPerRequest: 1,
      connectTimeout: 3000,
      lazyConnect: true,
      enableOfflineQueue: false,
    });
    client.on("error", () => {
      // swallow — fall back to uncached
    });
    return client;
  } catch {
    initFailed = true;
    return null;
  }
}

const DEFAULT_TTL = 60 * 5; // 5 minutes

export async function cacheGet<T>(key: string): Promise<T | null> {
  const redis = getRedis();
  if (!redis) return null;
  try {
    if (redis.status !== "ready") await redis.connect().catch(() => null);
    const raw = await redis.get(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function cacheSet(
  key: string,
  value: unknown,
  ttlSeconds = DEFAULT_TTL
): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  try {
    if (redis.status !== "ready") await redis.connect().catch(() => null);
    await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch {
    // ignore cache write failures
  }
}

export function depsCacheKey(address: string, chainId: string): string {
  return `deps:${chainId}:${address.toLowerCase()}`;
}

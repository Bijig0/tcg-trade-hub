type RateLimitEntry = {
  count: number;
  resetTime: number;
};

type RateLimitConfig = {
  maxRequests: number;
  windowMs: number;
};

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetInMs: number;
};

const store = new Map<string, RateLimitEntry>();

const defaultConfig: RateLimitConfig = {
  maxRequests: 20,
  windowMs: 60_000,
};

export const checkRateLimit = (
  key: string,
  config: RateLimitConfig = defaultConfig,
): RateLimitResult => {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now >= entry.resetTime) {
    store.set(key, { count: 1, resetTime: now + config.windowMs });
    return { allowed: true, remaining: config.maxRequests - 1, resetInMs: config.windowMs };
  }

  entry.count += 1;
  const remaining = Math.max(0, config.maxRequests - entry.count);
  const resetInMs = entry.resetTime - now;

  return {
    allowed: entry.count <= config.maxRequests,
    remaining,
    resetInMs,
  };
};

/** Exported for testing only */
export const _clearStore = () => store.clear();

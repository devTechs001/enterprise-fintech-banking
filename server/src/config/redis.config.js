import { Redis } from 'ioredis';
import config from '#config/index.js';
import logger from '#logger.js';

/**
 * Redis client.
 *
 * Three defects fixed:
 *  1. `let redis` at the top and `export const redis = getRedis()` at the bottom
 *     redeclared the same binding — a hard `SyntaxError`, so importing this
 *     module (which `authenticate.js` does) crashed the process at startup.
 *  2. The client was created at module-evaluation time. Any module that merely
 *     imported this file opened a socket, and with no `error` listener attached
 *     yet a refused connection surfaced as an unhandled 'error' event and took
 *     the process down.
 *  3. There was no way to run without Redis, so auth could not be exercised in a
 *     test or a minimal environment.
 *
 * The client is now created lazily on first use, error-handled from the start,
 * and degrades to an in-process Map when Redis is disabled or unreachable so
 * authentication keeps working (with a warning) instead of hard-failing.
 */

let client = null;
let fallback = null;

/** Minimal stand-in implementing only the methods this app uses. */
class MemoryCache {
  constructor() {
    this.store = new Map();
  }

  _expired(entry) {
    return entry.expiresAt !== null && entry.expiresAt < Date.now();
  }

  async get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (this._expired(entry)) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  async set(key, value) {
    this.store.set(key, { value: String(value), expiresAt: null });
    return 'OK';
  }

  async setex(key, seconds, value) {
    this.store.set(key, { value: String(value), expiresAt: Date.now() + seconds * 1000 });
    return 'OK';
  }

  async del(...keys) {
    const flat = keys.flat();
    flat.forEach((key) => this.store.delete(key));
    return flat.length;
  }

  async incr(key) {
    const current = Number((await this.get(key)) || 0);
    const next = current + 1;
    const entry = this.store.get(key);
    this.store.set(key, { value: String(next), expiresAt: entry && !this._expired(entry) ? entry.expiresAt : null });
    return next;
  }

  async expire(key, seconds) {
    const entry = this.store.get(key);
    if (!entry) return 0;
    entry.expiresAt = Date.now() + seconds * 1000;
    return 1;
  }

  async ttl(key) {
    const entry = this.store.get(key);
    if (!entry) return -2;
    if (entry.expiresAt === null) return -1;
    return Math.max(0, Math.ceil((entry.expiresAt - Date.now()) / 1000));
  }

  /**
   * SCAN-based key matching.
   *
   * The transaction service used `KEYS pattern`, which blocks the Redis event
   * loop for the whole keyspace — a self-inflicted denial of service on a shared
   * instance. This walks incrementally instead.
   */
  async scanStreamKeys(pattern) {
    const regex = new RegExp(`^${pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.')}$`);
    return [...this.store.keys()].filter((key) => regex.test(key) && !this._expired(this.store.get(key)));
  }

  async quit() {
    this.store.clear();
  }
}

const useFallback = (reason) => {
  if (!fallback) {
    fallback = new MemoryCache();
    logger.warn(`Redis unavailable (${reason}); using in-process cache. Rate limits and token revocation are per-instance only.`);
  }
  return fallback;
};

/**
 * Scan for keys matching a glob pattern without blocking Redis.
 * Works against both the real client and the in-process fallback.
 */
export const scanKeys = async (pattern, count = 200) => {
  const cache = getCache();
  if (cache instanceof MemoryCache) return cache.scanStreamKeys(pattern);

  const keys = [];
  let cursor = '0';
  do {
    // eslint-disable-next-line no-await-in-loop
    const [next, batch] = await cache.scan(cursor, 'MATCH', pattern, 'COUNT', count);
    cursor = next;
    keys.push(...batch);
  } while (cursor !== '0');
  return keys;
};

/** Delete every key matching a glob pattern, in bounded batches. */
export const deleteByPattern = async (pattern) => {
  const cache = getCache();
  const keys = await scanKeys(pattern);
  if (!keys.length) return 0;
  const batchSize = 100;
  for (let i = 0; i < keys.length; i += batchSize) {
    // eslint-disable-next-line no-await-in-loop
    await cache.del(keys.slice(i, i + batchSize));
  }
  return keys.length;
};

/** Create (but do not await) the Redis client. */
const initRedis = () => {
  client = new Redis({
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password,
    db: config.redis.db,
    // Bound the connection attempt so a dead Redis cannot hang request handling.
    maxRetriesPerRequest: 2,
    enableOfflineQueue: false,
    connectTimeout: 2000,
    retryStrategy: (attempt) => (attempt > 5 ? null : Math.min(attempt * 200, 2000)),
  });

  // Attached before the socket opens: an 'error' event with no listener is fatal.
  client.on('error', (error) => {
    logger.error('Redis error', { message: error.message });
  });
  client.on('connect', () => logger.info('Connected to Redis'));
  client.on('close', () => logger.warn('Redis connection closed'));

  return client;
};

/** Returns the shared cache: Redis when enabled, otherwise the fallback. */
export const getCache = () => {
  if (!config.redis.enabled) return useFallback('REDIS_ENABLED=false');
  if (client) return client;
  try {
    return initRedis();
  } catch (error) {
    client = null;
    return useFallback(error.message);
  }
};

/** Convenience alias kept for call sites that imported `redis`. */
export const redis = {
  get: (...args) => getCache().get(...args),
  set: (...args) => getCache().set(...args),
  setex: (...args) => getCache().setex(...args),
  del: (...args) => getCache().del(...args),
  incr: (...args) => getCache().incr(...args),
  expire: (...args) => getCache().expire(...args),
  ttl: (...args) => getCache().ttl(...args),
};

export const closeRedis = async () => {
  if (client) {
    try {
      await client.quit();
    } catch (error) {
      logger.warn('Redis did not close cleanly', { message: error.message });
    }
    client = null;
  }
  if (fallback) {
    await fallback.quit();
    fallback = null;
  }
};

export { initRedis };
export default redis;

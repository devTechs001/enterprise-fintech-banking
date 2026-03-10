import { Redis } from 'ioredis';
import config from '@/config';

let redis;

/**
 * Initialize Redis connection
 * @returns {Redis} Redis client instance
 */
const initRedis = () => {
  redis = new Redis({
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password,
    db: config.redis.db,
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  });

  redis.on('error', (err) => {
    console.error('Redis error:', err);
  });

  redis.on('connect', () => {
    console.log('Connected to Redis');
  });

  return redis;
};

/**
 * Get Redis client instance
 * @returns {Redis} Redis client instance
 */
const getRedis = () => {
  if (!redis) {
    return initRedis();
  }
  return redis;
};

/**
 * Close Redis connection
 */
const closeRedis = async () => {
  if (redis) {
    await redis.quit();
    redis = null;
  }
};

export { initRedis, getRedis, closeRedis };
export const redis = getRedis();

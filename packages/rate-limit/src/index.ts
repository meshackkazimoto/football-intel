import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379");

export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<boolean> {
  const current = await redis.incr(key);

  if (current === 1) {
    await redis.expire(key, windowSeconds);
  }

  return current <= limit;
}
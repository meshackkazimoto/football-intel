import Redis from "ioredis";

export const redis = new Redis(process.env.REDIS_URL!);

export async function withCache<T>(
  key: string,
  ttlSeconds: number,
  fn: () => Promise<T>
): Promise<T> {
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);

  const result = await fn();
  await redis.set(key, JSON.stringify(result), "EX", ttlSeconds);
  return result;
}

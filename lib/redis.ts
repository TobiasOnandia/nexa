import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  throw new Error("REDIS_URL environment variable is not set");
}

declare global {
  var redisGlobal: Redis | undefined;
}

if (!globalThis.redisGlobal) {
  globalThis.redisGlobal = new Redis(redisUrl);
}

const redisClient =
  globalThis.redisGlobal ??
  (() => {
    if (!redisUrl) {
      throw new Error("REDIS_URL environment variable is not set");
    }

    const client = new Redis(redisUrl);

    client.on("connect", () => {
      console.log("Redis connected");
    });
    client.on("error", (error) => {
      console.error("Redis connection error:", error);
    });

    return client;
  });

export default redisClient;

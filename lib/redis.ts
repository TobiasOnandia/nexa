import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL;

declare global {
  var redisGlobal: Redis | undefined;
}

const redisClient = globalThis.redisGlobal;

if (!redisClient && redisUrl) {
  console.log("Creating new Redis client instance...");
  const newClient = new Redis(redisUrl);

  newClient.on("connect", () => console.log("Redis client connected"));
  newClient.on("error", (err) => console.error("Redis client error:", err));

  globalThis.redisGlobal = newClient;
} else if (!redisClient && !redisUrl) {
  console.warn(
    "REDIS_URL environment variable is not set. Redis client will NOT be initialized."
  );
} else if (redisClient && redisUrl) {
  console.log("Using existing Redis client instance.");
} else if (redisClient && !redisUrl) {
  console.warn(
    "REDIS_URL unset but Redis client already exists. Using existing client."
  );
}

export default globalThis.redisGlobal;

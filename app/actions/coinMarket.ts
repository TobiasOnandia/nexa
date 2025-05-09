"use server";

import redisClient from "@/lib/redis";

const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY;

export async function fetchCoinMarket() {
  const url = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=USD";

  if (!COINGECKO_API_KEY) {
    throw new Error("COINGECKO_API_KEY environment variable is not set");
  }

  const cacheKey = "crypto:list:latest:usd";
  let cachedData;
  if (redisClient) {
    try {
      cachedData = await redisClient.get(cacheKey);
      if (cachedData) {
        return JSON.parse(cachedData);
      }
    } catch (redisError) {
      console.error("Error fetching coin market data:", redisError);
      return null;
    }
  } else {
    console.error("Redis client is not initialized");
    return null;
  }

  try {
    const response = await fetch(url, {
      headers: {
        accept: "application/json",
        x_cg_demo_api_key: COINGECKO_API_KEY!,
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `HTTP error! status: ${response.status}, body: ${errorBody}`
      );
    }

    const data = await response.json();

    if (redisClient && data) {
      const cacheExpirySeconds = 60 * 5;
      try {
        await redisClient.set(
          cacheKey,
          JSON.stringify(data),
          "EX",
          cacheExpirySeconds
        );
      } catch (redisError) {
        console.error("Error caching coin market data:", redisError);
      }
    } else if (redisClient) {
      console.error(`Not caching empty data for ${cacheKey}`);
    } else {
      console.error("Redis client is not initialized");
    }

    console.log(data);

    return data;
  } catch (error) {
    console.error("Error fetching coin market data:", error);
    return null;
  }
}

export async function fetchCoinMarketHistory() {
  const url =
    "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=1";

  try {
    const response = await fetch(url, {
      headers: {
        accept: "application/json",
        x_cg_demo_api_key: COINGECKO_API_KEY!,
      },
    });

    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error("Error fetching coin market data:", error);
    return null;
  }
}

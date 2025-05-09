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
        console.log("Coin market data found in cache");
        return JSON.parse(cachedData);
      }
    } catch (redisError) {
      console.log("Error fetching coin market data:", redisError);
    }
  } else {
    console.log("Redis client is not initialized");
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
        console.log("Error caching coin market data:", redisError);
      }
    } else if (redisClient) {
      console.log(`Not caching empty data for ${cacheKey}`);
    } else {
      console.log("Redis client is not initialized");
    }

    return data;
  } catch (error) {
    console.log("Error fetching coin market data:", error);
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
    return data;
  } catch (error) {
    console.error("Error fetching coin market data:", error);
    return null;
  }
}

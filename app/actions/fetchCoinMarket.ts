"use server";

const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY;

if (!COINGECKO_API_KEY) {
  throw new Error("COINGECKO_API_KEY environment variable is not set");
}

export async function fetchCoinMarket() {
  const url = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=USD";

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

"use server";

export async function fetchCoinMarket() {
  try {
    const response = await fetch(
      "https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest",
      {
        headers: {
          "X-CMC_PRO_API_KEY": process.env.COINMARKETCAP_API_KEY!,
        },
      }
    );

    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error("Error fetching coin market data:", error);
    return null;
  }
}

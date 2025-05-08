"use client";

import { useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { AlertCircle, Star } from "lucide-react";
import { fetchCoinMarket } from "@/app/actions/fetchCoinMarket";
import { useQuery } from "@tanstack/react-query";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export interface CryptoData {
  id: number;
  name: string;
  symbol: string;
  quote: {
    USD: {
      price: number;
      percent_change_24h: number;
      market_cap: number;
    };
  };
}

export default function Dashboard() {
  const [currency, setCurrency] = useState("USD");
  const [favorites, setFavorites] = useState<number[]>([]);

  const {
    data: cryptoData,
    isLoading,
    error: cryptoError,
  } = useQuery({
    queryKey: ["cryptoData"],
    queryFn: fetchCoinMarket,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  console.log(cryptoData);

  if (isLoading)
    return <div className="text-center py-8">Cargando datos...</div>;
  if (cryptoError)
    return (
      <div className="text-red-400 text-center py-8">
        <AlertCircle className="inline mr-2" />
        {cryptoError.message}
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sección Principal */}
        <div className="lg:col-span-2 space-y-8">
          {/* Gráfico Principal */}
          <div className="bg-[hsl(220,15%,20%)] p-6 rounded-xl">
            <h2 className="font-satoshi-bold text-2xl mb-4">Bitcoin (BTC)</h2>
            <div className="h-64">
              <Line
                data={{
                  labels: ["1H", "24H", "7D", "1M", "3M"],
                  datasets: [
                    {
                      label: "Precio USD",
                      data: cryptoData?.data.map(
                        (crypto: CryptoData) => crypto.quote.USD.price
                      ),
                      borderColor: "hsl(250,70%,60%)",
                      tension: 0.4,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                  },
                }}
              />
            </div>
          </div>

          {/* Tabla de Criptomonedas */}
          <div className="bg-[hsl(220,15%,20%)] rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="border-b border-[hsl(220,15%,25%)]">
                <tr>
                  <th className="text-left py-4 px-6 font-satoshi-medium">#</th>
                  <th className="text-left py-4 px-6 font-satoshi-medium">
                    Nombre
                  </th>
                  <th className="text-right py-4 px-6 font-satoshi-medium">
                    Precio
                  </th>
                  <th className="text-right py-4 px-6 font-satoshi-medium">
                    24h %
                  </th>
                  <th className="text-right py-4 px-6 font-satoshi-medium">
                    Market Cap
                  </th>
                  <th className="text-right py-4 px-6"></th>
                </tr>
              </thead>
              <tbody>
                {cryptoData?.data?.map((crypto: CryptoData) => (
                  <tr
                    key={crypto.id}
                    className="hover:bg-[hsl(220,15%,25%)] transition-colors"
                  >
                    <td className="py-4 px-6">{crypto.id}</td>
                    <td className="py-4 px-6 font-satoshi-medium">
                      {crypto.name}
                    </td>
                    <td className="py-4 px-6 text-right">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                      }).format(crypto.quote.USD.price)}
                    </td>
                    <td
                      className={`py-4 px-6 text-right ${
                        crypto.quote.USD.percent_change_24h >= 0
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {crypto.quote.USD.percent_change_24h.toFixed(2)}%
                    </td>
                    <td className="py-4 px-6 text-right">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency,
                        notation: "compact",
                      }).format(crypto.quote.USD.market_cap)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() =>
                          setFavorites((prev) =>
                            prev.includes(crypto.id)
                              ? prev.filter((id) => id !== crypto.id)
                              : [...prev, crypto.id]
                          )
                        }
                        className="text-[hsl(250,70%,60%)] hover:text-[hsl(250,70%,50%)]"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            favorites.includes(crypto.id) && "fill-current"
                          }`}
                        />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Selector de Moneda */}
          <div className="bg-[hsl(220,15%,20%)] p-6 rounded-xl">
            <h3 className="font-satoshi-medium mb-4">Moneda Base</h3>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full bg-[hsl(220,15%,25%)] rounded-lg p-3 font-satoshi-medium"
            >
              {["USD", "EUR", "GBP", "JPY"].map((curr) => (
                <option key={curr} value={curr}>
                  {curr}
                </option>
              ))}
            </select>
          </div>

          {/* Top Movers */}
          <div className="bg-[hsl(220,15%,20%)] p-6 rounded-xl">
            <h3 className="font-satoshi-medium mb-4">Mayores Movimientos</h3>
            {cryptoData?.data
              .sort(
                (a: CryptoData, b: CryptoData) =>
                  Math.abs(b.quote.USD.percent_change_24h) -
                  Math.abs(a.quote.USD.percent_change_24h)
              )
              .slice(0, 5)
              .map((crypto: CryptoData) => (
                <div
                  key={crypto.id}
                  className="flex justify-between items-center py-2"
                >
                  <span className="font-satoshi-medium">{crypto.symbol}</span>
                  <span
                    className={`${
                      crypto.quote.USD.percent_change_24h >= 0
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {crypto.quote.USD.percent_change_24h.toFixed(1)}%
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Line } from "react-chartjs-2";
// Asegúrate de que Chart.js esté registrado en tu layout o root _app.tsx
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions, // Importa ChartOptions para tipar las opciones
} from "chart.js";
import { AlertCircle, Star } from "lucide-react";
import {
  fetchCoinMarket, // Asumo que esta trae la lista de coins (ej. /coins/markets)
  fetchCoinMarketHistory, // Asumo que esta trae datos históricos de UNA coin (ej. /coins/{id}/market_chart)
} from "@/app/actions/fetchCoinMarket"; // Asumo que ambas funciones están en este archivo o son Server Actions

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns"; // Para formatear fechas (pnpm add date-fns)

// --- Registro de Chart.js (Asegúrate de que solo se haga UNA vez en tu app) ---
// Si ya lo haces en otro lado (como _app.tsx si usas Pages Router,
// o layout.tsx/root component si usas App Router de forma global), remueve esto.
// Lo mantenemos aquí por si es el único lugar donde lo registras actualmente.
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);
// --- Fin Registro de Chart.js ---

// --- Interfaces Corregidas (Basadas en la respuesta REAL de CoinGecko APIs) ---

// Interfaz para la respuesta completa del endpoint /coins/{id}/market_chart
export interface CoinMarketHistoryResponse {
  // Renombrado para claridad
  prices: [number, number][]; // Array de [timestamp, price]
  market_caps: [number, number][]; // Array de [timestamp, market_cap]
  total_volumes: [number, number][]; // Array de [timestamp, total_volume]
}

// Interfaz para cada elemento del array retornado por /coins/markets
export interface CryptoData {
  // Nombre original, pero ahora representa un item
  id: string; // CoinGecko ID es string (ej. "bitcoin")
  symbol: string; // Símbolo (ej. "btc")
  name: string; // Nombre (ej. "Bitcoin")
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation?: number; // Puede ser null/undefined en la respuesta
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply?: number; // Puede ser null/undefined
  total_supply?: number; // Puede ser null/undefined
  max_supply?: number; // Puede ser null/undefined
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  roi?: Roi; // Puede ser null/undefined
  last_updated: string;
}

export interface Roi {
  times: number;
  currency: string;
  percentage: number;
}

// --- Fin Interfaces Corregidas ---

export default function Dashboard() {
  const [currency, setCurrency] = useState("USD");
  // --- TIPO CORREGIDO: favorites debe usar string[] si el ID de crypto es string ---
  const [favorites, setFavorites] = useState<string[]>([]);
  // --- Fin Tipo Corregido ---

  // --- useQuery para la lista de monedas (/coins/markets) ---
  // data tipada como array de CryptoData. Asumimos que fetchCoinMarket devuelve el array directamente.
  const {
    data: cryptoListData, // Renombrado para claridad (lista de monedas)
    isLoading: isLoadingList,
    error: cryptoListError,
  } = useQuery<CryptoData[]>({
    // Tipamos useQuery con el tipo esperado
    queryKey: ["cryptoList"], // Clave para esta query
    queryFn: fetchCoinMarket, // La función que fetchea /coins/markets
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  // --- Fin useQuery Lista ---

  // --- useQuery para datos históricos (/coins/{id}/market_chart) ---
  // data tipada como CoinMarketHistoryResponse
  // Esta query fetchea datos para un gráfico ESPECÍFICO (Bitcoin, 1 día)
  // En una implementación real de dashboard, cada widget de gráfico tendría su propia query
  const {
    data: cryptoHistoryData, // Renombrado para claridad (data histórica)
    isLoading: isLoadingHistory,
    error: cryptoHistoryError,
  } = useQuery<CoinMarketHistoryResponse>({
    // Tipamos useQuery con el tipo esperado
    queryKey: [
      "cryptoHistory",
      { coinId: "bitcoin", days: "1", vsCurrency: "usd" },
    ], // Clave con parámetros
    queryFn: () => {
      // Llama a la función que fetchea datos históricos, pasándole los parámetros necesarios
      // Esta función podría ser fetchCoinMarketHistory(coinId, days, vsCurrency) si la adaptas para recibir params
      // Por ahora, usamos la función tal cual, que ya tiene los params hardcodeados (bitcoin, 1, usd)
      return fetchCoinMarketHistory();
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  // --- Fin useQuery Histórico ---

  // --- Estados de Loading y Error Combinados ---
  // Considera si solo el loading de la lista o también el del gráfico debe mostrar el loading screen
  if (isLoadingList)
    // || isLoadingHistory) // Puedes incluir loadingHistory si quieres
    return <div className="text-center py-8">Cargando datos...</div>;

  if (cryptoListError)
    // || cryptoHistoryError) // Puedes incluir errorHistory
    return (
      <div className="text-red-400 text-center py-8">
        <AlertCircle className="inline mr-2" />
        Error al cargar la lista de monedas: {(cryptoListError as any).message}
        {/* {cryptoHistoryError && <p>Error al cargar histórico: {(cryptoHistoryError as any).message}</p>} */}
      </div>
    );
  // --- Fin Estados de Loading y Error ---

  // --- Preparar Datos para el Gráfico (SI cryptoHistoryData existe y no hay error) ---
  // Solo preparamos si los datos históricos se cargaron correctamente
  const chartDataForChartJS =
    cryptoHistoryData &&
    cryptoHistoryData.prices &&
    cryptoHistoryData.prices.length > 0
      ? {
          // --- Mapeo CORREGIDO para los labels del eje X (Fechas/Timestamps) ---
          labels: cryptoHistoryData.prices.map((item) => {
            const timestamp = item[0]; // El timestamp viene primero
            const date = new Date(timestamp); // Convertir a objeto Date
            // Formatear la fecha/hora. Aquí usamos date-fns format
            // El formato depende del rango de tiempo (days). Para 1 día, la hora es más útil.
            // Para 30 días, la fecha es mejor.
            return format(date, "HH:mm"); // Ejemplo para 1 día (solo hora)
            // return format(date, 'MM/dd'); // Ejemplo para más días (solo fecha)
          }),
          // --- Fin Mapeo Labels ---

          // --- Mapeo CORREGIDO para los datos del eje Y (Precios) ---
          datasets: [
            {
              label: "Precio USD", // Etiqueta del dataset
              data: cryptoHistoryData.prices.map((item) => item[1]), // Obtener el precio (segundo elemento del par)
              borderColor: "hsl(250,70%,60%)",
              backgroundColor: "rgba(hsl(250,70%,60%), 0.2)", // Color de área
              tension: 0.4,
              pointRadius: 0,
              fill: true,
            },
          ],
        }
      : { labels: [], datasets: [] }; // Datos vacíos si no hay data histórica

  // Opciones de Chart.js (ejemplo básico, puedes refinar más)
  const optionsForChartJS: ChartOptions<"line"> = {
    // Tipear opciones
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "Precio de Bitcoin (Últimas 24h)", // Título descriptivo
        color: "hsl(210, 20%, 95%)",
      },
      tooltip: {
        // Configuración básica del tooltip
        callbacks: {
          label: function (context) {
            // Función para formatear el tooltip
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              // Formatear el valor como moneda
              label += new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(context.parsed.y);
            }
            return label;
          },
        },
      },
    },
    scales: {
      // Configuración de ejes
      x: {
        title: { display: false, text: "Hora" },
        ticks: { color: "hsl(210, 10%, 60%)" },
        grid: { color: "hsl(210, 10%, 30%)" },
      },
      y: {
        title: { display: false, text: "Precio (USD)" },
        ticks: {
          color: "hsl(210, 10%, 60%)",
          callback: function (
            value: string | number,
            index: number,
            values: any
          ) {
            const numValue =
              typeof value === "string" ? parseFloat(value) : value;
            return new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
              notation: "compact",
            }).format(numValue);
          },
        },
        grid: { color: "hsl(210, 10%, 30%)" },
        beginAtZero: false,
      },
    },
    layout: { padding: { left: 0, right: 10, top: 10, bottom: 0 } },
  };
  // --- Fin Preparación de Datos y Opciones para el Gráfico ---

  return (
    <div className="max-w-7xl mx-auto   py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sección Principal */}
        <div className="lg:col-span-2 space-y-8">
          {/* Gráfico Principal */}
          <div className="bg-[hsl(220,15%,20%)]  p-6 rounded-xl">
            <h2 className="font-satoshi-bold text-2xl mb-4">
              Bitcoin (BTC) - Histórico (Últimas 24h)
            </h2>
            <div className="h-64">
              {/* Renderiza el gráfico solo si hay datos procesados */}
              {chartDataForChartJS.datasets.length > 0 ? (
                <Line data={chartDataForChartJS} options={optionsForChartJS} />
              ) : (
                // Mensaje si no hay datos históricos
                <div className="text-center py-8">
                  No hay datos históricos disponibles para el gráfico.
                </div>
              )}
            </div>
          </div>
          {/* Tabla de Criptomonedas */}
          {/* Asegúrate de que cryptoListData existe y no hay error */}
          {cryptoListData && cryptoListData.length > 0 && (
            <table className=" bg-[hsl(220,15%,20%)] rounded-xl overflow-hidden w-full">
              <thead className="border-b border-[hsl(220,15%,25%)]">
                <tr>
                  <th className="text-left py-4 px-6 ">#</th>
                  <th className="text-left py-4 px-6 ">Nombre</th>
                  <th className="text-right py-4 px-6 ">Precio</th>
                  <th className="text-right py-4 px-6 ">Market Cap</th>
                  <th className=" py-4 "></th>
                </tr>
              </thead>
              <tbody>
                {/* Mapeo CORREGIDO para la tabla (usa cryptoListData) */}
                {cryptoListData.map((crypto: CryptoData) => (
                  <tr
                    key={crypto.id} // ID es string
                    className="hover:bg-[hsl(220,15%,25%)] transition-colors"
                  >
                    <td className="py-4 px-6">{crypto.market_cap_rank}</td>
                    <td className="py-4 px-6">
                      {crypto.name} ({crypto.symbol.toUpperCase()})
                    </td>
                    <td className="py-4 px-6 text-right">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD", // Usar USD para el precio actual según el fetch
                      }).format(crypto.current_price)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() =>
                          setFavorites(
                            (prev) =>
                              prev.includes(crypto.id) // Usar ID string directamente
                                ? prev.filter((id) => id !== crypto.id) // Filtrar por ID string
                                : [...prev, crypto.id] // Añadir ID string
                          )
                        }
                        className="text-[hsl(250,70%,60%)] hover:text-[hsl(250,70%,50%)]"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            favorites.includes(crypto.id) && // Comparar con ID string
                            "fill-current"
                          }`}
                        />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Selector de Moneda */}
          <div className="bg-[hsl(220,15%,20%)] p-6 rounded-xl">
            <h3 className=" mb-4">Moneda Base</h3>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full bg-[hsl(220,15%,25%)] rounded-lg p-3 "
            >
              {["USD", "EUR", "GBP", "JPY"].map((curr) => (
                <option key={curr} value={curr}>
                  {curr}
                </option>
              ))}
            </select>
          </div>
          {/* Top Movers */}
          {cryptoListData && cryptoListData.length > 0 && (
            <div className="bg-[hsl(220,15%,20%)] p-6 rounded-xl">
              <h3 className=" mb-4">Mayores Movimientos</h3>
              {/* Mapeo CORREGIDO para Top Movers (usa cryptoListData) */}
              {cryptoListData
                .sort(
                  (
                    a,
                    b // Los tipos ya están definidos en el map de arriba si lo tipas bien
                  ) =>
                    Math.abs(b.price_change_percentage_24h) -
                    Math.abs(a.price_change_percentage_24h)
                )
                .slice(0, 5)
                .map((crypto) => (
                  <div
                    key={`mover-${crypto.id}`} // Clave única
                    className="flex justify-between items-center py-2"
                  >
                    <span className="">{crypto.symbol.toUpperCase()}</span>
                    <span
                      className={`${
                        crypto.price_change_percentage_24h >= 0
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {crypto.price_change_percentage_24h.toFixed(1)}%
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

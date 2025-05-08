"use client";

import { fetchCurrentUser } from "@/utils/auth/fetchCurrentUser";
import { useQuery } from "@tanstack/react-query";
import { Bell, Menu, Moon, Search, Sun } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const {
    data: currentUser,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["currentUser"],
    queryFn: fetchCurrentUser,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  console.log(currentUser);

  return (
    <header className="bg-[hsl(220,15%,12%)] text-[hsl(0,0%,95%)] sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo y menú móvil */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-[hsl(220,15%,20%)] transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>

            <Link href="/" className="flex items-center gap-3">
              {/* Icono SVG o imagen del logo */}
              <div className="w-8 h-8 rounded-lg bg-[hsl(250,70%,60%)] flex items-center justify-center">
                <span className="text-white font-bold">A</span>
              </div>
              <span className="font-satoshi-bold text-2xl">AnalyticsHub</span>
            </Link>
          </div>

          {/* Menú central (escritorio) */}
          <nav className="hidden md:flex gap-6">
            {["Dashboard", "Reportes", "Alertas", "Configuración"].map(
              (item) => (
                <Link
                  key={item}
                  href="#"
                  className="font-satoshi-medium hover:text-[hsl(250,70%,60%)] transition-colors relative group"
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[hsl(250,70%,60%)] group-hover:w-full transition-all duration-300"></span>
                </Link>
              )
            )}
          </nav>

          {/* Acciones derecha */}
          <div className="flex items-center gap-4">
            {/* Buscador */}
            <div className="hidden lg:flex items-center bg-[hsl(220,15%,20%)] rounded-lg px-3 py-2 gap-2">
              <Search className="text-[hsl(0,0%,80%)]" />
              <input
                type="text"
                placeholder="Buscar..."
                className="font-satoshi-medium bg-transparent outline-none placeholder-[hsl(0,0%,60%)] text-sm w-48"
              />
            </div>

            {/* Iconos */}
            <button className="p-2 rounded-lg hover:bg-[hsl(220,15%,20%)] relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 bg-red-500 text-xs w-5 h-5 rounded-full flex items-center justify-center">
                3
              </span>
            </button>

            <button className="p-2 rounded-lg hover:bg-[hsl(220,15%,20%)]">
              <Sun className="w-5 h-5" />
            </button>

            {/* Perfil */}
            <div className="w-9 h-9 rounded-full bg-[hsl(250,70%,60%)] flex items-center justify-center cursor-pointer">
              <span className="font-satoshi-bold text-sm">JP</span>
            </div>
          </div>
        </div>

        {/* Menú móvil */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col gap-3 mt-4">
              {["Dashboard", "Reportes", "Alertas", "Configuración"].map(
                (item) => (
                  <Link
                    key={item}
                    href="#"
                    className="font-satoshi-medium px-4 py-2 hover:bg-[hsl(220,15%,20%)] rounded-lg"
                  >
                    {item}
                  </Link>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

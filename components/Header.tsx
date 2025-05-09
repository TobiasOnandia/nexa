"use client";

import { logoutAction } from "@/app/actions/auth";
import { fetchCurrentUser } from "@/utils/auth/fetchCurrentUser";
import { useQuery } from "@tanstack/react-query";
import { Bell, Menu, Moon, Search, Sun } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { HeaderMobile } from "@/components/mobile/Header.mobile";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
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

  return (
    <header className="bg-[hsl(220,15%,12%)] flex md:items-center justify-between h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-[hsl(0,0%,95%)] sticky top-0 z-50 ">
      <section className="flex items-center gap-6">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-[hsl(220,15%,20%)] transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>

        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[hsl(250,70%,60%)] flex items-center justify-center">
            <span className="text-white font-bold">A</span>
          </div>
          <span className="font-satoshi-bold text-2xl">AnalyticsHub</span>
        </Link>
      </section>

      <nav className="hidden md:flex gap-6">
        {["Dashboard", "Reportes", "Alertas", "Configuración"].map((item) => (
          <Link
            key={item}
            href="#"
            className="font-satoshi-medium hover:text-[hsl(250,70%,60%)] transition-colors relative group"
          >
            {item}
            <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[hsl(250,70%,60%)] group-hover:w-full transition-all duration-300"></span>
          </Link>
        ))}
      </nav>
      <section className="flex items-center gap-4">
        <label
          htmlFor="search"
          className="hidden lg:flex items-center bg-[hsl(220,15%,20%)] rounded-lg px-3 py-2 gap-2"
        >
          <Search className="text-[hsl(0,0%,80%)]" />
          <input
            id="search"
            name="search"
            type="search"
            placeholder="Buscar..."
            className="font-satoshi-medium bg-transparent outline-none placeholder-[hsl(0,0%,60%)] text-sm w-48"
          />
        </label>

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
        <section className="relative" ref={profileMenuRef}>
          <p
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="w-9 h-9 rounded-full bg-[hsl(250,70%,60%)] flex items-center justify-center cursor-pointer hover:bg-[hsl(250,70%,50%)] transition-colors"
          >
            <span className="font-satoshi-bold text-sm">
              {!currentUser ? "U" : currentUser?.name.charAt(0).toUpperCase()}
            </span>
          </p>

          {isProfileMenuOpen && (
            <ul className="absolute flex flex-col gap-1 right-0 top-10 w-48 bg-[hsl(220,15%,20%)] rounded-lg shadow-xl py-2">
              <li className="w-full px-4 cursor-pointer py-2  text-sm font-satoshi-medium text-gray-300 font-semibold hover:bg-[hsl(220,15%,25%)]">
                <Link href="/profile" className="">
                  Perfil
                </Link>
              </li>

              <li className="w-full px-4 cursor-pointer py-2  text-sm font-satoshi-medium text-gray-300 font-semibold hover:bg-[hsl(220,15%,25%)]">
                <Link href="/settings" className="">
                  Configuración
                </Link>
              </li>

              <li className="w-full px-4  py-2  text-sm cursor-pointer text-red-400 hover:bg-red-500/10 text-left font-semibold ">
                <button onClick={() => logoutAction()}>Cerrar sesión</button>
              </li>
            </ul>
          )}
        </section>
      </section>

      {/* Menú móvil */}
      {isMobileMenuOpen && <HeaderMobile />}
    </header>
  );
}

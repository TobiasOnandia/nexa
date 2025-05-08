"use client";
import Link from "next/link";
import { useActionState } from "react";
import { login } from "../actions/auth";
import { redirect } from "next/navigation";

export default function LoginPage() {
  const [, formAction, isLoading] = useActionState(
    async (_: void | null, formData: FormData) => {
      const response = await login(formData);
      if (!response.success) {
        throw new Error("Failed to login user", { cause: response });
      }

      redirect("/");
    },

    null
  );
  return (
    <main className="w-full flex flex-col h-screen justify-center max-w-md space-y-8 m-auto  p-4">
      {/* Encabezado */}
      <header className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-[hsl(250,70%,60%)] flex items-center justify-center">
            <span className="text-white font-satoshi-bold">A</span>
          </div>
          <h1 className="font-satoshi-bold text-3xl text-[hsl(0,0%,95%)]">
            AnalyticsHub
          </h1>
        </div>
        <h2 className="mt-6 font-satoshi-medium text-2xl text-white">
          Inicia sesión en tu cuenta
        </h2>
      </header>

      {/* Formulario */}
      <form action={formAction} className="mt-8 space-y-6">
        <label
          htmlFor="email"
          className="block font-satoshi-medium text-sm text-gray-300"
        >
          Email
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="mt-1 py-2 px-4 block w-full rounded-lg bg-[hsl(220,15%,20%)] border-transparent 
                         focus:border-[hsl(250,70%,60%)] focus:ring-[hsl(250,70%,60%)] text-white 
                         font-satoshi-regular placeholder-gray-400"
            placeholder="tu@email.com"
          />
        </label>

        <label
          htmlFor="password"
          className="block font-satoshi-medium text-sm text-gray-300"
        >
          Contraseña
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="mt-1 py-2 px-4 block w-full rounded-lg bg-[hsl(220,15%,20%)] border-transparent 
                         focus:border-[hsl(250,70%,60%)] focus:ring-[hsl(250,70%,60%)] text-white 
                         font-satoshi-regular placeholder-gray-400"
            placeholder="••••••••"
          />
        </label>

        <div className="flex items-center justify-between">
          <label
            htmlFor="remember-me"
            className=" flex items-center gap-3 text-sm text-gray-300"
          >
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-600 bg-[hsl(220,15%,20%)] 
                         text-[hsl(250,70%,60%)] focus:ring-[hsl(250,70%,60%)]"
            />
            Recordarme
          </label>

          <Link
            href="#"
            className="text-sm font-satoshi-medium text-[hsl(250,70%,60%)] hover:text-[hsl(250,70%,70%)]"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <button
          type="submit"
          className="w-full py-3 px-4 rounded-lg bg-[hsl(250,70%,60%)] hover:bg-[hsl(250,70%,50%)] 
                     text-white font-satoshi-bold transition-colors duration-200"
        >
          {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
        </button>
      </form>

      {/* Separador */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-600"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-[hsl(220,15%,12%)] text-gray-400">
            O continúa con
          </span>
        </div>
      </div>

      {/* Social Login */}
      <div className="flex gap-4">
        <button
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg 
                     bg-[hsl(220,15%,20%)] hover:bg-[hsl(220,15%,25%)] transition-colors"
        >
          <span className="font-satoshi-medium text-gray-300">Google</span>
        </button>

        <button
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg 
                     bg-[hsl(220,15%,20%)] hover:bg-[hsl(220,15%,25%)] transition-colors"
        >
          <span className="font-satoshi-medium text-gray-300">GitHub</span>
        </button>
      </div>

      {/* Registro */}
      <p className="mt-8 text-center text-sm text-gray-400">
        ¿No tienes cuenta?{" "}
        <Link
          href="/register"
          className="font-satoshi-medium text-[hsl(250,70%,60%)] hover:text-[hsl(250,70%,70%)]"
        >
          Regístrate
        </Link>
      </p>
    </main>
  );
}

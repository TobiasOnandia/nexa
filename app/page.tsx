"use client";
import { useActionState } from "react";

export default function Home() {
  const [, formAction, isLoading] = useActionState(
    async (_: void | null, formData: FormData) => {
      const { email, password } = Object.fromEntries(formData.entries());
      console.log(email, password);

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Failed to login user", { cause: response });
      }

      const data = await response.json();
      console.log(data);
    },
    null
  );

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <form action={formAction} className="flex flex-col gap-2">
        <input
          name="email"
          type="email"
          className="border border-gray-300 rounded px-2 py-1"
        />
        <input
          name="password"
          type="password"
          className="border border-gray-300 rounded px-2 py-1"
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

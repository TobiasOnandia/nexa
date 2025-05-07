"use client";
import { useActionState } from "react";
import { login, logoutAction } from "@/app/actions/auth";

export default function Home() {
  const [, formAction, isLoading] = useActionState(
    async (_: void | null, formData: FormData) => {
      const response = await login(formData);

      if (!response.success) {
        throw new Error("Failed to login user", { cause: response });
      }

      console.log(response);
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
        <button type="button" onClick={() => logoutAction()}>
          Logout
        </button>
      </form>
    </div>
  );
}

"use client";
import { useActionState } from "react";
import { login, logoutAction } from "@/app/actions/auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Header from "@/components/Header";
import Dashboard from "@/components/dashboard/Dashboard";

export default function Home() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <Header />
      <Dashboard />
    </QueryClientProvider>
  );
}

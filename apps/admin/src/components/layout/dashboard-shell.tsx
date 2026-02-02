"use client";

import { Header } from "@/components/layout/header";

export function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
      <Header />
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}
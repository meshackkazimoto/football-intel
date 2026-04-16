"use client";

import { Header } from "@/components/layout/header";

export function DashboardShell({
  children,
  onOpenNavigation = () => {},
}: {
  children: React.ReactNode;
  onOpenNavigation?: () => void;
}) {
  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
      <Header onOpenNavigation={onOpenNavigation} />
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";

export function DashboardFrame({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);

  return (
    <div className="relative min-h-screen text-[color:var(--foreground)]">
      <Sidebar
        mobileOpen={mobileNavigationOpen}
        onClose={() => setMobileNavigationOpen(false)}
      />
      <div className="relative flex min-h-screen min-w-0 flex-col lg:ml-64">
        <Header onOpenNavigation={() => setMobileNavigationOpen(true)} />
        <main className="flex-1 px-4 py-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}

"use client";

import { Menu, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const routeLabels: Record<string, { section: string; title: string }> = {
  "/": { section: "Overview", title: "Dashboard" },
  "/matches": { section: "Operations", title: "Matches" },
  "/fixtures": { section: "Planning", title: "Fixtures" },
  "/standings": { section: "Competition", title: "Standings" },
  "/players": { section: "Registry", title: "Players" },
  "/teams": { section: "Registry", title: "Teams" },
  "/system-logs": { section: "Integrity", title: "System Logs" },
};

export function Header({
  onOpenNavigation,
}: {
  onOpenNavigation: () => void;
}) {
  const pathname = usePathname();
  const matchedRoute =
    Object.entries(routeLabels).find(([route]) =>
      route === "/" ? pathname === route : pathname.startsWith(route),
    )?.[1] ?? routeLabels["/"];

  return (
    <header className="sticky top-0 z-20 border-b border-[color:var(--border)] bg-[color:var(--background)]/95 backdrop-blur supports-[backdrop-filter]:bg-[color:var(--background)]/80">
      <div className="flex h-16 items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Button
          variant="outline"
          size="icon"
          onClick={onOpenNavigation}
          className="lg:hidden"
        >
          <Menu className="h-4 w-4" />
        </Button>

        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-[color:var(--muted-foreground)]">
            {matchedRoute.section}
          </p>
          <h1 className="text-lg font-semibold text-[color:var(--foreground)]">
            {matchedRoute.title}
          </h1>
        </div>

        <div className="ml-auto hidden w-full max-w-sm items-center md:flex">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--muted-foreground)]" />
            <Input
              placeholder="Search"
              className="pl-9"
            />
          </div>
        </div>
      </div>
    </header>
  );
}

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import {
  BarChart3,
  CalendarClock,
  FileText,
  LayoutDashboard,
  LogOut,
  Shield,
  Swords,
  Users,
} from "lucide-react";
import { authService } from "@/services/auth/auth.service";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Matches", href: "/matches", icon: Swords },
  { name: "Fixtures", href: "/fixtures", icon: CalendarClock },
  { name: "Standings", href: "/standings", icon: BarChart3 },
  { name: "Players", href: "/players", icon: Users },
  { name: "Teams", href: "/teams", icon: Shield },
  { name: "System Logs", href: "/system-logs", icon: FileText },
];

function SidebarContent({
  pathname,
  onNavigate,
  onLogout,
  loggingOut,
}: {
  pathname: string;
  onNavigate?: () => void;
  onLogout: () => void;
  loggingOut: boolean;
}) {
  return (
    <div className="flex h-full flex-col bg-[color:var(--sidebar)] text-[color:var(--sidebar-foreground)]">
      <div className="px-5 py-5">
        <Link href="/" className="flex items-center gap-3" onClick={onNavigate}>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[color:var(--sidebar-border)] bg-[color:var(--background)]">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <div className="font-display text-2xl uppercase leading-none tracking-[0.04em]">
              Football Intel
            </div>
            <div className="mt-1 text-xs text-[color:var(--sidebar-muted)]">
              Admin
            </div>
          </div>
        </Link>
      </div>

      <Separator />

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-[color:var(--foreground)] text-[color:var(--background)]"
                  : "text-[color:var(--sidebar-foreground)] hover:bg-[color:var(--muted)]",
              )}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <Separator />

      <div className="p-3">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={onLogout}
          disabled={loggingOut}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </div>
  );
}

export function Sidebar({
  mobileOpen = false,
  onClose,
}: {
  mobileOpen?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      router.push("/login");
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <>
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-[color:var(--sidebar-border)] bg-[color:var(--sidebar)] lg:block">
        <SidebarContent
          pathname={pathname}
          onLogout={handleLogout}
          loggingOut={logoutMutation.isPending}
        />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={(open) => !open && onClose?.()}>
        <SheetContent side="left" className="w-[18rem] p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <SidebarContent
            pathname={pathname}
            onNavigate={onClose}
            onLogout={handleLogout}
            loggingOut={logoutMutation.isPending}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Settings,
  Users,
  Trophy,
  Calendar,
  FileText,
  ShieldCheck,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Matches", href: "/matches", icon: Calendar },
  { name: "Players", href: "/players", icon: Users },
  { name: "Clubs", href: "/clubs", icon: Trophy },
  { name: "Ingestion Logs", href: "/logs", icon: FileText },
  { name: "Verifications", href: "/verifications", icon: ShieldCheck },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-slate-900 text-white">
      <div className="flex h-16 items-center px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-xl tracking-tight"
        >
          <div className="bg-emerald-500 p-1.5 rounded-lg">
            <BarChart3 className="w-6 h-6 text-slate-900" />
          </div>
          <span>
            Football<span className="text-emerald-500">Intel</span>
          </span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        <p className="px-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Management
        </p>
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                isActive
                  ? "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white",
              )}
            >
              <item.icon
                className={cn(
                  "w-5 h-5 transition-colors",
                  isActive
                    ? "text-emerald-400"
                    : "text-slate-500 group-hover:text-slate-300",
                )}
              />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-800">
        <button className="flex items-center gap-3 w-full px-3 py-2.5 text-slate-400 hover:bg-slate-800 hover:text-white rounded-xl transition-all">
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
}

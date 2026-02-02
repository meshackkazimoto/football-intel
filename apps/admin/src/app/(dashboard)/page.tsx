"use client";

import { useQuery } from "@tanstack/react-query";
import { matchesService } from "@/services/matches/matches.service";
import { playersService } from "@/services/players/players.service";
import { adminService } from "@/services/admin/admin.service";
import {
  Users,
  ShieldCheck,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function DashboardPage() {
  const { data: matchesData, isLoading: matchesLoading } = useQuery({
    queryKey: ["matches", "stats"],
    queryFn: () => matchesService.getMatches({ limit: 10 }),
  });

  const { data: playersData, isLoading: playersLoading } = useQuery({
    queryKey: ["players", "stats"],
    queryFn: () => playersService.getPlayers({ limit: 10 }),
  });

  const { data: logsData, isLoading: logsLoading } = useQuery({
    queryKey: ["ingestion-logs", "pending"],
    queryFn: () =>
      adminService.getIngestionLogs({ status: "pending", limit: 5 }),
  });

  const stats = [
    {
      name: "Total Matches",
      value: matchesData?.total?.toString() || "0",
      change: "+12.5%",
      trending: "up",
      icon: Calendar,
      color: "emerald",
    },
    {
      name: "Active Players",
      value: playersData?.total?.toString() || "0",
      change: "+3.2%",
      trending: "up",
      icon: Users,
      color: "blue",
    },
    {
      name: "Verified Records",
      value: "89%",
      change: "+5.4%",
      trending: "up",
      icon: ShieldCheck,
      color: "indigo",
    },
    {
      name: "Pending Tasks",
      value: logsData?.total?.toString() || "0",
      change: "-4.1%",
      trending: "down",
      icon: AlertCircle,
      color: "rose",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">
          Dashboard Overview
        </h1>
        <p className="text-slate-400 mt-1">
          Welcome back. Here is what is happening with Tanzanian football data
          today.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-slate-900 border border-slate-700 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={cn(
                  "p-2 rounded-xl",
                  stat.color === "emerald" &&
                    "bg-emerald-500/10 text-emerald-400",
                  stat.color === "blue" &&
                    "bg-blue-500/10 text-blue-400",
                  stat.color === "indigo" &&
                    "bg-indigo-500/10 text-indigo-400",
                  stat.color === "rose" &&
                    "bg-rose-500/10 text-rose-400",
                )}
              >
                <stat.icon className="w-6 h-6" />
              </div>

              <div
                className={cn(
                  "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
                  stat.trending === "up"
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-rose-500/10 text-rose-400",
                )}
              >
                {stat.trending === "up" ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                {stat.change}
              </div>
            </div>

            <p className="text-slate-400 text-sm font-medium">
              {stat.name}
            </p>
            <p className="text-3xl font-bold text-slate-100 mt-1">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Lower Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Ingestions */}
        <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-700 flex items-center justify-between">
            <h2 className="font-bold text-slate-100">
              Recent Ingestions
            </h2>
            <Link
              href="/system-logs"
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300"
            >
              View All
            </Link>
          </div>

          <div className="divide-y divide-slate-800">
            {logsLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
              </div>
            ) : logsData && logsData.data.length > 0 ? (
              logsData.data.map((log) => (
                <div
                  key={log.id}
                  className="px-6 py-4 flex items-center justify-between hover:bg-slate-800/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300 text-xs">
                      {log.type[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-100">
                        {log.type} Ingested
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Source: {log.source} •{" "}
                        {new Date(log.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  <div className="px-2.5 py-1 bg-amber-500/10 text-amber-400 text-[10px] font-bold uppercase rounded-full">
                    {log.status}
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-10 text-center text-slate-500 text-sm">
                No pending ingestions
              </div>
            )}
          </div>
        </div>

        {/* System Status */}
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6">
          <h2 className="font-bold text-slate-100 mb-6">
            System Status
          </h2>

          <div className="space-y-6">
            <div>
              <p className="text-sm text-slate-400 mb-1">
                Verification Backlog
              </p>
              <p className="text-xl font-bold text-amber-400">
                {logsData?.total || 0} pending
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-400 mb-1">
                Total Matches
              </p>
              <p className="text-xl font-bold text-slate-100">
                {matchesData?.total || 0}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-400 mb-1">
                Total Players
              </p>
              <p className="text-xl font-bold text-slate-100">
                {playersData?.total || 0}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
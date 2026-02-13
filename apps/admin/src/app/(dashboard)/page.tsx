"use client";

import { useQuery } from "@tanstack/react-query";
import { matchesService } from "@/services/matches/matches.service";
import { playersService } from "@/services/players/players.service";
import { adminService } from "@/services/admin/admin.service";
import {
  Users,
  ShieldCheck,
  AlertCircle,
  Calendar,
  Activity,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function DashboardPage() {
  const { data: matchesData } = useQuery({
    queryKey: ["matches", "stats"],
    queryFn: () => matchesService.getMatches({}),
  });

  const { data: playersData } = useQuery({
    queryKey: ["players", "stats"],
    queryFn: () => playersService.getPlayers({}),
  });

  const { data: logsData, isLoading: logsLoading } = useQuery({
    queryKey: ["ingestion-logs", "pending"],
    queryFn: () => adminService.getIngestionLogs({ status: "pending", limit: 5 }),
  });

  const matches = matchesData?.data ?? [];
  const players = playersData?.data ?? [];

  const stats = [
    {
      name: "Live Matches",
      value: matches.filter((m) => m.status === "live").length.toString(),
      icon: Activity,
      color: "emerald",
    },
    {
      name: "Scheduled Matches",
      value: matches.filter((m) => m.status === "scheduled").length.toString(),
      icon: Calendar,
      color: "blue",
    },
    {
      name: "Finished Matches",
      value: matches.filter((m) => m.status === "finished").length.toString(),
      icon: ShieldCheck,
      color: "indigo",
    },
    {
      name: "Pending Verification",
      value: (logsData?.total ?? 0).toString(),
      icon: AlertCircle,
      color: "rose",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Operations Dashboard</h1>
        <p className="mt-1 text-slate-400">
          Essential operational metrics for fixtures, players, and verification queue.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
            <div className="mb-4 flex items-center justify-between">
              <div
                className={cn(
                  "rounded-xl p-2",
                  stat.color === "emerald" && "bg-emerald-500/10 text-emerald-400",
                  stat.color === "blue" && "bg-blue-500/10 text-blue-400",
                  stat.color === "indigo" && "bg-indigo-500/10 text-indigo-400",
                  stat.color === "rose" && "bg-rose-500/10 text-rose-400",
                )}
              >
                <stat.icon className="h-6 w-6" />
              </div>

              <div className="rounded-full bg-slate-800 p-1.5 text-slate-400">
                <Activity className="h-3.5 w-3.5" />
              </div>
            </div>

            <p className="text-sm font-medium text-slate-400">{stat.name}</p>
            <p className="mt-1 text-3xl font-bold text-slate-100">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-700 px-6 py-5">
            <h2 className="font-bold text-slate-100">Recent Pending Ingestions</h2>
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
                <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
              </div>
            ) : logsData && logsData.data.length > 0 ? (
              logsData.data.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between px-6 py-4 hover:bg-slate-800/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-slate-300">
                      {log.type[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-100">{log.type} Ingested</p>
                      <p className="mt-0.5 text-xs text-slate-400">
                        Source: {log.source} • {new Date(log.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-full bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold uppercase text-amber-400">
                    {log.status}
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-10 text-center text-sm text-slate-500">No pending ingestions</div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
          <h2 className="mb-6 font-bold text-slate-100">System Health Snapshot</h2>

          <div className="space-y-6">
            <div>
              <p className="mb-1 text-sm text-slate-400">Verification Backlog</p>
              <p className="text-xl font-bold text-amber-400">{logsData?.total ?? 0} pending</p>
            </div>

            <div>
              <p className="mb-1 text-sm text-slate-400">Managed Matches</p>
              <p className="text-xl font-bold text-slate-100">{matches.length}</p>
            </div>

            <div>
              <p className="mb-1 text-sm text-slate-400">Registered Players</p>
              <p className="text-xl font-bold text-slate-100">{players.length}</p>
            </div>

            <div>
              <p className="mb-1 text-sm text-slate-400">Live Coverage</p>
              <p className="text-xl font-bold text-emerald-400">
                {matches.filter((m) => m.status === "live").length} live now
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

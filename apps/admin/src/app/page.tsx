import {
  TrendingUp,
  Users,
  ShieldCheck,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const stats = [
  {
    name: "Total Matches",
    value: "1,284",
    change: "+12.5%",
    trending: "up",
    icon: TrendingUp,
    color: "emerald",
  },
  {
    name: "Active Players",
    value: "4,320",
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
    value: "12",
    change: "-4.1%",
    trending: "down",
    icon: AlertCircle,
    color: "rose",
  },
];

export default function Home() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Dashboard Overview
        </h1>
        <p className="text-slate-500 mt-1">
          Welcome back. Here is what is happening with Tanzanian football data
          today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={cn(
                  "p-2 rounded-xl",
                  stat.color === "emerald" && "bg-emerald-50 text-emerald-600",
                  stat.color === "blue" && "bg-blue-50 text-blue-600",
                  stat.color === "indigo" && "bg-indigo-50 text-indigo-600",
                  stat.color === "rose" && "bg-rose-50 text-rose-600",
                )}
              >
                <stat.icon className="w-6 h-6" />
              </div>
              <div
                className={cn(
                  "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
                  stat.trending === "up"
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-rose-50 text-rose-600",
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
            <p className="text-slate-500 text-sm font-medium">{stat.name}</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-900 underline decoration-emerald-500 decoration-2 underline-offset-4">
              Recent Ingestions
            </h2>
            <button className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
              View All
            </button>
          </div>
          <div className="divide-y divide-slate-50">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-xs">
                    M{i}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 tracking-tight transition-colors group-hover:text-emerald-600">
                      Match Ingested: Simba SC vs Yanga SC
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Source: ligikuu.co.tz • 2 mins ago
                    </p>
                  </div>
                </div>
                <div className="px-2.5 py-1 bg-amber-50 text-amber-600 text-[10px] font-bold uppercase tracking-wider rounded-full ring-1 ring-amber-500/10">
                  Pending Verify
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-900 underline decoration-blue-500 decoration-2 underline-offset-4">
              System Status
            </h2>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-tight">
                All systems operational
              </span>
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-700">
                    Data Pipeline Throughput
                  </p>
                  <p className="text-xs text-slate-400">
                    Processing 12.4 items/min
                  </p>
                </div>
                <p className="text-sm font-bold text-emerald-600">Healthy</p>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[78%] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.2)]"></div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-700">
                    Verification Backlog
                  </p>
                  <p className="text-xs text-slate-400">42 pending records</p>
                </div>
                <p className="text-sm font-bold text-amber-500">Normal</p>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 w-[24%] rounded-full"></div>
              </div>
            </div>

            <div className="pt-4 grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">
                  Queue Size
                </p>
                <p className="text-xl font-bold text-slate-800">142</p>
              </div>
              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">
                  API Latency
                </p>
                <p className="text-xl font-bold text-slate-800">42ms</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

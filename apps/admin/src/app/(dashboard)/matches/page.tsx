"use client";

import { Calendar, MapPin, Plus, ListFilter, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const matches = [
  {
    id: 1,
    homeTeam: "Simba SC",
    awayTeam: "Young Africans SC",
    homeScore: 1,
    awayScore: 1,
    status: "finished",
    date: "2024-05-20T16:00:00",
    venue: "Benjamin Mkapa Stadium",
    competition: "NBC Premier League",
  },
  {
    id: 2,
    homeTeam: "Azam FC",
    awayTeam: "Singida Big Stars",
    homeScore: 2,
    awayScore: 0,
    status: "finished",
    date: "2024-05-19T13:30:00",
    venue: "Azam Complex",
    competition: "NBC Premier League",
  },
  {
    id: 3,
    homeTeam: "Coastal Union",
    awayTeam: "KMC FC",
    homeScore: null,
    awayScore: null,
    status: "scheduled",
    date: "2024-05-25T16:00:00",
    venue: "Mkwakwani Stadium",
    competition: "NBC Premier League",
  },
];

export default function MatchesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Matches & Fixtures
          </h1>
          <p className="text-slate-500 mt-1">
            Manage league schedules, results and match events.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all shadow-md shadow-emerald-500/10">
          <Plus className="w-4 h-4" />
          Add New Match
        </button>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex-1 flex gap-2">
          {["All Status", "Finished", "Scheduled", "Live"].map((f) => (
            <button
              key={f}
              className={cn(
                "px-4 py-1.5 rounded-lg text-sm font-bold transition-all",
                f === "All Status"
                  ? "bg-slate-900 text-white"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700",
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <button className="flex items-center gap-2 px-3 py-1.5 text-slate-600 font-bold text-sm border border-slate-200 rounded-lg hover:bg-slate-50">
          <ListFilter className="w-4 h-4" />
          Filters
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {matches.map((match) => (
          <div
            key={match.id}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center group hover:border-emerald-500/30 transition-all cursor-pointer"
          >
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 items-center gap-8">
              <div className="flex items-center justify-end gap-6 order-2 lg:order-1">
                <span className="font-bold text-slate-900 text-lg uppercase tracking-tight">
                  {match.homeTeam}
                </span>
                <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-slate-500 uppercase text-xs">
                  {match.homeTeam[0]}
                </div>
              </div>

              <div className="flex flex-col items-center gap-3 order-1 lg:order-2">
                <div className="px-3 py-0.5 bg-slate-100 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest ring-1 ring-slate-200 mb-1">
                  {match.status}
                </div>
                <div className="flex items-center gap-8">
                  <span
                    className={cn(
                      "text-4xl font-black tabular-nums tracking-tighter",
                      match.status === "scheduled"
                        ? "text-slate-200"
                        : "text-slate-900",
                    )}
                  >
                    {match.homeScore ?? "-"}
                  </span>
                  <div className="w-px h-10 bg-slate-100 hidden lg:block" />
                  <span
                    className={cn(
                      "text-4xl font-black tabular-nums tracking-tighter",
                      match.status === "scheduled"
                        ? "text-slate-200"
                        : "text-slate-900",
                    )}
                  >
                    {match.awayScore ?? "-"}
                  </span>
                </div>
                <div className="flex flex-col items-center mt-2">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(match.date).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-wide mt-1">
                    <MapPin className="w-3 h-3" />
                    {match.venue}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-start gap-6 order-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-slate-500 uppercase text-xs">
                  {match.awayTeam[0]}
                </div>
                <span className="font-bold text-slate-900 text-lg uppercase tracking-tight">
                  {match.awayTeam}
                </span>
              </div>
            </div>

            <div className="pl-6 border-l border-slate-50 ml-6 hidden lg:block group-hover:pl-8 group-hover:text-emerald-500 transition-all">
              <ChevronRight className="w-6 h-6" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

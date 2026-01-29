"use client";

import { Trophy, Plus, MapPin, Settings2 } from "lucide-react";

const clubs = [
  {
    id: 1,
    name: "Simba SC",
    city: "Dar es Salaam",
    stadium: "Benjamin Mkapa",
    established: 1936,
    color: "red",
  },
  {
    id: 2,
    name: "Young Africans SC",
    city: "Dar es Salaam",
    stadium: "Benjamin Mkapa",
    established: 1935,
    color: "yellow",
  },
  {
    id: 3,
    name: "Azam FC",
    city: "Dar es Salaam",
    stadium: "Azam Complex",
    established: 2004,
    color: "blue",
  },
  {
    id: 4,
    name: "Coastal Union",
    city: "Tanga",
    stadium: "Mkwakwani",
    established: 1948,
    color: "teal",
  },
];

export default function ClubsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Registered Clubs
          </h1>
          <p className="text-slate-500 mt-1">
            Manage club profiles, stadiums, and official data.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all shadow-md">
          <Plus className="w-4 h-4" />
          Add New Club
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {clubs.map((club) => (
          <div
            key={club.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group hover:shadow-lg hover:border-emerald-500/20 transition-all"
          >
            <div
              className={`h-2 bg-gradient-to-r ${
                club.color === "red"
                  ? "from-rose-500 to-rose-600"
                  : club.color === "yellow"
                    ? "from-amber-400 to-amber-500"
                    : club.color === "blue"
                      ? "from-blue-500 to-blue-600"
                      : "from-emerald-500 to-emerald-600"
              }`}
            />
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center font-black text-slate-400">
                  {club.name[0]}
                </div>
                <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 group-hover:text-slate-600 transition-colors">
                  <Settings2 className="w-4 h-4" />
                </button>
              </div>
              <h3 className="font-bold text-slate-900 text-lg">{club.name}</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                EST. {club.established}
              </p>

              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 text-slate-500 text-sm">
                  <MapPin className="w-4 h-4 text-slate-300" />
                  <span>{club.city}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-500 text-sm">
                  <Trophy className="w-4 h-4 text-slate-300" />
                  <span>{club.stadium}</span>
                </div>
              </div>

              <button className="w-full mt-6 py-2 bg-slate-50 text-slate-600 font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-emerald-50 hover:text-emerald-600 transition-all">
                View Squad
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

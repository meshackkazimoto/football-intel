"use client";

import { Bell, Search, User } from "lucide-react";

export function Header() {
  return (
    <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-10 transition-shadow duration-200">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-96 max-w-md group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-emerald-500 transition-colors" />
          <input
            type="text"
            placeholder="Search for players, matches, or clubs..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="h-8 w-px bg-slate-200 mx-2" />

        <button className="flex items-center gap-3 px-2 py-1.5 hover:bg-slate-50 rounded-lg transition-all group">
          <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center border border-emerald-200">
            <User className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-slate-700 leading-none">
              Admin User
            </p>
            <p className="text-xs text-slate-500 mt-1">Super Admin</p>
          </div>
        </button>
      </div>
    </header>
  );
}

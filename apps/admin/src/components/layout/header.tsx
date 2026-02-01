"use client";

import { Bell, Search, User } from "lucide-react";

export function Header() {
  return (
    <header className="
      h-16
      sticky top-0 z-10
      px-8
      flex items-center justify-between
      border-b border-slate-700/60
      bg-slate-900/60
      backdrop-blur-md
      transition-shadow duration-200
    ">
      {/* Left: Search */}
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-96 max-w-md group">
          <Search className="
            absolute left-3 top-1/2 -translate-y-1/2
            text-slate-400
            w-4 h-4
            group-focus-within:text-emerald-400
            transition-colors
          " />
          <input
            type="text"
            placeholder="Search for players, matches, or clubs..."
            className="
              w-full
              pl-10 pr-4 py-2
              bg-slate-800/70
              border border-slate-700
              rounded-xl
              outline-none
              text-sm
              text-slate-100
              placeholder:text-slate-400
              focus:ring-2 focus:ring-emerald-500/20
              focus:border-emerald-500
              transition-all
            "
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4">
        <button className="
          p-2
          text-slate-300
          hover:text-white
          hover:bg-slate-800
          rounded-full
          transition-colors
          relative
        ">
          <Bell className="w-5 h-5" />
          <span className="
            absolute top-2 right-2
            w-2 h-2
            bg-rose-500
            rounded-full
            border-2 border-slate-900
          " />
        </button>

        <div className="h-8 w-px bg-slate-700 mx-2" />

        <button className="
          flex items-center gap-3
          px-2 py-1.5
          rounded-lg
          hover:bg-slate-800
          transition-all
          group
        ">
          <div className="
            h-8 w-8
            rounded-full
            bg-emerald-500/20
            flex items-center justify-center
            border border-emerald-500/30
          ">
            <User className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-slate-100 leading-none">
              Admin User
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Super Admin
            </p>
          </div>
        </button>
      </div>
    </header>
  );
}
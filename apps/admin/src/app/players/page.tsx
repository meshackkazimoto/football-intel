"use client";

import { Users, Plus, Star, MoreVertical } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const players = [
  {
    id: 1,
    name: "Clatous Chama",
    club: "Young Africans SC",
    nationality: "Zambia",
    position: "MF",
    rating: 8.4,
  },
  {
    id: 2,
    name: "Sadio Kanoute",
    club: "Simba SC",
    nationality: "Mali",
    position: "MF",
    rating: 7.2,
  },
  {
    id: 3,
    name: "John Bocco",
    club: "Young Africans SC",
    nationality: "Tanzania",
    position: "FW",
    rating: 6.8,
  },
  {
    id: 4,
    name: "Aishi Salum Manula",
    club: "Simba SC",
    nationality: "Tanzania",
    position: "GK",
    rating: 7.5,
  },
];

export default function PlayersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Players Directory
          </h1>
          <p className="text-slate-500 mt-1">
            Manage player profiles, stats, and transfers.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all shadow-md">
          <Plus className="w-4 h-4" />
          Register Player
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Player</TableHead>
              <TableHead>Club</TableHead>
              <TableHead>Pos</TableHead>
              <TableHead>Nationality</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {players.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-bold text-slate-900">
                  {p.name}
                </TableCell>
                <TableCell className="text-sm font-medium text-slate-600">
                  {p.club}
                </TableCell>
                <TableCell>
                  <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-500 uppercase">
                    {p.position}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-slate-500">
                  {p.nationality}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 font-bold text-emerald-600">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    {p.rating}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

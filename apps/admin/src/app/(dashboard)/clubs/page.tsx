"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clubsService } from "@/services/clubs/clubs.service";
import {
  Plus,
  Trophy,
  MapPin,
  Calendar,
  Edit,
  Trash2,
  Loader2,
  Search,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClubSchema, type CreateClubInput } from "@/services/clubs/types";

export default function ClubsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["clubs", searchQuery],
    queryFn: () =>
      clubsService.getClubs(searchQuery ? { search: searchQuery } : {}),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateClubInput>({
    resolver: zodResolver(createClubSchema),
  });

  const createMutation = useMutation({
    mutationFn: clubsService.createClub,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clubs"] });
      setShowCreateForm(false);
      reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: clubsService.deleteClub,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clubs"] });
    },
  });

  const onSubmit = (data: CreateClubInput) => {
    createMutation.mutate(data);
  };

  const getClubColor = (index: number) => {
    const colors = [
      "from-rose-500 to-rose-600",
      "from-amber-400 to-amber-500",
      "from-blue-500 to-blue-600",
      "from-emerald-500 to-emerald-600",
      "from-purple-500 to-purple-600",
      "from-pink-500 to-pink-600",
    ];
    return colors[index % colors.length];
  };

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
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all shadow-md"
        >
          <Plus className="w-4 h-4" />
          Add New Club
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search clubs..."
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium"
        />
      </div>

      {showCreateForm && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">
            Register New Club
          </h2>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-2 gap-4"
          >
            <div className="col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Club Name *
              </label>
              <input
                {...register("name")}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="Simba SC"
              />
              {errors.name && (
                <p className="text-xs text-rose-500 mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Slug
              </label>
              <input
                {...register("slug")}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="simba-sc"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Founded Year
              </label>
              <input
                type="number"
                {...register("foundedYear", { valueAsNumber: true })}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                min="1800"
                max={new Date().getFullYear()}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Stadium Name
              </label>
              <input
                {...register("stadiumName")}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="Benjamin Mkapa Stadium"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Stadium Capacity
              </label>
              <input
                type="number"
                {...register("stadiumCapacity", { valueAsNumber: true })}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                min="0"
              />
            </div>
            <div className="col-span-2 flex gap-3">
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {createMutation.isPending && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                Register Club
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  reset();
                }}
                className="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {data?.clubs.map((club, index) => (
            <div
              key={club.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group hover:shadow-lg hover:border-emerald-500/20 transition-all"
            >
              <div className={`h-2 bg-gradient-to-r ${getClubColor(index)}`} />
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center font-black text-slate-400">
                    {club.name[0]}
                  </div>
                  <div className="flex gap-1">
                    <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 group-hover:text-emerald-600 transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(club.id)}
                      disabled={deleteMutation.isPending}
                      className="p-2 hover:bg-rose-50 rounded-lg text-slate-400 group-hover:text-rose-600 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <h3 className="font-bold text-slate-900 text-lg">
                  {club.name}
                </h3>
                {club.foundedYear && (
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                    EST. {club.foundedYear}
                  </p>
                )}

                <div className="mt-6 space-y-3">
                  {club.city && (
                    <div className="flex items-center gap-3 text-slate-500 text-sm">
                      <MapPin className="w-4 h-4 text-slate-300" />
                      <span>{club.city}</span>
                    </div>
                  )}
                  {club.stadiumName && (
                    <div className="flex items-center gap-3 text-slate-500 text-sm">
                      <Trophy className="w-4 h-4 text-slate-300" />
                      <span>{club.stadiumName}</span>
                    </div>
                  )}
                  {club.stadiumCapacity && (
                    <div className="flex items-center gap-3 text-slate-500 text-sm">
                      <Calendar className="w-4 h-4 text-slate-300" />
                      <span>
                        {club.stadiumCapacity.toLocaleString()} capacity
                      </span>
                    </div>
                  )}
                </div>

                <button className="w-full mt-6 py-2 bg-slate-50 text-slate-600 font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-emerald-50 hover:text-emerald-600 transition-all">
                  View Squad
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

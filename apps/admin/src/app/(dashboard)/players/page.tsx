"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { playersService } from "@/services/players/players.service";
import { Plus, Search, Edit, Trash2, Loader2, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createPlayerSchema,
  type CreatePlayerInput,
} from "@/services/players/types";
import { logger } from "@football-intel/logger";

export default function PlayersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["players", searchQuery],
    queryFn: () =>
      playersService.getPlayers(searchQuery ? { search: searchQuery } : {}),
  });

  useEffect(() => {
    if (data) {
      logger.info(`players: ${JSON.stringify(data)}`);
    }
    if (error) {
      logger.error(`Failed to fetch players: ${error}`);
    }
  }, [data, error]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreatePlayerInput>({
    resolver: zodResolver(createPlayerSchema),
  });

  const createMutation = useMutation({
    mutationFn: playersService.createPlayer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
      setShowCreateForm(false);
      reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: playersService.deletePlayer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
    },
  });

  const onSubmit = (data: CreatePlayerInput) => {
    createMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Player Directory
          </h1>
          <p className="text-slate-500 mt-1">
            Manage player profiles and statistics.
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all shadow-md"
        >
          <Plus className="w-4 h-4" />
          Register Player
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search players by name..."
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium"
        />
      </div>

      {showCreateForm && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">
            Register New Player
          </h2>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-2 gap-4"
          >
            <div className="col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Full Name *
              </label>
              <input
                {...register("fullName")}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="John Doe"
              />
              {errors.fullName && (
                <p className="text-xs text-rose-500 mt-1">
                  {errors.fullName.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                First Name
              </label>
              <input
                {...register("firstName")}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Last Name
              </label>
              <input
                {...register("lastName")}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Date of Birth
              </label>
              <input
                type="date"
                {...register("dateOfBirth")}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Position
              </label>
              <input
                {...register("position")}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="e.g., Forward, Midfielder"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Jersey Number
              </label>
              <input
                type="number"
                {...register("jerseyNumber", { valueAsNumber: true })}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                min="1"
                max="99"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Height (cm)
              </label>
              <input
                type="number"
                {...register("height", { valueAsNumber: true })}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Weight (kg)
              </label>
              <input
                type="number"
                {...register("weight", { valueAsNumber: true })}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
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
                Register Player
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
      ) : error ? (
        <div className="bg-white rounded-2xl border border-rose-200 shadow-sm p-6">
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center">
              <User className="w-8 h-8 text-rose-500" />
            </div>
            <div className="text-center">
              <p className="text-rose-900 font-bold mb-1">
                Failed to load players
              </p>
              <p className="text-sm text-rose-600">
                {error instanceof Error ? error.message : "An error occurred"}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Player
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Club
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Position
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Nationality
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Jersey
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data?.data && data.data.length > 0 ? (
                  data.data.map((player) => (
                    <tr
                      key={player.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                            <User className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">
                              {player.fullName}
                            </p>
                            <p className="text-xs text-slate-500">
                              {player.firstName} {player.lastName}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-700">
                        {player.clubName || "-"}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2.5 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold">
                          {player.position || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {player.nationality || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-900">
                        {player.jerseyNumber ? `#${player.jerseyNumber}` : "-"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-emerald-600 transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteMutation.mutate(player.id)}
                            disabled={deleteMutation.isPending}
                            className="p-2 hover:bg-rose-50 rounded-lg text-slate-600 hover:text-rose-600 transition-colors disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                          <User className="w-8 h-8 text-slate-400" />
                        </div>
                        <div>
                          <p className="text-slate-900 font-bold mb-1">
                            No players found
                          </p>
                          <p className="text-sm text-slate-500">
                            {searchQuery
                              ? "Try adjusting your search query"
                              : "Get started by registering your first player"}
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

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
    if (data) logger.info(`players: ${JSON.stringify(data)}`);
    if (error) logger.error(`Failed to fetch players: ${error}`);
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">
            Player Directory
          </h1>
          <p className="text-slate-400 mt-1">
            Manage player profiles and statistics.
          </p>
        </div>

        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all"
        >
          <Plus className="w-4 h-4" />
          Register Player
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search players by name..."
          className="
            w-full pl-12 pr-4 py-3
            bg-slate-800
            border border-slate-700
            rounded-xl
            text-slate-100
            focus:outline-none
            focus:ring-2 focus:ring-emerald-500/20
          "
        />
      </div>

      {/* Create Player Form */}
      {showCreateForm && (
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-slate-100 mb-4">
            Register New Player
          </h2>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-2 gap-4"
          >
            <div className="col-span-2">
              <label className="block text-sm font-bold text-slate-300 mb-2">
                Full Name *
              </label>
              <input
                {...register("fullName")}
                className="input-dark"
              />
              {errors.fullName && (
                <p className="text-xs text-rose-500 mt-1">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">
                First Name
              </label>
              <input {...register("firstName")} className="input-dark" />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">
                Last Name
              </label>
              <input {...register("lastName")} className="input-dark" />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">
                Date of Birth
              </label>
              <input type="date" {...register("dateOfBirth")} className="input-dark" />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">
                Position
              </label>
              <input {...register("position")} className="input-dark" />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">
                Jersey Number
              </label>
              <input
                type="number"
                {...register("jerseyNumber", { valueAsNumber: true })}
                className="input-dark"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">
                Height (cm)
              </label>
              <input
                type="number"
                {...register("height", { valueAsNumber: true })}
                className="input-dark"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">
                Weight (kg)
              </label>
              <input
                type="number"
                {...register("weight", { valueAsNumber: true })}
                className="input-dark"
              />
            </div>

            <div className="col-span-2 flex gap-3">
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="btn-primary"
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
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Players Table */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      ) : error ? (
        <div className="bg-slate-900 border border-rose-500/30 rounded-2xl p-6">
          <p className="text-rose-400 text-center font-bold">
            Failed to load players
          </p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800 border-b border-slate-700">
                <tr>
                  {["Player", "Club", "Position", "Nationality", "Jersey", "Actions"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800">
                {data?.data?.map((player) => (
                  <tr
                    key={player.id}
                    className="hover:bg-slate-800/60 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-100">
                        {player.fullName}
                      </p>
                      <p className="text-xs text-slate-400">
                        {player.firstName} {player.lastName}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-300">
                      {player.clubName || "-"}
                    </td>

                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-blue-500/10 text-blue-400 rounded-lg text-xs font-bold">
                        {player.position || "N/A"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-400">
                      {player.nationality || "-"}
                    </td>

                    <td className="px-6 py-4 font-bold text-slate-100">
                      {player.jerseyNumber ? `#${player.jerseyNumber}` : "-"}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="icon-btn">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteMutation.mutate(player.id)}
                          disabled={deleteMutation.isPending}
                          className="icon-btn-danger"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { playersService } from "@/services/players/players.service";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Loader2,
  User,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type {
  CreatePlayerInput,
  Player,
} from "@/services/players/types";
import { createPlayerSchema } from "@/services/players/validation";

export default function PlayersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["players", searchQuery],
    queryFn: () =>
      playersService.getPlayers(
        searchQuery ? { search: searchQuery } : {},
      ),
  });

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

  const onSubmit = (formData: CreatePlayerInput) => {
    createMutation.mutate(formData);
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
          className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
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
              <input
                type="date"
                {...register("dateOfBirth")}
                className="input-dark"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">
                Nationality ID
              </label>
              <input
                {...register("nationalityId")}
                className="input-dark"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">
                Preferred Foot
              </label>
              <select {...register("preferredFoot")} className="input-dark">
                <option value="">—</option>
                <option value="left">Left</option>
                <option value="right">Right</option>
                <option value="both">Both</option>
              </select>
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
                  {[
                    "Player",
                    "Club",
                    "Position",
                    "Nationality",
                    "Jersey",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800">
                {data?.data.map((player: Player) => (
                  <tr
                    key={player.id}
                    className="hover:bg-slate-800/60 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                          <User className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-100">
                            {player.fullName}
                          </p>
                          <p className="text-xs text-slate-400">
                            {player.firstName} {player.lastName}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-300">
                      {"—"}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-400">
                      {"—"}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-400">
                      {player.nationality?.name ?? "-"}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-400">
                      {"—"}
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
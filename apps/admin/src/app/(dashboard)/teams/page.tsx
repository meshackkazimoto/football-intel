"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { teamsService } from "@/services/teams/teams.service";
import { seasonsService } from "@/services/seasons/seasons.service";
import { clubsService } from "@/services/clubs/clubs.service";
import { Plus, Edit, Trash2, Loader2, Users } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { CreateTeamInput, Team } from "@/services/teams/types";
import { createTeamSchema } from "@/services/teams/validation";
import { FormInput } from "@/components/ui/input";
import { FormSelect } from "@/components/ui/select";
import { PrimaryButton, SecondaryButton } from "@/components/ui/button";
import { FormSection } from "@/components/ui/form-section";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function TeamsPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>("");
  const queryClient = useQueryClient();

  // Fetch Seasons to filter teams
  const { data: seasons } = useQuery({
    queryKey: ["seasons"],
    queryFn: () => seasonsService.getSeasons(),
  });

  const orderedSeasons = [...(seasons?.data ?? [])].sort((a, b) => {
    if (a.isCurrent && !b.isCurrent) return -1;
    if (!a.isCurrent && b.isCurrent) return 1;
    return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
  });
  const defaultSeasonId = orderedSeasons[0]?.id ?? "";
  const effectiveSeasonId = selectedSeasonId || defaultSeasonId;

  // Fetch Teams based on selected season
  const {
    data: teamsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["teams", effectiveSeasonId],
    queryFn: () => teamsService.getTeams(effectiveSeasonId),
    enabled: !!effectiveSeasonId,
  });

  // Fetch Clubs for dropdown
  const { data: clubs } = useQuery({
    queryKey: ["clubs"],
    queryFn: () => clubsService.getClubs(),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTeamInput>({
    resolver: zodResolver(createTeamSchema),
  });

  const createMutation = useMutation({
    mutationFn: teamsService.createTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      setShowCreateForm(false);
      reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: teamsService.deleteTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });

  const onSubmit = (formData: CreateTeamInput) => {
    createMutation.mutate(formData);
  };

  const teams = [...(teamsData?.data ?? [])].sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">
            Teams Management
          </h1>
          <p className="text-slate-400 mt-1">
            Manage teams for specific seasons.
          </p>
        </div>

        <div className="flex gap-4">
          <select
            value={effectiveSeasonId}
            onChange={(e) => setSelectedSeasonId(e.target.value)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200"
          >
            <option value="">Select Season</option>
            {orderedSeasons.map((season) => (
              <option key={season.id} value={season.id}>
                {season.name} ({season.league.name})
              </option>
            ))}
          </select>

          <PrimaryButton onClick={() => setShowCreateForm(!showCreateForm)}>
            <Plus className="w-4 h-4" />
            Add Team
          </PrimaryButton>
        </div>
      </div>

      {/* Create Team Form */}
      {showCreateForm && (
        <FormSection title="Register New Team">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-2 gap-4"
          >
            <FormSelect
              label="Season *"
              {...register("seasonId")}
              error={errors.seasonId}
              options={
                seasons?.data.map((s) => ({
                  label: `${s.name} (${s.league.name})`,
                  value: s.id,
                })) ?? []
              }
            />

            <FormSelect
              label="Club *"
              {...register("clubId")}
              error={errors.clubId}
              options={
                clubs?.map((c) => ({
                  label: c.name,
                  value: c.id,
                })) ?? []
              }
            />

            <div className="col-span-2">
              <FormInput
                label="Team Name *"
                placeholder="e.g. Manchester City (2024/25)"
                {...register("name")}
                error={errors.name}
              />
            </div>

            <div className="col-span-2 flex gap-3 mt-4">
              <PrimaryButton type="submit" loading={createMutation.isPending}>
                {createMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Create Team"
                )}
              </PrimaryButton>

              <SecondaryButton
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  reset();
                }}
              >
                Cancel
              </SecondaryButton>
            </div>
          </form>
        </FormSection>
      )}

      {/* Teams Table */}
      {!effectiveSeasonId ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-slate-900 border border-slate-700 rounded-2xl">
          <p className="text-lg font-bold">No Season Selected</p>
          <p className="text-sm">Please select a season to view teams.</p>
        </div>
      ) : isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      ) : error ? (
        <div className="bg-slate-900 border border-rose-500/30 rounded-2xl p-6">
          <p className="text-rose-400 text-center font-bold">
            Failed to load teams
          </p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                {["Team Name", "Club", "Season", "Actions"].map((h) => (
                  <TableHead key={h}>{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {teams.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-24 text-center text-slate-400"
                  >
                    No teams found for this season.
                  </TableCell>
                </TableRow>
              ) : (
                teams.map((team: Team) => (
                  <TableRow
                    key={team.id}
                    className="hover:bg-slate-800/60 transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                          <Users className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-100">
                            {team.name}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="text-slate-300">
                      {team.club?.name ?? "—"}
                    </TableCell>

                    <TableCell className="text-slate-400">
                      {team.season?.name ?? "—"}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-emerald-500">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteMutation.mutate(team.id)}
                          disabled={deleteMutation.isPending}
                          className="p-2 hover:bg-rose-500/10 rounded-lg text-slate-400 hover:text-rose-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

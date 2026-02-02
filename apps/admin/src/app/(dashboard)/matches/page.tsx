"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { matchesService } from "@/services/matches/matches.service";
import { seasonsService } from "@/services/seasons/seasons.service";
import { teamsService } from "@/services/teams/teams.service";
import { stadiumsService } from "@/services/stadiums/stadiums.service";
import {
  Plus,
  Calendar,
  MapPin,
  Edit,
  Trash2,
  Loader2,
  Trophy,
} from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createMatchSchema,
  type CreateMatchInput,
  type Match,
  type MatchStatus,
} from "@/services/matches/types";
import { FormInput } from "@/components/ui/input";
import { FormSelect } from "@/components/ui/select";
import { PrimaryButton, SecondaryButton } from "@/components/ui/button";
import { FormSection } from "@/components/ui/form-section";

export default function MatchesPage() {
  const [statusFilter, setStatusFilter] = useState<"all" | MatchStatus>("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: matchesResponse, isLoading } = useQuery({
    queryKey: ["matches", statusFilter],
    queryFn: () =>
      matchesService.getMatches(
        statusFilter === "all" ? {} : { status: statusFilter },
      ),
  });

  const { data: seasons } = useQuery({
    queryKey: ["seasons"],
    queryFn: () => seasonsService.getSeasons(),
  });

  const { data: stadiums } = useQuery({
    queryKey: ["stadiums"],
    queryFn: () => stadiumsService.getStadiums(),
  });

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<CreateMatchInput>({
    resolver: zodResolver(createMatchSchema),
  });

  const selectedSeasonId = useWatch({ control, name: "seasonId" });
  const homeTeamId = useWatch({ control, name: "homeTeamId" });

  const { data: teamsResponse } = useQuery({
    queryKey: ["teams", selectedSeasonId],
    queryFn: () => teamsService.getTeams(selectedSeasonId!),
    enabled: !!selectedSeasonId,
  });

  const teams = teamsResponse?.data ?? [];

  const createMutation = useMutation({
    mutationFn: matchesService.createMatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      setShowCreateForm(false);
      reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: matchesService.deleteMatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
  });

  const onSubmit = (data: CreateMatchInput) => {
    createMutation.mutate(data);
  };

  const matches = matchesResponse?.data ?? [];

  const getStatusBadge = (status: MatchStatus) => {
    const colors: Record<MatchStatus, string> = {
      scheduled: "bg-blue-500/10 text-blue-400 border-blue-500/30",
      live: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 animate-pulse",
      half_time: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      finished: "bg-slate-500/10 text-slate-400 border-slate-500/30",
      postponed: "bg-rose-500/10 text-rose-400 border-rose-500/30",
      cancelled: "bg-rose-900/10 text-rose-600 border-rose-900/30",
    };
    return colors[status] || colors.scheduled;
  };

  const formatMatchScore = (match: Match) => {
    if (match.status === "scheduled" || match.status === "postponed") {
      return "vs";
    }
    return `${match.homeScore ?? 0} - ${match.awayScore ?? 0}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">
            Matches & Results
          </h1>
          <p className="text-slate-400 mt-1">
            Manage match schedules, live scores, and final results.
          </p>
        </div>

        <div className="flex gap-3">
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as "all" | MatchStatus)
            }
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200"
          >
            <option value="all">All Matches</option>
            <option value="scheduled">Scheduled</option>
            <option value="live">Live</option>
            <option value="finished">Finished</option>
            <option value="postponed">Postponed</option>
          </select>

          <PrimaryButton onClick={() => setShowCreateForm(!showCreateForm)}>
            <Plus className="w-4 h-4" />
            Add Match
          </PrimaryButton>
        </div>
      </div>

      {/* Create Match Form */}
      {showCreateForm && (
        <FormSection title="Create New Match">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-2 gap-4"
          >
            {/* Season */}
            <FormSelect
              label="Season *"
              {...register("seasonId")}
              error={errors.seasonId}
              options={
                seasons?.data.map((s) => ({
                  label: s.name,
                  value: s.id,
                })) ?? []
              }
            />

            {/* Date */}
            <FormInput
              label="Match Date *"
              type="datetime-local"
              {...register("matchDate")}
              error={errors.matchDate}
            />

            {/* Teams */}
            <FormSelect
              label="Home Team *"
              {...register("homeTeamId")}
              error={errors.homeTeamId}
              options={teams.map((t) => ({
                label: t.name,
                value: t.id,
              }))}
            />

            <FormSelect
              label="Away Team *"
              {...register("awayTeamId")}
              error={errors.awayTeamId}
              options={teams
                .filter((t) => t.id !== homeTeamId)
                .map((t) => ({
                  label: t.name,
                  value: t.id,
                }))}
            />

            {/* Venue */}
            <div className="col-span-2">
              <FormSelect
                label="Venue (Stadium)"
                {...register("venue")}
                error={errors.venue}
                options={
                  stadiums?.data.map((s) => ({
                    label: `${s.name} (${s.city ?? "—"})`,
                    value: s.name,
                  })) ?? []
                }
              />
            </div>

            {/* Actions */}
            <div className="col-span-2 flex gap-3 mt-4">
              <PrimaryButton type="submit" loading={createMutation.isPending}>
                {createMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Create Match"
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

      {/* Matches List */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      ) : matches.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-slate-900 border border-slate-700 rounded-2xl">
          <Trophy className="w-12 h-12 mb-4 opacity-50" />
          <p className="text-lg font-bold">No matches found</p>
          <p className="text-sm">Create a new match to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {matches.map((match: Match) => (
            <div
              key={match.id}
              className="bg-slate-900 border border-slate-700 rounded-2xl p-6 hover:border-emerald-500/30 transition-all group"
            >
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                {/* Status & Date */}
                <div className="flex flex-col gap-2 min-w-[140px]">
                  <span
                    className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold border w-fit ${getStatusBadge(
                      match.status,
                    )}`}
                  >
                    {match.status.toUpperCase()}
                  </span>
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(match.matchDate).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  {match.venue && (
                    <div className="flex items-center gap-2 text-slate-500 text-xs">
                      <MapPin className="w-3 h-3" />
                      <span>{match.venue}</span>
                    </div>
                  )}
                </div>

                {/* Teams & Score */}
                <div className="flex-1 flex items-center justify-center gap-8 w-full">
                  <div className="flex-1 text-right font-bold text-slate-200 text-lg">
                    {match.homeTeam.name}
                  </div>

                  <div className="px-6 py-3 bg-slate-800 rounded-xl font-mono text-xl font-bold text-slate-100 min-w-[100px] text-center shadow-inner">
                    {formatMatchScore(match)}
                  </div>

                  <div className="flex-1 text-left font-bold text-slate-200 text-lg">
                    {match.awayTeam.name}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-emerald-500 transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(match.id)}
                    disabled={deleteMutation.isPending}
                    className="p-2 hover:bg-rose-500/10 rounded-lg text-slate-400 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Match Events Summary (Optional expansion) */}
              {(match.status === "live" || match.status === "finished") && (
                <div className="mt-4 pt-4 border-t border-slate-800 flex justify-center text-xs text-slate-500 gap-4">
                  {match.currentMinute && (
                    <span className="text-emerald-500 font-bold">
                      {match.currentMinute}&apos;
                    </span>
                  )}
                  {/* Add goal scorers here if available in the future */}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

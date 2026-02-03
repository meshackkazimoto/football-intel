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
  Play,
  Pause,
  Square,
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
import { LiveMinutePulse } from "@/components/match/live-minute-pulse";

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
    queryFn: seasonsService.getSeasons,
  });

  const { data: stadiums } = useQuery({
    queryKey: ["stadiums"],
    queryFn: stadiumsService.getStadiums,
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

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Record<string, any>;
    }) => matchesService.updateMatch(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
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

  const startMatch = (match: Match) => {
    updateMutation.mutate({
      id: match.id,
      data: {
        status: "live",
        startedAt: new Date().toISOString(),
        period: "1H",
        currentMinute: 0,
      },
    });
  };

  const halfTime = (match: Match) => {
    updateMutation.mutate({
      id: match.id,
      data: {
        status: "half_time",
        period: "HT",
        currentMinute: 45,
      },
    });
  };

  const startSecondHalf = (match: Match) => {
    updateMutation.mutate({
      id: match.id,
      data: {
        status: "live",
        period: "2H",
        currentMinute: 46,
      },
    });
  };

  const finishMatch = (match: Match) => {
    updateMutation.mutate({
      id: match.id,
      data: {
        status: "finished",
        endedAt: new Date().toISOString(),
      },
    });
  };

  const getStatusBadge = (status: MatchStatus) => {
    const colors: Record<MatchStatus, string> = {
      scheduled: "bg-blue-500/10 text-blue-400 border-blue-500/30",
      live: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 animate-pulse",
      half_time: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      finished: "bg-slate-500/10 text-slate-400 border-slate-500/30",
      postponed: "bg-rose-500/10 text-rose-400 border-rose-500/30",
      // cancelled: "bg-rose-900/10 text-rose-600 border-rose-900/30",
    };
    return colors[status];
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold text-slate-100">Matches</h1>
        <PrimaryButton onClick={() => setShowCreateForm(true)}>
          <Plus className="w-4 h-4" />
          Add Match
        </PrimaryButton>
      </div>

      {showCreateForm && (
        <FormSection title="Create Match">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-2 gap-4"
          >
            <FormSelect
              label="Season"
              {...register("seasonId")}
              error={errors.seasonId}
              options={
                seasons?.data.map((s) => ({
                  label: s.name,
                  value: s.id,
                })) ?? []
              }
            />

            <FormInput
              label="Match Date"
              type="datetime-local"
              {...register("matchDate")}
              error={errors.matchDate}
            />

            <FormSelect
              label="Home Team"
              {...register("homeTeamId")}
              error={errors.homeTeamId}
              options={teams.map((t) => ({
                label: t.name,
                value: t.id,
              }))}
            />

            <FormSelect
              label="Away Team"
              {...register("awayTeamId")}
              error={errors.awayTeamId}
              options={teams
                .filter((t) => t.id !== homeTeamId)
                .map((t) => ({
                  label: t.name,
                  value: t.id,
                }))}
            />

            <div className="col-span-2">
              <FormSelect
                label="Venue"
                {...register("venue")}
                error={errors.venue}
                options={
                  stadiums?.data.map((s) => ({
                    label: s.name,
                    value: s.name,
                  })) ?? []
                }
              />
            </div>

            <div className="col-span-2 flex gap-3">
              <PrimaryButton type="submit" loading={createMutation.isPending}>
                Create Match
              </PrimaryButton>
              <SecondaryButton
                type="button"
                onClick={() => {
                  reset();
                  setShowCreateForm(false);
                }}
              >
                Cancel
              </SecondaryButton>
            </div>
          </form>
        </FormSection>
      )}

      {isLoading ? (
        <Loader2 className="animate-spin text-emerald-500 mx-auto" />
      ) : (
        <div className="grid gap-4">
          {matches.map((match) => (
            <div
              key={match.id}
              className="bg-slate-900 border border-slate-700 rounded-2xl p-6"
            >
              <div className="flex justify-between items-center">
                <div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(
                      match.status,
                    )}`}
                  >
                    {match.status.toUpperCase() + " "}

                    {match.status === "live" && (
                      <LiveMinutePulse minute={match.currentMinute ?? 0} />
                    )}

                  </span>

                  <div className="mt-2 flex gap-2 text-slate-400 text-sm">
                    <Calendar className="w-4 h-4" />
                    {new Date(match.matchDate).toLocaleString()}
                  </div>

                  {match.venue && (
                    <div className="flex gap-2 text-slate-500 text-xs mt-1">
                      <MapPin className="w-3 h-3" />
                      {match.venue}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {match.status === "scheduled" && (
                    <PrimaryButton onClick={() => startMatch(match)}>
                      <Play className="w-4 h-4" />
                      Start
                    </PrimaryButton>
                  )}

                  {match.status === "live" &&
                    match.period === "1H" && (
                      <SecondaryButton onClick={() => halfTime(match)}>
                        <Pause className="w-4 h-4" />
                        Half Time
                      </SecondaryButton>
                    )}

                  {match.status === "half_time" && (
                    <PrimaryButton
                      onClick={() => startSecondHalf(match)}
                    >
                      <Play className="w-4 h-4" />
                      Second Half
                    </PrimaryButton>
                  )}

                  {(match.status === "live" ||
                    match.status === "half_time") && (
                      <SecondaryButton
                        onClick={() => finishMatch(match)}
                      >
                        <Square className="w-4 h-4" />
                        Finish
                      </SecondaryButton>
                    )}

                  <button
                    onClick={() => deleteMutation.mutate(match.id)}
                    className="p-2 hover:bg-rose-500/10 rounded-lg text-rose-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mt-4 flex justify-center font-bold text-lg text-slate-100">
                {match.homeTeam.name}{" "}
                <span className="mx-4">
                  {match.homeScore ?? "-"} :{" "}
                  {match.awayScore ?? "-"}
                </span>
                {match.awayTeam.name}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
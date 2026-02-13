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
  Trash2,
  Loader2,
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
import { useRouter } from "next/navigation";

export default function MatchesPage() {
  const [statusFilter, setStatusFilter] = useState<"all" | MatchStatus>("all");
  const [seasonFilter, setSeasonFilter] = useState<string>("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: matchesResponse, isLoading } = useQuery({
    queryKey: ["matches", statusFilter, seasonFilter],
    queryFn: () =>
      matchesService.getMatches({
        ...(statusFilter === "all" ? {} : { status: statusFilter }),
        ...(seasonFilter === "all" ? {} : { seasonId: seasonFilter }),
      }),
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
      data: Record<string, unknown>;
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

  const matches = [...(matchesResponse?.data ?? [])].sort(
    (a, b) => new Date(b.matchDate).getTime() - new Date(a.matchDate).getTime(),
  );

  const liveCount = matches.filter((m) => m.status === "live").length;
  const scheduledCount = matches.filter((m) => m.status === "scheduled").length;
  const finishedCount = matches.filter((m) => m.status === "finished").length;

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
    };
    return colors[status];
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Matches</h1>
          <p className="mt-1 text-slate-400">
            Recent matches first. Manage fixture lifecycle and live operations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={seasonFilter}
            onChange={(e) => setSeasonFilter(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200"
          >
            <option value="all">All Seasons</option>
            {seasons?.data.map((season) => (
              <option key={season.id} value={season.id}>
                {season.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "all" | MatchStatus)}
            className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200"
          >
            <option value="all">All Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="live">Live</option>
            <option value="half_time">Half Time</option>
            <option value="finished">Finished</option>
            <option value="postponed">Postponed</option>
          </select>

          <PrimaryButton onClick={() => setShowCreateForm(true)}>
            <Plus className="w-4 h-4" />
            Add Match
          </PrimaryButton>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4">
          <p className="text-sm text-slate-400">Live Now</p>
          <p className="text-2xl font-bold text-emerald-400">{liveCount}</p>
        </div>
        <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4">
          <p className="text-sm text-slate-400">Scheduled</p>
          <p className="text-2xl font-bold text-blue-400">{scheduledCount}</p>
        </div>
        <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4">
          <p className="text-sm text-slate-400">Finished</p>
          <p className="text-2xl font-bold text-slate-200">{finishedCount}</p>
        </div>
      </div>

      {showCreateForm && (
        <FormSection title="Create Match">
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
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
        <Loader2 className="mx-auto animate-spin text-emerald-500" />
      ) : (
        <div className="grid gap-4">
          {matches.map((match) => (
            <div
              key={match.id}
              className="cursor-pointer rounded-2xl border border-slate-700 bg-slate-900 p-6 transition-all hover:border-emerald-500/40"
              onClick={() => router.push(`/matches/${match.id}`)}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-bold ${getStatusBadge(
                      match.status,
                    )}`}
                  >
                    {match.status.toUpperCase()} {" "}
                    {match.status === "live" && (
                      <LiveMinutePulse minute={match.currentMinute ?? 0} />
                    )}
                  </span>

                  <div className="mt-2 flex items-center gap-2 text-sm text-slate-400">
                    <Calendar className="h-4 w-4" />
                    {new Date(match.matchDate).toLocaleString()}
                  </div>

                  {match.venue && (
                    <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                      <MapPin className="h-3 w-3" />
                      {match.venue}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {match.status === "scheduled" && (
                    <PrimaryButton
                      onClick={(e) => {
                        e.stopPropagation();
                        startMatch(match);
                      }}
                    >
                      <Play className="w-4 h-4" />
                      Start
                    </PrimaryButton>
                  )}

                  {match.status === "live" && match.period === "1H" && (
                    <SecondaryButton
                      onClick={(e) => {
                        e.stopPropagation();
                        halfTime(match);
                      }}
                    >
                      <Pause className="w-4 h-4" />
                      Half Time
                    </SecondaryButton>
                  )}

                  {match.status === "half_time" && (
                    <PrimaryButton
                      onClick={(e) => {
                        e.stopPropagation();
                        startSecondHalf(match);
                      }}
                    >
                      <Play className="w-4 h-4" />
                      Second Half
                    </PrimaryButton>
                  )}

                  {(match.status === "live" || match.status === "half_time") && (
                    <SecondaryButton
                      onClick={(e) => {
                        e.stopPropagation();
                        finishMatch(match);
                      }}
                    >
                      <Square className="w-4 h-4" />
                      Finish
                    </SecondaryButton>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteMutation.mutate(match.id);
                    }}
                    className="rounded-lg p-2 text-rose-400 hover:bg-rose-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3 text-slate-100">
                <p className="truncate text-right font-semibold">{match.homeTeam.name}</p>
                <p className="text-lg font-extrabold tracking-wide">
                  {match.homeScore ?? "-"} : {match.awayScore ?? "-"}
                </p>
                <p className="truncate font-semibold">{match.awayTeam.name}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

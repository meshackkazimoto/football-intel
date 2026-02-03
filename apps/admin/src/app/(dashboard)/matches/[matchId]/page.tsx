"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { matchesService } from "@/services/matches/matches.service";
import { matchEventsService } from "@/services/match-events/match-events.service";
import { matchStatsService } from "@/services/match-stats/match-stats.service";
import {
  Play,
  Pause,
  Square,
  Goal,
  AlertTriangle,
  Repeat,
  Loader2,
} from "lucide-react";
import { PrimaryButton, SecondaryButton } from "@/components/ui/button";
import { LiveMinutePulse } from "@/components/match/live-minute-pulse";
import type { Match } from "@/services/matches/types";

export default function MatchAdminPage() {
  const { matchId } = useParams<{ matchId: string }>();
  const queryClient = useQueryClient();

  const { data: match, isLoading } = useQuery({
    queryKey: ["match", matchId],
    queryFn: () => matchesService.getMatchById(matchId),
  });

  const updateMatch = useMutation({
    mutationFn: ({ payload }: { payload: any }) =>
      matchesService.updateMatch(matchId, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["match", matchId] }),
  });

  const addEvent = useMutation({
    mutationFn: matchEventsService.createEvent,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["match", matchId] }),
  });

  if (isLoading || !match) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  const startMatch = () =>
    updateMatch.mutate({
      payload: {
        status: "live",
        currentMinute: 0,
        period: "1H",
      },
    });

  const halfTime = () =>
    updateMatch.mutate({
      payload: {
        status: "half_time",
        currentMinute: 45,
        period: "HT",
      },
    });

  const resume = () =>
    updateMatch.mutate({
      payload: {
        status: "live",
        period: "2H",
      },
    });

  const finish = () =>
    updateMatch.mutate({
      payload: {
        status: "finished",
        currentMinute: 90,
        period: "FT",
      },
    });

  const addGoal = (teamId: string) =>
    addEvent.mutate({
      matchId,
      teamId,
      eventType: "goal",
      minute: match.currentMinute ?? 0,
    });

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-100">
          {match.homeTeam.name} vs {match.awayTeam.name}
        </h1>

        <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-300">
          {match.status.toUpperCase()}
        </span>
      </div>

      {/* SCORE + MINUTE */}
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 flex justify-between items-center">
        <div className="text-xl font-bold text-slate-100">
          {match.homeScore ?? 0} : {match.awayScore ?? 0}
        </div>

        {match.status === "live" && (
          <LiveMinutePulse minute={match.currentMinute ?? 0} />
        )}
      </div>

      {/* MATCH CONTROL */}
      <div className="flex gap-3">
        {match.status === "scheduled" && (
          <PrimaryButton onClick={startMatch}>
            <Play className="w-4 h-4" />
            Start
          </PrimaryButton>
        )}

        {match.status === "live" && (
          <>
            <SecondaryButton onClick={halfTime}>
              <Pause className="w-4 h-4" />
              Half Time
            </SecondaryButton>

            <SecondaryButton onClick={finish}>
              <Square className="w-4 h-4" />
              Finish
            </SecondaryButton>
          </>
        )}

        {match.status === "half_time" && (
          <PrimaryButton onClick={resume}>
            <Play className="w-4 h-4" />
            Resume
          </PrimaryButton>
        )}
      </div>

      {/* EVENTS */}
      {match.status !== "scheduled" && (
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-4">
          <h3 className="font-bold text-slate-100">Match Events</h3>

          <div className="flex gap-3">
            <PrimaryButton
              onClick={() => addGoal(match.homeTeamId)}
            >
              <Goal className="w-4 h-4" />
              Home Goal
            </PrimaryButton>

            <PrimaryButton
              onClick={() => addGoal(match.awayTeamId)}
            >
              <Goal className="w-4 h-4" />
              Away Goal
            </PrimaryButton>

            <SecondaryButton>
              <AlertTriangle className="w-4 h-4" />
              Card
            </SecondaryButton>

            <SecondaryButton>
              <Repeat className="w-4 h-4" />
              Sub
            </SecondaryButton>
          </div>
        </div>
      )}
    </div>
  );
}
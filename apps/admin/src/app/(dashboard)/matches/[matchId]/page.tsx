"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { matchesService } from "@/services/matches/matches.service";
import { matchEventsService } from "@/services/match-events/match-events.service";
import { matchStatsService } from "@/services/match-stats/match-stats.service";
import { teamsService } from "@/services/teams/teams.service";

import {
  Play,
  Pause,
  Square,
  Goal,
  AlertTriangle,
  Repeat,
  Loader2,
  ShieldAlert,
  Timer,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

import { PrimaryButton, SecondaryButton } from "@/components/ui/button";
import { FormSelect } from "@/components/ui/select";
import { LiveMinutePulse } from "@/components/match/live-minute-pulse";

import type { Match, MatchStatus } from "@/services/matches/types";

const CURRENT_ROLE: "ADMIN" | "REFEREE" | "VIEWER" = "REFEREE";

export default function MatchAdminPage() {
  const { matchId } = useParams<{ matchId: string }>();
  const queryClient = useQueryClient();

  const [autoTicker, setAutoTicker] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [showSubModal, setShowSubModal] = useState(false);

  const { data: match, isLoading } = useQuery({
    queryKey: ["match", matchId],
    queryFn: () => matchesService.getMatchById(matchId),
  });

  const { data: teamsResponse } = useQuery({
    queryKey: ["teams", match?.seasonId],
    queryFn: () =>
      match ? teamsService.getTeams(match.seasonId) : Promise.resolve(null),
    enabled: !!match,
  });

  const players = useMemo(() => {
    if (!teamsResponse || !match) return [];
    return teamsResponse.data.filter(
      (t) => t.id === match.homeTeamId || t.id === match.awayTeamId,
    );
  }, [teamsResponse, match]);

  const updateMatch = useMutation({
    mutationFn: (payload: any) =>
      matchesService.updateMatch(matchId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["match", matchId] });
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
  });

  const addEvent = useMutation({
    mutationFn: matchEventsService.createEvent,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["match", matchId] }),
  });

  useEffect(() => {
    if (!match || match.status !== "live") return;

    const source = new EventSource(
      `/api/v1/matches/${matchId}/live-stream`,
    );

    source.onmessage = () => {
      queryClient.invalidateQueries({ queryKey: ["match", matchId] });
    };

    return () => source.close();
  }, [match?.status, matchId]);

  useEffect(() => {
    if (!autoTicker || match?.status !== "live") return;

    const id = setInterval(() => {
      updateMatch.mutate({
        currentMinute: (match.currentMinute ?? 0) + 1,
      });
    }, 60000);

    return () => clearInterval(id);
  }, [autoTicker, match?.status, match?.currentMinute]);

  if (isLoading || !match) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  const canControl =
    CURRENT_ROLE === "ADMIN" || CURRENT_ROLE === "REFEREE";

  const startMatch = () =>
    updateMatch.mutate({
      status: "live",
      currentMinute: 0,
      period: "1H",
    });

  const halfTime = () =>
    updateMatch.mutate({
      status: "half_time",
      currentMinute: 45,
      period: "HT",
    });

  const resumeSecondHalf = () =>
    updateMatch.mutate({
      status: "live",
      currentMinute: 46,
      period: "2H",
    });

  const finishMatch = () =>
    updateMatch.mutate({
      status: "finished",
      currentMinute: match.currentMinute ?? 90,
      period: "FT",
    });

  /* -----------------------------------------------------
     EVENTS
  ----------------------------------------------------- */
  const pushEvent = (type: string) => {
    if (!selectedTeamId) return;

    addEvent.mutate({
      matchId,
      teamId: selectedTeamId,
      eventType: type,
      minute: match.currentMinute ?? 0,
      playerId: selectedPlayerId ?? undefined,
    });
  };

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-100">
          {match.homeTeam.name} vs {match.awayTeam.name}
        </h1>

        <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-300">
          {match.status.toUpperCase()}
        </span>
      </div>

      {/* SCORE */}
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 flex justify-between items-center">
        <div className="text-3xl font-bold text-slate-100">
          {match.homeScore ?? 0} : {match.awayScore ?? 0}
        </div>

        {match.status === "live" && (
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <Timer className="w-4 h-4" />
            <LiveMinutePulse minute={match.currentMinute ?? 0} />
          </div>
        )}
      </div>

      {/* MATCH CONTROL */}
      {canControl && (
        <div className="flex gap-3 flex-wrap">
          {match.status === "scheduled" && (
            <PrimaryButton onClick={startMatch}>
              <Play className="w-4 h-4" />
              Start
            </PrimaryButton>
          )}

          {match.status === "live" && match.period === "1H" && (
            <SecondaryButton onClick={halfTime}>
              <Pause className="w-4 h-4" />
              Half Time
            </SecondaryButton>
          )}

          {match.status === "half_time" && (
            <PrimaryButton onClick={resumeSecondHalf}>
              <Play className="w-4 h-4" />
              Second Half
            </PrimaryButton>
          )}

          {(match.status === "live" ||
            match.status === "half_time") && (
            <SecondaryButton onClick={finishMatch}>
              <Square className="w-4 h-4" />
              Finish
            </SecondaryButton>
          )}
        </div>
      )}

      {/* AUTO TICKER */}
      {canControl && match.status === "live" && (
        <div className="flex items-center gap-2 text-slate-400">
          {autoTicker ? (
            <ToggleRight
              className="w-6 h-6 text-emerald-500 cursor-pointer"
              onClick={() => setAutoTicker(false)}
            />
          ) : (
            <ToggleLeft
              className="w-6 h-6 cursor-pointer"
              onClick={() => setAutoTicker(true)}
            />
          )}
          Auto Minute Ticker
        </div>
      )}

      {/* EVENT CONTROLS */}
      {canControl && match.status !== "scheduled" && (
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-4">
          <h3 className="font-bold text-slate-100">Add Event</h3>

          <FormSelect
            label="Team"
            value={selectedTeamId ?? ""}
            onChange={(e) => setSelectedTeamId(e.target.value)}
            options={[
              {
                label: match.homeTeam.name,
                value: match.homeTeamId,
              },
              {
                label: match.awayTeam.name,
                value: match.awayTeamId,
              },
            ]}
          />

          <FormSelect
            label="Player (optional)"
            value={selectedPlayerId ?? ""}
            onChange={(e) => setSelectedPlayerId(e.target.value)}
            options={[
              { label: "— None —", value: "" },
              ...players.map((p) => ({
                label: p.name,
                value: p.id,
              })),
            ]}
          />

          <div className="flex gap-3 flex-wrap">
            <PrimaryButton onClick={() => pushEvent("goal")}>
              <Goal className="w-4 h-4" />
              Goal
            </PrimaryButton>

            <SecondaryButton
              onClick={() => pushEvent("yellow_card")}
            >
              <AlertTriangle className="w-4 h-4" />
              Yellow
            </SecondaryButton>

            <SecondaryButton
              onClick={() => pushEvent("red_card")}
            >
              <ShieldAlert className="w-4 h-4" />
              Red
            </SecondaryButton>

            <SecondaryButton onClick={() => setShowSubModal(true)}>
              <Repeat className="w-4 h-4" />
              Substitution
            </SecondaryButton>
          </div>
        </div>
      )}

      {/* TIMELINE */}
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6">
        <h3 className="font-bold text-slate-100 mb-4">
          Match Timeline
        </h3>

        {match.events?.length === 0 ? (
          <p className="text-slate-500 text-sm">
            No events recorded yet.
          </p>
        ) : (
          <ul className="space-y-2 text-sm">
            {match.events?.map((e) => (
              <li
                key={e.id}
                className="flex justify-between border-b border-slate-800 pb-1"
              >
                <span>
                  {e.minute}&apos; {e.eventType.replace("_", " ")}
                </span>
                <span className="text-slate-500">
                  {e.player?.fullName ?? "—"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
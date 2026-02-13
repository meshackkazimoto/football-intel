"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

import { matchesService } from "@/services/matches/matches.service";
import { matchEventsService } from "@/services/match-events/match-events.service";
import { playerContractsService } from "@/services/player-contracts/player-contracts.service";

import {
  Play,
  Pause,
  Square,
  Goal,
  AlertTriangle,
  ShieldAlert,
  Repeat,
  Loader2,
  Timer,
  ToggleLeft,
  ToggleRight,
  Video,
  Stethoscope,
  CloudRain,
  Users,
} from "lucide-react";

import { PrimaryButton, SecondaryButton } from "@/components/ui/button";
import { FormSelect } from "@/components/ui/select";
import { LiveMinutePulse } from "@/components/match/live-minute-pulse";

import type { Match } from "@/services/matches/types";
import type { MatchEventType } from "@/services/match-events/types";

const CURRENT_ROLE: "ADMIN" | "REFEREE" | "VIEWER" = "REFEREE";

export default function MatchAdminPage() {
  const { matchId } = useParams<{ matchId: string }>();
  const queryClient = useQueryClient();

  const [autoTicker, setAutoTicker] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [eventError, setEventError] = useState<string | null>(null);

  const { data: match, isLoading } = useQuery({
    queryKey: ["match", matchId],
    queryFn: () => matchesService.getMatchById(matchId),
  });

  const { data: teamContracts, isLoading: isLoadingTeamPlayers } = useQuery({
    queryKey: ["player-contracts", selectedTeamId],
    queryFn: () =>
      selectedTeamId
        ? playerContractsService.getContracts({ teamId: selectedTeamId })
        : Promise.resolve([]),
    enabled: !!selectedTeamId,
  });

  const eligiblePlayers = useMemo(() => {
    if (!match || !teamContracts) return [];
    const matchDate = new Date(match.matchDate).toISOString().slice(0, 10);
    return teamContracts.filter((contract) => {
      const startsBeforeOrOnMatch = contract.startDate <= matchDate;
      const endsAfterOrOnMatch =
        !contract.endDate || contract.endDate >= matchDate;
      return startsBeforeOrOnMatch && endsAfterOrOnMatch;
    });
  }, [teamContracts, match]);

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["match", matchId] });
      setEventError(null);
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        setEventError(
          error.response?.data?.error ?? "Failed to add event",
        );
        return;
      }
      setEventError("Failed to add event");
    },
  });

  useEffect(() => {
    if (!match || match.status !== "live") return;

    const source = new EventSource(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/matches/${matchId}/live-stream`,
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
      homeScore: 0,
      awayScore: 0,
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

  const pushEvent = (eventType: MatchEventType) => {
    if (!selectedTeamId) return;
    if (!selectedPlayerId) {
      setEventError("Select a player from the active team roster first.");
      return;
    }

    addEvent.mutate({
      matchId,
      teamId: selectedTeamId,
      eventType,
      minute: match.currentMinute ?? 0,
      playerId: selectedPlayerId,
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

      {/* TEAM & PLAYER PICKER */}
      {canControl && match.status !== "scheduled" && (
        <div className="grid grid-cols-2 gap-4">
          <FormSelect
            label="Team"
            value={selectedTeamId ?? ""}
            onChange={(e) => {
              setSelectedTeamId(e.target.value);
              setSelectedPlayerId(null);
              setEventError(null);
            }}
            options={[
              { label: match.homeTeam.name, value: match.homeTeamId },
              { label: match.awayTeam.name, value: match.awayTeamId },
            ]}
          />

          <FormSelect
            label="Player (team roster)"
            value={selectedPlayerId ?? ""}
            onChange={(e) => setSelectedPlayerId(e.target.value)}
            options={[
              ...eligiblePlayers.map((contract) => ({
                label: `${contract.player?.fullName ?? contract.playerId} (${contract.position}${contract.jerseyNumber ? ` #${contract.jerseyNumber}` : ""})`,
                value: contract.playerId,
              })),
            ]}
            disabled={!selectedTeamId || isLoadingTeamPlayers}
          />
        </div>
      )}

      {eventError ? (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {eventError}
        </div>
      ) : null}

      {/* INCIDENT PANEL */}
      {canControl && match.status !== "scheduled" && (
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-4">
          <h3 className="font-bold text-slate-100">
            Match Incidents
          </h3>

          <div className="flex flex-wrap gap-3">
            <PrimaryButton onClick={() => pushEvent("goal")}>
              <Goal className="w-4 h-4" />
              Goal
            </PrimaryButton>

            <SecondaryButton
              onClick={() => pushEvent("yellow_card")}
            >
              <AlertTriangle className="w-4 h-4" />
              Yellow Card
            </SecondaryButton>

            <SecondaryButton
              onClick={() => pushEvent("red_card")}
            >
              <ShieldAlert className="w-4 h-4" />
              Red Card
            </SecondaryButton>

            <SecondaryButton
              onClick={() => pushEvent("own_goal")}
            >
              <Video className="w-4 h-4" />
              Own Goal
            </SecondaryButton>

            <SecondaryButton
              onClick={() => pushEvent("substitution")}
            >
              <Stethoscope className="w-4 h-4" />
              Substitution
            </SecondaryButton>

            <SecondaryButton
              onClick={() => pushEvent("penalty_scored")}
            >
              <CloudRain className="w-4 h-4" />
              Penalty Scored
            </SecondaryButton>

            <SecondaryButton
              onClick={() => pushEvent("penalty_missed")}
            >
              <Users className="w-4 h-4" />
              Penalty Missed
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
            {match.events.map((e) => (
              <li
                key={e.id}
                className="flex justify-between border-b border-slate-800 pb-1"
              >
                <span>
                  {e.minute}&apos; {e.eventType.replace("_", " ")}
                </span>
                <span className="text-slate-500">
                  {e.playerId ?? "—"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

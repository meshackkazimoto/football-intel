"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

import { matchesService } from "@/services/matches/matches.service";
import { matchEventsService } from "@/services/match-events/match-events.service";
import { playerContractsService } from "@/services/player-contracts/player-contracts.service";
import { lineupsService } from "@/services/lineups/lineups.service";
import { matchStatsService } from "@/services/match-stats/match-stats.service";
import { matchPossessionsService } from "@/services/match-possessions/match-possessions.service";

import {
  Play,
  Pause,
  Square,
  Goal,
  BarChart3,
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
import type { PlayerContract } from "@/services/player-contracts/types";
import type { MatchStats } from "@/services/match-stats/types";

const CURRENT_ROLE: "ADMIN" | "REFEREE" | "VIEWER" = "REFEREE";

function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError(error)) return fallback;

  const apiError = error.response?.data?.error;
  if (typeof apiError === "string" && apiError.trim()) return apiError;

  if (apiError && typeof apiError === "object") {
    const maybe = apiError as {
      message?: unknown;
      formErrors?: unknown;
      fieldErrors?: unknown;
    };

    if (typeof maybe.message === "string" && maybe.message.trim()) {
      return maybe.message;
    }

    if (Array.isArray(maybe.formErrors)) {
      const formMessage = maybe.formErrors.find(
        (msg): msg is string => typeof msg === "string" && msg.trim().length > 0,
      );
      if (formMessage) return formMessage;
    }

    if (maybe.fieldErrors && typeof maybe.fieldErrors === "object") {
      const entries = Object.values(maybe.fieldErrors as Record<string, unknown>);
      for (const value of entries) {
        if (Array.isArray(value)) {
          const fieldMessage = value.find(
            (msg): msg is string =>
              typeof msg === "string" && msg.trim().length > 0,
          );
          if (fieldMessage) return fieldMessage;
        }
      }
    }
  }

  return fallback;
}

function formatEventLabel(eventType: string): string {
  if (eventType === "goal") return "GOAL!!!";
  if (eventType === "own_goal") return "OWN GOAL";

  return eventType
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

type TabKey = "overview" | "lineups" | "stats";

type MatchStatsDraft = {
  possession?: number;
  shotsOnTarget?: number;
  shotsOffTarget?: number;
  corners?: number;
  fouls?: number;
  yellowCards?: number;
  redCards?: number;
  saves?: number;
  passAccuracy?: number;
};

const EMPTY_STATS: MatchStatsDraft = {
  possession: undefined,
  shotsOnTarget: undefined,
  shotsOffTarget: undefined,
  corners: undefined,
  fouls: undefined,
  yellowCards: undefined,
  redCards: undefined,
  saves: undefined,
  passAccuracy: undefined,
};

const toOptionalInt = (value: unknown): number | undefined => {
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
  return Math.trunc(value);
};

const sanitizeStatsDraft = (draft: MatchStatsDraft): MatchStatsDraft => ({
  possession: toOptionalInt(draft.possession),
  shotsOnTarget: toOptionalInt(draft.shotsOnTarget),
  shotsOffTarget: toOptionalInt(draft.shotsOffTarget),
  corners: toOptionalInt(draft.corners),
  fouls: toOptionalInt(draft.fouls),
  yellowCards: toOptionalInt(draft.yellowCards),
  redCards: toOptionalInt(draft.redCards),
  saves: toOptionalInt(draft.saves),
  passAccuracy: toOptionalInt(draft.passAccuracy),
});

export default function MatchAdminPage() {
  const { matchId } = useParams<{ matchId: string }>();
  const queryClient = useQueryClient();

  const [autoTicker, setAutoTicker] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [additionalMinutes, setAdditionalMinutes] = useState(1);
  const [eventError, setEventError] = useState<string | null>(null);
  const [lineupError, setLineupError] = useState<string | null>(null);
  const [lineupSuccess, setLineupSuccess] = useState<string | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [statsSuccess, setStatsSuccess] = useState<string | null>(null);
  const [possessionError, setPossessionError] = useState<string | null>(null);
  const [possessionSuccess, setPossessionSuccess] = useState<string | null>(null);
  const [homeLineup, setHomeLineup] = useState<
    Record<string, { selected: boolean; position: string; jerseyNumber?: number }>
  >({});
  const [awayLineup, setAwayLineup] = useState<
    Record<string, { selected: boolean; position: string; jerseyNumber?: number }>
  >({});
  const [homeStatsDraft, setHomeStatsDraft] = useState<MatchStatsDraft>(EMPTY_STATS);
  const [awayStatsDraft, setAwayStatsDraft] = useState<MatchStatsDraft>(EMPTY_STATS);

  const { data: match, isLoading } = useQuery({
    queryKey: ["match", matchId],
    queryFn: () => matchesService.getMatchById(matchId),
  });

  useEffect(() => {
    if (!match) return;
    if (match.status !== "live" && match.status !== "half_time") return;

    const id = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ["match", matchId] });
    }, 5000);

    return () => clearInterval(id);
  }, [match?.status, matchId, queryClient]);

  const { data: teamContracts, isLoading: isLoadingTeamPlayers } = useQuery({
    queryKey: ["player-contracts", selectedTeamId],
    queryFn: () =>
      selectedTeamId
        ? playerContractsService.getContracts({ teamId: selectedTeamId })
        : Promise.resolve([]),
    enabled: !!selectedTeamId,
  });

  const { data: statsRows = [] } = useQuery({
    queryKey: ["match-stats", matchId],
    queryFn: () => matchStatsService.getStatsByMatch(matchId),
  });

  const { data: possessionRows = [] } = useQuery({
    queryKey: ["match-possessions", matchId],
    queryFn: () => matchPossessionsService.getByMatch(matchId),
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

  const { data: homeContracts } = useQuery({
    queryKey: ["player-contracts-home", match?.homeTeamId],
    queryFn: () =>
      match
        ? playerContractsService.getContracts({ teamId: match.homeTeamId })
        : Promise.resolve([]),
    enabled: !!match,
  });

  const { data: awayContracts } = useQuery({
    queryKey: ["player-contracts-away", match?.awayTeamId],
    queryFn: () =>
      match
        ? playerContractsService.getContracts({ teamId: match.awayTeamId })
        : Promise.resolve([]),
    enabled: !!match,
  });

  const homeEligibleContracts = useMemo(() => {
    if (!match || !homeContracts) return [];
    const matchDate = new Date(match.matchDate).toISOString().slice(0, 10);
    return homeContracts.filter((contract) => {
      const startsBeforeOrOnMatch = contract.startDate <= matchDate;
      const endsAfterOrOnMatch =
        !contract.endDate || contract.endDate >= matchDate;
      return startsBeforeOrOnMatch && endsAfterOrOnMatch;
    });
  }, [homeContracts, match]);

  const awayEligibleContracts = useMemo(() => {
    if (!match || !awayContracts) return [];
    const matchDate = new Date(match.matchDate).toISOString().slice(0, 10);
    return awayContracts.filter((contract) => {
      const startsBeforeOrOnMatch = contract.startDate <= matchDate;
      const endsAfterOrOnMatch =
        !contract.endDate || contract.endDate >= matchDate;
      return startsBeforeOrOnMatch && endsAfterOrOnMatch;
    });
  }, [awayContracts, match]);

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
      setEventError(getApiErrorMessage(error, "Failed to add event"));
    },
  });

  const saveLineup = useMutation({
    mutationFn: lineupsService.createLineup,
    onSuccess: () => {
      setLineupError(null);
      setLineupSuccess("Lineup saved successfully.");
      queryClient.invalidateQueries({ queryKey: ["match", matchId] });
    },
    onError: (error) => {
      setLineupError(getApiErrorMessage(error, "Failed to save lineup."));
      setLineupSuccess(null);
    },
  });

  const saveStats = useMutation({
    mutationFn: matchStatsService.upsertStats,
    onSuccess: () => {
      setStatsError(null);
      setStatsSuccess("Match stats saved.");
      queryClient.invalidateQueries({ queryKey: ["match-stats", matchId] });
      queryClient.invalidateQueries({ queryKey: ["match", matchId] });
    },
    onError: (error) => {
      setStatsError(getApiErrorMessage(error, "Failed to save match stats."));
      setStatsSuccess(null);
    },
  });

  const updatePossession = useMutation({
    mutationFn: matchPossessionsService.upsert,
    onSuccess: () => {
      setPossessionError(null);
      setPossessionSuccess("Possession updated.");
      queryClient.invalidateQueries({ queryKey: ["match-possessions", matchId] });
      queryClient.invalidateQueries({ queryKey: ["match-stats", matchId] });
    },
    onError: (error) => {
      setPossessionError(getApiErrorMessage(error, "Failed to update possession."));
      setPossessionSuccess(null);
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

  const homeStats = useMemo(
    () => statsRows.find((row: MatchStats) => row.teamId === match?.homeTeamId),
    [statsRows, match?.homeTeamId],
  );

  const awayStats = useMemo(
    () => statsRows.find((row: MatchStats) => row.teamId === match?.awayTeamId),
    [statsRows, match?.awayTeamId],
  );

  useEffect(() => {
    setHomeStatsDraft(
      sanitizeStatsDraft({
        possession: homeStats?.possession,
        shotsOnTarget: homeStats?.shotsOnTarget,
        shotsOffTarget: homeStats?.shotsOffTarget,
        corners: homeStats?.corners,
        fouls: homeStats?.fouls,
        yellowCards: homeStats?.yellowCards,
        redCards: homeStats?.redCards,
        saves: homeStats?.saves,
        passAccuracy: homeStats?.passAccuracy,
      }),
    );
    setAwayStatsDraft(
      sanitizeStatsDraft({
        possession: awayStats?.possession,
        shotsOnTarget: awayStats?.shotsOnTarget,
        shotsOffTarget: awayStats?.shotsOffTarget,
        corners: awayStats?.corners,
        fouls: awayStats?.fouls,
        yellowCards: awayStats?.yellowCards,
        redCards: awayStats?.redCards,
        saves: awayStats?.saves,
        passAccuracy: awayStats?.passAccuracy,
      }),
    );
  }, [homeStats, awayStats]);

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
      currentMinute: 45,
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

  const updateTeamLineup = (
    team: "home" | "away",
    playerId: string,
    patch: Partial<{ selected: boolean; position: string; jerseyNumber?: number }>,
    defaults: { position: string; jerseyNumber?: number },
  ) => {
    if (team === "home") {
      setHomeLineup((prev) => {
        const current = prev[playerId] ?? {
          selected: false,
          position: defaults.position,
          jerseyNumber: defaults.jerseyNumber,
        };
        return {
          ...prev,
          [playerId]: { ...current, ...patch },
        };
      });
      return;
    }

    setAwayLineup((prev) => {
      const current = prev[playerId] ?? {
        selected: false,
        position: defaults.position,
        jerseyNumber: defaults.jerseyNumber,
      };
      return {
        ...prev,
        [playerId]: { ...current, ...patch },
      };
    });
  };

  const buildLineupPayload = (
    contracts: PlayerContract[],
    lineupState: Record<string, { selected: boolean; position: string; jerseyNumber?: number }>,
  ) => {
    return contracts
      .filter((contract) => lineupState[contract.playerId]?.selected)
      .map((contract) => {
        const state = lineupState[contract.playerId];
        return {
          playerId: contract.playerId,
          position: (state?.position || contract.position || "UNK").trim(),
          isStarting: true,
          jerseyNumber: state?.jerseyNumber ?? contract.jerseyNumber ?? undefined,
        };
      });
  };

  const submitLineup = (team: "home" | "away") => {
    if (match.status !== "scheduled") {
      setLineupError("Lineups can only be saved before kickoff.");
      setLineupSuccess(null);
      return;
    }

    const isHome = team === "home";
    const contracts = isHome ? homeEligibleContracts : awayEligibleContracts;
    const state = isHome ? homeLineup : awayLineup;
    const payloadPlayers = buildLineupPayload(contracts, state);

    if (payloadPlayers.length !== 11) {
      setLineupError("Each team must have exactly 11 starters selected.");
      setLineupSuccess(null);
      return;
    }

    saveLineup.mutate({
      matchId,
      teamId: isHome ? match.homeTeamId : match.awayTeamId,
      players: payloadPlayers,
    });
  };

  const applyAdditionalMinutes = (minutesToAdd: number) => {
    if (match.status !== "live" && match.status !== "half_time") return;
    if (!Number.isFinite(minutesToAdd) || minutesToAdd <= 0) return;

    updateMatch.mutate({
      currentMinute: (match.currentMinute ?? 0) + minutesToAdd,
    });
  };

  const saveStatsForTeam = (team: "home" | "away") => {
    if (match.status === "scheduled") {
      setStatsError("Stats can only be updated after kickoff.");
      setStatsSuccess(null);
      return;
    }

    const isHome = team === "home";
    const draft = sanitizeStatsDraft(isHome ? homeStatsDraft : awayStatsDraft);

    saveStats.mutate({
      matchId,
      teamId: isHome ? match.homeTeamId : match.awayTeamId,
      ...draft,
    });
  };

  const setPossessionTeam = (teamId: string | null) => {
    if (match.status !== "live" && match.status !== "half_time") {
      setPossessionError("Possession can be tracked only while match is active.");
      setPossessionSuccess(null);
      return;
    }

    updatePossession.mutate({
      matchId,
      teamId,
      second: Math.max(0, (match.currentMinute ?? 0) * 60),
      source: "manual",
    });
  };

  const updateStatsDraftField = (
    team: "home" | "away",
    field: keyof MatchStatsDraft,
    value: string,
  ) => {
    const parsed = value.trim() === "" ? undefined : Number.parseInt(value, 10);
    const nextValue = Number.isNaN(parsed as number) ? undefined : parsed;

    if (team === "home") {
      setHomeStatsDraft((prev) => ({ ...prev, [field]: nextValue }));
      return;
    }
    setAwayStatsDraft((prev) => ({ ...prev, [field]: nextValue }));
  };

  const sortedEvents = useMemo(() => {
    return [...(match.events ?? [])].sort((a, b) => {
      if (a.minute !== b.minute) return a.minute - b.minute;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }, [match.events]);

  const activePossession = useMemo(
    () => possessionRows.find((entry) => entry.endSecond == null) ?? null,
    [possessionRows],
  );

  const savedHomeLineup = useMemo(
    () =>
      (match.lineups ?? [])
        .filter((lineup) => lineup.teamId === match.homeTeamId)
        .sort((a, b) => {
          const aNum = a.jerseyNumber ?? 999;
          const bNum = b.jerseyNumber ?? 999;
          return aNum - bNum;
        }),
    [match.lineups, match.homeTeamId],
  );

  const savedAwayLineup = useMemo(
    () =>
      (match.lineups ?? [])
        .filter((lineup) => lineup.teamId === match.awayTeamId)
        .sort((a, b) => {
          const aNum = a.jerseyNumber ?? 999;
          const bNum = b.jerseyNumber ?? 999;
          return aNum - bNum;
        }),
    [match.lineups, match.awayTeamId],
  );

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

        {(match.status === "live" || match.status === "half_time") && (
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <Timer className="w-4 h-4" />
            <LiveMinutePulse minute={match.currentMinute ?? 0} />
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-2">
        <div className="grid grid-cols-3 gap-2">
          {([
            { id: "overview", label: "Overview", icon: Timer },
            { id: "lineups", label: "Lineups", icon: Users },
            { id: "stats", label: "Stats", icon: BarChart3 },
          ] as Array<{ id: TabKey; label: string; icon: any }>).map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  active
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    : "bg-slate-900/40 text-slate-300 border border-slate-700 hover:bg-slate-800/70"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* MATCH CONTROL */}
      {activeTab === "overview" && canControl && (
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
      {activeTab === "overview" && canControl && match.status === "live" && (
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

      {activeTab === "overview" &&
      canControl &&
      (match.status === "live" || match.status === "half_time") ? (
        <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-100">Additional Time</h3>
            <span className="text-xs text-slate-400">
              Use for stoppage/injury time
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <SecondaryButton onClick={() => applyAdditionalMinutes(1)}>
              +1 min
            </SecondaryButton>
            <SecondaryButton onClick={() => applyAdditionalMinutes(2)}>
              +2 min
            </SecondaryButton>
            <SecondaryButton onClick={() => applyAdditionalMinutes(5)}>
              +5 min
            </SecondaryButton>
            <input
              type="number"
              min={1}
              value={additionalMinutes}
              onChange={(e) => setAdditionalMinutes(Number(e.target.value) || 1)}
              className="w-20 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200"
            />
            <PrimaryButton onClick={() => applyAdditionalMinutes(additionalMinutes)}>
              Apply Minutes
            </PrimaryButton>
          </div>
        </div>
      ) : null}

      {activeTab === "overview" &&
      canControl &&
      (match.status === "live" || match.status === "half_time") ? (
        <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-100">Possession Tracking</h3>
            <span className="text-xs text-slate-400">
              Active:{" "}
              {activePossession
                ? activePossession.teamId === match.homeTeamId
                  ? match.homeTeam.name
                  : match.awayTeam.name
                : "No team"}
            </span>
          </div>

          {possessionError ? (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
              {possessionError}
            </div>
          ) : null}

          {possessionSuccess ? (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
              {possessionSuccess}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <PrimaryButton
              onClick={() => setPossessionTeam(match.homeTeamId)}
              loading={updatePossession.isPending}
            >
              {match.homeTeam.name} In Possession
            </PrimaryButton>
            <SecondaryButton
              onClick={() => setPossessionTeam(match.awayTeamId)}
              disabled={updatePossession.isPending}
            >
              {match.awayTeam.name} In Possession
            </SecondaryButton>
            <SecondaryButton
              onClick={() => setPossessionTeam(null)}
              disabled={updatePossession.isPending}
            >
              Stop Possession
            </SecondaryButton>
          </div>
        </div>
      ) : null}

      {/* TEAM & PLAYER PICKER */}
      {activeTab === "overview" && canControl && match.status !== "scheduled" && (
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

      {activeTab === "overview" && eventError ? (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {eventError}
        </div>
      ) : null}

      {/* LINEUPS TAB */}
      {activeTab === "lineups" && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-100">Saved Lineups</h3>
              <span className="text-xs text-slate-400">
                Official submitted starters
              </span>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <div className="rounded-xl border border-slate-700 p-4">
                <p className="mb-3 font-semibold text-slate-100">
                  {match.homeTeam.name}
                </p>
                {savedHomeLineup.length === 0 ? (
                  <p className="text-sm text-slate-400">No lineup submitted yet.</p>
                ) : (
                  <ul className="space-y-2 text-sm">
                    {savedHomeLineup.map((entry) => (
                      <li
                        key={entry.id}
                        className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/50 px-3 py-2"
                      >
                        <span className="text-slate-200">
                          {entry.player?.fullName ?? entry.playerId}
                        </span>
                        <span className="text-slate-400">
                          {entry.position}
                          {entry.jerseyNumber ? ` #${entry.jerseyNumber}` : ""}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="rounded-xl border border-slate-700 p-4">
                <p className="mb-3 font-semibold text-slate-100">
                  {match.awayTeam.name}
                </p>
                {savedAwayLineup.length === 0 ? (
                  <p className="text-sm text-slate-400">No lineup submitted yet.</p>
                ) : (
                  <ul className="space-y-2 text-sm">
                    {savedAwayLineup.map((entry) => (
                      <li
                        key={entry.id}
                        className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/50 px-3 py-2"
                      >
                        <span className="text-slate-200">
                          {entry.player?.fullName ?? entry.playerId}
                        </span>
                        <span className="text-slate-400">
                          {entry.position}
                          {entry.jerseyNumber ? ` #${entry.jerseyNumber}` : ""}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {canControl ? (
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between gap-4">
            <h3 className="font-bold text-slate-100">Team Lineups</h3>
            <span className="text-xs text-slate-400">
              Select exactly 11 starters per team
            </span>
          </div>

          {lineupError ? (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
              {lineupError}
            </div>
          ) : null}

          {lineupSuccess ? (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
              {lineupSuccess}
            </div>
          ) : null}

          <div className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-700 p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-semibold text-slate-100">{match.homeTeam.name}</p>
                <p className="text-xs text-slate-400">
                  Starters:{" "}
                  {
                    homeEligibleContracts.filter(
                      (contract) => homeLineup[contract.playerId]?.selected,
                    ).length
                  }
                  /11
                </p>
              </div>

              <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                {homeEligibleContracts.map((contract) => {
                  const state = homeLineup[contract.playerId];
                  const selected = state?.selected ?? false;
                  const position = state?.position ?? contract.position ?? "";
                  const jerseyNumber =
                    state?.jerseyNumber ?? contract.jerseyNumber ?? undefined;

                  return (
                    <div
                      key={contract.id}
                      className="grid grid-cols-[auto_1fr_90px_70px] items-center gap-2 rounded-lg bg-slate-800/60 p-2"
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={(e) =>
                          updateTeamLineup(
                            "home",
                            contract.playerId,
                            { selected: e.target.checked },
                            {
                              position: contract.position,
                              jerseyNumber: contract.jerseyNumber ?? undefined,
                            },
                          )
                        }
                        className="h-4 w-4"
                      />
                      <p className="truncate text-sm text-slate-200">
                        {contract.player?.fullName ?? contract.playerId}
                      </p>
                      <input
                        value={position}
                        onChange={(e) =>
                          updateTeamLineup(
                            "home",
                            contract.playerId,
                            { position: e.target.value },
                            {
                              position: contract.position,
                              jerseyNumber: contract.jerseyNumber ?? undefined,
                            },
                          )
                        }
                        className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-200"
                        placeholder="POS"
                      />
                      <input
                        type="number"
                        min={1}
                        max={99}
                        value={jerseyNumber ?? ""}
                        onChange={(e) =>
                          updateTeamLineup(
                            "home",
                            contract.playerId,
                            {
                              jerseyNumber: e.target.value
                                ? Number(e.target.value)
                                : undefined,
                            },
                            {
                              position: contract.position,
                              jerseyNumber: contract.jerseyNumber ?? undefined,
                            },
                          )
                        }
                        className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-200"
                        placeholder="#"
                      />
                    </div>
                  );
                })}
              </div>

              <div className="mt-4">
                <PrimaryButton
                  onClick={() => submitLineup("home")}
                  loading={saveLineup.isPending}
                  disabled={match.status !== "scheduled"}
                >
                  Save Home Lineup
                </PrimaryButton>
              </div>
            </div>

            <div className="rounded-xl border border-slate-700 p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-semibold text-slate-100">{match.awayTeam.name}</p>
                <p className="text-xs text-slate-400">
                  Starters:{" "}
                  {
                    awayEligibleContracts.filter(
                      (contract) => awayLineup[contract.playerId]?.selected,
                    ).length
                  }
                  /11
                </p>
              </div>

              <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                {awayEligibleContracts.map((contract) => {
                  const state = awayLineup[contract.playerId];
                  const selected = state?.selected ?? false;
                  const position = state?.position ?? contract.position ?? "";
                  const jerseyNumber =
                    state?.jerseyNumber ?? contract.jerseyNumber ?? undefined;

                  return (
                    <div
                      key={contract.id}
                      className="grid grid-cols-[auto_1fr_90px_70px] items-center gap-2 rounded-lg bg-slate-800/60 p-2"
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={(e) =>
                          updateTeamLineup(
                            "away",
                            contract.playerId,
                            { selected: e.target.checked },
                            {
                              position: contract.position,
                              jerseyNumber: contract.jerseyNumber ?? undefined,
                            },
                          )
                        }
                        className="h-4 w-4"
                      />
                      <p className="truncate text-sm text-slate-200">
                        {contract.player?.fullName ?? contract.playerId}
                      </p>
                      <input
                        value={position}
                        onChange={(e) =>
                          updateTeamLineup(
                            "away",
                            contract.playerId,
                            { position: e.target.value },
                            {
                              position: contract.position,
                              jerseyNumber: contract.jerseyNumber ?? undefined,
                            },
                          )
                        }
                        className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-200"
                        placeholder="POS"
                      />
                      <input
                        type="number"
                        min={1}
                        max={99}
                        value={jerseyNumber ?? ""}
                        onChange={(e) =>
                          updateTeamLineup(
                            "away",
                            contract.playerId,
                            {
                              jerseyNumber: e.target.value
                                ? Number(e.target.value)
                                : undefined,
                            },
                            {
                              position: contract.position,
                              jerseyNumber: contract.jerseyNumber ?? undefined,
                            },
                          )
                        }
                        className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-200"
                        placeholder="#"
                      />
                    </div>
                  );
                })}
              </div>

              <div className="mt-4">
                <PrimaryButton
                  onClick={() => submitLineup("away")}
                  loading={saveLineup.isPending}
                  disabled={match.status !== "scheduled"}
                >
                  Save Away Lineup
                </PrimaryButton>
              </div>
            </div>
          </div>
        </div>
          ) : null}
      </div>
      )}

      {activeTab === "stats" ? (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-100">Match Stats</h3>
              <span className="text-xs text-slate-400">
                Edit official team stats for this match
              </span>
            </div>

            {statsError ? (
              <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                {statsError}
              </div>
            ) : null}

            {statsSuccess ? (
              <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                {statsSuccess}
              </div>
            ) : null}

            <div className="mt-5 grid gap-5 lg:grid-cols-2">
              <div className="rounded-xl border border-slate-700 p-4 space-y-4">
                <h4 className="font-semibold text-slate-100">{match.homeTeam.name}</h4>
                <div className="grid grid-cols-2 gap-3">
                  {([
                    { key: "possession", label: "Possession (%)", min: 0, max: 100 },
                    { key: "shotsOnTarget", label: "Shots On Target", min: 0, max: undefined },
                    { key: "shotsOffTarget", label: "Shots Off Target", min: 0, max: undefined },
                    { key: "corners", label: "Corners", min: 0, max: undefined },
                    { key: "fouls", label: "Fouls", min: 0, max: undefined },
                    { key: "yellowCards", label: "Yellow Cards", min: 0, max: undefined },
                    { key: "redCards", label: "Red Cards", min: 0, max: undefined },
                    { key: "saves", label: "Saves", min: 0, max: undefined },
                    { key: "passAccuracy", label: "Pass Accuracy (%)", min: 0, max: 100 },
                  ] as Array<{ key: keyof MatchStatsDraft; label: string; min: number; max?: number }>).map((field) => (
                    <label key={field.key} className="text-xs text-slate-400 space-y-1">
                      <span>{field.label}</span>
                      <input
                        type="number"
                        min={field.min}
                        max={field.max}
                        value={homeStatsDraft[field.key] ?? ""}
                        onChange={(e) => updateStatsDraftField("home", field.key, e.target.value)}
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200"
                      />
                    </label>
                  ))}
                </div>
                <PrimaryButton
                  onClick={() => saveStatsForTeam("home")}
                  loading={saveStats.isPending}
                >
                  Save Home Stats
                </PrimaryButton>
              </div>

              <div className="rounded-xl border border-slate-700 p-4 space-y-4">
                <h4 className="font-semibold text-slate-100">{match.awayTeam.name}</h4>
                <div className="grid grid-cols-2 gap-3">
                  {([
                    { key: "possession", label: "Possession (%)", min: 0, max: 100 },
                    { key: "shotsOnTarget", label: "Shots On Target", min: 0, max: undefined },
                    { key: "shotsOffTarget", label: "Shots Off Target", min: 0, max: undefined },
                    { key: "corners", label: "Corners", min: 0, max: undefined },
                    { key: "fouls", label: "Fouls", min: 0, max: undefined },
                    { key: "yellowCards", label: "Yellow Cards", min: 0, max: undefined },
                    { key: "redCards", label: "Red Cards", min: 0, max: undefined },
                    { key: "saves", label: "Saves", min: 0, max: undefined },
                    { key: "passAccuracy", label: "Pass Accuracy (%)", min: 0, max: 100 },
                  ] as Array<{ key: keyof MatchStatsDraft; label: string; min: number; max?: number }>).map((field) => (
                    <label key={field.key} className="text-xs text-slate-400 space-y-1">
                      <span>{field.label}</span>
                      <input
                        type="number"
                        min={field.min}
                        max={field.max}
                        value={awayStatsDraft[field.key] ?? ""}
                        onChange={(e) => updateStatsDraftField("away", field.key, e.target.value)}
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200"
                      />
                    </label>
                  ))}
                </div>
                <PrimaryButton
                  onClick={() => saveStatsForTeam("away")}
                  loading={saveStats.isPending}
                >
                  Save Away Stats
                </PrimaryButton>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* INCIDENT PANEL */}
      {activeTab === "overview" && canControl && match.status !== "scheduled" && (
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
      {activeTab === "overview" && (
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6">
        <h3 className="font-bold text-slate-100 mb-4">
          Match Timeline
        </h3>

        {sortedEvents.length === 0 ? (
          <p className="text-slate-500 text-sm">
            No events recorded yet.
          </p>
        ) : (
          <ul className="space-y-2 text-sm">
            {sortedEvents.map((e) => {
              const isHomeEvent = e.teamId === match.homeTeamId;
              const playerName = e.player?.fullName ?? e.playerId ?? "—";
              const eventLabel = formatEventLabel(e.eventType);

              return (
              <li
                key={e.id}
                className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 border-b border-slate-800 pb-2"
              >
                <div className="text-left">
                  {isHomeEvent ? (
                    <>
                      <p className="text-slate-200">
                        {eventLabel}
                      </p>
                      <p className="text-slate-500">
                        {playerName}
                      </p>
                    </>
                  ) : null}
                </div>

                <span className="text-slate-300 font-medium">
                  {e.minute}&apos;
                </span>

                <div className="text-right">
                  {!isHomeEvent ? (
                    <>
                      <p className="text-slate-200">
                        {eventLabel}
                      </p>
                      <p className="text-slate-500">
                        {playerName}
                      </p>
                    </>
                  ) : null}
                </div>
              </li>
              );
            })}
          </ul>
        )}
      </div>
      )}
    </div>
  );
}

"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

import { matchesService } from "@/services/matches/matches.service";
import { matchEventsService } from "@/services/match-events/match-events.service";
import { playerContractsService } from "@/services/player-contracts/player-contracts.service";
import { lineupsService } from "@/services/lineups/lineups.service";

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
import type { PlayerContract } from "@/services/player-contracts/types";

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

export default function MatchAdminPage() {
  const { matchId } = useParams<{ matchId: string }>();
  const queryClient = useQueryClient();

  const [autoTicker, setAutoTicker] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [eventError, setEventError] = useState<string | null>(null);
  const [lineupError, setLineupError] = useState<string | null>(null);
  const [lineupSuccess, setLineupSuccess] = useState<string | null>(null);
  const [homeLineup, setHomeLineup] = useState<
    Record<string, { selected: boolean; position: string; jerseyNumber?: number }>
  >({});
  const [awayLineup, setAwayLineup] = useState<
    Record<string, { selected: boolean; position: string; jerseyNumber?: number }>
  >({});

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

  const sortedEvents = useMemo(() => {
    return [...(match.events ?? [])].sort((a, b) => {
      if (a.minute !== b.minute) return a.minute - b.minute;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }, [match.events]);

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

      {/* LINEUPS */}
      {canControl && (
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
      )}

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

        {sortedEvents.length === 0 ? (
          <p className="text-slate-500 text-sm">
            No events recorded yet.
          </p>
        ) : (
          <ul className="space-y-2 text-sm">
            {sortedEvents.map((e) => {
              const isHomeEvent = e.teamId === match.homeTeamId;
              const playerName = e.player?.fullName ?? e.playerId ?? "—";
              const eventLabel = e.eventType.replace(/_/g, " ");

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
    </div>
  );
}

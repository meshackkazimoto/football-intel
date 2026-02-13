"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { playersService } from "@/services/players/players.service";
import { playerContractsService } from "@/services/player-contracts/player-contracts.service";
import { seasonsService } from "@/services/seasons/seasons.service";
import { teamsService } from "@/services/teams/teams.service";
import { Plus, Edit, Trash2, Loader2, User, Link2, ShieldMinus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { CreatePlayerInput, Player } from "@/services/players/types";
import { createPlayerSchema } from "@/services/players/validation";
import { SearchInput } from "@/components/ui/search";
import { FormInput } from "@/components/ui/input";
import { FormSelect } from "@/components/ui/select";
import { PrimaryButton, SecondaryButton } from "@/components/ui/button";
import { FormSection } from "@/components/ui/form-section";
import { Modal } from "@/components/ui/modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PlayerContract } from "@/services/player-contracts/types";

function getApiErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.error ?? fallback;
  }
  return fallback;
}

export default function PlayersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [contractSeasonId, setContractSeasonId] = useState("");
  const [contractTeamId, setContractTeamId] = useState("");
  const [contractPosition, setContractPosition] = useState("");
  const [contractJerseyNumber, setContractJerseyNumber] = useState("");
  const [contractStartDate, setContractStartDate] = useState("");
  const [contractEndDate, setContractEndDate] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["players", searchQuery],
    queryFn: () =>
      playersService.getPlayers(searchQuery ? { search: searchQuery } : {}),
  });

  const { data: seasons } = useQuery({
    queryKey: ["seasons"],
    queryFn: () => seasonsService.getSeasons(),
  });

  const { data: contractTeams } = useQuery({
    queryKey: ["teams-for-contract", contractSeasonId],
    queryFn: () => teamsService.getTeams(contractSeasonId),
    enabled: !!contractSeasonId,
  });

  const {
    data: playerContracts,
    isLoading: isLoadingContracts,
  } = useQuery({
    queryKey: ["player-contracts", selectedPlayer?.id],
    queryFn: () =>
      playerContractsService.getContracts({ playerId: selectedPlayer!.id }),
    enabled: !!selectedPlayer,
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
      setActionError(null);
    },
    onError: (err) => {
      setActionError(
        getApiErrorMessage(
          err,
          "Could not delete player. Terminate contracts first.",
        ),
      );
    },
  });

  const createContractMutation = useMutation({
    mutationFn: playerContractsService.createContract,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["player-contracts", selectedPlayer?.id] });
      await queryClient.invalidateQueries({ queryKey: ["players"] });
      setContractTeamId("");
      setContractPosition("");
      setContractJerseyNumber("");
      setContractStartDate("");
      setContractEndDate("");
      setActionError(null);
    },
    onError: (err) => {
      setActionError(
        getApiErrorMessage(
          err,
          "Could not assign player to team. Check contract dates and overlaps.",
        ),
      );
    },
  });

  const terminateContractMutation = useMutation({
    mutationFn: playerContractsService.deleteContract,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["player-contracts", selectedPlayer?.id] });
      await queryClient.invalidateQueries({ queryKey: ["players"] });
      setActionError(null);
    },
    onError: (err) => {
      setActionError(
        getApiErrorMessage(
          err,
          "Could not terminate contract.",
        ),
      );
    },
  });

  const onSubmit = (formData: CreatePlayerInput) => {
    createMutation.mutate(formData);
  };

  const openManageContracts = (player: Player) => {
    setSelectedPlayer(player);
    setContractSeasonId("");
    setContractTeamId("");
    setContractPosition("");
    setContractJerseyNumber("");
    setContractStartDate("");
    setContractEndDate("");
    setActionError(null);
  };

  const closeManageContracts = () => {
    setSelectedPlayer(null);
    setActionError(null);
  };

  const submitContractAssignment = () => {
    if (!selectedPlayer) return;
    if (!contractTeamId || !contractPosition || !contractStartDate) {
      setActionError("Team, position and start date are required.");
      return;
    }

    createContractMutation.mutate({
      playerId: selectedPlayer.id,
      teamId: contractTeamId,
      position: contractPosition,
      jerseyNumber: contractJerseyNumber ? Number(contractJerseyNumber) : undefined,
      startDate: contractStartDate,
      endDate: contractEndDate || undefined,
    });
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

        <PrimaryButton onClick={() => setShowCreateForm(!showCreateForm)}>
          <Plus className="w-4 h-4" />
          Register Player
        </PrimaryButton>
      </div>

      {/* Search */}
      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search players by name..."
      />

      {actionError && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {actionError}
        </div>
      )}

      {/* Create Player Form */}
      {showCreateForm && (
        <FormSection title="Register New Player">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-2 gap-4"
          >
            <div className="col-span-2">
              <FormInput
                label="Full Name *"
                {...register("fullName")}
                error={errors.fullName}
              />
            </div>

            <FormInput
              label="First Name"
              {...register("firstName")}
              error={errors.firstName}
            />

            <FormInput
              label="Last Name"
              {...register("lastName")}
              error={errors.lastName}
            />

            <FormInput
              label="Date of Birth"
              type="date"
              {...register("dateOfBirth")}
              error={errors.dateOfBirth}
            />

            <FormInput
              label="Nationality ID"
              {...register("nationalityId")}
              error={errors.nationalityId}
            />

            <FormSelect
              label="Preferred Foot"
              {...register("preferredFoot")}
              options={[
                { label: "Left", value: "left" },
                { label: "Right", value: "right" },
                { label: "Both", value: "both" },
              ]}
              error={errors.preferredFoot}
            />

            <FormInput
              label="Height (cm)"
              type="number"
              {...register("height", { valueAsNumber: true })}
              error={errors.height}
            />

            <div className="col-span-2 flex gap-3">
              <PrimaryButton type="submit" loading={createMutation.isPending}>
                {createMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Register Player"
                )}
              </PrimaryButton>

              <SecondaryButton
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  reset();
                  setActionError(null);
                }}
              >
                Cancel
              </SecondaryButton>
            </div>
          </form>
        </FormSection>
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
          <Table>
            <TableHeader>
              <TableRow>
                {[
                  "Player",
                  "Club",
                  "Position",
                  "Nationality",
                  "Jersey",
                  "Actions",
                ].map((h) => (
                  <TableHead key={h}>{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {data?.data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-slate-400"
                  >
                    No players found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                data?.data.map((player: Player) => (
                  <TableRow
                    key={player.id}
                    className="hover:bg-slate-800/60 transition-colors"
                  >
                    <TableCell>
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
                    </TableCell>

                    <TableCell className="text-slate-300">{"—"}</TableCell>

                    <TableCell className="text-slate-400">{"—"}</TableCell>

                    <TableCell className="text-slate-400">
                      {player.nationality?.name ?? "-"}
                    </TableCell>

                    <TableCell className="text-slate-400">{"—"}</TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-emerald-500">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openManageContracts(player)}
                          className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-cyan-400"
                          title="Assign or terminate contract"
                        >
                          <Link2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteMutation.mutate(player.id)}
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

      <Modal
        open={!!selectedPlayer}
        onClose={closeManageContracts}
        title={selectedPlayer ? `Manage Team Assignment: ${selectedPlayer.fullName}` : undefined}
      >
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-bold text-slate-200 mb-3">
              Existing Contracts
            </h4>
            {isLoadingContracts ? (
              <div className="flex items-center gap-2 text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading contracts...
              </div>
            ) : !playerContracts?.length ? (
              <p className="text-sm text-slate-400">No contracts found.</p>
            ) : (
              <div className="space-y-2">
                {playerContracts.map((contract: PlayerContract) => (
                  <div
                    key={contract.id}
                    className="rounded-lg border border-slate-700 bg-slate-800/70 px-3 py-2"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-100">
                          {contract.team?.name ?? contract.teamId}
                          {contract.isCurrent ? (
                            <span className="ml-2 rounded bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-300">
                              Current
                            </span>
                          ) : null}
                        </p>
                        <p className="text-xs text-slate-400">
                          {contract.position}
                          {contract.jerseyNumber ? ` • #${contract.jerseyNumber}` : ""}
                          {" • "}
                          {contract.startDate} to {contract.endDate ?? "present"}
                        </p>
                      </div>
                      {contract.isCurrent ? (
                        <button
                          onClick={() => terminateContractMutation.mutate(contract.id)}
                          disabled={terminateContractMutation.isPending}
                          className="inline-flex items-center gap-1 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 disabled:opacity-50"
                        >
                          <ShieldMinus className="h-3.5 w-3.5" />
                          Terminate
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-slate-700 pt-4 space-y-3">
            <h4 className="text-sm font-bold text-slate-200">Assign To Team</h4>
            <div className="grid grid-cols-2 gap-3">
              <FormSelect
                label="Season *"
                value={contractSeasonId}
                onChange={(e) => {
                  setContractSeasonId(e.target.value);
                  setContractTeamId("");
                }}
                options={
                  seasons?.data.map((season) => ({
                    label: `${season.name} (${season.league.name})`,
                    value: season.id,
                  })) ?? []
                }
              />

              <FormSelect
                label="Team *"
                value={contractTeamId}
                onChange={(e) => setContractTeamId(e.target.value)}
                options={
                  contractTeams?.data.map((team) => ({
                    label: team.name,
                    value: team.id,
                  })) ?? []
                }
                disabled={!contractSeasonId}
              />

              <FormInput
                label="Position *"
                value={contractPosition}
                onChange={(e) => setContractPosition(e.target.value)}
                placeholder="GK, DF, MF, FW"
              />

              <FormInput
                label="Jersey Number"
                type="number"
                min={1}
                max={99}
                value={contractJerseyNumber}
                onChange={(e) => setContractJerseyNumber(e.target.value)}
              />

              <FormInput
                label="Start Date *"
                type="date"
                value={contractStartDate}
                onChange={(e) => setContractStartDate(e.target.value)}
              />

              <FormInput
                label="End Date"
                type="date"
                value={contractEndDate}
                onChange={(e) => setContractEndDate(e.target.value)}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <PrimaryButton
                type="button"
                onClick={submitContractAssignment}
                loading={createContractMutation.isPending}
              >
                Assign Team
              </PrimaryButton>
              <SecondaryButton type="button" onClick={closeManageContracts}>
                Close
              </SecondaryButton>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

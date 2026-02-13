"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { standingsService } from "@/services/standings/standings.service";
import { seasonsService } from "@/services/seasons/seasons.service";
import { teamsService } from "@/services/teams/teams.service";
import {
  Plus,
  Loader2,
  Trophy,
  Edit,
  Trash2,
  Save,
  X,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createStandingSchema,
  updateStandingSchema,
} from "@/services/standings/validation";
import type {
  CreateStandingInput,
  Standing,
  UpdateStandingInput,
} from "@/services/standings/types";
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
import { cn } from "@/lib/utils";

export default function StandingsPage() {
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch Seasons
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

  // Fetch Standings
  const {
    data: standingsResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["standings", effectiveSeasonId],
    queryFn: () => standingsService.getStandings(effectiveSeasonId),
    enabled: !!effectiveSeasonId,
  });

  // Fetch Teams for dropdown (only when creating)
  const { data: teamsResponse } = useQuery({
    queryKey: ["teams", effectiveSeasonId],
    queryFn: () => teamsService.getTeams(effectiveSeasonId),
    enabled: !!effectiveSeasonId && showCreateForm,
  });

  const standings = standingsResponse?.data ?? [];
  const teams = teamsResponse?.data ?? [];

  // Create Form
  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    reset: resetCreate,
    setValue: setValueCreate,
    formState: { errors: errorsCreate },
  } = useForm<CreateStandingInput>({
    resolver: zodResolver(createStandingSchema),
    defaultValues: {
      seasonId: "",
      teamId: "",
      position: 1,
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
      pointsDeduction: 0,
    },
  });

  useEffect(() => {
    registerCreate("seasonId");
  }, [registerCreate]);

  useEffect(() => {
    if (!effectiveSeasonId) return;
    setValueCreate("seasonId", effectiveSeasonId, {
      shouldValidate: true,
      shouldDirty: false,
    });
  }, [effectiveSeasonId, setValueCreate]);

  const createMutation = useMutation({
    mutationFn: standingsService.createStanding,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["standings"] });
      setShowCreateForm(false);
      resetCreate();
    },
  });

  const createErrorMessage =
    (createMutation.error as any)?.response?.data?.error ??
    (createMutation.error as any)?.message;

  const onCreateSubmit = (data: CreateStandingInput) => {
    createMutation.mutate(data);
  };

  // Edit Logic
  const deleteMutation = useMutation({
    mutationFn: standingsService.deleteStanding,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["standings"] });
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">
            League Standings
          </h1>
          <p className="text-slate-400 mt-1">
            Manage tables, points, and rankings.
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

          <PrimaryButton
            onClick={() => {
              setShowCreateForm((prev) => !prev);
              if (!showCreateForm && effectiveSeasonId) {
                resetCreate({
                  seasonId: effectiveSeasonId,
                  teamId: "",
                  position: 1,
                  played: 0,
                  wins: 0,
                  draws: 0,
                  losses: 0,
                  goalsFor: 0,
                  goalsAgainst: 0,
                  goalDifference: 0,
                  points: 0,
                  pointsDeduction: 0,
                });
              }
            }}
            disabled={!effectiveSeasonId}
          >
            <Plus className="w-4 h-4" />
            Add Team
          </PrimaryButton>
        </div>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <FormSection title="Add Team to Standings">
          {createMutation.isError && createErrorMessage && (
            <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
              {createErrorMessage}
            </div>
          )}
          <form
            onSubmit={handleSubmitCreate(onCreateSubmit)}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <div className="col-span-2 md:col-span-2">
              <FormSelect
                label="Team *"
                {...registerCreate("teamId")}
                error={errorsCreate.teamId}
                options={teams.map((t) => ({
                  label: t.name,
                  value: t.id,
                }))}
              />
            </div>

            <FormInput
              label="Position"
              type="number"
              {...registerCreate("position", { valueAsNumber: true })}
              error={errorsCreate.position}
            />

            <FormInput
              label="Played"
              type="number"
              {...registerCreate("played", { valueAsNumber: true })}
              error={errorsCreate.played}
            />

            <FormInput
              label="Wins"
              type="number"
              {...registerCreate("wins", { valueAsNumber: true })}
              error={errorsCreate.wins}
            />

            <FormInput
              label="Draws"
              type="number"
              {...registerCreate("draws", { valueAsNumber: true })}
              error={errorsCreate.draws}
            />

            <FormInput
              label="Losses"
              type="number"
              {...registerCreate("losses", { valueAsNumber: true })}
              error={errorsCreate.losses}
            />

            <FormInput
              label="GF"
              type="number"
              {...registerCreate("goalsFor", { valueAsNumber: true })}
              error={errorsCreate.goalsFor}
            />

            <FormInput
              label="GA"
              type="number"
              {...registerCreate("goalsAgainst", { valueAsNumber: true })}
              error={errorsCreate.goalsAgainst}
            />

            <FormInput
              label="GD"
              type="number"
              {...registerCreate("goalDifference", { valueAsNumber: true })}
              error={errorsCreate.goalDifference}
            />

            <FormInput
              label="Points"
              type="number"
              {...registerCreate("points", { valueAsNumber: true })}
              error={errorsCreate.points}
            />

            <div className="col-span-2 md:col-span-4 flex gap-3 mt-4">
              <PrimaryButton type="submit" loading={createMutation.isPending}>
                Add to Table
              </PrimaryButton>
              <SecondaryButton
                type="button"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </SecondaryButton>
            </div>
          </form>
        </FormSection>
      )}

      {/* Standings Table */}
      {!effectiveSeasonId ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-slate-900 border border-slate-700 rounded-2xl">
          <Trophy className="w-12 h-12 mb-4 opacity-50" />
          <p className="text-lg font-bold">No Season Selected</p>
          <p className="text-sm">Please select a season to view table.</p>
        </div>
      ) : isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      ) : error ? (
        <div className="bg-slate-900 border border-rose-500/30 rounded-2xl p-6">
          <p className="text-rose-400 text-center font-bold">
            Failed to load standings
          </p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Pos</TableHead>
                <TableHead>Team</TableHead>
                <TableHead className="w-16 text-center">P</TableHead>
                <TableHead className="w-16 text-center">W</TableHead>
                <TableHead className="w-16 text-center">D</TableHead>
                <TableHead className="w-16 text-center">L</TableHead>
                <TableHead className="w-16 text-center">GF</TableHead>
                <TableHead className="w-16 text-center">GA</TableHead>
                <TableHead className="w-16 text-center">GD</TableHead>
                <TableHead className="w-16 text-center font-bold text-slate-100">
                  Pts
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {standings.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={11}
                    className="h-24 text-center text-slate-400"
                  >
                    No standings data found. Add teams to populate the table.
                  </TableCell>
                </TableRow>
              ) : (
                standings.map((row) => (
                  <EditableRow
                    key={row.id}
                    standing={row}
                    isEditing={editingId === row.id}
                    onDelete={() => deleteMutation.mutate(row.id)}
                    onEdit={() => setEditingId(row.id)}
                    onCancel={() => setEditingId(null)}
                    onSave={() => setEditingId(null)} // Handled inside component really
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

// Separate component for row to handle edit state and form independently
function EditableRow({
  standing,
  isEditing,
  onEdit,
  onCancel,
  onSave,
  onDelete,
}: {
  standing: Standing;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onDelete: () => void;
}) {
  const queryClient = useQueryClient();
  const { register, handleSubmit } = useForm<UpdateStandingInput>({
    defaultValues: {
      position: standing.position,
      played: standing.played,
      wins: standing.wins,
      draws: standing.draws,
      losses: standing.losses,
      goalsFor: standing.goalsFor,
      goalsAgainst: standing.goalsAgainst,
      goalDifference: standing.goalDifference,
      points: standing.points,
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateStandingInput) =>
      standingsService.updateStanding(standing.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["standings"] });
      onSave();
    },
  });

  if (isEditing) {
    return (
      <TableRow className="bg-slate-800/50">
        <TableCell>
          <input
            className="w-12 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-center"
            {...register("position", { valueAsNumber: true })}
          />
        </TableCell>
        <TableCell className="font-bold text-slate-200">
          {standing.team.name}
        </TableCell>
        <TableCell>
          <input
            className="w-12 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-center"
            {...register("played", { valueAsNumber: true })}
          />
        </TableCell>
        <TableCell>
          <input
            className="w-12 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-center"
            {...register("wins", { valueAsNumber: true })}
          />
        </TableCell>
        <TableCell>
          <input
            className="w-12 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-center"
            {...register("draws", { valueAsNumber: true })}
          />
        </TableCell>
        <TableCell>
          <input
            className="w-12 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-center"
            {...register("losses", { valueAsNumber: true })}
          />
        </TableCell>
        <TableCell>
          <input
            className="w-12 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-center"
            {...register("goalsFor", { valueAsNumber: true })}
          />
        </TableCell>
        <TableCell>
          <input
            className="w-12 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-center"
            {...register("goalsAgainst", { valueAsNumber: true })}
          />
        </TableCell>
        <TableCell>
          <input
            className="w-12 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-center"
            {...register("goalDifference", { valueAsNumber: true })}
          />
        </TableCell>
        <TableCell>
          <input
            className="w-12 bg-emerald-900/50 border border-emerald-500/50 rounded px-2 py-1 text-center font-bold text-emerald-400"
            {...register("points", { valueAsNumber: true })}
          />
        </TableCell>
        <TableCell className="text-right">
          <div className="flex justify-end gap-2">
            <button
              onClick={handleSubmit((data) => updateMutation.mutate(data))}
              disabled={updateMutation.isPending}
              className="p-2 bg-emerald-500/20 hover:bg-emerald-500/30 rounded text-emerald-400"
            >
              <Save className="w-4 h-4" />
            </button>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-slate-700 rounded text-slate-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow className="hover:bg-slate-800/50 transition-colors">
      <TableCell className="font-mono text-slate-500">
        {standing.position}
      </TableCell>
      <TableCell className="font-bold text-slate-200">
        <div className="flex items-center gap-2">
          {standing.position <= 4 && (
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          )}
          {standing.position > 17 && (
            <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          )}
          {standing.team.name}
        </div>
      </TableCell>
      <TableCell className="text-center text-slate-300">
        {standing.played}
      </TableCell>
      <TableCell className="text-center text-slate-400">
        {standing.wins}
      </TableCell>
      <TableCell className="text-center text-slate-400">
        {standing.draws}
      </TableCell>
      <TableCell className="text-center text-slate-400">
        {standing.losses}
      </TableCell>
      <TableCell className="text-center text-slate-400">
        {standing.goalsFor}
      </TableCell>
      <TableCell className="text-center text-slate-400">
        {standing.goalsAgainst}
      </TableCell>
      <TableCell
        className={cn(
          "text-center font-bold",
          standing.goalDifference > 0
            ? "text-emerald-400"
            : standing.goalDifference < 0
              ? "text-rose-400"
              : "text-slate-400",
        )}
      >
        {standing.goalDifference > 0 ? "+" : ""}
        {standing.goalDifference}
      </TableCell>
      <TableCell className="text-center font-bold text-emerald-400 text-lg">
        {standing.points}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <button
            onClick={onEdit}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-emerald-500 transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 hover:bg-rose-500/10 rounded-lg text-slate-400 hover:text-rose-500 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </TableCell>
    </TableRow>
  );
}

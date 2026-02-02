"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { seasonsService } from "@/services/seasons/seasons.service";
import { leaguesService } from "@/services/leagues/leagues.service";
import { Plus, Edit, Trash2, Loader2, Calendar } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { CreateSeasonInput, Season } from "@/services/seasons/types";
import { createSeasonSchema } from "@/services/seasons/validation";
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

export default function SeasonsPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const queryClient = useQueryClient();

  // Fetch Seasons
  const { data, isLoading, error } = useQuery({
    queryKey: ["seasons"],
    queryFn: () => seasonsService.getSeasons(),
  });

  // Fetch Leagues for dropdown
  const { data: leagues } = useQuery({
    queryKey: ["leagues"],
    queryFn: () => leaguesService.getLeagues(),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateSeasonInput>({
    resolver: zodResolver(createSeasonSchema),
  });

  const createMutation = useMutation({
    mutationFn: seasonsService.createSeason,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seasons"] });
      setShowCreateForm(false);
      reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: seasonsService.deleteSeason,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seasons"] });
    },
  });

  const onSubmit = (formData: CreateSeasonInput) => {
    createMutation.mutate(formData);
  };

  const seasonsList = data?.data ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">
            Seasons Management
          </h1>
          <p className="text-slate-400 mt-1">
            Manage league seasons, schedules, and active periods.
          </p>
        </div>

        <PrimaryButton onClick={() => setShowCreateForm(!showCreateForm)}>
          <Plus className="w-4 h-4" />
          Add Season
        </PrimaryButton>
      </div>

      {/* Create Season Form */}
      {showCreateForm && (
        <FormSection title="Create New Season">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-2 gap-4"
          >
            <FormSelect
              label="League *"
              {...register("leagueId")}
              error={errors.leagueId}
              options={
                leagues?.map((l) => ({
                  label: l.name,
                  value: l.id,
                })) ?? []
              }
            />

            <FormInput
              label="Season Name *"
              placeholder="e.g. 2024/2025"
              {...register("name")}
              error={errors.name}
            />

            <FormInput
              label="Start Date *"
              type="date"
              {...register("startDate")}
              error={errors.startDate}
            />

            <FormInput
              label="End Date *"
              type="date"
              {...register("endDate")}
              error={errors.endDate}
            />

            <div className="col-span-2 flex items-center gap-2">
              <input
                type="checkbox"
                id="isCurrent"
                {...register("isCurrent")}
                className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900"
              />
              <label htmlFor="isCurrent" className="text-sm text-slate-300">
                Set as Current Active Season
              </label>
            </div>

            <div className="col-span-2 flex gap-3 mt-4">
              <PrimaryButton type="submit" loading={createMutation.isPending}>
                {createMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Create Season"
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

      {/* Seasons Table */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      ) : error ? (
        <div className="bg-slate-900 border border-rose-500/30 rounded-2xl p-6">
          <p className="text-rose-400 text-center font-bold">
            Failed to load seasons
          </p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                {["Name", "League", "Duration", "Status", "Actions"].map(
                  (h) => (
                    <TableHead key={h}>{h}</TableHead>
                  ),
                )}
              </TableRow>
            </TableHeader>

            <TableBody>
              {seasonsList.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-slate-400"
                  >
                    No seasons found. Create one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                seasonsList.map((season: Season) => (
                  <TableRow
                    key={season.id}
                    className="hover:bg-slate-800/60 transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-100">
                            {season.name}
                          </p>
                          <p className="text-xs text-slate-400">
                            {new Date(season.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="text-slate-300">
                      {season.league?.name ?? "—"}
                    </TableCell>

                    <TableCell className="text-slate-400">
                      <div className="flex flex-col text-xs">
                        <span>Start: {season.startDate}</span>
                        <span>End: {season.endDate}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      {season.isCurrent ? (
                        <span className="inline-flex px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-xs font-bold">
                          ACTIVE
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 bg-slate-800 text-slate-400 rounded text-xs font-bold">
                          PAST
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-emerald-500">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteMutation.mutate(season.id)}
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
    </div>
  );
}

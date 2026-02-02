"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { leaguesService } from "@/services/leagues/leagues.service";
import { countriesService } from "@/services/countries/countries.service";
import { Plus, Edit, Trash2, Loader2, Trophy, MapPin } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { CreateLeagueInput, League } from "@/services/leagues/types";
import { createLeagueSchema } from "@/services/leagues/validation";
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

export default function LeaguesPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const queryClient = useQueryClient();

  // Fetch Leagues
  const {
    data: leagues,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["leagues"],
    queryFn: () => leaguesService.getLeagues(),
  });

  // Fetch Countries for dropdown
  const { data: countries } = useQuery({
    queryKey: ["countries"],
    queryFn: () => countriesService.getCountries(),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateLeagueInput>({
    resolver: zodResolver(createLeagueSchema),
    defaultValues: {
      type: "league",
      tier: 1,
    },
  });

  const createMutation = useMutation({
    mutationFn: leaguesService.createLeague,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leagues"] });
      setShowCreateForm(false);
      reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: leaguesService.deleteLeague,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leagues"] });
    },
  });

  const onSubmit = (formData: CreateLeagueInput) => {
    createMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">
            Leagues Management
          </h1>
          <p className="text-slate-400 mt-1">
            Manage football leagues, tournaments, and cups.
          </p>
        </div>

        <PrimaryButton onClick={() => setShowCreateForm(!showCreateForm)}>
          <Plus className="w-4 h-4" />
          Add League
        </PrimaryButton>
      </div>

      {/* Create League Form */}
      {showCreateForm && (
        <FormSection title="Create New League">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-2 gap-4"
          >
            <FormInput
              label="League Name *"
              placeholder="e.g. Premier League"
              {...register("name")}
              error={errors.name}
            />

            <FormInput
              label="Short Name"
              placeholder="e.g. EPL"
              {...register("shortName")}
              error={errors.shortName}
            />

            <FormSelect
              label="Country"
              {...register("countryId")}
              error={errors.countryId}
              options={
                countries?.map((c) => ({
                  label: `${c.name} (${c.code})`,
                  value: c.id,
                })) ?? []
              }
            />

            <FormInput
              label="Tier *"
              type="number"
              {...register("tier", { valueAsNumber: true })}
              error={errors.tier}
            />

            <FormSelect
              label="Type *"
              {...register("type")}
              error={errors.type}
              options={[
                { label: "League", value: "league" },
                { label: "Cup", value: "cup" },
              ]}
            />

            <FormInput
              label="Number of Teams"
              type="number"
              {...register("numberOfTeams", { valueAsNumber: true })}
              error={errors.numberOfTeams}
            />

            <div className="col-span-2">
              <FormInput
                label="Logo URL"
                placeholder="https://..."
                {...register("logo")}
                error={errors.logo}
              />
            </div>

            <div className="col-span-2 flex gap-3 mt-4">
              <PrimaryButton type="submit" loading={createMutation.isPending}>
                {createMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Create League"
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

      {/* Leagues Table */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      ) : error ? (
        <div className="bg-slate-900 border border-rose-500/30 rounded-2xl p-6">
          <p className="text-rose-400 text-center font-bold">
            Failed to load leagues
          </p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                {["Name", "Country", "Type", "Tier", "Teams", "Actions"].map(
                  (h) => (
                    <TableHead key={h}>{h}</TableHead>
                  ),
                )}
              </TableRow>
            </TableHeader>

            <TableBody>
              {leagues?.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-slate-400"
                  >
                    No leagues found. Create one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                leagues?.map((league: League) => (
                  <TableRow
                    key={league.id}
                    className="hover:bg-slate-800/60 transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                          <Trophy className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-100">
                            {league.name}
                          </p>
                          {league.shortName && (
                            <p className="text-xs text-slate-400">
                              {league.shortName}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="text-slate-300">
                      {countries?.find((c) => c.id === league.countryId)
                        ?.name ?? "—"}
                    </TableCell>

                    <TableCell className="text-slate-400 capitalize">
                      {league.type}
                    </TableCell>

                    <TableCell className="text-slate-400">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-800 text-slate-300">
                        Tier {league.tier}
                      </span>
                    </TableCell>

                    <TableCell className="text-slate-400">
                      {league.numberOfTeams ?? "—"}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-emerald-500">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteMutation.mutate(league.id)}
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

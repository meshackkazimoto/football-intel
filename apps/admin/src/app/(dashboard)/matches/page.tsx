"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { matchesService } from "@/services/matches/matches.service";
import { Plus, Calendar, MapPin, Edit, Trash2, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createMatchSchema,
  type CreateMatchInput,
} from "@/services/matches/types";
import { FormInput } from "@/components/ui/input";
import { FormSelect } from "@/components/ui/select";
import { PrimaryButton, SecondaryButton } from "@/components/ui/button";
import { FormSection } from "@/components/ui/form-section";

export default function MatchesPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["matches", statusFilter],
    queryFn: () =>
      matchesService.getMatches(
        statusFilter === "all" ? {} : { status: statusFilter },
      ),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateMatchInput>({
    resolver: zodResolver(createMatchSchema),
  });

  const createMutation = useMutation({
    mutationFn: matchesService.createMatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      setShowCreateForm(false);
      reset();
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

  const getStatusBadge = (status: string) => {
    const colors = {
      scheduled: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      live: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 animate-pulse",
      finished: "bg-slate-500/10 text-slate-600 border-slate-500/20",
      postponed: "bg-amber-500/10 text-amber-600 border-amber-500/20",
      cancelled: "bg-rose-500/10 text-rose-600 border-rose-500/20",
    };
    return colors[status as keyof typeof colors] || colors.scheduled;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Matches & Fixtures
          </h1>
          <p className="text-slate-500 mt-1">
            Manage match schedules, scores, and details.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl font-semibold text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="all">All Matches</option>
            <option value="scheduled">Scheduled</option>
            <option value="live">Live</option>
            <option value="finished">Finished</option>
            <option value="postponed">Postponed</option>
          </select>
          <PrimaryButton onClick={() => setShowCreateForm(!showCreateForm)}>
            <Plus className="w-4 h-4" />
            Add Match
          </PrimaryButton>
        </div>
      </div>

      {showCreateForm && (
        <FormSection title="Create New Match">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-2 gap-4"
          >
            <FormInput
              label="Season ID"
              {...register("seasonId")}
              error={errors.seasonId}
              placeholder="UUID of season"
            />
            <FormInput
              label="Match Date"
              type="datetime-local"
              {...register("matchDate")}
              error={errors.matchDate}
            />
            <FormInput
              label="Home Team ID"
              {...register("homeTeamId")}
              error={errors.homeTeamId}
              placeholder="UUID of home team"
            />
            <FormInput
              label="Away Team ID"
              {...register("awayTeamId")}
              error={errors.awayTeamId}
              placeholder="UUID of away team"
            />
            <FormInput
              label="Venue"
              {...register("venue")}
              placeholder="Stadium name"
            />

            <FormSelect
              label="Status"
              {...register("status")}
              options={[
                { label: "Scheduled", value: "scheduled" },
                { label: "Live", value: "live" },
                { label: "Finished", value: "finished" },
                { label: "Postponed", value: "postponed" },
                { label: "Cancelled", value: "cancelled" },
              ]}
            />

            <div className="col-span-2 flex gap-3">
              <PrimaryButton type="submit" loading={createMutation.isPending}>
                {createMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Create Match"
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

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      ) : (
        <div className="grid gap-4">
          {data?.matches.map((match) => (
            <div
              key={match.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(match.status)}`}
                    >
                      {match.status.toUpperCase()}
                    </span>
                    <span className="text-sm text-slate-500 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      {new Date(match.date).toLocaleString()}
                    </span>
                    {match.venue && (
                      <span className="text-sm text-slate-500 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        {match.venue}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex-1 text-right">
                      <p className="text-lg font-bold text-slate-900">
                        {match.homeTeam}
                      </p>
                    </div>
                    <div className="px-6 py-3 bg-slate-50 rounded-xl">
                      <p className="text-2xl font-black text-slate-900">
                        {match.homeScore ?? "-"} : {match.awayScore ?? "-"}
                      </p>
                    </div>
                    <div className="flex-1">
                      <p className="text-lg font-bold text-slate-900">
                        {match.awayTeam}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-6">
                  <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-emerald-600 transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(match.id)}
                    disabled={deleteMutation.isPending}
                    className="p-2 hover:bg-rose-50 rounded-lg text-slate-600 hover:text-rose-600 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

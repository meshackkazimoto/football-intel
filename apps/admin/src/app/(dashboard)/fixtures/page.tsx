"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fixturesService } from "@/services/fixtures/fixtures.service";
import {
  Plus,
  Calendar,
  MapPin,
  Edit,
  Trash2,
  Loader2,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFixtureSchema } from "@/services/fixtures/validation";
import type {
  CreateFixtureInput,
  Fixture,
  FixtureStatus,
} from "@/services/fixtures/types";

export default function FixturesPage() {
  const [statusFilter, setStatusFilter] =
    useState<"all" | FixtureStatus>("all");

  const [showCreateForm, setShowCreateForm] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["fixtures", statusFilter],
    queryFn: () =>
      fixturesService.getFixtures(
        statusFilter === "all" ? {} : { status: statusFilter },
      ),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateFixtureInput>({
    resolver: zodResolver(createFixtureSchema),
  });

  const createMutation = useMutation({
    mutationFn: fixturesService.createFixture,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fixtures"] });
      setShowCreateForm(false);
      reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: fixturesService.deleteFixture,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fixtures"] });
    },
  });

  const onSubmit = (data: CreateFixtureInput) => {
    createMutation.mutate(data);
  };

  const getStatusBadge = (status: FixtureStatus) => {
    const colors: Record<FixtureStatus, string> = {
      scheduled:
        "bg-blue-500/10 text-blue-400 border-blue-500/30",
      live:
        "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 animate-pulse",
      half_time:
        "bg-amber-500/10 text-amber-400 border-amber-500/30",
      finished:
        "bg-slate-500/10 text-slate-300 border-slate-500/30",
      postponed:
        "bg-rose-500/10 text-rose-400 border-rose-500/30",
    };

    return colors[status];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">
            Fixtures
          </h1>
          <p className="text-slate-400 mt-1">
            Create and manage league fixtures and schedules.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as "all" | FixtureStatus)
            }
            className="
              px-4 py-2
              bg-slate-800
              border border-slate-700
              rounded-xl
              text-sm font-semibold
              text-slate-200
              focus:outline-none
              focus:ring-2 focus:ring-emerald-500/20
            "
          >
            <option value="all">All Fixtures</option>
            <option value="scheduled">Scheduled</option>
            <option value="live">Live</option>
            <option value="half_time">Half Time</option>
            <option value="finished">Finished</option>
            <option value="postponed">Postponed</option>
          </select>

          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="
              flex items-center gap-2
              px-4 py-2
              bg-emerald-600
              hover:bg-emerald-700
              text-white
              rounded-xl
              font-bold text-sm
              transition-all
            "
          >
            <Plus className="w-4 h-4" />
            Add Fixture
          </button>
        </div>
      </div>

      {/* Create Fixture */}
      {showCreateForm && (
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-slate-100 mb-4">
            Create Fixture
          </h2>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-2 gap-4"
          >
            {[
              ["seasonId", "Season ID"],
              ["homeTeamId", "Home Team ID"],
              ["awayTeamId", "Away Team ID"],
            ].map(([key, label]) => (
              <div key={key}>
                <label className="block text-sm font-bold mb-2 text-slate-300">
                  {label}
                </label>
                <input
                  {...register(key as keyof CreateFixtureInput)}
                  className="
                    w-full px-4 py-2
                    bg-slate-800
                    border border-slate-700
                    rounded-xl
                    text-slate-100
                  "
                />
              </div>
            ))}

            <div>
              <label className="block text-sm font-bold mb-2 text-slate-300">
                Match Date
              </label>
              <input
                type="datetime-local"
                {...register("matchDate")}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-bold mb-2 text-slate-300">
                Venue
              </label>
              <input
                {...register("venue")}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100"
              />
            </div>

            <div className="col-span-2 flex gap-3">
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="btn-primary"
              >
                {createMutation.isPending && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                Create Fixture
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  reset();
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Fixtures List */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      ) : (
        <div className="grid gap-4">
          {data?.fixtures.map((fixture: Fixture) => (
            <div
              key={fixture.id}
              className="
                bg-slate-900
                border border-slate-700
                rounded-2xl
                p-6
                hover:border-emerald-500/30
                transition-all
              "
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(
                        fixture.status,
                      )}`}
                    >
                      {fixture.status.toUpperCase()}
                    </span>

                    <span className="text-sm text-slate-400 flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(fixture.matchDate).toLocaleString()}
                    </span>

                    {fixture.venue && (
                      <span className="text-sm text-slate-400 flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {fixture.venue}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-6 font-bold text-slate-100">
                    <div className="flex-1 text-right">
                      {fixture.homeTeam.name}
                    </div>

                    <div className="px-6 py-3 bg-slate-800 rounded-xl">
                      {fixture.homeScore ?? "-"} :{" "}
                      {fixture.awayScore ?? "-"}
                    </div>

                    <div className="flex-1">
                      {fixture.awayTeam.name}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 ml-6">
                  <button className="icon-btn">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(fixture.id)}
                    disabled={deleteMutation.isPending}
                    className="icon-btn-danger"
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
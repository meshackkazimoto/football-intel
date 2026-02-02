"use client";

import { use, useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clubsService } from "@/services/clubs/clubs.service";
import { countriesService } from "@/services/countries/countries.service";
import { stadiumsService } from "@/services/stadiums/stadiums.service";
import {
  Plus,
  Trophy,
  MapPin,
  Calendar,
  Edit,
  Trash2,
  Loader2,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClubSchema, type CreateClubInput } from "@/services/clubs/types";
import { SearchInput } from "@/components/ui/search";
import { FormInput } from "@/components/ui/input";
import { FormSelect } from "@/components/ui/select";
import { PrimaryButton, SecondaryButton } from "@/components/ui/button";
import { FormSection } from "@/components/ui/form-section";

const COLOR_MAP: Record<string, string> = {
  red: "from-red-600 via-red-500 to-red-600",
  blue: "from-blue-600 via-blue-500 to-blue-600",
  yellow: "from-yellow-500 via-yellow-400 to-yellow-500",
  green: "from-green-600 via-green-500 to-green-600",
  white: "from-slate-300 via-white to-slate-300",
  black: "from-slate-900 via-slate-800 to-slate-900",
};

export default function ClubsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: clubs, isLoading } = useQuery({
    queryKey: ["clubs", searchQuery],
    queryFn: () => clubsService.getClubs(),
  });

  const { data: countries } = useQuery({
    queryKey: ["countries"],
    queryFn: () => countriesService.getCountries(),
  });

  const { data: stadiums } = useQuery({
    queryKey: ["stadiums"],
    queryFn: () => stadiumsService.getStadiums(),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateClubInput>({
    resolver: zodResolver(createClubSchema),
  });

  const createMutation = useMutation({
    mutationFn: clubsService.createClub,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clubs"] });
      setShowCreateForm(false);
      reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: clubsService.deleteClub,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clubs"] });
    },
  });

  const onSubmit = (data: CreateClubInput) => {
    createMutation.mutate(data);
  };

  const normalizeColor = (color?: string) =>
    color
      ?.toLowerCase()
      .trim()
      .replace(/\s+/g, "");

  const getClubGradient = (club: any) => {
    const primary = normalizeColor(club.metadata?.colors?.primary);

    if (primary && COLOR_MAP[primary]) {
      return COLOR_MAP[primary];
    }

    return "from-emerald-500 to-emerald-600";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">
            Registered Clubs
          </h1>
          <p className="text-slate-400 mt-1">
            Manage club profiles, stadiums, and official data.
          </p>
        </div>

        <PrimaryButton onClick={() => setShowCreateForm(!showCreateForm)}>
          <Plus className="w-4 h-4" />
          Add New Club
        </PrimaryButton>
      </div>

      {/* Search */}
      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search clubs..."
      />

      {showCreateForm && (
        <FormSection title="Register New Club">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-2 gap-4"
          >
            {/* Basic Info */}
            <div className="col-span-2">
              <FormInput
                label="Club Name *"
                {...register("name")}
                error={errors.name}
              />
            </div>

            <FormInput
              label="Slug *"
              {...register("slug")}
              error={errors.slug}
            />

            <FormInput
              label="Founded Year"
              type="number"
              {...register("foundedYear", { valueAsNumber: true })}
              error={errors.foundedYear}
            />

            {/* Country */}
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

            {/* Stadium */}
            <FormSelect
              label="Stadium"
              {...register("stadiumId")}
              error={errors.stadiumId}
              options={
                stadiums?.data.map((s) => ({
                  label: s.name,
                  value: s.id,
                })) ?? []
              }
            />

            {/* Metadata */}
            <FormInput
              label="Nickname"
              {...register("metadata.nickname")}
              error={errors.metadata?.nickname}
            />

            <FormInput
              label="Primary Color"
              placeholder="e.g. Yellow"
              {...register("metadata.colors.primary")}
              error={errors.metadata?.colors?.primary}
            />

            <FormInput
              label="Secondary Color"
              placeholder="e.g. Green"
              {...register("metadata.colors.secondary")}
              error={errors.metadata?.colors?.secondary}
            />

            {/* Actions */}
            <div className="col-span-2 flex gap-3">
              <PrimaryButton type="submit" loading={createMutation.isPending}>
                {createMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Register Club"
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
      ) : clubs?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <p className="text-lg font-bold">No clubs found.</p>
          <p className="text-sm">Get started by adding a new club.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {clubs?.map((club, index) => {
            console.log(
  club.name,
  `"${club.metadata?.colors?.primary}"`,
  `"${club.metadata?.colors?.primary?.toLowerCase()}"`,
);
            return (
              <div
              key={club.id}
              className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden hover:border-emerald-500/30 transition-all"
            >
              <div
                className={`h-2 bg-gradient-to-r ${getClubGradient(club)}`}
                title={club.metadata?.colors?.primary}
              />

              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center font-black text-slate-400">
                    {club.name[0]}
                  </div>

                  <div className="flex gap-1">
                    <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-emerald-500">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(club.id)}
                      disabled={deleteMutation.isPending}
                      className="p-2 hover:bg-rose-500/10 rounded-lg text-slate-400 hover:text-rose-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-slate-100 text-lg">
                  {club.name}
                </h3>

                {club.metadata?.nickname && (
                  <p className="text-xs text-emerald-400 font-bold uppercase mt-1">
                    {club.metadata.nickname}
                  </p>
                )}

                <div className="mt-6 space-y-3">
                  {club.country && (
                    <div className="flex items-center gap-3 text-slate-400 text-sm">
                      <MapPin className="w-4 h-4" />
                      <span>{club.country.name}</span>
                    </div>
                  )}

                  {(club.stadium?.name || club.stadiumName) && (
                    <div className="flex items-center gap-3 text-slate-400 text-sm">
                      <Trophy className="w-4 h-4" />
                      <span>{club.stadium?.name ?? club.stadiumName}</span>
                    </div>
                  )}

                  {(club.stadium?.capacity || club.stadiumCapacity) && (
                    <div className="flex items-center gap-3 text-slate-400 text-sm">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {(
                          club.stadium?.capacity ?? club.stadiumCapacity
                        )?.toLocaleString()}{" "}
                        capacity
                      </span>
                    </div>
                  )}
                </div>

                <button className="w-full mt-6 py-2 bg-slate-800 text-slate-300 font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-emerald-500/10 hover:text-emerald-400 transition-all">
                  View Squad
                </button>
              </div>
            </div>
            )
          })}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { stadiumsService } from "@/services/stadiums/stadiums.service";
import { countriesService } from "@/services/countries/countries.service";
import { Plus, Edit, Trash2, Loader2, MapPin } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { CreateStadiumInput, Stadium } from "@/services/stadiums/types";
import type { Country } from "@/services/countries/types";
import { createStadiumSchema } from "@/services/stadiums/validation";
import { SearchInput } from "@/components/ui/search";
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

export default function StadiumsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const queryClient = useQueryClient();

  const {
    data: stadiumsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["stadiums", searchQuery],
    queryFn: () => stadiumsService.getStadiums(),
  });

  const { data: countries = [] } = useQuery({
    queryKey: ["countries"],
    queryFn: () => countriesService.getCountries(),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateStadiumInput>({
    resolver: zodResolver(createStadiumSchema),
  });

  const createMutation = useMutation({
    mutationFn: stadiumsService.createStadium,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stadiums"] });
      setShowCreateForm(false);
      reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: stadiumsService.deleteStadium,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stadiums"] });
    },
  });

  const onSubmit = (formData: CreateStadiumInput) => {
    createMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">
            Stadium Management
          </h1>
          <p className="text-slate-400 mt-1">
            Manage stadium locations, capacities, and metadata.
          </p>
        </div>

        <PrimaryButton onClick={() => setShowCreateForm(!showCreateForm)}>
          <Plus className="w-4 h-4" />
          Add Stadium
        </PrimaryButton>
      </div>

      {/* Search */}
      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search stadiums by name..."
      />

      {/* Create Stadium Form */}
      {showCreateForm && (
        <FormSection title="Register New Stadium">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-2 gap-4"
          >
            <div className="col-span-2">
              <FormInput
                label="Stadium Name *"
                {...register("name")}
                error={errors.name}
              />
            </div>

            <FormInput
              label="City"
              {...register("city")}
              error={errors.city}
            />

            <FormSelect
              label="Country"
              {...register("countryId")}
              options={countries.map((c: Country) => ({
                label: `${c.name} (${c.code})`,
                value: c.id,
              }))}
              error={errors.countryId}
            />

            <FormInput
              label="Capacity"
              type="number"
              {...register("capacity", { valueAsNumber: true })}
              error={errors.capacity}
            />

            <FormInput
              label="Latitude"
              {...register("latitude")}
              error={errors.latitude}
            />

            <FormInput
              label="Longitude"
              {...register("longitude")}
              error={errors.longitude}
            />

            <div className="col-span-2 flex gap-3">
              <PrimaryButton type="submit" loading={createMutation.isPending}>
                {createMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Register Stadium"
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

      {/* Stadiums Table */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      ) : error ? (
        <div className="bg-slate-900 border border-rose-500/30 rounded-2xl p-6">
          <p className="text-rose-400 text-center font-bold">
            Failed to load stadiums
          </p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                {["Stadium", "City", "Country", "Capacity", "Actions"].map(
                  (h) => (
                    <TableHead key={h}>{h}</TableHead>
                  ),
                )}
              </TableRow>
            </TableHeader>

            <TableBody>
              {stadiumsData?.data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-slate-400"
                  >
                    No stadiums found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                stadiumsData?.data.map((stadium: Stadium) => (
                  <TableRow
                    key={stadium.id}
                    className="hover:bg-slate-800/60 transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-100">
                            {stadium.name}
                          </p>
                          <p className="text-xs text-slate-400">
                            {stadium.city ?? "—"}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="text-slate-400">
                      {stadium.city ?? "—"}
                    </TableCell>

                    <TableCell className="text-slate-400">
                      {stadium.country?.name ?? "—"}
                    </TableCell>

                    <TableCell className="text-slate-300">
                      {stadium.capacity
                        ? stadium.capacity.toLocaleString()
                        : "—"}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-emerald-500">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteMutation.mutate(stadium.id)}
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
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { countriesService } from "@/services/countries/countries.service";
import { Plus, Edit, Trash2, Loader2, Flag } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type {
  Country,
  CreateCountryInput,
} from "@/services/countries/types";
import {
  createCountrySchema,
} from "@/services/countries/validation";
import { SearchInput } from "@/components/ui/search";
import { FormInput } from "@/components/ui/input";
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

export default function CountriesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["countries", searchQuery],
    queryFn: () => countriesService.getCountries(),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateCountryInput>({
    resolver: zodResolver(createCountrySchema),
  });

  const createMutation = useMutation({
    mutationFn: countriesService.createCountry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["countries"] });
      setShowCreateForm(false);
      reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: countriesService.deleteCountry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["countries"] });
    },
  });

  const onSubmit = (formData: CreateCountryInput) => {
    createMutation.mutate(formData);
  };

  const filteredCountries =
    data?.filter(
      (c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.code.toLowerCase().includes(searchQuery.toLowerCase()),
    ) ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">
            Country Management
          </h1>
          <p className="text-slate-400 mt-1">
            Manage countries used across leagues, clubs, and players.
          </p>
        </div>

        <PrimaryButton onClick={() => setShowCreateForm(!showCreateForm)}>
          <Plus className="w-4 h-4" />
          Add Country
        </PrimaryButton>
      </div>

      {/* Search */}
      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search countries by name or code..."
      />

      {/* Create Country Form */}
      {showCreateForm && (
        <FormSection title="Register New Country">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-2 gap-4"
          >
            <div className="col-span-2">
              <FormInput
                label="Country Name *"
                {...register("name")}
                error={errors.name}
              />
            </div>

            <div className="col-span-1">
              <FormInput
                label="Country Code (ISO-3) *"
                {...register("code")}
                error={errors.code}
              />
            </div>

            <div className="col-span-2 flex gap-3">
              <PrimaryButton type="submit" loading={createMutation.isPending}>
                {createMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Register Country"
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

      {/* Countries Table */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      ) : error ? (
        <div className="bg-slate-900 border border-rose-500/30 rounded-2xl p-6">
          <p className="text-rose-400 text-center font-bold">
            Failed to load countries
          </p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                {["Country", "Code", "Created", "Actions"].map((h) => (
                  <TableHead key={h}>{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredCountries.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-24 text-center text-slate-400"
                  >
                    No countries found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCountries.map((country: Country) => (
                  <TableRow
                    key={country.id}
                    className="hover:bg-slate-800/60 transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                          <Flag className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-100">
                            {country.name}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="text-slate-400 font-mono">
                      {country.code}
                    </TableCell>

                    <TableCell className="text-slate-400">
                      {new Date(country.createdAt).toLocaleDateString()}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-emerald-500">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            deleteMutation.mutate(country.id)
                          }
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
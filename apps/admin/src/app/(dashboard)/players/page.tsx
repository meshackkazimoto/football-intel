"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { playersService } from "@/services/players/players.service";
import { Plus, Edit, Trash2, Loader2, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { CreatePlayerInput, Player } from "@/services/players/types";
import { createPlayerSchema } from "@/services/players/validation";
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

export default function PlayersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["players", searchQuery],
    queryFn: () =>
      playersService.getPlayers(searchQuery ? { search: searchQuery } : {}),
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
    },
  });

  const onSubmit = (formData: CreatePlayerInput) => {
    createMutation.mutate(formData);
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
              {data?.data.map((player: Player) => (
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
                        onClick={() => deleteMutation.mutate(player.id)}
                        disabled={deleteMutation.isPending}
                        className="p-2 hover:bg-rose-500/10 rounded-lg text-slate-400 hover:text-rose-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

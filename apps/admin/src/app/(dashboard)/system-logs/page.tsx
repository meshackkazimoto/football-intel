"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "@/services/admin/admin.service";
import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Loader2,
  Filter,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  verifyIngestionSchema,
  type VerifyIngestionInput,
} from "@/services/admin/types";
import { FormInput } from "@/components/ui/input";
import { PrimaryButton, SecondaryButton } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export default function SystemLogsPage() {
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "verified" | "rejected"
  >("all");
  const [selectedLog, setSelectedLog] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["ingestion-logs", statusFilter],
    queryFn: () =>
      adminService.getIngestionLogs(
        statusFilter === "all" ? {} : { status: statusFilter },
      ),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VerifyIngestionInput>({
    resolver: zodResolver(verifyIngestionSchema),
    defaultValues: { score: 0.9 },
  });

  const verifyMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: VerifyIngestionInput }) =>
      adminService.verifyIngestion(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ingestion-logs"] });
      setSelectedLog(null);
      reset();
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => adminService.rejectIngestion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ingestion-logs"] });
    },
  });

  const onVerify = (input: VerifyIngestionInput) => {
    if (selectedLog) {
      verifyMutation.mutate({ id: selectedLog, input });
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: {
        icon: Clock,
        color: "bg-amber-500/10 text-amber-600 border-amber-500/20",
      },
      verified: {
        icon: CheckCircle,
        color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
      },
      rejected: {
        icon: XCircle,
        color: "bg-rose-500/10 text-rose-600 border-rose-500/20",
      },
    };
    const badge = badges[status as keyof typeof badges] || badges.pending;
    const Icon = badge.icon;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${badge.color}`}
      >
        <Icon className="w-3.5 h-3.5" />
        {status.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">
            System Ingestion Logs
          </h1>
          <p className="text-slate-400 mt-1">
            Review and verify incoming data from scrapers and APIs.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl font-semibold text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      ) : (
        <div className="bg-slate-900 rounded-2xl border border-slate-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-slate-400"
                    >
                      No system logs found.
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.data.map((log) => (
                    <TableRow
                      key={log.id}
                      className="hover:bg-slate-800/50 transition-colors"
                    >
                      <TableCell className="font-mono text-slate-400">
                        {log.id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs font-bold">
                          {log.type}
                        </span>
                      </TableCell>
                      <TableCell className="font-semibold text-slate-300">
                        {log.source}
                      </TableCell>
                      <TableCell>{getStatusBadge(log.status)}</TableCell>
                      <TableCell className="text-slate-400">
                        {new Date(log.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() =>
                              setSelectedLog(
                                selectedLog === log.id ? null : log.id,
                              )
                            }
                            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-100 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {log.status === "pending" && (
                            <>
                              <button
                                onClick={() => setSelectedLog(log.id)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors"
                              >
                                Verify
                              </button>
                              <button
                                onClick={() => rejectMutation.mutate(log.id)}
                                disabled={rejectMutation.isPending}
                                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {selectedLog && (
            <div className="border-t border-slate-700 bg-slate-800/50 p-6">
              <h3 className="text-lg font-bold text-slate-100 mb-4">
                Verify Ingestion
              </h3>
              <form onSubmit={handleSubmit(onVerify)} className="space-y-4">
                <FormInput
                  label="Confidence Score (0-1)"
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  {...register("score", { valueAsNumber: true })}
                  error={errors.score}
                />

                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    {...register("notes")}
                    rows={3}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="Add verification notes..."
                  />
                </div>

                <div className="flex gap-3">
                  <PrimaryButton
                    type="submit"
                    loading={verifyMutation.isPending}
                  >
                    Confirm Verification
                  </PrimaryButton>

                  <SecondaryButton
                    type="button"
                    onClick={() => {
                      setSelectedLog(null);
                      reset();
                    }}
                  >
                    Cancel
                  </SecondaryButton>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

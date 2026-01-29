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
          <h1 className="text-2xl font-bold text-slate-900">
            System Ingestion Logs
          </h1>
          <p className="text-slate-500 mt-1">
            Review and verify incoming data from scrapers and APIs.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl font-semibold text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
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
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">
                    ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Source
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Created
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data?.logs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-mono text-slate-600">
                      {log.id.slice(0, 8)}...
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold">
                        {log.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-700">
                      {log.source}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(log.status)}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() =>
                            setSelectedLog(
                              selectedLog === log.id ? null : log.id,
                            )
                          }
                          className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-slate-900 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {log.status === "pending" && (
                          <>
                            <button
                              onClick={() => setSelectedLog(log.id)}
                              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-colors"
                            >
                              Verify
                            </button>
                            <button
                              onClick={() => rejectMutation.mutate(log.id)}
                              disabled={rejectMutation.isPending}
                              className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selectedLog && (
            <div className="border-t border-slate-200 bg-slate-50 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">
                Verify Ingestion
              </h3>
              <form onSubmit={handleSubmit(onVerify)} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Confidence Score (0-1)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    {...register("score", { valueAsNumber: true })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                  {errors.score && (
                    <p className="text-xs text-rose-500 mt-1">
                      {errors.score.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    {...register("notes")}
                    rows={3}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="Add verification notes..."
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={verifyMutation.isPending}
                    className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {verifyMutation.isPending && (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    )}
                    Confirm Verification
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedLog(null);
                      reset();
                    }}
                    className="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

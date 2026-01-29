"use client";

import { CheckCircle2, XCircle, Clock, ExternalLink } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const logs = [
  {
    id: "ING-001",
    type: "MATCH",
    source: "Ligi Kuu Scraper",
    payload: "Simba SC vs Azam FC (2024-05-20)",
    status: "pending",
    timestamp: "2024-05-20 14:30:00",
  },
  {
    id: "ING-002",
    type: "PLAYER",
    source: "Admin Manual",
    payload: "Clatous Chama (Contract Update)",
    status: "verified",
    timestamp: "2024-05-20 12:15:00",
  },
  {
    id: "ING-003",
    type: "MATCH_EVENT",
    source: "Ligi Kuu Scraper",
    payload: "Goal: John Bocco (45')",
    status: "pending",
    timestamp: "2024-05-20 14:45:00",
  },
  {
    id: "ING-004",
    type: "CLUB",
    source: "System Sync",
    payload: "Coastal Union (Stadium Update)",
    status: "rejected",
    timestamp: "2024-05-19 18:20:00",
  },
];

export default function LogsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Ingestion Logs</h1>
          <p className="text-slate-500 mt-1">
            Review and verify data coming into the platform.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-sm">
            Refresh Data
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Payload Preview</TableHead>
              <TableHead>Timestamp</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id} className="group">
                <TableCell className="font-mono text-xs font-bold text-slate-400">
                  {log.id}
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ring-1",
                      log.type === "MATCH" &&
                        "bg-blue-50 text-blue-600 ring-blue-500/20",
                      log.type === "PLAYER" &&
                        "bg-emerald-50 text-emerald-600 ring-emerald-500/20",
                      log.type === "MATCH_EVENT" &&
                        "bg-amber-50 text-amber-600 ring-amber-500/20",
                      log.type === "CLUB" &&
                        "bg-indigo-50 text-indigo-600 ring-indigo-500/20",
                    )}
                  >
                    {log.type}
                  </span>
                </TableCell>
                <TableCell className="font-medium">{log.source}</TableCell>
                <TableCell className="text-slate-500 truncate max-w-[200px]">
                  {log.payload}
                </TableCell>
                <TableCell className="text-xs text-slate-400 font-medium">
                  {log.timestamp}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    {log.status === "pending" && (
                      <>
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-xs font-bold text-amber-600">
                          Pending
                        </span>
                      </>
                    )}
                    {log.status === "verified" && (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-xs font-bold text-emerald-600">
                          Verified
                        </span>
                      </>
                    )}
                    {log.status === "rejected" && (
                      <>
                        <XCircle className="w-3.5 h-3.5 text-rose-500" />
                        <span className="text-xs font-bold text-rose-600">
                          Rejected
                        </span>
                      </>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex flex-row-reverse gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-emerald-600 transition-all">
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-rose-600 transition-all">
                      <XCircle className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600 transition-all">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <p className="text-xs text-slate-500 font-medium">
            Showing 4 of 1,240 records
          </p>
          <div className="flex gap-2">
            <button
              className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              disabled
            >
              Previous
            </button>
            <button className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { CaseStatus } from "@/types/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, PhoneCall, CheckCircle2, AlertOctagon, ArrowUpRight, Search, Filter } from "lucide-react";

interface RecentCasesTableProps {
  cases: CaseStatus[];
  loading?: boolean;
  onInspectCase: (caseId: string) => void;
  onOpenVoiceModalForCase?: (customerName: string, amount: number) => void;
}

export function RecentCasesTable({
  cases,
  loading = false,
  onInspectCase,
  onOpenVoiceModalForCase,
}: RecentCasesTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [scenarioFilter, setScenarioFilter] = useState("all");

  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      c.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.customer_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.case_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.diagnosis?.root_cause.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesScenario = scenarioFilter === "all" || c.scenario === scenarioFilter;
    return matchesSearch && matchesScenario;
  });

  const getScenarioBadge = (sc?: string) => {
    switch (sc) {
      case "payment_degradation":
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">Payment Degradation</span>;
      case "checkout_dropoff":
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">Checkout Drop-off</span>;
      case "failed_subscription":
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">Failed Subscription</span>;
      case "b2b_receivables":
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">B2B Receivables</span>;
      case "mandate_sequencer":
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">Mandate Sequencer</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-slate-300">Payment Issue</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 size={12} className="mr-1" /> Reclaimed
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            <AlertOctagon size={12} className="mr-1" /> Halted (Rule)
          </span>
        );
      case "escalated":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
            Escalated
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
            Evaluating
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="space-y-3 p-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-14 rounded-xl bg-slate-800/50 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-1">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search by customer, case ID, or root cause..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter size={14} className="text-slate-400" />
          <select
            value={scenarioFilter}
            onChange={(e) => setScenarioFilter(e.target.value)}
            className="bg-slate-950/80 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">All Scenarios</option>
            <option value="payment_degradation">Payment Degradation</option>
            <option value="checkout_dropoff">Checkout Drop-off</option>
            <option value="failed_subscription">Failed Subscription</option>
            <option value="b2b_receivables">B2B Receivables</option>
            <option value="mandate_sequencer">Mandate Sequencer</option>
          </select>
        </div>
      </div>

      {/* Cases Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-950/90 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Case & Customer</th>
              <th className="py-3 px-4">Leakage Scenario</th>
              <th className="py-3 px-4">AI Diagnostic Finding</th>
              <th className="py-3 px-4 text-right">At Risk</th>
              <th className="py-3 px-4 text-right">Reclaimed</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-center">Inspect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
            {filteredCases.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-10 text-slate-400 text-xs">
                  No matching recovery cases found.
                </td>
              </tr>
            ) : (
              filteredCases.map((c) => (
                <tr key={c.case_id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-white">{c.customer_name || c.customer_id}</div>
                    <div className="text-[11px] font-mono text-slate-400">{c.case_id}</div>
                  </td>
                  <td className="py-3.5 px-4">{getScenarioBadge(c.scenario)}</td>
                  <td className="py-3.5 px-4 max-w-xs truncate text-xs text-slate-300" title={c.diagnosis?.root_cause}>
                    {c.diagnosis?.root_cause || "Analyzing failure..."}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-amber-400 font-semibold">
                    ${c.amount.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-emerald-400 font-bold">
                    ${c.amount_recovered.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-center">{getStatusBadge(c.status)}</td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center space-x-1.5">
                      <button
                        onClick={() => onInspectCase(c.case_id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                        title="View LangGraph Trace & Audit Trail"
                      >
                        <Eye size={15} />
                      </button>
                      {c.action?.channel === "hinglish_voice" && onOpenVoiceModalForCase && (
                        <button
                          onClick={() => onOpenVoiceModalForCase(c.customer_name || "Customer", c.amount)}
                          className="p-1.5 rounded-lg bg-purple-900/50 hover:bg-purple-800 text-purple-300 hover:text-white transition"
                          title="Simulate Hinglish Voice Call"
                        >
                          <PhoneCall size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

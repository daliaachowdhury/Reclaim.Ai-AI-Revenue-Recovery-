"use client";

import React, { useState } from "react";
import { CalendarClock, CheckCircle2, AlertCircle, PhoneCall, FileText, ArrowRight, ShieldCheck } from "lucide-react";
import { PromiseToPayItem } from "@/types/api";

interface PtpLedgerProps {
  commitments: PromiseToPayItem[];
  totalValue: number;
}

export function PtpLedger({ commitments, totalValue }: PtpLedgerProps) {
  const [filter, setFilter] = useState<string>("all");

  const filteredItems = commitments.filter((item) => {
    if (filter === "all") return true;
    return item.channel === filter;
  });

  return (
    <div className="glass-card rounded-2xl border border-slate-800 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center space-x-2 font-['Outfit']">
            <CalendarClock className="text-purple-400" size={22} />
            <span>Promise-to-Pay (PTP) & Mandate Scheduler</span>
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Tracking customer payment agreements negotiated via Voice AI & B2B Invoice sequences with automated auto-debit triggers.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="px-4 py-2 rounded-xl bg-purple-950/60 border border-purple-800 text-right">
            <span className="text-[10px] uppercase font-semibold text-purple-300 block">Committed PTP Value</span>
            <span className="text-lg font-bold text-purple-200 font-mono">
              ${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            filter === "all" ? "bg-purple-600 text-white" : "text-slate-400 hover:text-white"
          }`}
        >
          All Commitments ({commitments.length})
        </button>
        <button
          onClick={() => setFilter("hinglish_voice")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1 ${
            filter === "hinglish_voice" ? "bg-purple-600 text-white" : "text-slate-400 hover:text-white"
          }`}
        >
          <PhoneCall size={12} />
          <span>Voice AI Bookings</span>
        </button>
        <button
          onClick={() => setFilter("b2b_invoice_chaser")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1 ${
            filter === "b2b_invoice_chaser" ? "bg-purple-600 text-white" : "text-slate-400 hover:text-white"
          }`}
        >
          <FileText size={12} />
          <span>B2B Receivables</span>
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-950/80 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">PTP ID</th>
              <th className="py-3 px-4">Customer & Account</th>
              <th className="py-3 px-4">Intervention Channel</th>
              <th className="py-3 px-4 text-right">Committed Amount</th>
              <th className="py-3 px-4">Promised Execution Date</th>
              <th className="py-3 px-4 text-center">Mandate Status</th>
              <th className="py-3 px-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredItems.map((item) => (
              <tr key={item.ptp_id} className="hover:bg-slate-800/40 transition">
                <td className="py-3.5 px-4 font-mono text-xs text-purple-400">{item.ptp_id}</td>
                <td className="py-3.5 px-4">
                  <div className="font-semibold text-white">{item.customer_name}</div>
                  <div className="text-[11px] font-mono text-slate-400">{item.customer_id}</div>
                </td>
                <td className="py-3.5 px-4">
                  {item.channel === "hinglish_voice" ? (
                    <span className="inline-flex items-center text-xs text-purple-300 bg-purple-950/60 border border-purple-800 px-2 py-0.5 rounded-full">
                      <PhoneCall size={12} className="mr-1" /> Hinglish Voice
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-xs text-cyan-300 bg-cyan-950/60 border border-cyan-800 px-2 py-0.5 rounded-full">
                      <FileText size={12} className="mr-1" /> B2B Invoice Chaser
                    </span>
                  )}
                </td>
                <td className="py-3.5 px-4 text-right font-mono text-emerald-400 font-bold">
                  ${item.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </td>
                <td className="py-3.5 px-4">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-mono text-white text-xs">{item.promised_date}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      Auto-Scheduled
                    </span>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-center">
                  <span className="inline-flex items-center space-x-1 text-xs text-emerald-400 font-semibold bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-500/30">
                    <ShieldCheck size={13} className="text-emerald-400" />
                    <span>Auto-Debit Armed</span>
                  </span>
                </td>
                <td className="py-3.5 px-4 text-center">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Pending Maturity
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

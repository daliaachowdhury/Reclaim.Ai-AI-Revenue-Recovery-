"use client";

import React, { useState } from "react";
import { Zap, ShieldCheck, DollarSign, ArrowUpRight, CheckCircle2, AlertCircle, PhoneCall, RefreshCw, Eye } from "lucide-react";
import { SimulationResult, SimulationCase } from "@/types/api";

interface BatchSimulatorProps {
  onRunBatch: (batchSize: number, threshold: number) => Promise<SimulationResult | null>;
  lastResult: SimulationResult | null;
  onInspectCase: (caseId: string) => void;
  onOpenVoiceModalForCase?: (customerName: string, amount: number) => void;
}

export function BatchSimulator({
  onRunBatch,
  lastResult,
  onInspectCase,
  onOpenVoiceModalForCase,
}: BatchSimulatorProps) {
  const [batchSize, setBatchSize] = useState<number>(8);
  const [threshold, setThreshold] = useState<number>(70);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleExecute = async () => {
    setIsLoading(true);
    try {
      await onRunBatch(batchSize, threshold / 100);
    } finally {
      setIsLoading(false);
    }
  };

  const getScenarioBadge = (sc: string) => {
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
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-700 text-slate-300">{sc}</span>;
    }
  };

  const getChannelBadge = (ch: string) => {
    switch (ch) {
      case "hinglish_voice":
        return <span className="inline-flex items-center space-x-1 text-xs text-purple-300 bg-purple-950/60 border border-purple-800 px-2 py-0.5 rounded-full"><PhoneCall size={12} className="mr-1" /> Hinglish Voice</span>;
      case "dynamic_incentive":
        return <span className="inline-flex items-center space-x-1 text-xs text-amber-300 bg-amber-950/60 border border-amber-800 px-2 py-0.5 rounded-full">🎟️ Bounded 10% Off</span>;
      case "whatsapp_sms":
        return <span className="inline-flex items-center space-x-1 text-xs text-emerald-300 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-full">💬 WhatsApp 1-Click</span>;
      case "b2b_invoice_chaser":
        return <span className="inline-flex items-center space-x-1 text-xs text-cyan-300 bg-cyan-950/60 border border-cyan-800 px-2 py-0.5 rounded-full">📑 B2B PTP Chaser</span>;
      default:
        return <span className="inline-flex items-center space-x-1 text-xs text-indigo-300 bg-indigo-950/60 border border-indigo-800 px-2 py-0.5 rounded-full">⚡ Smart Gateway Retry</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Simulation Controls Panel */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center space-x-2 font-['Outfit']">
              <Zap className="text-emerald-400" size={22} />
              <span>Multi-Scenario Autonomous Batch Recovery Engine</span>
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Test &quot;The Bar&quot;: Simulate mixed batches across payment failures, checkout drop-offs, subscriptions & B2B receivables to measure net money reclaimed with guardrails.
            </p>
          </div>

          {/* Sliders & Trigger */}
          <div className="flex flex-wrap items-center gap-5 w-full lg:w-auto">
            {/* Batch Size Slider */}
            <div className="flex flex-col space-y-1 min-w-[140px]">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Batch Size</span>
                <strong className="text-white font-mono">{batchSize} Cases</strong>
              </div>
              <input
                type="range"
                min={3}
                max={25}
                value={batchSize}
                onChange={(e) => setBatchSize(Number(e.target.value))}
                className="accent-emerald-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Confidence Threshold */}
            <div className="flex flex-col space-y-1 min-w-[140px]">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Confidence Floor</span>
                <strong className="text-white font-mono">{threshold}%</strong>
              </div>
              <input
                type="range"
                min={50}
                max={90}
                step={5}
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="accent-indigo-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            <button
              onClick={handleExecute}
              disabled={isLoading}
              className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-2.5 font-bold text-slate-950 shadow-lg shadow-emerald-500/20 hover:brightness-110 active:scale-95 transition disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw size={17} className="animate-spin text-slate-950" />
                  <span>Evaluating Batch...</span>
                </>
              ) : (
                <>
                  <Zap size={17} className="fill-slate-950" />
                  <span>Execute Simulation</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Simulation Results Summary Bar */}
        {lastResult && (
          <div className="mt-6 pt-6 border-t border-slate-800/80">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[11px] uppercase font-semibold text-slate-400">Total at Risk</span>
                <p className="text-lg font-bold text-amber-400 font-mono mt-0.5">
                  ${lastResult.total_at_risk.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-emerald-500/30 glow-emerald">
                <span className="text-[11px] uppercase font-semibold text-emerald-400">Total Reclaimed</span>
                <p className="text-lg font-bold text-emerald-300 font-mono mt-0.5">
                  ${lastResult.total_reclaimed.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[11px] uppercase font-semibold text-slate-400">Recovery Rate</span>
                <p className="text-lg font-bold text-indigo-400 font-mono mt-0.5">
                  {lastResult.recovery_rate_pct.toFixed(1)}%
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[11px] uppercase font-semibold text-slate-400">AI Compute Cost</span>
                <p className="text-lg font-bold text-slate-300 font-mono mt-0.5">
                  ${lastResult.estimated_cost_of_recovery.toFixed(2)}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[11px] uppercase font-semibold text-slate-400">Net ROI Multiple</span>
                <p className="text-lg font-bold text-cyan-400 font-mono mt-0.5">
                  {lastResult.net_roi_multiple}x
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[11px] uppercase font-semibold text-slate-400">Stopping Rules</span>
                <p className="text-lg font-bold text-purple-400 font-mono mt-0.5">
                  {lastResult.stopping_rules_triggered} Triggered
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Batch Cases Execution Table */}
      {lastResult && lastResult.cases && (
        <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">
                Live Batch Execution Stream ({lastResult.cases.length} Cases Processed)
              </h3>
              <p className="text-xs text-slate-400">
                Every case executes through LangGraph context enrichment, AI diagnosis, confidence check, and bounded execution.
              </p>
            </div>
            <span className="text-xs text-emerald-400 font-mono font-semibold">
              ● Live Stream Active
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/80 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Case ID & Customer</th>
                  <th className="py-3 px-4">Leakage Scenario</th>
                  <th className="py-3 px-4">Root Cause Diagnosis</th>
                  <th className="py-3 px-4 text-right">At Risk</th>
                  <th className="py-3 px-4 text-right">Reclaimed</th>
                  <th className="py-3 px-4">Channel & Intervention</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {lastResult.cases.map((c) => (
                  <tr key={c.case_id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{c.customer_name}</div>
                      <div className="text-[11px] font-mono text-slate-400">{c.case_id}</div>
                    </td>
                    <td className="py-3.5 px-4">{getScenarioBadge(c.scenario)}</td>
                    <td className="py-3.5 px-4 max-w-xs truncate text-xs text-slate-300" title={c.root_cause}>
                      {c.root_cause}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-amber-400 font-semibold">
                      ${c.amount_at_risk.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-emerald-400 font-bold">
                      ${c.amount_reclaimed.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4">
                      {getChannelBadge(c.channel_used)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        <CheckCircle2 size={12} className="mr-1" /> Reclaimed
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          onClick={() => onInspectCase(c.case_id)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                          title="Inspect LangGraph Execution Trace"
                        >
                          <Eye size={15} />
                        </button>
                        {c.has_voice_call && onOpenVoiceModalForCase && (
                          <button
                            onClick={() => onOpenVoiceModalForCase(c.customer_name, c.amount_at_risk)}
                            className="p-1.5 rounded-lg bg-purple-900/50 hover:bg-purple-800 text-purple-300 hover:text-white transition"
                            title="Play Hinglish Voice Call"
                          >
                            <PhoneCall size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

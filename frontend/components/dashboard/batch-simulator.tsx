"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Zap, CheckCircle2, PhoneCall, RefreshCw, Eye, Sparkles } from "lucide-react";
import { SimulationResult } from "@/types/api";

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

  const triggerCelebration = () => {
    confetti({
      particleCount: 80,
      spread: 80,
      origin: { y: 0.6 },
      colors: ["#10b981", "#6366f1", "#06b6d4", "#f59e0b"],
    });
  };

  const handleExecute = async () => {
    setIsLoading(true);
    try {
      const res = await onRunBatch(batchSize, threshold / 100);
      if (res && res.recovery_rate_pct >= 80) {
        triggerCelebration();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getScenarioBadge = (sc: string) => {
    switch (sc) {
      case "payment_degradation":
        return <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">Payment Degradation</span>;
      case "checkout_dropoff":
        return <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">Checkout Drop-off</span>;
      case "failed_subscription":
        return <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">Failed Subscription</span>;
      case "b2b_receivables":
        return <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">B2B Receivables</span>;
      case "mandate_sequencer":
        return <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">Mandate Sequencer</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-700 text-slate-300">{sc}</span>;
    }
  };

  const getChannelBadge = (ch: string) => {
    switch (ch) {
      case "hinglish_voice":
        return <span className="inline-flex items-center space-x-1 text-xs font-semibold text-purple-300 bg-purple-950/60 border border-purple-800 px-2.5 py-0.5 rounded-full"><PhoneCall size={12} className="mr-1" /> Hinglish Voice</span>;
      case "dynamic_incentive":
        return <span className="inline-flex items-center space-x-1 text-xs font-semibold text-amber-300 bg-amber-950/60 border border-amber-800 px-2.5 py-0.5 rounded-full">🎟️ Bounded 10% Off</span>;
      case "whatsapp_sms":
        return <span className="inline-flex items-center space-x-1 text-xs font-semibold text-emerald-300 bg-emerald-950/60 border border-emerald-800 px-2.5 py-0.5 rounded-full">💬 WhatsApp 1-Click</span>;
      case "b2b_invoice_chaser":
        return <span className="inline-flex items-center space-x-1 text-xs font-semibold text-cyan-300 bg-cyan-950/60 border border-cyan-800 px-2.5 py-0.5 rounded-full">📑 B2B PTP Chaser</span>;
      default:
        return <span className="inline-flex items-center space-x-1 text-xs font-semibold text-indigo-300 bg-indigo-950/60 border border-indigo-800 px-2.5 py-0.5 rounded-full">⚡ Smart Gateway Retry</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Simulation Controls Panel */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-3xl p-6 md:p-8 border border-slate-800"
      >
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center space-x-2.5 font-['Outfit']">
              <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Zap size={22} />
              </span>
              <span>Multi-Scenario Autonomous Batch Recovery Engine</span>
            </h2>
            <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
              Test &quot;The Bar&quot;: Simulate mixed batches across payment failures, checkout drop-offs, subscriptions & B2B receivables to measure net money reclaimed with guardrails.
            </p>
          </div>

          {/* Sliders & Trigger */}
          <div className="flex flex-wrap items-center gap-5 w-full lg:w-auto">
            {/* Batch Size Slider */}
            <div className="flex flex-col space-y-1.5 min-w-[140px]">
              <div className="flex justify-between text-xs text-slate-300">
                <span className="font-semibold">Batch Size</span>
                <strong className="text-emerald-400 font-mono">{batchSize} Cases</strong>
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
            <div className="flex flex-col space-y-1.5 min-w-[140px]">
              <div className="flex justify-between text-xs text-slate-300">
                <span className="font-semibold">Confidence Floor</span>
                <strong className="text-indigo-400 font-mono">{threshold}%</strong>
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

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleExecute}
              disabled={isLoading}
              className="flex items-center space-x-2 rounded-2xl bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500 px-6 py-3.5 font-black text-slate-950 shadow-xl shadow-emerald-500/25 hover:brightness-110 transition disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw size={18} className="animate-spin text-slate-950" />
                  <span>Evaluating Batch...</span>
                </>
              ) : (
                <>
                  <Zap size={18} className="fill-slate-950" />
                  <span>Execute Simulation</span>
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* Dynamic Loading Progress Bar */}
        {isLoading && (
          <div className="mt-6 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-300 mb-2">
              <span className="flex items-center space-x-2 font-semibold">
                <Sparkles size={14} className="text-emerald-400 animate-spin" />
                <span>Running LangGraph Diagnostic Pipeline across {batchSize} cases...</span>
              </span>
              <span className="font-mono text-emerald-400">Evaluating Stopping Rules...</span>
            </div>
            <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 via-indigo-500 to-emerald-500 w-full animate-pulse" />
            </div>
          </div>
        )}

        {/* Live Simulation Results Summary Bar */}
        {lastResult && !isLoading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 pt-6 border-t border-slate-800/80"
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 shadow-inner">
                <span className="text-[11px] uppercase font-bold text-slate-400">Total at Risk</span>
                <p className="text-xl font-black text-amber-400 font-mono mt-1">
                  ${lastResult.total_at_risk.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/70 border border-emerald-500/40 glow-emerald shadow-inner">
                <span className="text-[11px] uppercase font-bold text-emerald-400">Total Reclaimed</span>
                <p className="text-xl font-black text-emerald-300 font-mono mt-1">
                  ${lastResult.total_reclaimed.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 shadow-inner">
                <span className="text-[11px] uppercase font-bold text-slate-400">Recovery Rate</span>
                <p className="text-xl font-black text-indigo-400 font-mono mt-1">
                  {lastResult.recovery_rate_pct.toFixed(1)}%
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 shadow-inner">
                <span className="text-[11px] uppercase font-bold text-slate-400">AI Compute Cost</span>
                <p className="text-xl font-black text-slate-300 font-mono mt-1">
                  ${lastResult.estimated_cost_of_recovery.toFixed(2)}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 shadow-inner">
                <span className="text-[11px] uppercase font-bold text-slate-400">Net ROI Multiple</span>
                <p className="text-xl font-black text-cyan-400 font-mono mt-1">
                  {lastResult.net_roi_multiple}x
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 shadow-inner">
                <span className="text-[11px] uppercase font-bold text-slate-400">Stopping Rules</span>
                <p className="text-xl font-black text-purple-400 font-mono mt-1">
                  {lastResult.stopping_rules_triggered} Evaluated
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Batch Cases Execution Table */}
      {lastResult && lastResult.cases && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-3xl border border-slate-800 overflow-hidden shadow-2xl"
        >
          <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
            <div>
              <h3 className="text-base font-bold text-white font-['Outfit']">
                Live Batch Execution Stream ({lastResult.cases.length} Cases Processed)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Every case executes through LangGraph context enrichment, AI diagnosis, confidence check, and bounded execution.
              </p>
            </div>
            <span className="inline-flex items-center space-x-1.5 text-xs text-emerald-400 font-mono font-bold bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Live Stream Active</span>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/90 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Case ID & Customer</th>
                  <th className="py-3.5 px-4">Leakage Scenario</th>
                  <th className="py-3.5 px-4">Root Cause Diagnosis</th>
                  <th className="py-3.5 px-4 text-right">At Risk</th>
                  <th className="py-3.5 px-4 text-right">Reclaimed</th>
                  <th className="py-3.5 px-4">Channel & Intervention</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                <AnimatePresence>
                  {lastResult.cases.map((c, idx) => (
                    <motion.tr
                      key={c.case_id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className="hover:bg-slate-800/50 transition duration-150"
                    >
                      <td className="py-4 px-4">
                        <div className="font-bold text-white">{c.customer_name}</div>
                        <div className="text-[11px] font-mono text-slate-400">{c.case_id}</div>
                      </td>
                      <td className="py-4 px-4">{getScenarioBadge(c.scenario)}</td>
                      <td className="py-4 px-4 max-w-xs truncate text-xs text-slate-300" title={c.root_cause}>
                        {c.root_cause}
                      </td>
                      <td className="py-4 px-4 text-right font-mono text-amber-400 font-bold">
                        ${c.amount_at_risk.toFixed(2)}
                      </td>
                      <td className="py-4 px-4 text-right font-mono text-emerald-400 font-black">
                        ${c.amount_reclaimed.toFixed(2)}
                      </td>
                      <td className="py-4 px-4">
                        {getChannelBadge(c.channel_used)}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          <CheckCircle2 size={13} className="mr-1" /> Reclaimed
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onInspectCase(c.case_id)}
                            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition shadow-md"
                            title="Inspect LangGraph Execution Trace"
                          >
                            <Eye size={15} />
                          </motion.button>
                          {c.has_voice_call && onOpenVoiceModalForCase && (
                            <motion.button
                              whileHover={{ scale: 1.15 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => onOpenVoiceModalForCase(c.customer_name, c.amount_at_risk)}
                              className="p-2 rounded-xl bg-purple-900/60 hover:bg-purple-800 text-purple-300 hover:text-white transition shadow-md"
                              title="Play Hinglish Voice Call"
                            >
                              <PhoneCall size={15} />
                            </motion.button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}

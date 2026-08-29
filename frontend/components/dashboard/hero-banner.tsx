"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Zap, CheckCircle2, ShieldCheck, PhoneCall, Sparkles, RefreshCw, Activity } from "lucide-react";
import { ScenarioPreset } from "@/types/api";

interface HeroBannerProps {
  onRunBatch: (batchSize: number) => void;
  onOpenVoiceModal: () => void;
  scenarios: ScenarioPreset[];
  onSelectScenario: (scenario: ScenarioPreset) => void;
  isSimulating: boolean;
}

export function HeroBanner({
  onRunBatch,
  onOpenVoiceModal,
  scenarios,
  onSelectScenario,
  isSimulating,
}: HeroBannerProps) {
  const [selectedSize, setSelectedSize] = useState<number>(8);

  const triggerCelebration = () => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.75 },
      colors: ["#10b981", "#6366f1", "#06b6d4", "#f59e0b"],
    });
  };

  const handleBatchClick = () => {
    triggerCelebration();
    onRunBatch(selectedSize);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative overflow-hidden rounded-3xl border border-slate-800/80 aurora-bg p-6 md:p-9 shadow-2xl backdrop-blur-2xl mb-8"
    >
      {/* Animated Border Beam */}
      <div className="border-beam" />

      {/* Ambient Radial Mesh Orbs */}
      <div className="pointer-events-none absolute -top-32 -right-32 h-[450px] w-[450px] rounded-full bg-indigo-500/20 blur-[100px] animate-pulse" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-[450px] w-[450px] rounded-full bg-emerald-500/20 blur-[100px] animate-pulse" />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
        {/* Left Section */}
        <div className="max-w-2xl space-y-4">
          {/* Live Heartbeat Badge */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center space-x-2.5 rounded-full border border-emerald-500/30 bg-emerald-950/60 px-4 py-1.5 text-xs font-bold text-emerald-300 backdrop-blur-xl shadow-lg shadow-emerald-950/50"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="radar-ping" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </span>
            <span className="tracking-wider">TRACK 03 — AUTONOMOUS AI REVENUE RECOVERY AGENT</span>
          </motion.div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white font-['Outfit'] leading-[1.15]">
            Reclaim <span className="gradient-text-emerald">Lost Revenue</span> with Bounded AI Precision
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            Close the loop from leak detection to root-cause diagnosis, multi-channel intervention (Hinglish Voice, Smart Retry, WhatsApp & B2B Chasers), and verified ROI with strict stopping rules.
          </p>

          {/* Real-time Telemetry Badges with stagger */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2 rounded-xl bg-slate-900/80 border border-slate-700/60 px-3.5 py-1.5 text-xs text-slate-200 shadow-md backdrop-blur-md"
            >
              <ShieldCheck size={15} className="text-indigo-400" />
              <span>Guardrails: <strong className="text-white">Strict 15% Cap</strong></span>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2 rounded-xl bg-slate-900/80 border border-slate-700/60 px-3.5 py-1.5 text-xs text-slate-200 shadow-md backdrop-blur-md"
            >
              <CheckCircle2 size={15} className="text-emerald-400" />
              <span>AI Confidence: <strong className="text-white">94.2% Avg</strong></span>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2 rounded-xl bg-slate-900/80 border border-slate-700/60 px-3.5 py-1.5 text-xs text-slate-200 shadow-md backdrop-blur-md"
            >
              <Sparkles size={15} className="text-cyan-400" />
              <span>Channels: <strong className="text-white">5 Active</strong></span>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2 rounded-xl bg-slate-900/80 border border-slate-700/60 px-3.5 py-1.5 text-xs text-slate-200 shadow-md backdrop-blur-md"
            >
              <Activity size={15} className="text-amber-400 animate-pulse" />
              <span>Avg Latency: <strong className="text-white">1.8s</strong></span>
            </motion.div>
          </div>
        </div>

        {/* Right Section: Action Controls */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-3.5 w-full lg:w-auto">
          {/* Batch Selector & Trigger */}
          <div className="flex items-center space-x-2.5 w-full">
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(Number(e.target.value))}
              disabled={isSimulating}
              className="bg-slate-900/90 border border-slate-700 text-white rounded-2xl px-3.5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner"
            >
              <option value={5}>Batch: 5 Cases</option>
              <option value={8}>Batch: 8 Cases</option>
              <option value={15}>Batch: 15 Cases</option>
              <option value={25}>Batch: 25 Cases</option>
            </select>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleBatchClick}
              disabled={isSimulating}
              className="flex-1 flex items-center justify-center space-x-2.5 rounded-2xl bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500 px-7 py-3.5 font-extrabold text-slate-950 shadow-xl shadow-emerald-500/25 hover:brightness-110 transition disabled:opacity-50"
            >
              {isSimulating ? (
                <>
                  <RefreshCw size={19} className="animate-spin text-slate-950" />
                  <span>Processing Batch...</span>
                </>
              ) : (
                <>
                  <Zap size={19} className="fill-slate-950" />
                  <span>Run Batch Recovery ⚡</span>
                </>
              )}
            </motion.button>
          </div>

          {/* Voice Demo Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpenVoiceModal}
            className="flex items-center justify-center space-x-2 rounded-2xl border border-purple-500/40 bg-purple-950/50 hover:bg-purple-900/60 px-6 py-3 text-sm font-bold text-purple-200 hover:text-white transition w-full shadow-lg shadow-purple-950/40 backdrop-blur-md"
          >
            <PhoneCall size={16} className="text-purple-400" />
            <span>Simulate Hinglish Voice Call 🎙️</span>
          </motion.button>
        </div>
      </div>

      {/* Scenario Presets Quick Bar */}
      {scenarios && scenarios.length > 0 && (
        <div className="mt-8 pt-6 border-t border-slate-800/80">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
              <Sparkles size={13} className="text-indigo-400" />
              <span>One-Click Scenario Testing</span>
            </span>
            <span className="text-xs text-slate-400 font-medium">Click any preset for instant diagnosis & recovery</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {scenarios.map((sc, idx) => (
              <motion.button
                key={sc.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelectScenario(sc)}
                className="flex flex-col text-left p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/90 border border-slate-700/60 hover:border-emerald-500/50 transition group shadow-md"
              >
                <span className="text-xs font-bold text-slate-200 group-hover:text-emerald-300 truncate">
                  {sc.title}
                </span>
                <span className="text-[11px] text-slate-400 font-mono mt-1">
                  ${sc.sample_amount.toLocaleString()} • {sc.channel.replace("_", " ")}
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

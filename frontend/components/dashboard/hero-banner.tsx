"use client";

import React, { useState } from "react";
import { Zap, Play, CheckCircle2, ShieldCheck, PhoneCall, Sparkles, RefreshCw } from "lucide-react";
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

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 p-6 md:p-8 shadow-2xl backdrop-blur-xl mb-8">
      {/* Background ambient glowing orbs */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-indigo-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-emerald-500/15 blur-3xl" />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* Left Section: Platform Title & Value Prop */}
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center space-x-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-400 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span>TRACK 03 — AUTONOMOUS REVENUE RECOVERY AGENT</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white font-['Outfit']">
            Reclaim <span className="gradient-text-emerald">Lost Revenue</span> with Bounded AI Precision
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Close the loop from leak detection to root-cause diagnosis, multi-channel intervention (Hinglish Voice, Smart Retry, WhatsApp & B2B Chasers), and verified ROI with strict stopping rules.
          </p>

          {/* Real-time Telemetry Pills */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <div className="flex items-center space-x-2 rounded-lg bg-slate-800/80 border border-slate-700/60 px-3 py-1.5 text-xs text-slate-200">
              <ShieldCheck size={15} className="text-indigo-400" />
              <span>Guardrails: <strong className="text-white">Strict 15% Cap</strong></span>
            </div>
            <div className="flex items-center space-x-2 rounded-lg bg-slate-800/80 border border-slate-700/60 px-3 py-1.5 text-xs text-slate-200">
              <CheckCircle2 size={15} className="text-emerald-400" />
              <span>AI Confidence: <strong className="text-white">94.2% Avg</strong></span>
            </div>
            <div className="flex items-center space-x-2 rounded-lg bg-slate-800/80 border border-slate-700/60 px-3 py-1.5 text-xs text-slate-200">
              <Sparkles size={15} className="text-cyan-400" />
              <span>Channels: <strong className="text-white">5 Active</strong></span>
            </div>
          </div>
        </div>

        {/* Right Section: Action Controls */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-3 w-full lg:w-auto">
          {/* Batch Simulation Button */}
          <div className="flex items-center space-x-2 w-full">
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(Number(e.target.value))}
              disabled={isSimulating}
              className="bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value={5}>Batch: 5 Cases</option>
              <option value={8}>Batch: 8 Cases</option>
              <option value={15}>Batch: 15 Cases</option>
              <option value={25}>Batch: 25 Cases</option>
            </select>

            <button
              onClick={() => onRunBatch(selectedSize)}
              disabled={isSimulating}
              className="flex-1 flex items-center justify-center space-x-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-3 font-bold text-slate-950 shadow-lg shadow-emerald-500/20 hover:brightness-110 active:scale-[0.98] transition disabled:opacity-50"
            >
              {isSimulating ? (
                <>
                  <RefreshCw size={18} className="animate-spin text-slate-950" />
                  <span>Processing Batch...</span>
                </>
              ) : (
                <>
                  <Zap size={18} className="fill-slate-950" />
                  <span>Run Batch Recovery ⚡</span>
                </>
              )}
            </button>
          </div>

          {/* Voice Recovery Demo Button */}
          <button
            onClick={onOpenVoiceModal}
            className="flex items-center justify-center space-x-2 rounded-xl border border-indigo-500/40 bg-indigo-950/60 px-5 py-2.5 text-sm font-semibold text-indigo-300 hover:bg-indigo-900/60 hover:text-white transition w-full"
          >
            <PhoneCall size={16} className="text-indigo-400" />
            <span>Simulate Hinglish Voice Call 🎙️</span>
          </button>
        </div>
      </div>

      {/* Scenario Presets Quick Bar */}
      {scenarios && scenarios.length > 0 && (
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              One-Click Scenario Testing
            </span>
            <span className="text-xs text-slate-400">Click any preset to trigger instant AI diagnosis</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
            {scenarios.map((sc) => (
              <button
                key={sc.id}
                onClick={() => onSelectScenario(sc)}
                className="flex flex-col text-left p-2.5 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-indigo-500/50 transition group"
              >
                <span className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300 truncate">
                  {sc.title}
                </span>
                <span className="text-[11px] text-slate-400 font-mono mt-0.5">
                  ${sc.sample_amount.toLocaleString()} • {sc.channel.replace("_", " ")}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

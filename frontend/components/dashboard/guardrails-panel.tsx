"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, AlertOctagon, Sliders, CheckCircle2, Lock, Save } from "lucide-react";
import { GuardrailsConfig } from "@/types/api";
import api from "@/services/api";

interface GuardrailsPanelProps {
  initialConfig?: GuardrailsConfig;
  onConfigUpdated?: (config: GuardrailsConfig) => void;
}

export function GuardrailsPanel({ initialConfig, onConfigUpdated }: GuardrailsPanelProps) {
  const [config, setConfig] = useState<GuardrailsConfig>(
    initialConfig || {
      max_retries: 3,
      cooling_off_hours: 24,
      discount_ceiling_pct: 15,
      anti_harassment_daily_limit: 2,
      auto_escalate_fraud: true,
      active_channels: ["smart_retry", "hinglish_voice", "whatsapp_sms", "dynamic_incentive", "b2b_invoice_chaser"],
    }
  );

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (initialConfig) {
      setConfig(initialConfig);
    }
  }, [initialConfig]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updated = await api.updateGuardrails(config);
      setConfig(updated);
      setSavedSuccess(true);
      if (onConfigUpdated) onConfigUpdated(updated);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e) {
      console.error("Save guardrails error:", e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="glass-card rounded-2xl border border-slate-800 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center space-x-2 font-['Outfit']">
            <ShieldCheck className="text-emerald-400" size={22} />
            <span>Autonomous Safety Guardrails & Stopping Rules</span>
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Enforcing strict financial boundaries, compliance cooling-off windows, and auto-escalation stopping rules.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center space-x-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 font-bold text-xs text-white transition disabled:opacity-50"
        >
          {savedSuccess ? (
            <>
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span>Guardrails Applied!</span>
            </>
          ) : (
            <>
              <Save size={16} />
              <span>{isSaving ? "Saving..." : "Save Guardrails"}</span>
            </>
          )}
        </button>
      </div>

      {/* Sliders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Max Retries */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">Max Gateway Retries</span>
            <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {config.max_retries} Attempts
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={5}
            value={config.max_retries}
            onChange={(e) => setConfig({ ...config, max_retries: Number(e.target.value) })}
            className="w-full accent-indigo-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
          />
          <p className="text-[11px] text-slate-400">
            Halts blind retries to eliminate card issuer penalties and avoid user friction.
          </p>
        </div>

        {/* Cooling-off hours */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">Cooling-Off Gap</span>
            <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              {config.cooling_off_hours} Hours
            </span>
          </div>
          <input
            type="range"
            min={6}
            max={48}
            step={6}
            value={config.cooling_off_hours}
            onChange={(e) => setConfig({ ...config, cooling_off_hours: Number(e.target.value) })}
            className="w-full accent-purple-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
          />
          <p className="text-[11px] text-slate-400">
            Mandatory delay after low balance / insufficient funds failure before next retry.
          </p>
        </div>

        {/* Dynamic Discount Ceiling */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-emerald-500/30 glow-emerald space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-300">Max Discount Ceiling</span>
            <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              {config.discount_ceiling_pct}% Max
            </span>
          </div>
          <input
            type="range"
            min={5}
            max={20}
            step={1}
            value={config.discount_ceiling_pct}
            onChange={(e) => setConfig({ ...config, discount_ceiling_pct: Number(e.target.value) })}
            className="w-full accent-emerald-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
          />
          <p className="text-[11px] text-slate-300">
            Hard financial ceiling: dynamic checkout coupon offers can NEVER exceed this limit.
          </p>
        </div>

        {/* Anti-Harassment Limit */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">Outreach Frequency</span>
            <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              {config.anti_harassment_daily_limit} Msgs/Day
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={4}
            value={config.anti_harassment_daily_limit}
            onChange={(e) => setConfig({ ...config, anti_harassment_daily_limit: Number(e.target.value) })}
            className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
          />
          <p className="text-[11px] text-slate-400">
            Prevents customer fatigue across conversational voice calls, SMS, and WhatsApp.
          </p>
        </div>
      </div>

      {/* Rules Governance Cards */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Lock className="text-indigo-400" size={20} />
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Automatic Stopping Rules Engine Active
            </h4>
            <p className="text-xs text-slate-400">
              Every workflow step evaluates compliance rules. Any fraud alert or harassment threshold breach immediately halts automated bots and routes to a human officer.
            </p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          ● 100% Policy Compliant
        </span>
      </div>
    </div>
  );
}

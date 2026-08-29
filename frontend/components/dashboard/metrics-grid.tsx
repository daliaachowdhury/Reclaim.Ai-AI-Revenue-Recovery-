"use client";

import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, AlertTriangle, CheckCircle2, ShieldAlert, CalendarClock } from "lucide-react";
import { DashboardMetrics } from "@/types/api";

interface MetricsGridProps {
  metrics: DashboardMetrics;
  ptpValue?: number;
}

export function MetricsGrid({ metrics, ptpValue = 48200 }: MetricsGridProps) {
  const cards = [
    {
      title: "Total Revenue at Risk",
      value: `$${metrics.total_at_risk?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}`,
      subtext: `${metrics.total_cases || 0} Total Cases Tracked`,
      icon: AlertTriangle,
      color: "text-amber-400",
      bgGradient: "from-amber-500/15 via-amber-500/5 to-transparent",
      borderColor: "border-amber-500/30",
    },
    {
      title: "Total Money Reclaimed",
      value: `$${metrics.total_recovered?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}`,
      subtext: `${metrics.completed_cases || 0} Successfully Recovered`,
      icon: TrendingUp,
      color: "text-emerald-400",
      bgGradient: "from-emerald-500/20 via-emerald-500/5 to-transparent",
      borderColor: "border-emerald-500/50 glow-emerald",
      badge: "Measured ROI",
    },
    {
      title: "Net Recovery Rate",
      value: `${metrics.success_rate?.toFixed(1) || "0.0"}%`,
      subtext: "Across All 5 Leak Channels",
      icon: CheckCircle2,
      color: "text-indigo-400",
      bgGradient: "from-indigo-500/15 via-indigo-500/5 to-transparent",
      borderColor: "border-indigo-500/30",
    },
    {
      title: "Prevented Churn Value",
      value: `$${(metrics.prevented_churn_value || (metrics.total_recovered * 1.8)).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtext: "High-LTV Customer Retentions",
      icon: ShieldAlert,
      color: "text-cyan-400",
      bgGradient: "from-cyan-500/15 via-cyan-500/5 to-transparent",
      borderColor: "border-cyan-500/30",
    },
    {
      title: "Promise-to-Pay (PTP) Ledger",
      value: `$${ptpValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtext: "Committed Auto-Mandate Pipeline",
      icon: CalendarClock,
      color: "text-purple-400",
      bgGradient: "from-purple-500/15 via-purple-500/5 to-transparent",
      borderColor: "border-purple-500/30",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08, duration: 0.4 }}
            whileHover={{ scale: 1.025, y: -4 }}
            className={`relative overflow-hidden rounded-2xl border bg-gradient-to-b ${card.bgGradient} bg-slate-900/90 p-5 shadow-xl backdrop-blur-xl transition-all ${card.borderColor}`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {card.title}
              </span>
              <div className={`p-2 rounded-xl bg-slate-800/90 border border-slate-700/60 shadow-md ${card.color}`}>
                <Icon size={18} />
              </div>
            </div>

            <div className="flex items-baseline space-x-2">
              <h2 className={`text-2xl lg:text-3xl font-black font-['Outfit'] tracking-tight ${card.color}`}>
                {card.value}
              </h2>
            </div>

            <div className="mt-2.5 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">{card.subtext}</span>
              {card.badge && (
                <span className="inline-flex items-center rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                  {card.badge}
                </span>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

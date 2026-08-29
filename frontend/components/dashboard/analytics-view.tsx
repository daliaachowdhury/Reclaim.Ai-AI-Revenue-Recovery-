"use client";

import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { TrendingUp, PieChart as PieIcon, BarChart3, Layers } from "lucide-react";
import { DashboardMetrics } from "@/types/api";

interface AnalyticsViewProps {
  metrics: DashboardMetrics;
}

const RECOVERY_TREND_DATA = [
  { date: "Day 1", at_risk: 12000, recovered: 9800 },
  { date: "Day 5", at_risk: 18500, recovered: 16200 },
  { date: "Day 10", at_risk: 29000, recovered: 26100 },
  { date: "Day 15", at_risk: 42000, recovered: 38400 },
  { date: "Day 20", at_risk: 61000, recovered: 55900 },
  { date: "Day 25", at_risk: 84000, recovered: 76800 },
  { date: "Day 30", at_risk: 112000, recovered: 104500 },
];

const CHANNEL_PERFORMANCE_DATA = [
  { channel: "Smart Retry", recovered: 42500, success_rate: 92 },
  { channel: "Hinglish Voice", recovered: 31200, success_rate: 88 },
  { channel: "WhatsApp 1-Click", recovered: 18900, success_rate: 84 },
  { channel: "B2B Invoice PTP", recovered: 64000, success_rate: 91 },
  { channel: "Bounded Incentive", recovered: 14800, success_rate: 86 },
];

const SCENARIO_DISTRIBUTION_DATA = [
  { name: "Payment Degradation", value: 38, color: "#3b82f6" },
  { name: "B2B Receivables", value: 26, color: "#10b981" },
  { name: "Checkout Drop-off", value: 16, color: "#f59e0b" },
  { name: "Failed Subscription", value: 12, color: "#8b5cf6" },
  { name: "Mandate Timing", value: 8, color: "#06b6d4" },
];

export function AnalyticsView({ metrics }: AnalyticsViewProps) {
  return (
    <div className="space-y-6">
      {/* Top Chart: Cumulative 30-Day Recovery Growth */}
      <div className="glass-card rounded-2xl border border-slate-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <TrendingUp className="text-emerald-400" size={18} />
              <span>Cumulative Recovery Velocity vs Revenue at Risk (30 Days)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Autonomous AI intervention keeps pace with incoming payment and checkout degradation.
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full">
            +91.4% Net Capture
          </span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={RECOVERY_TREND_DATA}>
              <defs>
                <linearGradient id="colorRecovered" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorAtRisk" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#64748b" textAnchor="end" tick={{ fill: "#94a3b8", fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 11 }} tickFormatter={(v) => `$${v / 1000}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", color: "#fff" }}
                formatter={(val: any) => [`$${Number(val).toLocaleString()}`, ""]}
              />
              <Legend wrapperStyle={{ color: "#94a3b8", fontSize: "12px" }} />
              <Area type="monotone" dataKey="recovered" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRecovered)" name="Total Money Reclaimed ($)" />
              <Area type="monotone" dataKey="at_risk" stroke="#818cf8" strokeWidth={1.5} fillOpacity={1} fill="url(#colorAtRisk)" name="Revenue at Risk ($)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Channel Breakdown */}
        <div className="glass-card rounded-2xl border border-slate-800 p-6">
          <h3 className="text-base font-bold text-white flex items-center space-x-2 mb-1">
            <BarChart3 className="text-indigo-400" size={18} />
            <span>Money Reclaimed by Intervention Channel</span>
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Comparing Smart Gateway Retry, Voice AI, WhatsApp & B2B Chasers.
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CHANNEL_PERFORMANCE_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="channel" stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 11 }} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", color: "#fff" }}
                  formatter={(val: any) => [`$${Number(val).toLocaleString()}`, "Recovered"]}
                />
                <Bar dataKey="recovered" fill="#6366f1" radius={[6, 6, 0, 0]} name="Reclaimed Amount ($)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Leakage Scenario Distribution */}
        <div className="glass-card rounded-2xl border border-slate-800 p-6">
          <h3 className="text-base font-bold text-white flex items-center space-x-2 mb-1">
            <PieIcon className="text-cyan-400" size={18} />
            <span>Revenue Leakage Scenario Distribution</span>
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Proportion of revenue at risk across the 5 core problem directions.
          </p>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={SCENARIO_DISTRIBUTION_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {SCENARIO_DISTRIBUTION_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", color: "#fff" }}
                  formatter={(v: any) => [`${v}% of incidents`, "Share"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

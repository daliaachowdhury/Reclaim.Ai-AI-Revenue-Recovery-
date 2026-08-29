"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Zap,
  PhoneCall,
  CalendarClock,
  ShieldCheck,
  BarChart3,
  FileSpreadsheet,
  Settings,
  Sparkles,
  Menu,
  X,
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
}

export default function Sidebar({ activeTab, onSelectTab }: SidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { id: "overview", label: "Executive Overview", icon: LayoutDashboard },
    { id: "batch_sim", label: "Batch Recovery Engine", icon: Zap, badge: "The Bar" },
    { id: "voice_studio", label: "Hinglish Voice AI", icon: PhoneCall, badge: "Voice" },
    { id: "ptp_ledger", label: "Promise-to-Pay (PTP)", icon: CalendarClock },
    { id: "guardrails", label: "Safety Guardrails", icon: ShieldCheck },
    { id: "analytics", label: "Recovery Analytics", icon: BarChart3 },
    { id: "cases", label: "Audit Log & Cases", icon: FileSpreadsheet },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-950 border-r border-slate-800/80 text-white min-h-screen">
        {/* Logo & Brand Header */}
        <div className="p-6 border-b border-slate-800/80 bg-gradient-to-b from-slate-900 to-slate-950">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-black text-slate-950 font-['Outfit'] text-xl shadow-lg shadow-emerald-500/20">
              R
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h1 className="text-xl font-extrabold font-['Outfit'] tracking-tight text-white">Reclaim</h1>
                <span className="text-[11px] font-bold text-emerald-400 font-mono bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.2 rounded">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Autonomous Revenue Recovery</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-6 space-y-1.5">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Recovery Workspace
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? "bg-gradient-to-r from-emerald-500/20 to-indigo-500/10 text-emerald-300 border border-emerald-500/30 glow-emerald"
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon size={17} className={isActive ? "text-emerald-400" : "text-slate-400"} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* System Pulse Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/80">
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Agent Heartbeat</span>
              <span className="flex items-center space-x-1 text-emerald-400 font-mono text-[11px]">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>ONLINE</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400">LangGraph v1.2 • MongoDB 6.0</p>
          </div>
        </div>
      </aside>

      {/* Mobile Toggle Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-white shadow-lg"
        >
          {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/80 backdrop-blur-md" onClick={() => setIsMobileOpen(false)}>
          <div className="w-64 h-full bg-slate-950 p-6 border-r border-slate-800" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-9 h-9 rounded-xl bg-emerald-400 text-slate-950 flex items-center justify-center font-bold">
                R
              </div>
              <span className="text-lg font-bold text-white">Reclaim.AI</span>
            </div>

            <div className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectTab(item.id);
                      setIsMobileOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold text-left transition ${
                      isActive ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "text-slate-400"
                    }`}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

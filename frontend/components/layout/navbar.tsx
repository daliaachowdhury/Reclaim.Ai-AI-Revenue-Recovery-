"use client";

import React from "react";
import { Bell, Search, Zap, ShieldCheck, Activity, PhoneCall, MessageSquare } from "lucide-react";

interface NavbarProps {
  onQuickSimulate?: () => void;
  onOpenVoiceStudio?: () => void;
}

export default function Navbar({ onQuickSimulate, onOpenVoiceStudio }: NavbarProps) {
  return (
    <header className="h-16 bg-slate-950/80 border-b border-slate-800/80 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Left: Active Channel Indicators */}
      <div className="flex items-center space-x-3 text-xs">
        <div className="hidden lg:flex items-center space-x-2 rounded-lg bg-slate-900 border border-slate-800 px-3 py-1.5 text-slate-300">
          <Activity size={14} className="text-emerald-400" />
          <span>Active Pipeline:</span>
          <strong className="text-white">5 Channels Listening</strong>
        </div>

        <div className="hidden sm:flex items-center space-x-1.5 text-[11px] text-slate-400">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Gateway Webhooks Connected</span>
        </div>
      </div>

      {/* Right Action Section */}
      <div className="flex items-center space-x-3">
        {onOpenVoiceStudio && (
          <button
            onClick={onOpenVoiceStudio}
            className="flex items-center space-x-1.5 rounded-lg bg-purple-950/60 border border-purple-800/80 px-3 py-1.5 text-xs font-semibold text-purple-300 hover:bg-purple-900/60 hover:text-white transition"
          >
            <PhoneCall size={14} />
            <span className="hidden sm:inline">Voice Studio</span>
          </button>
        )}

        {onQuickSimulate && (
          <button
            onClick={onQuickSimulate}
            className="flex items-center space-x-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 px-3 py-1.5 text-xs font-bold text-slate-950 shadow-md shadow-emerald-500/20 transition"
          >
            <Zap size={14} className="fill-slate-950" />
            <span>Simulate Batch</span>
          </button>
        )}

        <div className="h-6 w-px bg-slate-800 mx-1" />

        {/* Notifications */}
        <button className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-400 rounded-full" />
        </button>

        {/* User Pill */}
        <div className="flex items-center space-x-2 pl-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-emerald-400 flex items-center justify-center font-bold text-xs text-slate-950 font-mono">
            AI
          </div>
          <div className="hidden sm:block text-left">
            <span className="text-xs font-semibold text-white block leading-tight">Admin Console</span>
            <span className="text-[10px] text-emerald-400 font-mono">Enterprise Tier</span>
          </div>
        </div>
      </div>
    </header>
  );
}

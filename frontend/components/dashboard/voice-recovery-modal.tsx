"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, PhoneCall, Mic, Play, CheckCircle2, Sparkles, Volume2, Radio } from "lucide-react";
import { VoiceSimulationResponse } from "@/types/api";
import api from "@/services/api";

interface VoiceRecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCustomerName?: string;
  initialAmount?: number;
}

export function VoiceRecoveryModal({
  isOpen,
  onClose,
  initialCustomerName = "Priya Sharma",
  initialAmount = 3500,
}: VoiceRecoveryModalProps) {
  const [customerName, setCustomerName] = useState(initialCustomerName);
  const [amount, setAmount] = useState(initialAmount);
  const [callData, setCallData] = useState<VoiceSimulationResponse | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [visibleLineCount, setVisibleLineCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setCustomerName(initialCustomerName);
      setAmount(initialAmount);
      fetchCallData(initialCustomerName, initialAmount);
    } else {
      setIsPlaying(false);
      setVisibleLineCount(0);
    }
  }, [isOpen, initialCustomerName, initialAmount]);

  const fetchCallData = async (name: string, amt: number) => {
    setIsLoading(true);
    try {
      const data = await api.simulateVoiceCall(name, amt, "Hinglish");
      setCallData(data);
      setVisibleLineCount(data.dialogue.length);
    } catch (e) {
      console.error("Voice call fetch error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartSimulatedCall = () => {
    setIsPlaying(true);
    setVisibleLineCount(1);

    let count = 1;
    const interval = setInterval(() => {
      count += 1;
      setVisibleLineCount(count);
      if (callData && count >= callData.dialogue.length) {
        clearInterval(interval);
        setIsPlaying(false);
      }
    }, 2200);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="relative w-full max-w-3xl rounded-3xl border border-slate-700/80 bg-slate-950/95 shadow-2xl overflow-hidden text-white flex flex-col max-h-[90vh]"
        >
          {/* Animated Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/60">
            <div className="flex items-center space-x-3.5">
              <div className="relative p-3 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/40 glow-purple">
                <PhoneCall size={22} />
                {isPlaying && <span className="radar-ping" />}
              </div>
              <div>
                <h3 className="text-xl font-black font-['Outfit'] flex items-center space-x-2.5">
                  <span>Hinglish AI Voice Recovery Assistant</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Agent: Aarav (Bilingual)
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Autonomous conversational voice agent resolving payment friction, negotiating salary-cycle auto-debits, and booking Promise-to-Pay (PTP).
                </p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              <X size={20} />
            </motion.button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            {/* Quick Param Adjuster */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-inner">
              <div>
                <label className="text-xs text-slate-400 font-bold block mb-1">Customer Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-bold block mb-1">Amount ($ / ₹)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono font-bold"
                />
              </div>

              <div className="flex items-end">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => fetchCallData(customerName, amount)}
                  disabled={isLoading}
                  className="w-full py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition flex items-center justify-center space-x-1.5 shadow-lg shadow-purple-600/30"
                >
                  <Sparkles size={14} />
                  <span>Regenerate Dialogue</span>
                </motion.button>
              </div>
            </div>

            {/* High-Tech Audio Equalizer Waveform */}
            <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-950/40 via-slate-950 to-indigo-950/40 p-5 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2.5">
                  <Volume2 size={18} className="text-purple-400" />
                  <span className="text-sm font-bold text-purple-200">
                    {isPlaying ? "Simulating Live Call Audio Spectrum..." : "Voice Stream Spectrum"}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
                  <Radio size={13} className="text-emerald-400 animate-pulse" />
                  <span>WebRTC G.711 • 24kHz HD</span>
                </div>
              </div>

              {/* Dynamic Animated Frequency Equalizer Bars */}
              <div className="flex items-end justify-center space-x-1.5 h-16 bg-slate-950/90 rounded-xl p-3 border border-slate-800/80 mb-4 shadow-inner">
                {callData?.audio_wave_data.map((height, idx) => (
                  <div
                    key={idx}
                    className={`w-2.5 rounded-full transition-all duration-300 ${
                      isPlaying
                        ? "bg-gradient-to-t from-purple-500 via-indigo-400 to-emerald-400 eq-bar"
                        : "bg-slate-700"
                    }`}
                    style={{
                      height: isPlaying ? `${Math.max(15, height)}%` : "25%",
                      animationDelay: `${idx * 0.05}s`,
                      animationDuration: `${0.8 + (idx % 4) * 0.2}s`,
                    }}
                  />
                ))}
              </div>

              <div className="flex items-center justify-between">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleStartSimulatedCall}
                  disabled={isPlaying}
                  className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 via-indigo-600 to-purple-600 font-extrabold text-xs text-white hover:brightness-110 shadow-lg shadow-purple-500/30 transition disabled:opacity-50"
                >
                  {isPlaying ? <Mic className="animate-pulse text-rose-400" size={16} /> : <Play size={16} />}
                  <span>{isPlaying ? "Call in Progress..." : "Play Live Dialogue 🎙️"}</span>
                </motion.button>

                <div className="flex items-center space-x-2 text-xs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-full">
                  <CheckCircle2 size={15} />
                  <span>Customer Sentiment: <strong>Positive (94%)</strong></span>
                </div>
              </div>
            </div>

            {/* Turn-by-Turn Dialogue Message Stream */}
            {callData && (
              <div className="space-y-3.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
                  <Sparkles size={13} className="text-purple-400" />
                  <span>Turn-by-Turn Bilingual Dialogue Stream</span>
                </h4>

                <div className="space-y-3">
                  {callData.dialogue.slice(0, visibleLineCount).map((turn, idx) => {
                    const isAgent = turn.speaker.includes("AI Agent");
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className={`p-4 rounded-2xl border text-sm shadow-md ${
                          isAgent
                            ? "bg-gradient-to-br from-purple-950/50 to-slate-900 border-purple-500/40 text-purple-100 mr-8"
                            : "bg-slate-900/90 border-slate-700 text-slate-200 ml-8"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`text-xs font-black ${isAgent ? "text-purple-300" : "text-emerald-400"}`}>
                            {turn.speaker}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-950/60 px-2 py-0.5 rounded-md">
                            {turn.timestamp}
                          </span>
                        </div>
                        <p className="leading-relaxed text-[13px]">{turn.text}</p>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Promise-to-Pay Confirmation Card */}
            {callData?.outcome && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl border border-emerald-500/50 bg-emerald-950/40 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glow-emerald shadow-2xl"
              >
                <div>
                  <div className="flex items-center space-x-2 text-sm font-black text-emerald-300">
                    <CheckCircle2 size={18} />
                    <span>Promise-to-Pay (PTP) Confirmed & Logged</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Automated NACH / E-Mandate scheduled for <strong>{callData.outcome.ptp_date}</strong>. WhatsApp confirmation dispatched to customer.
                  </p>
                </div>

                <div className="text-right sm:border-l sm:border-emerald-500/30 sm:pl-5">
                  <span className="text-[11px] text-slate-400 uppercase font-bold">Amount Reclaimed</span>
                  <p className="text-2xl font-black text-emerald-400 font-mono">
                    ${callData.outcome.amount_reclaimed.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="p-5 border-t border-slate-800 bg-slate-950 flex items-center justify-end space-x-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition"
            >
              Close Studio
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

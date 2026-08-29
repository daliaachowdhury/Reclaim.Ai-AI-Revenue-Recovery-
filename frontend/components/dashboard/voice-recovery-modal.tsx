"use client";

import React, { useState, useEffect } from "react";
import { X, PhoneCall, PhoneOff, Mic, Play, Pause, CheckCircle2, Calendar, ShieldCheck, Sparkles, Volume2 } from "lucide-react";
import { VoiceSimulationResponse, VoiceDialogueLine } from "@/types/api";
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
  const [language, setLanguage] = useState("Hinglish");
  const [callData, setCallData] = useState<VoiceSimulationResponse | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [visibleLineCount, setVisibleLineCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setCustomerName(initialCustomerName);
      setAmount(initialAmount);
      fetchCallData(initialCustomerName, initialAmount, language);
    } else {
      setIsPlaying(false);
      setVisibleLineCount(0);
    }
  }, [isOpen, initialCustomerName, initialAmount]);

  const fetchCallData = async (name: string, amt: number, lang: string) => {
    setIsLoading(true);
    try {
      const data = await api.simulateVoiceCall(name, amt, lang);
      setCallData(data);
      setVisibleLineCount(data.dialogue.length); // initially show all
    } catch (e) {
      console.error("Voice call fetch error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartSimulatedCall = () => {
    setIsPlaying(true);
    setVisibleLineCount(1);

    // Progressive dialog playback animation
    let count = 1;
    const interval = setInterval(() => {
      count += 1;
      setVisibleLineCount(count);
      if (callData && count >= callData.dialogue.length) {
        clearInterval(interval);
        setIsPlaying(false);
      }
    }, 2400);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden text-white flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-900">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <PhoneCall size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold font-['Outfit'] flex items-center space-x-2">
                <span>Hinglish AI Voice Recovery Assistant</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Agent: Aarav (Bilingual)
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Autonomous conversational voice agent resolving payment friction, negotiating salary-cycle auto-debits, and booking Promise-to-Pay (PTP).
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Quick Param Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div>
              <label className="text-xs text-slate-400 font-semibold block mb-1">Customer Name</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 font-semibold block mb-1">Amount ($ / ₹)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={() => fetchCallData(customerName, amount, language)}
                disabled={isLoading}
                className="w-full py-2 px-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition flex items-center justify-center space-x-1"
              >
                <Sparkles size={14} />
                <span>Regenerate Dialogue</span>
              </button>
            </div>
          </div>

          {/* Voice Waveform & Playback Controls */}
          <div className="rounded-xl border border-purple-500/30 bg-gradient-to-r from-purple-950/30 via-slate-950 to-purple-950/30 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Volume2 size={18} className="text-purple-400" />
                <span className="text-sm font-semibold text-purple-200">
                  {isPlaying ? "Simulating Live Call Audio..." : "Call Audio Simulation"}
                </span>
              </div>
              <span className="text-xs font-mono text-slate-400">Duration: 00:46 • Codec: G.711 / WebRTC</span>
            </div>

            {/* Animated Audio Waveform Bars */}
            <div className="flex items-center justify-center space-x-1.5 h-12 bg-slate-950/80 rounded-lg p-2 border border-slate-800 mb-3">
              {callData?.audio_wave_data.map((height, idx) => (
                <div
                  key={idx}
                  className={`w-2.5 rounded-full transition-all duration-300 ${
                    isPlaying
                      ? "bg-gradient-to-t from-purple-500 to-emerald-400 wave-bar"
                      : "bg-slate-700"
                  }`}
                  style={{
                    height: isPlaying ? `${height}%` : "30%",
                    animationDelay: `${idx * 0.08}s`,
                  }}
                />
              ))}
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={handleStartSimulatedCall}
                disabled={isPlaying}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 font-bold text-xs text-white hover:brightness-110 transition disabled:opacity-50"
              >
                {isPlaying ? <Mic className="animate-pulse" size={15} /> : <Play size={15} />}
                <span>{isPlaying ? "Call in Progress..." : "Play Simulated Dialogue 🎙️"}</span>
              </button>

              <div className="flex items-center space-x-2 text-xs text-emerald-400">
                <CheckCircle2 size={14} />
                <span>Sentiment: <strong>Positive (94%)</strong></span>
              </div>
            </div>
          </div>

          {/* Dialogue Message Feed */}
          {callData && (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Live Turn-by-Turn Dialogue Transcript
              </h4>

              <div className="space-y-2.5">
                {callData.dialogue.slice(0, visibleLineCount).map((turn, idx) => {
                  const isAgent = turn.speaker.includes("AI Agent");
                  return (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl border text-sm transition animate-fade-in ${
                        isAgent
                          ? "bg-purple-950/40 border-purple-500/30 text-purple-100 mr-8"
                          : "bg-slate-800/80 border-slate-700 text-slate-200 ml-8"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-bold ${isAgent ? "text-purple-300" : "text-emerald-400"}`}>
                          {turn.speaker}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">{turn.timestamp}</span>
                      </div>
                      <p className="leading-relaxed">{turn.text}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Promise-to-Pay Confirmation Card */}
          {callData?.outcome && (
            <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 glow-emerald">
              <div>
                <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-300">
                  <CheckCircle2 size={16} />
                  <span>Promise-to-Pay (PTP) Successfully Logged</span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Automated NACH / E-Mandate scheduled for <strong>{callData.outcome.ptp_date}</strong>. WhatsApp confirmation dispatched to customer.
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400 uppercase">Amount Reclaimed</span>
                <p className="text-lg font-extrabold text-emerald-400 font-mono">
                  ${callData.outcome.amount_reclaimed.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition"
          >
            Close Studio
          </button>
        </div>
      </div>
    </div>
  );
}

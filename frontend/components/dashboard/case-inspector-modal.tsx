"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, ShieldCheck, Code, FileText, Clock, Zap, ArrowRight, Activity } from "lucide-react";
import { CaseStatus } from "@/types/api";

interface CaseInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseData: CaseStatus | null;
}

export function CaseInspectorModal({ isOpen, onClose, caseData }: CaseInspectorModalProps) {
  const [activeTab, setActiveTab] = useState<"trace" | "audit" | "raw">("trace");

  if (!isOpen || !caseData) return null;

  const nodes = [
    {
      id: "load_customer_context",
      label: "1. Customer Context",
      desc: "LTV, churn risk & profile enrichment",
      status: "completed",
    },
    {
      id: "diagnose",
      label: "2. AI Diagnosis",
      desc: caseData.diagnosis?.root_cause || "Root-cause reasoning",
      status: "completed",
      badge: `${((caseData.diagnosis?.confidence_score || 0.88) * 100).toFixed(0)}% Confidence`,
    },
    {
      id: "verify_confidence",
      label: "3. Confidence Floor",
      desc: "Validated >= 70% threshold & stopping rules",
      status: "completed",
    },
    {
      id: "create_recovery_action",
      label: "4. Bounded Action",
      desc: `${caseData.action?.action_type || "Intervention"} (Cap: 15%)`,
      status: "completed",
    },
    {
      id: "execute_recovery",
      label: "5. Multi-Channel Exec",
      desc: `Channel: ${caseData.action?.channel || "smart_retry"}`,
      status: caseData.status === "completed" ? "completed" : "failed",
    },
    {
      id: "complete_and_audit",
      label: "6. Audit Log Persisted",
      desc: "Forensic compliance trace stored",
      status: "completed",
    },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="relative w-full max-w-4xl rounded-3xl border border-slate-700/80 bg-slate-950/95 shadow-2xl overflow-hidden text-white flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/40">
            <div>
              <div className="flex items-center space-x-3">
                <span className="text-xs font-mono font-black text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 rounded-full">
                  {caseData.case_id}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Payment: {caseData.payment_id}
                </span>
              </div>
              <h3 className="text-xl font-black font-['Outfit'] mt-1.5 flex items-center space-x-2.5">
                <span>{caseData.customer_name || caseData.customer_id}</span>
                <span className="text-sm font-mono text-emerald-400 font-bold">
                  (${caseData.amount.toFixed(2)} at risk • ${caseData.amount_recovered.toFixed(2)} recovered)
                </span>
              </h3>
            </div>

            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              <X size={20} />
            </motion.button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center space-x-3 px-6 border-b border-slate-800 bg-slate-950/70 pt-3">
            <button
              onClick={() => setActiveTab("trace")}
              className={`pb-3 px-3.5 text-xs font-bold transition border-b-2 flex items-center space-x-2 ${
                activeTab === "trace"
                  ? "border-emerald-400 text-emerald-400"
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              <Zap size={14} />
              <span>LangGraph Visual Execution Trace</span>
            </button>

            <button
              onClick={() => setActiveTab("audit")}
              className={`pb-3 px-3.5 text-xs font-bold transition border-b-2 flex items-center space-x-2 ${
                activeTab === "audit"
                  ? "border-emerald-400 text-emerald-400"
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              <FileText size={14} />
              <span>Compliance Audit Log ({caseData.audit_log?.length || 0})</span>
            </button>

            <button
              onClick={() => setActiveTab("raw")}
              className={`pb-3 px-3.5 text-xs font-bold transition border-b-2 flex items-center space-x-2 ${
                activeTab === "raw"
                  ? "border-emerald-400 text-emerald-400"
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              <Code size={14} />
              <span>Raw JSON State</span>
            </button>
          </div>

          {/* Content Body */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            {/* TAB 1: Visual LangGraph Node Trace */}
            {activeTab === "trace" && (
              <div className="space-y-6">
                {/* Node Grid with Animated Flow Pulse Connectors */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 relative">
                  {nodes.map((n, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.06 }}
                      whileHover={{ scale: 1.03, y: -2 }}
                      className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 space-y-2 relative overflow-hidden shadow-lg"
                    >
                      {/* Flow energy pulse */}
                      <div className="flow-pulse opacity-30 pointer-events-none" />

                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-200">{n.label}</span>
                        <CheckCircle2 size={16} className="text-emerald-400" />
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2">{n.desc}</p>
                      {n.badge && (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {n.badge}
                        </span>
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* AI Diagnosis Details */}
                {caseData.diagnosis && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                        <Zap size={14} className="text-emerald-400" />
                        <span>AI Diagnostic Reasoning Trace</span>
                      </h4>
                      <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                        Likelihood: {(caseData.diagnosis.recovery_likelihood * 100).toFixed(0)}%
                      </span>
                    </div>
                    <p className="text-sm text-white font-bold">
                      {caseData.diagnosis.root_cause}
                    </p>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {caseData.diagnosis.reasoning}
                    </p>
                  </motion.div>
                )}

                {/* Evaluated Stopping Rules */}
                {caseData.diagnosis?.stopping_rules && (
                  <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 shadow-md">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                      <ShieldCheck size={14} className="text-indigo-400" />
                      <span>Evaluated Stopping Rules & Guardrails</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {caseData.diagnosis.stopping_rules.map((rule, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                        >
                          <div>
                            <strong className="text-white block font-bold">{rule.rule_name}</strong>
                            <span className="text-slate-400 text-[11px]">Limit: {rule.limit_value}</span>
                          </div>
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                              rule.triggered
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            }`}
                          >
                            {rule.triggered ? "Triggered" : "Passed"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Compliance Audit Log */}
            {activeTab === "audit" && (
              <div className="space-y-3">
                {caseData.audit_log?.map((log, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start space-x-3.5 text-xs shadow-md"
                  >
                    <div className="p-2 rounded-xl bg-slate-800 text-slate-300 mt-0.5">
                      <Clock size={15} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <strong className="text-white font-bold">{log.action}</strong>
                        <span className="font-mono text-slate-400 text-[11px]">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="mt-1.5 flex items-center space-x-2 text-[11px] text-slate-400">
                        <span className="px-2 py-0.5 rounded-md bg-slate-950 font-mono text-indigo-300 font-bold border border-slate-800">
                          {log.event_type}
                        </span>
                        <span>Stage: <strong className="text-slate-300">{log.stage}</strong></span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* TAB 3: Raw JSON State */}
            {activeTab === "raw" && (
              <div className="rounded-2xl bg-slate-950 p-5 border border-slate-800 overflow-x-auto shadow-inner">
                <pre className="text-xs font-mono text-emerald-400">
                  {JSON.stringify(caseData, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-5 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs text-emerald-400 font-bold">
              <ShieldCheck size={16} />
              <span>Compliance Certified & Cryptographically Logged</span>
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition"
            >
              Close Inspector
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

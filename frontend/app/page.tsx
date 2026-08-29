"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import Navbar from "@/components/layout/navbar";
import { HeroBanner } from "@/components/dashboard/hero-banner";
import { MetricsGrid } from "@/components/dashboard/metrics-grid";
import { BatchSimulator } from "@/components/dashboard/batch-simulator";
import { VoiceRecoveryModal } from "@/components/dashboard/voice-recovery-modal";
import { PtpLedger } from "@/components/dashboard/ptp-ledger";
import { GuardrailsPanel } from "@/components/dashboard/guardrails-panel";
import { CaseInspectorModal } from "@/components/dashboard/case-inspector-modal";
import { AnalyticsView } from "@/components/dashboard/analytics-view";
import { RecentCasesTable } from "@/components/dashboard/recent-cases-table";

import api from "@/services/api";
import {
  DashboardMetrics,
  CaseStatus,
  SimulationResult,
  ScenarioPreset,
  PromiseToPayItem,
  GuardrailsConfig,
} from "@/types/api";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [cases, setCases] = useState<CaseStatus[]>([]);
  const [scenarios, setScenarios] = useState<ScenarioPreset[]>([]);
  const [ptpItems, setPtpItems] = useState<PromiseToPayItem[]>([]);
  const [ptpValue, setPtpValue] = useState<number>(48200);
  const [guardrails, setGuardrails] = useState<GuardrailsConfig | undefined>(undefined);

  const [lastSimResult, setLastSimResult] = useState<SimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Modal States
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);
  const [voiceTargetCustomer, setVoiceTargetCustomer] = useState<string>("Priya Sharma");
  const [voiceTargetAmount, setVoiceTargetAmount] = useState<number>(3500);

  const [inspectCaseId, setInspectCaseId] = useState<string | null>(null);
  const [inspectCaseData, setInspectCaseData] = useState<CaseStatus | null>(null);

  // Load initial data
  useEffect(() => {
    loadAllData();
    const interval = setInterval(loadMetricsAndCases, 20000);
    return () => clearInterval(interval);
  }, []);

  const loadAllData = async () => {
    try {
      const [m, cData, scData, ptpData, gData] = await Promise.all([
        api.getDashboardMetrics(),
        api.getAllCases(30),
        api.getSimulationScenarios(),
        api.getPtpLedger(),
        api.getGuardrails(),
      ]);
      setMetrics(m);
      setCases(cData.cases || []);
      setScenarios(scData || []);
      setPtpItems(ptpData.commitments || []);
      setPtpValue(ptpData.total_ptp_value || 48200);
      setGuardrails(gData);
    } catch (e) {
      console.error("Data load error:", e);
    }
  };

  const loadMetricsAndCases = async () => {
    try {
      const [m, cData] = await Promise.all([
        api.getDashboardMetrics(),
        api.getAllCases(30),
      ]);
      setMetrics(m);
      setCases(cData.cases || []);
    } catch (e) {
      console.error("Periodic refresh error:", e);
    }
  };

  const handleRunBatch = async (batchSize: number, threshold: number = 0.70): Promise<SimulationResult | null> => {
    setIsSimulating(true);
    try {
      const res = await api.runBatchSimulation(batchSize, threshold);
      setLastSimResult(res);
      await loadMetricsAndCases();
      return res;
    } catch (e) {
      console.error("Batch simulation error:", e);
      return null;
    } finally {
      setIsSimulating(false);
    }
  };

  const handleSelectScenario = async (sc: ScenarioPreset) => {
    setIsSimulating(true);
    try {
      const res = await api.runBatchSimulation(1, 0.70);
      setLastSimResult(res);
      await loadMetricsAndCases();
      if (res && res.cases.length > 0) {
        handleInspectCase(res.cases[0].case_id);
      }
    } catch (e) {
      console.error("Scenario run error:", e);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleInspectCase = async (caseId: string) => {
    setInspectCaseId(caseId);
    try {
      const data = await api.getCaseStatus(caseId);
      setInspectCaseData(data);
    } catch (e) {
      // Find from local list
      const local = cases.find((c) => c.case_id === caseId);
      if (local) setInspectCaseData(local);
    }
  };

  const handleOpenVoiceForCustomer = (customerName: string, amount: number) => {
    setVoiceTargetCustomer(customerName);
    setVoiceTargetAmount(amount);
    setIsVoiceModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Navbar */}
        <Navbar
          onQuickSimulate={() => handleRunBatch(8)}
          onOpenVoiceStudio={() => handleOpenVoiceForCustomer("Priya Sharma", 3500)}
        />

        {/* Scrollable Workspace */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-8">
          {/* Always Render Hero Banner on Overview */}
          {activeTab === "overview" && (
            <>
              <HeroBanner
                onRunBatch={(size) => handleRunBatch(size)}
                onOpenVoiceModal={() => handleOpenVoiceForCustomer("Priya Sharma", 3500)}
                scenarios={scenarios}
                onSelectScenario={handleSelectScenario}
                isSimulating={isSimulating}
              />

              {metrics && <MetricsGrid metrics={metrics} ptpValue={ptpValue} />}

              {/* Quick Batch Simulator Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white font-['Outfit']">
                    Autonomous Batch Simulation & Proof of ROI
                  </h2>
                  <button
                    onClick={() => setActiveTab("batch_sim")}
                    className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition"
                  >
                    Open Full Engine →
                  </button>
                </div>

                <BatchSimulator
                  onRunBatch={handleRunBatch}
                  lastResult={lastSimResult}
                  onInspectCase={handleInspectCase}
                  onOpenVoiceModalForCase={handleOpenVoiceForCustomer}
                />
              </div>

              {/* Recent Recovery Cases Stream */}
              <div className="glass-card rounded-2xl border border-slate-800 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white font-['Outfit']">
                      Active Recovery Incident Stream & Audit Log
                    </h3>
                    <p className="text-xs text-slate-400">
                      Live audit entries with verified LangGraph reasoning traces and compliance certification.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("cases")}
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition"
                  >
                    View All Cases →
                  </button>
                </div>

                <RecentCasesTable
                  cases={cases}
                  onInspectCase={handleInspectCase}
                  onOpenVoiceModalForCase={handleOpenVoiceForCustomer}
                />
              </div>
            </>
          )}

          {/* TAB: BATCH SIMULATOR */}
          {activeTab === "batch_sim" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
                  Batch Recovery Simulator & Measured ROI
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                  Run large-scale multi-scenario recovery runs to demonstrate money reclaimed, cost of recovery, and stopping rules.
                </p>
              </div>

              <BatchSimulator
                onRunBatch={handleRunBatch}
                lastResult={lastSimResult}
                onInspectCase={handleInspectCase}
                onOpenVoiceModalForCase={handleOpenVoiceForCustomer}
              />
            </div>
          )}

          {/* TAB: HINGLISH VOICE STUDIO */}
          {activeTab === "voice_studio" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
                  Hinglish AI Voice Recovery Assistant
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                  Bilingual conversational voice agent negotiating salary date auto-retries, addressing gateway failures, and logging Promise-to-Pay.
                </p>
              </div>

              <div className="glass-card rounded-2xl border border-slate-800 p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/40 mx-auto flex items-center justify-center">
                  🎙️
                </div>
                <h3 className="text-xl font-bold text-white">Launch Hinglish Voice Recovery Call</h3>
                <p className="text-sm text-slate-400 max-w-md mx-auto">
                  Experience turn-by-turn bilingual dialogue simulation between AI Agent Aarav and the customer with live sentiment evaluation and PTP scheduling.
                </p>
                <button
                  onClick={() => handleOpenVoiceForCustomer("Priya Sharma", 3500)}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 font-bold text-sm text-white hover:brightness-110 shadow-lg shadow-purple-500/20 transition"
                >
                  Open Interactive Voice Studio 🚀
                </button>
              </div>
            </div>
          )}

          {/* TAB: PTP LEDGER */}
          {activeTab === "ptp_ledger" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
                  Promise-to-Pay (PTP) & Mandate Scheduler
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                  Active customer commitments with synchronized auto-debit triggers and pre-debit reminder sequences.
                </p>
              </div>

              <PtpLedger commitments={ptpItems} totalValue={ptpValue} />
            </div>
          )}

          {/* TAB: SAFETY GUARDRAILS */}
          {activeTab === "guardrails" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
                  Safety Guardrails & Bounded Stopping Rules
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                  Enforce strict margin limits (max 15% discount), max retry caps, cooling-off delays, and anti-harassment limits.
                </p>
              </div>

              <GuardrailsPanel
                initialConfig={guardrails}
                onConfigUpdated={(cfg) => setGuardrails(cfg)}
              />
            </div>
          )}

          {/* TAB: ANALYTICS */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
                  Revenue Recovery Velocity & Channel Attribution
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                  30-day cumulative growth curves, recovery by intervention channel, and failure root-cause analysis.
                </p>
              </div>

              {metrics && <AnalyticsView metrics={metrics} />}
            </div>
          )}

          {/* TAB: CASES & AUDIT TRAIL */}
          {activeTab === "cases" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
                  All Recovery Cases & Compliance Audit Trail
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                  Forensic ledger of every AI decision, confidence score, bounded action, and cryptographic audit log.
                </p>
              </div>

              <div className="glass-card rounded-2xl border border-slate-800 p-6">
                <RecentCasesTable
                  cases={cases}
                  onInspectCase={handleInspectCase}
                  onOpenVoiceModalForCase={handleOpenVoiceForCustomer}
                />
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Interactive Hinglish Voice Recovery Modal */}
      <VoiceRecoveryModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        initialCustomerName={voiceTargetCustomer}
        initialAmount={voiceTargetAmount}
      />

      {/* Case Trace & Audit Inspector Modal */}
      <CaseInspectorModal
        isOpen={inspectCaseId !== null}
        onClose={() => {
          setInspectCaseId(null);
          setInspectCaseData(null);
        }}
        caseData={inspectCaseData}
      />
    </div>
  );
}

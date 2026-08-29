// API Service Client for Reclaim.AI
import axios from "axios";
import {
  PaymentRecoveryRequest,
  PaymentRecoveryResponse,
  CaseStatus,
  DashboardMetrics,
  SimulationResult,
  VoiceSimulationResponse,
  PtpLedgerResponse,
  GuardrailsConfig,
  ScenarioPreset,
} from "@/types/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const api = {
  // Health check
  healthCheck: async () => {
    const response = await client.get("/health");
    return response.data;
  },

  // 1. Batch Simulation (The Bar: Show Measured Money Recovered)
  runBatchSimulation: async (batchSize: number = 8, confidenceThreshold: number = 0.70) => {
    const response = await client.post<SimulationResult>("/simulation/run-batch", null, {
      params: { batch_size: batchSize, confidence_threshold: confidenceThreshold },
    });
    return response.data;
  },

  getSimulationScenarios: async () => {
    const response = await client.get<{ scenarios: ScenarioPreset[] }>("/simulation/scenarios");
    return response.data.scenarios;
  },

  // 2. Hinglish Voice Recovery
  simulateVoiceCall: async (customerName: string = "Priya Sharma", amount: number = 3500, language: string = "Hinglish") => {
    const response = await client.post<VoiceSimulationResponse>("/voice/simulate-call", null, {
      params: { customer_name: customerName, amount, language },
    });
    return response.data;
  },

  // 3. Promise-to-Pay (PTP) Ledger
  getPtpLedger: async () => {
    const response = await client.get<PtpLedgerResponse>("/ptp/ledger");
    return response.data;
  },

  // 4. Bounded Guardrails & Stopping Rules
  getGuardrails: async () => {
    const response = await client.get<GuardrailsConfig>("/rules/guardrails");
    return response.data;
  },

  updateGuardrails: async (config: Partial<GuardrailsConfig>) => {
    const response = await client.post<{ status: string; guardrails: GuardrailsConfig }>("/rules/guardrails", config);
    return response.data.guardrails;
  },

  // 5. Cases & Dashboard
  getAllCases: async (limit: number = 50, scenario?: string, status?: string) => {
    const response = await client.get<{ total: number; cases: CaseStatus[] }>("/cases/all", {
      params: { limit, scenario, status },
    });
    return response.data;
  },

  getCaseStatus: async (caseId: string) => {
    const response = await client.get<CaseStatus>(`/cases/${caseId}`);
    return response.data;
  },

  startRecovery: async (request: PaymentRecoveryRequest) => {
    const response = await client.post<PaymentRecoveryResponse>("/cases/start-recovery", request);
    return response.data;
  },

  getDashboardMetrics: async () => {
    const response = await client.get<DashboardMetrics>("/dashboard/metrics");
    return response.data;
  },
};

export default api;

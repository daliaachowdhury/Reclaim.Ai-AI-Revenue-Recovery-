// API Type Definitions for Reclaim.AI

export interface PaymentSignal {
  signal_type: string;
  severity: "low" | "medium" | "high";
  timestamp: string;
  details: Record<string, any>;
  source: string;
}

export interface StoppingRuleCheck {
  rule_name: string;
  triggered: boolean;
  limit_value: string;
  current_value: string;
  action_taken: string;
}

export interface DiagnosisResult {
  root_cause: string;
  failure_type: string;
  scenario?: string;
  confidence_score: number;
  reasoning: string;
  recovery_likelihood: number;
  suggested_actions: string[];
  channel_recommendation?: string;
  internal_notes: string;
  stopping_rules?: StoppingRuleCheck[];
}

export interface VoiceDialogueLine {
  speaker: string;
  text: string;
  timestamp: string;
  sentiment?: string;
}

export interface VoiceRecoveryData {
  call_id: string;
  phone_number: string;
  language: string;
  duration_seconds: number;
  sentiment: "positive" | "hesitant" | "neutral" | "frustrated";
  dialogue: VoiceDialogueLine[];
  call_summary: string;
  ptp_agreed: boolean;
  ptp_date?: string;
}

export interface PromiseToPayItem {
  ptp_id: string;
  case_id: string;
  customer_id: string;
  customer_name: string;
  amount: number;
  promised_date: string;
  status: "pending" | "honored" | "defaulted" | "rescheduled";
  mandate_auto_trigger: boolean;
  channel: string;
  created_at?: string;
}

export interface RecoveryAction {
  action_type: string;
  priority: "critical" | "high" | "medium" | "low";
  channel?: string;
  parameters: Record<string, any>;
  retry_count?: number;
  max_retries?: number;
  discount_offered?: number;
  discount_cap?: number;
  executed_at?: string;
  result?: Record<string, any>;
  error?: string;
  voice_data?: VoiceRecoveryData;
  ptp_data?: PromiseToPayItem;
}

export interface AuditLogEntry {
  timestamp: string;
  event_type: string;
  stage: string;
  action: string;
  details: Record<string, any>;
  user_id?: string;
  system_decision?: boolean;
}

export interface CaseStatus {
  case_id: string;
  payment_id: string;
  customer_id: string;
  customer_name?: string;
  scenario?: string;
  amount: number;
  amount_recovered: number;
  status: string;
  diagnosis?: DiagnosisResult;
  action?: RecoveryAction;
  audit_log: AuditLogEntry[];
  created_at: string;
  completed_at?: string;
}

export interface DashboardMetrics {
  total_cases: number;
  completed_cases: number;
  failed_cases: number;
  escalated_cases?: number;
  total_recovered: number;
  total_at_risk: number;
  success_rate: number;
  prevented_churn_value?: number;
  ai_operational_cost?: number;
  net_roi_multiple?: number;
}

export interface SimulationCase {
  case_id: string;
  customer_name: string;
  customer_id: string;
  scenario: string;
  amount_at_risk: number;
  amount_reclaimed: number;
  status: string;
  channel_used: string;
  action_type: string;
  has_voice_call: boolean;
  has_ptp: boolean;
  confidence: number;
  root_cause: string;
  completed_at: string;
}

export interface SimulationResult {
  simulation_id: string;
  batch_size: number;
  total_at_risk: number;
  total_reclaimed: number;
  recovery_rate_pct: number;
  estimated_cost_of_recovery: number;
  net_roi_multiple: number;
  stopping_rules_triggered: number;
  scenarios_breakdown: Record<string, number>;
  cases: SimulationCase[];
  timestamp: string;
}

export interface VoiceSimulationResponse {
  call_id: string;
  customer_name: string;
  amount: number;
  language: string;
  duration_seconds: number;
  sentiment_score: number;
  sentiment_label: string;
  audio_wave_data: number[];
  dialogue: VoiceDialogueLine[];
  outcome: {
    status: string;
    ptp_date: string;
    amount_reclaimed: number;
    mandate_armed: boolean;
  };
}

export interface PtpLedgerResponse {
  total_ptp_commitments: number;
  total_ptp_value: number;
  commitments: PromiseToPayItem[];
}

export interface GuardrailsConfig {
  max_retries: number;
  cooling_off_hours: number;
  discount_ceiling_pct: number;
  anti_harassment_daily_limit: number;
  auto_escalate_fraud: boolean;
  active_channels: string[];
  rules_description?: Record<string, string>;
}

export interface ScenarioPreset {
  id: string;
  title: string;
  channel: string;
  sample_amount: number;
  customer: string;
  description: string;
}

export interface PaymentRecoveryRequest {
  payment_id: string;
  customer_id: string;
  confidence_threshold?: number;
}

export interface PaymentRecoveryResponse {
  case_id: string;
  payment_id: string;
  customer_id: string;
  amount: number;
  status: string;
  message: string;
}

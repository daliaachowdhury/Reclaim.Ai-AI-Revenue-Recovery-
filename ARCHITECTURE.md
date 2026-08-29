# Architecture & Data Flow Diagrams

## 1. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│                    React 18 + Next.js 14                         │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐         │
│  │  Dashboard   │  │ Case Details │  │  Analytics     │         │
│  │  (Metrics)   │  │  (Status)    │  │  (Charts)      │         │
│  └──────────────┘  └──────────────┘  └────────────────┘         │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                    HTTP/REST (Axios)
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND                                  │
│                    FastAPI + Python 3.11                         │
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐     │
│  │           FastAPI REST API (Port 8000)                 │     │
│  │  POST /cases/start-recovery                            │     │
│  │  GET  /cases/{id}                                      │     │
│  │  GET  /dashboard/metrics                               │     │
│  │  POST /webhook/razorpay                                │     │
│  └────────────────────────────────────────────────────────┘     │
│                           │                                       │
│                           ▼                                       │
│  ┌────────────────────────────────────────────────────────┐     │
│  │           LangGraph Workflow Engine                     │     │
│  │                                                         │     │
│  │  ┌──────────────┐                                      │     │
│  │  │ load_context │                                      │     │
│  │  └──────┬───────┘                                      │     │
│  │         ▼                                               │     │
│  │  ┌──────────────┐     ┌─────────────────┐             │     │
│  │  │  diagnose    │────▶│ (LLM: Claude)   │             │     │
│  │  │ (AI Engine)  │     └─────────────────┘             │     │
│  │  └──────┬───────┘                                      │     │
│  │         ▼                                               │     │
│  │  ┌──────────────┐  Revise if                           │     │
│  │  │   verify     │◀─ confidence < 70%                  │     │
│  │  │ confidence   │                                      │     │
│  │  └──────┬───────┘                                      │     │
│  │         ▼                                               │     │
│  │  ┌──────────────┐                                      │     │
│  │  │   create     │                                      │     │
│  │  │   action     │                                      │     │
│  │  └──────┬───────┘                                      │     │
│  │         ▼                                               │     │
│  │  ┌──────────────┐                                      │     │
│  │  │   execute    │                                      │     │
│  │  │   recovery   │                                      │     │
│  │  └──────┬───────┘                                      │     │
│  │         ▼                                               │     │
│  │  ┌──────────────┐                                      │     │
│  │  │ complete &   │                                      │     │
│  │  │   audit      │                                      │     │
│  │  └──────────────┘                                      │     │
│  └────────────────────────────────────────────────────────┘     │
│           │                    │                │                │
│           ▼                    ▼                ▼                │
│  ┌─────────────────┐ ┌──────────────────┐ ┌─────────────┐     │
│  │ Razorpay SDK    │ │ LLM Integration  │ │ Services    │     │
│  │ (retry, etc)    │ │ (Anthropic /OAI) │ │ (Email/etc) │     │
│  └─────────────────┘ └──────────────────┘ └─────────────┘     │
└─────────────────────────────────────────────────────────────────┘
         │                                        │
         ▼                                        ▼
    ┌─────────────────────┐          ┌──────────────────────┐
    │  RAZORPAY GATEWAY   │          │ MONGODB DATABASE     │
    │  (Payment Retry,    │          │ (Cases, Audit Logs)  │
    │   Customer Info)    │          │                      │
    └─────────────────────┘          └──────────────────────┘
```

---

## 2. LangGraph State Flow

```
Initial State (from webhook)
    │
    │ payment_id, customer_id, amount, failure_reason
    ▼
┌─────────────────────────────────────────┐
│ Load Customer Context                   │
│ state.customer_context = {...}          │
│ state.status = DIAGNOSING               │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│ Diagnose (LLM)                          │
│ - Extract signals from payment_data     │
│ - Call Claude/GPT-4                     │
│ - Parse: root_cause, confidence_score   │
│ state.diagnosis = DiagnosisResult       │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│ Verify Confidence                       │
│ if confidence_score >= threshold:       │
│   ✅ passes_confidence_check = True      │
│ else:                                   │
│   ⚠️ should_revise = True               │
│   if revision_count < max_revisions:    │
│     → Loop back to Diagnose             │
│   else:                                 │
│     → Escalate to manual review         │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│ Create Recovery Action                  │
│ - Select primary action                 │
│ - Set bounds (max_retries, amount_cap)  │
│ - Create alternates                     │
│ state.selected_action = RecoveryAction  │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│ Execute Recovery                        │
│ - Route to appropriate handler          │
│ - Retry Payment / Send Email / Incentive│
│ - Track result                          │
│ state.amount_recovered = XXX            │
│ state.execution_result = {...}          │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│ Complete & Audit                        │
│ - Persist to MongoDB                    │
│ - Audit log complete                    │
│ state.status = COMPLETED                │
│ - Ready for dashboard display           │
└─────────────────────────────────────────┘
```

---

## 3. Database Collections

```
MongoDB
├── recovery_cases
│   ├── case_id (PK)
│   ├── payment_id (Indexed)
│   ├── customer_id (Indexed)
│   ├── amount
│   ├── amount_recovered
│   ├── status: "pending"|"completed"|"failed"
│   ├── diagnosis: {...}
│   ├── action: {...}
│   ├── audit_log: [{...}, {...}]
│   ├── created_at (Indexed)
│   └── completed_at
│
├── customers
│   ├── customer_id (PK)
│   ├── lifetime_value
│   ├── total_transactions
│   ├── failed_attempts
│   ├── success_rate
│   ├── churn_risk: "low"|"medium"|"high"
│   ├── recovery_history: [{...}]
│   └── last_updated
│
└── review_queue
    ├── case_id
    ├── priority: "low"|"medium"|"high"|"critical"
    ├── reason
    ├── created_at
    └── status: "pending_review"|"reviewed"
```

---

## 4. API Request/Response Flow

```
CLIENT REQUEST
│
├─ POST /cases/start-recovery
│  ├─ Payload: { payment_id, customer_id, confidence_threshold }
│  └─ Response: { case_id, status: "processing", ... }
│
├─ GET /cases/{case_id}
│  ├─ Query: None
│  └─ Response: { case_id, diagnosis, action, audit_log, status, ... }
│
├─ GET /dashboard/metrics
│  ├─ Query: None
│  └─ Response: { total_cases, recovered, at_risk, success_rate, ... }
│
└─ POST /webhook/razorpay
   ├─ Payload: { event, payload: { payment: {...} } }
   └─ Response: { status: "received" }
```

---

## 5. Razorpay Integration Flow

```
Customer Payment Fails
        │
        ▼
Razorpay sends webhook
        │
        ├─ event: "payment.failed"
        ├─ payment: { id, customer_id, amount, status, ... }
        │
        ▼
Backend /webhook/razorpay endpoint
        │
        ├─ Verify webhook (HMAC - TODO)
        ├─ Extract payment_id & customer_id
        ├─ Call RazorpayService.get_payment_details()
        ├─ Extract signals: card_declined, insufficient_funds, etc.
        │
        ▼
Queue recovery workflow (background task)
        │
        ├─ Create initial state
        ├─ Execute LangGraph workflow
        ├─ Workflow tries recovery actions:
        │   ├─ Retry payment (Razorpay API)
        │   ├─ Send recovery email
        │   └─ Offer incentive
        │
        ▼
Persist results to MongoDB
        │
        ├─ recovery_cases collection
        ├─ audit_log entries
        └─ Complete compliance trail
```

---

## 6. Confidence Loop (Revision Path)

```
Initial Diagnosis
    │
    ├─ confidence_score = 0.45 (LOW)
    │
    ▼
Verify Confidence
    │
    ├─ Check: 0.45 >= 0.70 threshold?
    ├─ Result: ❌ NO
    ├─ revision_count = 1
    │
    ▼
Revise Loop (Back to Diagnose)
    │
    ├─ Re-run diagnosis with additional context
    ├─ confidence_score = 0.68 (still LOW)
    ├─ revision_count = 2
    │
    ▼
Check Max Revisions
    │
    ├─ revision_count (2) >= max_revisions (2)?
    ├─ Result: ✅ YES
    │
    ▼
Escalate to Manual Review
    │
    ├─ Create RecoveryAction: MANUAL_REVIEW
    ├─ Queue to review_queue collection
    ├─ Notify team for human judgment
    │
    ▼
Complete & Audit
```

---

## 7. Frontend Component Hierarchy

```
Layout (layout.tsx)
├─ Sidebar
│  ├─ Logo
│  ├─ Navigation Items
│  └─ User Menu
│
├─ Navbar
│  ├─ Search Bar
│  ├─ Notifications
│  └─ User Profile
│
└─ Main Content
   ├─ Page: Dashboard (page.tsx)
   │  ├─ Header
   │  ├─ MetricsGrid (4 KPI cards)
   │  │  ├─ Total Recovered ($)
   │  │  ├─ Success Rate (%)
   │  │  ├─ At Risk ($)
   │  │  └─ Active Cases (#)
   │  │
   │  ├─ Charts Grid (2 columns)
   │  │  ├─ RecoveryTrendChart (LineChart)
   │  │  └─ SuccessRatePie (PieChart)
   │  │
   │  └─ RecentCasesTable
   │     ├─ Case ID (clickable)
   │     ├─ Customer ID
   │     ├─ Amount
   │     ├─ Status badge
   │     └─ Recovered amount
   │
   ├─ Page: Case Details (cases/[id]/page.tsx)
   │  ├─ Case Header
   │  ├─ Diagnosis Details
   │  ├─ Recovery Action Taken
   │  └─ Full Audit Log
   │
   └─ Page: Analytics (analytics/page.tsx)
      ├─ Trends
      ├─ Failure Reasons
      └─ Performance Metrics
```

---

## 8. Monitoring & Metrics Dashboard

```
Real-time Metrics
├─ Total Cases: 1,250
├─ Completed: 1,050 (84%)
├─ Failed: 50 (4%)
├─ Pending: 150 (12%)
│
├─ Revenue Metrics
├─ Total Recovered: $125,000
├─ At Risk: $45,000
├─ Success Rate: 84%
├─ Average Recovery: $119
│
├─ Confidence Metrics
├─ Avg Confidence Score: 0.78
├─ Manual Reviews: 8%
├─ Revision Attempts: 12%
│
└─ Performance
   ├─ Avg Processing Time: 22s
   ├─ LLM API Latency: 8s
   └─ Database Query Time: 1.2s
```

This architecture is designed for:
✅ **Scalability** - Async processing, queuing
✅ **Reliability** - Retry logic, audit trails
✅ **Compliance** - Complete audit logs
✅ **Transparency** - Confidence scores, explainability
✅ **Safety** - Bounded actions, thresholds

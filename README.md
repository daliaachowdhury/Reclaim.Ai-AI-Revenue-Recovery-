# 🚀 AI Revenue Recovery System - Complete Architecture

> **Detect revenue at risk, diagnose root causes, and execute bounded recovery actions with AI-powered precision.**

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Core Loop](#core-loop)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [Configuration](#configuration)
- [Running the System](#running-the-system)
- [API Documentation](#api-documentation)
- [LangGraph Workflow](#langgraph-workflow)
- [Database Schema](#database-schema)
- [Deployment Guide](#deployment-guide)

---

## 🏗️ Architecture Overview

This is a production-grade, AI-powered revenue recovery system that automatically detects failed payments, diagnoses root causes, and executes bounded recovery actions.

### Key Components

1. **Payment Signal Detection** - Monitors payment failures in real-time via Razorpay webhooks
2. **AI Diagnosis Engine** - Uses LLM (Claude/GPT-4) + historical context to determine root causes
3. **Confidence Verification** - Ensures only high-confidence actions are executed
4. **Recovery Executor** - Implements bounded, recoverable actions (retry, email, incentive, etc.)
5. **Audit Trail** - Complete compliance-ready logs of all decisions and actions

---

## 🔄 Core Loop

```
┌─────────────────┐
│ Failed Payment  │ (Razorpay webhook)
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│ Load Customer Context       │ (From MongoDB)
│ - Historical performance    │
│ - Churn risk, LTV           │
│ - Past recovery attempts    │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ AI DIAGNOSE                 │ (LangGraph Node)
│ Extract payment signals     │
│ Determine root cause        │
│ Calculate confidence score  │
│ Suggest recovery actions    │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ VERIFY CONFIDENCE           │ (Threshold check)
│ Confidence ≥ 70%?           │ ◄─┐ Revise Loop
│                             │   │ (max 2 revisions)
└────────┬────────────────────┘   │
         │                        │
    YES  │  NO                    │
         └────────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ CREATE RECOVERY ACTION      │ (Bounded)
│ - Set retry limits          │
│ - Cap amount                │
│ - Escalate if needed        │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ EXECUTE RECOVERY            │ (Razorpay retry, email, incentive)
│ Track result                │
│ Update amount_recovered     │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ AUDIT & PERSIST             │ (MongoDB)
│ Complete compliance trail   │
│ Ready for compliance review │
└─────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Backend
- **Python 3.11+** - Core language
- **FastAPI** - Modern async web framework
- **LangGraph** - Agentic workflow orchestration
- **Claude Anthropic / OpenAI** - LLM for diagnosis
- **Motor** - Async MongoDB driver
- **Razorpay SDK** - Payment gateway integration

### Frontend
- **React 18** - UI library
- **Next.js 14** - Framework with app router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Headless component library
- **Recharts** - Data visualization
- **Axios** - HTTP client

### Infrastructure
- **MongoDB** - Document database for cases/audit logs
- **Docker** - Containerization
- **Redis** (optional) - Caching layer

---

## 📁 Project Structure

```
revenue-recovery-ai/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                    # FastAPI app entry point
│   │   ├── core/
│   │   │   ├── state.py               # LangGraph state schema
│   │   │   ├── nodes.py               # Workflow nodes (diagnose, verify, etc.)
│   │   │   └── workflow.py            # LangGraph workflow definition
│   │   ├── services/
│   │   │   └── razorpay_service.py    # Razorpay API integration
│   │   ├── schemas.py                 # Pydantic models for API
│   │   └── models/
│   │       └── database.py            # MongoDB models
│   ├── tests/
│   │   └── test_workflow.py
│   ├── requirements.txt
│   ├── .env.example
│   └── docker-compose.yml
│
├── frontend/
│   ├── app/
│   │   ├── layout.tsx                 # Root layout
│   │   ├── page.tsx                   # Dashboard page
│   │   ├── globals.css                # Global styles
│   │   └── cases/
│   │       └── [id]/
│   │           └── page.tsx           # Case detail page
│   ├── components/
│   │   ├── layout/
│   │   │   ├── navbar.tsx
│   │   │   └── sidebar.tsx
│   │   ├── ui/
│   │   │   ├── card.tsx
│   │   │   └── skeleton.tsx
│   │   └── dashboard/
│   │       ├── metrics-grid.tsx
│   │       ├── recent-cases-table.tsx
│   │       └── recovery-trend-chart.tsx
│   ├── services/
│   │   └── api.ts                     # API client
│   ├── types/
│   │   └── api.ts                     # TypeScript types
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── next.config.js
│   └── .env.local.example
│
└── README.md (this file)
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Python 3.11+
- Node.js 18+
- MongoDB 6.0+
- Razorpay account (test & production keys)
- Claude/OpenAI API key

### Backend Setup

1. **Create virtual environment**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install dependencies**
```bash
pip install -r requirements.txt
```

3. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your keys:
# - RAZORPAY_KEY_ID
# - RAZORPAY_KEY_SECRET
# - ANTHROPIC_API_KEY (or OPENAI_API_KEY)
# - MONGODB_URL
```

4. **Start MongoDB**
```bash
# Using Docker
docker run -d -p 27017:27017 mongo:6

# Or locally if installed
mongod
```

5. **Run backend**
```bash
python -m uvicorn app.main:app --reload --port 8000
```

Backend runs at: `http://localhost:8000`
API docs: `http://localhost:8000/docs`

### Frontend Setup

1. **Install dependencies**
```bash
cd frontend
npm install
```

2. **Configure environment**
```bash
cp .env.local.example .env.local
# Update NEXT_PUBLIC_API_URL if needed
```

3. **Run development server**
```bash
npm run dev
```

Frontend runs at: `http://localhost:3000`

---

## 📋 Configuration

### Environment Variables

**Backend (.env)**
```
# Database
MONGODB_URL=mongodb://localhost:27017
DB_NAME=revenue_recovery

# Razorpay
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY
RAZORPAY_KEY_SECRET=YOUR_SECRET
RAZORPAY_TEST_MODE=true

# LLM
ANTHROPIC_API_KEY=sk-ant-YOUR_KEY
# OR
OPENAI_API_KEY=sk-YOUR_KEY

# API
API_HOST=0.0.0.0
API_PORT=8000
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# Confidence thresholds
DIAGNOSIS_CONFIDENCE_THRESHOLD=0.7
MAX_REVISION_ATTEMPTS=2
```

**Frontend (.env.local)**
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_APP_NAME=Revenue Recovery AI
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

---

## 🚀 Running the System

### Option 1: Local Development

**Terminal 1 - MongoDB**
```bash
docker run -p 27017:27017 mongo:6
```

**Terminal 2 - Backend**
```bash
cd backend
source venv/bin/activate
python -m uvicorn app.main:app --reload --port 8000
```

**Terminal 3 - Frontend**
```bash
cd frontend
npm run dev
```

### Option 2: Docker Compose

```bash
cd backend
docker-compose up -d
```

Then in frontend:
```bash
npm run dev
```

---

## 📚 API Documentation

### Endpoints

#### Start Recovery Workflow
```http
POST /api/cases/start-recovery
Content-Type: application/json

{
  "payment_id": "pay_123456789",
  "customer_id": "cust_987654321",
  "confidence_threshold": 0.7
}

Response:
{
  "case_id": "case_1234567890",
  "payment_id": "pay_123456789",
  "customer_id": "cust_987654321",
  "amount": 1000.00,
  "status": "processing",
  "message": "Recovery workflow started"
}
```

#### Get Case Status
```http
GET /api/cases/{case_id}

Response:
{
  "case_id": "case_1234567890",
  "payment_id": "pay_123456789",
  "customer_id": "cust_987654321",
  "amount": 1000.00,
  "amount_recovered": 1000.00,
  "status": "completed",
  "diagnosis": {
    "root_cause": "Card declined due to insufficient funds",
    "failure_type": "insufficient_funds",
    "confidence_score": 0.92,
    "reasoning": "...",
    "recovery_likelihood": 0.85,
    "suggested_actions": ["retry_payment", "send_recovery_email"],
    "internal_notes": "..."
  },
  "action": {
    "action_type": "retry_payment",
    "priority": "high",
    "parameters": {...},
    "executed_at": "2024-01-15T10:30:00Z",
    "result": {"success": true, ...}
  },
  "audit_log": [...],
  "created_at": "2024-01-15T10:00:00Z",
  "completed_at": "2024-01-15T10:35:00Z"
}
```

#### Get Dashboard Metrics
```http
GET /api/dashboard/metrics

Response:
{
  "total_cases": 1250,
  "completed_cases": 1050,
  "failed_cases": 50,
  "total_recovered": 125000.00,
  "total_at_risk": 45000.00,
  "success_rate": 84.0
}
```

#### Razorpay Webhook
```http
POST /api/webhook/razorpay
Content-Type: application/json

{
  "event": "payment.failed",
  "payload": {
    "payment": {
      "id": "pay_123456789",
      "customer_id": "cust_987654321",
      "amount": 100000,
      "description": "Card declined",
      "method": "card"
    }
  }
}
```

---

## 🧠 LangGraph Workflow

### State Schema

```python
class RevenuRecoveryState:
    # Identifiers
    payment_id: str
    case_id: str
    customer_id: str
    
    # Input
    payment_amount: float
    payment_method: str
    failure_reason: str
    payment_signals: List[PaymentSignal]
    customer_context: Optional[CustomerContext]
    
    # Workflow state
    status: WorkflowStatus
    
    # Results
    diagnosis: Optional[DiagnosisResult]
    passes_confidence_check: Optional[bool]
    selected_action: Optional[RecoveryAction]
    
    # Audit trail
    audit_log: List[AuditLogEntry]
```

### Nodes

1. **load_customer_context** - Fetches historical customer data
2. **diagnose** - LLM-powered root cause analysis
3. **verify_confidence** - Checks if diagnosis confidence meets threshold
4. **create_recovery_action** - Selects and bounds the recovery action
5. **execute_recovery** - Executes the action (retry, email, etc.)
6. **complete_and_audit** - Persists to MongoDB

### Conditional Edges

- **verify_confidence → diagnose** (revise loop if confidence low)
- **verify_confidence → create_recovery_action** (proceed if confident)
- Both eventually reach → **complete_and_audit**

---

## 💾 Database Schema

### Collections

#### recovery_cases
```javascript
{
  case_id: String,           // Unique case identifier
  payment_id: String,        // Razorpay payment ID
  customer_id: String,       // Customer ID
  amount: Number,            // Original payment amount
  amount_recovered: Number,  // Amount successfully recovered
  status: String,            // "pending", "completed", "failed"
  diagnosis: Object,         // Diagnosis results
  action: Object,            // Executed action details
  audit_log: Array,          // Complete audit trail
  created_at: Date,
  completed_at: Date
}
```

#### customers
```javascript
{
  customer_id: String,
  lifetime_value: Number,
  total_transactions: Number,
  failed_attempts: Number,
  success_rate: Number,
  preferred_method: String,
  churn_risk: String,        // "low", "medium", "high"
  recovery_history: Array,
  last_updated: Date
}
```

#### review_queue (for manual escalations)
```javascript
{
  case_id: String,
  priority: String,          // "low", "medium", "high", "critical"
  reason: String,
  created_at: Date,
  status: String             // "pending_review", "reviewed"
}
```

---

## 🐳 Deployment Guide

### Production Checklist

- [ ] Set `DEBUG=false` in backend
- [ ] Use production LLM keys (Claude/GPT-4)
- [ ] Configure MongoDB Atlas or managed service
- [ ] Set up Razorpay production keys
- [ ] Enable HTTPS/TLS
- [ ] Configure CORS properly
- [ ] Set up monitoring & alerting
- [ ] Enable audit log rotation
- [ ] Configure JWT secrets
- [ ] Set up backups for MongoDB

### Docker Deployment

```dockerfile
# Backend Dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### AWS/Cloud Deployment

- **Compute**: ECS/Lambda for backend, Vercel/Amplify for frontend
- **Database**: MongoDB Atlas
- **Storage**: S3 for audit logs
- **Monitoring**: CloudWatch, DataDog
- **API Gateway**: AWS API Gateway with WAF

---

## 📈 Monitoring & Analytics

Monitor key metrics:

```
- Cases processed per day
- Success rate (recovered / attempted)
- Average recovery amount
- Confidence scores distribution
- Revision attempts frequency
- Manual review escalation rate
```

---

## 🔐 Security & Compliance

- ✅ Audit logs for all decisions
- ✅ Confidence thresholds prevent risky actions
- ✅ Bounded recovery (retry limits, amount caps)
- ✅ MongoDB indexed queries for performance
- ✅ Error handling with retry logic
- ✅ Webhook verification (implement HMAC)

---

## 📞 Support

For questions or issues:
1. Check the API docs: `http://localhost:8000/docs`
2. Review audit logs for any failed operations
3. Check MongoDB collections for persisted data

---

## 📄 License

Proprietary - Reclaim.AI 2024

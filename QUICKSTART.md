# Quick Start Guide

## 🚀 Get Running in 5 Minutes

### Prerequisites
- Python 3.11+ 
- Node.js 18+
- Docker & Docker Compose (for easy MongoDB setup)

### Step 1: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy and configure environment
cp .env.example .env
# Edit .env: Add your Razorpay & LLM keys
```

### Step 2: Start MongoDB

```bash
# Using Docker (recommended)
docker run -d -p 27017:27017 mongo:6

# Or use Docker Compose (includes MongoDB + Redis)
docker-compose up -d
```

### Step 3: Run Backend

```bash
cd backend
python -m uvicorn app.main:app --reload --port 8000
```

✅ Backend running at: http://localhost:8000
📖 API Docs: http://localhost:8000/docs

### Step 4: Frontend Setup

```bash
# In new terminal
cd frontend

# Install dependencies
npm install

# Copy environment config
cp .env.local.example .env.local

# Start development server
npm run dev
```

✅ Frontend running at: http://localhost:3000

---

## 🧪 Test the System

### 1. Using API Directly

```bash
# Start a recovery workflow
curl -X POST http://localhost:8000/api/cases/start-recovery \
  -H "Content-Type: application/json" \
  -d '{
    "payment_id": "pay_test_123",
    "customer_id": "cust_test_456",
    "confidence_threshold": 0.7
  }'

# Check case status
curl http://localhost:8000/api/cases/{case_id}

# Get dashboard metrics
curl http://localhost:8000/api/dashboard/metrics
```

### 2. Using Dashboard UI

1. Open http://localhost:3000
2. View dashboard with metrics
3. Navigate to "Recovery Cases" section
4. Check real-time status updates

### 3. Monitor Workflow

The LangGraph workflow logs each step:
- Loading customer context
- Running AI diagnosis
- Confidence verification
- Creating recovery action
- Executing recovery
- Persisting to audit log

Check the backend terminal for detailed logs.

---

## 📚 Key Files to Know

| File | Purpose |
|------|---------|
| `backend/app/core/state.py` | LangGraph state schema |
| `backend/app/core/nodes.py` | Workflow node implementations |
| `backend/app/core/workflow.py` | LangGraph workflow definition |
| `backend/app/services/razorpay_service.py` | Razorpay API integration |
| `backend/app/main.py` | FastAPI app & routes |
| `frontend/app/page.tsx` | Dashboard page |
| `frontend/components/dashboard/` | Dashboard components |

---

## 🔧 Configuration

### Backend Environment (.env)

**Critical variables:**
- `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET` - Get from Razorpay dashboard
- `ANTHROPIC_API_KEY` or `OPENAI_API_KEY` - LLM for diagnosis
- `MONGODB_URL` - Database connection

### Frontend Environment (.env.local)

- `NEXT_PUBLIC_API_URL` - Backend API endpoint (default: http://localhost:8000/api)

---

## 📊 Understanding the Flow

```
Failed Payment (Razorpay) 
    ↓
Load Customer History
    ↓
AI Diagnosis (LLM analyzes signals + context)
    ↓
Confidence Check (threshold: 70%)
    ↓ (if low confidence: revise diagnosis)
    ↓
Create Bounded Recovery Action
    ↓
Execute (retry payment / send email / offer incentive)
    ↓
Persist to Audit Log (MongoDB)
    ↓
Dashboard shows results
```

---

## 🐛 Troubleshooting

### Backend won't start
- ✅ Check MongoDB is running: `docker ps`
- ✅ Verify .env is configured
- ✅ Check port 8000 is free: `lsof -i :8000`

### Frontend can't reach backend
- ✅ Backend must be running on port 8000
- ✅ Check `NEXT_PUBLIC_API_URL` in .env.local
- ✅ CORS is configured (default allows localhost:3000)

### LLM errors
- ✅ Verify API key is valid: `ANTHROPIC_API_KEY` or `OPENAI_API_KEY`
- ✅ Check API key has sufficient credits
- ✅ Monitor LLM response in backend logs

### MongoDB connection issues
- ✅ `docker logs revenue-recovery-mongodb` (if using Docker)
- ✅ Verify URL format: `mongodb://localhost:27017`
- ✅ Check indexes are created: backend logs should show "✓ Database indexes created"

---

## 🚀 Next Steps

1. **Connect Razorpay Webhook** - Configure webhook URL in Razorpay dashboard
2. **Add Customer Data** - Populate MongoDB with customer history
3. **Configure LLM Prompts** - Fine-tune diagnosis system prompt in `nodes.py`
4. **Set Thresholds** - Adjust confidence thresholds based on your needs
5. **Deploy to Production** - Follow deployment guide in README.md

---

## 📞 Quick Links

- API Documentation: http://localhost:8000/docs
- Dashboard: http://localhost:3000
- MongoDB Express: http://localhost:8081 (if included)
- Architecture Diagram: See README.md

---

Happy recovering! 🎉

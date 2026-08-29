"""
Minimal Mock Backend - Works without LangGraph/MongoDB
This allows the frontend to connect and show data immediately.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from typing import Optional

app = FastAPI(
    title="Revenue Recovery AI",
    description="Detect revenue at risk and win it back",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock data
MOCK_METRICS = {
    "total_cases": 1250,
    "completed_cases": 1050,
    "failed_cases": 50,
    "total_recovered": 125000.00,
    "total_at_risk": 45000.00,
    "success_rate": 84.0
}

MOCK_CASES = [
    {
        "case_id": "case_2024_001",
        "payment_id": "pay_123456789",
        "customer_id": "cust_987654321",
        "amount": 1000.00,
        "amount_recovered": 1000.00,
        "status": "completed",
        "diagnosis": {
            "root_cause": "Card declined due to insufficient funds",
            "failure_type": "insufficient_funds",
            "confidence_score": 0.92,
            "reasoning": "Customer has history of low balance issues",
            "recovery_likelihood": 0.85,
            "suggested_actions": ["retry_payment", "send_recovery_email"],
            "internal_notes": "Customer had balance restored after 2 hours"
        },
        "action": {
            "action_type": "retry_payment",
            "priority": "high",
            "parameters": {"retry_count": 2},
            "executed_at": "2024-01-15T10:30:00Z",
            "result": {"success": True, "status": "paid"}
        },
        "audit_log": [
            {
                "timestamp": "2024-01-15T10:00:00Z",
                "event_type": "case_created",
                "stage": "pending",
                "action": "Recovery workflow started",
                "details": {}
            }
        ],
        "created_at": "2024-01-15T10:00:00Z",
        "completed_at": "2024-01-15T10:35:00Z"
    },
    {
        "case_id": "case_2024_002",
        "payment_id": "pay_987654321",
        "customer_id": "cust_123456789",
        "amount": 2500.00,
        "amount_recovered": 2500.00,
        "status": "completed",
        "diagnosis": {
            "root_cause": "Gateway timeout during peak hours",
            "failure_type": "timeout",
            "confidence_score": 0.78,
            "reasoning": "Network latency detected",
            "recovery_likelihood": 0.90,
            "suggested_actions": ["retry_payment"],
            "internal_notes": "Retry successful after 5 minutes"
        },
        "created_at": "2024-01-15T09:00:00Z",
        "completed_at": "2024-01-15T09:25:00Z"
    },
    {
        "case_id": "case_2024_003",
        "payment_id": "pay_555555555",
        "customer_id": "cust_444444444",
        "amount": 500.00,
        "amount_recovered": 0.00,
        "status": "failed",
        "diagnosis": {
            "root_cause": "Card reported as lost",
            "failure_type": "fraud_check",
            "confidence_score": 0.88,
            "reasoning": "Security flags triggered",
            "recovery_likelihood": 0.15,
            "suggested_actions": ["contact_customer", "manual_review"],
            "internal_notes": "Requires customer verification"
        },
        "created_at": "2024-01-15T08:00:00Z",
        "completed_at": "2024-01-15T08:45:00Z"
    }
]


# ============================================================================
# ENDPOINTS
# ============================================================================

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "revenue-recovery-ai"
    }


@app.post("/api/cases/start-recovery")
async def start_recovery(request: dict):
    """Start a recovery workflow"""
    return {
        "case_id": f"case_2024_{datetime.now().timestamp()}",
        "payment_id": request.get("payment_id"),
        "customer_id": request.get("customer_id"),
        "amount": 1000.00,
        "status": "processing",
        "message": "Recovery workflow started"
    }


@app.get("/api/cases/{case_id}")
async def get_case_status(case_id: str):
    """Get case status"""
    for case in MOCK_CASES:
        if case["case_id"] == case_id:
            return case
    return {"error": "Case not found"}


@app.get("/api/cases/customer/{customer_id}")
async def get_customer_cases(customer_id: str, limit: int = 50):
    """Get all cases for a customer"""
    cases = [c for c in MOCK_CASES if c["customer_id"] == customer_id]
    return {
        "customer_id": customer_id,
        "cases": cases[:limit]
    }


@app.get("/api/dashboard/metrics")
async def get_dashboard_metrics():
    """Get dashboard metrics"""
    return MOCK_METRICS


@app.post("/api/webhook/razorpay")
async def razorpay_webhook(payload: dict):
    """Webhook receiver for Razorpay"""
    return {"status": "received"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main_mock:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )

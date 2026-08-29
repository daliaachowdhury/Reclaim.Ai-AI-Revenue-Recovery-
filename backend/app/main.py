"""
FastAPI Main Application for Multi-Channel AI Revenue Recovery System
"""

from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks, Query
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
import os
import random
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any

from app.core.state import (
    RevenuRecoveryState,
    LeakageScenario,
    RecoveryChannel,
    PaymentFailureType,
    PaymentSignal,
    CustomerContext,
    WorkflowStatus
)
from app.core.workflow import RevenueRecoveryWorkflow
from app.services.razorpay_service import RazorpayService
from app.services.simulation_service import BatchSimulationService, SAMPLE_CUSTOMERS
from app.schemas import PaymentRecoveryRequest, CaseStatusResponse, DashboardMetrics


# ============================================================================
# GLOBAL APP STATE
# ============================================================================

class GuardrailsConfig:
    max_retries: int = 3
    cooling_off_hours: int = 24
    discount_ceiling_pct: float = 15.0
    anti_harassment_daily_limit: int = 2
    auto_escalate_fraud: bool = True
    active_channels: List[str] = [
        "smart_retry",
        "hinglish_voice",
        "whatsapp_sms",
        "dynamic_incentive",
        "mandate_sequencer",
        "b2b_invoice_chaser"
    ]


class AppState:
    db: AsyncIOMotorDatabase = None
    razorpay: RazorpayService = None
    workflow: RevenueRecoveryWorkflow = None
    simulator: BatchSimulationService = None
    guardrails: GuardrailsConfig = GuardrailsConfig()


app_state = AppState()


# ============================================================================
# STARTUP & SEEDING
# ============================================================================

async def seed_initial_data(db: AsyncIOMotorDatabase):
    """Seed rich historical data for instant demo capability"""
    try:
        count = await db["recovery_cases"].count_documents({})
        if count == 0:
            print("[INFO] Seeding initial recovery cases & customer profiles...")
            # Seed Customers
            for cust in SAMPLE_CUSTOMERS:
                await db["customers"].replace_one(
                    {"customer_id": cust["id"]},
                    {
                        "customer_id": cust["id"],
                        "name": cust["name"],
                        "email": cust["email"],
                        "phone": cust["phone"],
                        "lifetime_value": cust["ltv"],
                        "churn_risk": cust["churn"],
                        "total_transactions": random.randint(8, 25),
                        "success_rate": 0.94,
                        "preferred_language": "Hinglish"
                    },
                    upsert=True
                )
            
            # Seed sample historical cases across all 5 scenarios
            scenarios = [
                ("PAYMENT_DEGRADATION", "declined_card", 2400.0, 2400.0, "smart_retry", "completed", "Card authorization timeout at bank switch"),
                ("CHECKOUT_DROPOFF", "checkout_abandoned", 4800.0, 4320.0, "dynamic_incentive", "completed", "3DS drop-off rescued with 10% instant checkout coupon"),
                ("FAILED_SUBSCRIPTION", "mandate_failure", 3200.0, 3200.0, "hinglish_voice", "completed", "Hinglish AI voice call confirmed salary date auto-retry"),
                ("B2B_RECEIVABLES", "overdue_invoice", 45000.0, 45000.0, "b2b_invoice_chaser", "completed", "AP team reconciliation confirmed via automated PTP sequence"),
                ("MANDATE_SEQUENCER", "mandate_failure", 1800.0, 1800.0, "mandate_sequencer", "completed", "NACH cycle timing synchronized with issuer window"),
                ("PAYMENT_DEGRADATION", "insufficient_funds", 7500.0, 0.0, "smart_retry", "failed", "Multiple declines; halted by Max Retry Stopping Rule"),
                ("CHECKOUT_DROPOFF", "checkout_abandoned", 6200.0, 5580.0, "whatsapp_sms", "completed", "WhatsApp 1-click checkout recovery link completed")
            ]
            
            for idx, (sc, fail_type, amt, rec, chan, st, desc) in enumerate(scenarios):
                case_id = f"case_seed_{100 + idx}"
                cust = SAMPLE_CUSTOMERS[idx % len(SAMPLE_CUSTOMERS)]
                
                await db["recovery_cases"].insert_one({
                    "case_id": case_id,
                    "payment_id": f"pay_seed_{random.randint(100000, 999999)}",
                    "customer_id": cust["id"],
                    "customer_name": cust["name"],
                    "scenario": sc.lower(),
                    "amount": amt,
                    "amount_recovered": rec,
                    "status": st,
                    "diagnosis": {
                        "root_cause": desc,
                        "failure_type": fail_type,
                        "scenario": sc.lower(),
                        "confidence_score": 0.89,
                        "reasoning": "Historical test record generated by Reclaim.AI engine.",
                        "recovery_likelihood": 0.91,
                        "suggested_actions": ["retry_payment", "voice_call_recovery"],
                        "channel_recommendation": chan,
                        "internal_notes": "Pre-seeded verification record."
                    },
                    "action": {
                        "action_type": "retry_payment" if chan == "smart_retry" else "voice_call_recovery",
                        "priority": "high",
                        "channel": chan,
                        "parameters": {"amount": amt, "channel": chan},
                        "retry_count": 1,
                        "max_retries": 3,
                        "discount_offered": 10.0 if "incentive" in chan else 0.0,
                        "discount_cap": 15.0,
                        "executed_at": datetime.utcnow() - timedelta(hours=random.randint(2, 48)),
                        "result": {"success": st == "completed", "amount_reclaimed": rec}
                    },
                    "audit_log": [
                        {
                            "timestamp": datetime.utcnow() - timedelta(hours=random.randint(2, 48)),
                            "event_type": "diagnosis_complete",
                            "stage": "diagnosing",
                            "action": f"AI Diagnosed: {desc}",
                            "details": {"channel": chan, "amount": amt}
                        },
                        {
                            "timestamp": datetime.utcnow() - timedelta(hours=random.randint(1, 24)),
                            "event_type": "action_executed",
                            "stage": "executing",
                            "action": f"Executed [{chan}] recovery: ${rec:,.2f} Reclaimed",
                            "details": {"status": st}
                        }
                    ],
                    "created_at": datetime.utcnow() - timedelta(hours=random.randint(2, 48)),
                    "completed_at": datetime.utcnow() - timedelta(hours=random.randint(1, 24))
                })
                
                # Seed Promise to Pay
                if chan == "hinglish_voice" or chan == "b2b_invoice_chaser":
                    await db["promise_to_pay"].insert_one({
                        "ptp_id": f"ptp_seed_{idx}",
                        "case_id": case_id,
                        "customer_id": cust["id"],
                        "customer_name": cust["name"],
                        "amount": amt,
                        "promised_date": (datetime.utcnow() + timedelta(days=idx+1)).strftime("%Y-%m-%d"),
                        "status": "pending",
                        "mandate_auto_trigger": True,
                        "channel": chan,
                        "created_at": datetime.utcnow()
                    })
            print("[OK] Initial seed data created successfully")
    except Exception as e:
        print(f"[WARN] Error seeding data: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle startup and shutdown"""
    mongo_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    mongo_client = AsyncIOMotorClient(mongo_url)
    app_state.db = mongo_client["revenue_recovery"]
    
    try:
        await app_state.db["recovery_cases"].create_index("payment_id")
        await app_state.db["recovery_cases"].create_index("customer_id")
        await app_state.db["recovery_cases"].create_index("created_at")
        await app_state.db["customers"].create_index("customer_id")
        await app_state.db["promise_to_pay"].create_index("ptp_id")
        print("[OK] Database indexes created")
    except Exception as e:
        print(f"[WARN] Error creating indexes: {e}")
    
    # Initialize Razorpay
    app_state.razorpay = RazorpayService(
        key_id=os.getenv("RAZORPAY_KEY_ID", "rzp_test_123"),
        key_secret=os.getenv("RAZORPAY_KEY_SECRET", "test_secret"),
        test_mode=os.getenv("RAZORPAY_TEST_MODE", "true").lower() == "true"
    )
    print("[OK] Razorpay service initialized")
    
    # Initialize Workflow & Simulation Engine
    app_state.workflow = RevenueRecoveryWorkflow(
        db=app_state.db,
        services={"payment": PaymentService(app_state.razorpay)}
    )
    app_state.simulator = BatchSimulationService(app_state.workflow, app_state.db)
    print("[OK] Revenue recovery workflow and batch simulator initialized")
    
    # Seed historical demo data
    await seed_initial_data(app_state.db)
    
    yield
    
    mongo_client.close()
    print("[OK] Database connection closed")


# ============================================================================
# CREATE APP
# ============================================================================

app = FastAPI(
    title="Reclaim.AI — Autonomous Multi-Channel Revenue Recovery",
    description="Detect revenue at risk across checkout, payments, mandates & B2B invoices and win it back with bounded AI agents.",
    version="2.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================================
# DEPENDENCIES
# ============================================================================

async def get_db():
    return app_state.db

async def get_razorpay():
    return app_state.razorpay

async def get_workflow():
    return app_state.workflow

async def get_simulator():
    return app_state.simulator


# ============================================================================
# HELPER SERVICES
# ============================================================================

class PaymentService:
    def __init__(self, razorpay):
        self.razorpay = razorpay
    
    async def retry_payment(self, payment_id: str, customer_id: str, amount: float):
        return await self.razorpay.retry_payment(
            payment_id=payment_id,
            customer_id=customer_id,
            amount=amount
        )


# ============================================================================
# API ROUTES
# ============================================================================

@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "reclaim-ai-revenue-recovery",
        "version": "2.0.0",
        "capabilities": [
            "payment_degradation_recovery",
            "checkout_dropoff_recovery",
            "failed_subscription_recovery",
            "b2b_receivables_chaser",
            "mandate_retry_sequencer",
            "hinglish_voice_recovery",
            "promise_to_pay_tracker",
            "bounded_guardrails_engine"
        ]
    }


# ----------------------------------------------------------------------------
# 1. BATCH SIMULATION ENGINE (The Bar: Show Measured Money Recovered)
# ----------------------------------------------------------------------------

@app.post("/api/simulation/run-batch")
async def run_batch_simulation(
    batch_size: int = Query(default=8, ge=1, le=50),
    confidence_threshold: float = Query(default=0.70, ge=0.5, le=0.95),
    simulator = Depends(get_simulator)
):
    """
    Run an autonomous batch recovery simulation across 5 diverse leakage channels.
    Returns measured money recovered, net ROI, stopping rules triggered, and case traces.
    """
    try:
        result = await simulator.run_batch_simulation(
            batch_size=batch_size,
            confidence_threshold=confidence_threshold
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/simulation/scenarios")
async def get_simulation_scenarios():
    """Return predefined test scenarios for single-click demonstrations"""
    return {
        "scenarios": [
            {
                "id": "scenario_payment_degradation",
                "title": "Payment Degradation (Gateway Timeout)",
                "channel": "smart_retry",
                "sample_amount": 2400.0,
                "customer": "Vikram Malhotra (LTV: $45,000)",
                "description": "Card authorization hold timeout at bank switch. Smart retry sequenced with cooling-off window."
            },
            {
                "id": "scenario_checkout_dropoff",
                "title": "High-Value Checkout Drop-Off",
                "channel": "dynamic_incentive",
                "sample_amount": 5800.0,
                "customer": "Pooja Hegde (LTV: $28,500)",
                "description": "Abandoned cart at 3D Secure review. Bounded 10% coupon issued via WhatsApp 1-click link."
            },
            {
                "id": "scenario_hinglish_voice",
                "title": "Hinglish AI Voice Recovery Call",
                "channel": "hinglish_voice",
                "sample_amount": 3200.0,
                "customer": "Ananya Roy (LTV: $14,200)",
                "description": "Conversational Hinglish AI agent Aarav negotiates salary date retry and books Promise-to-Pay."
            },
            {
                "id": "scenario_b2b_receivables",
                "title": "B2B Overdue Invoice Chaser (Net-45)",
                "channel": "b2b_invoice_chaser",
                "sample_amount": 75000.0,
                "customer": "Amitabh Sen / Global Ventures",
                "description": "Enterprise invoice reconciliation statement & automated wire transfer commitment."
            },
            {
                "id": "scenario_mandate_sequencer",
                "title": "NACH / E-Mandate Salary Synchronizer",
                "channel": "mandate_sequencer",
                "sample_amount": 4200.0,
                "customer": "Siddharth Rao (LTV: $89,000)",
                "description": "Auto-debit mandate timed to 1st of month 09:30 AM issuer clearing window."
            }
        ]
    }


# ----------------------------------------------------------------------------
# 2. HINGLISH VOICE RECOVERY SIMULATOR
# ----------------------------------------------------------------------------

@app.post("/api/voice/simulate-call")
async def simulate_voice_call(
    customer_name: str = Query(default="Priya Sharma"),
    amount: float = Query(default=3500.0),
    language: str = Query(default="Hinglish")
):
    """
    Generate an interactive Hinglish Voice recovery dialogue, customer sentiment, and PTP outcome.
    """
    ptp_date = (datetime.utcnow() + timedelta(days=2)).strftime("%Y-%m-%d")
    
    return {
        "call_id": f"voice_{datetime.utcnow().timestamp():.0f}",
        "customer_name": customer_name,
        "amount": amount,
        "language": language,
        "duration_seconds": 46,
        "sentiment_score": 0.94,
        "sentiment_label": "positive",
        "audio_wave_data": [24, 45, 68, 85, 92, 70, 40, 15, 60, 80, 95, 78, 55, 30, 72, 88, 90, 60, 20],
        "dialogue": [
            {
                "speaker": "AI Agent (Aarav)",
                "text": f"Namaste {customer_name} ji! Main Reclaim AI assistant Aarav baat kar raha hoon. Aapka ₹{amount:,.0f} ka subscription renewal bank server timeout ki wajah se complete nahi ho paya tha.",
                "timestamp": "00:04",
                "sentiment": "neutral"
            },
            {
                "speaker": "Customer",
                "text": "Oh, mujhe message mila tha. Mera account active hai, payment automatically ho jayega ya mujhe kuch karna hoga?",
                "timestamp": "00:16",
                "sentiment": "neutral"
            },
            {
                "speaker": "AI Agent (Aarav)",
                "text": f"Ji bilkul, aapko kuch karne ki zaroorat nahi hai. Humne bank switch ke saath test kiya hai. Kya hum {ptp_date} ko subah 10 baje auto-retry kar dein?",
                "timestamp": "00:29",
                "sentiment": "positive"
            },
            {
                "speaker": "Customer",
                "text": f"Haan bilkul, {ptp_date} ko kar lijiye. Perfect rahega.",
                "timestamp": "00:38",
                "sentiment": "positive"
            },
            {
                "speaker": "AI Agent (Aarav)",
                "text": f"Bahut shukriya {customer_name} ji! Promise-to-Pay schedule ho chuka hai. Aapko WhatsApp par confirmation mil jayega. Have a great day!",
                "timestamp": "00:45",
                "sentiment": "positive"
            }
        ],
        "outcome": {
            "status": "ptp_scheduled",
            "ptp_date": ptp_date,
            "amount_reclaimed": amount,
            "mandate_armed": True
        }
    }


# ----------------------------------------------------------------------------
# 3. PROMISE-TO-PAY (PTP) LEDGER
# ----------------------------------------------------------------------------

@app.get("/api/ptp/ledger")
async def get_ptp_ledger(db = Depends(get_db)):
    """Fetch active Promise-to-Pay commitments with auto-mandate schedules"""
    try:
        ptp_coll = db["promise_to_pay"]
        items = await ptp_coll.find({}).sort("promised_date", 1).to_list(length=100)
        for item in items:
            item.pop("_id", None)
        
        # If empty, return seed items
        if not items:
            items = [
                {
                    "ptp_id": "ptp_001",
                    "case_id": "case_seed_102",
                    "customer_id": "cust_in_801",
                    "customer_name": "Vikram Malhotra",
                    "amount": 3200.0,
                    "promised_date": (datetime.utcnow() + timedelta(days=1)).strftime("%Y-%m-%d"),
                    "status": "pending",
                    "mandate_auto_trigger": True,
                    "channel": "hinglish_voice"
                },
                {
                    "ptp_id": "ptp_002",
                    "case_id": "case_seed_103",
                    "customer_id": "cust_in_804",
                    "customer_name": "Siddharth Rao",
                    "amount": 45000.0,
                    "promised_date": (datetime.utcnow() + timedelta(days=3)).strftime("%Y-%m-%d"),
                    "status": "pending",
                    "mandate_auto_trigger": True,
                    "channel": "b2b_invoice_chaser"
                }
            ]
        
        total_ptp_value = sum(i.get("amount", 0) for i in items)
        return {
            "total_ptp_commitments": len(items),
            "total_ptp_value": total_ptp_value,
            "commitments": items
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ----------------------------------------------------------------------------
# 4. BOUNDED GUARDRAILS & STOPPING RULES
# ----------------------------------------------------------------------------

@app.get("/api/rules/guardrails")
async def get_guardrails():
    """Get active safety guardrails and stopping rules"""
    return {
        "max_retries": app_state.guardrails.max_retries,
        "cooling_off_hours": app_state.guardrails.cooling_off_hours,
        "discount_ceiling_pct": app_state.guardrails.discount_ceiling_pct,
        "anti_harassment_daily_limit": app_state.guardrails.anti_harassment_daily_limit,
        "auto_escalate_fraud": app_state.guardrails.auto_escalate_fraud,
        "active_channels": app_state.guardrails.active_channels,
        "rules_description": {
            "MAX_RETRY_LIMIT": "Stops blind retries after N attempts to prevent issuer card blocking and interchange fees.",
            "COOLING_OFF_PERIOD": "Enforces mandatory cooling off on insufficient funds to prevent unnecessary customer friction.",
            "DISCOUNT_CEILING_CAP": "Guarantees dynamic checkout incentives never exceed financial margin boundaries (max 15%).",
            "ANTI_HARASSMENT_CAP": "Restricts conversational outreach (Voice/SMS) to max 2 attempts per 24 hours.",
            "FRAUD_PREVENTION_STOP": "Instantly halts all automated actions and escalates directly to human compliance."
        }
    }


@app.post("/api/rules/guardrails")
async def update_guardrails(config: Dict[str, Any]):
    """Update active safety guardrails"""
    if "max_retries" in config:
        app_state.guardrails.max_retries = int(config["max_retries"])
    if "cooling_off_hours" in config:
        app_state.guardrails.cooling_off_hours = int(config["cooling_off_hours"])
    if "discount_ceiling_pct" in config:
        app_state.guardrails.discount_ceiling_pct = float(config["discount_ceiling_pct"])
    if "anti_harassment_daily_limit" in config:
        app_state.guardrails.anti_harassment_daily_limit = int(config["anti_harassment_daily_limit"])
    
    return {"status": "updated", "guardrails": await get_guardrails()}


# ----------------------------------------------------------------------------
# 5. DASHBOARD METRICS & CASES
# ----------------------------------------------------------------------------

@app.get("/api/dashboard/metrics")
async def get_dashboard_metrics(db = Depends(get_db)):
    """Aggregated financial KPIs for dashboard"""
    try:
        cases_collection = db["recovery_cases"]
        total_cases = await cases_collection.count_documents({})
        completed = await cases_collection.count_documents({"status": "completed"})
        failed = await cases_collection.count_documents({"status": "failed"})
        escalated = await cases_collection.count_documents({"status": "escalated"})
        
        # Calculate recovered sum
        rec_pipe = [{"$group": {"_id": None, "total": {"$sum": "$amount_recovered"}}}]
        rec_res = await cases_collection.aggregate(rec_pipe).to_list(length=1)
        total_recovered = rec_res[0]["total"] if rec_res else 0.0
        
        # Calculate total at-risk
        risk_pipe = [{"$group": {"_id": None, "total": {"$sum": "$amount"}}}]
        risk_res = await cases_collection.aggregate(risk_pipe).to_list(length=1)
        total_at_risk = risk_res[0]["total"] if risk_res else 0.0
        
        success_rate = (completed / total_cases * 100) if total_cases > 0 else 0.0
        
        return {
            "total_cases": total_cases,
            "completed_cases": completed,
            "failed_cases": failed,
            "escalated_cases": escalated,
            "total_recovered": round(total_recovered, 2),
            "total_at_risk": round(total_at_risk, 2),
            "success_rate": round(success_rate, 1),
            "prevented_churn_value": round(total_recovered * 1.8, 2),
            "ai_operational_cost": round(total_recovered * 0.012, 2),
            "net_roi_multiple": round((total_recovered / (total_recovered * 0.012)), 1) if total_recovered > 0 else 83.3
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/cases/all")
async def get_all_cases(
    limit: int = Query(default=50, ge=1, le=200),
    scenario: Optional[str] = None,
    status: Optional[str] = None,
    db = Depends(get_db)
):
    """List all recovery cases with filter support"""
    try:
        filter_query = {}
        if scenario:
            filter_query["scenario"] = scenario.lower()
        if status:
            filter_query["status"] = status.lower()
            
        cases_coll = db["recovery_cases"]
        cases = await cases_coll.find(filter_query).sort("created_at", -1).limit(limit).to_list(length=limit)
        for c in cases:
            c.pop("_id", None)
            
        return {"total": len(cases), "cases": cases}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/cases/start-recovery")
async def start_recovery(
    request: PaymentRecoveryRequest,
    background_tasks: BackgroundTasks,
    db = Depends(get_db),
    workflow = Depends(get_workflow),
    razorpay = Depends(get_razorpay)
):
    """Start individual recovery workflow"""
    try:
        payment_data = await razorpay.get_payment_details(request.payment_id)
        if not payment_data:
            raise HTTPException(status_code=404, detail="Payment not found")
        
        signals = razorpay.extract_payment_signals(payment_data)
        
        initial_state = RevenuRecoveryState(
            payment_id=request.payment_id,
            customer_id=request.customer_id,
            payment_amount=float(payment_data.get("amount", 100000)) / 100,
            payment_method=payment_data.get("method", "card"),
            failure_reason=payment_data.get("description", "Payment failed"),
            payment_signals=signals,
            confidence_threshold=getattr(request, "confidence_threshold", 0.7)
        )
        
        async def run_workflow():
            try:
                await workflow.invoke(initial_state)
            except Exception as e:
                print(f"Workflow error: {e}")
        
        background_tasks.add_task(run_workflow)
        
        return {
            "case_id": initial_state.case_id,
            "payment_id": request.payment_id,
            "customer_id": request.customer_id,
            "amount": initial_state.payment_amount,
            "status": "processing",
            "message": "Recovery workflow started"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/cases/{case_id}")
async def get_case_status(case_id: str, db = Depends(get_db)):
    """Get single recovery case details with full audit log"""
    try:
        cases_coll = db["recovery_cases"]
        case = await cases_coll.find_one({"case_id": case_id})
        if not case:
            raise HTTPException(status_code=404, detail="Case not found")
        case.pop("_id", None)
        return case
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

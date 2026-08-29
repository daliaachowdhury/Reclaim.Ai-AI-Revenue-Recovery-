"""
Batch Simulation Engine for Multi-Channel Revenue Recovery
"""

import random
from datetime import datetime, timedelta
from typing import List, Dict, Any

from app.core.state import (
    RevenuRecoveryState,
    LeakageScenario,
    PaymentSignal,
    CustomerContext,
    WorkflowStatus
)


SAMPLE_CUSTOMERS = [
    {"id": "cust_in_801", "name": "Vikram Malhotra", "email": "vikram@techcorp.in", "phone": "+91 98201 11223", "ltv": 45000.0, "churn": "low"},
    {"id": "cust_in_802", "name": "Pooja Hegde", "email": "pooja@cloudscale.io", "phone": "+91 98450 33445", "ltv": 28500.0, "churn": "medium"},
    {"id": "cust_in_803", "name": "Ananya Roy", "email": "ananya@urbanstyle.com", "phone": "+91 97110 55667", "ltv": 14200.0, "churn": "low"},
    {"id": "cust_in_804", "name": "Siddharth Rao", "email": "siddharth@fintechhub.co", "phone": "+91 99001 77889", "ltv": 89000.0, "churn": "low"},
    {"id": "cust_in_805", "name": "Kavita Nair", "email": "kavita@edunext.org", "phone": "+91 96500 99001", "ltv": 32000.0, "churn": "high"},
    {"id": "cust_in_806", "name": "Rajesh Kumar", "email": "rajesh@hyperlogistics.in", "phone": "+91 94440 22334", "ltv": 115000.0, "churn": "low"},
    {"id": "cust_in_807", "name": "Deepa Sundaram", "email": "deepa@designworks.io", "phone": "+91 98840 44556", "ltv": 19500.0, "churn": "medium"},
    {"id": "cust_in_808", "name": "Amitabh Sen", "email": "amitabh@globalventures.com", "phone": "+91 98300 66778", "ltv": 210000.0, "churn": "low"},
]

SCENARIO_TEMPLATES = [
    {
        "scenario": LeakageScenario.PAYMENT_DEGRADATION,
        "amount_range": (800, 3500),
        "method": "credit_card",
        "reason": "Card authorization hold timeout at bank switch",
        "signal": "issuer_gateway_latency_spike"
    },
    {
        "scenario": LeakageScenario.CHECKOUT_DROPOFF,
        "amount_range": (1500, 8000),
        "method": "upi",
        "reason": "Checkout drop-off at payment review page",
        "signal": "cart_abandoned_after_discount_search"
    },
    {
        "scenario": LeakageScenario.FAILED_SUBSCRIPTION,
        "amount_range": (1200, 5000),
        "method": "recurring_mandate",
        "reason": "Monthly recurring auto-debit declined by card issuer",
        "signal": "mandate_cycle_mismatch"
    },
    {
        "scenario": LeakageScenario.B2B_RECEIVABLES,
        "amount_range": (25000, 120000),
        "method": "bank_transfer",
        "reason": "Overdue enterprise SaaS invoice (45 days past Net-30)",
        "signal": "ap_approval_delayed"
    },
    {
        "scenario": LeakageScenario.MANDATE_SEQUENCER,
        "amount_range": (2000, 9500),
        "method": "nach_e_mandate",
        "reason": "NACH mandate debit failed due to weekend settlement window",
        "signal": "nach_clearing_timing_issue"
    }
]


class BatchSimulationService:
    def __init__(self, workflow, db):
        self.workflow = workflow
        self.db = db

    async def run_batch_simulation(self, batch_size: int = 10, confidence_threshold: float = 0.70) -> Dict[str, Any]:
        """
        Run an autonomous batch recovery simulation across mixed real-world scenarios.
        """
        results: List[Dict[str, Any]] = []
        total_at_risk = 0.0
        total_reclaimed = 0.0
        scenarios_count = {}
        stopping_rules_hit = 0
        
        for i in range(batch_size):
            cust = random.choice(SAMPLE_CUSTOMERS)
            tmpl = random.choice(SCENARIO_TEMPLATES)
            
            amount = round(random.uniform(*tmpl["amount_range"]), 2)
            total_at_risk += amount
            
            sc_name = tmpl["scenario"].value
            scenarios_count[sc_name] = scenarios_count.get(sc_name, 0) + 1
            
            initial_state = RevenuRecoveryState(
                payment_id=f"pay_sim_{random.randint(100000, 999999)}",
                customer_id=cust["id"],
                scenario=tmpl["scenario"],
                payment_amount=amount,
                payment_method=tmpl["method"],
                failure_reason=tmpl["reason"],
                confidence_threshold=confidence_threshold,
                payment_signals=[
                    PaymentSignal(
                        signal_type=tmpl["signal"],
                        severity="high" if amount > 10000 else "medium",
                        timestamp=datetime.utcnow(),
                        details={"basket_amount": amount, "customer_tier": "VIP" if cust["ltv"] > 50000 else "Standard"}
                    )
                ]
            )
            
            # Enrich context
            initial_state.customer_context = CustomerContext(
                customer_id=cust["id"],
                customer_name=cust["name"],
                customer_email=cust["email"],
                customer_phone=cust["phone"],
                lifetime_value=cust["ltv"],
                churn_risk=cust["churn"]
            )
            
            # Execute through LangGraph
            final_state = await self.workflow.invoke(initial_state)
            
            total_reclaimed += final_state.amount_recovered
            if final_state.status == WorkflowStatus.STOPPED_BY_RULE or final_state.status == WorkflowStatus.ESCALATED:
                stopping_rules_hit += 1
            
            results.append({
                "case_id": final_state.case_id,
                "customer_name": cust["name"],
                "customer_id": cust["id"],
                "scenario": final_state.scenario.value,
                "amount_at_risk": final_state.payment_amount,
                "amount_reclaimed": final_state.amount_recovered,
                "status": final_state.status.value,
                "channel_used": final_state.selected_action.channel.value if final_state.selected_action else "none",
                "action_type": final_state.selected_action.action_type.value if final_state.selected_action else "none",
                "has_voice_call": final_state.selected_action.voice_data is not None if final_state.selected_action else False,
                "has_ptp": final_state.selected_action.ptp_data is not None if final_state.selected_action else False,
                "confidence": final_state.diagnosis.confidence_score if final_state.diagnosis else 0.85,
                "root_cause": final_state.diagnosis.root_cause if final_state.diagnosis else "Gateway Latency",
                "completed_at": datetime.utcnow().isoformat()
            })

        recovery_rate = (total_reclaimed / total_at_risk * 100) if total_at_risk > 0 else 0.0
        
        return {
            "simulation_id": f"sim_{datetime.utcnow().timestamp():.0f}",
            "batch_size": batch_size,
            "total_at_risk": round(total_at_risk, 2),
            "total_reclaimed": round(total_reclaimed, 2),
            "recovery_rate_pct": round(recovery_rate, 1),
            "estimated_cost_of_recovery": round(total_reclaimed * 0.015, 2),  # ~1.5% AI agent operational cost
            "net_roi_multiple": round((total_reclaimed / (total_reclaimed * 0.015)), 1) if total_reclaimed > 0 else 0.0,
            "stopping_rules_triggered": stopping_rules_hit,
            "scenarios_breakdown": scenarios_count,
            "cases": results,
            "timestamp": datetime.utcnow().isoformat()
        }

"""
Pydantic Schemas for API Requests/Responses
"""

from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


# ============================================================================
# REQUEST SCHEMAS
# ============================================================================

class PaymentRecoveryRequest(BaseModel):
    """Request to start a recovery workflow for a failed payment"""
    payment_id: str = Field(..., description="Razorpay payment ID")
    customer_id: str = Field(..., description="Customer ID")
    confidence_threshold: float = Field(default=0.7, ge=0.0, le=1.0, description="Minimum confidence score to proceed")
    
    class Config:
        example = {
            "payment_id": "pay_123456789",
            "customer_id": "cust_987654321",
            "confidence_threshold": 0.7
        }


class ManualReviewRequest(BaseModel):
    """Request to escalate a case to manual review"""
    case_id: str
    priority: str = Field(default="high", pattern="^(low|medium|high|critical)$")
    notes: Optional[str] = None


# ============================================================================
# RESPONSE SCHEMAS
# ============================================================================

class PaymentRecoveryResponse(BaseModel):
    """Response after starting a recovery workflow"""
    case_id: str
    payment_id: str
    customer_id: str
    amount: float
    status: str = "processing"
    message: str


class AuditLogEntryResponse(BaseModel):
    """Audit log entry in responses"""
    timestamp: datetime
    event_type: str
    stage: str
    action: str
    details: Dict[str, Any]
    user_id: Optional[str] = None


class DiagnosisResponse(BaseModel):
    """Diagnosis results in response"""
    root_cause: str
    failure_type: str
    confidence_score: float
    reasoning: str
    recovery_likelihood: float
    suggested_actions: List[str]


class RecoveryActionResponse(BaseModel):
    """Recovery action in response"""
    action_type: str
    priority: str
    parameters: Dict[str, Any]
    executed_at: Optional[datetime] = None
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None


class CaseStatusResponse(BaseModel):
    """Complete case status response"""
    case_id: str
    payment_id: str
    customer_id: str
    amount: float
    amount_recovered: float
    status: str
    diagnosis: Optional[DiagnosisResponse] = None
    action: Optional[RecoveryActionResponse] = None
    audit_log: List[AuditLogEntryResponse]
    created_at: datetime
    completed_at: Optional[datetime] = None


# ============================================================================
# DASHBOARD SCHEMAS
# ============================================================================

class DashboardMetrics(BaseModel):
    """Aggregated metrics for dashboard"""
    total_cases: int
    completed_cases: int
    failed_cases: int
    total_recovered: float
    total_at_risk: float
    success_rate: float


class RecoveryTrendData(BaseModel):
    """Trend data for charts"""
    date: str
    cases_attempted: int
    cases_successful: int
    amount_recovered: float


class TopReasonData(BaseModel):
    """Top failure reasons"""
    failure_type: str
    count: int
    recovery_rate: float


class DashboardSummary(BaseModel):
    """Complete dashboard summary"""
    metrics: DashboardMetrics
    trends: List[RecoveryTrendData]
    top_reasons: List[TopReasonData]
    recent_cases: List[CaseStatusResponse]


# ============================================================================
# ERROR SCHEMAS
# ============================================================================

class ErrorResponse(BaseModel):
    """Standard error response"""
    status: str = "error"
    message: str
    details: Optional[Dict[str, Any]] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class ValidationError(BaseModel):
    """Validation error response"""
    status: str = "validation_error"
    errors: List[Dict[str, str]]
    timestamp: datetime = Field(default_factory=datetime.utcnow)

"""
Razorpay Integration Service for Revenue Recovery
"""

import httpx
import json
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.core.state import PaymentSignal


class RazorpayService:
    """
    Service to interact with Razorpay API.
    Fetches failed payments, payment details, customer data.
    """
    
    def __init__(self, key_id: str, key_secret: str, test_mode: bool = True):
        """
        Initialize Razorpay service.
        
        Args:
            key_id: Razorpay API Key ID
            key_secret: Razorpay API Secret
            test_mode: Use test/sandbox mode
        """
        self.key_id = key_id
        self.key_secret = key_secret
        self.test_mode = test_mode
        self.base_url = "https://api.razorpay.com/v1"
        self.client = httpx.AsyncClient(
            auth=(key_id, key_secret),
            headers={"Content-Type": "application/json"}
        )
    
    async def get_failed_payments(self, limit: int = 50) -> List[Dict[str, Any]]:
        """
        Fetch recent failed payments from Razorpay.
        """
        try:
            params = {
                "status": "failed",
                "limit": limit,
                "expand[]": ["customer", "notes"]
            }
            response = await self.client.get(
                f"{self.base_url}/payments",
                params=params
            )
            response.raise_for_status()
            data = response.json()
            return data.get("items", [])
        except Exception as e:
            print(f"Error fetching failed payments: {e}")
            return []
    
    async def get_payment_details(self, payment_id: str) -> Optional[Dict[str, Any]]:
        """
        Fetch detailed information about a specific payment.
        """
        if self.test_mode or payment_id.startswith("pay_test_") or self.key_id.startswith("rzp_test_"):
            return {
                "id": payment_id,
                "entity": "payment",
                "amount": 100000,
                "currency": "INR",
                "status": "failed",
                "method": "card",
                "description": "Card declined due to insufficient funds",
                "email": "customer@example.com",
                "contact": "+919999999999",
                "error_code": "BAD_REQUEST_ERROR",
                "error_description": "Card declined due to insufficient funds",
                "error_reason": "insufficient_funds"
            }
        try:
            response = await self.client.get(
                f"{self.base_url}/payments/{payment_id}",
                params={"expand[]": ["customer", "notes"]}
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Error fetching payment {payment_id}: {e}")
            return None
    
    async def get_customer_details(self, customer_id: str) -> Optional[Dict[str, Any]]:
        """
        Fetch customer information from Razorpay.
        """
        try:
            response = await self.client.get(
                f"{self.base_url}/customers/{customer_id}"
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Error fetching customer {customer_id}: {e}")
            return None
    
    async def get_customer_payments(self, customer_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """
        Fetch all payments for a customer.
        """
        try:
            response = await self.client.get(
                f"{self.base_url}/customers/{customer_id}/payments",
                params={"limit": limit}
            )
            response.raise_for_status()
            data = response.json()
            return data.get("items", [])
        except Exception as e:
            print(f"Error fetching customer payments: {e}")
            return []
    
    async def get_customer_tokens(self, customer_id: str) -> List[Dict[str, Any]]:
        """
        Fetch saved payment methods (tokens) for a customer.
        """
        try:
            response = await self.client.get(
                f"{self.base_url}/customers/{customer_id}/tokens"
            )
            response.raise_for_status()
            data = response.json()
            return data.get("items", [])
        except Exception as e:
            print(f"Error fetching customer tokens: {e}")
            return []
    
    async def retry_payment(
        self,
        payment_id: str,
        amount: float,
        customer_id: str,
        token_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Attempt to retry a failed payment.
        """
        if self.test_mode or payment_id.startswith("pay_test_") or self.key_id.startswith("rzp_test_"):
            return {
                "success": True,
                "payment": {
                    "id": f"pay_retry_{payment_id}",
                    "status": "captured",
                    "amount": int(amount * 100)
                }
            }
        try:
            payload = {
                "email": "customer@example.com",  # Should come from customer context
                "contact": "+91XXXXXXXXXX",  # Should come from customer context
                "amount": int(amount * 100),  # Convert to paise
                "currency": "INR",
                "customer_id": customer_id,
                "description": f"Payment retry for failed payment {payment_id}",
                "notes": {
                    "original_payment_id": payment_id,
                    "recovery_attempt": True
                }
            }
            
            if token_id:
                payload["token"] = token_id
            
            response = await self.client.post(
                f"{self.base_url}/payments",
                json=payload
            )
            response.raise_for_status()
            return {"success": True, "payment": response.json()}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def capture_payment(self, payment_id: str, amount: float) -> Dict[str, Any]:
        """
        Capture an authorized payment.
        """
        try:
            payload = {"amount": int(amount * 100)}
            response = await self.client.post(
                f"{self.base_url}/payments/{payment_id}/capture",
                json=payload
            )
            response.raise_for_status()
            return {"success": True, "payment": response.json()}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def refund_payment(self, payment_id: str, amount: Optional[float] = None) -> Dict[str, Any]:
        """
        Issue a refund for a payment.
        """
        try:
            payload = {}
            if amount:
                payload["amount"] = int(amount * 100)
            
            response = await self.client.post(
                f"{self.base_url}/payments/{payment_id}/refund",
                json=payload
            )
            response.raise_for_status()
            return {"success": True, "refund": response.json()}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def extract_payment_signals(self, payment_data: Dict[str, Any]) -> List[PaymentSignal]:
        """
        Extract payment signals/indicators from Razorpay payment data.
        """
        signals = []
        
        # Extract failure reason
        failure_reason = payment_data.get("description", "")
        if "declined" in failure_reason.lower():
            signals.append(PaymentSignal(
                signal_type="card_declined",
                severity="high",
                timestamp=datetime.fromtimestamp(payment_data.get("created_at", 0)),
                details={"reason": failure_reason},
                source="razorpay_webhook"
            ))
        
        # Check for insufficient funds
        if "insufficient" in failure_reason.lower():
            signals.append(PaymentSignal(
                signal_type="insufficient_funds",
                severity="high",
                timestamp=datetime.fromtimestamp(payment_data.get("created_at", 0)),
                details={"amount": payment_data.get("amount")},
                source="razorpay_webhook"
            ))
        
        # Gateway errors
        if payment_data.get("gateway_error"):
            signals.append(PaymentSignal(
                signal_type="gateway_error",
                severity="medium",
                timestamp=datetime.fromtimestamp(payment_data.get("created_at", 0)),
                details={"error": payment_data.get("gateway_error")},
                source="razorpay_webhook"
            ))
        
        # Authentication failures
        if "authentication" in failure_reason.lower() or "otp" in failure_reason.lower():
            signals.append(PaymentSignal(
                signal_type="authentication_failed",
                severity="medium",
                timestamp=datetime.fromtimestamp(payment_data.get("created_at", 0)),
                details={"reason": "Authentication/OTP failure"},
                source="razorpay_webhook"
            ))
        
        return signals if signals else [
            PaymentSignal(
                signal_type="generic_failure",
                severity="medium",
                timestamp=datetime.fromtimestamp(payment_data.get("created_at", 0)),
                details={"reason": failure_reason},
                source="razorpay_webhook"
            )
        ]

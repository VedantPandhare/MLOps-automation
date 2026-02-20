"""
Pydantic Schemas for the Fraud Detection API
Request and response models with validation.
"""

from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional


class PredictionRequest(BaseModel):
    """Input schema for a single transaction prediction."""

    amount: float = Field(..., gt=0, description="Transaction amount in USD", example=250.00)
    hour_of_day: int = Field(..., ge=0, le=23, description="Hour of transaction (0-23)", example=14)
    day_of_week: int = Field(..., ge=0, le=6, description="Day of week (0=Mon, 6=Sun)", example=2)
    merchant_category: int = Field(..., ge=0, le=19, description="Merchant category code (0-19)", example=5)
    distance_from_home: float = Field(..., ge=0, description="Distance from home in km", example=12.5)
    num_transactions_24h: int = Field(..., ge=0, description="Number of transactions in last 24h", example=3)
    avg_transaction_amount: float = Field(..., gt=0, description="Average transaction amount (30-day)", example=180.00)
    is_international: int = Field(..., ge=0, le=1, description="1 if international transaction", example=0)
    card_age_days: int = Field(..., ge=0, description="Age of the card in days", example=730)
    failed_attempts_24h: int = Field(..., ge=0, description="Failed payment attempts in last 24h", example=0)

    model_config = ConfigDict(
        protected_namespaces=(),
        json_schema_extra={
            "example": {
                "amount": 250.00,
                "hour_of_day": 14,
                "day_of_week": 2,
                "merchant_category": 5,
                "distance_from_home": 12.5,
                "num_transactions_24h": 3,
                "avg_transaction_amount": 180.00,
                "is_international": 0,
                "card_age_days": 730,
                "failed_attempts_24h": 0,
            }
        }
    )


class PredictionResponse(BaseModel):
    """Output schema for a single transaction prediction."""

    model_config = ConfigDict(protected_namespaces=())

    is_fraud: bool = Field(..., description="True if transaction is predicted as fraud")
    fraud_probability: float = Field(..., ge=0, le=1, description="Probability of fraud (0-1)")
    risk_level: str = Field(..., description="Risk level: MINIMAL, LOW, MEDIUM, HIGH, CRITICAL")
    latency_ms: float = Field(..., description="Model inference latency in milliseconds")
    model_version: str = Field(default="1.0.0", description="Model version used for prediction")


class BatchPredictionRequest(BaseModel):
    """Input schema for batch predictions."""

    transactions: List[PredictionRequest] = Field(
        ..., min_length=1, max_length=1000, description="List of transactions to evaluate"
    )


class BatchTransactionResult(BaseModel):
    """Result for a single transaction in a batch."""

    transaction_index: int
    is_fraud: bool
    fraud_probability: float


class BatchPredictionResponse(BaseModel):
    """Output schema for batch predictions."""

    results: List[BatchTransactionResult]
    total_transactions: int
    fraud_count: int
    fraud_rate: Optional[float] = None

    def model_post_init(self, __context):
        if self.total_transactions > 0:
            self.fraud_rate = round(self.fraud_count / self.total_transactions, 4)



class HealthResponse(BaseModel):
    """Schema for health check responses."""

    model_config = ConfigDict(protected_namespaces=())
    status: str
    model_loaded: bool
    version: str
    environment: str


class OnboardRequest(BaseModel):
    """Request schema for onboarding a new repository."""

    repo_url: str = Field(..., description="Full GitHub repository URL", example="https://github.com/user/repo")
    image_name: Optional[str] = Field(None, description="Custom Docker image name")


class OnboardResponse(BaseModel):
    """Response schema for the onboarding process."""

    success: bool
    message: str
    injected_workflow: Optional[str] = None
    pr_url: Optional[str] = None

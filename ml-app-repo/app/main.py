"""
FastAPI Inference Server for Fraud Detection
Serves real-time predictions with Prometheus metrics and health checks.
"""

import os
import time
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from prometheus_client import Counter, Histogram, Gauge, generate_latest, CONTENT_TYPE_LATEST
from starlette.responses import Response

from schemas import (
    PredictionRequest,
    PredictionResponse,
    BatchPredictionRequest,
    BatchPredictionResponse,
    HealthResponse,
    OnboardRequest,
    OnboardResponse,
)
from onboarding import GithubOnboardingService

# Add src to path for imports
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "src"))
from predict import predict, batch_predict, load_model

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# ─── Prometheus Metrics ────────────────────────────────────────────────────────
REQUEST_COUNT = Counter(
    "fraud_api_requests_total",
    "Total number of prediction requests",
    ["method", "endpoint", "status"],
)
REQUEST_LATENCY = Histogram(
    "fraud_api_request_duration_seconds",
    "Request latency in seconds",
    ["endpoint"],
    buckets=[0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5],
)
FRAUD_PREDICTIONS = Counter(
    "fraud_predictions_total",
    "Total fraud predictions",
    ["prediction"],
)
MODEL_ACCURACY = Gauge("fraud_model_accuracy", "Current model accuracy")
ACTIVE_REQUESTS = Gauge("fraud_api_active_requests", "Number of active requests")

# ─── App Lifecycle ─────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load model on startup."""
    logger.info("🚀 Starting Fraud Detection API...")
    try:
        load_model()
        MODEL_ACCURACY.set(float(os.getenv("MODEL_ACCURACY", "0.95")))
        logger.info("✅ Model loaded successfully")
    except FileNotFoundError:
        logger.warning("⚠️  Model not found. API will start but predictions will fail.")
    yield
    logger.info("Shutting down Fraud Detection API...")


# ─── FastAPI App ───────────────────────────────────────────────────────────────
app = FastAPI(
    title="Fraud Detection API",
    description="Real-time fraud detection powered by ML. Part of the MLOps CI/CD Pipeline showcase.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Middleware ────────────────────────────────────────────────────────────────
@app.middleware("http")
async def track_metrics(request: Request, call_next):
    ACTIVE_REQUESTS.inc()
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time
    REQUEST_LATENCY.labels(endpoint=request.url.path).observe(duration)
    REQUEST_COUNT.labels(
        method=request.method,
        endpoint=request.url.path,
        status=response.status_code,
    ).inc()
    ACTIVE_REQUESTS.dec()
    return response


# ─── Routes ───────────────────────────────────────────────────────────────────
@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """Health check endpoint for Kubernetes liveness/readiness probes."""
    return HealthResponse(
        status="healthy",
        model_loaded=True,
        version=os.getenv("APP_VERSION", "1.0.0"),
        environment=os.getenv("ENVIRONMENT", "development"),
    )


@app.get("/metrics", tags=["Monitoring"])
async def metrics():
    """Prometheus metrics endpoint."""
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)


@app.post("/predict", response_model=PredictionResponse, tags=["Inference"])
async def predict_fraud(request: PredictionRequest):
    """
    Predict whether a transaction is fraudulent.

    Returns fraud probability, risk level, and inference latency.
    """
    try:
        features = request.model_dump()
        result = predict(features)

        FRAUD_PREDICTIONS.labels(
            prediction="fraud" if result["is_fraud"] else "legit"
        ).inc()

        return PredictionResponse(**result)

    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=f"Model not loaded: {str(e)}")
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@app.post("/predict/batch", response_model=BatchPredictionResponse, tags=["Inference"])
async def predict_batch(request: BatchPredictionRequest):
    """Run fraud predictions on a batch of transactions."""
    try:
        transactions = [t.model_dump() for t in request.transactions]
        results = batch_predict(transactions)
        return BatchPredictionResponse(
            results=results,
            total_transactions=len(transactions),
            fraud_count=sum(1 for r in results if r["is_fraud"]),
        )
    except Exception as e:
        logger.error(f"Batch prediction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/model/info", tags=["Model"])
async def model_info():
    """Return current model metadata."""
    return {
        "model_name": "fraud-detection-model",
        "version": os.getenv("MODEL_VERSION", "1.0.0"),
        "accuracy": float(os.getenv("MODEL_ACCURACY", "0.95")),
        "f1_score": float(os.getenv("MODEL_F1", "0.91")),
        "environment": os.getenv("ENVIRONMENT", "development"),
        "mlflow_tracking_uri": os.getenv("MLFLOW_TRACKING_URI", "N/A"),
    }


@app.post("/onboard", response_model=OnboardResponse, tags=["Onboarding"])
async def onboard_repository(request: OnboardRequest):
    """
    Onboard a new repository by injecting the standardized MLOps workflow.
    Requires a valid GITHUB_TOKEN in the environment.
    """
    service = GithubOnboardingService()
    result = await service.onboard_repo(request.repo_url, request.image_name)
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])
    return result


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", "8000")),
        reload=os.getenv("ENVIRONMENT", "development") == "development",
        log_level="info",
    )

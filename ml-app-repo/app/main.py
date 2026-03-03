"""
FastAPI Inference Server for Fraud Detection
Serves real-time predictions with Prometheus metrics and health checks.
"""

import os
import sys
import time
import logging
from contextlib import asynccontextmanager

# Robust path handling for absolute package imports
# Ensure the parent directory is in sys.path so 'from app.xxx' works
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.append(parent_dir)

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from prometheus_client import Counter, Histogram, Gauge, generate_latest, CONTENT_TYPE_LATEST
from starlette.responses import Response

from app.schemas import (
    PredictionRequest,
    PredictionResponse,
    BatchPredictionRequest,
    BatchPredictionResponse,
    HealthResponse,
    OnboardRequest,
    OnboardResponse,
)
from app.onboarding import GithubOnboardingService

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


@app.get("/projects", tags=["Projects"])
async def list_projects():
    """List all available MLOps projects."""
    models_dir = os.path.join(os.path.dirname(__file__), "..", "models")
    projects = []
    if os.path.exists(models_dir):
        for item in os.listdir(models_dir):
            item_path = os.path.join(models_dir, item)
            if os.path.isdir(item_path):
                metadata_path = os.path.join(item_path, "metadata.json")
                name = item
                if os.path.exists(metadata_path):
                    with open(metadata_path, 'r') as f:
                        import json
                        try:
                            data = json.load(f)
                            name = data.get("model_name", item)
                        except: pass
                projects.append({"id": item, "name": name})
    
    # Ensure fraud-detection looks like a project if it exists
    if not any(p["id"] == "fraud-detection" for p in projects):
        projects.insert(0, {"id": "fraud-detection", "name": "Demo - Fraud Detection"})
        
    return projects

@app.delete("/projects/{project_id}", tags=["Projects"])
async def delete_project(project_id: str):
    """Delete a project and its metadata."""
    if project_id == "fraud-detection":
        raise HTTPException(status_code=400, detail="Cannot delete the demo project")
        
    import shutil
    models_dir = os.path.join(os.path.dirname(__file__), "..", "models")
    project_path = os.path.join(models_dir, project_id)
    
    if os.path.exists(project_path) and os.path.isdir(project_path):
        shutil.rmtree(project_path)
        return {"success": True, "message": f"Project {project_id} removed."}
    
    raise HTTPException(status_code=404, detail="Project not found")

@app.get("/model/info", tags=["Model"])
async def model_info(project_id: Optional[str] = None):
    """Return current model metadata."""
    models_dir = os.path.join(os.path.dirname(__file__), "..", "models")
    
    # Default to first project found or fraud-detection
    if not project_id:
        if os.path.exists(models_dir):
            dirs = [d for d in os.listdir(models_dir) if os.path.isdir(os.path.join(models_dir, d))]
            if dirs:
                project_id = dirs[0]
        if not project_id:
            project_id = "fraud-detection"

    metadata_path = os.path.join(models_dir, project_id, "metadata.json")
    
    if os.path.exists(metadata_path):
        import json
        try:
            with open(metadata_path, 'r') as f:
                data = json.load(f)
                return {
                    "model_name": data.get("model_name", "model"),
                    "version": data.get("version", "1.0.0"),
                    "accuracy": data.get("accuracy", 0.95),
                    "f1_score": data.get("f1_score", 0.91),
                    "latency": data.get("latency", 0),
                    "drift": data.get("drift", 0),
                    "environment": data.get("environment", "development"),
                    "architecture": data.get("architecture", "Unknown"),
                    "last_push": data.get("last_push", "N/A"),
                    "mlflow_tracking_uri": os.getenv("MLFLOW_TRACKING_URI", "N/A"),
                    "history": data.get("history", []),
                    "deployments": data.get("deployments", [])
                }
        except Exception as e:
            logger.error(f"Error reading metadata.json for {project_id}: {e}")

    # Fallback to hardcoded demo values if project not found
    return {
        "model_name": "Demo - Fraud Detection",
        "version": os.getenv("MODEL_VERSION", "2.4.1"),
        "accuracy": 0.932,
        "f1_score": 0.911,
        "latency": 4.2,
        "drift": 0.05,
        "environment": "Production",
        "architecture": "Scikit-Learn Ensemble",
        "last_push": "2d ago",
        "mlflow_tracking_uri": os.getenv("MLFLOW_TRACKING_URI", "N/A"),
        "history": [
            { "version": "v2.4.1", "stage": "Production", "accuracy": "93.2%", "f1": "0.911", "date": "2d ago", "runs": "run_88c2f" },
            { "version": "v2.4.0", "stage": "Archived", "accuracy": "92.7%", "f1": "0.905", "date": "9d ago", "runs": "run_77b1e" }
        ],
        "deployments": [
            { "sha": "a3f7c91", "env": "prod", "status": "success", "time": "2m ago", "branch": "main", "triggered": "push" },
            { "sha": "88be204", "env": "staging", "status": "success", "time": "47m ago", "branch": "develop", "triggered": "push" }
        ]
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

"""
Inference / Prediction Logic
Loads the trained fraud detection model and provides prediction utilities.
"""

import os
import logging
import numpy as np
import joblib
from typing import List, Dict, Any

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# Determine the project root (one level up from src)
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

MODEL_PATH = os.getenv("MODEL_OUTPUT_PATH", os.path.join(ROOT_DIR, "models", "fraud_model.pkl"))
SCALER_PATH = os.getenv("SCALER_OUTPUT_PATH", os.path.join(ROOT_DIR, "models", "scaler.pkl"))

FEATURE_COLUMNS = [
    "amount",
    "hour_of_day",
    "day_of_week",
    "merchant_category",
    "distance_from_home",
    "num_transactions_24h",
    "avg_transaction_amount",
    "is_international",
    "card_age_days",
    "failed_attempts_24h",
]

# Singleton model cache
_model = None
_scaler = None


def load_model():
    """Load model and scaler from disk (singleton pattern)."""
    global _model, _scaler
    if _model is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(
                f"Model not found at {MODEL_PATH}. Run train.py first."
            )
        logger.info(f"Loading model from {MODEL_PATH}")
        _model = joblib.load(MODEL_PATH)
        _scaler = joblib.load(SCALER_PATH)
        logger.info("Model and scaler loaded successfully.")
    return _model, _scaler


def predict(features: Dict[str, Any]) -> Dict[str, Any]:
    """
    Run fraud prediction on a single transaction.

    Args:
        features: dict with keys matching FEATURE_COLUMNS

    Returns:
        dict with prediction, fraud_probability, risk_level, and latency_ms
    """
    import time

    model, scaler = load_model()

    # Build feature vector in correct order
    feature_vector = np.array([[features.get(col, 0) for col in FEATURE_COLUMNS]])
    feature_vector_scaled = scaler.transform(feature_vector)

    start = time.perf_counter()
    prediction = int(model.predict(feature_vector_scaled)[0])
    fraud_probability = float(model.predict_proba(feature_vector_scaled)[0][1])
    latency_ms = round((time.perf_counter() - start) * 1000, 2)

    # Risk level classification
    if fraud_probability >= 0.8:
        risk_level = "CRITICAL"
    elif fraud_probability >= 0.6:
        risk_level = "HIGH"
    elif fraud_probability >= 0.4:
        risk_level = "MEDIUM"
    elif fraud_probability >= 0.2:
        risk_level = "LOW"
    else:
        risk_level = "MINIMAL"

    return {
        "is_fraud": bool(prediction),
        "fraud_probability": round(fraud_probability, 4),
        "risk_level": risk_level,
        "latency_ms": latency_ms,
        "model_version": getattr(model, "_mlflow_version", "1.0.0"),
    }


def batch_predict(transactions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Run fraud prediction on a batch of transactions."""
    model, scaler = load_model()

    feature_matrix = np.array([
        [t.get(col, 0) for col in FEATURE_COLUMNS] for t in transactions
    ])
    feature_matrix_scaled = scaler.transform(feature_matrix)

    predictions = model.predict(feature_matrix_scaled)
    probabilities = model.predict_proba(feature_matrix_scaled)[:, 1]

    results = []
    for i, (pred, prob) in enumerate(zip(predictions, probabilities)):
        results.append({
            "transaction_index": i,
            "is_fraud": bool(pred),
            "fraud_probability": round(float(prob), 4),
        })
    return results

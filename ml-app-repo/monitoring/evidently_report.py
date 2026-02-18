"""
Evidently AI — Data Drift & Model Performance Monitoring
Generates drift reports and triggers alerts when thresholds are exceeded.
"""

import os
import json
import logging
import numpy as np
import pandas as pd
from datetime import datetime
from evidently.report import Report
from evidently.metric_preset import DataDriftPreset, ClassificationPreset
from evidently.metrics import DatasetDriftMetric, DatasetMissingValuesMetric

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

DRIFT_THRESHOLD = float(os.getenv("DRIFT_THRESHOLD", "0.15"))
REPORT_OUTPUT_DIR = os.getenv("REPORT_OUTPUT_DIR", "monitoring/reports")

FEATURE_COLUMNS = [
    "amount", "hour_of_day", "day_of_week", "merchant_category",
    "distance_from_home", "num_transactions_24h", "avg_transaction_amount",
    "is_international", "card_age_days", "failed_attempts_24h",
]


def generate_reference_data(n_samples: int = 5000) -> pd.DataFrame:
    """Generate reference (training) data distribution."""
    np.random.seed(42)
    return pd.DataFrame({
        "amount": np.random.lognormal(mean=4.0, sigma=1.5, size=n_samples),
        "hour_of_day": np.random.randint(6, 23, size=n_samples),
        "day_of_week": np.random.randint(0, 7, size=n_samples),
        "merchant_category": np.random.randint(0, 20, size=n_samples),
        "distance_from_home": np.random.exponential(scale=10, size=n_samples),
        "num_transactions_24h": np.random.poisson(lam=3, size=n_samples),
        "avg_transaction_amount": np.random.lognormal(mean=3.5, sigma=1.0, size=n_samples),
        "is_international": np.random.binomial(1, 0.05, size=n_samples),
        "card_age_days": np.random.randint(30, 3650, size=n_samples),
        "failed_attempts_24h": np.random.poisson(lam=0.1, size=n_samples),
        "label": np.random.binomial(1, 0.1, size=n_samples),
    })


def generate_current_data(n_samples: int = 1000, drift_factor: float = 0.0) -> pd.DataFrame:
    """Generate current production data (with optional drift)."""
    np.random.seed(int(datetime.now().timestamp()) % 10000)
    return pd.DataFrame({
        "amount": np.random.lognormal(mean=4.0 + drift_factor, sigma=1.5, size=n_samples),
        "hour_of_day": np.random.randint(0, 24, size=n_samples),
        "day_of_week": np.random.randint(0, 7, size=n_samples),
        "merchant_category": np.random.randint(0, 20, size=n_samples),
        "distance_from_home": np.random.exponential(scale=10 + drift_factor * 20, size=n_samples),
        "num_transactions_24h": np.random.poisson(lam=3 + drift_factor * 2, size=n_samples),
        "avg_transaction_amount": np.random.lognormal(mean=3.5, sigma=1.0, size=n_samples),
        "is_international": np.random.binomial(1, 0.05 + drift_factor * 0.1, size=n_samples),
        "card_age_days": np.random.randint(30, 3650, size=n_samples),
        "failed_attempts_24h": np.random.poisson(lam=0.1, size=n_samples),
        "label": np.random.binomial(1, 0.1, size=n_samples),
    })


def run_drift_report(reference_data: pd.DataFrame, current_data: pd.DataFrame) -> dict:
    """Run Evidently drift report and return summary metrics."""
    os.makedirs(REPORT_OUTPUT_DIR, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    report = Report(metrics=[
        DataDriftPreset(),
        DatasetDriftMetric(),
        DatasetMissingValuesMetric(),
    ])

    report.run(reference_data=reference_data[FEATURE_COLUMNS],
               current_data=current_data[FEATURE_COLUMNS])

    # Save HTML report
    html_path = os.path.join(REPORT_OUTPUT_DIR, f"drift_report_{timestamp}.html")
    report.save_html(html_path)
    logger.info(f"Drift report saved to {html_path}")

    # Extract drift score
    report_dict = report.as_dict()
    drift_score = report_dict["metrics"][1]["result"].get("dataset_drift_score", 0)
    drift_detected = report_dict["metrics"][1]["result"].get("dataset_drift", False)

    result = {
        "timestamp": timestamp,
        "drift_score": round(drift_score, 4),
        "drift_detected": drift_detected,
        "drift_threshold": DRIFT_THRESHOLD,
        "should_retrain": drift_score > DRIFT_THRESHOLD,
        "report_path": html_path,
    }

    # Save JSON summary
    json_path = os.path.join(REPORT_OUTPUT_DIR, f"drift_summary_{timestamp}.json")
    with open(json_path, "w") as f:
        json.dump(result, f, indent=2)

    logger.info(f"Drift Score: {drift_score:.4f} (threshold: {DRIFT_THRESHOLD})")
    logger.info(f"Drift Detected: {drift_detected}")
    logger.info(f"Should Retrain: {result['should_retrain']}")

    return result


def check_and_alert(drift_result: dict):
    """Send alert if drift exceeds threshold."""
    if drift_result["should_retrain"]:
        logger.warning(
            f"⚠️  DATA DRIFT ALERT! Score: {drift_result['drift_score']} "
            f"exceeds threshold {drift_result['drift_threshold']}. "
            f"Triggering retraining pipeline..."
        )
        # In production: trigger GitHub Actions workflow_dispatch via API
        # or send Slack alert via webhook
    else:
        logger.info(f"✅ Drift within acceptable range: {drift_result['drift_score']}")


if __name__ == "__main__":
    logger.info("Running drift detection report...")
    reference = generate_reference_data()
    current = generate_current_data(drift_factor=0.1)  # Simulate slight drift
    result = run_drift_report(reference, current)
    check_and_alert(result)
    print(f"\nDrift Score: {result['drift_score']}")
    print(f"Should Retrain: {result['should_retrain']}")

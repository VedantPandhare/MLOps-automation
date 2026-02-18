"""
Model Evaluation Script
Compares new model performance against the current production model.
Used in the retraining pipeline to decide whether to promote the new model.
"""

import os
import logging
import json
import mlflow
from mlflow.tracking import MlflowClient

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

MLFLOW_TRACKING_URI = os.getenv("MLFLOW_TRACKING_URI", "http://localhost:5000")
MODEL_NAME = "fraud-detection-model"
PROMOTION_THRESHOLD = float(os.getenv("PROMOTION_THRESHOLD", "0.02"))  # 2% improvement required


def get_production_metrics() -> dict:
    """Fetch metrics from the current production model in MLflow."""
    client = MlflowClient(tracking_uri=MLFLOW_TRACKING_URI)

    try:
        prod_versions = client.get_latest_versions(MODEL_NAME, stages=["Production"])
        if not prod_versions:
            logger.warning("No production model found. New model will be promoted automatically.")
            return None

        prod_version = prod_versions[0]
        run = client.get_run(prod_version.run_id)
        metrics = run.data.metrics
        logger.info(f"Production model (v{prod_version.version}) metrics: {metrics}")
        return metrics

    except Exception as e:
        logger.error(f"Error fetching production metrics: {e}")
        return None


def get_new_model_metrics(run_id: str) -> dict:
    """Fetch metrics from the newly trained model run."""
    client = MlflowClient(tracking_uri=MLFLOW_TRACKING_URI)
    run = client.get_run(run_id)
    metrics = run.data.metrics
    logger.info(f"New model (run_id={run_id}) metrics: {metrics}")
    return metrics


def should_promote(new_metrics: dict, prod_metrics: dict) -> bool:
    """
    Decide if the new model should replace production.
    Requires improvement in both F1 score and ROC AUC.
    """
    if prod_metrics is None:
        logger.info("No production model exists. Promoting new model.")
        return True

    new_f1 = new_metrics.get("f1_score", 0)
    prod_f1 = prod_metrics.get("f1_score", 0)
    new_auc = new_metrics.get("roc_auc", 0)
    prod_auc = prod_metrics.get("roc_auc", 0)

    f1_improvement = new_f1 - prod_f1
    auc_improvement = new_auc - prod_auc

    logger.info(f"F1 improvement: {f1_improvement:+.4f} (threshold: {PROMOTION_THRESHOLD})")
    logger.info(f"AUC improvement: {auc_improvement:+.4f} (threshold: {PROMOTION_THRESHOLD})")

    promote = f1_improvement >= PROMOTION_THRESHOLD or auc_improvement >= PROMOTION_THRESHOLD
    logger.info(f"Promotion decision: {'✅ PROMOTE' if promote else '❌ KEEP CURRENT'}")
    return promote


def evaluate_and_compare(new_run_id: str) -> dict:
    """Main evaluation function — returns comparison results."""
    mlflow.set_tracking_uri(MLFLOW_TRACKING_URI)

    prod_metrics = get_production_metrics()
    new_metrics = get_new_model_metrics(new_run_id)
    promote = should_promote(new_metrics, prod_metrics)

    result = {
        "new_run_id": new_run_id,
        "new_metrics": new_metrics,
        "production_metrics": prod_metrics,
        "should_promote": promote,
        "promotion_threshold": PROMOTION_THRESHOLD,
    }

    # Write result to file for GitHub Actions to read
    output_path = os.getenv("EVAL_OUTPUT_PATH", "eval_result.json")
    with open(output_path, "w") as f:
        json.dump(result, f, indent=2)
    logger.info(f"Evaluation result written to {output_path}")

    return result


if __name__ == "__main__":
    import sys
    run_id = sys.argv[1] if len(sys.argv) > 1 else os.getenv("MLFLOW_RUN_ID")
    if not run_id:
        raise ValueError("Provide MLflow run_id as argument or MLFLOW_RUN_ID env var")

    result = evaluate_and_compare(run_id)
    print(f"\n{'✅ PROMOTE' if result['should_promote'] else '❌ KEEP CURRENT'}")
    print(f"New F1: {result['new_metrics'].get('f1_score')}")
    print(f"Prod F1: {result['production_metrics'].get('f1_score') if result['production_metrics'] else 'N/A'}")

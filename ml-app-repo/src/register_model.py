"""
MLflow Model Registration Script
Promotes the best model to Production stage in the MLflow Model Registry.
"""

import os
import logging
import mlflow
from mlflow.tracking import MlflowClient

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

MLFLOW_TRACKING_URI = os.getenv("MLFLOW_TRACKING_URI", "http://localhost:5000")
MODEL_NAME = "fraud-detection-model"


def register_model(run_id: str, model_name: str = MODEL_NAME) -> str:
    """Register a model run in the MLflow Model Registry."""
    mlflow.set_tracking_uri(MLFLOW_TRACKING_URI)
    client = MlflowClient(tracking_uri=MLFLOW_TRACKING_URI)

    model_uri = f"runs:/{run_id}/model"
    logger.info(f"Registering model from run {run_id}...")

    result = mlflow.register_model(model_uri=model_uri, name=model_name)
    version = result.version
    logger.info(f"Model registered as version {version}")
    return version


def promote_to_production(model_name: str = MODEL_NAME, version: str = None):
    """Transition a model version to Production and archive the previous one."""
    client = MlflowClient(tracking_uri=MLFLOW_TRACKING_URI)

    # Archive current production models
    current_prod = client.get_latest_versions(model_name, stages=["Production"])
    for prod_model in current_prod:
        logger.info(f"Archiving previous production model v{prod_model.version}")
        client.transition_model_version_stage(
            name=model_name,
            version=prod_model.version,
            stage="Archived",
            archive_existing_versions=False,
        )

    # Promote new version
    client.transition_model_version_stage(
        name=model_name,
        version=version,
        stage="Production",
    )
    logger.info(f"✅ Model v{version} promoted to Production!")


def register_and_promote(run_id: str):
    """Full registration + promotion flow."""
    version = register_model(run_id)
    promote_to_production(version=version)
    return version


if __name__ == "__main__":
    import sys
    run_id = sys.argv[1] if len(sys.argv) > 1 else os.getenv("MLFLOW_RUN_ID")
    if not run_id:
        raise ValueError("Provide MLflow run_id as argument or MLFLOW_RUN_ID env var")

    version = register_and_promote(run_id)
    print(f"\n✅ Model v{version} is now in Production!")

"""
Fraud Detection Model Training Script
Uses scikit-learn with a RandomForest classifier on synthetic fraud data.
Tracks experiments with MLflow.
"""

import os
import logging
import numpy as np
import pandas as pd
import mlflow
import mlflow.sklearn
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import (
    classification_report,
    roc_auc_score,
    f1_score,
    precision_score,
    recall_score,
    accuracy_score,
)
import joblib

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# ─── Configuration ────────────────────────────────────────────────────────────
MLFLOW_TRACKING_URI = os.getenv("MLFLOW_TRACKING_URI", "http://localhost:5000")
EXPERIMENT_NAME = "fraud-detection"
MODEL_NAME = "fraud-detection-model"
DATA_PATH = os.getenv("DATA_PATH", "data/fraud_dataset.csv")
MODEL_OUTPUT_PATH = os.getenv("MODEL_OUTPUT_PATH", "models/fraud_model.pkl")
SCALER_OUTPUT_PATH = os.getenv("SCALER_OUTPUT_PATH", "models/scaler.pkl")

# Hyperparameters (can be overridden via env vars for DVC params)
N_ESTIMATORS = int(os.getenv("N_ESTIMATORS", "200"))
MAX_DEPTH = int(os.getenv("MAX_DEPTH", "10"))
MIN_SAMPLES_SPLIT = int(os.getenv("MIN_SAMPLES_SPLIT", "5"))
RANDOM_STATE = int(os.getenv("RANDOM_STATE", "42"))
TEST_SIZE = float(os.getenv("TEST_SIZE", "0.2"))


def generate_synthetic_data(n_samples: int = 10000) -> pd.DataFrame:
    """Generate synthetic fraud detection dataset."""
    np.random.seed(RANDOM_STATE)

    # Legitimate transactions (90%)
    n_legit = int(n_samples * 0.9)
    n_fraud = n_samples - n_legit

    legit = pd.DataFrame({
        "amount": np.random.lognormal(mean=4.0, sigma=1.5, size=n_legit),
        "hour_of_day": np.random.randint(6, 23, size=n_legit),
        "day_of_week": np.random.randint(0, 7, size=n_legit),
        "merchant_category": np.random.randint(0, 20, size=n_legit),
        "distance_from_home": np.random.exponential(scale=10, size=n_legit),
        "num_transactions_24h": np.random.poisson(lam=3, size=n_legit),
        "avg_transaction_amount": np.random.lognormal(mean=3.5, sigma=1.0, size=n_legit),
        "is_international": np.random.binomial(1, 0.05, size=n_legit),
        "card_age_days": np.random.randint(30, 3650, size=n_legit),
        "failed_attempts_24h": np.random.poisson(lam=0.1, size=n_legit),
        "label": 0,
    })

    # Fraudulent transactions (10%)
    fraud = pd.DataFrame({
        "amount": np.random.lognormal(mean=5.5, sigma=2.0, size=n_fraud),
        "hour_of_day": np.random.choice([0, 1, 2, 3, 4, 23], size=n_fraud),
        "day_of_week": np.random.randint(0, 7, size=n_fraud),
        "merchant_category": np.random.randint(0, 20, size=n_fraud),
        "distance_from_home": np.random.exponential(scale=100, size=n_fraud),
        "num_transactions_24h": np.random.poisson(lam=8, size=n_fraud),
        "avg_transaction_amount": np.random.lognormal(mean=4.5, sigma=1.5, size=n_fraud),
        "is_international": np.random.binomial(1, 0.4, size=n_fraud),
        "card_age_days": np.random.randint(1, 365, size=n_fraud),
        "failed_attempts_24h": np.random.poisson(lam=2, size=n_fraud),
        "label": 1,
    })

    df = pd.concat([legit, fraud], ignore_index=True).sample(frac=1, random_state=RANDOM_STATE)
    return df


def load_data(path: str) -> pd.DataFrame:
    """Load dataset from CSV or generate synthetic data."""
    if os.path.exists(path):
        logger.info(f"Loading data from {path}")
        return pd.read_csv(path)
    else:
        logger.warning(f"Data file not found at {path}. Generating synthetic data...")
        df = generate_synthetic_data()
        os.makedirs(os.path.dirname(path), exist_ok=True)
        df.to_csv(path, index=False)
        logger.info(f"Synthetic data saved to {path}")
        return df


def preprocess(df: pd.DataFrame):
    """Split features and target, scale features."""
    feature_cols = [c for c in df.columns if c != "label"]
    X = df[feature_cols].values
    y = df["label"].values

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE, stratify=y
    )

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    return X_train_scaled, X_test_scaled, y_train, y_test, scaler


def train_model(X_train, y_train) -> RandomForestClassifier:
    """Train the fraud detection model."""
    model = RandomForestClassifier(
        n_estimators=N_ESTIMATORS,
        max_depth=MAX_DEPTH,
        min_samples_split=MIN_SAMPLES_SPLIT,
        class_weight="balanced",
        random_state=RANDOM_STATE,
        n_jobs=-1,
    )
    logger.info(f"Training RandomForest with {N_ESTIMATORS} estimators...")
    model.fit(X_train, y_train)
    return model


def evaluate_model(model, X_test, y_test) -> dict:
    """Compute evaluation metrics."""
    y_pred = model.predict(X_test)
    y_proba = model.predict_proba(X_test)[:, 1]

    metrics = {
        "accuracy": round(accuracy_score(y_test, y_pred), 4),
        "f1_score": round(f1_score(y_test, y_pred), 4),
        "precision": round(precision_score(y_test, y_pred), 4),
        "recall": round(recall_score(y_test, y_pred), 4),
        "roc_auc": round(roc_auc_score(y_test, y_proba), 4),
    }

    logger.info("Model Evaluation Metrics:")
    for k, v in metrics.items():
        logger.info(f"  {k}: {v}")

    logger.info("\nClassification Report:")
    logger.info(classification_report(y_test, y_pred, target_names=["Legit", "Fraud"]))

    return metrics


def save_artifacts(model, scaler):
    """Save model and scaler to disk."""
    os.makedirs(os.path.dirname(MODEL_OUTPUT_PATH), exist_ok=True)
    joblib.dump(model, MODEL_OUTPUT_PATH)
    joblib.dump(scaler, SCALER_OUTPUT_PATH)
    logger.info(f"Model saved to {MODEL_OUTPUT_PATH}")
    logger.info(f"Scaler saved to {SCALER_OUTPUT_PATH}")


def run_training():
    """Main training pipeline with MLflow tracking."""
    mlflow.set_tracking_uri(MLFLOW_TRACKING_URI)
    mlflow.set_experiment(EXPERIMENT_NAME)

    with mlflow.start_run() as run:
        logger.info(f"MLflow Run ID: {run.info.run_id}")

        # Log hyperparameters
        mlflow.log_params({
            "n_estimators": N_ESTIMATORS,
            "max_depth": MAX_DEPTH,
            "min_samples_split": MIN_SAMPLES_SPLIT,
            "random_state": RANDOM_STATE,
            "test_size": TEST_SIZE,
        })

        # Load and preprocess data
        df = load_data(DATA_PATH)
        logger.info(f"Dataset shape: {df.shape}, Fraud rate: {df['label'].mean():.2%}")
        X_train, X_test, y_train, y_test, scaler = preprocess(df)

        # Train
        model = train_model(X_train, y_train)

        # Evaluate
        metrics = evaluate_model(model, X_test, y_test)
        mlflow.log_metrics(metrics)

        # Save artifacts
        save_artifacts(model, scaler)
        mlflow.sklearn.log_model(model, "model", registered_model_name=MODEL_NAME)
        mlflow.log_artifact(MODEL_OUTPUT_PATH)
        mlflow.log_artifact(SCALER_OUTPUT_PATH)

        logger.info(f"Training complete. Run ID: {run.info.run_id}")
        return metrics, run.info.run_id


if __name__ == "__main__":
    metrics, run_id = run_training()
    print(f"\n✅ Training complete! Run ID: {run_id}")
    print(f"   Accuracy: {metrics['accuracy']}")
    print(f"   F1 Score: {metrics['f1_score']}")
    print(f"   ROC AUC:  {metrics['roc_auc']}")

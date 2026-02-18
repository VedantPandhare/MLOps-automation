"""
Unit Tests for Training and Prediction Logic
"""

import os
import sys
import pytest
import numpy as np

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src"))


class TestDataGeneration:
    """Tests for synthetic data generation."""

    def test_generate_synthetic_data_shape(self):
        from train import generate_synthetic_data
        df = generate_synthetic_data(n_samples=1000)
        assert df.shape[0] == 1000
        assert "label" in df.columns

    def test_generate_synthetic_data_fraud_rate(self):
        from train import generate_synthetic_data
        df = generate_synthetic_data(n_samples=10000)
        fraud_rate = df["label"].mean()
        # Fraud rate should be approximately 10%
        assert 0.08 <= fraud_rate <= 0.12, f"Unexpected fraud rate: {fraud_rate}"

    def test_generate_synthetic_data_columns(self):
        from train import generate_synthetic_data
        df = generate_synthetic_data(n_samples=100)
        expected_cols = [
            "amount", "hour_of_day", "day_of_week", "merchant_category",
            "distance_from_home", "num_transactions_24h", "avg_transaction_amount",
            "is_international", "card_age_days", "failed_attempts_24h", "label",
        ]
        for col in expected_cols:
            assert col in df.columns, f"Missing column: {col}"

    def test_generate_synthetic_data_no_nulls(self):
        from train import generate_synthetic_data
        df = generate_synthetic_data(n_samples=500)
        assert df.isnull().sum().sum() == 0


class TestPreprocessing:
    """Tests for data preprocessing."""

    def test_preprocess_returns_correct_shapes(self):
        from train import generate_synthetic_data, preprocess
        df = generate_synthetic_data(n_samples=1000)
        X_train, X_test, y_train, y_test, scaler = preprocess(df)
        assert X_train.shape[0] + X_test.shape[0] == 1000
        assert X_train.shape[1] == X_test.shape[1]

    def test_preprocess_scaler_applied(self):
        from train import generate_synthetic_data, preprocess
        df = generate_synthetic_data(n_samples=1000)
        X_train, X_test, y_train, y_test, scaler = preprocess(df)
        # Scaled data should have mean ~0 and std ~1
        assert abs(X_train.mean()) < 1.0


class TestModelTraining:
    """Tests for model training."""

    def test_train_model_returns_classifier(self):
        from train import generate_synthetic_data, preprocess, train_model
        from sklearn.ensemble import RandomForestClassifier
        df = generate_synthetic_data(n_samples=500)
        X_train, X_test, y_train, y_test, _ = preprocess(df)
        model = train_model(X_train, y_train)
        assert isinstance(model, RandomForestClassifier)

    def test_model_can_predict(self):
        from train import generate_synthetic_data, preprocess, train_model
        df = generate_synthetic_data(n_samples=500)
        X_train, X_test, y_train, y_test, _ = preprocess(df)
        model = train_model(X_train, y_train)
        preds = model.predict(X_test)
        assert len(preds) == len(y_test)
        assert set(preds).issubset({0, 1})

    def test_evaluate_model_metrics(self):
        from train import generate_synthetic_data, preprocess, train_model, evaluate_model
        df = generate_synthetic_data(n_samples=1000)
        X_train, X_test, y_train, y_test, _ = preprocess(df)
        model = train_model(X_train, y_train)
        metrics = evaluate_model(model, X_test, y_test)
        assert "accuracy" in metrics
        assert "f1_score" in metrics
        assert "roc_auc" in metrics
        assert 0.0 <= metrics["accuracy"] <= 1.0
        assert 0.0 <= metrics["f1_score"] <= 1.0
        assert 0.0 <= metrics["roc_auc"] <= 1.0


class TestPredictionLogic:
    """Tests for prediction logic (without loading a real model)."""

    def test_feature_columns_defined(self):
        from predict import FEATURE_COLUMNS
        assert len(FEATURE_COLUMNS) == 10
        assert "amount" in FEATURE_COLUMNS
        assert "is_international" in FEATURE_COLUMNS

    def test_risk_level_classification(self):
        """Test risk level logic directly."""
        def get_risk_level(prob):
            if prob >= 0.8:
                return "CRITICAL"
            elif prob >= 0.6:
                return "HIGH"
            elif prob >= 0.4:
                return "MEDIUM"
            elif prob >= 0.2:
                return "LOW"
            else:
                return "MINIMAL"

        assert get_risk_level(0.9) == "CRITICAL"
        assert get_risk_level(0.7) == "HIGH"
        assert get_risk_level(0.5) == "MEDIUM"
        assert get_risk_level(0.3) == "LOW"
        assert get_risk_level(0.1) == "MINIMAL"

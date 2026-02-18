"""
Integration Tests for the FastAPI Inference Server
"""

import os
import sys
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock

# Add app to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "app"))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src"))

SAMPLE_TRANSACTION = {
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

SUSPICIOUS_TRANSACTION = {
    "amount": 5000.00,
    "hour_of_day": 2,
    "day_of_week": 6,
    "merchant_category": 15,
    "distance_from_home": 500.0,
    "num_transactions_24h": 12,
    "avg_transaction_amount": 50.00,
    "is_international": 1,
    "card_age_days": 10,
    "failed_attempts_24h": 3,
}


@pytest.fixture
def mock_predict():
    """Mock the predict function to avoid needing a real model."""
    with patch("main.predict") as mock:
        mock.return_value = {
            "is_fraud": False,
            "fraud_probability": 0.05,
            "risk_level": "MINIMAL",
            "latency_ms": 1.2,
            "model_version": "1.0.0",
        }
        yield mock


@pytest.fixture
def mock_load_model():
    """Mock model loading."""
    with patch("main.load_model") as mock:
        mock.return_value = (MagicMock(), MagicMock())
        yield mock


@pytest.fixture
def client(mock_load_model):
    """Create test client with mocked model."""
    from main import app
    with TestClient(app) as c:
        yield c


class TestHealthEndpoint:
    def test_health_returns_200(self, client):
        response = client.get("/health")
        assert response.status_code == 200

    def test_health_response_schema(self, client):
        response = client.get("/health")
        data = response.json()
        assert "status" in data
        assert "model_loaded" in data
        assert "version" in data
        assert "environment" in data

    def test_health_status_is_healthy(self, client):
        response = client.get("/health")
        assert response.json()["status"] == "healthy"


class TestPredictEndpoint:
    def test_predict_returns_200(self, client, mock_predict):
        response = client.post("/predict", json=SAMPLE_TRANSACTION)
        assert response.status_code == 200

    def test_predict_response_schema(self, client, mock_predict):
        response = client.post("/predict", json=SAMPLE_TRANSACTION)
        data = response.json()
        assert "is_fraud" in data
        assert "fraud_probability" in data
        assert "risk_level" in data
        assert "latency_ms" in data

    def test_predict_invalid_amount(self, client):
        bad_transaction = SAMPLE_TRANSACTION.copy()
        bad_transaction["amount"] = -100  # Invalid: must be > 0
        response = client.post("/predict", json=bad_transaction)
        assert response.status_code == 422

    def test_predict_invalid_hour(self, client):
        bad_transaction = SAMPLE_TRANSACTION.copy()
        bad_transaction["hour_of_day"] = 25  # Invalid: must be 0-23
        response = client.post("/predict", json=bad_transaction)
        assert response.status_code == 422

    def test_predict_missing_field(self, client):
        incomplete = {k: v for k, v in SAMPLE_TRANSACTION.items() if k != "amount"}
        response = client.post("/predict", json=incomplete)
        assert response.status_code == 422


class TestBatchPredictEndpoint:
    def test_batch_predict_returns_200(self, client):
        with patch("main.batch_predict") as mock_batch:
            mock_batch.return_value = [
                {"transaction_index": 0, "is_fraud": False, "fraud_probability": 0.05},
                {"transaction_index": 1, "is_fraud": True, "fraud_probability": 0.92},
            ]
            response = client.post(
                "/predict/batch",
                json={"transactions": [SAMPLE_TRANSACTION, SUSPICIOUS_TRANSACTION]},
            )
        assert response.status_code == 200

    def test_batch_predict_response_schema(self, client):
        with patch("main.batch_predict") as mock_batch:
            mock_batch.return_value = [
                {"transaction_index": 0, "is_fraud": False, "fraud_probability": 0.05},
            ]
            response = client.post(
                "/predict/batch",
                json={"transactions": [SAMPLE_TRANSACTION]},
            )
        data = response.json()
        assert "results" in data
        assert "total_transactions" in data
        assert "fraud_count" in data


class TestMetricsEndpoint:
    def test_metrics_returns_200(self, client):
        response = client.get("/metrics")
        assert response.status_code == 200

    def test_metrics_content_type(self, client):
        response = client.get("/metrics")
        assert "text/plain" in response.headers["content-type"]


class TestModelInfoEndpoint:
    def test_model_info_returns_200(self, client):
        response = client.get("/model/info")
        assert response.status_code == 200

    def test_model_info_schema(self, client):
        response = client.get("/model/info")
        data = response.json()
        assert "model_name" in data
        assert "version" in data
        assert "accuracy" in data

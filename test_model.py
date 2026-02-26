
import os
import sys
import numpy as np
import joblib

# Add src to path
sys.path.append(os.path.join(r"d:\MLops\ml-app-repo", "src"))
from predict import FEATURE_COLUMNS

MODEL_PATH = r"d:\MLops\ml-app-repo\models\fraud_model.pkl"
SCALER_PATH = r"d:\MLops\ml-app-repo\models\scaler.pkl"

def test_model():
    if not os.path.exists(MODEL_PATH):
        print(f"ERROR: Model not found at {MODEL_PATH}")
        return

    print(f"Loading model from {MODEL_PATH}")
    model = joblib.load(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)

    # Test case 1: Normal transaction (based on legit data generation)
    test_1 = {
        "amount": 50.0,
        "hour_of_day": 14,
        "day_of_week": 2,
        "merchant_category": 5,
        "distance_from_home": 5.0,
        "num_transactions_24h": 2,
        "avg_transaction_amount": 45.0,
        "is_international": 0,
        "card_age_days": 1000,
        "failed_attempts_24h": 0
    }

    # Test case 2: Fraudulent transaction (based on fraud data generation)
    test_2 = {
        "amount": 800.0,
        "hour_of_day": 2,
        "day_of_week": 2,
        "merchant_category": 5,
        "distance_from_home": 150.0,
        "num_transactions_24h": 10,
        "avg_transaction_amount": 500.0,
        "is_international": 1,
        "card_age_days": 10,
        "failed_attempts_24h": 5
    }

    # Test case 3: User's extreme case
    test_3 = {
        "amount": 2500000.0,
        "hour_of_day": 14,
        "day_of_week": 2,
        "merchant_category": 5,
        "distance_from_home": 12.5,
        "num_transactions_24h": 3,
        "avg_transaction_amount": 180.0,
        "is_international": 0,
        "card_age_days": 730,
        "failed_attempts_24h": 0
    }

    for i, features in enumerate([test_1, test_2, test_3]):
        vec = np.array([[features.get(col, 0) for col in FEATURE_COLUMNS]])
        vec_scaled = scaler.transform(vec)
        prob = model.predict_proba(vec_scaled)[0][1]
        pred = model.predict(vec_scaled)[0]
        print(f"Test case {i+1} ({'Extreme' if i==2 else 'Fraud' if i==1 else 'Legit'}): Probability={prob:.4f}, Prediction={pred}")

if __name__ == "__main__":
    test_model()

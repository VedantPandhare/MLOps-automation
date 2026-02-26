
import os
import sys
import numpy as np
import joblib

# Add src to path
sys.path.append(os.path.join(r"d:\MLops\ml-app-repo", "src"))
from predict import FEATURE_COLUMNS

MODEL_PATH = r"d:\MLops\ml-app-repo\models\fraud_model.pkl"
SCALER_PATH = r"d:\MLops\ml-app-repo\models\scaler.pkl"

def find_intermediate():
    model = joblib.load(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)

    base = {
        "amount": 250.0,
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

    print("Searching for intermediate probabilities...")
    # Vary failed_attempts_24h and hour_of_day
    for hour in range(24):
        for failed in range(3):
            test = base.copy()
            test["hour_of_day"] = hour
            test["failed_attempts_24h"] = failed
            
            vec = np.array([[test.get(col, 0) for col in FEATURE_COLUMNS]])
            vec_scaled = scaler.transform(vec)
            prob = model.predict_proba(vec_scaled)[0][1]
            
            if 0.1 < prob < 0.9:
                print(f"FOUND: Hour={hour}, Failed={failed} -> Prob={prob:.4f}")

if __name__ == "__main__":
    find_intermediate()

# ⚡ MLOps CI/CD Pipeline — Fraud Detection Model

> **A production-grade MLOps project demonstrating a GitHub Actions Shared Library pattern** — centralizing all CI/CD automation so every ML project uses the same standardized pipeline with a single `uses:` line.

[![CI/CD Pipeline](https://img.shields.io/badge/GitHub%20Actions-Passing-brightgreen?logo=github-actions)](https://github.com)
[![Docker](https://img.shields.io/badge/Docker-Multi--stage-blue?logo=docker)](https://hub.docker.com)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-GKE-blue?logo=kubernetes)](https://cloud.google.com/kubernetes-engine)
[![MLflow](https://img.shields.io/badge/MLflow-Tracking-orange?logo=mlflow)](https://mlflow.org)
[![DVC](https://img.shields.io/badge/DVC-Data%20Versioning-purple)](https://dvc.org)

---

## 🏗️ What This Project Demonstrates

| Concept | Implementation |
|---------|---------------|
| **Shared Library Pattern** | `shared-workflows-repo` = GitHub Actions equivalent of a Jenkins Shared Library |
| **Zero-downtime Deploys** | Helm rolling updates on GKE with `maxUnavailable: 0` |
| **Manual Approval Gate** | GitHub Environments require human approval before production deploy |
| **Automated Retraining** | Cron job every Sunday 2AM — trains, evaluates, promotes if better |
| **Data Drift Detection** | Evidently AI monitors distribution shift and triggers alerts |
| **Model Versioning** | MLflow Model Registry with Production/Archived stages |
| **Data Versioning** | DVC tracks datasets and model artifacts in GCS |
| **Security Scanning** | Trivy blocks pipeline on HIGH/CRITICAL CVEs |

---

## 📁 Repository Structure

```
MLops/
├── shared-workflows-repo/          # 🔧 The Shared Library
│   └── .github/workflows/
│       ├── run-tests.yml           # pytest + flake8 + coverage
│       ├── docker-build.yml        # multi-stage build + SHA tag + push
│       ├── security-scan.yml       # Trivy CVE scan
│       ├── deploy-k8s.yml          # Helm upgrade to GKE
│       └── notify-slack.yml        # Slack notifications
│
├── ml-app-repo/                    # 🤖 The ML Application
│   ├── .github/workflows/
│   │   ├── main.yml                # CI/CD pipeline (calls shared library)
│   │   └── retrain.yml             # Scheduled retraining cron job
│   ├── src/
│   │   ├── train.py                # Model training + MLflow tracking
│   │   ├── predict.py              # Inference logic
│   │   ├── evaluate.py             # Model comparison vs production
│   │   └── register_model.py       # MLflow model registration
│   ├── app/
│   │   ├── main.py                 # FastAPI server + Prometheus metrics
│   │   └── schemas.py              # Pydantic request/response models
│   ├── helm/ml-app/                # Kubernetes Helm chart
│   │   ├── templates/
│   │   │   ├── deployment.yaml     # Rolling update deployment
│   │   │   ├── service.yaml        # ClusterIP service
│   │   │   └── hpa.yaml            # Horizontal Pod Autoscaler
│   │   ├── values.yaml             # Default values
│   │   ├── values-staging.yaml     # Staging overrides
│   │   └── values-production.yaml  # Production overrides
│   ├── monitoring/
│   │   └── evidently_report.py     # Drift detection + alerting
│   ├── tests/
│   │   ├── test_train.py           # Unit tests for ML logic
│   │   └── test_api.py             # Integration tests for FastAPI
│   ├── Dockerfile                  # Multi-stage build
│   ├── requirements.txt            # Pinned dependencies
│   └── dvc.yaml                    # DVC pipeline definition
│
└── portfolio-dashboard-app/        # 📊 React Portfolio Dashboard
    └── src/
        ├── App.jsx                 # 4-tab dashboard (Overview/Pipeline/Inference/History)
        └── index.css               # Dark theme + animations
```

---

## 🚀 Quick Start

### 1. Clone and Setup

```bash
git clone https://github.com/YOUR_USERNAME/ml-app-repo
cd ml-app-repo
pip install -r requirements.txt
```

### 2. Train the Model Locally

```bash
python src/train.py
# Generates synthetic fraud data, trains RandomForest, saves to models/
```

### 3. Run the API Server

```bash
cd app
uvicorn main:app --reload --port 8000
# Visit http://localhost:8000/docs for Swagger UI
```

### 4. Run Tests

```bash
pytest tests/ -v --cov=. --cov-report=term-missing
flake8 . --max-line-length=127
```

### 5. Run the Portfolio Dashboard

```bash
cd portfolio-dashboard-app
npm install
npm run dev
# Visit http://localhost:5173
```

---

## ☁️ GCP Deployment (5 Steps)

```bash
# 1. Create GKE cluster
gcloud container clusters create ml-cluster \
  --zone us-central1-a \
  --num-nodes 3 \
  --machine-type e2-standard-2

# 2. Create Service Account
gcloud iam service-accounts create github-actions-sa
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions-sa@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/container.developer"

# 3. Add GitHub Secrets (Settings → Secrets → Actions)
# DOCKERHUB_USERNAME, DOCKERHUB_TOKEN, GCP_PROJECT_ID, GCP_SA_KEY, MLFLOW_TRACKING_URI

# 4. Push to develop → auto-deploys to staging in ~5 minutes
git push origin develop

# 5. Open PR to main → approve → production deploys
```

---

## 🔑 GitHub Secrets Required

| Secret | Description |
|--------|-------------|
| `DOCKERHUB_USERNAME` | Docker Hub login |
| `DOCKERHUB_TOKEN` | Docker Hub access token |
| `GCP_PROJECT_ID` | GCP project ID |
| `GCP_SA_KEY` | GCP Service Account JSON (base64) |
| `MLFLOW_TRACKING_URI` | MLflow server URL |
| `DVC_CREDENTIALS` | GCS credentials for DVC |
| `SLACK_WEBHOOK_URL` | Slack incoming webhook (optional) |

---

## 🌊 Branch Strategy

```
feature/* ──► develop ──► [auto-deploy staging] ──► PR to main ──► [manual approval] ──► production
```

---

## 📊 Portfolio Dashboard

The React dashboard (deployed on Vercel) showcases:

- **Overview**: Live model metrics updating every 3s, accuracy/F1 chart, system health
- **Pipeline**: Animated stage progress, YAML viewer, shared workflow library
- **Inference**: Interactive fraud prediction demo with risk gauge
- **History**: Deployment history table + MLflow model registry

---

## 🛠️ Tech Stack

`GitHub Actions` · `Docker` · `Kubernetes (GKE)` · `Helm` · `FastAPI` · `MLflow` · `DVC` · `Evidently AI` · `Prometheus` · `scikit-learn` · `React` · `Recharts` · `Vercel`

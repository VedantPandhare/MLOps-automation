# ⚡ Standardized MLOps Project

> **A production-ready MLOps framework** featuring standardized CI/CD pipelines, automated model monitoring, and a real-time dashboard.

---

## 🏗️ Project Overview

This project demonstrates a multi-component MLOps architecture using a **Shared Library Pattern** for GitHub Actions.

1.  **[ml-app-repo](file:///d:/MLops/ml-app-repo)**: A Python-based Machine Learning service providing inference APIs, model tracking, and versioning.
2.  **[next-dashboard](file:///d:/MLops/next-dashboard)**: A Next.js dashboard for monitoring pipeline health and interacting with the model.
3.  **[shared-workflows-repo](file:///d:/MLops/shared-workflows-repo)**: Centralized GitHub Actions for standardized CI/CD.

---

## 🚀 Setup Guide

Follow these steps to run the application locally.

### 1. Clone the Repository

```bash
git clone https://github.com/VedantPandhare/MLOps-automation.git
cd MLOps-automation
```

### 2. Backend Setup (`ml-app-repo`)

**Prerequisites:** Python 3.9+

```bash
cd ml-app-repo

# Create and activate virtual environment
python -m venv venv
# Windows: .\venv\Scripts\activate | Unix: source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the API
cd app
uvicorn main:app --reload --port 8000
```
API: [http://localhost:8000](http://localhost:8000)

---

### 3. Frontend Setup (`next-dashboard`)

**Prerequisites:** Node.js 18+

```bash
cd next-dashboard

# Install dependencies
npm install

# Configure local API URL
# Create .env.local with:
# NEXT_PUBLIC_API_URL=http://localhost:8000

# Run the dashboard
npm run dev
```
Dashboard: [http://localhost:3000](http://localhost:3000)

---

## 🛠️ Tech Stack

*   **Backend**: FastAPI, MLflow, DVC, Pytest
*   **Frontend**: Next.js, React, Tailwind CSS, Recharts
*   **Ops**: GitHub Actions, Docker, Kubernetes, Helm

---

## 🌊 Full CI/CD Simulation (Optional)

To simulate the entire automated deployment pipeline, you need to configure infrastructure secrets in your **GitHub Repository Settings**.

### 1. Where to find these values?

| Secret | Origin |
| :--- | :--- |
| **`DOCKERHUB_USERNAME`** | Your personal [Docker Hub](https://hub.docker.com/) username. |
| **`DOCKERHUB_TOKEN`** | [Docker Hub Settings](https://hub.docker.com/settings/security) → Security → New Access Token. |
| **`GCP_PROJECT_ID`** | [GCP Console](https://console.cloud.google.com/) → Top project selector → Project ID column. |
| **`GCP_SA_KEY`** | [GCP IAM Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts) → Select SA → Keys → Add Key (JSON). |

> [!IMPORTANT]
> The `GCP_SA_KEY` must be **Base64 encoded** before adding to GitHub.
> - **Windows (PowerShell)**: `[Convert]::ToBase64String([IO.File]::ReadAllBytes('key.json'))`
> - **Linux/macOS**: `base64 -i key.json`

### 2. Configure GitHub Secrets

1.  Go to your repository on GitHub.
2.  Navigate to **Settings** → **Secrets and variables** → **Actions**.
3.  Click **New repository secret** and add each variable from the table above.

### 3. Trigger the Pipeline

Once configured, any push to the `develop` or `main` branches will trigger the automated build and deployment workflows defined in `.github/workflows`.

---

## 📊 Documentation

- [Detailed Onboarding Guide](file:///d:/MLops/ONBOARDING_GUIDE.md) - How to migrate new repos to this pipeline.
- [Project Architecture](file:///d:/MLops/AUTO_ONBOARDING_ARCH.md) - Deep dive into the automation logic.

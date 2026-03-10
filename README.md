# Standardized MLOps Project

> **A production-ready MLOps framework** featuring standardized CI/CD pipelines, automated model monitoring, and a real-time dashboard.

---

##  Project Overview

This project demonstrates a multi-component MLOps architecture using a **Shared Library Pattern** for GitHub Actions.

1.  **[ml-app-repo](file:///d:/MLops/ml-app-repo)**: A Python-based Machine Learning service providing inference APIs, model tracking, and versioning.
2.  **[next-dashboard](file:///d:/MLops/next-dashboard)**: A Next.js dashboard for monitoring pipeline health and interacting with the model.
3.  **[shared-workflows-repo](file:///d:/MLops/shared-workflows-repo)**: Centralized GitHub Actions for standardized CI/CD.

---

## Setup Guide

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

##  Tech Stack

*   **Backend**: FastAPI, MLflow, DVC, Pytest
*   **Frontend**: Next.js, React, Tailwind CSS, Recharts
*   **Ops**: GitHub Actions, Docker, Kubernetes, Helm

---

##  Full CI/CD Simulation (Optional)

To simulate the entire automated deployment pipeline, you need to configure infrastructure secrets in your **GitHub Repository Settings**.

### 1. Where to find these values?

| Secret | Origin |
| :--- | :--- |
| **`DOCKERHUB_USERNAME`** | Your personal [Docker Hub](https://hub.docker.com/) username. |
| **`DOCKERHUB_TOKEN`** | [Docker Hub Settings](https://hub.docker.com/settings/security) → Security → New Access Token (Required: **Read & Write**). |
| **`GCP_PROJECT_ID`** | [GCP Console](https://console.cloud.google.com/) → Top project selector → Project ID column. |
| **`GCP_SA_KEY`** | [GCP IAM Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts) → Create SA → Grant Roles → Keys → Add Key (JSON). |

### 🛠️ Pre-requisite: Creating a GCP Service Account

If you don't have a Service Account key yet:

1.  **Identity**: Go to the [GCP Service Accounts page](https://console.cloud.google.com/iam-admin/serviceaccounts). Click **Create Service Account**. Give it a name (e.g., `github-actions-mlops`) and click **Create and Continue**.
2.  **Assign Roles**: Add the following roles to the account:
    *   `Kubernetes Engine Developer` (for GKE deployment)
    *   `Storage Object Admin` (for DVC data access)
    *   `Artifact Registry Writer` (optional, for GCP registry)
3.  **Generate Key**: Click on the account's Email → **Keys** tab → **Add Key** → **Create new key** → Select **JSON**.

> [!CAUTION]
> **NEVER upload your `.json` key file to GitHub.** It contains full administrative access to your cloud resources. 
> 1. Use the command below to **Base64 encode** the file.
> 2. Add the resulting string as a **GitHub Secret**.
> 3. Delete the local `.json` file or move it to a secure location outside of this repository.

> [!IMPORTANT]
> **Base64 Encoding Commands**:
> - **Windows (PowerShell)**: `[Convert]::ToBase64String([IO.File]::ReadAllBytes('path/to/key.json'))`
> - **Linux/macOS**: `base64 -i path/to/key.json`

### 2. Configure GitHub Secrets

> [!IMPORTANT]
> **GitHub Secrets vs. Local `.env`**: 
> - **`.env`**: Used for your local machine ONLY.
> - **GitHub Secrets**: Used by the automated pipeline on GitHub's servers. **Do not** paste infrastructure secrets into your local `.env`.

Follow these steps to add your secrets to GitHub:

1.  Navigate to your repository on **GitHub**.
2.  Go to **Settings** → **Secrets and variables** → **Actions**.
3.  Click **New repository secret**.
4.  Add the following secrets:
    *   `DOCKERHUB_USERNAME`: Your Docker Hub username.
    *   `DOCKERHUB_TOKEN`: Your Docker Hub Access Token (with **Read & Write** permissions).
    *   `GCP_PROJECT_ID`: Your Google Cloud Project ID.
    *   `GCP_SA_KEY`: The **Base64 encoded** string of your Service Account JSON key.

### 3. How to Base64 Encode your GCP Key

Base64 encoding converts your complex JSON file into a single line of text that is safe to copy-paste into GitHub.

**Do this in your terminal (do not upload the file!):**

- **Windows (PowerShell)**:
  ```powershell
  $bytes = [IO.File]::ReadAllBytes("path/to/your-key.json")
  [Convert]::ToBase64String($bytes)
  ```
- **Linux/macOS**:
  ```bash
  base64 -i path/to/your-key.json
  ```

**Security Reminder**: Once you have pasted the resulting string into GitHub, delete the local `.json` file or move it to a secure, private location outside of this repository.

### 4. Trigger the Pipeline

Once your secrets are configured, any push to the `develop` or `main` branches will automatically trigger the CI/CD workflows. You can see this in the **Actions** tab of your repository.

---

## Testing the "Import Repo" Feature

The **Onboarding Service** allows you to bring any Python repository into this standardized pipeline automatically.

### How it works:
1.  **Request**: You provide a GitHub Repo URL via the API or Dashboard.
2.  **Injection**: The application uses your `GITHUB_TOKEN` to inject a standardized `.github/workflows/main.yml` into that repository.
3.  **Trigger**: The commit itself triggers the shared workflow library, which will:
    - **Fetch**: Pull the code.
    - **Train**: Run `src/train.py` (if present).
    - **Test**: Run `pytest`.
    - **Deploy**: Build a Docker image and deploy it to your GKE cluster.

### How to test:
Run this command from your terminal (ensure your backend is running):

```bash
curl -X POST http://localhost:8000/onboard \
     -H "Content-Type: application/json" \
     -d '{
           "repo_url": "https://github.com/USER/YOUR_TARGET_REPO",
           "image_name": "your-dockerhub-user/new-app-image"
         }'
```


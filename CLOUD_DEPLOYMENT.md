# ☁️ Cloud Deployment & GKE Implementation Guide

This guide provides a deep dive into how this project leverages **Google Cloud Platform (GCP)** and **Google Kubernetes Engine (GKE)** to achieve a "Production-Grade" MLOps environment.

---

## 1. What is Cloud Deployment?
Cloud deployment is the process of hosting your application on remote servers managed by a provider (like Google, AWS, or Azure). 

**Key Benefits:**
- **Scalability**: Add or remove resources (CPU, RAM) instantly based on traffic.
- **Reliability**: High availability across multiple data centers.
- **Cost-Efficiency**: Pay only for what you use (Pay-as-you-go).
- **Automation**: Use APIs and tools (like Terraform/Helm) to manage infrastructure as code.

---

## 2. GCP: The Foundation
This project uses several core GCP services:

- **Google Kubernetes Engine (GKE)**: The "brain" of our deployment. It manages our Docker containers, ensuring they are running, healthy, and scaled.
- **Google Cloud Storage (GCS)**: Acts as our **Data Lake**. Used by DVC to store versioned datasets and by MLflow for model artifacts.
- **IAM (Identity & Access Management)**: Securely manages permissions via Service Accounts. Our GitHub Actions use a Service Account Key (`GCP_SA_KEY`) to deploy to GKE and access GCS.

---

## 3. Deep Dive: GKE Implementation
GKE is a managed environment for deploying, managing, and scaling containerized applications using Google infrastructure.

### ☸️ Kubernetes Core Concepts in this Project:
- **Containers (Docker)**: Your FastAPI app and ML models are packaged into images. These are stored on DockerHub (or GCP Artifact Registry).
- **Pods**: The smallest deployable units. Each pod runs your `fraud-detection` container.
- **Deployments**: A controller that ensures a specific number of pod replicas are running at all times.
- **Services (ClusterIP)**: Provides a stable internal IP address to access the pods.
- **Namespaces**: Logic isolation for different environments:
  - `ml-staging`: For testing new features.
  - `ml-production`: For the live application.

### 🛠️ Configuration Management with Helm
We use **Helm** to manage our Kubernetes manifests. Instead of writing complex YAML for every resource, we use a single `values.yaml` file to control the deployment.

**Resource Allocation (`values.yaml`):**
```yaml
resources:
  requests:
    cpu: "250m"  # Minimum guaranteed CPU
    memory: "512Mi"
  limits:
    cpu: "1000m" # Maximum allowed CPU
    memory: "1Gi"
```

**Autoscaling:**
The project is configured to scale from **2 to 10 replicas** automatically when CPU usage exceeds **70%**. This ensures the application can handle traffic spikes without manual intervention.

---

## 4. CI/CD Workflow (Automated Deployment)
Deployment is fully automated via GitHub Actions (`deploy-k8s.yml`).

1. **Authentication**: Connects to GCP using `google-github-actions/auth`.
2. **Credential Sync**: Fetches GKE cluster credentials using `get-gke-credentials`.
3. **Helm Upgrade**: Executes `helm upgrade --install`, which:
   - Updates the container image to the latest version.
   - Applies environment-specific configs (`values-staging.yaml` vs `values-production.yaml`).
   - Performs a **Zero-Downtime Rolling Update**.
4. **Verification**: Runs `kubectl rollout status` to ensure the new version is healthy before finishing.

---

## 🚀 The Result
This implementation transforms a simple Python script into a **Resilient, Scalable, and Observable ML Service**. Whether you are deploying a single model or a hundred, this GCP/GKE architecture provides the blueprint for enterprise-grade MLOps.

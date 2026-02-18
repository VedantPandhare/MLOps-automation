# 🔧 Shared Workflows Repository

> **The GitHub Actions equivalent of a Jenkins Shared Library** — centralize all CI/CD automation logic so every ML project uses the same standardized, battle-tested pipeline with a single `uses:` line.

## What This Is

This repository contains **5 reusable GitHub Actions workflows** that any ML project can call. One update here propagates instantly to every pipeline that uses it — no copy-pasting YAML across repos.

```
Jenkins Shared Library  ≡  GitHub Actions Reusable Workflows
Groovy scripts          ≡  YAML workflow files
Jenkins credentials     ≡  GitHub Secrets & Environments
Dedicated Jenkins VM    ≡  GitHub-managed runners (no infra cost)
```

## Workflow Library

| Workflow | File | What It Does | Used By |
|----------|------|-------------|---------|
| 🧪 Run Tests | `run-tests.yml` | flake8 lint + pytest + coverage report | All repos |
| 🐳 Docker Build | `docker-build.yml` | Multi-stage build, SHA tagging, push to registry | All repos |
| 🔒 Security Scan | `security-scan.yml` | Trivy CVE scan, fails on HIGH/CRITICAL | All repos |
| ☸️ Deploy K8s | `deploy-k8s.yml` | Helm upgrade to GKE (staging/production) | ML app repos |
| 📣 Notify Slack | `notify-slack.yml` | Rich Slack notifications with pipeline status | All repos |

## How to Use (Consumer Repo)

In any ML project's `.github/workflows/main.yml`:

```yaml
jobs:
  test:
    uses: YOUR_ORG/shared-workflows-repo/.github/workflows/run-tests.yml@main
    with:
      python-version: "3.10"

  docker-build:
    needs: test
    uses: YOUR_ORG/shared-workflows-repo/.github/workflows/docker-build.yml@main
    with:
      image-name: ${{ vars.DOCKERHUB_USERNAME }}/fraud-detection
    secrets: inherit

  security-scan:
    needs: docker-build
    uses: YOUR_ORG/shared-workflows-repo/.github/workflows/security-scan.yml@main
    with:
      image-ref: ${{ needs.docker-build.outputs.image-tag }}

  deploy-staging:
    needs: security-scan
    uses: YOUR_ORG/shared-workflows-repo/.github/workflows/deploy-k8s.yml@main
    with:
      environment: staging
      helm-release-name: fraud-detection
      image-tag: ${{ needs.docker-build.outputs.image-tag }}
    secrets: inherit
```

## Secrets Required

Configure these in **GitHub → Settings → Secrets and Variables → Actions**:

| Secret | Description |
|--------|-------------|
| `DOCKERHUB_USERNAME` | Docker Hub login |
| `DOCKERHUB_TOKEN` | Docker Hub access token |
| `GCP_PROJECT_ID` | GCP project ID |
| `GCP_SA_KEY` | GCP Service Account JSON (base64) |
| `SLACK_WEBHOOK_URL` | Slack incoming webhook URL |

## Architecture

```
Developer Push
      │
      ▼
GitHub Actions Trigger
      │
      ├─── shared-workflows-repo (this repo)
      │         ├── run-tests.yml        ◄── Called by consumer repos
      │         ├── docker-build.yml     ◄── Called by consumer repos
      │         ├── security-scan.yml    ◄── Called by consumer repos
      │         ├── deploy-k8s.yml       ◄── Called by consumer repos
      │         └── notify-slack.yml     ◄── Called by consumer repos
      │
      └─── ml-app-repo
                └── main.yml  ──uses──► All 5 shared workflows above
```

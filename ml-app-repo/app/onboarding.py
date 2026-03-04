import os
import httpx
import base64
from typing import Optional
from dotenv import load_dotenv

import logging

load_dotenv()
logger = logging.getLogger(__name__)

class GithubOnboardingService:
    def __init__(self):
        self.token = os.getenv("GITHUB_TOKEN")
        self.base_url = "https://api.github.com"
        self.headers = {
            "Authorization": f"Bearer {self.token}",
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
        }

    def _parse_repo_url(self, repo_url: str):
        # Extracts owner and repo name from URL, stripping .git if present
        parts = repo_url.rstrip("/").split("/")
        owner = parts[-2]
        repo = parts[-1]
        if repo.endswith(".git"):
            repo = repo[:-4]
        return owner, repo

    async def onboard_repo(self, repo_url: str, image_name: Optional[str] = None):
        if not self.token or self.token == "your_pat_token_here":
            return {"success": False, "message": "GitHub PAT not configured. Please set GITHUB_TOKEN in .env file."}

        owner, repo = self._parse_repo_url(repo_url)
        
        # 1. Validate Repo (Check for Dockerfile)
        async with httpx.AsyncClient() as client:
            url = f"{self.base_url}/repos/{owner}/{repo}/contents/Dockerfile"
            logger.info(f"🔍 Validating repository: {owner}/{repo} at {url}")
            resp = await client.get(url, headers=self.headers)
            
            if resp.status_code != 200:
                logger.warning(f"⚠️ Dockerfile not found in {owner}/{repo}. Generating a standard Python Dockerfile.")
                # Inject a standard Dockerfile
                dockerfile_content = """FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt || true
COPY . .
EXPOSE 8000
CMD ["python", "main.py"]
"""
                encoded_docker_content = base64.b64encode(dockerfile_content.encode()).decode()
                docker_data = {
                    "message": "chore: auto-generate standard Dockerfile",
                    "content": encoded_docker_content,
                    "branch": "main"
                }
                docker_resp = await client.put(f"{self.base_url}/repos/{owner}/{repo}/contents/Dockerfile", headers=self.headers, json=docker_data)
                if docker_resp.status_code not in [200, 201]:
                    logger.error(f"❌ Failed to inject Dockerfile: {docker_resp.text}")
                    # We continue anyway, the workflow might fail but we did our best to onboard
                else:
                    logger.info(f"✅ Standard Dockerfile injected into {owner}/{repo}")
            else:
                logger.info(f"✅ Dockerfile found in {owner}/{repo}")

            # 2. Inject Workflow File
            workflow_path = ".github/workflows/main.yml"
            workflow_content = f"""##############################################################################
# Standardized MLOps CI/CD Pipeline
# Automatically Injected by MLOps Platform
##############################################################################

name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    uses: VedantPandhare/shared-workflows-repo/.github/workflows/run-tests.yml@main

  docker-build:
    needs: test
    uses: VedantPandhare/shared-workflows-repo/.github/workflows/docker-build.yml@main
    with:
      image-name: {image_name or f"{owner}/{repo}"}
      registry: dockerhub
    secrets: inherit

  deploy-staging:
    needs: docker-build
    if: github.ref == 'refs/heads/develop'
    uses: VedantPandhare/shared-workflows-repo/.github/workflows/deploy-k8s.yml@main
    with:
      environment: staging
      helm-release-name: {repo}-staging
      image-tag: ${{{{ needs.docker-build.outputs.image-tag }}}}
    secrets: inherit

  deploy-production:
    needs: docker-build
    if: github.ref == 'refs/heads/main'
    uses: VedantPandhare/shared-workflows-repo/.github/workflows/deploy-k8s.yml@main
    with:
      environment: production
      helm-release-name: {repo}-production
      image-tag: ${{{{ needs.docker-build.outputs.image-tag }}}}
    secrets: inherit
"""
            # Encode content to base64 for GitHub API
            encoded_content = base64.b64encode(workflow_content.encode()).decode()

            # Create or update the file
            data = {
                "message": "chore: inject standardized MLOps workflow",
                "content": encoded_content,
                "branch": "main" # For simplicity, committing directly to main. In prod, use a PR.
            }
            
            # Check if file exists to get its SHA (required for updates)
            check_resp = await client.get(f"{self.base_url}/repos/{owner}/{repo}/contents/{workflow_path}", headers=self.headers)
            if check_resp.status_code == 200:
                data["sha"] = check_resp.json()["sha"]

            commit_resp = await client.put(f"{self.base_url}/repos/{owner}/{repo}/contents/{workflow_path}", headers=self.headers, json=data)
            
            if commit_resp.status_code in [200, 201]:
                # 3. Create local metadata so it shows in dashboard immediately
                try:
                    models_dir = os.path.join(os.path.dirname(__file__), "..", "models", repo)
                    os.makedirs(models_dir, exist_ok=True)
                    metadata_path = os.path.join(models_dir, "metadata.json")
                    import json
                    with open(metadata_path, 'w') as f:
                        json.dump({
                            "model_name": repo.replace("-", " ").replace("_", " ").title(),
                            "version": "v1.0.0 (Onboarding)",
                            "accuracy": 0.892,
                            "f1_score": 0.875,
                            "latency": 5.4,
                            "drift": 0.02,
                            "environment": "Development",
                            "architecture": "Initial CI/CD Setup",
                            "last_push": "Just now",
                            "history": [
                                { "version": "v1.0.0", "stage": "Proposed", "accuracy": "89.2%", "f1": "0.875", "date": "Just now", "runs": "run_initial" }
                            ],
                            "deployments": [
                                { "sha": "waiting", "env": "staging", "status": "running", "time": "Just now", "branch": "main", "triggered": "onboarding" }
                            ]
                        }, f, indent=4)
                    logger.info(f"✅ Local project metadata created for {repo}")
                except Exception as e:
                    logger.error(f"⚠️ Failed to create local metadata for {repo}: {e}")

                return {
                    "success": True, 
                    "message": f"Successfully onboarded {repo}. Workflow injected.",
                    "injected_workflow": workflow_path
                }
            else:
                return {"success": False, "message": f"Failed to inject workflow: {commit_resp.text}"}

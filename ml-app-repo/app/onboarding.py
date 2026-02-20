import os
import httpx
import base64
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

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
        # Extracts owner and repo name from URL
        parts = repo_url.rstrip("/").split("/")
        return parts[-2], parts[-1]

    async def onboard_repo(self, repo_url: str, image_name: Optional[str] = None):
        if not self.token or self.token == "your_pat_token_here":
            return {"success": False, "message": "GitHub PAT not configured. Please set GITHUB_TOKEN in .env file."}

        owner, repo = self._parse_repo_url(repo_url)
        
        # 1. Validate Repo (Check for Dockerfile)
        async with httpx.AsyncClient() as client:
            resp = await client.get(f"{self.base_url}/repos/{owner}/{repo}/contents/Dockerfile", headers=self.headers)
            if resp.status_code != 200:
                return {"success": False, "message": "Dockerfile not found in repository root. Validation failed."}

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
    uses: VedantPandhare/MLOps-automation/shared-workflows-repo/.github/workflows/run-tests.yml@main

  docker-build:
    needs: test
    uses: VedantPandhare/MLOps-automation/shared-workflows-repo/.github/workflows/docker-build.yml@main
    with:
      image-name: {image_name or f"{owner}/{repo}"}
      registry: dockerhub
    secrets: inherit

  deploy-staging:
    needs: docker-build
    if: github.ref == 'refs/heads/develop'
    uses: VedantPandhare/MLOps-automation/shared-workflows-repo/.github/workflows/deploy-k8s.yml@main
    with:
      environment: staging
      helm-release-name: {repo}-staging
      image-tag: ${{{{ needs.docker-build.outputs.image-tag }}}}
    secrets: inherit

  deploy-production:
    needs: docker-build
    if: github.ref == 'refs/heads/main'
    uses: VedantPandhare/MLOps-automation/shared-workflows-repo/.github/workflows/deploy-k8s.yml@main
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
                return {
                    "success": True, 
                    "message": f"Successfully onboarded {owner}/{repo}. Workflow injected.",
                    "injected_workflow": workflow_path
                }
            else:
                return {"success": False, "message": f"Failed to inject workflow: {commit_resp.text}"}

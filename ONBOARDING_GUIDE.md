# 🚀 Onboarding a New Repository to the MLOps Pipeline

Follow these steps to migrate any ML repository from GitHub to your standardized MLOps ecosystem.

## 1. Prepare Your Project Structure
Your project should follow these conventions for the shared workflows to work "out of the box":

*   **`Dockerfile`**: Root-level file for building the image.
*   **`requirements.txt`**: List of dependencies for testing.
*   **`tests/`**: Directory containing `pytest` compatible tests.
*   **`helm/<app-name>/`**: Helm charts for deployment.

## 2. Set Up GitHub Secrets
In your new repository, go to **Settings > Secrets and Variables > Actions** and add:

| Secret | Description |
| :--- | :--- |
| `DOCKERHUB_USERNAME` | Your Docker Hub username. |
| `DOCKERHUB_TOKEN` | Your Docker Hub personal access token. |
| `GCP_PROJECT_ID` | Your Google Cloud project ID. |
| `GCP_SA_KEY` | Base64 encoded Service Account JSON. |
| `MLFLOW_TRACKING_URI` | Address of your MLflow server. |
| `DVC_CREDENTIALS` | Service account JSON with GCS access for DVC. |

## 3. Create the Workflow File
Create a file at `.github/workflows/main.yml` in your new repository. Copy the structure from the Fraud Detection example but replace the placeholders:

```yaml
jobs:
  test:
    uses: VedantPandhare/shared-workflows-repo/.github/workflows/run-tests.yml@main

  docker-build:
    needs: test
    uses: VedantPandhare/shared-workflows-repo/.github/workflows/docker-build.yml@main
    with:
      image-name: <your-dockerhub-username>/<your-repo-name>
      registry: dockerhub

  deploy-production:
    needs: docker-build
    uses: VedantPandhare/shared-workflows-repo/.github/workflows/deploy-k8s.yml@main
    with:
      environment: production
      helm-release-name: <your-release-name>
      image-tag: ${{ needs.docker-build.outputs.image-tag }}
    secrets: inherit
```

## 4. Deploy Infrastructure
*   **GKE Cluster**: Ensure your cluster matches the name and zone defined in your workflow (or update the workflow `with:` parameters).
*   **MLflow**: Ensure your model name is correctly registered in `src/train.py`.

## 5. First Push
Push your changes to the `main` or `develop` branch. Watch the magic happen in the **Actions** tab!

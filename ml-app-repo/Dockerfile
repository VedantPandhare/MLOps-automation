# ─── Stage 1: Builder ─────────────────────────────────────────────────────────
FROM python:3.10-slim AS builder

WORKDIR /build

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install --no-cache-dir --user -r requirements.txt

# ─── Stage 2: Production Image ────────────────────────────────────────────────
FROM python:3.10-slim AS production

# Build arguments for traceability
ARG BUILD_DATE
ARG GIT_SHA
ARG APP_VERSION=1.0.0

# Labels for image metadata
LABEL org.opencontainers.image.created="${BUILD_DATE}" \
      org.opencontainers.image.revision="${GIT_SHA}" \
      org.opencontainers.image.version="${APP_VERSION}" \
      org.opencontainers.image.title="Fraud Detection API" \
      org.opencontainers.image.description="MLOps CI/CD Pipeline - Fraud Detection Model"

# Create non-root user for security
RUN groupadd -r mlapp && useradd -r -g mlapp mlapp

WORKDIR /app

# Copy installed packages from builder
COPY --from=builder /root/.local /home/mlapp/.local

# Copy application code
COPY app/ ./app/
COPY src/ ./src/
COPY models/ ./models/

# Set environment variables
ENV PATH=/home/mlapp/.local/bin:$PATH \
    PYTHONPATH=/app \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    APP_VERSION=${APP_VERSION} \
    GIT_SHA=${GIT_SHA}

# Switch to non-root user
RUN chown -R mlapp:mlapp /app
USER mlapp

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

# Run the FastAPI server
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]

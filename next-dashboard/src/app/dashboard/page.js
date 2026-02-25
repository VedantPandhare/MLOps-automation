"use client";

import { useState, useEffect, useCallback } from 'react';
import {
  BarChart3,
  Settings2,
  Search,
  History,
  Activity,
  Plus,
  Zap,
  ShieldCheck,
  TrendingUp,
  Cpu,
  RefreshCw,
  Globe,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// --- Components ---

const GrainOverlay = () => {
  return (
    <div style={{
      position: "fixed", inset: 0, width: "100%", height: "100%",
      pointerEvents: "none", zIndex: 1, opacity: 0.25,
      background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
    }} />
  );
};

function OnboardingModal({ isOpen, onClose }) {
  const [repoUrl, setRepoUrl] = useState('');
  const [imageName, setImageName] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleOnboard = async () => {
    if (!repoUrl) return;
    setLoading(true);
    setStatus({ type: 'info', message: 'Initiating Conduit onboarding sequence...' });

    try {
      const response = await fetch(`${API_BASE_URL}/onboard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repo_url: repoUrl, image_name: imageName || undefined }),
      });
      const data = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', message: `🚀 ${data.message}` });
        if (data.pr_url) setTimeout(() => window.open(data.pr_url, '_blank'), 2000);
      } else {
        setStatus({ type: 'error', message: data.detail || 'Onboarding failed.' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Connection error. Is the backend running?' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="card modal-card animate-fade-in" style={{ maxWidth: '500px', width: '90%', position: 'relative' }}>
        <button className="close-btn" onClick={onClose}><X size={20} /></button>
        <div className="section-header">
          <h3 className="section-title">Import New Product/Repo</h3>
        </div>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Connect your GitHub repository to automatically inject standardized Conduit workflows.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>GITHUB REPOSITORY URL</label>
            <input
              placeholder="https://github.com/user/repo"
              className="input-field"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>DOCKER IMAGE NAME (OPTIONAL)</label>
            <input
              placeholder="my-fraud-model"
              className="input-field"
              value={imageName}
              onChange={(e) => setImageName(e.target.value)}
            />
          </div>
        </div>

        {status && (
          <div style={{
            marginTop: '1.5rem',
            padding: '0.75rem',
            borderRadius: '6px',
            fontSize: '0.875rem',
            background: status.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)',
            color: status.type === 'error' ? 'var(--accent-red)' : 'var(--accent-blue)',
            border: `1px solid ${status.type === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.2)'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            {status.type === 'info' && <Loader2 size={16} className="animate-spin" />}
            {status.type === 'success' && <CheckCircle2 size={16} />}
            {status.type === 'error' && <AlertCircle size={16} />}
            {status.message}
          </div>
        )}

        <button
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '1.5rem', padding: '0.75rem' }}
          onClick={handleOnboard}
          disabled={loading || !repoUrl}
        >
          {loading ? 'Processing...' : 'Run Auto-Onboarding'}
        </button>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
        }
        .close-btn {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
        }
        .input-field {
          width: 100%;
          background: var(--bg-card);
          border: 1px solid var(--border);
          padding: 0.75rem;
          border-radius: 6px;
          color: var(--text-primary);
          outline: none;
        }
        .input-field:focus {
          border-color: var(--accent-blue);
        }
      `}</style>
    </div>
  );
}

function InfrastructureItem({ icon, name, status }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ color: 'var(--text-secondary)' }}>{icon}</div>
        <span style={{ fontSize: '0.875rem' }}>{name}</span>
      </div>
      <span className={`badge ${status === 'Operational' ? 'badge-green' : 'badge-red'}`}>{status}</span>
    </div>
  );
}

function PipelineView() {
  const [activeStep, setActiveStep] = useState(3);
  const stages = [
    { name: 'Run Tests', status: 'completed', time: '1m 42s' },
    { name: 'Docker Build', status: 'completed', time: '3m 11s' },
    { name: 'Security Scan', status: 'completed', time: '0m 58s' },
    { name: 'Deploy Staging', status: 'in-progress', time: '2m 05s' },
    { name: 'Deploy Prod', status: 'pending', time: '-' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="card animate-fade-in" style={{ padding: '2rem' }}>
        <div className="section-header" style={{ marginBottom: '2.5rem' }}>
          <div>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', fontWeight: 600 }}>Current Pipeline Run</h3>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Triggered by push · branch: <span style={{ color: 'var(--accent-green)' }}>main</span> · 8m 31s elapsed
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-orange)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', fontFamily: "'DM Mono', monospace" }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'currentColor', boxShadow: '0 0 8px currentColor' }} />
            In Progress
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative', padding: '0 1rem' }}>
          {/* Connector Line */}
          <div style={{ position: 'absolute', top: '20px', left: '10%', right: '10%', height: '2px', background: 'rgba(255,255,255,0.05)', zIndex: 0 }} />

          {stages.map((s, i) => {
            const isActive = s.status === 'in-progress';
            const isCompleted = s.status === 'completed';
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', position: 'relative', zIndex: 1, flex: 1 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: isCompleted ? 'rgba(34, 197, 94, 0.1)' : isActive ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${isCompleted ? 'var(--accent-green)' : isActive ? 'var(--accent-blue)' : 'rgba(255,255,255,0.1)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: isActive ? '0 0 20px rgba(59, 130, 246, 0.2)' : 'none'
                }}>
                  {isCompleted ? <CheckCircle2 size={18} color="var(--accent-green)" /> : isActive ? <Loader2 size={18} className="animate-spin" color="var(--accent-blue)" /> : <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />}
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 600, color: isCompleted || isActive ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)', fontFamily: "'DM Mono', monospace" }}>{s.name}</p>
                  <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.25)', marginTop: '0.2rem', fontFamily: "'DM Mono', monospace" }}>{s.time}</p>
                </div>
                {/* Progress highlight for connector */}
                {i < stages.length - 1 && i < activeStep && (
                  <div style={{ position: 'absolute', top: '20px', left: '50%', width: '100%', height: '2px', background: 'linear-gradient(to right, var(--accent-green), rgba(34, 197, 94, 0.2))', zIndex: -1 }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="card animate-fade-in" style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.2)' }}>
        <div className="section-header" style={{ marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontFamily: "'DM Mono', monospace" }}>Active Workflow · <span style={{ color: 'var(--accent-green)' }}>.github/workflows/main.yml</span></h3>
        </div>
        <pre style={{
          margin: 0, padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '6px',
          fontFamily: "'DM Mono', monospace", fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)',
          lineHeight: 1.6, border: '1px solid var(--border)', overflowX: 'auto'
        }}>
          {`1  name: MLOps CI/CD Pipeline
2  on:
3  push:
4  branches: [ main, develop ]
5  jobs:
6  test:
7  uses: org/shared/.github/workflows/run-tests.yml@main
8  build:
9  needs: test
10 uses: org/shared/.github/workflows/docker-build.yml@main
11 deploy-prod:
12 needs: build
13 environment: production # Requires approval`}
        </pre>
      </div>
    </div>
  );
}

function HistoryView() {
  const logs = [
    { commit: 'a3f7c91', branch: 'main', env: 'prod', actor: 'push', status: 'success', time: '2m ago' },
    { commit: '88be204', branch: 'develop', env: 'staging', actor: 'push', status: 'success', time: '47m ago' },
    { commit: 'f12d330', branch: 'feature/retrain', env: 'staging', actor: 'PR', status: 'failed', time: '3h ago' },
    { commit: 'c90a17e', branch: 'main', env: 'prod', actor: 'push', status: 'success', time: '1d ago' },
    { commit: '74bb819', branch: 'main', env: 'prod', actor: 'schedule', status: 'success', time: '3d ago' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="card animate-fade-in" style={{ padding: '0' }}>
        <div className="section-header" style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', marginBottom: '0' }}>
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', fontWeight: 600 }}>Deployment History</h3>
          <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.7rem', fontFamily: "'DM Mono', monospace" }}>5 RECENT DEPLOYS</span>
        </div>
        <div className="table-container">
          <table style={{ background: 'transparent' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.01)' }}>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.65rem', letterSpacing: '0.1em', fontFamily: "'DM Mono', monospace" }}>COMMIT</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.65rem', letterSpacing: '0.1em', fontFamily: "'DM Mono', monospace" }}>BRANCH</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.65rem', letterSpacing: '0.1em', fontFamily: "'DM Mono', monospace" }}>ENVIRONMENT</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.65rem', letterSpacing: '0.1em', fontFamily: "'DM Mono', monospace" }}>TRIGGERED BY</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.65rem', letterSpacing: '0.1em', fontFamily: "'DM Mono', monospace" }}>STATUS</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.65rem', letterSpacing: '0.1em', fontFamily: "'DM Mono', monospace" }}>TIME</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, i) => (
                <tr key={i} style={{ transition: 'background 0.2s', cursor: 'default' }}>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span style={{ color: 'var(--accent-blue)', fontFamily: "'DM Mono', monospace", padding: '0.2rem 0.5rem', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '4px' }}>{log.commit}</span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Globe size={14} style={{ opacity: 0.3 }} /> {log.branch}
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span style={{
                      padding: '0.2rem 0.6rem', background: log.env === 'prod' ? 'rgba(34, 197, 94, 0.05)' : 'rgba(59, 130, 246, 0.05)',
                      borderRadius: '99px', fontSize: '0.7rem', color: log.env === 'prod' ? 'var(--accent-green)' : 'var(--accent-blue)', border: '1px solid currentColor', opacity: 0.8
                    }}>{log.env}</span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', fontFamily: "'DM Mono', monospace" }}>{log.actor}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: log.status === 'success' ? 'var(--accent-green)' : 'var(--accent-red)', fontSize: '0.75rem', fontWeight: 600 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
                      {log.status}
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', color: 'rgba(255,255,255,0.25)', fontSize: '0.85rem' }}>{log.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card animate-fade-in">
        <div className="section-header" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.25rem', fontWeight: 600 }}>MLflow Model Registry</h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)', borderRadius: '8px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              <h4 style={{ fontSize: '1.1rem', color: 'var(--accent-green)', fontFamily: "'DM Mono', monospace", fontWeight: 700 }}>v2.4.1</h4>
              <span style={{ padding: '0.1rem 0.5rem', background: 'rgba(34, 197, 94, 0.1)', color: 'var(--accent-green)', fontSize: '0.65rem', borderRadius: '4px', textTransform: 'uppercase' }}>Production</span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.75rem' }}>Registered on Feb 23, 10:45 AM</p>
          </div>
          <div style={{ display: 'flex', gap: '2.5rem' }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>Accuracy</p>
              <p style={{ fontSize: '1.1rem', fontWeight: 700 }}>93.2%</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>F1 Score</p>
              <p style={{ fontSize: '1.1rem', fontWeight: 700 }}>0.911</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>Run ID</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--accent-blue)', fontFamily: "'DM Mono', monospace" }}>run_88c2f</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InferenceDemo() {
  const [formData, setFormData] = useState({
    amount: 250.00,
    hour_of_day: 14,
    day_of_week: 2,
    merchant_category: 5,
    distance_from_home: 12.5,
    num_transactions_24h: 3,
    avg_transaction_amount: 180.00,
    is_international: 0,
    card_age_days: 730,
    failed_attempts_24h: 0,
  });
  const [loading, setLoading] = useState(false);
  const [isWakingUp, setIsWakingUp] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseFloat(value) }));
  };

  const runPrediction = async () => {
    setLoading(true);
    setError(null);
    setIsWakingUp(false);

    // Waking up usually takes ~10-45s for Render cold start. Let's show the user a message after 2.5s
    const slowTimer = setTimeout(() => setIsWakingUp(true), 2500);

    try {
      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      clearTimeout(slowTimer);
      setIsWakingUp(false);

      if (!response.ok) throw new Error('Prediction request failed');
      const data = await response.json();
      setResult(data);
    } catch (err) {
      clearTimeout(slowTimer);
      setIsWakingUp(false);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const riskColors = { MINIMAL: '#22c55e', LOW: '#3b82f6', MEDIUM: '#f59e0b', HIGH: '#ef4444', CRITICAL: '#7f1d1d' };

  return (
    <div className="grid animate-fade-in" style={{ gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
      <div className="card" style={{ padding: '2.5rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)' }}>
        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.8rem', fontWeight: 600, marginBottom: '2rem' }}>Transaction Simulation</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', marginBottom: '2rem' }}>
          {Object.entries(formData).map(([key, val]) => (
            <div key={key}>
              <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>{key.replace(/_/g, ' ')}</label>
              <input
                name={key}
                type="number"
                value={val}
                onChange={handleInputChange}
                style={{
                  width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)',
                  padding: '0.7rem', borderRadius: '4px', color: 'var(--text-primary)',
                  fontSize: '0.85rem', fontFamily: "'DM Mono', monospace", outline: 'none'
                }}
              />
            </div>
          ))}
        </div>
        <button className="btn btn-primary" onClick={runPrediction} disabled={loading} style={{
          width: '100%', justifyContent: 'center', padding: '1.2rem',
          fontFamily: "'DM Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.1em',
          background: 'rgba(255,255,255,0.9)', color: '#0e0e0e'
        }}>
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              {isWakingUp && <span style={{ fontSize: '0.65rem', opacity: 0.8, textTransform: 'none', letterSpacing: '0' }}>Waking up the backend servers... This might take up to a minute.</span>}
            </>
          ) : 'Process Transaction'}
        </button>
      </div>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'rgba(255,255,255,0.02)' }}>
        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', fontWeight: 600, marginBottom: '2rem', textAlign: 'center' }}>Analysis Result</h3>
        {error ? (
          <div style={{ textAlign: 'center', color: 'var(--accent-red)' }}>
            <AlertCircle size={40} style={{ margin: '0 auto 1rem' }} />
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.8rem' }}>{error}</p>
          </div>
        ) : result ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '140px', height: '140px', border: `1px solid ${riskColors[result.risk_level] || 'var(--border)'}`,
              borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem',
              boxShadow: `0 0 40px -10px ${riskColors[result.risk_level] || 'transparent'}`,
              background: 'rgba(255,255,255,0.01)'
            }}>
              <span style={{ fontSize: '2rem', fontWeight: 700, fontFamily: "'Cormorant Garamond', serif" }}>{(result.fraud_probability * 100).toFixed(1)}%</span>
              <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: "'DM Mono', monospace" }}>Risk Index</span>
            </div>
            <h4 style={{ color: riskColors[result.risk_level], fontSize: '1.8rem', fontWeight: 600, marginBottom: '1rem', fontFamily: "'Cormorant Garamond', serif" }}>{result.is_fraud ? 'ALERT: FRAUD DETECTED' : 'VERIFIED: SYSTEM SAFE'}</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', fontFamily: "'DM Mono', monospace" }}>
              <p>RISK LEVEL: <strong style={{ color: 'var(--text-primary)' }}>{result.risk_level}</strong></p>
              <p>LATENCY: <strong style={{ color: 'var(--text-primary)' }}>{result.latency_ms.toFixed(2)}ms</strong></p>
              <p>MODEL: <strong style={{ color: 'var(--text-primary)' }}>{result.model_version}</strong></p>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', opacity: 0.3 }}>
            <Zap size={60} style={{ margin: '0 auto 1.5rem', strokeWidth: 1 }} />
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Ready for Processing</p>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Main Dashboard ---

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stats, setStats] = useState({ accuracy: 0, f1: 0, latency: 0, drift: 0 });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('action') === 'import') {
        setIsModalOpen(true);
        window.history.replaceState({}, '', '/dashboard');
      }
    }
  }, []);
  const [modelInfo, setModelInfo] = useState({ version: '...', environment: '...' });
  const [healthStatus, setHealthStatus] = useState('Offline');
  const [chartData, setChartData] = useState([]);

  const fetchDashboardData = useCallback(async () => {
    try {
      // Fetch Health
      const healthRes = await fetch(`${API_BASE_URL}/health`);
      if (healthRes.ok) setHealthStatus('Operational');
      else setHealthStatus('Warning');

      // Fetch Model Info
      const infoRes = await fetch(`${API_BASE_URL}/model/info`);
      if (infoRes.ok) {
        const data = await infoRes.json();
        setModelInfo({ version: data.version, environment: data.environment });
        setStats(prev => ({ ...prev, accuracy: data.accuracy * 100, f1: data.f1_score * 100 }));
      }
    } catch (err) {
      setHealthStatus('Offline');
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        latency: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
        drift: parseFloat(Math.max(0.01, Math.min(0.14, (prev.drift || 0.05) + (Math.random() - 0.5) * 0.005)).toFixed(3)),
      }));
    }, 3000);

    // Initial Chart Data
    const data = [];
    for (let i = 15; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      data.push({
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        accuracy: 94 + Math.random() * 2,
        f1: 90 + Math.random() * 2,
      });
    }
    setChartData(data);

    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const tabs = [
    { id: 'overview', label: 'Monitor', icon: <BarChart3 size={18} /> },
    { id: 'pipeline', label: 'Workflows', icon: <Settings2 size={18} /> },
    { id: 'inference', label: 'Simulation', icon: <Search size={18} /> },
    { id: 'history', label: 'Audit', icon: <History size={18} /> },
  ];

  return (
    <div className="dashboard-container" style={{ position: 'relative', overflow: 'hidden', background: '#0e0e0e' }}>
      {/* Background Grid */}
      <div
        style={{
          position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%)",
        }}
      />
      <GrainOverlay />

      <header className="header" style={{ borderBottom: '1px solid var(--border)', background: 'rgba(14, 14, 14, 0.8)', backdropFilter: 'blur(20px)', position: 'relative', zIndex: 50 }}>
        <div className="header-inner">
          <div className="logo-area" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="logo-icon" style={{
              width: '32px', height: '32px', border: '1px solid rgba(59, 130, 246, 0.5)',
              background: 'rgba(59, 130, 246, 0.05)', borderRadius: '4px',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Zap size={18} color="#3b82f6" fill="#3b82f6" style={{ opacity: 0.8 }} />
            </div>
            <div className="logo-text">
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', fontWeight: 600, letterSpacing: '0.02em' }}>Conduit</h1>
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5 }}>MLOps Control Tower</p>
            </div>
          </div>

          <nav className="nav-tabs" style={{ gap: '0.25rem' }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  padding: '0.5rem 1rem',
                  color: activeTab === tab.id ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)',
                  background: activeTab === tab.id ? 'rgba(255,255,255,0.05)' : 'transparent',
                  border: 'none',
                  borderRadius: '4px',
                  transition: 'all 0.3s ease'
                }}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <button className="btn btn-outline" style={{
              border: '1px solid var(--border)',
              fontFamily: "'DM Mono', monospace",
              fontSize: '0.7rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              padding: '0.4rem 0.8rem'
            }} onClick={() => setIsModalOpen(true)}>
              <Plus size={14} />
              New Repo
            </button>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.625rem',
              fontSize: '0.7rem', fontFamily: "'DM Mono', monospace",
              color: healthStatus === 'Operational' ? 'var(--accent-green)' : 'var(--accent-red)',
              textTransform: 'uppercase'
            }}>
              <div style={{
                width: 6, height: 6, borderRadius: '50%', background: 'currentColor',
                boxShadow: healthStatus === 'Operational' ? '0 0 10px currentColor' : 'none'
              }} />
              {healthStatus}
            </div>
          </div>
        </div>
      </header>

      <main className="main-content">
        {activeTab === 'overview' && (
          <div className="grid animate-fade-in">
            <div className="grid stats-grid">
              <div className="card stat-card" style={{
                borderTop: '2px solid var(--accent-blue)',
                background: 'rgba(255,255,255,0.01)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                <p className="stat-label" style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Model Accuracy</p>
                <h2 className="stat-value" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2.8rem', fontWeight: 300 }}>{stats.accuracy.toFixed(1)}%</h2>
                <p className="stat-footer text-up" style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.6rem', letterSpacing: '0.05em' }}><TrendingUp size={12} /> Live Production</p>
              </div>
              <div className="card stat-card" style={{
                borderTop: '2px solid var(--accent-green)',
                background: 'rgba(255,255,255,0.01)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                <p className="stat-label" style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>F1-Score</p>
                <h2 className="stat-value" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2.8rem', fontWeight: 300 }}>{stats.f1.toFixed(1)}%</h2>
                <p className="stat-footer" style={{ color: 'var(--text-secondary)', fontFamily: "'DM Mono', monospace", fontSize: '0.6rem', letterSpacing: '0.05em' }}>Baseline 90.0%</p>
              </div>
              <div className="card stat-card" style={{
                background: 'rgba(255,255,255,0.01)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                <p className="stat-label" style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Inference Latency</p>
                <h2 className="stat-value" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2.8rem', fontWeight: 300 }}>{stats.latency}ms</h2>
                <p className="stat-footer text-down" style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.6rem', letterSpacing: '0.05em' }}><Activity size={12} /> Optimization Active</p>
              </div>
              <div className="card stat-card" style={{
                background: 'rgba(255,255,255,0.01)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                <p className="stat-label" style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Data Drift (PSI)</p>
                <h2 className="stat-value" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2.8rem', fontWeight: 300 }}>{stats.drift}</h2>
                <p className="stat-footer" style={{ color: 'var(--text-secondary)', fontFamily: "'DM Mono', monospace", fontSize: '0.6rem', letterSpacing: '0.05em' }}><ShieldCheck size={12} /> Below Threshold</p>
              </div>
            </div>

            <div className="grid" style={{ gridTemplateColumns: '2.5fr 1fr' }}>
              <div className="card chart-card" style={{ background: 'rgba(0,0,0,0.2)' }}>
                <div className="section-header">
                  <h3 className="section-title" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem' }}>Performance Retention</h3>
                  <div className="badge badge-blue" style={{ fontFamily: "'DM Mono', monospace" }}>Last 15 Cycles</div>
                </div>
                <div style={{ height: '320px', width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="accGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--accent-blue)" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="var(--accent-blue)" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="f1Grad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--accent-green)" stopOpacity={0.1} />
                          <stop offset="95%" stopColor="var(--accent-green)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                      <XAxis dataKey="date" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis domain={[85, 100]} tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px', fontSize: '0.8rem' }}
                        itemStyle={{ color: '#fafafa' }}
                      />
                      <Area type="monotone" dataKey="accuracy" name="Accuracy" stroke="var(--accent-blue)" fill="url(#accGrad)" strokeWidth={2.5} dot={false} />
                      <Area type="monotone" dataKey="f1" name="F1 Score" stroke="var(--accent-green)" fill="url(#f1Grad)" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="card">
                  <div className="section-header">
                    <h3 className="section-title">Engine Health</h3>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <InfrastructureItem icon={<Globe size={16} />} name="Edge Proxies" status="Operational" />
                    <InfrastructureItem icon={<Cpu size={16} />} name="Compute Nodes" status="Operational" />
                    <InfrastructureItem icon={<Settings2 size={16} />} name="MLflow Engine" status={healthStatus} />
                    <InfrastructureItem icon={<RefreshCw size={16} />} name="DVC Sync" status="Operational" />
                  </div>
                </div>

                <div className="card" style={{ flex: 1 }}>
                  <h3 className="section-title" style={{ marginBottom: '1rem' }}>Model Details</h3>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <span>Version</span>
                      <span style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>{modelInfo.version}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <span>Environment</span>
                      <span style={{ color: 'var(--text-primary)' }}>{modelInfo.environment}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <span>Framework</span>
                      <span style={{ color: 'var(--text-primary)' }}>Scikit-Learn</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Last Retrain</span>
                      <span style={{ color: 'var(--text-primary)' }}>12h ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'inference' && <InferenceDemo />}
        {activeTab === 'pipeline' && <PipelineView />}
        {activeTab === 'history' && <HistoryView />}
      </main>

      <OnboardingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}

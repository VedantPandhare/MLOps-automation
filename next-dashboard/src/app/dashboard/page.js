"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  BarChart3,
  Settings2,
  Search,
  History,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Zap,
  History as HistoryIcon,
  Globe,
  RefreshCw,
  Cpu,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// --- Components ---

const GrainOverlay = () => {
  const canvasRef = useRef(null);
  const animRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = 150;
    const H = 150;
    canvas.width = W;
    canvas.height = H;

    const render = () => {
      const imageData = ctx.createImageData(W, H);
      for (let i = 0; i < imageData.data.length; i += 4) {
        const v = Math.random() * 255;
        imageData.data[i] = v;
        imageData.data[i + 1] = v;
        imageData.data[i + 2] = v;
        imageData.data[i + 3] = 15;
      }
      ctx.putImageData(imageData, 0, 0);
      animRef.current = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 1,
        opacity: 0.35,
        mixBlendMode: "overlay",
      }}
    />
  );
};

function OnboardingModal({ isOpen, onClose }) {
  if (!isOpen) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)'
    }}>
      <div className="card animate-fade-in" style={{ maxWidth: '500px', width: '90%', padding: '3rem', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}>✕</button>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2rem', fontWeight: 600, marginBottom: '1.5rem', textAlign: 'center' }}>Welcome to Conduit</h2>
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '2.5rem', lineHeight: 1.6 }}>Choose an environment to begin your MLOps workflow simulation.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button className="btn btn-primary" style={{ width: '100%', padding: '1.2rem' }} onClick={onClose}>Explore Demo Model</button>
          <button className="btn btn-secondary" style={{ width: '100%', padding: '1.2rem' }} onClick={onClose}>Import GitHub Repository</button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, unit, trend, icon }) {
  return (
    <div className="card stat-card">
      <div className="stat-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ color: 'var(--text-secondary)' }}>{icon}</div>
          <span className="stat-label">{label}</span>
        </div>
        {trend && (
          <span style={{ fontSize: '0.75rem', color: trend.startsWith('+') ? 'var(--accent-green)' : 'var(--accent-blue)', fontWeight: 600 }}>
            {trend}
          </span>
        )}
      </div>
      <div className="stat-value">
        {value}
        <span className="stat-unit">{unit}</span>
      </div>
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
  const [activeStep, setActiveStep] = useState(4);
  const stages = [
    { id: "test", label: "Run Tests", icon: <CheckCircle2 size={18} />, duration: "1m 42s", status: 'success' },
    { id: "build", label: "Docker Build", icon: <CheckCircle2 size={18} />, duration: "3m 11s", status: 'success' },
    { id: "scan", label: "Security Scan", icon: <CheckCircle2 size={18} />, duration: "0m 58s", status: 'success' },
    { id: "staging", label: "Deploy Staging", icon: <CheckCircle2 size={18} />, duration: "2m 05s", status: 'success' },
    { id: "prod", label: "Deploy Prod", icon: <Loader2 size={18} className="animate-spin" />, duration: "2m 33s", status: 'running' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="card animate-fade-in" style={{ padding: '2.5rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)', position: 'relative' }}>
        <div className="section-header" style={{ marginBottom: '3rem' }}>
          <div>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.8rem', fontWeight: 600 }}>Main CI/CD Pipeline</h3>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.4rem' }}>
              SOURCE: <span style={{ color: 'var(--accent-blue)' }}>main</span> / commit <span style={{ color: 'rgba(255,255,255,0.6)' }}>a3f7c91</span>
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--accent-orange)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.1em', fontFamily: "'DM Mono', monospace", textTransform: 'uppercase' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'currentColor', boxShadow: '0 0 10px currentColor' }} />
            Pipeline Running
          </div>
        </div>

        <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ position: 'absolute', top: '24px', left: '40px', right: '40px', height: '1px', background: 'rgba(255,255,255,0.08)', zIndex: 0 }} />

          {stages.map((stage, i) => {
            const isCompleted = stage.status === 'success';
            const isInProgress = stage.status === 'running';

            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.2rem', zIndex: 1, flex: 1 }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '50%',
                  background: isCompleted ? 'rgba(34, 197, 94, 0.05)' : isInProgress ? 'rgba(59, 130, 246, 0.05)' : 'rgba(14,14,14,0.8)',
                  border: `2px solid ${isCompleted ? 'var(--accent-green)' : isInProgress ? 'var(--accent-blue)' : 'rgba(255,255,255,0.1)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.4s ease',
                  boxShadow: isInProgress ? '0 0 20px rgba(59, 130, 246, 0.2)' : 'none'
                }}>
                  {isCompleted ? <span style={{ color: 'var(--accent-green)' }}>✓</span> : isInProgress ? <span style={{ color: 'var(--accent-blue)' }} className="animate-spin">◌</span> : <span>○</span>}
                </div>

                <div style={{ textAlign: 'center' }}>
                  <p style={{
                    fontFamily: "'DM Mono', monospace", fontSize: '0.75rem', fontWeight: 600,
                    color: isCompleted || isInProgress ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.25)',
                    textTransform: 'uppercase', letterSpacing: '0.02em', marginBottom: '0.2rem'
                  }}>
                    {stage.label}
                  </p>
                  <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)' }}>
                    {stage.duration}
                  </p>
                </div>

                {i < stages.length - 1 && isCompleted && (
                  <div style={{
                    position: 'absolute', top: '24px', left: '50%', width: '100%', height: '2px',
                    background: 'var(--accent-green)', zIndex: -1, opacity: 0.6
                  }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
        <div className="card" style={{ padding: '0', overflow: 'hidden', background: 'rgba(0,0,0,0.2)' }}>
          <div style={{ padding: '1.2rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h4 style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Workflow Artifact · <span style={{ color: 'var(--accent-blue)' }}>main.yml</span></h4>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', opacity: 0.4 }} />
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', opacity: 0.4 }} />
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', opacity: 0.4 }} />
            </div>
          </div>
          <pre style={{
            margin: 0, padding: '1.5rem',
            fontFamily: "'DM Mono', monospace", fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)',
            lineHeight: 1.7, overflowX: 'auto', background: 'transparent'
          }}>
            {`name: MLOps CI/CD Pipeline
on:
  push:
    branches: [ main, develop ]

jobs:
  test:
    uses: org/shared/.github/workflows/run-tests.yml@main
  
  build:
    needs: test
    uses: org/shared/.github/workflows/docker-build.yml@main

  deploy-prod:
    needs: build
    environment: production`}
          </pre>
        </div>

        <div className="card" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.01)' }}>
          <h4 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem' }}>Pipeline Stats</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { label: 'Avg Runtime', value: '14m 22s', icon: <HistoryIcon size={14} /> },
              { label: 'Success Rate', value: '98.4%', icon: <CheckCircle2 size={14} /> },
              { label: 'Queued Jobs', value: '0 Active', icon: <Settings2 size={14} /> },
            ].map((stat, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', fontFamily: "'DM Mono', monospace" }}>
                  {stat.icon}
                  {stat.label}
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function HistoryView() {
  const logs = [
    { sha: "a3f7c91", env: "prod", status: "success", time: "2m ago", branch: "main", triggered: "push" },
    { sha: "88be204", env: "staging", status: "success", time: "47m ago", branch: "develop", triggered: "push" },
    { sha: "f12d330", env: "staging", status: "failed", time: "3h ago", branch: "feature/retrain", triggered: "PR" },
    { sha: "c90a17e", env: "prod", status: "success", time: "1d ago", branch: "main", triggered: "push" },
    { sha: "74bb019", env: "prod", status: "success", time: "3d ago", branch: "main", triggered: "schedule" },
  ];

  const modelHistory = [
    { version: "v2.4.1", stage: "Production", accuracy: "93.2%", f1: "0.911", date: "2d ago", runs: "run_88c2f" },
    { version: "v2.4.0", stage: "Archived", accuracy: "92.7%", f1: "0.905", date: "9d ago", runs: "run_77b1e" },
    { version: "v2.3.2", stage: "Archived", accuracy: "91.9%", f1: "0.897", date: "23d ago", runs: "run_66a0d" },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      <div className="card animate-fade-in" style={{ padding: '0', overflow: 'hidden' }}>
        <div className="section-header" style={{ padding: '2rem', borderBottom: '1px solid var(--border)', marginBottom: '0' }}>
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.8rem', fontWeight: 600 }}>Deployment History</h3>
          <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.7rem', fontFamily: "'DM Mono', monospace" }}>{logs.length} RECENT DEPLOYS</span>
        </div>
        <div className="table-container">
          <table style={{ width: '100%', background: 'transparent' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.01)' }}>
                {["COMMIT", "BRANCH", "ENVIRONMENT", "TRIGGERED BY", "STATUS", "TIME"].map(h => (
                  <th key={h} style={{ padding: '1.2rem 2rem', fontSize: '0.65rem', letterSpacing: '0.12em', fontFamily: "'DM Mono', monospace", color: 'rgba(255,255,255,0.3)', textAlign: 'left', fontWeight: 400, borderBottom: '1px solid var(--border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map((log, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.2s' }}>
                  <td style={{ padding: '1.2rem 2rem' }}>
                    <span style={{ color: 'var(--accent-blue)', fontFamily: "'DM Mono', monospace", padding: '0.2rem 0.6rem', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '4px', fontSize: '0.8rem' }}>{log.sha}</span>
                  </td>
                  <td style={{ padding: '1.2rem 2rem', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <Globe size={14} style={{ opacity: 0.3 }} /> {log.branch}
                    </div>
                  </td>
                  <td style={{ padding: '1.2rem 2rem' }}>
                    <span style={{
                      padding: '0.25rem 0.8rem', background: log.env === 'prod' ? 'rgba(34, 197, 94, 0.05)' : 'rgba(59, 130, 246, 0.05)',
                      borderRadius: '99px', fontSize: '0.7rem', color: log.env === 'prod' ? 'var(--accent-green)' : 'var(--accent-blue)', border: '1px solid currentColor', opacity: 0.8, textTransform: 'uppercase'
                    }}>{log.env}</span>
                  </td>
                  <td style={{ padding: '1.2rem 2rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', fontFamily: "'DM Mono', monospace" }}>{log.triggered}</td>
                  <td style={{ padding: '1.2rem 2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: log.status === 'success' ? 'var(--accent-green)' : 'var(--accent-red)', fontSize: '0.75rem', fontWeight: 600 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
                      {log.status}
                    </div>
                  </td>
                  <td style={{ padding: '1.2rem 2rem', color: 'rgba(255,255,255,0.25)', fontSize: '0.85rem' }}>{log.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card animate-fade-in" style={{ padding: '2rem' }}>
        <div className="section-header" style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.8rem', fontWeight: 600 }}>MLflow Model Registry</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {modelHistory.map((m, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem',
              background: 'rgba(255,255,255,0.01)', border: `1px solid ${i === 0 ? 'rgba(34, 197, 94, 0.2)' : 'var(--border)'}`, borderRadius: '12px',
              flexWrap: 'wrap', gap: '1.5rem'
            }}>
              <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center' }}>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '1.1rem', fontWeight: 700, color: i === 0 ? 'var(--accent-green)' : 'rgba(255,255,255,0.4)' }}>{m.version}</span>
                <span style={{
                  padding: '2px 10px', borderRadius: '20px', background: i === 0 ? 'rgba(34, 197, 94, 0.05)' : 'rgba(255,255,255,0.05)',
                  color: i === 0 ? 'var(--accent-green)' : 'rgba(255,255,255,0.3)', border: `1px solid ${i === 0 ? 'var(--accent-green)' : 'rgba(255,255,255,0.1)'}`,
                  fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em'
                }}>{m.stage}</span>
              </div>
              <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
                {[
                  { label: "Accuracy", value: m.accuracy },
                  { label: "F1 Score", value: m.f1 },
                  { label: "Run ID", value: m.runs, isBlue: true },
                  { label: "Registered", value: m.date, isGray: true },
                ].map((stat, idx) => (
                  <div key={idx} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', marginBottom: '0.4rem', letterSpacing: '0.05em' }}>{stat.label}</div>
                    <div style={{
                      fontSize: '1rem', fontWeight: 600,
                      color: stat.isBlue ? 'var(--accent-blue)' : stat.isGray ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.9)',
                      fontFamily: stat.isBlue ? "'DM Mono', monospace" : 'inherit'
                    }}>{stat.value}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
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
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <Loader2 className="animate-spin" size={20} />
              {isWakingUp && <span style={{ fontSize: '0.65rem', opacity: 0.8, textTransform: 'none', letterSpacing: '0' }}>Waking up the backend servers...</span>}
            </div>
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
      const healthRes = await fetch(`${API_BASE_URL}/health`);
      if (healthRes.ok) setHealthStatus('Operational');
      else setHealthStatus('Warning');

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
    { id: 'history', label: 'Audit', icon: <HistoryIcon size={18} /> },
  ];

  return (
    <div className="dashboard-container" style={{ position: 'relative', overflow: 'hidden', background: '#0e0e0e', minHeight: '100vh' }}>
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
          <div className="logo-area">
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

          <nav className="nav">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          <div className="header-actions">
            <div className="status-badge">
              <div className="status-dot" style={{ background: healthStatus === 'Operational' ? 'var(--accent-green)' : 'var(--accent-red)' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{healthStatus}</span>
            </div>
            <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }} onClick={() => setIsModalOpen(true)}>Environments</button>
          </div>
        </div>
      </header>

      {/* Ticker Bar */}
      <div style={{
        overflow: 'hidden', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)',
        padding: '8px 0', position: 'relative', zIndex: 10
      }}>
        <div style={{
          display: 'flex', gap: '0',
          animation: 'ticker 40s linear infinite',
          width: 'max-content',
          fontFamily: "'DM Mono', monospace",
          fontSize: '0.65rem',
          letterSpacing: '0.1em',
          color: 'rgba(255,255,255,0.25)',
          textTransform: 'uppercase'
        }}>
          {[...Array(2)].flatMap(() => [
            "✓ TEST SUITE PASSED (47/47)",
            "⬡ DOCKER BUILD SUCCESS · 3m11s",
            "▶ DEPLOYED TO PROD · 2m AGO",
            "◈ DRIFT SCORE 0.034 · NORMAL",
            "⚡ AVG LATENCY 44ms · P99 112ms",
            "◎ 1,847 REQUESTS / MIN",
            "✓ MODEL ACCURACY 93.2%",
            "⬡ GKE PODS: 3/3 RUNNING",
          ]).map((item, i) => (
            <span key={i} style={{ padding: '0 40px', borderRight: '1px solid rgba(255,255,255,0.05)', whiteSpace: 'nowrap' }}>{item}</span>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      <main className="main-content">
        {activeTab === 'overview' && (
          <div className="grid animate-fade-in">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                <StatCard label="Accuracy" value={stats.accuracy.toFixed(1)} unit="%" trend="+0.2%" icon={<CheckCircle2 size={18} />} />
                <StatCard label="F1 Score" value={stats.f1.toFixed(1)} unit="%" trend="+0.5%" icon={<Search size={18} />} />
                <StatCard label="Latency" value={stats.latency} unit="ms" icon={<Zap size={18} />} />
                <StatCard label="Drift" value={stats.drift} unit="" trend={`${stats.drift > 0.1 ? '↑' : '↓'}`} icon={<AlertCircle size={18} />} />
              </div>

              <div className="card chart-card">
                <div className="section-header">
                  <h3 className="section-title">Performance Retention</h3>
                  <div className="chart-legend">
                    <div className="legend-item"><div className="legend-dot blue"></div> Accuracy</div>
                    <div className="legend-item"><div className="legend-dot green"></div> F1 Score</div>
                  </div>
                </div>
                <div style={{ width: '100%', height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
        )}

        {activeTab === 'inference' && <InferenceDemo />}
        {activeTab === 'pipeline' && <PipelineView />}
        {activeTab === 'history' && <HistoryView />}
      </main>

      <OnboardingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}

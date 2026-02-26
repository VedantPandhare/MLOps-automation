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
  const [step, setStep] = useState(0);
  const [repoUrl, setRepoUrl] = useState('');
  const [progress, setProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState('Initializing analysis...');

  useEffect(() => {
    if (!isOpen) {
      setStep(0);
      setRepoUrl('');
      setProgress(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (step === 2) {
      const messages = [
        "Scanning repository structure...",
        "Identifying ML framework...",
        "Analyzing environment dependencies...",
        "Validating CI/CD workflow compatibility...",
        "Profiling model orchestration parameters...",
        "Optimizing cloud deployment manifests...",
        "Finalizing configuration..."
      ];

      let curMsgIdx = 0;
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setStep(3), 500);
            return 100;
          }
          const next = prev + Math.random() * 15;
          if (next > (curMsgIdx + 1) * (100 / messages.length)) {
            curMsgIdx = Math.min(curMsgIdx + 1, messages.length - 1);
            setStatusMsg(messages[curMsgIdx]);
          }
          return Math.min(next, 100);
        });
      }, 600);
      return () => clearInterval(interval);
    }
  }, [step]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)'
    }}>
      <div className="card animate-fade-in" style={{ maxWidth: '500px', width: '90%', padding: '3rem', position: 'relative', overflow: 'hidden' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}>✕</button>

        {step === 0 && (
          <>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2rem', fontWeight: 600, marginBottom: '1.5rem', textAlign: 'center' }}>Welcome to Conduit</h2>
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '2.5rem', lineHeight: 1.6 }}>Choose an environment to begin your MLOps workflow simulation.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button className="btn btn-primary" style={{ width: '100%', padding: '1.2rem' }} onClick={onClose}>Explore Demo Model</button>
              <button className="btn btn-secondary" style={{ width: '100%', padding: '1.2rem', borderColor: 'rgba(255,255,255,0.1)' }} onClick={() => setStep(1)}>Import GitHub Repository</button>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2rem', fontWeight: 600, marginBottom: '1.5rem', textAlign: 'center' }}>Import Repository</h2>
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '2rem', lineHeight: 1.6 }}>Enter your ML repository link to automate its lifecycle.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="https://github.com/user/repo"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  style={{
                    width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)',
                    padding: '1rem', borderRadius: '4px', color: '#fff',
                    fontFamily: "'DM Mono', monospace", outline: 'none'
                  }}
                />
              </div>
              <button
                className="btn btn-primary"
                style={{ width: '100%', padding: '1.2rem' }}
                onClick={() => setStep(2)}
                disabled={!repoUrl}
              >
                Continue
              </button>
              <button className="btn btn-ghost" style={{ width: '100%', border: 'none', background: 'none', opacity: 0.5 }} onClick={() => setStep(0)}>Back</button>
            </div>
          </>
        )}

        {step === 2 && (
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2rem', fontWeight: 600, marginBottom: '2rem' }}>Analyzing Repository</h2>

            <div style={{ position: 'relative', width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '99px', marginBottom: '1.5rem', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${progress}%`, background: 'var(--accent-blue)', transition: 'width 0.3s ease', boxShadow: '0 0 15px var(--accent-blue)' }} />
            </div>

            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', minHeight: '1.2em' }}>{statusMsg}</p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '3rem' }}>
              {[Globe, Cpu, Settings2, RefreshCw].map((Icon, i) => (
                <Icon key={i} size={24} style={{ opacity: progress > (i + 1) * 20 ? 0.8 : 0.1, color: progress > (i + 1) * 20 ? 'var(--accent-blue)' : '#fff', transition: 'all 0.5s ease' }} />
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid var(--accent-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
              <CheckCircle2 size={32} color="var(--accent-green)" />
            </div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2rem', fontWeight: 600, marginBottom: '1rem' }}>Setup Complete</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', lineHeight: 1.6 }}>Repository <strong>{repoUrl.split('/').pop()}</strong> has been successfully integrated into the control tower.</p>
            <button className="btn btn-primary" style={{ width: '100%', padding: '1.2rem' }} onClick={onClose}>Go to Dashboard</button>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, unit, trend, icon }) {
  return (
    <div className="card" style={{ padding: '1.5rem', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.01)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ color: 'var(--text-secondary)', opacity: 0.5 }}>{icon}</div>
        {trend && (
          <span style={{ fontSize: '0.65rem', color: trend.startsWith('+') || trend.includes('↑') ? 'var(--accent-green)' : 'var(--accent-blue)', fontWeight: 600, fontFamily: "'DM Mono', monospace" }}>
            {trend}
          </span>
        )}
      </div>
      <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '0.4rem' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem' }}>
        <span style={{ fontSize: '2rem', fontWeight: 600, fontFamily: "'DM Mono', monospace" }}>{value}</span>
        <span style={{ fontSize: '0.75rem', opacity: 0.4, fontFamily: "'DM Mono', monospace" }}>{unit}</span>
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
  const stages = [
    { id: "test", label: "Run Tests", icon: <CheckCircle2 size={18} />, duration: "1m 42s", status: 'success' },
    { id: "build", label: "Docker Build", icon: <CheckCircle2 size={18} />, duration: "3m 11s", status: 'success' },
    { id: "scan", label: "Security Scan", icon: <CheckCircle2 size={18} />, duration: "0m 58s", status: 'success' },
    { id: "staging", label: "Deploy Staging", icon: <CheckCircle2 size={18} />, duration: "2m 05s", status: 'success' },
    { id: "prod", label: "Deploy Prod", icon: <Loader2 size={18} />, duration: "2m 33s", status: 'running' },
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
            <div className="pulse-dot" style={{ width: 8, height: 8, borderRadius: '50%', background: 'currentColor', boxShadow: '0 0 10px currentColor' }} />
            Pipeline Running
          </div>
        </div>

        <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          {/* Base Connection Line */}
          <div style={{ position: 'absolute', top: '24px', left: '40px', right: '40px', height: '1px', background: 'rgba(255,255,255,0.08)', zIndex: 0 }} />

          {stages.map((stage, i) => {
            const isCompleted = stage.status === 'success';
            const isInProgress = stage.status === 'running';

            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.2rem', zIndex: 1, flex: 1, position: 'relative' }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '50%',
                  background: isCompleted ? 'rgba(34, 197, 94, 0.05)' : isInProgress ? 'rgba(59, 130, 246, 0.05)' : 'rgba(14,14,14,0.8)',
                  border: `2px solid ${isCompleted ? 'var(--accent-green)' : isInProgress ? 'var(--accent-blue)' : 'rgba(255,255,255,0.1)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.4s ease',
                  boxShadow: isInProgress ? '0 0 20px rgba(59, 130, 246, 0.3)' : 'none',
                  color: isCompleted ? 'var(--accent-green)' : isInProgress ? 'var(--accent-blue)' : 'rgba(255,255,255,0.1)'
                }}>
                  {isCompleted ? <span>✓</span> : isInProgress ? <Loader2 className="animate-spin" size={20} /> : <span>○</span>}
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

                {/* Progress line to next stage */}
                {i < stages.length - 1 && (
                  <div style={{
                    position: 'absolute', top: '24px', left: 'calc(50% + 24px)', width: 'calc(100% - 48px)', height: '2px',
                    background: isCompleted ? 'var(--accent-green)' : 'transparent',
                    zIndex: -1, opacity: 0.6
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

      <style jsx>{`
        .pulse-dot {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
      `}</style>
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '2rem' }}>
          <button
            className="btn btn-secondary"
            onClick={() => {
              setFormData({
                amount: 850.00, hour_of_day: 2, day_of_week: 2, merchant_category: 12,
                distance_from_home: 120.5, num_transactions_24h: 15, avg_transaction_amount: 180.00,
                is_international: 1, card_age_days: 10, failed_attempts_24h: 4,
              });
              setTimeout(() => document.getElementById('process-btn')?.click(), 100);
            }}
            style={{
              padding: '0.75rem', fontSize: '0.65rem', border: '1px solid rgba(239, 68, 68, 0.3)',
              background: 'rgba(239, 68, 68, 0.05)', color: '#ef4444'
            }}
          >
            HIGH RISK
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => {
              setFormData({
                amount: 250.00, hour_of_day: 0, day_of_week: 2, merchant_category: 5,
                distance_from_home: 12.5, num_transactions_24h: 3, avg_transaction_amount: 180.00,
                is_international: 0, card_age_days: 730, failed_attempts_24h: 0,
              });
              setTimeout(() => document.getElementById('process-btn')?.click(), 100);
            }}
            style={{
              padding: '0.75rem', fontSize: '0.65rem', border: '1px solid rgba(245, 158, 11, 0.3)',
              background: 'rgba(245, 158, 11, 0.05)', color: '#f59e0b'
            }}
          >
            MEDIUM RISK
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setFormData({
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
            })}
            style={{ padding: '0.75rem', fontSize: '0.65rem' }}
          >
            RESET LEGIT
          </button>
        </div>
        <button id="process-btn" className="btn btn-primary" onClick={runPrediction} disabled={loading} style={{
          width: '100%', justifyContent: 'center', padding: '1.2rem',
          fontFamily: "'DM Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.1em',
          background: 'rgba(255,255,255,0.9)', color: '#0e0e0e'
        }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <Loader2 className="animate-spin" size={20} />
              {isWakingUp && <span style={{ fontSize: '0.65rem', opacity: 0.8, textTransform: 'none', letterSpacing: '0' }}>Waking up the backend servers...</span>}
            </div>
          ) : 'Execute Inference'}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', fontWeight: 600, marginBottom: '2rem', textAlign: 'center' }}>Inference Report</h3>
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

        {result && (
          <div className="card animate-fade-in" style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <h4 style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: "'DM Mono', monospace" }}>Server Audit Log</h4>
              <span className="badge badge-green" style={{ fontSize: '0.6rem' }}>HTTP 200 OK</span>
            </div>
            <pre style={{ margin: 0, fontSize: '0.75rem', color: 'var(--accent-blue)', opacity: 0.8, fontFamily: "'DM Mono', monospace", overflowX: 'auto' }}>
              {JSON.stringify(result, null, 2)}
            </pre>
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
        <div className="header-inner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem', height: '80px' }}>
          <div className="logo-area" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="logo-icon" style={{
              width: '32px', height: '32px', border: '1px solid rgba(59, 130, 246, 0.5)',
              background: 'rgba(59, 130, 246, 0.05)', borderRadius: '4px',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Zap size={18} color="#3b82f6" fill="#3b82f6" style={{ opacity: 0.8 }} />
            </div>
            <div className="logo-text">
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', fontWeight: 600, letterSpacing: '0.02em', margin: 0 }}>Conduit</h1>
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.15em', opacity: 0.3, margin: 0 }}>MLOps Control Tower</p>
            </div>
          </div>

          <nav style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.02)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border)' }}>
            {tabs.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 1.2rem',
                    borderRadius: '6px', border: 'none', cursor: 'pointer',
                    background: isActive ? '#fff' : 'transparent',
                    color: isActive ? '#000' : 'rgba(255,255,255,0.5)',
                    transition: 'all 0.2s ease',
                    fontFamily: isActive ? "'Syne', sans-serif" : "'DM Mono', monospace",
                    fontSize: '0.85rem', fontWeight: isActive ? 600 : 400
                  }}
                  onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#fff'; } }}
                  onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; } }}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.6rem', fontFamily: "'DM Mono', monospace", letterSpacing: '0.15em', color: healthStatus === 'Operational' ? 'var(--accent-green)' : 'var(--accent-red)', fontWeight: 700 }}>{healthStatus.toUpperCase()}</span>
            <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', background: '#fff', color: '#000', border: 'none' }} onClick={() => setIsModalOpen(true)}>Environments</button>
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
          fontSize: '0.6rem',
          letterSpacing: '0.1em',
          color: 'rgba(255,255,255,0.2)',
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

      <main className="main-content" style={{ padding: '2.5rem' }}>
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
              <StatCard label="Accuracy" value={stats.accuracy.toFixed(1)} unit="%" trend="+0.2%" icon={<CheckCircle2 size={16} />} />
              <StatCard label="F1 Score" value={stats.f1.toFixed(1)} unit="%" trend="+0.5%" icon={<Search size={16} />} />
              <StatCard label="Latency" value={stats.latency} unit="ms" trend="↓ 1.2ms" icon={<Zap size={16} />} />
              <StatCard label="Drift" value={stats.drift} unit="" trend={stats.drift > 0.1 ? '↑ Critical' : '↓ Normal'} icon={<AlertCircle size={16} />} />
            </div>

            <div className="grid" style={{ gridTemplateColumns: '1.8fr 1fr', gap: '2rem' }}>
              <div className="card" style={{ padding: '2rem' }}>
                <div className="section-header" style={{ marginBottom: '2rem' }}>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', fontWeight: 600 }}>Performance Retention</h3>
                  <div style={{ display: 'flex', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontFamily: "'DM Mono', monospace" }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-blue)' }} /> Accuracy
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontFamily: "'DM Mono', monospace" }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-green)' }} /> F1 Score
                    </div>
                  </div>
                </div>
                <div style={{ width: '100%', height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="accGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--accent-blue)" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="var(--accent-blue)" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="f1Grad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--accent-green)" stopOpacity={0.1} />
                          <stop offset="95%" stopColor="var(--accent-green)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                      <XAxis dataKey="date" tick={{ fill: '#71717a', fontSize: 10, fontFamily: "'DM Mono', monospace" }} axisLine={false} tickLine={false} />
                      <YAxis domain={[85, 100]} tick={{ fill: '#71717a', fontSize: 10, fontFamily: "'DM Mono', monospace" }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ background: '#0e0e0e', border: '1px solid #3f3f46', borderRadius: '4px', fontSize: '0.75rem', fontFamily: "'DM Mono', monospace" }}
                        itemStyle={{ color: '#fafafa' }}
                      />
                      <Area type="monotone" dataKey="accuracy" stroke="var(--accent-blue)" fill="url(#accGrad)" strokeWidth={2} dot={false} />
                      <Area type="monotone" dataKey="f1" stroke="var(--accent-green)" fill="url(#f1Grad)" strokeWidth={2} dot={false} strokeDasharray="4 4" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div className="card" style={{ padding: '2rem' }}>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.4rem', fontWeight: 600, marginBottom: '1.5rem' }}>Engine Health</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <InfrastructureItem icon={<Globe size={14} />} name="Edge Proxies" status="Operational" />
                    <InfrastructureItem icon={<Cpu size={14} />} name="Compute Nodes" status="Operational" />
                    <InfrastructureItem icon={<Settings2 size={14} />} name="MLflow Engine" status={healthStatus} />
                    <InfrastructureItem icon={<RefreshCw size={14} />} name="DVC Sync" status="Operational" />
                  </div>
                </div>

                <div className="card" style={{ padding: '2rem', flex: 1 }}>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.4rem', fontWeight: 600, marginBottom: '1.5rem' }}>Model Identity</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {[
                      { l: "Registry Version", v: modelInfo.version, c: 'var(--accent-blue)' },
                      { l: "Environment", v: modelInfo.environment, c: '#fff' },
                      { l: "Architecture", v: "Scikit-Learn Ensemble", c: '#fff' },
                      { l: "Last Push", v: "12h 45m ago", c: '#fff' }
                    ].map((item, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', fontFamily: "'DM Mono', monospace" }}>{item.l}</span>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: item.c, fontFamily: "'DM Mono', monospace" }}>{item.v}</span>
                      </div>
                    ))}
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

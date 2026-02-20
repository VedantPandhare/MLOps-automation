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

function OnboardingModal({ isOpen, onClose }) {
  const [repoUrl, setRepoUrl] = useState('');
  const [imageName, setImageName] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleOnboard = async () => {
    if (!repoUrl) return;
    setLoading(true);
    setStatus({ type: 'info', message: 'Initiating MLOps onboarding sequence...' });

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
          Connect your GitHub repository to automatically inject standardized MLOps workflows.
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
  const stages = [
    { name: 'Data Ingestion', status: 'completed', time: '1m 20s' },
    { name: 'Model Training', status: 'completed', time: '15m 45s' },
    { name: 'Validation Metrics', status: 'completed', time: '2m 10s' },
    { name: 'Security Audit', status: 'in-progress', time: '45s' },
    { name: 'Production Deployment', status: 'pending', time: '-' },
  ];

  return (
    <div className="card animate-fade-in" style={{ height: '100%' }}>
      <div className="section-header">
        <h3 className="section-title">Workflow Execution</h3>
        <span className="badge badge-blue">Run #1204</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {stages.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '8px', background: s.status === 'in-progress' ? 'rgba(59, 130, 246, 0.05)' : 'transparent' }}>
            <div style={{
              width: 10, height: 10, borderRadius: '50%',
              background: s.status === 'completed' ? 'var(--accent-green)' : s.status === 'in-progress' ? 'var(--accent-blue)' : 'var(--bg-card)',
              boxShadow: s.status === 'in-progress' ? '0 0 10px var(--accent-blue)' : 'none'
            }} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>{s.name}</p>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{s.status}</p>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{s.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function HistoryView() {
  const logs = [
    { event: 'Production Rollout', version: 'v5.2.0', user: 'system', time: '2h ago', status: 'success' },
    { event: 'Drift Alert', version: 'v5.1.0', user: 'evidently-ai', time: '5h ago', status: 'warning' },
    { event: 'Automatic Retrain', version: 'v5.1.0', user: 'github-actions', time: '6h ago', status: 'success' },
    { event: 'Health Check Fail', version: 'v5.0.1', user: 'monitoring', time: '1d ago', status: 'error' },
  ];

  return (
    <div className="card animate-fade-in">
      <div className="section-header">
        <h3 className="section-title">Audit Log</h3>
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>EVENT</th>
              <th>VERSION</th>
              <th>ACTOR</th>
              <th>TIMESTAMP</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 500 }}>{log.event}</td>
                <td style={{ color: 'var(--accent-blue)', fontFamily: 'monospace' }}>{log.version}</td>
                <td>{log.user}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{log.time}</td>
                <td><span className={`badge badge-${log.status === 'success' ? 'green' : log.status === 'warning' ? 'orange' : 'red'}`}>{log.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
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
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseFloat(value) }));
  };

  const runPrediction = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error('Prediction request failed');
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const riskColors = { MINIMAL: '#22c55e', LOW: '#3b82f6', MEDIUM: '#f59e0b', HIGH: '#ef4444', CRITICAL: '#7f1d1d' };

  return (
    <div className="grid animate-fade-in" style={{ gridTemplateColumns: '1.5fr 1fr' }}>
      <div className="card">
        <h3 className="section-title" style={{ marginBottom: '1.5rem' }}>Transaction Simulation</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          {Object.entries(formData).map(([key, val]) => (
            <div key={key}>
              <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>{key.replace(/_/g, ' ')}</label>
              <input
                name={key}
                type="number"
                value={val}
                onChange={handleInputChange}
                style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '0.5rem', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '0.875rem' }}
              />
            </div>
          ))}
        </div>
        <button className="btn btn-primary" onClick={runPrediction} disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '1rem' }}>
          {loading ? <Loader2 className="animate-spin" size={20} /> : 'Process Transaction'}
        </button>
      </div>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <h3 className="section-title" style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Analysis Result</h3>
        {error ? (
          <div style={{ textAlign: 'center', color: 'var(--accent-red)' }}>
            <AlertCircle size={40} style={{ margin: '0 auto 1rem' }} />
            <p>{error}</p>
          </div>
        ) : result ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '120px', height: '120px', border: `4px solid ${riskColors[result.risk_level] || 'var(--border)'}`,
              borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem',
              boxShadow: `0 0 20px -5px ${riskColors[result.risk_level] || 'transparent'}`
            }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>{(result.fraud_probability * 100).toFixed(1)}%</span>
              <span style={{ fontSize: '0.625rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Fraud Risk</span>
            </div>
            <h4 style={{ color: riskColors[result.risk_level], fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>{result.is_fraud ? 'ALERT: FRAUD' : 'VERIFIED: SAFE'}</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              <p>Risk Level: <strong style={{ color: 'var(--text-primary)' }}>{result.risk_level}</strong></p>
              <p>Latency: <strong style={{ color: 'var(--text-primary)' }}>{result.latency_ms.toFixed(2)}ms</strong></p>
              <p>Model: <strong style={{ color: 'var(--text-primary)' }}>{result.model_version}</strong></p>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
            <Zap size={40} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
            <p>Ready for Processing</p>
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
    <div className="dashboard-container">
      <header className="header">
        <div className="header-inner">
          <div className="logo-area">
            <div className="logo-icon"><Zap size={20} fill="white" /></div>
            <div className="logo-text">
              <h1>MLOps Platform</h1>
              <p>Fraud Detection • Enterprise Engine</p>
            </div>
          </div>

          <nav className="nav-tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <button className="btn btn-outline" style={{ border: '1px solid var(--border)' }} onClick={() => setIsModalOpen(true)}>
              <Plus size={16} />
              New Repo
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.8125rem', color: healthStatus === 'Operational' ? 'var(--accent-green)' : 'var(--accent-red)' }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%', background: 'currentColor',
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
              <div className="card stat-card">
                <p className="stat-label">Model Accuracy</p>
                <h2 className="stat-value">{stats.accuracy.toFixed(1)}%</h2>
                <p className="stat-footer text-up"><TrendingUp size={12} /> Live Production</p>
              </div>
              <div className="card stat-card">
                <p className="stat-label">F1-Score</p>
                <h2 className="stat-value">{stats.f1.toFixed(1)}%</h2>
                <p className="stat-footer" style={{ color: 'var(--text-secondary)' }}>Baseline 90.0%</p>
              </div>
              <div className="card stat-card">
                <p className="stat-label">Inference Latency</p>
                <h2 className="stat-value">{stats.latency}ms</h2>
                <p className="stat-footer text-down"><Activity size={12} /> Optimization Active</p>
              </div>
              <div className="card stat-card">
                <p className="stat-label">Data Drift (PSI)</p>
                <h2 className="stat-value">{stats.drift}</h2>
                <p className="stat-footer" style={{ color: 'var(--text-secondary)' }}><ShieldCheck size={12} /> Below Threshold</p>
              </div>
            </div>

            <div className="grid" style={{ gridTemplateColumns: '2.5fr 1fr' }}>
              <div className="card chart-card">
                <div className="section-header">
                  <h3 className="section-title">Performance Retention</h3>
                  <div className="badge badge-blue">Last 15 Cycles</div>
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

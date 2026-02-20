"use client";

import { useState, useEffect } from 'react';
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
  Globe
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

// --- Mock Data ---
const generateAccuracyHistory = () => {
  const data = [];
  let acc = 91;
  for (let i = 30; i >= 0; i--) {
    acc += (Math.random() - 0.45) * 0.5;
    acc = Math.max(88, Math.min(98, acc));
    const d = new Date();
    d.setDate(d.getDate() - i);
    data.push({
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      accuracy: parseFloat(acc.toFixed(2)),
      f1: parseFloat((acc - 3 + Math.random() * 2).toFixed(2)),
    });
  }
  return data;
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({ accuracy: 95.2, f1: 91.8, latency: 4.3, drift: 0.08 });
  const [chartData] = useState(generateAccuracyHistory);

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        accuracy: parseFloat((prev.accuracy + (Math.random() - 0.5) * 0.1).toFixed(1)),
        f1: parseFloat((prev.f1 + (Math.random() - 0.5) * 0.1).toFixed(1)),
        latency: parseFloat((prev.latency + (Math.random() - 0.5) * 0.2).toFixed(1)),
        drift: parseFloat(Math.max(0.01, Math.min(0.14, prev.drift + (Math.random() - 0.5) * 0.005)).toFixed(3)),
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 size={18} /> },
    { id: 'pipeline', label: 'Pipeline', icon: <Settings2 size={18} /> },
    { id: 'inference', label: 'Inference', icon: <Search size={18} /> },
    { id: 'history', label: 'History', icon: <History size={18} /> },
  ];

  return (
    <div className="dashboard-container">
      <header className="header">
        <div className="header-inner">
          <div className="logo-area">
            <div className="logo-icon"><Zap size={20} fill="white" /></div>
            <div className="logo-text">
              <h1>MLOps Dashboard</h1>
              <p>Fraud Detection • Enterprise</p>
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button className="btn btn-primary" onClick={() => { }}>
              <Plus size={16} />
              Import Project
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--accent-green)' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'currentColor', boxShadow: '0 0 8px currentColor' }} />
              Active
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
                <h2 className="stat-value">{stats.accuracy}%</h2>
                <p className="stat-footer text-up"><TrendingUp size={12} /> +0.4% from last run</p>
              </div>
              <div className="card stat-card">
                <p className="stat-label">F1 Score</p>
                <h2 className="stat-value">{stats.f1}%</h2>
                <p className="stat-footer text-up"><TrendingUp size={12} /> +0.2% from last run</p>
              </div>
              <div className="card stat-card">
                <p className="stat-label">Latency (P99)</p>
                <h2 className="stat-value">{stats.latency}ms</h2>
                <p className="stat-footer text-down"><Activity size={12} /> -0.1ms optimization</p>
              </div>
              <div className="card stat-card">
                <p className="stat-label">Data Drift</p>
                <h2 className="stat-value">{stats.drift}</h2>
                <p className="stat-footer" style={{ color: 'var(--text-secondary)' }}><ShieldCheck size={12} /> Stable</p>
              </div>
            </div>

            <div className="grid" style={{ gridTemplateColumns: '2fr 1fr' }}>
              <div className="card chart-card">
                <div className="section-header">
                  <h3 className="section-title">Model Health & Drift</h3>
                  <div className="badge badge-blue">Live Analysis</div>
                </div>
                <div style={{ height: '300px', width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="accGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--accent-blue)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="var(--accent-blue)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis dataKey="date" tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis domain={[85, 100]} tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px' }}
                        itemStyle={{ color: '#fafafa' }}
                      />
                      <Area type="monotone" dataKey="accuracy" stroke="var(--accent-blue)" fill="url(#accGrad)" strokeWidth={2} />
                      <Area type="monotone" dataKey="f1" stroke="var(--accent-green)" fill="transparent" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="card">
                <div className="section-header">
                  <h3 className="section-title">Infrastructure</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <InfrastructureItem icon={<Globe size={16} />} name="Global Edge" status="Operational" />
                  <InfrastructureItem icon={<Cpu size={16} />} name="Model Server" status="Operational" />
                  <InfrastructureItem icon={<Settings2 size={16} />} name="MLflow Engine" status="Operational" />
                  <InfrastructureItem icon={<RefreshCw size={16} />} name="DVC Remote" status="Operational" />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'inference' && <InferenceDemo />}
        {activeTab === 'pipeline' && <PipelineView />}
        {activeTab === 'history' && <HistoryView />}
      </main>
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
      <span className="badge badge-green">{status}</span>
    </div>
  );
}

function PipelineView() {
  const stages = [
    { name: 'Training', status: 'completed', time: '12m' },
    { name: 'Validation', status: 'completed', time: '4m' },
    { name: 'Security Scan', status: 'in-progress', time: '2m' },
    { name: 'Cloud Deploy', status: 'pending', time: '-' },
  ];

  return (
    <div className="card animate-fade-in">
      <div className="section-header">
        <h3 className="section-title">Workflow Execution</h3>
        <span className="badge badge-blue">Run #1204</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {stages.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px' }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: s.status === 'completed' ? 'var(--accent-green)' : s.status === 'in-progress' ? 'var(--accent-blue)' : 'var(--bg-card)', border: s.status === 'pending' ? '1px solid var(--border)' : 'none' }} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>{s.name}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Status: {s.status}</p>
            </div>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{s.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function HistoryView() {
  const logs = [
    { event: 'Model Deployed', version: 'v5.2.0', user: 'system', time: '2h ago' },
    { event: 'Drift Detected', version: 'v5.1.0', user: 'evidently-ai', time: '5h ago' },
    { event: 'Retraining Triggered', version: 'v5.1.0', user: 'github-actions', time: '6h ago' },
    { event: 'Validation Passed', version: 'v5.1.0', user: 'pytest', time: '6h ago' },
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
              <th>Event</th>
              <th>Version</th>
              <th>Actor</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 500 }}>{log.event}</td>
                <td style={{ color: 'var(--accent-blue)' }}>{log.version}</td>
                <td>{log.user}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{log.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function InferenceDemo() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const runPrediction = () => {
    setLoading(true);
    setTimeout(() => {
      setResult({ risk: 'Low', prob: 0.12 });
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="grid animate-fade-in" style={{ gridTemplateColumns: '1fr 1fr' }}>
      <div className="card">
        <h3 className="section-title" style={{ marginBottom: '1.5rem' }}>Simulation Engine</h3>
        <button className="btn btn-primary" onClick={runPrediction} disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '1rem' }}>
          {loading ? 'Running Analysis...' : '⚡ Process Transaction'}
        </button>
      </div>
      <div className="card">
        <h3 className="section-title" style={{ marginBottom: '1.5rem' }}>Output</h3>
        {result ? (
          <div style={{ textAlign: 'center' }}>
            <h4 style={{ color: 'var(--accent-green)', fontSize: '2rem' }}>{result.risk} Risk</h4>
            <p style={{ color: 'var(--text-secondary)' }}>Probability: {(result.prob * 100).toFixed(1)}%</p>
          </div>
        ) : (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>Waiting for input...</p>
        )}
      </div>
    </div >
  );
}

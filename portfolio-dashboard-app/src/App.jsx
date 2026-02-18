import { useState, useEffect, useCallback } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, BarChart, Bar, Cell
} from 'recharts';
import './index.css';

// ─── Mock Data Generators ──────────────────────────────────────────────────────
const generateAccuracyHistory = () => {
  const data = [];
  let acc = 0.91;
  for (let i = 30; i >= 0; i--) {
    acc += (Math.random() - 0.45) * 0.005;
    acc = Math.max(0.88, Math.min(0.98, acc));
    const d = new Date();
    d.setDate(d.getDate() - i);
    data.push({
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      accuracy: parseFloat((acc * 100).toFixed(2)),
      f1: parseFloat(((acc - 0.03 + Math.random() * 0.02) * 100).toFixed(2)),
    });
  }
  return data;
};

const deploymentHistory = [
  { sha: 'a3f8c2d', branch: 'main', env: 'production', trigger: 'PR Merge', status: 'success', time: '2026-02-18 10:32' },
  { sha: 'b7e1f9a', branch: 'develop', env: 'staging', trigger: 'Push', status: 'success', time: '2026-02-18 09:15' },
  { sha: 'c4d2e8b', branch: 'main', env: 'production', trigger: 'PR Merge', status: 'success', time: '2026-02-17 16:44' },
  { sha: 'd9a3f1c', branch: 'develop', env: 'staging', trigger: 'Push', status: 'failed', time: '2026-02-17 14:22' },
  { sha: 'e6b4c7d', branch: 'develop', env: 'staging', trigger: 'Push', status: 'success', time: '2026-02-17 11:05' },
  { sha: 'f1e5d2a', branch: 'main', env: 'production', trigger: 'Retrain', status: 'success', time: '2026-02-16 02:00' },
];

const mlflowModels = [
  { version: 'v5', accuracy: '95.2%', f1: '91.8%', auc: '97.4%', stage: 'Production', date: '2026-02-18' },
  { version: 'v4', accuracy: '94.7%', f1: '91.1%', auc: '97.0%', stage: 'Archived', date: '2026-02-11' },
  { version: 'v3', accuracy: '93.9%', f1: '90.3%', auc: '96.5%', stage: 'Archived', date: '2026-02-04' },
  { version: 'v2', accuracy: '92.1%', f1: '88.7%', auc: '95.8%', stage: 'Archived', date: '2026-01-28' },
  { version: 'v1', accuracy: '90.5%', f1: '86.2%', auc: '94.1%', stage: 'Archived', date: '2026-01-21' },
];

const pipelineStages = [
  { id: 1, label: 'Test', icon: '🧪', time: '1m 23s', status: 'completed' },
  { id: 2, label: 'Docker Build', icon: '🐳', time: '2m 41s', status: 'completed' },
  { id: 3, label: 'Security Scan', icon: '🔒', time: '0m 58s', status: 'completed' },
  { id: 4, label: 'Staging Deploy', icon: '🚀', time: '1m 12s', status: 'active' },
  { id: 5, label: 'Prod Deploy', icon: '🏭', time: '—', status: 'pending' },
];

const sharedWorkflows = [
  { name: 'run-tests.yml', desc: 'flake8 linting + pytest with coverage report', uses: 12, icon: '🧪' },
  { name: 'docker-build.yml', desc: 'Multi-stage build, SHA tagging, push to registry', uses: 12, icon: '🐳' },
  { name: 'security-scan.yml', desc: 'Trivy CVE scan — fails on HIGH/CRITICAL', uses: 12, icon: '🔒' },
  { name: 'deploy-k8s.yml', desc: 'Helm upgrade to GKE (staging/production)', uses: 8, icon: '☸️' },
  { name: 'notify-slack.yml', desc: 'Rich Slack notifications with pipeline status', uses: 12, icon: '📣' },
];

const sampleTransactions = [
  { label: '🟢 Normal Purchase', data: { amount: 45.99, hour_of_day: 14, day_of_week: 2, merchant_category: 5, distance_from_home: 3.2, num_transactions_24h: 2, avg_transaction_amount: 62.50, is_international: 0, card_age_days: 1825, failed_attempts_24h: 0 } },
  { label: '🟡 Unusual Amount', data: { amount: 2500.00, hour_of_day: 11, day_of_week: 1, merchant_category: 8, distance_from_home: 45.0, num_transactions_24h: 5, avg_transaction_amount: 120.00, is_international: 0, card_age_days: 730, failed_attempts_24h: 1 } },
  { label: '🔴 Suspicious Pattern', data: { amount: 8999.99, hour_of_day: 3, day_of_week: 6, merchant_category: 15, distance_from_home: 850.0, num_transactions_24h: 14, avg_transaction_amount: 35.00, is_international: 1, card_age_days: 7, failed_attempts_24h: 4 } },
];

// ─── Custom Tooltip ────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#131d35', border: '1px solid rgba(99,179,237,0.3)', borderRadius: 8, padding: '10px 14px' }}>
        <p style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: 4 }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color, fontSize: '0.82rem', fontWeight: 600 }}>
            {p.name}: {p.value}%
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// ─── Overview Tab ──────────────────────────────────────────────────────────────
function OverviewTab({ stats }) {
  const [chartData] = useState(generateAccuracyHistory);

  const healthItems = [
    { name: 'GKE Pods (3/3)', status: 'healthy' },
    { name: 'MLflow Server', status: 'healthy' },
    { name: 'DVC Remote (GCS)', status: 'healthy' },
    { name: 'Prometheus', status: 'healthy' },
    { name: 'Grafana', status: 'healthy' },
    { name: 'Evidently AI', status: 'healthy' },
  ];

  return (
    <div className="animate-slide-up">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-label">Model Accuracy</div>
          <div className="stat-value">{stats.accuracy}%</div>
          <div className="stat-change">↑ +0.3% this week</div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon">📊</div>
          <div className="stat-label">F1 Score</div>
          <div className="stat-value green">{stats.f1}%</div>
          <div className="stat-change">↑ +0.5% this week</div>
        </div>
        <div className="stat-card orange">
          <div className="stat-icon">⚡</div>
          <div className="stat-label">Inference Latency</div>
          <div className="stat-value orange">{stats.latency}ms</div>
          <div className="stat-change" style={{ color: '#68d391' }}>↓ -2ms improved</div>
        </div>
        <div className="stat-card purple">
          <div className="stat-icon">🌊</div>
          <div className="stat-label">Drift Score</div>
          <div className="stat-value" style={{ background: 'linear-gradient(135deg, #9f7aea, #667eea)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{stats.drift}</div>
          <div className="stat-change">✓ Below threshold (0.15)</div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-title">
            <span>📈</span> Model Performance Over Time
            <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--text-muted)' }}>Live · updates every 3s</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="accGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#63b3ed" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#63b3ed" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="f1Grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#68d391" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#68d391" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,179,237,0.08)" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} interval={4} />
              <YAxis domain={[85, 100]} tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="accuracy" name="Accuracy" stroke="#63b3ed" fill="url(#accGrad)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="f1" name="F1 Score" stroke="#68d391" fill="url(#f1Grad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-title"><span>💚</span> System Health</div>
          <div className="health-grid">
            {healthItems.map((item, i) => (
              <div key={i} className="health-item">
                <span className="health-name">{item.name}</span>
                <span className={`health-badge ${item.status}`}>{item.status === 'healthy' ? '● Online' : '⚠ Warning'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Pipeline Tab ──────────────────────────────────────────────────────────────
function PipelineTab() {
  const yamlLines = [
    { type: 'comment', text: '# ml-app-repo/.github/workflows/main.yml' },
    { type: 'comment', text: '# Calls the shared-workflows-repo library' },
    { type: 'key', text: 'jobs:' },
    { type: 'key', text: '  test:', indent: 2 },
    { type: 'uses', text: '    uses: ORG/shared-workflows-repo/.github/workflows/run-tests.yml@main' },
    { type: 'key', text: '  docker-build:', indent: 2 },
    { type: 'key', text: '    needs: test' },
    { type: 'uses', text: '    uses: ORG/shared-workflows-repo/.github/workflows/docker-build.yml@main' },
    { type: 'key', text: '  security-scan:', indent: 2 },
    { type: 'key', text: '    needs: docker-build' },
    { type: 'uses', text: '    uses: ORG/shared-workflows-repo/.github/workflows/security-scan.yml@main' },
    { type: 'key', text: '  deploy-staging:', indent: 2 },
    { type: 'key', text: '    needs: security-scan' },
    { type: 'key', text: '    if: github.ref == \'refs/heads/develop\'' },
    { type: 'uses', text: '    uses: ORG/shared-workflows-repo/.github/workflows/deploy-k8s.yml@main' },
    { type: 'key', text: '    with:' },
    { type: 'value', text: '      environment: staging' },
    { type: 'key', text: '  deploy-production:', indent: 2 },
    { type: 'key', text: '    needs: security-scan' },
    { type: 'key', text: '    if: github.ref == \'refs/heads/main\'' },
    { type: 'comment', text: '    # ↑ Requires manual approval via GitHub Environments' },
    { type: 'uses', text: '    uses: ORG/shared-workflows-repo/.github/workflows/deploy-k8s.yml@main' },
    { type: 'key', text: '    with:' },
    { type: 'value', text: '      environment: production' },
  ];

  return (
    <div className="animate-slide-up">
      <div className="card">
        <div className="section-header">
          <div className="section-title">⚙️ Pipeline Stages</div>
          <span className="section-badge">Live Run #47</span>
        </div>
        <div className="pipeline-stages">
          {pipelineStages.map((stage) => (
            <div key={stage.id} className={`pipeline-stage ${stage.status}`}>
              <div className={`stage-icon ${stage.status}`}>{stage.icon}</div>
              <div className="stage-label">{stage.label}</div>
              <div className="stage-time">{stage.time}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div className="card" style={{ margin: 0 }}>
          <div className="section-header">
            <div className="section-title">📄 Workflow YAML</div>
            <span className="section-badge">main.yml</span>
          </div>
          <div className="yaml-viewer">
            {yamlLines.map((line, i) => (
              <div key={i} className={`yaml-${line.type}`}>
                {line.text}
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ margin: 0 }}>
          <div className="section-header">
            <div className="section-title">📚 Shared Workflow Library</div>
            <span className="section-badge">5 workflows</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {sharedWorkflows.map((wf, i) => (
              <div key={i} className="library-card" style={{ margin: 0 }}>
                <div className="library-card-header">
                  <span className="library-card-name">{wf.icon} {wf.name}</span>
                  <span className="usage-badge">{wf.uses} repos</span>
                </div>
                <div className="library-card-desc">{wf.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Inference Tab ─────────────────────────────────────────────────────────────
function InferenceTab() {
  const [selectedSample, setSelectedSample] = useState(0);
  const [formData, setFormData] = useState(sampleTransactions[0].data);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSampleChange = (idx) => {
    setSelectedSample(idx);
    setFormData(sampleTransactions[idx].data);
    setResult(null);
  };

  const simulatePredict = async () => {
    setLoading(true);
    setResult(null);
    await new Promise(r => setTimeout(r, 800 + Math.random() * 400));

    // Simulate model logic based on features
    const riskScore =
      (formData.amount / 10000) * 0.3 +
      (formData.distance_from_home / 1000) * 0.25 +
      (formData.num_transactions_24h / 20) * 0.2 +
      (formData.failed_attempts_24h / 5) * 0.15 +
      (formData.is_international) * 0.1;

    const prob = Math.min(0.99, Math.max(0.01, riskScore + (Math.random() - 0.5) * 0.05));
    const isFraud = prob > 0.5;
    const riskLevel = prob >= 0.8 ? 'CRITICAL' : prob >= 0.6 ? 'HIGH' : prob >= 0.4 ? 'MEDIUM' : prob >= 0.2 ? 'LOW' : 'MINIMAL';
    const latency = (1.2 + Math.random() * 2.8).toFixed(1);

    setResult({ isFraud, prob: prob.toFixed(4), riskLevel, latency, modelVersion: 'v5' });
    setLoading(false);
  };

  const riskColors = { MINIMAL: '#68d391', LOW: '#4fd1c5', MEDIUM: '#f6ad55', HIGH: '#fc8181', CRITICAL: '#ff4444' };

  return (
    <div className="animate-slide-up">
      <div className="inference-grid">
        <div className="card" style={{ margin: 0 }}>
          <div className="section-header">
            <div className="section-title">🔍 Live Inference Demo</div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            {sampleTransactions.map((s, i) => (
              <button
                key={i}
                onClick={() => handleSampleChange(i)}
                style={{
                  padding: '6px 14px', borderRadius: 8, border: `1px solid ${selectedSample === i ? 'var(--accent-blue)' : 'var(--border)'}`,
                  background: selectedSample === i ? 'rgba(99,179,237,0.15)' : 'var(--bg-secondary)',
                  color: selectedSample === i ? 'var(--accent-blue)' : 'var(--text-secondary)',
                  fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.2s'
                }}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="form-grid">
            {Object.entries(formData).map(([key, val]) => (
              <div key={key} className="form-group">
                <label className="form-label">{key.replace(/_/g, ' ')}</label>
                <input
                  className="form-input"
                  type="number"
                  value={val}
                  onChange={e => setFormData(prev => ({ ...prev, [key]: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            ))}
          </div>

          <button className="predict-btn" onClick={simulatePredict} disabled={loading}>
            {loading ? <><span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span> Analyzing...</> : '⚡ Predict Fraud Risk'}
          </button>
        </div>

        <div className="card" style={{ margin: 0 }}>
          <div className="section-title" style={{ marginBottom: '1.5rem' }}>📊 Prediction Result</div>
          {!result ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', color: 'var(--text-muted)', gap: '1rem' }}>
              <div style={{ fontSize: '3rem', opacity: 0.3 }}>🎯</div>
              <p style={{ fontSize: '0.85rem' }}>Submit a transaction to see the prediction</p>
            </div>
          ) : (
            <div>
              <div className="risk-gauge">
                <div className={`gauge-circle ${result.riskLevel.toLowerCase()}`}>
                  <div className="gauge-prob" style={{ color: riskColors[result.riskLevel] }}>
                    {(parseFloat(result.prob) * 100).toFixed(1)}%
                  </div>
                  <div className="gauge-label">fraud probability</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: riskColors[result.riskLevel] }}>
                    {result.isFraud ? '🚨 FRAUD DETECTED' : '✅ LEGITIMATE'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    Risk Level: <strong style={{ color: riskColors[result.riskLevel] }}>{result.riskLevel}</strong>
                  </div>
                </div>
              </div>
              <div className="result-details">
                <div className="result-row">
                  <span className="result-key">Fraud Probability</span>
                  <span className="result-val" style={{ color: riskColors[result.riskLevel] }}>{result.prob}</span>
                </div>
                <div className="result-row">
                  <span className="result-key">Risk Level</span>
                  <span className="result-val" style={{ color: riskColors[result.riskLevel] }}>{result.riskLevel}</span>
                </div>
                <div className="result-row">
                  <span className="result-key">Inference Latency</span>
                  <span className="result-val" style={{ color: 'var(--accent-cyan)' }}>{result.latency}ms</span>
                </div>
                <div className="result-row">
                  <span className="result-key">Model Version</span>
                  <span className="result-val" style={{ color: 'var(--accent-purple)' }}>{result.modelVersion}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── History Tab ───────────────────────────────────────────────────────────────
function HistoryTab() {
  return (
    <div className="animate-slide-up">
      <div className="card">
        <div className="section-header">
          <div className="section-title">📋 Deployment History</div>
          <span className="section-badge">{deploymentHistory.length} deployments</span>
        </div>
        <table className="history-table">
          <thead>
            <tr>
              <th>Commit SHA</th>
              <th>Branch</th>
              <th>Environment</th>
              <th>Trigger</th>
              <th>Status</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {deploymentHistory.map((d, i) => (
              <tr key={i}>
                <td><span className="sha-badge">{d.sha}</span></td>
                <td style={{ color: d.branch === 'main' ? 'var(--accent-purple)' : 'var(--accent-cyan)' }}>{d.branch}</td>
                <td style={{ color: d.env === 'production' ? 'var(--accent-orange)' : 'var(--accent-blue)' }}>{d.env}</td>
                <td>{d.trigger}</td>
                <td>
                  <span className={`status-pill ${d.status}`}>
                    {d.status === 'success' ? '✓' : d.status === 'failed' ? '✗' : '⟳'} {d.status}
                  </span>
                </td>
                <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem' }}>{d.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <div className="section-header">
          <div className="section-title">🧪 MLflow Model Registry</div>
          <span className="section-badge">fraud-detection-model</span>
        </div>
        <table className="registry-table">
          <thead>
            <tr>
              <th>Version</th>
              <th>Accuracy</th>
              <th>F1 Score</th>
              <th>ROC AUC</th>
              <th>Stage</th>
              <th>Registered</th>
            </tr>
          </thead>
          <tbody>
            {mlflowModels.map((m, i) => (
              <tr key={i}>
                <td style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--accent-blue)', fontWeight: 600 }}>{m.version}</td>
                <td style={{ color: 'var(--accent-green)' }}>{m.accuracy}</td>
                <td style={{ color: 'var(--accent-cyan)' }}>{m.f1}</td>
                <td style={{ color: 'var(--accent-purple)' }}>{m.auc}</td>
                <td><span className={`stage-tag ${m.stage.toLowerCase()}`}>{m.stage}</span></td>
                <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem' }}>{m.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({ accuracy: 95.2, f1: 91.8, latency: 4.3, drift: 0.08 });

  // Live stats update every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        accuracy: parseFloat((prev.accuracy + (Math.random() - 0.5) * 0.1).toFixed(1)),
        f1: parseFloat((prev.f1 + (Math.random() - 0.5) * 0.15).toFixed(1)),
        latency: parseFloat((prev.latency + (Math.random() - 0.5) * 0.5).toFixed(1)),
        drift: parseFloat(Math.max(0.01, Math.min(0.14, prev.drift + (Math.random() - 0.5) * 0.005)).toFixed(3)),
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'pipeline', label: 'Pipeline', icon: '⚙️' },
    { id: 'inference', label: 'Inference Demo', icon: '🔍' },
    { id: 'history', label: 'History', icon: '📋' },
  ];

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <div className="logo-icon">⚡</div>
            <div>
              <div className="logo-text">MLOps CI/CD Pipeline</div>
              <span className="logo-sub">Fraud Detection · GitHub Actions Shared Library</span>
            </div>
          </div>

          <nav className="nav-tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="header-status">
            <div className="status-dot" />
            Pipeline Running
          </div>
        </div>
      </header>

      <main className="main-content">
        {activeTab === 'overview' && <OverviewTab stats={stats} />}
        {activeTab === 'pipeline' && <PipelineTab />}
        {activeTab === 'inference' && <InferenceTab />}
        {activeTab === 'history' && <HistoryTab />}
      </main>
    </div>
  );
}

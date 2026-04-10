import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Network, FlaskConical, FolderKanban, FileText, Key, Database, Map } from 'lucide-react';
import { useApp } from '../../context/AppContext.jsx';

const AGENT_TIERS = [
  {
    tier: 1, label: 'Transaction / Event',
    agents: [
      { id: 'transaction', label: 'Transaction Surveillance', path: '/agents/transaction' },
      { id: 'digital',     label: 'Digital Fraud & Identity', path: '/agents/digital' },
      { id: 'mje',         label: 'MJE Testing',              path: '/agents/mje' },
    ]
  },
  {
    tier: 2, label: 'Account / Position',
    agents: [
      { id: 'credit',   label: 'Credit Intelligence',       path: '/agents/credit' },
      { id: 'suspense', label: 'Suspense & Reconciliation', path: '/agents/suspense' },
      { id: 'trade',    label: 'Trade Finance & Treasury',  path: '/agents/trade' },
    ]
  },
  {
    tier: 3, label: 'Entity / Behavioural',
    agents: [
      { id: 'kyc',      label: 'Identity & KYC / AML', path: '/agents/kyc' },
      { id: 'controls', label: 'Internal Controls',     path: '/agents/controls' },
      { id: 'insider',  label: 'Insider Risk',          path: '/agents/insider-risk' },
    ]
  },
];
const agents = AGENT_TIERS.flatMap(t => t.agents);

function AgentDot({ agentId }) {
  const { state } = useApp();
  const result = state.agentResults[agentId];
  const loading = state.agentLoading[agentId];
  if (loading) return <span className="dot dot-amber dot-pulse" />;
  if (!result) return <span className="dot dot-gray" />;
  const criticals = result.key_findings?.filter(f => f.severity === 'critical').length || 0;
  if (criticals > 0) return <span className="dot dot-red dot-pulse" />;
  return <span className="dot dot-amber" />;
}

export default function Sidebar() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo" onClick={() => navigate('/command-centre')} style={{ cursor: 'pointer' }}>
        <div className="sidebar-logo-title">Sentinel <span style={{ color: 'var(--color-text-3)', fontWeight: 400 }}>by Octave</span></div>
        <div className="sidebar-logo-sub">NTB Audit Intelligence · FY 2025</div>
      </div>

      <div className="sidebar-section">
        <NavLink to="/command-centre" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={15} className="sidebar-item-icon" />
          Command Centre
        </NavLink>
        <NavLink to="/agents" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
          <Network size={15} className="sidebar-item-icon" />
          Agent Network
        </NavLink>
        <NavLink to="/heatmap" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
          <Map size={15} className="sidebar-item-icon" />
          Risk Heatmap
        </NavLink>
        <NavLink to="/risk-register" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
          <FileText size={15} className="sidebar-item-icon" />
          Risk Register
        </NavLink>
      </div>

      <div className="sidebar-divider" />

      <div className="sidebar-section">
        <div className="sidebar-label">Domain Agents · 9 Total</div>
        {AGENT_TIERS.map(tier => (
          <div key={tier.tier}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--color-text-3)', padding: '6px 12px 2px', opacity: 0.7 }}>
              L{tier.tier} · {tier.label}
            </div>
            {tier.agents.map(agent => (
              <NavLink key={agent.id} to={agent.path} className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
                <AgentDot agentId={agent.id} />
                <span style={{ fontSize: 12 }}>{agent.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </div>

      <div className="sidebar-divider" />

      <div className="sidebar-section">
        <NavLink to="/data" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
          <Database size={15} className="sidebar-item-icon" />
          Data Hub
        </NavLink>
        <NavLink to="/scenarios" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
          <FlaskConical size={15} className="sidebar-item-icon" />
          Scenario Lab
        </NavLink>
        <NavLink to="/cases" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
          <FolderKanban size={15} className="sidebar-item-icon" />
          Case Manager
          {state.cases.length > 0 && (
            <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, background: 'var(--color-red-light)', color: 'var(--color-red)', borderRadius: 10, padding: '1px 6px' }}>
              {state.cases.filter(c => c.status === 'open').length}
            </span>
          )}
        </NavLink>
        <NavLink to="/reports" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
          <FileText size={15} className="sidebar-item-icon" />
          Reports
        </NavLink>
      </div>

      <div className="sidebar-footer">
        <div
          className="sidebar-api-indicator"
          onClick={() => dispatch({ type: 'TOGGLE_SETTINGS' })}
        >
          <Key size={13} />
          <span style={{ flex: 1 }}>
            {state.apiKeyStatus === 'valid' ? 'API Key Connected' : 'Configure API Key'}
          </span>
          <span className={`dot ${state.apiKeyStatus === 'valid' ? 'dot-green' : 'dot-gray'}`} />
        </div>
        <div style={{ fontSize: 10, color: 'var(--color-text-3)', marginTop: 8, paddingLeft: 8 }}>
          LKR 700.3 Bn AUM · 90 Branches · 9 Agents
        </div>
      </div>
    </aside>
  );
}

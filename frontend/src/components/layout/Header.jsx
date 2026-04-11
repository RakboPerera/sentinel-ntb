import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Key, Bell, ChevronRight, Monitor, Presentation } from 'lucide-react';
import { useApp } from '../../context/AppContext.jsx';

const ROUTE_LABELS = {
  '/command-centre': 'Command Centre',
  '/data': 'Data Hub',
  '/agents': 'Agent Network',
  '/agents/credit': 'Credit Intelligence',
  '/agents/transaction': 'Transaction Surveillance',
  '/agents/suspense': 'Suspense & Reconciliation',
  '/agents/kyc': 'Identity & KYC / AML',
  '/agents/controls': 'Internal Controls',
  '/agents/digital': 'Digital Fraud & Identity',
  '/agents/trade': 'Trade Finance & Treasury',
  '/agents/insider-risk': 'Insider Risk',
  '/agents/mje': 'MJE Testing',
  '/heatmap': 'Risk Heatmap',
  '/risk-register': 'Risk Register',
  '/scenarios': 'Scenario Lab',
  '/cases': 'Case Manager',
  '/reports': 'Reports',
};

export default function Header() {
  const { state, dispatch } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const label = ROUTE_LABELS[location.pathname] || 'Sentinel';
  const isAgent = location.pathname.startsWith('/agents/');
  const criticalCases = state.cases.filter(c => c.status === 'open' && c.severity === 'critical').length;

  return (
    <header className="header">
      <div className="header-breadcrumb">
        <span style={{ cursor:'pointer', opacity:0.6 }} onClick={() => navigate('/command-centre')}>Sentinel</span>
        <ChevronRight size={13} style={{ opacity:0.4 }} />
        <span className="header-breadcrumb-current">{label}</span>
        {isAgent && (
          <>
            <ChevronRight size={13} style={{ opacity:0.4 }} />
            <span style={{ fontSize:12, color:'var(--color-text-3)' }}>
              {state.activeMode[location.pathname.split('/').pop()] === 'live' ? '⚡ Live Analysis' : '◎ Demo Data'}
            </span>
          </>
        )}
      </div>

      <div className="header-actions">
        {/* Presentation ↔ Platform toggle */}
        <div style={{ display:'flex', background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:20, padding:3, gap:2 }}>
          <button
            style={{ padding:'5px 13px', borderRadius:16, fontSize:12, fontWeight:500, cursor:'pointer', background:'rgba(255,255,255,0.14)', color:'rgba(255,255,255,0.90)', border:'none', boxShadow:'none', display:'flex', alignItems:'center', gap:5 }}
            title="You are in the platform"
          >
            <Monitor size={12} style={{ color:'var(--octave-turquoise)' }}/>
            Platform
          </button>
          <button
            onClick={() => navigate('/')}
            style={{ padding:'5px 13px', borderRadius:16, fontSize:12, fontWeight:500, cursor:'pointer', background:'none', color:'rgba(255,255,255,0.40)', border:'none', display:'flex', alignItems:'center', gap:5, transition:'all 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.07)'}
            onMouseLeave={e => e.currentTarget.style.background='transparent'}
            title="Switch to presentation view"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="m7 21 5-5 5 5"/></svg>
            Presentation
          </button>
        </div>

        <div className="header-badge">
          <span className="dot dot-green" />
          NTB · FY 2025 · 31 Dec
        </div>

        {criticalCases > 0 && (
          <div
            className="header-badge"
            style={{ background:'var(--color-red-light)', color:'var(--color-red)', borderColor:'rgba(163,45,45,0.2)', cursor:'pointer' }}
            onClick={() => navigate('/cases')}
          >
            <Bell size={12} />
            {criticalCases} Critical
          </div>
        )}

        <button
          className={`header-key-btn ${state.apiKeyStatus === 'valid' ? 'connected' : ''}`}
          onClick={() => dispatch({ type:'TOGGLE_SETTINGS' })}
        >
          <Key size={13} />
          {state.apiKeyStatus === 'valid' ? 'Connected' : 'API Key'}
        </button>
      </div>
    </header>
  );
}

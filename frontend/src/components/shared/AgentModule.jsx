import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';
import SchemaUploader from './SchemaUploader.jsx';
import OrchestratorPanel from './OrchestratorPanel.jsx';
import axios from 'axios';
import { Database, ChevronRight, RefreshCw } from 'lucide-react';

// Ensures agent data from Claude never crashes on missing arrays
function normalizeData(data) {
  if (!data) return data;
  const arrayFields = [
    'key_findings','orchestrator_signals','flagged_loans','vintage_analysis',
    'sector_concentration','branch_concentration','flagged_accounts','growth_anomalies',
    'structuring_clusters','velocity_anomalies','str_queue','network_anomalies',
    'kyc_gaps','pep_findings','beneficial_ownership_gaps','introducer_concentration',
    'branch_compliance_heatmap','str_assessments','sod_violations','branch_risk_scores',
    'flagged_approvers','temporal_anomalies','anomalous_sessions','impossible_travel_cases',
    'device_sharing_clusters','pricing_anomalies','duplicate_lc_cases','treasury_breaches',
    'correlations','priority_actions','systemic_patterns',
  ];
  const out = { ...data };
  arrayFields.forEach(f => { if (!Array.isArray(out[f])) out[f] = out[f] ? [out[f]] : []; });
  return out;
}


export function ModeToggle({ agentId }) {
  const { state, dispatch } = useApp();
  const mode = state.activeMode[agentId] || 'demo';
  return (
    <div className="mode-toggle">
      <button className={`mode-btn ${mode === 'demo' ? 'active' : ''}`} onClick={() => dispatch({ type: 'SET_MODE', agentId, payload: 'demo' })}>
        Demo data
      </button>
      <button className={`mode-btn live ${mode === 'live' ? 'active' : ''}`} onClick={() => dispatch({ type: 'SET_MODE', agentId, payload: 'live' })}>
        ⚡ Live analysis
      </button>
    </div>
  );
}

export function AgentStat({ label, value, sub, color }) {
  return (
    <div style={{ padding: '12px 0', borderBottom: '1px solid var(--color-border)' }}>
      <div style={{ fontSize: 11, color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: color || 'var(--color-text)', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--color-text-2)', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

export function SeverityBadge({ severity }) {
  const map = {
    critical: { bg: 'var(--octave-pink-light)', color: 'var(--octave-pink)', label: 'Critical' },
    high: { bg: '#E8FDF4', color: '#3A5A3A', label: 'High' },
    medium: { bg: 'var(--color-blue-light)', color: 'var(--color-blue)', label: 'Medium' },
    low: { bg: 'var(--color-gray-light)', color: 'var(--color-gray)', label: 'Low' },
  };
  const s = map[severity] || map.medium;
  return (
    <span className="badge" style={{ background: s.bg, color: s.color, border: `1px solid ${s.color}22` }}>{s.label}</span>
  );
}

export function KeyFindingCard({ finding }) {
  const isCrit = finding.severity === 'critical';
  return (
    <div style={{ background: isCrit ? 'var(--color-red-light)' : finding.severity === 'high' ? '#FFF8F0' : 'var(--color-surface-2)', border: `1px solid ${isCrit ? 'rgba(163,45,45,0.2)' : 'var(--color-border)'}`, borderRadius: 10, padding: '14px 16px', marginBottom: 10 }}>
      <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
        <SeverityBadge severity={finding.severity} />
        {(finding.affected_exposure_lkr > 0 || finding.affected_balance_lkr > 0) && (
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-2)' }}>
            LKR {((finding.affected_exposure_lkr || finding.affected_balance_lkr) / 1e9).toFixed(2)} Bn
          </span>
        )}
      </div>
      <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--color-text)', marginBottom: 8 }}>{finding.finding}</p>
      <p style={{ fontSize: 12, color: 'var(--color-text-2)', fontStyle: 'italic' }}>→ {finding.recommended_action}</p>
    </div>
  );
}

export default function AgentModule({ agentId, agentName, agentColor, demoData, schema, children }) {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const mode = state.activeMode[agentId] || 'demo';
  const isLive = mode === 'live';

  // Pre-loaded data from DataHub
  const hubData = state.uploadedData[agentId];
  const agentResult = state.agentResults[agentId];
  const loading = state.agentLoading[agentId];
  const error = state.agentErrors[agentId];

  // What to show: demo data OR live result
  const displayData = isLive ? agentResult : demoData;

  async function runAgent(rows) {
    if (!state.apiKey) { dispatch({ type: 'TOGGLE_SETTINGS' }); return; }
    dispatch({ type: 'AGENT_LOADING', agentId });
    try {
      const res = await axios.post(`/api/agent/${agentId}`, { data: rows }, {
        headers: { 'x-api-key': state.apiKey },
        timeout: 120000,
      });
      dispatch({ type: 'AGENT_SUCCESS', agentId, payload: res.data.result });
      // Auto-trigger orchestrator if 2+ agents have results
      const allResults = { ...state.agentResults, [agentId]: res.data.result };
      if (Object.keys(allResults).length >= 2) {
        runOrchestrator(allResults);
      }
    } catch (err) {
      dispatch({ type: 'AGENT_ERROR', agentId, payload: err.response?.data?.error || err.message });
    }
  }

  async function runOrchestrator(allResults) {
    dispatch({ type: 'ORCHESTRATOR_LOADING' });
    try {
      const agentIds = Object.keys(allResults);
      const signals = agentIds.flatMap(id => (allResults[id]?.orchestrator_signals || []).map(s => ({ ...s, source_agent: id })));
      const summaries = {};
      agentIds.forEach(id => { summaries[id] = allResults[id]?.key_findings?.[0]?.finding || ''; });
      const res = await axios.post('/api/orchestrate', { signals, agentSummaries: summaries }, {
        headers: { 'x-api-key': state.apiKey },
        timeout: 60000,
      });
      dispatch({ type: 'ORCHESTRATOR_SUCCESS', payload: res.data.result });
    } catch { dispatch({ type: 'ORCHESTRATOR_ERROR' }); }
  }

  return (
    <div className="agent-page">
      {/* Header */}
      <div className="agent-header">
        <div className="agent-title-row">
          <div className="agent-icon" style={{ background: `${agentColor}18`, color: agentColor, fontSize: 18 }}>◎</div>
          <div>
            <div className="agent-name">{agentName}</div>
            <div className="agent-tagline">
              {isLive
                ? agentResult ? `Live analysis · ${new Date().toLocaleString('en-GB', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}` : hubData ? `${hubData.rows.length} rows from Data Hub — ready to run` : 'Ready for live data'
                : 'Simulated NTB portfolio data · FY 2025'
              }
            </div>
          </div>
        </div>
        <ModeToggle agentId={agentId} />
      </div>

      {/* Live mode panels */}
      {isLive && (
        <>
          {/* Pre-loaded from DataHub */}
          {hubData && !agentResult && !loading && (
            <div style={{ padding: '16px 20px', background: `${agentColor}08`, border: `1px solid ${agentColor}33`, borderRadius: 12, display: 'flex', gap: 14, alignItems: 'center' }}>
              <Database size={20} style={{ color: agentColor, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2, color: 'var(--color-text)' }}>
                  {hubData.filename} loaded from Data Hub
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-text-2)' }}>
                  {hubData.rows.length} rows ready · Uploaded {new Date(hubData.uploadedAt).toLocaleString('en-GB', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => navigate('/data')}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: 5 }}
                >
                  <RefreshCw size={12} /> Replace
                </button>
                <button
                  onClick={() => runAgent(hubData.rows)}
                  disabled={!state.apiKey}
                  style={{ padding: '8px 18px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: state.apiKey ? 'pointer' : 'not-allowed', background: state.apiKey ? agentColor : 'var(--color-text-3)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.15s', boxShadow: state.apiKey ? `0 4px 12px ${agentColor}44` : 'none' }}
                  title={!state.apiKey ? 'Configure your Anthropic API key first' : undefined}
                >
                  ⚡ Run Agent Analysis
                </button>
              </div>
            </div>
          )}

          {/* No data — show uploader */}
          {!hubData && !agentResult && !loading && (
            <div className="agent-panel">
              <div className="agent-panel-header">
                <span className="agent-panel-title">Upload data for live analysis</span>
                <button onClick={() => navigate('/data')} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Database size={12} /> Go to Data Hub <ChevronRight size={12} />
                </button>
              </div>
              <div className="agent-panel-body">
                <SchemaUploader schema={schema} onSubmit={runAgent} loading={loading} error={error} agentColor={agentColor} />
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 24, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12 }}>
              <div className="spinner" style={{ width: 24, height: 24, flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>Agent running analysis…</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-2)' }}>Claude is reviewing your data against the {agentName} detection framework. This typically takes 30–90 seconds.</div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div style={{ padding: 16, background: 'var(--color-red-light)', border: '1px solid rgba(163,45,45,0.2)', borderRadius: 10, color: 'var(--color-red)', fontSize: 13, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ flexShrink: 0, fontSize: 16 }}>⚠</span>
              <div>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>Analysis failed</div>
                {error}
              </div>
            </div>
          )}
        </>
      )}

      {/* Results */}
      {(!isLive || (isLive && displayData && !loading)) && displayData && (
        <>
          {isLive && agentResult && (
            <div style={{ padding: '10px 16px', background: 'var(--color-green-light)', border: '1px solid rgba(59,109,17,0.2)', borderRadius: 8, fontSize: 13, color: 'var(--color-green)', display: 'flex', gap: 8, alignItems: 'center' }}>
              ✓ <strong>Live analysis complete</strong> — {agentResult.key_findings?.length || 0} findings from {hubData?.rows.length || '?'} records
              <button onClick={() => { dispatch({ type: 'CLEAR_UPLOAD', agentId }); dispatch({ type: 'AGENT_ERROR', agentId, payload: null }); }} style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--color-green)', cursor: 'pointer', background: 'none', border: 'none', textDecoration: 'underline' }}>
                Clear & upload new file
              </button>
            </div>
          )}
          {typeof children === 'function' ? children(normalizeData(displayData)) : children}
          {displayData.orchestrator_signals?.length > 0 && (
            <OrchestratorPanel signals={displayData.orchestrator_signals} agentColor={agentColor} />
          )}
        </>
      )}
    </div>
  );
}

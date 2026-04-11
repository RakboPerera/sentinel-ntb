import React from 'react';
import { GitMerge, AlertTriangle } from 'lucide-react';
import { useApp } from '../../context/AppContext.jsx';

export default function OrchestratorPanel({ signals, agentColor }) {
  const { state } = useApp();
  const orchResult = state.orchestratorResult;

  return (
    <div className="agent-panel" style={{ borderColor: '#F0F0EE' }}>
      <div className="agent-panel-header" style={{ background: '#F0F0EE' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <GitMerge size={15} style={{ color: 'var(--color-text-2)' }} />
          <span className="agent-panel-title" style={{ color: 'var(--color-text-2)' }}>Orchestrator Signals</span>
        </div>
        <span style={{ fontSize: 11, color: 'var(--color-text-2)', fontWeight: 500 }}>
          {signals.length} signal{signals.length !== 1 ? 's' : ''} sent to peer agents
        </span>
      </div>
      <div className="agent-panel-body">
        <p style={{ fontSize: 12, color: 'var(--color-text-2)', marginBottom: 14, lineHeight: 1.6 }}>
          These signals are automatically shared with other agents in the ecosystem. When two or more agents flag the same entity, the Orchestrator generates a cross-domain correlation.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {signals.map((sig, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 14px', background: 'var(--color-surface-2)', borderRadius: 8, border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 6, background: sig.severity === 'critical' ? 'var(--color-red-light)' : '#E8FDF4', flexShrink: 0 }}>
                <AlertTriangle size={13} style={{ color: sig.severity === 'critical' ? 'var(--color-red)' : '#3A5A3A' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-3)' }}>→ {sig.target_agent} agent</span>
                  <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 4, background: sig.severity === 'critical' ? 'var(--color-red-light)' : '#E8FDF4', color: sig.severity === 'critical' ? 'var(--color-red)' : '#3A5A3A' }}>{sig.severity}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-text)', lineHeight: 1.5 }}>{sig.description}</div>
                <div style={{ fontSize: 11, color: 'var(--color-text-3)', marginTop: 3 }}>Entity: <code style={{ fontSize: 11 }}>{sig.shared_entity_id}</code></div>
              </div>
            </div>
          ))}
        </div>

        {orchResult && orchResult.correlations && (
          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-2)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <GitMerge size={14} /> Active Cross-Agent Correlations
            </div>
            {orchResult.correlations.map((corr, i) => (
              <div key={i} style={{ padding: '14px 16px', background: 'linear-gradient(135deg, var(--color-purple-light) 0%, var(--color-red-light) 100%)', border: '1px solid rgba(83,74,183,0.2)', borderRadius: 10, marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-2)' }}>Severity {(corr.combined_severity * 100).toFixed(0)}%</span>
                  <span style={{ fontSize: 11, color: 'var(--color-text-2)' }}>{corr.agents_involved.join(' · ')}</span>
                  {corr.case_worthy && <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', background: 'var(--color-red)', color: 'white', borderRadius: 4 }}>CASE</span>}
                </div>
                <div style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--color-text)', marginBottom: 8 }}>{corr.narrative}</div>
                <div style={{ fontSize: 11, color: 'var(--color-text-2)', fontStyle: 'italic' }}>→ {corr.recommended_action}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

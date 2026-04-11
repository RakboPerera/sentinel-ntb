import React, { useState } from 'react';
import AgentModule from '../../components/shared/AgentModule.jsx';
import { VisualFindingCard } from '../../components/shared/VisualComponents.jsx';
import { KPICard, ProgressBar, DataRow, OpinionBanner, AgentHeader, ChartPanel, SeverityPill, EmptyState } from '../../components/shared/AgentUI.jsx';
import useOpenFinding from '../../hooks/useOpenFinding.js';
import { demoData } from '../../data/demoData.js';

const COLOR = '#993556';

function ScoreArc({ score, size = 80 }) {
  const pct = Math.min(100, Math.max(0, score));
  const c = pct >= 80 ? '#C41E3A' : pct >= 50 ? '#4A6070' : '#0BBF7A';
  const r = (size / 2) - 8;
  const circ = Math.PI * r; // half circle
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size / 2 + 10} viewBox={`0 0 ${size} ${size / 2 + 10}`}>
      <path d={`M 8 ${size/2} A ${r} ${r} 0 0 1 ${size-8} ${size/2}`} fill="none" stroke="var(--color-border)" strokeWidth={7} strokeLinecap="round" />
      <path d={`M 8 ${size/2} A ${r} ${r} 0 0 1 ${size-8} ${size/2}`} fill="none" stroke={c} strokeWidth={7} strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={offset} />
      <text x={size/2} y={size/2 - 2} textAnchor="middle" fontSize={14} fontWeight={900} fill={c} fontFamily="var(--font-display)">{pct}</text>
    </svg>
  );
}

export default function DigitalFraudAgent() {
  const [expanded, setExpanded] = useState(null);
  const openFinding = useOpenFinding('digital');

  return (
    <AgentModule agentId="digital" agentName="Digital Fraud & Identity Agent" agentColor={COLOR} demoData={demoData.digital} schema={[]}>
      {(data) => {
        const ds = data.digital_summary || {};
        const sessions = data.anomalous_sessions || [];
        const travel = data.impossible_travel_cases || [];
        const devices = data.device_sharing_clusters || [];
        const ps = data.population_shift || {};

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            <AgentHeader
              name="Digital Fraud & Identity Agent"
              icon="⊕"
              color={COLOR}
              tagline="Behavioral biometrics against 14-month session baseline — geographic velocity, device fingerprinting, and transaction pattern analysis"
              stats={[
                { label: 'Sessions analysed', value: (ds.total_sessions_analyzed || 148247).toLocaleString() },
                { label: 'Anomalous', value: ds.anomalous_sessions || 14, alert: true },
                { label: 'Critical', value: ds.critical_sessions || 4, alert: true },
                { label: 'Impossible travel', value: ds.impossible_travel_cases || 2, alert: true },
                { label: 'PSI score', value: (ps.psi_score || 0.14).toFixed(2), alert: (ps.psi_score || 0.14) > 0.1 },
              ]}
            />

            <OpinionBanner
              verdict="QUALIFIED"
              color={COLOR}
              opinion="In our opinion, the digital fraud detection environment is PARTIALLY EFFECTIVE. 4 high-risk sessions detected. Impossible travel confirmed in 2 cases. PSI of 0.14 indicates model drift — recalibration required before HSBC migration."
              methodology={{
                'Population tested': '148,247 authenticated sessions — 100%',
                'Period covered': 'FY 2025 (Jan–Dec)',
                'Materiality threshold': 'Behavioral score <50; impossible travel within same day',
                'Model limitations': 'Baseline requires 90 days; HSBC migrated accounts have reduced confidence',
              }}
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
              <KPICard label="Critical sessions" value={ds.critical_sessions || 4} sub="Score < 30/100" color="#C41E3A" icon="⊕" />
              <KPICard label="Impossible travel" value={ds.impossible_travel_cases || 2} sub="Geographic impossibility" color="#C41E3A" />
              <KPICard label="Unregistered device" value={ds.unregistered_device_high_value || 3} sub="High-value txn on unknown device" color="#4A6070" />
              <KPICard label="PSI model drift" value={(ps.psi_score || 0.14).toFixed(2)} sub={ps.psi_score > 0.1 ? '⚠ Recalibration needed' : 'Stable'} color={ps.psi_score > 0.1 ? '#C41E3A' : '#0BBF7A'} delta={ps.psi_score > 0.1 ? 1 : 0} deltaLabel=" drift detected" />
            </div>

            <ChartPanel title="Key Findings">
              {(data.key_findings || []).map((f, i) => (
                <VisualFindingCard key={i} finding={f} agentColor={COLOR} index={i} agentId="digital" agentData={data} openFinding={openFinding} />
              ))}
            </ChartPanel>

            {/* Sessions */}
            <ChartPanel title={`Anomalous Sessions (${sessions.length})`} subtitle="Click any session to expand explanation" noPad>
              {sessions.length === 0 && <EmptyState icon="⊕" title="No anomalous sessions" sub="All sessions within normal parameters." />}
              {sessions.map((sess, i) => (
                <div key={i}>
                  <div onClick={() => setExpanded(expanded === i ? null : i)}
                    style={{ padding: '12px 16px', borderBottom: expanded === i ? 'none' : '1px solid var(--color-border)', cursor: 'pointer', background: expanded === i ? 'var(--color-surface-2)' : i % 2 === 0 ? 'white' : 'var(--color-surface-2)', transition: 'background 0.1s' }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <ScoreArc score={sess.behavioral_score || 0} size={70} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                          <code style={{ fontSize: 12, fontWeight: 700 }}>{sess.account_id}</code>
                          <SeverityPill level={sess.risk_score >= 0.85 ? 'critical' : sess.risk_score >= 0.6 ? 'high' : 'medium'} />
                          {!sess.device_registered && <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', background: 'var(--color-surface-2)', color: '#4A6070', borderRadius: 4, border: '1px solid var(--color-border)' }}>UNREGISTERED DEVICE</span>}
                          {sess.impossible_travel && <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', background: '#FCEEF1', color: '#C41E3A', borderRadius: 4 }}>IMPOSSIBLE TRAVEL</span>}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--color-text-2)' }}>{sess.anomaly_type}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        {sess.max_txn_lkr > 0 && <div style={{ fontSize: 13, fontWeight: 800, color: '#C41E3A', fontFamily: 'var(--font-display)' }}>LKR {((sess.max_txn_lkr || 0) / 1e6).toFixed(1)}M</div>}
                        <div style={{ fontSize: 10, color: 'var(--color-text-3)', marginTop: 2 }}>{expanded === i ? '▲ Collapse' : '▼ Expand'}</div>
                      </div>
                    </div>
                  </div>
                  {expanded === i && (
                    <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface-2)' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 12 }}>
                        {[
                          { label: 'MFA result', val: sess.mfa_triggered ? (sess.mfa_passed ? '✓ Passed' : '✗ Failed') : 'Not triggered' },
                          { label: 'Device', val: sess.device_registered ? '✓ Registered' : '✗ Unregistered' },
                          { label: 'Behavioral score', val: `${sess.behavioral_score || 0}/100` },
                        ].map((m, j) => (
                          <div key={j} style={{ padding: '10px 12px', background: 'var(--color-surface)', borderRadius: 8, border: '1px solid var(--color-border)' }}>
                            <div style={{ fontSize: 10, color: 'var(--color-text-3)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.label}</div>
                            <div style={{ fontSize: 13, fontWeight: 700 }}>{m.val}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-2)', lineHeight: 1.65, padding: '10px 14px', background: 'var(--color-surface)', borderRadius: 8, marginBottom: 8 }}>{sess.explanation}</div>
                      {sess.recommended_action && <div style={{ fontSize: 12, fontWeight: 600, color: '#C41E3A' }}>→ {sess.recommended_action}</div>}
                    </div>
                  )}
                </div>
              ))}
            </ChartPanel>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {/* Impossible travel */}
              <ChartPanel title={`Impossible Travel Cases (${travel.length})`} noPad>
                {travel.length === 0 && <EmptyState icon="✈" title="No impossible travel" />}
                {(travel||[]).map((t, i) => (
                  <div key={i} style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
                      <code style={{ fontSize: 12, fontWeight: 700 }}>{t.account_id}</code>
                      <span style={{ fontSize: 11, color: 'var(--color-text-2)' }}>{t.from_city} → {t.to_city}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <div style={{ padding: '10px', background: '#FCEEF1', borderRadius: 8, textAlign: 'center', border: '1px solid rgba(196,30,58,0.2)' }}>
                        <div style={{ fontSize: 20, fontWeight: 900, color: '#C41E3A', fontFamily: 'var(--font-display)' }}>{t.time_elapsed_minutes}min</div>
                        <div style={{ fontSize: 10, color: '#C41E3A', textTransform: 'uppercase' }}>Elapsed time</div>
                      </div>
                      <div style={{ padding: '10px', background: '#E8FDF4', borderRadius: 8, textAlign: 'center', border: '1px solid rgba(11,191,122,0.2)' }}>
                        <div style={{ fontSize: 20, fontWeight: 900, color: '#0BBF7A', fontFamily: 'var(--font-display)' }}>{t.minimum_travel_minutes}min</div>
                        <div style={{ fontSize: 10, color: '#0BBF7A', textTransform: 'uppercase' }}>Min travel time</div>
                      </div>
                    </div>
                    <div style={{ marginTop: 8, fontSize: 11, color: '#C41E3A', fontWeight: 600 }}>
                      Account would need to travel {Math.round((t.minimum_travel_minutes / t.time_elapsed_minutes) * 100)}% faster than physically possible
                    </div>
                  </div>
                ))}
              </ChartPanel>

              {/* Device sharing */}
              <ChartPanel title={`Device Sharing Clusters (${devices.length})`} noPad>
                {devices.length === 0 && <EmptyState icon="📱" title="No device sharing clusters" />}
                {(devices||[]).map((d, i) => (
                  <div key={i} style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-border)', borderLeft: `3px solid ${d.risk === 'critical' ? '#C41E3A' : '#4A6070'}` }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                      <code style={{ fontSize: 11, fontWeight: 700 }}>{d.device_id}</code>
                      <SeverityPill level={d.risk || 'high'} />
                      <span style={{ marginLeft: 'auto', fontSize: 13, fontWeight: 900, color: d.risk === 'critical' ? '#C41E3A' : '#4A6070', fontFamily: 'var(--font-display)' }}>{d.account_count} accounts</span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 8 }}>
                      {(d.account_ids || []).map(id => <code key={id} style={{ fontSize: 10, padding: '2px 7px', background: 'var(--color-surface-2)', borderRadius: 4, color: 'var(--color-text-2)' }}>{id}</code>)}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-2)', lineHeight: 1.5 }}>{d.interpretation}</div>
                  </div>
                ))}
              </ChartPanel>
            </div>
          </div>
        );
      }}
    </AgentModule>
  );
}

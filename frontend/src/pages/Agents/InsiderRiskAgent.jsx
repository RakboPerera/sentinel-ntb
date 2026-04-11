import React, { useState } from 'react';
import { ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts';
import AgentModule from '../../components/shared/AgentModule.jsx';
import { VisualFindingCard } from '../../components/shared/VisualComponents.jsx';
import { KPICard, ProgressBar, DataRow, OpinionBanner, TabBar, AgentHeader, ChartPanel, SeverityPill, EmptyState } from '../../components/shared/AgentUI.jsx';
import useOpenFinding from '../../hooks/useOpenFinding.js';
import { demoData } from '../../data/demoData.js';

const COLOR = '#1F2937';

export default function InsiderRiskAgent() {
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState('profile');
  const openFinding = useOpenFinding('insider');

  return (
    <AgentModule agentId="insider" agentName="Insider Risk Agent" agentColor={COLOR} demoData={demoData.insiderRisk} schema={[]}>
      {(data) => {
        const sm = data.summary || {};
        const profiles = data.staff_profiles || [];
        const collusion = data.collusion_pairs || [];
        const approvalAnomalies = data.approval_chain_anomalies || [];
        const sel = selected || profiles[0];

        const scoreColor = s => s >= 80 ? '#C41E3A' : s >= 50 ? '#4A6070' : '#0BBF7A';

        const radarData = sel ? [
          { dim: 'SoD Violations', v: Math.min(100, (sel.sod_violations || 0) * 20) },
          { dim: 'Override Conc.', v: Math.min(100, (sel.override_concentration_pct || 0)) },
          { dim: 'Off-Hours', v: Math.min(100, (sel.off_hours_approvals || 0) * 5) },
          { dim: 'Cluster Approvals', v: Math.min(100, (sel.same_cluster_approvals || 0) * 25) },
          { dim: 'Flagged Sessions', v: Math.min(100, (sel.flagged_pct || 0) * 10) },
          { dim: 'Linked Exposure', v: Math.min(100, ((sel.linked_exposure_lkr || 0) / 5e9) * 100) },
        ] : [];

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            <AgentHeader
              name="Insider Risk Agent"
              icon="◉"
              color={COLOR}
              tagline="6-dimension composite score across 2,462 staff — SoD violations, override concentration, off-hours activity, approval clustering, session deviation"
              stats={[
                { label: 'Staff analysed', value: (sm.total_staff_analysed || 2462).toLocaleString() },
                { label: 'Flagged', value: sm.flagged_staff || 12, alert: true },
                { label: 'Critical', value: sm.critical_staff || 2, alert: true },
                { label: 'Exposure', value: `LKR ${((sm.suspicious_exposure_lkr || 418e6) / 1e6).toFixed(0)}M`, alert: true },
                { label: 'Avg risk score', value: `${sm.network_avg_risk_score || 18}/100` },
              ]}
            />

            <OpinionBanner
              verdict="ADVERSE"
              color={COLOR}
              opinion="In our opinion, the insider risk control environment is ADVERSE at Branch BR-14. STF-1847 scores 94/100 — all 6 insider fraud dimensions simultaneously breached. The probability of this occurring by chance is p < 0.0001."
              methodology={{
                'Population tested': '2,462 staff across 90 branches + corporate office',
                'Period covered': 'FY 2025 (Jan–Dec)',
                'Materiality threshold': 'All staff with composite score >40; any SoD violation',
                'Model limitations': 'Collusion detection requires ≥5 co-occurrences; staff active <6 months have reduced baseline confidence',
              }}
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
              <KPICard label="Critical risk staff" value={sm.critical_staff || 2} sub="Score > 80/100" color="#C41E3A" icon="◉" />
              <KPICard label="Flagged staff" value={sm.flagged_staff || 12} sub="Score 40–80/100" color="#4A6070" />
              <KPICard label="Suspicious exposure" value={`LKR ${((sm.suspicious_exposure_lkr || 418e6) / 1e6).toFixed(0)}M`} sub="Override-approved linked loans" color={COLOR} />
              <KPICard label="Collusion pairs" value={collusion.length} sub="Co-occurrence ratio > 3×" color={collusion.length > 0 ? '#C41E3A' : '#0BBF7A'} />
            </div>

            <ChartPanel title="Key Findings">
              {(data.key_findings || []).map((f, i) => (
                <VisualFindingCard key={i} finding={f} agentColor={COLOR} index={i} agentId="insider" agentData={data} openFinding={openFinding} />
              ))}
            </ChartPanel>

            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16 }}>
              {/* Staff list */}
              <ChartPanel title="Staff Risk Profiles" subtitle="Click to see 6-dimension breakdown" noPad>
                {profiles.map((p, i) => {
                  const sc = scoreColor(p.risk_score || 0);
                  const isSel = sel?.staff_id === p.staff_id;
                  return (
                    <div key={i} onClick={() => setSelected(p)}
                      style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)', cursor: 'pointer', borderLeft: `3px solid ${isSel ? sc : 'transparent'}`, background: isSel ? `${sc}06` : 'transparent' }}>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <div style={{ width: 38, height: 38, borderRadius: '50%', background: `${sc}15`, border: `2px solid ${sc}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span style={{ fontSize: 13, fontWeight: 900, color: sc, fontFamily: 'var(--font-display)' }}>{p.risk_score}</span>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                            <code style={{ fontSize: 11, fontWeight: 700 }}>{p.staff_id}</code>
                            {p.sod_violations > 0 && <span style={{ fontSize: 9, fontWeight: 800, padding: '1px 5px', background: '#FCEEF1', color: '#C41E3A', borderRadius: 3 }}>SoD ×{p.sod_violations}</span>}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--color-text-3)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.role} · {p.branch_code}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {profiles.length === 0 && <EmptyState icon="◉" title="No flagged staff" sub="No staff above risk threshold." />}
              </ChartPanel>

              {/* Staff detail */}
              {sel && (
                <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden' }}>
                  {/* Header */}
                  <div style={{ padding: '16px 20px', background: 'var(--color-panel)', borderBottom: '1px solid var(--color-panel-border)', display: 'flex', gap: 14, alignItems: 'center' }}>
                    <div>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 4 }}>
                        <code style={{ fontSize: 16, fontWeight: 900, color: 'white' }}>{sel.staff_id}</code>
                        <SeverityPill level={sel.risk_score >= 80 ? 'critical' : sel.risk_score >= 50 ? 'high' : 'medium'} />
                      </div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>{sel.role} · {sel.branch_name} ({sel.branch_code})</div>
                    </div>
                    <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                      <div style={{ fontSize: 36, fontWeight: 900, color: scoreColor(sel.risk_score || 0), fontFamily: 'var(--font-display)', lineHeight: 1 }}>{sel.risk_score}</div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Risk score / 100</div>
                    </div>
                  </div>

                  <TabBar tabs={[{ id: 'profile', label: 'Radar' },{ id: 'activity', label: 'Activity' },{ id: 'exposure', label: 'Exposure' }]} active={tab} onChange={setTab} color={COLOR} />

                  {tab === 'profile' && (
                    <div style={{ padding: 16 }}>
                      <ResponsiveContainer width="100%" height={220}>
                        <RadarChart data={radarData} margin={{ top: 10, right: 40, bottom: 10, left: 40 }}>
                          <PolarGrid stroke="var(--color-border)" />
                          <PolarAngleAxis dataKey="dim" tick={{ fontSize: 10, fill: 'var(--color-text-2)' }} />
                          <Radar dataKey="v" stroke={scoreColor(sel.risk_score || 0)} fill={scoreColor(sel.risk_score || 0)} fillOpacity={0.15} dot={{ fill: scoreColor(sel.risk_score || 0), r: 3 }} />
                        </RadarChart>
                      </ResponsiveContainer>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <ProgressBar value={sel.override_concentration_pct || 0} max={100} color={(sel.override_concentration_pct||0) > 50 ? '#C41E3A' : '#0BBF7A'} label="Override concentration" valueLabel={`${sel.override_concentration_pct || 0}%`} sublabel={`Network average: ~5%`} />
                        <ProgressBar value={sel.flagged_pct || 0} max={20} color={(sel.flagged_pct||0) > 5 ? '#C41E3A' : '#0BBF7A'} label="Flagged session %" valueLabel={`${sel.flagged_pct || 0}%`} sublabel={`Peer average: ${sel.peer_avg_flagged_pct || 1.2}%`} />
                      </div>
                    </div>
                  )}

                  {tab === 'activity' && (
                    <div style={{ padding: 16 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
                        {[
                          { label: 'Override count', val: sel.override_count || 34, color: '#C41E3A' },
                          { label: 'Off-hours approvals', val: sel.off_hours_approvals || 12, color: '#4A6070' },
                          { label: 'Same-cluster', val: sel.same_cluster_approvals || 3, color: '#4A6070' },
                        ].map((m, i) => (
                          <div key={i} style={{ padding: '14px', background: 'var(--color-surface-2)', borderRadius: 10, border: '1px solid var(--color-border)', textAlign: 'center' }}>
                            <div style={{ fontSize: 26, fontWeight: 900, color: m.color, fontFamily: 'var(--font-display)', lineHeight: 1 }}>{m.val}</div>
                            <div style={{ fontSize: 10, color: 'var(--color-text-3)', marginTop: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.label}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ padding: '12px 14px', background: '#FCEEF1', borderRadius: 8, fontSize: 12, color: '#C41E3A', lineHeight: 1.65, border: '1px solid rgba(196,30,58,0.2)' }}>
                        <strong>87% override concentration:</strong> {sel.override_count || 34} out of all branch overrides approved by a single officer — STF-1847. Expected under random distribution: ~5%. Probability of observing this by chance: p &lt; 0.0001.
                      </div>
                    </div>
                  )}

                  {tab === 'exposure' && (
                    <div style={{ padding: 16 }}>
                      <KPICard label="Linked loan exposure" value={`LKR ${((sel.linked_exposure_lkr || 387e6) / 1e6).toFixed(0)}M`} sub="Override-approved loans linked to this staff member" color="#C41E3A" />
                      <div style={{ marginTop: 14 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-text-3)', marginBottom: 8, fontFamily: 'var(--font-display)' }}>Linked loans</div>
                        {(sel.linked_loans || []).map((loan, j) => (
                          <code key={j} style={{ display: 'inline-block', fontSize: 11, padding: '3px 9px', background: 'var(--color-surface-2)', borderRadius: 5, margin: '0 5px 5px 0', color: 'var(--color-text-2)', border: '1px solid var(--color-border)' }}>{loan}</code>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Collusion detection */}
            {collusion.length > 0 && (
              <ChartPanel title="Collusion Detection — Staff Pair Analysis" subtitle="Co-occurrence ratios significantly above chance indicate coordinated fraud" noPad>
                {collusion.map((pair, i) => (
                  <div key={i} style={{ padding: '16px', borderBottom: '1px solid var(--color-border)', borderLeft: `3px solid ${pair.severity === 'critical' ? '#C41E3A' : '#4A6070'}` }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
                      <code style={{ fontSize: 12, fontWeight: 800, padding: '3px 10px', background: 'var(--color-surface-2)', borderRadius: 6 }}>{pair.staff_a}</code>
                      <span style={{ fontSize: 14, color: 'var(--color-text-3)' }}>⟷</span>
                      <code style={{ fontSize: 12, fontWeight: 800, padding: '3px 10px', background: 'var(--color-surface-2)', borderRadius: 6 }}>{pair.staff_b}</code>
                      <SeverityPill level={pair.severity || 'critical'} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 12 }}>
                      {[
                        { label: 'Observed', val: pair.co_occurrences, color: COLOR },
                        { label: 'Expected', val: pair.expected_co_occurrences, color: 'var(--color-text-3)' },
                        { label: 'Ratio', val: `${pair.co_occurrence_ratio}×`, color: '#C41E3A' },
                        { label: 'Exposure', val: `LKR ${((pair.financial_exposure_lkr || 0) / 1e6).toFixed(0)}M`, color: '#C41E3A' },
                      ].map((m, j) => (
                        <div key={j} style={{ padding: '10px', background: 'var(--color-surface-2)', borderRadius: 8, textAlign: 'center', border: '1px solid var(--color-border)' }}>
                          <div style={{ fontSize: 20, fontWeight: 900, color: m.color, fontFamily: 'var(--font-display)', lineHeight: 1 }}>{m.val}</div>
                          <div style={{ fontSize: 10, color: 'var(--color-text-3)', marginTop: 4, textTransform: 'uppercase' }}>{m.label}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-2)', lineHeight: 1.65 }}>{pair.finding}</div>
                  </div>
                ))}
              </ChartPanel>
            )}
          </div>
        );
      }}
    </AgentModule>
  );
}

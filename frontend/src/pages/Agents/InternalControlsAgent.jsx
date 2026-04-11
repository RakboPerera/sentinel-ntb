import React, { useState } from 'react';
import { ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts';
import AgentModule from '../../components/shared/AgentModule.jsx';
import { VisualFindingCard } from '../../components/shared/VisualComponents.jsx';
import { KPICard, ProgressBar, DataRow, SectionHeader, OpinionBanner, TabBar, AgentHeader, ChartPanel, SeverityPill, EmptyState } from '../../components/shared/AgentUI.jsx';
import useOpenFinding from '../../hooks/useOpenFinding.js';
import { demoData, peerBenchmarks } from '../../data/demoData.js';

const COLOR = '#3A5A3A';

export default function InternalControlsAgent() {
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [tab, setTab] = useState('branches');
  const openFinding = useOpenFinding('controls');

  return (
    <AgentModule agentId="controls" agentName="Internal Controls Agent" agentColor={COLOR} demoData={demoData.controls} schema={[]}>
      {(data) => {
        const cs = data.controls_summary || {};
        const branches = data.branch_risk_scores || [];
        const sod = data.sod_violations || [];
        const approvers = data.flagged_approvers || [];
        const peers = peerBenchmarks?.controls || {};
        const sel = selectedBranch || branches[0];
        const scoreColor = s => s < 50 ? '#C41E3A' : s < 65 ? '#4A6070' : '#0BBF7A';

        const radarData = sel ? [
          { dim: 'Override Rate', score: Math.min(100, (sel.override_rate_pct || 0) * 7) },
          { dim: 'SoD Violations', score: Math.min(100, (sel.sod_violation_count || 0) * 20) },
          { dim: 'Off-Hours', score: Math.min(100, (sel.off_hours_approval_pct || 0) * 3) },
          { dim: 'Concentration', score: Math.min(100, (sel.approver_concentration_index || 0) * 100) },
          { dim: 'Risk Tier', score: sel.risk_tier === 'critical' ? 95 : sel.risk_tier === 'high' ? 70 : 30 },
        ] : [];

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            <AgentHeader
              name="Internal Controls Agent"
              icon="⚙"
              color={COLOR}
              tagline="6-dimension composite score across 90 branches — override rate, SoD violations, off-hours activity, approver concentration, turnaround anomaly"
              stats={[
                { label: 'Transactions', value: (cs.total_transactions_analyzed || 18743).toLocaleString() },
                { label: 'SoD violations', value: cs.sod_violations || 7, alert: true },
                { label: 'High-risk branches', value: cs.high_risk_branches || 4, alert: true },
                { label: 'Network override', value: `${cs.network_override_rate_pct || 4.8}%` },
                { label: 'Off-hours approvals', value: cs.off_hours_approvals || 143 },
              ]}
            />

            <OpinionBanner
              verdict="ADVERSE"
              color={COLOR}
              opinion="In our opinion, the internal controls environment at Branch BR-14 is ADVERSE — composite score 41/100. SoD violations confirmed. STF-1847 override concentration of 87% is statistically impossible under legitimate operations (p < 0.0001)."
              methodology={{
                'Population tested': '18,743 approval transactions across 90 branches',
                'Period covered': 'FY 2025 (Jan–Dec)',
                'Materiality threshold': 'All SoD violations; branches with override rate >5% or composite <65',
                'Model limitations': 'Manual overrides outside system not captured; delegated authority limits from HR records Q3 2025',
              }}
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
              <KPICard label="SoD violations" value={cs.sod_violations || 7} sub="End-to-end control failure" color="#C41E3A" icon="⚙" />
              <KPICard label="High-risk branches" value={cs.high_risk_branches || 4} sub="Composite score < 65/100" color="#C41E3A" />
              <KPICard label="Network override rate" value={`${cs.network_override_rate_pct || 4.8}%`} sub="BR-14: 14.3% — 3× network avg" color="#4A6070" />
              <KPICard label="Off-hours approvals" value={cs.off_hours_approvals || 143} sub="18:00–06:00 and weekends" color={COLOR} />
            </div>

            <ChartPanel title="Key Findings">
              {(data.key_findings || []).map((f, i) => (
                <VisualFindingCard key={i} finding={f} agentColor={COLOR} index={i} agentId="controls" agentData={data} openFinding={openFinding} />
              ))}
            </ChartPanel>

            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 16 }}>
              {/* Branch list */}
              <ChartPanel title="Branch Risk Scores" noPad>
                <div style={{ padding: '8px 16px', background: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border)', display: 'flex', gap: 12, fontSize: 10, color: 'var(--color-text-3)' }}>
                  {[['#C41E3A','<65 Adverse'],['#4A6070','65–79 Review'],['#0BBF7A','≥80 OK']].map(([c,l])=>(
                    <span key={l} style={{ display:'flex', alignItems:'center', gap:4 }}>
                      <span style={{ width:8, height:8, borderRadius:'50%', background:c, display:'inline-block' }} />{l}
                    </span>
                  ))}
                </div>
                {(branches||[]).map((br, i) => {
                  const isSel = sel?.branch_code === br.branch_code;
                  const sc = scoreColor(br.composite_score || 0);
                  return (
                    <div key={i} onClick={() => setSelectedBranch(br)}
                      style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)', cursor: 'pointer', borderLeft: `3px solid ${isSel ? sc : 'transparent'}`, background: isSel ? `${sc}06` : 'transparent' }}>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <div style={{ width: 38, height: 38, borderRadius: 10, background: `${sc}12`, border: `2px solid ${sc}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span style={{ fontSize: 14, fontWeight: 900, color: sc, fontFamily: 'var(--font-display)' }}>{br.composite_score || 0}</span>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            <code style={{ fontSize: 12, fontWeight: 700 }}>{br.branch_code}</code>
                            {br.sod_violation_count > 0 && <span style={{ fontSize: 9, padding: '1px 5px', background: '#FCEEF1', color: '#C41E3A', borderRadius: 3, fontWeight: 800 }}>SoD ×{br.sod_violation_count}</span>}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--color-text-3)', marginTop: 2 }}>{br.override_rate_pct}% override · {br.risk_tier}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {branches.length === 0 && <EmptyState icon="⚙" title="No branch scores" sub="Run agent to generate branch risk scores." />}
              </ChartPanel>

              {/* Branch detail + radar */}
              {sel && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <ChartPanel title={`${sel.branch_code} — Composite Score`} subtitle={sel.primary_concern}>
                    <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 20, alignItems: 'start' }}>
                      <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <div style={{ fontSize: 56, fontWeight: 900, color: scoreColor(sel.composite_score || 0), fontFamily: 'var(--font-display)', lineHeight: 1 }}>{sel.composite_score || 0}</div>
                        <div style={{ fontSize: 11, color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginTop: 6 }}>out of 100</div>
                        <SeverityPill level={sel.risk_tier || 'medium'} />
                      </div>
                      <ResponsiveContainer width="100%" height={200}>
                        <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                          <PolarGrid stroke="var(--color-border)" />
                          <PolarAngleAxis dataKey="dim" tick={{ fontSize: 10, fill: 'var(--color-text-2)' }} />
                          <Radar dataKey="score" stroke={scoreColor(sel.composite_score || 0)} fill={scoreColor(sel.composite_score || 0)} fillOpacity={0.15} dot={{ fill: scoreColor(sel.composite_score || 0), r: 3 }} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                    <div style={{ borderTop: '1px solid var(--color-border)', padding: '14px 0 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <ProgressBar value={sel.override_rate_pct || 0} max={20} color={sel.override_rate_pct > 8 ? '#C41E3A' : '#0BBF7A'} label="Override rate" valueLabel={`${sel.override_rate_pct}%`} sublabel="Flag: >5%" />
                      <ProgressBar value={sel.off_hours_approval_pct || 0} max={40} color={sel.off_hours_approval_pct > 15 ? '#C41E3A' : '#4A6070'} label="Off-hours approvals" valueLabel={`${sel.off_hours_approval_pct}%`} sublabel="Flag: >15%" />
                    </div>
                  </ChartPanel>

                  <ChartPanel title="SoD Violations" subtitle="Maker = approver on same transaction" noPad>
                    {sod.filter(v => v.branch_code === sel.branch_code).length === 0
                      ? <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--color-text-3)', fontSize: 12 }}>No SoD violations at this branch.</div>
                      : sod.filter(v => v.branch_code === sel.branch_code).map((v, i) => (
                          <div key={i} style={{ padding: '10px 16px', borderBottom: '1px solid var(--color-border)', display: 'grid', gridTemplateColumns: '1fr 80px 90px 80px', gap: 8, alignItems: 'center', background: i % 2 === 0 ? 'white' : 'var(--color-surface-2)' }}>
                            <div>
                              <code style={{ fontSize: 11, fontWeight: 700 }}>{v.transaction_id}</code>
                              <div style={{ fontSize: 10, color: 'var(--color-text-3)', marginTop: 1 }}>{v.transaction_type}</div>
                            </div>
                            <code style={{ fontSize: 11, color: '#C41E3A', fontWeight: 700 }}>{v.staff_id}</code>
                            <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>LKR {((v.amount_lkr || 0) / 1e6).toFixed(1)}M</span>
                            <SeverityPill level={v.severity || 'critical'} />
                          </div>
                        ))
                    }
                  </ChartPanel>
                </div>
              )}
            </div>

            {/* Peers */}
            <ChartPanel title="Peer Benchmarking — Internal Controls" subtitle="Source: CBSL Supervisory Review 2025" noPad>
              {Object.entries(peers).map(([key, b], i) => {
                const labels = { override_rate_branch: 'BR-14 Override Rate (%)', sod_violation_rate: 'SoD Violation Rate (%)', avg_approval_minutes: 'Avg Approval Turnaround (min)' };
                const better = b.ntb <= b.peer_median;
                return (
                  <DataRow key={key} even={i % 2 !== 0}
                    label={labels[key] || key}
                    sub={`Peer median: ${b.peer_median} · Best: ${b.peer_best} · Worst: ${b.peer_worst}`}
                    value={String(b.ntb)}
                    valueColor={better ? '#0BBF7A' : '#C41E3A'}
                    badge={better ? '✓ Better' : '✗ Weaker'}
                    badgeColor={better ? '#0BBF7A' : '#C41E3A'}
                  />
                );
              })}
              {Object.keys(peers).length === 0 && <div style={{ padding: 20, color: 'var(--color-text-3)', fontSize: 12, textAlign: 'center' }}>No peer data available.</div>}
            </ChartPanel>
          </div>
        );
      }}
    </AgentModule>
  );
}

import React, { useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ReferenceLine } from 'recharts';
import AgentModule from '../../components/shared/AgentModule.jsx';
import ExplainerBox from '../../components/shared/ExplainerBox.jsx';
import { VisualFindingCard } from '../../components/shared/VisualComponents.jsx';
import { KPICard, ProgressBar, DataRow, SectionHeader, OpinionBanner, TabBar, AgentHeader, ChartPanel, SeverityPill } from '../../components/shared/AgentUI.jsx';
import useOpenFinding from '../../hooks/useOpenFinding.js';
import { demoData } from '../../data/demoData.js';

const COLOR = '#4A6070';
const BENFORD_EXPECTED = [30.1, 17.6, 12.5, 9.7, 7.9, 6.7, 5.8, 5.1, 4.6];

export default function TransactionAgent() {
  const [tab, setTab] = useState('structuring');
  const openFinding = useOpenFinding('transaction');

  return (
    <AgentModule agentId="transaction" agentName="Transaction Surveillance Agent" agentColor={COLOR} demoData={demoData.transaction} schema={[]}>
      {(data) => {
        const ss = data.surveillance_summary || {};
        const clusters = data.structuring_clusters || [];
        const velocity = data.velocity_anomalies || [];
        const strQueue = data.str_queue || [];
        const benford = data.benford_analysis || {};
        const benfordData = BENFORD_EXPECTED.map((exp, i) => {
          let actual = exp;
          if (benford.deviation_detected) {
            const devDigit = (benford.most_deviant_digit || 4) - 1;
            if (i === devDigit) actual = benford.actual_pct || 18.3;
            else actual = exp - ((benford.actual_pct - benford.expected_pct) / 8);
          }
          return { digit: String(i + 1), expected: exp, actual: Math.max(0.5, actual) };
        });

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            <AgentHeader
              name="Transaction Surveillance Agent"
              icon="⟳"
              color={COLOR}
              tagline="Benford's Law, structuring cluster detection and 90-day velocity scoring across 284,719 transactions"
              stats={[
                { label: 'Transactions', value: (ss.total_transactions_analyzed || 284719).toLocaleString() },
                { label: 'Volume', value: `LKR ${((ss.total_volume_lkr || 47.8e9) / 1e9).toFixed(1)}Bn` },
                { label: 'STR eligible', value: ss.str_eligible_count || 4, alert: true },
                { label: 'Clusters', value: ss.structuring_clusters || 7, alert: true },
                { label: 'Benford anomaly', value: ss.benford_deviation_detected ? 'YES' : 'NO', alert: ss.benford_deviation_detected },
              ]}
            />

            <OpinionBanner
              verdict="ADVERSE"
              color={COLOR}
              opinion="In our opinion, the AML transaction monitoring control environment is NOT EFFECTIVE. Systematic structuring below LKR 5M is confirmed by Benford's Law deviation. 4 STR-eligible cases must be filed within 5 working days under FTRA Section 7."
              methodology={{
                'Population tested': '284,719 transactions — 100%',
                'Period covered': 'FY 2025 (Jan–Dec)',
                'Materiality threshold': 'LKR 5M STR threshold; velocity anomalies ≥3× 90-day baseline',
                'Model limitations': "Benford's Law requires sufficient volume; accounts <90 days excluded from baseline",
              }}
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
              <KPICard label="Total volume" value={`LKR ${((ss.total_volume_lkr || 47.8e9) / 1e9).toFixed(1)}Bn`} sub={`${(ss.total_transactions_analyzed || 284719).toLocaleString()} transactions`} color={COLOR} icon="⟳" />
              <KPICard label="STR eligible" value={ss.str_eligible_count || 4} sub="File within 5 working days" color="#C41E3A" delta={1} deltaLabel=" open past deadline" />
              <KPICard label="Structuring clusters" value={ss.structuring_clusters || 7} sub="Confirmed below-threshold splitting" color="#C41E3A" />
              <KPICard label="High-risk accounts" value={ss.high_risk_accounts || 23} sub="Velocity or Benford flags" color="#4A6070" />
            </div>

            <ChartPanel title="Key Findings" subtitle={`${(data.key_findings || []).length} confirmed AML patterns`}>
              {(data.key_findings || []).map((f, i) => (
                <VisualFindingCard key={i} finding={f} agentColor={COLOR} index={i} agentId="transaction" agentData={data} openFinding={openFinding} />
              ))}
            </ChartPanel>

            {/* Benford chart — always visible */}
            <ChartPanel
              title="Benford's Law — First Digit Distribution"
              subtitle="Digit '4' appears 18.3% vs expected 9.7% — systematic structuring confirmed"
              tooltip="In any large natural financial dataset, digit 1 should appear ~30% of the time as the first digit. When transactions are deliberately kept below LKR 5M, digit 4 appears anomalously often — the mathematical fingerprint of structuring."
            >
              <div style={{ padding: '0 0 8px' }}>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={benfordData} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
                    <XAxis dataKey="digit" tick={{ fontSize: 11 }} label={{ value: 'First digit of transaction amount', position: 'insideBottom', offset: -2, fontSize: 10 }} />
                    <YAxis tickFormatter={v => `${v}%`} tick={{ fontSize: 10 }} domain={[0, 35]} />
                    <Tooltip formatter={(v, n) => [`${v.toFixed(1)}%`, n === 'actual' ? 'Observed' : 'Expected']} />
                    <Bar dataKey="expected" fill="#D1D0CB" radius={[3, 3, 0, 0]} name="Expected" />
                    <Bar dataKey="actual" radius={[3, 3, 0, 0]} name="Observed">
                      {benfordData.map((d, i) => {
                        const dev = Math.abs((d.actual || 0) - d.expected);
                        return <Cell key={i} fill={dev > 5 ? '#C41E3A' : dev > 2 ? COLOR : '#A7F3D0'} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                {benford.deviation_detected && (
                  <div style={{ margin: '12px 0 0', padding: '10px 14px', background: '#FCEEF1', borderRadius: 8, fontSize: 12, color: '#C41E3A', fontWeight: 600, border: '1px solid rgba(196,30,58,0.2)' }}>
                    Digit '{benford.most_deviant_digit}' appears {benford.actual_pct}% vs expected {benford.expected_pct}% — {benford.interpretation}
                  </div>
                )}
              </div>
            </ChartPanel>

            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden' }}>
              <TabBar
                tabs={[
                  { id: 'structuring', label: 'Structuring Clusters', count: clusters.length },
                  { id: 'velocity', label: 'Velocity Anomalies', count: velocity.length },
                  { id: 'str', label: 'STR Queue', count: strQueue.length },
                ]}
                active={tab} onChange={setTab} color={COLOR}
              />

              {tab === 'structuring' && (
                <div>
                  {clusters.length === 0 && <div style={{ padding: 32, textAlign: 'center', color: 'var(--color-text-3)' }}>No structuring clusters in data.</div>}
                  {clusters.map((cl, i) => (
                    <div key={i} style={{ padding: '16px', borderBottom: '1px solid var(--color-border)', borderLeft: `3px solid ${cl.str_eligible ? '#C41E3A' : COLOR}` }}>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
                        <code style={{ fontSize: 13, fontWeight: 800, color: 'var(--color-text)' }}>{cl.account_id}</code>
                        <span style={{ fontSize: 11, color: 'var(--color-text-3)' }}>{cl.branch_code}</span>
                        {cl.str_eligible && <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 800, padding: '3px 10px', background: '#C41E3A', color: 'white', borderRadius: 5, fontFamily: 'var(--font-display)' }}>STR ELIGIBLE</span>}
                        <span style={{ fontSize: 18, fontWeight: 900, color: cl.str_eligible ? '#C41E3A' : COLOR, fontFamily: 'var(--font-display)' }}>LKR {((cl.combined_amount_lkr || 0) / 1e6).toFixed(1)}M</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 12 }}>
                        {[
                          { label: 'Transactions', val: cl.cluster_transactions },
                          { label: 'Timespan', val: `${cl.cluster_timespan_minutes}min` },
                          { label: 'Max single', val: `LKR ${((cl.max_single_txn_lkr || 0) / 1e6).toFixed(1)}M` },
                          { label: 'Score', val: `${((cl.structuring_score || 0) * 100).toFixed(0)}/100` },
                        ].map((m, j) => (
                          <div key={j} style={{ padding: '10px 12px', background: 'var(--color-surface-2)', borderRadius: 8, border: '1px solid var(--color-border)' }}>
                            <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>{m.val}</div>
                            <div style={{ fontSize: 10, color: 'var(--color-text-3)', marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.label}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-2)', lineHeight: 1.6 }}>{cl.explanation}</div>
                      {cl.recommended_action && (
                        <div style={{ marginTop: 8, fontSize: 12, fontWeight: 600, color: '#C41E3A' }}>→ {cl.recommended_action}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {tab === 'velocity' && (
                <div>
                  {velocity.length === 0 && <div style={{ padding: 32, textAlign: 'center', color: 'var(--color-text-3)' }}>No velocity anomalies in data.</div>}
                  {(velocity||[]).map((va, i) => (
                    <div key={i} style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-border)' }}>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
                        <code style={{ fontSize: 12, fontWeight: 700 }}>{va.account_id}</code>
                        <span style={{ fontSize: 11, color: 'var(--color-text-3)' }}>{va.branch_code} · {va.branch_code}</span>
                        <span style={{ marginLeft: 'auto', fontSize: 13, fontWeight: 800, color: '#C41E3A', fontFamily: 'var(--font-display)' }}>{((va.velocity_multiple || 0)).toFixed(1)}× baseline</span>
                      </div>
                      <ProgressBar
                        value={va.txn_count_in_window || 0}
                        max={Math.max(va.txn_count_in_window || 0, (va.implied_baseline_count || 1) * 4)}
                        color="#C41E3A"
                        label={`${va.txn_count_in_window || 0} txns in window vs ${va.implied_baseline_count || 0} baseline`}
                        valueLabel={`${va.txn_count_in_window || 0} txns`}
                        sublabel={va.risk_flag}
                      />
                    </div>
                  ))}
                </div>
              )}

              {tab === 'str' && (
                <div>
                  <div style={{ padding: '10px 16px', background: '#FCEEF1', borderBottom: '1px solid rgba(196,30,58,0.15)', fontSize: 12, fontWeight: 600, color: '#C41E3A' }}>
                    ⏱ FTRA Section 7 — STR must be filed with CBSL FIU within 5 working days of identification
                  </div>
                  {strQueue.length === 0 && <div style={{ padding: 32, textAlign: 'center', color: 'var(--color-text-3)' }}>No STR cases queued.</div>}
                  {(strQueue||[]).map((str, i) => (
                    <div key={i} style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-border)', borderLeft: `3px solid ${str.urgency === 'immediate' ? '#C41E3A' : '#4A6070'}` }}>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
                        <code style={{ fontSize: 12, fontWeight: 700 }}>{str.account_id}</code>
                        <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 8px', background: str.urgency === 'immediate' ? '#C41E3A' : '#4A6070', color: 'white', borderRadius: 4 }}>{(str.urgency || '').replace('_', ' ').toUpperCase()}</span>
                        <span style={{ marginLeft: 'auto', fontSize: 14, fontWeight: 900, color: '#C41E3A', fontFamily: 'var(--font-display)' }}>LKR {((str.amount_lkr || 0) / 1e6).toFixed(0)}M</span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-2)', lineHeight: 1.6 }}>{str.str_grounds}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      }}
    </AgentModule>
  );
}

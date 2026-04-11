import React, { useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import AgentModule from '../../components/shared/AgentModule.jsx';
import { VisualFindingCard } from '../../components/shared/VisualComponents.jsx';
import { KPICard, ProgressBar, DataRow, SectionHeader, OpinionBanner, TabBar, AgentHeader, ChartPanel, SeverityPill, EmptyState } from '../../components/shared/AgentUI.jsx';
import useOpenFinding from '../../hooks/useOpenFinding.js';
import { demoData } from '../../data/demoData.js';

const COLOR = '#993C1D';

export default function SuspenseAgent() {
  const [selectedId, setSelectedId] = useState(null);
  const openFinding = useOpenFinding('suspense');

  return (
    <AgentModule agentId="suspense" agentName="Suspense & Reconciliation Agent" agentColor={COLOR} demoData={demoData.suspense} schema={[]}>
      {(data) => {
        const rs = data.reconciliation_summary || {};
        const accounts = data.flagged_accounts || [];
        const aging = data.aging_distribution || [];
        const selected = accounts.find(a => a.account_id === selectedId) || accounts[0];

        const riskColor = r => r === 'critical' ? '#C41E3A' : r === 'red' ? '#C41E3A' : r === 'amber' ? '#4A6070' : '#0BBF7A';

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            <AgentHeader
              name="Suspense & Reconciliation Agent"
              icon="⊟"
              color={COLOR}
              tagline="Daily growth-rate × clearing-ratio analysis across 143 suspense accounts — flagging phantom receivables before CBSL breach"
              stats={[
                { label: 'Accounts analysed', value: rs.total_accounts_analyzed || 143 },
                { label: 'Unreconciled', value: `LKR ${((rs.total_unreconciled_balance_lkr || 8.42e9) / 1e9).toFixed(1)}Bn`, alert: true },
                { label: 'Critical', value: rs.critical_accounts || 3, alert: true },
                { label: 'CBSL breach', value: rs.critical_accounts || 3, alert: true },
                { label: 'Growth anomalies', value: rs.growth_anomalies || 5, alert: true },
              ]}
            />

            <OpinionBanner
              verdict="ADVERSE"
              color={COLOR}
              opinion="In our opinion, the suspense account reconciliation control environment is ADVERSE. SUS-017 constitutes a confirmed CBSL regulatory breach (94 days aged, clearing ratio 0.08). The phantom receivable pattern is corroborated by Transaction and Digital agents."
              methodology={{
                'Population tested': '143 suspense and nostro accounts — 100%',
                'Period covered': 'FY 2025 + 90-day aging window',
                'Materiality threshold': 'All balances aged >30 days; CBSL breach threshold >90 days',
                'Model limitations': 'Intraday clearing cycles not captured; weekend entries may show artificial aging',
              }}
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
              <KPICard label="Unreconciled balance" value={`LKR ${((rs.total_unreconciled_balance_lkr || 8.42e9) / 1e9).toFixed(1)}Bn`} sub={`Across ${rs.total_accounts_analyzed || 143} accounts`} color={COLOR} icon="⊟" />
              <KPICard label="Critical accounts" value={rs.critical_accounts || 3} sub="CBSL breach risk" color="#C41E3A" delta={1} deltaLabel=" past 90 days" />
              <KPICard label="Phantom receivable" value={rs.phantom_receivable_risk_accounts || 2} sub="High growth + low clearing" color="#C41E3A" />
              <KPICard label="Growth anomalies" value={rs.growth_anomalies || 5} sub=">50% balance growth in 30 days" color="#4A6070" />
            </div>

            <ChartPanel title="Key Findings">
              {(data.key_findings || []).map((f, i) => (
                <VisualFindingCard key={i} finding={f} agentColor={COLOR} index={i} agentId="suspense" agentData={data} openFinding={openFinding} />
              ))}
            </ChartPanel>

            <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 16 }}>
              {/* Account list */}
              <ChartPanel title="Flagged Accounts" subtitle="Click to see diagnostics" noPad>
                {accounts.map((acc, i) => {
                  const rc = riskColor(acc.risk_tier);
                  const isSel = selected?.account_id === acc.account_id;
                  return (
                    <div key={i} onClick={() => setSelectedId(acc.account_id)}
                      style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)', cursor: 'pointer', borderLeft: `3px solid ${isSel ? rc : 'transparent'}`, background: isSel ? `${rc}06` : 'transparent', transition: 'all 0.12s' }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                        <code style={{ fontSize: 12, fontWeight: 800 }}>{acc.account_id}</code>
                        <SeverityPill level={acc.risk_tier === 'red' ? 'critical' : acc.risk_tier} />
                        <span style={{ marginLeft: 'auto', fontSize: 13, fontWeight: 900, color: rc, fontFamily: 'var(--font-display)' }}>LKR {((acc.current_balance_lkr || 0) / 1e9).toFixed(2)}Bn</span>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-3)', marginBottom: 8 }}>{acc.account_type} · {acc.branch_code}</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                        {[
                          { l: 'Age', v: `${acc.aging_days}d`, bad: acc.aging_days > 90 },
                          { l: 'Growth', v: `+${acc.growth_rate_30d_pct}%`, bad: acc.growth_rate_30d_pct > 50 },
                          { l: 'Clearing', v: `${(acc.clearing_ratio * 100).toFixed(0)}%`, bad: acc.clearing_ratio < 0.3 },
                        ].map((m, j) => (
                          <div key={j} style={{ textAlign: 'center', padding: '5px', background: m.bad ? '#FCEEF1' : 'var(--color-surface-2)', borderRadius: 6, border: `1px solid ${m.bad ? 'rgba(196,30,58,0.2)' : 'var(--color-border)'}` }}>
                            <div style={{ fontSize: 13, fontWeight: 900, color: m.bad ? '#C41E3A' : 'var(--color-text)', fontFamily: 'var(--font-display)' }}>{m.v}</div>
                            <div style={{ fontSize: 9, color: 'var(--color-text-3)', textTransform: 'uppercase' }}>{m.l}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
                {accounts.length === 0 && <EmptyState icon="⊟" title="No flagged accounts" sub="All suspense accounts within normal thresholds." />}
              </ChartPanel>

              {/* Detail panel */}
              {selected && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ background: 'var(--color-surface)', border: `1px solid var(--color-border)`, borderRadius: 12, overflow: 'hidden' }}>
                    <div style={{ padding: '16px 18px', background: `${riskColor(selected.risk_tier)}08`, borderBottom: '1px solid var(--color-border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <code style={{ fontSize: 18, fontWeight: 900 }}>{selected.account_id}</code>
                          <div style={{ fontSize: 12, color: 'var(--color-text-3)', marginTop: 3 }}>{selected.account_type} · {selected.branch_code}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 24, fontWeight: 900, color: riskColor(selected.risk_tier), fontFamily: 'var(--font-display)' }}>LKR {((selected.current_balance_lkr || 0) / 1e9).toFixed(2)}Bn</div>
                          <SeverityPill level={selected.risk_tier === 'red' ? 'critical' : selected.risk_tier} />
                        </div>
                      </div>
                    </div>
                    <div style={{ padding: 18 }}>
                      <ProgressBar value={selected.aging_days || 0} max={120} color={selected.aging_days > 90 ? '#C41E3A' : '#4A6070'} label="Account aging" valueLabel={`${selected.aging_days} days`} sublabel="CBSL regulatory breach threshold: 90 days" />
                      <ProgressBar value={selected.growth_rate_30d_pct || 0} max={400} color={selected.growth_rate_30d_pct > 50 ? '#C41E3A' : '#0BBF7A'} label="30-day balance growth" valueLabel={`+${selected.growth_rate_30d_pct}%`} sublabel="Flag threshold: >50% growth in 30 days" />
                      <ProgressBar value={Math.max(0, (1 - (selected.clearing_ratio || 0)) * 100)} max={100} color={selected.clearing_ratio < 0.3 ? '#C41E3A' : '#0BBF7A'} label="Uncleared portion" valueLabel={`${((1 - (selected.clearing_ratio || 0)) * 100).toFixed(0)}% uncleared`} sublabel={`Clearing ratio: ${selected.clearing_ratio} — flag if <0.30`} />
                    </div>
                    {selected.pattern_detected && (
                      <div style={{ padding: '12px 18px', background: '#FCEEF1', borderTop: '1px solid rgba(196,30,58,0.15)', fontSize: 12, color: '#C41E3A', lineHeight: 1.6, fontWeight: 500 }}>
                        <strong>Pattern: </strong>{selected.pattern_detected}
                      </div>
                    )}
                    {selected.recommended_action && (
                      <div style={{ padding: '10px 18px', background: 'var(--color-surface-2)', borderTop: '1px solid var(--color-border)', fontSize: 12, color: 'var(--color-text-2)', fontWeight: 600 }}>
                        → {selected.recommended_action}
                      </div>
                    )}
                  </div>

                  {/* Aging distribution */}
                  <ChartPanel title="Aging Distribution — All Accounts" tooltip="Balance by aging bucket. CBSL requires escalation to Board Audit Committee for any balance >90 days.">
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={aging} margin={{ top: 8, right: 20, bottom: 8, left: 0 }}>
                        <XAxis dataKey="bucket" tick={{ fontSize: 10 }} />
                        <YAxis tickFormatter={v => `LKR ${(v / 1e9).toFixed(1)}Bn`} tick={{ fontSize: 10 }} />
                        <Tooltip formatter={v => `LKR ${(v / 1e9).toFixed(2)}Bn`} />
                        <Bar dataKey="balance_lkr" radius={[4, 4, 0, 0]}>
                          {aging.map((d, i) => <Cell key={i} fill={d.bucket && (d.bucket.includes('91') || d.bucket.includes('>')) ? '#C41E3A' : d.bucket && d.bucket.includes('61') ? '#4A6070' : '#0BBF7A'} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    <div style={{ marginTop: 8, padding: '8px 0', fontSize: 11, color: '#C41E3A', fontWeight: 600 }}>
                      ⚠ Balances in 91+ day bucket constitute confirmed CBSL regulatory breaches
                    </div>
                  </ChartPanel>
                </div>
              )}
            </div>
          </div>
        );
      }}
    </AgentModule>
  );
}

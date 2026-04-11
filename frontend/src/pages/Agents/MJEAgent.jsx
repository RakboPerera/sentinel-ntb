import React, { useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import AgentModule from '../../components/shared/AgentModule.jsx';
import { VisualFindingCard } from '../../components/shared/VisualComponents.jsx';
import { KPICard, ProgressBar, DataRow, OpinionBanner, TabBar, AgentHeader, ChartPanel, SeverityPill, EmptyState } from '../../components/shared/AgentUI.jsx';
import useOpenFinding from '../../hooks/useOpenFinding.js';
import { demoData } from '../../data/demoData.js';

const COLOR = '#0BBF7A';
const BENFORD_EXP = [30.1,17.6,12.5,9.7,7.9,6.7,5.8,5.1,4.6];

export default function MJEAgent() {
  const [tab, setTab] = useState('entries');
  const openFinding = useOpenFinding('mje');

  return (
    <AgentModule agentId="mje" agentName="MJE Testing Agent" agentColor={COLOR} demoData={demoData.mje} schema={[]}>
      {(data) => {
        const ms = data.mje_summary || {};
        const entries = data.mje_entries || [];
        const bd = data.benford_distribution || [];
        const gl = data.gl_reconciliation || [];
        const rev = data.reversal_analysis || {};
        const unmatched = rev.unmatched_reversals ? (Array.isArray(rev.unmatched_reversals) ? rev.unmatched_reversals : []) : [];

        const benfordData = BENFORD_EXP.map((exp, i) => {
          const actual = Array.isArray(bd) ? (bd[i]?.actual ?? exp) : exp;
          return { digit: String(i + 1), expected: exp, actual };
        });

        const scoreColor = s => s >= 80 ? '#C41E3A' : s >= 50 ? '#4A6070' : '#0BBF7A';

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            <AgentHeader
              name="MJE Testing Agent"
              icon="⊞"
              color={COLOR}
              tagline="Full-population MJE testing — all 847 entries, no sampling — timing flags, Benford deviation, GL sensitivity, maker-checker SoD"
              stats={[
                { label: 'Entries tested', value: ms.total_entries_tested || 847 },
                { label: 'Flagged', value: ms.flagged_count || 23, alert: true },
                { label: 'Escalated', value: ms.escalated_count || 5, alert: true },
                { label: 'SoD violations', value: ms.sod_violations || 3, alert: true },
                { label: 'After-hours', value: ms.after_hours_entries || 12, alert: true },
              ]}
            />

            <OpinionBanner
              verdict="ADVERSE"
              color={COLOR}
              opinion="In our opinion, the MJE control environment is ADVERSE. MJE-2026-4205 scores 97/100 — the highest in the full population. Benford first-digit analysis confirms deliberate sub-threshold structuring in the GL layer."
              methodology={{
                'Population tested': '847 manual journal entries — 100%, full population',
                'Period covered': 'FY 2025 (Jan–Dec)',
                'Materiality threshold': 'All entries >LKR 1M; all SoD violations regardless of amount',
                "Model limitations": "Automated system journals excluded; Benford's Law less effective for accounts with <50 entries",
              }}
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
              <KPICard label="Entries tested" value={ms.total_entries_tested || 847} sub="Full population — no sampling" color={COLOR} icon="⊞" />
              <KPICard label="Flagged entries" value={ms.flagged_count || 23} sub={`${ms.escalated_count || 5} escalated to critical`} color="#C41E3A" />
              <KPICard label="SoD violations" value={ms.sod_violations || 3} sub="Same maker and checker" color="#C41E3A" />
              <KPICard label="Benford failures" value={ms.benford_failures || 8} sub="First-digit distribution anomaly" color="#4A6070" />
            </div>

            <ChartPanel title="Key Findings">
              {(data.key_findings || []).map((f, i) => (
                <VisualFindingCard key={i} finding={f} agentColor={COLOR} index={i} agentId="mje" agentData={data} openFinding={openFinding} />
              ))}
            </ChartPanel>

            {/* Benford chart */}
            <ChartPanel title="Benford's Law — MJE Amount First-Digit Distribution" subtitle="Deviation in digits 4 and 9 indicates deliberate entry amount selection" tooltip="Benford's Law predicts first-digit frequency in any large natural financial dataset. Significant deviation in MJE amounts indicates deliberate choice of entry amounts — a signature of sub-threshold GL structuring.">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={benfordData} margin={{ top: 8, right: 10, bottom: 8, left: 0 }}>
                  <XAxis dataKey="digit" tick={{ fontSize: 11 }} label={{ value: 'First digit of MJE amount', position: 'insideBottom', offset: -2, fontSize: 10 }} />
                  <YAxis tickFormatter={v => `${v}%`} tick={{ fontSize: 10 }} domain={[0, 35]} />
                  <Tooltip formatter={(v, n) => [`${v.toFixed(1)}%`, n === 'actual' ? 'Observed' : 'Expected']} />
                  <Bar dataKey="expected" fill="#D1D0CB" radius={[3, 3, 0, 0]} name="Expected" />
                  <Bar dataKey="actual" radius={[3, 3, 0, 0]} name="Observed">
                    {benfordData.map((d, i) => {
                      const dev = Math.abs(d.actual - d.expected);
                      return <Cell key={i} fill={dev > 4 ? '#C41E3A' : dev > 2 ? '#4A6070' : '#A7F3D0'} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartPanel>

            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden' }}>
              <TabBar
                tabs={[
                  { id: 'entries', label: 'Top Entries', count: entries.length },
                  { id: 'gl', label: 'GL Reconciliation', count: gl.length },
                  { id: 'reversals', label: 'Reversal Analysis', count: unmatched.length },
                ]}
                active={tab} onChange={setTab} color={COLOR}
              />

              {tab === 'entries' && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '160px 120px 1fr 90px 80px', padding: '8px 16px', background: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border)' }}>
                    {['Entry ID','GL Account','Staff / Flags','Amount','Risk score'].map(h => (
                      <span key={h} style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-3)', fontFamily: 'var(--font-display)' }}>{h}</span>
                    ))}
                  </div>
                  {entries.length === 0 && <EmptyState icon="⊞" title="No entries in data" />}
                  {entries.slice(0, 15).map((e, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '160px 120px 1fr 90px 80px', padding: '10px 16px', borderBottom: '1px solid var(--color-border)', background: i % 2 === 0 ? 'white' : 'var(--color-surface-2)', alignItems: 'center', borderLeft: `3px solid ${scoreColor(e.risk_score || 0)}` }}>
                      <code style={{ fontSize: 11, fontWeight: 700, color: scoreColor(e.risk_score || 0) }}>{e.entry_id}</code>
                      <div>
                        <code style={{ fontSize: 10, color: 'var(--color-text-2)' }}>{e.gl_account}</code>
                        <div style={{ fontSize: 10, color: 'var(--color-text-3)', marginTop: 1 }}>{e.gl_name?.slice(0, 20)}</div>
                      </div>
                      <div>
                        <code style={{ fontSize: 11 }}>{e.staff_id}</code>
                        <div style={{ display: 'flex', gap: 4, marginTop: 3, flexWrap: 'wrap' }}>
                          {(e.flags||[]).includes('After-hours') && <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 5px', background: '#F3F3F1', color: '#4A6070', borderRadius: 3 }}>AFTER-HOURS</span>}
                          {e.sod_violation && <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 5px', background: '#FCEEF1', color: '#C41E3A', borderRadius: 3 }}>SoD</span>}
                          {(e.flags||[]).includes('Round number') && <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 5px', background: '#E8FDF4', color: '#0BBF7A', borderRadius: 3 }}>ROUND</span>}
                        </div>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>LKR {((e.amount_lkr || 0) / 1e6).toFixed(1)}M</span>
                      <div>
                        <ProgressBar value={e.risk_score || 0} max={100} color={scoreColor(e.risk_score || 0)} height={5} valueLabel={`${e.risk_score || 0}/100`} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {tab === 'gl' && (
                <div>
                  {gl.length === 0 && <EmptyState icon="⊞" title="No GL reconciliation data" />}
                  {(gl||[]).map((g, i) => (
                    <div key={i} style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)', background: i % 2 === 0 ? 'white' : 'var(--color-surface-2)' }}>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8 }}>
                        <code style={{ fontSize: 12, fontWeight: 700 }}>{g.gl}</code>
                        <span style={{ fontSize: 11, color: 'var(--color-text-2)', flex: 1 }}>{g.name}</span>
                        <span style={{ fontSize: 13, fontWeight: 900, color: (g.break_lkr || 0) !== 0 ? '#C41E3A' : '#0BBF7A', fontFamily: 'var(--font-display)' }}>
                          {(g.break_lkr || 0) !== 0 ? `BREAK LKR ${((g.break_lkr || 0) / 1e6).toFixed(1)}M` : '✓ Reconciled'}
                        </span>
                      </div>
                      {(g.break_lkr || 0) !== 0 && (
                        <ProgressBar value={Math.abs(g.break_lkr || 0)} max={Math.max(g.gl_balance_lkr || 1, Math.abs(g.break_lkr || 0))} color="#C41E3A" label={`GL: LKR ${((g.gl_balance_lkr || 0)/1e6).toFixed(1)}M vs Sub-ledger: LKR ${((g.sub_ledger_lkr || 0)/1e6).toFixed(1)}M`} valueLabel={`LKR ${(Math.abs(g.break_lkr || 0)/1e6).toFixed(1)}M break`} />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {tab === 'reversals' && (
                <div>
                  <div style={{ padding: '10px 16px', background: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border)', fontSize: 11, color: 'var(--color-text-2)' }}>
                    Total reversals tested: <strong>{rev.total_reversals_tested || 0}</strong> · Unmatched: <strong style={{ color: unmatched.length > 0 ? '#C41E3A' : '#0BBF7A' }}>{unmatched.length}</strong>
                  </div>
                  {unmatched.length === 0 && <EmptyState icon="⊞" title="No unmatched reversals" sub="All reversals traced to originating entries." />}
                  {(unmatched||[]).map((r, i) => (
                    <div key={i} style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-border)', borderLeft: '3px solid #C41E3A' }}>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
                        <code style={{ fontSize: 12, fontWeight: 700 }}>{r.entry_id}</code>
                        <code style={{ fontSize: 11, color: 'var(--color-text-3)' }}>{r.gl_account}</code>
                        <span style={{ marginLeft: 'auto', fontSize: 14, fontWeight: 900, color: '#C41E3A', fontFamily: 'var(--font-display)' }}>LKR {((r.amount_lkr || 0) / 1e6).toFixed(1)}M</span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-2)', lineHeight: 1.6 }}>{r.reversal_finding}</div>
                      {r.recommended_action && <div style={{ marginTop: 6, fontSize: 12, fontWeight: 600, color: '#C41E3A' }}>→ {r.recommended_action}</div>}
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

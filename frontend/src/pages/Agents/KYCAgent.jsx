import React, { useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import AgentModule from '../../components/shared/AgentModule.jsx';
import { VisualFindingCard } from '../../components/shared/VisualComponents.jsx';
import { KPICard, ProgressBar, DataRow, OpinionBanner, TabBar, AgentHeader, ChartPanel, SeverityPill, EmptyState } from '../../components/shared/AgentUI.jsx';
import useOpenFinding from '../../hooks/useOpenFinding.js';
import { demoData, peerBenchmarks } from '../../data/demoData.js';

const COLOR = '#0F6E56';

export default function KYCAgent() {
  const [tab, setTab] = useState('gaps');
  const openFinding = useOpenFinding('kyc');

  return (
    <AgentModule agentId="kyc" agentName="Identity & KYC / AML Agent" agentColor={COLOR} demoData={demoData.kyc} schema={[]}>
      {(data) => {
        const cs = data.compliance_summary || {};
        const gaps = data.kyc_gaps || [];
        const pep = data.pep_findings || [];
        const heatmap = data.branch_compliance_heatmap || [];
        const peers = peerBenchmarks?.kyc || {};

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            <AgentHeader
              name="Identity & KYC / AML Agent"
              icon="✦"
              color={COLOR}
              tagline="47-rule CDD compliance engine across 835,944 accounts — document expiry, PEP EDD status, FATF exposure, beneficial ownership gaps"
              stats={[
                { label: 'Accounts', value: (cs.total_customers_analyzed || 835944).toLocaleString() },
                { label: 'KYC gaps', value: (cs.kyc_gap_count || 39290).toLocaleString(), alert: true },
                { label: 'Gap rate', value: `${cs.kyc_gap_pct || 4.7}%`, alert: (cs.kyc_gap_pct || 4.7) > 2 },
                { label: 'PEP accounts', value: cs.pep_accounts || 34, alert: true },
                { label: 'EDD required', value: cs.edd_required_count || 127, alert: true },
              ]}
            />

            <OpinionBanner
              verdict="QUALIFIED"
              color={COLOR}
              opinion={`In our opinion, the KYC / AML compliance framework is PARTIALLY EFFECTIVE. ${(cs.kyc_gap_count || 39290).toLocaleString()} accounts have material gaps. The ${cs.kyc_gap_pct || 4.7}% gap rate exceeds CBSL's 2% threshold. 34 PEP accounts require immediate EDD review.`}
              methodology={{
                'Population tested': '835,944 customer accounts — 100%',
                'Period covered': 'As at 31 December 2025',
                'Materiality threshold': 'All PEP accounts; gaps on accounts with transactions >LKR 1M in period',
                'Model limitations': 'Third-party PEP database updated quarterly; real-time sanctions screening not within scope',
              }}
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
              <KPICard label="KYC gap accounts" value={(cs.kyc_gap_count || 39290).toLocaleString()} sub={`${cs.kyc_gap_pct || 4.7}% — CBSL limit: 2%`} color="#C41E3A" icon="✦" delta={+(cs.kyc_gap_pct || 4.7) - 2} deltaLabel="% above limit" />
              <KPICard label="PEP accounts" value={cs.pep_accounts || 34} sub={`${cs.pep_related_accounts || 89} related accounts`} color="#C41E3A" />
              <KPICard label="BO gaps" value={cs.beneficial_ownership_gaps || 234} sub="Ownership undisclosed" color="#4A6070" />
              <KPICard label="Overdue refresh" value={(cs.overdue_refresh_count || 12847).toLocaleString()} sub="Documentation expired" color={COLOR} />
            </div>

            <ChartPanel title="Key Findings">
              {(data.key_findings || []).map((f, i) => (
                <VisualFindingCard key={i} finding={f} agentColor={COLOR} index={i} agentId="kyc" agentData={data} openFinding={openFinding} />
              ))}
            </ChartPanel>

            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden' }}>
              <TabBar
                tabs={[
                  { id: 'gaps', label: 'KYC Gaps', count: gaps.length },
                  { id: 'pep', label: 'PEP / EDD', count: pep.length },
                  { id: 'branch', label: 'Branch Heatmap', count: heatmap.length },
                  { id: 'peers', label: 'Peer Benchmarks' },
                ]}
                active={tab} onChange={setTab} color={COLOR}
              />

              {tab === 'gaps' && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr 90px 80px 80px', padding: '8px 16px', background: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border)' }}>
                    {['Customer','Gap type','Days overdue','Transaction vol','Risk'].map(h => (
                      <span key={h} style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-3)', fontFamily: 'var(--font-display)' }}>{h}</span>
                    ))}
                  </div>
                  {gaps.length === 0 && <EmptyState icon="✦" title="No KYC gaps found" />}
                  {gaps.map((g, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '160px 1fr 90px 80px 80px', padding: '10px 16px', borderBottom: '1px solid var(--color-border)', alignItems: 'center', background: i % 2 === 0 ? 'white' : 'var(--color-surface-2)' }}>
                      <code style={{ fontSize: 11, fontWeight: 700, color: COLOR }}>{g.customer_id}</code>
                      <span style={{ fontSize: 11, color: 'var(--color-text-2)', paddingRight: 12 }}>{g.gap_type}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: g.days_overdue > 180 ? '#C41E3A' : '#4A6070', fontFamily: 'var(--font-display)' }}>{g.days_overdue}d</span>
                      <span style={{ fontSize: 11, color: 'var(--color-text-2)' }}>LKR {((g.transaction_volume_lkr || 0) / 1e6).toFixed(0)}M</span>
                      <SeverityPill level={g.risk_rating || 'medium'} />
                    </div>
                  ))}
                </div>
              )}

              {tab === 'pep' && (
                <div>
                  {pep.length === 0 && <EmptyState icon="✦" title="No PEP findings" />}
                  {pep.map((p, i) => (
                    <div key={i} style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-border)', borderLeft: `3px solid ${p.edd_current === 'overdue' ? '#C41E3A' : '#4A6070'}` }}>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
                        <code style={{ fontSize: 12, fontWeight: 800 }}>{p.customer_id}</code>
                        <span style={{ fontSize: 11, color: 'var(--color-text-3)' }}>{p.pep_type}</span>
                        <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, padding: '2px 9px', background: p.edd_current === 'overdue' ? '#FCEEF1' : '#E8FDF4', color: p.edd_current === 'overdue' ? '#C41E3A' : '#0BBF7A', borderRadius: 5 }}>EDD {p.edd_current}</span>
                      </div>
                      <ProgressBar value={p.last_review_days_ago || 0} max={500} color={p.last_review_days_ago > 365 ? '#C41E3A' : '#4A6070'} label="Last review" valueLabel={`${p.last_review_days_ago || 0} days ago`} sublabel={p.action_required} />
                    </div>
                  ))}
                </div>
              )}

              {tab === 'branch' && (
                <div style={{ padding: 16 }}>
                  {heatmap.length === 0 && <EmptyState icon="✦" title="No branch data" />}
                  <ResponsiveContainer width="100%" height={Math.max(200, heatmap.length * 28)}>
                    <BarChart data={heatmap.slice(0, 15)} layout="vertical" margin={{ top: 0, right: 60, bottom: 0, left: 16 }}>
                      <XAxis type="number" domain={[0, 20]} tick={{ fontSize: 10 }} unit="%" />
                      <YAxis type="category" dataKey="branch_code" width={50} tick={{ fontSize: 11 }} />
                      <Tooltip formatter={v => [`${v.toFixed(1)}% gap rate`]} />
                      <Bar dataKey="gap_rate_pct" radius={[0, 5, 5, 0]} label={{ position: 'right', fontSize: 10, formatter: v => `${v.toFixed(1)}%` }}>
                        {heatmap.slice(0, 15).map((d, i) => <Cell key={i} fill={d.gap_rate_pct > 10 ? '#C41E3A' : d.gap_rate_pct > 5 ? '#4A6070' : '#0BBF7A'} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <div style={{ marginTop: 12, display: 'flex', gap: 12 }}>
                    {[['#C41E3A', '>10% — Critical'], ['#4A6070', '5–10% — Review'], ['#0BBF7A', '<5% — OK']].map(([c, l]) => (
                      <span key={l} style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 5, color: 'var(--color-text-2)' }}>
                        <span style={{ width: 10, height: 10, borderRadius: 2, background: c, display: 'inline-block' }} />{l}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {tab === 'peers' && (
                <div>
                  {Object.entries(peers).map(([key, b], i) => {
                    const labels = { kyc_gap_rate: 'KYC Gap Rate (%)', pep_edd_overdue_pct: 'PEP EDD Overdue (%)', str_filing_rate: 'STR Filing Rate (per acct)' };
                    const lowerBetter = ['kyc_gap_rate', 'pep_edd_overdue_pct'].includes(key);
                    const better = lowerBetter ? b.ntb <= b.peer_median : b.ntb >= b.peer_median;
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
                  {Object.keys(peers).length === 0 && <EmptyState icon="✦" title="No peer data" />}
                  <div style={{ padding: '10px 16px', fontSize: 10, color: 'var(--color-text-3)' }}>Source: CBSL AML Compliance Review 2025</div>
                </div>
              )}
            </div>
          </div>
        );
      }}
    </AgentModule>
  );
}

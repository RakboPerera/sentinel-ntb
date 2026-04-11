import React, { useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, LineChart, Line, ReferenceLine } from 'recharts';
import AgentModule from '../../components/shared/AgentModule.jsx';
import ExplainerBox from '../../components/shared/ExplainerBox.jsx';
import InfoTooltip from '../../components/shared/InfoTooltip.jsx';
import { VisualFindingCard } from '../../components/shared/VisualComponents.jsx';
import { KPICard, ProgressBar, DataRow, SectionHeader, FindingRow, OpinionBanner, TabBar, AgentHeader, ChartPanel } from '../../components/shared/AgentUI.jsx';
import useOpenFinding from '../../hooks/useOpenFinding.js';
import { demoData, peerBenchmarks } from '../../data/demoData.js';

const COLOR = '#185FA5';

export default function CreditAgent() {
  const [tab, setTab] = useState('loans');
  const openFinding = useOpenFinding('credit');

  return (
    <AgentModule agentId="credit" agentName="Credit Intelligence Agent" agentColor={COLOR} demoData={demoData.credit} schema={[]}>
      {(data) => {
        const ps = data.portfolio_summary || {};
        const ci = data.capital_impact || {};
        const loans = data.flagged_loans || [];
        const sectors = data.sector_concentration || [];
        const peers = peerBenchmarks?.credit || {};

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            <AgentHeader
              name="Credit Intelligence Agent"
              icon="◈"
              color={COLOR}
              tagline="Isolation Forest across 16,631 loans — scoring DPD, LTV, restructure history, sector risk and override flags simultaneously"
              stats={[
                { label: 'Loans analysed', value: (ps.total_loans_analyzed || 16631).toLocaleString() },
                { label: 'Flagged', value: ps.flagged_count || 89, alert: true },
                { label: 'Critical', value: ps.critical_count || 12, alert: true },
                { label: 'Misstaged', value: ps.misstaged_count || 34, alert: true },
                { label: 'Avg anomaly score', value: `${((ps.avg_anomaly_score || 0.71) * 100).toFixed(0)}/100` },
              ]}
            />

            <OpinionBanner
              verdict="QUALIFIED"
              color={COLOR}
              opinion="In our opinion, SLFRS 9 staging controls are NOT EFFECTIVE at Branch BR-14. 11 loans are misclassified; ECL is understated by approximately LKR 310M. Management staging overrides are statistically impossible without deliberate intent."
              methodology={{
                'Population tested': '16,631 loans — 100% of portfolio',
                'Period covered': 'FY 2025 (Jan–Dec)',
                'Materiality threshold': 'LKR 50M per loan; all loans with override flag',
                'Model limitations': 'Isolation Forest is linear; FLI overlays require separate staging committee review',
              }}
            />

            {/* KPI Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
              <KPICard label="Flagged exposure" value={`LKR ${((ps.flagged_exposure_lkr || 1.41e9) / 1e9).toFixed(2)}Bn`} sub={`${ps.flagged_count || 89} of ${ps.total_loans_analyzed || 16631} loans`} color={COLOR} icon="◈" />
              <KPICard label="ECL understatement" value={`LKR ${((ps.misstaged_exposure_lkr || 1.1e9) / 1e6).toFixed(0)}M`} sub="From stage misclassification" color="#C41E3A" delta={ps.misstaged_count || 34} deltaLabel=" misstaged loans" />
              <KPICard label="CAR impact" value={`−${ci.car_impact_bps || 47}bps`} sub={`${ci.current_tier1_car || 19.06}% → ${ci.if_corrected_stage3_ratio ? (ci.current_tier1_car - (ci.car_impact_bps || 47) / 100).toFixed(2) : 18.59}%`} color="#C41E3A" />
              <KPICard label="Override exposure" value={`LKR ${((ps.flagged_exposure_lkr || 387e6) / 1e6).toFixed(0)}M`} sub="All override-approved, BR-14" color="#4A6070" />
            </div>

            {/* Key Findings */}
            <ChartPanel title="Key Findings" subtitle={`${(data.key_findings || []).length} agent-detected anomaly patterns`}>
              {(data.key_findings || []).length === 0
                ? <div style={{ padding: 16, color: 'var(--color-text-3)', fontSize: 13 }}>No findings detected.</div>
                : (data.key_findings || []).map((f, i) => (
                    <VisualFindingCard key={i} finding={f} agentColor={COLOR} index={i} agentId="credit" agentData={data} openFinding={openFinding} />
                  ))
              }
            </ChartPanel>

            {/* Tabs */}
            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden' }}>
              <TabBar
                tabs={[
                  { id: 'loans', label: 'Flagged Loans', count: loans.length },
                  { id: 'sectors', label: 'Sector Risk', count: sectors.length },
                  { id: 'capital', label: 'Capital Impact' },
                  { id: 'peers', label: 'Peer Benchmarks' },
                ]}
                active={tab} onChange={setTab} color={COLOR}
              />

              {tab === 'loans' && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 80px 70px 70px 1fr', padding: '8px 16px', background: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border)' }}>
                    {['Loan ID','Primary driver','Exposure','Assigned','Required','Anomaly score'].map(h => (
                      <span key={h} style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-3)', fontFamily: 'var(--font-display)' }}>{h}</span>
                    ))}
                  </div>
                  {loans.slice(0, 12).map((l, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 80px 70px 70px 1fr', padding: '11px 16px', borderBottom: '1px solid var(--color-border)', background: i % 2 === 0 ? 'white' : 'var(--color-surface-2)', alignItems: 'center' }}>
                      <code style={{ fontSize: 11, fontWeight: 700, color: COLOR }}>{l.loan_id}</code>
                      <span style={{ fontSize: 11, color: 'var(--color-text-2)', paddingRight: 12 }}>{l.primary_driver}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>LKR {((l.exposure_lkr || 0) / 1e6).toFixed(0)}M</span>
                      <span style={{ fontSize: 11, padding: '2px 8px', background: '#E8FDF4', color: '#0BBF7A', borderRadius: 5, fontWeight: 700, width: 'fit-content' }}>S{l.assigned_stage}</span>
                      <span style={{ fontSize: 11, padding: '2px 8px', background: '#FCEEF1', color: '#C41E3A', borderRadius: 5, fontWeight: 700, width: 'fit-content' }}>S{l.predicted_stage}</span>
                      <div>
                        <ProgressBar value={l.anomaly_score || 0} max={1} color={l.anomaly_score >= 0.85 ? '#C41E3A' : l.anomaly_score >= 0.65 ? COLOR : '#9A9893'} height={5} valueLabel={`${((l.anomaly_score || 0) * 100).toFixed(0)}/100`} />
                      </div>
                    </div>
                  ))}
                  {loans.length === 0 && <div style={{ padding: 32, textAlign: 'center', color: 'var(--color-text-3)' }}>No flagged loans in current data.</div>}
                </div>
              )}

              {tab === 'sectors' && (
                <div style={{ padding: 20 }}>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={sectors} layout="vertical" margin={{ top: 0, right: 80, bottom: 0, left: 16 }}>
                      <XAxis type="number" tickFormatter={v => `LKR ${(v / 1e9).toFixed(1)}Bn`} tick={{ fontSize: 10 }} />
                      <YAxis type="category" dataKey="sector" width={100} tick={{ fontSize: 11 }} />
                      <Tooltip formatter={v => [`LKR ${(v / 1e9).toFixed(2)}Bn`, 'Flagged exposure']} />
                      <Bar dataKey="flagged_exposure_lkr" radius={[0, 6, 6, 0]} label={{ position: 'right', fontSize: 10, formatter: v => `LKR ${(v / 1e9).toFixed(1)}Bn` }}>
                        {(sectors||[]).map((s, i) => <Cell key={i} fill={s.npl_rate_pct > 15 ? '#C41E3A' : s.npl_rate_pct > 8 ? COLOR : '#0BBF7A'} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  {(sectors||[]).map((s, i) => (
                    <DataRow key={i} even={i % 2 !== 0}
                      label={s.sector}
                      sub={`${s.flagged_count} flagged loans · avg anomaly ${((s.avg_anomaly_score || 0) * 100).toFixed(0)}/100`}
                      value={`${s.npl_rate_pct}% NPL`}
                      valueColor={s.npl_rate_pct > 15 ? '#C41E3A' : s.npl_rate_pct > 8 ? '#4A6070' : '#0BBF7A'}
                      badge={s.npl_rate_pct > 15 ? 'HIGH RISK' : s.npl_rate_pct > 8 ? 'WATCH' : 'OK'}
                      badgeColor={s.npl_rate_pct > 15 ? '#C41E3A' : s.npl_rate_pct > 8 ? '#4A6070' : '#0BBF7A'}
                    />
                  ))}
                </div>
              )}

              {tab === 'capital' && (
                <div style={{ padding: 20 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
                    <KPICard label="Current Tier 1 CAR" value={`${ci.current_tier1_car || 19.06}%`} sub="Reported as at 31 Dec 2025" color="#0BBF7A" />
                    <KPICard label="Corrected Tier 1 CAR" value={`${((ci.current_tier1_car || 19.06) - ((ci.car_impact_bps || 47) / 100)).toFixed(2)}%`} sub="After ECL restatement" color="#C41E3A" delta={-(ci.car_impact_bps || 47)} deltaLabel="bps" />
                  </div>
                  <ProgressBar value={ci.rwa_increase_lkr || 4.2e9} max={20e9} color="#C41E3A" label="Additional RWA" valueLabel={`LKR ${((ci.rwa_increase_lkr || 4.2e9) / 1e9).toFixed(1)}Bn`} sublabel="Basel III risk-weighted impact of corrected staging" />
                  <ProgressBar value={ci.ecl_restatement_lkr || 310e6} max={2e9} color="#4A6070" label="ECL Restatement" valueLabel={`LKR ${((ci.ecl_restatement_lkr || 310e6) / 1e6).toFixed(0)}M`} sublabel="Provision shortfall from stage misclassification" />
                  {(ci.car_impact_bps || 47) >= 50 && (
                    <div style={{ marginTop: 16, padding: '12px 16px', background: '#FCEEF1', borderRadius: 10, border: '1px solid rgba(196,30,58,0.25)', fontSize: 13, color: '#C41E3A', fontWeight: 600 }}>
                      ⚠ Impact of {ci.car_impact_bps || 47}bps exceeds CBSL's 50bps notification threshold — Board notification required.
                    </div>
                  )}
                </div>
              )}

              {tab === 'peers' && (
                <div>
                  <SectionHeader title="NTB vs Licensed Commercial Bank Peers" sub="Source: CBSL Banking Sector Report Q3 2025" color={COLOR} />
                  {Object.entries(peers).map(([key, b], i) => {
                    const labels = { stage3_ratio: 'Stage 3 Ratio (%)', ecl_coverage: 'ECL Coverage (%)', loan_growth_yoy: 'Loan Growth YoY (%)', override_rate: 'Override Rate (%)' };
                    const lowerBetter = ['stage3_ratio', 'override_rate'].includes(key);
                    const better = lowerBetter ? b.ntb <= b.peer_median : b.ntb >= b.peer_median;
                    return (
                      <DataRow key={key} even={i % 2 !== 0}
                        label={labels[key] || key}
                        sub={`Peer median: ${b.peer_median} · Best: ${b.peer_best} · Worst: ${b.peer_worst}`}
                        value={`${b.ntb}`}
                        valueColor={better ? '#0BBF7A' : '#C41E3A'}
                        badge={better ? '✓ Better' : '✗ Weaker'}
                        badgeColor={better ? '#0BBF7A' : '#C41E3A'}
                      />
                    );
                  })}
                  {Object.keys(peers).length === 0 && <div style={{ padding: 24, textAlign: 'center', color: 'var(--color-text-3)' }}>No peer data available.</div>}
                </div>
              )}
            </div>
          </div>
        );
      }}
    </AgentModule>
  );
}

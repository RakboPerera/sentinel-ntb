import React, { useState } from 'react';
import AgentModule, { SeverityBadge } from '../../components/shared/AgentModule.jsx';
import { VisualFindingCard, StatCard, InsightBox } from '../../components/shared/VisualComponents.jsx';
import ExplainerBox, { InlineExplainer } from '../../components/shared/ExplainerBox.jsx';
import { DetectionSteps } from '../../components/shared/FeatureContribution.jsx';
import InfoTooltip from '../../components/shared/InfoTooltip.jsx';
import { demoData } from '../../data/demoData.js';
import useOpenFinding from '../../hooks/useOpenFinding.js';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';

const COLOR = '#534AB7';

const SCHEMA = {
  agentName: 'Transaction Surveillance',
  required: ['transaction_id', 'account_id', 'amount_lkr', 'transaction_type', 'timestamp'],
  optional: ['channel', 'counterparty_account', 'counterparty_bank', 'city', 'device_id'],
};

const DETECTION_STEPS = [
  { title: "Benford's Law population test", text: "Compute the first-digit frequency distribution across all 284,719 transactions. Compare against Benford's expected distribution using a chi-squared test.", result: "First digit '4' at 18.3% vs expected 9.7% — p-value 0.003 (highly significant)" },
  { title: 'Structuring cluster detection', text: "For each account, identify clusters where: (a) all individual transactions are below LKR 5M, (b) 3+ transactions occur within 24 hours, (c) combined total exceeds LKR 5M. Score each cluster 0–1.", result: "7 structuring clusters detected across the population" },
  { title: 'Velocity anomaly scoring', text: "Compare each account's recent transaction count and volume against its own 90-day rolling baseline. Accounts transacting at >3× baseline are flagged; >10× are critical.", result: "5 accounts with velocity multiples between 3.7× and 15.7×" },
  { title: 'Network graph analysis', text: "Build a directed transaction graph. Accounts where >70% of outflows go to the same 1–3 counterparties are flagged for hub-and-spoke layering — a common money laundering pattern.", result: "SUS-017 and NTB-0841-X show 89–97% counterparty concentration" },
];

const BENFORD_DATA = [
  { digit: '1', expected: 30.1, actual: 28.4, deviation: -1.7 },
  { digit: '2', expected: 17.6, actual: 16.9, deviation: -0.7 },
  { digit: '3', expected: 12.5, actual: 11.8, deviation: -0.7 },
  { digit: '4', expected: 9.7,  actual: 18.3, deviation: +8.6 },
  { digit: '5', expected: 7.9,  actual: 7.2,  deviation: -0.7 },
  { digit: '6', expected: 6.7,  actual: 6.1,  deviation: -0.6 },
  { digit: '7', expected: 5.8,  actual: 5.4,  deviation: -0.4 },
  { digit: '8', expected: 5.1,  actual: 4.6,  deviation: -0.5 },
  { digit: '9', expected: 4.6,  actual: 1.3,  deviation: -3.3 },
];

function StructuringTimeline({ cluster }) {
  // Fake intra-cluster timing (22 minutes, 15 transactions)
  const txns = Array.from({ length: Math.min(cluster.cluster_transactions, 15) }, (_, i) => ({
    minute: Math.floor((i / (cluster.cluster_transactions - 1)) * cluster.cluster_timespan_minutes),
    amount: cluster.max_single_txn_lkr * (0.93 + Math.random() * 0.07),
    t: i,
  }));
  const THRESHOLD = 5000000;
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-text-3)' }}>Transaction timing</span>
        <InfoTooltip text="Each bar represents one transaction, plotted by minute within the 22-minute window. All fall below LKR 5M (the red threshold line) — this precision is the structuring signature." width={260} position="right" />
      </div>
      <div style={{ position: 'relative', height: 80, border: '1px solid var(--color-border)', borderRadius: 8, overflow: 'hidden', background: 'var(--color-surface-2)' }}>
        {/* Threshold line */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: '8%', borderTop: '1.5px dashed #A32D2D', zIndex: 2 }}>
          <span style={{ position: 'absolute', right: 4, top: -10, fontSize: 9, color: '#A32D2D', fontWeight: 600 }}>LKR 5M threshold</span>
        </div>
        {/* Bars */}
        {txns.map((t, i) => {
          const x = (t.minute / cluster.cluster_timespan_minutes) * 100;
          const h = (t.amount / THRESHOLD) * 80;
          return (
            <div key={i} title={`T+${t.minute}min: LKR ${(t.amount/1e6).toFixed(2)}M`}
              style={{ position: 'absolute', left: `${x}%`, bottom: 0, width: 5, height: `${h}%`, background: '#534AB7', borderRadius: '2px 2px 0 0', opacity: 0.8 }} />
          );
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--color-text-3)', marginTop: 4 }}>
        <span>T+0 min</span><span>T+{cluster.cluster_timespan_minutes} min</span>
      </div>
    </div>
  );
}

export default function TransactionAgent() {
  const [activeTab, setActiveTab] = useState('structuring');
  const data = demoData.transaction;

  const openFinding = useOpenFinding('transaction');
  return (
    <AgentModule agentId="transaction" agentName="Transaction Surveillance Agent" agentColor={COLOR} demoData={demoData.transaction} schema={SCHEMA}>
      {(data) => (
        <>
          <ExplainerBox
            color={COLOR}
            icon="⟳"
            title="How this agent detects suspicious transaction patterns"
            summary="Combines Benford's Law (population-level amount manipulation), velocity analysis (account-level baseline deviation), and network graph analysis (counterparty concentration)."
            detail={<DetectionSteps steps={DETECTION_STEPS} color={COLOR} />}
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {[
              { label: 'Transactions Analysed', value: data.surveillance_summary.total_transactions_analyzed.toLocaleString(), sub: `LKR ${(data.surveillance_summary.total_volume_lkr / 1e9).toFixed(1)} Bn volume`, color: COLOR, tooltip: 'All digital and branch transactions in the analysis window. Includes CEFT, RTGS, ATM, POS, and mobile banking. Each transaction is scored individually and as part of account-level clustering.' },
              { label: 'Structuring Clusters', value: data.surveillance_summary.structuring_clusters, sub: 'Benford deviation detected', color: '#854F0B', tooltip: 'Groups of transactions that individually fall below the LKR 5M STR threshold but collectively exceed it — a pattern called structuring or smurfing. FTRA Section 7 makes structuring a criminal offence.' },
              { label: 'STR Eligible', value: data.surveillance_summary.str_eligible_count, sub: 'CBSL FIU filing required', color: '#A32D2D', tooltip: 'Accounts meeting CBSL FIU criteria for a Suspicious Transaction Report under the Financial Transactions Reporting Act. NTB must file within 5 working days of identification.', alert: 'File within 5 working days' },
              { label: 'High Risk Accounts', value: data.surveillance_summary.high_risk_accounts, sub: `${data.surveillance_summary.flagged_transactions} total flagged transactions`, color: '#EF9F27', tooltip: 'Accounts with velocity multiples > 3× their 90-day baseline, or counterparty concentration > 70% (hub-and-spoke pattern), or participating in a detected structuring cluster.' },
            ].map((s, i) => <StatCard key={i} {...s} />)}
          </div>

          <div className="agent-panel">
            <div className="agent-panel-header"><span className="agent-panel-title">Key Findings</span></div>
            <div className="agent-panel-body">
              {(data.key_findings || []).map((f, i) => <VisualFindingCard key={i} finding={f} agentColor={COLOR} index={i} agentId="transaction" agentData={data} openFinding={openFinding} />)}
            </div>
          </div>

          <div className="agent-grid">
            {/* Benford's Law chart */}
            <div className="agent-panel">
              <div className="agent-panel-header">
                {/* Audit Opinion Banner */}
            <div style={{ background:'#A32D2D06', border:`1px solid #A32D2D22`, borderRadius:10, overflow:'hidden' }}>
              <div style={{ padding:'12px 16px', display:'flex', gap:10, alignItems:'flex-start' }}>
                <div style={{ fontSize:10, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.08em', padding:'3px 9px', borderRadius:5, background:'#A32D2D', color:'white', flexShrink:0, marginTop:2 }}>
                  ADVERSE
                </div>
                <div style={{ fontSize:12, color:'#A32D2D', lineHeight:1.7 }}>
                  In our opinion, the AML transaction monitoring control environment is NOT EFFECTIVE. Structuring activity is confirmed at 4 accounts. 4 STR-eligible cases must be filed within 5 working days under FTRA.
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', borderTop:`1px solid #A32D2D18` }}>
                {[['Population tested','284,719 transactions (100%)'],['Period covered','FY 2025 (Jan–Dec)'],['Materiality threshold','LKR 5M STR threshold; velocity anomalies ≥3× 90-day baseline'],['Model limitations','Benford&#39;s Law requires sufficient volume per account; new accounts (&lt;90 days) excluded from velocity baseline']].map(([k,v],i)=>(
                  <div key={i} style={{ padding:'7px 16px', borderRight:i%2===0?`1px solid #A32D2D12`:'none', borderBottom:i<2?`1px solid #A32D2D12`:'none' }}>
                    <div style={{ fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'#A32D2D', opacity:0.65, marginBottom:2 }}>{k}</div>
                    <div style={{ fontSize:11, color:'#A32D2D', lineHeight:1.5 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className="agent-panel-title">Benford&#39;s Law Analysis</span>
                  <InfoTooltip text="Benford's Law states that in natural transaction data, first digits follow a predictable logarithmic distribution: '1' appears ~30%, '9' appears ~4.6%. When transactions are artificially constructed (e.g. structured below a threshold), this distribution breaks — creating detectable spikes." width={300} position="bottom" />
                </div>
                {data.benford_analysis.deviation_detected && (
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', background: '#FCEBEB', color: '#A32D2D', borderRadius: 4 }}>ANOMALY DETECTED</span>
                )}
              </div>
              <div style={{ padding: '12px 8px 0' }}>
                <ResponsiveContainer width="100%" height={190}>
                  <BarChart data={BENFORD_DATA} margin={{ top: 4, right: 8, bottom: 4, left: -24 }}>
                    <XAxis dataKey="digit" tick={{ fontSize: 11 }} label={{ value: 'First digit', position: 'insideBottom', offset: -2, fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 10 }} unit="%" />
                    <Tooltip formatter={(v, n) => [`${v}%`, n === 'actual' ? 'Actual (NTB)' : 'Expected (Benford)']} />
                    <Bar dataKey="expected" fill={`${COLOR}25`} name="expected" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="actual" name="actual" radius={[2, 2, 0, 0]}>
                      {BENFORD_DATA.map((d, i) => <Cell key={i} fill={d.digit === '4' ? '#A32D2D' : Math.abs(d.deviation) > 2 ? '#EF9F27' : COLOR} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div style={{ padding: '0 8px 12px' }}>
                  <InlineExplainer color="#A32D2D" text={`Digit "4" appears at 18.3% vs expected 9.7% — an 89% excess. This means transactions in the LKR 4.0M–4.99M range are being deliberately created just below the LKR 5M STR threshold. Chi-squared p-value: 0.003 (highly significant — not random).`} />
                </div>
              </div>
            </div>

            {/* Tabbed findings */}
            <div className="agent-panel">
              <div className="agent-panel-header" style={{ padding: 0, gap: 0 }}>
                {[['structuring','Structuring Clusters'],['velocity','Velocity Anomalies'],['str','STR Queue']].map(([tab, label]) => (
                  <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '12px 16px', fontSize: 12, fontWeight: 500, background: activeTab === tab ? 'var(--color-surface-2)' : 'none', borderBottom: activeTab === tab ? `2px solid ${COLOR}` : '2px solid transparent', color: activeTab === tab ? COLOR : 'var(--color-text-2)', cursor: 'pointer', border: 'none', flex: 1 }}>
                    {label}
                  </button>
                ))}
              </div>
              <div style={{ overflowY: 'auto', maxHeight: 500 }}>
                {activeTab === 'structuring' && (data.structuring_clusters || []).map((cl, i) => (
                  <div key={i} style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                      <code style={{ fontSize: 12, fontWeight: 700 }}>{cl.account_id}</code>
                      <span style={{ fontSize: 11, padding: '2px 8px', background: cl.structuring_score >= 0.9 ? 'var(--color-red-light)' : 'var(--color-amber-light)', color: cl.structuring_score >= 0.9 ? 'var(--color-red)' : 'var(--color-amber)', borderRadius: 4, fontWeight: 600 }}>Score {cl.structuring_score.toFixed(2)}</span>
                      {cl.str_eligible && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', background: '#A32D2D', color: 'white', borderRadius: 4 }}>STR</span>}
                      <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 600, color: 'var(--color-text-2)' }}>LKR {(cl.combined_amount_lkr/1e6).toFixed(1)}M</span>
                    </div>
                    <StructuringTimeline cluster={cl} />
                    <div style={{ marginTop: 10, fontSize: 12, color: 'var(--color-text-2)', lineHeight: 1.5, padding: '8px 12px', background: 'var(--color-surface-2)', borderRadius: 6 }}>
                      {cl.explanation}
                    </div>
                    <div style={{ marginTop: 8, display: 'flex', gap: 14, fontSize: 11, color: 'var(--color-text-3)' }}>
                      <span>{cl.cluster_transactions} txns in {cl.cluster_timespan_minutes} min</span>
                      <span>Max single: LKR {(cl.max_single_txn_lkr/1e6).toFixed(2)}M</span>
                    </div>
                  </div>
                ))}

                {activeTab === 'velocity' && (data.velocity_anomalies || []).map((v, i) => (
                  <div key={i} style={{ display: 'flex', gap: 14, padding: '12px 16px', borderBottom: '1px solid var(--color-border)', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <code style={{ fontSize: 12, fontWeight: 700 }}>{v.account_id}</code>
                      <div style={{ marginTop: 6 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--color-text-3)', marginBottom: 4 }}>
                          <span>Baseline: {v.implied_baseline_count} txns</span>
                          <span>Actual: {v.txn_count_in_window} txns</span>
                        </div>
                        <div style={{ height: 8, borderRadius: 4, background: 'var(--color-surface-2)', overflow: 'hidden', position: 'relative' }}>
                          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${(v.implied_baseline_count / v.txn_count_in_window) * 100}%`, background: '#3B6D11', opacity: 0.5 }} />
                          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '100%', background: v.velocity_multiple >= 10 ? '#A32D2D' : '#EF9F27', opacity: 0.4 }} />
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--color-text-2)', marginTop: 4 }}>
                          LKR {(v.total_volume_lkr/1e6).toFixed(0)}M volume
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 20, fontWeight: 800, color: v.velocity_multiple >= 10 ? '#A32D2D' : '#EF9F27', fontVariantNumeric: 'tabular-nums' }}>{v.velocity_multiple}×</div>
                      <div style={{ fontSize: 10, color: 'var(--color-text-3)' }}>above baseline</div>
                      <SeverityBadge severity={v.risk_flag} />
                    </div>
                  </div>
                ))}

                {activeTab === 'str' && (
                  <>
                    <div style={{ padding: '10px 16px', background: 'var(--color-amber-light)', borderBottom: '1px solid var(--color-border)', fontSize: 12, color: 'var(--color-amber)', lineHeight: 1.5 }}>
                      <strong>CBSL FIU requirement:</strong> STRs must be filed within 5 working days of identifying a suspicious transaction under Sri Lanka's Financial Transactions Reporting Act (FTRA). Failure to file is a criminal offence.
                    </div>
                    {(data.str_queue || []).map((str, i) => (
                      <div key={i} style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-border)', background: str.urgency === 'immediate' ? '#FEF0F0' : 'transparent' }}>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                          <code style={{ fontSize: 12, fontWeight: 700 }}>{str.account_id}</code>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', background: str.urgency === 'immediate' ? '#A32D2D' : '#854F0B', color: 'white', borderRadius: 4 }}>{str.urgency.replace('_', ' ')}</span>
                          <span style={{ marginLeft: 'auto', fontSize: 14, fontWeight: 800, color: '#A32D2D', fontVariantNumeric: 'tabular-nums' }}>LKR {(str.amount_lkr/1e6).toFixed(0)}M</span>
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--color-text-2)', lineHeight: 1.6 }}>{str.str_grounds}</div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}
      </AgentModule>
  );
}

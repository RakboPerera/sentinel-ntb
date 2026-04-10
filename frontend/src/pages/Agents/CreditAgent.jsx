import React, { useState } from 'react';
import AgentModule from '../../components/shared/AgentModule.jsx';
import AnomalyScoreMeter from '../../components/shared/AnomalyScoreMeter.jsx';
import ExplainerBox from '../../components/shared/ExplainerBox.jsx';
import FeatureContribution, { DetectionSteps } from '../../components/shared/FeatureContribution.jsx';
import InfoTooltip from '../../components/shared/InfoTooltip.jsx';
import { VisualFindingCard, InsightBox, StatCard } from '../../components/shared/VisualComponents.jsx';
import { CoverageStatement } from '../../components/shared/VisualComponents.jsx';
import { demoData } from '../../data/demoData.js';
import useOpenFinding from '../../hooks/useOpenFinding.js';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { ChevronDown, ChevronUp, Zap, AlertTriangle } from 'lucide-react';

const COLOR = '#185FA5';

const SCHEMA = {
  agentName: 'Credit Intelligence',
  required: ['loan_id', 'exposure_lkr', 'assigned_stage', 'dpd_days', 'collateral_ratio'],
  optional: ['restructure_count', 'sector', 'branch_code', 'override_flag', 'origination_quarter', 'customer_risk_rating'],
};

const DETECTION_STEPS = [
  { title: 'Feature extraction', text: 'For each loan: extract 8 features — DPD days, collateral ratio, restructure count, sector NPL rate, exposure vs cohort median, override flag, origination quarter, customer risk rating.', result: '16,631 loans × 8 features = 133,048 data points' },
  { title: 'Isolation Forest scoring', text: 'The algorithm builds random decision trees. Anomalous points are isolated quickly (short tree paths) because their feature combination deviates from stage-peers. This catches multivariate patterns invisible to simple rules.', result: 'Each loan receives an anomaly score 0.0–1.0' },
  { title: 'SLFRS 9 staging validation', text: 'The model\'s predicted stage (from the feature combination) is compared to the assigned stage. A predicted stage higher than assigned means the loan\'s feature profile matches a higher-risk stage — flagged for Staging Committee review.', result: '34 loans predicted at a higher stage than currently assigned' },
  { title: 'Vintage cohort analysis', text: 'Loans grouped by origination quarter. Within each cohort, default rate at equivalent maturity is compared against historical cohorts. Detects underwriting quality deterioration during high-growth periods.', result: 'Q3–Q4 2025 cohorts defaulting at 1.7–1.8× prior year rate at same maturity' },
];

const LOAN_FEATURES = {
  'NTB-CR-2025-0441': [
    { name: 'DPD 67d — approaching Stage 3 boundary of 90d', contribution: 0.31 },
    { name: 'Collateral ratio 0.38 — below Stage 3 threshold 0.40', contribution: 0.28 },
    { name: 'Restructure count 2 — Stage 3 trigger under SLFRS 9', contribution: 0.22 },
    { name: 'Construction NPL 3.2% — 3.5× portfolio average', contribution: 0.12 },
    { name: 'Override-approved (elevated scrutiny flag)', contribution: 0.07 },
  ],
  'NTB-CR-2025-0872': [
    { name: 'DPD 88d — 2 days from Stage 3 threshold', contribution: 0.38 },
    { name: 'Agriculture off-harvest seasonal risk', contribution: 0.28 },
    { name: 'Collateral is crop inventory (seasonal decline)', contribution: 0.22 },
    { name: 'Provision cover insufficient at Stage 2', contribution: 0.12 },
  ],
  'NTB-CR-2025-1203': [
    { name: 'Construction sector NPL 3.2% (sector risk)', contribution: 0.34 },
    { name: 'LTV 81% — approaching Stage 2 boundary', contribution: 0.29 },
    { name: 'Property market cooling — valuation at risk', contribution: 0.24 },
    { name: 'Override-approved without independent valuation', contribution: 0.13 },
  ],
};

// Stage badge definitions
const STAGE_META = {
  1: { label: 'S1', bg: '#E6F1FB', color: COLOR, tooltip: 'Stage 1 — Performing. No significant increase in credit risk since origination. DPD < 30 days, collateral ratio ≥ 0.70, restructure count = 0. ECL provision is 12-month expected loss only.' },
  2: { label: 'S2', bg: '#FAEEDA', color: '#854F0B', tooltip: 'Stage 2 — Significant increase in credit risk. DPD 30–89 days, OR collateral ratio 0.40–0.70, OR 1 restructuring. ECL provision expands to lifetime expected loss — materially higher than Stage 1.' },
  3: { label: 'S3', bg: '#FCEBEB', color: '#A32D2D', tooltip: 'Stage 3 — Credit-impaired. DPD ≥ 90 days, OR collateral ratio < 0.40, OR restructure count ≥ 2, OR legal action served. Maximum ECL provision — typically 66.7%+ of exposure.' },
};

function StageBadge({ stage }) {
  const meta = STAGE_META[stage] || STAGE_META[1];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700, background: meta.bg, color: meta.color }}>
      {meta.label}
      <InfoTooltip text={meta.tooltip} position="right" width={280} />
    </span>
  );
}

function OvrBadge() {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 9, fontWeight: 700, padding: '1px 5px', background: '#FAEEDA', color: '#854F0B', borderRadius: 3 }}>
      OVR
      <InfoTooltip text="Override-approved — this loan bypassed standard approval controls and was approved via a management override. Override-approved loans receive elevated scrutiny because they fall outside standard underwriting parameters." position="right" width={260} />
    </span>
  );
}

function LoanDetailExpanded({ loan }) {
  const features = LOAN_FEATURES[loan.loan_id] || [
    { name: loan.primary_driver, contribution: 0.45 },
    { name: loan.secondary_driver, contribution: 0.30 },
    { name: 'Sector risk profile', contribution: 0.15 },
    { name: 'Origination period quality', contribution: 0.10 },
  ];

  return (
    <div className="animate-fade-in" style={{ background: 'var(--color-surface-2)', borderTop: '1px solid var(--color-border)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0 }}>
        {/* Col 1 — Score breakdown */}
        <div style={{ padding: '16px 20px', borderRight: '1px solid var(--color-border)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-text-3)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            Anomaly Score Breakdown
            <InfoTooltip text="The anomaly score reflects how statistically unusual this loan's feature combination is within its stage-peer group. Computed by Isolation Forest across 8 features." position="right" width={260} />
          </div>
          <AnomalyScoreMeter score={loan.anomaly_score} color={COLOR} />
          <div style={{ marginTop: 16 }}>
            <FeatureContribution features={features} color={COLOR} />
          </div>
        </div>

        {/* Col 2 — Agent reasoning */}
        <div style={{ padding: '16px 20px', borderRight: '1px solid var(--color-border)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-text-3)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            Agent Reasoning
            <InfoTooltip text="The agent's natural-language explanation of why this loan was flagged. It describes which specific feature values deviate from the expected range for loans in this stage." position="right" width={240} />
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-text)', lineHeight: 1.8, padding: '12px 14px', background: 'white', borderRadius: 8, border: '1px solid var(--color-border)' }}>
            {loan.explanation}
          </div>
          <div style={{ marginTop: 10, padding: '8px 12px', background: `${COLOR}08`, borderRadius: 6, fontSize: 11, color: 'var(--color-text-2)' }}>
            <strong style={{ color: COLOR }}>Secondary driver:</strong> {loan.secondary_driver}
          </div>
        </div>

        {/* Col 3 — Action */}
        <div style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-text-3)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            Staging Decision
            <InfoTooltip text="Based on the feature combination, the model's predicted stage and the recommended action. The Staging Committee must review and either confirm or correct the classification." position="left" width={260} />
          </div>
          {/* Stage comparison */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, padding: '12px', background: 'white', borderRadius: 8, border: '1px solid var(--color-border)' }}>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: 10, color: 'var(--color-text-3)', marginBottom: 4 }}>ASSIGNED</div>
              <StageBadge stage={loan.assigned_stage} />
            </div>
            <div style={{ fontSize: 18, color: 'var(--color-red)', fontWeight: 700 }}>→</div>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: 10, color: 'var(--color-text-3)', marginBottom: 4 }}>PREDICTED</div>
              <StageBadge stage={loan.predicted_stage} />
            </div>
          </div>
          <div style={{ padding: '12px 14px', background: loan.predicted_stage === 3 ? 'var(--color-red-light)' : 'var(--color-amber-light)', borderRadius: 8, borderLeft: `3px solid ${loan.predicted_stage === 3 ? 'var(--color-red)' : 'var(--color-amber)'}` }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: loan.predicted_stage === 3 ? 'var(--color-red)' : 'var(--color-amber)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>
              <Zap size={11} style={{ display: 'inline', marginRight: 4 }} />Recommended action
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-text)', lineHeight: 1.6 }}>{loan.recommended_action}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoanRow({ loan }) {
  const [expanded, setExpanded] = useState(false);
  const isMisstaged = loan.predicted_stage !== loan.assigned_stage;
  const isCritical = loan.anomaly_score >= 0.85;
  const rowBg = expanded ? `${COLOR}06` : isCritical ? '#FDFAFA' : 'transparent';

  return (
    <>
      <tr style={{ cursor: 'pointer', background: rowBg, transition: 'background 0.12s', borderLeft: isCritical ? '3px solid var(--color-red)' : '3px solid transparent' }}
        onClick={() => setExpanded(e => !e)}>
        <td>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {expanded ? <ChevronUp size={13} style={{ color: COLOR }} /> : <ChevronDown size={13} style={{ color: 'var(--color-text-3)' }} />}
            <code style={{ fontSize: 12 }}>{loan.loan_id}</code>
            {loan.override_flag && <OvrBadge />}
          </div>
        </td>
        <td style={{ fontVariantNumeric: 'tabular-nums', fontSize: 12, fontWeight: 500 }}>
          LKR {(loan.exposure_lkr / 1e6).toFixed(0)}M
        </td>
        <td>
          <StageBadge stage={loan.assigned_stage} />
        </td>
        <td>
          {isMisstaged ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '2px 9px', borderRadius: 4, fontSize: 11, fontWeight: 700, background: '#FCEBEB', color: '#A32D2D', border: '1px solid rgba(163,45,45,0.2)' }}>
              <AlertTriangle size={10} />→ S{loan.predicted_stage}
            </span>
          ) : (
            <span style={{ fontSize: 11, color: 'var(--color-text-3)' }}>—</span>
          )}
        </td>
        <td style={{ width: 160 }}>
          <AnomalyScoreMeter score={loan.anomaly_score} color={COLOR} size="sm" showZones={false} />
        </td>
        <td style={{ fontSize: 11, color: 'var(--color-text-2)', maxWidth: 240 }}>
          <span title={loan.primary_driver}>{loan.primary_driver.length > 48 ? loan.primary_driver.substring(0, 48) + '…' : loan.primary_driver}</span>
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={6} style={{ padding: 0 }}>
            <LoanDetailExpanded loan={loan} />
          </td>
        </tr>
      )}
    </>
  );
}

export default function CreditAgent() {
  const openFinding = useOpenFinding('credit');
  return (
    <AgentModule agentId="credit" agentName="Credit Intelligence Agent" agentColor={COLOR} demoData={demoData.credit} schema={SCHEMA}>
      {(data) => (
        <>
          {/* Detection methodology */}
          <ExplainerBox color={COLOR} icon="◈"
            title="How this agent detects SLFRS 9 staging anomalies"
            summary="Isolation Forest identifies loans where the combination of DPD, collateral ratio, sector risk, and restructuring history is statistically inconsistent with their assigned SLFRS 9 stage. No single rule triggers a flag — it's the multivariate combination."
            detail={<DetectionSteps steps={DETECTION_STEPS} color={COLOR} />}
            collapsible defaultExpanded={false}
          />

          {/* KPI strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            <StatCard label="Loans Analysed" value={data.portfolio_summary.total_loans_analyzed.toLocaleString()}
              sub={`LKR ${(data.portfolio_summary.total_exposure_lkr / 1e9).toFixed(1)} Bn total exposure`}
              color={COLOR} tooltip="Full NTB loan portfolio scanned. Each loan is scored on 8 features using Isolation Forest. Only loans with anomaly score > 0.65 are flagged for review." />
            <StatCard label="Flagged Loans" value={data.portfolio_summary.flagged_count}
              sub={`LKR ${(data.portfolio_summary.flagged_exposure_lkr / 1e9).toFixed(2)} Bn exposure`}
              color="#EF9F27" tooltip="Loans with anomaly score above 0.65. These loans show feature combinations statistically inconsistent with their assigned SLFRS 9 stage — they deviate significantly from their stage-peers." />
            <StatCard label="Critical" value={data.portfolio_summary.critical_count}
              sub="Anomaly score > 0.85"
              color="#A32D2D" tooltip="Loans scoring above 0.85 — the highest anomaly tier. These require immediate Staging Committee attention. Multiple Stage 3 trigger criteria are present simultaneously." alert="Immediate action required" />
            <StatCard label="Misstaged" value={data.portfolio_summary.misstaged_count}
              sub={`LKR ${(data.portfolio_summary.misstaged_exposure_lkr / 1e9).toFixed(2)} Bn ECL impact`}
              color="#A32D2D"
              tooltip="Loans predicted at a higher SLFRS 9 stage than currently assigned. Correcting these reclassifications increases the Expected Credit Loss (ECL) provision — a regulatory reporting requirement."
              alert={`ECL understated by ~LKR ${(data.portfolio_summary.misstaged_exposure_lkr / 1e9).toFixed(2)} Bn`} />
          </div>

          {/* Key findings */}
          <div className="agent-panel">
            <div className="agent-panel-header">
              {/* Audit Opinion Banner */}
            <div style={{ padding:'10px 16px', background:'#185FA508', border:`1px solid #185FA525`, borderRadius:10, display:'flex', gap:10, alignItems:'flex-start', marginBottom:0 }}>
              <div style={{ fontSize:10, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.08em', padding:'3px 9px', borderRadius:5, background:'#185FA5', color:'white', flexShrink:0, marginTop:1 }}>
                QUALIFIED
              </div>
              <div style={{ fontSize:12, color:'#185FA5', lineHeight:1.65 }}>
                Staging anomalies identified across LKR 1.41Bn of loans. In our opinion, SLFRS 9 staging controls are NOT EFFECTIVE at Branch BR-14. 11 loans are misclassified; ECL is understated by approximately LKR 310M.
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="agent-panel-title">Key Findings</span>
                <InfoTooltip text="Systemic findings derived from collective analysis of all flagged loans — not individual loan alerts. These represent patterns requiring management or regulatory action at the portfolio level." width={280} position="bottom" />
              </div>
            </div>
            <div className="agent-panel-body">
              {(data.key_findings || []).map((f, i) => <VisualFindingCard key={i} finding={f} agentColor={COLOR} index={i} agentId="credit" agentData={data} openFinding={openFinding} />)}
            </div>
          </div>

          {/* Main two-column grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 16 }}>
            {/* LEFT — analytics panels */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Vintage chart */}
              <div className="agent-panel">
                <div className="agent-panel-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className="agent-panel-title">Vintage Cohort Analysis</span>
                    <InfoTooltip text="Loans grouped by the quarter they were originated. Each bar = the projected Stage 3 migration rate for that cohort (% of loans expected to become credit-impaired). Bars are compared at equivalent maturity points — so 2024-Q3 and 2025-Q3 are compared at the same number of months after origination." width={300} position="bottom" />
                  </div>
                </div>
                <div style={{ padding: '12px 8px 0' }}>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={data.vintage_analysis} margin={{ top: 4, right: 8, bottom: 22, left: -18 }}>
                      <XAxis dataKey="cohort" tick={{ fontSize: 10 }} angle={-35} textAnchor="end" interval={0} />
                      <YAxis tick={{ fontSize: 10 }} unit="%" tickFormatter={v => v.toFixed(1)} />
                      <Tooltip formatter={(v) => [`${v}%`, 'Projected S3 migration']} labelFormatter={l => `Cohort: ${l}`} />
                      <ReferenceLine y={1.0} stroke="#EF9F27" strokeDasharray="4 3"
                        label={{ value: 'Historic avg 1.0%', fontSize: 9, fill: '#854F0B', position: 'insideTopRight' }} />
                      <Bar dataKey="projected_stage3_migration_pct" radius={[3, 3, 0, 0]}>
                        {(data.vintage_analysis || []).map((v, i) => (
                          <Cell key={i} fill={v.risk_flag === 'red' ? '#A32D2D' : v.risk_flag === 'amber' ? '#EF9F27' : '#3B6D11'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <InsightBox type="warning"
                    body="Q3–Q4 2025 cohorts (red bars) are defaulting at 1.7–1.8× the rate of equivalent 2024 cohorts at the same loan maturity — a direct consequence of rapid loan growth outpacing underwriting quality controls."
                    compact
                  />
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'center', margin: '10px 0 6px', fontSize: 10, color: 'var(--color-text-2)', flexWrap: 'wrap' }}>
                    {[['#3B6D11','On track'],['#EF9F27','Elevated risk'],['#A32D2D','Deteriorating']].map(([c,l]) => (
                      <span key={l} style={{ display:'flex', alignItems:'center', gap:4 }}><span style={{ width:10,height:10,borderRadius:2,background:c,display:'inline-block' }}/>{l}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sector concentration */}
              <div className="agent-panel">
                <div className="agent-panel-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className="agent-panel-title">Sector Concentration</span>
                    <InfoTooltip text="Industry sectors with the highest share of flagged loans. The bar under each sector name shows the average anomaly score (longer = more anomalous). NPL rate = current non-performing loan rate for this sector in the Sri Lankan banking environment." width={300} position="bottom" />
                  </div>
                </div>
                <div>
                  {(data.sector_concentration || []).map((s, i) => (
                    <div key={i} style={{ padding: '11px 16px', borderBottom: '1px solid var(--color-border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 13, fontWeight: 600 }}>{s.sector}</span>
                          <span style={{ fontSize: 10, padding: '1px 6px', background: s.npl_rate_pct >= 2.5 ? 'var(--color-red-light)' : 'var(--color-amber-light)', color: s.npl_rate_pct >= 2.5 ? 'var(--color-red)' : 'var(--color-amber)', borderRadius: 4, fontWeight: 700 }}>
                            {s.npl_rate_pct}% NPL
                            <InfoTooltip text={`NPL (Non-Performing Loan) rate for the ${s.sector} sector across the Sri Lankan banking industry. A high sector NPL rate elevates the risk of all loans in that sector — SLFRS 9 requires banks to factor in sector-level deterioration when computing expected credit loss.`} position="right" width={280} />
                          </span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: 12, fontWeight: 700 }}>LKR {(s.flagged_exposure_lkr / 1e6).toFixed(0)}M</span>
                          <span style={{ fontSize: 10, color: 'var(--color-text-3)', marginLeft: 6 }}>{s.flagged_count} loans</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--color-surface-2)', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${s.avg_anomaly_score * 100}%`, background: s.avg_anomaly_score >= 0.75 ? '#A32D2D' : '#EF9F27', borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: 10, color: 'var(--color-text-3)', minWidth: 60, textAlign: 'right' }}>
                          score {s.avg_anomaly_score.toFixed(2)}
                          <InfoTooltip text="Average anomaly score for all flagged loans in this sector. A higher average score means the flagged loans are more anomalous relative to their stage-peers." position="left" width={220} />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Branch concentration */}
              <div className="agent-panel">
                <div className="agent-panel-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className="agent-panel-title">Branch Concentration</span>
                    <InfoTooltip text="Branches with the highest count of flagged loans. A branch appearing here with many override-approved flagged loans is a strong insider fraud indicator — it means the branch's override mechanism is being used to approve anomalous loans that wouldn't pass standard controls." width={300} position="bottom" />
                  </div>
                </div>
                <div>
                  {(data.branch_concentration || []).map((b, i) => (
                    <div key={i} style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)', background: b.override_flagged_count >= 8 ? '#FEF9F0' : 'transparent' }}>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 6 }}>
                        <code style={{ fontSize: 13, fontWeight: 800, color: b.override_flagged_count >= 8 ? '#A32D2D' : COLOR }}>{b.branch_code}</code>
                        <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--color-surface-2)', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${(b.flagged_count / 14) * 100}%`, borderRadius: 3, background: b.override_flagged_count >= 8 ? '#A32D2D' : COLOR }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600 }}>LKR {(b.flagged_exposure_lkr / 1e6).toFixed(0)}M</span>
                        {b.override_flagged_count > 0 && (
                          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', background: '#FAEEDA', color: '#854F0B', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 3 }}>
                            {b.override_flagged_count} overrides
                            <InfoTooltip text="Number of flagged loans at this branch that were approved via management override. High override counts combined with anomalous loans are the primary signal of insider-enabled loan fraud." position="left" width={260} />
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 11, lineHeight: 1.5, color: b.risk_signal.startsWith('CRITICAL') ? '#A32D2D' : 'var(--color-text-2)' }}>{b.risk_signal}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT — flagged loans table */}
            <div className="agent-panel" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="agent-panel-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className="agent-panel-title">Flagged Loans</span>
                  <InfoTooltip text="All loans with anomaly score > 0.65. Click any row to see the full anomaly breakdown: score gauge with zone context, SHAP-style feature contribution bars (what drove the score), the agent's natural-language reasoning, and the recommended action for the Staging Committee." width={300} position="bottom" />
                </div>
                <span style={{ fontSize: 11, color: 'var(--color-text-3)' }}>{data.flagged_loans.length} shown · click row to expand</span>
              </div>

              {/* Column header explainer strip */}
              <div style={{ padding: '8px 16px', background: `${COLOR}06`, borderBottom: '1px solid var(--color-border)', display: 'flex', gap: 20, fontSize: 11, color: 'var(--color-text-2)', flexWrap: 'wrap' }}>
                <span><strong style={{ color: COLOR }}>OVR</strong> = override-approved &nbsp;·&nbsp; <strong style={{ color: '#185FA5' }}>S1/S2/S3</strong> = SLFRS 9 stage &nbsp;·&nbsp; <strong style={{ color: '#A32D2D' }}>→ S3</strong> = model predicts reclassification</span>
              </div>

              <div style={{ overflowY: 'auto', flex: 1, maxHeight: 600 }}>
                <table className="data-table" style={{ width: '100%' }}>
                  <thead>
                    <tr>
                      <th>Loan ID</th>
                      <th>Exposure</th>
                      <th>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          Stage (assigned)
                          <InfoTooltip text="The SLFRS 9 stage currently assigned to this loan in the bank's systems. Stage 1 = performing, Stage 2 = elevated risk, Stage 3 = credit-impaired. Staging determines how much Expected Credit Loss (ECL) provision must be held." width={280} position="bottom" />
                        </span>
                      </th>
                      <th>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          Predicted
                          <InfoTooltip text="The stage the model believes this loan should be in, based on its feature combination. If predicted stage > assigned stage, the loan may be understaged — meaning the bank is holding insufficient ECL provision. This requires Staging Committee review." width={300} position="bottom" />
                        </span>
                      </th>
                      <th style={{ minWidth: 160 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          Anomaly Score
                          <InfoTooltip text="0.0 = fully normal. 0.65+ = flagged for review. 0.85+ = critical (immediate action). Score is computed by Isolation Forest across 8 features. A score of 0.90 means this loan's feature profile is in the top 10% most anomalous relative to its stage-peer group." width={280} position="bottom" />
                        </span>
                      </th>
                      <th>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          Primary Driver
                          <InfoTooltip text="The single feature that contributed most to the anomaly score. Click the row to see all features and their individual contribution percentages in a SHAP-style breakdown." width={260} position="bottom" />
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.flagged_loans || []).map((loan, i) => (
                      <LoanRow key={loan.loan_id} loan={loan} />
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ padding: '10px 16px', borderTop: '1px solid var(--color-border)', background: 'var(--color-surface-2)', fontSize: 11, color: 'var(--color-text-3)', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                <ChevronDown size={12} />
                Click any row → anomaly score breakdown · feature contributions · agent reasoning · recommended action
              </div>
            </div>
          </div>
        </>
      )}
      </AgentModule>
  );
}

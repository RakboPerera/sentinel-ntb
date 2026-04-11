import React, { useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine, BarChart, Bar, Cell } from 'recharts';
import AgentModule from '../../components/shared/AgentModule.jsx';
import { VisualFindingCard } from '../../components/shared/VisualComponents.jsx';
import { KPICard, ProgressBar, DataRow, OpinionBanner, TabBar, AgentHeader, ChartPanel, SeverityPill, EmptyState } from '../../components/shared/AgentUI.jsx';
import useOpenFinding from '../../hooks/useOpenFinding.js';
import { demoData } from '../../data/demoData.js';

const COLOR = '#3B6D11';

// Static LCR/NSFR trend data (consistent with NTB FY2025 annual report)
const LCR_TREND = [
  { q:'Q1 24',lcr:320.6,nsfr:154.7 },{ q:'Q2 24',lcr:312.4,nsfr:151.3 },
  { q:'Q3 24',lcr:294.8,nsfr:148.6 },{ q:'Q4 24',lcr:278.1,nsfr:145.2 },
  { q:'Q1 25',lcr:261.7,nsfr:143.8 },{ q:'Q2 25',lcr:244.2,nsfr:141.4 },
  { q:'Q3 25',lcr:226.8,nsfr:139.7 },{ q:'Q4 25',lcr:203.4,nsfr:138.3 },
];

export default function TradeTreasuryAgent() {
  const [tab, setTab] = useState('tbml');
  const openFinding = useOpenFinding('trade');

  return (
    <AgentModule agentId="trade" agentName="Trade Finance & Treasury Agent" agentColor={COLOR} demoData={demoData.trade} schema={[]}>
      {(data) => {
        const ts = data.trade_summary || {};
        const anomalies = data.pricing_anomalies || [];
        const lcCases = data.duplicate_lc_cases || [];
        const breaches = data.treasury_breaches || [];
        const nop = data.nop_summary || {};
        const liq = data.liquidity_trends || {};
        const network = data.counterparty_network || {};
        const uboConflicts = network.ubo_conflicts || [];
        const roundtripLC = network.roundtrip_lc || [];

        const riskColor = r => r === 'critical' ? '#C41E3A' : r === 'high' ? '#4A6070' : '#0BBF7A';

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            <AgentHeader
              name="Trade Finance & Treasury Agent"
              icon="◎"
              color={COLOR}
              tagline="HS code price benchmarking vs UN COMTRADE medians, duplicate LC detection, FX NOP monitoring against CBSL-approved intraday limits"
              stats={[
                { label: 'Documents analysed', value: (ts.documents_analyzed || 847).toLocaleString() },
                { label: 'Pricing anomalies', value: ts.pricing_anomalies || 6, alert: true },
                { label: 'Duplicate LCs', value: ts.duplicate_lc_cases || 2, alert: true },
                { label: 'Suspicious flow', value: `LKR ${((ts.estimated_suspicious_flow_lkr || 412e6) / 1e6).toFixed(0)}M`, alert: true },
                { label: 'LCR', value: `${liq.lcr_current || 203.4}%` },
              ]}
            />

            <OpinionBanner
              verdict="QUALIFIED"
              color={COLOR}
              opinion="In our opinion, trade finance controls are PARTIALLY EFFECTIVE. NTB-CORP-0887 TBML is confirmed (91% over-invoicing, combined severity 0.94). LCR decline trajectory from 320.6% to 203.4% requires ALCO action. GBP/LKR and AED/LKR NOP limits breached intraday."
              methodology={{
                'Population tested': `${(ts.documents_analyzed||847).toLocaleString()} LC and trade documents; all FX NOP positions`,
                'Period covered': 'FY 2025 (Jan–Dec)',
                'Materiality threshold': 'Invoice deviations >25% from UN COMTRADE; NOP breaches at any intraday point',
                'Model limitations': 'UN COMTRADE benchmark updated semi-annually; HS benchmarks are median-based',
              }}
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
              <KPICard label="Suspicious flow" value={`LKR ${((ts.estimated_suspicious_flow_lkr || 412e6) / 1e6).toFixed(0)}M`} sub={`${ts.tbml_risk_accounts || 4} TBML-risk accounts`} color="#C41E3A" icon="◎" />
              <KPICard label="Duplicate LCs" value={ts.duplicate_lc_cases || 2} sub="Same shipment, multiple banks" color="#C41E3A" />
              <KPICard label="LCR (current)" value={`${liq.lcr_current || 203.4}%`} sub={`Declining — was 320.6% Q1 2024`} color={liq.lcr_trend === 'declining' ? '#4A6070' : '#0BBF7A'} delta={-37} deltaLabel="% since Q1 2024" />
              <KPICard label="NSFR (current)" value={`${liq.nsfr_current || 138.3}%`} sub="Minimum 100% (CBSL)" color="#0BBF7A" />
            </div>

            <ChartPanel title="Key Findings">
              {(data.key_findings || []).map((f, i) => (
                <VisualFindingCard key={i} finding={f} agentColor={COLOR} index={i} agentId="trade" agentData={data} openFinding={openFinding} />
              ))}
            </ChartPanel>

            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden' }}>
              <TabBar
                tabs={[
                  { id: 'tbml', label: 'HS Code TBML', count: anomalies.length },
                  { id: 'lc', label: 'Duplicate LCs', count: lcCases.length },
                  { id: 'nop', label: 'NOP / Treasury', count: breaches.length },
                  { id: 'lcr', label: 'LCR / NSFR' },
                  { id: 'network', label: 'Counterparty', count: uboConflicts.length + roundtripLC.length },
                ]}
                active={tab} onChange={setTab} color={COLOR}
              />

              {/* TBML Tab */}
              {tab === 'tbml' && (
                <div>
                  {anomalies.length === 0 && <EmptyState icon="◎" title="No pricing anomalies" sub="All trade documents within benchmarks." />}
                  {anomalies.map((a, i) => (
                    <div key={i} style={{ padding: '16px', borderBottom: '1px solid var(--color-border)', borderLeft: `3px solid ${a.deviation_pct > 50 ? '#C41E3A' : '#4A6070'}` }}>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
                        <code style={{ fontSize: 11, fontWeight: 700, background: 'var(--color-surface-2)', padding: '2px 8px', borderRadius: 4 }}>HS {a.hs_code}</code>
                        <span style={{ fontSize: 12, fontWeight: 600 }}>{a.commodity_description}</span>
                        <code style={{ fontSize: 11, color: 'var(--color-text-3)', marginLeft: 'auto' }}>{a.customer_id}</code>
                        <span style={{ fontSize: 14, fontWeight: 900, color: '#C41E3A', fontFamily: 'var(--font-display)' }}>+{a.deviation_pct}%</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 10 }}>
                        {[
                          { label: 'Declared price', val: `USD ${a.declared_unit_price}/unit`, color: '#C41E3A' },
                          { label: 'Benchmark', val: `USD ${a.benchmark_unit_price}/unit`, color: '#0BBF7A' },
                          { label: 'Illicit flow', val: `LKR ${((a.estimated_illicit_flow_lkr || 0) / 1e6).toFixed(0)}M`, color: '#C41E3A' },
                          { label: 'Counterparty', val: a.counterparty_country, color: '#4A6070' },
                        ].map((m, j) => (
                          <div key={j} style={{ padding: '10px 12px', background: 'var(--color-surface-2)', borderRadius: 8, border: '1px solid var(--color-border)' }}>
                            <div style={{ fontSize: 14, fontWeight: 800, color: m.color, fontFamily: 'var(--font-display)', lineHeight: 1.1 }}>{m.val}</div>
                            <div style={{ fontSize: 10, color: 'var(--color-text-3)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.label}</div>
                          </div>
                        ))}
                      </div>
                      <ProgressBar value={a.deviation_pct || 0} max={120} color={a.deviation_pct > 50 ? '#C41E3A' : '#4A6070'} label="Price deviation from benchmark" valueLabel={`+${a.deviation_pct}% over-invoiced`} sublabel="FATF TBML flag threshold: >25% deviation" />
                      <div style={{ fontSize: 12, color: 'var(--color-text-2)', lineHeight: 1.65, marginTop: 10 }}>{a.explanation}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Duplicate LC Tab */}
              {tab === 'lc' && (
                <div>
                  {lcCases.length === 0 && <EmptyState icon="◎" title="No duplicate LCs detected" />}
                  {(lcCases||[]).map((lc, i) => (
                    <div key={i} style={{ padding: '16px', borderBottom: '1px solid var(--color-border)', borderLeft: '3px solid #C41E3A' }}>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
                        <code style={{ fontSize: 12, fontWeight: 700 }}>{lc.customer_id}</code>
                        <span style={{ fontSize: 11, color: 'var(--color-text-3)' }}>{lc.branch_code}</span>
                        <span style={{ marginLeft: 'auto', fontSize: 14, fontWeight: 900, color: '#C41E3A', fontFamily: 'var(--font-display)' }}>LKR {((lc.combined_amount_lkr || 0) / 1e6).toFixed(0)}M</span>
                      </div>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
                        <div style={{ flex: 1, padding: '8px 12px', background: 'var(--color-surface-2)', borderRadius: 8, border: '1px solid var(--color-border)' }}>
                          <div style={{ fontSize: 10, color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>LC Reference 1</div>
                          <code style={{ fontSize: 12, fontWeight: 700 }}>{lc.lc_reference_1}</code>
                        </div>
                        <span style={{ fontSize: 14, color: '#C41E3A', flexShrink: 0 }}>⟷</span>
                        <div style={{ flex: 1, padding: '8px 12px', background: 'var(--color-surface-2)', borderRadius: 8, border: '1px solid var(--color-border)' }}>
                          <div style={{ fontSize: 10, color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>LC Reference 2</div>
                          <code style={{ fontSize: 12, fontWeight: 700 }}>{lc.lc_reference_2}</code>
                        </div>
                      </div>
                      <div style={{ padding: '8px 12px', background: 'var(--color-surface-2)', borderRadius: 8, fontSize: 11, color: 'var(--color-text-3)', marginBottom: 10 }}>
                        Overlap period: <strong>{lc.overlap_period}</strong>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-2)', lineHeight: 1.65 }}>{lc.explanation}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* NOP / Treasury Tab */}
              {tab === 'nop' && (
                <div>
                  <div style={{ padding: '12px 16px', background: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border)', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                    {[
                      { label: 'USD Position', val: `LKR ${((nop.usd_position || 0) / 1e6).toFixed(0)}M` },
                      { label: 'EUR Position', val: `LKR ${((nop.eur_position || 0) / 1e6).toFixed(0)}M` },
                      { label: 'GBP Position', val: `LKR ${((nop.gbp_position || 0) / 1e6).toFixed(0)}M` },
                      { label: 'Total NOP', val: `LKR ${((nop.total_nop_lkr_equivalent || 6.23e9) / 1e9).toFixed(2)}Bn` },
                    ].map((m, j) => (
                      <div key={j} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>{m.val}</div>
                        <div style={{ fontSize: 10, color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 3 }}>{m.label}</div>
                      </div>
                    ))}
                  </div>
                  {breaches.length === 0 && <EmptyState icon="◎" title="No NOP breaches" sub="All positions within intraday limits." />}
                  {breaches.map((b, i) => (
                    <div key={i} style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-border)', borderLeft: `3px solid ${riskColor(b.severity)}` }}>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
                        <code style={{ fontSize: 13, fontWeight: 700 }}>{b.currency_pair}</code>
                        <SeverityPill level={b.severity || 'medium'} />
                        <span style={{ fontSize: 11, color: 'var(--color-text-3)' }}>{b.intraday_only ? 'Intraday breach' : 'End-of-day breach'}</span>
                        <code style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--color-text-3)' }}>{b.trader_id}</code>
                      </div>
                      <ProgressBar
                        value={b.position_amount || 0}
                        max={Math.max(b.position_amount || 0, b.approved_limit || 1) * 1.2}
                        color={riskColor(b.severity)}
                        label={`Position: LKR ${((b.position_amount || 0) / 1e6).toFixed(1)}M vs Limit: LKR ${((b.approved_limit || 0) / 1e6).toFixed(1)}M`}
                        valueLabel={`+${b.breach_pct}% over limit`}
                        sublabel={b.position_id}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* LCR/NSFR Tab */}
              {tab === 'lcr' && (
                <div style={{ padding: 20 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
                    <KPICard label="LCR (Current)" value={`${liq.lcr_current || 203.4}%`} sub="Min: 120% (CBSL)" color={(liq.lcr_current || 203.4) < 150 ? '#C41E3A' : '#0BBF7A'} delta={-117} deltaLabel="% decline since Q1 2024" />
                    <KPICard label="NSFR (Current)" value={`${liq.nsfr_current || 138.3}%`} sub="Min: 100% (CBSL)" color="#0BBF7A" delta={-16} deltaLabel="% decline since Q1 2024" />
                  </div>
                  <div style={{ marginBottom: 8, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-text-3)', fontFamily: 'var(--font-display)' }}>8-Quarter Trend</div>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={LCR_TREND} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <XAxis dataKey="q" tick={{ fontSize: 10 }} />
                      <YAxis domain={[100, 350]} tick={{ fontSize: 10 }} tickFormatter={v => `${v}%`} />
                      <Tooltip formatter={v => `${v}%`} />
                      <ReferenceLine y={120} stroke="#C41E3A" strokeDasharray="4 3" label={{ value: 'LCR min 120%', fontSize: 9, fill: '#C41E3A', position: 'left' }} />
                      <ReferenceLine y={100} stroke="#4A6070" strokeDasharray="4 3" label={{ value: 'NSFR min 100%', fontSize: 9, fill: '#4A6070', position: 'left' }} />
                      <Line type="monotone" dataKey="lcr" stroke={COLOR} strokeWidth={2.5} dot={{ r: 3, fill: COLOR }} name="LCR" />
                      <Line type="monotone" dataKey="nsfr" stroke="#4A6070" strokeWidth={2} dot={{ r: 3, fill: '#4A6070' }} name="NSFR" strokeDasharray="5 3" />
                    </LineChart>
                  </ResponsiveContainer>
                  {liq.commentary && (
                    <div style={{ marginTop: 14, padding: '12px 16px', background: 'var(--color-surface-2)', borderRadius: 10, border: '1px solid var(--color-border)', fontSize: 12, color: 'var(--color-text-2)', lineHeight: 1.7 }}>
                      {liq.commentary}
                    </div>
                  )}
                </div>
              )}

              {/* Counterparty Network Tab */}
              {tab === 'network' && (
                <div>
                  {uboConflicts.length === 0 && roundtripLC.length === 0 && <EmptyState icon="◎" title="No counterparty anomalies" />}

                  {uboConflicts.length > 0 && (
                    <>
                      <div style={{ padding: '10px 16px', background: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border)', fontSize: 11, fontWeight: 700, color: 'var(--color-text-2)', textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: 'var(--font-display)' }}>
                        UBO Conflicts ({uboConflicts.length})
                      </div>
                      {(uboConflicts||[]).map((c, i) => (
                        <div key={i} style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-border)', borderLeft: '3px solid #C41E3A' }}>
                          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
                            <code style={{ fontSize: 12, fontWeight: 700 }}>{c.customer_id}</code>
                            <SeverityPill level={c.risk === 'critical' ? 'critical' : 'high'} />
                            <span style={{ marginLeft: 'auto', fontSize: 13, fontWeight: 800, color: '#C41E3A', fontFamily: 'var(--font-display)' }}>LKR {((c.combined_exposure_lkr || 0) / 1e6).toFixed(0)}M</span>
                          </div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text)', marginBottom: 4 }}>Declared UBO: {c.ubo_declared}</div>
                          <div style={{ fontSize: 12, color: 'var(--color-text-2)', lineHeight: 1.6, padding: '8px 12px', background: 'var(--color-surface-2)', borderRadius: 8 }}>{c.ubo_linked}</div>
                        </div>
                      ))}
                    </>
                  )}

                  {roundtripLC.length > 0 && (
                    <>
                      <div style={{ padding: '10px 16px', background: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border)', fontSize: 11, fontWeight: 700, color: 'var(--color-text-2)', textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: 'var(--font-display)' }}>
                        Round-Trip LC ({roundtripLC.length})
                      </div>
                      {(roundtripLC||[]).map((lc, i) => (
                        <div key={i} style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-border)', borderLeft: '3px solid #4A6070' }}>
                          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
                            <code style={{ fontSize: 12, fontWeight: 700 }}>{lc.lc_reference}</code>
                            <code style={{ fontSize: 11, color: 'var(--color-text-3)' }}>{lc.customer_id}</code>
                            <span style={{ marginLeft: 'auto', fontSize: 13, fontWeight: 800, color: '#4A6070', fontFamily: 'var(--font-display)' }}>LKR {((lc.amount_lkr || 0) / 1e6).toFixed(0)}M</span>
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--color-text-2)', lineHeight: 1.65 }}>{lc.finding}</div>
                          <div style={{ marginTop: 6, fontSize: 11, color: 'var(--color-text-3)' }}>Backing deposit: {lc.supporting_deposit_id}</div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      }}
    </AgentModule>
  );
}

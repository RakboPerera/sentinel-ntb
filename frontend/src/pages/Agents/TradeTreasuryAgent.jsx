import React from 'react';
import AgentModule from '../../components/shared/AgentModule.jsx';
import InfoTooltip from '../../components/shared/InfoTooltip.jsx';
import ExplainerBox from '../../components/shared/ExplainerBox.jsx';
import { VisualFindingCard, InsightBox, StatCard, PanelWithMethod, MetricComparison } from '../../components/shared/VisualComponents.jsx';
import { CoverageStatement } from '../../components/shared/VisualComponents.jsx';
import { demoData } from '../../data/demoData.js';
import useOpenFinding from '../../hooks/useOpenFinding.js';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';

const SCHEMA = { agentName:'Trade Finance & Treasury', required:['document_id','customer_id','hs_code','declared_unit_price','invoice_currency','counterparty_country'], optional:['commodity_description','quantity','lc_reference','shipment_period_start','shipment_period_end','invoice_amount_lkr','position_id','currency_pair','position_amount','approved_limit','trader_id'] };
const COLOR = '#3B6D11';

const lcrTrend = [
  { q:'Q1 24', lcr:320.6, nsfr:154.7 }, { q:'Q2 24', lcr:312.4, nsfr:151.3 },
  { q:'Q3 24', lcr:294.8, nsfr:148.6 }, { q:'Q4 24', lcr:278.1, nsfr:145.2 },
  { q:'Q1 25', lcr:261.7, nsfr:143.8 }, { q:'Q2 25', lcr:244.2, nsfr:141.4 },
  { q:'Q3 25', lcr:226.8, nsfr:139.7 }, { q:'Q4 25', lcr:203.4, nsfr:138.3 },
];

export default function TradeTreasuryAgent() {
  const openFinding = useOpenFinding('trade');
  return (
    <AgentModule agentId="trade" agentName="Trade Finance & Treasury Agent" agentColor={COLOR} demoData={demoData.trade} schema={SCHEMA}>
      {(data) => (
        <>
          <ExplainerBox color={COLOR} icon="◎"
            title="How this agent detects trade-based money laundering and treasury breaches"
            summary="Compares declared invoice unit prices against HS code benchmarks from UN COMTRADE and Sri Lanka Customs. Any deviation >25% is a TBML flag. Overlapping LC applications on the same HS code from the same customer indicate double-financing."
            detail="Over-invoicing: exporter declares a higher price than the goods are worth — the overseas buyer pays the excess into a foreign account, effectively extracting value from Sri Lanka. Under-invoicing: the reverse — value is transferred INTO Sri Lanka below the radar. The agent uses the HS (Harmonised System) 6-digit code to benchmark against known commodity price ranges. Treasury monitoring tracks FX positions against approved limits and flags intraday breaches that are resolved before end-of-day mark-to-market — hiding the breach from daily reporting."
            collapsible
          />

          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
            <StatCard label="Documents Analysed" value={data.trade_summary.documents_analyzed} sub={`LKR ${(data.trade_summary.estimated_suspicious_flow_lkr/1e6).toFixed(0)}M suspicious flow est.`} color={COLOR} tooltip="All trade finance documents (invoices, LC applications, shipping documents) reviewed against HS code benchmarks and duplicate LC detection rules." />
            <StatCard label="Pricing Anomalies" value={data.trade_summary.pricing_anomalies} sub="Over/under-invoicing >25% deviation" color="#A32D2D" tooltip="Invoices where declared unit price deviates >25% from the HS code benchmark median. Both over-invoicing (value extraction) and under-invoicing (value injection) are flagged." alert="LKR 412M TBML exposure" />
            <StatCard label="Duplicate LC Cases" value={data.trade_summary.duplicate_lc_cases} sub="Overlapping shipment periods" color="#854F0B" tooltip="LC applications from the same customer for the same HS code with overlapping shipment periods. Legitimate trade has sequential shipping windows — overlapping windows indicate double-financing against a single shipment." />
            <StatCard label="TBML Risk Accounts" value={data.trade_summary.tbml_risk_accounts} sub={`${data.trade_summary.high_risk_country_transactions} FATF-country transactions`} color="#A32D2D" tooltip="Corporate accounts flagged for Trade-Based Money Laundering risk — combination of pricing anomaly, high-risk counterparty country, and unusual transaction structure." />
          </div>

          <div className="agent-panel">
            <div className="agent-panel-header"><span className="agent-panel-title">Key Findings</span></div>
            <div className="agent-panel-body">
              {(data.key_findings || []).map((f,i) => <VisualFindingCard key={i} finding={f} agentColor={COLOR} index={i} agentId="trade" agentData={data} openFinding={openFinding} />)}
            </div>
          </div>

          <div className="agent-grid">
            {/* Audit Opinion Banner */}
            <div style={{ padding:'10px 16px', background:'#3B6D1108', border:`1px solid #3B6D1125`, borderRadius:10, display:'flex', gap:10, alignItems:'flex-start', marginBottom:0 }}>
              <div style={{ fontSize:10, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.08em', padding:'3px 9px', borderRadius:5, background:'#3B6D11', color:'white', flexShrink:0, marginTop:1 }}>
                QUALIFIED
              </div>
              <div style={{ fontSize:12, color:'#3B6D11', lineHeight:1.65 }}>
                In our opinion, trade finance controls are PARTIALLY EFFECTIVE. NTB-CORP-0887 exhibits confirmed TBML pattern with 91% invoice deviation. LCR declining at risk trajectory — ALCO action in progress.
              </div>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              {/* LCR / NSFR trend */}
              <PanelWithMethod
                title="Liquidity Ratio Trend — LCR & NSFR"
                methodology="LCR (Liquidity Coverage Ratio) measures the bank's ability to survive a 30-day stress scenario using High Quality Liquid Assets (HQLA). NSFR (Net Stable Funding Ratio) measures long-term funding stability. CBSL requires both above 100%. The declining trend is driven by rapid loan growth outpacing the stable funding base. At current trajectory, LCR approaches 150% (amber threshold) by Q3 2026."
                agentColor={COLOR}
                tooltip="LCR and NSFR declining simultaneously indicates both short-term liquidity pressure and long-term funding mismatch."
              >
                <div style={{ padding:'12px 8px' }}>
                  <InsightBox type="warning" title="Both LCR and NSFR declining — driven by 50% loan growth" body="LCR fell from 320.6% to 203.4% in FY2025 (−37%). NSFR fell from 154.7% to 138.3% (−11%). At this rate LCR will breach the 200% watch threshold in Q1 2026 and approach 150% amber by Q3 2026 without ALCO intervention." compact />
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={lcrTrend} margin={{ top:5, right:16, bottom:5, left:-20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                      <XAxis dataKey="q" tick={{ fontSize:10 }} />
                      <YAxis domain={[120,340]} tick={{ fontSize:10 }} />
                      <Tooltip />
                      <ReferenceLine y={100} stroke="#A32D2D" strokeDasharray="4 4" label={{ value:'Min 100%', fontSize:9, fill:'#A32D2D' }} />
                      <ReferenceLine y={150} stroke="#EF9F27" strokeDasharray="4 4" label={{ value:'Amber 150%', fontSize:9, fill:'#EF9F27' }} />
                      <ReferenceLine y={200} stroke="#854F0B" strokeDasharray="3 3" label={{ value:'Watch 200%', fontSize:9, fill:'#854F0B' }} />
                      <Line type="monotone" dataKey="lcr" stroke="#185FA5" strokeWidth={2.5} name="LCR %" dot={{ r:3 }} />
                      <Line type="monotone" dataKey="nsfr" stroke="#3B6D11" strokeWidth={2.5} name="NSFR %" dot={{ r:3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                  <div style={{ display:'flex', gap:16, justifyContent:'center', fontSize:11, color:'var(--color-text-2)', marginTop:6 }}>
                    <span style={{ display:'flex', alignItems:'center', gap:5 }}><div style={{ width:16, height:2.5, background:'#185FA5', borderRadius:1 }}/>LCR</span>
                    <span style={{ display:'flex', alignItems:'center', gap:5 }}><div style={{ width:16, height:2.5, background:'#3B6D11', borderRadius:1 }}/>NSFR</span>
                  </div>
                </div>
              </PanelWithMethod>

              {/* Treasury breaches */}
              <PanelWithMethod
                title="Treasury Position Limit Breaches"
                methodology="Each FX position is compared against the trader's approved limit at multiple intraday checkpoints. Intraday-only breaches — where the position exceeds limits during the day but is resolved before end-of-day — are particularly concerning because they bypass end-of-day limit reporting while still exposing the bank to intraday market risk."
                agentColor={COLOR}
              >
                <div>
                  {(data.treasury_breaches || []).map((b,i) => (
                    <div key={i} style={{ padding:'12px 16px', borderBottom:'1px solid var(--color-border)', background: b.severity==='high'?'#FFF8F0':'transparent' }}>
                      <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:6 }}>
                        <code style={{ fontSize:12, fontWeight:700 }}>{b.currency_pair}</code>
                        <span style={{ fontSize:11, fontWeight:600, color:'var(--color-red)' }}>+{b.breach_pct}% over limit</span>
                        {b.intraday_only && <span style={{ fontSize:10, padding:'1px 6px', background:'#FAEEDA', color:'#854F0B', borderRadius:4 }}>Intraday only</span>}
                        <code style={{ marginLeft:'auto', fontSize:11 }}>{b.trader_id}</code>
                      </div>
                      <MetricComparison label="Position vs limit" actual={b.position_amount/1e6} benchmark={b.approved_limit/1e6} unit="M" benchmarkLabel="Approved limit" higherIsBad tooltip="Position amount vs approved limit. Breaches require same-day resolution and escalation to Head of Treasury." />
                    </div>
                  ))}
                </div>
              </PanelWithMethod>
            </div>

            {/* Pricing anomalies */}
            <PanelWithMethod
              title="Invoice Pricing Anomalies — TBML Detection"
              methodology="Each invoice's declared unit price is benchmarked against the HS code median from UN COMTRADE and Sri Lanka Customs data. Over-invoicing: declared price >25% above benchmark — exporter is paid too much in forex, likely to extract value abroad. Under-invoicing: declared price >25% below benchmark — exporter is underpaid, with the difference transferred through informal channels."
              agentColor={COLOR}
              tooltip="HS code benchmarking flags invoices where declared unit price deviates >25% from commodity market median. Both directions are TBML vectors."
            >
              <div style={{ maxHeight:560, overflowY:'auto' }}>
                {(data.pricing_anomalies || []).map((anom,i) => (
                  <div key={i} style={{ padding:'14px 16px', borderBottom:'1px solid var(--color-border)', background: Math.abs(anom.deviation_pct)>60?'var(--color-red-light)':'transparent' }}>
                    <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:8, flexWrap:'wrap' }}>
                      <code style={{ fontSize:12, fontWeight:700 }}>{anom.customer_id}</code>
                      <span style={{ fontSize:10, fontWeight:600, padding:'2px 8px', background: anom.anomaly_type==='over_invoicing'?'var(--color-red-light)':'var(--color-amber-light)', color: anom.anomaly_type==='over_invoicing'?'var(--color-red)':'var(--color-amber)', borderRadius:4 }}>
                        {anom.anomaly_type==='over_invoicing' ? '↑ Over-invoicing' : '↓ Under-invoicing'}
                      </span>
                      <span style={{ marginLeft:'auto', fontSize:13, fontWeight:800, color:'var(--color-red)' }}>
                        {Math.abs(anom.deviation_pct).toFixed(0)}% deviation
                      </span>
                    </div>
                    <div style={{ fontSize:12, color:'var(--color-text-2)', marginBottom:10 }}>
                      {anom.commodity_description} · HS {anom.hs_code} · {anom.counterparty_country}
                    </div>
                    <MetricComparison
                      label="Declared vs benchmark price"
                      actual={anom.declared_unit_price}
                      benchmark={anom.benchmark_unit_price}
                      unit=""
                      benchmarkLabel="HS benchmark"
                      higherIsBad={anom.anomaly_type==='over_invoicing'}
                      tooltip={`Declared: ${anom.declared_unit_price} vs HS code benchmark: ${anom.benchmark_unit_price}. ${Math.abs(anom.deviation_pct).toFixed(0)}% deviation.`}
                    />
                    <div style={{ marginTop:10, padding:'8px 12px', background:`${COLOR}0C`, borderRadius:6, fontSize:11 }}>
                      <span style={{ color:'var(--color-text-3)' }}>Estimated illicit flow: </span>
                      <span style={{ fontWeight:700, color:COLOR }}>LKR {(anom.estimated_illicit_flow_lkr/1e6).toFixed(0)}M</span>
                    </div>
                  </div>
                ))}
                {/* Duplicate LC */}
                {(data.duplicate_lc_cases || []).map((dup,i) => (
                  <div key={i} style={{ padding:'14px 16px', borderBottom:'1px solid var(--color-border)', background:'#FFFBEB' }}>
                    <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:6 }}>
                      <code style={{ fontSize:12, fontWeight:700 }}>{dup.customer_id}</code>
                      <span style={{ fontSize:10, fontWeight:600, padding:'2px 8px', background:'#FAEEDA', color:'#854F0B', borderRadius:4 }}>Duplicate LC</span>
                      <span style={{ marginLeft:'auto', fontSize:13, fontWeight:700, color:'#854F0B' }}>LKR {(dup.combined_amount_lkr/1e6).toFixed(0)}M</span>
                    </div>
                    <div style={{ fontSize:12, color:'var(--color-text-2)', marginBottom:6 }}>
                      <code style={{ fontSize:11 }}>{dup.lc_reference_1}</code> + <code style={{ fontSize:11 }}>{dup.lc_reference_2}</code>
                    </div>
                    <div style={{ fontSize:11, color:'var(--color-text-2)', marginBottom:6 }}>Overlapping: {dup.overlap_period}</div>
                    <InsightBox type="warning" body={dup.explanation} compact />
                  </div>
                ))}
              </div>
            </PanelWithMethod>
          </div>
        </>
      )}
      </AgentModule>
  );
}

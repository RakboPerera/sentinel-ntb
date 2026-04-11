import React, { useState } from 'react';
import AgentModule from '../../components/shared/AgentModule.jsx';
import InfoTooltip from '../../components/shared/InfoTooltip.jsx';
import ExplainerBox from '../../components/shared/ExplainerBox.jsx';
import { VisualFindingCard, InsightBox, StatCard, PanelWithMethod, MetricComparison } from '../../components/shared/VisualComponents.jsx';
import { demoData } from '../../data/demoData.js';
import useOpenFinding from '../../hooks/useOpenFinding.js';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine, LineChart, Line, Cell, PieChart, Pie, Legend } from 'recharts';

const SCHEMA = { agentName:'Trade Finance & Treasury', required:['document_id','customer_id','hs_code','declared_unit_price','invoice_currency','counterparty_country'], optional:['commodity_description','quantity','lc_reference','shipment_period_start','shipment_period_end','invoice_amount_lkr','position_id','currency_pair','position_amount','approved_limit','trader_id'] };
const COLOR = '#3B6D11';

const lcrTrend = [
  { q:'Q1 24', lcr:320.6, nsfr:154.7 }, { q:'Q2 24', lcr:312.4, nsfr:151.3 },
  { q:'Q3 24', lcr:294.8, nsfr:148.6 }, { q:'Q4 24', lcr:278.1, nsfr:145.2 },
  { q:'Q1 25', lcr:261.7, nsfr:143.8 }, { q:'Q2 25', lcr:244.2, nsfr:141.4 },
  { q:'Q3 25', lcr:226.8, nsfr:139.7 }, { q:'Q4 25', lcr:203.4, nsfr:138.3 },
  { q:'Q1 26E', lcr:188.1, nsfr:136.2, projected:true }, { q:'Q2 26E', lcr:172.4, nsfr:134.1, projected:true },
];

const HS_ANOMALIES = [
  { code:'6203', desc:"Men's apparel", count:2, avgDev:87, maxDev:91, risk:'critical', exposure:421 },
  { code:'7108', desc:'Gold unwrought', count:1, avgDev:55, maxDev:55, risk:'high', exposure:147 },
  { code:'0901', desc:'Coffee unroasted', count:1, avgDev:32, maxDev:32, risk:'medium', exposure:41 },
  { code:'4011', desc:'Rubber tyres', count:1, avgDev:28, maxDev:28, risk:'medium', exposure:38 },
  { code:'8517', desc:'Telecom equipment', count:1, avgDev:22, maxDev:22, risk:'low', exposure:19 },
];

const FATF_EXPOSURE = [
  { country:'AE', name:'UAE', status:'enhanced', txns:14, exposure:'LKR 623M', customers:3, flag:'⚠' },
  { country:'SG', name:'Singapore', status:'standard', txns:8, exposure:'LKR 312M', customers:2, flag:'' },
  { country:'CN', name:'China', status:'standard', txns:6, exposure:'LKR 189M', customers:4, flag:'' },
  { country:'DE', name:'Germany', status:'standard', txns:5, exposure:'LKR 126M', customers:2, flag:'' },
  { country:'PK', name:'Pakistan', status:'grey_list', txns:2, exposure:'LKR 84M', customers:1, flag:'🔴' },
  { country:'NG', name:'Nigeria', status:'grey_list', txns:1, exposure:'LKR 31M', customers:1, flag:'🔴' },
];

const NOP_BREAKDOWN = [
  { pair:'USD/LKR', position:12400000, limit:15000000, pct:83, breach:false, trader:'TRD-001' },
  { pair:'EUR/LKR', position:8700000, limit:10000000, pct:87, breach:false, trader:'TRD-002' },
  { pair:'GBP/LKR', position:4200000, limit:3000000, pct:140, breach:true, trader:'TRD-003' },
  { pair:'JPY/LKR', position:2100000, limit:5000000, pct:42, breach:false, trader:'TRD-001' },
  { pair:'AED/LKR', position:6800000, limit:5000000, pct:136, breach:true, trader:'TRD-004' },
  { pair:'CNH/LKR', position:1400000, limit:4000000, pct:35, breach:false, trader:'TRD-002' },
];

const RISK_COLORS = { critical:'#DC2626', high:'#4A6070', medium:'#185FA5', low:'#6b6963' };
const RISK_BGS = { critical:'#FEF0F0', high:'#F3F3F1', medium:'#E8FDF4', low:'var(--color-surface-2)' };
const FATF_COLORS = { grey_list:'#DC2626', enhanced:'#4A6070', standard:'#16A34A' };

export default function TradeTreasuryAgent() {
  const [activeTab, setActiveTab] = useState('tbml');
  const openFinding = useOpenFinding('trade');
  const navigate = useNavigate();

  return (
    <AgentModule agentId="trade" agentName="Trade Finance & Treasury Agent" agentColor={COLOR} demoData={demoData.trade} schema={SCHEMA}>
      {(data) => (
        <>
          <ExplainerBox color={COLOR} icon="◎"
            title="How this agent detects trade-based money laundering and treasury breaches"
            summary="Benchmarks declared invoice unit prices against HS code medians from UN COMTRADE and Sri Lanka Customs. Deviations >25% are TBML flags. Overlapping LC applications and intraday-only treasury limit breaches are independently flagged."
            detail="Over-invoicing: exporter declares a higher price than the goods are worth — the overseas buyer pays the excess into a foreign account, extracting value from Sri Lanka. Under-invoicing: the reverse. The HS (Harmonised System) 6-digit code precisely identifies each commodity class and its market price range. Treasury monitoring tracks FX positions against approved limits and flags intraday breaches resolved before end-of-day mark-to-market — hiding the breach from daily reporting."
            collapsible
          />

          {/* Audit Opinion */}
          <div style={{ padding:'10px 16px', background:'#3B6D1108', border:'1px solid #3B6D1125', borderRadius:10, display:'flex', gap:10, alignItems:'flex-start' }}>
            <div style={{ background:'#3B6D1106', border:'1px solid #3B6D1122', borderRadius:10, overflow:'hidden' }}>
              <div style={{ padding:'12px 16px', display:'flex', gap:10, alignItems:'flex-start' }}>
                <div style={{ fontSize:10, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.08em', padding:'3px 9px', borderRadius:5, background:'#3B6D11', color:'white', flexShrink:0, marginTop:2 }}>
                  QUALIFIED
                </div>
                <div style={{ fontSize:12, color:'#3B6D11', lineHeight:1.7 }}>
                  In our opinion, trade finance controls are PARTIALLY EFFECTIVE. NTB-CORP-0887 TBML is confirmed (91% over-invoicing, combined severity 0.94). LCR decline trajectory requires ALCO action. NOP monitoring should move from daily to intraday.
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', borderTop:'1px solid #3B6D1118' }}>
                {[['Population tested','All LCs and FX transactions in period; 6,230 NOP positions'],['Period covered','FY 2025 (Jan–Dec)'],['Materiality threshold','Invoice deviations &gt;25% from UN COMTRADE; NOP breaches at any intraday point'],['Model limitations','UN COMTRADE benchmark updated semi-annually; HS benchmarks are median-based and may not capture specific commodity price movements']].map(([k,v],i)=>(
                  <div key={i} style={{ padding:'7px 16px', borderRight:i%2===0?'1px solid #3B6D1112':'none', borderBottom:i<2?'1px solid #3B6D1112':'none' }}>
                    <div style={{ fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'#3B6D11', opacity:0.65, marginBottom:2 }}>{k}</div>
                    <div style={{ fontSize:11, color:'#3B6D11', lineHeight:1.5 }} dangerouslySetInnerHTML={{__html:v}} />
                  </div>
                ))}
              </div>
            </div>
            <div style={{ fontSize:12, color:'#3B6D11', lineHeight:1.65 }}>In our opinion, trade finance controls are PARTIALLY EFFECTIVE. NTB-CORP-0887 exhibits confirmed TBML pattern with 91% invoice deviation. 2 FX positions breach approved limits intraday. LCR declining — ALCO action in progress. Gold under-invoicing (HS 7108) requires immediate STR assessment.</div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
            <StatCard label="Documents Analysed" value={data.trade_summary.documents_analyzed} sub={`LKR ${(data.trade_summary.estimated_suspicious_flow_lkr/1e6).toFixed(0)}M suspicious flow est.`} color={COLOR} tooltip="All trade finance documents reviewed against HS code benchmarks and duplicate LC detection rules." />
            <StatCard label="Pricing Anomalies" value={data.trade_summary.pricing_anomalies} sub="Over/under-invoicing >25% deviation" color="#A32D2D" tooltip="Invoices where declared unit price deviates >25% from the HS code benchmark median." alert="LKR 412M TBML exposure" />
            <StatCard label="Duplicate LC Cases" value={data.trade_summary.duplicate_lc_cases} sub="Overlapping shipment periods" color="#854F0B" tooltip="LC applications from the same customer for the same HS code with overlapping shipment periods." />
            <StatCard label="FATF-Country Transactions" value={data.trade_summary.high_risk_country_transactions} sub={`${FATF_EXPOSURE.filter(f=>f.status==='grey_list').length} grey-list countries`} color="#A32D2D" tooltip="Transactions with counterparties in FATF grey-list or enhanced monitoring countries." alert="2 grey-list countries" />
          </div>

          <div className="agent-panel">
            <div className="agent-panel-header"><span className="agent-panel-title">Key Findings</span></div>
            <div className="agent-panel-body">
              {(data.key_findings || []).map((f,i) => <VisualFindingCard key={i} finding={f} agentColor={COLOR} index={i} agentId="trade" agentData={data} openFinding={openFinding} />)}
            </div>
          </div>

          {/* Tabbed analysis */}
          <div className="agent-panel">
            <div className="agent-panel-header" style={{ padding:0 }}>
              {['tbml','nop','lcr','fatf'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  style={{ padding:'11px 16px', fontSize:12, fontWeight:activeTab===tab?600:400, background:activeTab===tab?'var(--color-surface-2)':'transparent', borderBottom:`2px solid ${activeTab===tab?COLOR:'transparent'}`, color:activeTab===tab?COLOR:'var(--color-text-2)', cursor:'pointer', border:'none', flex:1 }}>
                  {tab==='tbml'?'HS Code TBML':tab==='nop'?'NOP Positions':tab==='lcr'?'LCR / NSFR':'FATF Exposure'}
                </button>
              ))}
            </div>

            {/* ── TBML Tab ── */}
            {activeTab === 'tbml' && (
              <div style={{ padding:16 }}>
                <div style={{ fontSize:11, color:'var(--color-text-2)', marginBottom:14, lineHeight:1.6 }}>
                  Each bar shows the number of TBML flags per HS commodity code. Wider deviation from benchmark = higher TBML risk. Click any row below for invoice detail.
                </div>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={HS_ANOMALIES} layout="vertical" margin={{ top:0, right:80, bottom:0, left:20 }}>
                    <XAxis type="number" domain={[0,100]} tick={{ fontSize:10 }} unit="%" label={{ value:'Max % deviation from benchmark', position:'insideBottom', offset:-2, fontSize:10 }} />
                    <YAxis type="category" dataKey="code" tick={{ fontSize:11 }} width={50} />
                    <Tooltip formatter={(v,n) => [`${v}%`, 'Max deviation']} />
                    <ReferenceLine x={25} stroke="#4A6070" strokeDasharray="4 4" label={{ value:'Flag 25%', fontSize:9, fill:'#4A6070' }} />
                    <Bar dataKey="maxDev" radius={[0,4,4,0]} label={{ position:'right', fontSize:11, formatter:(v)=>`${v}%` }}>
                      {HS_ANOMALIES.map((d,i) => <Cell key={i} fill={RISK_COLORS[d.risk]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div style={{ marginTop:16 }}>
                  {HS_ANOMALIES.map((hs,i) => (
                    <div key={i} style={{ display:'grid', gridTemplateColumns:'60px 1fr 80px 100px 100px', gap:10, padding:'9px 12px', borderBottom:'1px solid var(--color-border)', alignItems:'center', background:RISK_BGS[hs.risk], borderRadius:i===0?'8px 8px 0 0':i===HS_ANOMALIES.length-1?'0 0 8px 8px':0 }}>
                      <code style={{ fontSize:12, fontWeight:700 }}>HS {hs.code}</code>
                      <span style={{ fontSize:12, color:'var(--color-text)' }}>{hs.desc}</span>
                      <span style={{ fontSize:11, fontWeight:700, color:RISK_COLORS[hs.risk], textAlign:'right' }}>{hs.maxDev}% dev</span>
                      <span style={{ fontSize:11, fontWeight:600, color:'#DC2626', textAlign:'right' }}>LKR {hs.exposure}M</span>
                      <span style={{ fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:4, background:RISK_BGS[hs.risk], color:RISK_COLORS[hs.risk], textAlign:'center', border:`1px solid ${RISK_COLORS[hs.risk]}44` }}>{hs.risk}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop:16, padding:'10px 14px', background:'#FEF0F0', borderRadius:8, fontSize:12, color:'#DC2626', lineHeight:1.6 }}>
                  <strong>Action required:</strong> NTB-CORP-0887 (HS 6203, 91% deviation) and NTB-CORP-4412 (HS 7108, 55% deviation) both require STR assessment under FATF TBML guidance. Suspend facilities pending investigation.
                </div>
              </div>
            )}

            {/* ── NOP Tab ── */}
            {activeTab === 'nop' && (
              <div>
                <div style={{ padding:'10px 14px', background:'#F3F3F1', borderBottom:'1px solid var(--color-border)', fontSize:12, color:'#4A6070', lineHeight:1.6 }}>
                  <strong>2 currency pairs breach approved limits:</strong> GBP/LKR at 140% of limit, AED/LKR at 136%. Both were intraday-only breaches — resolved before end-of-day mark-to-market, bypassing daily limit reporting.
                </div>
                {NOP_BREAKDOWN.map((pos,i) => (
                  <div key={i} style={{ padding:'12px 16px', borderBottom:'1px solid var(--color-border)', background:pos.breach?'#FEF0F0':'transparent' }}>
                    <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:8 }}>
                      <code style={{ fontSize:14, fontWeight:800, color:pos.breach?'#DC2626':'var(--color-text)' }}>{pos.pair}</code>
                      {pos.breach && <span style={{ fontSize:10, fontWeight:700, padding:'2px 7px', background:'#DC2626', color:'white', borderRadius:4 }}>LIMIT BREACH</span>}
                      <code style={{ fontSize:11, color:'var(--color-text-3)', marginLeft:'auto' }}>{pos.trader}</code>
                    </div>
                    <div style={{ marginBottom:6 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'var(--color-text-3)', marginBottom:3 }}>
                        <span>Position: {(pos.position/1e6).toFixed(1)}M</span>
                        <span>Limit: {(pos.limit/1e6).toFixed(1)}M</span>
                        <span style={{ fontWeight:700, color:pos.breach?'#DC2626':'#3B6D11' }}>{pos.pct}% utilised</span>
                      </div>
                      <div style={{ height:8, borderRadius:4, background:'var(--color-surface-2)', overflow:'hidden' }}>
                        <div style={{ width:`${Math.min(pos.pct,100)}%`, height:'100%', background:pos.breach?'#DC2626':pos.pct>80?'#4A6070':'#3B6D11', borderRadius:4 }} />
                        {pos.breach && <div style={{ width:'100%', height:'100%', background:'rgba(220,38,38,0.15)', marginTop:-8 }} />}
                      </div>
                    </div>
                    {pos.breach && <div style={{ fontSize:11, color:'#DC2626' }}>Intraday breach — {pos.pct-100}% over limit. Resolved before EOD. Escalate to Head of Treasury.</div>}
                  </div>
                ))}
              </div>
            )}

            {/* ── LCR Tab ── */}
            {activeTab === 'lcr' && (
              <div style={{ padding:16 }}>
                <InsightBox type="warning" title="LCR declining at current trajectory — ALCO action underway" body="LCR fell from 320.6% to 203.4% in FY2025 (−37%). NSFR from 154.7% to 138.3% (−11%). Projected Q2 2026 LCR: 172% — approaching 150% amber threshold. Driven by 50% loan growth outpacing the stable deposit base. ALCO stabilisation plan approved 18 December 2025." compact />
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={lcrTrend} margin={{ top:10, right:24, bottom:5, left:-20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="q" tick={{ fontSize:10 }} />
                    <YAxis domain={[120,340]} tick={{ fontSize:10 }} />
                    <Tooltip />
                    <ReferenceLine y={100} stroke="#DC2626" strokeDasharray="4 4" label={{ value:'Min 100%', fontSize:9, fill:'#DC2626', position:'insideTopLeft' }} />
                    <ReferenceLine y={150} stroke="#4A6070" strokeDasharray="4 4" label={{ value:'Amber 150%', fontSize:9, fill:'#4A6070', position:'insideTopLeft' }} />
                    <ReferenceLine y={200} stroke="#854F0B" strokeDasharray="3 3" label={{ value:'Watch 200%', fontSize:9, fill:'#3A5A3A', position:'insideTopLeft' }} />
                    <Line type="monotone" dataKey="lcr" stroke="#185FA5" strokeWidth={2.5} name="LCR %" dot={{ r:3 }} strokeDasharray={(d) => d?.projected ? '4 4' : '0'} />
                    <Line type="monotone" dataKey="nsfr" stroke="#3B6D11" strokeWidth={2.5} name="NSFR %" dot={{ r:3 }} />
                  </LineChart>
                </ResponsiveContainer>
                <div style={{ display:'flex', gap:16, justifyContent:'center', fontSize:11, color:'var(--color-text-2)', marginTop:8 }}>
                  <span style={{ display:'flex', alignItems:'center', gap:5 }}><div style={{ width:18, height:2.5, background:'#185FA5' }}/>LCR (solid = actual, dashed = projected)</span>
                  <span style={{ display:'flex', alignItems:'center', gap:5 }}><div style={{ width:18, height:2.5, background:'#3B6D11' }}/>NSFR</span>
                </div>
                <div style={{ marginTop:14, display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                  {[
                    { label:'Term deposit campaign', status:'Active', detail:'Special rate 14.5% — LKR 8.2Bn raised', color:'#16A34A' },
                    { label:'REPO facility access', status:'Executed', detail:'LKR 10Bn from Central Bank repo', color:'#16A34A' },
                    { label:'Loan growth moderation', status:'In progress', detail:'Credit growth cap 15% Q1 2026 (was 50%)', color:'#4A6070' },
                    { label:'HQLA portfolio rebuild', status:'Planned', detail:'LKR 15Bn T-bill purchases — Q1 2026', color:'#185FA5' },
                  ].map((a,i) => (
                    <div key={i} style={{ padding:'10px 14px', background:'var(--color-surface-2)', border:'1px solid var(--color-border)', borderLeft:`3px solid ${a.color}`, borderRadius:8 }}>
                      <div style={{ fontSize:11, fontWeight:700, color:'var(--color-text)', marginBottom:3 }}>{a.label}</div>
                      <div style={{ fontSize:10, fontWeight:600, color:a.color, marginBottom:2 }}>{a.status}</div>
                      <div style={{ fontSize:11, color:'var(--color-text-3)' }}>{a.detail}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── FATF Tab ── */}
            {activeTab === 'fatf' && (
              <div>
                <div style={{ padding:'10px 14px', background:'#FEF0F0', borderBottom:'1px solid var(--color-border)', fontSize:12, color:'#DC2626' }}>
                  <strong>2 FATF grey-list countries in portfolio:</strong> Pakistan and Nigeria. All transactions with grey-list counterparties require Enhanced Due Diligence and STR assessment.
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:0, padding:'8px 16px', background:'var(--color-surface-2)', borderBottom:'1px solid var(--color-border)', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--color-text-3)' }}>
                  <div>Country</div><div>FATF Status</div><div>Transactions</div><div>Exposure</div><div>Customers</div><div>Action</div>
                </div>
                {FATF_EXPOSURE.map((row,i) => (
                  <div key={i} style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:0, padding:'10px 16px', borderBottom:'1px solid var(--color-border)', alignItems:'center', background:row.status==='grey_list'?'#FEF0F0':row.status==='enhanced'?'#F3F3F1':'transparent' }}>
                    <div style={{ fontSize:13, fontWeight:700 }}>{row.flag} {row.name}</div>
                    <div>
                      <span style={{ fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:4, background:row.status==='grey_list'?'#DC2626':row.status==='enhanced'?'#4A6070':'#16A34A', color:'white' }}>
                        {row.status==='grey_list'?'Grey list':row.status==='enhanced'?'Enhanced':'Standard'}
                      </span>
                    </div>
                    <div style={{ fontSize:12, fontWeight:600 }}>{row.txns}</div>
                    <div style={{ fontSize:12, fontWeight:700, color:row.status==='grey_list'?'#DC2626':'var(--color-text)' }}>{row.exposure}</div>
                    <div style={{ fontSize:12 }}>{row.customers}</div>
                    <div style={{ fontSize:11, fontWeight:600, color:row.status==='grey_list'?'#DC2626':row.status==='enhanced'?'#4A6070':'#16A34A' }}>
                      {row.status==='grey_list'?'STR required':row.status==='enhanced'?'EDD required':'Standard CDD'}
                    </div>
                  </div>
                ))}
                <div style={{ padding:'10px 14px', background:'var(--color-surface-2)', fontSize:11, color:'var(--color-text-3)' }}>
                  FATF grey-list per Plenary October 2025 · Source: fatf-gafi.org · EDD = Enhanced Due Diligence required per CBSL AML Direction
                </div>
              </div>
            )}
          </div>

          {/* Counterparty Network Tab */}
          {activeTab === 'counterparty' && (
            <div style={{ padding:16, display:'flex', flexDirection:'column', gap:20 }}>

              {/* UBO Conflicts */}
              <div>
                <div style={{ fontSize:12, fontWeight:700, marginBottom:10, display:'flex', alignItems:'center', gap:8 }}>
                  Ultimate Beneficial Owner (UBO) Conflicts
                  <InfoTooltip text="Cross-referencing declared UBO across all NTB corporate accounts. The same beneficial owner declaring different ownership structures across multiple accounts is a FATF red flag for TBML or sanctions evasion. CBSL requires banks to maintain accurate UBO records for all corporate customers." width={300} position="right" />
                  <span style={{ marginLeft:'auto', fontSize:11, padding:'2px 8px', background:'#FEF0F0', color:'#DC2626', borderRadius:4, fontWeight:700 }}>
                    {(data.counterparty_network?.ubo_conflicts||[]).length} conflicts
                  </span>
                </div>
                {(data.counterparty_network?.ubo_conflicts||[]).map((conflict, i) => (
                  <div key={i} style={{ padding:'14px 16px', background:'var(--color-surface)', border:'1px solid var(--color-border)', borderLeft:`4px solid ${conflict.risk==='critical'?'#DC2626':'#4A6070'}`, borderRadius:8, marginBottom:10 }}>
                    <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:8, flexWrap:'wrap' }}>
                      <code style={{ fontSize:12, fontWeight:700 }}>{conflict.customer_id}</code>
                      <span style={{ fontSize:10, color:'var(--color-text-3)' }}>links to: {conflict.linked_accounts.join(', ')}</span>
                      <span style={{ marginLeft:'auto', fontSize:11, fontWeight:700, color:'#DC2626' }}>LKR {(conflict.combined_exposure_lkr/1e6).toFixed(0)}M</span>
                    </div>
                    <div style={{ fontSize:11, fontWeight:600, color:'var(--color-text-2)', marginBottom:6 }}>Declared: {conflict.ubo_declared}</div>
                    <div style={{ fontSize:12, color:'var(--color-text)', lineHeight:1.65, padding:'8px 12px', background:'var(--color-surface-2)', borderRadius:6 }}>{conflict.ubo_linked}</div>
                  </div>
                ))}
              </div>

              {/* Round-trip LC */}
              <div>
                <div style={{ fontSize:12, fontWeight:700, marginBottom:10, display:'flex', alignItems:'center', gap:8 }}>
                  Round-Trip Letter of Credit Detection
                  <InfoTooltip text="An LC issued by NTB backed by a fixed deposit of the same customer has no legitimate trade purpose. The goods cycle in and out with zero net trade value — the LC financing is used to generate artificial turnover and create a paper trail for KYC / sanctions purposes." width={300} position="right" />
                </div>
                {(data.counterparty_network?.roundtrip_lc||[]).map((lc, i) => (
                  <div key={i} style={{ padding:'14px 16px', background:'#FEF8F8', border:'1px solid #F5C2C2', borderLeft:'4px solid #DC2626', borderRadius:8, marginBottom:10 }}>
                    <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:8 }}>
                      <code style={{ fontSize:12, fontWeight:700 }}>{lc.lc_reference}</code>
                      <span style={{ fontSize:11, fontWeight:700, color:'#DC2626' }}>LKR {(lc.amount_lkr/1e6).toFixed(0)}M</span>
                      <span style={{ marginLeft:'auto', fontSize:11, padding:'2px 7px', background:'#FEF0F0', color:'#DC2626', borderRadius:4, fontWeight:700 }}>Score: {(lc.risk_score*100).toFixed(0)}/100</span>
                    </div>
                    <div style={{ fontSize:12, color:'var(--color-text)', lineHeight:1.65, padding:'8px 12px', background:'white', borderRadius:6 }}>{lc.finding}</div>
                    <div style={{ marginTop:6, fontSize:11, color:'var(--color-text-3)' }}>Backing deposit: {lc.supporting_deposit_id} · Customer: {lc.customer_id}</div>
                  </div>
                ))}
              </div>

              {/* Multi-bank structuring */}
              <div>
                <div style={{ fontSize:12, fontWeight:700, marginBottom:10, display:'flex', alignItems:'center', gap:8 }}>
                  Multi-Bank Trade Finance Structuring
                  <InfoTooltip text="The same shipment financed across multiple banks simultaneously constitutes fraudulent double-financing — a criminal offence under the Banking Act. Cross-referenced against Sri Lanka Customs import manifests to identify duplicate shipment financing." width={300} position="right" />
                </div>
                {(data.counterparty_network?.multi_bank_structuring||[]).map((mb, i) => (
                  <div key={i} style={{ padding:'14px 16px', background:'var(--color-surface)', border:'1px solid var(--color-border)', borderLeft:'4px solid #854F0B', borderRadius:8, marginBottom:10 }}>
                    <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:8 }}>
                      <code style={{ fontSize:12, fontWeight:700 }}>{mb.customer_id}</code>
                      <span style={{ marginLeft:'auto', fontSize:11, fontWeight:700, color:'#3A5A3A' }}>Est. double-financing: LKR {(mb.estimated_double_financing_lkr/1e6).toFixed(0)}M</span>
                    </div>
                    <div style={{ fontSize:12, color:'var(--color-text)', lineHeight:1.65, padding:'8px 12px', background:'var(--color-surface-2)', borderRadius:6 }}>{mb.finding}</div>
                    <div style={{ marginTop:6, fontSize:11, color:'var(--color-text-3)' }}>Evidence: {mb.evidence} · Score: {(mb.risk_score*100).toFixed(0)}/100</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ALCO / Liquidity Tab */}
          {activeTab === 'alco' && (
            <div style={{ padding:16, display:'flex', flexDirection:'column', gap:20 }}>

              {/* HQLA Breakdown */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                <div>
                  <div style={{ fontSize:12, fontWeight:700, marginBottom:10, display:'flex', alignItems:'center', gap:8 }}>
                    HQLA Composition
                    <InfoTooltip text="High Quality Liquid Assets (HQLA) are the assets banks can sell quickly in a stress scenario. Level 1 (government securities, CBSL reserves) count at 100%. Level 2A count at 85% after haircut. A declining HQLA trend is an early warning of LCR pressure." width={280} position="right" />
                  </div>
                  {[
                    { label:'L1 — Govt Securities', val:data.hqla_breakdown?.level1_govt_securities||0, color:'#16A34A' },
                    { label:'L1 — CBSL Reserves', val:data.hqla_breakdown?.level1_cbsl_reserves||0, color:'#0F6E56' },
                    { label:'L2A Assets', val:data.hqla_breakdown?.level2a_assets||0, color:'#4A6070' },
                  ].map((row, i) => {
                    const total = data.hqla_breakdown?.total_hqla_lkr||1;
                    const pct = Math.round((row.val/total)*100);
                    return (
                      <div key={i} style={{ marginBottom:10 }}>
                        <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, marginBottom:4 }}>
                          <span style={{ fontWeight:600 }}>{row.label}</span>
                          <span style={{ color:row.color, fontWeight:700 }}>LKR {(row.val/1e9).toFixed(1)}Bn ({pct}%)</span>
                        </div>
                        <div style={{ height:8, background:'var(--color-border)', borderRadius:4, overflow:'hidden' }}>
                          <div style={{ width:`${pct}%`, height:'100%', background:row.color, borderRadius:4 }} />
                        </div>
                      </div>
                    );
                  })}
                  <div style={{ padding:'8px 12px', background:'var(--color-surface-2)', borderRadius:6, fontSize:11, color:'var(--color-text-2)', lineHeight:1.5, marginTop:8 }}>
                    ⚠ {data.hqla_breakdown?.concentration_risk}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize:12, fontWeight:700, marginBottom:10, display:'flex', alignItems:'center', gap:8 }}>
                    30-Day Stress Test
                    <InfoTooltip text="Simulates whether NTB's HQLA is sufficient to cover net cash outflows over a 30-day stress scenario (Basel III standard). Stressed LCR below 100% means the bank would exhaust liquid assets before covering all outflows." width={280} position="right" />
                  </div>
                  {[
                    { label:'30d Net Outflow (Stressed)', val:`LKR ${((data.liquidity_stress?.scenario_30d_outflow_lkr||0)/1e9).toFixed(1)}Bn`, color:'#DC2626' },
                    { label:'HQLA Available', val:`LKR ${((data.liquidity_stress?.hqla_coverage||0)/1e9).toFixed(1)}Bn`, color:'#185FA5' },
                    { label:'Stressed LCR', val:`${data.liquidity_stress?.stress_lcr?.toFixed(1)}%`, color:data.liquidity_stress?.stress_lcr_passes_minimum?'#16A34A':'#DC2626' },
                    { label:'Minimum Requirement', val:'100%', color:'var(--color-text-3)' },
                  ].map((row,i) => (
                    <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid var(--color-border)', fontSize:12 }}>
                      <span>{row.label}</span>
                      <span style={{ fontWeight:700, color:row.color }}>{row.val}</span>
                    </div>
                  ))}
                  {!data.liquidity_stress?.stress_lcr_passes_minimum && (
                    <div style={{ marginTop:10, padding:'8px 12px', background:'#FEF0F0', borderRadius:6, fontSize:11, color:'#DC2626', lineHeight:1.5 }}>
                      ⚠ Stressed LCR <strong>fails</strong> the 100% minimum. NTB would exhaust liquid assets before covering all 30-day outflows in this scenario.
                    </div>
                  )}
                </div>
              </div>

              {/* Early Warning Indicators */}
              <div>
                <div style={{ fontSize:12, fontWeight:700, marginBottom:10, display:'flex', alignItems:'center', gap:8 }}>
                  Liquidity Early Warning Indicators
                  <InfoTooltip text="Leading indicators that CBSL supervisors monitor before an LCR breach materialises. Multiple simultaneous breaches indicate systemic liquidity stress requiring ALCO escalation." width={280} position="right" />
                  <span style={{ marginLeft:'auto', fontSize:11, padding:'2px 8px', background:'#FEF0F0', color:'#DC2626', borderRadius:4, fontWeight:700 }}>
                    {(data.liquidity_stress?.early_warning_indicators||[]).filter(e=>e.status==='breached').length} of {(data.liquidity_stress?.early_warning_indicators||[]).length} breached
                  </span>
                </div>
                <table style={{ width:'100%', borderCollapse:'collapse', fontSize:11 }}>
                  <thead>
                    <tr style={{ background:'var(--color-surface-2)', borderBottom:'2px solid var(--color-border)' }}>
                      {['Indicator','Current','Threshold','Status','Trend'].map(h => (
                        <th key={h} style={{ padding:'8px 10px', textAlign:'left', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', color:'var(--color-text-3)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(data.liquidity_stress?.early_warning_indicators||[]).map((ewi, i) => {
                      const sc = ewi.status==='breached'?'#DC2626':'#16A34A';
                      return (
                        <tr key={i} style={{ borderBottom:'1px solid var(--color-border)', background:ewi.status==='breached'?'#FEF8F8':'transparent' }}>
                          <td style={{ padding:'8px 10px', fontSize:11, maxWidth:200 }}>{ewi.indicator}</td>
                          <td style={{ padding:'8px 10px', fontWeight:700, color:sc }}>{ewi.current}</td>
                          <td style={{ padding:'8px 10px', color:'var(--color-text-2)' }}>{ewi.threshold}</td>
                          <td style={{ padding:'8px 10px' }}>
                            <span style={{ fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:4, background:`${sc}14`, color:sc }}>{ewi.status}</span>
                          </td>
                          <td style={{ padding:'8px 10px', fontSize:11, color:'var(--color-text-2)' }}>{ewi.trend}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Funding Concentration */}
              <div>
                <div style={{ fontSize:12, fontWeight:700, marginBottom:10, display:'flex', alignItems:'center', gap:8 }}>
                  Funding Concentration — Top 10 Depositors
                  <InfoTooltip text="Concentration of funding in a small number of depositors creates cliff-edge liquidity risk. CBSL monitors whether top 10 depositors represent more than 30% of total funding. Withdrawal by any single top depositor triggers immediate LCR stress." width={300} position="right" />
                </div>
                {(data.liquidity_stress?.funding_concentration||[]).map((dep, i) => (
                  <div key={i} style={{ padding:'12px 14px', background:'var(--color-surface)', border:'1px solid var(--color-border)', borderRadius:8, marginBottom:8 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                      <span style={{ fontSize:12, fontWeight:600 }}>{dep.depositor}</span>
                      <span style={{ fontSize:13, fontWeight:800, color:'#DC2626' }}>LKR {(dep.amount_lkr/1e9).toFixed(1)}Bn</span>
                    </div>
                    <div style={{ height:6, background:'var(--color-border)', borderRadius:3, overflow:'hidden', marginBottom:6 }}>
                      <div style={{ width:`${Math.min(dep.pct_of_funding*3, 100)}%`, height:'100%', background:dep.pct_of_funding>8?'#DC2626':'#4A6070', borderRadius:3 }} />
                    </div>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'var(--color-text-2)' }}>
                      <span>{dep.pct_of_funding}% of funding · {dep.type} · Due: {dep.maturity}</span>
                      <span style={{ color:'#4A6070' }}>{dep.risk}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pricing anomalies detail */}
          <PanelWithMethod
            title="Invoice Pricing Anomalies — TBML Detection"
                tooltip="Declared invoice price vs UN COMTRADE + Sri Lanka Customs median for that HS code. >25% deviation in either direction is a TBML flag. Over-invoicing extracts value abroad. Under-invoicing injects value informally."
            methodology="Each invoice's declared unit price is benchmarked against the HS code median from UN COMTRADE and Sri Lanka Customs. Over-invoicing: declared >25% above benchmark — exporter paid too much in forex, likely extracting value abroad. Under-invoicing: declared >25% below benchmark — the difference transferred through informal channels."
            agentColor={COLOR}
            tooltip="HS code benchmarking flags invoices where declared unit price deviates >25% from commodity market median."
          >
            <div>
              {(data.pricing_anomalies || []).map((anom,i) => (
                <div key={i} style={{ padding:'14px 16px', borderBottom:'1px solid var(--color-border)', background:Math.abs(anom.deviation_pct)>60?'var(--color-red-light)':'transparent' }}>
                  <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:8, flexWrap:'wrap' }}>
                    <code style={{ fontSize:12, fontWeight:700 }}>{anom.customer_id}</code>
                    <span style={{ fontSize:10, fontWeight:600, padding:'2px 8px', background:anom.anomaly_type==='over_invoicing'?'var(--color-red-light)':'#E8FDF4', color:anom.anomaly_type==='over_invoicing'?'var(--color-red)':'#3A5A3A', borderRadius:4 }}>
                      {anom.anomaly_type==='over_invoicing'?'↑ Over-invoicing':'↓ Under-invoicing'}
                    </span>
                    <span style={{ fontSize:10, padding:'2px 6px', background:'var(--color-surface-2)', borderRadius:4 }}>HS {anom.hs_code}</span>
                    <span style={{ marginLeft:'auto', fontSize:13, fontWeight:800, color:'var(--color-red)' }}>
                      {Math.abs(anom.deviation_pct).toFixed(0)}% deviation
                    </span>
                  </div>
                  <div style={{ fontSize:12, color:'var(--color-text-2)', marginBottom:8 }}>
                    {anom.commodity_description} · {anom.counterparty_country}
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
                  <div style={{ marginTop:10, display:'flex', gap:12, fontSize:11, color:'var(--color-text-3)' }}>
                    <span>Est. illicit flow: <strong style={{ color:'#DC2626' }}>LKR {(anom.estimated_illicit_flow_lkr/1e6).toFixed(0)}M</strong></span>
                    <button onClick={() => navigate('/cases', { state: { caseId: anom.anomaly_type==='over_invoicing'?'CASE-003':'CASE-009' } })}
                      style={{ fontSize:11, fontWeight:600, padding:'2px 9px', background:'#3B6D1112', border:'1px solid #3B6D1130', borderRadius:5, color:'#3B6D11', cursor:'pointer' }}>
                      View case →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </PanelWithMethod>
        </>
      )}
    </AgentModule>
  );
}

import React, { useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie } from 'recharts';
import AgentModule from '../../components/shared/AgentModule.jsx';
import { VisualFindingCard, InsightBox, PanelWithMethod, MetricSpotlight, VerdictCard, HeatStrip, AnomalyHeatRow, EntityBadgeRow } from '../../components/shared/VisualComponents.jsx';
import ExplainerBox from '../../components/shared/ExplainerBox.jsx';
import InfoTooltip from '../../components/shared/InfoTooltip.jsx';
import useOpenFinding from '../../hooks/useOpenFinding.js';
import { demoData, peerBenchmarks } from '../../data/demoData.js';

const COLOR = '#0F6E56';
const RISK_COLORS = { high:'#C41E3A', medium:'#4A6070', low:'#0BBF7A', critical:'#C41E3A' };

export default function KYCAgent() {
  const [activeTab, setActiveTab] = useState('gaps');
  const openFinding = useOpenFinding('kyc');

  return (
    <AgentModule agentId="kyc" agentName="Identity & KYC / AML Agent" agentColor={COLOR} demoData={demoData.kyc} schema={[]}>
      {(data) => {
        const cs = data.compliance_summary || {};

        // Summary for pie chart
        const gapData = [
          { name:'Compliant', value: cs.total_customers_analyzed - cs.kyc_gap_count, fill:'#0BBF7A' },
          { name:'KYC Gap', value: cs.kyc_gap_count, fill:'#C41E3A' },
        ];

        return (
          <>
            <ExplainerBox color={COLOR} icon="✦"
              title="How this agent checks 835,944 accounts for KYC compliance"
              summary="A 47-rule CDD engine runs nightly across every account. Rules cover document expiry, PEP EDD overdue status, FATF-country exposure, beneficial ownership gaps, and introducer concentration."
              detail="PEP accounts require enhanced due diligence with annual review. A 4.7% KYC gap rate across 835,944 customers = 39,290 accounts with material compliance failures. CBSL mandates this rate below 2%."
              collapsible />

            {/* Audit Opinion */}
            <div style={{ background:`${COLOR}06`, border:`1px solid ${COLOR}22`, borderRadius:10, overflow:'hidden' }}>
              <div style={{ padding:'12px 16px', display:'flex', gap:10, alignItems:'flex-start' }}>
                <div style={{ fontSize:10, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.08em', padding:'3px 9px', borderRadius:5, background:COLOR, color:'white', flexShrink:0, marginTop:2 }}>QUALIFIED</div>
                <div style={{ fontSize:12, color:COLOR, lineHeight:1.7 }}>In our opinion, the KYC / AML compliance framework is PARTIALLY EFFECTIVE. 39,290 accounts have material gaps. The 4.7% gap rate exceeds CBSL's 2% threshold. 34 PEP accounts require immediate EDD review.</div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', borderTop:`1px solid ${COLOR}18` }}>
                {[['Population tested','835,944 customer accounts (100%)'],['Period covered','As at 31 December 2025'],['Materiality threshold','All PEP accounts; gaps on accounts with transactions >LKR 1M in period'],['Model limitations','Third-party PEP database updated quarterly; real-time sanctions screening not within scope']].map(([k,v],i)=>(
                  <div key={i} style={{ padding:'7px 16px', borderRight:i%2===0?`1px solid ${COLOR}12`:'none', borderBottom:i<2?`1px solid ${COLOR}12`:'none' }}>
                    <div style={{ fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:COLOR, opacity:0.65, marginBottom:2 }}>{k}</div>
                    <div style={{ fontSize:11, color:COLOR, lineHeight:1.5 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero metrics with compliance pie */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr 200px', gap:12, alignItems:'start' }}>
              <MetricSpotlight value={(cs.kyc_gap_count||39290).toLocaleString()} label="KYC Gap Accounts" sub={`${cs.kyc_gap_pct||4.7}% of portfolio — CBSL limit: 2%`} color="#C41E3A" icon="✦" trend="Breach" trendDir="up" />
              <MetricSpotlight value={cs.pep_accounts||34} label="PEP Accounts" sub={`${cs.pep_related_accounts||89} related accounts`} color="#C41E3A" trend="EDD required" trendDir="up" />
              <MetricSpotlight value={cs.beneficial_ownership_gaps||234} label="BO Gaps" sub="Ownership undisclosed" color="#4A6070" />
              <MetricSpotlight value={cs.overdue_refresh_count?.toLocaleString()||'12,847'} label="Overdue Refresh" sub="Documentation expired" color={COLOR} />
              <div style={{ background:'var(--color-surface)', border:'1px solid var(--color-border)', borderRadius:12, padding:'14px', display:'flex', flexDirection:'column', alignItems:'center' }}>
                <PieChart width={100} height={100}>
                  <Pie data={gapData} dataKey="value" cx={50} cy={50} innerRadius={30} outerRadius={48} strokeWidth={0}>
                    {gapData.map((d,i)=><Cell key={i} fill={d.fill} />)}
                  </Pie>
                </PieChart>
                <div style={{ textAlign:'center', marginTop:4 }}>
                  <div style={{ fontSize:16, fontWeight:900, color:'#C41E3A', fontFamily:'var(--font-display)' }}>{cs.kyc_gap_pct||4.7}%</div>
                  <div style={{ fontSize:10, color:'var(--color-text-3)', textTransform:'uppercase', letterSpacing:'0.05em' }}>Gap rate</div>
                </div>
              </div>
            </div>

            <div className="agent-panel">
              <div className="agent-panel-header"><span className="agent-panel-title">Key Findings</span></div>
              <div className="agent-panel-body">{(data.key_findings||[]).map((f,i)=><VisualFindingCard key={i} finding={f} agentColor={COLOR} index={i} agentId="kyc" agentData={data} openFinding={openFinding} />)}</div>
            </div>

            {/* Tabbed analysis */}
            <div className="agent-panel">
              <div className="agent-panel-header" style={{ padding:0 }}>
                {['gaps','pep','branch'].map(tab=>(
                  <button key={tab} onClick={()=>setActiveTab(tab)} style={{ padding:'11px 18px', fontSize:12, fontWeight:activeTab===tab?700:400, background:'none', border:'none', borderBottom:`2px solid ${activeTab===tab?COLOR:'transparent'}`, color:activeTab===tab?COLOR:'var(--color-text-2)', cursor:'pointer', flex:1, fontFamily:'var(--font-display)', letterSpacing:'0.04em' }}>
                    {tab==='gaps'?'KYC Gaps':tab==='pep'?'PEP / EDD':'Branch Heatmap'}
                  </button>
                ))}
              </div>

              {activeTab === 'gaps' && (
                <div>
                  <div style={{ padding:'8px 14px', background:'#F3F3F1', borderBottom:'1px solid var(--color-border)', display:'grid', gridTemplateColumns:'1fr 80px 80px 80px', gap:8 }}>
                    {['Customer','Gap type','Days','Risk'].map(h=><span key={h} style={{ fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--color-text-3)' }}>{h}</span>)}
                  </div>
                  {(data.kyc_gaps||[]).map((gap,i)=>{
                    const rc = RISK_COLORS[gap.risk_rating]||COLOR;
                    return (
                      <div key={i} style={{ padding:'10px 14px', borderBottom:'1px solid var(--color-border)', display:'grid', gridTemplateColumns:'1fr 80px 80px 80px', gap:8, alignItems:'center', background: i%2===0?'transparent':'var(--color-surface-2)' }}>
                        <div>
                          <code style={{ fontSize:11, fontWeight:700 }}>{gap.customer_id}</code>
                          <div style={{ fontSize:11, color:'var(--color-text-2)', marginTop:1 }}>{gap.gap_type}</div>
                        </div>
                        <span style={{ fontSize:11, color:'var(--color-text-2)', textAlign:'center' }}>{gap.days_overdue}d</span>
                        <span style={{ fontSize:11, color:'var(--color-text-2)', textAlign:'center' }}>LKR {((gap.transaction_volume_lkr||0)/1e6).toFixed(0)}M</span>
                        <span style={{ fontSize:9, fontWeight:800, padding:'2px 7px', borderRadius:5, background:`${rc}15`, color:rc, textAlign:'center' }}>{gap.risk_rating?.toUpperCase()}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {activeTab === 'pep' && (
                <div>
                  {(data.pep_findings||[]).map((pep,i)=>(
                    <div key={i} style={{ padding:'16px', borderBottom:'1px solid var(--color-border)' }}>
                      <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:10 }}>
                        <code style={{ fontSize:13, fontWeight:800 }}>{pep.customer_id}</code>
                        <span style={{ fontSize:11, color:'var(--color-text-2)' }}>{pep.pep_category}</span>
                        <span style={{ marginLeft:'auto', fontSize:11, fontWeight:700, padding:'2px 8px', background:'#FCEEF1', color:'#C41E3A', borderRadius:5 }}>EDD {pep.edd_status}</span>
                      </div>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:10 }}>
                        <HeatStrip value={pep.days_edd_overdue||0} max={500} color={pep.days_edd_overdue>180?'#C41E3A':'#4A6070'} label="EDD Overdue" format={v=>`${v} days`} />
                        <HeatStrip value={(pep.transaction_volume_lkr||0)} max={1e9} color={COLOR} label="Transaction Volume" format={v=>`LKR ${(v/1e6).toFixed(0)}M`} />
                      </div>
                      {pep.regulatory_breach && (
                        <div style={{ padding:'8px 12px', background:'#FCEEF1', borderRadius:8, fontSize:11, color:'#C41E3A', fontWeight:600, border:'1px solid rgba(196,30,58,0.2)' }}>
                          ⚠ {pep.regulatory_breach}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'branch' && (
                <div style={{ padding:'16px' }}>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={(data.branch_compliance_heatmap||[]).slice(0,12)} layout="vertical" margin={{ top:0, right:60, bottom:0, left:20 }}>
                      <XAxis type="number" domain={[0,20]} tick={{ fontSize:10 }} unit="%" />
                      <YAxis type="category" dataKey="branch_code" tick={{ fontSize:11 }} width={50} />
                      <Tooltip formatter={v=>`${v.toFixed(1)}% gap rate`} />
                      <Bar dataKey="gap_rate_pct" radius={[0,4,4,0]} label={{ position:'right', fontSize:10, formatter:v=>`${v.toFixed(1)}%` }}>
                        {(data.branch_compliance_heatmap||[]).slice(0,12).map((d,i)=>(
                          <Cell key={i} fill={d.gap_rate_pct>10?'#C41E3A':d.gap_rate_pct>5?'#4A6070':'#0BBF7A'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <div style={{ marginTop:12, display:'flex', gap:10 }}>
                    {[['#C41E3A','>10% — Critical'],['#4A6070','5–10% — Review'],['#0BBF7A','<5% — Compliant']].map(([c,l])=>(
                      <span key={l} style={{ fontSize:10, display:'flex', alignItems:'center', gap:5, color:'var(--color-text-2)' }}>
                        <span style={{ width:10, height:10, borderRadius:2, background:c, display:'inline-block' }} />{l}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Peer benchmarks */}
            <div className="agent-panel">
              <div className="agent-panel-header"><span className="agent-panel-title">Peer Benchmarking — KYC / AML</span><InfoTooltip text="NTB vs licensed commercial bank peers. Source: CBSL AML Compliance Review 2025." position="left" /></div>
              <div>
                {Object.entries(peerBenchmarks?.kyc||{}).map(([key,b],i)=>{
                  const labels = { kyc_gap_rate:'KYC Gap Rate (%)', pep_edd_overdue_pct:'PEP EDD Overdue (%)', str_filing_rate:'STR Filing Rate (per acct)' };
                  const lowerBetter = ['kyc_gap_rate','pep_edd_overdue_pct'].includes(key);
                  const better = lowerBetter ? b.ntb <= b.peer_median : b.ntb >= b.peer_median;
                  const col = better ? '#0BBF7A' : '#C41E3A';
                  return <AnomalyHeatRow key={key} label={labels[key]||key} value={b.ntb} benchmark={b.peer_median} deviation={Math.round(((b.ntb-b.peer_median)/b.peer_median)*100)} risk={better?'low':'critical'} color={col} />;
                })}
                <div style={{ padding:'8px 14px', fontSize:10, color:'var(--color-text-3)' }}>Source: CBSL AML Compliance Review 2025</div>
              </div>
            </div>
          </>
        );
      }}
    </AgentModule>
  );
}

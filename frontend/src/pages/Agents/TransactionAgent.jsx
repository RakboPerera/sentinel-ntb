import React, { useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, LineChart, Line, ReferenceLine, ComposedChart, Area } from 'recharts';
import AgentModule from '../../components/shared/AgentModule.jsx';
import { VisualFindingCard, InsightBox, PanelWithMethod, MetricSpotlight, VerdictCard, HeatStrip, EntityBadgeRow } from '../../components/shared/VisualComponents.jsx';
import ExplainerBox from '../../components/shared/ExplainerBox.jsx';
import InfoTooltip from '../../components/shared/InfoTooltip.jsx';
import useOpenFinding from '../../hooks/useOpenFinding.js';
import { demoData } from '../../data/demoData.js';

const COLOR = '#4A6070';

export default function TransactionAgent() {
  const [activeTab, setActiveTab] = useState('structuring');
  const openFinding = useOpenFinding('transaction');

  return (
    <AgentModule agentId="transaction" agentName="Transaction Surveillance Agent" agentColor={COLOR} demoData={demoData.transaction} schema={[]}>
      {(data) => {
        const ss = data.surveillance_summary || {};
        const benford = data.benford_analysis || {};
        const BENFORD_EXPECTED = [30.1,17.6,12.5,9.7,7.9,6.7,5.8,5.1,4.6];
        const benfordData = BENFORD_EXPECTED.map((exp,i) => ({
          digit: i+1,
          expected: exp,
          actual: benford.first_digit_distribution?.[i] ?? exp,
        }));

        return (
          <>
            <ExplainerBox color={COLOR} icon="⟳"
              title="How this agent detects structuring and AML transaction patterns"
              summary="Benford's Law predicts the distribution of first digits in any large natural dataset. When transactions cluster below the LKR 5M STR threshold, the digit '4' appears far more than expected — a mathematical fingerprint of structuring."
              detail="Three detection layers: (1) Benford's Law first-digit test across 284,719 transactions. (2) Structuring cluster detection — 3+ transactions below threshold, combined above threshold, within 24h. (3) Velocity anomalies vs 90-day rolling baseline per account."
              collapsible />

            {/* Audit Opinion */}
            <div style={{ background:`${COLOR}06`, border:`1px solid ${COLOR}22`, borderRadius:10, overflow:'hidden' }}>
              <div style={{ padding:'12px 16px', display:'flex', gap:10, alignItems:'flex-start' }}>
                <div style={{ fontSize:10, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.08em', padding:'3px 9px', borderRadius:5, background:COLOR, color:'white', flexShrink:0, marginTop:2 }}>ADVERSE</div>
                <div style={{ fontSize:12, color:COLOR, lineHeight:1.7 }}>In our opinion, the AML transaction monitoring control environment is NOT EFFECTIVE. Structuring activity confirmed at 4 accounts. 4 STR-eligible cases must be filed within 5 working days under FTRA.</div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', borderTop:`1px solid ${COLOR}18` }}>
                {[['Population tested','284,719 transactions (100%)'],['Period covered','FY 2025 (Jan–Dec)'],['Materiality threshold','LKR 5M STR threshold; velocity anomalies ≥3× 90-day baseline'],["Model limitations","Benford&#39;s Law requires sufficient volume per account; accounts <90 days excluded from velocity baseline"]].map(([k,v],i)=>(
                  <div key={i} style={{ padding:'7px 16px', borderRight:i%2===0?`1px solid ${COLOR}12`:'none', borderBottom:i<2?`1px solid ${COLOR}12`:'none' }}>
                    <div style={{ fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:COLOR, opacity:0.65, marginBottom:2 }}>{k}</div>
                    <div style={{ fontSize:11, color:COLOR, lineHeight:1.5 }} dangerouslySetInnerHTML={{__html:v}} />
                  </div>
                ))}
              </div>
            </div>

            {/* Hero metrics */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
              <MetricSpotlight value={`LKR ${((ss.total_volume_lkr||0)/1e9).toFixed(1)}Bn`} label="Total Volume" sub={`${(ss.total_transactions_analyzed||0).toLocaleString()} transactions`} color={COLOR} icon="⟳" />
              <MetricSpotlight value={ss.str_eligible_count||4} label="STR Eligible" sub="File within 5 working days" color="#C41E3A" trend="FTRA deadline" trendDir="up" />
              <MetricSpotlight value={ss.structuring_clusters||7} label="Structuring Clusters" sub="Below-threshold splitting" color="#C41E3A" />
              <MetricSpotlight value={ss.high_risk_accounts||23} label="High-Risk Accounts" sub="Velocity or Benford flags" color="#4A6070" />
            </div>

            <div className="agent-panel">
              <div className="agent-panel-header"><span className="agent-panel-title">Key Findings</span></div>
              <div className="agent-panel-body">{(data.key_findings||[]).map((f,i)=><VisualFindingCard key={i} finding={f} agentColor={COLOR} index={i} agentId="transaction" agentData={data} openFinding={openFinding} />)}</div>
            </div>

            {/* Benford's Law Chart — always visible hero visual */}
            <PanelWithMethod title="Benford's Law Analysis — First Digit Distribution" tooltip="In any large natural dataset, digit '1' should appear as the first digit ~30% of the time. When transactions are deliberately split below LKR 5M, digit '4' appears anomalously often — the mathematical signature of structuring." methodology="First-digit frequency computed across 284,719 transactions. Expected distribution follows Benford's Law (log10(1+1/d)). Chi-squared test p < 0.0001 confirms the deviation is not random." agentColor={COLOR}>
              <div style={{ padding:'16px' }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:16, alignItems:'start' }}>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={benfordData} margin={{ top:10, right:10, bottom:10, left:0 }}>
                      <XAxis dataKey="digit" tick={{ fontSize:11 }} label={{ value:'First digit', position:'insideBottom', offset:-2, fontSize:10 }} />
                      <YAxis tickFormatter={v=>`${v}%`} tick={{ fontSize:10 }} />
                      <Tooltip formatter={(v,n)=>[`${v.toFixed(1)}%`, n==='actual'?'Observed':'Expected']} />
                      <Bar dataKey="expected" fill="#D1D0CB" radius={[3,3,0,0]} name="Expected" />
                      <Bar dataKey="actual" radius={[3,3,0,0]} name="Observed">
                        {benfordData.map((d,i)=>{
                          const deviation = Math.abs(d.actual-d.expected);
                          return <Cell key={i} fill={deviation>3?'#C41E3A':deviation>1.5?COLOR:'#0BBF7A'} />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <div style={{ minWidth:180 }}>
                    <div style={{ fontSize:11, fontWeight:700, marginBottom:10, color:'var(--color-text-2)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Key deviations</div>
                    {benfordData.filter(d=>Math.abs(d.actual-d.expected)>2).map((d,i)=>(
                      <div key={i} style={{ padding:'8px 12px', background:`${Math.abs(d.actual-d.expected)>4?'#FCEEF1':'#F3F3F1'}`, borderRadius:8, marginBottom:6, border:`1px solid ${Math.abs(d.actual-d.expected)>4?'rgba(196,30,58,0.2)':'var(--color-border)'}` }}>
                        <div style={{ fontSize:24, fontWeight:900, color:Math.abs(d.actual-d.expected)>4?'#C41E3A':COLOR, fontFamily:'var(--font-display)', lineHeight:1 }}>{d.digit}</div>
                        <div style={{ fontSize:11, color:'var(--color-text-2)' }}>
                          Observed: <strong>{d.actual.toFixed(1)}%</strong><br/>
                          Expected: {d.expected.toFixed(1)}%<br/>
                          <strong style={{ color:'#C41E3A' }}>+{(d.actual-d.expected).toFixed(1)}% excess</strong>
                        </div>
                      </div>
                    ))}
                    <InsightBox type="warning" body={`Digit '4' appears ${benford.digit_4_pct?.toFixed(1)||18.3}% vs expected 9.7% — systematic structuring below LKR 5M threshold confirmed.`} />
                  </div>
                </div>
              </div>
            </PanelWithMethod>

            {/* Analysis tabs */}
            <div className="agent-panel">
              <div className="agent-panel-header" style={{ padding:0 }}>
                {['structuring','velocity','str'].map(tab=>(
                  <button key={tab} onClick={()=>setActiveTab(tab)} style={{ padding:'11px 18px', fontSize:12, fontWeight:activeTab===tab?700:400, background:'none', border:'none', borderBottom:`2px solid ${activeTab===tab?COLOR:'transparent'}`, color:activeTab===tab?COLOR:'var(--color-text-2)', cursor:'pointer', flex:1, fontFamily:'var(--font-display)', letterSpacing:'0.04em' }}>
                    {tab==='structuring'?'Structuring Clusters':tab==='velocity'?'Velocity Anomalies':'STR Queue'}
                  </button>
                ))}
              </div>

              {activeTab === 'structuring' && (
                <div>
                  {(data.structuring_clusters||[]).map((cl,i)=>(
                    <div key={i} style={{ padding:'16px', borderBottom:'1px solid var(--color-border)' }}>
                      <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:12, flexWrap:'wrap' }}>
                        <code style={{ fontSize:13, fontWeight:800 }}>{cl.account_id}</code>
                        <span style={{ fontSize:11, color:'var(--color-text-2)' }}>{cl.branch_code}</span>
                        <span style={{ marginLeft:'auto', fontSize:22, fontWeight:900, color:'#C41E3A', fontFamily:'var(--font-display)' }}>LKR {((cl.combined_amount_lkr||0)/1e6).toFixed(1)}M</span>
                      </div>
                      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:12 }}>
                        {[
                          { label:'Transactions', val:cl.cluster_transactions, color:COLOR },
                          { label:'Timespan', val:`${cl.cluster_timespan_minutes}min`, color:'#4A6070' },
                          { label:'Max single', val:`LKR ${((cl.max_single_txn_lkr||0)/1e6).toFixed(1)}M`, color:'var(--color-text-2)' },
                          { label:'Score', val:`${(cl.structuring_score*100).toFixed(0)}/100`, color:'#C41E3A' },
                        ].map((m,j)=>(
                          <div key={j} style={{ textAlign:'center', padding:'8px', background:`${m.color}08`, borderRadius:8, border:`1px solid ${m.color}20` }}>
                            <div style={{ fontSize:18, fontWeight:900, color:m.color, fontFamily:'var(--font-display)' }}>{m.val}</div>
                            <div style={{ fontSize:9, color:'var(--color-text-3)', textTransform:'uppercase', letterSpacing:'0.05em', marginTop:2 }}>{m.label}</div>
                          </div>
                        ))}
                      </div>
                      <VerdictCard verdict={cl.str_eligible?'STR Eligible':'Flag'} confidence={cl.structuring_score} finding={cl.pattern_description||`${cl.cluster_transactions} transactions in ${cl.cluster_timespan_minutes} minutes — combined LKR ${((cl.combined_amount_lkr||0)/1e6).toFixed(0)}M`} evidence={cl.transaction_ids?.slice(0,3)} color={cl.str_eligible?'#C41E3A':COLOR} action={cl.recommended_action} />
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'velocity' && (
                <div>
                  {(data.velocity_anomalies||[]).map((va,i)=>(
                    <div key={i} style={{ padding:'14px 16px', borderBottom:'1px solid var(--color-border)' }}>
                      <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:8 }}>
                        <code style={{ fontSize:12, fontWeight:700 }}>{va.account_id}</code>
                        <span style={{ fontSize:11, color:'var(--color-text-2)' }}>{va.account_type}</span>
                        <span style={{ marginLeft:'auto', fontSize:11, fontWeight:700, padding:'2px 8px', background:'#FCEEF1', color:'#C41E3A', borderRadius:5 }}>{va.velocity_score?.toFixed(2)||0} score</span>
                      </div>
                      <HeatStrip value={va.velocity_score||0} max={1} color={va.velocity_score>0.8?'#C41E3A':COLOR} label={`${va.flag_period_txn_count} txns vs ${va.baseline_txn_count} baseline`} sublabel={`${va.velocity_multiple?.toFixed(1)||3}× above 90-day baseline`} format={v=>`${(v*100).toFixed(0)}/100`} />
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'str' && (
                <div>
                  <div style={{ padding:'10px 14px', background:'#FCEEF1', borderBottom:'1px solid rgba(196,30,58,0.2)', fontSize:12, fontWeight:600, color:'#C41E3A' }}>
                    ⏱ FTRA Section 7 — STR must be filed with CBSL FIU within 5 working days of identification
                  </div>
                  {(data.str_queue||[]).map((str,i)=>(
                    <div key={i} style={{ padding:'14px 16px', borderBottom:'1px solid var(--color-border)' }}>
                      <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:8 }}>
                        <code style={{ fontSize:12, fontWeight:700 }}>{str.account_id}</code>
                        <span style={{ fontSize:10, fontWeight:700, padding:'2px 7px', background: str.urgency==='immediate'?'#C41E3A':'#4A6070', color:'white', borderRadius:4 }}>{str.urgency}</span>
                        <span style={{ marginLeft:'auto', fontSize:13, fontWeight:800, color:'#C41E3A' }}>LKR {((str.amount_lkr||0)/1e6).toFixed(0)}M</span>
                      </div>
                      <div style={{ fontSize:12, color:'var(--color-text-2)', lineHeight:1.6 }}>{str.str_grounds}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        );
      }}
    </AgentModule>
  );
}

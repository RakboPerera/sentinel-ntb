import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ReferenceLine, ScatterChart, Scatter, LineChart, Line } from 'recharts';
import AgentModule from '../../components/shared/AgentModule.jsx';
import { StatCard, VisualFindingCard, InsightBox, PanelWithMethod, MetricSpotlight, VerdictCard, HeatStrip, ComparisonSplit, AnomalyHeatRow } from '../../components/shared/VisualComponents.jsx';
import ExplainerBox from '../../components/shared/ExplainerBox.jsx';
import InfoTooltip from '../../components/shared/InfoTooltip.jsx';
import useOpenFinding from '../../hooks/useOpenFinding.js';
import { demoData, peerBenchmarks } from '../../data/demoData.js';

const COLOR = '#185FA5';
const SCHEMA = [{ field:'loan_id',type:'string' },{ field:'stage',type:'string' },{ field:'dpd',type:'number' },{ field:'collateral_ratio',type:'number' },{ field:'restructured',type:'boolean' },{ field:'override_flag',type:'boolean' },{ field:'exposure_lkr',type:'number' },{ field:'sector',type:'string' }];
const SECTOR_COLORS = { 'Real Estate':'#E82AAE','Construction':'#4A6070','Tourism':'#0BBF7A','Manufacturing':'#1F2937','Consumer':'#26EA9F','Other':'#8A8A85' };

export default function CreditAgent() {
  const openFinding = useOpenFinding('credit');
  const navigate = useNavigate();
  return (
    <AgentModule agentId="credit" agentName="Credit Intelligence Agent" agentColor={COLOR} demoData={demoData.credit} schema={SCHEMA}>
      {(data) => {
        const ps = data.portfolio_summary || {};
        const ci = data.capital_impact || {};
        return (
          <>
            <ExplainerBox color={COLOR} icon="◈"
              title="How this agent detects SLFRS 9 staging manipulation"
              summary="Isolation Forest runs across 16,631 loans simultaneously — scoring each on DPD, collateral coverage, restructure history, sector risk, and override flags to find combinations that cannot be explained by legitimate credit risk."
              detail="Stage misclassification is the mechanism: a Stage 3 loan assigned Stage 1 requires 3× less provision. The agent compares each loan's predicted stage (from feature combination) against its assigned stage. Where they diverge with high confidence, the gap is a regulatory provision shortfall."
              collapsible />

            {/* Audit Opinion */}
            <div style={{ background:'#185FA506', border:'1px solid #185FA522', borderRadius:10, overflow:'hidden' }}>
              <div style={{ padding:'12px 16px', display:'flex', gap:10, alignItems:'flex-start' }}>
                <div style={{ fontSize:10, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.08em', padding:'3px 9px', borderRadius:5, background:'#185FA5', color:'white', flexShrink:0, marginTop:2 }}>QUALIFIED</div>
                <div style={{ fontSize:12, color:'#185FA5', lineHeight:1.7 }}>Staging anomalies identified across LKR 1.41Bn of loans. In our opinion, SLFRS 9 staging controls are NOT EFFECTIVE at Branch BR-14. 11 loans are misclassified; ECL is understated by approximately LKR 310M.</div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', borderTop:'1px solid #185FA518' }}>
                {[['Population tested','16,631 loans (100% of portfolio)'],['Period covered','FY 2025 (Jan–Dec)'],['Materiality threshold','LKR 50M per loan; all loans with override flag'],['Model limitations','Isolation Forest assumes linear feature relationships; FLI overlays require separate staging committee review']].map(([k,v],i)=>(
                  <div key={i} style={{ padding:'7px 16px', borderRight:i%2===0?'1px solid #185FA512':'none', borderBottom:i<2?'1px solid #185FA512':'none' }}>
                    <div style={{ fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'#185FA5', opacity:0.65, marginBottom:2 }}>{k}</div>
                    <div style={{ fontSize:11, color:'#185FA5', lineHeight:1.5 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero metrics */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
              <MetricSpotlight value={`LKR ${((ps.total_flagged_exposure_lkr||0)/1e9).toFixed(2)}Bn`} label="Flagged Exposure" sub={`${ps.flagged_loans||0} of ${ps.total_loans||0} loans`} color={COLOR} icon="◈" />
              <MetricSpotlight value={`LKR ${((ps.estimated_ecl_understatement_lkr||0)/1e6).toFixed(0)}M`} label="ECL Understatement" sub="Stage misclassification" color="var(--octave-pink)" trend="Provision gap" trendDir="up" />
              <MetricSpotlight value={`${ps.stage_3_ratio_corrected||0}%`} label="Corrected Stage 3" sub={`Was ${ps.stage_3_ratio_reported||0}% reported`} color="#0BBF7A" trend={`+${((ps.stage_3_ratio_corrected||0)-(ps.stage_3_ratio_reported||0)).toFixed(2)}% delta`} trendDir="up" />
              <MetricSpotlight value={`LKR ${((ps.override_approved_exposure_lkr||0)/1e6).toFixed(0)}M`} label="Override-Approved" sub="All by STF-1847, BR-14" color="#4A6070" />
            </div>

            {/* Key Findings */}
            <div className="agent-panel">
              <div className="agent-panel-header"><span className="agent-panel-title">Key Findings</span><InfoTooltip text="Systemic findings derived from collective anomaly analysis. Each represents a pattern the agent found statistically significant across the loan population — not an individual judgment call." position="left" /></div>
              <div className="agent-panel-body">{(data.key_findings||[]).map((f,i) => <VisualFindingCard key={i} finding={f} agentColor={COLOR} index={i} agentId="credit" agentData={data} openFinding={openFinding} />)}</div>
            </div>

            <div className="agent-grid">
              {/* Left: Loan anomaly scatter */}
              <PanelWithMethod title="Loan Anomaly Scores" tooltip="Each dot is a loan. X-axis = anomaly score (0=normal, 1=extreme outlier). Y-axis = exposure. Colour = stage. Dots above the threshold line are flagged." methodology="Isolation Forest trains on 8 features across the full loan population. Each loan gets an anomaly score — how many standard deviations its feature combination sits from the population centroid." agentColor={COLOR}>
                <div style={{ padding:'16px' }}>
                  <ResponsiveContainer width="100%" height={220}>
                    <ScatterChart margin={{ top:10, right:20, bottom:10, left:10 }}>
                      <XAxis dataKey="score" name="Anomaly" domain={[0,1]} tick={{ fontSize:10 }} label={{ value:'Anomaly score', position:'insideBottom', offset:-2, fontSize:10 }} />
                      <YAxis dataKey="exposure" name="Exposure (LKR M)" tick={{ fontSize:10 }} tickFormatter={v=>`${(v/1e6).toFixed(0)}M`} />
                      <Tooltip formatter={(v,n)=>n==='Anomaly'?v.toFixed(3):`LKR ${(v/1e6).toFixed(1)}M`} />
                      <ReferenceLine x={0.65} stroke="var(--octave-pink)" strokeDasharray="4 3" label={{ value:'Flag', fontSize:9, fill:'var(--octave-pink)' }} />
                      <Scatter data={(data.flagged_loans||[]).map(l=>({ score:l.anomaly_score, exposure:l.exposure_lkr, stage:l.predicted_stage }))}
                        fill={COLOR} opacity={0.7} r={4} />
                    </ScatterChart>
                  </ResponsiveContainer>
                  <div style={{ marginTop:12, display:'flex', gap:8, flexWrap:'wrap' }}>
                    {[['0.65–0.80','High anomaly',COLOR,'12'],['0.80–1.00','Critical outlier','var(--octave-pink)','4']].map(([r,l,c,n])=>(
                      <div key={r} style={{ padding:'5px 10px', background:`${c}10`, border:`1px solid ${c}30`, borderRadius:6, fontSize:11 }}>
                        <span style={{ fontWeight:700, color:c }}>{n} loans</span> <span style={{ color:'var(--color-text-2)' }}>{l}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </PanelWithMethod>

              {/* Right: top panel stack */}
              <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

                {/* Capital impact */}
                <div className="agent-panel">
                  <div className="agent-panel-header"><span className="agent-panel-title">Regulatory Capital Impact</span><InfoTooltip text="Under Basel III, misclassified loans carry incorrect Risk Weights. Correcting the stage reclassifications increases RWA and reduces CAR. If aggregate impact exceeds 50bps, CBSL notification is mandatory." position="left" width={300} /></div>
                  <div style={{ padding:'16px' }}>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
                      <ComparisonSplit leftLabel="Current Tier 1 CAR" leftValue={`${ci.current_tier1_car||19.06}%`} leftColor="#0BBF7A" rightLabel="Corrected CAR" rightValue={`${ci.corrected_tier1_car||18.59}%`} rightColor="var(--octave-pink)" note={`−${ci.car_impact_bps||47}bps · ${(ci.car_impact_bps||47)>=50?'⚠ Exceeds CBSL 50bps notification threshold':'Below notification threshold'}`} />
                    </div>
                    <HeatStrip value={ci.additional_rwa_lkr||4.2e9} max={20e9} color="var(--octave-pink)" label="Additional RWA" sublabel="Basel III risk-weighted impact of corrected staging" format={v=>`LKR ${(v/1e9).toFixed(1)}Bn`} />
                  </div>
                </div>

                {/* Staging policy conflicts */}
                <div className="agent-panel">
                  <div className="agent-panel-header"><span className="agent-panel-title">Management Staging Policy Conflicts</span><InfoTooltip text="These loans are assigned a stage that conflicts not with the AI model but with NTB's own documented staging policy (v4.1, Oct 2025). Each entry is indefensible without explanatory documentation." position="left" width={300} /></div>
                  <div style={{ maxHeight:240, overflowY:'auto' }}>
                    <div style={{ display:'grid', gridTemplateColumns:'80px 60px 60px 1fr', padding:'6px 14px', borderBottom:'1px solid var(--color-border)', background:'var(--color-surface-2)' }}>
                      {['Loan ID','Assigned','Required','Authoriser'].map(h=><span key={h} style={{ fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--color-text-3)' }}>{h}</span>)}
                    </div>
                    {(data.flagged_loans||[]).filter(l=>l.management_staging_conflict).slice(0,6).map((l,i)=>(
                      <div key={i} style={{ display:'grid', gridTemplateColumns:'80px 60px 60px 1fr', padding:'9px 14px', borderBottom:'1px solid var(--color-border)', background: i%2===0?'transparent':'var(--color-surface-2)', alignItems:'center' }}>
                        <code style={{ fontSize:11, fontWeight:700 }}>{l.loan_id}</code>
                        <span style={{ fontSize:11, padding:'2px 7px', background:'#E8FDF4', color:'#0BBF7A', borderRadius:4, fontWeight:700, width:'fit-content' }}>S{l.assigned_stage}</span>
                        <span style={{ fontSize:11, padding:'2px 7px', background:'var(--octave-pink-light)', color:'var(--octave-pink)', borderRadius:4, fontWeight:700, width:'fit-content' }}>S{l.required_stage}</span>
                        <span style={{ fontSize:11, color:'var(--color-text-2)' }}>{l.override_authoriser||'STF-1847'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Sector concentration */}
            <div className="agent-grid">
              <PanelWithMethod title="Sector Concentration Risk" tooltip="Concentration of flagged loans by sector. Tourism and Real Estate are correlated with economic cycle — simultaneous stress across both amplifies ECL." methodology="Exposure-weighted concentration. Herfindahl index computed across 6 sectors. Above 0.18 = moderately concentrated (this portfolio: 0.31)." agentColor={COLOR}>
                <div style={{ padding:'16px' }}>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={(data.sector_concentration||[]).slice(0,6)} layout="vertical" margin={{ left:10, right:60, top:0, bottom:0 }}>
                      <XAxis type="number" tick={{ fontSize:10 }} tickFormatter={v=>`LKR ${(v/1e9).toFixed(1)}Bn`} />
                      <YAxis type="category" dataKey="sector" tick={{ fontSize:11 }} width={90} />
                      <Tooltip formatter={(v)=>`LKR ${(v/1e9).toFixed(2)}Bn`} />
                      <Bar dataKey="flagged_exposure_lkr" radius={[0,4,4,0]} label={{ position:'right', fontSize:10, formatter:v=>`${(v/1e9).toFixed(1)}Bn` }}>
                        {(data.sector_concentration||[]).map((s,i)=><Cell key={i} fill={SECTOR_COLORS[s.sector]||COLOR} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </PanelWithMethod>

              {/* Peer benchmarks */}
              <div className="agent-panel">
                <div className="agent-panel-header"><span className="agent-panel-title">Peer Benchmarking</span><InfoTooltip text="NTB vs licensed commercial bank peers. Source: CBSL Banking Sector Report Q3 2025." position="left" /></div>
                <div>
                  {Object.entries(peerBenchmarks?.credit||{}).map(([key,b],i)=>{
                    const labels = { stage3_ratio:'Stage 3 Ratio (%)', ecl_coverage:'ECL Coverage (%)', loan_growth_yoy:'Loan Growth YoY (%)', override_rate:'Override Rate (%)' };
                    const lowerBetter = ['stage3_ratio','ecl_coverage'].includes(key);
                    const better = lowerBetter ? b.ntb <= b.peer_median : b.ntb >= b.peer_median;
                    const col = better ? '#0BBF7A' : 'var(--octave-pink)';
                    return (
                      <AnomalyHeatRow key={key} label={labels[key]||key} value={b.ntb} benchmark={b.peer_median} deviation={Math.round(((b.ntb-b.peer_median)/b.peer_median)*100)} risk={better?'low':'high'} color={col} />
                    );
                  })}
                  <div style={{ padding:'8px 14px', fontSize:10, color:'var(--color-text-3)' }}>Source: CBSL Banking Sector Report Q3 2025</div>
                </div>
              </div>
            </div>
          </>
        );
      }}
    </AgentModule>
  );
}

import React, { useState } from 'react';
import { ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import AgentModule from '../../components/shared/AgentModule.jsx';
import { StatCard, VisualFindingCard, InsightBox, PanelWithMethod, MetricSpotlight, VerdictCard, HeatStrip, SignalMatrix, ComparisonSplit, RiskTimeline } from '../../components/shared/VisualComponents.jsx';
import ExplainerBox from '../../components/shared/ExplainerBox.jsx';
import InfoTooltip from '../../components/shared/InfoTooltip.jsx';
import useOpenFinding from '../../hooks/useOpenFinding.js';
import { demoData } from '../../data/demoData.js';

const COLOR = '#1F2937';

export default function InsiderRiskAgent() {
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const openFinding = useOpenFinding('insider');

  return (
    <AgentModule agentId="insider" agentName="Insider Risk Agent" agentColor={COLOR} demoData={demoData.insiderRisk} schema={[]}>
      {(data) => {
        const s = data.summary || {};
        const profiles = data.staff_profiles || [];
        const topStaff = selectedStaff || profiles[0];

        const radarData = topStaff ? [
          { dim:'SoD Violations', score:(topStaff.sod_violation_score||0)*100 },
          { dim:'Override Rate', score:(topStaff.override_concentration_score||0)*100 },
          { dim:'Off-Hours', score:(topStaff.off_hours_score||0)*100 },
          { dim:'Approval Cluster', score:(topStaff.approval_cluster_score||0)*100 },
          { dim:'Turnaround', score:(topStaff.turnaround_anomaly_score||0)*100 },
          { dim:'Session', score:(topStaff.session_deviation_score||0)*100 },
        ] : [];

        return (
          <>
            <ExplainerBox color={COLOR} icon="◉"
              title="How this agent detects insider fraud and collusion"
              summary="Each staff member is scored across 6 independent fraud dimensions. No single dimension alone is conclusive — it is the simultaneous breach of multiple dimensions by the same person that produces high composite scores."
              detail="SoD violations (25%), override concentration (20%), off-hours activity (18%), same-cluster approvals (18%), approval turnaround anomaly (12%), session deviation (7%). The collusion engine separately computes co-occurrence ratios between staff pairs."
              collapsible />

            {/* Audit Opinion */}
            <div style={{ background:`${COLOR}06`, border:`1px solid ${COLOR}22`, borderRadius:10, overflow:'hidden' }}>
              <div style={{ padding:'12px 16px', display:'flex', gap:10, alignItems:'flex-start' }}>
                <div style={{ fontSize:10, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.08em', padding:'3px 9px', borderRadius:5, background:COLOR, color:'white', flexShrink:0, marginTop:2 }}>ADVERSE</div>
                <div style={{ fontSize:12, color:COLOR, lineHeight:1.7 }}>In our opinion, the insider risk control environment is ADVERSE at Branch BR-14. STF-1847 scores 94/100 — all 6 insider fraud dimensions are simultaneously breached, which is definitively not coincidental.</div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', borderTop:`1px solid ${COLOR}18` }}>
                {[['Population tested','2,462 staff across 90 branches'],['Period covered','FY 2025 (Jan–Dec)'],['Materiality threshold','All staff with composite score &gt;40; any SoD violation'],['Model limitations','Collusion detection requires minimum 5 co-occurrences; staff active &lt;6 months have reduced baseline confidence']].map(([k,v],i)=>(
                  <div key={i} style={{ padding:'7px 16px', borderRight:i%2===0?`1px solid ${COLOR}12`:'none', borderBottom:i<2?`1px solid ${COLOR}12`:'none' }}>
                    <div style={{ fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:COLOR, opacity:0.65, marginBottom:2 }}>{k}</div>
                    <div style={{ fontSize:11, color:COLOR, lineHeight:1.5 }} dangerouslySetInnerHTML={{__html:v}} />
                  </div>
                ))}
              </div>
            </div>

            {/* Hero metrics */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
              <MetricSpotlight value={s.critical_staff||1} label="Critical Risk Staff" sub={`Score > 80/100`} color="var(--octave-pink)" icon="◉" trend="Immediate action" trendDir="up" />
              <MetricSpotlight value={s.elevated_risk_staff||8} label="Elevated Risk" sub="Score 50–80" color="#4A6070" />
              <MetricSpotlight value={`LKR ${((s.total_flagged_exposure_lkr||387e6)/1e6).toFixed(0)}M`} label="Flagged Exposure" sub="Override-approved loans" color={COLOR} />
              <MetricSpotlight value={`${s.sod_violation_count||23}`} label="SoD Violations" sub="FY 2025" color="#0BBF7A" trend="All at BR-14" />
            </div>

            <div className="agent-panel">
              <div className="agent-panel-header"><span className="agent-panel-title">Key Findings</span></div>
              <div className="agent-panel-body">{(data.key_findings||[]).map((f,i) => <VisualFindingCard key={i} finding={f} agentColor={COLOR} index={i} agentId="insider" agentData={data} openFinding={openFinding} />)}</div>
            </div>

            {/* Staff profiles + radar */}
            <div className="agent-grid">
              {/* Left: staff list */}
              <div className="agent-panel">
                <div className="agent-panel-header"><span className="agent-panel-title">Staff Risk Profiles</span><InfoTooltip text="Click any staff member to see their 6-dimension radar chart. Red = score above threshold for that dimension." position="left" /></div>
                <div style={{ overflowY:'auto', maxHeight:520 }}>
                  {profiles.map((p,i)=>{
                    const isSelected = selectedStaff?.staff_id === p.staff_id;
                    const riskColor = p.risk_score >= 80 ? 'var(--octave-pink)' : p.risk_score >= 50 ? '#4A6070' : '#0BBF7A';
                    return (
                      <div key={i} onClick={()=>setSelectedStaff(p)}
                        style={{ padding:'12px 16px', borderBottom:'1px solid var(--color-border)', cursor:'pointer', background: isSelected?`${COLOR}06`:'transparent', borderLeft: isSelected?`3px solid ${COLOR}`:'3px solid transparent', transition:'all 0.12s' }}>
                        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                          <div style={{ width:36, height:36, borderRadius:'50%', background:`${riskColor}20`, border:`2px solid ${riskColor}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                            <span style={{ fontSize:13, fontWeight:900, color:riskColor, fontFamily:'var(--font-display)' }}>{p.risk_score}</span>
                          </div>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                              <code style={{ fontSize:12, fontWeight:700 }}>{p.staff_id}</code>
                              <span style={{ fontSize:10, padding:'1px 6px', background:`${riskColor}18`, color:riskColor, borderRadius:4, fontWeight:700 }}>{p.risk_level}</span>
                            </div>
                            <div style={{ fontSize:11, color:'var(--color-text-2)', marginTop:1 }}>{p.role} · {p.branch_code}</div>
                          </div>
                          {p.sod_violations > 0 && (
                            <span style={{ fontSize:10, fontWeight:700, padding:'2px 7px', background:'var(--octave-pink-light)', color:'var(--octave-pink)', borderRadius:4 }}>SoD ×{p.sod_violations}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right: radar + tabs */}
              <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                {topStaff && (
                  <div className="agent-panel">
                    <div className="agent-panel-header">
                      <code style={{ fontSize:13, fontWeight:700 }}>{topStaff.staff_id}</code>
                      <span style={{ fontSize:11, color:'var(--color-text-2)' }}>{topStaff.role} · {topStaff.branch_code}</span>
                      <span style={{ marginLeft:'auto', fontSize:22, fontWeight:900, color:'var(--octave-pink)', fontFamily:'var(--font-display)' }}>{topStaff.risk_score}/100</span>
                    </div>
                    <div style={{ padding:'8px 0 0' }}>
                      <div style={{ display:'flex', borderBottom:'1px solid var(--color-border)' }}>
                        {['profile','activity','compliance','actions'].map(tab=>(
                          <button key={tab} onClick={()=>setActiveTab(tab)} style={{ padding:'9px 14px', fontSize:12, fontWeight:activeTab===tab?600:400, background:'none', border:'none', borderBottom:`2px solid ${activeTab===tab?COLOR:'transparent'}`, color:activeTab===tab?COLOR:'var(--color-text-2)', cursor:'pointer', flex:1, textTransform:'capitalize' }}>{tab}</button>
                        ))}
                      </div>

                      {activeTab === 'profile' && (
                        <div style={{ padding:'16px' }}>
                          <ResponsiveContainer width="100%" height={200}>
                            <RadarChart data={radarData} margin={{ top:10, right:20, bottom:10, left:20 }}>
                              <PolarGrid stroke="var(--color-border)" />
                              <PolarAngleAxis dataKey="dim" tick={{ fontSize:9, fill:'var(--color-text-2)' }} />
                              <Radar dataKey="score" stroke={COLOR} fill={COLOR} fillOpacity={0.15} dot={{ fill:COLOR, r:3 }} />
                            </RadarChart>
                          </ResponsiveContainer>
                          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginTop:8 }}>
                            {radarData.map((d,i)=>(
                              <HeatStrip key={i} value={d.score} max={100} color={d.score>=70?'var(--octave-pink)':d.score>=40?'#4A6070':'#0BBF7A'} label={d.dim} format={v=>`${Math.round(v)}/100`} />
                            ))}
                          </div>
                        </div>
                      )}

                      {activeTab === 'activity' && (
                        <div style={{ padding:'16px' }}>
                          <div style={{ marginBottom:12 }}>
                            <div style={{ fontSize:11, fontWeight:700, marginBottom:6, color:'var(--color-text-2)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Override Pattern</div>
                            <ComparisonSplit leftLabel="This staff override rate" leftValue={`${topStaff.override_rate_pct||87}%`} leftColor="var(--octave-pink)" rightLabel="Branch average" rightValue={`${topStaff.branch_avg_override_pct||4.8}%`} rightColor="#0BBF7A" note="Statistically impossible at p < 0.0001" />
                          </div>
                          <div style={{ fontSize:11, fontWeight:700, marginBottom:6, color:'var(--color-text-2)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Off-hours activity (last 90 days)</div>
                          <div style={{ background:'var(--color-surface-2)', borderRadius:8, padding:'10px 14px', fontSize:12, color:'var(--color-text)', lineHeight:1.7 }}>
                            {topStaff.off_hours_description||'87% of overrides occurred between 18:00–22:00. 12 approvals on weekends. 4 approvals during declared annual leave periods.'}
                          </div>
                        </div>
                      )}

                      {activeTab === 'compliance' && (
                        <div style={{ padding:'16px' }}>
                          <SignalMatrix color={COLOR} signals={[
                            { label:'SoD Violations', value:topStaff.sod_violations>0?`${topStaff.sod_violations} confirmed`:'None', triggered:topStaff.sod_violations>0 },
                            { label:'Override > Branch Avg', value:`${topStaff.override_rate_pct||87}% vs ${topStaff.branch_avg_override_pct||4.8}%`, triggered:true },
                            { label:'Off-Hours Approvals', value:'12 weekend, 4 leave', triggered:true },
                            { label:'Approval Clustering', value:'All via same approver', triggered:true },
                            { label:'Turnaround Anomaly', value:'Avg 4 min (norm: 47 min)', triggered:true },
                            { label:'Session Deviation', value:topStaff.session_anomaly?'Detected':'Normal', triggered:!!topStaff.session_anomaly },
                          ]} />
                        </div>
                      )}

                      {activeTab === 'actions' && (
                        <div style={{ padding:'16px', display:'flex', flexDirection:'column', gap:8 }}>
                          {[
                            { step:'Immediate', action:'Suspend override privileges pending investigation', color:'var(--octave-pink)' },
                            { step:'24 hours', action:'Preserve all system logs and approval records', color:'#4A6070' },
                            { step:'48 hours', action:'Refer to Fraud Investigation Unit with full evidence package', color:'#4A6070' },
                            { step:'5 working days', action:'File STR with CBSL FIU if financial crime suspected', color:'#0BBF7A' },
                          ].map((a,i)=>(
                            <div key={i} style={{ padding:'10px 14px', background:`${a.color}08`, border:`1px solid ${a.color}25`, borderLeft:`3px solid ${a.color}`, borderRadius:8, display:'flex', gap:10, alignItems:'flex-start' }}>
                              <span style={{ fontSize:9, fontWeight:800, textTransform:'uppercase', color:a.color, flexShrink:0, marginTop:2 }}>{a.step}</span>
                              <span style={{ fontSize:12, color:'var(--color-text)', lineHeight:1.5 }}>{a.action}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Collusion Detection */}
            <div className="agent-panel">
              <div className="agent-panel-header" style={{ background:`${COLOR}06` }}>
                <span className="agent-panel-title" style={{ color:COLOR }}>Collusion Detection — Staff Pair Analysis</span>
                <InfoTooltip text="Computes co-occurrence ratios between staff pairs: observed co-occurrences vs expected by chance. Ratio > 3× is a collusion flag. STF-1847 + INT-BR14-007: 14 observed vs 1.2 expected — p < 0.0001." width={320} position="left" />
              </div>
              {(data.collusion_pairs||[]).map((pair,i)=>(
                <div key={i} style={{ padding:'16px', borderBottom:'1px solid var(--color-border)' }}>
                  <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:12, flexWrap:'wrap' }}>
                    <span style={{ fontSize:11, fontWeight:700, padding:'3px 9px', background:`${COLOR}10`, color:COLOR, borderRadius:6 }}>{pair.staff_a}</span>
                    <span style={{ fontSize:11, color:'var(--color-text-3)' }}>{pair.role_a} · {pair.branch_a}</span>
                    <span style={{ fontSize:16, color:'var(--color-text-3)' }}>⟷</span>
                    <span style={{ fontSize:11, fontWeight:700, padding:'3px 9px', background:`${COLOR}10`, color:COLOR, borderRadius:6 }}>{pair.staff_b}</span>
                    <span style={{ fontSize:11, color:'var(--color-text-3)' }}>{pair.role_b} · {pair.branch_b}</span>
                    <span style={{ marginLeft:'auto', fontSize:11, fontWeight:700, padding:'3px 9px', background:'var(--octave-pink-light)', color:'var(--octave-pink)', borderRadius:6 }}>{pair.severity}</span>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:12 }}>
                    {[
                      { label:'Observed', val:pair.co_occurrences, color:COLOR },
                      { label:'Expected', val:pair.expected_co_occurrences, color:'var(--color-text-3)' },
                      { label:'Ratio', val:`${pair.co_occurrence_ratio}×`, color:'var(--octave-pink)' },
                      { label:'Exposure', val:`LKR ${(pair.financial_exposure_lkr/1e6).toFixed(0)}M`, color:'var(--octave-pink)' },
                    ].map((m,j)=>(
                      <div key={j} style={{ textAlign:'center', padding:'10px 8px', background:`${m.color}08`, borderRadius:8, border:`1px solid ${m.color}20` }}>
                        <div style={{ fontSize:22, fontWeight:900, color:m.color, lineHeight:1, fontFamily:'var(--font-display)' }}>{m.val}</div>
                        <div style={{ fontSize:10, color:'var(--color-text-3)', marginTop:4, textTransform:'uppercase', letterSpacing:'0.05em' }}>{m.label}</div>
                      </div>
                    ))}
                  </div>
                  <VerdictCard verdict="Statistical finding" confidence={pair.co_occurrence_ratio/15} finding={pair.finding} color={COLOR} action={pair.pattern} />
                </div>
              ))}
            </div>
          </>
        );
      }}
    </AgentModule>
  );
}

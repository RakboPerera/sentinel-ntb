import React, { useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts';
import AgentModule from '../../components/shared/AgentModule.jsx';
import { VisualFindingCard, InsightBox, PanelWithMethod, MetricSpotlight, VerdictCard, HeatStrip, SignalMatrix, AnomalyHeatRow } from '../../components/shared/VisualComponents.jsx';
import ExplainerBox from '../../components/shared/ExplainerBox.jsx';
import InfoTooltip from '../../components/shared/InfoTooltip.jsx';
import useOpenFinding from '../../hooks/useOpenFinding.js';
import { demoData, peerBenchmarks } from '../../data/demoData.js';

const COLOR = '#3A5A3A';

export default function InternalControlsAgent() {
  const [selectedBranch, setSelectedBranch] = useState(null);
  const openFinding = useOpenFinding('controls');

  return (
    <AgentModule agentId="controls" agentName="Internal Controls Agent" agentColor={COLOR} demoData={demoData.controls} schema={[]}>
      {(data) => {
        const cs = data.controls_summary || {};
        const branches = data.branch_risk_scores || [];
        const selBranch = selectedBranch ?? branches[0];

        const radarData = selBranch ? [
          { dim:'Override Rate', score:(selBranch.override_rate_pct||0)*1.4 },
          { dim:'SoD Violations', score:(selBranch.sod_violation_score||0)*100 },
          { dim:'Off-Hours', score:(selBranch.off_hours_score||0)*100 },
          { dim:'Turnaround', score:(selBranch.turnaround_score||0)*100 },
          { dim:'Concentration', score:(selBranch.approver_concentration_score||0)*100 },
          { dim:'Temporal', score:(selBranch.temporal_clustering_score||0)*100 },
        ] : [];

        const scoreColor = s => s >= 80 ? 'var(--octave-pink)' : s >= 60 ? '#4A6070' : '#0BBF7A';

        return (
          <>
            <ExplainerBox color={COLOR} icon="⚙"
              title="How this agent scores internal controls across 90 branches"
              summary="Each branch gets a composite control score (0–100) combining six weighted dimensions. A score below 65 triggers review. BR-14 at 41/100 is confirmed adverse — not a borderline case."
              detail="Override rate (25%), SoD violations (20%), approval turnaround (15%), off-hours approvals (15%), approver concentration (15%), temporal clustering (10%). Each dimension is independently scored and weighted."
              collapsible />

            {/* Audit Opinion */}
            <div style={{ background:`${COLOR}06`, border:`1px solid ${COLOR}22`, borderRadius:10, overflow:'hidden' }}>
              <div style={{ padding:'12px 16px', display:'flex', gap:10, alignItems:'flex-start' }}>
                <div style={{ fontSize:10, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.08em', padding:'3px 9px', borderRadius:5, background:COLOR, color:'white', flexShrink:0, marginTop:2 }}>ADVERSE</div>
                <div style={{ fontSize:12, color:COLOR, lineHeight:1.7 }}>In our opinion, the internal controls environment at Branch BR-14 is ADVERSE — composite score 41/100. SoD violations confirmed. STF-1847 override concentration of 87% is statistically impossible under legitimate operations.</div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', borderTop:`1px solid ${COLOR}18` }}>
                {[['Population tested','18,743 approval transactions across 90 branches'],['Period covered','FY 2025 (Jan–Dec)'],['Materiality threshold','All SoD violations; branches with override rate >5% or composite <65'],['Model limitations','Manual overrides outside system not captured; delegated authority limits from HR records Q3 2025']].map(([k,v],i)=>(
                  <div key={i} style={{ padding:'7px 16px', borderRight:i%2===0?`1px solid ${COLOR}12`:'none', borderBottom:i<2?`1px solid ${COLOR}12`:'none' }}>
                    <div style={{ fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:COLOR, opacity:0.65, marginBottom:2 }}>{k}</div>
                    <div style={{ fontSize:11, color:COLOR, lineHeight:1.5 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero metrics */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
              <MetricSpotlight value={cs.high_risk_branches||4} label="High-Risk Branches" sub="Composite score < 65/100" color="var(--octave-pink)" icon="⚙" trend="Field audit required" trendDir="up" />
              <MetricSpotlight value={cs.sod_violations||7} label="SoD Violations" sub="End-to-end control failure" color="var(--octave-pink)" />
              <MetricSpotlight value={`${cs.network_override_rate_pct||4.8}%`} label="Network Override Rate" sub="BR-14: 14.3% (3× network)" color="#4A6070" />
              <MetricSpotlight value={cs.off_hours_approvals||143} label="Off-Hours Approvals" sub="18:00–06:00 and weekends" color={COLOR} />
            </div>

            <div className="agent-panel">
              <div className="agent-panel-header"><span className="agent-panel-title">Key Findings</span></div>
              <div className="agent-panel-body">{(data.key_findings||[]).map((f,i)=><VisualFindingCard key={i} finding={f} agentColor={COLOR} index={i} agentId="controls" agentData={data} openFinding={openFinding} />)}</div>
            </div>

            <div className="agent-grid">
              {/* Branch risk scores list */}
              <div className="agent-panel">
                <div className="agent-panel-header"><span className="agent-panel-title">Branch Risk Scores</span><InfoTooltip text="Click any branch to see its 6-dimension radar breakdown. Red = composite score below 65 (adverse). Score is weighted composite across all six control dimensions." position="left" /></div>
                <div>
                  {/* Score legend */}
                  <div style={{ padding:'8px 16px', borderBottom:'1px solid var(--color-border)', display:'flex', gap:12, fontSize:10, color:'var(--color-text-3)' }}>
                    {[['var(--octave-pink)','< 65 — Adverse'],['#4A6070','65–79 — Review'],['#0BBF7A','≥ 80 — Effective']].map(([c,l])=>(
                      <span key={l} style={{ display:'flex', alignItems:'center', gap:4 }}>
                        <span style={{ width:8, height:8, borderRadius:'50%', background:c, display:'inline-block' }} />{l}
                      </span>
                    ))}
                  </div>
                  <div style={{ overflowY:'auto', maxHeight:440 }}>
                    {branches.map((br,i) => {
                      const isSel = selBranch?.branch_code === br.branch_code;
                      const sc = scoreColor(br.composite_score||0);
                      return (
                        <div key={i} onClick={()=>setSelectedBranch(br)}
                          style={{ padding:'12px 16px', borderBottom:'1px solid var(--color-border)', cursor:'pointer', borderLeft:`3px solid ${isSel?sc:'transparent'}`, background:isSel?`${sc}06`:'transparent', transition:'all 0.12s' }}>
                          <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                            <div style={{ width:40, height:40, borderRadius:10, background:`${sc}15`, border:`2px solid ${sc}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                              <span style={{ fontSize:15, fontWeight:900, color:sc, fontFamily:'var(--font-display)' }}>{br.composite_score||0}</span>
                            </div>
                            <div style={{ flex:1 }}>
                              <div style={{ display:'flex', gap:6, alignItems:'center', marginBottom:2 }}>
                                <code style={{ fontSize:12, fontWeight:700 }}>{br.branch_code}</code>
                                <span style={{ fontSize:11, color:'var(--color-text-2)' }}>{br.branch_name}</span>
                              </div>
                              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                                {br.override_rate_pct > 5 && <span style={{ fontSize:9, fontWeight:700, padding:'1px 5px', background:'var(--octave-pink-light)', color:'var(--octave-pink)', borderRadius:3 }}>Override {br.override_rate_pct}%</span>}
                                {br.sod_violations > 0 && <span style={{ fontSize:9, fontWeight:700, padding:'1px 5px', background:'var(--octave-pink-light)', color:'var(--octave-pink)', borderRadius:3 }}>SoD ×{br.sod_violations}</span>}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Branch radar + SoD detail */}
              <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                {selBranch && (
                  <div className="agent-panel">
                    <div className="agent-panel-header">
                      <code style={{ fontSize:13, fontWeight:700 }}>{selBranch.branch_code}</code>
                      <span style={{ fontSize:11, color:'var(--color-text-2)' }}>{selBranch.branch_name}</span>
                      <span style={{ marginLeft:'auto', fontSize:24, fontWeight:900, color:scoreColor(selBranch.composite_score||0), fontFamily:'var(--font-display)' }}>{selBranch.composite_score||0}<span style={{ fontSize:12, fontWeight:400 }}>/100</span></span>
                    </div>
                    <div style={{ padding:'16px' }}>
                      <ResponsiveContainer width="100%" height={180}>
                        <RadarChart data={radarData} margin={{ top:10, right:20, bottom:10, left:20 }}>
                          <PolarGrid stroke="var(--color-border)" />
                          <PolarAngleAxis dataKey="dim" tick={{ fontSize:9, fill:'var(--color-text-2)' }} />
                          <Radar dataKey="score" stroke={scoreColor(selBranch.composite_score||0)} fill={scoreColor(selBranch.composite_score||0)} fillOpacity={0.15} dot={{ fill:scoreColor(selBranch.composite_score||0), r:3 }} />
                        </RadarChart>
                      </ResponsiveContainer>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginTop:4 }}>
                        {radarData.map((d,i)=>(
                          <HeatStrip key={i} value={Math.min(100,d.score)} max={100} color={d.score>=70?'var(--octave-pink)':d.score>=40?'#4A6070':'#0BBF7A'} label={d.dim} format={v=>`${Math.round(v)}/100`} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* SoD Violations */}
                <PanelWithMethod title="SoD Violations" tooltip="Segregation of Duties violation: the same staff member initiated AND approved the same transaction. Under CBSL Direction No. 5/2024, this constitutes a material control failure." methodology="System logs are cross-referenced against the approval hierarchy. Any transaction where initiator_id = approver_id is a confirmed SoD violation, regardless of amount." agentColor={COLOR}>
                  <div>
                    {(data.sod_violations||[]).slice(0,5).map((sod,i)=>(
                      <div key={i} style={{ padding:'10px 14px', borderBottom:'1px solid var(--color-border)', display:'grid', gridTemplateColumns:'1fr 80px 80px', gap:8, alignItems:'center' }}>
                        <div>
                          <code style={{ fontSize:11, fontWeight:700 }}>{sod.transaction_id}</code>
                          <div style={{ fontSize:11, color:'var(--color-text-2)', marginTop:2 }}>{sod.transaction_type} · {sod.branch_code}</div>
                          <code style={{ fontSize:10, color:'var(--octave-pink)' }}>Both: {sod.staff_id}</code>
                        </div>
                        <span style={{ fontSize:12, fontWeight:800, textAlign:'right' }}>LKR {((sod.amount_lkr||0)/1e6).toFixed(1)}M</span>
                        <span style={{ fontSize:9, fontWeight:800, padding:'2px 7px', borderRadius:5, background:'var(--octave-pink-light)', color:'var(--octave-pink)', textAlign:'center' }}>{sod.severity?.toUpperCase()}</span>
                      </div>
                    ))}
                  </div>
                </PanelWithMethod>
              </div>
            </div>

            {/* Peer benchmarks */}
            <div className="agent-panel">
              <div className="agent-panel-header"><span className="agent-panel-title">Peer Benchmarking — Internal Controls</span><InfoTooltip text="NTB vs licensed commercial bank peers. Source: CBSL Supervisory Review 2025." position="left" /></div>
              <div>
                {Object.entries(peerBenchmarks?.controls||{}).map(([key,b],i)=>{
                  const labels = { override_rate_branch:'BR-14 Override Rate (%)', sod_violation_rate:'SoD Violation Rate (%)', avg_approval_minutes:'Avg Approval Turnaround (min)' };
                  const better = b.ntb <= b.peer_median;
                  const col = better ? '#0BBF7A' : 'var(--octave-pink)';
                  return <AnomalyHeatRow key={key} label={labels[key]||key} value={b.ntb} benchmark={b.peer_median} deviation={Math.round(((b.ntb-b.peer_median)/b.peer_median)*100)} risk={better?'low':'critical'} color={col} />;
                })}
                <div style={{ padding:'8px 14px', fontSize:10, color:'var(--color-text-3)' }}>Source: CBSL Supervisory Review 2025</div>
              </div>
            </div>
          </>
        );
      }}
    </AgentModule>
  );
}

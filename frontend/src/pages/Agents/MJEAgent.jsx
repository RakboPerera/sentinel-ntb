import React, { useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, LineChart, Line, ReferenceLine } from 'recharts';
import AgentModule from '../../components/shared/AgentModule.jsx';
import { VisualFindingCard, InsightBox, PanelWithMethod, MetricSpotlight, VerdictCard, HeatStrip, AnomalyHeatRow, EntityBadgeRow } from '../../components/shared/VisualComponents.jsx';
import ExplainerBox from '../../components/shared/ExplainerBox.jsx';
import InfoTooltip from '../../components/shared/InfoTooltip.jsx';
import useOpenFinding from '../../hooks/useOpenFinding.js';
import { demoData } from '../../data/demoData.js';

const COLOR = '#0BBF7A';
const BENFORD_EXPECTED = [30.1,17.6,12.5,9.7,7.9,6.7,5.8,5.1,4.6];

export default function MJEAgent() {
  const [activeTab, setActiveTab] = useState('population');
  const openFinding = useOpenFinding('mje');

  return (
    <AgentModule agentId="mje" agentName="MJE Testing Agent" agentColor={COLOR} demoData={demoData.mje} schema={[]}>
      {(data) => {
        const ms = data.mje_summary || {};
        const bd = data.benford_distribution || {};
        
        const benfordData = BENFORD_EXPECTED.map((exp, i) => ({
          digit: i+1,
          expected: exp,
          actual: bd.observed?.[i] ?? exp,
          deviation: (bd.observed?.[i] ?? exp) - exp,
        }));

        return (
          <>
            <ExplainerBox color={COLOR} icon="⊞"
              title="How this agent tests every manual journal entry"
              summary="Full-population MJE testing — all 847 entries, no sampling. Combines timing analysis (after-hours, month-end), amount anomalies (Benford deviation, round numbers), GL sensitivity (suspense, capital accounts), and SoD checks."
              detail="Benford's Law applied to MJE amounts detects sub-threshold structuring in the GL layer. MJE-2026-4205 scores 97/100 — highest risk entry in the population. After-hours postings to suspense accounts with no supporting documentation are the highest-risk pattern."
              collapsible />

            {/* Audit Opinion */}
            <div style={{ background:`${COLOR}06`, border:`1px solid ${COLOR}22`, borderRadius:10, overflow:"hidden" }}>
              <div style={{ padding:"12px 16px", display:"flex", gap:10, alignItems:"flex-start" }}>
                <div style={{ fontSize:10, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.08em", padding:"3px 9px", borderRadius:5, background:COLOR, color:"white", flexShrink:0, marginTop:2 }}>ADVERSE</div>
                <div style={{ fontSize:12, color:COLOR, lineHeight:1.7 }}>In our opinion, the MJE control environment is ADVERSE. MJE-2026-4205 scores 97/100 — the highest risk entry in the full population. Benford first-digit analysis confirms deliberate sub-threshold GL structuring.</div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", borderTop:`1px solid ${COLOR}18` }}>
                {[["Population tested","847 manual journal entries (100% — full population)"],["Period covered","FY 2025 (Jan–Dec)"],["Materiality threshold","All entries >LKR 1M; all SoD violations regardless of amount"],["Model limitations","Automated system journals excluded; Benford&#39;s Law less effective for accounts with <50 entries in period"]].map(([k,v],i)=>(
                  <div key={i} style={{ padding:"7px 16px", borderRight:i%2===0?`1px solid ${COLOR}12`:"none", borderBottom:i<2?`1px solid ${COLOR}12`:"none" }}>
                    <div style={{ fontSize:9, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", color:COLOR, opacity:0.65, marginBottom:2 }}>{k}</div>
                    <div style={{ fontSize:11, color:COLOR, lineHeight:1.5 }} dangerouslySetInnerHTML={{__html:v}} />
                  </div>
                ))}
              </div>
            </div>

            {/* Hero metrics */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
              <MetricSpotlight value={ms.total_mjes||847} label="MJEs Tested" sub="100% full population" color={COLOR} icon="⊞" />
              <MetricSpotlight value={ms.critical_mjes||3} label="Critical MJEs" sub="Score > 80/100" color="var(--octave-pink)" trend="Immediate review" trendDir="up" />
              <MetricSpotlight value={ms.sod_violations||4} label="SoD Violations" sub="Same maker & checker" color="var(--octave-pink)" />
              <MetricSpotlight value={ms.after_hours_pct ? `${ms.after_hours_pct}%` : "23%"} label="After-Hours Postings" sub="18:00–06:00 or weekends" color="#4A6070" />
            </div>

            <div className="agent-panel">
              <div className="agent-panel-header"><span className="agent-panel-title">Key Findings</span></div>
              <div className="agent-panel-body">{(data.key_findings||[]).map((f,i)=><VisualFindingCard key={i} finding={f} agentColor={COLOR} index={i} agentId="mje" agentData={data} openFinding={openFinding} />)}</div>
            </div>

            {/* Tabbed detail */}
            <div className="agent-panel">
              <div className="agent-panel-header" style={{ padding:0 }}>
                {["population","benford","gl","reversals"].map(tab=>(
                  <button key={tab} onClick={()=>setActiveTab(tab)}
                    style={{ padding:"11px 14px", fontSize:12, fontWeight:activeTab===tab?700:400, background:"none", border:"none", borderBottom:`2px solid ${activeTab===tab?COLOR:"transparent"}`, color:activeTab===tab?COLOR:"var(--color-text-2)", cursor:"pointer", flex:1, fontFamily:"var(--font-display)", letterSpacing:"0.04em" }}>
                    {tab==="population"?"Top Entries":tab==="benford"?"Benford":tab==="gl"?"GL Accounts":"Reversals"}
                  </button>
                ))}
              </div>

              {activeTab === "population" && (
                <div>
                  {(data.mje_entries||[]).slice(0,8).map((entry,i)=>{
                    const rc = entry.risk_score>=80?"var(--octave-pink)":entry.risk_score>=50?COLOR:"#4A6070";
                    return (
                      <div key={i} style={{ padding:"14px 16px", borderBottom:"1px solid var(--color-border)" }}>
                        <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:8 }}>
                          <div style={{ width:40, height:40, borderRadius:10, background:`${rc}15`, border:`2px solid ${rc}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                            <span style={{ fontSize:14, fontWeight:900, color:rc, fontFamily:"var(--font-display)" }}>{entry.risk_score}</span>
                          </div>
                          <div style={{ flex:1 }}>
                            <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                              <code style={{ fontSize:12, fontWeight:700 }}>{entry.mje_id}</code>
                              {entry.sod_violation && <span style={{ fontSize:9, fontWeight:800, padding:"2px 6px", background:"var(--octave-pink-light)", color:"var(--octave-pink)", borderRadius:4 }}>SoD</span>}
                              {entry.after_hours && <span style={{ fontSize:9, fontWeight:700, padding:"2px 6px", background:"#F3F3F1", color:"#4A6070", borderRadius:4 }}>After-hours</span>}
                            </div>
                            <div style={{ fontSize:11, color:"var(--color-text-2)", marginTop:2 }}>{entry.gl_account_name} · {entry.posting_date}</div>
                          </div>
                          <span style={{ fontSize:14, fontWeight:800, color:rc }}>LKR {((entry.amount_lkr||0)/1e6).toFixed(1)}M</span>
                        </div>
                        <HeatStrip value={entry.risk_score||0} max={100} color={rc} label={entry.primary_flag||"Risk score"} sublabel={entry.finding_description} format={v=>`${v}/100`} />
                      </div>
                    );
                  })}
                </div>
              )}

              {activeTab === "benford" && (
                <div style={{ padding:"16px" }}>
                  <div style={{ marginBottom:12, fontSize:12, color:"var(--color-text-2)", lineHeight:1.6, padding:"10px 14px", background:"var(--color-surface-2)", borderRadius:8 }}>
                    Benford&#39;s Law predicts first-digit frequency in any large financial dataset. Deviations in MJE amounts indicate deliberate choice of entry amounts — a signature of sub-threshold structuring in the GL layer.
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={benfordData} margin={{ top:10, right:10, bottom:10, left:0 }}>
                      <XAxis dataKey="digit" tick={{ fontSize:11 }} label={{ value:"First digit of MJE amount", position:"insideBottom", offset:-2, fontSize:10 }} />
                      <YAxis tickFormatter={v=>`${v}%`} tick={{ fontSize:10 }} />
                      <Tooltip formatter={(v,n)=>[`${v.toFixed(1)}%`, n==="actual"?"Observed":"Expected"]} />
                      <Bar dataKey="expected" fill="#D1D0CB" radius={[3,3,0,0]} name="Expected" />
                      <Bar dataKey="actual" radius={[3,3,0,0]} name="Observed">
                        {benfordData.map((d,i)=>{
                          const dev = Math.abs(d.actual-d.expected);
                          return <Cell key={i} fill={dev>4?"var(--octave-pink)":dev>2?COLOR:"#D1D0CB"} />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <div style={{ marginTop:12, display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
                    {benfordData.filter(d=>Math.abs(d.actual-d.expected)>2).map((d,i)=>(
                      <div key={i} style={{ padding:"10px 12px", background:Math.abs(d.actual-d.expected)>4?"var(--octave-pink-light)":"#E8FDF4", borderRadius:8, border:`1px solid ${Math.abs(d.actual-d.expected)>4?"rgba(232,42,174,0.25)":"rgba(11,191,122,0.25)"}` }}>
                        <div style={{ fontSize:28, fontWeight:900, color:Math.abs(d.actual-d.expected)>4?"var(--octave-pink)":COLOR, fontFamily:"var(--font-display)", lineHeight:1 }}>{d.digit}</div>
                        <div style={{ fontSize:11, marginTop:4, color:"var(--color-text-2)" }}>
                          Observed: <strong>{d.actual.toFixed(1)}%</strong><br/>
                          Expected: {d.expected.toFixed(1)}%<br/>
                          <strong style={{ color:Math.abs(d.actual-d.expected)>4?"var(--octave-pink)":COLOR }}>{d.deviation>0?"+":""}{d.deviation.toFixed(1)}% deviation</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "gl" && (
                <div>
                  {(data.gl_reconciliation||[]).map((gl,i)=>{
                    const riskColor = gl.risk_level==="critical"?"var(--octave-pink)":gl.risk_level==="high"?"#4A6070":COLOR;
                    return (
                      <div key={i} style={{ padding:"14px 16px", borderBottom:"1px solid var(--color-border)", borderLeft:`4px solid ${riskColor}` }}>
                        <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:8 }}>
                          <code style={{ fontSize:12, fontWeight:700 }}>{gl.gl_account_code}</code>
                          <span style={{ fontSize:11, color:"var(--color-text-2)", flex:1 }}>{gl.gl_account_name}</span>
                          <span style={{ fontSize:12, fontWeight:800, color:riskColor }}>LKR {((gl.unreconciled_amount_lkr||0)/1e6).toFixed(1)}M</span>
                        </div>
                        <HeatStrip value={gl.mje_count||0} max={50} color={riskColor} label={`${gl.mje_count} MJEs · ${gl.after_hours_pct||0}% after-hours`} sublabel={gl.reconciliation_status} format={v=>`${v} entries`} />
                        {gl.suspicion_note && <div style={{ marginTop:8, padding:"8px 12px", background:`${riskColor}08`, borderRadius:6, fontSize:11, color:"var(--color-text-2)", lineHeight:1.55 }}>{gl.suspicion_note}</div>}
                      </div>
                    );
                  })}
                </div>
              )}

              {activeTab === "reversals" && (
                <div>
                  {/* Unmatched reversals */}
                  {(data.reversal_analysis?.unmatched_reversals||[]).map((rev,i)=>(
                    <VerdictCard key={i} verdict="Unmatched Reversal" confidence={rev.risk_score||0.87} finding={rev.finding||`${rev.mje_id} reversed with no traceable original entry`} evidence={[`Amount: LKR ${((rev.amount_lkr||0)/1e6).toFixed(1)}M`, `GL: ${rev.gl_account}`, rev.posting_date].filter(Boolean)} color="var(--octave-pink)" action={rev.recommended_action} />
                  ))}
                  {/* Net-zero manipulations */}
                  {(data.reversal_analysis?.net_zero_manipulations||[]).map((nz,i)=>(
                    <div key={i} style={{ padding:"14px 16px", borderBottom:"1px solid var(--color-border)" }}>
                      <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:8 }}>
                        <span style={{ fontSize:11, fontWeight:700, padding:"3px 9px", background:"#F3F3F1", color:"#4A6070", borderRadius:6 }}>Net-Zero Pattern</span>
                        <span style={{ fontSize:13, fontWeight:800, color:"#4A6070" }}>LKR {((nz.gross_movement_lkr||0)/1e6).toFixed(1)}M gross movement</span>
                      </div>
                      <div style={{ fontSize:12, color:"var(--color-text-2)", lineHeight:1.65, padding:"8px 12px", background:"var(--color-surface-2)", borderRadius:8 }}>{nz.finding}</div>
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

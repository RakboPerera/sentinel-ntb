import React, { useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, LineChart, Line, ReferenceLine } from 'recharts';
import AgentModule from '../../components/shared/AgentModule.jsx';
import { VisualFindingCard, InsightBox, PanelWithMethod, MetricSpotlight, VerdictCard, HeatStrip, ComparisonSplit, AnomalyHeatRow } from '../../components/shared/VisualComponents.jsx';
import ExplainerBox from '../../components/shared/ExplainerBox.jsx';
import InfoTooltip from '../../components/shared/InfoTooltip.jsx';
import useOpenFinding from '../../hooks/useOpenFinding.js';
import { demoData } from '../../data/demoData.js';

const COLOR = '#993C1D';
const RISK_COLORS = { critical:'var(--octave-pink)', red:'#E82AAE', amber:'#4A6070', watch:'#0BBF7A' };
const RISK_BG = { critical:'var(--octave-pink-light)', red:'#FCE7F6', amber:'#F3F3F1', watch:'#E8FDF4' };

export default function SuspenseAgent() {
  const [selected, setSelected] = useState(null);
  const openFinding = useOpenFinding('suspense');

  return (
    <AgentModule agentId="suspense" agentName="Suspense & Reconciliation Agent" agentColor={COLOR} demoData={demoData.suspense} schema={[]}>
      {(data) => {
        const rs = data.reconciliation_summary || {};
        const accounts = data.flagged_accounts || [];
        const sel = selected ?? accounts[0];

        return (
          <>
            <ExplainerBox color={COLOR} icon="⊟"
              title="How this agent detects phantom receivables and CEFT fraud"
              summary="Every suspense account is analysed on three daily signals: balance growth rate, clearing ratio, and aging. An account with high growth + low clearing + long aging is a phantom receivable indicator."
              detail="The phantom score combines: growth rate (>50% in 30d = flag), clearing ratio (<0.30 = flag), aging (>90d = CBSL regulatory breach). SUS-017 scores critically on all three simultaneously."
              collapsible />

            {/* Audit Opinion */}
            <div style={{ background:`${COLOR}06`, border:`1px solid ${COLOR}22`, borderRadius:10, overflow:'hidden' }}>
              <div style={{ padding:'12px 16px', display:'flex', gap:10, alignItems:'flex-start' }}>
                <div style={{ fontSize:10, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.08em', padding:'3px 9px', borderRadius:5, background:COLOR, color:'white', flexShrink:0, marginTop:2 }}>ADVERSE</div>
                <div style={{ fontSize:12, color:COLOR, lineHeight:1.7 }}>In our opinion, the suspense account reconciliation control environment is ADVERSE. SUS-017 constitutes a confirmed CBSL regulatory breach. The phantom receivable pattern is corroborated by multi-agent analysis.</div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', borderTop:`1px solid ${COLOR}18` }}>
                {[['Population tested','143 suspense and nostro accounts (100%)'],['Period covered','FY 2025 + 90-day aging window'],['Materiality threshold','All balances aged >30 days; CBSL breach threshold >90 days'],['Model limitations','Intraday clearing cycles not captured; weekend entries may show artificial aging']].map(([k,v],i)=>(
                  <div key={i} style={{ padding:'7px 16px', borderRight:i%2===0?`1px solid ${COLOR}12`:'none', borderBottom:i<2?`1px solid ${COLOR}12`:'none' }}>
                    <div style={{ fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:COLOR, opacity:0.65, marginBottom:2 }}>{k}</div>
                    <div style={{ fontSize:11, color:COLOR, lineHeight:1.5 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero metrics */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
              <MetricSpotlight value={`LKR ${((rs.total_unreconciled_balance_lkr||0)/1e9).toFixed(1)}Bn`} label="Unreconciled Balance" sub={`${rs.total_accounts_analyzed||143} accounts analysed`} color={COLOR} icon="⊟" />
              <MetricSpotlight value={rs.critical_accounts||3} label="Critical Accounts" sub="CBSL breach risk" color="var(--octave-pink)" trend="Immediate action" trendDir="up" />
              <MetricSpotlight value={rs.phantom_receivable_risk_accounts||2} label="Phantom Receivable" sub="High growth + low clearing" color="var(--octave-pink)" />
              <MetricSpotlight value={rs.growth_anomalies||5} label="Growth Anomalies" sub=">50% in 30 days" color="#4A6070" />
            </div>

            <div className="agent-panel">
              <div className="agent-panel-header"><span className="agent-panel-title">Key Findings</span></div>
              <div className="agent-panel-body">{accounts.length>0&&(data.key_findings||[]).map((f,i)=><VisualFindingCard key={i} finding={f} agentColor={COLOR} index={i} agentId="suspense" agentData={data} openFinding={openFinding} />)}</div>
            </div>

            {/* Account risk grid */}
            <div className="agent-grid">
              <div className="agent-panel">
                <div className="agent-panel-header"><span className="agent-panel-title">Flagged Accounts</span><InfoTooltip text="Sorted by combined phantom receivable score. Click any account to see full diagnostic detail." position="left" /></div>
                <div style={{ overflowY:'auto', maxHeight:520 }}>
                  {accounts.map((acc,i) => {
                    const isSel = sel?.account_id === acc.account_id;
                    const rc = RISK_COLORS[acc.risk_tier] || '#4A6070';
                    const rb = RISK_BG[acc.risk_tier] || '#F3F3F1';
                    return (
                      <div key={i} onClick={()=>setSelected(acc)}
                        style={{ padding:'14px 16px', borderBottom:'1px solid var(--color-border)', cursor:'pointer', borderLeft:`3px solid ${isSel?rc:'transparent'}`, background:isSel?`${rc}06`:'transparent', transition:'all 0.12s' }}>
                        <div style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                          <div style={{ flex:1 }}>
                            <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:6 }}>
                              <code style={{ fontSize:13, fontWeight:800 }}>{acc.account_id}</code>
                              <span style={{ fontSize:10, fontWeight:700, padding:'2px 7px', background:rb, color:rc, borderRadius:5 }}>{acc.risk_tier?.toUpperCase()}</span>
                              <span style={{ marginLeft:'auto', fontSize:13, fontWeight:800, color:rc }}>LKR {((acc.current_balance_lkr||0)/1e9).toFixed(2)}Bn</span>
                            </div>
                            <div style={{ fontSize:11, color:'var(--color-text-2)', marginBottom:8 }}>{acc.account_type} · {acc.branch_code}</div>
                            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:6 }}>
                              {[
                                { label:'Aging', val:`${acc.aging_days}d`, alert:acc.aging_days>90 },
                                { label:'Growth 30d', val:`+${acc.growth_rate_30d_pct}%`, alert:acc.growth_rate_30d_pct>50 },
                                { label:'Clearing', val:`${(acc.clearing_ratio*100).toFixed(0)}%`, alert:acc.clearing_ratio<0.3 },
                              ].map((m,j)=>(
                                <div key={j} style={{ textAlign:'center', padding:'6px 4px', background:m.alert?'var(--octave-pink-light)':'var(--color-surface-2)', borderRadius:6, border:`1px solid ${m.alert?'rgba(232,42,174,0.2)':'var(--color-border)'}` }}>
                                  <div style={{ fontSize:14, fontWeight:900, color:m.alert?'var(--octave-pink)':'var(--color-text)', fontFamily:'var(--font-display)' }}>{m.val}</div>
                                  <div style={{ fontSize:9, color:'var(--color-text-3)', textTransform:'uppercase', letterSpacing:'0.05em' }}>{m.label}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Account detail */}
              {sel && (
                <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                  <div className="agent-panel">
                    <div style={{ padding:'14px 16px', background:`${RISK_COLORS[sel.risk_tier]||COLOR}08`, borderBottom:'1px solid var(--color-border)' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
                        <code style={{ fontSize:16, fontWeight:800 }}>{sel.account_id}</code>
                        <span style={{ fontSize:22, fontWeight:900, color:RISK_COLORS[sel.risk_tier]||COLOR, fontFamily:'var(--font-display)' }}>LKR {((sel.current_balance_lkr||0)/1e9).toFixed(2)}Bn</span>
                      </div>
                      <div style={{ fontSize:12, color:'var(--color-text-2)' }}>{sel.account_type} · {sel.branch_code}</div>
                    </div>
                    <div style={{ padding:'16px', display:'flex', flexDirection:'column', gap:12 }}>
                      <HeatStrip value={sel.aging_days||0} max={120} color={sel.aging_days>90?'var(--octave-pink)':'#4A6070'} label="Aging" sublabel="CBSL breach threshold: 90 days" format={v=>`${v} days`} />
                      <HeatStrip value={sel.growth_rate_30d_pct||0} max={400} color={sel.growth_rate_30d_pct>50?'var(--octave-pink)':'#0BBF7A'} label="30-day Growth Rate" sublabel="Flag threshold: >50% in 30 days" format={v=>`+${v}%`} />
                      <HeatStrip value={(1-sel.clearing_ratio)*100||0} max={100} color={sel.clearing_ratio<0.3?'var(--octave-pink)':'#0BBF7A'} label="Uncleared (inverse clearing ratio)" sublabel="Flag: clearing ratio < 30% of balance" format={v=>`${v.toFixed(0)}% uncleared`} />
                      <VerdictCard verdict={sel.risk_tier?.toUpperCase()||'CRITICAL'} confidence={sel.phantom_score||0.94} finding={sel.pattern_detected||'Phantom receivable pattern detected'} color={RISK_COLORS[sel.risk_tier]||COLOR} action={sel.recommended_action} />
                    </div>
                  </div>

                  {/* Aging chart */}
                  <PanelWithMethod title="Balance Aging Distribution" tooltip="How the unreconciled balance is distributed by age bucket across all flagged accounts. Amounts in CBSL breach zone (>90d) require Board Audit Committee notification." methodology="Balance is attributed to an aging bucket based on the earliest unmatched entry date. CBSL requires Board notification for any amount >90 days." agentColor={COLOR}>
                    <div style={{ padding:'16px' }}>
                      <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={data.aging_distribution||[]} margin={{ top:0, right:10, bottom:0, left:0 }}>
                          <XAxis dataKey="bucket" tick={{ fontSize:10 }} />
                          <YAxis tickFormatter={v=>`${(v/1e9).toFixed(1)}Bn`} tick={{ fontSize:10 }} />
                          <Tooltip formatter={v=>`LKR ${(v/1e9).toFixed(2)}Bn`} />
                          <ReferenceLine x="91–120d" stroke="var(--octave-pink)" strokeDasharray="4 3" />
                          <Bar dataKey="balance_lkr" radius={[4,4,0,0]}>
                            {(data.aging_distribution||[]).map((d,i)=>{
                              const isBreached = d.bucket?.includes('91') || d.bucket?.includes('120') || d.bucket?.includes('>');
                              return <Cell key={i} fill={isBreached?'var(--octave-pink)':COLOR} opacity={isBreached?1:0.6} />;
                            })}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                      <div style={{ marginTop:10, padding:'8px 12px', background:'var(--octave-pink-light)', borderRadius:8, fontSize:11, color:'var(--octave-pink)', fontWeight:600, border:'1px solid rgba(232,42,174,0.2)' }}>
                        ⚠ Amounts in the 91d+ bucket constitute CBSL regulatory breaches requiring Board Audit Committee notification
                      </div>
                    </div>
                  </PanelWithMethod>
                </div>
              )}
            </div>
          </>
        );
      }}
    </AgentModule>
  );
}

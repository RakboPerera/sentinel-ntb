import React from 'react';
import AgentModule from '../../components/shared/AgentModule.jsx';
import ExplainerBox from '../../components/shared/ExplainerBox.jsx';
import { VisualFindingCard, InsightBox, ScoreBar, StatCard, PanelWithMethod } from '../../components/shared/VisualComponents.jsx';
import InfoTooltip from '../../components/shared/InfoTooltip.jsx';
import { demoData } from '../../data/demoData.js';
import useOpenFinding from '../../hooks/useOpenFinding.js';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLOR = '#993C1D';
const SCHEMA = {
  agentName: 'Suspense & Reconciliation',
  required: ['account_id','account_type','branch_code','current_balance_lkr','aging_days'],
  optional: ['growth_rate_30d_pct','clearing_ratio','inflow_lkr_30d','outflow_lkr_30d','balance_30d_ago_lkr'],
};
const RISK_COLORS = { critical:'#A32D2D', red:'#CF4343', amber:'#EF9F27', watch:'#185FA5' };
const RISK_BG = { critical:'#FEF8F8', red:'#FFF1F1', amber:'#FFFBEB', watch:'#EBF4FF' };

function ClearingRatioBadge({ ratio }) {
  const isHealthy = ratio >= 0.85;
  const isWarning = ratio >= 0.5 && ratio < 0.85;
  const color = isHealthy ? '#3B6D11' : isWarning ? '#854F0B' : '#A32D2D';
  const bg = isHealthy ? '#EAF3DE' : isWarning ? '#FAEEDA' : '#FCEBEB';
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'3px 9px', background:bg, borderRadius:6 }}>
      <span style={{ fontSize:12, fontWeight:700, color }}>{ratio.toFixed(2)}</span>
      <span style={{ fontSize:10, color }}>{isHealthy?'Healthy':isWarning?'Warning':'Critical'}</span>
      <InfoTooltip text="Clearing ratio = outflows ÷ inflows in the period. A legitimate CEFT receivables account clears at 0.95+. A ratio near zero means entries are flowing IN but not being cleared OUT — the phantom receivable signature." position="left" width={240} />
    </span>
  );
}

export default function SuspenseAgent() {
  const openFinding = useOpenFinding('suspense');
  return (
    <AgentModule agentId="suspense" agentName="Suspense & Reconciliation Agent" agentColor={COLOR} demoData={demoData.suspense} schema={SCHEMA}>
      {(data) => {
        const rs = data.reconciliation_summary;
        const agingPie = [
          { name:'Watch 0–30d', value:data.aging_distribution.watch_0_30.balance_lkr/1e9, count:data.aging_distribution.watch_0_30.count, color:'#185FA5' },
          { name:'Amber 31–60d', value:data.aging_distribution.amber_31_60.balance_lkr/1e9, count:data.aging_distribution.amber_31_60.count, color:'#EF9F27' },
          { name:'Red 61–90d', value:data.aging_distribution.red_61_90.balance_lkr/1e9, count:data.aging_distribution.red_61_90.count, color:'#CF4343' },
          { name:'Critical >90d', value:data.aging_distribution.critical_90_plus.balance_lkr/1e9, count:data.aging_distribution.critical_90_plus.count, color:'#A32D2D' },
        ];
        return (
          <>
            <ExplainerBox
              color={COLOR}
              icon="⊟"
              title="How this agent identifies phantom receivables"
              summary="Legitimate CEFT receivables clear within 3–5 business days. An account growing rapidly in balance while its clearing ratio (outflows ÷ inflows) collapses toward zero is definitively accumulating phantom entries."
              detail="The agent computes two metrics daily for every suspense account: (1) growth_rate_30d — how much the balance has grown in 30 days. Normal accounts grow <10% as entries flow through. (2) clearing_ratio — outflows divided by inflows. A healthy CEFT receivables account should clear at 0.95+. SUS-017's clearing ratio of 0.08 means 92% of inflows are never matched to outflows — they are phantom entries with no real transaction counterpart. The combination of high growth AND low clearing ratio is the definitive fraud signature."
              collapsible={true}
            />
            {/* Audit Opinion Banner */}
            <div style={{ padding:'10px 16px', background:'#993C1D08', border:`1px solid #993C1D25`, borderRadius:10, display:'flex', gap:10, alignItems:'flex-start', marginBottom:0 }}>
              <div style={{ fontSize:10, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.08em', padding:'3px 9px', borderRadius:5, background:'#993C1D', color:'white', flexShrink:0, marginTop:1 }}>
                ADVERSE
              </div>
              <div style={{ fontSize:12, color:'#993C1D', lineHeight:1.65 }}>
                In our opinion, suspense account reconciliation controls are NOT EFFECTIVE. SUS-017 has breached the CBSL 90-day aging guideline. LKR 1.24Bn is unreconciled with a phantom receivable pattern. Immediate escalation required.
              </div>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
              <StatCard label="Accounts Analysed" value={rs.total_accounts_analyzed} sub={`LKR ${(rs.total_unreconciled_balance_lkr/1e9).toFixed(2)} Bn total unreconciled`} color={COLOR} tooltip="All suspense, NOSTRO, and clearing accounts in the NTB network. Each is scored daily on balance growth rate, clearing ratio, and aging." />
              <StatCard label="Critical (>90 days)" value={rs.critical_accounts} sub="CBSL regulatory breach threshold" color="#A32D2D" tooltip="CBSL requires all suspense balances older than 90 days to be escalated to the Board Audit Committee. These accounts have breached that guideline." alert={`LKR ${(data.aging_distribution.critical_90_plus.balance_lkr/1e9).toFixed(2)} Bn at regulatory risk`} />
              <StatCard label="Growth Anomalies" value={rs.growth_anomalies} sub="Balance grew >50% in 30 days" color="#854F0B" tooltip="Accounts where the 30-day balance growth rate exceeds 50%. Rapid growth combined with aging is the primary early indicator of phantom receivable fraud — before the aging breach even occurs." />
              <StatCard label="Phantom Receivable Risk" value={rs.phantom_receivable_risk_accounts} sub="High growth + clearing ratio <0.3" color="#A32D2D" tooltip="Accounts meeting BOTH criteria: growth rate >50% in 30 days AND clearing ratio <0.30. This combination is the definitive phantom receivable signature — funds coming in but not being cleared out." alert="SUS-017 confirmed" />
            </div>

            <InsightBox type="critical" title="🚨 SUS-017 — Phantom receivable confirmed. CBSL regulatory breach." body="Account SUS-017 (Pettah Main Street CEFT Receivables) shows the definitive phantom receivable pattern: balance grew 312% in 30 days (inflows of LKR 939M) while only LKR 75M was cleared (clearing ratio 0.08). A legitimate CEFT receivables account should clear at 0.95+. After 94 days unreconciled, CBSL's guideline is formally breached. The Transaction Agent independently flagged this account for LKR 1.24 Bn in suspicious CEFT flows. Immediate freeze and forensic investigation required." />

            <div className="agent-panel">
              <div className="agent-panel-header"><span className="agent-panel-title">Key Findings</span></div>
              <div className="agent-panel-body">
                {(data.key_findings || []).map((f,i) => <VisualFindingCard key={i} finding={f} agentColor={COLOR} index={i} agentId="suspense" agentData={data} openFinding={openFinding} />)}
              </div>
            </div>

            <div className="agent-grid">
              <PanelWithMethod
                title="Aging Distribution — Unreconciled Balance by Tier"
                methodology="CBSL aging tiers: 0–30 days (Watch — normal clearing time), 31–60 days (Amber — requires written explanation), 61–90 days (Red — escalation required), 90+ days (Critical — regulatory breach, Board Audit notification mandatory). The pie shows balance LKR allocated across tiers."
                agentColor={COLOR}
              >
                <div style={{ padding:'12px 8px' }}>
                  <InsightBox type="warning" title="47% of unreconciled balance is in Critical tier (>90 days)" body="LKR 3.98 Bn is in accounts aged beyond the CBSL 90-day guideline. This represents a systemic reconciliation control failure across the NTB network, not a single account issue." compact />
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={agingPie} dataKey="value" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `LKR ${value.toFixed(1)}Bn`}>
                        {agingPie.map((d,i) => <Cell key={i} fill={d.color} />)}
                      </Pie>
                      <Tooltip formatter={(v) => [`LKR ${v.toFixed(2)} Bn`, 'Unreconciled balance']} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display:'flex', flexDirection:'column', gap:5, marginTop:8 }}>
                    {agingPie.map((d,i) => (
                      <div key={i} style={{ display:'flex', alignItems:'center', gap:8, fontSize:12, padding:'6px 10px', background:d.color+'12', borderRadius:6 }}>
                        <div style={{ width:10, height:10, borderRadius:2, background:d.color, flexShrink:0 }} />
                        <span style={{ flex:1 }}>{d.name}</span>
                        <span style={{ fontWeight:700, color:d.color }}>{d.count} accounts</span>
                        <span style={{ color:'var(--color-text-2)' }}>LKR {d.value.toFixed(1)} Bn</span>
                      </div>
                    ))}
                  </div>
                </div>
              </PanelWithMethod>

              <PanelWithMethod
                title="Flagged Account Detail"
                methodology="Each account is assessed on 3 signals: (1) Aging tier against CBSL guidelines; (2) 30-day growth rate — >50% in a clearing account is anomalous; (3) Clearing ratio — outflows as a proportion of inflows. The phantom receivable score combines all three."
                agentColor={COLOR}
              >
                <div style={{ maxHeight:420, overflowY:'auto' }}>
                  {(data.flagged_accounts || []).map((acc,i) => (
                    <div key={i} style={{ padding:'14px 16px', borderBottom:'1px solid var(--color-border)', background:RISK_BG[acc.risk_tier]||'transparent' }}>
                      <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:8, flexWrap:'wrap' }}>
                        <code style={{ fontSize:13, fontWeight:800 }}>{acc.account_id}</code>
                        <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', background:RISK_COLORS[acc.risk_tier], color:'white', borderRadius:4, textTransform:'uppercase' }}>{acc.risk_tier}</span>
                        {acc.ceft_fraud_indicators && <span style={{ fontSize:10, fontWeight:600, padding:'2px 7px', background:'#FAEEDA', color:'#854F0B', borderRadius:4 }}>CEFT</span>}
                        {acc.phantom_receivable_risk && <span style={{ fontSize:10, fontWeight:700, padding:'2px 7px', background:'var(--color-red-light)', color:'var(--color-red)', borderRadius:4 }}>PHANTOM</span>}
                        <span style={{ marginLeft:'auto', fontSize:15, fontWeight:800 }}>LKR {(acc.current_balance_lkr/1e6).toFixed(0)}M</span>
                      </div>
                      <div style={{ display:'flex', gap:16, fontSize:11, color:'var(--color-text-2)', marginBottom:10, flexWrap:'wrap' }}>
                        <span>{acc.account_type} · {acc.branch_code}</span>
                        <span style={{ color:acc.aging_days>=90?'var(--color-red)':acc.aging_days>=61?'#854F0B':'var(--color-text-2)', fontWeight:acc.aging_days>=61?700:400 }}>{acc.aging_days} days aged</span>
                        <span>Growth: <strong style={{ color:acc.growth_rate_30d_pct>100?'var(--color-red)':'#854F0B' }}>+{acc.growth_rate_30d_pct}%</strong> in 30d</span>
                      </div>
                      <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:8 }}>
                        <span style={{ fontSize:11, color:'var(--color-text-3)' }}>Clearing ratio:</span>
                        <ClearingRatioBadge ratio={acc.clearing_ratio} />
                      </div>
                      {acc.regulatory_breach_risk && <InsightBox type="regulatory" body="CBSL regulatory breach — 90-day guideline exceeded. Board Audit Committee notification mandatory." compact />}
                    </div>
                  ))}
                </div>
              </PanelWithMethod>
            </div>

            {/* ── RECONCILIATION DEPTH ── */}
            {data.reconciliation_depth && (
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>

                {/* Source system sync */}
                <PanelWithMethod
                  title="Source System Sync Status"
                  methodology="Each suspense account balance must reconcile to its source system feed (CEFT Switch, RTGS Switch, Core Banking, ATM Network). A 'Mismatch' status means the GL balance differs from the source system — indicating either an interface failure or deliberate manipulation of entries."
                  agentColor={COLOR}
                  tooltip="Mismatched source systems mean GL entries don't match the authoritative external feed. Interface failures are common but must be documented and resolved within 24 hours."
                >
                  <div>
                    {(data.reconciliation_depth.source_system_sync || []).map((sys,i) => {
                      const isMismatch = sys.status === 'Mismatch';
                      return (
                        <div key={i} style={{ padding:'12px 16px', borderBottom:'1px solid var(--color-border)', background: isMismatch ? 'var(--color-amber-light)' : 'transparent' }}>
                          <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:6 }}>
                            <span style={{ fontSize:12, fontWeight:600, flex:1 }}>{sys.system}</span>
                            <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:4, background: isMismatch ? 'var(--color-amber)' : '#3B6D11', color:'white' }}>{sys.status}</span>
                            {sys.breaks > 0 && <span style={{ fontSize:11, fontWeight:700, color:'var(--color-red)' }}>{sys.breaks} break{sys.breaks>1?'s':''}</span>}
                          </div>
                          <div style={{ fontSize:10, color:'var(--color-text-3)', marginBottom:4 }}>Last sync: {sys.last_sync}</div>
                          <div style={{ fontSize:11, color: isMismatch ? 'var(--color-amber)' : 'var(--color-text-2)', lineHeight:1.5 }}>{sys.note}</div>
                        </div>
                      );
                    })}
                  </div>
                </PanelWithMethod>

                {/* Re-aging detection */}
                <PanelWithMethod
                  title="Re-aging Detection"
                tooltip="Re-aging is a fraud technique where an old suspense balance is reversed and re-posted with a new date — resetting the aging clock to hide the true age of the liability. The agent detects this by tracking the original creation date versus the posted date."
                  methodology="Re-aging occurs when aged entries are reversed and reposted to reset the aging clock — commonly used to avoid CBSL 90-day breach reporting. The agent detects this by tracking the original posting date vs re-entry date across the GL journal history. Any re-aging within 15 days of the CBSL threshold is flagged as potential concealment."
                  agentColor={COLOR}
                  tooltip="Re-aging via reversal-repost is one of the most common techniques used to conceal aged suspense balances from regulators and auditors."
                >
                  {(data.reconciliation_depth.reaging_detected || []).length > 0 ? (
                    <div>
                      {(data.reconciliation_depth.reaging_detected || []).map((r,i) => (
                        <div key={i} style={{ padding:'14px 16px', borderBottom:'1px solid var(--color-border)', background:'var(--color-amber-light)' }}>
                          <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:8 }}>
                            <code style={{ fontSize:12, fontWeight:700 }}>{r.account_id}</code>
                            <span style={{ fontSize:10, fontWeight:700, padding:'2px 7px', background:'#854F0B', color:'white', borderRadius:4 }}>RE-AGING DETECTED</span>
                            <code style={{ marginLeft:'auto', fontSize:10, color:'var(--color-text-3)' }}>{r.reset_by}</code>
                          </div>
                          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:10 }}>
                            <div style={{ padding:'8px 10px', background:'rgba(255,255,255,0.6)', borderRadius:6, textAlign:'center' }}>
                              <div style={{ fontSize:18, fontWeight:800, color:'var(--color-amber)' }}>{r.original_age_days}d</div>
                              <div style={{ fontSize:9, color:'var(--color-text-3)' }}>Original age before reset</div>
                            </div>
                            <div style={{ padding:'8px 10px', background:'rgba(255,255,255,0.6)', borderRadius:6, textAlign:'center' }}>
                              <div style={{ fontSize:18, fontWeight:800, color:'#3B6D11' }}>{r.reset_to_days}d</div>
                              <div style={{ fontSize:9, color:'var(--color-text-3)' }}>Age after reset</div>
                            </div>
                          </div>
                          <div style={{ fontSize:11, color:'var(--color-text-2)', marginBottom:8 }}>Reset on {r.reset_date} via: {r.method}</div>
                          <InsightBox type="warning" body={r.interpretation} compact />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ padding:24, textAlign:'center', color:'var(--color-text-3)', fontSize:12 }}>
                      ✓ No re-aging patterns detected in this period.
                    </div>
                  )}
                </PanelWithMethod>

                {/* Auto-match rates */}
                <PanelWithMethod
                  title="Auto-Match Rates by Account"
                  methodology="Auto-match rate = % of entries matched automatically to a source system record. A healthy CEFT receivables account should match at 90%+. Match rates below 50% indicate either a broken reconciliation process or deliberate entry of items with no matching counterpart (phantom entries)."
                  agentColor={COLOR}
                  tooltip="Low auto-match rates mean items are flowing IN but cannot be matched to a legitimate outgoing transaction — the phantom receivable signature."
                >
                  <div>
                    {(data.reconciliation_depth.auto_match_rates || []).map((acc,i) => {
                      const matchColor = acc.auto_match_pct >= 80 ? '#3B6D11' : acc.auto_match_pct >= 50 ? '#EF9F27' : '#DC2626';
                      return (
                        <div key={i} style={{ padding:'12px 16px', borderBottom:'1px solid var(--color-border)' }}>
                          <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:6 }}>
                            <div style={{ flex:1 }}>
                              <code style={{ fontSize:11, fontWeight:700 }}>{acc.account_id}</code>
                              <div style={{ fontSize:10, color:'var(--color-text-3)' }}>{acc.account_name}</div>
                            </div>
                            <div style={{ textAlign:'right' }}>
                              <div style={{ fontSize:18, fontWeight:800, color:matchColor }}>{acc.auto_match_pct}%</div>
                              <div style={{ fontSize:9, color:'var(--color-text-3)' }}>auto-match</div>
                            </div>
                          </div>
                          <div style={{ height:6, borderRadius:3, background:'var(--color-surface-2)', overflow:'hidden', marginBottom:6 }}>
                            <div style={{ width:`${acc.auto_match_pct}%`, height:'100%', background:matchColor, borderRadius:3 }} />
                          </div>
                          <div style={{ display:'flex', gap:12, fontSize:11, color:'var(--color-text-2)' }}>
                            <span>{acc.unmatched_items} unmatched items</span>
                            <span style={{ color:acc.break_lkr>50e6?'var(--color-red)':'var(--color-text-2)', fontWeight:acc.break_lkr>50e6?700:400 }}>
                              LKR {(acc.break_lkr/1e6).toFixed(1)}M break
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </PanelWithMethod>

                {/* Cutoff analysis */}
                <PanelWithMethod
                  title="Clearing Cutoff Analysis"
                  methodology="Tracks how quickly entries clear across the suspense population: T+0 (same day), T+1 (next business day), T+2+ (delayed). CBSL recommends <10% of entries remaining uncleared after T+1 for CEFT accounts. High T+2+ concentrations indicate either processing backlogs or deliberate delay in matching entries."
                  agentColor={COLOR}
                >
                  <div style={{ padding:'16px' }}>
                    {(data.reconciliation_depth.cutoff_analysis || []).map((tier,i) => {
                      const color = tier.tier.includes('T+0') ? '#3B6D11' : tier.tier.includes('T+1') ? '#EF9F27' : '#DC2626';
                      return (
                        <div key={i} style={{ marginBottom:14 }}>
                          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                            <span style={{ fontSize:12, fontWeight:600 }}>{tier.tier}</span>
                            <span style={{ fontSize:13, fontWeight:800, color }}>{tier.pct}%</span>
                          </div>
                          <div style={{ height:8, borderRadius:4, background:'var(--color-surface-2)', overflow:'hidden', marginBottom:4 }}>
                            <div style={{ width:`${tier.pct}%`, height:'100%', background:color, borderRadius:4 }} />
                          </div>
                          <div style={{ fontSize:11, color:'var(--color-text-2)', lineHeight:1.5 }}>{tier.interpretation}</div>
                        </div>
                      );
                    })}
                    <InsightBox type="warning"
                      body="17% of entries taking T+2+ is above the CBSL recommended threshold of 10%. Concentrated in SUS-ACC-017 — consistent with the phantom receivable pattern where entries flow in but are never cleared to a matching outflow."
                      compact
                    />
                  </div>
                </PanelWithMethod>
              </div>
            )}
          </>
        );
      }}
      </AgentModule>
  );
}

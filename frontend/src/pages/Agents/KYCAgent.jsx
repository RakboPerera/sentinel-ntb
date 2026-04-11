import React, { useState } from 'react';
import AgentModule from '../../components/shared/AgentModule.jsx';
import InfoTooltip from '../../components/shared/InfoTooltip.jsx';
import ExplainerBox from '../../components/shared/ExplainerBox.jsx';
import { VisualFindingCard, InsightBox, StatCard, PanelWithMethod, MetricComparison } from '../../components/shared/VisualComponents.jsx';
import { demoData } from '../../data/demoData.js';
import useOpenFinding from '../../hooks/useOpenFinding.js';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const SCHEMA = { agentName:'Identity & KYC / AML', required:['customer_id','risk_rating','kyc_last_refresh_date','account_open_date'], optional:['pep_flag','country_of_origin','entity_type','introducer_code','beneficial_owner_disclosed','dormant_flag'] };
const COLOR = '#0F6E56';

const PRIORITY_COLORS = { critical:'#A32D2D', high:'#854F0B', medium:'#185FA5', low:'#3B6D11' };
const PRIORITY_BG    = { critical:'#FCEBEB', high:'#FAEEDA', medium:'#E6F1FB', low:'#EAF3DE' };

export default function KYCAgent() {
  const [activeTab, setActiveTab] = useState('gaps');
  const openFinding = useOpenFinding('kyc');
  return (
    <AgentModule agentId="kyc" agentName="Identity, KYC & AML Agent" agentColor={COLOR} demoData={demoData.kyc} schema={SCHEMA}>
      {(data) => {
        const cs = data.compliance_summary;

        return (
          <>
            <ExplainerBox color={COLOR} icon="✦"
              title="How this agent identifies KYC compliance gaps"
              summary="A 47-rule engine checks every account against CBSL Customer Due Diligence requirements — expiry dates, PEP status, FATF country flags, beneficial ownership, dormant reactivation, and introducer concentration patterns."
              detail="Each of the 47 rules maps to a specific CBSL or FTRA requirement. The engine runs nightly across all 835,944 accounts. Priority is assigned by risk rating and rule severity — a PEP account with overdue EDD is always Critical regardless of gap count. Introducer concentration is detected by grouping accounts by introducer code and computing the gap rate per introducer — any introducer exceeding 15% gap rate with 3+ accounts is flagged."
              collapsible
            />

            {/* Audit Opinion Banner */}
            <div style={{ padding:'10px 16px', background:'#0F6E5608', border:`1px solid #0F6E5625`, borderRadius:10, display:'flex', gap:10, alignItems:'flex-start', marginBottom:0 }}>
              <div style={{ fontSize:10, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.08em', padding:'3px 9px', borderRadius:5, background:'#0F6E56', color:'white', flexShrink:0, marginTop:1 }}>
                QUALIFIED
              </div>
              <div style={{ fontSize:12, color:'#0F6E56', lineHeight:1.65 }}>
                In our opinion, KYC compliance controls are PARTIALLY EFFECTIVE. Gap rate of 4.7% exceeds the CBSL 2% threshold. 34 PEP accounts have overdue Enhanced Due Diligence. A formal remediation programme is required.
              </div>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
              <StatCard label="Customers Analysed" value={cs.total_customers_analyzed.toLocaleString()} sub={`KYC gap rate: ${cs.kyc_gap_pct}%`} color={COLOR} tooltip="Full NTB customer population scanned nightly against all 47 CDD rules. Includes retail, SME, corporate, and institutional accounts." />
              <StatCard label="KYC Gaps" value={cs.kyc_gap_count.toLocaleString()} sub={`${cs.overdue_refresh_count.toLocaleString()} documents overdue`} color="#854F0B" tooltip="Accounts with any material gap: expired documents, missing beneficial owner, overdue EDD, FATF-country accounts without enhanced due diligence. 847 are from the HSBC migration batch." alert="847 from HSBC migration" />
              <StatCard label="PEP Accounts" value={cs.pep_accounts} sub={`${cs.pep_related_accounts} PEP-related accounts`} color="#A32D2D" tooltip="Politically Exposed Persons require Enhanced Due Diligence (EDD) with annual review. A PEP account with overdue EDD is an immediate regulatory breach — CBSL can impose sanctions on the bank." alert={cs.pep_accounts > 0 ? "EDD review required" : null} />
              <StatCard label="STR Assessments Required" value={cs.str_assessment_required} sub={`${cs.fatf_country_exposure} FATF-country accounts`} color="#A32D2D" tooltip="Accounts requiring a Suspicious Transaction Report assessment under FTRA. Two are IMMEDIATE — one PEP with overdue EDD, one FATF-country account linked to the SUS-017 suspicious network." alert="2 immediate STR required" />
            </div>

            <div className="agent-panel">
              <div className="agent-panel-header"><span className="agent-panel-title">Key Findings</span></div>
              <div className="agent-panel-body">
                {(data.key_findings || []).map((f,i) => <VisualFindingCard key={i} finding={f} agentColor={COLOR} index={i} agentId="kyc" agentData={data} openFinding={openFinding} />)}
              </div>
            </div>

            <div className="agent-grid">
              {/* Left column */}
              <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

                <PanelWithMethod
                  title="KYC Gap Rate vs Threshold"
                  methodology="The KYC gap rate is computed as: accounts with any CDD gap ÷ total accounts. Green threshold: <2%. Amber: 2–5%. Red: >5%. The 4.7% rate sits in amber. The HSBC migration will add 200,000+ accounts requiring KYC verification before Q2 2026 integration — this is the critical remediation window."
                  agentColor={COLOR}
                  tooltip="Gap rate = accounts with material KYC gaps ÷ total accounts. Threshold: 2% green, 5% red."
                >
                  <div style={{ padding:'16px' }}>
                    <MetricComparison label="Current KYC gap rate" actual={4.7} benchmark={2.0} unit="%" benchmarkLabel="Green threshold" higherIsBad tooltip="The 2% threshold is the point at which CBSL considers KYC compliance adequate. Above 5% triggers supervisory action." />
                    <MetricComparison label="Critical gaps (regulatory breach)" actual={cs.edd_required_count} benchmark={0} unit="" benchmarkLabel="Zero target" higherIsBad tooltip="Accounts where the KYC gap constitutes a regulatory breach — PEP without EDD, FATF-country without enhanced review, beneficial ownership gap on legal entity." />
                    <InsightBox type="warning" title="HSBC migration critical path" body="847 of the 39,290 KYC gaps originate from the HSBC account migration batch. All must be remediated before Q2 2026 integration. If carried over, they would make NTB responsible for HSBC accounts that are out of compliance on Day 1 of the merged entity." compact />
                  </div>
                </PanelWithMethod>

                <PanelWithMethod
                  title="Introducer Concentration Flags"
                  methodology="Rule: Flag any introducer where KYC gap rate exceeds 15% of their introduced accounts AND at least 3 accounts have gaps. High concentrations suggest either deliberately weak onboarding (to obscure beneficial ownership) or systematic negligence by that introducer. Cross-referenced against Credit Agent flagged borrowers."
                  agentColor={COLOR}
                >
                  <div>
                    {(data.introducer_concentration || []).map((intro,i) => (
                      <div key={i} style={{ padding:'12px 16px', borderBottom:'1px solid var(--color-border)', background: intro.flag ? 'var(--color-red-light)' : 'transparent' }}>
                        <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:6 }}>
                          <code style={{ fontSize:12, fontWeight:700 }}>{intro.introducer_code}</code>
                          {intro.flag && <span style={{ fontSize:10, fontWeight:700, padding:'2px 7px', background:'var(--color-red)', color:'white', borderRadius:4 }}>FLAGGED</span>}
                          <span style={{ marginLeft:'auto', fontSize:13, fontWeight:700, color: intro.flag ? 'var(--color-red)' : 'var(--color-text)' }}>
                            {intro.accounts_with_gaps}/{intro.total_accounts_introduced} gaps ({Math.round(intro.accounts_with_gaps/intro.total_accounts_introduced*100)}%)
                          </span>
                        </div>
                        <div style={{ height:6, borderRadius:3, background:'var(--color-surface-2)', overflow:'hidden', marginBottom:6 }}>
                          <div style={{ width:`${intro.accounts_with_gaps/intro.total_accounts_introduced*100}%`, height:'100%', background: intro.flag ? 'var(--color-red)' : COLOR, borderRadius:3 }} />
                        </div>
                        <div style={{ fontSize:12, color: intro.flag ? 'var(--color-red)' : 'var(--color-text-2)', lineHeight:1.5 }}>{intro.risk_interpretation}</div>
                      </div>
                    ))}
                  </div>
                </PanelWithMethod>
              </div>

              {/* Right column - tabs */}
              <div className="agent-panel">
                <div className="agent-panel-header" style={{ padding:0 }}>
                  {['gaps','pep','branch'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                      style={{ padding:'12px 16px', fontSize:12, fontWeight: activeTab===tab ? 600 : 400, background: activeTab===tab ? 'var(--color-surface-2)' : 'none', borderBottom: `2px solid ${activeTab===tab ? COLOR : 'transparent'}`, color: activeTab===tab ? COLOR : 'var(--color-text-2)', cursor:'pointer', border:'none', display:'flex', alignItems:'center', gap:6 }}>
                      {tab === 'gaps' ? 'Priority Gaps' : tab === 'pep' ? 'PEP Findings' : 'Branch Heatmap'}
                      {tab === 'gaps' && <span style={{ fontSize:10, fontWeight:700, padding:'1px 6px', background:'var(--color-red-light)', color:'var(--color-red)', borderRadius:10 }}>{data.kyc_gaps.filter(g=>g.priority==='critical').length}</span>}
                    </button>
                  ))}
                </div>
                <div style={{ maxHeight:480, overflowY:'auto' }}>
                  {activeTab === 'gaps' && (data.kyc_gaps || []).map((g,i) => (
                    <div key={i} style={{ padding:'12px 16px', borderBottom:'1px solid var(--color-border)', background: PRIORITY_BG[g.priority]||'transparent' }}>
                      <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:5 }}>
                        <code style={{ fontSize:11 }}>{g.customer_id}</code>
                        <span style={{ fontSize:10, fontWeight:700, padding:'2px 7px', background: g.priority==='critical' ? 'var(--color-red)' : PRIORITY_BG[g.priority], color: g.priority==='critical' ? 'white' : PRIORITY_COLORS[g.priority], borderRadius:4 }}>{g.priority}</span>
                        {g.regulatory_breach && <span style={{ fontSize:10, fontWeight:700, color:'var(--color-red)', display:'flex', alignItems:'center', gap:3 }}>⚠ Regulatory breach</span>}
                        <span style={{ marginLeft:'auto', fontSize:11, color: g.days_overdue > 180 ? 'var(--color-red)' : 'var(--color-text-2)', fontWeight: g.days_overdue > 180 ? 700 : 400 }}>{g.days_overdue}d overdue</span>
                      </div>
                      <div style={{ fontSize:12, color:'var(--color-text)', marginBottom:4 }}>{g.gap_type}</div>
                      <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                        <span style={{ fontSize:10, padding:'2px 7px', background:`${COLOR}12`, color:COLOR, borderRadius:4 }}>Risk: {g.risk_rating}</span>
                      </div>
                    </div>
                  ))}
                  {activeTab === 'pep' && (
                    <div>
                      {(data.pep_findings || []).map((p,i) => (
                        <div key={i} style={{ padding:'14px 16px', borderBottom:'1px solid var(--color-border)', background: !p.edd_current ? 'var(--color-red-light)' : 'transparent' }}>
                          <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:6 }}>
                            <code style={{ fontSize:12, fontWeight:700 }}>{p.customer_id}</code>
                            <span style={{ fontSize:10, fontWeight:600, padding:'2px 7px', background: p.pep_type==='direct'?'var(--color-red-light)':'var(--color-amber-light)', color: p.pep_type==='direct'?'var(--color-red)':'var(--color-amber)', borderRadius:4 }}>
                              PEP {p.pep_type}
                            </span>
                            <span style={{ marginLeft:'auto', fontSize:11, color: !p.edd_current?'var(--color-red)':'var(--color-green)', fontWeight:600 }}>
                              {p.edd_current ? '✓ EDD current' : '✗ EDD overdue'}
                            </span>
                          </div>
                          <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:8 }}>
                            <div style={{ flex:1, height:6, borderRadius:3, background:'var(--color-surface-2)', overflow:'hidden' }}>
                              <div style={{ width:`${Math.min(p.last_review_days_ago/365*100,100)}%`, height:'100%', background: p.last_review_days_ago>365?'var(--color-red)':'var(--color-amber)', borderRadius:3 }} />
                            </div>
                            <span style={{ fontSize:11, color:'var(--color-text-2)', whiteSpace:'nowrap' }}>Last review: {p.last_review_days_ago} days ago</span>
                          </div>
                          {!p.edd_current && <InsightBox type="critical" body={p.action_required} compact />}
                        </div>
                      ))}
                    </div>
                  )}
                  {activeTab === 'branch' && (
                    <>
                      <div style={{ padding:'12px 8px' }}>
                        <ResponsiveContainer width="100%" height={200}>
                          <BarChart data={data.branch_compliance_heatmap} layout="vertical" margin={{ top:0, right:40, bottom:0, left:20 }}>
                            <XAxis type="number" domain={[0,100]} tick={{ fontSize:10 }} label={{ value:'Risk score (higher = worse)', position:'insideBottom', offset:-2, fontSize:10 }} />
                            <YAxis type="category" dataKey="branch_code" tick={{ fontSize:11 }} width={44} />
                            <Tooltip formatter={(v) => [`${v} risk score`, 'Branch KYC Risk']} />
                            <Bar dataKey="risk_score" radius={[0,3,3,0]} label={{ position:'right', fontSize:10 }}>
                              {(data.branch_compliance_heatmap || []).map((d,i) => <Cell key={i} fill={d.risk_score>=80?'#A32D2D':d.risk_score>=60?'#EF9F27':'#3B6D11'} />)}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      {data.branch_compliance_heatmap.filter(b=>b.risk_score>=60).map((b,i) => (
                        <div key={i} style={{ padding:'10px 16px', borderBottom:'1px solid var(--color-border)', background: b.risk_score>=80?'var(--color-red-light)':'var(--color-amber-light)' }}>
                          <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:4 }}>
                            <code style={{ fontSize:12, fontWeight:700 }}>{b.branch_code}</code>
                            <span style={{ fontSize:11, fontWeight:600, color: b.risk_score>=80?'var(--color-red)':'var(--color-amber)' }}>Gap rate: {b.gap_rate_pct}%</span>
                            {b.pep_accounts > 0 && <span style={{ fontSize:10, padding:'1px 6px', background:'var(--color-red-light)', color:'var(--color-red)', borderRadius:4 }}>{b.pep_accounts} PEP</span>}
                          </div>
                          <div style={{ fontSize:11, color:'var(--color-text-2)' }}>{b.critical_gaps} critical gaps requiring immediate action</div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            </div>
          </>
        );
      }}
      </AgentModule>
  );
}

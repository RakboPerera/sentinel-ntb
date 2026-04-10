import React from 'react';
import AgentModule from '../../components/shared/AgentModule.jsx';
import ExplainerBox from '../../components/shared/ExplainerBox.jsx';
import { VisualFindingCard, InsightBox, ScoreBar, StatCard, PanelWithMethod } from '../../components/shared/VisualComponents.jsx';
import { CoverageStatement } from '../../components/shared/VisualComponents.jsx';
import InfoTooltip from '../../components/shared/InfoTooltip.jsx';
import { demoData } from '../../data/demoData.js';
import useOpenFinding from '../../hooks/useOpenFinding.js';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

const COLOR = '#854F0B';
const SCHEMA = {
  agentName: 'Internal Controls',
  required: ['transaction_id','branch_code','initiator_id','approver_id','amount_lkr','transaction_type','timestamp'],
  optional: ['override_flag','approval_time_minutes','customer_id','loan_id'],
};

const DIM_TOOLTIPS = {
  'Override Rate': 'Percentage of approvals that bypassed standard controls. Healthy: <5%. Critical: >15%.',
  'SoD Violations': 'Segregation of Duties — same person both initiating and approving. Any instance is a critical control failure.',
  'Off-Hours': 'Approvals made before 08:00 or after 18:00, or on weekends. Elevated off-hours activity correlates with insider fraud.',
  'Approver Conc.': 'Index of how concentrated approvals are in a single approver. 0=distributed, 1=single approver handles everything.',
  'Override Cluster': 'Pattern of overrides applied to loans sharing borrowers, guarantors, or addresses — indicates coordinated approval.',
  'Turnaround Anom.': 'Approvals processed in <2 minutes — indicating rubber-stamping rather than genuine review.',
};

function BranchScoreCard({ branch, isHighlighted }) {
  const scoreColor = branch.composite_score < 50 ? '#A32D2D' : branch.composite_score < 65 ? '#EF9F27' : '#3B6D11';
  const tier = branch.composite_score < 50 ? 'CRITICAL' : branch.composite_score < 65 ? 'AMBER' : branch.composite_score < 80 ? 'GREEN' : 'GOOD';
  return (
    <div style={{ padding:'14px 16px', borderBottom:'1px solid var(--color-border)', background: isHighlighted ? '#FEF8F8' : 'transparent' }}>
      <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:8 }}>
        <code style={{ fontSize:14, fontWeight:800 }}>{branch.branch_code}</code>
        <span style={{ fontSize:11, fontWeight:700, padding:'2px 8px', background: scoreColor+'18', color:scoreColor, borderRadius:4 }}>{tier}</span>
        {branch.sod_violation_count > 0 && <span style={{ fontSize:10, fontWeight:700, padding:'2px 7px', background:'var(--color-red-light)', color:'var(--color-red)', borderRadius:4 }}>{branch.sod_violation_count} SoD</span>}
        <div style={{ marginLeft:'auto', fontSize:24, fontWeight:900, color:scoreColor }}>{branch.composite_score}<span style={{ fontSize:13, fontWeight:400, color:'var(--color-text-3)'}}>/100</span></div>
      </div>
      <ScoreBar score={branch.composite_score / 100} label="Control score" />
      <div style={{ marginTop:8, fontSize:12, color: isHighlighted?'var(--color-red)':'var(--color-text-2)', lineHeight:1.5 }}>{branch.primary_concern}</div>
      <div style={{ display:'flex', gap:12, marginTop:8, fontSize:11, color:'var(--color-text-3)' }}>
        <span>Override rate: <strong style={{ color:'var(--color-text)' }}>{branch.override_rate_pct}%</strong></span>
        <span>Off-hours: <strong style={{ color:'var(--color-text)' }}>{branch.off_hours_approval_pct}%</strong></span>
        <span>Approver conc.: <strong style={{ color:'var(--color-text)' }}>{branch.approver_concentration_index}</strong></span>
      </div>
    </div>
  );
}

export default function InternalControlsAgent() {
  const openFinding = useOpenFinding('controls');
  return (
    <AgentModule agentId="controls" agentName="Internal Controls Agent" agentColor={COLOR} demoData={demoData.controls} schema={SCHEMA}>
      {(data) => {
        const cs = data.controls_summary;
        const radarData = [
          { dim:'Override Rate', BR14:86, BR23:61, Network:30 },
          { dim:'SoD Violations', BR14:95, BR23:35, Network:5 },
          { dim:'Off-Hours', BR14:88, BR23:46, Network:20 },
          { dim:'Approver Conc.', BR14:87, BR23:61, Network:18 },
          { dim:'Override Cluster', BR14:90, BR23:44, Network:15 },
          { dim:'Turnaround Anom.', BR14:74, BR23:38, Network:22 },
        ];
        return (
          <>
          <ExplainerBox
              color="#854F0B"
              icon="⚙"
              title="How this agent works"
              summary="No single branch staff member should both initiate and approve any transaction. When this rule is violated (SoD breach), the agent flags it — and then looks for concentrations of overrides, off-hours activity, and cluster approvals around the same individual."
              detail="The 6-dimension composite score (0–100) combines: override frequency rate (25%), SoD violation rate (20%), approval turnaround anomaly (15%), off-hours approval rate (15%), approver concentration index (15%), and temporal clustering (10%). A score below 65 triggers enhanced monitoring; below 50 triggers immediate investigation. BR-14 at 41/100 fails 5 of 6 dimensions."
              collapsible={true}
            />
            {/* Audit Opinion Banner */}
            <div style={{ padding:'10px 16px', background:'#854F0B08', border:`1px solid #854F0B25`, borderRadius:10, display:'flex', gap:10, alignItems:'flex-start', marginBottom:0 }}>
              <div style={{ fontSize:10, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.08em', padding:'3px 9px', borderRadius:5, background:'#854F0B', color:'white', flexShrink:0, marginTop:1 }}>
                ADVERSE
              </div>
              <div style={{ fontSize:12, color:'#854F0B', lineHeight:1.65 }}>
                In our opinion, the internal control environment at Branch BR-14 is NOT EFFECTIVE. 4 SoD violations confirmed. STF-1847 matches all 6 insider fraud indicators simultaneously. Immediate suspension and field audit required.
              </div>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
              <StatCard label="Transactions" value={cs.total_transactions_analyzed.toLocaleString()} sub={`Network override rate: ${cs.network_override_rate_pct}%`} color={COLOR} tooltip="All credit and payment transactions reviewed for SoD violations, override abuse, and timing anomalies. Every transaction where initiator_id = approver_id is automatically flagged." />
              <StatCard label="SoD Violations" value={cs.sod_violations} sub="Same person initiated + approved" color="#A32D2D" tooltip="Segregation of Duties: the same staff member cannot both initiate AND approve the same transaction. Any SoD violation is a critical control failure that must be immediately escalated." alert="All 4 from STF-1847 at BR-14" />
              <StatCard label="Branches Below 65" value={cs.branches_below_threshold} sub="65/100 = audit intervention threshold" color="#A32D2D" tooltip="The 6-dimension composite score for each branch. Below 65 = elevated risk, requiring targeted audit. Below 50 = critical, requiring immediate field investigation." alert="BR-14 at 41/100 — confirmed fraud" />
              <StatCard label="Flagged Approvers" value={cs.flagged_approvers} sub={`${cs.off_hours_approvals} off-hours approvals`} color="#854F0B" tooltip="Individual staff members whose approval pattern — concentration, off-hours timing, SoD violations, or same-cluster approvals — exceeds the investigation threshold." />
            </div>

            {/* Critical banner */}
            <InsightBox type="critical" title="🚨 CRITICAL: STF-1847 matches all 6 insider fraud indicators simultaneously" body="Staff member STF-1847 (Ratnapura, BR-14): (1) 4 confirmed SoD violations — initiated AND approved the same loan disbursements; (2) 87% override concentration — one person driving nearly all branch overrides; (3) 3 same-cluster approvals — loans to borrowers sharing guarantor addresses; (4) 12 off-hours approvals between 21:00–23:00; (5) approval turnaround averaging 1.4 minutes — no genuine credit review; (6) correlates with Credit Agent (11 flagged loans), KYC Agent (suspect introducer), and Digital Agent (off-hours document access). Immediate suspension recommended." />

            <div className="agent-panel">
              <div className="agent-panel-header"><span className="agent-panel-title">Key Findings</span></div>
              <div className="agent-panel-body">
                {(data.key_findings || []).map((f,i) => <VisualFindingCard key={i} finding={f} agentColor={COLOR} index={i} agentId="controls" agentData={data} openFinding={openFinding} />)}
              </div>
            </div>

            <div className="agent-grid">
              <PanelWithMethod
                title="6-Dimension Radar — BR-14 vs BR-23 vs Network"
                methodology="Each branch is scored on 6 independent control dimensions. The radar chart compares the two highest-risk branches against the network average. A branch that scores high across ALL 6 dimensions simultaneously is exhibiting the insider fraud pattern — no single dimension alone is sufficient."
                agentColor={COLOR}
              >
                <div style={{ padding:'12px 8px' }}>
                  <InsightBox type="info" title="Reading the radar" body="The further a branch's polygon extends from the centre, the worse its control environment on that dimension. BR-14 (red) dominates the outer ring on all 6 dimensions simultaneously — this combination is the definitive insider fraud signature." compact />
                  <ResponsiveContainer width="100%" height={260}>
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="dim" tick={{ fontSize:10 }} />
                      <Radar name="BR-14 (Critical)" dataKey="BR14" stroke="#A32D2D" fill="#A32D2D" fillOpacity={0.15} />
                      <Radar name="BR-23 (Amber)" dataKey="BR23" stroke="#EF9F27" fill="#EF9F27" fillOpacity={0.12} />
                      <Radar name="Network avg" dataKey="Network" stroke="#3B6D11" fill="#3B6D11" fillOpacity={0.08} />
                    </RadarChart>
                  </ResponsiveContainer>
                  <div style={{ display:'flex', gap:16, justifyContent:'center', fontSize:11, flexWrap:'wrap' }}>
                    {[['#A32D2D','BR-14 Critical'],['#EF9F27','BR-23 Amber'],['#3B6D11','Network avg']].map(([c,l])=>(
                      <span key={l} style={{ display:'flex', alignItems:'center', gap:5 }}><div style={{ width:14,height:2,background:c }}/>{l}</span>
                    ))}
                  </div>
                  <div style={{ marginTop:12, display:'flex', flexWrap:'wrap', gap:6 }}>
                    {Object.entries(DIM_TOOLTIPS).map(([dim, tip]) => (
                      <span key={dim} style={{ fontSize:11, padding:'3px 9px', background:'var(--color-surface-2)', borderRadius:5, display:'flex', alignItems:'center', gap:4, color:'var(--color-text-2)' }}>
                        {dim} <InfoTooltip text={tip} position="top" width={220} />
                      </span>
                    ))}
                  </div>
                </div>
              </PanelWithMethod>

              <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                <PanelWithMethod
                  title="Branch Risk Scores — All Flagged Branches"
                  methodology="The 6-dimension composite is weighted: Override rate 25%, SoD violations 20%, approval turnaround 15%, off-hours 15%, approver concentration 15%, override temporal clustering 10%. A score below 65/100 triggers audit intervention; below 50 triggers immediate field investigation."
                  agentColor={COLOR}
                >
                  <div style={{ padding:0 }}>
                    {(data.branch_risk_scores || []).map((b,i) => <BranchScoreCard key={i} branch={b} isHighlighted={b.composite_score < 50} />)}
                  </div>
                </PanelWithMethod>

                <PanelWithMethod
                  title="SoD Violations — All Instances"
                  methodology="A SoD violation occurs when the same staff_id appears as both initiator and approver on the same transaction. Even one instance is a critical control failure. Four instances by the same individual at the same branch — plus 87% override concentration — is consistent only with deliberate circumvention."
                  agentColor={COLOR}
                >
                  <div style={{ padding:0 }}>
                    {(data.sod_violations || []).map((v,i) => (
                      <div key={i} style={{ padding:'11px 16px', borderBottom:'1px solid var(--color-border)', background:'var(--color-red-light)' }}>
                        <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:4 }}>
                          <code style={{ fontSize:11, fontWeight:700, color:'var(--color-red)' }}>{v.staff_id}</code>
                          <span style={{ fontSize:10, padding:'2px 7px', background:'var(--color-red)', color:'white', borderRadius:4, fontWeight:700 }}>SoD violation</span>
                          <span style={{ marginLeft:'auto', fontSize:12, fontWeight:700 }}>LKR {(v.amount_lkr/1e6).toFixed(1)}M</span>
                        </div>
                        <div style={{ fontSize:11, color:'var(--color-text-2)' }}>{v.branch_code} · {v.transaction_type} · {v.transaction_id}</div>
                      </div>
                    ))}
                  </div>
                  <InsightBox type="regulatory" body="CBSL Direction No. 5/2024 requires that no staff member have end-to-end control over any credit or payment transaction. These SoD violations represent a material control failure and may require regulatory disclosure." compact />
                </PanelWithMethod>
              </div>
            </div>

            {/* Flagged approvers */}
            <PanelWithMethod
              title="Flagged Approver Profiles"
              methodology="Each approver is scored on 5 behaviours: override count, override concentration (share of total branch overrides), SoD violations, same-cluster approvals (loans to connected borrowers), and off-hours approvals. A staff member triggering 3+ of these simultaneously is flagged for investigation."
              agentColor={COLOR}
            >
              <div>
                {(data.flagged_approvers || []).map((approver,i) => (
                  <div key={i} style={{ padding:'18px 20px', borderBottom:'1px solid var(--color-border)', background: approver.sod_violations >= 3 ? 'var(--color-red-light)' : 'transparent' }}>
                    <div style={{ display:'flex', gap:12, alignItems:'center', marginBottom:12 }}>
                      <code style={{ fontSize:16, fontWeight:900, color:'var(--color-red)' }}>{approver.staff_id}</code>
                      <span style={{ fontSize:12, color:'var(--color-text-2)' }}>{approver.branch_code}</span>
                      <div style={{ marginLeft:'auto', display:'flex', gap:6, flexWrap:'wrap' }}>
                        {[
                          [`${approver.sod_violations} SoD violations`, 'var(--color-red)','var(--color-red-light)'],
                          [`${approver.override_concentration_pct}% override concentration`, '#854F0B','#FAEEDA'],
                          [`${approver.off_hours_approvals} off-hours approvals`, COLOR, '#E6F1FB'],
                        ].map(([label, color, bg]) => (
                          <span key={label} style={{ fontSize:11, fontWeight:600, padding:'3px 9px', background:bg, color, borderRadius:5 }}>{label}</span>
                        ))}
                      </div>
                    </div>
                    <InsightBox type="critical" body={approver.risk_narrative} compact />
                  </div>
                ))}
              </div>
            </PanelWithMethod>
          </>
        );
      }}
      </AgentModule>
  );
}

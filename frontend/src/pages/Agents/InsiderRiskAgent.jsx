import React, { useState } from 'react';
import AgentModule from '../../components/shared/AgentModule.jsx';
import ExplainerBox from '../../components/shared/ExplainerBox.jsx';
import InfoTooltip from '../../components/shared/InfoTooltip.jsx';
import { VisualFindingCard, InsightBox, StatCard, PanelWithMethod } from '../../components/shared/VisualComponents.jsx';
import { CoverageStatement } from '../../components/shared/VisualComponents.jsx';
import { demoData } from '../../data/demoData.js';
import useOpenFinding from '../../hooks/useOpenFinding.js';
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus, Shield, AlertTriangle, Zap, User } from 'lucide-react';

const COLOR = '#7C3AED';
const SCHEMA = {
  agentName: 'Insider Risk',
  required: ['staff_id', 'branch_code', 'initiator_id', 'approver_id', 'amount_lkr', 'transaction_type', 'timestamp'],
  optional: ['override_flag', 'approval_time_minutes', 'customer_id', 'loan_id', 'session_id', 'off_hours_flag'],
};

// ─── RISK SCORE GAUGE ─────────────────────────────────────────────────────────

function RiskGauge({ score }) {
  const color = score >= 85 ? '#DC2626' : score >= 70 ? '#D97706' : score >= 40 ? '#EF9F27' : '#16A34A';
  const label = score >= 85 ? 'Critical' : score >= 70 ? 'High' : score >= 40 ? 'Watch' : 'Normal';
  const pct = score;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-3)' }}>Insider Risk Score</span>
          <InfoTooltip text="0–100 composite score combining 6 dimensions: SoD violations (weight 25%), override concentration (20%), off-hours approvals (18%), same-cluster approvals (18%), approval turnaround anomaly (12%), session anomalies (7%). Above 40 = watch; above 70 = high; above 85 = critical." position="right" width={300} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ fontSize: 28, fontWeight: 900, color, lineHeight: 1 }}>{score}</span>
          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 10, background: `${color}18`, color, border: `1px solid ${color}33` }}>{label}</span>
        </div>
      </div>
      <div style={{ position: 'relative', height: 12, borderRadius: 6, overflow: 'hidden', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
        {[[0, 40, '#16A34A'], [40, 70, '#EF9F27'], [70, 85, '#D97706'], [85, 100, '#DC2626']].map(([from, to, c]) => (
          <div key={from} style={{ position: 'absolute', left: `${from}%`, width: `${to - from}%`, top: 0, bottom: 0, background: c, opacity: 0.15 }} />
        ))}
        <div style={{ position: 'absolute', left: 0, width: `${pct}%`, top: 0, bottom: 0, background: color, opacity: 0.9, borderRadius: 6 }} />
        {[40, 70, 85].map(t => <div key={t} style={{ position: 'absolute', left: `${t}%`, top: 0, bottom: 0, width: 2, background: 'white', opacity: 0.7 }} />)}
        <div style={{ position: 'absolute', left: `calc(${pct}% - 2px)`, top: -2, bottom: -2, width: 4, borderRadius: 2, background: color, boxShadow: `0 0 6px ${color}` }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3, fontSize: 9, color: 'var(--color-text-3)' }}>
        <span>0 Normal</span><span>40 Watch</span><span>70 High</span><span>85 Critical</span><span>100</span>
      </div>
    </div>
  );
}

// ─── PEER COMPARISON BAR ──────────────────────────────────────────────────────

function PeerBar({ label, actual, peer, unit = '', higherIsBad = true, tooltip }) {
  const maxVal = Math.max(actual, peer) * 1.3;
  const actualPct = (actual / maxVal) * 100;
  const peerPct = (peer / maxVal) * 100;
  const isAnomaly = higherIsBad ? actual > peer * 1.5 : actual < peer * 0.7;
  const color = isAnomaly ? '#DC2626' : '#185FA5';

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <div style={{ fontSize: 11, color: 'var(--color-text-2)', display: 'flex', alignItems: 'center', gap: 5 }}>
          {label}
          {tooltip && <InfoTooltip text={tooltip} position="right" width={220} />}
        </div>
        <div style={{ display: 'flex', gap: 8, fontSize: 11 }}>
          <span style={{ fontWeight: 700, color }}>{actual}{unit}</span>
          <span style={{ color: 'var(--color-text-3)' }}>vs {peer}{unit} peer avg</span>
          {isAnomaly && <span style={{ fontSize: 10, fontWeight: 700, color: '#DC2626' }}>↑ {Math.round((actual / peer - 1) * 100)}% above avg</span>}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--color-surface-2)', overflow: 'hidden', position: 'relative' }}>
          <div style={{ position: 'absolute', left: 0, width: `${peerPct}%`, height: '100%', background: '#185FA522', borderRadius: 3 }} />
          <div style={{ position: 'absolute', left: 0, width: `${actualPct}%`, height: '100%', background: color, borderRadius: 3, opacity: 0.85 }} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 3, fontSize: 9, color: 'var(--color-text-3)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><div style={{ width: 8, height: 3, background: color, borderRadius: 1 }} />This person</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><div style={{ width: 8, height: 3, background: '#185FA522', border: '1px solid #185FA544', borderRadius: 1 }} />Peer avg</span>
      </div>
    </div>
  );
}

// ─── STAFF DETAIL PANEL ───────────────────────────────────────────────────────

function StaffDetailPanel({ profile }) {
  const [activeTab, setActiveTab] = useState('profile');
  if (!profile) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-3)', fontSize: 13, padding: 40, textAlign: 'center' }}>
      <div>
        <User size={32} style={{ marginBottom: 12, opacity: 0.3 }} />
        <div>Select a staff member to see their full risk profile</div>
      </div>
    </div>
  );

  const isCritical = profile.risk_score >= 85;
  const bgColor = isCritical ? '#FEF0F0' : profile.risk_score >= 70 ? '#FFFBEB' : 'var(--color-surface)';
  const tabs = ['profile', 'activity', 'compliance', 'actions'];
  const tabLabels = { profile: 'Risk Profile', activity: 'Linked Activity', compliance: 'HR & Compliance', actions: 'Required Actions' };

  return (
    <div className="agent-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 600 }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', background: bgColor, borderBottom: '1px solid var(--color-border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: isCritical ? 'var(--color-red-light)' : `${COLOR}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <User size={20} style={{ color: isCritical ? 'var(--color-red)' : COLOR }} />
          </div>
          <div style={{ flex: 1 }}>
            <code style={{ fontSize: 15, fontWeight: 800, color: isCritical ? 'var(--color-red)' : 'var(--color-text)' }}>{profile.staff_id}</code>
            <div style={{ fontSize: 12, color: 'var(--color-text-2)', marginTop: 2 }}>{profile.role} · {profile.branch_name} ({profile.branch_code})</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {profile.risk_trend === 'Increasing' ? <TrendingUp size={14} style={{ color: 'var(--color-red)' }} /> :
             profile.risk_trend === 'Decreasing' ? <TrendingDown size={14} style={{ color: 'var(--color-green)' }} /> :
             <Minus size={14} style={{ color: 'var(--color-text-3)' }} />}
            <span style={{ fontSize: 10, color: profile.risk_trend === 'Increasing' ? 'var(--color-red)' : 'var(--color-text-3)' }}>{profile.risk_trend}</span>
          </div>
        </div>
        <RiskGauge score={profile.risk_score} />
        {profile.linked_exposure_lkr > 0 && (
          <div style={{ marginTop: 10, display: 'inline-flex', gap: 6, alignItems: 'center', padding: '4px 10px', background: 'rgba(0,0,0,0.06)', borderRadius: 7, fontSize: 12, fontWeight: 700, color: isCritical ? 'var(--color-red)' : '#854F0B' }}>
            <AlertTriangle size={12} />
            LKR {(profile.linked_exposure_lkr / 1e6).toFixed(0)}M linked exposure
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', flexShrink: 0 }}>
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{ flex: 1, padding: '10px 6px', fontSize: 11, fontWeight: activeTab === tab ? 600 : 400, color: activeTab === tab ? COLOR : 'var(--color-text-2)', background: activeTab === tab ? `${COLOR}08` : 'transparent', borderBottom: `2px solid ${activeTab === tab ? COLOR : 'transparent'}`, border: 'none', cursor: 'pointer', transition: 'all 0.12s' }}>
            {tabLabels[tab]}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <>
            <div style={{ padding: '12px 14px', background: `${COLOR}06`, border: `1px solid ${COLOR}20`, borderRadius: 10, fontSize: 13, color: 'var(--color-text)', lineHeight: 1.75 }}>
              {profile.finding}
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-text-3)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                Peer Comparison
                <InfoTooltip text="Each bar compares this person's behaviour against the network average for their role. Bars significantly beyond the peer line indicate statistical anomaly." position="right" width={260} />
              </div>
              <PeerBar label="Override count" actual={profile.override_count} peer={profile.peer_avg_overrides} higherIsBad tooltip="Total override approvals initiated by this staff member. Significantly above peer average indicates abnormal control environment." />
              <PeerBar label="Override concentration" actual={profile.override_concentration_pct} peer={Math.round(100 / 8)} unit="%" higherIsBad tooltip="Percentage of branch overrides this person is responsible for. In a healthy branch, overrides should be distributed across approvers." />
              <PeerBar label="Sessions analysed" actual={profile.sessions_analysed} peer={profile.peer_avg_sessions} higherIsBad={false} tooltip="Total authenticated sessions. High session counts alone are not anomalous — they're shown as context for the flag rate." />
              <PeerBar label="Flagged session rate" actual={profile.flagged_pct} peer={profile.peer_avg_flagged_pct} unit="%" higherIsBad tooltip="Percentage of this person's sessions that triggered a behavioral or access anomaly flag." />
              <PeerBar label="Off-hours approvals" actual={profile.off_hours_approvals} peer={2} higherIsBad tooltip="Approvals processed before 08:00 or after 18:00 on weekdays, or any time on weekends. Above 5 per month is anomalous." />
            </div>
            {profile.historical_alerts.length > 0 && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-text-3)', marginBottom: 8 }}>Historical Alerts</div>
                {profile.historical_alerts.map((a, i) => (
                  <div key={i} style={{ padding: '10px 14px', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 8, marginBottom: 6 }}>
                    {/* Audit Opinion Banner */}
            <div style={{ padding:'10px 16px', background:'#7C3AED08', border:`1px solid #7C3AED25`, borderRadius:10, display:'flex', gap:10, alignItems:'flex-start', marginBottom:0 }}>
              <div style={{ fontSize:10, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.08em', padding:'3px 9px', borderRadius:5, background:'#7C3AED', color:'white', flexShrink:0, marginTop:1 }}>
                ADVERSE
              </div>
              <div style={{ fontSize:12, color:'#7C3AED', lineHeight:1.65 }}>
                In our opinion, insider fraud prevention controls are NOT EFFECTIVE at Branch BR-14. STF-1847 scores 94/100 — the highest in the 2,462-staff network. All 6 insider fraud dimensions are confirmed simultaneously.
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                      <code style={{ fontSize: 11, color: 'var(--color-text-3)' }}>{a.alert_id}</code>
                      <span style={{ fontSize: 10, color: 'var(--color-text-2)' }}>{a.date}</span>
                      <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 6px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 4 }}>{a.type}</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-2)', marginBottom: 3 }}>{a.resolution}</div>
                    <div style={{ fontSize: 10, color: 'var(--color-text-3)', fontStyle: 'italic' }}>Outcome: {a.outcome}</div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ACTIVITY TAB */}
        {activeTab === 'activity' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
              {[
                { label: 'SoD Violations', value: profile.sod_violations, color: profile.sod_violations > 0 ? '#DC2626' : '#16A34A', tooltip: 'Transactions where this person was both initiator and approver. Any instance is a critical control failure under CBSL Direction No. 5/2024.' },
                { label: 'Same-cluster Approvals', value: profile.same_cluster_approvals, color: profile.same_cluster_approvals > 0 ? '#D97706' : '#16A34A', tooltip: 'Loans approved to borrowers sharing guarantor addresses or phone numbers — indicates coordinated fraudulent onboarding.' },
                { label: 'Off-hours Approvals', value: profile.off_hours_approvals, color: profile.off_hours_approvals > 5 ? '#D97706' : '#16A34A', tooltip: 'Approvals made outside business hours (before 08:00, after 18:00, or on weekends). High off-hours activity with no emergency justification is anomalous.' },
              ].map((m, i) => (
                <div key={i} style={{ padding: '12px', background: 'var(--color-surface)', border: `1px solid var(--color-border)`, borderRadius: 8, borderTop: `3px solid ${m.color}` }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
                    <div style={{ fontSize: 10, color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1.4 }}>{m.label}</div>
                    <InfoTooltip text={m.tooltip} position="top" width={230} />
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: m.color }}>{m.value}</div>
                </div>
              ))}
            </div>
            {profile.linked_loans.length > 0 && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-text-3)', marginBottom: 8 }}>Linked Loans</div>
                {profile.linked_loans.map((lid, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, padding: '9px 14px', background: 'var(--color-red-light)', border: '1px solid rgba(163,45,45,0.2)', borderRadius: 8, marginBottom: 6, alignItems: 'center' }}>
                    <AlertTriangle size={13} style={{ color: 'var(--color-red)', flexShrink: 0 }} />
                    <code style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-red)', flex: 1 }}>{lid}</code>
                    <span style={{ fontSize: 10, color: 'var(--color-red)' }}>Override-approved</span>
                  </div>
                ))}
              </div>
            )}
            {profile.linked_accounts.length > 0 && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-text-3)', marginBottom: 8 }}>Linked GL Accounts</div>
                {profile.linked_accounts.map((aid, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, padding: '9px 14px', background: 'var(--color-amber-light)', border: '1px solid rgba(133,79,11,0.2)', borderRadius: 8, marginBottom: 6, alignItems: 'center' }}>
                    <code style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-amber)', flex: 1 }}>{aid}</code>
                    <span style={{ fontSize: 10, color: 'var(--color-amber)' }}>Posting access</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* COMPLIANCE TAB */}
        {activeTab === 'compliance' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { label: 'Policy Violations', value: profile.policy_violations, bad: profile.policy_violations > 0 },
                { label: 'Conduct Breaches', value: profile.conduct_breaches, bad: profile.conduct_breaches > 0 },
                { label: 'Training Status', value: profile.training_overdue ? 'Overdue' : 'Current', bad: profile.training_overdue },
                { label: 'Leave Pattern', value: profile.leave_pattern.includes('Unusual') ? 'Unusual' : 'Normal', bad: profile.leave_pattern.includes('Unusual') },
              ].map((m, i) => (
                <div key={i} style={{ padding: '12px', background: m.bad ? 'var(--color-red-light)' : 'var(--color-surface-2)', border: `1px solid ${m.bad ? 'rgba(163,45,45,0.2)' : 'var(--color-border)'}`, borderRadius: 8 }}>
                  <div style={{ fontSize: 10, color: 'var(--color-text-3)', marginBottom: 4 }}>{m.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: m.bad ? 'var(--color-red)' : 'var(--color-text)' }}>{m.value}</div>
                </div>
              ))}
            </div>
            {profile.leave_pattern !== 'Normal' && (
              <InsightBox type="warning" title="Leave pattern anomaly" body={profile.leave_pattern} compact />
            )}
            <InsightBox
              type={profile.behavioural_change.includes('Significant') ? 'critical' : 'info'}
              title="Behavioural change signal"
              body={profile.behavioural_change}
              compact
            />
          </>
        )}

        {/* ACTIONS TAB */}
        {activeTab === 'actions' && (
          <>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-text-3)', marginBottom: 10 }}>Required Actions</div>
              {profile.required_actions.map((action, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 14px', marginBottom: 6, borderRadius: 8, border: `1px solid ${i === 0 && isCritical ? 'rgba(163,45,45,0.3)' : 'var(--color-border)'}`, background: i === 0 && isCritical ? 'var(--color-red-light)' : 'var(--color-surface-2)', alignItems: 'flex-start' }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, background: i === 0 && isCritical ? 'var(--color-red)' : `${COLOR}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: i === 0 && isCritical ? 'white' : COLOR, flexShrink: 0 }}>{i + 1}</div>
                  <span style={{ fontSize: 12, color: i === 0 && isCritical ? 'var(--color-red)' : 'var(--color-text)', lineHeight: 1.5, fontWeight: i === 0 ? 600 : 400 }}>{action}</span>
                </div>
              ))}
            </div>
            {/* Action buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
              {[
                { label: 'Restrict System Access', color: '#D97706', bg: '#FFFBEB' },
                { label: 'Escalate to HR & Legal', color: '#DC2626', bg: '#FEF0F0' },
                { label: 'Launch Investigation', color: COLOR, bg: `${COLOR}10` },
                { label: 'Schedule Interview', color: '#185FA5', bg: '#EBF4FF' },
              ].map(btn => (
                <button key={btn.label}
                  style={{ padding: '10px 14px', background: btn.bg, border: `1px solid ${btn.color}33`, borderRadius: 8, color: btn.color, fontSize: 11, fontWeight: 600, cursor: 'pointer', textAlign: 'center', transition: 'all 0.12s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = btn.color; e.currentTarget.style.color = 'white'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = btn.bg; e.currentTarget.style.color = btn.color; }}
                >
                  {btn.label}
                </button>
              ))}
            </div>
            <InsightBox type="regulatory" body="CBSL Direction No. 5/2024 requires that banks maintain documented evidence of action taken against staff involved in control breaches. All actions above should be logged in the Case Manager with timestamps." compact />
          </>
        )}
      </div>
    </div>
  );
}

// ─── STAFF RISK CARD (list row) ───────────────────────────────────────────────

function StaffRiskRow({ profile, isSelected, onClick }) {
  const color = profile.risk_score >= 85 ? '#DC2626' : profile.risk_score >= 70 ? '#D97706' : profile.risk_score >= 40 ? '#EF9F27' : '#16A34A';
  const TrendIcon = profile.risk_trend === 'Increasing' ? TrendingUp : profile.risk_trend === 'Decreasing' ? TrendingDown : Minus;
  return (
    <div onClick={onClick}
      style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-border)', cursor: 'pointer', background: isSelected ? `${COLOR}06` : 'transparent', transition: 'background 0.12s', borderLeft: isSelected ? `3px solid ${COLOR}` : '3px solid transparent' }}
      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--color-surface-2)'; }}
      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
    >
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        {/* Score badge */}
        <div style={{ width: 44, height: 44, borderRadius: 10, background: `${color}15`, border: `1.5px solid ${color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: 16, fontWeight: 900, color }}>{profile.risk_score}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 3 }}>
            <code style={{ fontSize: 13, fontWeight: 800 }}>{profile.staff_id}</code>
            <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 7px', background: `${color}18`, color, borderRadius: 4 }}>
              {profile.risk_score >= 85 ? 'Critical' : profile.risk_score >= 70 ? 'High' : 'Watch'}
            </span>
            <TrendIcon size={12} style={{ color, marginLeft: 'auto', flexShrink: 0 }} />
          </div>
          <div style={{ fontSize: 11, color: 'var(--color-text-2)', marginBottom: 5 }}>{profile.role} · {profile.branch_name}</div>
          {/* Mini dimension bars */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 3 }}>
            {[
              { label: 'SoD', val: profile.sod_violations, max: 5, bad: profile.sod_violations > 0 },
              { label: 'Overrides', val: Math.min(profile.override_concentration_pct, 100), max: 100, bad: profile.override_concentration_pct > 40 },
              { label: 'Off-hrs', val: profile.off_hours_approvals, max: 20, bad: profile.off_hours_approvals > 5 },
              { label: 'Sessions', val: profile.flagged_pct, max: 10, bad: profile.flagged_pct > 3 },
            ].map(dim => (
              <div key={dim.label}>
                <div style={{ fontSize: 8, color: 'var(--color-text-3)', marginBottom: 2 }}>{dim.label}</div>
                <div style={{ height: 4, borderRadius: 2, background: 'var(--color-surface-2)', overflow: 'hidden' }}>
                  <div style={{ width: `${(dim.val / dim.max) * 100}%`, height: '100%', background: dim.bad ? '#DC2626' : '#3B6D11', borderRadius: 2 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function InsiderRiskAgent() {
  const openFinding = useOpenFinding('insider');
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all' | 'critical' | 'high' | 'watch'

  return (
    <AgentModule agentId="insider" agentName="Insider Risk Agent" agentColor={COLOR} demoData={demoData.insiderRisk} schema={SCHEMA}>
      {(data) => {
        const filtered = (data.staff_profiles || []).filter(p => {
          if (filter === 'critical') return p.risk_score >= 85;
          if (filter === 'high') return p.risk_score >= 70;
          if (filter === 'watch') return p.risk_score >= 40;
          return true;
        });

        return (
          <>
            <ExplainerBox color={COLOR} icon="◎"
              title="How this agent detects insider fraud and credential misuse"
              summary="Analyses every transaction approval and access log across all 2,462 staff members. Detects the 6-dimension pattern of insider fraud: SoD violations, override concentration, off-hours activity, same-cluster approvals, approval turnaround anomaly, and session behavioural deviation."
              detail="No single dimension flags an insider. It is the simultaneous combination of multiple weak signals — each of which has an innocent explanation alone — that creates the definitive insider fraud signature. The agent scores each staff member 0–100 across all 6 dimensions and flags statistical outliers relative to their peer group and branch average."
              collapsible
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
              <StatCard label="Staff Analysed" value={data.summary.total_staff_analysed.toLocaleString()} sub="Across 90 NTB branches" color={COLOR} tooltip="All NTB staff members with system access to credit approval, payment initiation, or account management functions are included in the analysis." />
              <StatCard label="Flagged Staff" value={data.summary.flagged_staff} sub="Risk score > 40/100" color="#EF9F27" tooltip="Staff members whose combined 6-dimension score exceeds the 40/100 watch threshold. Score above 40 triggers enhanced monitoring; above 70 triggers investigation; above 85 triggers immediate action." />
              <StatCard label="Critical Risk" value={data.summary.critical_staff} sub="Score ≥ 85 — immediate action" color="#A32D2D" tooltip="Staff scoring above 85/100 — the critical band. These individuals match 5+ of the 6 insider fraud indicators simultaneously. Immediate suspension and forensic investigation required." alert="Immediate suspension required" />
              <StatCard label="Linked Exposure" value={`LKR ${(data.summary.suspicious_exposure_lkr / 1e6).toFixed(0)}M`} sub="Total value in flagged transactions" color="#A32D2D" tooltip="Total LKR value of transactions directly initiated, approved, or overridden by flagged staff members. This is not confirmed loss — it is the exposure envelope requiring forensic review." />
            </div>

            {(data.staff_profiles || []).some(p => p.risk_score >= 85) && (
              <InsightBox type="critical"
                title={`🚨 ${(data.staff_profiles || []).filter(p => p.risk_score >= 85).length} staff member${(data.staff_profiles || []).filter(p => p.risk_score >= 85).length > 1 ? 's' : ''} in critical risk band — immediate action required`}
                body="One or more staff members have been flagged across all 6 insider fraud dimensions simultaneously. The combined pattern is statistically anomalous and consistent with insider-enabled fraud. Standard monitoring protocols are insufficient — active investigation and access restriction required."
              />
            )}

            <div className="agent-panel">
              <div className="agent-panel-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className="agent-panel-title">Key Findings</span>
                  <InfoTooltip text="Systemic findings derived from collective analysis of all flagged staff. Click to open connected alerts and cross-agent signals." position="bottom" width={260} />
                </div>
              </div>
              <div className="agent-panel-body">
                {(data.key_findings || []).map((f, i) => <VisualFindingCard key={i} finding={f} agentColor={COLOR} index={i} agentId="insider" agentData={data} openFinding={openFinding} />)}
              </div>
            </div>

            {/* Staff list + detail panel */}
            <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 16, alignItems: 'start' }}>
              {/* LEFT — staff list */}
              <div className="agent-panel">
                <div className="agent-panel-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className="agent-panel-title">Flagged Staff</span>
                    <InfoTooltip text="All staff members with insider risk score above 40. Click any row to see their full 6-dimension risk profile, linked transactions, HR signals, and required actions." position="bottom" width={260} />
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[['all','All'],['critical','Critical'],['high','High'],['watch','Watch']].map(([v,l]) => (
                      <button key={v} onClick={() => setFilter(v)}
                        style={{ fontSize: 10, padding: '2px 8px', borderRadius: 5, border: filter===v ? `1px solid ${COLOR}44` : '1px solid var(--color-border)', background: filter===v ? `${COLOR}10` : 'transparent', color: filter===v ? COLOR : 'var(--color-text-3)', cursor: 'pointer', fontWeight: filter===v ? 600 : 400 }}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ maxHeight: 600, overflowY: 'auto' }}>
                  {filtered.map(profile => (
                    <StaffRiskRow key={profile.staff_id} profile={profile}
                      isSelected={selectedStaff?.staff_id === profile.staff_id}
                      onClick={() => setSelectedStaff(selectedStaff?.staff_id === profile.staff_id ? null : profile)}
                    />
                  ))}
                  {filtered.length === 0 && (
                    <div style={{ padding: 32, textAlign: 'center', color: 'var(--color-text-3)', fontSize: 12 }}>No staff matching this filter</div>
                  )}
                </div>
              </div>

              {/* RIGHT — staff detail */}
              <StaffDetailPanel profile={selectedStaff} />
            </div>
          </>
        );
      }}
      </AgentModule>
  );
}

import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { Clock, AlertTriangle, Plus, Shield, FileText, Zap } from 'lucide-react';
import InfoTooltip from '../../components/shared/InfoTooltip.jsx';
import { InsightBox } from '../../components/shared/VisualComponents.jsx';

const DEMO_CASES = [
  { id: 'CASE-001', title: 'BR-14 Insider-Enabled Loan Fraud — STF-1847', agentId: 'orchestrator', severity: 'critical', status: 'investigating', createdAt: '2025-12-20T23:54:00Z', exposureLkr: 387000000, slaHours: 4, description: 'Six agents independently flagged Branch BR-14. Insider Risk: STF-1847 scores 94/100. Controls: 4 SoD violations, 87% override concentration. Credit: 11 anomalous loans LKR 387Mn. KYC: 12.4% gap rate. Digital: off-hours access. MJE: 2 SoD-violating GL entries. Combined severity 0.98.', recommendedAction: 'Immediate suspension of STF-1847. Field audit team to BR-14 within 48 hours. Preserve all digital evidence. Notify CBSL if regulatory threshold met.', agents: ['controls', 'credit', 'kyc', 'digital', 'insider', 'mje'], owner: 'R. Wijeratne', ownerRole: 'Chief Internal Auditor', supervisor: 'S. Perera', supervisorRole: 'Head of Compliance', strStatus: 'under_assessment', strFiled: false, strDeadlineHours: 120, cbslNotified: false, fraudRegisterRef: 'FR-2025-0847', managementResponse: null,
    statusHistory: [
      { status: 'Open', timestamp: '2025-12-20T23:54:00Z', actor: 'SYSTEM', note: 'Auto-opened by Orchestrator. CORR-001 severity 0.98 exceeded case threshold.' },
      { status: 'Investigating', timestamp: '2025-12-20T23:58:00Z', actor: 'R. Wijeratne', note: 'Claimed by Chief Internal Auditor. Field team notified. STF-1847 HR notification initiated.' },
      { status: 'Investigating', timestamp: '2025-12-21T08:30:00Z', actor: 'R. Wijeratne', note: 'CCTV request submitted for BR-14. System access logs preserved by IT Risk.' },
    ],
    evidence: [
      { type: 'System Log', desc: 'STF-1847 access and approval logs 2025-10-01 to 2025-12-20', addedBy: 'IT Risk', addedAt: '2025-12-21T09:00:00Z', status: 'Obtained' },
      { type: 'Transaction Extract', desc: 'All loan disbursements approved by STF-1847 Q4 2025', addedBy: 'R. Wijeratne', addedAt: '2025-12-21T10:30:00Z', status: 'Obtained' },
      { type: 'CCTV Request', desc: 'BR-14 branch CCTV footage Nov-Dec 2025', addedBy: 'R. Wijeratne', addedAt: '2025-12-21T08:30:00Z', status: 'Pending' },
    ],
    remediationSteps: [
      { id: 'R1', action: 'Suspend STF-1847 system access and formal HR suspension', owner: 'Head of HR', dueDate: '2025-12-21', status: 'complete' },
      { id: 'R2', action: 'Freeze all new credit approvals at BR-14 pending investigation', owner: 'CRO', dueDate: '2025-12-21', status: 'complete' },
      { id: 'R3', action: 'Field audit team physical deployment to BR-14', owner: 'R. Wijeratne', dueDate: '2025-12-22', status: 'in_progress' },
      { id: 'R4', action: 'Review and restage all 11 anomalous loans — ECL recalculation', owner: 'Head of Credit Risk', dueDate: '2025-12-30', status: 'pending' },
      { id: 'R5', action: 'File STR with CBSL FIU — 5 working day deadline', owner: 'MLCO', dueDate: '2025-12-27', status: 'pending' },
    ],
  },
  { id: 'CASE-002', title: 'SUS-017 CEFT Phantom Receivable — LKR 1.24 Bn', agentId: 'orchestrator', severity: 'critical', status: 'open', createdAt: '2025-12-20T23:54:00Z', exposureLkr: 1240000000, slaHours: 4, description: 'SUS-017 (Pettah Main Street): 312% balance growth in 30 days, clearing ratio 0.08, 94 days unreconciled. 15 structured CEFT transfers below LKR 5M. CBSL 90-day guideline breached. STR eligible.', recommendedAction: 'Immediate freeze of SUS-017. File STR with CBSL FIU within 24 hours. Forensic investigation.', agents: ['suspense', 'transaction', 'digital'], owner: 'MLCO', ownerRole: 'Money Laundering Compliance Officer', supervisor: 'S. Perera', supervisorRole: 'Head of Compliance', strStatus: 'eligible', strFiled: false, strDeadlineHours: 72, cbslNotified: false, fraudRegisterRef: 'FR-2025-0848', managementResponse: null,
    statusHistory: [{ status: 'Open', timestamp: '2025-12-20T23:54:00Z', actor: 'SYSTEM', note: 'SUS-017 auto-frozen. CBSL 90-day breach confirmed. STR eligibility threshold met.' }],
    evidence: [],
    remediationSteps: [
      { id: 'R1', action: 'Freeze SUS-017 account', owner: 'Treasury Ops', dueDate: '2025-12-21', status: 'complete' },
      { id: 'R2', action: 'File STR with CBSL FIU', owner: 'MLCO', dueDate: '2025-12-24', status: 'pending' },
      { id: 'R3', action: 'CEFT switch forensic analysis', owner: 'Digital Forensics', dueDate: '2025-12-28', status: 'pending' },
    ],
  },
  { id: 'CASE-003', title: 'NTB-CORP-0887 Trade-Based Money Laundering', agentId: 'orchestrator', severity: 'critical', status: 'investigating', createdAt: '2025-12-19T14:30:00Z', exposureLkr: 421000000, slaHours: 24, description: 'NTB-CORP-0887: 91% over-invoicing HS 6203, duplicate LC applications, CEFT structuring. Beneficial ownership not disclosed. TBML exposure LKR 421 Mn.', recommendedAction: 'Suspend all facilities for NTB-CORP-0887. File TBML STR. Forensic review 24 months trade documents.', agents: ['trade', 'transaction', 'kyc'], owner: 'Trade Compliance Officer', ownerRole: 'Trade Finance Compliance', supervisor: 'S. Perera', supervisorRole: 'Head of Compliance', strStatus: 'under_assessment', strFiled: false, strDeadlineHours: 96, cbslNotified: false, fraudRegisterRef: 'FR-2025-0849', managementResponse: 'Agree — corporate banking relationship suspended pending investigation.',
    statusHistory: [
      { status: 'Open', timestamp: '2025-12-19T14:30:00Z', actor: 'SYSTEM', note: 'Trade Finance Agent triggered TBML alert. Three-agent correlation severity 0.94.' },
      { status: 'Investigating', timestamp: '2025-12-19T16:00:00Z', actor: 'Trade Compliance Officer', note: 'Facilities suspended. Document forensic review initiated.' },
    ],
    evidence: [
      { type: 'Document', desc: '24-month LC and invoice file for NTB-CORP-0887', addedBy: 'Trade Ops', addedAt: '2025-12-19T17:00:00Z', status: 'Obtained' },
      { type: 'External Comms', desc: 'UN COMTRADE benchmark HS 6203 FY2025', addedBy: 'Trade Compliance', addedAt: '2025-12-19T18:00:00Z', status: 'Obtained' },
    ],
    remediationSteps: [
      { id: 'R1', action: 'Suspend all credit facilities for NTB-CORP-0887', owner: 'Corporate Banking Head', dueDate: '2025-12-20', status: 'complete' },
      { id: 'R2', action: 'Beneficial ownership disclosure demand', owner: 'KYC Team', dueDate: '2025-12-26', status: 'in_progress' },
      { id: 'R3', action: 'File TBML STR with CBSL FIU', owner: 'MLCO', dueDate: '2025-12-26', status: 'pending' },
    ],
  },
  { id: 'CASE-004', title: 'NTB-0841-X Structuring — 15 CEFT Transfers', agentId: 'transaction', severity: 'high', status: 'open', createdAt: '2025-12-20T23:47:00Z', exposureLkr: 71250000, slaHours: 24, description: '15 CEFT transfers in 22 minutes, amounts LKR 4.6M-4.95M. Structuring score 0.94. Combined LKR 71.25M. Round-trip detected.', recommendedAction: 'Suspend NTB-0841-X. File STR within 5 working days. Freeze assets.', agents: ['transaction'], owner: 'Fraud Investigation Team', ownerRole: 'AML Analyst', supervisor: 'MLCO', supervisorRole: 'MLCO', strStatus: 'eligible', strFiled: false, strDeadlineHours: 96, cbslNotified: false, fraudRegisterRef: 'FR-2025-0850', managementResponse: null,
    statusHistory: [{ status: 'Open', timestamp: '2025-12-20T23:47:00Z', actor: 'SYSTEM', note: 'Structuring score 0.94. STR eligibility confirmed.' }],
    evidence: [],
    remediationSteps: [
      { id: 'R1', action: 'Suspend NTB-0841-X account', owner: 'Retail Banking Ops', dueDate: '2025-12-21', status: 'pending' },
      { id: 'R2', action: 'File STR with CBSL FIU', owner: 'MLCO', dueDate: '2025-12-27', status: 'pending' },
    ],
  },
  { id: 'CASE-005', title: 'KYC Gap Remediation — 39,290 Accounts', agentId: 'kyc', severity: 'high', status: 'open', createdAt: '2025-12-18T09:00:00Z', exposureLkr: 0, slaHours: 168, description: 'KYC gap rate 4.7% across 835,944 accounts. 847 HSBC migration gaps. 2 accounts require STR assessment. Exceeds CBSL 2% threshold.', recommendedAction: 'Deploy KYC remediation team. Prioritize PEP accounts. 90-day programme.', agents: ['kyc'], owner: 'Head of KYC Operations', ownerRole: 'KYC Operations', supervisor: 'MLCO', supervisorRole: 'MLCO', strStatus: 'not_required', strFiled: false, strDeadlineHours: null, cbslNotified: true, fraudRegisterRef: null, managementResponse: 'Agree — 90-day programme approved. 12 analysts assigned.',
    statusHistory: [{ status: 'Open', timestamp: '2025-12-18T09:00:00Z', actor: 'SYSTEM', note: 'Monthly KYC gap refresh. 4.7% rate exceeds CBSL threshold.' }],
    evidence: [{ type: 'Document', desc: 'Full KYC gap register — 39,290 accounts', addedBy: 'KYC System', addedAt: '2025-12-18T09:00:00Z', status: 'Obtained' }],
    remediationSteps: [
      { id: 'R1', action: 'Remediate 34 PEP accounts — EDD completion', owner: 'Senior KYC Analyst', dueDate: '2025-12-31', status: 'in_progress' },
      { id: 'R2', action: 'Resolve 847 HSBC migration gaps', owner: 'HSBC Integration PMO', dueDate: '2026-03-31', status: 'pending' },
      { id: 'R3', action: 'Remediate remaining 38,409 standard gaps', owner: 'Head of KYC Operations', dueDate: '2026-03-18', status: 'pending' },
    ],
  },
  { id: 'CASE-006', title: 'LCR Decline — ALCO Stabilisation Required', agentId: 'trade', severity: 'medium', status: 'resolved', createdAt: '2025-12-15T11:00:00Z', exposureLkr: 0, slaHours: 168, description: 'LCR declined 320.6% to 203.4% in FY2025. NSFR also declining. Amber threshold 200% approaching Q1 2026.', recommendedAction: 'ALCO stabilisation plan. Term deposit campaign and REPO facility.', agents: ['trade'], owner: 'CFO Office', ownerRole: 'Chief Financial Officer', supervisor: 'CRO', supervisorRole: 'CRO', strStatus: 'not_required', strFiled: false, strDeadlineHours: null, cbslNotified: false, fraudRegisterRef: null, managementResponse: 'Agree — ALCO approved LCR stabilisation plan 2025-12-18.',
    statusHistory: [
      { status: 'Open', timestamp: '2025-12-15T11:00:00Z', actor: 'SYSTEM', note: 'LCR declining trend flagged.' },
      { status: 'Resolved', timestamp: '2025-12-18T17:00:00Z', actor: 'CFO Office', note: 'ALCO approved stabilisation plan. Ref: ALCO-2025-DEC-002.' },
    ],
    evidence: [
      { type: 'Document', desc: 'ALCO Minutes 2025-12-18 ref. ALCO-2025-DEC-002', addedBy: 'CFO Office', addedAt: '2025-12-18T17:00:00Z', status: 'Obtained' },
      { type: 'Document', desc: 'LCR Stabilisation Plan Q1 2026', addedBy: 'Treasury', addedAt: '2025-12-19T09:00:00Z', status: 'Obtained' },
    ],
    remediationSteps: [
      { id: 'R1', action: 'Term deposit special rate campaign', owner: 'Retail Banking Head', dueDate: '2025-12-22', status: 'complete' },
      { id: 'R2', action: 'Access REPO facility LKR 10Bn', owner: 'Treasury Head', dueDate: '2025-12-23', status: 'complete' },
      { id: 'R3', action: 'Cap Q1 2026 loan growth at 35% YoY', owner: 'CRO', dueDate: '2025-12-31', status: 'complete' },
    ],
  },
];

const COLS = ['open', 'investigating', 'resolved', 'closed'];
const COL_LABELS = { open: 'Open', investigating: 'Investigating', resolved: 'Resolved', closed: 'Closed' };
const COL_COLORS = { open: '#DC2626', investigating: '#D97706', resolved: '#16A34A', closed: '#9ca3af' };
const STR_MAP = {
  eligible: { label: 'STR Eligible — filing required', color: '#DC2626', bg: '#FEF0F0' },
  under_assessment: { label: 'STR Under Assessment', color: '#D97706', bg: '#FFFBEB' },
  not_required: { label: 'STR Not Required', color: '#16A34A', bg: '#F0FDF4' },
  filed: { label: 'STR Filed', color: '#16A34A', bg: '#F0FDF4' },
};
const REM_C = { complete: '#16A34A', in_progress: '#D97706', pending: '#9ca3af' };
const REM_L = { complete: 'Complete', in_progress: 'In Progress', pending: 'Pending' };
const EV_TYPES = ['Transaction Extract', 'System Log', 'Document', 'Statement', 'CCTV Request', 'External Comms', 'Forensic Report'];

function fmt(iso) { return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }

function getSla(c, status) {
  if (['resolved','closed'].includes(status)) return { pct: 100, color: '#16A34A', label: 'Closed', breached: false };
  const elapsed = (Date.now() - new Date(c.createdAt).getTime()) / 3600000;
  const pct = Math.min(100, Math.round((elapsed / c.slaHours) * 100));
  const breached = pct >= 100;
  return { pct, color: breached ? '#DC2626' : pct >= 75 ? '#D97706' : '#16A34A', label: breached ? `BREACHED (+${Math.round(elapsed - c.slaHours)}h)` : `${Math.round(elapsed)}h / ${c.slaHours}h`, breached };
}

function CaseDetail({ c, status, onStatusChange }) {
  const [tab, setTab] = useState('overview');
  const [noteText, setNoteText] = useState('');
  const [localNotes, setLocalNotes] = useState([]);
  const [localEv, setLocalEv] = useState([]);
  const [localSteps, setLocalSteps] = useState({});
  const [mgmt, setMgmt] = useState(c.managementResponse || '');
  const [showEvForm, setShowEvForm] = useState(false);
  const [evForm, setEvForm] = useState({ type: 'Document', desc: '' });

  const sla = getSla(c, status);
  const sc = c.severity === 'critical' ? '#DC2626' : c.severity === 'high' ? '#D97706' : '#185FA5';
  const strInfo = STR_MAP[c.strStatus] || STR_MAP.not_required;
  const allSteps = c.remediationSteps.map(s => ({ ...s, status: localSteps[s.id] || s.status }));
  const doneSteps = allSteps.filter(s => s.status === 'complete').length;
  const allEv = [...c.evidence, ...localEv];
  const allHist = [...c.statusHistory, ...localNotes.map(n => ({ ...n, status: 'Note' }))].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  const canResolve = doneSteps === allSteps.length && allEv.length > 0 && !!mgmt;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'log', label: 'Investigation Log' },
    { id: 'evidence', label: `Evidence (${allEv.length})` },
    { id: 'str', label: 'STR / Regulatory' },
    { id: 'rem', label: `Remediation (${doneSteps}/${allSteps.length})` },
  ];

  return (
    <div className="agent-panel animate-slide-in" style={{ display: 'flex', flexDirection: 'column', maxHeight: '92vh', position: 'sticky', top: 0 }}>
      <div style={{ padding: '14px 18px', background: c.severity === 'critical' ? '#FEF0F0' : c.severity === 'high' ? '#FFFBEB' : 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 7, alignItems: 'center', marginBottom: 7, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '2px 8px', borderRadius: 20, background: sc, color: 'white' }}>{c.severity}</span>
          <code style={{ fontSize: 10, color: 'var(--color-text-3)' }}>{c.id}</code>
          {sla.breached && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', background: '#FEF0F0', color: '#DC2626', borderRadius: 4, border: '1px solid rgba(220,38,38,0.3)' }}>SLA BREACHED</span>}
          {c.strStatus === 'eligible' && !c.strFiled && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', background: '#FEF0F0', color: '#DC2626', borderRadius: 4, border: '1px solid rgba(220,38,38,0.3)' }}>STR REQUIRED</span>}
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.4, marginBottom: 8 }}>{c.title}</div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3, fontSize: 10 }}>
            <span style={{ color: 'var(--color-text-3)' }}>SLA: {c.slaHours}h</span>
            <span style={{ fontWeight: 700, color: sla.color }}>{sla.label}</span>
          </div>
          <div style={{ height: 4, borderRadius: 2, background: 'rgba(0,0,0,0.08)', overflow: 'hidden' }}>
            <div style={{ width: `${sla.pct}%`, height: '100%', background: sla.color, borderRadius: 2 }} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 7, fontSize: 11, color: 'var(--color-text-2)', flexWrap: 'wrap' }}>
          <span>Owner: <strong>{c.owner}</strong> · {c.ownerRole}</span>
          <span>Supervisor: <strong>{c.supervisor}</strong></span>
        </div>
      </div>

      <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', flexShrink: 0, overflowX: 'auto' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ padding: '8px 10px', fontSize: 11, fontWeight: tab === t.id ? 600 : 400, color: tab === t.id ? sc : 'var(--color-text-2)', background: tab === t.id ? `${sc}08` : 'transparent', borderBottom: `2px solid ${tab === t.id ? sc : 'transparent'}`, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.12s' }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {tab === 'overview' && (<>
          {c.exposureLkr > 0 && <div style={{ display: 'flex', gap: 6, alignItems: 'center', padding: '9px 12px', background: '#FEF0F0', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 8, fontSize: 13, fontWeight: 700, color: '#DC2626' }}><AlertTriangle size={14} /> LKR {(c.exposureLkr / 1e9).toFixed(2)} Bn exposure</div>}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-text-3)', marginBottom: 5 }}>Finding summary</div>
            <div style={{ fontSize: 12, color: 'var(--color-text)', lineHeight: 1.7, padding: '10px 12px', background: 'var(--color-surface-2)', borderRadius: 8 }}>{c.description}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-text-3)', marginBottom: 5 }}>Recommended action</div>
            <div style={{ fontSize: 12, color: 'var(--color-text)', lineHeight: 1.7, padding: '10px 12px', background: 'var(--color-surface-2)', borderLeft: `3px solid ${sc}`, borderRadius: 8, display: 'flex', gap: 7 }}><Zap size={13} style={{ color: sc, flexShrink: 0, marginTop: 2 }} />{c.recommendedAction}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-text-3)', marginBottom: 5 }}>Agents involved</div>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>{(c.agents || []).map(a => <span key={a} style={{ fontSize: 11, padding: '3px 10px', background: 'var(--color-purple-light)', color: 'var(--color-purple)', borderRadius: 20, fontWeight: 600 }}>{a}</span>)}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-text-3)', marginBottom: 5, display: 'flex', alignItems: 'center', gap: 5 }}>
              Management response <InfoTooltip text="Required before this case can be resolved. Management must formally acknowledge the finding and commit to remediation." position="right" width={250} />
            </div>
            {mgmt ? <div style={{ fontSize: 12, color: 'var(--color-text)', lineHeight: 1.7, padding: '10px 12px', background: '#F0FDF4', border: '1px solid rgba(22,163,74,0.2)', borderRadius: 8 }}>Acknowledged: {mgmt}</div>
              : <textarea value={mgmt} onChange={e => setMgmt(e.target.value)} placeholder="Enter management response to this finding..." style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--color-border)', fontSize: 12, lineHeight: 1.6, resize: 'vertical', minHeight: 68, fontFamily: 'inherit', background: 'var(--color-surface)', boxSizing: 'border-box' }} />}
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-text-3)', marginBottom: 7 }}>Update status</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {COLS.map(col => {
                const ok = col === 'resolved' ? canResolve : true;
                return <button key={col} onClick={() => ok && onStatusChange(col)} disabled={!ok} title={col === 'resolved' && !canResolve ? 'Complete all remediation + add evidence + management response' : ''} style={{ padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: status === col ? 700 : 400, cursor: ok ? 'pointer' : 'not-allowed', background: status === col ? COL_COLORS[col] : 'var(--color-surface-2)', color: status === col ? 'white' : ok ? 'var(--color-text-2)' : 'var(--color-text-3)', border: `1px solid ${status === col ? COL_COLORS[col] : 'var(--color-border)'}`, opacity: ok ? 1 : 0.5 }}>{COL_LABELS[col]}</button>;
              })}
            </div>
            {!canResolve && !['resolved','closed'].includes(status) && <div style={{ fontSize: 11, color: 'var(--color-text-3)', marginTop: 5 }}>To resolve: {doneSteps}/{allSteps.length} steps complete · {allEv.length > 0 ? '✓' : '✗'} evidence · {mgmt ? '✓' : '✗'} management response</div>}
          </div>
        </>)}

        {tab === 'log' && (<>
          {allHist.map((entry, i) => (
            <div key={i} style={{ display: 'flex', gap: 10 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: `${sc}18`, border: `1.5px solid ${sc}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: sc, flexShrink: 0 }}>●</div>
                {i < allHist.length - 1 && <div style={{ width: 1.5, flex: 1, background: 'var(--color-border)', minHeight: 10 }} />}
              </div>
              <div style={{ paddingBottom: 12, paddingTop: 2, flex: 1 }}>
                <div style={{ display: 'flex', gap: 7, alignItems: 'center', marginBottom: 3, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, fontWeight: 700 }}>{entry.status}</span>
                  <span style={{ fontSize: 10, color: 'var(--color-text-3)' }}>{fmt(entry.timestamp)}</span>
                  <span style={{ fontSize: 10, padding: '1px 5px', background: 'var(--color-surface-2)', color: 'var(--color-text-2)', borderRadius: 4 }}>{entry.actor}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-text-2)', lineHeight: 1.6 }}>{entry.note}</div>
              </div>
            </div>
          ))}
          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 12 }}>
            <textarea value={noteText} onChange={e => setNoteText(e.target.value)} placeholder="Add investigation note..." style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--color-border)', fontSize: 12, lineHeight: 1.6, resize: 'vertical', minHeight: 60, fontFamily: 'inherit', background: 'var(--color-surface)', boxSizing: 'border-box' }} />
            <button onClick={() => { if (noteText.trim()) { setLocalNotes(n => [...n, { note: noteText, actor: 'You', timestamp: new Date().toISOString() }]); setNoteText(''); }}} disabled={!noteText.trim()} style={{ marginTop: 6, padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: noteText.trim() ? sc : 'var(--color-surface-2)', color: noteText.trim() ? 'white' : 'var(--color-text-3)', border: 'none', cursor: noteText.trim() ? 'pointer' : 'not-allowed' }}>Add note</button>
          </div>
        </>)}

        {tab === 'evidence' && (<>
          <InsightBox type="info" body="Evidence items create the legally defensible investigation record. At least one item must be added before this case can be resolved." compact />
          {allEv.length === 0 && <div style={{ textAlign: 'center', padding: '20px 16px', color: 'var(--color-text-3)', fontSize: 12 }}>No evidence items yet. Add at least one before resolving.</div>}
          {allEv.map((ev, i) => <div key={i} style={{ padding: '10px 12px', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 8, display: 'flex', gap: 10 }}><FileText size={15} style={{ color: sc, flexShrink: 0, marginTop: 2 }} /><div style={{ flex: 1 }}><div style={{ fontSize: 11, fontWeight: 600, color: sc, marginBottom: 2 }}>{ev.type}</div><div style={{ fontSize: 12, color: 'var(--color-text)', marginBottom: 3 }}>{ev.desc}</div><div style={{ fontSize: 10, color: 'var(--color-text-3)' }}>Added by {ev.addedBy} · {fmt(ev.addedAt)}</div></div><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', background: ev.status === 'Obtained' ? '#F0FDF4' : '#FFFBEB', color: ev.status === 'Obtained' ? '#16A34A' : '#D97706', borderRadius: 4, alignSelf: 'flex-start' }}>{ev.status}</span></div>)}
          {showEvForm ? (
            <div style={{ padding: '12px', background: 'var(--color-surface-2)', border: '1px dashed var(--color-border)', borderRadius: 8 }}>
              <select value={evForm.type} onChange={e => setEvForm(f => ({ ...f, type: e.target.value }))} style={{ width: '100%', marginBottom: 7, padding: '6px 10px', borderRadius: 6, border: '1px solid var(--color-border)', fontSize: 12, background: 'var(--color-surface)', fontFamily: 'inherit' }}>{EV_TYPES.map(t => <option key={t}>{t}</option>)}</select>
              <input value={evForm.desc} onChange={e => setEvForm(f => ({ ...f, desc: e.target.value }))} placeholder="Describe this evidence item..." style={{ width: '100%', marginBottom: 7, padding: '6px 10px', borderRadius: 6, border: '1px solid var(--color-border)', fontSize: 12, background: 'var(--color-surface)', fontFamily: 'inherit', boxSizing: 'border-box' }} />
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => { if (evForm.desc.trim()) { setLocalEv(e => [...e, { ...evForm, addedBy: 'You', addedAt: new Date().toISOString(), status: 'Obtained' }]); setEvForm({ type: 'Document', desc: '' }); setShowEvForm(false); }}} style={{ flex: 1, padding: '5px', borderRadius: 6, fontSize: 12, fontWeight: 600, background: sc, color: 'white', border: 'none', cursor: 'pointer' }}>Add</button>
                <button onClick={() => setShowEvForm(false)} style={{ flex: 1, padding: '5px', borderRadius: 6, fontSize: 12, background: 'var(--color-surface)', border: '1px solid var(--color-border)', cursor: 'pointer', color: 'var(--color-text-2)' }}>Cancel</button>
              </div>
            </div>
          ) : <button onClick={() => setShowEvForm(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: 'var(--color-surface-2)', border: '1px dashed var(--color-border)', color: 'var(--color-text-2)', cursor: 'pointer' }}><Plus size={12} /> Add evidence item</button>}
        </>)}

        {tab === 'str' && (<>
          <div style={{ padding: '12px 14px', background: strInfo.bg, border: `1px solid ${strInfo.color}30`, borderRadius: 10 }}>
            <div style={{ display: 'flex', gap: 7, alignItems: 'center', marginBottom: 6 }}><Shield size={13} style={{ color: strInfo.color }} /><span style={{ fontSize: 13, fontWeight: 700, color: strInfo.color }}>{strInfo.label}</span><InfoTooltip text="Under FTRA, banks must file an STR with CBSL FIU within 5 working days of identifying suspicious activity. Criminal penalties apply for non-filing." position="right" width={280} /></div>
            {c.strStatus === 'eligible' && !c.strFiled && <><div style={{ fontSize: 12, color: strInfo.color, marginBottom: 8 }}>FTRA deadline: 5 working days from case creation.</div><button style={{ padding: '7px 14px', background: '#DC2626', color: 'white', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Initiate STR Filing</button></>}
          </div>
          {[{ label: 'CBSL Notification', value: c.cbslNotified ? 'Filed' : 'Not filed', color: c.cbslNotified ? '#16A34A' : '#DC2626', tooltip: 'Material fraud requires CBSL notification under the Banking Act.' }, { label: 'Fraud Register Ref', value: c.fraudRegisterRef || '— Not assigned', color: c.fraudRegisterRef ? 'var(--color-text)' : 'var(--color-text-3)', tooltip: 'Confirmed fraud must be recorded in the fraud register and reported to CBSL quarterly.' }, { label: 'STR Filed', value: c.strFiled ? 'Yes' : 'Not yet filed', color: c.strFiled ? '#16A34A' : c.strStatus === 'eligible' ? '#DC2626' : 'var(--color-text-3)' }].map((f, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 12px', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: 'var(--color-text-2)', display: 'flex', alignItems: 'center', gap: 5 }}>{f.label}{f.tooltip && <InfoTooltip text={f.tooltip} position="right" width={250} />}</div>
              <span style={{ fontSize: 12, fontWeight: 700, color: f.color }}>{f.value}</span>
            </div>
          ))}
        </>)}

        {tab === 'rem' && (<>
          <div style={{ fontSize: 12, color: 'var(--color-text-2)', display: 'flex', gap: 6, alignItems: 'center' }}><InfoTooltip text="All steps must be Complete before the case can be resolved." position="right" width={250} />{doneSteps} of {allSteps.length} steps complete {doneSteps === allSteps.length ? '— eligible for resolution' : ''}</div>
          <div style={{ height: 6, borderRadius: 3, background: 'var(--color-surface-2)', overflow: 'hidden' }}><div style={{ width: `${(doneSteps / allSteps.length) * 100}%`, height: '100%', background: doneSteps === allSteps.length ? '#16A34A' : sc, borderRadius: 3, transition: 'width 0.5s ease' }} /></div>
          {allSteps.map((step, i) => {
            const rc = REM_C[step.status];
            return <div key={step.id} style={{ padding: '10px 12px', background: 'var(--color-surface-2)', border: `1px solid ${step.status === 'complete' ? 'rgba(22,163,74,0.2)' : 'var(--color-border)'}`, borderRadius: 8 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: `${rc}15`, border: `1.5px solid ${rc}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: rc, flexShrink: 0 }}>{step.status === 'complete' ? '' : i + 1}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: 'var(--color-text)', lineHeight: 1.5, textDecoration: step.status === 'complete' ? 'line-through' : 'none', opacity: step.status === 'complete' ? 0.6 : 1 }}>{step.action}</div>
                  <div style={{ fontSize: 10, color: 'var(--color-text-3)', marginTop: 3 }}>Owner: {step.owner} · Due: {step.dueDate}</div>
                </div>
                <select value={localSteps[step.id] || step.status} onChange={e => setLocalSteps(s => ({ ...s, [step.id]: e.target.value }))} style={{ padding: '3px 7px', borderRadius: 6, border: `1px solid ${rc}44`, fontSize: 11, fontWeight: 600, color: rc, background: `${rc}10`, cursor: 'pointer', fontFamily: 'inherit' }}>{Object.keys(REM_C).map(s => <option key={s} value={s}>{REM_L[s]}</option>)}</select>
              </div>
            </div>;
          })}
        </>)}
      </div>
    </div>
  );
}

export default function CaseManager() {
  const { state } = useApp();
  const allCases = useMemo(() => [...DEMO_CASES, ...state.cases], [state.cases]);
  const [selected, setSelected] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [localStatuses, setLocalStatuses] = useState({});

  function getStatus(c) { return localStatuses[c.id] || c.status; }
  function setStatus(id, st) { setLocalStatuses(s => ({ ...s, [id]: st })); }

  const filtered = allCases.filter(c => statusFilter === 'all' || getStatus(c) === statusFilter);
  const openCritical = allCases.filter(c => getStatus(c) === 'open' && c.severity === 'critical').length;
  const strPending = allCases.filter(c => c.strStatus === 'eligible' && !c.strFiled).length;
  const slaBreached = allCases.filter(c => getSla(c, getStatus(c)).breached && !['resolved','closed'].includes(getStatus(c))).length;

  return (
    <div style={{ maxWidth: 1440 }}>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 14 }}>
        <h2 style={{ flex: 1 }}>Case Manager</h2>
        <div style={{ display: 'flex', gap: 6 }}>
          {['all', ...COLS].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className="btn btn-sm" style={{ background: statusFilter === s ? 'var(--color-text)' : 'var(--color-surface)', color: statusFilter === s ? 'white' : 'var(--color-text-2)', border: '1px solid var(--color-border)' }}>
              {s === 'all' ? 'All' : COL_LABELS[s]}
              <span style={{ fontSize: 10, marginLeft: 4, padding: '0 5px', background: statusFilter === s ? 'rgba(255,255,255,0.2)' : 'var(--color-surface-2)', borderRadius: 8 }}>{s === 'all' ? allCases.length : allCases.filter(c => getStatus(c) === s).length}</span>
            </button>
          ))}
        </div>
      </div>
      {(openCritical > 0 || strPending > 0 || slaBreached > 0) && (
        <div style={{ display: 'flex', gap: 9, marginBottom: 14, flexWrap: 'wrap' }}>
          {openCritical > 0 && <div style={{ display: 'flex', gap: 5, alignItems: 'center', padding: '6px 11px', background: '#FEF0F0', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 8, fontSize: 12, fontWeight: 700, color: '#DC2626' }}><AlertTriangle size={12} />{openCritical} critical open</div>}
          {strPending > 0 && <div style={{ display: 'flex', gap: 5, alignItems: 'center', padding: '6px 11px', background: '#FEF0F0', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 8, fontSize: 12, fontWeight: 700, color: '#DC2626' }}><Shield size={12} />{strPending} STR required</div>}
          {slaBreached > 0 && <div style={{ display: 'flex', gap: 5, alignItems: 'center', padding: '6px 11px', background: '#FFFBEB', border: '1px solid rgba(217,119,6,0.3)', borderRadius: 8, fontSize: 12, fontWeight: 700, color: '#D97706' }}><Clock size={12} />{slaBreached} SLA breach{slaBreached > 1 ? 'es' : ''}</div>}
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 460px' : '1fr', gap: 18 }}>
        <div className="kanban">
          {COLS.map(col => {
            const colCases = filtered.filter(c => getStatus(c) === col);
            return (
              <div key={col} className="kanban-col">
                <div className="kanban-col-header"><span style={{ color: COL_COLORS[col] }}>{COL_LABELS[col]}</span><span className="kanban-count">{colCases.length}</span></div>
                {colCases.map(c => {
                  const sla = getSla(c, getStatus(c));
                  const sc = c.severity === 'critical' ? '#DC2626' : c.severity === 'high' ? '#D97706' : '#185FA5';
                  return (
                    <div key={c.id} className="case-card" onClick={() => setSelected(selected?.id === c.id ? null : c)} style={{ borderLeft: `3px solid ${sc}`, background: selected?.id === c.id ? '#EBF4FF' : 'var(--color-surface)', cursor: 'pointer' }}>
                      <div style={{ display: 'flex', gap: 5, marginBottom: 5, alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 5px', borderRadius: 3, background: sc, color: 'white', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{c.severity}</span>
                        <code style={{ fontSize: 10, color: 'var(--color-text-3)' }}>{c.id}</code>
                        {c.strStatus === 'eligible' && !c.strFiled && <span style={{ marginLeft: 'auto', fontSize: 9, fontWeight: 700, padding: '1px 5px', background: '#FEF0F0', color: '#DC2626', borderRadius: 3 }}>STR</span>}
                        {sla.breached && <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 5px', background: '#FFFBEB', color: '#D97706', borderRadius: 3 }}>SLA</span>}
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.4, marginBottom: 5 }}>{c.title}</div>
                      {c.exposureLkr > 0 && <div style={{ fontSize: 11, fontWeight: 600, color: '#DC2626', marginBottom: 4 }}>LKR {(c.exposureLkr / 1e6).toFixed(0)}M</div>}
                      <div style={{ height: 3, borderRadius: 2, background: 'var(--color-surface-2)', overflow: 'hidden', marginBottom: 4 }}><div style={{ width: `${sla.pct}%`, height: '100%', background: sla.color, borderRadius: 2 }} /></div>
                      <div style={{ fontSize: 10, color: sla.color, fontWeight: sla.breached ? 700 : 400, marginBottom: 6 }}>{sla.label}</div>
                      <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>{(c.agents || []).slice(0, 5).map(a => <span key={a} style={{ fontSize: 9, padding: '1px 4px', background: 'var(--color-surface-2)', borderRadius: 3, color: 'var(--color-text-2)' }}>{a}</span>)}</div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
        {selected && <CaseDetail c={selected} status={getStatus(selected)} onStatusChange={st => setStatus(selected.id, st)} />}
      </div>
    </div>
  );
}

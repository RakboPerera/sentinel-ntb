import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { useNavigate, useLocation } from 'react-router-dom';
import { Clock, AlertTriangle, Plus, Shield, FileText, Zap, ChevronRight, Filter, X } from 'lucide-react';
import InfoTooltip from '../../components/shared/InfoTooltip.jsx';
import { InsightBox } from '../../components/shared/VisualComponents.jsx';
import { CASES, CASE_SEV_COLOR, CASE_SEV_BG, CASE_STATUS_COLOR } from '../../data/caseRegistry.js';

// ─── FULL CASE DATA (matched by id to CASES registry) ────────────────────────

const CASE_DETAIL = {
  'CASE-001': {
    description: 'Six agents independently flagged Branch BR-14 over 11 weeks. Insider Risk: STF-1847 scores 94/100. Controls: 4 SoD violations, 87% override concentration. Credit: 11 anomalous loans LKR 387Mn. KYC: 12.4% gap rate, suspect introducer INT-BR14-007. Digital: off-hours document downloads. MJE: 2 SoD-violating journal entries to suspense GL. Combined severity 0.98.',
    recommendedAction: 'Immediate suspension of STF-1847. Field audit team to BR-14 within 48 hours. Preserve all digital evidence. Notify CBSL if regulatory threshold met.',
    owner: 'R. Wijeratne', ownerRole: 'Chief Internal Auditor',
    supervisor: 'S. Perera', supervisorRole: 'Head of Compliance',
    strStatus: 'under_assessment', strFiled: false, strDeadlineHours: 120,
    cbslNotified: false, fraudRegisterRef: 'FR-2025-0847', managementResponse: null,
    slaHours: 4, createdAt: '2025-12-20T23:54:00Z',
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
  'CASE-002': {
    description: 'SUS-017 (Pettah Main Street): 312% balance growth in 30 days, clearing ratio 0.08, 94 days unreconciled. 15 structured CEFT transfers below LKR 5M. Device sharing cluster across 4 accounts in SUS-017 network. CBSL 90-day guideline breached. STR eligible.',
    recommendedAction: 'Immediate freeze of SUS-017. File STR with CBSL FIU within 24 hours. Forensic investigation of CEFT rail.',
    owner: 'MLCO', ownerRole: 'Money Laundering Compliance Officer',
    supervisor: 'S. Perera', supervisorRole: 'Head of Compliance',
    strStatus: 'eligible', strFiled: false, strDeadlineHours: 72,
    cbslNotified: false, fraudRegisterRef: 'FR-2025-0848', managementResponse: null,
    slaHours: 4, createdAt: '2025-12-20T23:54:00Z',
    statusHistory: [
      { status: 'Open', timestamp: '2025-12-20T23:54:00Z', actor: 'SYSTEM', note: 'SUS-017 auto-frozen. CBSL 90-day breach confirmed. STR eligibility threshold met.' },
    ],
    evidence: [],
    remediationSteps: [
      { id: 'R1', action: 'Freeze SUS-017 account', owner: 'Treasury Ops', dueDate: '2025-12-21', status: 'complete' },
      { id: 'R2', action: 'File STR with CBSL FIU', owner: 'MLCO', dueDate: '2025-12-24', status: 'pending' },
      { id: 'R3', action: 'CEFT switch forensic analysis', owner: 'Digital Forensics', dueDate: '2025-12-28', status: 'pending' },
    ],
  },
  'CASE-003': {
    description: 'NTB-CORP-0887: 91% over-invoicing HS 6203 apparel, duplicate LC applications on overlapping shipments, CEFT structuring cluster. Beneficial ownership not disclosed. TBML exposure LKR 421 Mn.',
    recommendedAction: 'Suspend all facilities for NTB-CORP-0887. File TBML STR. Forensic review 24 months trade documents.',
    owner: 'Trade Compliance Officer', ownerRole: 'Trade Finance Compliance',
    supervisor: 'S. Perera', supervisorRole: 'Head of Compliance',
    strStatus: 'under_assessment', strFiled: false, strDeadlineHours: 96,
    cbslNotified: false, fraudRegisterRef: 'FR-2025-0849', managementResponse: 'Agree — corporate banking relationship suspended pending investigation.',
    slaHours: 24, createdAt: '2025-12-19T14:30:00Z',
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
  'CASE-004': {
    description: '15 CEFT transfers in 22 minutes, amounts LKR 4.6M-4.95M. Structuring score 0.94. Combined LKR 71.25M. Round-trip detected — funds returned within 5 days.',
    recommendedAction: 'Suspend NTB-0841-X. File STR within 5 working days. Freeze assets.',
    owner: 'Fraud Investigation Team', ownerRole: 'AML Analyst',
    supervisor: 'MLCO', supervisorRole: 'MLCO',
    strStatus: 'eligible', strFiled: false, strDeadlineHours: 96,
    cbslNotified: false, fraudRegisterRef: 'FR-2025-0850', managementResponse: null,
    slaHours: 24, createdAt: '2025-12-20T23:47:00Z',
    statusHistory: [
      { status: 'Open', timestamp: '2025-12-20T23:47:00Z', actor: 'SYSTEM', note: 'Structuring score 0.94. STR eligibility confirmed.' },
    ],
    evidence: [],
    remediationSteps: [
      { id: 'R1', action: 'Suspend NTB-0841-X account', owner: 'Retail Banking Ops', dueDate: '2025-12-21', status: 'pending' },
      { id: 'R2', action: 'File STR with CBSL FIU', owner: 'MLCO', dueDate: '2025-12-27', status: 'pending' },
    ],
  },
  'CASE-005': {
    description: 'KYC gap rate 4.7% across 835,944 accounts. 847 HSBC migration gaps. 2 accounts require STR assessment. Exceeds CBSL 2% threshold.',
    recommendedAction: 'Deploy KYC remediation team. Prioritize PEP accounts. 90-day programme.',
    owner: 'Head of KYC Operations', ownerRole: 'KYC Operations',
    supervisor: 'MLCO', supervisorRole: 'MLCO',
    strStatus: 'not_required', strFiled: false, strDeadlineHours: null,
    cbslNotified: true, fraudRegisterRef: null, managementResponse: 'Agree — 90-day programme approved. 12 analysts assigned.',
    slaHours: 168, createdAt: '2025-12-18T09:00:00Z',
    statusHistory: [
      { status: 'Open', timestamp: '2025-12-18T09:00:00Z', actor: 'SYSTEM', note: 'Monthly KYC gap refresh. 4.7% rate exceeds CBSL threshold.' },
    ],
    evidence: [
      { type: 'Document', desc: 'Full KYC gap register — 39,290 accounts', addedBy: 'KYC System', addedAt: '2025-12-18T09:00:00Z', status: 'Obtained' },
    ],
    remediationSteps: [
      { id: 'R1', action: 'Remediate 34 PEP accounts — EDD completion', owner: 'Senior KYC Analyst', dueDate: '2025-12-31', status: 'in_progress' },
      { id: 'R2', action: 'Resolve 847 HSBC migration gaps', owner: 'HSBC Integration PMO', dueDate: '2026-03-31', status: 'pending' },
    ],
  },
  'CASE-006': {
    description: 'LCR declined 320.6% to 203.4% in FY2025. NSFR also declining. Amber threshold 200% approaching Q1 2026.',
    recommendedAction: 'ALCO stabilisation plan. Term deposit campaign and REPO facility.',
    owner: 'CFO Office', ownerRole: 'Chief Financial Officer',
    supervisor: 'CRO', supervisorRole: 'CRO',
    strStatus: 'not_required', strFiled: false, strDeadlineHours: null,
    cbslNotified: false, fraudRegisterRef: null, managementResponse: 'Agree — ALCO approved LCR stabilisation plan 2025-12-18.',
    slaHours: 168, createdAt: '2025-12-15T11:00:00Z',
    statusHistory: [
      { status: 'Open', timestamp: '2025-12-15T11:00:00Z', actor: 'SYSTEM', note: 'LCR declining trend flagged.' },
      { status: 'Resolved', timestamp: '2025-12-18T17:00:00Z', actor: 'CFO Office', note: 'ALCO approved stabilisation plan. Ref: ALCO-2025-DEC-002.' },
    ],
    evidence: [
      { type: 'Document', desc: 'ALCO Minutes 2025-12-18 ref. ALCO-2025-DEC-002', addedBy: 'CFO Office', addedAt: '2025-12-18T17:00:00Z', status: 'Obtained' },
    ],
    remediationSteps: [
      { id: 'R1', action: 'Term deposit special rate campaign', owner: 'Retail Banking Head', dueDate: '2025-12-22', status: 'complete' },
      { id: 'R2', action: 'Access REPO facility LKR 10Bn', owner: 'Treasury Head', dueDate: '2025-12-23', status: 'complete' },
    ],
  },
  'CASE-007': {
    description: 'MJE-2026-4204 (risk score 97/100): LKR 120M posted to Loans Receivable at 00:03, month-end, round number, SoD violation (STF-1847 as maker and checker), zero supporting documents. MJE-2026-4201 (LKR 185M to CEFT Suspense at 23:47) shows same pattern. Both entries linked to the STF-1847 insider fraud at BR-14.',
    recommendedAction: 'Reverse MJE-2026-4204 and MJE-2026-4201 pending investigation. Obtain supporting documentation. Escalate to Head of Finance and external auditors. Preserve GL audit trail.',
    owner: 'Head of Finance', ownerRole: 'Chief Financial Officer Office',
    supervisor: 'Chief Internal Auditor', supervisorRole: 'Internal Audit',
    strStatus: 'not_required', strFiled: false, strDeadlineHours: null,
    cbslNotified: false, fraudRegisterRef: 'FR-2025-0851', managementResponse: null,
    slaHours: 24, createdAt: '2025-12-21T06:00:00Z',
    statusHistory: [
      { status: 'Open', timestamp: '2025-12-21T06:00:00Z', actor: 'SYSTEM', note: 'MJE Agent flagged MJE-2026-4204 (97/100) and MJE-2026-4201 — linked to CASE-001 STF-1847.' },
    ],
    evidence: [
      { type: 'System Log', desc: 'GL audit trail for MJE-2026-4204 and MJE-2026-4201', addedBy: 'Finance System', addedAt: '2025-12-21T06:00:00Z', status: 'Obtained' },
    ],
    remediationSteps: [
      { id: 'R1', action: 'Obtain supporting documentation for both MJE entries', owner: 'Head of Finance', dueDate: '2025-12-22', status: 'pending' },
      { id: 'R2', action: 'Reverse entries if documentation cannot be produced', owner: 'CFO', dueDate: '2025-12-23', status: 'pending' },
      { id: 'R3', action: 'Notify external auditors (BDO) of material MJE finding', owner: 'Head of Finance', dueDate: '2025-12-24', status: 'pending' },
    ],
  },
  'CASE-008': {
    description: 'BR-72 Pettah Main Street cluster: NTB-0841-X (15 transactions, LKR 71.25M), NTB-2209-F (34 transactions, velocity 8.5x baseline), SUS-017 (LKR 1.24Bn suspense, STR eligible). Device DEV-A4F7-9921 shared across 4 accounts including SUS-017. Combined suspicious flow LKR 166M.',
    recommendedAction: 'Coordinate investigation with CASE-002 (SUS-017). Device cluster forensics. Review all accounts using DEV-A4F7-9921.',
    owner: 'Fraud Investigation Team', ownerRole: 'AML Analyst',
    supervisor: 'MLCO', supervisorRole: 'MLCO',
    strStatus: 'eligible', strFiled: false, strDeadlineHours: 72,
    cbslNotified: false, fraudRegisterRef: 'FR-2025-0852', managementResponse: null,
    slaHours: 24, createdAt: '2025-12-20T23:54:00Z',
    statusHistory: [
      { status: 'Open', timestamp: '2025-12-20T23:54:00Z', actor: 'SYSTEM', note: 'Transaction + Suspense + Digital agents all flagging BR-72 simultaneously. Device cluster confirmed.' },
    ],
    evidence: [],
    remediationSteps: [
      { id: 'R1', action: 'Identify all accounts using device DEV-A4F7-9921', owner: 'Digital Banking Security', dueDate: '2025-12-22', status: 'pending' },
      { id: 'R2', action: 'Suspend suspected money mule accounts', owner: 'Retail Banking Ops', dueDate: '2025-12-23', status: 'pending' },
      { id: 'R3', action: 'File STR for CEFT structuring cluster', owner: 'MLCO', dueDate: '2025-12-26', status: 'pending' },
    ],
  },
  'CASE-009': {
    description: 'NTB-CORP-4412 (City Office, BR-16): Gold export under-invoicing HS 7108 — declared price USD 28/g against benchmark USD 62/g. Deviation 55% below spot benchmark. FATF-country counterparty (Singapore). Estimated illicit flow LKR 147M. Cross-reference: NTB-CORP-4412 is a PEP-linked entity in KYC Agent.',
    recommendedAction: 'Suspend NTB-CORP-4412 facilities pending investigation. PEP EDD review. File TBML STR. Coordinate with CBSL FIU on gold export controls.',
    owner: 'Trade Compliance Officer', ownerRole: 'Trade Finance Compliance',
    supervisor: 'S. Perera', supervisorRole: 'Head of Compliance',
    strStatus: 'eligible', strFiled: false, strDeadlineHours: 96,
    cbslNotified: false, fraudRegisterRef: 'FR-2025-0853', managementResponse: null,
    slaHours: 48, createdAt: '2025-12-19T11:00:00Z',
    statusHistory: [
      { status: 'Open', timestamp: '2025-12-19T11:00:00Z', actor: 'SYSTEM', note: 'Trade Agent flagged INV-2025-5881. Gold under-invoicing 55% below benchmark. TBML risk score 0.89.' },
    ],
    evidence: [
      { type: 'Document', desc: 'INV-2025-5881 invoice and shipping documents', addedBy: 'Trade Ops', addedAt: '2025-12-19T12:00:00Z', status: 'Obtained' },
    ],
    remediationSteps: [
      { id: 'R1', action: 'Suspend NTB-CORP-4412 trade facilities', owner: 'Corporate Banking Head', dueDate: '2025-12-20', status: 'complete' },
      { id: 'R2', action: 'PEP EDD review — NTB-C-4412-G', owner: 'KYC Team', dueDate: '2025-12-26', status: 'pending' },
      { id: 'R3', action: 'File TBML STR with CBSL FIU', owner: 'MLCO', dueDate: '2025-12-26', status: 'pending' },
    ],
  },
  'CASE-010': {
    description: 'BR-23 Embilipitiya composite score 54/100 — amber. STF-2341 (Senior Credit Officer): override rate elevated, 1 SoD violation, insider risk score 71/100. Loans NTB-CR-2025-0334 and NTB-CR-2025-2041 (LKR 143M combined) anomalous scores 0.84 and 0.79. Introducer INT-BR23-012: 21% gap rate on 28 introduced accounts.',
    recommendedAction: 'Enhanced monitoring of BR-23. STF-2341 interview. Review the 2 anomalous loans. Introducer INT-BR23-012 remediation.',
    owner: 'Regional Internal Audit', ownerRole: 'Southern Region Audit Head',
    supervisor: 'R. Wijeratne', supervisorRole: 'Chief Internal Auditor',
    strStatus: 'not_required', strFiled: false, strDeadlineHours: null,
    cbslNotified: false, fraudRegisterRef: null, managementResponse: null,
    slaHours: 72, createdAt: '2025-12-21T09:00:00Z',
    statusHistory: [
      { status: 'Open', timestamp: '2025-12-21T09:00:00Z', actor: 'SYSTEM', note: 'Controls Agent: BR-23 composite 54/100. Insider Risk Agent: STF-2341 score 71/100. Credit Agent: 2 anomalous loans at BR-23.' },
    ],
    evidence: [],
    remediationSteps: [
      { id: 'R1', action: 'STF-2341 management interview and HR file review', owner: 'Head of HR', dueDate: '2025-12-24', status: 'pending' },
      { id: 'R2', action: 'Enhanced monitoring — weekly override report BR-23', owner: 'Regional Audit', dueDate: '2025-12-31', status: 'pending' },
      { id: 'R3', action: 'KYC remediation for INT-BR23-012 introduced accounts', owner: 'Head of KYC Operations', dueDate: '2026-01-15', status: 'pending' },
    ],
  },
};

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const COLS = ['open', 'investigating', 'resolved', 'closed'];
const COL_LABELS = { open: 'Open', investigating: 'Investigating', resolved: 'Resolved', closed: 'Closed' };
const COL_COLORS = { open: '#C41E3A', investigating: '#4A6070', resolved: '#16A34A', closed: '#9ca3af' };
const STR_MAP = {
  eligible: { label: 'STR Eligible — filing required', color: '#C41E3A', bg: '#FEF0F0' },
  under_assessment: { label: 'STR Under Assessment', color: '#4A6070', bg: '#F3F3F1' },
  not_required: { label: 'STR Not Required', color: '#16A34A', bg: '#F0FDF4' },
  filed: { label: 'STR Filed', color: '#16A34A', bg: '#F0FDF4' },
};
const REM_C = { complete: '#16A34A', in_progress: '#4A6070', pending: '#9ca3af' };
const REM_L = { complete: 'Complete', in_progress: 'In Progress', pending: 'Pending' };
const EV_TYPES = ['Transaction Extract', 'System Log', 'Document', 'Statement', 'CCTV Request', 'External Comms', 'Forensic Report'];

const DOMAIN_LABELS = {
  credit: 'Credit', transaction: 'AML/Structuring', suspense: 'Suspense',
  kyc: 'KYC/AML', controls: 'Controls', digital: 'Digital', trade: 'Trade',
  insider: 'Insider Risk', mje: 'MJE'
};
const DOMAIN_COLORS = {
  credit: '#185FA5', transaction: 'var(--color-text-2)', suspense: '#993C1D',
  kyc: '#0F6E56', controls: '#3A5A3A', digital: '#993556',
  trade: '#3B6D11', insider: '#1F2937', mje: '#0BBF7A'
};

function fmt(iso) { return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }

function getSla(c, status) {
  if (['resolved','closed'].includes(status)) return { pct: 100, color: '#16A34A', label: 'Closed', breached: false };
  const d = CASE_DETAIL[c.id];
  if (!d) return { pct: 0, color: '#9ca3af', label: '—', breached: false };
  const elapsed = (Date.now() - new Date(d.createdAt).getTime()) / 3600000;
  const pct = Math.min(100, Math.round((elapsed / d.slaHours) * 100));
  const breached = pct >= 100;
  return { pct, color: breached ? '#C41E3A' : pct >= 75 ? '#4A6070' : '#16A34A', label: breached ? `BREACHED` : `${Math.round(elapsed)}h / ${d.slaHours}h`, breached };
}

// ─── CASE DETAIL PANEL ───────────────────────────────────────────────────────

function CaseDetail({ c, status, onStatusChange, onClose }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [noteText, setNoteText] = useState('');
  const [localNotes, setLocalNotes] = useState([]);
  const [localEv, setLocalEv] = useState([]);
  const [localSteps, setLocalSteps] = useState({});
  const [mgmt, setMgmt] = useState('');
  const [showEvForm, setShowEvForm] = useState(false);
  const [evForm, setEvForm] = useState({ type: 'Document', desc: '' });

  const d = CASE_DETAIL[c.id] || {};
  const sla = getSla(c, status);
  const sc = CASE_SEV_COLOR[c.severity] || '#185FA5';
  const strInfo = STR_MAP[d.strStatus || 'not_required'];
  const allSteps = (d.remediationSteps || []).map(s => ({ ...s, status: localSteps[s.id] || s.status }));
  const doneSteps = allSteps.filter(s => s.status === 'complete').length;
  const allEv = [...(d.evidence || []), ...localEv];
  const allHist = [...(d.statusHistory || []), ...localNotes.map(n => ({ ...n, status: 'Note' }))].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  const canResolve = allSteps.length > 0 && doneSteps === allSteps.length && allEv.length > 0 && !!(mgmt || d.managementResponse);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'log', label: 'Investigation Log' },
    { id: 'evidence', label: `Evidence (${allEv.length})` },
    { id: 'str', label: 'STR / Regulatory' },
    { id: 'rem', label: `Remediation (${doneSteps}/${allSteps.length})` },
  ];

  return (
    <div className="agent-panel animate-slide-in" style={{ display:'flex', flexDirection:'column', maxHeight:'92vh', position:'sticky', top:0 }}>
      <div style={{ padding:'14px 18px', background:CASE_SEV_BG[c.severity] || 'var(--color-surface-2)', borderBottom:'1px solid var(--color-border)', flexShrink:0 }}>
        <div style={{ display:'flex', gap:7, alignItems:'center', marginBottom:7, flexWrap:'wrap' }}>
          <span style={{ fontSize:10, fontWeight:800, letterSpacing:'0.08em', textTransform:'uppercase', padding:'2px 8px', borderRadius:20, background:sc, color:'white' }}>{c.severity}</span>
          <code style={{ fontSize:10, color:'var(--color-text-3)' }}>{c.id}</code>
          {c.branch_code && <span style={{ fontSize:10, padding:'2px 7px', background:'var(--color-surface)', color:'var(--color-text-2)', borderRadius:5, border:'1px solid var(--color-border)', fontWeight:600 }}>{c.branch_name}</span>}
          {sla.breached && <span style={{ fontSize:10, fontWeight:700, padding:'2px 7px', background:'#FEF0F0', color:'#C41E3A', borderRadius:4 }}>SLA BREACHED</span>}
          {d.strStatus === 'eligible' && !d.strFiled && <span style={{ fontSize:10, fontWeight:700, padding:'2px 7px', background:'#FEF0F0', color:'#C41E3A', borderRadius:4 }}>STR REQUIRED</span>}
          <button onClick={onClose} style={{ marginLeft:'auto', background:'none', border:'none', cursor:'pointer', color:'var(--color-text-3)', padding:4 }}><X size={14}/></button>
        </div>
        <div style={{ fontSize:13, fontWeight:700, lineHeight:1.4, marginBottom:8 }}>{c.title}</div>
        <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:8 }}>
          {c.domains.map(dom => (
            <span key={dom} style={{ fontSize:10, fontWeight:600, padding:'2px 8px', borderRadius:10, background:`${DOMAIN_COLORS[dom]}18`, color:DOMAIN_COLORS[dom], border:`1px solid ${DOMAIN_COLORS[dom]}30` }}>
              {DOMAIN_LABELS[dom] || dom}
            </span>
          ))}
        </div>
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3, fontSize:10 }}>
            <span style={{ color:'var(--color-text-3)' }}>SLA: {d.slaHours}h</span>
            <span style={{ fontWeight:700, color:sla.color }}>{sla.label}</span>
          </div>
          <div style={{ height:4, borderRadius:2, background:'rgba(0,0,0,0.08)', overflow:'hidden' }}>
            <div style={{ width:`${sla.pct}%`, height:'100%', background:sla.color, borderRadius:2 }}/>
          </div>
        </div>
        {d.owner && <div style={{ display:'flex', gap:12, marginTop:7, fontSize:11, color:'var(--color-text-2)', flexWrap:'wrap' }}>
          <span>Owner: <strong>{d.owner}</strong> · {d.ownerRole}</span>
          {d.supervisor && <span>Supervisor: <strong>{d.supervisor}</strong></span>}
        </div>}
        {/* Quick navigation */}
        <div style={{ display:'flex', gap:6, marginTop:10, flexWrap:'wrap' }}>
          {c.branch_code && <button onClick={() => navigate('/heatmap')} style={{ fontSize:10, fontWeight:600, padding:'3px 9px', borderRadius:6, background:'var(--color-surface)', border:'1px solid var(--color-border)', cursor:'pointer', color:'var(--color-text-2)' }}>⬡ View in Heatmap</button>}
          {c.domains[0] && <button onClick={() => navigate(`/agents/${c.domains[0] === 'kyc' ? 'kyc' : c.domains[0] === 'insider' ? 'insider-risk' : c.domains[0] === 'mje' ? 'mje' : c.domains[0]}`)} style={{ fontSize:10, fontWeight:600, padding:'3px 9px', borderRadius:6, background:'var(--color-surface)', border:'1px solid var(--color-border)', cursor:'pointer', color:'var(--color-text-2)' }}>⊕ Open Agent</button>}
          <button onClick={() => navigate('/risk-register')} style={{ fontSize:10, fontWeight:600, padding:'3px 9px', borderRadius:6, background:'var(--color-surface)', border:'1px solid var(--color-border)', cursor:'pointer', color:'var(--color-text-2)' }}>⊟ Risk Register</button>
        </div>
      </div>

      <div style={{ display:'flex', borderBottom:'1px solid var(--color-border)', flexShrink:0, overflowX:'auto' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ padding:'8px 10px', fontSize:11, fontWeight:tab===t.id?600:400, color:tab===t.id?sc:'var(--color-text-2)', background:tab===t.id?`${sc}08`:'transparent', borderBottom:`2px solid ${tab===t.id?sc:'transparent'}`, border:'none', cursor:'pointer', whiteSpace:'nowrap', transition:'all 0.12s' }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'14px 18px', display:'flex', flexDirection:'column', gap:12 }}>
        {tab === 'overview' && (<>
          {c.exposureLkr > 0 && <div style={{ display:'flex', gap:6, alignItems:'center', padding:'9px 12px', background:'#FEF0F0', border:'1px solid rgba(220,38,38,0.2)', borderRadius:8, fontSize:13, fontWeight:700, color:'#C41E3A' }}><AlertTriangle size={14}/>LKR {(c.exposureLkr/1e9).toFixed(2)} Bn exposure</div>}
          <div>
            <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:'var(--color-text-3)', marginBottom:5 }}>Finding summary</div>
            <div style={{ fontSize:12, color:'var(--color-text)', lineHeight:1.7, padding:'10px 12px', background:'var(--color-surface-2)', borderRadius:8 }}>{d.description || c.title}</div>
          </div>
          {d.recommendedAction && <div>
            <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:'var(--color-text-3)', marginBottom:5 }}>Recommended action</div>
            <div style={{ fontSize:12, color:'var(--color-text)', lineHeight:1.7, padding:'10px 12px', background:'var(--color-surface-2)', borderLeft:`3px solid ${sc}`, borderRadius:8, display:'flex', gap:7 }}><Zap size={13} style={{ color:sc, flexShrink:0, marginTop:2 }}/>{d.recommendedAction}</div>
          </div>}
          <div>
            <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:'var(--color-text-3)', marginBottom:5 }}>Agents involved</div>
            <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>{c.domains.map(dom => <button key={dom} onClick={() => navigate(`/agents/${dom === 'kyc' ? 'kyc' : dom === 'insider' ? 'insider-risk' : dom === 'mje' ? 'mje' : dom}`)} style={{ fontSize:11, padding:'3px 10px', background:`${DOMAIN_COLORS[dom]}18`, color:DOMAIN_COLORS[dom], borderRadius:20, fontWeight:600, border:`1px solid ${DOMAIN_COLORS[dom]}30`, cursor:'pointer' }}>{DOMAIN_LABELS[dom] || dom} →</button>)}</div>
          </div>
          <div>
            <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:'var(--color-text-3)', marginBottom:5, display:'flex', alignItems:'center', gap:5 }}>Management response <InfoTooltip text="Required before this case can be resolved." position="right" width={220}/></div>
            {(mgmt || d.managementResponse) ? <div style={{ fontSize:12, color:'var(--color-text)', lineHeight:1.7, padding:'10px 12px', background:'#F0FDF4', border:'1px solid rgba(22,163,74,0.2)', borderRadius:8 }}>✓ {mgmt || d.managementResponse}</div>
              : <textarea value={mgmt} onChange={e=>setMgmt(e.target.value)} placeholder="Enter management response..." style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'1px solid var(--color-border)', fontSize:12, lineHeight:1.6, resize:'vertical', minHeight:60, fontFamily:'inherit', background:'var(--color-surface)', boxSizing:'border-box' }}/>}
          </div>
          <div>
            <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:'var(--color-text-3)', marginBottom:7 }}>Update status</div>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              {COLS.map(col => {
                const ok = col === 'resolved' ? canResolve : true;
                return <button key={col} onClick={() => ok && onStatusChange(col)} disabled={!ok} style={{ padding:'5px 12px', borderRadius:8, fontSize:12, fontWeight:status===col?700:400, cursor:ok?'pointer':'not-allowed', background:status===col?COL_COLORS[col]:'var(--color-surface-2)', color:status===col?'white':ok?'var(--color-text-2)':'var(--color-text-3)', border:`1px solid ${status===col?COL_COLORS[col]:'var(--color-border)'}`, opacity:ok?1:0.5 }}>{COL_LABELS[col]}</button>;
              })}
            </div>
            {!canResolve && !['resolved','closed'].includes(status) && <div style={{ fontSize:11, color:'var(--color-text-3)', marginTop:5 }}>To resolve: {doneSteps}/{allSteps.length} steps · {allEv.length>0?'✓':'✗'} evidence · {(mgmt||d.managementResponse)?'✓':'✗'} management response</div>}
          </div>
        </>)}

        {tab === 'log' && (<>
          {allHist.map((entry, i) => (
            <div key={i} style={{ display:'flex', gap:10 }}>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
                <div style={{ width:18, height:18, borderRadius:'50%', background:`${sc}18`, border:`1.5px solid ${sc}44`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, color:sc, flexShrink:0 }}>●</div>
                {i < allHist.length-1 && <div style={{ width:1.5, flex:1, background:'var(--color-border)', minHeight:10 }}/>}
              </div>
              <div style={{ paddingBottom:10, paddingTop:2, flex:1 }}>
                <div style={{ display:'flex', gap:7, alignItems:'center', marginBottom:3, flexWrap:'wrap' }}>
                  <span style={{ fontSize:11, fontWeight:700 }}>{entry.status}</span>
                  <span style={{ fontSize:10, color:'var(--color-text-3)' }}>{fmt(entry.timestamp)}</span>
                  <span style={{ fontSize:10, padding:'1px 5px', background:'var(--color-surface-2)', color:'var(--color-text-2)', borderRadius:4 }}>{entry.actor}</span>
                </div>
                <div style={{ fontSize:12, color:'var(--color-text-2)', lineHeight:1.6 }}>{entry.note}</div>
              </div>
            </div>
          ))}
          <div style={{ borderTop:'1px solid var(--color-border)', paddingTop:12 }}>
            <textarea value={noteText} onChange={e=>setNoteText(e.target.value)} placeholder="Add investigation note..." style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'1px solid var(--color-border)', fontSize:12, lineHeight:1.6, resize:'vertical', minHeight:56, fontFamily:'inherit', background:'var(--color-surface)', boxSizing:'border-box' }}/>
            <button onClick={() => { if(noteText.trim()){ setLocalNotes(n=>[...n,{ note:noteText, actor:'You', timestamp:new Date().toISOString() }]); setNoteText(''); }}} disabled={!noteText.trim()} style={{ marginTop:6, padding:'5px 12px', borderRadius:8, fontSize:12, fontWeight:600, background:noteText.trim()?sc:'var(--color-surface-2)', color:noteText.trim()?'white':'var(--color-text-3)', border:'none', cursor:noteText.trim()?'pointer':'not-allowed' }}>Add note</button>
          </div>
        </>)}

        {tab === 'evidence' && (<>
          <InsightBox type="info" body="Evidence items create the legally defensible record. At least one item must be added before resolving this case." compact/>
          {allEv.length===0 && <div style={{ textAlign:'center', padding:'20px 16px', color:'var(--color-text-3)', fontSize:12 }}>No evidence items yet.</div>}
          {allEv.map((ev,i) => <div key={i} style={{ padding:'10px 12px', background:'var(--color-surface-2)', border:'1px solid var(--color-border)', borderRadius:8, display:'flex', gap:10 }}><FileText size={15} style={{ color:sc, flexShrink:0, marginTop:2 }}/><div style={{ flex:1 }}><div style={{ fontSize:11, fontWeight:600, color:sc, marginBottom:2 }}>{ev.type}</div><div style={{ fontSize:12, color:'var(--color-text)', marginBottom:3 }}>{ev.desc}</div><div style={{ fontSize:10, color:'var(--color-text-3)' }}>Added by {ev.addedBy} · {fmt(ev.addedAt)}</div></div><span style={{ fontSize:10, fontWeight:700, padding:'2px 7px', background:ev.status==='Obtained'?'#F0FDF4':'#F3F3F1', color:ev.status==='Obtained'?'#16A34A':'#4A6070', borderRadius:4, alignSelf:'flex-start' }}>{ev.status}</span></div>)}
          {showEvForm ? (
            <div style={{ padding:12, background:'var(--color-surface-2)', border:'1px dashed var(--color-border)', borderRadius:8 }}>
              <select value={evForm.type} onChange={e=>setEvForm(f=>({...f,type:e.target.value}))} style={{ width:'100%', marginBottom:7, padding:'6px 10px', borderRadius:6, border:'1px solid var(--color-border)', fontSize:12, background:'var(--color-surface)', fontFamily:'inherit' }}>{EV_TYPES.map(t=><option key={t}>{t}</option>)}</select>
              <input value={evForm.desc} onChange={e=>setEvForm(f=>({...f,desc:e.target.value}))} placeholder="Describe this evidence item..." style={{ width:'100%', marginBottom:7, padding:'6px 10px', borderRadius:6, border:'1px solid var(--color-border)', fontSize:12, background:'var(--color-surface)', fontFamily:'inherit', boxSizing:'border-box' }}/>
              <div style={{ display:'flex', gap:6 }}>
                <button onClick={() => { if(evForm.desc.trim()){ setLocalEv(e=>[...e,{...evForm,addedBy:'You',addedAt:new Date().toISOString(),status:'Obtained'}]); setEvForm({type:'Document',desc:''}); setShowEvForm(false); }}} style={{ flex:1, padding:5, borderRadius:6, fontSize:12, fontWeight:600, background:sc, color:'white', border:'none', cursor:'pointer' }}>Add</button>
                <button onClick={()=>setShowEvForm(false)} style={{ flex:1, padding:5, borderRadius:6, fontSize:12, background:'var(--color-surface)', border:'1px solid var(--color-border)', cursor:'pointer', color:'var(--color-text-2)' }}>Cancel</button>
              </div>
            </div>
          ) : <button onClick={()=>setShowEvForm(true)} style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 12px', borderRadius:8, fontSize:12, fontWeight:600, background:'var(--color-surface-2)', border:'1px dashed var(--color-border)', color:'var(--color-text-2)', cursor:'pointer' }}><Plus size={12}/>Add evidence item</button>}
        </>)}

        {tab === 'str' && (<>

          {/* STR Status banner */}
          <div style={{ padding:'12px 14px', background:strInfo.bg, border:`1px solid ${strInfo.color}30`, borderRadius:10 }}>
            <div style={{ display:'flex', gap:7, alignItems:'center', marginBottom:4 }}>
              <Shield size={13} style={{ color:strInfo.color }}/>
              <span style={{ fontSize:13, fontWeight:700, color:strInfo.color }}>{strInfo.label}</span>
              {d.strStatus==='eligible' && !d.strFiled && (
                <span style={{ marginLeft:'auto', fontSize:11, fontWeight:700, color:'#C41E3A' }}>
                  ⏱ FTRA deadline: 5 working days from case creation
                </span>
              )}
            </div>
            {d.strFiled && d.strReference && (
              <div style={{ fontSize:12, color:strInfo.color }}>
                Filed reference: <strong>{d.strReference}</strong>
              </div>
            )}
          </div>

          {/* Key regulatory fields */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
            {[
              { label:'STR Filed', value:d.strFiled?'Yes':'Not yet filed', color:d.strFiled?'#16A34A':d.strStatus==='eligible'?'#C41E3A':'var(--color-text-3)' },
              { label:'CBSL Notification', value:d.cbslNotified?'Filed':'Not filed', color:d.cbslNotified?'#16A34A':'#C41E3A' },
              { label:'Fraud Register Ref', value:d.fraudRegisterRef||'— Not assigned', color:d.fraudRegisterRef?'var(--color-text)':'var(--color-text-3)' },
            ].map((f,i) => (
              <div key={i} style={{ padding:'10px 12px', background:'var(--color-surface-2)', border:'1px solid var(--color-border)', borderRadius:8 }}>
                <div style={{ fontSize:10, color:'var(--color-text-3)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:3 }}>{f.label}</div>
                <div style={{ fontSize:13, fontWeight:700, color:f.color }}>{f.value}</div>
              </div>
            ))}
          </div>

          {/* STR Draft Generator */}
          {(d.strStatus === 'eligible' || d.strStatus === 'filed') && (() => {
            const strDraft = [
              `TO: Director General, Financial Intelligence Unit`,
              `FROM: Nations Trust Bank PLC — Compliance Division`,
              `DATE: ${new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'long', year:'numeric' })}`,
              `SUBJECT: Suspicious Transaction Report — ${d.id} — ${d.title}`,
              ``,
              `1. REPORTING ENTITY`,
              `   Bank: Nations Trust Bank PLC | BIC: NTBKLKLX`,
              `   Licence No: CBSL/LCB/2024/NTB | Branch: ${d.branches?.[0] || 'Multiple branches'}`,
              `   Compliance Officer: [Name] | Tel: [Tel]`,
              ``,
              `2. SUSPECT / ENTITY DETAILS`,
              `   Entity: ${d.entities?.join(', ') || d.id}`,
              `   Relationship: ${d.domain === 'credit' ? 'Borrower' : d.domain === 'suspense' ? 'Internal account holder' : d.domain === 'trade' ? 'Corporate customer' : 'Account holder / Staff member'}`,
              `   Account(s): [See attached transaction schedule]`,
              ``,
              `3. GROUNDS FOR SUSPICION`,
              `   ${d.description || 'Multiple agents flagged anomalous patterns — see evidence tab.'}`,
              ``,
              `4. SUSPICIOUS TRANSACTIONS`,
              `   Total flagged exposure: LKR ${((d.exposure||0)/1e6).toFixed(1)} million`,
              `   Period: ${d.period || 'FY 2025 (January — December)'}`,
              `   Transaction types: ${d.domain === 'transaction' ? 'CEFT transfers below LKR 5M threshold (structuring)' : d.domain === 'suspense' ? 'CEFT receivables with no corresponding outflow' : d.domain === 'trade' ? 'Documentary credit — suspected over-invoicing TBML' : d.domain === 'credit' ? 'Loan approvals — suspected fictitious/inflated borrowers' : 'Mixed transaction types — see evidence schedule'}`,
              ``,
              `5. AGENT DETECTION SUMMARY`,
              `   This STR is supported by multi-agent AI analysis:`,
              ...((d.agents||[]).map(a => `   • ${a} — confirmed anomaly signals`)),
              `   Combined Orchestrator severity score: ${d.severity >= 0.95 ? '0.98/1.00 (CRITICAL)' : (d.severity||0.85).toFixed(2) + '/1.00'}`,
              ``,
              `6. ACTIONS TAKEN`,
              `   [ ] Account(s) frozen pending investigation`,
              `   [ ] Evidence package preserved`,
              `   [ ] Senior management notified`,
              `   [ ] Legal counsel engaged`,
              ``,
              `7. REGULATORY OBLIGATIONS`,
              `   This report is submitted pursuant to Section 7 of the Financial`,
              `   Transactions Reporting Act No. 6 of 2006 (FTRA) and CBSL`,
              `   Direction on AML/CFT.`,
              ``,
              `8. ATTACHMENTS`,
              `   A — Transaction schedule with timestamps`,
              `   B — Agent detection evidence package`,
              `   C — Account statements (3 months)`,
              `   D — KYC documentation`,
              ``,
              `Signed: _____________________ Date: ___________________`,
              `Chief Compliance Officer / MLCO, Nations Trust Bank PLC`,
            ].join('\n');

            return (
              <div>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <FileText size={14} style={{ color:'var(--color-text-2)' }} />
                    <span style={{ fontSize:13, fontWeight:700 }}>STR Draft — CBSL FIU Format</span>
                    <InfoTooltip text="This draft is auto-generated from case evidence and follows CBSL Financial Intelligence Unit reporting requirements under FTRA Section 7. Review and complete bracketed fields before submission. The draft must be reviewed by the MLCO before filing." position="right" width={300} />
                  </div>
                  <div style={{ display:'flex', gap:8 }}>
                    <button
                      onClick={() => {
                        const blob = new Blob([strDraft], { type:'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `STR-DRAFT-${d.id}-${new Date().toISOString().slice(0,10)}.txt`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      style={{ padding:'6px 14px', background:'var(--color-blue)', color:'white', border:'none', borderRadius:7, fontSize:12, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:5 }}>
                      ↓ Download Draft
                    </button>
                    <button
                      onClick={() => navigator.clipboard?.writeText(strDraft)}
                      style={{ padding:'6px 14px', background:'var(--color-surface-2)', color:'var(--color-text)', border:'1px solid var(--color-border)', borderRadius:7, fontSize:12, fontWeight:600, cursor:'pointer' }}>
                      Copy
                    </button>
                  </div>
                </div>
                <div style={{ background:'var(--color-surface-2)', border:'1px solid var(--color-border)', borderRadius:10, padding:'16px 18px', fontFamily:'monospace', fontSize:11, lineHeight:1.85, color:'var(--color-text)', whiteSpace:'pre-wrap', maxHeight:480, overflowY:'auto' }}>
                  {strDraft}
                </div>
                <div style={{ marginTop:10, padding:'8px 12px', background:'#F3F3F1', border:'1px solid rgba(133,79,11,0.25)', borderRadius:8, fontSize:11, color:'#3A5A3A', lineHeight:1.55 }}>
                  ⚠ <strong>Review required:</strong> Complete all bracketed fields. Compliance Officer and MLCO must sign before submission to CBSL FIU. FIU reference number will be issued upon acknowledgement. Retain copy in case file.
                </div>
              </div>
            );
          })()}
        </>)}

        {tab === 'rem' && (<>
          <div style={{ fontSize:12, color:'var(--color-text-2)' }}>{doneSteps} of {allSteps.length} steps complete {doneSteps===allSteps.length?'— eligible for resolution':''}</div>
          <div style={{ height:6, borderRadius:3, background:'var(--color-surface-2)', overflow:'hidden' }}><div style={{ width:`${allSteps.length?Math.round(doneSteps/allSteps.length*100):0}%`, height:'100%', background:doneSteps===allSteps.length?'#16A34A':sc, borderRadius:3, transition:'width 0.5s ease' }}/></div>
          {allSteps.map((step,i) => {
            const rc = REM_C[step.status];
            return <div key={step.id} style={{ padding:'10px 12px', background:'var(--color-surface-2)', border:`1px solid ${step.status==='complete'?'rgba(22,163,74,0.2)':'var(--color-border)'}`, borderRadius:8 }}>
              <div style={{ display:'flex', gap:8, alignItems:'flex-start' }}>
                <div style={{ width:20, height:20, borderRadius:'50%', background:`${rc}15`, border:`1.5px solid ${rc}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:800, color:rc, flexShrink:0 }}>{step.status==='complete'?'✓':i+1}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12, color:'var(--color-text)', lineHeight:1.5, textDecoration:step.status==='complete'?'line-through':'none', opacity:step.status==='complete'?0.6:1 }}>{step.action}</div>
                  <div style={{ fontSize:10, color:'var(--color-text-3)', marginTop:3 }}>Owner: {step.owner} · Due: {step.dueDate}</div>
                </div>
                <select value={localSteps[step.id]||step.status} onChange={e=>setLocalSteps(s=>({...s,[step.id]:e.target.value}))} style={{ padding:'3px 7px', borderRadius:6, border:`1px solid ${rc}44`, fontSize:11, fontWeight:600, color:rc, background:`${rc}10`, cursor:'pointer', fontFamily:'inherit' }}>{Object.keys(REM_C).map(s=><option key={s} value={s}>{REM_L[s]}</option>)}</select>
              </div>
            </div>;
          })}
        </>)}
      </div>
    </div>
  );
}

// ─── MINI CASE CARD (for lists/drawers) ──────────────────────────────────────
export function MiniCaseCard({ c, onClick }) {
  const sc = CASE_SEV_COLOR[c.severity] || '#185FA5';
  const d = CASE_DETAIL[c.id] || {};
  return (
    <div onClick={() => onClick && onClick(c)} style={{ padding:'10px 14px', border:`1px solid ${sc}22`, borderLeft:`3px solid ${sc}`, borderRadius:8, cursor:onClick?'pointer':'default', background:'var(--color-surface-2)', transition:'background 0.12s' }}
      onMouseEnter={e=>{ if(onClick) e.currentTarget.style.background=`${sc}08`; }}
      onMouseLeave={e=>{ if(onClick) e.currentTarget.style.background='var(--color-surface-2)'; }}>
      <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:5 }}>
        <span style={{ fontSize:9, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.07em', padding:'2px 6px', borderRadius:3, background:sc, color:'white' }}>{c.severity}</span>
        <code style={{ fontSize:10, color:'var(--color-text-3)' }}>{c.id}</code>
        <span style={{ fontSize:10, padding:'1px 6px', background:`${CASE_STATUS_COLOR[c.status]}18`, color:CASE_STATUS_COLOR[c.status], borderRadius:4, fontWeight:600, marginLeft:'auto' }}>{c.status}</span>
      </div>
      <div style={{ fontSize:12, fontWeight:600, lineHeight:1.4, marginBottom:5, color:'var(--color-text)' }}>{c.title}</div>
      <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
        {c.domains.slice(0,4).map(dom=><span key={dom} style={{ fontSize:9, padding:'1px 5px', background:`${DOMAIN_COLORS[dom]}15`, color:DOMAIN_COLORS[dom], borderRadius:3 }}>{DOMAIN_LABELS[dom]||dom}</span>)}
        {c.exposureLkr>0 && <span style={{ fontSize:10, fontWeight:700, color:sc, marginLeft:'auto' }}>LKR {(c.exposureLkr/1e6).toFixed(0)}M</span>}
      </div>
      {onClick && <div style={{ fontSize:10, color:sc, marginTop:6, fontWeight:600 }}>View case details →</div>}
    </div>
  );
}

// ─── MAIN ────────────────────────────────────────────────────────────────────

export default function CaseManager() {
  const { state } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const navState = location.state || {};

  const [selected, setSelected] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [domainFilter, setDomainFilter] = useState(navState.domain || 'all');
  const [branchFilter, setBranchFilter] = useState(navState.branchCode || 'all');
  const [localStatuses, setLocalStatuses] = useState({});
  const caseRefs = useRef({});

  // Auto-select case from navigation state
  useEffect(() => {
    if (navState.caseId) {
      const c = CASES.find(x => x.id === navState.caseId);
      if (c) {
        setSelected(c);
        // Scroll to it in kanban
        setTimeout(() => {
          const el = caseRefs.current[navState.caseId];
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 200);
      }
    }
    if (navState.branchCode) setBranchFilter(navState.branchCode);
    if (navState.domain) setDomainFilter(navState.domain);
  }, [navState.caseId, navState.branchCode, navState.domain]);

  function getStatus(c) { return localStatuses[c.id] || c.status; }
  function setStatus(id, st) { setLocalStatuses(s=>({...s,[id]:st})); }

  const allCases = CASES;

  const filtered = allCases.filter(c => {
    if (statusFilter !== 'all' && getStatus(c) !== statusFilter) return false;
    if (domainFilter !== 'all' && !c.domains.includes(domainFilter)) return false;
    if (branchFilter !== 'all' && c.branch_code !== branchFilter && c.branch_code !== null) return false;
    return true;
  });

  const openCritical = allCases.filter(c => getStatus(c)==='open' && c.severity==='critical').length;
  const strPending = allCases.filter(c => CASE_DETAIL[c.id]?.strStatus==='eligible' && !CASE_DETAIL[c.id]?.strFiled).length;
  const branches = [...new Set(allCases.map(c=>c.branch_code).filter(Boolean))];
  const domains = [...new Set(allCases.flatMap(c=>c.domains))];

  const hasFilters = statusFilter!=='all' || domainFilter!=='all' || branchFilter!=='all';

  return (
    <div style={{ maxWidth:1440 }}>
      <div style={{ display:'flex', gap:16, alignItems:'center', marginBottom:14 }}>
        <h2 style={{ flex:1 }}>Case Manager</h2>
        <div style={{ display:'flex', gap:6 }}>
          {['all',...COLS].map(s => (
            <button key={s} onClick={()=>setStatusFilter(s)} className="btn btn-sm" style={{ background:statusFilter===s?'var(--color-text)':'var(--color-surface)', color:statusFilter===s?'white':'var(--color-text-2)', border:'1px solid var(--color-border)' }}>
              {s==='all'?'All':COL_LABELS[s]}
              <span style={{ fontSize:10, marginLeft:4, padding:'0 5px', background:statusFilter===s?'rgba(255,255,255,0.2)':'var(--color-surface-2)', borderRadius:8 }}>{s==='all'?allCases.length:allCases.filter(c=>getStatus(c)===s).length}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:8, marginBottom:14, flexWrap:'wrap', alignItems:'center' }}>
        <Filter size={13} style={{ color:'var(--color-text-3)' }}/>
        <div style={{ display:'flex', alignItems:'center', gap:5 }}>
          <span style={{ fontSize:11, color:'var(--color-text-3)' }}>Branch:</span>
          <select value={branchFilter} onChange={e=>setBranchFilter(e.target.value)} style={{ padding:'4px 8px', borderRadius:6, border:'1px solid var(--color-border)', fontSize:11, background:'var(--color-surface)', fontFamily:'inherit', cursor:'pointer' }}>
            <option value="all">All branches</option>
            {branches.map(b=><option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:5 }}>
          <span style={{ fontSize:11, color:'var(--color-text-3)' }}>Domain:</span>
          <select value={domainFilter} onChange={e=>setDomainFilter(e.target.value)} style={{ padding:'4px 8px', borderRadius:6, border:'1px solid var(--color-border)', fontSize:11, background:'var(--color-surface)', fontFamily:'inherit', cursor:'pointer' }}>
            <option value="all">All domains</option>
            {domains.map(d=><option key={d} value={d}>{DOMAIN_LABELS[d]||d}</option>)}
          </select>
        </div>
        {hasFilters && <button onClick={()=>{ setStatusFilter('all'); setDomainFilter('all'); setBranchFilter('all'); }} style={{ fontSize:11, color:'var(--color-text-3)', background:'none', border:'1px solid var(--color-border)', borderRadius:6, padding:'3px 8px', cursor:'pointer', display:'flex', alignItems:'center', gap:4 }}><X size={11}/>Clear filters</button>}
        {navState.branchCode && <span style={{ fontSize:11, padding:'3px 9px', background:'#E8FDF4', color:'#185FA5', borderRadius:6, border:'1px solid rgba(24,95,165,0.2)', fontWeight:600 }}>From heatmap: {navState.branchCode}</span>}
        <span style={{ fontSize:11, color:'var(--color-text-3)', marginLeft:'auto' }}>{filtered.length} of {allCases.length} cases</span>
      </div>

      {/* Alert strip */}
      {(openCritical>0||strPending>0) && (
        <div style={{ display:'flex', gap:9, marginBottom:14, flexWrap:'wrap' }}>
          {openCritical>0 && <div style={{ display:'flex', gap:5, alignItems:'center', padding:'6px 11px', background:'#FEF0F0', border:'1px solid rgba(220,38,38,0.3)', borderRadius:8, fontSize:12, fontWeight:700, color:'#C41E3A' }}><AlertTriangle size={12}/>{openCritical} critical case{openCritical>1?'s':''} open</div>}
          {strPending>0 && <div style={{ display:'flex', gap:5, alignItems:'center', padding:'6px 11px', background:'#FEF0F0', border:'1px solid rgba(220,38,38,0.3)', borderRadius:8, fontSize:12, fontWeight:700, color:'#C41E3A' }}><Shield size={12}/>{strPending} STR filing{strPending>1?'s':''} required</div>}
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:selected?'1fr 500px':'1fr', gap:18 }}>
        {/* Kanban */}
        <div className="kanban">
          {COLS.map(col => {
            const colCases = filtered.filter(c => getStatus(c)===col);
            return (
              <div key={col} className="kanban-col">
                <div className="kanban-col-header">
                <span style={{ color:COL_COLORS[col] }}>{COL_LABELS[col]}</span>
                <InfoTooltip text={{'open':'New — assigned but not yet actively investigated. Critical cases: 4-hour SLA.','investigating':'Active investigation. Evidence gathering, interviews, STR assessment underway.','resolved':'All steps complete, evidence obtained, management response recorded.','closed':'Formally closed. Audit trail preserved.'}[col] || ''} position="bottom" width={220} />
                <span className="kanban-count" style={{ marginLeft:'auto' }}>{colCases.length}</span>
              </div>
                {colCases.map(c => {
                  const sc2 = CASE_SEV_COLOR[c.severity] || '#185FA5';
                  const d2 = CASE_DETAIL[c.id] || {};
                  const sla = getSla(c, getStatus(c));
                  const isSelected = selected?.id === c.id;
                  return (
                    <div key={c.id} ref={el=>caseRefs.current[c.id]=el}
                      className="case-card" onClick={()=>setSelected(isSelected?null:c)}
                      style={{ borderLeft:`3px solid ${sc2}`, background:isSelected?'#E8FDF4':'var(--color-surface)', cursor:'pointer', outline:isSelected?`2px solid ${sc2}`:'none' }}>
                      <div style={{ display:'flex', gap:5, marginBottom:5, alignItems:'center', flexWrap:'wrap' }}>
                        <span style={{ fontSize:9, fontWeight:700, padding:'2px 5px', borderRadius:3, background:sc2, color:'white', textTransform:'uppercase', letterSpacing:'0.05em' }}>{c.severity}</span>
                        <code style={{ fontSize:10, color:'var(--color-text-3)' }}>{c.id}</code>
                        {d2.strStatus==='eligible'&&!d2.strFiled&&<span style={{ marginLeft:'auto', fontSize:9, fontWeight:700, padding:'1px 5px', background:'#FEF0F0', color:'#C41E3A', borderRadius:3 }}>STR</span>}
                        {sla.breached&&<span style={{ fontSize:9, fontWeight:700, padding:'1px 5px', background:'#F3F3F1', color:'#4A6070', borderRadius:3 }}>SLA</span>}
                      </div>
                      <div style={{ fontSize:12, fontWeight:600, lineHeight:1.4, marginBottom:5 }}>{c.title}</div>
                      {c.branch_code && <div style={{ fontSize:10, color:'var(--color-text-3)', marginBottom:4 }}>{c.branch_code} · {c.branch_name}</div>}
                      {c.exposureLkr>0&&<div style={{ fontSize:11, fontWeight:600, color:'#C41E3A', marginBottom:4 }}>LKR {(c.exposureLkr/1e6).toFixed(0)}M</div>}
                      <div style={{ height:3, borderRadius:2, background:'var(--color-surface-2)', overflow:'hidden', marginBottom:4 }}><div style={{ width:`${sla.pct}%`, height:'100%', background:sla.color, borderRadius:2 }}/></div>
                      <div style={{ fontSize:10, color:sla.color, fontWeight:sla.breached?700:400, marginBottom:6 }}>{sla.label}</div>
                      <div style={{ display:'flex', gap:3, flexWrap:'wrap' }}>{c.domains.slice(0,5).map(dom=><span key={dom} style={{ fontSize:9, padding:'1px 4px', background:`${DOMAIN_COLORS[dom]}15`, borderRadius:3, color:DOMAIN_COLORS[dom] }}>{DOMAIN_LABELS[dom]||dom}</span>)}</div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {selected && (
          <CaseDetail
            c={selected}
            status={getStatus(selected)}
            onStatusChange={st=>setStatus(selected.id,st)}
            onClose={()=>setSelected(null)}
          />
        )}
      </div>
    </div>
  );
}

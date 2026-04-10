import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { demoData } from '../../data/demoData.js';
import InfoTooltip from '../../components/shared/InfoTooltip.jsx';
import { ChevronRight, AlertTriangle, CheckCircle, Clock, Filter } from 'lucide-react';

// ─── RISK REGISTER DATA ───────────────────────────────────────────────────────
// Synthesises findings across all 9 agents into a unified register

const RISK_REGISTER = [
  // Critical — CORR-001
  { id: 'RR-001', domain: 'Internal Controls', agent: 'controls', severity: 'critical', category: 'Insider Fraud',
    title: '4 SoD violations by STF-1847 — BR-14',
    description: 'Same staff member initiated and approved loan disbursements. 87% override concentration. Branch score 41/100.',
    exposure: 387000000, owner: 'Chief Internal Auditor', dueDate: '2025-12-22',
    status: 'in_progress', caseRef: 'CASE-001', strRequired: true, cbslRequired: true,
    agentPath: '/agents/controls', color: '#854F0B' },
  { id: 'RR-002', domain: 'Insider Risk', agent: 'insider', severity: 'critical', category: 'Insider Fraud',
    title: 'STF-1847 insider risk score 94/100 — all 6 dimensions',
    description: '6-dimension composite: SoD violations, 87% override concentration, same-cluster approvals, 12 off-hours, 1.4min turnaround, session anomalies.',
    exposure: 387000000, owner: 'Chief Internal Auditor', dueDate: '2025-12-21',
    status: 'complete', caseRef: 'CASE-001', strRequired: false, cbslRequired: true,
    agentPath: '/agents/insider-risk', color: '#7C3AED' },
  { id: 'RR-003', domain: 'Credit Intelligence', agent: 'credit', severity: 'critical', category: 'Credit / ECL',
    title: '11 override-approved loans — anomaly scores >0.85 — BR-14',
    description: 'LKR 387M in loans with Stage 1 assignment but predicted Stage 2-3. All override-approved by STF-1847. ECL understatement: LKR 310M.',
    exposure: 387000000, owner: 'Head of Credit Risk', dueDate: '2025-12-30',
    status: 'pending', caseRef: 'CASE-001', strRequired: false, cbslRequired: false,
    agentPath: '/agents/credit', color: '#185FA5' },
  { id: 'RR-004', domain: 'Suspense & Reconciliation', agent: 'suspense', severity: 'critical', category: 'Payment Fraud',
    title: 'SUS-017 phantom receivable — LKR 1.24 Bn — 94 days aged',
    description: 'Clearing ratio 0.08 (healthy: 0.95+). 312% growth in 30 days. CBSL 90-day guideline breached. STR eligible.',
    exposure: 1240000000, owner: 'MLCO', dueDate: '2025-12-24',
    status: 'in_progress', caseRef: 'CASE-002', strRequired: true, cbslRequired: true,
    agentPath: '/agents/suspense', color: '#993C1D' },
  { id: 'RR-005', domain: 'Transaction Surveillance', agent: 'transaction', severity: 'critical', category: 'AML / Structuring',
    title: 'NTB-0841-X — 15 CEFT transfers structured below LKR 5M',
    description: 'Structuring score 0.94. 15 transactions in 22 minutes, LKR 4.6M–4.95M. Round-trip: LKR 71.25M returned within 5 days.',
    exposure: 71250000, owner: 'MLCO', dueDate: '2025-12-27',
    status: 'pending', caseRef: 'CASE-004', strRequired: true, cbslRequired: false,
    agentPath: '/agents/transaction', color: '#534AB7' },
  { id: 'RR-006', domain: 'Trade Finance & Treasury', agent: 'trade', severity: 'critical', category: 'TBML',
    title: 'NTB-CORP-0887 — over-invoicing 91% above benchmark (HS 6203)',
    description: 'TBML score 0.91. Duplicate LC applications. Beneficial ownership not disclosed. Estimated illicit flow: LKR 421M.',
    exposure: 421000000, owner: 'Trade Compliance Officer', dueDate: '2025-12-26',
    status: 'in_progress', caseRef: 'CASE-003', strRequired: true, cbslRequired: false,
    agentPath: '/agents/trade', color: '#3B6D11' },
  // High
  { id: 'RR-007', domain: 'MJE Testing', agent: 'mje', severity: 'high', category: 'Financial Reporting',
    title: 'MJE-2026-4205 — midnight, round-number, zero documentation, SoD violation',
    description: 'Risk score 97/100. Midnight Saturday GL entry LKR 120M to Loans Receivable. Same maker and checker. No supporting documents.',
    exposure: 120000000, owner: 'Head of Finance', dueDate: '2026-01-05',
    status: 'pending', caseRef: null, strRequired: false, cbslRequired: false,
    agentPath: '/agents/mje', color: '#0891B2' },
  { id: 'RR-008', domain: "Identity & KYC / AML", agent: 'kyc', severity: 'high', category: 'Regulatory Compliance',
    title: "KYC gap rate 4.7% — 39,290 accounts including 34 PEP",
    description: 'Gap rate exceeds CBSL 2% threshold. 34 PEP accounts with overdue EDD. 847 from HSBC migration batch.',
    exposure: 0, owner: 'Head of KYC Operations', dueDate: '2026-03-18',
    status: 'in_progress', caseRef: 'CASE-005', strRequired: false, cbslRequired: true,
    agentPath: '/agents/kyc', color: '#0F6E56' },
  { id: 'RR-009', domain: 'Digital Fraud & Identity', agent: 'digital', severity: 'high', category: 'Cyber Fraud',
    title: 'DEV-A4F7-9921 shared across 4 accounts — SUS-017 network',
    description: 'Single device used to access 4 accounts linked to the SUS-017 fraud network. Sessions active during CEFT transfer windows.',
    exposure: 0, owner: 'Head of Digital Banking', dueDate: '2025-12-28',
    status: 'pending', caseRef: 'CASE-002', strRequired: false, cbslRequired: false,
    agentPath: '/agents/digital', color: '#993556' },
  { id: 'RR-010', domain: 'Identity & KYC / AML', agent: 'kyc', severity: 'high', category: 'AML',
    title: 'INT-BR14-007 — 34% KYC gap rate on 41 introduced accounts',
    description: 'Single introducer responsible for 14 accounts with gaps, including 2 of the 3 anomalous BR-14 borrowers flagged by Credit Agent.',
    exposure: 0, owner: 'Head of KYC Operations', dueDate: '2025-12-31',
    status: 'pending', caseRef: 'CASE-001', strRequired: false, cbslRequired: false,
    agentPath: '/agents/kyc', color: '#0F6E56' },
  { id: 'RR-011', domain: 'MJE Testing', agent: 'mje', severity: 'high', category: 'Financial Reporting',
    title: "Benford's Law failures — 8 MJE entries — digit '4' over-represented 89%",
    description: "First digit '4' at 14.2% vs expected 9.7%. Pattern consistent with sub-threshold structuring in GL postings to stay below LKR 10M internal materiality review threshold.",
    exposure: 0, owner: 'Head of Finance', dueDate: '2026-01-10',
    status: 'pending', caseRef: null, strRequired: false, cbslRequired: false,
    agentPath: '/agents/mje', color: '#0891B2' },
  // Medium
  { id: 'RR-012', domain: 'Trade Finance & Treasury', agent: 'trade', severity: 'medium', category: 'Liquidity Risk',
    title: 'LCR declined 37% in FY2025 — 320.6% to 203.4%',
    description: 'Both LCR and NSFR declining simultaneously. Driven by 50% loan growth outpacing stable deposit base. ALCO stabilisation plan in progress.',
    exposure: 0, owner: 'CFO', dueDate: '2026-03-31',
    status: 'in_progress', caseRef: 'CASE-006', strRequired: false, cbslRequired: false,
    agentPath: '/agents/trade', color: '#3B6D11' },
  { id: 'RR-013', domain: 'Transaction Surveillance', agent: 'transaction', severity: 'medium', category: 'AML',
    title: "Benford digit '4' deviation — 284,719 transactions",
    description: "First digit '4' at 18.3% vs expected 9.7% across full transaction population. Indicates systematic amount manipulation. 7 structuring clusters identified.",
    exposure: 0, owner: 'MLCO', dueDate: '2026-01-15',
    status: 'pending', caseRef: null, strRequired: false, cbslRequired: false,
    agentPath: '/agents/transaction', color: '#534AB7' },
];

const CATEGORIES = ['All', 'Insider Fraud', 'Credit / ECL', 'Payment Fraud', 'AML / Structuring', 'TBML', 'AML', 'Financial Reporting', 'Regulatory Compliance', 'Cyber Fraud', 'Liquidity Risk'];
const SEVERITIES = ['All', 'critical', 'high', 'medium', 'low'];
const STATUSES = ['All', 'pending', 'in_progress', 'complete'];
const DOMAINS = ['All', 'Credit Intelligence', 'Transaction Surveillance', 'Suspense & Reconciliation', 'Identity & KYC / AML', 'Internal Controls', 'Digital Fraud & Identity', 'Trade Finance & Treasury', 'Insider Risk', 'MJE Testing'];

const SEV_COLORS = { critical: '#DC2626', high: '#D97706', medium: '#185FA5', low: '#16A34A' };
const SEV_BG = { critical: '#FEF0F0', high: '#FFFBEB', medium: '#EBF4FF', low: '#F0FDF4' };
const STATUS_COLORS = { pending: '#9ca3af', in_progress: '#D97706', complete: '#16A34A' };
const STATUS_LABELS = { pending: 'Pending', in_progress: 'In Progress', complete: 'Closed' };

function fmt(dt) { return new Date(dt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); }
function isOverdue(dt, status) { return status !== 'complete' && new Date(dt) < new Date(); }

export default function RiskRegister() {
  const navigate = useNavigate();
  const [category, setCategory] = useState('All');
  const [severity, setSeverity] = useState('All');
  const [status, setStatus] = useState('All');
  const [domain, setDomain] = useState('All');
  const [expanded, setExpanded] = useState(null);

  const filtered = RISK_REGISTER.filter(r =>
    (category === 'All' || r.category === category) &&
    (severity === 'All' || r.severity === severity) &&
    (status === 'All' || r.status === status) &&
    (domain === 'All' || r.domain === domain)
  );

  const openCount = RISK_REGISTER.filter(r => r.status !== 'complete').length;
  const criticalOpen = RISK_REGISTER.filter(r => r.severity === 'critical' && r.status !== 'complete').length;
  const strRequired = RISK_REGISTER.filter(r => r.strRequired && r.status !== 'complete').length;
  const overdue = RISK_REGISTER.filter(r => isOverdue(r.dueDate, r.status)).length;
  const exposureOpen = RISK_REGISTER.filter(r => r.status !== 'complete').reduce((s, r) => s + r.exposure, 0);

  return (
    <div style={{ maxWidth: 1400 }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 14 }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ marginBottom: 5 }}>Risk Register</h2>
            <p style={{ fontSize: 13, color: 'var(--color-text-2)', lineHeight: 1.6, maxWidth: 640 }}>
              All agent findings in a single view — with owner, due date, remediation status, and regulatory obligations. This is the document a Board Audit Committee reviews to confirm findings are being actioned.
            </p>
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-text-3)', padding: '8px 12px', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 8, whiteSpace: 'nowrap' }}>
            FY2025 · Updated: {new Date().toLocaleDateString('en-GB')}
          </div>
        </div>

        {/* Summary metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 10, marginBottom: 16 }}>
          {[
            { label: 'Total findings', value: RISK_REGISTER.length, color: '#185FA5' },
            { label: 'Open / In-Progress', value: openCount, color: '#D97706' },
            { label: 'Critical open', value: criticalOpen, color: '#DC2626' },
            { label: 'STR obligations', value: strRequired, color: '#DC2626' },
            { label: 'Open exposure', value: `LKR ${(exposureOpen / 1e9).toFixed(2)}Bn`, color: '#DC2626' },
          ].map((m, i) => (
            <div key={i} style={{ padding: '10px 14px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 10, borderTop: `3px solid ${m.color}` }}>
              <div style={{ fontSize: 10, color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{m.label}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: m.color, lineHeight: 1 }}>{m.value}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <Filter size={13} style={{ color: 'var(--color-text-3)' }} />
          {[
            { label: 'Severity', value: severity, options: SEVERITIES, set: setSeverity },
            { label: 'Category', value: category, options: CATEGORIES, set: setCategory },
            { label: 'Status', value: status, options: STATUSES, set: setStatus },
          ].map(f => (
            <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ fontSize: 11, color: 'var(--color-text-3)' }}>{f.label}:</span>
              <select value={f.value} onChange={e => f.set(e.target.value)}
                style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid var(--color-border)', fontSize: 11, background: 'var(--color-surface)', fontFamily: 'inherit', cursor: 'pointer' }}>
                {f.options.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
          <span style={{ fontSize: 11, color: 'var(--color-text-3)', marginLeft: 'auto' }}>{filtered.length} of {RISK_REGISTER.length} findings</span>
          {(category !== 'All' || severity !== 'All' || status !== 'All') && (
            <button onClick={() => { setCategory('All'); setSeverity('All'); setStatus('All'); }} style={{ fontSize: 11, color: 'var(--color-text-3)', background: 'none', border: '1px solid var(--color-border)', borderRadius: 6, padding: '3px 8px', cursor: 'pointer' }}>Clear filters</button>
          )}
        </div>
      </div>

      {/* Register table */}
      <div className="agent-panel" style={{ overflow: 'hidden' }}>
        <div className="agent-panel-header">
          <span className="agent-panel-title">All Audit Findings — FY2025</span>
          <InfoTooltip text="Each row is a finding from one of the 9 agents, synthesised into a standardised risk register entry. Click any row to expand the full finding details, including the regulatory obligation and remediation status." position="bottom" width={300} />
        </div>

        {/* Table header */}
        <div style={{ display: 'grid', gridTemplateColumns: '48px 100px 120px 1fr 100px 100px 100px 80px', gap: 0, padding: '8px 16px', background: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-3)' }}>
          <div>ID</div><div>Severity</div><div>Domain</div><div>Finding</div><div>Owner</div><div>Due date</div><div>Status</div><div style={{ textAlign: 'right' }}>Exposure</div>
        </div>

        {/* Rows */}
        {filtered.map((r, i) => {
          const isExp = expanded === r.id;
          const od = isOverdue(r.dueDate, r.status);
          const sc = SEV_COLORS[r.severity];
          const stC = STATUS_COLORS[r.status];
          return (
            <div key={r.id}>
              <div onClick={() => setExpanded(isExp ? null : r.id)}
                style={{ display: 'grid', gridTemplateColumns: '48px 100px 120px 1fr 100px 100px 100px 80px', gap: 0, padding: '10px 16px', borderBottom: '1px solid var(--color-border)', cursor: 'pointer', background: isExp ? `${sc}06` : i % 2 === 0 ? 'transparent' : 'var(--color-surface-2)', transition: 'background 0.1s', alignItems: 'center' }}
                onMouseEnter={e => { if (!isExp) e.currentTarget.style.background = `${sc}06`; }}
                onMouseLeave={e => { if (!isExp) e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'var(--color-surface-2)'; }}>
                <div style={{ fontSize: 10, color: 'var(--color-text-3)', fontFamily: 'monospace' }}>{r.id}</div>
                <div>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: SEV_BG[r.severity], color: sc }}>{r.severity}</span>
                </div>
                <div style={{ fontSize: 11, color: r.color, fontWeight: 500 }}>{r.domain.split(' ')[0]}</div>
                <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text)', paddingRight: 12 }}>{r.title}</div>
                <div style={{ fontSize: 11, color: 'var(--color-text-2)' }}>{r.owner.split(' ')[0]}</div>
                <div style={{ fontSize: 11, color: od ? '#DC2626' : 'var(--color-text-2)', fontWeight: od ? 700 : 400 }}>
                  {od && '⚠ '}{fmt(r.dueDate)}
                </div>
                <div>
                  <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 4, background: `${stC}18`, color: stC }}>{STATUS_LABELS[r.status]}</span>
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: r.exposure > 0 ? '#DC2626' : 'var(--color-text-3)', textAlign: 'right' }}>
                  {r.exposure > 0 ? `${(r.exposure / 1e6).toFixed(0)}M` : '—'}
                </div>
              </div>

              {/* Expanded detail */}
              {isExp && (
                <div style={{ padding: '14px 20px', background: `${sc}04`, borderBottom: `2px solid ${sc}22`, display: 'flex', gap: 24 }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ fontSize: 12, color: 'var(--color-text)', lineHeight: 1.7 }}>{r.description}</div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {r.strRequired && <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', background: '#FEF0F0', color: '#DC2626', borderRadius: 6, border: '1px solid rgba(220,38,38,0.2)' }}>⚠ STR filing required</span>}
                      {r.cbslRequired && <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', background: '#FEF0F0', color: '#DC2626', borderRadius: 6, border: '1px solid rgba(220,38,38,0.2)' }}>⚠ CBSL notification</span>}
                      {r.caseRef && <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', background: 'var(--color-purple-light)', color: 'var(--color-purple)', borderRadius: 6 }}>Case: {r.caseRef}</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0, minWidth: 180 }}>
                    <div style={{ fontSize: 11, color: 'var(--color-text-2)' }}>
                      <div style={{ marginBottom: 3 }}>Owner: <strong>{r.owner}</strong></div>
                      <div style={{ marginBottom: 3 }}>Due: <strong style={{ color: isOverdue(r.dueDate, r.status) ? '#DC2626' : 'var(--color-text)' }}>{fmt(r.dueDate)}</strong></div>
                      <div>Category: <strong>{r.category}</strong></div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => navigate(r.agentPath)} style={{ flex: 1, padding: '6px 10px', borderRadius: 7, fontSize: 11, fontWeight: 600, background: r.color, color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                        View Agent <ChevronRight size={11} />
                      </button>
                      {r.caseRef && (
                        <button onClick={() => navigate('/cases', { state: { caseId: r.caseRef } })} style={{ padding: '6px 10px', borderRadius: 7, fontSize: 11, fontWeight: 600, background: 'var(--color-surface-2)', color: 'var(--color-text-2)', border: '1px solid var(--color-border)', cursor: 'pointer' }}>
                          Case
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px 20px', color: 'var(--color-text-3)', fontSize: 13 }}>
            No findings match the current filters.
          </div>
        )}

        <div style={{ padding: '10px 16px', background: 'var(--color-surface-2)', borderTop: '1px solid var(--color-border)', fontSize: 11, color: 'var(--color-text-3)', display: 'flex', justifyContent: 'space-between' }}>
          <span>Click any row to expand · Findings derived from all 9 Sentinel agents</span>
          <span>Total open exposure: LKR {(exposureOpen / 1e9).toFixed(2)} Bn</span>
        </div>
      </div>

      {/* Remediation velocity */}
      <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
        {[
          { label: 'Critical findings', total: RISK_REGISTER.filter(r=>r.severity==='critical').length, closed: RISK_REGISTER.filter(r=>r.severity==='critical' && r.status==='complete').length, color: '#DC2626' },
          { label: 'High findings', total: RISK_REGISTER.filter(r=>r.severity==='high').length, closed: RISK_REGISTER.filter(r=>r.severity==='high' && r.status==='complete').length, color: '#D97706' },
          { label: 'STR obligations', total: RISK_REGISTER.filter(r=>r.strRequired).length, closed: RISK_REGISTER.filter(r=>r.strRequired && r.status==='complete').length, color: '#DC2626' },
        ].map((m, i) => {
          const pct = m.total === 0 ? 0 : Math.round((m.closed / m.total) * 100);
          return (
            <div key={i} style={{ padding: '14px 16px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: 'var(--color-text-2)' }}>{m.label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: m.color }}>{m.closed}/{m.total} closed</span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: 'var(--color-surface-2)', overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: pct === 100 ? '#16A34A' : m.color, borderRadius: 3, transition: 'width 0.5s ease' }} />
              </div>
              <div style={{ fontSize: 10, color: 'var(--color-text-3)', marginTop: 4, textAlign: 'right' }}>{pct}% remediated</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCasesForEntity, CASE_SEV_COLOR, CASE_STATUS_COLOR } from '../../data/caseRegistry.js';
import { X, ChevronRight, AlertTriangle, GitMerge, Zap, Info, Clock, BookOpen, CheckCircle, ArrowRight, Microscope, Shield } from 'lucide-react';
import { useApp } from '../../context/AppContext.jsx';
import { demoData } from '../../data/demoData.js';
import InfoTooltip from './InfoTooltip.jsx';

// ─── ENTITY EXTRACTION ────────────────────────────────────────────────────────

const ENTITY_REGEX = [
  /\bBR-\d+\b/g,
  /\bSUS-[A-Z0-9-]+\b/g,
  /\bSTF-\d+\b/g,
  /\bNTB-CR-\d{4}-\d+\b/g,
  /\bNTB-CORP-\d+\b/g,
  /\bNTB-C-\d+-[A-Z]\b/g,
  /\bNTB-\d{4}-[A-Z]\b/g,
  /\bINT-BR\d+-\d+\b/g,
  /\bDEV-[A-Z0-9]+-\d+\b/g,
  /\bMJE-\d{4}-\d+\b/g,
];

function extractEntities(text) {
  if (!text) return new Set();
  const entities = new Set();
  ENTITY_REGEX.forEach(re => {
    const matches = text.match(re) || [];
    matches.forEach(m => entities.add(m));
  });
  return entities;
}

// ─── AGENT META ───────────────────────────────────────────────────────────────

const AGENT_META = {
  credit:      { name: 'Credit Intelligence',       color: '#185FA5', icon: '◈', path: '/agents/credit',       methodology: 'Isolation Forest across 8 features (DPD, collateral ratio, restructure count, sector NPL, override flag, exposure vs cohort, origination quarter, customer risk rating). Scores 0.0–1.0.' },
  transaction: { name: 'Transaction Surveillance',  color: '#534AB7', icon: '⟳', path: '/agents/transaction',  methodology: "Benford's Law first-digit test across all transactions, structuring cluster detection (3+ txns below threshold, combined >threshold within 24h), velocity scoring vs 90-day rolling baseline, network graph hub-and-spoke analysis." },
  suspense:    { name: 'Suspense & Reconciliation', color: '#993C1D', icon: '⊟', path: '/agents/suspense',    methodology: 'Daily growth-rate × clearing-ratio analysis per account. Flags: growth >50% in 30d, clearing ratio <0.30, aging >90d (CBSL breach). Phantom receivable score combines all three.' },
  kyc:         { name: 'Identity & KYC / AML',      color: '#0F6E56', icon: '✦', path: '/agents/kyc',         methodology: '47-rule CDD compliance engine applied to every account nightly. Rules cover: document expiry, PEP EDD status, FATF-country exposure, beneficial ownership, introducer concentration, dormant reactivation.' },
  controls:    { name: 'Internal Controls',         color: '#854F0B', icon: '⚙', path: '/agents/controls',    methodology: '6-dimension composite score per branch: override rate (25%), SoD violations (20%), approval turnaround (15%), off-hours approvals (15%), approver concentration (15%), temporal clustering (10%).' },
  digital:     { name: 'Digital Fraud & Identity',  color: '#993556', icon: '⊕', path: '/agents/digital',     methodology: 'Behavioral biometrics against 14-month session baseline. Geographic velocity vs Sri Lanka city-pair travel times. Device fingerprint clustering across accounts. Anomaly score per session 0–100.' },
  trade:       { name: 'Trade Finance & Treasury',  color: '#3B6D11', icon: '◎', path: '/agents/trade',       methodology: 'HS code price benchmarking vs UN COMTRADE + Sri Lanka Customs medians (flag: >25% deviation). Duplicate LC detection on overlapping shipment periods. FX position vs approved limit monitoring.' },
  insider:     { name: 'Insider Risk',              color: '#7C3AED', icon: '◉', path: '/agents/insider-risk', methodology: 'Staff risk scoring across 6 dimensions: SoD violations (25%), override concentration (20%), off-hours activity (18%), same-cluster approvals (18%), approval turnaround anomaly (12%), session deviation (7%).' },
  mje:         { name: 'MJE Testing',               color: '#0891B2', icon: '⊞', path: '/agents/mje',          methodology: 'Full-population MJE testing: timing flags (after-hours, weekend, month-end), amount anomalies (round numbers, Benford deviation), GL sensitivity (suspense/capital/intercompany), maker-checker SoD, document completeness.' },
  orchestrator:{ name: 'Orchestrator',              color: '#534AB7', icon: '◎', path: '/command-centre',      methodology: 'Receives signal feeds from all agents. Identifies entities appearing in 2+ agent feeds simultaneously. Combined severity = max(individual) + 0.25 bonus (3+ agents). Threshold for case-worthy: 0.85.' },
};

const SEV_PALETTE = {
  critical: { bg: '#FEF0F0', border: '#FECACA', badge: '#DC2626', text: '#991B1B' },
  high:     { bg: '#FFFBEB', border: '#FDE68A', badge: '#D97706', text: '#92400E' },
  medium:   { bg: '#EBF4FF', border: '#BFDBFE', badge: '#2563EB', text: '#1D4ED8' },
  low:      { bg: '#F0FDF4', border: '#BBF7D0', badge: '#16A34A', text: '#166534' },
};

// ─── SLA CONFIG ───────────────────────────────────────────────────────────────

const SLA_CONFIG = {
  critical: { label: 'Immediate — within 4 hours', hours: 4, color: '#DC2626' },
  high:     { label: 'Urgent — within 24 hours',   hours: 24, color: '#D97706' },
  medium:   { label: 'Within 5 business days',      hours: 120, color: '#185FA5' },
  low:      { label: 'Next scheduled audit cycle',  hours: 720, color: '#3B6D11' },
};

// ─── RELATED CARD ─────────────────────────────────────────────────────────────

function RelatedCard({ finding, agentId, sharedEntities, onClick }) {
  const meta = AGENT_META[agentId] || AGENT_META.credit;
  const sev = finding.severity || 'medium';
  const pal = SEV_PALETTE[sev] || SEV_PALETTE.medium;
  const exposure = finding.affected_exposure_lkr || finding.affected_balance_lkr || 0;
  const matching = [...sharedEntities].filter(e => (finding.finding || '').includes(e));

  return (
    <div onClick={onClick}
      style={{ padding: '12px 14px', border: `1px solid ${pal.border}`, borderLeft: `3px solid ${pal.badge}`, borderRadius: 8, cursor: 'pointer', background: 'var(--color-surface)', transition: 'all 0.15s', marginBottom: 8 }}
      onMouseEnter={e => { e.currentTarget.style.background = pal.bg; e.currentTarget.style.transform = 'translateX(2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-surface)'; e.currentTarget.style.transform = 'translateX(0)'; }}
    >
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: meta.color, display: 'flex', alignItems: 'center', gap: 4 }}>
          {meta.icon} {meta.name}
        </span>
        <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 10, background: pal.badge, color: 'white' }}>{sev}</span>
        {exposure > 0 && <span style={{ fontSize: 11, color: pal.text, marginLeft: 'auto', fontWeight: 600 }}>LKR {exposure >= 1e9 ? (exposure / 1e9).toFixed(2) + ' Bn' : (exposure / 1e6).toFixed(0) + 'M'}</span>}
        <ChevronRight size={12} style={{ color: 'var(--color-text-3)', marginLeft: exposure > 0 ? 0 : 'auto', flexShrink: 0 }} />
      </div>
      <div style={{ fontSize: 12, color: 'var(--color-text)', lineHeight: 1.5, marginBottom: matching.length ? 6 : 0 }}>
        {(finding.finding || '').substring(0, 130)}{(finding.finding || '').length > 130 ? '…' : ''}
      </div>
      {matching.length > 0 && (
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 4 }}>
          <span style={{ fontSize: 10, color: 'var(--color-text-3)' }}>Shared:</span>
          {matching.map(e => (
            <span key={e} style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', background: `${meta.color}15`, color: meta.color, borderRadius: 4 }}>{e}</span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── MAIN DRAWER ─────────────────────────────────────────────────────────────

export default function GlobalFindingDrawer() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('detail');
  const active = state.activeFinding;

  const allAgentFindings = useMemo(() => {
    const result = [];
    Object.keys(AGENT_META).forEach(agentId => {
      if (agentId === 'orchestrator') return;
      const data = state.agentResults[agentId] || demoData[agentId];
      if (!data) return;
      (data.key_findings || []).forEach(f => result.push({ finding: f, agentId }));
    });
    return result;
  }, [state.agentResults]);

  const orchData = state.orchestratorResult || demoData.orchestrator;

  const close = () => { dispatch({ type: 'CLOSE_FINDING' }); setActiveTab('detail'); };

  if (!active) return null;

  const { finding, agentId, agentName, agentColor, agentData } = active;
  const meta = AGENT_META[agentId] || { name: agentName || 'Agent', color: agentColor || '#185FA5', icon: '◎', path: '/agents', methodology: '' };

  // Compute linked cases at drawer scope so both context tab AND footer can use it
  const linkedCases = React.useMemo(() => {
    if (!finding) return [];
    const searchText = [
      finding.finding, finding.description, finding.entity,
      finding.account_id, finding.loan_id, finding.staff_id,
      finding.branch_code, finding.transaction_id, finding.document_id,
    ].filter(Boolean).join(' ');
    const matches = searchText.match(/\b(BR-\d+|STF-\d+|SUS-[A-Z0-9-]+|NTB-CORP-\d+|MJE-\d{4}-\d+|NTB-\d{4}-[A-Z]|NTB-0841-X|NTB-3312-B)/g) || [];
    const all = matches.flatMap(e => getCasesForEntity(e));
    return all.filter((cas, i, arr) => arr.findIndex(x => x.id === cas.id) === i);
  }, [finding]);
  const sev = finding.severity || 'medium';
  const pal = SEV_PALETTE[sev] || SEV_PALETTE.medium;
  const exposure = finding.affected_exposure_lkr || finding.affected_balance_lkr || 0;
  const slaConfig = SLA_CONFIG[sev] || SLA_CONFIG.medium;

  const myEntities = extractEntities((finding.finding || '') + ' ' + (finding.recommended_action || ''));

  const related = allAgentFindings.filter(({ finding: f, agentId: aid }) => {
    if (aid === agentId) return false;
    const theirText = (f.finding || '') + ' ' + (f.recommended_action || '');
    return [...myEntities].some(e => theirText.includes(e));
  });

  const relatedCorrelations = (orchData?.correlations || []).filter(c => {
    const text = c.narrative + ' ' + c.shared_entity_id;
    return [...myEntities].some(e => text.includes(e)) || myEntities.has(c.shared_entity_id);
  });

  const orchSignals = (agentData?.orchestrator_signals || []);
  const connectedCount = related.length + relatedCorrelations.length;

  const tabs = [
    { id: 'detail',    label: 'Finding Detail' },
    { id: 'connected', label: 'Connected', count: connectedCount },
    { id: 'signals',   label: 'Signals', count: orchSignals.length },
    { id: 'context',   label: 'Context' },
  ];

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 600, display: 'flex' }} onClick={close}>
      <div style={{ flex: 1, background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(2px)' }} />
      <div onClick={e => e.stopPropagation()} className="animate-slide-in"
        style={{ width: 560, background: 'var(--color-surface)', borderLeft: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', boxShadow: '-12px 0 48px rgba(0,0,0,0.16)', overflowY: 'hidden' }}>

        {/* ── HEADER ── */}
        <div style={{ padding: '18px 24px', background: pal.bg, borderBottom: '1px solid var(--color-border)', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 12 }}>
            <div style={{ flex: 1 }}>
              {/* Severity + agent + connected count */}
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '3px 10px', borderRadius: 20, background: pal.badge, color: 'white' }}>{sev}</span>
                <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: `${meta.color}18`, color: meta.color, display: 'flex', alignItems: 'center', gap: 5 }}>
                  {meta.icon} {meta.name}
                </span>
                {connectedCount > 0 && (
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 9px', borderRadius: 10, background: 'var(--color-purple-light)', color: 'var(--color-purple)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <GitMerge size={10} /> {connectedCount} connected
                    <InfoTooltip text="Number of findings from other agents that mention the same entity IDs as this finding. Multi-agent confirmation significantly increases combined severity." position="bottom" width={260} />
                  </span>
                )}
              </div>
              {/* Exposure */}
              {exposure > 0 && (
                <div style={{ display: 'inline-flex', gap: 5, alignItems: 'center', padding: '4px 10px', background: `${pal.badge}18`, borderRadius: 7, fontSize: 12, fontWeight: 700, color: pal.badge, marginBottom: 10 }}>
                  <AlertTriangle size={12} />
                  LKR {exposure >= 1e9 ? (exposure / 1e9).toFixed(2) + ' Bn' : (exposure / 1e6).toFixed(0) + ' Mn'} exposure
                  <InfoTooltip text="Total value of assets or transactions directly affected by this finding. This is the maximum exposure envelope — confirmed loss may be lower after investigation." position="right" width={260} />
                </div>
              )}
            </div>
            <button onClick={close} style={{ padding: 6, cursor: 'pointer', color: 'var(--color-text-3)', background: 'rgba(0,0,0,0.05)', border: 'none', borderRadius: 6, flexShrink: 0 }}>
              <X size={16} />
            </button>
          </div>

          {/* SLA + entity chips in one row */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', background: `${slaConfig.color}10`, border: `1px solid ${slaConfig.color}28`, borderRadius: 6 }}>
              <Clock size={11} style={{ color: slaConfig.color }} />
              <span style={{ fontSize: 10, fontWeight: 600, color: slaConfig.color }}>{slaConfig.label}</span>
              <InfoTooltip text="Recommended response timeframe based on severity. Critical = P1, requires immediate escalation and action. Times start from when the finding is first identified." position="right" width={260} />
            </div>
            {[...myEntities].map(e => (
              <span key={e} style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', background: `${meta.color}12`, color: meta.color, borderRadius: 4, border: `1px solid ${meta.color}22` }}>{e}</span>
            ))}
          </div>
        </div>

        {/* ── TABS ── */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', flexShrink: 0 }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{ flex: 1, padding: '10px 4px', fontSize: 11, fontWeight: activeTab === tab.id ? 600 : 400, color: activeTab === tab.id ? meta.color : 'var(--color-text-2)', background: activeTab === tab.id ? `${meta.color}08` : 'transparent', borderBottom: `2px solid ${activeTab === tab.id ? meta.color : 'transparent'}`, border: 'none', cursor: 'pointer', transition: 'all 0.12s' }}>
              {tab.label}
              {tab.count > 0 && activeTab !== tab.id && (
                <span style={{ marginLeft: 4, fontSize: 10, fontWeight: 700, padding: '0 5px', background: tab.id === 'connected' ? 'var(--color-purple)' : meta.color, color: 'white', borderRadius: 10 }}>{tab.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* ── BODY ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* ════ DETAIL TAB ════ */}
          {activeTab === 'detail' && (
            <>
              {/* Finding narrative */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-text-3)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  What was detected
                  <InfoTooltip text="The exact finding produced by this agent after analysing the data. In demo mode this reflects NTB FY2025 data. In live mode it is generated by Claude after analysing your uploaded CSV." position="right" width={260} />
                </div>
                <div style={{ fontSize: 14, color: 'var(--color-text)', lineHeight: 1.8, padding: '16px 18px', background: pal.bg, border: `1px solid ${pal.border}`, borderLeft: `4px solid ${pal.badge}`, borderRadius: 10 }}>
                  {finding.finding}
                </div>
              </div>

              {/* Severity context bar */}
              <div style={{ padding: '12px 16px', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-text-3)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    Severity in context
                    <InfoTooltip text="Where this finding sits on the severity spectrum. Critical findings require immediate escalation. The bar shows position relative to all possible severity levels." position="right" width={250} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 800, color: pal.badge, padding: '2px 10px', background: pal.bg, border: `1px solid ${pal.border}`, borderRadius: 20 }}>{sev.toUpperCase()}</span>
                </div>
                <div style={{ position: 'relative', height: 8, borderRadius: 4, background: 'linear-gradient(90deg, #16A34A, #EF9F27, #D97706, #DC2626)', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, background: 'rgba(255,255,255,0.55)' }} />
                  <div style={{ position: 'absolute', left: sev === 'low' ? '10%' : sev === 'medium' ? '35%' : sev === 'high' ? '62%' : '85%', top: '50%', transform: 'translate(-50%,-50%)', width: 14, height: 14, borderRadius: '50%', background: pal.badge, border: '2px solid white', boxShadow: `0 0 8px ${pal.badge}88` }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 9, color: 'var(--color-text-3)' }}>
                  <span>Low</span><span>Medium</span><span>High</span><span>Critical</span>
                </div>
              </div>

              {/* Recommended action */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-text-3)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  Recommended action
                  <InfoTooltip text="Specific action required to resolve this finding. Actions are ranked by urgency. Failure to act within the SLA window may result in regulatory consequences or escalating losses." position="right" width={270} />
                </div>
                <div style={{ padding: '14px 16px', background: `${pal.badge}08`, border: `1px solid ${pal.badge}28`, borderLeft: `3px solid ${pal.badge}`, borderRadius: 10, fontSize: 13, color: 'var(--color-text)', lineHeight: 1.75, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <Zap size={15} style={{ color: pal.badge, flexShrink: 0, marginTop: 2 }} />
                  {finding.recommended_action || 'Escalate to Compliance for manual review and determination of action.'}
                </div>
              </div>

              {/* Entity block */}
              {myEntities.size > 0 && (
                <div style={{ padding: '12px 16px', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-text-3)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                    Entities involved
                    <InfoTooltip text="Recognisable IDs extracted from the finding text — branches, accounts, staff members, loans, introducers. Entities that appear in findings from other agents create cross-agent correlations." position="right" width={280} />
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: connectedCount > 0 ? 10 : 0 }}>
                    {[...myEntities].map(e => (
                      <span key={e} style={{ fontSize: 12, fontWeight: 700, padding: '4px 10px', background: `${meta.color}12`, color: meta.color, borderRadius: 6, border: `1px solid ${meta.color}28` }}>{e}</span>
                    ))}
                  </div>
                  {connectedCount > 0 && (
                    <div style={{ fontSize: 12, color: 'var(--color-text-2)', lineHeight: 1.6 }}>
                      These entities appear in <strong style={{ color: 'var(--color-purple)' }}>{connectedCount} finding{connectedCount !== 1 ? 's' : ''}</strong> from other agents.{' '}
                      <button onClick={() => setActiveTab('connected')} style={{ background: 'none', border: 'none', color: 'var(--color-purple)', fontWeight: 600, cursor: 'pointer', fontSize: 12, textDecoration: 'underline' }}>See connected →</button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* ════ CONNECTED TAB ════ */}
          {activeTab === 'connected' && (
            <>
              {connectedCount === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--color-text-3)' }}>
                  <GitMerge size={28} style={{ marginBottom: 12, opacity: 0.3 }} />
                  <div style={{ fontSize: 13 }}>No connected findings for the entities in this finding.</div>
                  <div style={{ fontSize: 11, marginTop: 6 }}>This finding's entities don't appear in findings from other agents yet.</div>
                </div>
              ) : (
                <>
                  {/* Why connections matter */}
                  <div style={{ padding: '10px 14px', background: 'var(--color-purple-light)', border: '1px solid rgba(83,74,183,0.2)', borderRadius: 8, fontSize: 12, color: 'var(--color-purple)', lineHeight: 1.6, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <GitMerge size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                    <div>
                      When multiple agents independently flag the same entity, the combined risk is significantly higher than any single finding — multi-agent corroboration is statistically powerful evidence. Click any connected finding to navigate into it.
                      <InfoTooltip text="The Orchestrator uses multi-agent confirmation as a severity multiplier. Two agents flagging the same branch adds 0.15 to the combined severity; three or more agents adds 0.25." position="right" width={280} />
                    </div>
                  </div>

                  {/* Orchestrator correlations */}
                  {relatedCorrelations.length > 0 && (
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-purple)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <GitMerge size={12} /> Orchestrator Correlations
                        <InfoTooltip text="Formal cross-agent correlations identified by the Orchestrator for the same entities. These carry a combined severity score that accounts for multi-agent confirmation." position="right" width={280} />
                      </div>
                      {relatedCorrelations.map((corr, i) => (
                        <div key={i} style={{ padding: '12px 14px', background: 'var(--color-purple-light)', border: '1px solid rgba(83,74,183,0.25)', borderRadius: 10, marginBottom: 8 }}>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-purple)', flex: 1 }}>{corr.fraud_type_suspected}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ fontSize: 13, fontWeight: 900, color: corr.combined_severity >= 0.95 ? '#DC2626' : '#D97706' }}>{(corr.combined_severity * 100).toFixed(0)}%</span>
                              <span style={{ fontSize: 10, color: 'var(--color-text-3)' }}>combined severity</span>
                              <InfoTooltip text="Combined severity after multi-agent confirmation bonus is applied. Above 85% is case-worthy. Above 95% is emergency response level." position="left" width={250} />
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 8 }}>
                            {(corr.agents_involved || []).map(a => (
                              <span key={a} style={{ fontSize: 10, padding: '1px 6px', background: 'rgba(83,74,183,0.12)', color: 'var(--color-purple)', borderRadius: 4 }}>{a}</span>
                            ))}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--color-text-2)', lineHeight: 1.5 }}>{corr.narrative.substring(0, 180)}…</div>
                          {corr.case_worthy && (
                            <div style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10, fontWeight: 700, padding: '2px 8px', background: '#DC2626', color: 'white', borderRadius: 4 }}>
                              CASE OPENED
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Related findings from other agents */}
                  {related.length > 0 && (
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-text-3)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                        Related findings across agents
                        <InfoTooltip text="Findings from other agents that mention the same entity IDs as this finding. Each one independently reached its conclusion — the overlap is what makes these findings significant." position="right" width={280} />
                      </div>
                      {related.map(({ finding: f, agentId: aid }, i) => (
                        <RelatedCard key={i} finding={f} agentId={aid} sharedEntities={myEntities}
                          onClick={() => {
                            const sourceMeta = AGENT_META[aid];
                            const sourceData = state.agentResults[aid] || demoData[aid];
                            dispatch({ type: 'OPEN_FINDING', payload: { finding: f, agentId: aid, agentName: sourceMeta?.name, agentColor: sourceMeta?.color, agentData: sourceData } });
                          }}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* ════ SIGNALS TAB ════ */}
          {activeTab === 'signals' && (
            <>
              <div style={{ padding: '10px 14px', background: `${meta.color}06`, border: `1px solid ${meta.color}18`, borderRadius: 8, fontSize: 12, color: 'var(--color-text-2)', lineHeight: 1.6, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <Info size={14} style={{ color: meta.color, flexShrink: 0, marginTop: 1 }} />
                <div>
                  Orchestrator signals from the <strong style={{ color: meta.color }}>{meta.name}</strong> — forwarded to peer agents for cross-domain investigation. When a peer agent receives a signal, it prioritises the named entity in its own analysis.
                  <InfoTooltip text="Each signal targets a specific agent and entity. Signals enable the Orchestrator to build cross-agent correlations when independent agents flag the same entity." position="right" width={270} />
                </div>
              </div>

              {orchSignals.length > 0 ? orchSignals.map((sig, i) => {
                const targetMeta = AGENT_META[sig.target_agent] || { color: '#534AB7', name: sig.target_agent, icon: '◎' };
                const sigColor = sig.severity === 'critical' ? '#DC2626' : sig.severity === 'high' ? '#D97706' : '#185FA5';
                return (
                  <div key={i} style={{ padding: '12px 14px', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 8 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, color: targetMeta.color }}>
                        <ArrowRight size={12} /> {targetMeta.name || sig.target_agent}
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', background: sigColor, color: 'white', borderRadius: 4 }}>{sig.severity}</span>
                      <code style={{ fontSize: 11, marginLeft: 'auto', background: `${targetMeta.color}12`, padding: '1px 6px', borderRadius: 4, color: targetMeta.color }}>{sig.shared_entity_id}</code>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--color-text)', lineHeight: 1.6 }}>{sig.description}</div>
                  </div>
                );
              }) : (
                <div style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-3)', fontSize: 13 }}>
                  No orchestrator signals from this finding yet.
                </div>
              )}
            </>
          )}

          {/* ════ CONTEXT TAB ════ */}
          {activeTab === 'context' && (
            <>
              {/* Detection methodology */}
              {meta.methodology && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-text-3)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Microscope size={12} /> Detection Methodology
                    <InfoTooltip text="How this agent detected the finding — the specific algorithm, rules, or scoring method used. Understanding the methodology helps assess confidence and identify what data to review manually." position="right" width={270} />
                  </div>
                  <div style={{ padding: '14px 16px', background: '#F3F1FF', border: '1px solid rgba(83,74,183,0.2)', borderRadius: 10, fontSize: 12, color: '#534AB7', lineHeight: 1.8 }}>
                    {meta.methodology}
                  </div>
                </div>
              )}

              {/* Regulatory framework */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-text-3)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <BookOpen size={12} /> Regulatory Framework
                  <InfoTooltip text="The Sri Lankan regulatory requirements that make this finding material. CBSL, FTRA, and SLFRS 9 requirements determine what actions the bank is legally obligated to take." position="right" width={270} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    agentId === 'credit' && { label: 'SLFRS 9', body: 'Sri Lanka\'s adoption of IFRS 9 requires that Expected Credit Loss (ECL) provisions accurately reflect the loan\'s stage classification. Misstaging reduces provisions, potentially understating regulatory capital requirements.' },
                    agentId === 'transaction' && { label: 'FTRA — Section 7', body: 'Sri Lanka\'s Financial Transactions Reporting Act makes structuring (deliberately breaking transactions below the LKR 5M STR threshold) a criminal offence. Banks must file STRs with the CBSL FIU within 5 working days of identifying suspicious activity.' },
                    agentId === 'suspense' && { label: 'CBSL Suspense Guidelines', body: 'CBSL requires all suspense balances aged beyond 90 days to be escalated to the Board Audit Committee. Balances showing phantom receivable characteristics (high growth + low clearing ratio) are independently STR-eligible under FTRA.' },
                    agentId === 'kyc' && { label: 'CBSL KYC/AML Direction', body: 'CBSL Direction on Customer Due Diligence requires banks to perform CDD on all customers and maintain current records. PEP accounts require Enhanced Due Diligence with annual review. Material KYC gaps on legal entities require beneficial ownership disclosure.' },
                    agentId === 'controls' && { label: 'CBSL Direction No. 5/2024', body: 'Requires that no single staff member has end-to-end control over any credit or payment transaction (Segregation of Duties). SoD violations at the level observed constitute a material control failure requiring regulatory disclosure.' },
                    agentId === 'digital' && { label: 'CBSL Circular No. 2/2025', body: 'Requires banks to implement enhanced authentication controls for high-value digital transactions. Account Takeover via SIM swap is classified as a reportable fraud event. Institutions must maintain session logs for 3 years.' },
                    agentId === 'trade' && { label: 'FATF TBML Guidance (2020)', body: 'FATF identifies trade-based money laundering (over/under-invoicing) as the primary method globally for cross-border value transfer. CBSL requires banks to perform invoice plausibility checks on all LC-financed trade transactions.' },
                    agentId === 'insider' && { label: 'CBSL Direction No. 5/2024', body: 'Banks must ensure SoD on all credit and payment transactions. Material fraud must be reported to CBSL. Employee access logs must be preserved for forensic investigation. Insider fraud above regulatory thresholds triggers mandatory regulatory notification.' },
                    agentId === 'mje' && { label: 'CBSL Financial Reporting Requirements', body: 'Manual journal entries above the materiality threshold (LKR 10M) require Maker-Checker approval from different individuals. After-hours postings to sensitive GL accounts require documented emergency authorisation. All MJE supporting documents must be retained for 7 years.' },
                  ].filter(Boolean).map((item, i) => (
                    <div key={i} style={{ padding: '12px 14px', background: '#FFFBEB', border: '1px solid rgba(133,79,11,0.2)', borderRadius: 8 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#854F0B', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Shield size={11} /> {item.label}
                      </div>
                      <div style={{ fontSize: 12, color: '#854F0B', lineHeight: 1.7 }}>{item.body}</div>
                    </div>
                  ))}
                  {!['credit','transaction','suspense','kyc','controls','digital','trade','insider','mje'].includes(agentId) && (
                    <div style={{ padding: '12px 14px', background: '#FFFBEB', border: '1px solid rgba(133,79,11,0.2)', borderRadius: 8, fontSize: 12, color: '#854F0B', lineHeight: 1.7 }}>
                      This finding should be reviewed against applicable CBSL directions, FTRA requirements, and SLFRS 9 where relevant to the affected entity.
                    </div>
                  )}
                </div>
              </div>

              {/* Next steps checklist */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-text-3)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  Immediate next steps
                  <InfoTooltip text="Standard response steps for a finding at this severity level. These are in addition to any specific recommended action above." position="right" width={250} />
                </div>
                {[
                  { text: sev === 'critical' ? 'Escalate to Head of Compliance and Chief Audit Executive immediately' : 'Assign to appropriate compliance or audit team', urgent: sev === 'critical' },
                  { text: 'Open a formal case in Case Manager and assign an SLA deadline', urgent: false },
                  { text: connectedCount > 0 ? `Review ${connectedCount} connected findings from other agents — multi-agent pattern confirmed` : 'Check if any related findings exist across other agent modules', urgent: connectedCount > 0 },
                  { text: 'Document evidence and preserve system logs before any access changes', urgent: false },
                  { text: sev === 'critical' || sev === 'high' ? 'Assess STR/SAR filing obligation under FTRA within 5 working days' : 'Schedule for review at next audit cycle', urgent: false },
                ].map((step, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '8px 0', borderBottom: i < 4 ? '1px solid var(--color-border)' : 'none' }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${step.urgent ? pal.badge : 'var(--color-border-strong)'}`, background: step.urgent ? pal.bg : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                      <span style={{ fontSize: 9, fontWeight: 800, color: step.urgent ? pal.badge : 'var(--color-text-3)' }}>{i + 1}</span>
                    </div>
                    <span style={{ fontSize: 12, color: step.urgent ? pal.text : 'var(--color-text-2)', fontWeight: step.urgent ? 600 : 400, lineHeight: 1.5 }}>{step.text}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* ── FOOTER ── */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--color-border)', display: 'flex', gap: 10, flexShrink: 0, background: 'var(--color-surface)' }}>
          <button onClick={() => { navigate(meta.path); close(); }} className="btn btn-primary" style={{ background: meta.color, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
            Open {meta.name} <ChevronRight size={15} />
          </button>
          <button onClick={() => { navigate('/cases', { state: { caseId: linkedCases[0]?.id } }); close(); }} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            Cases
          </button>
        </div>
      </div>
    </div>
  );
}

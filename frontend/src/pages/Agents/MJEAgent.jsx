import React, { useState } from 'react';
import AgentModule from '../../components/shared/AgentModule.jsx';
import ExplainerBox from '../../components/shared/ExplainerBox.jsx';
import InfoTooltip from '../../components/shared/InfoTooltip.jsx';
import { VisualFindingCard, InsightBox, StatCard, PanelWithMethod } from '../../components/shared/VisualComponents.jsx';
import { CoverageStatement } from '../../components/shared/VisualComponents.jsx';
import { demoData } from '../../data/demoData.js';
import useOpenFinding from '../../hooks/useOpenFinding.js';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { ChevronDown, ChevronUp, AlertTriangle, CheckCircle, Clock, FileX, Zap } from 'lucide-react';

const COLOR = '#0891B2';
const SCHEMA = {
  agentName: 'MJE Testing',
  required: ['entry_id', 'gl_account', 'amount_lkr', 'maker_id', 'checker_id', 'timestamp'],
  optional: ['gl_name', 'staff_id', 'department', 'day_of_week', 'document_ref', 'reversal_flag', 'description'],
};

// ─── STATUS / SEVERITY HELPERS ────────────────────────────────────────────────

function statusColor(status) {
  if (status === 'Escalated') return { bg: '#FEF0F0', text: '#991B1B', badge: '#DC2626' };
  if (status === 'Flagged')   return { bg: '#FFFBEB', text: '#92400E', badge: '#D97706' };
  if (status === 'Under Review') return { bg: '#EBF4FF', text: '#1D4ED8', badge: '#2563EB' };
  return { bg: '#F0FDF4', text: '#166534', badge: '#16A34A' };
}

function riskColor(score) {
  if (score >= 80) return '#DC2626';
  if (score >= 60) return '#D97706';
  if (score >= 40) return '#EF9F27';
  return '#16A34A';
}

// ─── MJE EXPANDED ROW ─────────────────────────────────────────────────────────

function MJEExpandedRow({ entry }) {
  const sc = statusColor(entry.status);
  return (
    <div className="animate-fade-in" style={{ background: 'var(--color-surface-2)', borderTop: '1px solid var(--color-border)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0 }}>

        {/* Col 1 — GL lines & risk score */}
        <div style={{ padding: '16px 20px', borderRight: '1px solid var(--color-border)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-text-3)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 5 }}>
            GL Entry Lines
            <InfoTooltip text="The double-entry accounting lines — debit account and credit account. A suspicious debit/credit pair (e.g. suspense account to external account) is a primary fraud indicator." position="right" width={240} />
          </div>
          <div style={{ marginBottom: 12 }}>
            {[
              { type: 'Debit', account: entry.debit_account, color: '#DC2626' },
              { type: 'Credit', account: entry.credit_account, color: '#16A34A' },
            ].map(line => (
              <div key={line.type} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '8px 12px', marginBottom: 5, background: 'white', borderRadius: 8, border: '1px solid var(--color-border)' }}>
                <span style={{ fontSize: 10, fontWeight: 700, width: 36, color: line.color }}>{line.type}</span>
                <code style={{ fontSize: 11, color: 'var(--color-text)' }}>{line.account}</code>
              </div>
            ))}
          </div>
          {/* Risk score mini gauge */}
          <div style={{ padding: '10px 12px', background: `${riskColor(entry.risk_score)}08`, border: `1px solid ${riskColor(entry.risk_score)}22`, borderRadius: 8 }}>
            {/* Audit Opinion Banner */}
            <div style={{ padding:'10px 16px', background:'#0891B208', border:`1px solid #0891B225`, borderRadius:10, display:'flex', gap:10, alignItems:'flex-start', marginBottom:0 }}>
              <div style={{ fontSize:10, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.08em', padding:'3px 9px', borderRadius:5, background:'#0891B2', color:'white', flexShrink:0, marginTop:1 }}>
                QUALIFIED
              </div>
              <div style={{ fontSize:12, color:'#0891B2', lineHeight:1.65 }}>
                In our opinion, manual journal entry controls are PARTIALLY EFFECTIVE. MJE-2026-4205 (risk score 97/100) represents a critical control failure — midnight round-number entry with SoD violation and no documentation. 8 Benford failures detected.
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-3)' }}>Risk Score</span>
              <span style={{ fontSize: 22, fontWeight: 900, color: riskColor(entry.risk_score) }}>{entry.risk_score}<span style={{ fontSize: 11, fontWeight: 400, color: 'var(--color-text-3)' }}>/100</span></span>
            </div>
            <div style={{ height: 6, borderRadius: 3, background: 'var(--color-surface-2)', overflow: 'hidden' }}>
              <div style={{ width: `${entry.risk_score}%`, height: '100%', background: riskColor(entry.risk_score), borderRadius: 3 }} />
            </div>
          </div>
          {/* Document completeness */}
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-text-3)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
              Document Completeness
              <InfoTooltip text="Percentage of required supporting documents present: Invoice, Approval email, Journal Voucher. Any missing document is a compliance failure requiring immediate remediation." position="right" width={240} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ flex: 1, height: 8, borderRadius: 4, background: 'var(--color-surface-2)', overflow: 'hidden' }}>
                <div style={{ width: `${entry.doc_completeness_pct}%`, height: '100%', background: entry.doc_completeness_pct < 67 ? '#DC2626' : entry.doc_completeness_pct < 100 ? '#D97706' : '#16A34A', borderRadius: 4 }} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: entry.doc_completeness_pct < 67 ? '#DC2626' : entry.doc_completeness_pct < 100 ? '#D97706' : '#16A34A', minWidth: 36 }}>{entry.doc_completeness_pct}%</span>
            </div>
            {entry.doc_completeness_pct < 100 && <div style={{ fontSize: 11, color: '#DC2626', marginTop: 4 }}>⚠ Supporting documents incomplete</div>}
          </div>
        </div>

        {/* Col 2 — Flags & SoD */}
        <div style={{ padding: '16px 20px', borderRight: '1px solid var(--color-border)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-text-3)', marginBottom: 10 }}>Detection Flags</div>
          <div style={{ display: 'flex', flex: 'wrap', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
            {entry.flags.map(flag => (
              <span key={flag} style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', background: 'var(--color-red-light)', color: 'var(--color-red)', borderRadius: 20, border: '1px solid rgba(163,45,45,0.2)' }}>{flag}</span>
            ))}
            {entry.flags.length === 0 && <span style={{ fontSize: 11, color: 'var(--color-text-3)' }}>No flags — entry appears normal</span>}
          </div>

          {/* SoD check */}
          <div style={{ padding: '10px 12px', background: entry.sod_violation ? 'var(--color-red-light)' : 'var(--color-surface-2)', border: `1px solid ${entry.sod_violation ? 'rgba(163,45,45,0.3)' : 'var(--color-border)'}`, borderRadius: 8, marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: entry.sod_violation ? 'var(--color-red)' : 'var(--color-text-3)', marginBottom: 5 }}>
              Maker-Checker {entry.sod_violation ? '⚠ SoD VIOLATION' : '✓ Intact'}
              <InfoTooltip text="Maker = person who created the entry. Checker = person who approved it. They must be different people under CBSL Direction No. 5/2024. Same person = SoD violation." position="right" width={260} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {[['Maker', entry.maker_id], ['Checker', entry.checker_id]].map(([role, id]) => (
                <div key={role} style={{ padding: '6px 10px', background: 'rgba(255,255,255,0.7)', borderRadius: 6 }}>
                  <div style={{ fontSize: 9, color: 'var(--color-text-3)' }}>{role}</div>
                  <code style={{ fontSize: 11, fontWeight: 700, color: entry.sod_violation ? 'var(--color-red)' : 'var(--color-text)' }}>{id}</code>
                </div>
              ))}
            </div>
          </div>

          {/* Benford result */}
          <div style={{ padding: '8px 12px', background: entry.benford_result === 'Fail' ? 'var(--color-red-light)' : '#F0FDF4', border: `1px solid ${entry.benford_result === 'Fail' ? 'rgba(163,45,45,0.2)' : 'rgba(22,163,74,0.2)'}`, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
            {entry.benford_result === 'Fail' ? <FileX size={14} style={{ color: 'var(--color-red)' }} /> : <CheckCircle size={14} style={{ color: '#16A34A' }} />}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: entry.benford_result === 'Fail' ? 'var(--color-red)' : '#16A34A' }}>Benford's Law: {entry.benford_result}</div>
              <div style={{ fontSize: 10, color: 'var(--color-text-3)' }}>{entry.benford_result === 'Fail' ? 'First digit deviates from expected distribution' : 'First digit within expected frequency range'}</div>
            </div>
          </div>

          {/* Reversal chain */}
          {entry.reversal_chain && (
            <div style={{ marginTop: 10, padding: '8px 12px', background: '#FFFBEB', border: '1px solid rgba(215,151,6,0.3)', borderRadius: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#854F0B', marginBottom: 3, display: 'flex', alignItems: 'center', gap: 5 }}>
                Reversal chain detected
                <InfoTooltip text="A reversal chain occurs when an entry is reversed then reposted — often used to reset aging counters or manipulate period-end reporting." position="right" width={240} />
              </div>
              <div style={{ fontSize: 11, color: '#854F0B' }}>{entry.reversal_chain}</div>
            </div>
          )}
        </div>

        {/* Col 3 — AI explanation & action */}
        <div style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-text-3)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
            Agent Analysis
            <InfoTooltip text="The agent's explanation of why this entry was flagged, considering all detected signals in combination." position="left" width={240} />
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-text)', lineHeight: 1.75, padding: '12px 14px', background: 'white', borderRadius: 8, border: '1px solid var(--color-border)', marginBottom: 10 }}>
            {entry.explanation}
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-3)', marginBottom: 4 }}>Financial Statement Impact</div>
          <div style={{ padding: '8px 12px', background: `${COLOR}08`, border: `1px solid ${COLOR}20`, borderRadius: 8, fontSize: 12, color: COLOR, marginBottom: 10 }}>
            {entry.fs_impact}
          </div>
          <div style={{ padding: '10px 14px', background: entry.status === 'Escalated' ? 'var(--color-red-light)' : 'var(--color-amber-light)', borderRadius: 8, borderLeft: `3px solid ${entry.status === 'Escalated' ? 'var(--color-red)' : 'var(--color-amber)'}` }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: entry.status === 'Escalated' ? 'var(--color-red)' : 'var(--color-amber)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
              <Zap size={10} style={{ display: 'inline', marginRight: 4 }} />Recommended action
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-text)', lineHeight: 1.6 }}>{entry.recommended_action}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MJE TABLE ROW ────────────────────────────────────────────────────────────

function MJERow({ entry }) {
  const [expanded, setExpanded] = useState(false);
  const sc = statusColor(entry.status);
  const rc = riskColor(entry.risk_score);
  const isHighRisk = entry.risk_score >= 80;

  return (
    <>
      <tr style={{ cursor: 'pointer', background: expanded ? `${COLOR}05` : isHighRisk ? '#FFF8F8' : 'transparent', transition: 'background 0.12s', borderLeft: `3px solid ${isHighRisk ? '#DC262633' : 'transparent'}` }}
        onClick={() => setExpanded(e => !e)}>
        <td style={{ padding: '10px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {expanded ? <ChevronUp size={12} style={{ color: COLOR }} /> : <ChevronDown size={12} style={{ color: 'var(--color-text-3)' }} />}
            <code style={{ fontSize: 11 }}>{entry.entry_id}</code>
          </div>
        </td>
        <td style={{ padding: '10px 8px' }}>
          <div style={{ fontSize: 11, fontWeight: 600 }}>{entry.gl_name}</div>
          <code style={{ fontSize: 10, color: 'var(--color-text-3)' }}>{entry.gl_account}</code>
        </td>
        <td style={{ padding: '10px 8px', fontVariantNumeric: 'tabular-nums', fontSize: 12, fontWeight: 600 }}>
          LKR {(entry.amount_lkr / 1e6).toFixed(2)}M
        </td>
        <td style={{ padding: '10px 8px' }}>
          <code style={{ fontSize: 11 }}>{entry.staff_id}</code>
        </td>
        <td style={{ padding: '10px 8px', fontSize: 11, color: entry.timestamp.includes('T2') || parseInt(entry.timestamp.split('T')[1]) >= 22 ? '#DC2626' : 'var(--color-text-2)' }}>
          {entry.timestamp.split('T')[1]?.slice(0, 5)}
          {entry.day_of_week && <div style={{ fontSize: 10, color: 'var(--color-text-3)' }}>{entry.day_of_week}</div>}
        </td>
        <td style={{ padding: '10px 8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 32, height: 6, borderRadius: 3, background: 'var(--color-surface-2)', overflow: 'hidden' }}>
              <div style={{ width: `${entry.risk_score}%`, height: '100%', background: rc, borderRadius: 3 }} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: rc, fontVariantNumeric: 'tabular-nums' }}>{entry.risk_score}</span>
          </div>
        </td>
        <td style={{ padding: '10px 8px' }}>
          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: entry.benford_result === 'Fail' ? 'var(--color-red-light)' : '#F0FDF4', color: entry.benford_result === 'Fail' ? 'var(--color-red)' : '#16A34A' }}>{entry.benford_result}</span>
        </td>
        <td style={{ padding: '10px 8px' }}>
          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: sc.bg, color: sc.text }}>{entry.status}</span>
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={8} style={{ padding: 0 }}>
            <MJEExpandedRow entry={entry} />
          </td>
        </tr>
      )}
    </>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function MJEAgent() {
  const openFinding = useOpenFinding('mje');
  const [activeTab, setActiveTab] = useState('population');
  const [filter, setFilter] = useState('All');

  return (
    <AgentModule agentId="mje" agentName="MJE Testing Agent" agentColor={COLOR} demoData={demoData.mje} schema={SCHEMA}>
      {(data) => {
        const filtered = (data.mje_entries || []).filter(e => {
          if (filter === 'Flagged') return e.status === 'Flagged' || e.status === 'Escalated';
          if (filter === 'Escalated') return e.status === 'Escalated';
          if (filter === 'Cleared') return e.status === 'Cleared';
          return true;
        });

        return (
          <>
            <ExplainerBox color={COLOR} icon="⊞"
              title="How this agent tests manual journal entries (MJE testing)"
              summary="Full-population testing of all manual journal entries — not sampling. Every MJE is scored on 5 risk dimensions: timing (after-hours/weekend), amount anomalies (round numbers, Benford's Law), GL account sensitivity (suspense, provision, capital), maker-checker integrity, and document completeness."
              detail="Traditional auditing uses sampling — reviewing 5–10% of entries. MJE testing reviews 100% of entries against algorithmic rules. This closes a critical blind spot: fraudulent entries are specifically designed to look unremarkable individually. The agent detects combinations — an after-hours round-number entry to a suspense account with the same maker and checker, for example — that no sampling approach would consistently catch."
              collapsible
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
              <StatCard label="Entries Tested" value={(data.mje_summary.total_entries_tested || 0).toLocaleString()} sub="Full population — no sampling" color={COLOR} tooltip="Every manual journal entry in the period is tested — not a sample. This is 100% coverage, which is the key difference from traditional MJE auditing." />
              <StatCard label="Flagged" value={data.mje_summary.flagged_count} sub={`${data.mje_summary.escalated_count} escalated`} color="#D97706" tooltip="Entries with risk score above 40. Escalated = above 80 with critical flags. Both require immediate human review." alert={`${data.mje_summary.sod_violations} SoD violations`} />
              <StatCard label="Benford Failures" value={data.mje_summary.benford_failures} sub="First digit deviates from expected" color="#7C3AED" tooltip="Journal entries where the first digit of the amount falls outside Benford's Law expected frequency range. In MJE populations, digit anomalies often indicate deliberate amount selection to stay below internal review thresholds." />
              <StatCard label="After-hours Entries" value={data.mje_summary.after_hours_entries} sub="Before 08:00 or after 18:00" color="#A32D2D" tooltip="Manual journal entries posted outside business hours. Legitimate after-hours postings should have documented emergency justification. Systematic after-hours activity by the same staff member is a strong fraud indicator." />
            </div>


            {/* Coverage & Assurance Statement */}
            <div style={{ padding:'12px 16px', background:'var(--color-surface-2)', border:'1px solid var(--color-border)', borderRadius:10, display:'flex', gap:12, alignItems:'flex-start' }}>
              <div style={{ width:28, height:28, borderRadius:8, background:'#0891B212', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:14 }}>📊</div>
              <div>
                <div style={{ fontSize:11, fontWeight:700, color:'#0891B2', marginBottom:3 }}>Coverage & Assurance Statement</div>
                <div style={{ fontSize:12, color:'var(--color-text-2)', lineHeight:1.6 }}>
                  <strong>Full population — no sampling.</strong> All 847 manual journal entries in the period were tested. This is 100% coverage. The assurance level is higher than sampling-based MJE audit: we can state with certainty that no entry was missed. This is not a statistical projection — it is complete testing.
                </div>
              </div>
            </div>
            <div className="agent-panel">
              <div className="agent-panel-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className="agent-panel-title">Key Findings</span>
                </div>
              </div>
              <div className="agent-panel-body">
                {(data.key_findings || []).map((f, i) => <VisualFindingCard key={i} finding={f} agentColor={COLOR} index={i} agentId="mje" agentData={data} openFinding={openFinding} />)}
              </div>
            </div>

            {/* Tabs */}
            <div className="agent-panel">
              <div className="agent-panel-header" style={{ padding: 0 }}>
                {[['population', 'MJE Population'], ["benford", "Benford Analysis"], ['gl', 'GL Reconciliation']].map(([tab, label]) => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    style={{ padding: '12px 18px', fontSize: 12, fontWeight: activeTab === tab ? 600 : 400, color: activeTab === tab ? COLOR : 'var(--color-text-2)', background: activeTab === tab ? `${COLOR}08` : 'transparent', borderBottom: `2px solid ${activeTab === tab ? COLOR : 'transparent'}`, border: 'none', cursor: 'pointer', flex: 1, transition: 'all 0.12s' }}>
                    {label}
                  </button>
                ))}
              </div>

              {/* MJE Population tab */}
              {activeTab === 'population' && (
                <>
                  <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--color-border)', display: 'flex', gap: 6, alignItems: 'center' }}>
                    <InfoTooltip text="Click any row to expand the full entry detail: GL accounting lines, document completeness, maker-checker SoD check, Benford result, agent analysis, and recommended action." position="right" width={280} />
                    <span style={{ fontSize: 11, color: 'var(--color-text-2)', flex: 1 }}>Click any row to expand full entry analysis</span>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {['All', 'Flagged', 'Escalated', 'Cleared'].map(f => (
                        <button key={f} onClick={() => setFilter(f)}
                          style={{ fontSize: 10, padding: '3px 10px', borderRadius: 6, border: filter === f ? `1px solid ${COLOR}44` : '1px solid var(--color-border)', background: filter === f ? `${COLOR}08` : 'transparent', color: filter === f ? COLOR : 'var(--color-text-3)', cursor: 'pointer', fontWeight: filter === f ? 600 : 400 }}>
                          {f} {f === 'All' ? `(${(data.mje_entries || []).length})` : `(${(data.mje_entries || []).filter(e => f === 'Flagged' ? (e.status === 'Flagged' || e.status === 'Escalated') : e.status === f).length})`}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{ overflowY: 'auto', maxHeight: 560 }}>
                    <table className="data-table" style={{ width: '100%' }}>
                      <thead>
                        <tr>
                          <th>Entry ID</th>
                          <th>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              GL Account
                              <InfoTooltip text="General Ledger account code and name. Suspense, provision, capital reserve, and intercompany accounts carry higher inherent risk of manipulation." position="bottom" width={240} />
                            </span>
                          </th>
                          <th>Amount</th>
                          <th>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              Staff ID
                              <InfoTooltip text="Staff member who created the entry. Multiple escalated entries by the same staff member is a systemic concern, not isolated error." position="bottom" width={220} />
                            </span>
                          </th>
                          <th>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              Time
                              <InfoTooltip text="Red time indicates after-hours posting (before 08:00 or after 18:00). After-hours entries require documented emergency justification." position="bottom" width={220} />
                            </span>
                          </th>
                          <th>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              Risk Score
                              <InfoTooltip text="0–100 composite score across 5 risk dimensions. Above 40 = watch; above 60 = high; above 80 = critical. Click row to see which dimensions drove the score." position="bottom" width={250} />
                            </span>
                          </th>
                          <th>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              Benford
                              <InfoTooltip text="Pass/Fail on Benford's Law first-digit test. Fail means the amount's first digit falls outside the statistically expected frequency for this entry population." position="bottom" width={250} />
                            </span>
                          </th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map(entry => <MJERow key={entry.entry_id} entry={entry} />)}
                      </tbody>
                    </table>
                  </div>
                  <div style={{ padding: '10px 16px', borderTop: '1px solid var(--color-border)', background: 'var(--color-surface-2)', fontSize: 11, color: 'var(--color-text-3)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ChevronDown size={12} />
                    Click any row → GL lines · SoD check · Benford result · document completeness · AI analysis
                  </div>
                </>
              )}

              {/* Benford Analysis tab */}
              {activeTab === 'benford' && (
                <div style={{ padding: '16px' }}>
                  <InsightBox type="info"
                    title="What Benford's Law reveals in journal entry populations"
                    body="In a naturally occurring set of numbers (transactions, invoices, measurements), Benford's Law predicts that the first digit is '1' about 30% of the time, '2' about 17.6%, and so on logarithmically. When journal entry amounts are deliberately chosen — for example to stay just below a LKR 10M review threshold — the distribution of first digits shifts. Digit '9' (as in LKR 9.x million) becomes over-represented. This is called sub-threshold structuring."
                    compact
                  />
                  <div style={{ marginBottom: 8 }}>
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={data.benford_distribution || []} margin={{ top: 8, right: 16, bottom: 8, left: -16 }}>
                        <XAxis dataKey="digit" tick={{ fontSize: 11 }} label={{ value: 'First digit', position: 'insideBottom', offset: -2, fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 10 }} unit="%" />
                        <Tooltip formatter={(v, n) => [`${v}%`, n === 'actual' ? 'Actual (NTB MJE)' : 'Expected (Benford)']} contentStyle={{ fontSize: 12 }} />
                        <Bar dataKey="expected" fill={`${COLOR}28`} name="expected" radius={[3, 3, 0, 0]} />
                        <Bar dataKey="actual" name="actual" radius={[3, 3, 0, 0]}>
                          {(data.benford_distribution || []).map((d, i) => {
                            const deviation = Math.abs(d.actual - d.expected);
                            return <Cell key={i} fill={deviation > 3 ? '#DC2626' : deviation > 1.5 ? '#D97706' : '#16A34A'} />;
                          })}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    <div style={{ display: 'flex', gap: 16, justifyContent: 'center', fontSize: 11, color: 'var(--color-text-2)', marginTop: 6 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><div style={{ width: 16, height: 3, background: `${COLOR}28`, borderRadius: 1 }} />Expected (Benford)</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><div style={{ width: 16, height: 3, background: '#16A34A', borderRadius: 1 }} />Within range</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><div style={{ width: 16, height: 3, background: '#DC2626', borderRadius: 1 }} />Anomalous deviation</span>
                    </div>
                  </div>
                  {(data.benford_distribution || []).some(d => Math.abs(d.actual - d.expected) > 3) && (
                    <InsightBox type="warning"
                      body={`Digits '4' and '5' are over-represented at ${(data.benford_distribution || []).find(d => d.digit === '4')?.actual}% and ${(data.benford_distribution || []).find(d => d.digit === '5')?.actual}% vs expected ${(data.benford_distribution || []).find(d => d.digit === '4')?.expected}% and ${(data.benford_distribution || []).find(d => d.digit === '5')?.expected}%. This pattern is consistent with sub-threshold structuring — deliberately selecting amounts in the LKR 4M–5M range to stay below internal review thresholds.`}
                      compact
                    />
                  )}
                </div>
              )}

              {/* GL Reconciliation tab */}
              {activeTab === 'gl' && (
                <div style={{ overflowY: 'auto', maxHeight: 480 }}>
                  <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--color-border)', fontSize: 12, color: 'var(--color-text-2)', background: 'var(--color-surface-2)' }}>
                    GL balance vs sub-ledger comparison. Any break (difference) requires explanation. Breaks over 90 days old constitute a regulatory concern.
                  </div>
                  <table className="data-table" style={{ width: '100%' }}>
                    <thead>
                      <tr>
                        <th>GL</th>
                        <th>Account Name</th>
                        <th><span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>GL Balance<InfoTooltip text="Balance per the General Ledger system." position="bottom" width={180} /></span></th>
                        <th><span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>Sub-ledger<InfoTooltip text="Balance per the supporting sub-ledger or source system (CEFT switch, loan system, etc). Should match GL exactly." position="bottom" width={220} /></span></th>
                        <th><span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>Break<InfoTooltip text="Difference between GL and sub-ledger. Any break requires written explanation. Large breaks or breaks on sensitive accounts require escalation." position="bottom" width={240} /></span></th>
                        <th>Aging</th>
                        <th>Status</th>
                        <th>Priority</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data.gl_reconciliation || []).map((gl, i) => {
                        const sc = statusColor(gl.priority === 'Critical' ? 'Escalated' : gl.priority === 'High' ? 'Flagged' : 'Cleared');
                        return (
                          <tr key={i}>
                            <td><code style={{ fontSize: 11 }}>{gl.gl}</code></td>
                            <td style={{ fontSize: 12, fontWeight: 500 }}>{gl.name}</td>
                            <td style={{ fontSize: 12, fontVariantNumeric: 'tabular-nums' }}>LKR {(gl.gl_balance_lkr / 1e6).toFixed(1)}M</td>
                            <td style={{ fontSize: 12, fontVariantNumeric: 'tabular-nums', color: 'var(--color-text-2)' }}>LKR {(gl.sub_ledger_lkr / 1e6).toFixed(1)}M</td>
                            <td style={{ fontVariantNumeric: 'tabular-nums', fontWeight: gl.break_lkr > 0 ? 700 : 400, color: gl.break_lkr > 0 ? '#DC2626' : '#16A34A' }}>
                              {gl.break_lkr > 0 ? `LKR ${(gl.break_lkr / 1e6).toFixed(1)}M` : '—'}
                            </td>
                            <td style={{ color: parseInt(gl.aging) > 30 ? '#DC2626' : 'var(--color-text-2)', fontWeight: parseInt(gl.aging) > 30 ? 700 : 400, fontSize: 12 }}>{gl.aging}</td>
                            <td><span style={{ fontSize: 10, padding: '2px 7px', background: gl.status === 'Matched' ? '#F0FDF4' : '#FFFBEB', color: gl.status === 'Matched' ? '#16A34A' : '#854F0B', borderRadius: 4, fontWeight: 700 }}>{gl.status}</span></td>
                            <td><span style={{ fontSize: 10, padding: '2px 7px', background: sc.bg, color: sc.text, borderRadius: 4, fontWeight: 700 }}>{gl.priority}</span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        );
      }}
      </AgentModule>
  );
}

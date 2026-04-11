import React, { useState } from 'react';
import { getCasesForEntity, CASE_SEV_COLOR } from '../../data/caseRegistry.js';
import { ChevronDown, ChevronUp, AlertTriangle, Info, BookOpen, Microscope, CheckCircle, Zap, ArrowRight, GitMerge, ExternalLink } from 'lucide-react';
import InfoTooltip from './InfoTooltip.jsx';

// ─── SCORE BAR ────────────────────────────────────────────────────────────────

export function ScoreBar({ score, label = '', showValue = true, height = 8 }) {
  const pct = Math.min(Math.max(score, 0), 1) * 100;
  const color = score >= 0.85 ? '#A32D2D' : score >= 0.65 ? '#EF9F27' : score >= 0.4 ? '#185FA5' : '#3B6D11';
  const tier = score >= 0.85 ? 'Critical' : score >= 0.65 ? 'Elevated' : score >= 0.4 ? 'Moderate' : 'Low';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      {label && <span style={{ fontSize: 11, color: 'var(--color-text-3)', minWidth: 90 }}>{label}</span>}
      <div style={{ flex: 1, height, borderRadius: height / 2, background: 'var(--color-surface-2)', overflow: 'hidden', position: 'relative' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: `linear-gradient(90deg, ${color}aa, ${color})`, borderRadius: height / 2, transition: 'width 0.6s ease' }} />
      </div>
      {showValue && <span style={{ fontSize: 11, fontWeight: 700, color, minWidth: 36, fontVariantNumeric: 'tabular-nums' }}>{score.toFixed(2)}</span>}
      <span style={{ fontSize: 10, color, fontWeight: 600, minWidth: 52 }}>{tier}</span>
    </div>
  );
}

// ─── ANOMALY BADGE ────────────────────────────────────────────────────────────

export function AnomalyBadge({ score }) {
  const color = score >= 0.85 ? '#A32D2D' : score >= 0.65 ? '#3A5A3A' : '#185FA5';
  const bg = score >= 0.85 ? '#FCEBEB' : score >= 0.65 ? '#E8FDF4' : '#E6F1FB';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 8px', background: bg, border: `1px solid ${color}22`, borderRadius: 6 }}>
      <div style={{ width: 32, height: 4, borderRadius: 2, background: '#e5e5e5', overflow: 'hidden' }}>
        <div style={{ width: `${score * 100}%`, height: '100%', background: color, borderRadius: 2 }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color, fontVariantNumeric: 'tabular-nums' }}>{score.toFixed(2)}</span>
    </span>
  );
}

// ─── SIGNAL STRENGTH BAR ─────────────────────────────────────────────────────

export function SignalBar({ label, strength, tooltip, index = 0 }) {
  const pct = Math.round(strength * 100);
  const color = strength >= 0.8 ? '#A32D2D' : strength >= 0.6 ? '#EF9F27' : '#185FA5';
  const tiers = ['Low', 'Moderate', 'Elevated', 'High', 'Critical'];
  const tier = tiers[Math.min(4, Math.floor(strength * 5))];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px 44px', gap: 10, alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}>
      <div style={{ fontSize: 12, color: 'var(--color-text)', lineHeight: 1.4, display: 'flex', alignItems: 'flex-start', gap: 5 }}>
        <span style={{ color: 'var(--color-text-3)', fontSize: 10, fontWeight: 700, minWidth: 14, marginTop: 2 }}>{index + 1}</span>
        {label}
        {tooltip && <InfoTooltip text={tooltip} position="right" width={220} />}
      </div>
      <div style={{ height: 8, borderRadius: 4, background: 'var(--color-surface-2)', overflow: 'hidden', position: 'relative' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: `linear-gradient(90deg,${color}77,${color})`, borderRadius: 4, transition: 'width 0.5s ease' }} />
        {[0.6, 0.8].map(t => (
          <div key={t} style={{ position: 'absolute', left: `${t * 100}%`, top: 0, bottom: 0, width: 1, background: 'rgba(255,255,255,0.7)' }} />
        ))}
      </div>
      <span style={{ fontSize: 10, fontWeight: 700, color, textAlign: 'right' }}>{tier}</span>
    </div>
  );
}

// ─── DETECTION PIPELINE ───────────────────────────────────────────────────────

export function DetectionPipeline({ steps, color = '#185FA5' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {steps.map((step, i) => (
        <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: i < steps.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: `${color}15`, border: `1.5px solid ${color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color, flexShrink: 0, zIndex: 1 }}>
              {i + 1}
            </div>
            {i < steps.length - 1 && <div style={{ width: 1.5, flex: 1, background: `${color}22`, minHeight: 8 }} />}
          </div>
          <div style={{ flex: 1, paddingTop: 2 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text)', marginBottom: 3 }}>{step.title}</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-2)', lineHeight: 1.6 }}>{step.text}</div>
            {step.result && (
              <div style={{ marginTop: 6, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: `${color}0C`, borderRadius: 6, fontSize: 11, fontWeight: 600, color }}>
                <CheckCircle size={11} /> {step.result}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── SEVERITY METER ───────────────────────────────────────────────────────────
// Compact visual severity indicator used inside VisualFindingCard

function SeverityMeter({ severity, agentColor }) {
  const levels = { critical: 4, high: 3, medium: 2, low: 1 };
  const level = levels[severity] || 2;
  const colors = { critical: '#DC2626', high: '#D97706', medium: '#185FA5', low: '#16A34A' };
  const color = colors[severity] || colors.medium;
  return (
    <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
      {[1, 2, 3, 4].map(i => (
        <div key={i} style={{ width: 6, height: i <= level ? (4 + i * 3) : 6, borderRadius: 2, background: i <= level ? color : 'var(--color-surface-2)', transition: 'all 0.3s ease' }} />
      ))}
    </div>
  );
}

// ─── VISUAL FINDING CARD ──────────────────────────────────────────────────────
// Rich finding card — expands to full evidence view with detection context

// ─── CREATE CASE MODAL ────────────────────────────────────────────────────────
const DOMAIN_COLORS_MAP = {
  credit:'#185FA5', transaction:'#3D3C38', suspense:'#993C1D',
  kyc:'#0F6E56', controls:'#3A5A3A', digital:'#993556',
  trade:'#3B6D11', insider:'#2D2D2B', mje:'#0BBF7A'
};

export function CreateCaseModal({ finding, agentId, agentColor, onClose }) {
  const [title, setTitle] = useState(finding?.finding?.slice(0,80) || '');
  const [severity, setSeverity] = useState(finding?.severity || 'high');
  const [owner, setOwner] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const newCaseId = 'CASE-' + String(Math.floor(Math.random()*900)+100);

  function submit() {
    if (!title.trim() || !owner.trim()) return;
    setSubmitted(true);
    // Navigate to case manager after brief delay
    setTimeout(() => {
      if (window._sentinelNavigate) {
        window._sentinelNavigate('/cases');
      }
      onClose();
    }, 1800);
  }

  if (submitted) return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999 }}>
      <div style={{ background:'var(--color-surface)', borderRadius:16, padding:'40px 48px', textAlign:'center', maxWidth:360 }}>
        <div style={{ fontSize:48, marginBottom:12 }}>✓</div>
        <div style={{ fontSize:18, fontWeight:700, color:'#16A34A', marginBottom:6 }}>{newCaseId} Created</div>
        <div style={{ fontSize:13, color:'var(--color-text-2)' }}>Opening Case Manager…</div>
      </div>
    </div>
  );

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999 }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{ background:'var(--color-surface)', borderRadius:16, padding:28, width:480, maxWidth:'95vw', boxShadow:'0 24px 64px rgba(0,0,0,0.3)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
          <div style={{ width:10, height:10, borderRadius:'50%', background:agentColor||'#185FA5' }}/>
          <span style={{ fontSize:14, fontWeight:700 }}>Open New Investigation Case</span>
          <button onClick={onClose} style={{ marginLeft:'auto', background:'none', border:'none', cursor:'pointer', color:'var(--color-text-3)', fontSize:18 }}>×</button>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div>
            <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:'var(--color-text-3)', marginBottom:5 }}>Case title</div>
            <input value={title} onChange={e=>setTitle(e.target.value)} style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'1px solid var(--color-border)', fontSize:13, fontFamily:'inherit', background:'var(--color-surface)', boxSizing:'border-box' }}/>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div>
              <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:'var(--color-text-3)', marginBottom:5 }}>Severity</div>
              <select value={severity} onChange={e=>setSeverity(e.target.value)} style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'1px solid var(--color-border)', fontSize:13, fontFamily:'inherit', background:'var(--color-surface)' }}>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
              </select>
            </div>
            <div>
              <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:'var(--color-text-3)', marginBottom:5 }}>Agent domain</div>
              <input value={agentId||''} readOnly style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'1px solid var(--color-border)', fontSize:13, fontFamily:'inherit', background:'var(--color-surface-2)', boxSizing:'border-box', color:'var(--color-text-2)' }}/>
            </div>
          </div>

          <div>
            <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:'var(--color-text-3)', marginBottom:5 }}>Assign to</div>
            <input value={owner} onChange={e=>setOwner(e.target.value)} placeholder="e.g. Chief Internal Auditor" style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'1px solid var(--color-border)', fontSize:13, fontFamily:'inherit', background:'var(--color-surface)', boxSizing:'border-box' }}/>
          </div>

          {finding?.finding && (
            <div style={{ padding:'10px 12px', background:'var(--color-surface-2)', borderRadius:8, fontSize:11, color:'var(--color-text-2)', lineHeight:1.6, borderLeft:`3px solid ${agentColor||'#185FA5'}` }}>
              <strong>Finding:</strong> {finding.finding}
            </div>
          )}

          <div style={{ display:'flex', gap:8, marginTop:4 }}>
            <button onClick={submit} disabled={!title.trim()||!owner.trim()} style={{ flex:1, padding:'10px 16px', background:(!title.trim()||!owner.trim())?'var(--color-surface-2)':agentColor||'#185FA5', color:(!title.trim()||!owner.trim())?'var(--color-text-3)':'white', border:'none', borderRadius:8, fontSize:13, fontWeight:700, cursor:(!title.trim()||!owner.trim())?'not-allowed':'pointer' }}>
              Create Case {newCaseId}
            </button>
            <button onClick={onClose} style={{ padding:'10px 16px', background:'var(--color-surface-2)', color:'var(--color-text-2)', border:'1px solid var(--color-border)', borderRadius:8, fontSize:13, cursor:'pointer' }}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}


export function VisualFindingCard({ finding, agentColor = '#185FA5', index, features, agentId, agentData, openFinding }) {
  const [expanded, setExpanded] = useState(index === 0);
  const [showCreateCase, setShowCreateCase] = useState(false);
  const sev = finding.severity || 'medium';
  const palette = {
    critical: { border: '#A32D2D', bg: '#FEF8F8', text: '#991B1B', label: '#FCEBEB', badge: '#DC2626' },
    high:     { border: '#EF9F27', bg: '#FFFBF0', text: '#3A5A3A', label: '#E8FDF4', badge: '#D97706' },
    medium:   { border: '#185FA5', bg: '#F6FAFF', text: '#185FA5', label: '#E6F1FB', badge: '#185FA5' },
    low:      { border: '#3B6D11', bg: '#F6FBF0', text: '#2D5A11', label: '#EAF3DE', badge: '#16A34A' },
  };
  const p = palette[sev] || palette.medium;
  const exposure = finding.affected_exposure_lkr || finding.affected_balance_lkr || 0;
  const hasOpenFinding = !!openFinding;

  const handleClick = () => {
    if (openFinding) {
      openFinding(finding, agentId, agentColor, agentData);
    } else {
      setExpanded(e => !e);
    }
  };

  return (
    <div style={{ border: `1px solid ${p.border}33`, borderLeft: `4px solid ${p.border}`, borderRadius: 10, overflow: 'hidden', marginBottom: 12, background: p.bg, transition: 'all 0.15s', cursor: openFinding ? 'pointer' : 'default' }}
      onClick={openFinding ? handleClick : undefined}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 3px 14px ${p.border}33`; if(openFinding) e.currentTarget.style.borderColor = `${p.border}66`; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = `${p.border}33`; }}
    >
      {/* ── Header row ── */}
      <div style={{ padding: '14px 16px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          {/* Badge row */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 10 }}>
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '3px 9px', borderRadius: 20, background: p.label, color: p.border, border: `1px solid ${p.border}33` }}>{sev}</span>
            <SeverityMeter severity={sev} agentColor={agentColor} />
            {exposure > 0 && (
              <span style={{ fontSize: 12, fontWeight: 700, color: p.border, display: 'flex', alignItems: 'center', gap: 4 }}>
                <AlertTriangle size={12} />
                LKR {exposure >= 1e9 ? (exposure / 1e9).toFixed(2) + ' Bn' : (exposure / 1e6).toFixed(0) + ' Mn'}
                <InfoTooltip text="Total LKR value of assets or transactions directly affected by this finding. In live mode this is calculated from your uploaded data." position="right" width={240} />
              </span>
            )}
            {hasOpenFinding && (
              <span style={{ marginLeft: 'auto', fontSize: 10, color: agentColor, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, padding: '2px 8px', background: `${agentColor}10`, borderRadius: 6 }}>
                Deep dive <ExternalLink size={10} />
              </span>
            )}
          </div>
          {/* Finding text */}
          <p style={{ fontSize: 13, color: 'var(--color-text)', lineHeight: 1.7, margin: 0 }}>{finding.finding}</p>
        </div>
        {!hasOpenFinding && (
          <div style={{ flexShrink: 0, color: 'var(--color-text-3)', marginTop: 2 }}>
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        )}
      </div>

      {/* ── Expanded body (only when no openFinding) ── */}
      {expanded && !hasOpenFinding && (
        <div style={{ borderTop: `1px solid ${p.border}22`, animation: 'fadeIn 0.15s ease' }}>

          {/* Feature drivers */}
          {features && features.length > 0 && (
            <div style={{ padding: '14px 16px', borderBottom: `1px solid ${p.border}18` }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: p.text, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                Score Drivers
                <InfoTooltip text="These bars show which features contributed most to the anomaly score. Longer bar = stronger signal. The feature with the highest contribution is the primary reason this finding was flagged." position="right" width={260} />
              </div>
              {features.map((f, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 38px', gap: 8, alignItems: 'center', marginBottom: 7 }}>
                  <span style={{ fontSize: 11, color: 'var(--color-text-2)', lineHeight: 1.3 }}>{f.name}</span>
                  <div style={{ height: 7, borderRadius: 4, background: 'var(--color-surface-2)', overflow: 'hidden' }}>
                    <div style={{ width: `${f.contribution * 100}%`, height: '100%', background: f.contribution > 0.25 ? p.border : agentColor + '88', borderRadius: 4, transition: 'width 0.4s ease' }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: p.border, textAlign: 'right' }}>{(f.contribution * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          )}

          {/* Recommended action + regulatory callout */}
          <div style={{ padding: '14px 16px', display: 'grid', gridTemplateColumns: features ? '1fr' : '1fr', gap: 10 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: p.text, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
                Recommended Action
                <InfoTooltip text="The immediate action required to address this finding. Severity determines urgency: Critical = within 4 hours, High = within 24 hours, Medium = within 5 business days." position="right" width={260} />
              </div>
              <div style={{ padding: '10px 14px', background: `${p.badge}08`, border: `1px solid ${p.badge}28`, borderLeft: `3px solid ${p.badge}`, borderRadius: 8, fontSize: 12, color: 'var(--color-text)', lineHeight: 1.7, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <Zap size={13} style={{ color: p.badge, flexShrink: 0, marginTop: 2 }} />
                {finding.recommended_action || 'Escalate to compliance for manual review.'}
              </div>
            </div>

            {/* Urgency indicator */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '8px 12px', background: 'var(--color-surface-2)', borderRadius: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.badge, flexShrink: 0, ...(sev === 'critical' ? { animation: 'pulse 1.5s ease-in-out infinite' } : {}) }} />
              <span style={{ fontSize: 11, color: 'var(--color-text-2)', flex: 1 }}>
                {sev === 'critical' ? 'Immediate action required — within 4 hours' :
                 sev === 'high' ? 'Action required — within 24 hours' :
                 sev === 'medium' ? 'Review required — within 5 business days' :
                 'Monitoring — review at next scheduled audit'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── Click-through hint when openFinding is wired ── */}
      {hasOpenFinding && (
        <div style={{ padding: '8px 16px', borderTop: `1px solid ${p.border}22`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: `${p.border}04`, gap: 8, flexWrap: 'wrap' }}>
          {/* Case link */}
          {(() => {
            const searchText = Object.values(finding).filter(v => typeof v === 'string').join(' ');
            const ENTITY_RE = /\b(BR-\d+|STF-\d+|SUS-[A-Z0-9-]+|NTB-CORP-\d+|NTB-0841-X|MJE-\d{4}-\d+|NTB-\d{4}-[A-Z])/g;
            const matches = [...new Set((searchText.match(ENTITY_RE) || []))];
            const linkedCases = matches.flatMap(e => getCasesForEntity(e)).filter((x,i,a)=>a.findIndex(y=>y.id===x.id)===i);
            if (linkedCases.length === 0) return null;
            const cas = linkedCases[0];
            return (
              <button onClick={e => { e.stopPropagation(); if(window._sentinelNavigate) window._sentinelNavigate('/cases', { state: { caseId: cas.id } }); }}
                style={{ display:'flex', alignItems:'center', gap:5, padding:'4px 10px', background:`${CASE_SEV_COLOR[cas.severity]}12`, border:`1px solid ${CASE_SEV_COLOR[cas.severity]}30`, borderRadius:6, cursor:'pointer', fontSize:11, color:CASE_SEV_COLOR[cas.severity], fontWeight:600, flexShrink:0 }}>
                🗂 {cas.id} →
              </button>
            );
          })()}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 11, color: 'var(--color-text-3)', flex: 1 }}>
            {finding.recommended_action && (
              <span style={{ maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                → {finding.recommended_action}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 11, fontWeight: 600, color: agentColor, flexShrink: 0 }}>
            <button onClick={e => { e.stopPropagation(); setShowCreateCase(true); }} style={{ padding:'3px 9px', background:'var(--color-surface-2)', border:'1px solid var(--color-border)', borderRadius:6, fontSize:11, fontWeight:600, color:'var(--color-text-2)', cursor:'pointer', display:'flex', alignItems:'center', gap:4 }}>
              + New Case
            </button>
            Full analysis
            <ArrowRight size={13} />
          </div>
        </div>
      )}
      {hasOpenFinding && (
        <div onClick={handleClick} style={{ padding:'10px 16px', borderTop:`1px solid ${p.border}22`, background:`${agentColor}06`, display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer' }}>
          <span style={{ fontSize:11, color:'var(--color-text-3)' }}>Click to open full analysis, evidence, and regulatory context</span>
          <span style={{ fontSize:12, fontWeight:700, color:agentColor, display:'flex', alignItems:'center', gap:4 }}>Full analysis <ArrowRight size={13} /></span>
        </div>
      )}
      {showCreateCase && <CreateCaseModal finding={finding} agentId={agentId} agentColor={agentColor} onClose={() => setShowCreateCase(false)} />}
    </div>
  );
}

// ─── INSIGHT BOX ─────────────────────────────────────────────────────────────

export function InsightBox({ title, body, type = 'info', compact = false, collapsible = false }) {
  const [open, setOpen] = useState(true);
  const types = {
    info:        { icon: Info,          bg: '#EBF4FF', border: 'rgba(24,95,165,0.2)',   text: '#185FA5', iconBg: '#DBEAFE' },
    warning:     { icon: AlertTriangle, bg: '#FFFBEB', border: 'rgba(133,79,11,0.25)',  text: '#3A5A3A', iconBg: '#FEF3C7' },
    critical:    { icon: AlertTriangle, bg: '#FEF8F8', border: 'rgba(163,45,45,0.25)',  text: '#A32D2D', iconBg: '#FCEBEB' },
    methodology: { icon: Microscope,    bg: '#F3F1FF', border: 'rgba(83,74,183,0.2)',   text: '#3D3C38', iconBg: '#E9E7FD' },
    regulatory:  { icon: BookOpen,      bg: '#FFFBEB', border: 'rgba(133,79,11,0.25)',  text: '#3A5A3A', iconBg: '#FEF3C7' },
    success:     { icon: CheckCircle,   bg: '#F0FDF4', border: 'rgba(59,109,17,0.2)',   text: '#3B6D11', iconBg: '#DCFCE7' },
  };
  const t = types[type] || types.info;
  const Icon = t.icon;

  if (!open && collapsible) return (
    <button onClick={() => setOpen(true)} style={{ width: '100%', textAlign: 'left', padding: '8px 14px', border: `1px solid ${t.border}`, borderRadius: 8, background: t.bg, fontSize: 11, color: t.text, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
      <Icon size={12} /> {title || (body || '').substring(0, 60) + '…'} <span style={{ marginLeft: 'auto', color: 'var(--color-text-3)' }}>show</span>
    </button>
  );

  return (
    <div style={{ padding: compact ? '10px 14px' : '14px 16px', background: t.bg, border: `1px solid ${t.border}`, borderRadius: 10, display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: compact ? 8 : 0 }}>
      <div style={{ width: 28, height: 28, borderRadius: 8, background: t.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={14} style={{ color: t.text }} />
      </div>
      <div style={{ flex: 1 }}>
        {title && <div style={{ fontSize: 12, fontWeight: 700, color: t.text, marginBottom: 4 }}>{title}</div>}
        <div style={{ fontSize: 12, color: t.text, lineHeight: 1.7 }}>{body}</div>
      </div>
      {collapsible && <button onClick={() => setOpen(false)} style={{ fontSize: 10, color: t.text + '88', cursor: 'pointer', background: 'none', border: 'none', flexShrink: 0 }}>✕</button>}
    </div>
  );
}

// ─── FEATURE BAR ─────────────────────────────────────────────────────────────

export function FeatureBar({ feature, value, maxValue = 1, positive = true, tooltip }) {
  const pct = Math.abs(value / maxValue) * 100;
  const color = positive ? '#A32D2D' : '#3B6D11';
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '5px 0' }}>
      <div style={{ width: 160, fontSize: 11, color: 'var(--color-text-2)', textAlign: 'right', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
        {feature}
        {tooltip && <InfoTooltip text={tooltip} position="left" width={200} />}
      </div>
      <div style={{ flex: 1, height: 18, borderRadius: 4, background: 'var(--color-surface-2)', overflow: 'hidden', position: 'relative' }}>
        <div style={{ position: 'absolute', left: positive ? 0 : 'auto', right: positive ? 'auto' : 0, width: `${pct}%`, height: '100%', background: `${color}cc`, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 4, borderRadius: 4 }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: 'white', whiteSpace: 'nowrap' }}>{value > 0 ? '+' : ''}{value.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────

export function StatCard({ label, value, sub, color, tooltip, alert }) {
  return (
    <div style={{ background: 'var(--color-surface)', border: `1px solid var(--color-border)`, borderRadius: 10, padding: '14px 16px', borderTop: `3px solid ${color}` }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
        <div style={{ fontSize: 11, color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', lineHeight: 1.4 }}>{label}</div>
        {tooltip && <InfoTooltip text={tooltip} position="top" width={230} />}
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color, lineHeight: 1, marginBottom: 4, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--color-text-2)', lineHeight: 1.5 }}>{sub}</div>}
      {alert && <div style={{ fontSize: 11, color: '#A32D2D', marginTop: 5, fontWeight: 600 }}>⚠ {alert}</div>}
    </div>
  );
}

// ─── PANEL WITH METHODOLOGY ───────────────────────────────────────────────────

export function PanelWithMethod({ title, methodology, children, agentColor = '#185FA5', tooltip }) {
  const [showMethod, setShowMethod] = useState(false);
  return (
    <div className="agent-panel">
      <div className="agent-panel-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span className="agent-panel-title">{title}</span>
          {tooltip && <InfoTooltip text={tooltip} position="bottom" width={260} />}
        </div>
        <button onClick={() => setShowMethod(!showMethod)} style={{ fontSize: 11, fontWeight: 500, color: agentColor, cursor: 'pointer', background: `${agentColor}10`, border: `1px solid ${agentColor}30`, borderRadius: 6, padding: '3px 10px', display: 'flex', alignItems: 'center', gap: 5, transition: 'all 0.15s' }}>
          <Microscope size={11} />{showMethod ? 'Hide method' : 'How detected?'}
        </button>
      </div>
      {showMethod && (
        <div style={{ padding: '12px 16px', background: `${agentColor}06`, borderBottom: '1px solid var(--color-border)' }}>
          <InsightBox type="methodology" body={methodology} compact />
        </div>
      )}
      {children}
    </div>
  );
}

// ─── METRIC COMPARISON ROW ────────────────────────────────────────────────────

export function MetricComparison({ label, actual, benchmark, benchmarkLabel = 'Benchmark', unit = '', higherIsBad = true, tooltip }) {
  const ratio = benchmark > 0 ? actual / benchmark : 0;
  const deviation = ((ratio - 1) * 100).toFixed(0);
  const isAnomaly = higherIsBad ? actual > benchmark : actual < benchmark;
  const color = isAnomaly ? (Math.abs(ratio - 1) > 0.5 ? '#A32D2D' : '#EF9F27') : '#3B6D11';

  return (
    <div style={{ padding: '10px 0', borderBottom: '1px solid var(--color-border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text)', flex: 1 }}>{label}</span>
        {tooltip && <InfoTooltip text={tooltip} position="left" width={240} />}
        <span style={{ fontSize: 12, fontWeight: 800, color }}>{actual}{unit}</span>
        {isAnomaly && <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 7px', background: `${color}18`, color, borderRadius: 4 }}>{deviation}% vs benchmark</span>}
      </div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--color-surface-2)', overflow: 'hidden', position: 'relative' }}>
          <div style={{ position: 'absolute', left: 0, width: `${Math.min(ratio * 50, 100)}%`, height: '100%', background: color, borderRadius: 3, transition: 'width 0.4s ease' }} />
          <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1.5, background: 'rgba(0,0,0,0.2)' }} />
        </div>
        <span style={{ fontSize: 10, color: 'var(--color-text-3)', whiteSpace: 'nowrap' }}>{benchmarkLabel}: {benchmark}{unit}</span>
      </div>
    </div>
  );
}

// ─── COVERAGE & CONFIDENCE STATEMENT ─────────────────────────────────────────
// Renders per agent — shows population tested, methodology, confidence

export function CoverageStatement({ agentId }) {
  const COVERAGE = {
    credit: {
      population: '16,631 loans', coverage: '100%', method: 'Full population — Isolation Forest on 8 features',
      period: 'Portfolio as at 31 December 2025', confidence: '95%',
      note: 'All loans tested. Sampling not applied. Confidence interval: any staging anomaly above 0.75 score threshold detected with 95% probability.',
      icon: '◈', color: '#185FA5',
    },
    transaction: {
      population: '94,847 transactions', coverage: '100%', method: "Full population — Benford's Law + Z-score velocity analysis",
      period: '1 October – 31 December 2025 (Q4)', confidence: '95%',
      note: 'All CEFT and RTGS transactions in the period tested. Structuring clusters detected using 22-minute rolling window. Velocity anomalies computed against 90-day rolling baseline.',
      icon: '⟳', color: '#3D3C38',
    },
    suspense: {
      population: '143 suspense accounts', coverage: '100%', method: 'Full population — growth-rate × clearing-ratio daily monitoring',
      period: 'Continuous — daily snapshot as at 31 December 2025', confidence: '99%',
      note: 'All suspense, NOSTRO and clearing accounts monitored. CBSL 90-day aging rule applied to 100% of balances. Re-aging detection covers 12-month reversal history.',
      icon: '⊟', color: '#993C1D',
    },
    kyc: {
      population: '835,944 customer accounts', coverage: '100%', method: 'Full population — 47-rule CDD engine + PEP/sanctions screening',
      period: 'As at 31 December 2025', confidence: '99%',
      note: 'All accounts scored against 47 CBSL KYC rules. PEP screening against 6 international databases. Beneficial ownership gap detection covers all corporate entities.',
      icon: '✦', color: '#0F6E56',
    },
    controls: {
      population: '90 branches, 18,743 transactions', coverage: '100%', method: 'Full population — 6-dimension composite scoring',
      period: '1 October – 31 December 2025 (Q4)', confidence: '95%',
      note: 'All 90 branches scored on 6 dimensions: override rate, SoD violation rate, approval turnaround, off-hours %, approver concentration index, temporal clustering. SoD violations detected on 100% of transactions.',
      icon: '⚙', color: '#3A5A3A',
    },
    digital: {
      population: '312 flagged sessions (from 2.1M total)', coverage: '100%', method: 'Full population — behavioral biometrics + impossible travel + device fingerprint',
      period: '1 October – 31 December 2025 (Q4)', confidence: '90%',
      note: 'All digital sessions scored against 14-month behavioral baseline. Anomaly threshold: behavioral score below 50. Impossible travel uses Sri Lanka city-pair benchmark travel times.',
      icon: '⊕', color: '#993556',
    },
    trade: {
      population: '847 trade documents', coverage: '100%', method: 'Full population — HS code price benchmarking + duplicate LC detection',
      period: 'FY 2025 (January – December 2025)', confidence: '90%',
      note: 'All trade documents benchmarked against UN COMTRADE HS code medians. Duplicate LC detection covers 24-month shipment window. FATF counterparty screening on all correspondent banks.',
      icon: '◎', color: '#3B6D11',
    },
    insider: {
      population: '2,462 staff members', coverage: '100%', method: 'Full population — 6-dimension composite scoring with peer comparison',
      period: '14-month behavioral history (November 2024 – December 2025)', confidence: '92%',
      note: 'All staff with system access scored. 14-month baseline required for meaningful peer comparison. Any staff above 40/100 enters watch monitoring. Scores above 85/100 trigger investigation.',
      icon: '◉', color: '#2D2D2B',
    },
    mje: {
      population: '847 manual journal entries', coverage: '100%', method: "Full population — 5-dimension risk scoring + Benford's Law on GL amounts",
      period: 'FY 2025 (January – December 2025)', confidence: '99%',
      note: "No sampling applied. Every manual journal entry in the period tested across all 5 dimensions. This is the definitive difference from traditional audit (which samples 5-10%): 100% population testing means zero coverage gap.",
      icon: '⊞', color: '#0BBF7A',
    },
  };

  const data = COVERAGE[agentId];
  if (!data) return null;

  return (
    <div className="agent-panel">
      <div className="agent-panel-header">
        <span className="agent-panel-title" style={{ color: data.color }}>Coverage & Assurance Statement</span>
        <span style={{ fontSize: 11, color: 'var(--color-text-3)', fontStyle: 'italic' }}>What this agent analysed and how</span>
      </div>
      <div style={{ padding: '14px 20px', display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        {[
          { label: 'Population Tested', value: data.population, icon: '📊' },
          { label: 'Coverage', value: data.coverage, icon: '✓', color: '#16A34A' },
          { label: 'Confidence Level', value: data.confidence, icon: '🎯' },
          { label: 'Period', value: data.period, icon: '📅' },
        ].map((s, i) => (
          <div key={i} style={{ flex: '1 1 160px', padding: '10px 14px', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 8 }}>
            <div style={{ fontSize: 10, color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: s.color || data.color }}>{s.icon} {s.value}</div>
          </div>
        ))}
      </div>
      <div style={{ margin: '0 20px 16px', padding: '10px 14px', background: `${data.color}08`, border: `1px solid ${data.color}22`, borderRadius: 8, fontSize: 12, color: 'var(--color-text-2)', lineHeight: 1.65 }}>
        <strong style={{ color: data.color }}>Methodology:</strong> {data.method}<br />
        {data.note}
      </div>
    </div>
  );
}


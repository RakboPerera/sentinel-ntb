import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCasesForEntity, CASE_SEV_COLOR, CASE_STATUS_COLOR } from '../../data/caseRegistry.js';
import { X, ChevronRight, AlertTriangle, GitMerge, Zap, Info, Clock, BookOpen, CheckCircle, ArrowRight, Microscope, Shield, ExternalLink } from 'lucide-react';
import { useApp } from '../../context/AppContext.jsx';
import { demoData } from '../../data/demoData.js';
import InfoTooltip from './InfoTooltip.jsx';

// ─── AGENT META ───────────────────────────────────────────────────────────────
const AGENT_META = {
  credit:      { name: 'Credit Intelligence',       color: '#185FA5', icon: '◈', path: '/agents/credit',       methodology: 'Isolation Forest across 8 features (DPD, collateral ratio, restructure count, sector NPL, override flag, exposure vs cohort, origination quarter, customer risk rating). Scores 0.0–1.0.' },
  transaction: { name: 'Transaction Surveillance',  color: '#4A6070', icon: '⟳', path: '/agents/transaction',  methodology: "Benford's Law first-digit test across all transactions, structuring cluster detection (3+ txns below threshold, combined >threshold within 24h), velocity scoring vs 90-day rolling baseline." },
  suspense:    { name: 'Suspense & Reconciliation', color: '#993C1D', icon: '⊟', path: '/agents/suspense',    methodology: 'Daily growth-rate × clearing-ratio analysis per account. Flags: growth >50% in 30d, clearing ratio <0.30, aging >90d (CBSL breach). Phantom receivable score combines all three.' },
  kyc:         { name: 'Identity & KYC / AML',      color: '#0F6E56', icon: '✦', path: '/agents/kyc',         methodology: '47-rule CDD compliance engine applied to every account nightly. Rules cover: document expiry, PEP EDD status, FATF-country exposure, beneficial ownership, introducer concentration.' },
  controls:    { name: 'Internal Controls',         color: '#3A5A3A', icon: '⚙', path: '/agents/controls',    methodology: '6-dimension composite score per branch: override rate (25%), SoD violations (20%), approval turnaround (15%), off-hours approvals (15%), approver concentration (15%), temporal clustering (10%).' },
  digital:     { name: 'Digital Fraud & Identity',  color: '#993556', icon: '⊕', path: '/agents/digital',     methodology: 'Behavioral biometrics against 14-month session baseline. Geographic velocity vs Sri Lanka city-pair travel times. Device fingerprint clustering across accounts.' },
  trade:       { name: 'Trade Finance & Treasury',  color: '#3B6D11', icon: '◎', path: '/agents/trade',       methodology: 'HS code price benchmarking vs UN COMTRADE + Sri Lanka Customs medians (flag: >25% deviation). Duplicate LC detection on overlapping shipment periods.' },
  insider:     { name: 'Insider Risk',              color: '#1F2937', icon: '◉', path: '/agents/insider-risk', methodology: 'Staff risk scoring across 6 dimensions: SoD violations (25%), override concentration (20%), off-hours activity (18%), same-cluster approvals (18%), approval turnaround anomaly (12%), session deviation (7%).' },
  mje:         { name: 'MJE Testing',               color: '#0BBF7A', icon: '⊞', path: '/agents/mje',          methodology: 'Full-population MJE testing: timing flags, amount anomalies (round numbers, Benford deviation), GL sensitivity (suspense/capital/intercompany), maker-checker SoD, document completeness.' },
  orchestrator:{ name: 'Orchestrator',              color: '#111110', icon: '◎', path: '/command-centre',      methodology: 'Receives signal feeds from all agents. Combined severity = max(individual) + 0.25 bonus (3+ agents). Threshold for case-worthy: 0.85.' },
};

const SEV = {
  critical: { label:'CRITICAL', bg:'#FCEEF1', border:'rgba(196,30,58,0.25)', badge:'#C41E3A', text:'#8B0F23' },
  high:     { label:'HIGH',     bg:'#F3F3F1', border:'rgba(74,96,112,0.2)',  badge:'#4A6070', text:'#2D3748' },
  medium:   { label:'MEDIUM',   bg:'#E8FDF4', border:'rgba(11,191,122,0.2)', badge:'#0BBF7A', text:'#065F46' },
  low:      { label:'LOW',      bg:'#F3F3F1', border:'rgba(107,114,128,0.2)',badge:'#6B7280', text:'#374151' },
};

const REGULATORY = {
  credit:      { label:'SLFRS 9',                  body:"ECL provisions must accurately reflect each loan's stage classification. Misstaging reduces provisions and understates regulatory capital requirements." },
  transaction: { label:'FTRA — Section 7',          body:"Structuring (deliberately breaking transactions below LKR 5M) is a criminal offence. Banks must file STRs with CBSL FIU within 5 working days." },
  suspense:    { label:'CBSL Suspense Guidelines',  body:"All suspense balances aged beyond 90 days must be escalated to the Board Audit Committee. Phantom receivable characteristics are independently STR-eligible under FTRA." },
  kyc:         { label:'CBSL KYC/AML Direction',    body:"PEP accounts require Enhanced Due Diligence with annual review. Material KYC gaps on legal entities require beneficial ownership disclosure." },
  controls:    { label:'CBSL Direction No. 5/2024', body:"No single staff member may have end-to-end control over any credit or payment transaction. SoD violations at this level constitute a material control failure requiring regulatory disclosure." },
  digital:     { label:'CBSL Circular No. 2/2025',  body:"Enhanced authentication controls for high-value digital transactions. Account Takeover via SIM swap is a reportable fraud event. Session logs must be maintained for 3 years." },
  trade:       { label:'FATF TBML Guidance (2020)', body:"Over/under-invoicing is the primary method globally for cross-border value transfer. CBSL requires invoice plausibility checks on all LC-financed trade transactions." },
  insider:     { label:'CBSL Direction No. 5/2024', body:"Banks must ensure SoD on all credit and payment transactions. Insider fraud above regulatory thresholds triggers mandatory regulatory notification." },
  mje:         { label:'CBSL Financial Reporting',  body:"Manual journal entries above LKR 10M require Maker-Checker approval from different individuals. After-hours postings to sensitive GL accounts require documented emergency authorisation." },
};

function extractEntities(text) {
  const s = new Set();
  (text.match(/\b(BR-\d+|STF-\d+|SUS-[A-Z0-9-]+|NTB-CORP-\d+|MJE-\d{4}-\d+|NTB-\d{4}-[A-Z]|NTB-0841-X|NTB-3312-B)/g)||[]).forEach(e=>s.add(e));
  return s;
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
      const data = state.agentResults[agentId] || demoData[agentId === 'insider' ? 'insiderRisk' : agentId];
      if (!data) return;
      (data.key_findings || []).forEach(f => result.push({ finding: f, agentId }));
    });
    return result;
  }, [state.agentResults]);

  const close = () => { dispatch({ type: 'CLOSE_FINDING' }); setActiveTab('detail'); };

  if (!active) return null;

  const { finding, agentId, agentName, agentColor, agentData } = active;
  const meta = AGENT_META[agentId] || { name: agentName || 'Agent', color: agentColor || '#185FA5', icon: '◎', path: '/agents', methodology: '' };
  const sev = finding.severity || 'medium';
  const pal = SEV[sev] || SEV.medium;
  const exposure = finding.affected_exposure_lkr || finding.affected_balance_lkr || 0;

  const myEntities = extractEntities((finding.finding || '') + ' ' + (finding.recommended_action || ''));
  const related = allAgentFindings.filter(({ finding: f, agentId: aid }) => {
    if (aid === agentId) return false;
    const text = (f.finding || '') + ' ' + (f.recommended_action || '');
    return [...myEntities].some(e => text.includes(e));
  });

  const orchData = state.orchestratorResult || demoData.orchestrator;
  const orchSignals = (agentData?.orchestrator_signals || []);
  const linkedCases = useMemo(() => {
    if (!finding) return [];
    const text = [finding.finding, finding.recommended_action, finding.entity, finding.account_id, finding.staff_id, finding.branch_code].filter(Boolean).join(' ');
    const matches = (text.match(/\b(BR-\d+|STF-\d+|SUS-[A-Z0-9-]+|NTB-0841-X)/g) || []);
    const all = matches.flatMap(e => getCasesForEntity(e));
    return all.filter((c, i, arr) => arr.findIndex(x => x.id === c.id) === i);
  }, [finding]);

  const tabs = [
    { id: 'detail',    label: 'Finding',  icon: Microscope },
    { id: 'connected', label: 'Connected', icon: GitMerge,   count: related.length },
    { id: 'signals',   label: 'Signals',   icon: Zap,        count: orchSignals.length },
    { id: 'context',   label: 'Context',   icon: BookOpen },
  ];

  const reg = REGULATORY[agentId];

  return (
    <div style={{ position:'fixed', inset:0, zIndex:600, display:'flex' }} onClick={close}>
      <div style={{ flex:1, background:'rgba(0,0,0,0.4)', backdropFilter:'blur(3px)' }} />
      <div onClick={e=>e.stopPropagation()} className="animate-slide-in"
        style={{ width:580, background:'var(--color-surface)', borderLeft:'1px solid var(--color-border)', display:'flex', flexDirection:'column', boxShadow:'-16px 0 48px rgba(0,0,0,0.18)', overflowY:'hidden' }}>

        {/* ── HEADER ── */}
        <div style={{ background:'var(--color-panel)', color:'white', padding:'0', flexShrink:0 }}>
          {/* Agent + close row */}
          <div style={{ padding:'14px 20px', display:'flex', alignItems:'center', gap:10, borderBottom:`1px solid ${meta.color}30` }}>
            <div style={{ width:32, height:32, borderRadius:8, background:`${meta.color}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, color:meta.color, flexShrink:0 }}>
              {meta.icon}
            </div>
            <div>
              <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:meta.color, fontFamily:'var(--font-display)' }}>{meta.name}</div>
              <div style={{ fontSize:10, color:'rgba(255,255,255,0.4)', marginTop:1 }}>AI Audit Agent · NTB FY 2025</div>
            </div>
            <button onClick={close} style={{ marginLeft:'auto', width:28, height:28, borderRadius:6, background:'rgba(255,255,255,0.08)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,0.5)' }}>
              <X size={14} />
            </button>
          </div>

          {/* Severity + exposure */}
          <div style={{ padding:'16px 20px 18px', display:'flex', gap:12, alignItems:'flex-start' }}>
            <div>
              <span style={{ fontSize:10, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.08em', padding:'4px 10px', borderRadius:6, background:pal.badge, color:'white' }}>{pal.label}</span>
            </div>
            <div style={{ flex:1 }}>
              {exposure > 0 && (
                <div style={{ fontSize:22, fontWeight:900, color:'white', lineHeight:1, fontFamily:'var(--font-display)', marginBottom:4 }}>
                  LKR {exposure >= 1e9 ? `${(exposure/1e9).toFixed(2)} Bn` : `${(exposure/1e6).toFixed(0)} M`}
                </div>
              )}
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.45)', display:'flex', gap:10 }}>
                {[...myEntities].slice(0,4).map(e=>(
                  <code key={e} style={{ padding:'2px 7px', background:'rgba(255,255,255,0.08)', borderRadius:4, fontSize:10, color:meta.color }}>{e}</code>
                ))}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display:'flex', borderTop:`1px solid rgba(255,255,255,0.07)` }}>
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button key={tab.id} onClick={()=>setActiveTab(tab.id)}
                  style={{ flex:1, padding:'10px 4px', background:'none', border:'none', borderBottom:`2px solid ${activeTab===tab.id?meta.color:'transparent'}`, cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:3, transition:'all 0.15s' }}>
                  <Icon size={13} style={{ color:activeTab===tab.id?meta.color:'rgba(255,255,255,0.35)' }} />
                  <span style={{ fontSize:10, fontWeight:activeTab===tab.id?700:400, color:activeTab===tab.id?meta.color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.06em', fontFamily:'var(--font-display)' }}>
                    {tab.label}{tab.count != null && tab.count > 0 ? ` (${tab.count})` : ''}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── BODY ── */}
        <div style={{ flex:1, overflowY:'auto' }}>

          {/* ─── FINDING DETAIL TAB ─── */}
          {activeTab === 'detail' && (
            <div style={{ padding:'20px' }}>
              {/* Main finding text */}
              <div style={{ background:pal.bg, border:`1px solid ${pal.border}`, borderLeft:`4px solid ${pal.badge}`, borderRadius:10, padding:'16px 18px', marginBottom:16 }}>
                <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:pal.badge, marginBottom:8, display:'flex', alignItems:'center', gap:6 }}>
                  <AlertTriangle size={11} /> Detection Finding
                </div>
                <p style={{ fontSize:14, color:'var(--color-text)', lineHeight:1.8, margin:0, fontWeight:500 }}>{finding.finding}</p>
              </div>

              {/* Key numbers grid */}
              {exposure > 0 && (
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:16 }}>
                  {[
                    { label:'Exposure', val: exposure >= 1e9 ? `LKR ${(exposure/1e9).toFixed(2)}Bn` : `LKR ${(exposure/1e6).toFixed(0)}M`, color:pal.badge },
                    { label:'Severity', val:pal.label, color:pal.badge },
                    { label:'Agent score', val:finding.anomaly_score != null ? `${(finding.anomaly_score*100).toFixed(0)}/100` : finding.risk_score != null ? `${finding.risk_score}/100` : 'N/A', color:meta.color },
                  ].map((m,i)=>(
                    <div key={i} style={{ padding:'12px 14px', background:'var(--color-surface-2)', border:'1px solid var(--color-border)', borderRadius:8, textAlign:'center' }}>
                      <div style={{ fontSize:18, fontWeight:900, color:m.color, fontFamily:'var(--font-display)' }}>{m.val}</div>
                      <div style={{ fontSize:10, color:'var(--color-text-3)', textTransform:'uppercase', letterSpacing:'0.06em', marginTop:3 }}>{m.label}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Recommended action */}
              {finding.recommended_action && (
                <div style={{ marginBottom:16, padding:'12px 16px', background:'var(--color-surface-2)', borderRadius:10, borderLeft:`3px solid ${meta.color}` }}>
                  <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:'var(--color-text-3)', marginBottom:6, display:'flex', alignItems:'center', gap:5 }}>
                    <CheckCircle size={11} /> Recommended Action
                  </div>
                  <p style={{ fontSize:13, color:'var(--color-text)', margin:0, lineHeight:1.65 }}>{finding.recommended_action}</p>
                </div>
              )}

              {/* Detection method */}
              <div style={{ padding:'12px 16px', background:'var(--color-panel)', borderRadius:10, marginBottom:16 }}>
                <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:'rgba(255,255,255,0.4)', marginBottom:8, display:'flex', alignItems:'center', gap:5, fontFamily:'var(--font-display)' }}>
                  <Microscope size={11} /> Detection Methodology
                </div>
                <p style={{ fontSize:12, color:'rgba(255,255,255,0.65)', margin:0, lineHeight:1.7 }}>{meta.methodology}</p>
              </div>

              {/* Linked cases */}
              {linkedCases.length > 0 && (
                <div>
                  <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:'var(--color-text-3)', marginBottom:8, display:'flex', alignItems:'center', gap:5 }}>
                    <Clock size={11} /> Active Investigations ({linkedCases.length})
                  </div>
                  {linkedCases.map(cas=>(
                    <div key={cas.id} onClick={()=>{ navigate('/cases', { state:{ caseId:cas.id } }); close(); }}
                      style={{ padding:'10px 14px', background:'var(--color-surface)', border:`1px solid ${CASE_SEV_COLOR[cas.severity]}22`, borderRadius:8, cursor:'pointer', marginBottom:6, display:'flex', alignItems:'center', gap:10, transition:'background 0.12s' }}
                      onMouseEnter={e=>e.currentTarget.style.background=`${CASE_SEV_COLOR[cas.severity]}06`}
                      onMouseLeave={e=>e.currentTarget.style.background='var(--color-surface)'}>
                      <span style={{ fontSize:9, fontWeight:800, padding:'2px 6px', borderRadius:3, background:CASE_SEV_COLOR[cas.severity], color:'white' }}>{cas.severity?.toUpperCase()}</span>
                      <code style={{ fontSize:10, color:'var(--color-text-3)' }}>{cas.id}</code>
                      <span style={{ fontSize:12, color:'var(--color-text)', flex:1 }}>{cas.title.slice(0,50)}{cas.title.length>50?'…':''}</span>
                      <ArrowRight size={13} style={{ color:'var(--color-text-3)', flexShrink:0 }} />
                    </div>
                  ))}
                </div>
              )}

              {/* Next steps */}
              <div style={{ marginTop:16 }}>
                <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:'var(--color-text-3)', marginBottom:8 }}>Immediate Next Steps</div>
                {[
                  { text: sev==='critical'||sev==='high' ? 'Escalate to Head of Compliance and Chief Audit Executive immediately' : 'Assign to appropriate compliance or audit team', urgent:sev==='critical' },
                  { text:'Open a formal case in Case Manager and assign an SLA deadline', urgent:false },
                  { text: related.length>0 ? `Review ${related.length} connected findings from other agents — multi-agent pattern confirmed` : 'Check if related findings exist across other agent modules', urgent:related.length>0 },
                  { text: sev==='critical'||sev==='high' ? 'Assess STR/SAR filing obligation under FTRA within 5 working days' : 'Schedule for review at next audit cycle', urgent:false },
                ].map((step,i)=>(
                  <div key={i} style={{ display:'flex', gap:10, padding:'8px 0', borderBottom:i<3?'1px solid var(--color-border)':'none', alignItems:'flex-start' }}>
                    <div style={{ width:18, height:18, borderRadius:'50%', border:`2px solid ${step.urgent?pal.badge:'var(--color-border-strong)'}`, background:step.urgent?pal.bg:'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>
                      <span style={{ fontSize:9, fontWeight:800, color:step.urgent?pal.badge:'var(--color-text-3)' }}>{i+1}</span>
                    </div>
                    <span style={{ fontSize:12, color:step.urgent?pal.text:'var(--color-text-2)', fontWeight:step.urgent?600:400, lineHeight:1.5 }}>{step.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── CONNECTED TAB ─── */}
          {activeTab === 'connected' && (
            <div style={{ padding:'20px' }}>
              {related.length === 0 ? (
                <div style={{ textAlign:'center', padding:'48px 16px', color:'var(--color-text-3)' }}>
                  <GitMerge size={32} style={{ marginBottom:12, opacity:0.25 }} />
                  <div style={{ fontSize:13, fontWeight:600, marginBottom:6 }}>No connected findings yet</div>
                  <div style={{ fontSize:12 }}>Entities in this finding don't appear in findings from other agents.</div>
                </div>
              ) : (
                <>
                  <div style={{ padding:'10px 14px', background:'var(--color-surface-2)', borderRadius:8, fontSize:12, color:'var(--color-text-2)', marginBottom:16, lineHeight:1.6 }}>
                    <strong style={{ color:'var(--color-text)' }}>{related.length} connected finding{related.length!==1?'s':''}</strong> from other agents mention the same entities as this finding — confirming a multi-agent corroborated pattern.
                  </div>
                  {related.map(({ finding: f, agentId: aid }, i) => {
                    const srcMeta = AGENT_META[aid] || AGENT_META.credit;
                    const srcSev = SEV[f.severity] || SEV.medium;
                    const srcExposure = f.affected_exposure_lkr || f.affected_balance_lkr || 0;
                    return (
                      <div key={i} style={{ marginBottom:12, border:`1px solid ${srcMeta.color}22`, borderLeft:`3px solid ${srcMeta.color}`, borderRadius:10, overflow:'hidden' }}>
                        <div style={{ padding:'10px 14px', background:`${srcMeta.color}06`, display:'flex', gap:8, alignItems:'center', borderBottom:`1px solid ${srcMeta.color}18` }}>
                          <span style={{ fontSize:14, color:srcMeta.color }}>{srcMeta.icon}</span>
                          <span style={{ fontSize:11, fontWeight:700, color:srcMeta.color, fontFamily:'var(--font-display)' }}>{srcMeta.name}</span>
                          <span style={{ fontSize:9, fontWeight:800, padding:'2px 6px', background:srcSev.badge, color:'white', borderRadius:4, marginLeft:'auto' }}>{srcSev.label}</span>
                          {srcExposure > 0 && <span style={{ fontSize:11, fontWeight:700, color:'var(--color-text)' }}>LKR {srcExposure>=1e9?`${(srcExposure/1e9).toFixed(1)}Bn`:`${(srcExposure/1e6).toFixed(0)}M`}</span>}
                        </div>
                        <div style={{ padding:'12px 14px' }}>
                          <p style={{ fontSize:12, color:'var(--color-text)', margin:0, lineHeight:1.7 }}>{f.finding}</p>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          )}

          {/* ─── SIGNALS TAB ─── */}
          {activeTab === 'signals' && (
            <div style={{ padding:'20px' }}>
              {orchSignals.length === 0 ? (
                <div style={{ textAlign:'center', padding:'48px 16px', color:'var(--color-text-3)' }}>
                  <Zap size={32} style={{ marginBottom:12, opacity:0.25 }} />
                  <div style={{ fontSize:13, fontWeight:600 }}>No orchestrator signals</div>
                </div>
              ) : (
                <>
                  <div style={{ fontSize:11, color:'var(--color-text-2)', marginBottom:16, lineHeight:1.6, padding:'10px 14px', background:'var(--color-surface-2)', borderRadius:8 }}>
                    The Orchestrator sent {orchSignals.length} signal{orchSignals.length!==1?'s':''} from this agent to other agents, triggering investigation in those domains.
                  </div>
                  {orchSignals.map((sig, i) => {
                    const tgtMeta = AGENT_META[sig.target_agent] || AGENT_META.credit;
                    return (
                      <div key={i} style={{ marginBottom:12, padding:'14px 16px', background:'var(--color-surface)', border:'1px solid var(--color-border)', borderRadius:10 }}>
                        <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:8 }}>
                          <div style={{ padding:'4px 10px', background:`${meta.color}15`, color:meta.color, borderRadius:6, fontSize:11, fontWeight:700 }}>{meta.name}</div>
                          <ArrowRight size={14} style={{ color:'var(--color-text-3)', flexShrink:0 }} />
                          <div style={{ padding:'4px 10px', background:`${tgtMeta.color}15`, color:tgtMeta.color, borderRadius:6, fontSize:11, fontWeight:700 }}>{tgtMeta.name}</div>
                        </div>
                        <p style={{ fontSize:12, color:'var(--color-text-2)', margin:0, lineHeight:1.65 }}>{sig.signal || sig.message}</p>
                        {sig.shared_entity_id && <code style={{ fontSize:10, color:'var(--color-text-3)', marginTop:6, display:'block' }}>{sig.shared_entity_id}</code>}
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          )}

          {/* ─── CONTEXT TAB ─── */}
          {activeTab === 'context' && (
            <div style={{ padding:'20px', display:'flex', flexDirection:'column', gap:14 }}>

              {/* Regulatory framework */}
              {reg && (
                <div style={{ background:'var(--color-panel)', borderRadius:10, padding:'16px 18px' }}>
                  <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:'rgba(255,255,255,0.4)', marginBottom:10, display:'flex', alignItems:'center', gap:5, fontFamily:'var(--font-display)' }}>
                    <Shield size={11} /> Regulatory Framework
                  </div>
                  <div style={{ fontSize:13, fontWeight:700, color:'var(--octave-turquoise)', marginBottom:8 }}>{reg.label}</div>
                  <p style={{ fontSize:12, color:'rgba(255,255,255,0.65)', margin:0, lineHeight:1.7 }}>{reg.body}</p>
                </div>
              )}

              {/* Detection methodology */}
              <div style={{ background:'var(--color-surface-2)', border:'1px solid var(--color-border)', borderRadius:10, padding:'16px 18px' }}>
                <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:'var(--color-text-3)', marginBottom:8, display:'flex', alignItems:'center', gap:5, fontFamily:'var(--font-display)' }}>
                  <Microscope size={11} /> Agent Methodology
                </div>
                <p style={{ fontSize:12, color:'var(--color-text-2)', margin:0, lineHeight:1.7 }}>{meta.methodology}</p>
              </div>

              {/* Linked cases */}
              {linkedCases.length > 0 && (
                <div>
                  <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:'var(--color-text-3)', marginBottom:10, display:'flex', alignItems:'center', gap:5 }}>
                    <Clock size={11} /> Active Investigations
                  </div>
                  {linkedCases.map(cas=>(
                    <div key={cas.id} onClick={()=>{ navigate('/cases', { state:{ caseId:cas.id } }); close(); }}
                      style={{ padding:'10px 14px', background:'var(--color-surface)', border:`1px solid ${CASE_SEV_COLOR[cas.severity]}22`, borderRadius:8, cursor:'pointer', marginBottom:6, display:'flex', alignItems:'center', gap:10 }}
                      onMouseEnter={e=>e.currentTarget.style.background=`${CASE_SEV_COLOR[cas.severity]}06`}
                      onMouseLeave={e=>e.currentTarget.style.background='var(--color-surface)'}>
                      <span style={{ fontSize:9, fontWeight:800, padding:'2px 6px', borderRadius:3, background:CASE_SEV_COLOR[cas.severity], color:'white' }}>{cas.severity?.toUpperCase()}</span>
                      <code style={{ fontSize:10, color:'var(--color-text-3)' }}>{cas.id}</code>
                      <span style={{ fontSize:12, color:'var(--color-text)', flex:1 }}>{cas.title.slice(0,50)}…</span>
                      <span style={{ fontSize:10, color:CASE_STATUS_COLOR[cas.status] }}>{cas.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── FOOTER ── */}
        <div style={{ padding:'14px 20px', borderTop:'1px solid var(--color-border)', display:'flex', gap:10, flexShrink:0, background:'var(--color-surface)' }}>
          <button onClick={()=>{ navigate(meta.path); close(); }}
            style={{ flex:1, padding:'10px 14px', background:meta.color, color:'white', border:'none', borderRadius:8, fontSize:13, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6, fontFamily:'var(--font-display)' }}>
            {meta.icon} Open {meta.name} <ChevronRight size={14} />
          </button>
          <button onClick={()=>{ navigate('/cases', { state:{ caseId:linkedCases[0]?.id } }); close(); }}
            style={{ padding:'10px 14px', background:'var(--color-surface-2)', color:'var(--color-text)', border:'1px solid var(--color-border-strong)', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:5 }}>
            <Clock size={13} /> Cases
          </button>
        </div>
      </div>
    </div>
  );
}

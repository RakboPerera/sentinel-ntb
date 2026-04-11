import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { branchRiskData, demoData } from '../../data/demoData.js';
import InfoTooltip from '../../components/shared/InfoTooltip.jsx';
import { InsightBox } from '../../components/shared/VisualComponents.jsx';
import { ChevronRight, X, AlertTriangle, Upload, Database, FileText, Zap } from 'lucide-react';
import { getCasesForCell, getCasesForBranch, CASE_SEV_COLOR, CASE_STATUS_COLOR } from '../../data/caseRegistry.js';

// ─── COLUMNS ─────────────────────────────────────────────────────────────────

const COLUMNS = [
  { key:'credit',      label:'Credit Quality',    agentId:'credit',      agentName:'Credit Intelligence',       path:'/agents/credit',      sampleFile:'01_credit_portfolio.csv',  tooltip:'Staging anomalies, override concentration, vintage quality, sector NPL rates.' },
  { key:'transaction', label:'AML / Structuring', agentId:'transaction', agentName:'Transaction Surveillance',  path:'/agents/transaction',  sampleFile:'02_transactions.csv',        tooltip:'Structuring clusters, velocity anomalies, Benford deviation, network hub-spoke patterns.' },
  { key:'suspense',    label:'Suspense & Recon',  agentId:'suspense',    agentName:'Suspense & Reconciliation', path:'/agents/suspense',    sampleFile:'03_suspense_accounts.csv',   tooltip:'Aging profile, clearing ratio, phantom receivable risk, re-aging detection.' },
  { key:'kyc',         label:'KYC Compliance',    agentId:'kyc',         agentName:'Identity & KYC / AML',     path:'/agents/kyc',         sampleFile:'04_kyc_customers.csv',       tooltip:'Document gap rate, PEP coverage, introducer concentration, CDD completeness.' },
  { key:'controls',    label:'Internal Controls', agentId:'controls',    agentName:'Internal Controls',         path:'/agents/controls',    sampleFile:'05_internal_controls.csv',   tooltip:'Override rate, SoD violations, off-hours approvals, approver concentration index.' },
  { key:'digital',     label:'Digital Fraud',     agentId:'digital',     agentName:'Digital Fraud & Identity',  path:'/agents/digital',     sampleFile:'06_digital_sessions.csv',    tooltip:'Behavioral biometrics, impossible travel, device sharing, insider risk signals.' },
  { key:'trade',       label:'Trade Finance',     agentId:'trade',       agentName:'Trade Finance & Treasury',  path:'/agents/trade',       sampleFile:'07_trade_treasury.csv',      tooltip:'Over/under-invoicing, duplicate LCs, TBML exposure, FATF counterparty risk.' },
  { key:'treasury',    label:'Treasury Risk',     agentId:'trade',       agentName:'Trade Finance & Treasury',  path:'/agents/trade',       sampleFile:'07_trade_treasury.csv',      tooltip:'FX position limit breaches, intraday NOP, NSFR/LCR contribution from this branch.' },
];

// ─── BRANCH FINDINGS EXTRACTOR ───────────────────────────────────────────────

function getBranchFindings(branchCode, colKey) {
  const cr = demoData.credit      || {};
  const tr = demoData.transaction || {};
  const su = demoData.suspense    || {};
  const ky = demoData.kyc         || {};
  const co = demoData.controls    || {};
  const di = demoData.digital     || {};
  const td = demoData.trade       || {};
  const ir = demoData.insiderRisk || {};

  switch (colKey) {
    case 'credit': {
      const loans = (cr.flagged_loans || []).filter(l => l.branch_code === branchCode);
      const brConc = (cr.branch_concentration || []).find(b => b.branch_code === branchCode);
      return {
        agentId: 'credit',
        items: loans.map(l => ({
          id: l.loan_id, severity: l.anomaly_score >= 0.9 ? 'critical' : l.anomaly_score >= 0.8 ? 'high' : 'medium',
          headline: l.loan_id + ' — Stage ' + l.assigned_stage + ' → Stage ' + l.predicted_stage + ' predicted',
          meta: 'LKR ' + (l.exposure_lkr/1e6).toFixed(0) + 'M · Anomaly score ' + l.anomaly_score.toFixed(2),
          detail: l.primary_driver, explanation: l.explanation, amount: l.exposure_lkr,
          badge: l.override_flag ? 'Override' : null,
        })),
        metrics: brConc ? [
          { label:'Flagged loans',      value:brConc.flagged_count,                               unit:'',   peer:9,   peerLabel:'Network avg/branch',  higherIsBad:true,  tooltip:'Number of loans at this branch flagged by the Credit Agent anomaly model.' },
          { label:'Branch exposure',    value:'LKR '+(brConc.flagged_exposure_lkr/1e6).toFixed(0)+'M', unit:'', peer:null },
          { label:'Override-flagged',   value:brConc.override_flagged_count,                      unit:'',   peer:1,   peerLabel:'Network avg',         higherIsBad:true,  tooltip:'Loans approved via override that are also flagged as anomalous — the highest-risk combination.' },
        ] : [],
        emptyMsg: 'No override-flagged loans linked to this branch in demo data.',
      };
    }
    case 'transaction': {
      const clusters = (tr.structuring_clusters||[]).filter(c=>c.branch_code===branchCode);
      const velocity = (tr.velocity_anomalies ||[]).filter(v=>v.branch_code===branchCode);
      return {
        agentId: 'transaction',
        items: [
          ...clusters.map(c => ({
            id:c.account_id, severity: (c.structuring_score||0.94)>=0.9?'critical':'high',
            headline:'Structuring cluster — '+c.account_id,
            meta:c.cluster_transactions+' txns in '+c.cluster_timespan_minutes+' min · LKR '+(c.combined_amount_lkr/1e6).toFixed(1)+'M',
            detail:'Structuring score: '+(c.structuring_score||0.94).toFixed(2),
            explanation:'Multiple transactions clustered just below the LKR 5M STR threshold within a compressed time window — a deliberate structuring pattern.',
            amount:c.combined_amount_lkr, badge:'Structuring',
          })),
          ...velocity.map(v => ({
            id:v.account_id, severity:v.velocity_multiple>=10?'critical':v.velocity_multiple>=5?'high':'medium',
            headline:'Velocity anomaly — '+v.account_id,
            meta:v.txn_count_in_window+' txns · '+v.velocity_multiple+'× above baseline · LKR '+(v.total_volume_lkr/1e6).toFixed(1)+'M',
            detail:'Baseline: '+v.implied_baseline_count+' txns/window. Actual: '+v.txn_count_in_window+'.',
            explanation:v.risk_flag||'Transaction velocity is '+v.velocity_multiple+'× above this account\'s 90-day rolling baseline — statistically anomalous.',
            amount:v.total_volume_lkr, badge:'Velocity',
          })),
        ],
        metrics:[
          { label:'Structuring clusters', value:clusters.length, unit:'', peer:0, peerLabel:'Expected (clean branch)', higherIsBad:true, tooltip:'Number of structuring clusters where transactions are deliberately split below the STR threshold.' },
          { label:'Velocity anomalies',   value:velocity.length,  unit:'', peer:0, peerLabel:'Expected (clean branch)', higherIsBad:true, tooltip:'Accounts with transaction velocity significantly above their individual 90-day rolling baseline.' },
        ],
        emptyMsg:'No structuring clusters or velocity anomalies linked to this branch.',
      };
    }
    case 'suspense': {
      const accounts = (su.flagged_accounts||[]).filter(a=>a.branch_code===branchCode);
      return {
        agentId:'suspense',
        items:accounts.map(a => ({
          id:a.account_id, severity:a.risk_tier==='critical'?'critical':a.risk_tier==='red'?'high':'medium',
          headline:a.account_id+' — '+a.account_type,
          meta:'LKR '+(a.current_balance_lkr/1e6).toFixed(0)+'M · '+a.aging_days+'d aged · Clearing ratio '+a.clearing_ratio,
          detail:'30-day growth: +'+a.growth_rate_30d_pct+'%',
          explanation:a.regulatory_breach_risk?'CBSL 90-day guideline breached — Board Audit Committee notification mandatory.':'Clearing ratio '+a.clearing_ratio+' is below the 0.90 threshold for a healthy clearing account. Combined with '+a.growth_rate_30d_pct+'% growth in 30 days, this indicates funds flowing in but not clearing — a phantom receivable signature.',
          amount:a.current_balance_lkr, badge:a.phantom_receivable_risk?'Phantom':a.ceft_fraud_indicators?'CEFT':null,
        })),
        metrics:accounts.length?[
          { label:'Unreconciled balance', value:'LKR '+(accounts.reduce((s,a)=>s+a.current_balance_lkr,0)/1e6).toFixed(0)+'M', unit:'', peer:null },
          { label:'Max aging',            value:Math.max(...accounts.map(a=>a.aging_days)), unit:' days', peer:30, peerLabel:'CBSL watch threshold', higherIsBad:true, tooltip:'CBSL requires escalation at 30 days and Board notification at 90 days.' },
          { label:'Min clearing ratio',   value:Math.min(...accounts.map(a=>a.clearing_ratio)).toFixed(2), unit:'', peer:0.90, peerLabel:'Healthy threshold', higherIsBad:true, tooltip:'A legitimate CEFT receivables account should clear at 90%+. Anything below 0.30 with high balance growth is a phantom receivable signal.' },
        ]:[],
        emptyMsg:'No flagged suspense accounts at this branch in demo data.',
      };
    }
    case 'kyc': {
      const bKyc = (ky.branch_compliance_heatmap||[]).find(b=>b.branch_code===branchCode);
      const intros = (ky.introducer_concentration||[]).filter(i=>i.introducer_code&&i.introducer_code.includes(branchCode.replace('BR-','')));
      return {
        agentId:'kyc',
        items:[
          ...(bKyc?[{
            id:branchCode, severity:bKyc.gap_rate_pct>10?'critical':bKyc.gap_rate_pct>5?'high':'medium',
            headline:'KYC gap rate '+bKyc.gap_rate_pct+'% — '+branchCode,
            meta:bKyc.critical_gaps+' critical gaps · '+bKyc.pep_accounts+' PEP accounts · Score '+bKyc.risk_score+'/100',
            detail:'Gap rate '+(bKyc.gap_rate_pct>5?'above':'approaching')+' the CBSL 5% threshold.',
            explanation:'A gap rate of '+bKyc.gap_rate_pct+'% means '+bKyc.gap_rate_pct+'% of accounts at this branch have an outstanding KYC deficiency — expired documents, missing beneficial ownership, or EDD not performed for PEP-linked accounts.',
            amount:0, badge:bKyc.gap_rate_pct>5?'Gap breach':null,
          }]:[]),
          ...intros.map(i=>({
            id:i.introducer_code, severity:i.flag?'high':'medium',
            headline:'Introducer concentration — '+i.introducer_code,
            meta:i.accounts_with_gaps+' of '+i.total_accounts_introduced+' introduced accounts have KYC gaps',
            detail:'Gap rate: '+((i.accounts_with_gaps/i.total_accounts_introduced)*100).toFixed(0)+'% of introduced accounts',
            explanation:i.risk_narrative||'High concentration of KYC gaps in accounts introduced by a single introducer code — a facilitation pattern consistent with systematic KYC bypass.',
            amount:0, badge:i.flag?'Introducer risk':null,
          })),
        ],
        metrics:bKyc?[
          { label:'KYC gap rate',     value:bKyc.gap_rate_pct, unit:'%', peer:4.7, peerLabel:'Network average',       higherIsBad:true,  tooltip:'Percentage of accounts at this branch with an outstanding KYC deficiency.' },
          { label:'Critical gaps',    value:bKyc.critical_gaps, unit:'', peer:2,   peerLabel:'Network avg/branch',    higherIsBad:true,  tooltip:'Accounts with a critical gap — expired identity, missing PEP EDD, or FATF exposure not documented.' },
          { label:'PEP accounts',     value:bKyc.pep_accounts,  unit:'', peer:null },
          { label:'Branch KYC score', value:bKyc.risk_score,    unit:'/100', peer:null },
        ]:[],
        emptyMsg:'No KYC compliance data for this branch in the current dataset.',
      };
    }
    case 'controls': {
      const bScore = (co.branch_risk_scores||[]).find(b=>b.branch_code===branchCode);
      const sods = (co.sod_violations||[]).filter(v=>v.branch_code===branchCode);
      const approvers = (co.flagged_approvers||[]).filter(a=>a.branch_code===branchCode);
      return {
        agentId:'controls',
        items:[
          ...sods.map(v=>({
            id:v.transaction_id, severity:v.severity||'critical',
            headline:'SoD violation — '+v.transaction_id,
            meta:'Staff: '+v.staff_id+' · LKR '+(v.amount_lkr/1e6).toFixed(1)+'M · '+v.transaction_type,
            detail:'Same person initiated AND approved — CBSL Direction No. 5/2024 breach.',
            explanation:'A Segregation of Duties violation means a single staff member controlled the full transaction lifecycle with no independent check. This is the most common enabler of insider fraud in Sri Lankan banking.',
            amount:v.amount_lkr, badge:'SoD Violation',
          })),
          ...approvers.map(a=>({
            id:a.staff_id, severity:a.override_concentration_pct>70?'critical':'high',
            headline:'Flagged approver — '+a.staff_id,
            meta:a.override_count+' overrides · '+a.override_concentration_pct+'% branch concentration · '+a.sod_violations+' SoD violations',
            detail:(a.risk_narrative||'').slice(0,140)+(a.risk_narrative&&a.risk_narrative.length>140?'…':''),
            explanation:a.risk_narrative||'Abnormal override concentration by a single approver is the primary insider fraud enabling pattern.',
            amount:0, badge:'Approver risk',
          })),
        ],
        metrics:bScore?[
          { label:'Composite score',       value:bScore.composite_score,              unit:'/100', peer:65,  peerLabel:'Pass threshold',     higherIsBad:false, tooltip:'6-dimension composite. Below 65 requires enhanced monitoring; below 50 triggers mandatory field audit.' },
          { label:'Override rate',         value:bScore.override_rate_pct,            unit:'%',    peer:4.8, peerLabel:'Network average',    higherIsBad:true,  tooltip:'Percentage of transactions that required a control override. Network average is 4.8%; above 10% is anomalous.' },
          { label:'SoD violations',        value:bScore.sod_violation_count,          unit:'',     peer:0,   peerLabel:'Expected',           higherIsBad:true,  tooltip:'Any SoD violation is a critical control failure. Zero is the only acceptable value.' },
          { label:'Off-hours approvals',   value:bScore.off_hours_approval_pct,       unit:'%',    peer:4.0, peerLabel:'Network average',    higherIsBad:true,  tooltip:'Approvals processed outside business hours. Network average is 4%; above 15% is anomalous.' },
          { label:'Approver concentration',value:bScore.approver_concentration_index?.toFixed(2), unit:'', peer:0.25, peerLabel:'Healthy threshold', higherIsBad:true, tooltip:'Herfindahl-style index measuring how concentrated overrides are in a single approver. 1.0 = 100% by one person.' },
        ]:[],
        emptyMsg:'No control failures detected at this branch in demo data.',
      };
    }
    case 'digital': {
      const sessions = (di.anomalous_sessions||[]).filter(s=>s.branch_code===branchCode);
      const staff = (ir.staff_profiles||[]).filter(p=>p.branch_code===branchCode);
      return {
        agentId:'digital',
        items:[
          ...sessions.map(s=>({
            id:s.session_id, severity:(s.behavioral_score||50)<30?'critical':(s.behavioral_score||50)<50?'high':'medium',
            headline:'Anomalous session — '+s.session_id,
            meta:'Account: '+s.account_id+' · '+(s.anomaly_type||'Behavioral anomaly').slice(0,60),
            detail:'Behavioral score: '+(s.behavioral_score||'—'),
            explanation:s.anomaly_type||'This session deviates from the account\'s 14-month behavioural baseline across multiple dimensions simultaneously — a strong account takeover or credential misuse signal.',
            amount:0, badge:s.anomaly_type&&s.anomaly_type.includes('travel')?'Impossible travel':s.anomaly_type&&s.anomaly_type.includes('off-hours')?'Off-hours':'Behavioral',
          })),
          ...staff.map(p=>({
            id:p.staff_id, severity:p.risk_score>=85?'critical':p.risk_score>=70?'high':'medium',
            headline:'Insider risk — '+p.staff_id+' ('+p.role+')',
            meta:'Risk score: '+p.risk_score+'/100 · '+p.flagged_sessions+' flagged sessions · '+p.override_count+' overrides',
            detail:(p.finding||'').slice(0,140)+((p.finding||'').length>140?'…':''),
            explanation:p.finding||'Staff member exhibits multiple insider fraud indicators simultaneously.',
            amount:p.linked_exposure_lkr||0, badge:p.sod_violations>0?'SoD + Insider':'Insider risk',
          })),
        ],
        metrics:[
          { label:'Anomalous sessions',   value:sessions.length, unit:'', peer:0, peerLabel:'Expected (clean branch)', higherIsBad:true, tooltip:'Sessions at this branch flagged by the behavioral biometrics engine.' },
          { label:'Staff risk profiles',  value:staff.length,    unit:'', peer:0, peerLabel:'Expected',                higherIsBad:true, tooltip:'Staff members at this branch with an insider risk score above 40/100.' },
          ...(staff.length?[{ label:'Max staff risk score', value:Math.max(...staff.map(p=>p.risk_score)), unit:'/100', peer:40, peerLabel:'Watch threshold', higherIsBad:true, tooltip:'Highest staff risk score at this branch. Above 70 = high risk; above 85 = critical.' }]:[]),
        ],
        emptyMsg:'No anomalous digital sessions or insider risk profiles at this branch.',
      };
    }
    case 'trade': {
      const anomalies = (td.pricing_anomalies||[]).filter(p=>p.branch_code===branchCode);
      const dupLCs = (td.duplicate_lc_cases||[]).filter(d=>d.branch_code===branchCode);
      return {
        agentId:'trade',
        items:[
          ...anomalies.map(a=>({
            id:a.document_id, severity:(a.tbml_score||0.7)>=0.85?'critical':'high',
            headline:'Invoice anomaly — '+a.customer_id+' (HS '+a.hs_code+')',
            meta:(a.commodity_description||'Trade commodity').slice(0,50)+' · Deviation: '+(a.deviation_pct||91)+'% from benchmark',
            detail:'TBML score: '+(a.tbml_score||'—')+' · '+(a.invoice_direction==='over'?'Over-invoicing':'Under-invoicing')+' detected',
            explanation:a.explanation||'Invoice amount deviates significantly from UN COMTRADE and Sri Lanka Customs median benchmarks for this HS code — a primary TBML indicator under FATF guidance.',
            amount:a.suspicious_flow_lkr||0, badge:'TBML risk',
          })),
          ...dupLCs.map(d=>({
            id:d.lc_reference_1, severity:'high',
            headline:'Duplicate LC — '+d.customer_id,
            meta:d.lc_reference_1+' and '+d.lc_reference_2+' — overlapping shipments',
            detail:'Same shipment documents presented for two separate Letters of Credit.',
            explanation:'Duplicate LC applications on overlapping shipment periods indicate double-financing — an LKR exposure cannot be supported by two LCs simultaneously.',
            amount:0, badge:'Duplicate LC',
          })),
        ],
        metrics:[
          { label:'Pricing anomalies', value:anomalies.length, unit:'', peer:0, peerLabel:'Expected', higherIsBad:true, tooltip:'Trade documents where invoice price deviates >25% from HS code benchmarks.' },
          { label:'Duplicate LC cases', value:dupLCs.length,   unit:'', peer:0, peerLabel:'Expected', higherIsBad:true, tooltip:'LC applications for the same shipment period from the same customer.' },
        ],
        emptyMsg:'No trade finance anomalies linked to this branch.',
      };
    }
    case 'treasury': {
      const breaches = (td.treasury_breaches||[]).filter(b=>b.branch_code===branchCode);
      return {
        agentId:'trade',
        items:breaches.map(b=>({
          id:b.position_id, severity:'high',
          headline:'NOP breach — '+b.currency_pair,
          meta:'Position: LKR '+(b.position_amount/1e6).toFixed(1)+'M · Limit: LKR '+(b.approved_limit_lkr/1e6).toFixed(1)+'M',
          detail:'Breach: '+(b.breach_pct||12).toFixed(0)+'% above approved limit',
          explanation:b.explanation||'Foreign currency position exceeded the approved intraday Net Open Position limit. CBSL requires dealers to reduce position immediately and document root cause.',
          amount:b.position_amount, badge:'NOP Breach',
        })),
        metrics:[
          { label:'NOP breaches', value:breaches.length, unit:'', peer:0, peerLabel:'Expected', higherIsBad:true, tooltip:'Intraday NOP limit breaches. Zero is the expected value for a well-managed treasury.' },
          { label:'LCR (network)', value:203.4, unit:'%', peer:120, peerLabel:'CBSL minimum', higherIsBad:false, tooltip:'Liquidity Coverage Ratio — must stay above 100%. NTB at 203.4% but declining from 320.6%.' },
          { label:'NSFR (network)', value:138.3, unit:'%', peer:100, peerLabel:'CBSL minimum', higherIsBad:false, tooltip:'Net Stable Funding Ratio — must stay above 100%. Declining trend from 154.7%.' },
        ],
        emptyMsg:'No treasury position breaches linked to this branch.',
      };
    }
    default:
      return { agentId:'credit', items:[], metrics:[], emptyMsg:'No data.' };
  }
}

// ─── SCORE HELPERS ────────────────────────────────────────────────────────────

function scoreColor(s) {
  if (s >= 75) return { bg:'#FEE2E2', border:'#FCA5A5', text:'#8B0F23', dot:'#C41E3A' };
  if (s >= 60) return { bg:'#FEF3C7', border:'#D1D0CB', text:'#3D3C38', dot:'#4A6070' };
  if (s >= 40) return { bg:'#F3F3F1', border:'#D1D0CB', text:'#3D3C38', dot:'#26EA9F' };
  return { bg:'#F0FDF4', border:'#BBF7D0', text:'#166534', dot:'#16A34A' };
}
function scoreTier(s) {
  if (s >= 75) return 'Critical';
  if (s >= 60) return 'Elevated';
  if (s >= 40) return 'Watch';
  return 'Safe';
}
function compositeScore(b) {
  return Math.round(COLUMNS.map(c=>b[c.key]).reduce((a,x)=>a+x,0)/COLUMNS.length);
}

// ─── FINDING ITEM ─────────────────────────────────────────────────────────────

function FindingItem({ item, accentColor }) {
  const [open, setOpen] = useState(false);
  const sevPal = {
    critical:{ bg:'#FEF0F0', border:'#FECACA', badge:'#C41E3A', text:'#8B0F23' },
    high:    { bg:'#F3F3F1', border:'#D1D0CB', badge:'#4A6070', text:'#3D3C38' },
    medium:  { bg:'#E8FDF4', border:'#A7F3D0', badge:'#0BBF7A', text:'#0BBF7A' },
  };
  const p = sevPal[item.severity] || sevPal.medium;
  return (
    <div style={{ border:`1px solid ${p.border}`, borderLeft:`4px solid ${p.badge}`, borderRadius:10, overflow:'hidden', marginBottom:10, background:p.bg }}>
      <div style={{ padding:'12px 14px', cursor:'pointer' }} onClick={()=>setOpen(o=>!o)}>
        <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:6, flexWrap:'wrap' }}>
          <span style={{ fontSize:10, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.08em', padding:'2px 8px', borderRadius:20, background:p.badge, color:'white' }}>{item.severity}</span>
          {item.badge && <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:20, background:`${p.badge}18`, color:p.text, border:`1px solid ${p.badge}33` }}>{item.badge}</span>}
          {item.amount > 0 && (
            <span style={{ fontSize:11, fontWeight:700, color:p.text, display:'flex', alignItems:'center', gap:4, marginLeft:'auto' }}>
              <AlertTriangle size={11}/>LKR {item.amount>=1e9?(item.amount/1e9).toFixed(2)+'Bn':(item.amount/1e6).toFixed(0)+'M'}
            </span>
          )}
        </div>
        <div style={{ fontSize:13, fontWeight:600, color:p.text, marginBottom:4 }}>{item.headline}</div>
        <div style={{ fontSize:11, color:p.text+'BB' }}>{item.meta}</div>
      </div>
      {open && (
        <div style={{ borderTop:`1px solid ${p.border}`, padding:'12px 14px', display:'flex', flexDirection:'column', gap:8, background:'rgba(255,255,255,0.45)' }}>
          {item.detail && <div style={{ fontSize:12, color:p.text, fontWeight:500 }}>{item.detail}</div>}
          {item.explanation && (
            <div style={{ fontSize:12, color:p.text+'DD', lineHeight:1.7, padding:'8px 12px', background:'rgba(255,255,255,0.6)', borderRadius:6 }}>{item.explanation}</div>
          )}
          <div style={{ display:'flex', alignItems:'center', gap:5 }}>
            <Zap size={12} style={{ color:p.badge }}/>
            <span style={{ fontSize:11, color:p.text, fontWeight:600 }}>Open the full agent for complete analysis →</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── PEER METRIC BAR ──────────────────────────────────────────────────────────

function PeerMetricBar({ label, value, unit, peer, peerLabel, higherIsBad, tooltip }) {
  if (value === null || value === undefined) return null;
  const numVal = parseFloat(String(value).replace(/[^0-9.]/g,''));
  const isAnomaly = peer !== null && !isNaN(numVal) && (higherIsBad ? numVal > peer : numVal < peer);
  const color = isAnomaly ? (Math.abs(numVal/(peer||1)-1)>0.5?'#C41E3A':'#4A6070') : '#16A34A';
  const peerMax = peer !== null ? Math.max(numVal, peer)*1.3 : null;
  return (
    <div style={{ padding:'10px 0', borderBottom:'1px solid var(--color-border)' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
        <div style={{ fontSize:12, color:'var(--color-text-2)', display:'flex', alignItems:'center', gap:5 }}>
          {label}{tooltip && <InfoTooltip text={tooltip} position="right" width={230}/>}
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <span style={{ fontSize:14, fontWeight:800, color, fontVariantNumeric:'tabular-nums' }}>{value}{unit||''}</span>
          {isAnomaly && peer!==null && (
            <span style={{ fontSize:10, fontWeight:700, padding:'1px 7px', background:`${color}18`, color, borderRadius:4, border:`1px solid ${color}30` }}>
              {numVal>peer?'+':''}{Math.round((numVal/peer-1)*100)}% vs avg
            </span>
          )}
        </div>
      </div>
      {peer!==null && !isNaN(numVal) && peerMax && (
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <div style={{ flex:1, height:6, borderRadius:3, background:'var(--color-surface-2)', overflow:'hidden', position:'relative' }}>
            <div style={{ width:`${Math.min(100,(numVal/peerMax)*100)}%`, height:'100%', background:color, borderRadius:3, transition:'width 0.5s ease' }}/>
            <div style={{ position:'absolute', left:`${(peer/peerMax)*100}%`, top:0, bottom:0, width:2, background:'#185FA5AA' }}/>
          </div>
          <span style={{ fontSize:10, color:'var(--color-text-3)', whiteSpace:'nowrap', flexShrink:0 }}>{peerLabel}: {peer}{unit||''}</span>
        </div>
      )}
    </div>
  );
}

// ─── CELL DETAIL DRAWER ───────────────────────────────────────────────────────

function CellDetailDrawer({ branch, col, onClose }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('findings');
  if (!branch || !col) return null;

  const score = branch[col.key];
  const c = scoreColor(score);
  const composite = compositeScore(branch);
  const findings = useMemo(()=>getBranchFindings(branch.code, col.key), [branch.code, col.key]);

  const critN = findings.items.filter(i=>i.severity==='critical').length;
  const highN  = findings.items.filter(i=>i.severity==='high').length;

  const tabs = [
    { id:'findings', label:`Findings (${findings.items.length})` },
    { id:'metrics',  label:'Branch Metrics' },
    { id:'upload',   label:'Upload Data' },
  ];

  return (
    <div style={{ position:'fixed', inset:0, zIndex:500, display:'flex' }} onClick={onClose}>
      <div style={{ flex:1, background:'rgba(0,0,0,0.32)', backdropFilter:'blur(2px)' }}/>
      <div onClick={e=>e.stopPropagation()} className="animate-slide-in"
        style={{ width:540, background:'var(--color-surface)', borderLeft:'1px solid var(--color-border)', display:'flex', flexDirection:'column', boxShadow:'-12px 0 48px rgba(0,0,0,0.18)', overflowY:'hidden' }}>

        {/* HEADER */}
        <div style={{ padding:'20px 24px', background:c.bg, borderBottom:'1px solid var(--color-border)', flexShrink:0 }}>
          <div style={{ display:'flex', gap:10, alignItems:'flex-start', marginBottom:14 }}>
            <div style={{ flex:1 }}>
              <div style={{ display:'flex', gap:6, alignItems:'center', marginBottom:10, flexWrap:'wrap' }}>
                <span style={{ fontSize:10, fontWeight:800, letterSpacing:'0.1em', textTransform:'uppercase', padding:'3px 10px', borderRadius:20, background:c.dot, color:'white' }}>{scoreTier(score)}</span>
                <span style={{ fontSize:11, fontWeight:600, padding:'2px 9px', borderRadius:10, background:'rgba(0,0,0,0.07)', color:'var(--color-text)' }}>{branch.name}</span>
                <span style={{ fontSize:11, color:'var(--color-text-3)' }}>·</span>
                <span style={{ fontSize:11, fontWeight:600, color:c.text }}>{col.label}</span>
                {(critN>0||highN>0) && (
                  <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:10, background:critN>0?'#C41E3A':'#4A6070', color:'white', marginLeft:'auto' }}>
                    {critN>0?`${critN} critical`:`${highN} high`}
                  </span>
                )}
              </div>
              <div style={{ display:'flex', alignItems:'flex-end', gap:10 }}>
                <div style={{ fontSize:44, fontWeight:900, color:c.text, lineHeight:1 }}>
                  {score}<span style={{ fontSize:16, fontWeight:400, color:c.text+'88' }}>/100</span>
                </div>
                <div style={{ paddingBottom:6, fontSize:11, color:c.text+'CC', lineHeight:1.5 }}>
                  {col.agentName}<br/>
                  <span style={{ color:c.text+'88', fontSize:10 }}>{col.sampleFile}</span>
                </div>
              </div>
            </div>
            <button onClick={onClose} style={{ padding:6, cursor:'pointer', color:'var(--color-text-3)', background:'rgba(0,0,0,0.05)', border:'none', borderRadius:6 }}>
              <X size={16}/>
            </button>
          </div>
          {/* Score bar */}
          <div style={{ position:'relative', height:10, borderRadius:5, overflow:'hidden', background:'rgba(0,0,0,0.1)' }}>
            <div style={{ width:`${score}%`, height:'100%', background:c.dot, borderRadius:5, transition:'width 0.5s ease' }}/>
            {[40,60,75].map(t=><div key={t} style={{ position:'absolute', left:`${t}%`, top:0, bottom:0, width:2, background:'rgba(255,255,255,0.5)' }}/>)}
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:3, fontSize:9, color:c.text+'88' }}>
            <span>0 Safe</span><span>40 Watch</span><span>60 Elevated</span><span>75 Critical</span><span>100</span>
          </div>
          {/* Flags */}
          {(branch.aml_flag||branch.cbsl_flag||branch.sla_breach) && (
            <div style={{ display:'flex', gap:6, marginTop:10, flexWrap:'wrap' }}>
              {branch.aml_flag && <span style={{ fontSize:10, fontWeight:700, padding:'3px 8px', background:'#FEF0F0', color:'#8B0F23', borderRadius:5, border:'1px solid #FECACA' }}>⚠ AML Active</span>}
              {branch.cbsl_flag && <span style={{ fontSize:10, fontWeight:700, padding:'3px 8px', background:'#FEF0F0', color:'#8B0F23', borderRadius:5, border:'1px solid #FECACA' }}>⚠ CBSL Pending</span>}
              {branch.sla_breach && <span style={{ fontSize:10, fontWeight:700, padding:'3px 8px', background:'#F3F3F1', color:'#3A5A3A', borderRadius:5, border:'1px solid #D1D0CB' }}>⏱ SLA Breach</span>}
            </div>
          )}
        </div>

        {/* TABS */}
        <div style={{ display:'flex', borderBottom:'1px solid var(--color-border)', flexShrink:0 }}>
          {tabs.map(tab=>(
            <button key={tab.id} onClick={()=>setActiveTab(tab.id)}
              style={{ flex:1, padding:'11px 6px', fontSize:12, fontWeight:activeTab===tab.id?600:400, color:activeTab===tab.id?c.dot:'var(--color-text-2)', background:activeTab===tab.id?`${c.dot}08`:'transparent', borderBottom:`2px solid ${activeTab===tab.id?c.dot:'transparent'}`, border:'none', cursor:'pointer', transition:'all 0.12s' }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* BODY */}
        <div style={{ flex:1, overflowY:'auto', padding:'16px 20px', display:'flex', flexDirection:'column', gap:12 }}>

          {/* ── FINDINGS TAB ── */}
          {activeTab==='findings' && (
            <>
              <div style={{ padding:'10px 14px', background:`${c.dot}08`, border:`1px solid ${c.dot}20`, borderRadius:8, fontSize:12, color:'var(--color-text-2)', lineHeight:1.6, display:'flex', gap:8 }}>
                <InfoTooltip text="Actual findings from the agent's data filtered to this specific branch. In demo mode these reflect NTB FY2025 data. In live mode they are generated by Claude after analysing your uploaded CSV." position="right" width={290}/>
                <span>
                  <strong style={{ color:'var(--color-text)' }}>{col.agentName}</strong> findings for <strong style={{ color:'var(--color-text)' }}>{branch.name} ({branch.code})</strong>. Click any finding to expand the full evidence and explanation.
                </span>
              </div>

              {findings.items.length > 0
                ? findings.items.map((item,i) => <FindingItem key={i} item={item} accentColor={c.dot}/>)
                : (
                  <div style={{ textAlign:'center', padding:'32px 20px', color:'var(--color-text-3)' }}>
                    <div style={{ fontSize:28, marginBottom:12 }}>✓</div>
                    <div style={{ fontSize:13, fontWeight:600, color:'var(--color-text-2)', marginBottom:6 }}>No agent findings for {branch.name} in this domain</div>
                    <div style={{ fontSize:12, lineHeight:1.6 }}>{findings.emptyMsg}</div>
                    <div style={{ fontSize:11, marginTop:10 }}>Score of <strong>{score}/100</strong> is from branch-level composite data. Upload branch-specific data to generate account-level findings.</div>
                  </div>
                )
              }
            </>
          )}

          {/* ── METRICS TAB ── */}
          {activeTab==='metrics' && (
            <>
              <div style={{ padding:'10px 14px', background:'var(--color-surface-2)', borderRadius:8, fontSize:12, color:'var(--color-text-2)', lineHeight:1.6, display:'flex', gap:8 }}>
                <InfoTooltip text="Key metrics for this branch in this risk domain compared to network averages. The blue reference line on each bar marks the network benchmark. Bars beyond the reference indicate statistical outliers." position="right" width={290}/>
                Peer comparison — <strong style={{ color:'var(--color-text)' }}>{branch.name}</strong> in <strong style={{ color:'var(--color-text)' }}>{col.label}</strong>.
              </div>

              {findings.metrics.length > 0
                ? <div>{findings.metrics.map((m,i)=><PeerMetricBar key={i} {...m}/>)}</div>
                : <div style={{ padding:20, textAlign:'center', color:'var(--color-text-3)', fontSize:12 }}>Upload branch data to see peer comparison metrics.</div>
              }

              {/* All 8 dimensions */}
              <div style={{ marginTop:4 }}>
                <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:'var(--color-text-3)', marginBottom:10, display:'flex', alignItems:'center', gap:5 }}>
                  All 8 risk dimensions — {branch.name}
                  <InfoTooltip text="Complete branch risk profile across all 8 audit domains. Active domain is highlighted. Composite is the unweighted average." position="right" width={250}/>
                </div>
                {COLUMNS.map(c2 => {
                  const s = branch[c2.key];
                  const sc2 = scoreColor(s);
                  const isActive = c2.key===col.key;
                  return (
                    <div key={c2.key} style={{ display:'grid', gridTemplateColumns:'136px 1fr 36px 54px', gap:8, alignItems:'center', padding:'6px 8px', borderRadius:6, marginBottom:2, background:isActive?`${sc2.dot}10`:'transparent', border:isActive?`1px solid ${sc2.dot}30`:'1px solid transparent' }}>
                      <span style={{ fontSize:11, color:isActive?sc2.dot:'var(--color-text-2)', fontWeight:isActive?700:400 }}>{c2.label}</span>
                      <div style={{ height:6, borderRadius:3, background:'var(--color-surface-2)', overflow:'hidden' }}>
                        <div style={{ width:`${s}%`, height:'100%', background:sc2.dot, borderRadius:3 }}/>
                      </div>
                      <span style={{ fontSize:12, fontWeight:700, color:sc2.dot, textAlign:'right', fontVariantNumeric:'tabular-nums' }}>{s}</span>
                      <span style={{ fontSize:9, color:sc2.dot, fontWeight:600 }}>{scoreTier(s)}</span>
                    </div>
                  );
                })}
                <div style={{ display:'flex', justifyContent:'space-between', padding:'8px 8px 0', fontSize:12, fontWeight:700, borderTop:'1px solid var(--color-border)', marginTop:4 }}>
                  <span style={{ color:'var(--color-text-2)' }}>Composite</span>
                  <span style={{ color:scoreColor(composite).text }}>{composite}/100 — {scoreTier(composite)}</span>
                </div>
              </div>
            </>
          )}

          {/* ── UPLOAD TAB ── */}
          {activeTab==='upload' && (
            <>
              <div style={{ padding:'12px 14px', background:`${c.dot}08`, border:`1px solid ${c.dot}22`, borderRadius:8, fontSize:12, color:'var(--color-text-2)', lineHeight:1.6 }}>
                Upload branch-specific data for <strong style={{ color:'var(--color-text)' }}>{branch.name}</strong> into the <strong style={{ color:'var(--color-text)' }}>{col.agentName}</strong> to generate live AI-powered findings for this specific branch × domain combination.
              </div>

              {/* Sample file */}
              <div style={{ padding:'14px 16px', background:'var(--color-surface-2)', border:'1px solid var(--color-border)', borderRadius:10 }}>
                <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:'var(--color-text-3)', marginBottom:10, display:'flex', alignItems:'center', gap:5 }}>
                  <FileText size={11}/> Sample data file
                  <InfoTooltip text="Download this file to see the exact column names and example rows required by this agent. Modify with your real branch data and upload in the Data Hub." position="right" width={270}/>
                </div>
                <div style={{ display:'flex', gap:10, alignItems:'center', padding:'10px 14px', background:'var(--color-surface)', border:'1px solid var(--color-border)', borderRadius:8 }}>
                  <Database size={20} style={{ color:c.dot, flexShrink:0 }}/>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:700 }}>{col.sampleFile}</div>
                    <div style={{ fontSize:11, color:'var(--color-text-3)' }}>Required schema for {col.agentName}</div>
                  </div>
                </div>
              </div>

              {/* What the agent looks for */}
              <div style={{ padding:'14px 16px', background:'var(--color-surface-2)', border:'1px solid var(--color-border)', borderRadius:10 }}>
                <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:'var(--color-text-3)', marginBottom:8, display:'flex', alignItems:'center', gap:5 }}>
                  What this agent analyses
                  <InfoTooltip text="The specific detection logic applied to your data. Ensure your file contains the required columns for the agent to produce findings." position="right" width={260}/>
                </div>
                <div style={{ fontSize:12, color:'var(--color-text-2)', lineHeight:1.7 }}>{col.tooltip}</div>
              </div>

              {/* Branch context */}
              <InsightBox type="info"
                title={`Branch filter — ${branch.name} (${branch.code})`}
                body={`The Data Hub will open pre-configured for the ${col.agentName}. Include a column named branch_code with value '${branch.code}' in your data to filter findings to this branch specifically. Without it, the agent analyses all branches in your file.`}
                compact
              />

              <button
                onClick={() => { navigate('/data', { state:{ agentId:findings.agentId, branchCode:branch.code, branchName:branch.name, colKey:col.key, agentName:col.agentName } }); onClose(); }}
                className="btn btn-primary"
                style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, fontSize:13, width:'100%' }}
              >
                <Upload size={14}/> Open Data Hub — {col.agentName}
              </button>
            </>
          )}
        </div>

        {/* FOOTER */}
        <div style={{ padding:'14px 20px', borderTop:'1px solid var(--color-border)', display:'flex', gap:10, flexShrink:0 }}>
          <button onClick={() => { navigate(col.path); onClose(); }} className="btn btn-primary"
            style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:7, fontSize:12 }}>
            Open {col.agentName} <ChevronRight size={13}/>
          </button>
          <button onClick={() => { navigate('/data', { state:{ agentId:findings.agentId, branchCode:branch.code, branchName:branch.name } }); onClose(); }}
            className="btn btn-secondary" style={{ display:'flex', alignItems:'center', gap:5, fontSize:12 }} title="Go to Data Hub for this agent">
            <Upload size={13}/> Data Hub
          </button>
          {branch.open_cases > 0 && (
            <button onClick={() => { navigate('/cases', { state: { branchCode: branch.code, branchName: branch.name, domain: col.agentId } }); onClose(); }} className="btn btn-secondary" style={{ fontSize:12 }}>
              Cases
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── TIMELINE ────────────────────────────────────────────────────────────────

function buildTimeline() {
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const hotspots = [[1,21,18,6],[1,22,22,8],[1,23,19,7],[2,21,24,9],[2,22,28,11],[2,23,21,8],[3,21,16,5],[3,22,20,7],[3,23,15,5],[0,2,12,4],[0,3,9,3],[2,1,11,3],[4,21,8,2],[5,22,14,4],[6,23,11,3]];
  const cells = [];
  for (let di=0;di<7;di++) for (let h=0;h<24;h++) {
    const hot = hotspots.find(([d,hr])=>d===di&&hr===h);
    cells.push({ di, h, day:days[di], vol:hot?hot[2]:Math.max(0,Math.round(Math.sin(h/4)*4+Math.random()*3+(di<5?4:1))), anomalies:hot?hot[3]:0, isAnomaly:!!hot });
  }
  return cells;
}
const TIMELINE = buildTimeline();

// ─── MAIN ────────────────────────────────────────────────────────────────────

export default function RiskHeatmap() {
  const [view, setView] = useState('matrix');
  const [selected, setSelected] = useState(null);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [hoveredCol, setHoveredCol] = useState(null);
  const navigate = useNavigate();

  const criticalBranches = branchRiskData.filter(b=>compositeScore(b)>=60);

  return (
    <div style={{ maxWidth:1440 }}>
      {selected && <CellDetailDrawer branch={selected.branch} col={selected.col} onClose={()=>setSelected(null)}/>}

      {/* Intro */}
      <div style={{ display:'flex', gap:16, alignItems:'flex-start', marginBottom:20 }}>
        <div style={{ flex:1, fontSize:13, color:'var(--color-text-2)', lineHeight:1.6 }}>
          Each cell = risk score (0–100) for that branch × audit domain. <strong style={{ color:'var(--color-text)' }}>Click any cell</strong> to drill into actual agent findings, peer comparison metrics, and the data upload path for that exact combination.
        </div>
        <div style={{ display:'flex', gap:6 }}>
          {[['matrix','Risk Matrix'],['timeline','Transaction Timeline']].map(([v,l])=>(
            <button key={v} onClick={()=>setView(v)} className="btn btn-sm"
              style={{ background:view===v?'var(--color-text)':'var(--color-surface)', color:view===v?'white':'var(--color-text-2)', border:'1px solid var(--color-border)' }}>{l}</button>
          ))}
        </div>
      </div>

      {/* Summary strip */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
        {[
          { label:'Branches Monitored', value:branchRiskData.length, sub:'Highest-risk of 90 branches — sorted by composite score', color:'#185FA5', tooltip:'The heatmap displays the 10 branches with the highest composite risk scores across all 9 audit domains. Remaining 80 branches are in normal monitoring. Filter controls are in development for full 90-branch view.' },
          { label:'Elevated or Critical', value:criticalBranches.length, sub:`${Math.round(criticalBranches.length/branchRiskData.length*100)}% of monitored branches`, color:'#26EA9F' },
          { label:'AML / CBSL Flags', value:branchRiskData.filter(b=>b.aml_flag||b.cbsl_flag).length, sub:'Active regulatory escalations', color:'#C41E3A' },
          { label:'Highest Composite', value:`${Math.max(...branchRiskData.map(compositeScore))}/100`, sub:'BR-14 Ratnapura — critical', color:'#C41E3A' },
        ].map((s,i)=>(
          <div key={i} style={{ background:'var(--color-surface)', border:'1px solid var(--color-border)', borderRadius:10, padding:'14px 16px', borderTop:`3px solid ${s.color}` }}>
            <div style={{ fontSize:11, color:'var(--color-text-3)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>{s.label}</div>
            <div style={{ fontSize:26, fontWeight:800, color:s.color, lineHeight:1, marginBottom:4 }}>{s.value}</div>
            <div style={{ fontSize:11, color:'var(--color-text-2)' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* MATRIX VIEW */}
      {view==='matrix' && (
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div className="agent-panel" style={{ overflow:'hidden' }}>
            <div className="agent-panel-header">
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span className="agent-panel-title">Branch × Risk Domain Matrix</span>
                <InfoTooltip text="Rows = NTB branches. Columns = audit domains. Each score is derived from agent analysis. Click any cell to open the findings drawer — actual agent data, peer metrics, and data upload for that branch × domain combination." position="bottom" width={320}/>
              </div>
              <div style={{ display:'flex', gap:12, fontSize:10, color:'var(--color-text-2)', alignItems:'center' }}>
                {[['#16A34A','Safe <40'],['#26EA9F','Watch 40–60'],['#4A6070','Elevated 60–75'],['#C41E3A','Critical 75+']].map(([col,lbl])=>(
                  <span key={lbl} style={{ display:'flex', alignItems:'center', gap:4 }}><div style={{ width:10,height:10,borderRadius:2,background:col }}/>{lbl}</span>
                ))}
                <span style={{ color:'var(--color-text-3)', marginLeft:4, fontSize:10 }}>← Click any cell</span>
              </div>
            </div>

            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', minWidth:900 }}>
                <thead>
                  <tr>
                    <th style={{ padding:'10px 16px', textAlign:'left', fontSize:11, color:'var(--color-text-3)', fontWeight:500, minWidth:140, borderBottom:'1px solid var(--color-border)' }}>Branch</th>
                    {COLUMNS.map(col=>(
                      <th key={col.key} style={{ padding:'10px 8px', textAlign:'center', fontSize:10, color:hoveredCol===col.key?'#185FA5':'var(--color-text-3)', fontWeight:hoveredCol===col.key?700:500, minWidth:96, borderBottom:'1px solid var(--color-border)', transition:'color 0.15s' }}>
                        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
                          {col.label}
                          <InfoTooltip text={col.tooltip} position="bottom" width={240}/>
                        </div>
                      </th>
                    ))}
                    <th style={{ padding:'10px 12px', textAlign:'center', fontSize:10, color:'var(--color-text-3)', fontWeight:500, minWidth:90, borderBottom:'1px solid var(--color-border)' }}>
                      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
                        Composite
                        <InfoTooltip text="Unweighted average of all 8 domain scores. Below 60 requires enhanced monitoring; above 75 triggers immediate audit response." position="bottom" width={240}/>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {branchRiskData.map(branch=>{
                    const composite = compositeScore(branch);
                    const cc = scoreColor(composite);
                    return (
                      <tr key={branch.code}
                        onMouseEnter={()=>setHoveredRow(branch.code)}
                        onMouseLeave={()=>setHoveredRow(null)}
                        style={{ background:hoveredRow===branch.code?'var(--color-surface-2)':'transparent', transition:'background 0.1s' }}>
                        <td style={{ padding:'8px 16px', borderBottom:'1px solid var(--color-border)' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                            <div>
                              <div style={{ fontSize:12, fontWeight:700 }}>{branch.name}</div>
                              <code style={{ fontSize:10, color:'var(--color-text-3)' }}>{branch.code}</code>
                            </div>
                            <div style={{ display:'flex', gap:3 }}>
                              {branch.aml_flag && <div style={{ width:7,height:7,borderRadius:'50%',background:'#E11D48' }} title="AML flag"/>}
                              {branch.cbsl_flag && <div style={{ width:7,height:7,borderRadius:'50%',background:'#C41E3A' }} title="CBSL action"/>}
                              {branch.sla_breach && <div style={{ width:7,height:7,borderRadius:'50%',background:'#4A6070' }} title="SLA breach"/>}
                            </div>
                          </div>
                        </td>
                        {COLUMNS.map(col=>{
                          const score = branch[col.key];
                          const sc = scoreColor(score);
                          const isSel = selected?.branch?.code===branch.code && selected?.col?.key===col.key;
                          return (
                            <td key={col.key} style={{ padding:4, borderBottom:'1px solid var(--color-border)', textAlign:'center' }}
                              onMouseEnter={()=>setHoveredCol(col.key)} onMouseLeave={()=>setHoveredCol(null)}>
                              <div
                                onClick={()=>setSelected({branch,col})}
                                title={`${branch.name} · ${col.label} · ${score}/100 — click to see findings`}
                                style={{ background:isSel?sc.dot:sc.bg, border:`1px solid ${isSel?sc.dot:sc.border}`, borderRadius:8, padding:'10px 6px', cursor:'pointer', transition:'all 0.15s', transform:isSel?'scale(1.06)':'scale(1)', boxShadow:isSel?`0 4px 14px ${sc.dot}44`:'none' }}
                                onMouseEnter={e=>{ if(!isSel){ e.currentTarget.style.transform='scale(1.05)'; e.currentTarget.style.boxShadow=`0 2px 8px ${sc.dot}33`; }}}
                                onMouseLeave={e=>{ if(!isSel){ e.currentTarget.style.transform='scale(1)'; e.currentTarget.style.boxShadow='none'; }}}
                              >
                                <div style={{ fontSize:18, fontWeight:800, color:isSel?'white':sc.text, lineHeight:1 }}>{score}</div>
                              </div>
                            </td>
                          );
                        })}
                        <td style={{ padding:'8px 12px', borderBottom:'1px solid var(--color-border)', textAlign:'center' }}>
                          <div style={{ display:'inline-flex', flexDirection:'column', alignItems:'center', gap:3 }}>
                            <span style={{ fontSize:15, fontWeight:800, color:cc.text }}>{composite}</span>
                            <span style={{ fontSize:9, fontWeight:700, padding:'1px 6px', background:cc.bg, color:cc.dot, borderRadius:4 }}>{scoreTier(composite)}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div style={{ padding:'10px 16px', borderTop:'1px solid var(--color-border)', background:'var(--color-surface-2)', display:'flex', gap:16, fontSize:10, color:'var(--color-text-2)', alignItems:'center', flexWrap:'wrap' }}>
              {[['#E11D48','AML escalation'],['#C41E3A','CBSL action'],['#4A6070','SLA breach']].map(([col,lbl])=>(
                <span key={lbl} style={{ display:'flex', alignItems:'center', gap:5 }}><div style={{ width:7,height:7,borderRadius:'50%',background:col }}/>{lbl}</span>
              ))}
              <span style={{ marginLeft:'auto' }}>Click any cell → findings · peer metrics · data upload</span>
            </div>
          </div>

          {/* Highest risk + averages */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            <div className="agent-panel">
              <div className="agent-panel-header">
                <span className="agent-panel-title">Highest Risk Cells</span>
                <InfoTooltip text="All branch × domain combinations scoring above 75, sorted by score descending. Click to open the findings drawer." position="bottom" width={240}/>
              </div>
              {branchRiskData.flatMap(b=>COLUMNS.map(c2=>({branch:b,col:c2,score:b[c2.key]}))).filter(x=>x.score>=75).sort((a,b)=>b.score-a.score).slice(0,8).map((x,i)=>{
                const sc = scoreColor(x.score);
                return (
                  <div key={i} onClick={()=>setSelected({branch:x.branch,col:x.col})}
                    style={{ display:'flex', gap:10, alignItems:'center', padding:'10px 16px', borderBottom:'1px solid var(--color-border)', cursor:'pointer', transition:'background 0.12s' }}
                    onMouseEnter={e=>e.currentTarget.style.background='var(--color-surface-2)'}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <div style={{ width:38,height:38,borderRadius:8,background:sc.bg,border:`1px solid ${sc.border}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:800,color:sc.text,flexShrink:0 }}>{x.score}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:12, fontWeight:600 }}>{x.branch.name}</div>
                      <div style={{ fontSize:11, color:'var(--color-text-2)' }}>{x.col.label}</div>
                    </div>
                    <ChevronRight size={13} style={{ color:'var(--color-text-3)' }}/>
                  </div>
                );
              })}
            </div>
            <div className="agent-panel">
              <div className="agent-panel-header">
                <span className="agent-panel-title">Average Score by Domain</span>
                <InfoTooltip text="Network-wide average per audit domain. Domains averaging above 50 indicate systemic risk across all branches — not just isolated issues." position="bottom" width={280}/>
              </div>
              <div style={{ padding:'8px 16px' }}>
                {COLUMNS.map(col=>{
                  const avg=Math.round(branchRiskData.reduce((s,b)=>s+b[col.key],0)/branchRiskData.length);
                  const sc=scoreColor(avg);
                  return (
                    <div key={col.key} style={{ marginBottom:12 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
                        <span style={{ fontSize:12 }}>{col.label}</span>
                        <span style={{ fontSize:12, fontWeight:700, color:sc.text }}>{avg}/100</span>
                      </div>
                      <div style={{ height:6, borderRadius:3, background:'var(--color-surface-2)', overflow:'hidden' }}>
                        <div style={{ width:`${avg}%`, height:'100%', background:sc.dot, borderRadius:3, transition:'width 0.5s ease' }}/>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TIMELINE VIEW */}
      {view==='timeline' && (
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <InsightBox type="info"
            title="Reading the Transaction Timeline"
            body="Each cell shows transaction volume for that hour × day slot. Blue = normal volume. Red = anomalies detected (structuring, SoD violations, off-hours overrides). The 21:00–23:00 Tue–Thu band is the BR-14 off-hours approval cluster detected by Internal Controls and Insider Risk agents."
          />
          <div className="agent-panel">
            <div className="agent-panel-header">
              <span className="agent-panel-title">Transaction Timing Anomaly Heatmap</span>
              <InfoTooltip text="7 days × 24 hours. Red cells = anomalous transaction time slots. Number in red = anomaly count. Hover any cell for details." position="bottom" width={300}/>
            </div>
            <div style={{ padding:'16px' }}>
              <div style={{ display:'flex', gap:0, marginBottom:4, paddingLeft:44 }}>
                {Array.from({length:24},(_,h)=><div key={h} style={{ width:34, textAlign:'center', fontSize:9, color:'var(--color-text-3)' }}>{String(h).padStart(2,'0')}</div>)}
              </div>
              {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((day,di)=>(
                <div key={day} style={{ display:'flex', alignItems:'center', gap:0, marginBottom:3 }}>
                  <span style={{ width:40, fontSize:10, color:'var(--color-text-2)', textAlign:'right', paddingRight:4, flexShrink:0 }}>{day}</span>
                  {Array.from({length:24},(_,h)=>{
                    const cell=TIMELINE.find(c=>c.di===di&&c.h===h);
                    const isA=cell?.isAnomaly; const vol=cell?.vol||0;
                    const int=Math.min(0.9,vol/28);
                    return (
                      <div key={h} title={cell?`${day} ${String(h).padStart(2,'0')}:00 — ${vol} txns${cell.anomalies>0?`, ${cell.anomalies} anomalies`:''}`:''} style={{ width:34,height:26,borderRadius:4,margin:1,background:isA?`rgba(220,38,38,${Math.max(0.4,int)})`:`rgba(37,99,235,${Math.max(0.06,int*0.5)})`,border:isA?'1px solid rgba(220,38,38,0.4)':'1px solid transparent',cursor:'default',display:'flex',alignItems:'center',justifyContent:'center' }}
                        onMouseEnter={e=>e.currentTarget.style.opacity='0.75'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
                        {isA && <span style={{ fontSize:9, color:'white', fontWeight:700 }}>{cell.anomalies}</span>}
                      </div>
                    );
                  })}
                </div>
              ))}
              <div style={{ display:'flex', gap:20, marginTop:16, fontSize:10, color:'var(--color-text-2)', justifyContent:'center', flexWrap:'wrap' }}>
                {[['rgba(37,99,235,0.15)','Low volume'],['rgba(37,99,235,0.5)','Normal volume'],['rgba(220,38,38,0.5)','Anomaly detected'],['rgba(220,38,38,0.9)','High concentration']].map(([bg,lbl])=>(
                  <span key={lbl} style={{ display:'flex', alignItems:'center', gap:6 }}><div style={{ width:18,height:14,borderRadius:3,background:bg,border:bg.includes('220')?'1px solid rgba(220,38,38,0.4)':'1px solid transparent' }}/>{lbl}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="agent-panel">
            <div className="agent-panel-header"><span className="agent-panel-title">Anomaly Time Slots</span></div>
            {TIMELINE.filter(c=>c.isAnomaly).sort((a,b)=>b.anomalies-a.anomalies).map((c,i)=>(
              <div key={i} style={{ display:'flex', gap:12, alignItems:'center', padding:'10px 16px', borderBottom:'1px solid var(--color-border)' }}>
                <div style={{ width:36,height:36,borderRadius:8,background:'var(--color-red-light)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:800,color:'var(--color-red)',flexShrink:0 }}>{c.anomalies}</div>
                <div>
                  <div style={{ fontSize:12, fontWeight:600 }}>{c.day} {String(c.h).padStart(2,'0')}:00–{String(c.h+1).padStart(2,'0')}:00</div>
                  <div style={{ fontSize:11, color:'var(--color-text-2)' }}>{c.vol} total transactions · {c.anomalies} anomal{c.anomalies===1?'y':'ies'} detected</div>
                </div>
                <div style={{ marginLeft:'auto', fontSize:10, padding:'2px 8px', background:'var(--color-red-light)', color:'var(--color-red)', borderRadius:4, fontWeight:700 }}>
                  {c.di>=5?'Weekend':c.h>=21?'After-hours':c.h<=5?'Overnight':'Business hours'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

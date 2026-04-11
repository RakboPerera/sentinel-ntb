import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// ─── DATA ─────────────────────────────────────────────────────────────────────

const AGENTS = [
  { id:'credit',      name:'Credit Intelligence',       color:'#185FA5', icon:'◈', layer:'Account / Position', finding:'34 misstaged loans · LKR 1.1Bn ECL gap' },
  { id:'transaction', name:'Transaction Surveillance',  color:'#4A6070', icon:'⟳', layer:'Transaction / Event', finding:'7 structuring clusters · 4 STR-eligible' },
  { id:'suspense',    name:'Suspense & Reconciliation', color:'#993C1D', icon:'⊟', layer:'Account / Position', finding:'SUS-017 · LKR 1.24Bn · 94 days aged' },
  { id:'kyc',         name:'Identity & KYC / AML',      color:'#0F6E56', icon:'✦', layer:'Entity / Behavioural', finding:'39,290 gaps · 34 PEP overdue EDD' },
  { id:'controls',    name:'Internal Controls',         color:'#0BBF7A', icon:'⚙', layer:'Entity / Behavioural', finding:'4 SoD violations · BR-14 score 41/100' },
  { id:'digital',     name:'Digital Fraud & Identity',  color:'#993556', icon:'⊕', layer:'Transaction / Event', finding:'4 impossible-travel · device cluster' },
  { id:'trade',       name:'Trade Finance & Treasury',  color:'#3B6D11', icon:'◎', layer:'Account / Position', finding:'HS 6203 over-invoiced 91% · LCR −37%' },
  { id:'insider',     name:'Insider Risk',              color:'#1F2937', icon:'◉', layer:'Entity / Behavioural', finding:'STF-1847 · score 94/100 · 6 dimensions' },
  { id:'mje',         name:'MJE Testing',               color:'#0BBF7A', icon:'⊞', layer:'Transaction / Event', finding:'MJE-2026-4204 · risk 97/100 · midnight' },
];

const STATS = [
  { num:'9',        label:'Domain Agents',       sub:'Three analytical layers' },
  { num:'100%',     label:'Population Coverage', sub:'No sampling, ever' },
  { num:'6m 58s',   label:'Detection Ceiling',   sub:'Signal to account freeze' },
  { num:'LKR 700Bn',label:'Assets Under Watch',  sub:'NTB full balance sheet' },
];

const CASES = [
  { id:'CASE-001', title:'BR-14 Insider-Enabled Loan Fraud', color:'#DC2626', sev:'critical', exposure:'LKR 387M', agents:6 },
  { id:'CASE-002', title:'SUS-017 CEFT Phantom Receivable',  color:'#DC2626', sev:'critical', exposure:'LKR 1.24Bn', agents:3 },
  { id:'CASE-003', title:'NTB-CORP-0887 Trade-Based Money Laundering', color:'#DC2626', sev:'critical', exposure:'LKR 421M', agents:3 },
];

const WORKFLOW = [
  { n:'01', icon:'⬆', title:'Upload your data', body:'Drag CSV files into the Data Hub. Each of the 9 agents has a documented schema — required fields and optional enrichment columns.' },
  { n:'02', icon:'⚡', title:'Agents run in parallel', body:'All 9 agents analyse 100% of your data simultaneously. No sampling. Each applies its domain model: isolation forest, Benford\'s Law, behavioural biometrics, HS code benchmarking.' },
  { n:'03', icon:'◉', title:'Orchestrator correlates', body:'When two or more agents independently flag the same entity, the Orchestrator computes a combined severity score. Multi-agent confirmation is statistically definitive.' },
  { n:'04', icon:'⊟', title:'Drill into any finding', body:'Click any alert to open the 4-tab finding drawer: signal analysis, detection steps, regulatory framework, and recommended action — all evidence-backed.' },
  { n:'05', icon:'🗂', title:'Open a case', body:'Open an investigation case from any finding. The Case Manager tracks evidence, STR filing deadlines, CBSL notifications, and remediation steps with gated resolution.' },
  { n:'06', icon:'📋', title:'Report to the board', body:'Generate board-ready audit reports, AML submissions, and fraud investigation packages. Every report carries an audit opinion, regulatory citations, and management action plan.' },
];

// ─── LIVE ALERTS PREVIEW ──────────────────────────────────────────────────────

const LIVE_ALERTS = [
  { agent:'Suspense Agent', color:'#993C1D', score:0.99, text:'SUS-017 (Pettah Main St): LKR 1.24Bn unreconciled 94 days. CBSL 90-day guideline breached.' },
  { agent:'Insider Risk',   color:'#1F2937', score:0.94, text:'STF-1847 scores 94/100 — all 6 insider fraud dimensions confirmed simultaneously.' },
  { agent:'Transaction',    color:'#4A6070', score:0.91, text:'NTB-0841-X: 15 CEFT transfers in 22 min, all below LKR 5M STR threshold.' },
];

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

function Divider() {
  return <div style={{ height:1, background:'#E8E6DF', margin:'0' }} />;
}

function Section({ children, dark=false, style={} }) {
  return (
    <section style={{ background: dark ? '#111110' : '#fff', padding:'80px 0', ...style }}>
      <div style={{ maxWidth:1160, margin:'0 auto', padding:'0 40px' }}>
        {children}
      </div>
    </section>
  );
}

function Eyebrow({ children }) {
  return (
    <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'#26EA9F', marginBottom:12 }}>
      {children}
    </div>
  );
}

function H2({ children, dark=false }) {
  return (
    <h2 style={{ fontSize:'clamp(28px,3.5vw,44px)', fontWeight:900, letterSpacing:'-0.03em', color: dark ? '#f4f2ec' : '#111110', lineHeight:1.1, margin:'0 0 16px' }}>
      {children}
    </h2>
  );
}

function Body({ children, dark=false }) {
  return (
    <p style={{ fontSize:16, color: dark ? 'rgba(232,230,224,0.55)' : '#6b6963', lineHeight:1.7, margin:'0 0 0', maxWidth:560 }}>
      {children}
    </p>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function Intro() {
  const navigate = useNavigate();
  const [hoveredAgent, setHoveredAgent] = useState(null);
  const [hoveredStep, setHoveredStep] = useState(null);
  const [alertIdx, setAlertIdx] = useState(0);

  // Cycle live alerts
  useEffect(() => {
    const t = setInterval(() => setAlertIdx(i => (i + 1) % LIVE_ALERTS.length), 3000);
    return () => clearInterval(t);
  }, []);

  function enter() { navigate('/command-centre'); }

  const alert = LIVE_ALERTS[alertIdx];

  return (
    <div style={{ background:'#fff', color:'#1a1917', fontFamily:'var(--font-display), var(--font)', overflowX:'hidden' }}>

      {/* ── FIXED NAV ── */}
      <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:100, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 40px', height:56, background:'rgba(255,255,255,0.95)', backdropFilter:'blur(8px)', borderBottom:'1px solid #E8E6DF' }}>
        <div style={{ fontSize:15, fontWeight:800, letterSpacing:'-0.02em', color:'#111110' }}>
          Sentinel <span style={{ color:'#26EA9F' }}>by Octave</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:11, color:'#9c9890', letterSpacing:'0.06em', textTransform:'uppercase' }}>Nations Trust Bank · FY 2025</span>
          <button onClick={enter}
            style={{ padding:'8px 20px', background:'#111110', color:'white', border:'none', borderRadius:8, fontSize:13, fontWeight:700, cursor:'pointer', letterSpacing:'-0.01em' }}>
            Enter platform →
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ maxWidth:1160, margin:'0 auto', padding:'140px 40px 80px', display:'grid', gridTemplateColumns:'1fr 380px', gap:64, alignItems:'center' }}>

        <div>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'4px 12px', background:'#E8FDF4', border:'1px solid rgba(38,234,159,0.3)', borderRadius:20, marginBottom:24 }}>
            <div style={{ width:6, height:6, borderRadius:'50%', background:'#26EA9F' }} />
            <span style={{ fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'#0BBF7A' }}>Octave · Agentic AI Audit Intelligence</span>
          </div>

          <h1 style={{ fontSize:'clamp(52px,6.5vw,84px)', fontWeight:900, lineHeight:0.94, letterSpacing:'-0.04em', color:'#111110', margin:'0 0 24px' }}>
            Sentinel<br/><span style={{ color:'#26EA9F' }}>by Octave</span>
          </h1>

          <p style={{ fontSize:19, color:'#4b4a47', lineHeight:1.65, margin:'0 0 12px', maxWidth:520 }}>
            Nine AI agents. Every transaction. No sampling. Real-time detection across Nations Trust Bank's entire LKR 700Bn ecosystem.
          </p>
          <p style={{ fontSize:13, color:'#9c9890', margin:'0 0 40px' }}>Confidential · Internal audit use only</p>

          <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
            {STATS.map((s,i) => (
              <div key={i} style={{ padding:'14px 20px', background:'#FAFAF8', border:'1px solid #E8E6DF', borderRadius:10 }}>
                <div style={{ fontSize:22, fontWeight:900, color:'#111110', letterSpacing:'-0.02em', lineHeight:1 }}>{s.num}</div>
                <div style={{ fontSize:11, fontWeight:600, color:'#4b4a47', marginTop:3 }}>{s.label}</div>
                <div style={{ fontSize:10, color:'#9c9890', marginTop:1 }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Live alert card */}
        <div style={{ background:'#FAFAF8', border:'1px solid #E8E6DF', borderRadius:16, overflow:'hidden', boxShadow:'0 16px 48px rgba(0,0,0,0.07)' }}>
          <div style={{ padding:'11px 16px', borderBottom:'1px solid #E8E6DF', display:'flex', alignItems:'center', gap:8, background:'white' }}>
            <div style={{ width:7, height:7, borderRadius:'50%', background:'#DC2626' }} />
            <span style={{ fontSize:10, fontWeight:700, color:'#DC2626', letterSpacing:'0.07em', textTransform:'uppercase' }}>Live — 3 Critical Alerts</span>
            <span style={{ marginLeft:'auto', fontSize:10, color:'#9c9890' }}>Command Centre</span>
          </div>
          {LIVE_ALERTS.map((a,i) => (
            <div key={i} style={{ padding:'12px 16px', borderBottom:i<2?'1px solid #E8E6DF':'none', background:'white', opacity: i===alertIdx?1:0.45, transition:'opacity 0.5s' }}>
              <div style={{ display:'flex', gap:7, alignItems:'center', marginBottom:5 }}>
                <div style={{ width:5, height:5, borderRadius:1, background:a.color, flexShrink:0 }} />
                <span style={{ fontSize:10, fontWeight:700, color:a.color, textTransform:'uppercase', letterSpacing:'0.05em' }}>{a.agent}</span>
              </div>
              <p style={{ fontSize:11, color:'#4b4a47', lineHeight:1.55, margin:'0 0 7px' }}>{a.text}</p>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <div style={{ flex:1, height:3, borderRadius:2, background:'#F4F3EF', overflow:'hidden' }}>
                  <div style={{ width:`${a.score*100}%`, height:'100%', background:'#DC2626', borderRadius:2 }} />
                </div>
                <span style={{ fontSize:10, fontWeight:800, color:'#DC2626', fontVariantNumeric:'tabular-nums' }}>{a.score.toFixed(2)}</span>
              </div>
            </div>
          ))}
          <div style={{ padding:'9px 16px', background:'#FAFAF8', textAlign:'center', fontSize:11, color:'#9c9890', borderTop:'1px solid #E8E6DF' }}>
            NTB FY 2025 · Demo data pre-loaded
          </div>
        </div>
      </section>

      <Divider />

      {/* ── THE PROBLEM ── */}
      <Section>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:64, alignItems:'center' }}>
          <div>
            <Eyebrow>Why Sentinel exists</Eyebrow>
            <H2>Traditional audit<br/>leaves a 14-month gap.</H2>
            <Body>A standard internal audit cycle takes 15 weeks — planning, sampling 3–5% of the portfolio, fieldwork, draft, response, sign-off. The average banking fraud across South Asia runs for <strong>14 months</strong> before detection through traditional audit. By the time a finding is documented, the underlying transaction is 90 days old and the funds may already be gone.</Body>
          </div>
          <div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              {[
                { label:'Traditional audit cycle', value:'15 weeks', sub:'Planning to final report', color:'#DC2626', bg:'#FEF0F0' },
                { label:'Sentinel detection', value:'6m 58s', sub:'Signal to account freeze', color:'#16A34A', bg:'#F0FDF4' },
                { label:'Traditional coverage', value:'3–5%', sub:'Portfolio sampling rate', color:'#DC2626', bg:'#FEF0F0' },
                { label:'Sentinel coverage', value:'100%', sub:'Every record, every cycle', color:'#16A34A', bg:'#F0FDF4' },
              ].map((s,i) => (
                <div key={i} style={{ padding:'20px', background:s.bg, borderRadius:12, border:`1px solid ${s.color}22` }}>
                  <div style={{ fontSize:28, fontWeight:900, color:s.color, letterSpacing:'-0.03em', lineHeight:1, marginBottom:6 }}>{s.value}</div>
                  <div style={{ fontSize:12, fontWeight:700, color:s.color, marginBottom:2 }}>{s.label}</div>
                  <div style={{ fontSize:11, color:s.color, opacity:0.7 }}>{s.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Divider />

      {/* ── 9 AGENTS ── */}
      <Section style={{ padding:'80px 0' }}>
        <div style={{ maxWidth:1160, margin:'0 auto', padding:'0 40px' }}>
          <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:40, flexWrap:'wrap', gap:16 }}>
            <div>
              <Eyebrow>The 9 domain agents</Eyebrow>
              <H2>Every domain.<br/>Every transaction. No sampling.</H2>
            </div>
            <Body>Each agent applies a distinct analytical model to its domain. The Orchestrator combines their signals when multiple agents flag the same entity.</Body>
          </div>

          {/* 3×3 grid */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:1, background:'#E8E6DF', borderRadius:16, overflow:'hidden', boxShadow:'0 4px 24px rgba(0,0,0,0.06)' }}>
            {AGENTS.map((agent) => (
              <div key={agent.id}
                onMouseEnter={() => setHoveredAgent(agent.id)}
                onMouseLeave={() => setHoveredAgent(null)}
                style={{ padding:'22px 24px', background: hoveredAgent===agent.id ? `${agent.color}06` : 'white', transition:'background 0.14s' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                  <div style={{ width:30, height:30, borderRadius:7, background:`${agent.color}14`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, color:agent.color, border:`1px solid ${agent.color}20`, flexShrink:0 }}>{agent.icon}</div>
                  <div>
                    <div style={{ fontSize:12, fontWeight:700, color:'#111110', lineHeight:1.2 }}>{agent.name}</div>
                    <div style={{ fontSize:10, color:'#9c9890', textTransform:'uppercase', letterSpacing:'0.05em', fontWeight:600 }}>{agent.layer}</div>
                  </div>
                </div>
                <div style={{ fontSize:11, color:agent.color, fontWeight:600, lineHeight:1.5, padding:'5px 9px', background:`${agent.color}0C`, borderRadius:5 }}>
                  {agent.finding}
                </div>
              </div>
            ))}
          </div>

          {/* Orchestrator bar */}
          <div style={{ background:'#111110', borderRadius:'0 0 16px 16px', padding:'16px 24px', display:'flex', alignItems:'center', gap:16, marginTop:1 }}>
            <div style={{ width:32, height:32, borderRadius:8, background:'rgba(83,74,183,0.25)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, border:'1px solid rgba(83,74,183,0.4)', flexShrink:0 }}>◎</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, fontWeight:700, color:'#f4f2ec', marginBottom:2 }}>Orchestrator — Cross-Agent Correlation Engine</div>
              <div style={{ fontSize:11, color:'rgba(232,230,224,0.4)' }}>
                When 2+ agents flag the same entity, the Orchestrator computes a combined severity score. Multi-agent confirmation eliminates false positives. Current active: CORR-001 (0.98) · CORR-002 (0.99) · CORR-003 (0.94)
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Divider />

      {/* ── HOW IT WORKS ── */}
      <Section style={{ background:'#FAFAF8' }}>
        <Eyebrow>How it works</Eyebrow>
        <H2 style={{ marginBottom:8 }}>From upload to board report<br/>in one continuous flow.</H2>
        <div style={{ height:32 }} />
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:1 }}>
          {WORKFLOW.map((step,i) => (
            <div key={i}
              onMouseEnter={() => setHoveredStep(i)}
              onMouseLeave={() => setHoveredStep(null)}
              style={{ padding:'28px', background: hoveredStep===i ? 'white' : '#FAFAF8', border:'1px solid #E8E6DF', transition:'all 0.14s', boxShadow: hoveredStep===i ? '0 4px 20px rgba(0,0,0,0.06)' : 'none', position:'relative', zIndex: hoveredStep===i ? 1 : 0 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
                <span style={{ fontSize:11, fontWeight:800, color:'#26EA9F', letterSpacing:'-0.01em', minWidth:20 }}>{step.n}</span>
                <div style={{ flex:1, height:1, background:'#E8E6DF' }} />
                <span style={{ fontSize:18 }}>{step.icon}</span>
              </div>
              <div style={{ fontSize:14, fontWeight:700, color:'#111110', marginBottom:8, lineHeight:1.3 }}>{step.title}</div>
              <p style={{ fontSize:12, color:'#6b6963', lineHeight:1.65, margin:0 }}>{step.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Divider />

      {/* ── ACTIVE INVESTIGATIONS ── */}
      <Section>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:56, alignItems:'center' }}>
          <div>
            <Eyebrow>Active investigations — FY 2025</Eyebrow>
            <H2>3 critical cases.<br/>10 open investigations.<br/>LKR 2.1Bn total exposure.</H2>
            <Body>Every agent finding links directly to an investigation case. The Case Manager tracks the full lifecycle — from detection to evidence collection, STR filing, CBSL notification, and board sign-off.</Body>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {CASES.map((cas,i) => (
              <div key={i} style={{ padding:'14px 18px', background:'white', border:'1px solid #E8E6DF', borderLeft:`4px solid ${cas.color}`, borderRadius:10 }}>
                <div style={{ display:'flex', gap:7, alignItems:'center', marginBottom:5 }}>
                  <span style={{ fontSize:9, fontWeight:800, textTransform:'uppercase', padding:'2px 6px', background:cas.color, color:'white', borderRadius:3 }}>{cas.sev}</span>
                  <code style={{ fontSize:10, color:'#9c9890' }}>{cas.id}</code>
                  <span style={{ marginLeft:'auto', fontSize:12, fontWeight:700, color:cas.color }}>{cas.exposure}</span>
                </div>
                <div style={{ fontSize:12, fontWeight:600, color:'#111110', marginBottom:3, lineHeight:1.35 }}>{cas.title}</div>
                <div style={{ fontSize:11, color:'#9c9890' }}>{cas.agents} agents involved · Investigating</div>
              </div>
            ))}
            <div style={{ padding:'12px 18px', background:'#FAFAF8', border:'1px solid #E8E6DF', borderRadius:10, fontSize:12, color:'#9c9890', textAlign:'center' }}>
              + 7 more cases open — view all in Case Manager
            </div>
          </div>
        </div>
      </Section>

      {/* ── DARK CTA ── */}
      <section style={{ background:'#111110', padding:'96px 40px' }}>
        <div style={{ maxWidth:1160, margin:'0 auto', textAlign:'center' }}>
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'#26EA9F', marginBottom:16 }}>
            Nations Trust Bank · FY 2025 · NTB Demo data pre-loaded
          </div>
          <h2 style={{ fontSize:'clamp(32px,4.5vw,56px)', fontWeight:900, letterSpacing:'-0.04em', color:'#f4f2ec', lineHeight:1.05, margin:'0 0 20px' }}>
            The platform is live.<br/>Three critical cases need your attention.
          </h2>
          <p style={{ fontSize:17, color:'rgba(232,230,224,0.5)', maxWidth:520, margin:'0 auto 48px', lineHeight:1.65 }}>
            Start in the Command Centre to review the 3 active critical alerts, or open the Risk Heatmap to drill into branch-level risk across all 9 domains.
          </p>
          <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap', marginBottom:40 }}>
            {['Command Centre', 'Risk Heatmap', 'Case Manager', 'Scenario Lab', 'Risk Register', 'Reports'].map(label => (
              <span key={label} style={{ fontSize:11, fontWeight:600, padding:'5px 12px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:20, color:'rgba(232,230,224,0.6)' }}>{label}</span>
            ))}
          </div>
          <button onClick={enter}
            style={{ padding:'18px 52px', background:'#26EA9F', color:'#111110', border:'none', borderRadius:12, fontSize:17, fontWeight:800, cursor:'pointer', letterSpacing:'-0.01em', transition:'all 0.2s', boxShadow:'0 8px 32px rgba(38,234,159,0.3)' }}
            onMouseEnter={e => { e.currentTarget.style.background='#FAC775'; e.currentTarget.style.transform='translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background='#26EA9F'; e.currentTarget.style.transform='none'; }}>
            Enter Sentinel →
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <div style={{ background:'#111110', borderTop:'1px solid rgba(255,255,255,0.06)', padding:'18px 40px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ fontSize:11, color:'rgba(232,230,224,0.2)' }}>Sentinel by Octave · Nations Trust Bank PLC · FY 2025 · Confidential</span>
        <span style={{ fontSize:11, color:'rgba(232,230,224,0.2)' }}>9 agents · 100% coverage · LKR 700Bn AUM</span>
      </div>
    </div>
  );
}

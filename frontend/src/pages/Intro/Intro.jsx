import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Act1 from './Act1.jsx';
import Act2 from './Act2.jsx';
import Act3 from './Act3.jsx';
import Act4 from './Act4.jsx';

const AGENTS = [
  { id:'credit',      name:'Credit Intelligence',        color:'#185FA5', icon:'◈', layer:'Account', finding:'34 misstaged loans · LKR 1.1Bn ECL gap', path:'/agents/credit' },
  { id:'transaction', name:'Transaction Surveillance',   color:'#534AB7', icon:'⟳', layer:'Event',   finding:'7 structuring clusters · 4 STR-eligible', path:'/agents/transaction' },
  { id:'suspense',    name:'Suspense & Reconciliation',  color:'#993C1D', icon:'⊟', layer:'Account', finding:'SUS-017 · LKR 1.24Bn · 94 days aged', path:'/agents/suspense' },
  { id:'kyc',         name:'Identity & KYC / AML',       color:'#0F6E56', icon:'✦', layer:'Entity',  finding:'39,290 gaps · 34 PEP overdue EDD', path:'/agents/kyc' },
  { id:'controls',    name:'Internal Controls',          color:'#854F0B', icon:'⚙', layer:'Entity',  finding:'4 SoD violations · BR-14 score 41/100', path:'/agents/controls' },
  { id:'digital',     name:'Digital Fraud & Identity',   color:'#993556', icon:'⊕', layer:'Event',   finding:'4 impossible-travel · 1 device cluster', path:'/agents/digital' },
  { id:'trade',       name:'Trade Finance & Treasury',   color:'#3B6D11', icon:'◎', layer:'Account', finding:'HS 6203 over-invoiced 91% · LCR −37%', path:'/agents/trade' },
  { id:'insider',     name:'Insider Risk',               color:'#7C3AED', icon:'◉', layer:'Entity',  finding:'STF-1847 · score 94/100 · 6 dimensions', path:'/agents/insider-risk' },
  { id:'mje',         name:'MJE Testing',                color:'#0891B2', icon:'⊞', layer:'Event',   finding:'MJE-2026-4204 · risk 97/100 · midnight', path:'/agents/mje' },
];

const WORKFLOW = [
  { n:'01', title:'Upload or connect data', body:"Drag CSV files into the Data Hub, or connect live feeds. Each agent has a documented schema — required fields and optional enrichment columns.", icon:'⬆', link:'/data', label:'Open Data Hub' },
  { n:'02', title:'Agents analyse in parallel', body:"All 9 agents run simultaneously across 100% of your data — no sampling. Each applies its domain model: isolation forest, Benford\'s Law, behavioural biometrics, HS code benchmarking.", icon:'⚡', link:'/agents', label:'View Agent Network' },
  { n:'03', title:'The Orchestrator correlates', body:'When 2+ agents flag the same entity, the Orchestrator computes a combined severity score. Multi-agent confirmation eliminates false positives.', icon:'◉', link:'/command-centre', label:'Command Centre' },
  { n:'04', title:'Drill into findings', body:'Click any alert to open the 4-tab finding drawer: signal analysis, detection steps, regulatory context, and immediate action workflow.', icon:'⊟', link:'/heatmap', label:'Risk Heatmap' },
  { n:'05', title:'Open a case and investigate', body:'Open an investigation case from any finding. Track evidence, STR deadlines, CBSL notifications, and remediation with gated resolution.', icon:'🗂', link:'/cases', label:'Case Manager' },
  { n:'06', title:'Report and close', body:'Generate board-ready audit reports, AML compliance submissions, and fraud investigation packages — each with audit opinion and regulatory citation.', icon:'📋', link:'/reports', label:'View Reports' },
];

const STATS = [
  { num:'9', label:'Domain Agents', sub:'Running simultaneously' },
  { num:'100%', label:'Population Coverage', sub:'No sampling — every record' },
  { num:'6m 58s', label:'Detection Ceiling', sub:'Signal to account freeze' },
  { num:'LKR 700Bn', label:'Assets Under Watch', sub:'NTB full balance sheet' },
];

function Overview({ onStartPresentation, onEnterPlatform }) {
  const navigate = useNavigate();
  const [hoveredAgent, setHoveredAgent] = useState(null);
  const [hoveredStep, setHoveredStep] = useState(null);

  return (
    <div style={{ background:'#FFFFFF', color:'#1a1917', fontFamily:'var(--font)' }}>

      {/* HERO */}
      <section style={{ maxWidth:1200, margin:'0 auto', padding:'120px 40px 80px', display:'grid', gridTemplateColumns:'1fr 400px', gap:72, alignItems:'center' }}>
        <div>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'5px 14px', background:'#FEF8EE', border:'1px solid rgba(239,159,39,0.3)', borderRadius:20, marginBottom:28 }}>
            <div style={{ width:6, height:6, borderRadius:'50%', background:'#EF9F27' }} />
            <span style={{ fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'#854F0B' }}>Octave · Agentic AI Audit Intelligence</span>
          </div>
          <h1 style={{ fontSize:'clamp(52px,6.5vw,88px)', fontWeight:900, lineHeight:0.92, letterSpacing:'-0.04em', color:'#0A0A0B', marginBottom:24 }}>
            Sentinel<br/><span style={{ color:'#EF9F27' }}>by Octave</span>
          </h1>
          <p style={{ fontSize:19, color:'#4b4a47', lineHeight:1.65, marginBottom:8, maxWidth:500 }}>
            Nine AI agents monitoring NTB's entire ecosystem — continuously, simultaneously, on 100% of data.
          </p>
          <p style={{ fontSize:13, color:'#9c9890', marginBottom:40 }}>Nations Trust Bank PLC · FY 2025 · Confidential</p>
          <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
            <button onClick={onEnterPlatform} style={{ padding:'13px 26px', background:'#0A0A0B', color:'white', border:'none', borderRadius:10, fontSize:14, fontWeight:700, cursor:'pointer', transition:'all 0.18s' }}
              onMouseEnter={e=>e.currentTarget.style.transform='translateY(-1px)'}
              onMouseLeave={e=>e.currentTarget.style.transform='none'}>
              Enter platform →
            </button>
            <button onClick={onStartPresentation} style={{ padding:'13px 26px', background:'transparent', color:'#1a1917', border:'1.5px solid #E8E6DF', borderRadius:10, fontSize:14, fontWeight:600, cursor:'pointer', transition:'all 0.18s' }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor='#EF9F27';e.currentTarget.style.color='#854F0B';}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor='#E8E6DF';e.currentTarget.style.color='#1a1917';}}>
              ◈ View presentation
            </button>
          </div>
        </div>

        {/* Live alert preview card */}
        <div style={{ background:'#FAFAF8', border:'1px solid #E8E6DF', borderRadius:16, overflow:'hidden', boxShadow:'0 20px 60px rgba(0,0,0,0.07)', position:'relative' }}>
          <div style={{ padding:'11px 16px', borderBottom:'1px solid #E8E6DF', display:'flex', alignItems:'center', gap:8, background:'white' }}>
            <div style={{ width:7, height:7, borderRadius:'50%', background:'#DC2626' }} />
            <span style={{ fontSize:10, fontWeight:700, color:'#DC2626', letterSpacing:'0.07em', textTransform:'uppercase' }}>3 Critical Alerts</span>
            <span style={{ marginLeft:'auto', fontSize:10, color:'#9c9890' }}>Command Centre · Live</span>
          </div>
          {[
            { agent:'Suspense Agent', color:'#993C1D', text:'SUS-017: LKR 1.24Bn unreconciled 94 days. CBSL breach confirmed.', score:0.99 },
            { agent:'Insider Risk',  color:'#7C3AED', text:'STF-1847 scores 94/100 — all 6 insider fraud dimensions confirmed.', score:0.94 },
            { agent:'Transaction',   color:'#534AB7', text:'NTB-0841-X: 15 CEFT transfers in 22 min, all below LKR 5M threshold.', score:0.91 },
          ].map((a,i) => (
            <div key={i} style={{ padding:'12px 16px', borderBottom:i<2?'1px solid #E8E6DF':'none', background:'white' }}>
              <div style={{ display:'flex', gap:7, alignItems:'center', marginBottom:5 }}>
                <div style={{ width:5, height:5, borderRadius:1, background:a.color }} />
                <span style={{ fontSize:10, fontWeight:700, color:a.color, textTransform:'uppercase', letterSpacing:'0.05em' }}>{a.agent}</span>
              </div>
              <p style={{ fontSize:11, color:'#4b4a47', lineHeight:1.5, margin:'0 0 7px' }}>{a.text}</p>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <div style={{ flex:1, height:3, borderRadius:2, background:'#F4F3EF', overflow:'hidden' }}>
                  <div style={{ width:`${a.score*100}%`, height:'100%', background:'#DC2626', borderRadius:2 }}/>
                </div>
                <span style={{ fontSize:10, fontWeight:800, color:'#DC2626', fontVariantNumeric:'tabular-nums' }}>{a.score.toFixed(2)}</span>
              </div>
            </div>
          ))}
          <div onClick={onEnterPlatform} style={{ padding:'9px 16px', background:'#FAFAF8', textAlign:'center', fontSize:11, color:'#9c9890', cursor:'pointer', borderTop:'1px solid #E8E6DF' }}>
            Open Command Centre →
          </div>
          <div style={{ position:'absolute', top:-12, right:-12, background:'#DC2626', color:'white', borderRadius:7, padding:'5px 10px', fontSize:11, fontWeight:800, boxShadow:'0 4px 14px rgba(220,38,38,0.35)' }}>CASE-001 OPEN</div>
        </div>
      </section>

      {/* STATS BAR */}
      <section style={{ background:'#0A0A0B', padding:'44px 40px' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:0 }}>
          {STATS.map((s,i) => (
            <div key={i} style={{ textAlign:'center', padding:'0 28px', borderRight:i<3?'1px solid rgba(255,255,255,0.08)':'none' }}>
              <div style={{ fontSize:'clamp(30px,4vw,52px)', fontWeight:900, color:'#EF9F27', lineHeight:1, letterSpacing:'-0.03em', marginBottom:6 }}>{s.num}</div>
              <div style={{ fontSize:13, fontWeight:600, color:'#f4f2ec', marginBottom:3 }}>{s.label}</div>
              <div style={{ fontSize:11, color:'rgba(232,230,224,0.4)' }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* AGENT GRID */}
      <section style={{ maxWidth:1200, margin:'0 auto', padding:'80px 40px' }}>
        <div style={{ marginBottom:44 }}>
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'#EF9F27', marginBottom:10 }}>The 9 domain agents</div>
          <h2 style={{ fontSize:'clamp(26px,3.5vw,44px)', fontWeight:800, letterSpacing:'-0.03em', color:'#0A0A0B', marginBottom:10, lineHeight:1.1 }}>Every domain. Every transaction. No sampling.</h2>
          <p style={{ fontSize:15, color:'#6b6963', maxWidth:520, lineHeight:1.6 }}>Each agent applies a distinct model to its domain. Click any agent to open its analysis page.</p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:1, background:'#E8E6DF', borderRadius:16, overflow:'hidden', boxShadow:'0 6px 32px rgba(0,0,0,0.06)' }}>
          {AGENTS.map((agent) => (
            <div key={agent.id} onClick={() => navigate(agent.path)}
              onMouseEnter={() => setHoveredAgent(agent.id)}
              onMouseLeave={() => setHoveredAgent(null)}
              style={{ padding:'22px 24px', background:hoveredAgent===agent.id?`${agent.color}08`:'white', cursor:'pointer', transition:'background 0.14s', position:'relative' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                <div style={{ width:30, height:30, borderRadius:7, background:`${agent.color}14`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, color:agent.color, border:`1px solid ${agent.color}20`, flexShrink:0 }}>{agent.icon}</div>
                <div>
                  <div style={{ fontSize:12, fontWeight:700, color:'#0A0A0B', lineHeight:1.2 }}>{agent.name}</div>
                  <div style={{ fontSize:10, color:'#9c9890', textTransform:'uppercase', letterSpacing:'0.05em', fontWeight:600 }}>{agent.layer} layer</div>
                </div>
              </div>
              <div style={{ fontSize:11, color:agent.color, fontWeight:600, lineHeight:1.5, padding:'5px 9px', background:`${agent.color}0C`, borderRadius:5, border:`1px solid ${agent.color}18` }}>{agent.finding}</div>
              {hoveredAgent===agent.id && <div style={{ position:'absolute', bottom:8, right:12, fontSize:11, fontWeight:700, color:agent.color }}>Open →</div>}
            </div>
          ))}
        </div>
        <div onClick={() => navigate('/command-centre')}
          style={{ background:'#0A0A0B', borderRadius:'0 0 16px 16px', padding:'18px 24px', display:'flex', alignItems:'center', gap:16, cursor:'pointer', marginTop:1, transition:'background 0.14s' }}
          onMouseEnter={e=>e.currentTarget.style.background='#1a1917'}
          onMouseLeave={e=>e.currentTarget.style.background='#0A0A0B'}>
          <div style={{ width:34, height:34, borderRadius:9, background:'rgba(83,74,183,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:17, border:'1px solid rgba(83,74,183,0.4)' }}>◎</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13, fontWeight:700, color:'#f4f2ec', marginBottom:2 }}>Orchestrator — Cross-Agent Correlation Engine</div>
            <div style={{ fontSize:11, color:'rgba(232,230,224,0.4)' }}>CORR-001 severity 0.98 · CORR-002 severity 0.99 · CORR-003 severity 0.94 · 3 active correlations</div>
          </div>
          <div style={{ fontSize:11, fontWeight:700, color:'#8B7CF8' }}>Command Centre →</div>
        </div>
      </section>

      {/* HOW TO USE */}
      <section style={{ background:'#FAFAF8', borderTop:'1px solid #E8E6DF', borderBottom:'1px solid #E8E6DF' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'80px 40px' }}>
          <div style={{ marginBottom:52 }}>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'#EF9F27', marginBottom:10 }}>How to use Sentinel</div>
            <h2 style={{ fontSize:'clamp(26px,3.5vw,44px)', fontWeight:800, letterSpacing:'-0.03em', color:'#0A0A0B', lineHeight:1.1 }}>From data upload to<br/>board-ready report in one flow.</h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:1 }}>
            {WORKFLOW.map((step,i) => (
              <div key={i} onClick={() => navigate(step.link)}
                onMouseEnter={() => setHoveredStep(i)}
                onMouseLeave={() => setHoveredStep(null)}
                style={{ padding:'30px', background:hoveredStep===i?'white':'#FAFAF8', border:'1px solid #E8E6DF', cursor:'pointer', transition:'all 0.14s', boxShadow:hoveredStep===i?'0 4px 20px rgba(0,0,0,0.06)':'none', position:'relative', zIndex:hoveredStep===i?1:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
                  <span style={{ fontSize:11, fontWeight:800, color:'#EF9F27', letterSpacing:'-0.01em' }}>{step.n}</span>
                  <div style={{ flex:1, height:1, background:'#E8E6DF' }}/>
                  <span style={{ fontSize:18 }}>{step.icon}</span>
                </div>
                <div style={{ fontSize:15, fontWeight:700, color:'#0A0A0B', marginBottom:9, lineHeight:1.3 }}>{step.title}</div>
                <p style={{ fontSize:12, color:'#6b6963', lineHeight:1.65, margin:'0 0 18px' }}>{step.body}</p>
                <div style={{ fontSize:12, fontWeight:700, color:hoveredStep===i?'#185FA5':'#9c9890', transition:'color 0.14s' }}>{step.label}{hoveredStep===i?' →':''}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ACTIVE CASES */}
      <section style={{ maxWidth:1200, margin:'0 auto', padding:'72px 40px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:52, alignItems:'center' }}>
          <div>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'#EF9F27', marginBottom:10 }}>Active investigations</div>
            <h2 style={{ fontSize:'clamp(24px,3vw,38px)', fontWeight:800, letterSpacing:'-0.03em', color:'#0A0A0B', marginBottom:14, lineHeight:1.15 }}>3 critical cases open.<br/>10 active investigations total.</h2>
            <p style={{ fontSize:14, color:'#6b6963', lineHeight:1.65, marginBottom:24 }}>Every finding links to a case. Track evidence, STR obligations, CBSL notifications, and remediation in one place.</p>
            <button onClick={() => navigate('/cases')} style={{ padding:'11px 20px', background:'transparent', color:'#1a1917', border:'1.5px solid #E8E6DF', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }}
              onMouseEnter={e=>e.currentTarget.style.borderColor='#0A0A0B'}
              onMouseLeave={e=>e.currentTarget.style.borderColor='#E8E6DF'}>
              Open Case Manager →
            </button>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
            {[
              { id:'CASE-001', title:'BR-14 Insider-Enabled Loan Fraud — STF-1847', exposure:'LKR 387M', color:'#DC2626' },
              { id:'CASE-002', title:'SUS-017 CEFT Phantom Receivable', exposure:'LKR 1.24Bn', color:'#DC2626' },
              { id:'CASE-003', title:'NTB-CORP-0887 Trade-Based Money Laundering', exposure:'LKR 421M', color:'#DC2626' },
            ].map((cas,i) => (
              <div key={i} onClick={() => navigate('/cases', { state:{ caseId:cas.id } })}
                style={{ padding:'13px 16px', background:'white', border:'1px solid #E8E6DF', borderLeft:`4px solid ${cas.color}`, borderRadius:9, cursor:'pointer', transition:'all 0.14s', display:'flex', alignItems:'center', gap:12 }}
                onMouseEnter={e=>e.currentTarget.style.boxShadow='0 3px 14px rgba(0,0,0,0.06)'}
                onMouseLeave={e=>e.currentTarget.style.boxShadow='none'}>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', gap:6, alignItems:'center', marginBottom:4 }}>
                    <span style={{ fontSize:9, fontWeight:800, textTransform:'uppercase', padding:'2px 5px', background:cas.color, color:'white', borderRadius:3 }}>critical</span>
                    <code style={{ fontSize:10, color:'#9c9890' }}>{cas.id}</code>
                  </div>
                  <div style={{ fontSize:12, fontWeight:600, color:'#0A0A0B', lineHeight:1.3 }}>{cas.title}</div>
                </div>
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <div style={{ fontSize:13, fontWeight:800, color:cas.color }}>{cas.exposure}</div>
                  <div style={{ fontSize:10, color:'#9c9890', marginTop:2 }}>Open →</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SPLIT */}
      <section style={{ background:'#0A0A0B', padding:'72px 40px' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
          <div onClick={onEnterPlatform} style={{ padding:'36px 40px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:18, cursor:'pointer', transition:'all 0.18s' }}
            onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,0.07)';e.currentTarget.style.borderColor='rgba(255,255,255,0.2)';}}
            onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.04)';e.currentTarget.style.borderColor='rgba(255,255,255,0.1)';}}>
            <div style={{ fontSize:26, marginBottom:14 }}>⚡</div>
            <div style={{ fontSize:18, fontWeight:700, color:'#f4f2ec', marginBottom:8 }}>Jump into the platform</div>
            <p style={{ fontSize:13, color:'rgba(232,230,224,0.5)', lineHeight:1.6, marginBottom:22 }}>NTB FY 2025 demo data is pre-loaded. Start with the Command Centre for live alerts, or the Risk Heatmap for branch drill-through.</p>
            <div style={{ display:'flex', gap:7, flexWrap:'wrap', marginBottom:22 }}>
              {['Command Centre','Risk Heatmap','Case Manager','Scenario Lab'].map(t=>(
                <span key={t} style={{ fontSize:10, fontWeight:600, padding:'3px 8px', background:'rgba(24,95,165,0.2)', color:'#85B7EB', borderRadius:4, border:'1px solid rgba(24,95,165,0.3)' }}>{t}</span>
              ))}
            </div>
            <div style={{ fontSize:13, fontWeight:700, color:'#EF9F27' }}>Enter platform →</div>
          </div>

          <div onClick={onStartPresentation} style={{ padding:'36px 40px', background:'rgba(239,159,39,0.06)', border:'1px solid rgba(239,159,39,0.2)', borderRadius:18, cursor:'pointer', transition:'all 0.18s' }}
            onMouseEnter={e=>e.currentTarget.style.background='rgba(239,159,39,0.1)'}
            onMouseLeave={e=>e.currentTarget.style.background='rgba(239,159,39,0.06)'}>
            <div style={{ fontSize:26, marginBottom:14 }}>◈</div>
            <div style={{ fontSize:18, fontWeight:700, color:'#f4f2ec', marginBottom:8 }}>Full presentation</div>
            <p style={{ fontSize:13, color:'rgba(232,230,224,0.5)', lineHeight:1.6, marginBottom:22 }}>Walk through the audit gap problem, the fraud landscape, the agent architecture, and three live fraud scenarios step by step.</p>
            <div style={{ display:'flex', gap:7, flexWrap:'wrap', marginBottom:22 }}>
              {['The audit gap','Fraud landscape','Agent map','3 scenarios'].map(t=>(
                <span key={t} style={{ fontSize:10, fontWeight:600, padding:'3px 8px', background:'rgba(239,159,39,0.15)', color:'#EF9F27', borderRadius:4, border:'1px solid rgba(239,159,39,0.3)' }}>{t}</span>
              ))}
            </div>
            <div style={{ fontSize:13, fontWeight:700, color:'#EF9F27' }}>Start presentation · 4 acts →</div>
          </div>
        </div>
      </section>

      <div style={{ background:'#0A0A0B', borderTop:'1px solid rgba(255,255,255,0.06)', padding:'18px 40px', display:'flex', justifyContent:'space-between' }}>
        <span style={{ fontSize:11, color:'rgba(232,230,224,0.2)' }}>Sentinel by Octave · Nations Trust Bank PLC · FY 2025 · Confidential</span>
        <span style={{ fontSize:11, color:'rgba(232,230,224,0.2)' }}>9 agents · 100% coverage · LKR 700Bn AUM</span>
      </div>
    </div>
  );
}

export default function Intro() {
  const [mode, setMode] = useState('landing');
  const [act, setAct] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (mode !== 'presentation') return;
    const handler = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') setAct(a => Math.min(3, a + 1));
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') setAct(a => Math.max(0, a - 1));
      if (e.key === 'Escape') setMode('landing');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [mode]);

  const enter = () => navigate('/command-centre');

  return (
    <div className="intro-root" style={{ background: mode === 'landing' ? '#fff' : '#0A0A0B' }}>
      <nav className="intro-nav" style={{ background: mode === 'landing' ? 'rgba(255,255,255,0.96)' : 'rgba(10,10,11,0.9)', borderBottom: mode === 'landing' ? '1px solid #E8E6DF' : '1px solid rgba(255,255,255,0.07)' }}>
        <div className="intro-nav-logo" style={{ cursor:'pointer', color: mode === 'landing' ? '#0A0A0B' : '#f4f2ec' }} onClick={() => { setMode('landing'); setAct(0); }}>
          Sentinel <span>by Octave</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          {mode === 'presentation' && (
            <>
              <div className="intro-step-dots">
                {[0,1,2,3].map(i => <div key={i} className={`intro-dot ${i===act?'active':i<act?'done':''}`} onClick={()=>setAct(i)} />)}
              </div>
              <button onClick={() => setMode('landing')} style={{ fontSize:12, color:'rgba(232,230,224,0.5)', cursor:'pointer', background:'none', border:'1px solid rgba(255,255,255,0.12)', borderRadius:6, padding:'5px 12px' }}>← Overview</button>
            </>
          )}
          <button onClick={enter} style={{ fontSize:12, fontWeight:700, color:'#0A0A0B', background:'#EF9F27', border:'none', borderRadius:8, padding:'8px 18px', cursor:'pointer' }}>
            Enter platform →
          </button>
        </div>
      </nav>

      {mode === 'landing' && (
        <div className="animate-fade-in">
          <Overview onStartPresentation={() => { setMode('presentation'); setAct(0); }} onEnterPlatform={enter} />
        </div>
      )}

      {mode === 'presentation' && (
        <>
          <div key={act} className="animate-fade-in">
            {act === 0 && <Act1 onNext={() => setAct(1)} />}
            {act === 1 && <Act2 onNext={() => setAct(2)} />}
            {act === 2 && <Act3 onNext={() => setAct(3)} />}
            {act === 3 && <Act4 onEnter={enter} />}
          </div>
          {act < 3 && <button className="intro-nav-btn" onClick={() => setAct(a => a + 1)}>›</button>}
        </>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SCENARIOS = [
  {
    id: 'growth', color: '#185FA5',
    title: 'The Growth Trap',
    subtitle: 'How 50% loan growth conceals credit quality deterioration',
    agents: ['Credit Intelligence','Internal Controls','MJE Testing','Orchestrator'],
    steps: 6, exposure: 'LKR 1.41 Bn', severity: 0.98, duration: '6 detection steps',
    tag: 'Credit Fraud',
    description: 'NTB grew its loan portfolio by LKR 143 billion — the fastest in a decade. Embedded inside that growth are 89 loans with anomalous staging, concentrated at branches with elevated override rates. Q3–Q4 2025 originations are defaulting at 1.7× prior year rates.',
    outcome: 'Emergency Staging Committee convened. 34 loans reclassified. BR-14 investigation triggered.',
    keyEntities: ['BR-14','STF-1847','LKR 387M'],
    agentFlow: [
      { agent:'Credit', finds:'89 anomalous loans', color:'#185FA5' },
      { agent:'Controls', finds:'87% override by 1 staff', color:'#3A5A3A' },
      { agent:'MJE', finds:'Midnight GL entries', color:'#0BBF7A' },
      { agent:'Orchestrator', finds:'Combined score 0.98', color:'#111110' },
    ],
  },
  {
    id: 'ceft', color: '#993C1D',
    title: 'CEFT Suspense Fraud',
    subtitle: 'A phantom receivable scheme through CEFT infrastructure',
    agents: ['Transaction Surveillance','Suspense & Reconciliation','Digital Fraud','Internal Controls','Orchestrator'],
    steps: 6, exposure: 'LKR 1.24 Bn', severity: 0.99, duration: '6 min 58 sec to detect',
    tag: 'AML / CTF',
    description: 'SUS-017 shows a 312% balance increase over 30 days with a clearing ratio of 0.08. While the suspense account ages past the CBSL guideline, the Transaction Agent independently detects 15 structured CEFT transfers — all below the LKR 5M STR threshold.',
    outcome: 'SUS-017 frozen. STR filed with CBSL FIU. Forensic investigation opened.',
    keyEntities: ['SUS-017','BR-72','CASE-002'],
    agentFlow: [
      { agent:'Suspense', finds:'+312% balance, 0.08 clearing', color:'#993C1D' },
      { agent:'Transaction', finds:'15 structured CEFT transfers', color:'#4A6070' },
      { agent:'Digital', finds:'Impossible travel on 3 sessions', color:'#993556' },
      { agent:'Orchestrator', finds:'Combined score 0.99 — freeze', color:'#111110' },
    ],
  },
  {
    id: 'insider', color: '#1F2937',
    title: 'Branch Insider Fraud',
    subtitle: 'Eleven weeks of signals — six agents — one correlation',
    agents: ['Internal Controls','Credit Intelligence','Identity & KYC','Insider Risk','Digital Fraud','MJE Testing','Orchestrator'],
    steps: 8, exposure: 'LKR 187 Mn', severity: 0.96, duration: '11 weeks compressed',
    tag: 'Insider Threat',
    description: 'Over 11 weeks, six agents independently flag different anomalies at Branch BR-14, Ratnapura. Each signal alone is insufficient. The Insider Risk Agent confirms the primary actor: STF-1847 at 94/100. The Orchestrator correlates all six into a definitive insider fraud case.',
    outcome: 'STF-1847 suspended. Field audit at BR-14. Regulatory notification prepared.',
    keyEntities: ['STF-1847','BR-14','INT-BR14-007'],
    agentFlow: [
      { agent:'Controls', finds:'SoD violations, 87% override', color:'#3A5A3A' },
      { agent:'Credit', finds:'14 override-approved anomalous loans', color:'#185FA5' },
      { agent:'Insider', finds:'STF-1847 scores 94/100', color:'#1F2937' },
      { agent:'Orchestrator', finds:'6-agent corroboration', color:'#111110' },
    ],
  },
];

function AgentFlowRow({ flow }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:0, marginBottom:8 }}>
      {flow.map((step, i) => (
        <React.Fragment key={i}>
          <div style={{ flex:1, padding:'8px 10px', background:`${step.color}10`, border:`1px solid ${step.color}25`, borderRadius:8 }}>
            <div style={{ fontSize:9, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.06em', color:step.color, marginBottom:2, fontFamily:'var(--font-display)' }}>{step.agent}</div>
            <div style={{ fontSize:10, color:'var(--color-text-2)', lineHeight:1.4 }}>{step.finds}</div>
          </div>
          {i < flow.length - 1 && (
            <div style={{ fontSize:14, color:'var(--color-text-3)', padding:'0 4px', flexShrink:0 }}>→</div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

export default function ScenarioLab() {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(null);

  return (
    <div style={{ maxWidth:1200 }}>
      {/* Header */}
      <div style={{ marginBottom:32 }}>
        <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--color-text-3)', marginBottom:8, fontFamily:'var(--font-display)' }}>
          Sentinel · Scenario Lab
        </div>
        <h2 style={{ fontSize:26, fontWeight:700, marginBottom:10, fontFamily:'var(--font-display)' }}>Three live fraud scenarios</h2>
        <p style={{ fontSize:14, color:'var(--color-text-2)', lineHeight:1.75, maxWidth:680 }}>
          End-to-end fraud scenarios grounded in NTB's actual portfolio data. Each scenario plays step by step — showing exactly what every agent detected, how it scored the risk, and how the Orchestrator correlated signals across domains. These are not hypotheticals. Variants of all three exist in NTB's current data.
        </p>
      </div>

      {/* Scenario cards */}
      <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
        {SCENARIOS.map((sc, i) => {
          const isHovered = hovered === sc.id;
          return (
            <div key={sc.id}
              onClick={() => navigate(`/scenarios/${sc.id}`)}
              onMouseEnter={() => setHovered(sc.id)}
              onMouseLeave={() => setHovered(null)}
              style={{ background:'var(--color-surface)', border:`1px solid ${isHovered ? sc.color+'40' : 'var(--color-border)'}`, borderLeft:`4px solid ${sc.color}`, borderRadius:12, padding:'24px', cursor:'pointer', transition:'all 0.18s', boxShadow:isHovered?`0 8px 32px ${sc.color}18`:'none' }}>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 280px', gap:24 }}>
                {/* Left: scenario info */}
                <div>
                  <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:12 }}>
                    <span style={{ fontSize:9, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.08em', padding:'3px 10px', background:sc.color, color:'white', borderRadius:5, fontFamily:'var(--font-display)' }}>{sc.tag}</span>
                    <span style={{ fontSize:11, color:'var(--color-text-3)' }}>{sc.duration}</span>
                    <div style={{ marginLeft:'auto', display:'flex', gap:8 }}>
                      {sc.keyEntities.map(e => (
                        <code key={e} style={{ fontSize:10, padding:'2px 7px', background:`${sc.color}10`, color:sc.color, borderRadius:5, fontWeight:700 }}>{e}</code>
                      ))}
                    </div>
                  </div>

                  <div style={{ fontSize:20, fontWeight:700, marginBottom:6, fontFamily:'var(--font-display)' }}>{sc.title}</div>
                  <div style={{ fontSize:13, color:'var(--color-text-3)', marginBottom:12, fontStyle:'italic' }}>{sc.subtitle}</div>
                  <div style={{ fontSize:13, color:'var(--color-text-2)', lineHeight:1.75, marginBottom:16 }}>{sc.description}</div>

                  {/* Agent flow */}
                  <div style={{ marginBottom:12 }}>
                    <div style={{ fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:'var(--color-text-3)', marginBottom:8, fontFamily:'var(--font-display)' }}>Detection chain</div>
                    <AgentFlowRow flow={sc.agentFlow} />
                  </div>

                  {/* Outcome */}
                  <div style={{ padding:'10px 14px', background:'var(--color-surface-2)', borderRadius:8, fontSize:12, color:'var(--color-text-2)', borderLeft:`2px solid ${sc.color}` }}>
                    <strong style={{ color:'var(--color-text)' }}>Outcome: </strong>{sc.outcome}
                  </div>
                </div>

                {/* Right: metrics + agents */}
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  {/* Key stats */}
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                    {[
                      { label:'Exposure', val:sc.exposure, color:sc.color },
                      { label:'Severity', val:`${(sc.severity*100).toFixed(0)}%`, color:sc.severity>=0.95?'#C41E3A':sc.color },
                      { label:'Steps', val:sc.steps, color:'var(--color-text-2)' },
                      { label:'Agents', val:sc.agents.length, color:'var(--color-text-2)' },
                    ].map((m, j) => (
                      <div key={j} style={{ padding:'12px 14px', background:`${sc.color}06`, border:`1px solid ${sc.color}18`, borderRadius:8, textAlign:'center' }}>
                        <div style={{ fontSize:18, fontWeight:900, color:m.color, fontFamily:'var(--font-display)', lineHeight:1 }}>{m.val}</div>
                        <div style={{ fontSize:9, color:'var(--color-text-3)', textTransform:'uppercase', letterSpacing:'0.06em', marginTop:4 }}>{m.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Agent chips */}
                  <div>
                    <div style={{ fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:'var(--color-text-3)', marginBottom:8, fontFamily:'var(--font-display)' }}>Agents involved</div>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                      {sc.agents.map(a => (
                        <span key={a} style={{ fontSize:10, fontWeight:600, padding:'3px 9px', borderRadius:5, background:`${sc.color}12`, color:sc.color, border:`1px solid ${sc.color}25` }}>{a}</span>
                      ))}
                    </div>
                  </div>

                  {/* CTA */}
                  <button
                    onClick={e => { e.stopPropagation(); navigate(`/scenarios/${sc.id}`); }}
                    style={{ marginTop:'auto', width:'100%', padding:'12px', background:sc.color, color:'white', border:'none', borderRadius:8, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'var(--font-display)', letterSpacing:'0.04em', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                    Run scenario → 
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Act1 from './Act1.jsx';
import Act2 from './Act2.jsx';
import Act3 from './Act3.jsx';
import Act4 from './Act4.jsx';

function Landing({ onStartPresentation, onEnterPlatform }) {
  const [hoveredCard, setHoveredCard] = useState(null);
  const highlights = [
    { num: '9', label: 'Domain Agents', desc: 'Transaction · Credit · Suspense · KYC · Controls · Digital · Trade · Insider Risk · MJE' },
    { num: 'LKR 700 Bn', label: 'Assets Under Watch', desc: "NTB's full balance sheet monitored continuously" },
    { num: '835,944', label: 'Customer Accounts', desc: 'Every account scored against 47-rule compliance engine' },
    { num: '6m 58s', label: 'Detection Ceiling', desc: 'First signal to account freeze in live demonstration' },
  ];
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '100px 40px 60px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#EF9F27', marginBottom: 20 }}>Octave · Agentic AI Audit Intelligence</div>
            <h1 style={{ fontSize: 'clamp(40px, 5vw, 72px)', fontWeight: 800, lineHeight: 1.0, letterSpacing: '-0.03em', color: '#f4f2ec', marginBottom: 24 }}>Sentinel</h1>
            <p style={{ fontSize: 18, color: 'rgba(232,230,224,0.6)', lineHeight: 1.7, marginBottom: 12, maxWidth: 480 }}>
              From periodic audit to continuous intelligence. Seven AI agents monitoring NTB's entire ecosystem — simultaneously, in real time.
            </p>
            <p style={{ fontSize: 14, color: 'rgba(232,230,224,0.35)', marginBottom: 48 }}>Nations Trust Bank PLC · FY 2025 · Confidential</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {highlights.map((h, i) => (
                <div key={i} style={{ padding: '16px 20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#EF9F27', fontVariantNumeric: 'tabular-nums', lineHeight: 1, marginBottom: 4 }}>{h.num}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#f4f2ec', marginBottom: 4 }}>{h.label}</div>
                  <div style={{ fontSize: 11, color: 'rgba(232,230,224,0.35)', lineHeight: 1.5 }}>{h.desc}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ fontSize: 13, color: 'rgba(232,230,224,0.4)', marginBottom: 4 }}>Choose how to proceed:</div>
            <div onClick={onStartPresentation} onMouseEnter={() => setHoveredCard('overview')} onMouseLeave={() => setHoveredCard(null)}
              style={{ padding: '28px 32px', borderRadius: 16, cursor: 'pointer', transition: 'all 0.2s', background: hoveredCard === 'overview' ? 'rgba(239,159,39,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${hoveredCard === 'overview' ? 'rgba(239,159,39,0.5)' : 'rgba(255,255,255,0.1)'}`, transform: hoveredCard === 'overview' ? 'translateY(-2px)' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(239,159,39,0.15)', border: '1px solid rgba(239,159,39,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>◈</div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#f4f2ec', marginBottom: 6 }}>Full Presentation</div>
                  <div style={{ fontSize: 13, color: 'rgba(232,230,224,0.55)', lineHeight: 1.6, marginBottom: 14 }}>Walk through the audit gap problem, NTB's fraud landscape, the agent ecosystem, and three live fraud scenarios.</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {['The audit gap', 'Fraud landscape', 'Agent map', '3 scenarios'].map(tag => (
                      <span key={tag} style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', background: 'rgba(239,159,39,0.15)', color: '#EF9F27', borderRadius: 4 }}>{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: 'rgba(232,230,224,0.3)' }}>4 acts · ~10 minutes</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#EF9F27' }}>Start presentation →</span>
              </div>
            </div>
            <div onClick={onEnterPlatform} onMouseEnter={() => setHoveredCard('platform')} onMouseLeave={() => setHoveredCard(null)}
              style={{ padding: '28px 32px', borderRadius: 16, cursor: 'pointer', transition: 'all 0.2s', background: hoveredCard === 'platform' ? 'rgba(24,95,165,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${hoveredCard === 'platform' ? 'rgba(24,95,165,0.5)' : 'rgba(255,255,255,0.1)'}`, transform: hoveredCard === 'platform' ? 'translateY(-2px)' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(24,95,165,0.2)', border: '1px solid rgba(24,95,165,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>⚡</div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#f4f2ec', marginBottom: 6 }}>Go Directly to Platform</div>
                  <div style={{ fontSize: 13, color: 'rgba(232,230,224,0.55)', lineHeight: 1.6, marginBottom: 14 }}>Skip the presentation and jump straight to the live dashboard — Command Centre, agents, scenarios, case manager, and reports.</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {['Command Centre', 'Risk Register', 'Risk Heatmap', 'Case Manager'].map(tag => (
                      <span key={tag} style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', background: 'rgba(24,95,165,0.2)', color: '#85B7EB', borderRadius: 4 }}>{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: 'rgba(232,230,224,0.3)' }}>NTB demo data pre-loaded</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#85B7EB' }}>Enter platform →</span>
              </div>
            </div>
          </div>
        </div>
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
    <div className="intro-root">
      <nav className="intro-nav">
        <div className="intro-nav-logo" style={{ cursor: 'pointer' }} onClick={() => { setMode('landing'); setAct(0); }}>
          Sentinel <span>by Octave</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {mode === 'presentation' && (
            <>
              <div className="intro-step-dots">
                {[0,1,2,3].map(i => <div key={i} className={`intro-dot ${i === act ? 'active' : i < act ? 'done' : ''}`} onClick={() => setAct(i)} />)}
              </div>
              <button onClick={() => setMode('landing')} style={{ fontSize: 12, color: 'rgba(232,230,224,0.5)', cursor: 'pointer', background: 'none', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, padding: '5px 12px' }}>← Overview</button>
            </>
          )}
          <button onClick={enter} style={{ fontSize: 12, fontWeight: 600, color: '#0A0A0B', background: '#EF9F27', border: 'none', borderRadius: 8, padding: '7px 16px', cursor: 'pointer' }}>
            Enter platform →
          </button>
          <div style={{ display:'flex', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:20, padding:3, gap:2 }}>
            <button
              onClick={() => navigate('/command-centre')}
              style={{ padding:'5px 13px', borderRadius:16, fontSize:12, fontWeight:500, cursor:'pointer', background:'none', color:'rgba(232,230,224,0.6)', border:'none', display:'flex', alignItems:'center', gap:5, transition:'all 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background='none'}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
              Platform
            </button>
            <button
              style={{ padding:'5px 13px', borderRadius:16, fontSize:12, fontWeight:600, cursor:'default', background:'rgba(239,159,39,0.2)', color:'#EF9F27', border:'none', display:'flex', alignItems:'center', gap:5 }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="m7 21 5-5 5 5"/></svg>
              Presentation
            </button>
          </div>
        </div>
      </nav>

      {mode === 'landing' && <div className="animate-fade-in"><Landing onStartPresentation={() => { setMode('presentation'); setAct(0); }} onEnterPlatform={enter} /></div>}
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

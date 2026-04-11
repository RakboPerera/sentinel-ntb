import React, { useState, useEffect } from 'react';

// ─── FRAUD → AGENT MAPPING ────────────────────────────────────────────────────

const connections = [
  { fraud: 'Credit staging manipulation',    agents: ['Credit Intelligence', 'Internal Controls', 'MJE Testing', 'Orchestrator'] },
  { fraud: 'CEFT & payment channel fraud',   agents: ['Transaction Surveillance', 'Suspense & Reconciliation', 'Digital Fraud & Identity'] },
  { fraud: 'Insider-enabled loan fraud',     agents: ['Insider Risk', 'Internal Controls', 'Credit Intelligence', 'Identity & KYC / AML', 'Digital Fraud & Identity'] },
  { fraud: 'Account takeover',              agents: ['Digital Fraud & Identity', 'Transaction Surveillance', 'Insider Risk'] },
  { fraud: 'KYC / AML gaps',               agents: ['Identity & KYC / AML', 'Credit Intelligence', 'Transaction Surveillance'] },
  { fraud: 'Suspense & NOSTRO fraud',       agents: ['Suspense & Reconciliation', 'Transaction Surveillance', 'MJE Testing', 'Internal Controls'] },
  { fraud: 'Trade document / TBML',         agents: ['Trade Finance & Treasury', 'Identity & KYC / AML', 'Transaction Surveillance'] },
  { fraud: 'Financial statement manipulation', agents: ['MJE Testing', 'Internal Controls', 'Credit Intelligence', 'Orchestrator'] },
];

// ─── AGENT TIERS ─────────────────────────────────────────────────────────────
// This is the key architectural insight — agents operate at different data granularity levels

const TIERS = [
  {
    level: 1,
    label: 'Transaction / Event Layer',
    desc: 'Scores every individual transaction or access event at point of processing',
    color: '#3D3C38',
    agents: [
      { id: 'transaction', name: 'Transaction Surveillance', color: '#3D3C38' },
      { id: 'digital',     name: 'Digital Fraud & Identity', color: '#993556' },
      { id: 'mje',         name: 'MJE Testing',              color: '#0BBF7A' },
    ],
  },
  {
    level: 2,
    label: 'Account / Position Layer',
    desc: 'Detects patterns across account histories, portfolios, and balance positions',
    color: '#185FA5',
    agents: [
      { id: 'credit',   name: 'Credit Intelligence',       color: '#185FA5' },
      { id: 'suspense', name: 'Suspense & Reconciliation', color: '#993C1D' },
      { id: 'trade',    name: 'Trade Finance & Treasury',  color: '#3B6D11' },
    ],
  },
  {
    level: 3,
    label: 'Entity / Behavioural Layer',
    desc: 'Builds risk profiles for people (staff, customers) and organisations across all activity',
    color: '#3A5A3A',
    agents: [
      { id: 'kyc',      name: 'Identity & KYC / AML', color: '#0F6E56' },
      { id: 'controls', name: 'Internal Controls',     color: '#3A5A3A' },
      { id: 'insider',  name: 'Insider Risk',          color: '#2D2D2B' },
    ],
  },
];

const ALL_AGENTS = [
  ...TIERS[0].agents, ...TIERS[1].agents, ...TIERS[2].agents,
  { id: 'orchestrator', name: 'Orchestrator', color: '#3D3C38' },
];

const AGENT_COLORS = Object.fromEntries(ALL_AGENTS.map(a => [a.name, a.color]));

const stats = [
  { num: '835,944', label: 'customer accounts monitored continuously' },
  { num: 'LKR 430 Bn', label: 'loan book under real-time staging surveillance' },
  { num: '3 layers', label: 'of analysis — event, account, entity — unified by Orchestrator' },
];

export default function Act3({ onNext }) {
  const [activeIdx, setActiveIdx] = useState(null);
  const [visible, setVisible] = useState(0);
  const [showTiers, setShowTiers] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setVisible(v => v < connections.length ? v + 1 : v), 200);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (visible >= connections.length) {
      const t = setTimeout(() => setShowTiers(true), 400);
      return () => clearTimeout(t);
    }
  }, [visible]);

  const activeConn = activeIdx !== null ? connections[activeIdx] : null;
  const activeAgentSet = activeConn ? new Set(activeConn.agents) : new Set();

  return (
    <div className="intro-act">
      <div className="intro-eyebrow">The agent ecosystem</div>
      <h1 className="intro-h1" style={{ fontSize: 'clamp(26px, 3.5vw, 44px)' }}>
        Nine specialized agents. <span className="amber">Three analytical layers.</span><br />
        One orchestrator connecting them.
      </h1>
      <p className="intro-body" style={{ fontSize: 15 }}>
        Each agent operates at a distinct level of data granularity — from individual transaction events up to entity-level behavioural profiles. The Orchestrator identifies fraud only visible when signals from all three layers converge on the same entity.
      </p>

      {/* Tier architecture diagram */}
      {showTiers && (
        <div className="animate-fade-in" style={{ margin: '24px 0 32px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {TIERS.map(tier => (
            <div key={tier.level} style={{ display: 'flex', gap: 16, alignItems: 'center', padding: '14px 20px', background: `${tier.color}08`, border: `1px solid ${tier.color}28`, borderRadius: 12 }}>
              <div style={{ flexShrink: 0, textAlign: 'center', width: 44 }}>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: tier.color, opacity: 0.7 }}>L{tier.level}</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: tier.color, lineHeight: 1 }}>{tier.level}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: tier.color, marginBottom: 2 }}>{tier.label}</div>
                <div style={{ fontSize: 11, color: 'rgba(232,230,224,0.5)', lineHeight: 1.5 }}>{tier.desc}</div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                {tier.agents.map(a => (
                  <span key={a.id} style={{ fontSize: 10, fontWeight: 600, padding: '3px 10px', background: `${a.color}18`, color: a.color, border: `1px solid ${a.color}33`, borderRadius: 20 }}>{a.name}</span>
                ))}
              </div>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', padding: '14px 20px', background: 'rgba(83,74,183,0.06)', border: '1px solid rgba(83,74,183,0.25)', borderRadius: 12 }}>
            <div style={{ flexShrink: 0, textAlign: 'center', width: 44 }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#3D3C38', opacity: 0.7 }}>L4</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#3D3C38', lineHeight: 1 }}>◎</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#3D3C38', marginBottom: 2 }}>Synthesis Layer — Orchestrator</div>
              <div style={{ fontSize: 11, color: 'rgba(232,230,224,0.5)', lineHeight: 1.5 }}>Correlates signals across all three layers. Detects fraud patterns only visible at the intersection of event + account + entity evidence.</div>
            </div>
            <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 10px', background: 'rgba(83,74,183,0.18)', color: '#3D3C38', border: '1px solid rgba(83,74,183,0.33)', borderRadius: 20 }}>Orchestrator</span>
          </div>
        </div>
      )}

      {/* Fraud → Agent interactive map */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 1fr', gap: 0, alignItems: 'stretch', margin: '32px 0', minHeight: 400 }}>
        {/* Left — fraud typologies */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(239,159,39,0.7)', marginBottom: 4 }}>Fraud typologies</div>
          {connections.map((conn, i) => {
            const isActive = activeIdx === i;
            const isRelated = activeIdx !== null && activeIdx !== i && connections[activeIdx]?.agents.some(a => conn.agents.includes(a));
            return i < visible ? (
              <div key={i} className="animate-fade-in"
                onMouseEnter={() => setActiveIdx(i)}
                onMouseLeave={() => setActiveIdx(null)}
                style={{ padding: '9px 14px', borderRadius: 9, cursor: 'pointer', transition: 'all 0.18s', textAlign: 'right',
                  background: isActive ? 'rgba(239,159,39,0.12)' : isRelated ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${isActive ? 'rgba(239,159,39,0.5)' : isRelated ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.07)'}`,
                  color: isActive ? '#26EA9F' : 'rgba(232,230,224,0.75)', fontSize: 12, fontWeight: isActive ? 600 : 400,
                  transform: isActive ? 'translateX(-4px)' : 'none',
                }}>
                {conn.fraud}
                {isActive && <div style={{ fontSize: 10, color: 'rgba(239,159,39,0.6)', marginTop: 2 }}>{conn.agents.length} agents activated</div>}
              </div>
            ) : null;
          })}
        </div>

        {/* Center connector */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '28px 0 0' }}>
          {activeIdx !== null ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 2, flex: 1, background: 'linear-gradient(to bottom, transparent, rgba(239,159,39,0.6))', minHeight: 50 }} />
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#26EA9F', boxShadow: '0 0 12px rgba(239,159,39,0.8)' }} />
              <div style={{ width: 2, flex: 1, background: 'linear-gradient(to top, transparent, rgba(239,159,39,0.6))', minHeight: 50 }} />
            </div>
          ) : (
            <div style={{ fontSize: 18, color: 'rgba(255,255,255,0.1)' }}>⇄</div>
          )}
        </div>

        {/* Right — agents by tier */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(133,183,235,0.7)', marginBottom: 4 }}>Domain agents</div>
          {TIERS.map((tier, ti) => (
            <div key={tier.level}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: `${tier.color}66`, padding: '8px 0 3px', borderTop: ti > 0 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                Layer {tier.level} — {tier.label.split(' / ')[0]}
              </div>
              {tier.agents.map(agent => {
                const isActive = activeAgentSet.has(agent.name);
                return (
                  <div key={agent.id} style={{ padding: '8px 14px', borderRadius: 8, marginBottom: 4, transition: 'all 0.18s',
                    background: isActive ? `${agent.color}18` : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${isActive ? `${agent.color}55` : 'rgba(255,255,255,0.07)'}`,
                    color: isActive ? '#f4f2ec' : 'rgba(232,230,224,0.5)', fontSize: 12, fontWeight: isActive ? 600 : 400,
                    transform: isActive ? 'translateX(4px)' : 'none', display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: isActive ? agent.color : 'rgba(255,255,255,0.1)', flexShrink: 0, boxShadow: isActive ? `0 0 8px ${agent.color}` : 'none' }} />
                    <span>{agent.name}</span>
                  </div>
                );
              })}
            </div>
          ))}
          {/* Orchestrator at bottom */}
          <div style={{ marginTop: 6, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: 'rgba(83,74,183,0.6)', padding: '8px 0 3px' }}>Synthesis</div>
            <div style={{ padding: '8px 14px', borderRadius: 8, background: activeAgentSet.has('Orchestrator') ? 'rgba(83,74,183,0.18)' : 'rgba(255,255,255,0.03)', border: `1px solid ${activeAgentSet.has('Orchestrator') ? 'rgba(83,74,183,0.5)' : 'rgba(255,255,255,0.07)'}`, color: activeAgentSet.has('Orchestrator') ? '#f4f2ec' : 'rgba(232,230,224,0.5)', fontSize: 12, fontWeight: activeAgentSet.has('Orchestrator') ? 600 : 400, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: activeAgentSet.has('Orchestrator') ? '#3D3C38' : 'rgba(255,255,255,0.1)', flexShrink: 0 }} />
              Orchestrator
              {activeAgentSet.has('Orchestrator') && <span style={{ marginLeft: 'auto', fontSize: 10, color: '#3D3C38' }}>correlates</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Hover hint */}
      {activeIdx === null && visible >= connections.length && (
        <div style={{ textAlign: 'center', fontSize: 12, color: 'rgba(232,230,224,0.25)', marginBottom: 20 }}>
          ← Hover any fraud typology to see which agents activate →
        </div>
      )}

      {/* Active connection explainer */}
      {activeConn && (
        <div className="animate-fade-in" style={{ margin: '0 0 24px', padding: '12px 20px', background: 'rgba(239,159,39,0.06)', border: '1px solid rgba(239,159,39,0.2)', borderRadius: 10 }}>
          <div style={{ fontSize: 12, color: 'rgba(232,230,224,0.6)', flex: 1 }}>
            <strong style={{ color: '#26EA9F' }}>{activeConn.fraud}</strong> activates <strong style={{ color: '#f4f2ec' }}>{activeConn.agents.filter(a => a !== 'Orchestrator').length} domain agents</strong> — {activeConn.agents.filter(a => a !== 'Orchestrator').join(' · ')}. Each sees a fragment. The Orchestrator sees the whole.
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'flex', gap: 48, paddingTop: 28, borderTop: '1px solid rgba(255,255,255,0.07)', justifyContent: 'center', flexWrap: 'wrap' }}>
        {stats.map((s, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 'clamp(22px, 2.5vw, 38px)', fontWeight: 800, color: '#26EA9F', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{s.num}</div>
            <div style={{ fontSize: 12, color: 'rgba(232,230,224,0.4)', marginTop: 6, maxWidth: 200, lineHeight: 1.5 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

import React from 'react';
import { useNavigate } from 'react-router-dom';

const scenarios = [
  {
    id: 'growth',
    pills: ['Credit Intelligence', 'Internal Controls', 'MJE Testing', 'Orchestrator'],
    title: 'The growth trap',
    body: 'NTB\'s loan book grew LKR 143 billion in 12 months. Inside that growth: 89 loans with anomalous SLFRS 9 feature combinations — concentrated at three branches, all approved via override. The MJE Testing agent independently confirms 5 manipulated journal entries adjusting provisioning. Combined: LKR 1.4 Bn in understated ECL exposure.',
    stat1val: 'LKR 1.4 Bn', stat1label: 'flagged exposure',
    stat2val: '23 loans', stat2label: 'override-approved anomalies',
    color: '#185FA5',
  },
  {
    id: 'ceft',
    pills: ['Transaction Surveillance', 'Suspense & Reconciliation', 'Digital Fraud & Identity', 'Internal Controls', 'Orchestrator'],
    title: 'CEFT suspense fraud',
    body: 'A coordinated scheme using a branch suspense account as a holding pool. 15 structured CEFT transfers, each carefully below the LKR 5 million STR threshold. Five agents. Five independent signals. One Orchestrator. Twenty-five minutes to full stop.',
    stat1val: '0.98 / 1.0', stat1label: 'combined severity',
    stat2val: '6 min 58 sec', stat2label: 'first signal to account freeze',
    color: '#993C1D',
  },
  {
    id: 'insider',
    pills: ['Insider Risk', 'Internal Controls', 'Credit Intelligence', 'Identity & KYC / AML', 'MJE Testing', 'Orchestrator'],
    title: 'Branch insider fraud',
    body: 'One relationship manager. Eleven weeks of unconnected signals — SoD violations, credit staging flags, KYC introducer concentration, off-hours system access, insider risk score 94/100. The Insider Risk agent flags the behavioural pattern. The Orchestrator correlates six agents into a single forensic case at severity 0.98.',
    stat1val: 'LKR 187 Mn', stat1label: 'combined exposure across 3 loans',
    stat2val: '11 weeks', stat2label: 'of signals — correlated in one event',
    color: '#854F0B',
  },
];

export default function Act4({ onEnter }) {
  const navigate = useNavigate();

  function goToScenario(id) {
    navigate(`/scenarios/${id}`);
  }

  return (
    <div className="intro-act">
      <div className="act4-headline">
        <div className="intro-eyebrow">What we will demonstrate today</div>
        <h1 className="intro-h1" style={{ fontSize: 'clamp(28px, 3.5vw, 52px)', marginBottom: 0 }}>
          Three scenarios. Three fraud typologies.<br /><span className="amber">One ecosystem.</span>
        </h1>
        <p className="act4-sub">Each scenario plays out step by step — showing exactly what every agent sees, how it scores, and what action it takes.</p>
      </div>

      <div className="act4-grid">
        {scenarios.map((sc, i) => (
          <div key={sc.id} onClick={() => goToScenario(sc.id)} className="act4-card animate-fade-in" style={{ animationDelay: `${i * 0.12}s`, borderTop: `3px solid ${sc.color}`, cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow=`0 8px 32px ${sc.color}33`; }}
            onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none'; }}>
            <div className="act4-card-pills">
              {sc.pills.map(p => (
                <span key={p} className="act4-pill" style={{ background: `${sc.color}18`, color: sc.color, borderColor: `${sc.color}33` }}>{p}</span>
              ))}
            </div>
            <div className="act4-card-title">{sc.title}</div>
            <div className="act4-card-body">{sc.body}</div>
            <div className="act4-card-stats">
              <div className="act4-stat">
                <div className="act4-stat-val" style={{ color: sc.color }}>{sc.stat1val}</div>
                <div className="act4-stat-label">{sc.stat1label}</div>
              </div>
              <div className="act4-stat">
                <div className="act4-stat-val" style={{ color: sc.color }}>{sc.stat2val}</div>
                <div className="act4-stat-label">{sc.stat2label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center' }}>
        <button className="act4-enter-btn" onClick={onEnter}>
          Enter the platform →
        </button>
        <div style={{ marginTop: 16, fontSize: 12, color: 'rgba(232,230,224,0.3)' }}>
          Powered by Octave · NTB FY 2025 · 90 Branches · 9 Domain Agents · LKR 700.3 Bn AUM
        </div>
      </div>
    </div>
  );
}

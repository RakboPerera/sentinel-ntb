import React from 'react';
import { useNavigate } from 'react-router-dom';
import InfoTooltip from '../../components/shared/InfoTooltip.jsx';

const scenarios = [
  {
    id: 'growth',
    title: 'The Growth Trap',
    subtitle: 'How 50% loan growth hides credit quality deterioration',
    agents: ['Credit Intelligence', 'Internal Controls', 'MJE Testing', 'Orchestrator'],
    steps: 6,
    exposure: 'LKR 1.41 Bn',
    severity: 0.98,
    duration: '6 steps',
    color: '#185FA5',
    description: 'NTB grew its loan portfolio by LKR 143 billion — the fastest growth in a decade. Embedded inside that growth are 89 loans with anomalous staging, concentrated at three branches with elevated override rates. The Credit Intelligence Agent runs a vintage cohort analysis and identifies that Q3–Q4 2025 originations are defaulting at 1.7x prior year rates.',
    outcome: 'Emergency Staging Committee convened. 34 loans reclassified. BR-14 investigation triggered.',
  },
  {
    id: 'ceft',
    title: 'CEFT Suspense Fraud',
    subtitle: 'A phantom receivable scheme routed through CEFT infrastructure',
    agents: ['Transaction Surveillance', 'Suspense & Reconciliation', 'Digital Fraud', 'Internal Controls', 'Orchestrator'],
    steps: 6,
    exposure: 'LKR 1.24 Bn',
    severity: 0.99,
    duration: '6 min 58 sec',
    color: '#993C1D',
    description: 'Account SUS-017 (Pettah Main Street CEFT Receivables) shows a 312% balance increase over 30 days with a clearing ratio of 0.08. While the suspense account ages past the CBSL guideline, the Transaction Agent independently detects 15 structured CEFT transfers from related accounts, all below the LKR 5M STR threshold.',
    outcome: 'SUS-017 frozen. STR filed with CBSL FIU. Forensic investigation opened. Combined severity 0.99.',
  },
  {
    id: 'insider',
    title: 'Branch Insider Fraud',
    subtitle: 'Eleven weeks of signals — six agents — one correlation',
    agents: ['Internal Controls', 'Credit Intelligence', 'Identity & KYC', 'Insider Risk', 'Digital Fraud', 'MJE Testing', 'Orchestrator'],
    steps: 8,
    exposure: 'LKR 187 Mn',
    severity: 0.96,
    duration: '11 weeks compressed',
    color: '#854F0B',
    description: 'Over 11 weeks, six agents independently flag different anomalies at Branch BR-14, Ratnapura — Controls, Credit, KYC, Insider Risk, Digital Fraud, and the Orchestrator. Each signal alone is insufficient. The Insider Risk Agent confirms the primary actor: STF-1847 at 94/100. The Orchestrator correlates all six into a definitive insider-enabled loan fraud case.',
    outcome: 'STF-1847 suspended. Field audit deployed to BR-14. Case NTB-2025-FR-0847 opened. Regulatory notification prepared.',
  },
];

export default function ScenarioLab() {
  const navigate = useNavigate();

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ marginBottom: 8 }}>Scenario Lab</h2>
        <p style={{ fontSize: 13, color: 'var(--color-text-2)', lineHeight: 1.7, maxWidth: 720 }}>
          Three end-to-end fraud scenarios grounded in NTB's actual portfolio data. Each scenario plays out step by step — showing what every agent detects, how it scores the risk, and how the Orchestrator correlates signals across domains into a unified case. These are not hypotheticals. Variants of all three scenarios exist in NTB's current data.
        </p>
      </div>

      <div className="scenario-cards-grid">
        {scenarios.map((sc, i) => (
          <div key={sc.id} className="scenario-card animate-fade-in" style={{ animationDelay: `${i * 0.1}s`, borderTop: `3px solid ${sc.color}` }} onClick={() => navigate(`/scenarios/${sc.id}`)}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
              {sc.agents.map(a => (
                <span key={a} style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4, background: `${sc.color}14`, color: sc.color, border: `1px solid ${sc.color}28`, letterSpacing: '0.04em' }}>{a}</span>
              ))}
            </div>

            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>{sc.title}</div>
            <div style={{ fontSize: 13, color: 'var(--color-text-2)', marginBottom: 14 }}>{sc.subtitle}</div>
            <div style={{ fontSize: 13, color: 'var(--color-text-2)', lineHeight: 1.7, marginBottom: 20 }}>{sc.description}</div>

            <div style={{ display: 'flex', gap: 24, marginBottom: 20, paddingTop: 16, borderTop: '1px solid var(--color-border)' }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: sc.color }}>{sc.exposure}</div>
                <div style={{ fontSize: 11, color: 'var(--color-text-3)' }}>exposure under investigation</div>
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: sc.severity >= 0.95 ? 'var(--color-red)' : 'var(--color-amber)' }}>{(sc.severity * 100).toFixed(0)}%</div>
                <div style={{ fontSize: 11, color: 'var(--color-text-3)' }}>combined severity</div>
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{sc.steps}</div>
                <div style={{ fontSize: 11, color: 'var(--color-text-3)' }}>detection steps</div>
              </div>
            </div>

            <div style={{ padding: '10px 14px', background: 'var(--color-surface-2)', borderRadius: 8, fontSize: 12, color: 'var(--color-text-2)', lineHeight: 1.5, marginBottom: 16 }}>
              <strong>Outcome:</strong> {sc.outcome}
            </div>

            <button
              style={{ width: '100%', padding: '10px', background: sc.color, color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}
              onMouseEnter={e => e.target.style.opacity = '0.85'}
              onMouseLeave={e => e.target.style.opacity = '1'}
              onClick={(e) => { e.stopPropagation(); navigate(`/scenarios/${sc.id}`); }}
            >
              Run this scenario →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

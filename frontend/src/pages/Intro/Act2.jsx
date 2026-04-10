import React, { useState, useEffect } from 'react';

const fraudCards = [
  { type: 'external', name: 'Account Takeover & Digital Identity Fraud', desc: 'Stolen credentials, behavioral impersonation, SIM swap. 96% of NTB transactions are digital — one compromised session is immediate exposure.', difficulty: 4, ntbContext: 'Nations Direct and mobile banking process millions of sessions monthly.' },
  { type: 'external', name: 'Trade Finance Document Fraud', desc: 'Over/under-invoicing to extract or inject foreign currency. Duplicate LC applications. Targeting NTB\'s growing corporate and export-sector financing.', difficulty: 4, ntbContext: 'Corporate Banking portfolio expanding into ESG and export sectors.' },
  { type: 'external', name: 'KYC & AML Compliance Gaps', desc: 'Shell company accounts, PEP exposure, beneficial ownership concealment. At NTB\'s scale, manual review covers under 5% of accounts annually.', difficulty: 3, ntbContext: '835,944 customers. 4.7% KYC gap rate = 39,290 unreviewed accounts.' },
  { type: 'external', name: 'Treasury & Market Risk Breaches', desc: 'Rogue FX positions, limit violations masked within intraday volatility. Rogue activity that only surfaces at end-of-day or month-end mark-to-market.', difficulty: 4, ntbContext: 'NTB NSFR declined from 154.7% to 138.3% — headroom contracting.' },
  { type: 'internal', name: 'Credit Staging Manipulation', desc: 'Loans misclassified to lower IFRS 9 stages to avoid provisioning. With 50% loan growth, even 0.5% misstaging = LKR 2.15 Bn understated ECL.', difficulty: 5, ntbContext: '0.91% Stage 3 — industry\'s lowest. Must be verifiable, not assumed.' },
  { type: 'internal', name: 'CEFT & Payment Channel Fraud', desc: 'Structured transactions below LKR 5M threshold. Suspense accounts as holding pools. Fraud disguises itself as routine clearing activity.', difficulty: 5, ntbContext: 'CEFT is a core payment rail across all 90 branches. SUS-017: LKR 1.24 Bn unreconciled.' },
  { type: 'internal', name: 'Insider-Enabled Loan Fraud', desc: 'Branch staff manufacturing fictitious borrowers, inflating genuine loans, approving against non-existent collateral — with institutional authorisation.', difficulty: 5, ntbContext: 'BR-14 override rate 14.3%. 3 branches with compounding growth + override signals.' },
  { type: 'internal', name: 'Suspense & NOSTRO Reconciliation Fraud', desc: 'Phantom receivables aged in unmonitored accounts. Balances that should clear within hours aged for months — providing an extraction pool.', difficulty: 4, ntbContext: 'LKR 8.42 Bn total unreconciled. 3 accounts >90 days = regulatory breach risk.' },
];

export default function Act2({ onNext }) {
  const [visible, setVisible] = useState(0);
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    const t = setInterval(() => {
      setVisible(v => v < fraudCards.length ? v + 1 : v);
    }, 180);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="intro-act">
      <div className="act2-header">
        <div className="intro-eyebrow">The fraud landscape NTB faces</div>
        <h1 className="intro-h1" style={{ fontSize: 'clamp(28px, 3.5vw, 48px)', marginBottom: 8 }}>
          Eight fraud typologies. <span className="amber">Three are active</span> in NTB's portfolio today.
        </h1>
        <p style={{ fontSize: 15, color: 'rgba(232,230,224,0.5)', marginBottom: 0 }}>
          Each card links directly to the agent module that addresses it.
        </p>
      </div>

      <div className="act2-legend">
        <div className="act2-legend-item">
          <div className="act2-legend-line" style={{ background: 'rgba(24,95,165,0.6)' }} />
          External threats
        </div>
        <div className="act2-legend-item">
          <div className="act2-legend-line" style={{ background: 'rgba(239,159,39,0.6)' }} />
          Internal threats
        </div>
        <div className="act2-legend-item" style={{ color: 'rgba(232,230,224,0.3)' }}>
          ● difficulty to detect manually
        </div>
      </div>

      <div className="act2-grid">
        {fraudCards.map((card, i) => (
          i < visible && (
            <div
              key={i}
              className={`act2-card ${card.type} animate-fade-in`}
              style={{ animationDelay: `${i * 0.05}s` }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <div className={`act2-card-type ${card.type}`}>
                {card.type === 'external' ? '⟳ External threat' : '⚠ Internal threat'}
              </div>
              <div className="act2-card-name">{card.name}</div>
              <div className="act2-card-desc">
                {hovered === i ? card.ntbContext : card.desc}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div className="act2-card-difficulty">
                  {[1,2,3,4,5].map(d => (
                    <div key={d} className={`act2-card-dot ${d <= card.difficulty ? 'filled' : 'empty'}`} />
                  ))}
                </div>
                <span style={{ fontSize: 10, color: 'rgba(232,230,224,0.3)' }}>
                  {hovered === i ? 'NTB context ↑' : 'hover for NTB context'}
                </span>
              </div>
            </div>
          )
        ))}
      </div>

      {visible >= fraudCards.length && (
        <div style={{ textAlign: 'center', padding: '24px 0', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <p style={{ fontSize: 14, color: 'rgba(232,230,224,0.4)', maxWidth: 600, margin: '0 auto' }}>
            Single-domain tools miss cross-domain fraud. An agent ecosystem sees all eight domains simultaneously — the Orchestrator detects correlations no individual audit team could find.
          </p>
        </div>
      )}
    </div>
  );
}

import React, { useEffect, useState } from 'react';

const traditionalRows = [
  { week: 'Week 1–3', text: 'Audit planning & scope definition' },
  { week: 'Week 4–6', text: 'Fieldwork commences — document requests' },
  { week: 'Week 7–9', text: 'Sample selection & testing (3–5% of portfolio)' },
  { week: 'Week 10', text: 'Findings documented — draft exceptions list' },
  { week: 'Week 11', text: 'Draft report issued to management' },
  { week: 'Week 13', text: 'Management response received' },
  { week: 'Week 15', text: 'Final report signed off' },
];

const sentinelRows = [
  { time: '23:47:02', text: 'Anomalous session detected — behavioral score 28/100' },
  { time: '23:47:14', text: 'Device fingerprint: unregistered. Off-hours flag.' },
  { time: '23:48:31', text: 'CEFT transfer initiated from suspense account SUS-017' },
  { time: '23:49:04', text: 'Structuring pattern — 15 transactions queued' },
  { time: '23:51:17', text: '3 signals correlated — combined severity 0.98' },
  { time: '23:52:00', text: 'Account frozen. Compliance Officer paged.' },
  { time: '23:53:41', text: 'Forensic evidence package auto-generated' },
  { time: '23:54:00', text: 'Case NTB-2025-FR-0847 opened.' },
];

export default function Act1({ onNext }) {
  const [visibleTrad, setVisibleTrad] = useState(0);
  const [visibleSent, setVisibleSent] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setVisibleTrad(v => v < traditionalRows.length ? v + 1 : v);
    }, 400);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const delay = setTimeout(() => {
      const t = setInterval(() => {
        setVisibleSent(v => v < sentinelRows.length ? v + 1 : v);
      }, 350);
      return () => clearInterval(t);
    }, 1200);
    return () => clearTimeout(delay);
  }, []);

  return (
    <div className="intro-act">
      <div className="intro-eyebrow">The problem with periodic audit</div>
      <h1 className="intro-h1">
        Traditional audit is a <span className="dim">snapshot</span>.<br />
        Fraud doesn't <span className="amber">pause</span> for quarterly cycles.
      </h1>
      <p className="intro-body">
        A typical internal audit cycle at a licensed commercial bank takes 15 weeks from planning to final report. By the time a finding is documented, the underlying transaction is 90 days old. Sentinel operates continuously — every transaction, every session, every account, in real time.
      </p>

      <div className="act1-split">
        <div className="act1-col">
          <div className="act1-col-header dim">Traditional internal audit cycle</div>
          <div className="act1-timeline">
            {traditionalRows.slice(0, visibleTrad).map((row, i) => (
              <div key={i} className="act1-row" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="act1-row-week">{row.week}</div>
                <div className="act1-row-text">{row.text}</div>
              </div>
            ))}
          </div>
          {visibleTrad >= traditionalRows.length && (
            <div style={{ marginTop: 16, padding: '10px 14px', background: 'rgba(163,45,45,0.12)', border: '1px solid rgba(163,45,45,0.2)', borderRadius: 8, fontSize: 12, color: '#F09595', lineHeight: 1.6 }}>
              By this point, a fraud that started in Week 1 has been running for <strong>105 days</strong>. The funds may already be gone.
            </div>
          )}
        </div>

        <div className="act1-col" style={{ borderColor: 'rgba(239,159,39,0.2)', background: 'rgba(239,159,39,0.04)' }}>
          <div className="act1-col-header amber">Sentinel — continuous detection</div>
          <div className="act1-timeline">
            {sentinelRows.slice(0, visibleSent).map((row, i) => (
              <div key={i} className="act1-row live" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="act1-row-time">{row.time}</div>
                <div className="act1-row-live-text">{row.text}</div>
              </div>
            ))}
          </div>
          {visibleSent >= sentinelRows.length && (
            <div style={{ marginTop: 16, padding: '10px 14px', background: 'rgba(59,109,17,0.15)', border: '1px solid rgba(59,109,17,0.3)', borderRadius: 8, fontSize: 12, color: '#97C459', lineHeight: 1.6 }}>
              Fraud stopped. <strong style={{ color: '#26EA9F' }}>6 minutes 58 seconds</strong> from first signal to account freeze.
            </div>
          )}
        </div>
      </div>

      <div className="act1-stat">
        <div className="act1-stat-big">
          The average banking fraud across South Asia runs for <span className="amber">14 months</span> before detection through traditional audit. Sentinel detects the same pattern in <span className="amber">under 7 minutes</span>.
        </div>
        <div className="act1-stat-source">ACFE Global Fraud Report 2024 · Regional banking case analysis · NTB risk data FY 2025</div>
      </div>
    </div>
  );
}

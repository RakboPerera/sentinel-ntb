import React from 'react';
import InfoTooltip from './InfoTooltip.jsx';

const ZONES = [
  { label: 'Normal', from: 0, to: 0.5, color: '#3B6D11' },
  { label: 'Watch', from: 0.5, to: 0.65, color: '#26EA9F' },
  { label: 'Flag', from: 0.65, to: 0.85, color: '#3A5A3A' },
  { label: 'Critical', from: 0.85, to: 1.0, color: '#A32D2D' },
];

export default function AnomalyScoreMeter({ score, color, size = 'md', showZones = true }) {
  const zone = ZONES.find(z => score >= z.from && score <= z.to) || ZONES[ZONES.length - 1];
  const pct = Math.round(score * 100);
  const isSm = size === 'sm';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isSm ? 4 : 6 }}>
      {!isSm && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Anomaly Score
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: zone.color, fontVariantNumeric: 'tabular-nums' }}>{score.toFixed(2)}</span>
            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: zone.color + '18', color: zone.color }}>{zone.label}</span>
            <InfoTooltip text="Anomaly score from 0.0 to 1.0 computed by Isolation Forest. Scores above 0.65 are flagged for review; above 0.85 are critical. The score reflects how statistically unusual this loan's feature combination is relative to its stage-peers in the portfolio." width={280} position="left" />
          </div>
        </div>
      )}
      {/* Track */}
      <div style={{ position: 'relative', height: isSm ? 6 : 10, borderRadius: 99, background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
        {/* Zone coloring */}
        {ZONES.map(z => (
          <div key={z.label} style={{ position: 'absolute', left: `${z.from * 100}%`, width: `${(z.to - z.from) * 100}%`, top: 0, bottom: 0, background: z.color, opacity: 0.15 }} />
        ))}
        {/* Fill */}
        <div style={{ position: 'absolute', left: 0, width: `${pct}%`, top: 0, bottom: 0, borderRadius: 99, background: zone.color, opacity: 0.9 }} />
        {/* Threshold markers */}
        {!isSm && [0.5, 0.65, 0.85].map(t => (
          <div key={t} style={{ position: 'absolute', left: `${t * 100}%`, top: 0, bottom: 0, width: 1.5, background: 'white', opacity: 0.8 }} />
        ))}
        {/* Current position needle */}
        <div style={{ position: 'absolute', left: `calc(${pct}% - 1px)`, top: -2, bottom: -2, width: 3, borderRadius: 2, background: zone.color, boxShadow: `0 0 6px ${zone.color}` }} />
      </div>
      {showZones && !isSm && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'var(--color-text-3)' }}>
          <span>0.0 Normal</span>
          <span>0.50</span>
          <span>0.65 Flag</span>
          <span>0.85 Critical</span>
          <span>1.0</span>
        </div>
      )}
      {isSm && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: zone.color }}>{score.toFixed(2)}</span>
          <span style={{ fontSize: 10, color: 'var(--color-text-3)' }}>{zone.label}</span>
        </div>
      )}
    </div>
  );
}

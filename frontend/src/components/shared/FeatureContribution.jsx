import React from 'react';
import InfoTooltip from './InfoTooltip.jsx';

/**
 * FeatureContribution — SHAP-like horizontal bars showing which features
 * drove an anomaly score. Used in loan finding detail expansions.
 */
export default function FeatureContribution({ features, color = '#185FA5', total = 1.0 }) {
  const maxContrib = Math.max(...features.map(f => f.contribution));
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-text-3)' }}>
          Score drivers
        </span>
        <InfoTooltip text="Each bar shows how much this feature contributed to the anomaly score. Larger bars = stronger signal. The feature value is shown in the label." width={240} position="right" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {features.map((f, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '180px 1fr 44px', gap: 8, alignItems: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--color-text-2)', textAlign: 'right', lineHeight: 1.3 }}>{f.name}</div>
            <div style={{ height: 8, borderRadius: 99, background: 'var(--color-surface-2)', overflow: 'hidden', position: 'relative' }}>
              <div style={{ height: '100%', width: `${(f.contribution / maxContrib) * 100}%`, borderRadius: 99, background: f.contribution > maxContrib * 0.7 ? color : color + '88', transition: 'width 0.4s ease' }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color, fontVariantNumeric: 'tabular-nums' }}>
              {(f.contribution * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * DetectionSteps — numbered step-by-step detection methodology
 */
export function DetectionSteps({ steps, color = '#185FA5' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {steps.map((step, i) => (
        <div key={i} style={{ display: 'flex', gap: 14, padding: '10px 0', borderBottom: i < steps.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
          <div style={{ width: 24, height: 24, borderRadius: '50%', background: `${color}15`, border: `1px solid ${color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color, flexShrink: 0 }}>
            {i + 1}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', marginBottom: 3 }}>{step.title}</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-2)', lineHeight: 1.6 }}>{step.text}</div>
            {step.result && (
              <div style={{ marginTop: 6, padding: '5px 10px', background: `${color}0C`, borderRadius: 6, fontSize: 11, fontWeight: 500, color }}>
                Result: {step.result}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

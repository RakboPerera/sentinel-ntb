import React, { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, Info } from 'lucide-react';
import InfoTooltip from './InfoTooltip.jsx';

const SEV_STYLES = {
  critical: { bg: 'var(--color-red-light)', border: 'rgba(163,45,45,0.25)', color: 'var(--color-red)', label: 'Critical', dot: '#C41E3A' },
  high:     { bg: '#FFF8F0', border: 'rgba(133,79,11,0.2)', color: '#3A5A3A', label: 'High', dot: '#26EA9F' },
  medium:   { bg: 'var(--color-blue-light)', border: 'rgba(24,95,165,0.2)', color: 'var(--color-blue)', label: 'Medium', dot: '#185FA5' },
  low:      { bg: 'var(--color-gray-light)', border: 'rgba(95,94,90,0.15)', color: 'var(--color-gray)', label: 'Low', dot: '#6b6963' },
};

function SeverityBar({ score, color }) {
  const pct = Math.min(100, Math.max(0, score * 100));
  const c = score >= 0.85 ? '#C41E3A' : score >= 0.65 ? '#26EA9F' : '#3B6D11';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--color-border)' }}>
        <div style={{ width: `${pct}%`, height: '100%', borderRadius: 3, background: color || c, transition: 'width 0.6s ease' }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color: color || c, fontVariantNumeric: 'tabular-nums', minWidth: 32 }}>{score.toFixed(2)}</span>
    </div>
  );
}

export function MetricSpotlight({ items, color }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(items.length, 4)}, 1fr)`, gap: 8 }}>
      {items.map((item, i) => (
        <div key={i} style={{ padding: '10px 14px', background: `${color}08`, border: `1px solid ${color}22`, borderRadius: 8, textAlign: 'center' }}>
          {item.tooltip && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 2 }}>
              <InfoTooltip text={item.tooltip} position="top" width={220} />
            </div>
          )}
          <div style={{ fontSize: 18, fontWeight: 800, color: item.alert ? 'var(--color-red)' : color, lineHeight: 1, marginBottom: 4, fontVariantNumeric: 'tabular-nums' }}>{item.value}</div>
          <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-text-2)', textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1.3 }}>{item.label}</div>
          {item.note && <div style={{ fontSize: 10, color: 'var(--color-text-3)', marginTop: 3 }}>{item.note}</div>}
        </div>
      ))}
    </div>
  );
}

export function ChartAnnotation({ x, y, text, color = '#C41E3A', position = 'top' }) {
  const posStyle = position === 'top'
    ? { bottom: '100%', left: x, marginBottom: 4 }
    : { top: '100%', left: x, marginTop: 4 };
  return (
    <div style={{ position: 'absolute', ...posStyle, transform: 'translateX(-50%)', pointerEvents: 'none' }}>
      <div style={{ background: color, color: 'white', fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 4, whiteSpace: 'nowrap' }}>{text}</div>
      <div style={{ width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: `5px solid ${color}`, margin: '0 auto' }} />
    </div>
  );
}

export function InfoBox({ title, children, variant = 'info', tooltip }) {
  const variants = {
    info:    { bg: 'var(--color-blue-light)', border: 'rgba(24,95,165,0.2)', icon: '#185FA5' },
    warning: { bg: '#E8FDF4', border: 'rgba(133,79,11,0.2)', icon: '#3A5A3A' },
    danger:  { bg: 'var(--color-red-light)', border: 'rgba(163,45,45,0.2)', icon: '#C41E3A' },
    success: { bg: 'var(--color-green-light)', border: 'rgba(59,109,17,0.2)', icon: '#3B6D11' },
    subtle:  { bg: 'var(--color-surface-2)', border: 'var(--color-border)', icon: 'var(--color-text-3)' },
  };
  const v = variants[variant] || variants.info;
  return (
    <div style={{ padding: '12px 16px', background: v.bg, border: `1px solid ${v.border}`, borderRadius: 10 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
        <Info size={14} style={{ color: v.icon, flexShrink: 0, marginTop: 1 }} />
        <div style={{ flex: 1 }}>
          {title && (
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: v.icon, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{title}</span>
              {tooltip && <InfoTooltip text={tooltip} position="right" width={260} />}
            </div>
          )}
          <div style={{ fontSize: 12, color: 'var(--color-text)', lineHeight: 1.6 }}>{children}</div>
        </div>
      </div>
    </div>
  );
}

export default function VisualFinding({ finding, agentColor, showScore = false, score }) {
  const [expanded, setExpanded] = useState(false);
  const sev = SEV_STYLES[finding.severity] || SEV_STYLES.medium;

  return (
    <div style={{ background: sev.bg, border: `1px solid ${sev.border}`, borderRadius: 12, overflow: 'hidden', marginBottom: 10 }}>
      {/* Top strip */}
      <div style={{ padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer' }} onClick={() => setExpanded(!expanded)}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: sev.dot, flexShrink: 0, marginTop: 4 }} />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', background: sev.dot, color: 'white', borderRadius: 10, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{sev.label}</span>
            {(finding.affected_exposure_lkr > 0) && (
              <span style={{ fontSize: 11, fontWeight: 700, color: sev.color }}>
                LKR {finding.affected_exposure_lkr >= 1e9
                  ? `${(finding.affected_exposure_lkr/1e9).toFixed(2)} Bn`
                  : `${(finding.affected_exposure_lkr/1e6).toFixed(0)} Mn`} exposure
              </span>
            )}
            {(finding.affected_balance_lkr > 0) && (
              <span style={{ fontSize: 11, fontWeight: 700, color: sev.color }}>
                LKR {(finding.affected_balance_lkr/1e9).toFixed(2)} Bn
              </span>
            )}
            {score !== undefined && (
              <span style={{ fontSize: 11, color: 'var(--color-text-2)', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
                Anomaly score <InfoTooltip text="Score from 0–1.00. Above 0.65 = flagged. Above 0.85 = critical. Computed by Isolation Forest across all feature combinations." position="top" width={250} />
              </span>
            )}
          </div>
          {score !== undefined && <div style={{ marginBottom: 8 }}><SeverityBar score={score} color={agentColor} /></div>}
          <div style={{ fontSize: 13, color: 'var(--color-text)', lineHeight: 1.6 }}>{finding.finding}</div>
        </div>
        <div style={{ flexShrink: 0, color: 'var(--color-text-3)', marginTop: 2 }}>
          {expanded ? <ChevronUp size={15}/> : <ChevronDown size={15}/>}
        </div>
      </div>

      {/* Expanded: recommended action */}
      {expanded && (
        <div style={{ padding: '12px 16px', borderTop: `1px solid ${sev.border}`, background: 'rgba(255,255,255,0.5)', display: 'flex', gap: 10 }}>
          <ChevronUp size={14} style={{ color: sev.color, flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: sev.color, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>Recommended Action</div>
            <div style={{ fontSize: 12, color: 'var(--color-text)', lineHeight: 1.7 }}>{finding.recommended_action}</div>
          </div>
        </div>
      )}
    </div>
  );
}

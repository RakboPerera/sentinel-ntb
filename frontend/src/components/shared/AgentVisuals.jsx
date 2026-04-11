import React, { useState } from 'react';
import { AlertTriangle, TrendingUp, TrendingDown, Minus, Info, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import InfoTooltip from './InfoTooltip.jsx';

// ─── STAT CARD ─────────────────────────────────────────────────────────────────
// Large metric card with label, value, sub-text, trend indicator and info tooltip
export function StatCard({ label, value, sub, color, tooltip, trend, trendLabel, emphasis, onClick }) {
  const trendColor = trend === 'up-bad' || trend === 'down-bad' ? 'var(--color-red)'
    : trend === 'up-good' || trend === 'down-good' ? 'var(--color-green)'
    : 'var(--color-text-3)';
  const TrendIcon = trend?.startsWith('up') ? TrendingUp : trend?.startsWith('down') ? TrendingDown : Minus;

  return (
    <div onClick={onClick} style={{
      background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12,
      padding: '18px 20px', borderTop: `3px solid ${color || 'var(--color-border)'}`,
      cursor: onClick ? 'pointer' : 'default', transition: 'all 0.15s',
      ...(emphasis ? { background: `${color}06`, borderColor: `${color}44` } : {}),
    }}
      onMouseEnter={e => onClick && (e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)')}
      onMouseLeave={e => onClick && (e.currentTarget.style.boxShadow = 'none')}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
        <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-text-3)' }}>{label}</span>
        {tooltip && <InfoTooltip text={tooltip} width={260} position="top" />}
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color: color || 'var(--color-text)', lineHeight: 1, fontVariantNumeric: 'tabular-nums', marginBottom: 6 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--color-text-2)', lineHeight: 1.5 }}>{sub}</div>}
      {trendLabel && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8, fontSize: 11, color: trendColor, fontWeight: 500 }}>
          <TrendIcon size={12} />{trendLabel}
        </div>
      )}
    </div>
  );
}

// ─── SCORE BAR ──────────────────────────────────────────────────────────────────
// Gradient horizontal bar for anomaly / risk scores (0.0 – 1.0)
export function ScoreBar({ score, width = 72, height = 8, showLabel = true, tooltip }) {
  const pct = Math.min(Math.max(score, 0), 1) * 100;
  const color = score >= 0.85 ? '#A32D2D' : score >= 0.65 ? '#26EA9F' : '#3B6D11';
  const label = score >= 0.85 ? 'Critical' : score >= 0.65 ? 'Elevated' : 'Normal';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {tooltip
        ? <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}><InfoTooltip text={tooltip} width={220} position="top" /></div>
        : null}
      <div style={{ width, height, borderRadius: height / 2, background: 'var(--color-surface-2)', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${pct}%`, borderRadius: height / 2, background: `linear-gradient(90deg, #3B6D11 0%, #26EA9F 60%, #A32D2D 100%)`, clipPath: `inset(0 ${100 - pct}% 0 0)`, transition: 'width 0.6s ease' }} />
      </div>
      {showLabel && (
        <span style={{ fontSize: 11, fontWeight: 700, color, minWidth: 32, fontVariantNumeric: 'tabular-nums' }}>{score.toFixed(2)}</span>
      )}
    </div>
  );
}

// ─── RISK GAUGE ────────────────────────────────────────────────────────────────
// Semi-circular gauge for a 0-100 score
export function RiskGauge({ score, maxScore = 100, label, color, size = 100 }) {
  const pct = Math.min(Math.max(score, 0), maxScore) / maxScore;
  const r = (size / 2) - 10;
  const circ = Math.PI * r;
  const dash = pct * circ;
  const gap = circ - dash;
  const gaugeColor = pct >= 0.75 ? '#A32D2D' : pct >= 0.5 ? '#26EA9F' : '#3B6D11';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <svg width={size} height={size / 2 + 10} viewBox={`0 0 ${size} ${size / 2 + 10}`} style={{ overflow: 'visible' }}>
        {/* Track */}
        <path d={`M 10 ${size / 2} A ${r} ${r} 0 0 1 ${size - 10} ${size / 2}`} fill="none" stroke="var(--color-surface-2)" strokeWidth="8" strokeLinecap="round" />
        {/* Value */}
        <path d={`M 10 ${size / 2} A ${r} ${r} 0 0 1 ${size - 10} ${size / 2}`} fill="none" stroke={color || gaugeColor} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={`${dash} ${gap}`} style={{ transition: 'stroke-dasharray 0.8s ease' }} />
        <text x={size / 2} y={size / 2 + 2} textAnchor="middle" fontSize="16" fontWeight="800" fill={color || gaugeColor}>{score}</text>
      </svg>
      {label && <div style={{ fontSize: 11, color: 'var(--color-text-2)', textAlign: 'center' }}>{label}</div>}
    </div>
  );
}

// ─── FINDING CARD ──────────────────────────────────────────────────────────────
// Rich finding card with visual severity, exposure, explanation and recommendation
export function FindingCard({ finding, agentColor, index }) {
  const [expanded, setExpanded] = useState(false);
  const sev = finding.severity;
  const sevColor = sev === 'critical' ? '#A32D2D' : sev === 'high' ? '#3A5A3A' : '#185FA5';
  const sevBg = sev === 'critical' ? '#FCEBEB' : sev === 'high' ? '#E8FDF4' : '#E6F1FB';
  const exposure = finding.affected_exposure_lkr || finding.affected_balance_lkr || finding.estimated_exposure_lkr || 0;

  return (
    <div style={{ borderRadius: 12, border: `1px solid ${sevColor}22`, overflow: 'hidden', marginBottom: 10, background: 'var(--color-surface)' }}>
      {/* Header */}
      <div style={{ display: 'flex', gap: 0, cursor: 'pointer' }} onClick={() => setExpanded(!expanded)}>
        {/* Severity strip */}
        <div style={{ width: 4, background: sevColor, flexShrink: 0 }} />
        <div style={{ flex: 1, padding: '14px 16px' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 10, fontWeight: 800, padding: '3px 9px', borderRadius: 20, background: sevBg, color: sevColor, letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                {sev === 'critical' ? '🔴' : sev === 'high' ? '🟡' : '🔵'} {sev}
              </span>
              {index !== undefined && <span style={{ fontSize: 11, color: 'var(--color-text-3)' }}>Finding #{index + 1}</span>}
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexShrink: 0 }}>
              {exposure > 0 && (
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: sevColor, fontVariantNumeric: 'tabular-nums' }}>LKR {(exposure / 1e9).toFixed(2)} Bn</div>
                  <div style={{ fontSize: 10, color: 'var(--color-text-3)' }}>exposure affected</div>
                </div>
              )}
              {expanded ? <ChevronUp size={15} style={{ color: 'var(--color-text-3)' }} /> : <ChevronDown size={15} style={{ color: 'var(--color-text-3)' }} />}
            </div>
          </div>
          <div style={{ fontSize: 13, color: 'var(--color-text)', lineHeight: 1.65 }}>{finding.finding}</div>
        </div>
      </div>

      {/* Expanded recommendation */}
      {expanded && (
        <div style={{ borderTop: `1px solid ${sevColor}22`, padding: '14px 16px 14px 20px', background: `${sevColor}05` }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: sevColor, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            Recommended Action
            <InfoTooltip text="This is Sentinel's recommended remediation step based on the severity and nature of the finding. Actions should be reviewed by the responsible function before execution." width={280} position="right" />
          </div>
          <div style={{ fontSize: 13, color: 'var(--color-text-2)', lineHeight: 1.65, padding: '10px 14px', background: 'rgba(255,255,255,0.7)', borderRadius: 8, borderLeft: `3px solid ${sevColor}` }}>
            → {finding.recommended_action}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── STAGE BADGE ───────────────────────────────────────────────────────────────
export function StageBadge({ stage, predicted }) {
  const colors = { 1: ['#185FA5', '#E6F1FB'], 2: ['#3A5A3A', '#E8FDF4'], 3: ['#A32D2D', '#FCEBEB'] };
  const [c, bg] = colors[stage] || ['#6b6963', '#f1efea'];
  const isMisstaged = predicted && predicted !== stage;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <span style={{ padding: '3px 9px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: bg, color: c, border: `1px solid ${c}22` }}>S{stage}</span>
      {isMisstaged && (
        <>
          <span style={{ fontSize: 10, color: '#A32D2D' }}>→</span>
          <span style={{ padding: '3px 9px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: '#FCEBEB', color: '#A32D2D', border: '1px solid rgba(163,45,45,0.2)' }}>S{predicted}</span>
        </>
      )}
    </div>
  );
}

// ─── CUSTOM RECHARTS TOOLTIP ────────────────────────────────────────────────────
export function ChartTooltip({ active, payload, label, formatter, labelPrefix = '' }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#1a1917', color: '#e8e6e0', borderRadius: 8, padding: '10px 14px', fontSize: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>
      <div style={{ fontWeight: 600, marginBottom: 6, color: '#f4f2ec' }}>{labelPrefix}{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: i < payload.length - 1 ? 4 : 0 }}>
          <div style={{ width: 8, height: 8, borderRadius: 2, background: p.color || p.fill }} />
          <span style={{ color: 'rgba(232,230,224,0.7)' }}>{p.name || p.dataKey}:</span>
          <span style={{ fontWeight: 600 }}>{formatter ? formatter(p.value, p.name) : p.value}</span>
        </div>
      ))}
    </div>
  );
}

// ─── REFERENCE LINE ANNOTATION ──────────────────────────────────────────────────
export function ReferenceAnnotation({ label, color = '#A32D2D' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color }}>
      <div style={{ width: 24, height: 1.5, background: color, borderTop: `1.5px dashed ${color}` }} />
      {label}
    </div>
  );
}

// ─── PANEL WRAPPER ─────────────────────────────────────────────────────────────
export function Panel({ title, tooltip, subtitle, children, action, headerBg, noPad }) {
  return (
    <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 14, overflow: 'hidden' }}>
      <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--color-border)', background: headerBg || 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-2)' }}>{title}</span>
          {tooltip && <InfoTooltip text={tooltip} width={280} position="right" />}
          {subtitle && <span style={{ fontSize: 11, color: 'var(--color-text-3)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>— {subtitle}</span>}
        </div>
        {action && <div style={{ flexShrink: 0 }}>{action}</div>}
      </div>
      <div style={noPad ? {} : { padding: '18px 20px' }}>{children}</div>
    </div>
  );
}

// ─── METRIC ROW ────────────────────────────────────────────────────────────────
export function MetricRow({ label, value, subValue, color, bar, barMax = 100, tooltip, highlight }) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 13, color: highlight ? 'var(--color-text)' : 'var(--color-text-2)', fontWeight: highlight ? 600 : 400 }}>{label}</span>
        {tooltip && <InfoTooltip text={tooltip} width={220} position="right" />}
      </div>
      {bar !== undefined && (
        <div style={{ width: 80, height: 5, borderRadius: 3, background: 'var(--color-surface-2)', flexShrink: 0 }}>
          <div style={{ height: '100%', width: `${Math.min(bar / barMax * 100, 100)}%`, borderRadius: 3, background: color || 'var(--color-blue)', transition: 'width 0.5s ease' }} />
        </div>
      )}
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: color || 'var(--color-text)', fontVariantNumeric: 'tabular-nums' }}>{value}</div>
        {subValue && <div style={{ fontSize: 11, color: 'var(--color-text-3)' }}>{subValue}</div>}
      </div>
    </div>
  );
}

// ─── URGENCY BADGE ─────────────────────────────────────────────────────────────
export function UrgencyBadge({ urgency }) {
  const map = {
    immediate: { bg: '#FCEBEB', color: '#A32D2D', label: '⚡ Immediate' },
    within_24h: { bg: '#E8FDF4', color: '#3A5A3A', label: '🕐 Within 24h' },
    within_72h: { bg: '#E6F1FB', color: '#185FA5', label: '📅 Within 72h' },
    within_week: { bg: '#EAF3DE', color: '#3B6D11', label: '📆 Within week' },
  };
  const s = map[urgency] || map.within_week;
  return <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 10, background: s.bg, color: s.color }}>{s.label}</span>;
}

// ─── RISK TIER BADGE ────────────────────────────────────────────────────────────
export function RiskTierBadge({ tier }) {
  const map = {
    critical: '#A32D2D', red: '#CF4343', amber: '#26EA9F',
    high: '#3A5A3A', medium: '#185FA5', green: '#3B6D11', watch: '#3D3C38',
  };
  const color = map[tier?.toLowerCase()] || '#6b6963';
  return (
    <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 10, background: `${color}18`, color, border: `1px solid ${color}33`, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {tier}
    </span>
  );
}

// ─── SECTION DIVIDER ────────────────────────────────────────────────────────────
export function SectionLabel({ children, tooltip }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '20px 0 12px' }}>
      <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-3)' }}>{children}</span>
      {tooltip && <InfoTooltip text={tooltip} width={260} position="right" />}
      <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
    </div>
  );
}

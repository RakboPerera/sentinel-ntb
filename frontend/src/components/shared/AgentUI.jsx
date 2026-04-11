
// ─── SENTINEL DESIGN SYSTEM ──────────────────────────────────────────────────
// Clean, authoritative, data-forward. Every number tells a story.

import React, { useState } from 'react';
import InfoTooltip from './InfoTooltip.jsx';

// ── KPI CARD ─────────────────────────────────────────────────────────────────
export function KPICard({ value, label, sub, delta, deltaLabel, color = '#111110', icon }) {
  const isNeg = typeof delta === 'number' && delta < 0;
  const isPos = typeof delta === 'number' && delta > 0;
  return (
    <div style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 12,
      padding: '18px 20px',
      borderTop: `3px solid ${color}`,
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-text-3)', marginBottom: 10, fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: 6 }}>
        {icon && <span>{icon}</span>}{label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 900, color, lineHeight: 1, fontFamily: 'var(--font-display)', marginBottom: sub || delta !== undefined ? 8 : 0 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 11, color: 'var(--color-text-3)', lineHeight: 1.4 }}>{sub}</div>}
      {delta !== undefined && (
        <div style={{ marginTop: 6, fontSize: 11, fontWeight: 600, color: isPos ? '#C41E3A' : isNeg ? '#0BBF7A' : 'var(--color-text-3)', display: 'flex', alignItems: 'center', gap: 3 }}>
          {isPos ? '▲' : isNeg ? '▼' : '→'} {Math.abs(delta)}{deltaLabel || ''}
        </div>
      )}
    </div>
  );
}

// ── SEVERITY PILL ─────────────────────────────────────────────────────────────
export function SeverityPill({ level }) {
  const map = {
    critical: { bg: '#C41E3A', text: 'white', label: 'CRITICAL' },
    high:     { bg: '#4A6070', text: 'white', label: 'HIGH' },
    medium:   { bg: '#0BBF7A', text: 'white', label: 'MEDIUM' },
    low:      { bg: '#9A9893', text: 'white', label: 'LOW' },
  };
  const s = map[level] || map.medium;
  return (
    <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.08em', padding: '3px 9px', borderRadius: 5, background: s.bg, color: s.text, fontFamily: 'var(--font-display)', flexShrink: 0 }}>
      {s.label}
    </span>
  );
}

// ── PROGRESS BAR ──────────────────────────────────────────────────────────────
export function ProgressBar({ value, max, color, height = 6, label, sublabel, valueLabel }) {
  const pct = Math.min(100, Math.max(0, (value / (max || 1)) * 100));
  const display = valueLabel || (typeof value === 'number' ? value.toLocaleString() : value);
  return (
    <div style={{ marginBottom: 10 }}>
      {(label || display) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
          {label && <span style={{ fontSize: 12, color: 'var(--color-text)', fontWeight: 500 }}>{label}</span>}
          {display && <span style={{ fontSize: 13, fontWeight: 800, color, fontFamily: 'var(--font-display)' }}>{display}</span>}
        </div>
      )}
      <div style={{ height, background: 'var(--color-surface-2)', borderRadius: height, overflow: 'hidden', border: '1px solid var(--color-border)' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: height, transition: 'width 0.5s ease' }} />
      </div>
      {sublabel && <div style={{ fontSize: 10, color: 'var(--color-text-3)', marginTop: 4 }}>{sublabel}</div>}
    </div>
  );
}

// ── DATA ROW ─────────────────────────────────────────────────────────────────
export function DataRow({ label, value, valueColor, sub, badge, badgeColor, onClick, even }) {
  return (
    <div onClick={onClick} style={{
      display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, padding: '10px 16px',
      background: even ? 'var(--color-surface-2)' : 'var(--color-surface)',
      borderBottom: '1px solid var(--color-border)',
      cursor: onClick ? 'pointer' : 'default',
      alignItems: 'center',
      transition: 'background 0.1s',
    }}
    onMouseEnter={onClick ? e => e.currentTarget.style.background = 'var(--color-surface-2)' : undefined}
    onMouseLeave={onClick ? e => e.currentTarget.style.background = even ? 'var(--color-surface-2)' : 'var(--color-surface)' : undefined}>
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text)' }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: 'var(--color-text-3)', marginTop: 1 }}>{sub}</div>}
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {badge && <span style={{ fontSize: 9, fontWeight: 800, padding: '2px 7px', borderRadius: 4, background: badgeColor || 'var(--color-surface-2)', color: badgeColor ? 'white' : 'var(--color-text-3)', letterSpacing: '0.05em' }}>{badge}</span>}
        {value && <span style={{ fontSize: 13, fontWeight: 800, color: valueColor || 'var(--color-text)', fontFamily: 'var(--font-display)', whiteSpace: 'nowrap' }}>{value}</span>}
      </div>
    </div>
  );
}

// ── SECTION HEADER ────────────────────────────────────────────────────────────
export function SectionHeader({ title, sub, action, actionLabel, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid var(--color-border)', background: color ? `${color}05` : 'transparent' }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: color || 'var(--color-text-2)', fontFamily: 'var(--font-display)' }}>{title}</div>
        {sub && <div style={{ fontSize: 11, color: 'var(--color-text-3)', marginTop: 2 }}>{sub}</div>}
      </div>
      {action && <button onClick={action} style={{ fontSize: 11, fontWeight: 600, color: color || 'var(--color-text-2)', background: 'none', border: `1px solid ${color || 'var(--color-border-strong)'}`, borderRadius: 6, padding: '4px 10px', cursor: 'pointer' }}>{actionLabel}</button>}
    </div>
  );
}

// ── FINDING ROW ───────────────────────────────────────────────────────────────
export function FindingRow({ id, label, value, severity, detail, onClick }) {
  const colors = { critical:'#C41E3A', high:'#4A6070', medium:'#0BBF7A', low:'#9A9893' };
  const bgs = { critical:'#FCEEF1', high:'#F3F3F1', medium:'#E8FDF4', low:'#F3F3F1' };
  const c = colors[severity] || colors.medium;
  const bg = bgs[severity] || bgs.medium;
  return (
    <div onClick={onClick} style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)', borderLeft: `3px solid ${c}`, cursor: onClick ? 'pointer' : 'default', background: onClick ? undefined : bg }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: detail ? 6 : 0 }}>
        <SeverityPill level={severity} />
        {id && <code style={{ fontSize: 10, color: 'var(--color-text-3)', background: 'var(--color-surface-2)', padding: '1px 6px', borderRadius: 4 }}>{id}</code>}
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text)', flex: 1 }}>{label}</span>
        {value && <span style={{ fontSize: 13, fontWeight: 800, color: c, fontFamily: 'var(--font-display)', flexShrink: 0 }}>{value}</span>}
      </div>
      {detail && <div style={{ fontSize: 11, color: 'var(--color-text-2)', lineHeight: 1.55, paddingLeft: 2 }}>{detail}</div>}
    </div>
  );
}

// ── OPINION BANNER ────────────────────────────────────────────────────────────
export function OpinionBanner({ verdict, opinion, color, methodology }) {
  const verdictMap = {
    'ADVERSE': { label: 'ADVERSE', bg: `${color}08`, border: `${color}22` },
    'QUALIFIED': { label: 'QUALIFIED', bg: `${color}06`, border: `${color}1A` },
    'EFFECTIVE': { label: 'EFFECTIVE', bg: '#E8FDF4', border: 'rgba(11,191,122,0.25)' },
  };
  const v = verdictMap[verdict] || verdictMap['QUALIFIED'];
  return (
    <div style={{ background: v.bg, border: `1px solid ${v.border}`, borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ padding: '14px 18px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.08em', padding: '4px 10px', borderRadius: 6, background: color, color: 'white', flexShrink: 0, marginTop: 1, fontFamily: 'var(--font-display)' }}>
          {v.label}
        </div>
        <p style={{ fontSize: 13, color, lineHeight: 1.7, margin: 0, fontWeight: 500 }}>{opinion}</p>
      </div>
      {methodology && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: `1px solid ${v.border}` }}>
          {Object.entries(methodology).map(([k, val], i) => (
            <div key={k} style={{ padding: '8px 18px', borderRight: i % 2 === 0 ? `1px solid ${v.border}` : 'none', borderBottom: i < 2 ? `1px solid ${v.border}` : 'none' }}>
              <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color, opacity: 0.6, marginBottom: 2, fontFamily: 'var(--font-display)' }}>{k}</div>
              <div style={{ fontSize: 11, color, lineHeight: 1.5 }}>{val}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── TAB BAR ───────────────────────────────────────────────────────────────────
export function TabBar({ tabs, active, onChange, color }) {
  return (
    <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
      {tabs.map(tab => (
        <button key={tab.id} onClick={() => onChange(tab.id)}
          style={{ padding: '11px 18px', fontSize: 12, fontWeight: active === tab.id ? 700 : 400, background: 'none', border: 'none', borderBottom: `2px solid ${active === tab.id ? (color || 'var(--color-text)') : 'transparent'}`, color: active === tab.id ? (color || 'var(--color-text)') : 'var(--color-text-3)', cursor: 'pointer', transition: 'all 0.12s', fontFamily: 'var(--font-display)', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: 6 }}>
          {tab.label}
          {tab.count != null && <span style={{ fontSize: 10, fontWeight: 800, padding: '1px 6px', borderRadius: 10, background: active === tab.id ? `${color || '#111110'}15` : 'var(--color-surface-2)', color: active === tab.id ? (color || 'var(--color-text)') : 'var(--color-text-3)' }}>{tab.count}</span>}
        </button>
      ))}
    </div>
  );
}

// ── AGENT HEADER ─────────────────────────────────────────────────────────────
export function AgentHeader({ name, icon, color, tagline, stats }) {
  return (
    <div style={{ background: 'var(--color-panel)', borderRadius: 14, padding: '24px 28px', marginBottom: 0, color: 'white', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, right: 0, width: 200, height: '100%', background: `linear-gradient(90deg, transparent, ${color}15)` }} />
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: stats ? 20 : 0 }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: `${color}25`, border: `1px solid ${color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color, flexShrink: 0 }}>
          {icon}
        </div>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'white', fontFamily: 'var(--font-display)', lineHeight: 1.1, marginBottom: 4 }}>{name}</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>{tagline}</div>
        </div>
      </div>
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${stats.length}, 1fr)`, gap: 1, background: 'rgba(255,255,255,0.07)', borderRadius: 10, overflow: 'hidden', marginTop: 20 }}>
          {stats.map((s, i) => (
            <div key={i} style={{ padding: '14px 16px', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.03)', borderRight: i < stats.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none' }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: s.alert ? '#C41E3A' : s.positive ? '#0BBF7A' : color || 'white', fontFamily: 'var(--font-display)', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 5, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-display)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── CHART PANEL ───────────────────────────────────────────────────────────────
export function ChartPanel({ title, subtitle, children, tooltip, noPad }) {
  return (
    <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text)', fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</div>
          {subtitle && <div style={{ fontSize: 11, color: 'var(--color-text-3)', marginTop: 2 }}>{subtitle}</div>}
        </div>
        {tooltip && <InfoTooltip text={tooltip} position="left" />}
      </div>
      <div style={noPad ? {} : { padding: '16px' }}>{children}</div>
    </div>
  );
}

// ── EMPTY STATE ───────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, sub }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--color-text-3)' }}>
      <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.3 }}>{icon}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-2)', marginBottom: 6 }}>{title}</div>
      {sub && <div style={{ fontSize: 12, lineHeight: 1.6 }}>{sub}</div>}
    </div>
  );
}

// VisualFindingCard is imported directly from VisualComponents in agent pages

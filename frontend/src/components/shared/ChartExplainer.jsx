import React, { useState } from 'react';
import { Info, ChevronDown, ChevronUp } from 'lucide-react';

export default function ChartExplainer({ title, what, howToRead, lookFor, color = 'var(--color-blue)', children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      {/* Explainer toggle */}
      <div
        onClick={() => setOpen(!open)}
        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', marginBottom: 8, background: `${color}0A`, border: `1px solid ${color}22`, borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s' }}
      >
        <Info size={13} style={{ color, flexShrink: 0 }} />
        <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color }}>{title}</span>
        <span style={{ fontSize: 11, color: `${color}88` }}>
          {open ? 'Hide explanation' : 'What does this show?'}
        </span>
        {open ? <ChevronUp size={13} style={{ color }} /> : <ChevronDown size={13} style={{ color }} />}
      </div>

      {/* Explanation panel */}
      {open && (
        <div style={{ marginBottom: 12, padding: '12px 16px', background: `${color}08`, border: `1px solid ${color}20`, borderRadius: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {what && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color, marginBottom: 4 }}>What this shows</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-2)', lineHeight: 1.7 }}>{what}</div>
            </div>
          )}
          {howToRead && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color, marginBottom: 4 }}>How to read it</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-2)', lineHeight: 1.7 }}>{howToRead}</div>
            </div>
          )}
          {lookFor && (
            <div style={{ padding: '8px 12px', background: 'rgba(239,159,39,0.1)', borderRadius: 6, borderLeft: '3px solid #EF9F27' }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#3A5A3A', marginBottom: 3 }}>⚠ What to look for</div>
              <div style={{ fontSize: 12, color: '#3A5A3A', lineHeight: 1.6 }}>{lookFor}</div>
            </div>
          )}
        </div>
      )}

      {/* The actual chart */}
      {children}
    </div>
  );
}

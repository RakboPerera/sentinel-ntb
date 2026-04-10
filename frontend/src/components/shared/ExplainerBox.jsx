import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

/**
 * ExplainerBox — an inline educational callout that explains what a chart/metric means.
 * Starts collapsed (summary only), expands on click.
 */
export default function ExplainerBox({ title, summary, detail, color = '#185FA5', icon = 'ℹ', collapsible = true, defaultExpanded = false }) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div style={{ borderRadius: 10, border: `1px solid ${color}22`, background: `${color}07`, overflow: 'hidden' }}>
      <div
        onClick={() => collapsible && setExpanded(e => !e)}
        style={{ padding: '10px 14px', display: 'flex', gap: 10, alignItems: 'flex-start', cursor: collapsible ? 'pointer' : 'default', transition: 'background 0.1s' }}
        onMouseEnter={e => collapsible && (e.currentTarget.style.background = `${color}0E`)}
        onMouseLeave={e => collapsible && (e.currentTarget.style.background = 'transparent')}
      >
        <span style={{ fontSize: 14, flexShrink: 0, color, marginTop: 1 }}>{icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color, marginBottom: summary && !expanded ? 0 : 3 }}>{title}</div>
          {(!expanded || !detail) && summary && (
            <div style={{ fontSize: 12, color: 'var(--color-text-2)', lineHeight: 1.6 }}>{summary}</div>
          )}
          {expanded && detail && (
            <div style={{ fontSize: 12, color: 'var(--color-text)', lineHeight: 1.7, marginTop: 4 }}>{detail}</div>
          )}
        </div>
        {collapsible && detail && (
          <div style={{ color, flexShrink: 0 }}>
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * InlineExplainer — a compact non-collapsible info callout, for embedding inside charts/tables
 */
export function InlineExplainer({ text, color = '#185FA5' }) {
  return (
    <div style={{ padding: '8px 12px', background: `${color}0A`, borderLeft: `3px solid ${color}`, borderRadius: '0 6px 6px 0', fontSize: 12, color: 'var(--color-text-2)', lineHeight: 1.6 }}>
      {text}
    </div>
  );
}

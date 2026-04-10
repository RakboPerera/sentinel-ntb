import React, { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, Info } from 'lucide-react';

const SEVERITY_CONFIG = {
  critical: { bg: '#FEF0F0', border: '#FECACA', badge: '#DC2626', icon: '🔴', label: 'CRITICAL', textColor: '#991B1B' },
  high:     { bg: '#FFFBEB', border: '#FDE68A', badge: '#D97706', icon: '🟡', label: 'HIGH',     textColor: '#92400E' },
  medium:   { bg: '#EFF6FF', border: '#BFDBFE', badge: '#2563EB', icon: '🔵', label: 'MEDIUM',   textColor: '#1E40AF' },
  low:      { bg: '#F0FDF4', border: '#BBF7D0', badge: '#16A34A', icon: '🟢', label: 'LOW',      textColor: '#14532D' },
};

export default function RichFindingCard({ finding, index, agentColor, methodology }) {
  const [expanded, setExpanded] = useState(index === 0); // first one open by default
  const cfg = SEVERITY_CONFIG[finding.severity] || SEVERITY_CONFIG.medium;
  const exposureLkr = finding.affected_exposure_lkr || finding.affected_balance_lkr || finding.affected_customer_count || 0;

  return (
    <div style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 12, overflow: 'hidden', marginBottom: 10, transition: 'all 0.2s' }}>
      {/* Header row — always visible */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{ padding: '14px 16px', cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'flex-start' }}
      >
        {/* Severity badge */}
        <div style={{ display: 'flex', flex: 'none', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 48 }}>
          <span style={{ fontSize: 20 }}>{cfg.icon}</span>
          <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.08em', color: cfg.badge, textTransform: 'uppercase' }}>{cfg.label}</span>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: cfg.textColor, lineHeight: 1.5, marginBottom: 6 }}>
            {finding.finding}
          </div>

          {/* Exposure bar */}
          {exposureLkr > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'rgba(0,0,0,0.08)', maxWidth: 200 }}>
                <div style={{ height: '100%', borderRadius: 2, background: cfg.badge, width: `${Math.min(100, (exposureLkr / 2e9) * 100)}%` }} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: cfg.badge, whiteSpace: 'nowrap' }}>
                {exposureLkr > 1e9
                  ? `LKR ${(exposureLkr / 1e9).toFixed(2)} Bn`
                  : exposureLkr > 1e6
                  ? `LKR ${(exposureLkr / 1e6).toFixed(0)} Mn`
                  : `${exposureLkr.toLocaleString()} accounts`}
              </span>
            </div>
          )}
        </div>

        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: cfg.textColor, opacity: 0.6, flexShrink: 0, padding: 4 }}>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div style={{ borderTop: `1px solid ${cfg.border}`, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* How detected */}
          {methodology && (
            <div style={{ display: 'flex', gap: 10, padding: '10px 14px', background: 'rgba(255,255,255,0.6)', borderRadius: 8, alignItems: 'flex-start' }}>
              <Info size={14} style={{ color: agentColor, flexShrink: 0, marginTop: 1 }} />
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: agentColor, marginBottom: 3 }}>How this was detected</div>
                <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.6 }}>{methodology}</div>
              </div>
            </div>
          )}

          {/* Recommended action */}
          <div style={{ display: 'flex', gap: 10, padding: '10px 14px', background: 'rgba(255,255,255,0.6)', borderRadius: 8, alignItems: 'flex-start', borderLeft: `3px solid ${cfg.badge}` }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6B7280', marginBottom: 3 }}>Recommended action</div>
              <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.6 }}>{finding.recommended_action}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useRef } from 'react';
import { Info } from 'lucide-react';

export default function InfoTooltip({ text, width = 280, position = 'top' }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  const positionStyles = {
    top: { bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: 8 },
    right: { left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: 8 },
    left: { right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: 8 },
    bottom: { top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: 8 },
  };

  return (
    <span ref={ref} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', cursor: 'help' }}
      onMouseEnter={() => setVisible(true)} onMouseLeave={() => setVisible(false)}>
      <Info size={13} style={{ color: 'var(--color-text-3)', flexShrink: 0 }} />
      {visible && (
        <div style={{
          position: 'absolute', zIndex: 1000, width,
          background: '#1a1917', color: '#e8e6e0', fontSize: 12,
          padding: '10px 14px', borderRadius: 8, lineHeight: 1.6,
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.1)',
          pointerEvents: 'none', whiteSpace: 'normal',
          ...positionStyles[position],
        }}>
          {text}
          <div style={{ position: 'absolute', ...(position === 'top' ? { top: '100%', left: '50%', transform: 'translateX(-50%)', borderTop: '5px solid #1a1917', borderLeft: '5px solid transparent', borderRight: '5px solid transparent' } : position === 'bottom' ? { bottom: '100%', left: '50%', transform: 'translateX(-50%)', borderBottom: '5px solid #1a1917', borderLeft: '5px solid transparent', borderRight: '5px solid transparent' } : {}) }} />
        </div>
      )}
    </span>
  );
}

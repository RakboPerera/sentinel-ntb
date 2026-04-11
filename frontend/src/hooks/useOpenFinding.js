import { useApp } from '../context/AppContext.jsx';
import { demoData } from '../data/demoData.js';

/**
 * useOpenFinding — returns an openFinding(finding, agentId, agentColor, agentData) function.
 * Pass this as the `openFinding` prop to every VisualFindingCard.
 *
 * When called, it opens the GlobalFindingDrawer with:
 *   - The finding detail
 *   - The agent it came from
 *   - The full agent data (for orchestrator_signals)
 *   - Connected findings cross-referenced by entity ID
 *
 * Usage in any agent page:
 *   const openFinding = useOpenFinding('credit');
 *   <VisualFindingCard finding={f} openFinding={openFinding} />
 */
export default function useOpenFinding(agentId) {
  const { state, dispatch } = useApp();

  const AGENT_META = {
    credit:      { name: 'Credit Intelligence',       color: '#185FA5' },
    transaction: { name: 'Transaction Surveillance',  color: '#534AB7' },
    suspense:    { name: 'Suspense & Reconciliation', color: '#993C1D' },
    kyc:         { name: 'Identity & KYC / AML',      color: '#0F6E56' },
    controls:    { name: 'Internal Controls',         color: '#854F0B' },
    digital:     { name: 'Digital Fraud & Identity',  color: '#993556' },
    trade:       { name: 'Trade Finance & Treasury',  color: '#3B6D11' },
    insider:     { name: 'Insider Risk',              color: '#7C3AED' },
    mje:         { name: 'MJE Testing',               color: '#0891B2' },
    orchestrator:{ name: 'Orchestrator',              color: '#534AB7' },
  };

  return function openFinding(finding, overrideAgentId, overrideColor, overrideData) {
    const effectiveId = overrideAgentId || agentId;
    const meta = AGENT_META[effectiveId] || AGENT_META.credit;
    const demoKey = effectiveId === 'insider' ? 'insiderRisk' : effectiveId;
    const agentData = overrideData || state.agentResults[effectiveId] || demoData[demoKey];

    dispatch({
      type: 'OPEN_FINDING',
      payload: {
        finding,
        agentId: effectiveId,
        agentName: meta.name,
        agentColor: overrideColor || meta.color,
        agentData,
      },
    });
  };
}

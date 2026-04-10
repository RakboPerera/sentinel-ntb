import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as d3 from 'd3';
import { useApp } from '../../context/AppContext.jsx';
import { demoData } from '../../data/demoData.js';
import InfoTooltip from '../../components/shared/InfoTooltip.jsx';
import { ChevronRight, AlertTriangle, CheckCircle, Activity, Network } from 'lucide-react';

const AGENTS = [
  {
    id: 'credit', path: '/agents/credit', color: '#185FA5', bg: '#E6F1FB',
    icon: '◈', name: 'Credit Intelligence',
    tagline: 'SLFRS 9 staging anomalies & vintage quality deterioration',
    what: 'Monitors the entire loan portfolio for staging manipulation under SLFRS 9 (Sri Lanka\'s IFRS 9). Detects loans that should be in a higher risk stage than assigned — exposing understated provisions.',
    how: 'Runs an Isolation Forest across all loans using 8+ features: DPD, collateral ratio, restructure count, sector risk, override flag, and origination quarter. Validates against SLFRS 9 staging rules. Performs vintage cohort analysis to detect underwriting quality degradation across growth periods.',
    methods: ['Isolation Forest', 'SLFRS 9 Rules Engine', 'Vintage Cohort Analysis', 'Sector Risk Weighting'],
    ntbContext: 'NTB\'s loan book grew 50% in 2025 (LKR 287 Bn → LKR 430 Bn). At current Stage 3 ratio of 0.91% — the lowest in the Sri Lankan banking industry — even small misstaging has material provisioning consequences.',
    metric: '89 loans flagged', metricSub: 'LKR 1.41 Bn exposure', metricColor: '#EF9F27',
    tier: 2, tierLabel: 'Account / Position',
    critical: 12, findings: 89,
    keySignal: 'BR-14: 11 override-approved anomalous loans',
  },
  {
    id: 'transaction', path: '/agents/transaction', color: '#534AB7', bg: '#EEEDFE',
    icon: '⟳', name: 'Transaction Surveillance',
    tagline: 'Structuring, velocity anomalies & AML pattern detection',
    what: 'Analyses every transaction in the population for patterns consistent with money laundering, structuring below the CBSL FIU STR threshold (LKR 5 million), and unusual flow routing.',
    how: 'Applies Benford\'s Law to detect amount manipulation across the full population. Uses Z-score velocity analysis to flag accounts transacting at multiples of their historical baseline. Builds counterparty graphs to detect hub-and-spoke layering patterns. Scores each account for STR eligibility.',
    methods: ['Benford\'s Law', 'Velocity Z-Score', 'Network Graph Analysis', 'STR Rule Engine', 'Isolation Forest'],
    ntbContext: 'NTB processes over 96% of transactions through digital channels. The LKR 5M STR threshold is a known attack surface — systematic structuring slightly below this threshold is the most common CEFT fraud vector in Sri Lankan banking.',
    metric: '4 STR-eligible', metricSub: 'LKR 1.44 Bn combined', metricColor: '#A32D2D',
    tier: 1, tierLabel: 'Transaction / Event',
    critical: 4, findings: 847,
    keySignal: 'Digit "4" at 18.3% vs 9.7% expected (Benford)',
  },
  {
    id: 'suspense', path: '/agents/suspense', color: '#993C1D', bg: '#FAECE7',
    icon: '⊟', name: 'Suspense & Reconciliation',
    tagline: 'Phantom receivables, aging breaches & CEFT fraud detection',
    what: 'Monitors all suspense, nostro, and clearing accounts daily for unreconciled balances that exceed CBSL aging guidelines, and for growth-rate patterns consistent with phantom receivable fraud.',
    how: 'The key insight: legitimate CEFT receivables clear within 3–5 business days. An account that grows rapidly in balance while clearing ratio falls toward zero is definitively not processing real transactions — it is accumulating phantom entries. The agent tracks growth rate × clearing ratio as a combined fraud score.',
    methods: ['Growth-Rate Anomaly Detection', 'Clearing Ratio Analysis', 'Aging Tier Classification', 'CEFT Velocity Monitoring'],
    ntbContext: 'CBSL requires all suspense balances >90 days to be escalated. NTB currently has LKR 3.98 Bn in accounts exceeding this guideline — representing a systemic reconciliation control gap that creates the conditions for fraud.',
    metric: 'SUS-017 critical', metricSub: '+312% in 30 days · 94 days aged', metricColor: '#A32D2D',
    tier: 2, tierLabel: 'Account / Position',
    critical: 3, findings: 46,
    keySignal: 'Clearing ratio collapsed to 0.08 (benchmark: 0.95)',
  },
  {
    id: 'kyc', path: '/agents/kyc', color: '#0F6E56', bg: '#E1F5EE',
    icon: '✦', name: 'Identity & KYC / AML',
    tagline: '47-rule CDD engine, PEP screening & beneficial ownership gaps',
    what: 'Enforces CBSL Customer Due Diligence requirements across all 835,944 accounts. Identifies KYC gaps, expired documents, PEP accounts without current EDD, beneficial ownership non-disclosure, and accounts from FATF high-risk jurisdictions.',
    how: 'Applies a 47-rule compliance framework derived from CBSL Direction on KYC/AML and Sri Lanka\'s Financial Transactions Reporting Act (FTRA). Prioritises gaps by risk rating. Detects introducer concentration — where a single introducer has a disproportionate rate of KYC gaps across the accounts they introduced.',
    methods: ['47-Rule Compliance Engine', 'PEP/Sanctions Screening', 'Introducer Concentration Analysis', 'FATF Country Risk Mapping', 'Document Expiry Tracking'],
    ntbContext: 'The HSBC acquisition brings 200,000+ accounts into NTB\'s portfolio in Q2 2026. Each of these accounts must be KYC-verified to NTB standards before integration. Currently, 847 of the 39,290 KYC gaps are from the HSBC migration batch.',
    metric: '39,290 KYC gaps', metricSub: '4.7% gap rate across 835,944 accounts', metricColor: '#854F0B',
    tier: 3, tierLabel: 'Entity / Behavioural',
    critical: 7, findings: 39290,
    keySignal: 'INT-BR14-007: 34% gap rate on 41 introduced accounts',
  },
  {
    id: 'controls', path: '/agents/controls', color: '#854F0B', bg: '#FAEEDA',
    icon: '⚙', name: 'Internal Controls',
    tagline: 'SoD violations, override abuse & 6-dimension branch scoring',
    what: 'Monitors branch operations across NTB\'s 90-branch network for Segregation of Duties violations, override concentration, approval turnaround anomalies, and off-hours activity — the early indicators of insider fraud.',
    how: 'Scores each branch on a 6-dimension composite (0–100): override rate, SoD violation rate, approval turnaround, off-hours approvals, approver concentration, and temporal clustering. Branches below 65/100 are escalated. A single approver responsible for >40% of overrides triggers automatic investigation.',
    methods: ['SoD Violation Detection', 'Override Concentration Index', 'Temporal Pattern Analysis', '6-Dimension Branch Scoring', 'Cluster Approval Detection'],
    ntbContext: 'NTB\'s high-growth period (2025) created pressure on branch approval processes. Branches with the highest loan growth also show the highest override rates — a compounding risk that the Controls Agent monitors specifically.',
    metric: 'BR-14 score: 41/100', metricSub: 'STF-1847: 87% override concentration', metricColor: '#A32D2D',
    tier: 3, tierLabel: 'Entity / Behavioural',
    critical: 2, findings: 7,
    keySignal: '4 SoD violations by single approver STF-1847',
  },
  {
    id: 'digital', path: '/agents/digital', color: '#993556', bg: '#FBEAF0',
    icon: '⊕', name: 'Digital Fraud & Identity',
    tagline: 'Behavioral biometrics, impossible travel & account takeover detection',
    what: 'Analyses session and access data across NTB\'s digital channels (Nations Direct corporate banking and retail mobile banking) to detect account takeover, behavioral impersonation, and credential sharing.',
    how: 'Each user has a behavioral baseline score (target: 75/100) built from navigation patterns, typing rhythm, session duration, and transaction sequencing. Sessions that deviate significantly (score <50) are escalated. Impossible travel detection compares login geolocation timestamps against Sri Lanka city-pair travel benchmarks.',
    methods: ['Behavioral Biometrics', 'Impossible Travel Detection', 'Device Fingerprinting', 'Population Stability Index (PSI)', 'MFA Challenge Analysis'],
    ntbContext: 'NTB processes 96%+ of transactions digitally. Each digital session is a potential account takeover vector. The PSI metric is particularly important for the HSBC migration — a sudden influx of 200,000 new accounts will shift the behavioral distribution, requiring model recalibration.',
    metric: '23 critical sessions', metricSub: '4 impossible travel cases detected', metricColor: '#A32D2D',
    tier: 1, tierLabel: 'Transaction / Event',
    critical: 23, findings: 312,
    keySignal: 'DEV-A4F7-9921 shared across 4 accounts in SUS-017 network',
  },
  {
    id: 'insider', path: '/agents/insider-risk', color: '#7C3AED', bg: '#F3F1FF',
    icon: '◉', name: 'Insider Risk',
    tagline: '6-dimension staff scoring, SoD violations & behavioural change detection',
    what: 'Scores every staff member with system access across 6 insider fraud dimensions simultaneously — SoD violations, override concentration, same-cluster approvals, off-hours activity, approval turnaround anomaly, and session deviation. No single dimension alone flags an insider; the combination does.',
    how: 'Builds a behavioural baseline for each staff member from 14 months of access and approval logs. Any staff member scoring above 40/100 enters watch monitoring; above 70 triggers investigation; above 85 triggers immediate action. The key insight: normal staff have naturally distributed override approval times. Rubber-stamping (< 2 minutes per approval for complex loans) combined with override concentration and off-hours activity is the definitive insider fraud signature.',
    methods: ['6-Dimension Composite Scoring', 'SoD Violation Detection', 'Approval Turnaround Analysis', 'Peer Comparison Engine', 'Override Concentration Index', 'Temporal Pattern Clustering'],
    ntbContext: 'STF-1847 at BR-14 (Ratnapura) scores 94/100 — matching all 6 insider fraud dimensions simultaneously: 4 SoD violations, 87% override concentration, 12 off-hours approvals, 3 same-cluster loan approvals, 1.4-minute average approval time, and corroborating signals from 4 other agents. This is the highest-risk individual in NTB\'s 2,462-staff workforce.',
    metric: 'STF-1847: 94/100', metricSub: '12 flagged staff · LKR 418M linked exposure', metricColor: '#A32D2D',
    tier: 3, tierLabel: 'Entity / Behavioural',
    critical: 2, findings: 12,
    keySignal: 'STF-1847 matches all 6 insider fraud dimensions — immediate suspension required',
  },
  {
    id: 'mje', path: '/agents/mje', color: '#0891B2', bg: '#ECFEFF',
    icon: '⊞', name: 'MJE Testing',
    tagline: 'Full-population MJE audit, Benford analysis & GL reconciliation',
    what: 'Tests 100% of manual journal entries — not a sample — against five risk dimensions: timing (after-hours, weekend, midnight), amount anomalies (round numbers, Benford\'s Law first-digit test), GL account sensitivity (suspense, capital, intercompany), maker-checker integrity, and supporting document completeness. Finds the accounting manipulation that traditional audit misses.',
    how: 'Most MJE frauds are hidden in plain sight — individually each entry looks plausible. The agent detects combinations: an after-hours round-number entry to a suspense GL where the same person was maker and checker with no supporting documents is the accounting fraud signature. Benford\'s Law applied specifically to journal entry amounts (not transactions) detects sub-threshold structuring in GL postings.',
    methods: ['Full-Population MJE Testing', 'Benford\'s Law (First-Digit)', 'Timing Anomaly Detection', 'Maker-Checker SoD Validation', 'Document Completeness Scoring', 'GL Sensitivity Classification'],
    ntbContext: 'MJE-2026-4205 — a midnight, month-end, round-number LKR 120M entry to Loans Receivable with zero supporting documents and the same staff member as both maker and checker — scores 97/100. This is statistically the most improbable combination of legitimate accounting in the NTB population.',
    metric: 'MJE-2026-4205: 97/100', metricSub: '5 escalated · 8 Benford failures · LKR 120M', metricColor: '#A32D2D',
    tier: 1, tierLabel: 'Transaction / Event',
    critical: 5, findings: 847,
    keySignal: 'Digits 4 & 5 over-represented — sub-threshold structuring in GL postings',
  },
  {
    id: 'trade', path: '/agents/trade', color: '#3B6D11', bg: '#EAF3DE',
    icon: '◎', name: 'Trade Finance & Treasury',
    tagline: 'Invoice forensics, TBML detection & LCR/NSFR monitoring',
    what: 'Screens trade finance documents for pricing anomalies consistent with over/under-invoicing (TBML), detects duplicate LC applications, and monitors treasury positions for limit breaches and liquidity ratio trends.',
    how: 'Compares declared unit prices against HS code industry benchmarks. Deviations >25% are flagged as potential TBML. Duplicate LC detection identifies overlapping shipment periods on the same borrower. LCR and NSFR are tracked quarterly with trend alerts when either metric deteriorates >10%.',
    methods: ['HS Code Price Benchmarking', 'Duplicate LC Detection', 'NOP Monitoring', 'LCR/NSFR Trend Analysis', 'FATF Counterparty Screening'],
    ntbContext: 'NTB\'s LCR declined from 320.6% to 203.4% in FY2025 — a 37% decline driven by 50% loan growth outpacing stable funding growth. At current trajectory, LCR approaches the CBSL 150% amber threshold by mid-2026.',
    metric: 'LKR 412 Mn TBML', metricSub: 'NTB-CORP-0887 over-invoiced 91%', metricColor: '#A32D2D',
    tier: 2, tierLabel: 'Account / Position',
    critical: 1, findings: 6,
    keySignal: 'LCR declining: 320.6% → 203.4% (–37% in FY2025)',
  },
];

// ─── D3 Network graph — concentric rings by tier ─────────────────────────────
function NetworkView() {
  const svgRef = useRef(null);
  const navigate = useNavigate();

  // Tier 1 (outer ring): transaction/event agents
  const tier1 = AGENTS.filter(a => a.tier === 1);
  // Tier 2 (middle ring): account/position agents
  const tier2 = AGENTS.filter(a => a.tier === 2);
  // Tier 3 (inner ring): entity/behavioral agents
  const tier3 = AGENTS.filter(a => a.tier === 3);

  const nodes = [
    { id: 'orchestrator', label: 'Orchestrator', sublabel: 'Synthesis', color: '#534AB7', r: 40, tier: 0 },
    ...tier3.map((a, i) => ({ id: a.id, label: a.name.split(' ')[0], sublabel: 'L3', color: a.color, r: 28, path: a.path, critical: a.critical, findings: a.findings, tier: 3, idx: i, total: tier3.length })),
    ...tier2.map((a, i) => ({ id: a.id, label: a.name.split(' ')[0], sublabel: 'L2', color: a.color, r: 28, path: a.path, critical: a.critical, findings: a.findings, tier: 2, idx: i, total: tier2.length })),
    ...tier1.map((a, i) => ({ id: a.id, label: a.name.split(' ')[0], sublabel: 'L1', color: a.color, r: 28, path: a.path, critical: a.critical, findings: a.findings, tier: 1, idx: i, total: tier1.length })),
  ];

  // All domain agents connect to orchestrator
  const links = AGENTS.map(a => ({ source: a.id, target: 'orchestrator', tier: 'hub' }));
  // Cross-agent correlation links (dashed red)
  links.push(
    { source: 'credit',   target: 'controls', dashed: true, label: 'BR-14' },
    { source: 'credit',   target: 'insider',  dashed: true, label: 'STF-1847' },
    { source: 'transaction', target: 'suspense', dashed: true, label: 'SUS-017' },
    { source: 'digital',  target: 'insider',  dashed: true, label: 'STF-1847' },
    { source: 'transaction', target: 'trade', dashed: true, label: 'CORP-0887' },
    { source: 'kyc',      target: 'credit',   dashed: true, label: 'INT-BR14' },
    { source: 'mje',      target: 'suspense', dashed: true, label: 'SUS-001' },
    { source: 'mje',      target: 'controls', dashed: true, label: 'SoD' },
    { source: 'insider',  target: 'controls', dashed: true, label: 'BR-14' },
  );

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const W = el.parentElement.clientWidth || 900;
    const H = 500;
    const cx = W / 2, cy = H / 2;
    // Concentric ring radii
    const R = [0, 110, 200, 295]; // center, tier3, tier2, tier1

    // Pre-position nodes on their rings
    nodes.forEach(n => {
      if (n.tier === 0) { n.x = cx; n.y = cy; n.fx = cx; n.fy = cy; return; }
      const radius = R[n.tier];
      const angle = (2 * Math.PI * n.idx / n.total) - Math.PI / 2;
      n.x = cx + radius * Math.cos(angle);
      n.y = cy + radius * Math.sin(angle);
    });

    const svg = d3.select(el).attr('width', W).attr('height', H);
    svg.selectAll('*').remove();
    const g = svg.append('g');
    svg.call(d3.zoom().scaleExtent([0.4, 2.5]).on('zoom', e => g.attr('transform', e.transform)));

    // Ring guides
    const ringColors = ['rgba(124,58,237,0.06)','rgba(24,95,165,0.06)','rgba(83,74,183,0.05)'];
    const ringLabels = ['Entity / Behavioural', 'Account / Position', 'Transaction / Event'];
    [1,2,3].forEach(t => {
      g.append('circle').attr('cx', cx).attr('cy', cy).attr('r', R[t])
        .attr('fill', 'none').attr('stroke', ringColors[t-1]).attr('stroke-width', 1.5).attr('stroke-dasharray', '4,4');
      g.append('text').attr('x', cx).attr('y', cy - R[t] + 10)
        .attr('text-anchor', 'middle').attr('font-size', 9).attr('fill', 'rgba(107,105,99,0.5)').text(`L${t} · ${ringLabels[t-1]}`);
    });

    const sim = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(d => {
        if (d.tier === 'hub') return R[nodes.find(n=>n.id===d.source.id||n.id===d.source)?.tier||1];
        return 80;
      }).strength(d => d.tier === 'hub' ? 0.8 : 0.2))
      .force('charge', d3.forceManyBody().strength(-120))
      .force('radial', d3.forceRadial(d => R[d.tier] || 0, cx, cy).strength(d => d.tier === 0 ? 0 : 1.2))
      .force('collision', d3.forceCollide().radius(d => d.r + 22));

    // Hub links (thin blue)
    const hubLinks = links.filter(l => !l.dashed);
    const dashLinks = links.filter(l => l.dashed);

    const linkHub = g.append('g').selectAll('line').data(hubLinks).enter().append('line')
      .attr('stroke', 'rgba(83,74,183,0.2)').attr('stroke-width', 1);

    const linkDash = g.append('g').selectAll('line').data(dashLinks).enter().append('line')
      .attr('stroke', 'rgba(163,45,45,0.55)').attr('stroke-width', 1.5).attr('stroke-dasharray', '5,3');

    const linkLabel = g.append('g').selectAll('text').data(dashLinks).enter().append('text')
      .attr('font-size', 8).attr('fill', 'rgba(163,45,45,0.65)').attr('text-anchor', 'middle').attr('dy', -3).text(d => d.label);

    const node = g.append('g').selectAll('g').data(nodes).enter().append('g')
      .attr('cursor', d => d.path ? 'pointer' : 'default')
      .call(d3.drag()
        .on('start', (e, d) => { if (!e.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
        .on('drag', (e, d) => { d.fx = e.x; d.fy = e.y; })
        .on('end', (e, d) => { if (!e.active) sim.alphaTarget(0); if (d.tier!==0){d.fx=null;d.fy=null;} })
      )
      .on('click', (e, d) => { if (d.path) navigate(d.path); })
      .on('mouseenter', (e, d) => {
        if (d.path) d3.select(e.currentTarget).select('circle').attr('r', d.r + 4);
      })
      .on('mouseleave', (e, d) => {
        d3.select(e.currentTarget).select('circle').attr('r', d.r);
      });

    // Background circle
    node.append('circle').attr('r', d => d.r)
      .attr('fill', d => `${d.color}15`).attr('stroke', d => d.color)
      .attr('stroke-width', d => d.id === 'orchestrator' ? 2.5 : 1.5)
      .style('transition', 'r 0.15s');

    // Critical badge
    node.filter(d => d.critical > 0).append('circle')
      .attr('r', 9).attr('cx', d => d.r - 5).attr('cy', d => -(d.r - 5)).attr('fill', '#A32D2D');
    node.filter(d => d.critical > 0).append('text')
      .attr('x', d => d.r - 5).attr('y', d => -(d.r - 5))
      .attr('text-anchor', 'middle').attr('dominant-baseline', 'central')
      .attr('font-size', 9).attr('font-weight', 700).attr('fill', 'white').text(d => d.critical);

    // Label
    node.append('text').attr('text-anchor', 'middle').attr('dominant-baseline', 'central')
      .attr('font-size', d => d.id === 'orchestrator' ? 10 : 9)
      .attr('font-weight', 700).attr('fill', d => d.color).text(d => d.label);

    // Sub-label (L1/L2/L3 or findings)
    node.append('text').attr('text-anchor', 'middle').attr('y', d => d.r + 13)
      .attr('font-size', 8).attr('fill', '#9c9890')
      .text(d => d.id === 'orchestrator' ? '' : `${d.findings?.toLocaleString() || ''} findings`);

    sim.on('tick', () => {
      [linkHub, linkDash].forEach(sel => {
        sel.attr('x1', d => d.source.x).attr('y1', d => d.source.y)
           .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
      });
      linkLabel.attr('x', d => (d.source.x + d.target.x) / 2).attr('y', d => (d.source.y + d.target.y) / 2);
      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    return () => sim.stop();
  }, []);

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)', display: 'flex', gap: 20, fontSize: 10, color: 'var(--color-text-3)', flexWrap: 'wrap' }}>
        {[['rgba(83,74,183,0.4)','L3 — Entity / Behavioural'],['rgba(24,95,165,0.4)','L2 — Account / Position'],['rgba(83,74,183,0.25)','L1 — Transaction / Event'],['rgba(163,45,45,0.55)','Cross-agent correlation']].map(([c,l]) => (
          <span key={l} style={{ display:'flex', alignItems:'center', gap:5 }}>
            <svg width="20" height="10"><line x1="0" y1="5" x2="20" y2="5" stroke={c} strokeWidth={l.includes('Cross')?1.5:1} strokeDasharray={l.includes('Cross')?'4,2':null}/></svg>
            {l}
          </span>
        ))}
        <span style={{ marginLeft: 'auto' }}>Drag · Scroll to zoom · Click to open agent</span>
      </div>
      <svg ref={svgRef} style={{ width: '100%', display: 'block' }} />
    </div>
  );
}

export default function AgentNetwork() {
  const navigate = useNavigate();
  const { state } = useApp();
  const [view, setView] = useState('cards'); // 'cards' | 'network'
  const [expandedAgent, setExpandedAgent] = useState(null);

  return (
    <div style={{ maxWidth: 1400 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, gap: 16 }}>
        <div>
          <h2 style={{ marginBottom: 6 }}>Agent Network — 9 Domain Agents</h2>
          <p style={{ fontSize: 13, color: 'var(--color-text-2)', lineHeight: 1.6, maxWidth: 640 }}>
            Nine specialized AI agents — organized across three analytical layers (Transaction, Account, Entity) — plus an Orchestrator that correlates signals across all layers. Fraud is only fully visible at the intersection of multiple layers.
          </p>
        </div>
        <div style={{ display: 'flex', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 20, padding: 3, gap: 2, flexShrink: 0 }}>
          <button onClick={() => setView('cards')} style={{ padding: '6px 16px', borderRadius: 16, fontSize: 12, fontWeight: 500, cursor: 'pointer', background: view === 'cards' ? 'var(--color-surface)' : 'none', color: view === 'cards' ? 'var(--color-text)' : 'var(--color-text-2)', border: 'none', boxShadow: view === 'cards' ? 'var(--shadow)' : 'none' }}>
            Agent Cards
          </button>
          <button onClick={() => setView('network')} style={{ padding: '6px 16px', borderRadius: 16, fontSize: 12, fontWeight: 500, cursor: 'pointer', background: view === 'network' ? 'var(--color-surface)' : 'none', color: view === 'network' ? 'var(--color-text)' : 'var(--color-text-2)', border: 'none', boxShadow: view === 'network' ? 'var(--shadow)' : 'none' }}>
            Network Graph
          </button>
        </div>
      </div>

      {/* Orchestrator Banner */}
      <div style={{ padding: '16px 24px', background: 'linear-gradient(135deg, var(--color-purple-light) 0%, var(--color-blue-light) 100%)', border: '1px solid rgba(83,74,183,0.2)', borderRadius: 12, marginBottom: 24, display: 'flex', gap: 20, alignItems: 'center' }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(83,74,183,0.15)', border: '1px solid rgba(83,74,183,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0, color: 'var(--color-purple)' }}>◎</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 4 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-purple)' }}>Executive Orchestrator</span>
            <InfoTooltip text="The Orchestrator doesn't analyse data directly — it receives signals from all 9 domain agents across 3 analytical layers and identifies entities that appear in multiple agents simultaneously. When 2+ agents flag the same branch, account, or staff member, the Orchestrator generates a cross-domain correlation with a combined severity score up to 1.0." width={320} position="right" />
            <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', background: 'rgba(83,74,183,0.15)', color: 'var(--color-purple)', borderRadius: 10 }}>5 active correlations</span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--color-text-2)', lineHeight: 1.6 }}>
            Receives signals from all 9 domain agents across 3 analytical layers. Detects cross-domain correlations — patterns only visible when Transaction, Account, and Entity signals converge on the same entity. Current highest severity: <strong style={{ color: 'var(--color-red)' }}>SUS-017 network — 0.99/1.00</strong>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['BR-14: 0.98', 'SUS-017: 0.99', 'CORP-0887: 0.94'].map((corr, i) => (
            <div key={i} style={{ padding: '6px 12px', background: 'rgba(163,45,45,0.08)', border: '1px solid rgba(163,45,45,0.2)', borderRadius: 8, fontSize: 11, fontWeight: 600, color: 'var(--color-red)', textAlign: 'center', whiteSpace: 'nowrap' }}>{corr}</div>
          ))}
        </div>
      </div>

      {view === 'network' && <NetworkView />}

      {view === 'cards' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {/* Tier structure explainer */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
            {[
              { tier: 1, label: 'Transaction / Event Layer', desc: 'Analyses every individual transaction, session, or journal entry at point of processing. Finest granularity.', color: '#534AB7', agents: AGENTS.filter(a=>a.tier===1) },
              { tier: 2, label: 'Account / Position Layer',  desc: 'Detects patterns across account balances, portfolios, and positions over time. Mid-level granularity.', color: '#185FA5', agents: AGENTS.filter(a=>a.tier===2) },
              { tier: 3, label: 'Entity / Behavioural Layer', desc: 'Builds risk profiles for people and entities across all their activity. Highest-level synthesis before Orchestrator.', color: '#854F0B', agents: AGENTS.filter(a=>a.tier===3) },
            ].map(t => (
              <div key={t.tier} style={{ padding: '14px 16px', background: `${t.color}08`, border: `1px solid ${t.color}25`, borderRadius: 10, borderTop: `3px solid ${t.color}` }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: t.color, marginBottom: 5 }}>Layer {t.tier}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)', marginBottom: 5 }}>{t.label}</div>
                <div style={{ fontSize: 11, color: 'var(--color-text-2)', lineHeight: 1.5, marginBottom: 8 }}>{t.desc}</div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {t.agents.map(a => <span key={a.id} style={{ fontSize: 10, padding: '2px 7px', background: `${a.color}15`, color: a.color, borderRadius: 4, fontWeight: 600 }}>{a.name.split(' ')[0]}</span>)}
                </div>
              </div>
            ))}
          </div>

          {/* Cards grouped by tier */}
          {[
            { tier: 1, label: 'Layer 1 — Transaction / Event', color: '#534AB7', desc: 'Each agent in this layer scores every individual event at point of processing' },
            { tier: 2, label: 'Layer 2 — Account / Position', color: '#185FA5', desc: 'These agents detect patterns across account histories and portfolio compositions' },
            { tier: 3, label: 'Layer 3 — Entity / Behavioural', color: '#854F0B', desc: 'These agents build comprehensive risk profiles for people and entities across all their activity' },
          ].map(tier => (
            <div key={tier.tier}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12, paddingBottom: 10, borderBottom: `2px solid ${tier.color}30` }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: `${tier.color}15`, border: `1px solid ${tier.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, color: tier.color }}>L{tier.tier}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)' }}>{tier.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-3)' }}>{tier.desc}</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 14 }}>
                {AGENTS.filter(a => a.tier === tier.tier).map((agent, i) => {
            const isExpanded = expandedAgent === agent.id;
            const result = state.agentResults[agent.id];
            const loading = state.agentLoading[agent.id];
            const hasCritical = agent.critical > 0;

            return (
              <div key={agent.id} className="animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                <div style={{ background: 'var(--color-surface)', border: `1px solid ${isExpanded ? agent.color + '44' : 'var(--color-border)'}`, borderRadius: 14, overflow: 'hidden', transition: 'all 0.2s', boxShadow: isExpanded ? `0 4px 24px ${agent.color}18` : 'none' }}>
                  {/* Card Header */}
                  <div style={{ padding: '18px 20px', borderBottom: isExpanded ? `1px solid var(--color-border)` : 'none', background: isExpanded ? `${agent.color}06` : 'transparent' }}>
                    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                      {/* Icon */}
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: agent.bg, border: `1px solid ${agent.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: agent.color, flexShrink: 0, fontWeight: 700 }}>
                        {agent.icon}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 3 }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)' }}>{agent.name}</span>
                          <InfoTooltip text={agent.what} width={300} position="top" />
                          {hasCritical && (
                            <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, padding: '2px 7px', background: 'var(--color-red-light)', color: 'var(--color-red)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 3, whiteSpace: 'nowrap' }}>
                              <AlertTriangle size={9} /> {agent.critical} critical
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--color-text-2)', lineHeight: 1.4 }}>{agent.tagline}</div>
                      </div>
                    </div>

                    {/* Metric strip */}
                    <div style={{ display: 'flex', gap: 0, marginTop: 14, background: 'var(--color-surface-2)', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                      <div style={{ flex: 1, padding: '10px 14px', borderRight: '1px solid var(--color-border)' }}>
                        <div style={{ fontSize: 16, fontWeight: 800, color: agent.metricColor, lineHeight: 1 }}>{agent.metric}</div>
                        <div style={{ fontSize: 10, color: 'var(--color-text-3)', marginTop: 3 }}>{agent.metricSub}</div>
                      </div>
                      <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          {loading
                            ? <><span className="spinner" style={{ width: 12, height: 12 }} /><span style={{ fontSize: 11, color: 'var(--color-text-3)' }}>Running...</span></>
                            : result
                            ? <><CheckCircle size={13} style={{ color: 'var(--color-green)' }} /><span style={{ fontSize: 11, color: 'var(--color-green)' }}>Live result</span></>
                            : <><Activity size={13} style={{ color: agent.color }} /><span style={{ fontSize: 11, color: 'var(--color-text-2)' }}>Demo data</span></>
                          }
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="animate-fade-in" style={{ padding: '16px 20px' }}>
                      {/* How it works */}
                      <div style={{ marginBottom: 14 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-text-3)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                          How it works <InfoTooltip text="The methodology this agent applies to your data to detect anomalies." position="right" />
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--color-text-2)', lineHeight: 1.7, padding: '10px 14px', background: 'var(--color-surface-2)', borderRadius: 8, borderLeft: `3px solid ${agent.color}` }}>{agent.how}</div>
                      </div>

                      {/* Detection methods */}
                      <div style={{ marginBottom: 14 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-text-3)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                          Detection methods <InfoTooltip text="The specific algorithmic and rule-based techniques this agent applies." position="right" />
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {agent.methods.map(m => (
                            <span key={m} style={{ fontSize: 11, fontWeight: 500, padding: '4px 10px', background: `${agent.color}12`, color: agent.color, border: `1px solid ${agent.color}28`, borderRadius: 6 }}>{m}</span>
                          ))}
                        </div>
                      </div>

                      {/* NTB context */}
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-text-3)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                          NTB context <InfoTooltip text="Why this agent is particularly relevant to NTB's current situation." position="right" />
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--color-text-2)', lineHeight: 1.7, padding: '10px 14px', background: `${agent.color}06`, borderRadius: 8, border: `1px solid ${agent.color}22` }}>{agent.ntbContext}</div>
                      </div>

                      {/* Key signal */}
                      <div style={{ padding: '10px 14px', background: hasCritical ? 'var(--color-red-light)' : 'var(--color-amber-light)', borderRadius: 8, fontSize: 12, color: hasCritical ? 'var(--color-red)' : 'var(--color-amber)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <AlertTriangle size={13} />
                        <strong>Key signal:</strong>&nbsp;{agent.keySignal}
                      </div>
                    </div>
                  )}

                  {/* Card footer */}
                  <div style={{ padding: '12px 20px', borderTop: '1px solid var(--color-border)', display: 'flex', gap: 8, background: isExpanded ? `${agent.color}04` : 'transparent' }}>
                    <button
                      onClick={() => setExpandedAgent(isExpanded ? null : agent.id)}
                      style={{ flex: 1, padding: '8px 0', borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: 'pointer', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text-2)', transition: 'all 0.15s' }}
                      onMouseEnter={e => e.target.style.background = 'var(--color-border)'}
                      onMouseLeave={e => e.target.style.background = 'var(--color-surface-2)'}
                    >
                      {isExpanded ? '↑ Collapse' : '↓ Learn more'}
                    </button>
                    <button
                      onClick={() => navigate(agent.path)}
                      style={{ flex: 1.5, padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', background: agent.color, border: 'none', color: 'white', transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                      onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                    >
                      Open Agent Module <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

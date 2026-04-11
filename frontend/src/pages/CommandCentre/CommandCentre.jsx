import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';
import { demoData, kpiData, executiveData } from '../../data/demoData.js';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, CartesianGrid, ReferenceLine, AreaChart, Area, Legend } from 'recharts';
import { GitMerge, Clock, X, ChevronRight, AlertTriangle, Info, Zap, Shield, TrendingUp, CheckCircle, GitBranch } from 'lucide-react';
import InfoTooltip from '../../components/shared/InfoTooltip.jsx';
import { SignalBar, DetectionPipeline, InsightBox } from '../../components/shared/VisualComponents.jsx';

// ─── ENRICHED ALERT DATA ──────────────────────────────────────────────────────

const liveAlerts = [
  {
    id: 'alert-001', caseId: 'CASE-001', agent: 'Credit Agent', agentId: 'credit', agentColor: '#185FA5',
    text: '3 Construction sector loans reclassified — Stage 2 → Stage 3 predicted. LKR 287 Mn exposure.',
    severity: 'critical', time: '2m ago',
    title: 'SLFRS 9 Staging Anomaly — Construction Sector',
    anomalyScore: 0.91,
    methodTag: 'Isolation Forest + SLFRS 9 Rules Engine',
    howFound: 'Isolation Forest analysed 8 features per loan (DPD, collateral ratio, restructure count, sector NPL rate, override flag, exposure vs cohort, origination quarter, customer risk rating). The multivariate combination for these 3 loans produced anomaly scores of 0.91, 0.94, and 0.87 — all above the 0.85 critical threshold. No single feature alone would have triggered a flag; it is the combination that is statistically anomalous.',
    detectionSteps: [
      { title: 'Feature extraction', text: 'For each loan: extract DPD, collateral ratio, restructure count, sector NPL rate, override flag, origination quarter.', result: '8 features × 3 flagged loans = multivariate profile' },
      { title: 'Isolation Forest scoring', text: 'Algorithm builds random decision trees. Points isolated quickly (short paths) are anomalies — they deviate from their SLFRS 9 stage-peers on multiple dimensions simultaneously.', result: 'Scores: 0.91, 0.94, 0.87 — all above 0.85 critical threshold' },
      { title: 'SLFRS 9 stage prediction', text: 'Predicted stage (from feature combination) compared against assigned stage. All 3 loans are predicted Stage 3 but assigned Stage 1 or 2.', result: 'ECL understatement: ~LKR 287 Mn if corrected' },
    ],
    signals: [
      { label: 'DPD 67–88 days — approaching or at Stage 3 threshold of 90 days', strength: 0.88 },
      { label: 'Collateral ratio 0.38 — below Stage 3 minimum of 0.40', strength: 0.84 },
      { label: 'Construction sector NPL 3.2% — 3.5× the NTB portfolio average', strength: 0.72 },
      { label: 'Restructure count ≥ 2 on two loans — a SLFRS 9 Stage 3 trigger', strength: 0.94 },
    ],
    regulatoryContext: 'Under SLFRS 9, a loan must be Stage 3 if DPD ≥ 90 days, collateral ratio < 0.40, or restructure count ≥ 2. Keeping these loans at Stage 1/2 understates ECL provisioning by ~LKR 287 Mn.',
    recommendedAction: 'Convene Staging Committee within 48 hours. Reclassify all 3 loans to Stage 3. Resubmit ECL calculation. Escalate to CFO if restatement threshold is exceeded.',
    agentPath: '/agents/credit', exposureLkr: 287000000,
    correlationId: null,
    triggerRule: 'RULE-CR-004: Isolation Forest score > 0.85 × Staging mismatch',
    ruleVersion: 'v2.1.3',
    statusHistory: [
      { status: 'Created', timestamp: '14:28:01', actor: 'SYSTEM', note: 'Credit Agent triggered RULE-CR-004. 3 loans breached threshold simultaneously.' },
      { status: 'Assigned', timestamp: '14:28:02', actor: 'SYSTEM', note: 'Auto-assigned to Staging Committee (P2 SLA — 48h).' },
      { status: 'Under Review', timestamp: '14:31:00', actor: 'SYSTEM', note: 'Staging Committee notified. ECL recalculation queued.' },
    ],
    sla: { target_minutes: 2880, elapsed_minutes: 8, status: 'Within SLA', target_label: '48 hours' },
    strStatus: null,
    accountStatus: 'Active',
  },
  {
    id: 'alert-002', caseId: 'CASE-002', agent: 'Suspense Agent', agentId: 'suspense', agentColor: '#993C1D',
    text: 'Account SUS-017 (Pettah Main St.) unreconciled 94 days. Balance LKR 1.24 Bn. Growth 312% in 30 days.',
    severity: 'critical', time: '4m ago',
    title: 'Phantom Receivable Confirmed — SUS-017 Pettah Main Street',
    anomalyScore: 0.99,
    methodTag: 'Growth-Rate × Clearing-Ratio Analysis',
    howFound: 'The Suspense Agent runs daily growth-rate × clearing-ratio analysis across all 143 suspense and nostro accounts. SUS-017 triggered two simultaneous flags: (1) balance grew 312% in 30 days — 4× the 50% threshold that triggers investigation; (2) clearing ratio collapsed to 0.08 — a legitimate CEFT receivables account should clear at 0.95+. High growth AND near-zero clearing is the definitive phantom receivable signature.',
    detectionSteps: [
      { title: 'Daily balance growth scan', text: 'Compute 30-day balance change for every suspense account. Flag any account growing >50% in 30 days.', result: 'SUS-017: +312% in 30 days — 6.2× the flag threshold' },
      { title: 'Clearing ratio analysis', text: 'Clearing ratio = outflows ÷ inflows in the period. Legitimate CEFT receivables clear at 0.95+. Ratio near zero = entries flowing in but never matched to real outflows.', result: 'SUS-017 clearing ratio: 0.08 — 92% of inflows are uncleared phantom entries' },
      { title: 'CBSL aging check', text: 'CBSL requires escalation for all suspense balances older than 90 days. Any balance exceeding 90 days is a regulatory breach independent of fraud concern.', result: 'SUS-017: 94 days — CBSL guideline formally breached' },
    ],
    signals: [
      { label: 'Balance LKR 1.24 Bn — grew from LKR 301 Mn in 30 days (+312%)', strength: 0.99 },
      { label: 'Clearing ratio 0.08 — 92% of inflows never cleared (benchmark: 0.95+)', strength: 0.97 },
      { label: '94 days unreconciled — exceeds CBSL 90-day guideline (regulatory breach)', strength: 0.95 },
      { label: 'CEFT velocity 11.1× account baseline from Transaction Agent cross-signal', strength: 0.91 },
    ],
    regulatoryContext: 'CBSL requires all suspense balances aged >90 days to be escalated to the Board Audit Committee. SUS-017 at 94 days constitutes a regulatory breach independently of the fraud concern. Under FTRA the account\'s flow pattern is STR-eligible.',
    recommendedAction: 'IMMEDIATE: Freeze SUS-017. File STR with CBSL FIU within 24 hours. Notify Board Audit Committee. Engage forensic accountants. Cross-reference all CEFT counterparties for related account network.',
    agentPath: '/agents/suspense', exposureLkr: 1240000000,
    correlationId: 'COR-881',
    triggerRule: 'RULE-SUS-012: Growth > 50% × Clearing ratio < 0.30 × Aging > 90d',
    ruleVersion: 'v3.0.1',
    statusHistory: [
      { status: 'Created', timestamp: '14:24:07', actor: 'SYSTEM', note: 'Suspense Agent triggered RULE-SUS-012. SUS-017 breached all three criteria simultaneously.' },
      { status: 'Assigned', timestamp: '14:24:08', actor: 'SYSTEM', note: 'Auto-assigned to Fraud Investigation Team (P1 SLA — 4h).' },
      { status: 'Correlated', timestamp: '14:34:02', actor: 'SYSTEM', note: 'Linked to COR-881 with Transaction Agent alert. Combined severity 0.99.' },
      { status: 'Escalated', timestamp: '14:35:00', actor: 'S.Perera (Compliance Head)', note: 'Account freeze initiated. STR under assessment. Forensic team engaged.' },
    ],
    sla: { target_minutes: 240, elapsed_minutes: 4, status: 'Within SLA', target_label: '4 hours' },
    strStatus: 'Pending — Under Assessment',
    accountStatus: 'Frozen',
  },
  {
    id: 'alert-003', caseId: 'CASE-004', agent: 'Transaction Agent', agentId: 'transaction', agentColor: '#534AB7',
    text: 'Account NTB-0841-X scored 0.94. 15 CEFT transfers in 22 minutes, all below LKR 5M threshold.',
    severity: 'critical', time: '7m ago',
    title: 'Structuring Detected — NTB-0841-X CEFT Cluster',
    anomalyScore: 0.94,
    methodTag: "Benford's Law + Structuring Score + Network Analysis",
    howFound: "Benford's Law analysis across 284,719 transactions detected first digit '4' at 18.3% vs expected 9.7% (chi-squared p=0.003). Deep-dive on the cluster: 15 CEFT transfers in 22 minutes, each between LKR 4.6M–4.95M. Structuring score 0.94 based on threshold proximity, tight amount clustering (σ=LKR 112K), time compression, and counterparty concentration (89% to 3 accounts).",
    detectionSteps: [
      { title: "Benford's Law population test", text: "Compute first-digit distribution across all 284,719 transactions. Chi-squared test against Benford's expected values.", result: "Digit '4' at 18.3% vs 9.7% expected — p=0.003 (highly significant)" },
      { title: 'Structuring cluster detection', text: 'Identify clusters: ≥3 transactions within 24h, all below LKR 5M, combined total >LKR 5M. Score each cluster on threshold proximity, time compression, amount variance.', result: '7 clusters detected; NTB-0841-X scores 0.94 (highest)' },
      { title: 'Network graph analysis', text: 'Build directed transaction graph. Flag accounts where >70% of outflows go to the same 1–3 counterparties — hub-and-spoke layering pattern.', result: 'NTB-0841-X: 89% concentration to 3 Sampath Bank accounts' },
    ],
    signals: [
      { label: '15 transactions in 22 minutes — velocity 15.7× account baseline', strength: 0.95 },
      { label: 'All amounts LKR 4.6M–4.95M — within 10% of LKR 5M STR threshold', strength: 0.94 },
      { label: 'Combined total LKR 71.25M — would trigger 14 STRs if sent as single txns', strength: 0.88 },
      { label: '89% of outflows to same 3 Sampath Bank accounts — layering pattern', strength: 0.82 },
    ],
    regulatoryContext: 'Structuring (deliberately breaking transactions to avoid the LKR 5M STR threshold) is a criminal offence under the FTRA. NTB must file an STR with the CBSL Financial Intelligence Unit within 5 working days.',
    recommendedAction: 'Suspend account NTB-0841-X. File STR with CBSL FIU citing structuring. Freeze the LKR 71.25M pending investigation. Trace all Sampath Bank counterparties.',
    agentPath: '/agents/transaction', exposureLkr: 71250000,
    correlationId: 'COR-881',
    triggerRule: "RULE-TXN-003: Structuring score > 0.60 × Benford deviation p < 0.05",
    ruleVersion: 'v3.2.1',
    statusHistory: [
      { status: 'Created', timestamp: '14:30:18', actor: 'SYSTEM', note: 'Transaction Agent triggered RULE-TXN-003. 15-transaction structuring cluster detected.' },
      { status: 'Assigned', timestamp: '14:30:18', actor: 'SYSTEM', note: 'Auto-assigned to Fraud Investigation Team (P1 SLA — 4h).' },
      { status: 'Blocked', timestamp: '14:34:03', actor: 'SYSTEM', note: 'Account NTB-0841-X auto-blocked per Orchestrator escalation COR-881.' },
    ],
    sla: { target_minutes: 240, elapsed_minutes: 7, status: 'Within SLA', target_label: '4 hours' },
    strStatus: 'Pending — Under Assessment',
    accountStatus: 'Blocked',
  },
  {
    id: 'alert-004', caseId: 'CASE-003', agent: 'Controls Agent', agentId: 'controls', agentColor: '#854F0B',
    text: 'STF-1847 (BR-14 Ratnapura) — 4 SoD violations, 87% override concentration. Insider fraud pattern.',
    severity: 'critical', time: '11m ago',
    title: 'Insider Fraud Pattern — STF-1847, Branch BR-14',
    anomalyScore: 0.96,
    methodTag: '6-Dimension Branch Scoring + SoD Detection',
    howFound: 'The Internal Controls Agent scores each branch on 6 dimensions (0–100 composite). BR-14 scored 41/100 — lowest in the 90-branch network. Root cause: STF-1847 initiated AND approved the same transactions in 4 instances (SoD violations), is responsible for 87% of all branch overrides, approved 3 loans to borrowers sharing guarantor addresses, and made 12 approvals between 21:00–23:00. No single signal is definitive; the combination across all 6 dimensions triggers the critical flag.',
    detectionSteps: [
      { title: 'SoD violation detection', text: 'For every transaction, compare initiator_id and approver_id. Any match is a Segregation of Duties violation — same person cannot both initiate and approve.', result: '4 SoD violations at BR-14, all involving STF-1847' },
      { title: 'Override concentration analysis', text: 'For each branch, compute the proportion of overrides attributable to each approver. Flag if any single approver is responsible for >40% of overrides.', result: 'STF-1847: 87% of all BR-14 overrides (threshold: 40%)' },
      { title: '6-dimension branch scoring', text: 'Score override rate, SoD violations, approval turnaround, off-hours approvals, approver concentration, and temporal clustering. Composite below 65/100 triggers audit.', result: 'BR-14: 41/100 — lowest in network (threshold: 65)' },
    ],
    signals: [
      { label: '4 SoD violations — same staff initiated and approved loan disbursements', strength: 0.97 },
      { label: '87% override concentration — 1 approver handles nearly all branch overrides', strength: 0.94 },
      { label: '3 same-cluster approvals — loans to borrowers sharing guarantor addresses', strength: 0.86 },
      { label: '12 off-hours approvals (21:00–23:00) — 22.1% of branch total', strength: 0.81 },
    ],
    regulatoryContext: 'CBSL Direction No. 5/2024 on Internal Controls requires banks to ensure no single staff member has end-to-end control over any credit or payment transaction. SoD violations at this level constitute a material control failure requiring regulatory disclosure.',
    recommendedAction: 'IMMEDIATE: Suspend STF-1847. Preserve all system access logs. Deploy field audit team to BR-14 within 48 hours. Freeze all new credit approvals at BR-14.',
    agentPath: '/agents/controls', exposureLkr: 387000000,
    correlationId: 'COR-882',
    triggerRule: 'RULE-CTL-007: SoD violations ≥ 3 × Override concentration > 70%',
    ruleVersion: 'v2.4.0',
    statusHistory: [
      { status: 'Created', timestamp: '14:20:44', actor: 'SYSTEM', note: 'Controls Agent triggered RULE-CTL-007. STF-1847 matched all 6 insider fraud indicators.' },
      { status: 'Assigned', timestamp: '14:20:45', actor: 'SYSTEM', note: 'Auto-assigned to Internal Audit — P1 SLA (4h).' },
      { status: 'Escalated', timestamp: '14:22:00', actor: 'SYSTEM', note: 'Orchestrator correlated with Credit and KYC agents. Combined severity 0.98 — case opened.' },
      { status: 'Escalated', timestamp: '14:35:00', actor: 'R.Wijeratne (Chief Audit)', note: 'Confirmed pattern. Suspension of STF-1847 in progress. Field audit team to BR-14 within 48h.' },
    ],
    sla: { target_minutes: 240, elapsed_minutes: 11, status: 'Within SLA', target_label: '4 hours' },
    strStatus: null,
    accountStatus: 'Active',
  },
  {
    id: 'alert-005', caseId: 'CASE-001', agent: 'KYC Agent', agentId: 'kyc', agentColor: '#0F6E56',
    text: 'Introducer INT-BR14-007 — 34% gap rate across 41 introduced accounts. Systemic onboarding failure.',
    severity: 'high', time: '18m ago',
    title: 'Introducer Concentration — INT-BR14-007, Branch BR-14',
    anomalyScore: 0.78,
    methodTag: '47-Rule Compliance Engine + Introducer Concentration',
    howFound: 'The KYC Agent flags introducers where KYC gaps exceed 15% of their introduced accounts AND there are >3 gap accounts. INT-BR14-007 has KYC gaps on 14 of 41 introduced accounts (34%) — more than double the branch average of 12.4%. Two of the 3 anomalous credit borrowers flagged by the Credit Agent were introduced by this same person. The cross-agent signal link elevates the finding from administrative to investigative.',
    detectionSteps: [
      { title: '47-rule compliance scan', text: 'Apply all 47 CDD rules to each account. Flag KYC document expiry, missing beneficial ownership, PEP accounts without current EDD, FATF-country exposure.', result: '39,290 gaps identified across 835,944 accounts — 4.7% gap rate' },
      { title: 'Introducer concentration analysis', text: 'Group accounts by introducer code. Compute gap rate per introducer. Flag if any introducer exceeds the 15% threshold with 3+ gap accounts.', result: 'INT-BR14-007: 34% gap rate (threshold: 15%)' },
      { title: 'Cross-agent signal matching', text: 'Match introducer-linked accounts against Credit Agent flagged borrowers. Shared entities elevate combined severity.', result: '2 of 3 Credit-flagged BR-14 borrowers introduced by INT-BR14-007' },
    ],
    signals: [
      { label: 'INT-BR14-007: 14 of 41 introduced accounts have KYC gaps (34%)', strength: 0.82 },
      { label: 'Branch BR-14 gap rate 12.4% — highest in the NTB network', strength: 0.76 },
      { label: '2 anomalous credit borrowers introduced by same introducer', strength: 0.88 },
      { label: '3 accounts without beneficial ownership disclosure (regulatory breach)', strength: 0.72 },
    ],
    regulatoryContext: 'CBSL Direction on KYC/AML requires CDD on all customers. An introducer with systematic KYC gaps may indicate deliberate onboarding of accounts designed to obscure beneficial ownership.',
    recommendedAction: 'Suspend introducer privileges for INT-BR14-007. Review all 41 introduced accounts within 30 days. Incorporate into the BR-14 investigation.',
    agentPath: '/agents/kyc', exposureLkr: 0,
    correlationId: 'COR-882',
    triggerRule: 'RULE-KYC-009: Introducer gap rate > 15% × Cross-agent entity match',
    ruleVersion: 'v1.8.2',
    statusHistory: [
      { status: 'Created', timestamp: '14:12:33', actor: 'SYSTEM', note: 'KYC Agent flagged INT-BR14-007 concentration. Linked to Credit Agent BR-14 findings.' },
      { status: 'Assigned', timestamp: '14:12:34', actor: 'SYSTEM', note: 'Auto-assigned to Compliance (P2 SLA — 24h).' },
      { status: 'Under Review', timestamp: '14:18:00', actor: 'SYSTEM', note: 'Introducer privileges suspended pending investigation.' },
    ],
    sla: { target_minutes: 1440, elapsed_minutes: 18, status: 'Within SLA', target_label: '24 hours' },
    strStatus: null,
    accountStatus: 'Active',
  },
  {
    id: 'alert-006', caseId: 'CASE-007', agent: 'Digital Agent', agentId: 'digital', agentColor: '#993556',
    text: 'Impossible travel: NTB-3312-B — Jaffna → Colombo in 18 minutes. SIM swap suspected.',
    severity: 'high', time: '24m ago',
    title: 'Impossible Travel Detected — NTB-3312-B',
    anomalyScore: 0.88,
    methodTag: 'Geographic Velocity + Behavioral Biometrics',
    howFound: 'The Digital Fraud Agent logs session cities via IP geolocation and compares consecutive sessions against a Sri Lanka city-pair travel time table. NTB-3312-B had a Jaffna session at 14:32, then a Colombo session at 14:50 — 18 minutes. Minimum Jaffna–Colombo travel: 330 minutes. The account also passed MFA in the Colombo session, which rules out simple credential theft and suggests SIM swap (OTP rerouted to attacker).',
    detectionSteps: [
      { title: 'IP geolocation & city mapping', text: 'Each login IP is geolocated to a Sri Lankan city. Consecutive sessions are compared and flagged if cities differ.', result: 'Jaffna (14:32) → Colombo (14:50) — 18 minutes elapsed' },
      { title: 'Travel time validation', text: 'Compare elapsed time against Sri Lanka city-pair minimum travel times. Jaffna–Colombo: 330 min road, 90 min flight.', result: 'Impossible: 18 min elapsed vs 90 min minimum' },
      { title: 'MFA analysis', text: 'MFA passed in the suspicious session. This eliminates simple password theft and implies OTP was also compromised — consistent with SIM swap.', result: 'SIM swap likely: credentials + OTP both compromised' },
    ],
    signals: [
      { label: 'Jaffna 14:32 → Colombo 14:50 — 18 min elapsed vs 90 min minimum', strength: 0.97 },
      { label: 'MFA passed in Colombo session — OTP likely intercepted via SIM swap', strength: 0.84 },
      { label: 'LKR 14.8M CEFT transfer initiated within 4 minutes of suspicious login', strength: 0.91 },
      { label: 'Behavioral score 61/100 — below 75 baseline for this account', strength: 0.68 },
    ],
    regulatoryContext: 'CBSL Circular No. 2/2025 requires banks to implement enhanced authentication for high-value digital transactions. SIM swap is a rapidly growing fraud vector in South Asian digital banking.',
    recommendedAction: 'Contact account owner via registered alternate channel (not the mobile number). Investigate SIM swap with telco. Reverse CEFT transfer if within dispute window.',
    agentPath: '/agents/digital', exposureLkr: 14800000,
    correlationId: null,
    triggerRule: 'RULE-DIG-005: Impossible travel × MFA pass + unregistered device',
    ruleVersion: 'v2.2.0',
    statusHistory: [
      { status: 'Created', timestamp: '14:06:11', actor: 'SYSTEM', note: 'Digital Agent triggered RULE-DIG-005. Impossible travel confirmed: 18 min Jaffna→Colombo.' },
      { status: 'Assigned', timestamp: '14:06:12', actor: 'SYSTEM', note: 'Auto-assigned to Digital Fraud Team (P1 SLA — 4h).' },
      { status: 'Under Review', timestamp: '14:09:00', actor: 'SYSTEM', note: 'SIM swap investigation initiated with telco. CEFT transfer dispute window active.' },
    ],
    sla: { target_minutes: 240, elapsed_minutes: 24, status: 'Within SLA', target_label: '4 hours' },
    strStatus: null,
    accountStatus: 'Active',
  },
  {
    id: 'alert-007', caseId: 'CASE-008', agent: 'Trade Agent', agentId: 'trade', agentColor: '#3B6D11',
    text: 'NTB-CORP-0887 — Invoice price 91% above HS code benchmark. Over-invoicing / TBML risk.',
    severity: 'high', time: '31m ago',
    title: 'Over-Invoicing Detected — NTB-CORP-0887 (HS 6203)',
    anomalyScore: 0.87,
    methodTag: 'HS Code Price Benchmarking + Duplicate LC Detection',
    howFound: 'The Trade Finance Agent benchmarks each invoice\'s declared unit price against HS code industry medians. For HS 6203 (men\'s woven apparel), global benchmark is USD 18.20/unit. NTB-CORP-0887 declared USD 34.70/unit — 91% premium. Flag threshold is 25%. This customer also has two LC applications (LC-2025-3341 and LC-2025-3687) with overlapping shipment periods for the same HS code — duplicate LC pattern consistent with double-financing.',
    detectionSteps: [
      { title: 'HS code price benchmarking', text: 'Compare declared unit price against HS code benchmark database (sourced from UN COMTRADE, Sri Lanka Customs). Flag any deviation above 25%.', result: 'HS 6203: USD 34.70 declared vs USD 18.20 benchmark (+91%)' },
      { title: 'Duplicate LC detection', text: 'Identify LC applications from the same customer with overlapping shipment_period fields and matching HS codes.', result: '2 overlapping LCs for same HS code — combined LKR 234M' },
      { title: 'FATF counterparty screening', text: 'Flag transactions to counterparties in FATF-identified high-risk jurisdictions for TBML.', result: 'UAE counterparty — elevated TBML risk jurisdiction' },
    ],
    signals: [
      { label: 'Price USD 34.70 vs HS 6203 benchmark USD 18.20 — +91% premium', strength: 0.91 },
      { label: 'Estimated FX extraction via over-invoicing: LKR 187 Mn', strength: 0.87 },
      { label: 'Duplicate LC applications with overlapping shipment periods', strength: 0.82 },
      { label: 'UAE counterparty — elevated TBML risk in FATF typologies', strength: 0.64 },
    ],
    regulatoryContext: 'Trade-Based Money Laundering via over-invoicing involves inflating export values to transfer wealth overseas. FATF TBML Guidance (2020) identifies this as the primary TBML method globally.',
    recommendedAction: 'Suspend LC processing for NTB-CORP-0887. File TBML STR with CBSL FIU. Commission forensic review of 24 months of trade documents.',
    agentPath: '/agents/trade', exposureLkr: 187000000,
    correlationId: 'COR-883',
    triggerRule: 'RULE-TRD-002: Invoice deviation > 25% × Duplicate LC × FATF country',
    ruleVersion: 'v1.5.0',
    statusHistory: [
      { status: 'Created', timestamp: '13:59:22', actor: 'SYSTEM', note: 'Trade Agent flagged NTB-CORP-0887 over-invoicing 91% above HS 6203 benchmark.' },
      { status: 'Assigned', timestamp: '13:59:23', actor: 'SYSTEM', note: 'Auto-assigned to Trade Compliance (P2 SLA — 24h).' },
      { status: 'Under Review', timestamp: '14:05:00', actor: 'SYSTEM', note: 'LC processing suspended. TBML STR assessment underway.' },
    ],
    sla: { target_minutes: 1440, elapsed_minutes: 31, status: 'Within SLA', target_label: '24 hours' },
    strStatus: 'Pending — Under Assessment',
    accountStatus: 'Suspended',
  },
  {
    id: 'alert-008', caseId: 'CASE-010', agent: 'Orchestrator', agentId: 'orchestrator', agentColor: '#534AB7',
    text: 'CORRELATION: BR-14 flagged by 4 agents simultaneously. Combined severity 0.98. Case opened.',
    severity: 'critical', time: '35m ago',
    title: 'Cross-Agent Correlation — BR-14 Insider Fraud (Severity 0.98)',
    anomalyScore: 0.98,
    methodTag: 'Cross-Agent Signal Correlation',
    howFound: 'The Orchestrator receives signal feeds from all 9 domain agents and identifies entities appearing across multiple agents simultaneously. BR-14 appeared in 4 independent signal feeds: Credit (11 override-approved anomalous loans), Internal Controls (SoD violations, STF-1847 87% override concentration), KYC (12.4% gap rate, suspect introducer INT-BR14-007), and Digital Fraud (STF-1847 off-hours document access). Combined severity formula: max(0.94, 0.96) + 0.25 (4+ agents) = 0.98.',
    detectionSteps: [
      { title: 'Signal aggregation', text: 'Collect all orchestrator signals from each agent\'s analysis. Each signal names a shared entity (branch, account, staff, customer).', result: '4 agents independently signalled BR-14 or STF-1847' },
      { title: 'Entity correlation', text: 'Match signals by shared entity ID. Identify entities appearing in 2+ agent signals within the same audit cycle.', result: 'BR-14 and STF-1847 each appear in 4 agent feeds' },
      { title: 'Combined severity scoring', text: 'Combined severity = max individual severity + bonus for multi-agent confirmation (0.15 for 2 agents, 0.25 for 3+ agents). Cap at 1.0.', result: 'max(0.94, 0.96) + 0.25 = 0.98 — case-worthy threshold exceeded' },
    ],
    signals: [
      { label: 'Credit: 11 override-approved anomalous loans at BR-14 — LKR 387 Mn', strength: 0.94 },
      { label: 'Controls: STF-1847 — 4 SoD violations, 87% override concentration', strength: 0.96 },
      { label: 'KYC: 12.4% gap rate, suspect introducer INT-BR14-007', strength: 0.78 },
      { label: 'Digital: STF-1847 off-hours system access, document download', strength: 0.82 },
    ],
    regulatoryContext: 'The convergence of credit anomalies, control failures, KYC gaps and digital evidence at the same branch, all pointing to the same staff member, is the definitive insider-enabled loan fraud pattern. CBSL regulations require notification when a material fraud is identified.',
    recommendedAction: 'Emergency: (1) Suspend STF-1847. (2) Field audit to BR-14 within 48h. (3) Freeze BR-14 credit. (4) Preserve digital evidence. (5) Engage forensic accountants. (6) Notify CBSL.',
    agentPath: '/agents/controls', exposureLkr: 387000000,
    correlationId: 'COR-882',
    triggerRule: 'RULE-ORC-001: Multi-agent combined severity > 0.95',
    ruleVersion: 'v4.0.0',
    statusHistory: [
      { status: 'Created', timestamp: '13:55:44', actor: 'SYSTEM', note: 'Orchestrator correlated 4 agents on BR-14 / STF-1847. Combined severity 0.98.' },
      { status: 'Case Opened', timestamp: '13:55:44', actor: 'SYSTEM', note: 'CASE-001 auto-opened. Assigned to Internal Audit — P1.' },
      { status: 'Escalated', timestamp: '14:00:00', actor: 'SYSTEM', note: 'Notified: Head of Internal Audit, Chief Compliance Officer, CEO.' },
      { status: 'In Progress', timestamp: '14:35:00', actor: 'R.Wijeratne', note: 'Field team deployed to Ratnapura. STF-1847 suspension confirmed.' },
    ],
    sla: { target_minutes: 240, elapsed_minutes: 35, status: 'Within SLA', target_label: '4 hours' },
    strStatus: null,
    accountStatus: 'Active',
  },
];

// ─── ALERT DETAIL DRAWER ──────────────────────────────────────────────────────

const SCORE_ZONES = [
  { from: 0, to: 0.5,  label: 'Normal',   color: '#3B6D11' },
  { from: 0.5, to: 0.65, label: 'Watch',  color: '#EF9F27' },
  { from: 0.65, to: 0.85, label: 'High',  color: '#854F0B' },
  { from: 0.85, to: 1.0,  label: 'Critical', color: '#A32D2D' },
];

function AnomalyGauge({ score, color }) {
  const zone = SCORE_ZONES.find(z => score >= z.from && score < z.to) || SCORE_ZONES[SCORE_ZONES.length - 1];
  const pct = Math.round(score * 100);
  return (
    <div style={{ padding: '16px', background: `${zone.color}08`, border: `1px solid ${zone.color}22`, borderRadius: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-text-3)' }}>Anomaly Score</span>
          <InfoTooltip text="Composite anomaly score from 0.0 to 1.0. Scores above 0.85 are Critical — requiring immediate action. The score reflects how statistically unusual this finding is relative to normal portfolio behaviour." width={260} position="right" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 28, fontWeight: 900, color: zone.color, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{score.toFixed(2)}</span>
          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: `${zone.color}18`, color: zone.color, border: `1px solid ${zone.color}33` }}>{zone.label}</span>
        </div>
      </div>
      {/* Score track */}
      <div style={{ position: 'relative', height: 12, borderRadius: 6, overflow: 'hidden', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
        {SCORE_ZONES.map(z => (
          <div key={z.label} style={{ position: 'absolute', left: `${z.from * 100}%`, width: `${(z.to - z.from) * 100}%`, top: 0, bottom: 0, background: z.color, opacity: 0.15 }} />
        ))}
        <div style={{ position: 'absolute', left: 0, width: `${pct}%`, top: 0, bottom: 0, background: zone.color, borderRadius: 6, opacity: 0.85 }} />
        {[0.5, 0.65, 0.85].map(t => (
          <div key={t} style={{ position: 'absolute', left: `${t * 100}%`, top: 0, bottom: 0, width: 2, background: 'white', opacity: 0.6 }} />
        ))}
        <div style={{ position: 'absolute', left: `calc(${pct}% - 2px)`, top: -2, bottom: -2, width: 4, borderRadius: 2, background: zone.color, boxShadow: `0 0 6px ${zone.color}` }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 9, color: 'var(--color-text-3)' }}>
        <span>0.0 Normal</span><span>0.50</span><span>0.65 High</span><span>0.85 Critical</span><span>1.0</span>
      </div>
    </div>
  );
}

function AlertDrawer({ alert, onClose }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('signals');
  const [disposition, setDisposition] = useState(null);
  const [fpReason, setFpReason] = useState('');
  if (!alert) return null;
  const FP_REASONS = ['Legitimate business explanation provided', 'Model scoring error — insufficient training data', 'One-off seasonal / event-driven pattern', 'Transaction correctly classified post review', 'Data quality issue — source system error', 'Timing difference — not fraud'];

  const isCritical = alert.severity === 'critical';
  const headerBg = isCritical ? '#FEF0F0' : '#FFFBEB';
  const headerBorder = isCritical ? '#FECACA' : '#FDE68A';
  const severityColor = isCritical ? '#DC2626' : '#D97706';

  const tabs = [
    { id: 'signals', label: 'Detection signals' },
    { id: 'method', label: 'How it was found' },
    { id: 'action', label: 'Action required' },
    { id: 'workflow', label: 'Workflow & SLA' },
  ];

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 500, display: 'flex' }} onClick={onClose}>
      <div style={{ flex: 1, background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(2px)' }} />
      <div
        onClick={e => e.stopPropagation()}
        className="animate-slide-in"
        style={{ width: 540, background: 'var(--color-surface)', borderLeft: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', boxShadow: '-12px 0 48px rgba(0,0,0,0.16)', overflowY: 'auto' }}
      >
        {/* Header */}
        <div style={{ padding: '20px 24px', background: headerBg, borderBottom: '1px solid var(--color-border)', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '3px 10px', borderRadius: 20, background: severityColor, color: 'white' }}>
                  {alert.severity}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: `${alert.agentColor}18`, color: alert.agentColor }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: alert.agentColor }} />
                  {alert.agent}
                </span>
                <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--color-text-3)' }}>{alert.time}</span>
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1917', lineHeight: 1.4, marginBottom: 6 }}>{alert.title}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--color-text-3)' }}>
                <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', background: `${alert.agentColor}12`, color: alert.agentColor, borderRadius: 4 }}>{alert.methodTag}</span>
              </div>
            </div>
            <button onClick={onClose} style={{ padding: 6, cursor: 'pointer', color: 'var(--color-text-3)', background: 'rgba(0,0,0,0.05)', border: 'none', borderRadius: 6, flexShrink: 0 }}>
              <X size={16} />
            </button>
          </div>

          {/* Exposure + anomaly score row */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'stretch' }}>
            {alert.exposureLkr > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', background: 'rgba(0,0,0,0.06)', borderRadius: 8, fontSize: 12, fontWeight: 700, color: severityColor, flexShrink: 0 }}>
                <AlertTriangle size={13} />
                LKR {alert.exposureLkr >= 1e9 ? (alert.exposureLkr / 1e9).toFixed(2) + ' Bn' : (alert.exposureLkr / 1e6).toFixed(0) + ' Mn'} exposure
              </div>
            )}
          </div>
        </div>

        {/* Anomaly gauge */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface-2)', flexShrink: 0 }}>
          <AnomalyGauge score={alert.anomalyScore} color={alert.agentColor} />
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', flexShrink: 0 }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{ flex: 1, padding: '11px 8px', fontSize: 12, fontWeight: activeTab === tab.id ? 600 : 400, color: activeTab === tab.id ? alert.agentColor : 'var(--color-text-2)', background: activeTab === tab.id ? `${alert.agentColor}08` : 'transparent', borderBottom: `2px solid ${activeTab === tab.id ? alert.agentColor : 'transparent'}`, border: 'none', cursor: 'pointer', transition: 'all 0.12s' }}>
              {tab.label}
            </button>
          ))}
          <button onClick={() => navigate('/risk-register')} style={{ background: 'var(--color-surface)', color: 'var(--color-text-2)', border: '1px solid var(--color-border)', padding: '5px 14px', borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, marginLeft: 6, opacity: 0.7 }}>
            ⊟ Risk Register
          </button>
        </div>

        {/* Tab content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* ── SIGNALS TAB ── */}
          {activeTab === 'signals' && (
            <>
              <div style={{ fontSize: 12, color: 'var(--color-text-2)', lineHeight: 1.6, padding: '10px 14px', background: `${alert.agentColor}06`, border: `1px solid ${alert.agentColor}18`, borderRadius: 8 }}>
                The bars below show the strength of each individual detection signal. Multiple strong signals converging on the same finding is what elevates the overall anomaly score to {alert.anomalyScore.toFixed(2)}.
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: -4, fontSize: 11, color: 'var(--color-text-3)' }}>
                <span style={{ flex: 1 }}>Signal</span>
                <span style={{ width: 140, textAlign: 'right', paddingRight: 8 }}>Strength indicator</span>
                <span style={{ width: 44, textAlign: 'right' }}>Level</span>
              </div>
              {alert.signals.map((sig, i) => (
                <SignalBar key={i} label={sig.label} strength={sig.strength} index={i} />
              ))}
              <div style={{ display: 'flex', gap: 12, fontSize: 10, color: 'var(--color-text-3)', paddingTop: 4, borderTop: '1px solid var(--color-border)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><div style={{ width: 16, height: 3, background: '#3B6D11', borderRadius: 1 }} />Low &lt;0.6</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><div style={{ width: 16, height: 3, background: '#EF9F27', borderRadius: 1 }} />Elevated 0.6–0.8</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><div style={{ width: 16, height: 3, background: '#A32D2D', borderRadius: 1 }} />Critical &gt;0.8</span>
              </div>
            </>
          )}

          {/* ── METHOD TAB ── */}
          {activeTab === 'method' && (
            <>
              <div style={{ padding: '12px 16px', background: `${alert.agentColor}08`, border: `1px solid ${alert.agentColor}22`, borderRadius: 10, fontSize: 13, color: 'var(--color-text)', lineHeight: 1.8 }}>
                {alert.howFound}
              </div>
              {alert.detectionSteps && (
                <>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-text-3)' }}>Step-by-step detection</div>
                  <DetectionPipeline steps={alert.detectionSteps} color={alert.agentColor} />
                </>
              )}
            </>
          )}

          {/* ── ACTION TAB ── */}
          {activeTab === 'action' && (
            <>
              <InsightBox
                type={isCritical ? 'critical' : 'warning'}
                title="Recommended action"
                body={alert.recommendedAction}
              />
              <InsightBox
                type="regulatory"
                title="Regulatory context"
                body={alert.regulatoryContext}
              />
              <div style={{ padding: '14px 16px', background: 'var(--color-surface-2)', borderRadius: 10, border: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-text-3)', marginBottom: 8 }}>Time sensitivity</div>
                {[
                  { label: isCritical ? 'Immediate (within 4 hours)' : 'Within 24 hours', done: false, urgent: true },
                  { label: 'Open formal case in Case Manager', done: false, urgent: false },
                  { label: 'Assign to responsible function', done: false, urgent: false },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '7px 0', borderBottom: i < 2 ? '1px solid var(--color-border)' : 'none' }}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${item.urgent ? severityColor : 'var(--color-border-strong)'}`, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: item.urgent ? severityColor : 'var(--color-text-2)', fontWeight: item.urgent ? 600 : 400 }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── WORKFLOW TAB ── */}
          {activeTab === 'workflow' && (
            <>
              {/* SLA timer */}
              {alert.sla && (() => {
                const pct = Math.min(100, Math.round((alert.sla.elapsed_minutes / alert.sla.target_minutes) * 100));
                const isBreached = pct >= 100;
                const slaColor = isBreached ? '#DC2626' : pct >= 75 ? '#D97706' : '#16A34A';
                return (
                  <div style={{ padding: '14px 16px', background: `${slaColor}08`, border: `1px solid ${slaColor}22`, borderRadius: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <Clock size={14} style={{ color: slaColor }} />
                        <span style={{ fontSize: 12, fontWeight: 700, color: slaColor }}>SLA Status — {alert.sla.status}</span>
                      </div>
                      <span style={{ fontSize: 11, color: slaColor, fontWeight: 600 }}>{alert.sla.elapsed_minutes}m elapsed of {alert.sla.target_label}</span>
                    </div>
                    <div style={{ height: 8, borderRadius: 4, background: 'rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: slaColor, borderRadius: 4, transition: 'width 0.5s ease' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 10, color: `${slaColor}99` }}>
                      <span>Alert created</span>
                      <span>{pct}% of SLA used</span>
                      <span>Deadline: {alert.sla.target_label}</span>
                    </div>
                  </div>
                );
              })()}

              {/* Correlation group */}
              {alert.correlationId && (
                <div style={{ padding: '12px 14px', background: 'var(--color-purple-light)', border: '1px solid rgba(83,74,183,0.2)', borderRadius: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
                    <GitBranch size={13} style={{ color: 'var(--color-purple)' }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-purple)' }}>Correlation group: {alert.correlationId}</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-2)', lineHeight: 1.6 }}>
                    This alert is part of a multi-agent correlation. {liveAlerts.filter(a => a.correlationId === alert.correlationId && a.id !== alert.id).length} other alert{liveAlerts.filter(a => a.correlationId === alert.correlationId && a.id !== alert.id).length !== 1 ? 's' : ''} share this correlation ID.
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                    {liveAlerts.filter(a => a.correlationId === alert.correlationId && a.id !== alert.id).map(a => (
                      <span key={a.id} style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', background: `${a.agentColor}15`, color: a.agentColor, borderRadius: 4, border: `1px solid ${a.agentColor}30` }}>{a.agent}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Trigger rule */}
              {alert.triggerRule && (
                <div style={{ padding: '10px 14px', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 8 }}>
                  <div style={{ fontSize: 10, color: 'var(--color-text-3)', marginBottom: 4 }}>Trigger rule</div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <code style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text)' }}>{alert.triggerRule}</code>
                    <span style={{ fontSize: 10, color: 'var(--color-text-3)' }}>{alert.ruleVersion}</span>
                  </div>
                </div>
              )}

              {/* Status flags */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {alert.accountStatus && alert.accountStatus !== 'Active' && (
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', background: alert.accountStatus === 'Frozen' ? 'var(--color-red-light)' : '#FFFBEB', color: alert.accountStatus === 'Frozen' ? 'var(--color-red)' : '#854F0B', borderRadius: 6, border: `1px solid ${alert.accountStatus === 'Frozen' ? 'rgba(163,45,45,0.3)' : 'rgba(133,79,11,0.3)'}` }}>
                    Account {alert.accountStatus}
                  </span>
                )}
                {alert.strStatus && (
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', background: '#FFFBEB', color: '#854F0B', borderRadius: 6, border: '1px solid rgba(133,79,11,0.3)' }}>
                    STR: {alert.strStatus}
                  </span>
                )}
              </div>

              {/* False positive disposition */}
              <div style={{ padding:'12px 14px', background:'var(--color-surface-2)', border:'1px solid var(--color-border)', borderRadius:8 }}>
                <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:'var(--color-text-3)', marginBottom:10, display:'flex', alignItems:'center', gap:5 }}>
                  Alert disposition
                  <InfoTooltip text="Every alert must be dispositioned. Confirmed fraud opens a case. False positive dismissals (with mandatory reason code) feed back to improve model calibration and reduce alert fatigue." position="right" width={280}/>
                </div>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                  {[
                    { label:'Confirmed fraud — open case', color:'#DC2626', bg:'#FEF0F0' },
                    { label:'STR-eligible — initiate filing', color:'#D97706', bg:'#FFFBEB' },
                    { label:'False positive — model error', color:'#185FA5', bg:'#EBF4FF' },
                    { label:'False positive — business reason', color:'#185FA5', bg:'#EBF4FF' },
                    { label:'Inconclusive — hold', color:'#9ca3af', bg:'var(--color-surface-2)' },
                  ].map(d => (
                    <button key={d.label}
                      style={{ fontSize:10, fontWeight:600, padding:'5px 10px', borderRadius:6, background:d.bg, color:d.color, border:`1px solid ${d.color}33`, cursor:'pointer' }}
                      onMouseEnter={e=>{e.currentTarget.style.background=d.color;e.currentTarget.style.color='white';}}
                      onMouseLeave={e=>{e.currentTarget.style.background=d.bg;e.currentTarget.style.color=d.color;}}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status timeline */}
              {alert.statusHistory && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-text-3)', marginBottom: 10 }}>Status timeline</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {alert.statusHistory.map((s, i) => (
                      <div key={i} style={{ display: 'flex', gap: 12 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <div style={{ width: 24, height: 24, borderRadius: '50%', background: i === alert.statusHistory.length - 1 ? alert.agentColor : `${alert.agentColor}18`, border: `1.5px solid ${alert.agentColor}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1 }}>
                            <CheckCircle size={12} style={{ color: i === alert.statusHistory.length - 1 ? 'white' : alert.agentColor }} />
                          </div>
                          {i < alert.statusHistory.length - 1 && <div style={{ width: 1.5, flex: 1, background: `${alert.agentColor}22`, minHeight: 12 }} />}
                        </div>
                        <div style={{ paddingBottom: 14, paddingTop: 2, flex: 1 }}>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 3 }}>
                            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text)' }}>{s.status}</span>
                            <span style={{ fontSize: 10, color: 'var(--color-text-3)' }}>{s.timestamp}</span>
                            <span style={{ fontSize: 10, padding: '1px 6px', background: 'var(--color-surface-2)', color: 'var(--color-text-2)', borderRadius: 4 }}>{s.actor}</span>
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--color-text-2)', lineHeight: 1.5 }}>{s.note}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            {/* Disposition */}
              <div style={{ padding:'14px 16px', background:'var(--color-surface-2)', border:'1px solid var(--color-border)', borderRadius:10 }}>
                <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:'var(--color-text-3)', marginBottom:10, display:'flex', alignItems:'center', gap:6 }}>
                  Alert Disposition
                  <InfoTooltip text="Every alert must be formally dispositioned. Confirmed fraud opens a case. False positives must have a reason code — this data feeds model improvement. STR-Eligible triggers the regulatory filing workflow." position="right" width={280} />
                </div>
                {disposition ? (
                  <div style={{ padding:'10px 12px', background: disposition==='Confirmed fraud'?'var(--color-red-light)':disposition==='False positive'?'#F0FDF4':disposition==='STR-Eligible'?'#FFFBEB':'#EBF4FF', borderRadius:8, fontSize:12, color:'var(--color-text)', lineHeight:1.6 }}>
                    <div style={{ fontWeight:700, marginBottom:4 }}>Dispositioned as: {disposition}</div>
                    {fpReason && <div style={{ fontSize:11, color:'var(--color-text-2)' }}>Reason: {fpReason}</div>}
                  </div>
                ) : (
                  <div>
                    <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:8 }}>
                      {['Confirmed fraud','False positive','Inconclusive','STR-Eligible'].map(d => {
                        const col = d==='Confirmed fraud'?'#DC2626':d==='False positive'?'#16A34A':d==='STR-Eligible'?'#D97706':'#185FA5';
                        return <button key={d} onClick={()=>setDisposition(d)} style={{ fontSize:11, padding:'6px 12px', borderRadius:7, border:`1px solid ${col}33`, background:`${col}10`, color:col, cursor:'pointer', fontWeight:600 }}>{d}</button>;
                      })}
                    </div>
                    {disposition==='False positive' && (
                      <select value={fpReason} onChange={e=>setFpReason(e.target.value)}
                        style={{ width:'100%', padding:'7px 9px', fontSize:11, borderRadius:7, border:'1px solid var(--color-border)', background:'var(--color-surface)', color:'var(--color-text)' }}>
                        <option value="">Select reason code…</option>
                        {FP_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--color-border)', display: 'flex', gap: 10, flexShrink: 0, background: 'var(--color-surface)' }}>
          <button onClick={() => navigate(alert.agentPath)} className="btn btn-primary" style={{ background: alert.agentColor, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
            Open {alert.agent} Module <ChevronRight size={15} />
          </button>
          <button onClick={() => navigate('/cases', { state: { caseId: alert?.caseId || null } })} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            Case Manager
          </button>
        </div>
      </div>
    </div>
  );
}


// ─── FINDINGS REGISTER VIEW ──────────────────────────────────────────────────

const ALL_FINDINGS = [
  { id:'F-001', agent:'Insider Risk', agentColor:'#7C3AED', finding:'STF-1847 — All 6 insider dimensions breached simultaneously. Risk score 94/100.', severity:'critical', exposure:'LKR 387M', branch:'BR-14', daysOpen:22, status:'Under Investigation', owner:'R. Wijeratne', type:'Insider Fraud', path:'/agents/insider-risk' },
  { id:'F-002', agent:'Suspense & Reconciliation', agentColor:'#993C1D', finding:'SUS-017 — Phantom receivable. +312% in 30d, clearing ratio 0.08, 94 days aged.', severity:'critical', exposure:'LKR 1.24Bn', branch:'BR-72', daysOpen:22, status:'STR Filed', owner:'MLCO', type:'Fraud', path:'/agents/suspense' },
  { id:'F-003', agent:'Trade Finance & Treasury', agentColor:'#3B6D11', finding:'NTB-CORP-0887 — Over-invoicing 91% above HS 6203 benchmark. Duplicate LC confirmed.', severity:'critical', exposure:'LKR 421M', branch:'BR-16', daysOpen:23, status:'Under Investigation', owner:'D. Rajapaksa', type:'TBML', path:'/agents/trade' },
  { id:'F-004', agent:'MJE Testing', agentColor:'#0891B2', finding:'MJE-2026-4205 — Midnight month-end entry, LKR 120M, zero documents, SoD violation. Score 97/100.', severity:'critical', exposure:'LKR 120M', branch:'All', daysOpen:18, status:'Escalated', owner:'Unassigned', type:'Control Failure', path:'/agents/mje' },
  { id:'F-005', agent:'Internal Controls', agentColor:'#854F0B', finding:'STF-1847 — 4 SoD violations. Same person as maker and approver on 4 disbursements.', severity:'critical', exposure:'LKR 387M', branch:'BR-14', daysOpen:22, status:'Under Investigation', owner:'R. Wijeratne', type:'Control Failure', path:'/agents/controls' },
  { id:'F-006', agent:'Credit Intelligence', agentColor:'#185FA5', finding:'11 override-approved anomalous loans at BR-14. Anomaly scores 0.82–0.94. LKR 387M.', severity:'critical', exposure:'LKR 387M', branch:'BR-14', daysOpen:22, status:'Under Investigation', owner:'R. Wijeratne', type:'Credit Risk', path:'/agents/credit' },
  { id:'F-007', agent:'Transaction Surveillance', agentColor:'#534AB7', finding:'NTB-0841-X — 15 CEFT transfers in 22 min, LKR 4.6M–4.95M each. Structuring score 0.94.', severity:'high', exposure:'LKR 71M', branch:'BR-72', daysOpen:22, status:'STR Pending', owner:'MLCO', type:'AML', path:'/agents/transaction' },
  { id:'F-008', agent:'Digital Fraud & Identity', agentColor:'#993556', finding:'DEV-A4F7-9921 shared across 4 accounts in SUS-017 counterparty network.', severity:'high', exposure:'—', branch:'BR-72', daysOpen:22, status:'Open', owner:'Unassigned', type:'Digital Fraud', path:'/agents/digital' },
  { id:'F-009', agent:'Identity & KYC / AML', agentColor:'#0F6E56', finding:'INT-BR14-007 — 14 of 41 introduced accounts have KYC gaps (34% gap rate).', severity:'high', exposure:'—', branch:'BR-14', daysOpen:34, status:'Open', owner:'Head of KYC', type:'Compliance', path:'/agents/kyc' },
  { id:'F-010', agent:'Internal Controls', agentColor:'#854F0B', finding:'4 branches below 65/100 composite threshold: BR-14 (41), BR-23 (54), BR-11 (58), BR-56 (61).', severity:'high', exposure:'Network-wide', branch:'Multi', daysOpen:22, status:'Open', owner:'Field Audit Team', type:'Control Failure', path:'/agents/controls' },
  { id:'F-011', agent:'Credit Intelligence', agentColor:'#185FA5', finding:'34 loans predicted misstaged. ECL impact if corrected: ~LKR 600M additional provision.', severity:'high', exposure:'LKR 1.10Bn', branch:'Multi', daysOpen:22, status:'Open', owner:'Head of Credit Risk', type:'Credit Risk', path:'/agents/credit' },
  { id:'F-012', agent:'MJE Testing', agentColor:'#0891B2', finding:'Benford first-digit failure: digits 4 & 5 over-represented vs expected. Sub-threshold GL structuring.', severity:'high', exposure:'—', branch:'All', daysOpen:18, status:'Open', owner:'Unassigned', type:'Fraud Pattern', path:'/agents/mje' },
  { id:'F-013', agent:'Identity & KYC / AML', agentColor:'#0F6E56', finding:'KYC gap rate 4.7% (39,290 accounts) — exceeds CBSL 2% threshold. 847 HSBC migration gaps.', severity:'high', exposure:'—', branch:'Network', daysOpen:44, status:'Remediation In Progress', owner:'Head of KYC', type:'Compliance', path:'/agents/kyc' },
  { id:'F-014', agent:'Trade Finance & Treasury', agentColor:'#3B6D11', finding:'LCR declined 37% in FY2025 (320.6% → 203.4%). Trajectory reaches CBSL amber by Q2 2026.', severity:'medium', exposure:'Systemic', branch:'—', daysOpen:37, status:'Resolved — ALCO Action Approved', owner:'CFO', type:'Liquidity Risk', path:'/agents/trade' },
  { id:'F-015', agent:'Insider Risk', agentColor:'#7C3AED', finding:'STF-2341 (BR-23) — score 71/100. Override concentration 52%, off-hours approvals 18%.', severity:'medium', exposure:'—', branch:'BR-23', daysOpen:22, status:'Open', owner:'Unassigned', type:'Insider Risk', path:'/agents/insider-risk' },
  { id:'F-016', agent:'Suspense & Reconciliation', agentColor:'#993C1D', finding:'SUS-031 (BR-16) — LKR 340M, clearing ratio 0.41, 86 days aged. Approaching 90-day CBSL threshold.', severity:'medium', exposure:'LKR 340M', branch:'BR-16', daysOpen:18, status:'Open', owner:'Treasury Ops', type:'Reconciliation', path:'/agents/suspense' },
  { id:'F-017', agent:'Transaction Surveillance', agentColor:'#534AB7', finding:'NTB-2209-F velocity anomaly — 34 txns vs baseline 4 (8.5× above normal). LKR 18.4M.', severity:'medium', exposure:'LKR 18M', branch:'BR-72', daysOpen:22, status:'Open', owner:'AML Analyst', type:'AML', path:'/agents/transaction' },
];

function FindingsRegisterView({ navigate }) {
  const [sevFilter, setSevFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('open');
  const [sortBy, setSortBy] = useState('severity');

  const types = ['all', ...new Set(ALL_FINDINGS.map(f => f.type))];
  const statuses = ['all', 'open', 'in_progress', 'resolved'];

  function statusMatch(f) {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'open') return ['Open', 'Escalated', 'STR Pending', 'Unassigned'].some(s => f.status.includes(s) || f.status === s);
    if (statusFilter === 'in_progress') return f.status.includes('Investigation') || f.status.includes('Remediation') || f.status.includes('Filed');
    if (statusFilter === 'resolved') return f.status.includes('Resolved');
    return true;
  }

  const sevOrder = { critical: 0, high: 1, medium: 2, low: 3 };

  const filtered = ALL_FINDINGS
    .filter(f => (sevFilter === 'all' || f.severity === sevFilter) && (typeFilter === 'all' || f.type === typeFilter) && statusMatch(f))
    .sort((a, b) => {
      if (sortBy === 'severity') return (sevOrder[a.severity] || 3) - (sevOrder[b.severity] || 3);
      if (sortBy === 'age') return b.daysOpen - a.daysOpen;
      if (sortBy === 'exposure') return (b.exposure.replace(/[^0-9.]/g,'') || 0) - (a.exposure.replace(/[^0-9.]/g,'') || 0);
      return 0;
    });

  const openCount = ALL_FINDINGS.filter(f => !f.status.includes('Resolved') && !f.status.includes('Filed')).length;
  const critCount = ALL_FINDINGS.filter(f => f.severity === 'critical').length;
  const overdueCount = ALL_FINDINGS.filter(f => f.daysOpen > 30 && !f.status.includes('Resolved')).length;

  function ageColor(d) { return d > 60 ? '#DC2626' : d > 30 ? '#D97706' : '#16A34A'; }
  function sevColor(s) { return { critical: '#DC2626', high: '#D97706', medium: '#185FA5' }[s] || '#6b6963'; }
  function statusColor(s) {
    if (s.includes('Resolved') || s.includes('Filed')) return '#16A34A';
    if (s.includes('Investigation') || s.includes('Remediation') || s.includes('Progress')) return '#185FA5';
    if (s.includes('Escalated') || s.includes('Pending')) return '#D97706';
    return '#9ca3af';
  }

  return (
    <div>
      {/* Summary strip */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
        {[
          { label:'Total Findings', val:ALL_FINDINGS.length, sub:'This audit cycle', color:'#185FA5' },
          { label:'Open Findings', val:openCount, sub:'Awaiting action or investigation', color:'#D97706' },
          { label:'Critical', val:critCount, sub:'Immediate action required', color:'#DC2626' },
          { label:'Overdue >30 days', val:overdueCount, sub:'Passed standard resolution SLA', color:'#DC2626' },
        ].map((s,i) => (
          <div key={i} style={{ background:'var(--color-surface)', border:'1px solid var(--color-border)', borderRadius:10, padding:'14px 16px', borderTop:`3px solid ${s.color}` }}>
            <div style={{ fontSize:11, color:'var(--color-text-3)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:5 }}>{s.label}</div>
            <div style={{ fontSize:28, fontWeight:800, color:s.color, lineHeight:1, marginBottom:4 }}>{s.val}</div>
            <div style={{ fontSize:11, color:'var(--color-text-2)' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="agent-panel" style={{ overflow:'hidden' }}>
        {/* Toolbar */}
        <div className="agent-panel-header" style={{ flexWrap:'wrap', gap:10 }}>
          <span className="agent-panel-title">Open Findings Register — FY 2025</span>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
            {/* Severity filter */}
            <div style={{ display:'flex', gap:4 }}>
              {['all','critical','high','medium'].map(s => (
                <button key={s} onClick={() => setSevFilter(s)}
                  style={{ padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:sevFilter===s?700:400, background:sevFilter===s?(sevColor(s)||'var(--color-text)'):'var(--color-surface-2)', color:sevFilter===s?'white':'var(--color-text-2)', border:'1px solid var(--color-border)', cursor:'pointer', textTransform:'capitalize' }}>
                  {s}
                </button>
              ))}
            </div>
            {/* Status filter */}
            <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}
              style={{ padding:'4px 8px', fontSize:11, borderRadius:6, border:'1px solid var(--color-border)', background:'var(--color-surface)', color:'var(--color-text)' }}>
              <option value="all">All statuses</option>
              <option value="open">Open / Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
            {/* Type filter */}
            <select value={typeFilter} onChange={e=>setTypeFilter(e.target.value)}
              style={{ padding:'4px 8px', fontSize:11, borderRadius:6, border:'1px solid var(--color-border)', background:'var(--color-surface)', color:'var(--color-text)' }}>
              <option value="all">All types</option>
              {types.filter(t=>t!=='all').map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            {/* Sort */}
            <select value={sortBy} onChange={e=>setSortBy(e.target.value)}
              style={{ padding:'4px 8px', fontSize:11, borderRadius:6, border:'1px solid var(--color-border)', background:'var(--color-surface)', color:'var(--color-text)' }}>
              <option value="severity">Sort: Severity</option>
              <option value="age">Sort: Age (oldest first)</option>
              <option value="exposure">Sort: Exposure</option>
            </select>
            <span style={{ fontSize:11, color:'var(--color-text-3)', marginLeft:4 }}>{filtered.length} findings</span>
          </div>
        </div>

        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:11 }}>
            <thead>
              <tr style={{ background:'var(--color-surface-2)', borderBottom:'2px solid var(--color-border)' }}>
                {['Ref','Agent','Finding','Sev','Exposure','Branch','Age','Status','Owner',''].map(h => (
                  <th key={h} style={{ padding:'9px 10px', textAlign:'left', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--color-text-3)', whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((f,i) => (
                <tr key={f.id} style={{ borderBottom:'1px solid var(--color-border)', background:i%2===0?'transparent':'var(--color-surface-2)' }}
                  onMouseEnter={e=>e.currentTarget.style.background='#EBF4FF'}
                  onMouseLeave={e=>e.currentTarget.style.background=i%2===0?'transparent':'var(--color-surface-2)'}
                >
                  <td style={{ padding:'8px 10px' }}><code style={{ fontSize:10, color:'var(--color-text-3)' }}>{f.id}</code></td>
                  <td style={{ padding:'8px 10px', whiteSpace:'nowrap' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                      <div style={{ width:7, height:7, borderRadius:2, background:f.agentColor, flexShrink:0 }} />
                      <span style={{ fontSize:10, color:f.agentColor, fontWeight:600 }}>{f.agent}</span>
                    </div>
                  </td>
                  <td style={{ padding:'8px 10px', fontSize:11, lineHeight:1.4, maxWidth:320 }}>{f.finding}</td>
                  <td style={{ padding:'8px 10px' }}>
                    <span style={{ fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:4, background:`${sevColor(f.severity)}15`, color:sevColor(f.severity), textTransform:'capitalize' }}>{f.severity}</span>
                  </td>
                  <td style={{ padding:'8px 10px', fontWeight:700, color:'#DC2626', whiteSpace:'nowrap' }}>{f.exposure}</td>
                  <td style={{ padding:'8px 10px' }}><code style={{ fontSize:10, color:'var(--color-text-2)' }}>{f.branch}</code></td>
                  <td style={{ padding:'8px 10px', whiteSpace:'nowrap' }}>
                    <span style={{ fontSize:11, fontWeight:700, color:ageColor(f.daysOpen) }}>{f.daysOpen}d</span>
                  </td>
                  <td style={{ padding:'8px 10px' }}>
                    <span style={{ fontSize:10, fontWeight:600, padding:'2px 7px', borderRadius:4, background:`${statusColor(f.status)}15`, color:statusColor(f.status), whiteSpace:'nowrap' }}>{f.status}</span>
                  </td>
                  <td style={{ padding:'8px 10px', fontSize:11, color:'var(--color-text-2)', whiteSpace:'nowrap' }}>{f.owner}</td>
                  <td style={{ padding:'8px 10px' }}>
                    <button onClick={() => navigate(f.path)} style={{ padding:'3px 9px', fontSize:11, borderRadius:6, background:'var(--color-surface)', border:'1px solid var(--color-border)', cursor:'pointer', color:'var(--color-text-2)', whiteSpace:'nowrap' }}>View →</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding:'10px 16px', borderTop:'1px solid var(--color-border)', background:'var(--color-surface-2)', fontSize:10, color:'var(--color-text-3)', display:'flex', justifyContent:'space-between' }}>
          <span>Age: <span style={{ color:'#16A34A' }}>■</span> &lt;30d &nbsp;<span style={{ color:'#D97706' }}>■</span> 30–60d &nbsp;<span style={{ color:'#DC2626' }}>■</span> &gt;60d — findings requiring action</span>
          <span>Sentinel FY 2025 · 9 Domain Agents · {ALL_FINDINGS.length} total findings this audit cycle</span>
        </div>
      </div>
    </div>
  );
}

// ─── REGULATORY OBLIGATIONS VIEW ──────────────────────────────────────────────

const STR_QUEUE = [
  { id:'STR-001', case:'CASE-001', entity:'STF-1847 / BR-14', grounds:'Insider-enabled loan fraud — SoD violations, fictitious loans, CEFT routing', amount:'LKR 387M', createdDate:'2025-12-20', daysRemaining: -1, status:'Under Assessment', urgency:'critical', fiuRef:null },
  { id:'STR-002', case:'CASE-002', entity:'SUS-017 CEFT Network', grounds:'Phantom receivable scheme — structured CEFT transfers below LKR 5M threshold', amount:'LKR 1.24Bn', createdDate:'2025-12-20', daysRemaining: 0, status:'Filed', urgency:'filed', fiuRef:'FIU-STR-2025-1847' },
  { id:'STR-003', case:'CASE-003', entity:'NTB-CORP-0887', grounds:'Trade-based money laundering — 91% over-invoicing HS 6203, duplicate LCs', amount:'LKR 421M', createdDate:'2025-12-19', daysRemaining: 1, status:'Pending Filing', urgency:'critical', fiuRef:null },
  { id:'STR-004', case:'CASE-004', entity:'NTB-0841-X', grounds:'Structuring — 15 CEFT transactions LKR 4.6M–4.95M within 22 minutes', amount:'LKR 71M', createdDate:'2025-12-20', daysRemaining: 3, status:'Pending Filing', urgency:'high', fiuRef:null },
];

const CBSL_NOTIFICATIONS = [
  { obligation:'Material fraud notification — BR-14 insider fraud (>LKR 250M threshold)', due:'2025-12-27', status:'Pending', urgency:'critical', ref:null },
  { obligation:'CBSL 90-day suspense breach — SUS-017', due:'2025-12-22', status:'Filed', urgency:'filed', ref:'CBSL-NT-2025-0441' },
  { obligation:'Quarterly fraud register submission — Q4 2025', due:'2026-01-15', status:'Pending', urgency:'high', ref:null },
  { obligation:'CBSL FIU STR status update — NTB-CORP-0887', due:'2026-01-05', status:'Pending', urgency:'medium', ref:null },
];

const KYC_REMEDIATION = [
  { category:'PEP accounts — EDD overdue', total:34, complete:8, deadline:'2025-12-31', priority:'critical' },
  { category:'Beneficial ownership gaps — corporate entities', total:234, complete:47, deadline:'2026-02-28', priority:'high' },
  { category:'FATF grey-list country exposure — EDD required', total:18, complete:6, deadline:'2026-01-31', priority:'high' },
  { category:'NIC / identity document expired', total:891, complete:234, deadline:'2026-03-31', priority:'medium' },
  { category:'Dormant account reactivation — KYC refresh', total:1847, complete:312, deadline:'2026-03-31', priority:'medium' },
  { category:'HSBC migration batch — KYC alignment', total:847, complete:0, deadline:'2026-06-30', priority:'high' },
  { category:'Standard KYC gap — periodic refresh overdue', total:36419, complete:4210, deadline:'2026-06-30', priority:'low' },
];

function RegulatoryView({ navigate }) {
  function urgencyColor(u) { return { critical:'#DC2626', high:'#D97706', medium:'#185FA5', filed:'#16A34A', low:'#6b6963' }[u] || '#6b6963'; }
  function urgencyBg(u) { return { critical:'#FEF0F0', high:'#FFFBEB', medium:'#EBF4FF', filed:'#F0FDF4', low:'var(--color-surface-2)' }[u] || 'var(--color-surface-2)'; }

  const pendingSTRs = STR_QUEUE.filter(s => s.status !== 'Filed').length;
  const overdueSTRs = STR_QUEUE.filter(s => s.daysRemaining < 0).length;
  const pendingCBSL = CBSL_NOTIFICATIONS.filter(n => n.status === 'Pending').length;
  const totalKYC = KYC_REMEDIATION.reduce((s, r) => s + r.total, 0);
  const completeKYC = KYC_REMEDIATION.reduce((s, r) => s + r.complete, 0);

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      {/* Summary strip */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
        {[
          { label:'STR Filings Pending', val:pendingSTRs, sub:'Under FTRA — 5 working day limit', color: pendingSTRs > 0 ? '#DC2626' : '#16A34A' },
          { label:'STR Overdue', val:overdueSTRs, sub:'Deadline passed — immediate action', color:'#DC2626' },
          { label:'CBSL Notifications Due', val:pendingCBSL, sub:'Pending formal submission', color: pendingCBSL > 0 ? '#D97706' : '#16A34A' },
          { label:'KYC Remediation', val:`${Math.round((completeKYC/totalKYC)*100)}%`, sub:`${completeKYC.toLocaleString()} of ${totalKYC.toLocaleString()} accounts`, color:'#185FA5' },
        ].map((s,i) => (
          <div key={i} style={{ background:'var(--color-surface)', border:'1px solid var(--color-border)', borderRadius:10, padding:'14px 16px', borderTop:`3px solid ${s.color}` }}>
            <div style={{ fontSize:11, color:'var(--color-text-3)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:5 }}>{s.label}</div>
            <div style={{ fontSize:28, fontWeight:800, color:s.color, lineHeight:1, marginBottom:4 }}>{s.val}</div>
            <div style={{ fontSize:11, color:'var(--color-text-2)' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* STR Queue */}
      <div className="agent-panel" style={{ overflow:'hidden' }}>
        <div className="agent-panel-header">
          <span className="agent-panel-title">STR / SAR Filing Queue — FTRA Obligations</span>
          <div style={{ fontSize:11, color:'var(--color-text-3)' }}>5 working days from identification · Criminal penalties for non-compliance</div>
        </div>
        {STR_QUEUE.map((str, i) => (
          <div key={i} style={{ padding:'14px 18px', borderBottom:'1px solid var(--color-border)', background:urgencyBg(str.urgency) }}>
            <div style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
              <div style={{ flexShrink:0, textAlign:'center', minWidth:60 }}>
                {str.status === 'Filed' ? (
                  <div style={{ fontSize:11, fontWeight:700, color:'#16A34A', padding:'3px 8px', background:'#F0FDF4', borderRadius:6, border:'1px solid rgba(22,163,74,0.2)' }}>FILED</div>
                ) : (
                  <>
                    <div style={{ fontSize:20, fontWeight:900, color:str.daysRemaining < 0 ? '#DC2626' : str.daysRemaining <= 1 ? '#D97706' : '#185FA5', lineHeight:1 }}>
                      {str.daysRemaining < 0 ? `+${Math.abs(str.daysRemaining)}d` : `${str.daysRemaining}d`}
                    </div>
                    <div style={{ fontSize:9, color:'var(--color-text-3)', marginTop:2 }}>{str.daysRemaining < 0 ? 'OVERDUE' : 'remaining'}</div>
                  </>
                )}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:5, flexWrap:'wrap' }}>
                  <span style={{ fontSize:12, fontWeight:700, color:urgencyColor(str.urgency) }}>{str.entity}</span>
                  <code style={{ fontSize:10, color:'var(--color-text-3)' }}>{str.id}</code>
                  <span style={{ fontSize:10, fontWeight:600, padding:'2px 7px', background:`${urgencyColor(str.urgency)}15`, color:urgencyColor(str.urgency), borderRadius:4 }}>{str.status}</span>
                  {str.fiuRef && <span style={{ fontSize:10, color:'#16A34A', fontWeight:600 }}>Ref: {str.fiuRef}</span>}
                </div>
                <div style={{ fontSize:12, color:'var(--color-text-2)', lineHeight:1.5, marginBottom:5 }}>{str.grounds}</div>
                <div style={{ display:'flex', gap:12, fontSize:11, color:'var(--color-text-3)' }}>
                  <span>Amount: <strong style={{ color:'var(--color-text)' }}>{str.amount}</strong></span>
                  <span>Case: <strong style={{ color:'var(--color-text)' }}>{str.case}</strong></span>
                  <span>Identified: <strong style={{ color:'var(--color-text)' }}>{str.createdDate}</strong></span>
                </div>
              </div>
              {str.status !== 'Filed' && (
                <button onClick={() => navigate('/cases', { state: { caseId: str.case } })} style={{ padding:'6px 14px', background:'#DC2626', color:'white', border:'none', borderRadius:8, fontSize:12, fontWeight:700, cursor:'pointer', flexShrink:0, whiteSpace:'nowrap' }}>
                  File STR →
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* CBSL Notifications */}
      <div className="agent-panel" style={{ overflow:'hidden' }}>
        <div className="agent-panel-header">
          <span className="agent-panel-title">CBSL Regulatory Notifications</span>
          <div style={{ fontSize:11, color:'var(--color-text-3)' }}>Banking Act obligations · Board signature required</div>
        </div>
        {CBSL_NOTIFICATIONS.map((n, i) => (
          <div key={i} style={{ padding:'12px 18px', borderBottom:'1px solid var(--color-border)', display:'flex', gap:12, alignItems:'center' }}>
            <div style={{ width:10, height:10, borderRadius:'50%', background:urgencyColor(n.urgency), flexShrink:0 }} />
            <div style={{ flex:1 }}>
              <div style={{ fontSize:12, color:'var(--color-text)', lineHeight:1.4 }}>{n.obligation}</div>
              <div style={{ fontSize:11, color:'var(--color-text-3)', marginTop:3 }}>Due: {n.due}{n.ref ? ` · Ref: ${n.ref}` : ''}</div>
            </div>
            <span style={{ fontSize:11, fontWeight:700, padding:'3px 10px', background:urgencyBg(n.urgency), color:urgencyColor(n.urgency), borderRadius:6, border:`1px solid ${urgencyColor(n.urgency)}30`, whiteSpace:'nowrap' }}>{n.status}</span>
          </div>
        ))}
      </div>

      {/* KYC Remediation Progress */}
      <div className="agent-panel">
        <div className="agent-panel-header">
          <span className="agent-panel-title">KYC Remediation Programme — 39,290 Accounts</span>
          <span style={{ fontSize:11, color:'var(--color-text-3)' }}>{completeKYC.toLocaleString()} complete · {(totalKYC - completeKYC).toLocaleString()} remaining</span>
        </div>
        <div style={{ padding:'4px 0' }}>
          {KYC_REMEDIATION.map((r, i) => {
            const pct = Math.round((r.complete / r.total) * 100);
            const pc = { critical:'#DC2626', high:'#D97706', medium:'#185FA5', low:'#16A34A' }[r.priority];
            return (
              <div key={i} style={{ padding:'12px 18px', borderBottom:'1px solid var(--color-border)' }}>
                <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:6 }}>
                  <span style={{ fontSize:12, color:'var(--color-text)', flex:1, lineHeight:1.4 }}>{r.category}</span>
                  <span style={{ fontSize:11, fontWeight:700, color:pc, whiteSpace:'nowrap' }}>{pct}% complete</span>
                  <span style={{ fontSize:10, color:'var(--color-text-3)', whiteSpace:'nowrap' }}>Due {r.deadline}</span>
                </div>
                <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                  <div style={{ flex:1, height:6, borderRadius:3, background:'var(--color-surface-2)', overflow:'hidden' }}>
                    <div style={{ width:`${pct}%`, height:'100%', background:pc, borderRadius:3, transition:'width 0.5s ease' }} />
                  </div>
                  <span style={{ fontSize:11, color:'var(--color-text-3)', whiteSpace:'nowrap' }}>{r.complete.toLocaleString()} / {r.total.toLocaleString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── KRI TILE ─────────────────────────────────────────────────────────────────



// KRI tile navigation — each KRI routes to the specific case/page
const KRI_ROUTE_FN = (navigate) => ({
  'Stage 3 Ratio':          () => navigate('/cases', { state: { caseId: 'CASE-001', domain: 'credit' } }),
  'LCR (All Currency)':     () => navigate('/agents/trade'),
  'Loan Growth YoY':        () => navigate('/agents/credit'),
  'Network Override Rate':  () => navigate('/cases', { state: { caseId: 'CASE-001', domain: 'controls' } }),
  'KYC Gap Rate':           () => navigate('/cases', { state: { caseId: 'CASE-005', domain: 'kyc' } }),
  'Suspense Aging >30d':    () => navigate('/cases', { state: { caseId: 'CASE-002', domain: 'suspense' } }),
  'Active Fraud Scores >0.8': () => navigate('/heatmap'),
  'Branches Below Threshold': () => navigate('/agents/controls'),
});

const KRI_TOOLTIPS = {
  'Stage 3 Ratio': "SLFRS 9 non-performing loans as % of total portfolio. NTB at 0.91% is the lowest in Sri Lankan banking. Even small staging errors materially change this figure given the LKR 430 Bn portfolio.",
  'LCR (All Currency)': "Liquidity Coverage Ratio — ability to survive a 30-day stress scenario. CBSL minimum: 100%. Declining from 320.6% to 203.4% warrants monitoring. Amber threshold: 250%.",
  'Loan Growth YoY': "NTB grew its loan book 50% in FY2025 — fastest in a decade. Rapid growth creates vintage quality risk as underwriting standards can loosen under volume pressure.",
  'Network Override Rate': "Percentage of credit approvals where standard controls were bypassed. Network average 4.8% is borderline amber; BR-14 at 14.3% is a critical outlier requiring investigation.",
  'KYC Gap Rate': "Percentage of customer accounts with material KYC gaps. 4.7% exceeds the 2% green threshold. 847 gaps relate to the HSBC migration batch due Q2 2026.",
  'Suspense Aging >30d': "Total unreconciled balance in suspense accounts aged over 30 days. LKR 8.42 Bn is elevated; the LKR 3.98 Bn portion aged >90 days constitutes a regulatory breach.",
  'Active Fraud Scores >0.8': "Number of accounts with active anomaly scores above 0.8 — the high-risk threshold. Includes 4 STR-eligible accounts requiring CBSL FIU notification.",
  'Branches Below Threshold': "Number of branches with composite control score below 65/100. BR-14 at 41/100 has confirmed insider fraud indicators requiring immediate field audit.",
};

function KRITile({ data, onClick, tooltipText }) {
  return (
    <div className={`kri-tile ${data.status}`} onClick={onClick} style={{ cursor: 'pointer' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
        <div className="kri-label">{data.label}</div>
        {tooltipText && <InfoTooltip text={tooltipText} position="bottom" width={260} />}
      </div>
      <div className="kri-value">{data.value}</div>
      <div className="kri-note">{data.note}</div>
      <div className={`kri-trend ${data.status === 'red' || (data.status === 'amber' && data.trend.startsWith('↓')) ? 'down' : 'up-good'}`}>{data.trend}</div>
    </div>
  );
}

const agentStatuses = [
  { name: 'Credit Intelligence', findings: 89, critical: 12, color: '#185FA5', path: '/agents/credit' },
  { name: 'Transaction Surveillance', findings: 847, critical: 4, color: '#534AB7', path: '/agents/transaction' },
  { name: 'Suspense & Reconciliation', findings: 46, critical: 3, color: '#993C1D', path: '/agents/suspense' },
  { name: 'Identity & KYC / AML', findings: 39290, critical: 7, color: '#0F6E56', path: '/agents/kyc' },
  { name: 'Internal Controls', findings: 7, critical: 2, color: '#854F0B', path: '/agents/controls' },
  { name: 'Digital Fraud & Identity', findings: 312, critical: 23, color: '#993556', path: '/agents/digital' },
  { name: 'Trade Finance & Treasury', findings: 6, critical: 1, color: '#3B6D11', path: '/agents/trade' },
  { name: 'Insider Risk', findings: 12, critical: 2, color: '#7C3AED', path: '/agents/insider-risk' },
  { name: 'MJE Testing', findings: 847, critical: 5, color: '#0891B2', path: '/agents/mje' },
];

const branchData = [
  { name: 'BR-14', score: 41 }, { name: 'BR-23', score: 54 }, { name: 'BR-11', score: 58 },
  { name: 'BR-56', score: 61 }, { name: 'BR-41', score: 74 }, { name: 'BR-16', score: 78 }, { name: 'BR-75', score: 82 },
];

// ─── MAIN ─────────────────────────────────────────────────────────────────────

export default function CommandCentre() {
  const navigate = useNavigate();
  const orchData = demoData.orchestrator;
  const [alertCount, setAlertCount] = useState(5); // 5 live alerts
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [ccView, setCcView] = useState('overview'); // 'overview' | 'executive'
  const [execTab, setExecTab] = useState('regulatory'); // 'regulatory' | 'roi' | 'appetite'

  useEffect(() => {
    // Alert count is static — derived from actual liveAlerts
    setAlertCount(liveAlerts.length);
  }, []);

  return (
    <div style={{ maxWidth: 1440 }}>
      {selectedAlert && <AlertDrawer alert={selectedAlert} onClose={() => setSelectedAlert(null)} />}

      {/* View switcher */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, alignItems: 'center' }}>
        {[['overview','Overview'], ['regulatory','Regulatory'], ['executive','Executive Dashboard']].map(([v, l]) => (
          <button key={v} onClick={() => setCcView(v)} className="btn btn-sm"
            style={{ background: ccView === v ? 'var(--color-text)' : 'var(--color-surface)', color: ccView === v ? 'white' : 'var(--color-text-2)', border: '1px solid var(--color-border)', fontWeight: ccView === v ? 600 : 400 }}>
            {l}
          </button>
        ))}
        <button onClick={() => navigate('/risk-register')}
          style={{ marginLeft: 'auto', fontSize: 11, padding: '4px 12px', borderRadius: 6, border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-text-2)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
          ⊟ Risk Register
        </button>
        {ccView === 'executive' && (
          <div style={{ display: 'flex', gap: 6, marginLeft: 16 }}>
            {[['regulatory','Regulatory Ratios'],['roi','AI ROI'],['appetite','Risk Appetite'],['narrative','Connected Narrative']].map(([v,l]) => (
              <button key={v} onClick={() => setExecTab(v)}
                style={{ fontSize: 11, padding: '4px 12px', borderRadius: 6, border: execTab === v ? '1px solid #3B6D11' : '1px solid var(--color-border)', background: execTab === v ? '#3B6D11' : 'transparent', color: execTab === v ? 'white' : 'var(--color-text-2)', cursor: 'pointer', fontWeight: execTab === v ? 600 : 400 }}>
                {l}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── EXECUTIVE VIEW ── */}
      {ccView === 'executive' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Regulatory Ratios */}
          {execTab === 'regulatory' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
                {[
                  { label: 'Tier 1 CAR', value: '19.06%', sub: 'CBSL min: 11.5%', color: '#3B6D11', good: true },
                  { label: 'LCR (All Currency)', value: '203.4%', sub: '↓ from 320.6% — watch trend', color: '#EF9F27', good: false },
                  { label: 'NSFR', value: '138.3%', sub: 'CBSL min: 100% — stable', color: '#3B6D11', good: true },
                  { label: 'Stage 3 Ratio', value: '0.91%', sub: 'Lowest in Sri Lankan industry', color: '#3B6D11', good: true },
                ].map((s,i) => (
                  <div key={i} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 10, padding: '14px 16px', borderTop: `3px solid ${s.color}` }}>
                    <div style={{ fontSize: 11, color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{s.label}</div>
                    <div style={{ fontSize: 26, fontWeight: 800, color: s.color, lineHeight: 1, marginBottom: 4 }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-2)' }}>{s.sub}</div>
                  </div>
                ))}
              </div>
              <div className="agent-panel">
                <div className="agent-panel-header">
                  <span className="agent-panel-title">CAR · LCR · NSFR — 8-Quarter Trend</span>
                  <span style={{ fontSize: 11, color: 'var(--color-text-3)' }}>Q1 2024 → Q4 2025</span>
                </div>
                <div style={{ padding: '16px' }}>
                  <div style={{ padding: '10px 14px', background: 'var(--color-amber-light)', border: '1px solid rgba(133,79,11,0.2)', borderRadius: 8, fontSize: 12, color: 'var(--color-amber)', marginBottom: 16 }}>
                    ⚠ LCR has declined 37% over FY2025 (320.6% → 203.4%) driven by 50% loan growth outpacing the stable deposit base. At current trajectory, LCR approaches the 150% amber threshold in Q2 2026. ALCO action required.
                  </div>
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={executiveData.regulatory_trend} margin={{ top: 4, right: 16, bottom: 4, left: -16 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                      <XAxis dataKey="q" tick={{ fontSize: 10 }} />
                      <YAxis yAxisId="left" domain={[10, 25]} tick={{ fontSize: 10 }} unit="%" />
                      <YAxis yAxisId="right" orientation="right" domain={[100, 360]} tick={{ fontSize: 10 }} unit="%" />
                      <Tooltip contentStyle={{ fontSize: 11 }} />
                      <ReferenceLine yAxisId="left" y={11.5} stroke="#A32D2D" strokeDasharray="4 3" label={{ value: 'CAR min 11.5%', fontSize: 9, fill: '#A32D2D' }} />
                      <ReferenceLine yAxisId="right" y={100} stroke="#A32D2D" strokeDasharray="4 3" label={{ value: 'LCR min 100%', fontSize: 9, fill: '#A32D2D' }} />
                      <ReferenceLine yAxisId="right" y={150} stroke="#EF9F27" strokeDasharray="3 3" label={{ value: 'LCR amber 150%', fontSize: 9, fill: '#EF9F27' }} />
                      <Line yAxisId="left" type="monotone" dataKey="car" stroke="#185FA5" strokeWidth={2.5} name="CAR %" dot={{ r: 3 }} />
                      <Line yAxisId="right" type="monotone" dataKey="lcr" stroke="#EF9F27" strokeWidth={2.5} name="LCR %" dot={{ r: 3 }} />
                      <Line yAxisId="right" type="monotone" dataKey="nsfr" stroke="#3B6D11" strokeWidth={2} name="NSFR %" dot={{ r: 3 }} strokeDasharray="5 3" />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* AI ROI */}
          {execTab === 'roi' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
                {[
                  { label: 'Alerts Auto-Resolved', value: executiveData.ai_roi.alerts_auto_resolved.toLocaleString(), sub: 'No analyst intervention needed', color: '#3B6D11' },
                  { label: 'Analyst Hours Saved', value: executiveData.ai_roi.analyst_hours_saved.toLocaleString(), sub: 'vs manual review baseline', color: '#185FA5' },
                  { label: 'Fraud Detected', value: `LKR ${(executiveData.ai_roi.fraud_detected_lkr/1e9).toFixed(1)} Bn`, sub: 'Total value of confirmed fraud cases', color: '#A32D2D' },
                  { label: 'Avg Detection Time', value: `${executiveData.ai_roi.avg_detection_time_minutes} min`, sub: `vs ${executiveData.ai_roi.manual_baseline_minutes} min manual baseline`, color: '#854F0B' },
                ].map((s,i) => (
                  <div key={i} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 10, padding: '14px 16px', borderTop: `3px solid ${s.color}` }}>
                    <div style={{ fontSize: 11, color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{s.label}</div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: s.color, lineHeight: 1, marginBottom: 4 }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-2)' }}>{s.sub}</div>
                  </div>
                ))}
              </div>
              <div className="agent-panel">
                <div className="agent-panel-header">
                  <span className="agent-panel-title">Monthly Savings (LKR Mn) — Jul 2025 to Apr 2026</span>
                </div>
                <div style={{ padding: '16px' }}>
                  <ResponsiveContainer width="100%" height={240}>
                    <AreaChart data={executiveData.ai_roi.monthly_savings} margin={{ top: 4, right: 16, bottom: 4, left: -16 }}>
                      <defs>
                        <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B6D11" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#3B6D11" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                      <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} unit=" Mn" />
                      <Tooltip formatter={(v) => [`LKR ${v} Mn`, 'Monthly savings']} contentStyle={{ fontSize: 11 }} />
                      <Area type="monotone" dataKey="savings" stroke="#3B6D11" strokeWidth={2.5} fill="url(#savingsGrad)" name="Savings (LKR Mn)" />
                    </AreaChart>
                  </ResponsiveContainer>
                  <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginTop: 10, fontSize: 11, color: 'var(--color-text-2)' }}>
                    <span>False positive rate: <strong style={{ color: '#3B6D11' }}>{executiveData.ai_roi.false_positive_rate}%</strong></span>
                    <span>Speed advantage: <strong style={{ color: '#185FA5' }}>{Math.round(executiveData.ai_roi.manual_baseline_minutes / executiveData.ai_roi.avg_detection_time_minutes)}× faster</strong> than manual review</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Risk Appetite */}
          {execTab === 'appetite' && (
            <div className="agent-panel">
              <div className="agent-panel-header">
                <span className="agent-panel-title">Risk Appetite Dashboard — Actual vs Approved Limits</span>
                <span style={{ fontSize: 11, color: 'var(--color-text-3)' }}>FY 2025 Q4 Actuals</span>
              </div>
              <div style={{ padding: '16px' }}>
                <div style={{ padding: '10px 14px', background: 'var(--color-surface-2)', borderRadius: 8, fontSize: 12, color: 'var(--color-text-2)', marginBottom: 16 }}>
                  Each metric shows the current actual against the Board-approved risk appetite limit. Green = within limit. Amber = approaching limit (within 15%). Red = limit breached.
                </div>
                {executiveData.risk_appetite.map((r, i) => {
                  const higherGood = r.higher_is_better;
                  const pct = higherGood
                    ? Math.min(100, Math.round((r.limit / r.actual) * 100))
                    : Math.min(100, Math.round((r.actual / (r.limit > 0 ? r.limit : 1)) * 100));
                  const color = r.status === 'green' ? '#3B6D11' : r.status === 'amber' ? '#EF9F27' : '#DC2626';
                  return (
                    <div key={i} style={{ marginBottom: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                        <span style={{ fontSize: 13, fontWeight: 500 }}>{r.metric}</span>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                          {r.limit > 0 && <span style={{ fontSize: 11, color: 'var(--color-text-3)' }}>Limit: {r.limit}{r.unit}</span>}
                          <span style={{ fontSize: 14, fontWeight: 800, color }}>{r.actual}{r.unit}</span>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', background: `${color}15`, color, borderRadius: 10, border: `1px solid ${color}30` }}>
                            {r.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div style={{ height: 8, borderRadius: 4, background: 'var(--color-surface-2)', overflow: 'hidden', position: 'relative' }}>
                        <div style={{ width: `${higherGood ? Math.min(100,(r.actual/r.limit)*100) : pct}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 0.5s ease' }} />
                        {r.limit > 0 && !higherGood && (
                          <div style={{ position: 'absolute', left: '100%', top: -2, bottom: -2, width: 2, background: '#A32D2D', transform: 'translateX(-2px)' }} />
                        )}
                      </div>
                      {r.status === 'red' && !higherGood && (
                        <div style={{ fontSize: 10, color: '#DC2626', marginTop: 3, fontWeight: 600 }}>⚠ Limit breached — {Math.round((r.actual/(r.limit||1)-1)*100)}% above limit</div>
                      )}
                      {r.status === 'amber' && (
                        <div style={{ fontSize: 10, color: '#D97706', marginTop: 3 }}>Approaching limit — monitor closely</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Connected risk narrative — always visible in executive view */}
          <div className="agent-panel">
            <div className="agent-panel-header">
              <span className="agent-panel-title">Connected Risk Narrative — How These Risks Are Linked</span>
              <InfoTooltip text="The macro ratios and micro findings in this dashboard are not independent events. They are causally connected — this narrative explains the chain." position="bottom" width={300}/>
            </div>
            <div style={{ padding:'16px 20px' }}>
              <div style={{ display:'flex', gap:0, alignItems:'stretch', overflowX:'auto' }}>
                {[
                  { step:'50% loan growth', detail:'LKR 143 Bn new origination in FY2025 — highest in NTB history', color:'#185FA5', icon:'📈' },
                  { step:'Branch approval pressure', detail:'Volume pressure led to override rate rising from 3.1% to 4.8% across the network', color:'#854F0B', icon:'⚠' },
                  { step:'Control environment failure', detail:'BR-14 override rate reaches 14.3%. STF-1847 accounts for 87% of branch overrides', color:'#854F0B', icon:'⚙' },
                  { step:'Insider fraud enabled', detail:'STF-1847 approves 11 anomalous loans LKR 387M. 4 SoD violations. Risk score 94/100', color:'#7C3AED', icon:'👤' },
                  { step:'Book inflation + ECL gap', detail:'Fictitious/inflated loans inflate loan book. Stage 3 ratio understated. LKR 1.1 Bn ECL gap', color:'#DC2626', icon:'📋' },
                  { step:'LCR deterioration', detail:'Inflated loan book + rapid growth depletes liquid assets. LCR: 320.6% → 203.4% (-37%)', color:'#D97706', icon:'💧' },
                ].map((node, i, arr) => (
                  <div key={i} style={{ display:'flex', alignItems:'stretch', flexShrink:0 }}>
                    <div style={{ padding:'14px 16px', background:`${node.color}08`, border:`1px solid ${node.color}25`, borderRadius:10, minWidth:160, maxWidth:180 }}>
                      <div style={{ fontSize:18, marginBottom:6 }}>{node.icon}</div>
                      <div style={{ fontSize:12, fontWeight:700, color:node.color, marginBottom:4, lineHeight:1.3 }}>{node.step}</div>
                      <div style={{ fontSize:11, color:'var(--color-text-2)', lineHeight:1.5 }}>{node.detail}</div>
                    </div>
                    {i < arr.length - 1 && (
                      <div style={{ display:'flex', alignItems:'center', padding:'0 6px', flexShrink:0 }}>
                        <div style={{ fontSize:16, color:'var(--color-text-3)' }}>→</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div style={{ marginTop:14, padding:'10px 14px', background:'var(--color-amber-light)', border:'1px solid rgba(133,79,11,0.2)', borderRadius:8, fontSize:12, color:'var(--color-amber)', lineHeight:1.7 }}>
                <strong>Audit opinion:</strong> All six risk signals in this dashboard — LCR decline, loan growth, override rate, insider fraud, ECL understatement, and CEFT structuring — are manifestations of the same underlying dynamic: aggressive growth without proportionate control investment. The Board should treat these as a single systemic risk, not six separate findings.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── OVERVIEW VIEW ── */}
      {ccView === 'overview' && <>

      {/* KRI Tiles */}
      <div className="cc-grid">
        {Object.values(kpiData).map((kri, i) => (
          <KRITile key={i} data={kri} tooltipText={KRI_TOOLTIPS[kri.label]} onClick={() => { const fn = KRI_ROUTE_FN(navigate)[kri.label]; fn ? fn() : navigate('/command-centre'); }} />
        ))}
      </div>

      {/* Connected Risk Narrative — always visible on overview */}
      <div className="agent-panel" style={{ marginBottom: 0 }}>
        <div className="agent-panel-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="agent-panel-title">Connected Risk Narrative</span>
            <InfoTooltip text="These six risk signals are not independent events. They are causally linked — a single dynamic driving multiple indicator failures simultaneously. Understanding the connection is essential for the Board response." position="bottom" width={320} />
          </div>
          <span style={{ fontSize: 11, color: 'var(--color-amber)', fontWeight: 600 }}>All six connected</span>
        </div>
        <div style={{ padding: '12px 16px', overflowX: 'auto' }}>
          <div style={{ display: 'flex', gap: 0, alignItems: 'stretch', minWidth: 900 }}>
            {[
              { step: '50% loan growth', detail: 'LKR 143 Bn new origination — highest in NTB history', color: '#185FA5', icon: '📈', agent: 'Credit Agent', path: '/agents/credit' },
              { step: 'Branch approval pressure', detail: 'Override rate: 3.1% → 4.8% network-wide. BR-14 at 14.3%', color: '#854F0B', icon: '⚠', agent: 'Controls Agent', path: '/agents/controls' },
              { step: 'Control environment failure', detail: '4 SoD violations. STF-1847: 87% override concentration at BR-14', color: '#854F0B', icon: '⚙', agent: 'Insider Risk Agent', path: '/agents/insider-risk' },
              { step: 'Insider fraud confirmed', detail: 'STF-1847 score 94/100. 11 anomalous loans LKR 387M fabricated or inflated', color: '#7C3AED', icon: '👤', agent: 'Credit + MJE Agent', path: '/cases', caseId: 'CASE-001' },
              { step: 'ECL understatement', detail: 'Stage 3 ratio understated. LKR 1.1 Bn ECL provisioning gap', color: '#DC2626', icon: '📋', agent: 'MJE Agent', path: '/agents/mje' },
              { step: 'LCR deterioration', detail: 'Loan book inflation + rapid growth depletes HQLA. 320.6% → 203.4%', color: '#D97706', icon: '💧', agent: 'Trade Agent', path: '/agents/trade' },
            ].map((node, i, arr) => (
              <div key={i} style={{ display: 'flex', alignItems: 'stretch', flexShrink: 0 }}>
                <div onClick={() => node.caseId ? navigate(node.path, { state: { caseId: node.caseId } }) : navigate(node.path)}
                  style={{ padding: '12px 14px', background: `${node.color}08`, border: `1px solid ${node.color}22`, borderRadius: 10, minWidth: 148, maxWidth: 160, cursor: 'pointer', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = `${node.color}18`}
                  onMouseLeave={e => e.currentTarget.style.background = `${node.color}08`}>
                  <div style={{ fontSize: 16, marginBottom: 5 }}>{node.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: node.color, marginBottom: 3, lineHeight: 1.3 }}>{node.step}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-2)', lineHeight: 1.5, marginBottom: 5 }}>{node.detail}</div>
                  <div style={{ fontSize: 10, color: node.color + '88', fontStyle: 'italic' }}>{node.agent}</div>
                </div>
                {i < arr.length - 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', padding: '0 4px', color: 'var(--color-text-3)', fontSize: 18, flexShrink: 0 }}>→</div>
                )}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 10, fontSize: 12, color: 'var(--color-amber)', padding: '8px 12px', background: 'var(--color-amber-light)', borderRadius: 8, lineHeight: 1.6 }}>
            <strong>Audit opinion:</strong> All six KRI movements are manifestations of the same underlying dynamic — aggressive growth without proportionate control investment. The Board should treat this as a single systemic risk requiring a unified response, not six separate findings.
          </div>
        </div>
      </div>

      <div className="cc-main">
        <div className="cc-left">
          {/* Cross-agent correlations */}
          <div className="agent-panel">
            <div className="agent-panel-header" style={{ background: 'var(--color-purple-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <GitMerge size={15} style={{ color: 'var(--color-purple)' }} />
                <span className="agent-panel-title" style={{ color: 'var(--color-purple)' }}>Cross-Agent Correlations</span>
                <InfoTooltip text="When 2+ agents independently flag the same entity (branch, account, staff member), the Orchestrator generates a cross-domain correlation. The combined severity score is higher than any individual agent finding because multi-agent confirmation is statistically powerful." position="bottom" width={300} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, background: 'var(--color-purple)', color: 'white', padding: '2px 8px', borderRadius: 10 }}>
                {orchData.correlations.length} active
              </span>
            </div>
            <div>
              {orchData.correlations.map((corr, i) => (
                <div key={i} onClick={() => {
                    const caseMap = {'CORR-001':'CASE-001','CORR-002':'CASE-002','CORR-003':'CASE-003'};
                    navigate('/cases', { state: { caseId: caseMap[corr.id] || null } });
                  }}
                  style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-border)', cursor: 'pointer', transition: 'background 0.12s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8 }}>
                    <div style={{ padding: '4px 8px', borderRadius: 6, fontSize: 13, fontWeight: 800, color: corr.combined_severity >= 0.95 ? 'var(--color-red)' : 'var(--color-amber)', background: corr.combined_severity >= 0.95 ? 'var(--color-red-light)' : 'var(--color-amber-light)', flexShrink: 0 }}>
                      {(corr.combined_severity * 100).toFixed(0)}%
                    </div>
                    <span style={{ fontSize: 10, color: 'var(--color-text-3)', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 3 }}>
                      {({'CORR-001':'CASE-001','CORR-002':'CASE-002','CORR-003':'CASE-003'})[corr.id] || ''} Open case →
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{corr.fraud_type_suspected}</div>
                      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                        {corr.agents_involved.map(a => (
                          <span key={a} style={{ fontSize: 10, padding: '1px 6px', background: 'var(--color-purple-light)', color: 'var(--color-purple)', borderRadius: 4 }}>{a}</span>
                        ))}
                      </div>
                    </div>
                    {corr.case_worthy && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', background: 'var(--color-red)', color: 'white', borderRadius: 4, flexShrink: 0 }}>CASE</span>}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-2)', lineHeight: 1.5 }}>
                    {corr.narrative.substring(0, 160)}…
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Branch risk chart */}
          <div className="agent-panel">
            <div className="agent-panel-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="agent-panel-title">Branch Control Risk Scores</span>
                <InfoTooltip text="Each branch scored 0–100 on 6 dimensions: override frequency (25%), SoD violations (20%), approval turnaround (15%), off-hours approvals (15%), approver concentration (15%), temporal clustering (10%). Below 65 = audit threshold. Lower = higher risk." position="bottom" width={320} />
              </div>
              <span style={{ fontSize: 11, color: 'var(--color-text-3)' }}>65 = audit threshold</span>
            </div>
            <div style={{ padding: '16px 8px 8px' }}>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={branchData} margin={{ top: 0, right: 8, bottom: 0, left: -20 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => [`${v}/100`, 'Score']} labelFormatter={l => `Branch ${l}`} />
                  <Bar dataKey="score" radius={[4, 4, 0, 0]} label={{ position: 'top', fontSize: 10, fill: '#6b6963' }}>
                    {branchData.map((d, i) => (
                      <Cell key={i} fill={d.score < 50 ? '#A32D2D' : d.score < 65 ? '#EF9F27' : '#3B6D11'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', gap: 14, justifyContent: 'center', marginTop: 8, fontSize: 11, color: 'var(--color-text-2)' }}>
                {[['#A32D2D','Critical <50'],['#EF9F27','Amber 50–65'],['#3B6D11','Good >65']].map(([c,l]) => (
                  <span key={l} style={{ display:'flex', alignItems:'center', gap:4 }}><span style={{ width:8, height:8, borderRadius:2, background:c, display:'inline-block' }}/>{l}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Priority actions */}
          <div className="agent-panel">
            <div className="agent-panel-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="agent-panel-title">Priority Actions — Orchestrator</span>
                <InfoTooltip text="Actions ranked by combined severity and urgency across all agent findings. Generated by the Executive Orchestrator after correlating all agent signals." position="bottom" width={260} />
              </div>
            </div>
            <div>
              {orchData.priority_actions.map((action, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 16px', borderBottom: '1px solid var(--color-border)', alignItems: 'flex-start' }}>
                  <div style={{ width: 26, height: 26, borderRadius: 6, background: i === 0 ? 'var(--color-red-light)' : 'var(--color-amber-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: i === 0 ? 'var(--color-red)' : 'var(--color-amber)', flexShrink: 0 }}>
                    {action.rank}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 4, lineHeight: 1.5 }}>{action.action}</div>
                    <div style={{ display: 'flex', gap: 10, fontSize: 11, color: 'var(--color-text-2)', flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Clock size={10} />{action.urgency.replace(/_/g, ' ')}</span>
                      <span>→ {action.responsible_function}</span>
                      {action.estimated_exposure_lkr > 0 && <span style={{ color: 'var(--color-red)', fontWeight: 600 }}>LKR {(action.estimated_exposure_lkr/1e9).toFixed(2)} Bn</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="cc-right">
          {/* Live alert feed */}
          <div className="agent-panel">
            <div className="agent-panel-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="dot dot-red dot-pulse" />
                <span className="agent-panel-title">Live Alert Feed</span>
                <InfoTooltip text="Real-time agent findings. Click any alert to open a full breakdown: anomaly score gauge, signal strength bars for each detection signal, step-by-step detection methodology, regulatory context, and recommended action." position="bottom" width={280} />
              </div>
              <span style={{ fontSize: 11, color: 'var(--color-text-3)', fontVariantNumeric: 'tabular-nums' }}>{alertCount} today</span>
            </div>
            <div style={{ maxHeight: 460, overflowY: 'auto' }}>
              {liveAlerts.map((alert, i) => (
                <div key={i} onClick={() => setSelectedAlert(alert)}
                  style={{ padding: '11px 14px', borderBottom: '1px solid var(--color-border)', display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer', transition: 'background 0.12s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div className={`dot ${alert.severity === 'critical' ? 'dot-red' : 'dot-amber'}`}
                    style={{ marginTop: 4, flexShrink: 0, ...(alert.severity === 'critical' ? { animation: 'pulse 1.5s ease-in-out infinite' } : {}) }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: alert.agentColor, marginBottom: 2 }}>{alert.agent}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text)', lineHeight: 1.5 }}>{alert.text}</div>
                    {/* Mini score bar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 5 }}>
                      <div style={{ flex: 1, height: 3, borderRadius: 2, background: 'var(--color-surface-2)', overflow: 'hidden' }}>
                        <div style={{ width: `${alert.anomalyScore * 100}%`, height: '100%', background: alert.anomalyScore >= 0.85 ? '#A32D2D' : '#EF9F27', borderRadius: 2 }} />
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 700, color: alert.anomalyScore >= 0.85 ? 'var(--color-red)' : 'var(--color-amber)', fontVariantNumeric: 'tabular-nums', minWidth: 28 }}>{alert.anomalyScore.toFixed(2)}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'flex-end', flexShrink: 0 }}>
                    <span style={{ fontSize: 10, color: 'var(--color-text-3)', whiteSpace: 'nowrap' }}>{alert.time}</span>
                    <ChevronRight size={12} style={{ color: 'var(--color-text-3)' }} />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: '10px 14px', borderTop: '1px solid var(--color-border)', background: 'var(--color-surface-2)', fontSize: 11, color: 'var(--color-text-3)', textAlign: 'center' }}>
              Click any alert · Score gauge + signal bars + detection steps + action →
            </div>
          </div>

          {/* Agent status */}
          <div className="agent-panel">
            <div className="agent-panel-header">
              <span className="agent-panel-title">Agent Status</span>
              <span style={{ fontSize: 11, color: 'var(--color-green)', fontWeight: 600 }}>● 7 running</span>
            </div>
            <div>
              {agentStatuses.map((agent, i) => (
                <div key={i} onClick={() => navigate(agent.path)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderBottom: '1px solid var(--color-border)', cursor: 'pointer', transition: 'background 0.12s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: agent.color, flexShrink: 0 }} />
                  <div style={{ flex: 1, fontSize: 12 }}>{agent.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-2)' }}>{agent.findings.toLocaleString()}</div>
                  {agent.critical > 0 && (
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', background: 'var(--color-red-light)', color: 'var(--color-red)', borderRadius: 4 }}>{agent.critical}</span>
                  )}
                  <ChevronRight size={12} style={{ color: 'var(--color-text-3)', flexShrink: 0 }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
    }

      {/* ── FINDINGS REGISTER VIEW ── */}

      {/* ── REGULATORY VIEW ── */}
      {ccView === 'regulatory' && <RegulatoryView navigate={navigate} />}
    </div>
  );
}

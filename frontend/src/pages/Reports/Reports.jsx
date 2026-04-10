import React, { useState, useRef } from 'react';
import { FileText, Download, AlertTriangle, TrendingDown, ShieldCheck, BarChart3, ChevronRight, User, BookOpen } from 'lucide-react';
import { demoData, kpiData } from '../../data/demoData.js';
import InfoTooltip from '../../components/shared/InfoTooltip.jsx';

const TODAY = '31 December 2025';
const PERIOD = 'Year ended 31 December 2025';

const REPORTS = [
  { id:'board', title:'Board Audit Committee Report', subtitle:'Audit opinion, all 9 agent findings, KRI dashboard, management action plan', icon:ShieldCheck, color:'#534AB7', category:'Executive', pages:16 },
  { id:'credit', title:'SLFRS 9 Staging Review', subtitle:'Full staging analysis, vintage cohort report, sector concentration, ECL impact', icon:BarChart3, color:'#185FA5', category:'Credit', pages:9 },
  { id:'aml', title:'AML & CTF Compliance Report', subtitle:'KYC gaps, STR queue, PEP findings, FATF exposure — for CBSL FIU submission', icon:AlertTriangle, color:'#0F6E56', category:'Compliance', pages:14 },
  { id:'fraud', title:'Fraud Investigation Summary', subtitle:'BR-14 insider fraud, SUS-017 CEFT scheme, NTB-CORP-0887 TBML — full evidence packages including MJE and Insider Risk findings', icon:AlertTriangle, color:'#A32D2D', category:'Fraud', pages:22 },
  { id:'liquidity', title:'ALCO Liquidity Report', subtitle:'LCR/NSFR trend, NOP summary, treasury limit breach log, stabilisation options', icon:TrendingDown, color:'#3B6D11', category:'Treasury', pages:7 },
  { id:'controls', title:'Branch Controls Assessment', subtitle:'Branch risk scores — all 90 branches, override analysis, SoD violations, MJE audit, Insider Risk profiles, remediation roadmap', icon:ShieldCheck, color:'#854F0B', category:'Operations', pages:28 },
];

// ─── REPORT CONTENT GENERATOR ─────────────────────────────────────────────────

function buildReport(reportId) {
  const orchData = demoData.orchestrator;
  const credit = demoData.credit;
  const kyc = demoData.kyc;
  const tx = demoData.transaction;
  const insider = demoData.insiderRisk;
  const mje = demoData.mje;
  const controls = demoData.controls;

  const sections = {
    board: [
      {
        title: 'AUDIT OPINION',
        type: 'opinion',
        content: null,
        opinion: {
          text: 'Based on procedures performed during the year ended 31 December 2025, and subject to the findings detailed in this report, in our opinion the internal control environment of Nations Trust Bank PLC is PARTIALLY EFFECTIVE. Material control failures have been identified at Branch BR-14, in suspense account reconciliation processes, and in Manual Journal Entry controls. These failures require immediate remediation. The credit staging control environment, KYC framework, and treasury risk management infrastructure are assessed as effective with specific gaps noted.',
          classification: 'PARTIALLY EFFECTIVE',
          classColor: '#D97706',
          basis: ['Full-population MJE testing across 847 entries', 'Branch risk scoring across 90 branches (10 monitored in detail)', '9-agent AI analysis covering 835,944 accounts and LKR 430 Bn loan book', 'Multi-agent correlation producing 3 confirmed cross-domain fraud patterns'],
        },
      },
      {
        title: '1. EXECUTIVE SUMMARY',
        content: orchData.executive_summary + '\n\nThis audit cycle has deployed 9 AI domain agents across three analytical layers. Three critical cross-agent correlations have been identified requiring Board-level action: (1) BR-14 insider-enabled loan fraud — combined severity 0.98, (2) SUS-017 CEFT phantom receivable — combined severity 0.99, (3) NTB-CORP-0887 TBML — combined severity 0.94. Each correlation was identified by multiple independent agents converging on the same entity, providing a higher level of assurance than any single-domain finding.',
      },
      {
        title: '2. CRITICAL FINDINGS SUMMARY',
        type: 'findings_table',
        findings: [
          { ref:'F-001', finding:'STF-1847 — Insider-enabled loan fraud, 4 SoD violations, 87% override concentration, Insider Risk score 94/100', severity:'Critical', exposure:'LKR 387M', agents:'6', owner:'R. Wijeratne', status:'Under investigation' },
          { ref:'F-002', finding:'SUS-017 — Phantom receivable, +312% balance in 30d, clearing ratio 0.08, CBSL 90-day guideline breached', severity:'Critical', exposure:'LKR 1.24Bn', agents:'3', owner:'S. Perera', status:'STR filed FIU-STR-2025-1847' },
          { ref:'F-003', finding:'NTB-CORP-0887 — Trade-based money laundering, 91% over-invoicing HS 6203, duplicate LC applications', severity:'Critical', exposure:'LKR 421M', agents:'3', owner:'D. Rajapaksa', status:'Under investigation' },
          { ref:'F-004', finding:'MJE-2026-4205 — Midnight month-end entry, LKR 120M, zero documents, SoD violation. Risk score 97/100.', severity:'Critical', exposure:'LKR 120M', agents:'MJE', owner:'Unassigned', status:'Escalated' },
          { ref:'F-005', finding:'4 branches below 65/100 composite threshold: BR-14 (41), BR-23 (54), BR-11 (58), BR-56 (61)', severity:'High', exposure:'Network-wide', agents:'4', owner:'Field Audit Team', status:'Open' },
          { ref:'F-006', finding:'KYC gap rate 4.7% (39,290 accounts) exceeds CBSL 2% threshold. 847 HSBC migration accounts unresolved.', severity:'High', exposure:'—', agents:'KYC', owner:'Unassigned', status:'Open' },
          { ref:'F-007', finding:'LCR declined from 320.6% to 203.4% — 37% decline in FY2025. Trajectory approaches CBSL 150% amber by Q2 2026.', severity:'Medium', exposure:'Systemic', agents:'Trade', owner:'A. Gunasekera', status:'Resolved — ALCO action approved' },
        ],
      },
      {
        title: '3. KEY RISK INDICATORS',
        type: 'kri_table',
        kris: [
          { metric:'Stage 3 Ratio', actual:'0.91%', limit:'2.0%', status:'Green', trend:'Stable — lowest in Sri Lankan industry. Requires verification given staging anomaly findings.' },
          { metric:'LCR (All Currency)', actual:'203.4%', limit:'120%', status:'Amber', trend:'Declining — from 320.6% in FY2024. Trajectory risk.' },
          { metric:'NSFR', actual:'138.3%', limit:'100%', status:'Green', trend:'Declining — from 154.7%. Monitor.' },
          { metric:'Tier 1 CAR', actual:'19.06%', limit:'11.5%', status:'Green', trend:'Improving.' },
          { metric:'KYC Gap Rate', actual:'4.7%', limit:'2.0%', status:'Red', trend:'Stable — but above threshold. Remediation required.' },
          { metric:'Network Override Rate', actual:'4.8%', limit:'5.0%', status:'Amber', trend:'Approaching limit. BR-14 outlier at 14.3%.' },
          { metric:'Suspense Aging >90d', actual:'LKR 3.98Bn', limit:'Zero', status:'Red', trend:'Deteriorating. CBSL breach confirmed.' },
          { metric:'STR Queue', actual:'4 cases', limit:'0 outstanding', status:'Amber', trend:'Action required within 5 working days.' },
        ],
      },
      {
        title: '4. AGENT FINDINGS OVERVIEW',
        content: `Credit Intelligence: 89 loans flagged (LKR 1.41 Bn). 34 predicted misstaged. BR-14 override concentration (11 loans, LKR 387M) is the primary concern.\n\nTransaction Surveillance: 15-transaction structuring cluster (NTB-0841-X, LKR 71.25M). 4 STR-eligible cases. Benford first-digit anomaly confirms deliberate amount selection.\n\nSuspense & Reconciliation: SUS-017 (Pettah) — phantom receivable confirmed. 3 accounts >90 days — CBSL breach. Re-aging detected on SUS-ACC-031 (STF-2341 reversed and reposted to reset aging clock).\n\nIdentity & KYC / AML: 39,290 gaps (4.7%). INT-BR14-007 introducer gap rate 34% (14/41 accounts). 34 PEP accounts — EDD review required.\n\nInternal Controls: BR-14 composite 41/100 — critical. 4 SoD violations by STF-1847. 4 branches below 65/100 threshold.\n\nDigital Fraud & Identity: 4 anomalous sessions. Impossible travel confirmed. Device DEV-A4F7-9921 shared across 4 accounts linked to SUS-017 network.\n\nTrade Finance & Treasury: NTB-CORP-0887 91% over-invoicing (HS 6203). Duplicate LC applications. LCR decline trajectory — ALCO action required.\n\nInsider Risk: STF-1847 scores 94/100 — all 6 insider fraud dimensions breached simultaneously. Second highest: STF-2341 (BR-23, 71/100). 12 staff above 40/100 watch threshold across the network.\n\nMJE Testing: 847 entries tested (full population). 5 escalated. MJE-2026-4205 scores 97/100 — midnight, month-end, LKR 120M, zero documents, SoD violation. Benford analysis shows first digits 4 and 5 over-represented — consistent with sub-threshold structuring in GL layer.`,
      },
      {
        title: '5. MANAGEMENT ACTION PLAN',
        type: 'action_plan',
        actions: [
          { rank:1, finding:'F-001 — BR-14 Insider Fraud', action:'Suspend STF-1847, deploy field audit team, independent review of all 34 override loans', owner:'Head of Internal Audit', due:'Within 48 hours', status:'In Progress' },
          { rank:2, finding:'F-002 — SUS-017 CEFT', action:'Maintain account freeze, complete forensic review of CEFT counterparty network', owner:'MLCO', due:'2026-01-15', status:'STR filed' },
          { rank:3, finding:'F-003 — TBML NTB-CORP-0887', action:'Obtain beneficial ownership declaration, file TBML STR, 24-month trade document review', owner:'Head of Trade Finance', due:'2025-12-26', status:'Pending STR' },
          { rank:4, finding:'F-004 — MJE SoD Violations', action:'Reverse MJE-2026-4205 pending investigation, implement mandatory dual-control on all MJEs above LKR 1M', owner:'Head of Finance', due:'2026-01-15', status:'Open' },
          { rank:5, finding:'F-005 — Branch Controls', action:'Field audit of BR-14, BR-23, BR-11, BR-56. Implement system-enforced dual-control on overrides', owner:'Head of IT Risk', due:'2026-01-31', status:'Open' },
          { rank:6, finding:'F-006 — KYC Gaps', action:'Prioritise PEP and critical accounts, HSBC migration batch remediation', owner:'KYC Team Lead', due:'2026-03-31', status:'Open' },
          { rank:7, finding:'F-007 — LCR Decline', action:'Term deposit campaign, REPO facility increase, loan growth review at ALCO', owner:'CFO / ALCO', due:'2026-01-15', status:'Resolved' },
        ],
      },
    ],
    credit: [
      { title:'AUDIT OPINION — CREDIT RISK', type:'mini_opinion', text:'The SLFRS 9 staging control environment is PARTIALLY EFFECTIVE. While the portfolio Stage 3 ratio of 0.91% appears healthy, full-population AI analysis identifies 34 loans (LKR 1.10 Bn) that are predicted to be misstaged — potentially understating ECL provisions. The concurrence of override approval patterns at BR-14 with staging anomalies indicates the control weakness may be partly intentional.', classification:'PARTIALLY EFFECTIVE', classColor:'#D97706' },
      { title:'1. PORTFOLIO SUMMARY', content:`Loans analysed: 16,631 (full population)\nTotal exposure: LKR 430.4 Bn\nFlagged for review: 89 loans (LKR 1.41 Bn)\nPredicted misstaged: 34 loans (LKR 1.10 Bn)\nOverride-flagged anomalies: 23 loans\nNetwork override rate: 4.8% | BR-14: 14.3%\nStage 3 ratio: 0.91% (industry lowest — requires verification)` },
      { title:'2. SLFRS 9 STAGING ANOMALIES', content: credit.flagged_loans.slice(0,6).map(l => `${l.loan_id} | Branch: ${l.branch_code||'—'} | Stage ${l.assigned_stage}→${l.predicted_stage} | Score ${l.anomaly_score.toFixed(2)} | ${l.primary_driver}`).join('\n') },
      { title:'3. VINTAGE COHORT ANALYSIS', content: credit.vintage_analysis.map(v => `${v.cohort}: ${v.loan_count} loans | Avg anomaly score ${v.avg_anomaly_score} | Projected S3 migration ${v.projected_stage3_migration_pct}% | ${v.risk_flag.toUpperCase()}`).join('\n') + '\n\nKey finding: Underwriting quality has deteriorated materially in 2025-Q3 and 2025-Q4. Loans originated during the peak growth period show anomaly scores 31% above the 2024 baseline. This is consistent with approval quality declining under volume pressure.' },
      { title:'4. BRANCH CONCENTRATION ANALYSIS', content: `BR-14 (Ratnapura): 11 override-approved anomalous loans | LKR 387 Mn | Override rate 14.3% (network avg 4.8%)\nBR-23 (Embilipitiya): 3 flagged loans | LKR 143 Mn | Override rate 9.8%\nBR-11 (Batticaloa): 4 flagged loans | LKR 186 Mn | Override rate 7.2%\n\nThese three branches account for 74% of all override-flagged anomalous loan exposure. The pattern is not distributed — it is concentrated in branches with known control deficiencies.` },
      { title:'5. ECL IMPACT ASSESSMENT', content:'If all 34 predicted-misstaged loans are correctly reclassified:\n  Stage 1→2 reclassification (22 loans): Additional ECL ~LKR 180 Mn\n  Stage 2→3 reclassification (12 loans): Additional ECL ~LKR 420 Mn\n  Total additional ECL if corrected: ~LKR 600 Mn\n  Current reported ECL provision: Not disclosed in scope\n  Impact on Stage 3 ratio: 0.91% → ~1.12% (23% increase)\n\nRecommendation: Convene Staging Committee within 48 hours. Correct misstaging before next regulatory submission to CBSL.' },
    ],
    aml: [
      { title:'REGULATORY COMPLIANCE OPINION', type:'mini_opinion', text:'The AML/CTF compliance framework is PARTIALLY EFFECTIVE. The FTRA reporting mechanism is operational but the KYC gap rate of 4.7% materially exceeds the CBSL threshold of 2.0%. The introducer concentration finding at BR-14 suggests systemic onboarding bypass. Three confirmed STR-eligible cases require filing within FTRA deadlines.', classification:'PARTIALLY EFFECTIVE', classColor:'#D97706' },
      { title:'1. KYC COMPLIANCE SUMMARY', content:`Total customers analysed: 835,944\nKYC gap count: 39,290 (4.7%) — EXCEEDS CBSL 2% threshold\nCritical gaps (immediate action): 156 accounts\nPEP accounts requiring EDD: 34\nBeneficial ownership gaps: 234\nFATF grey-list country exposure: 18 accounts\nHSBC migration gaps (Q2 2026 deadline): 847 accounts\nSTR assessments required: 7` },
      { title:'2. STR / SAR QUEUE', content: tx.str_queue.map(s => `${s.account_id}: ${s.str_grounds}\n  Amount: LKR ${(s.amount_lkr/1e6).toFixed(0)}M | Urgency: ${s.urgency}\n  Action required: File within 5 working days of identification under FTRA Section 7`).join('\n\n') },
      { title:'3. PEP FINDINGS', content: kyc.pep_findings.map(p => `${p.customer_id} (${p.pep_type} PEP): EDD ${p.edd_current?'CURRENT':'OVERDUE — '+p.last_review_days_ago+' days since last review'}\n  Action: ${p.action_required}`).join('\n\n') },
      { title:'4. INTRODUCER CONCENTRATION FLAGS', content: kyc.introducer_concentration.filter(i=>i.flag).map(i => `${i.introducer_code}: ${i.accounts_with_gaps}/${i.total_accounts_introduced} introduced accounts have KYC gaps (gap rate ${((i.accounts_with_gaps/i.total_accounts_introduced)*100).toFixed(0)}%)\n  ${i.risk_interpretation}`).join('\n\n') },
      { title:'5. REGULATORY SUBMISSIONS REQUIRED', content:'STR 1: NTB-0841-X — structuring (15 CEFT transfers LKR 71.25M) — deadline 5 working days from 2025-12-20\nSTR 2: SUS-017 CEFT network — phantom receivable scheme — FILED: FIU-STR-2025-1847\nSTR 3: NTB-CORP-0887 — TBML over-invoicing — deadline 2025-12-26\nCBSL notification: BR-14 material fraud (>LKR 250M) — PENDING\nCBSL notification: SUS-017 CBSL 90-day breach — FILED 2025-12-22' },
    ],
    fraud: [
      { title:'FRAUD INVESTIGATION OPINION', type:'mini_opinion', text:'Three confirmed fraud cases require board awareness and executive action. The convergence of Insider Risk, Internal Controls, MJE Testing, Credit Intelligence, KYC, and Digital Fraud agents on common entities (STF-1847, BR-14, SUS-017) provides multi-source evidentiary support that is highly defensible in regulatory and legal proceedings.', classification:'3 ACTIVE INVESTIGATIONS', classColor:'#DC2626' },
      { title:'CASE 1: BR-14 INSIDER-ENABLED LOAN FRAUD', content:'Fraud type: Insider-enabled loan fraud\nPrimary actor: STF-1847 (Senior Loans Officer, Ratnapura branch)\nInsider Risk score: 94/100 — all 6 dimensions simultaneously\nExposure: LKR 387 Mn (11 override-approved anomalous loans)\nSoD violations: 4 confirmed (same person as maker and approver)\nOff-hours approvals: 12 (22.1% of BR-14 approvals, vs network avg 4.0%)\nApproval turnaround: 1.4 min avg — impossible for genuine credit review on complex loans\nSame-cluster approvals: 3 loans to borrowers sharing guarantor addresses\nMJE involvement: MJE-2026-4201 and MJE-2026-4202 — after-hours SoD violations by STF-1847 to suspense GL\nAgent confirmation: Controls, Credit, KYC, Digital Fraud, Insider Risk, MJE Testing, Orchestrator (7 agents)\nCombined severity: 0.98/1.00\nStatus: Investigation in progress. STF-1847 suspended. Field team at BR-14.' },
      { title:'CASE 2: SUS-017 CEFT PHANTOM RECEIVABLE', content:`Fraud type: CEFT payment fraud — phantom receivable scheme\nAccount: SUS-017 (Pettah Main Street CEFT Receivables)\nBalance: LKR 1.24 Bn\nGrowth: +312% in 30 days\nClearing ratio: 0.08 (benchmark for legitimate CEFT account: 0.95+)\nAging: 94 days — CBSL 90-day guideline breached\nStructuring: 15 CEFT transfers, amounts LKR 4.6M–4.95M (below LKR 5M STR threshold)\nDevice cluster: DEV-A4F7-9921 shared across 4 accounts in counterparty network\nSTR filed: FIU-STR-2025-1847\nAgent confirmation: Suspense, Transaction, Digital Fraud, Orchestrator\nCombined severity: 0.99/1.00\nStatus: Account frozen. STR filed. Forensic review in progress.` },
      { title:'CASE 3: NTB-CORP-0887 TBML', content:`Fraud type: Trade-based money laundering\nEntity: NTB-CORP-0887 (corporate customer)\nTBML method: Over-invoicing on HS 6203 apparel exports\nDeviation: 91% above UN COMTRADE median (USD 8.40/kg benchmark; declared USD 16.04/kg)\nDuplicate LCs: LC-2025-3341 and LC-3412 on overlapping shipment periods\nBeneficial ownership: Not disclosed\nTotal suspicious flow: LKR 421 Mn\nSTR status: Pending — deadline 2025-12-26\nAgent confirmation: Trade Finance, Transaction Surveillance, KYC/AML\nCombined severity: 0.94/1.00\nStatus: Facilities suspended. Beneficial ownership declaration requested.` },
      { title:'MJE TESTING — HIGH RISK ENTRIES', content:`MJE-2026-4205: Risk score 97/100 — HIGHEST IN POPULATION\n  Entry: Midnight month-end posting to Loans Receivable\n  Amount: LKR 120,000,000 (round number, above materiality)\n  Timing: 00:15 on Feb 28 (midnight, month-end, weekend)\n  Documents: None present (0% completeness)\n  SoD: Maker and checker identical (STF-4401)\n  Benford: FAIL — first digit anomalous\n  Status: Escalated — reversal pending investigation\n\nMJE-2026-4201: Risk score 92/100 — by STF-1847\n  Entry: After-hours posting to CEFT Receivables Suspense (SUS-001)\n  Amount: LKR 18,700,000 — reversal chain detected\n  SoD: Maker and checker identical\n  Linked to: STF-1847 insider fraud investigation\n\nBenford population finding: First digits 4 and 5 over-represented (14.2% and 12.6% vs expected 9.7% and 7.9%). Consistent with deliberate sub-threshold structuring in GL layer — amounts selected below internal review thresholds.` },
      { title:'INSIDER RISK PROFILE — STF-1847', content:`Risk score: 94/100 (CRITICAL)\nBranch: BR-14 Ratnapura\nRole: Senior Loans Officer\n\nDimension analysis:\n  SoD violations: 4 (any single instance is a critical failure under CBSL Direction No. 5/2024)\n  Override concentration: 87% of BR-14 overrides (healthy threshold: <40%)\n  Same-cluster approvals: 3 loans — borrowers share guarantor addresses\n  Off-hours approvals: 12 (22.1% of approvals vs network avg 4.0%)\n  Approval turnaround: 1.4 min avg — below the 2-min minimum for genuine review\n  Session deviation: Flagged in 6.7% of sessions (peer avg 1.2%)\n\nPeer comparison: Network average risk score 18/100. STF-1847 at 94/100 is a 5.2σ outlier.\n\nHistorical pattern: Signals present since October 2025. Two prior alerts closed as false positives. The Insider Risk Agent's persistent multi-dimension tracking identified the accumulating pattern that individual alerts missed.\n\nRecommendation: Immediate forensic examination of all loans approved or overridden by STF-1847 during October–December 2025. Criminal referral assessment to be made by Legal.` },
    ],
    liquidity: [
      { title:'TREASURY OPINION', type:'mini_opinion', text:'The treasury risk management framework is EFFECTIVE with one specific concern. LCR has declined materially during FY2025 and the trajectory requires ALCO attention. All other regulatory ratios remain within limits. The NOP limit breach is a point-in-time exceedance that has been remediated.', classification:'EFFECTIVE — WITH CONDITION', classColor:'#EF9F27' },
      { title:'1. LCR / NSFR ANALYSIS', content:`LCR (All Currency): 203.4% | Limit: 120% | Status: Within limit — but declining\nLCR FY2024: 320.6% | FY2025: 203.4% | Change: -37%\nMechanism: 50% loan growth (LKR 143 Bn new origination) outpacing stable funding growth\nTrajectory: At current rate, LCR reaches CBSL amber threshold (150%) by Q2 2026\n\nNSFR: 138.3% | Limit: 100% | Status: Within limit\nNSFR FY2024: 154.7% | FY2025: 138.3% | Change: -10%\n\nCAR Tier 1: 19.06% | Limit: 11.5% | Status: Comfortable headroom\nALCO response: Term deposit campaign launched. Target LKR 25 Bn by Q1 2026.` },
      { title:'2. NET OPEN POSITION', content:`USD/LKR position: LKR 12.4M (intraday)\nEUR/LKR position: LKR 3.8M (intraday)\nGBP/LKR position: LKR 1.2M (intraday)\nSGD/LKR position: LKR 0.89M (intraday)\n\nNOP breach detected: FX-USD-20251218-441 exceeded approved intraday limit.\nBreached by: 12% above approved limit | Duration: Intraday, reduced before close\nAction taken: Dealer notified, position reduced, documentation filed.\nRecommendation: Review intraday NOP monitoring frequency. Current daily monitoring insufficient for intraday breaches.` },
      { title:'3. ALCO RECOMMENDATIONS', content:'1. Approve LCR Stabilisation Plan Q1 2026 — term deposit campaign target LKR 25 Bn\n2. Review loan growth targets for 2026 — current 50% growth rate is unsustainable from a liquidity perspective\n3. Increase REPO facility utilisation — available headroom LKR 15 Bn\n4. Implement intraday NOP monitoring (hourly vs daily)\n5. Present LCR trajectory to Board Risk Committee at February 2026 meeting' },
    ],
    controls: [
      { title:'CONTROLS OPINION', type:'mini_opinion', text:'The internal control environment across NTB\'s 90-branch network is PARTIALLY EFFECTIVE. Four branches (BR-14, BR-23, BR-11, BR-56) score below the 65/100 composite threshold. BR-14 scores 41/100 — the lowest in the network — and represents a systemic control environment failure rather than isolated individual behaviour. MJE controls require significant strengthening.', classification:'PARTIALLY EFFECTIVE', classColor:'#D97706' },
      { title:'1. NETWORK BRANCH RISK SUMMARY', content: controls.branch_risk_scores.map(b => `${b.branch_code}: ${b.composite_score}/100 | Override ${b.override_rate_pct}% | SoD violations ${b.sod_violation_count} | Off-hours ${b.off_hours_approval_pct}% | Status: ${b.risk_tier.toUpperCase()}\n  ${b.primary_concern}`).join('\n\n') },
      { title:'2. SOD VIOLATIONS', content: controls.sod_violations.map(v => `${v.transaction_id} | Branch ${v.branch_code} | Staff ${v.staff_id} | LKR ${(v.amount_lkr/1e6).toFixed(1)}M | ${v.transaction_type} | Severity: ${v.severity.toUpperCase()}`).join('\n') + '\n\nTotal SoD violations: 4\nAll violations attributable to STF-1847 (BR-14) and STF-2341 (BR-23)\nCBSL Direction No. 5/2024: Zero tolerance — any SoD violation is a material control failure.' },
      { title:'3. MJE CONTROL ASSESSMENT', content:`MJE testing methodology: Full population — 847 entries tested\nFlagged: 23 entries | Escalated: 5 entries | Benford failures: 8\nSoD violations in MJE layer: 3 entries\nAfter-hours postings without documented justification: 12\n\nKey weakness: Maker-checker control is not system-enforced for MJEs below LKR 10M. Manual checking is inconsistently applied.\n\nRecommendation: Implement system-enforced dual-authorisation for all MJEs above LKR 1M. Current CBSL requirement (>LKR 1M) is not being met.\n\nHighest risk entry: MJE-2026-4205 (97/100) — midnight, month-end, LKR 120M, zero documents, SoD violation. Immediate reversal and investigation required.` },
      { title:'4. INSIDER RISK NETWORK SUMMARY', content:`Staff analysed: 2,462 (full network)\nFlagged (score >40): 12 staff members\nCritical (score >85): 2 staff members\nNetwork average score: 18/100\n\nTop risk profiles:\n  STF-1847 (BR-14): 94/100 — all 6 dimensions. CRITICAL.\n  STF-2341 (BR-23): 71/100 — elevated. HIGH.\n\nKey finding: Both highest-risk staff are at branches with confirmed control failures (BR-14 and BR-23). This is not coincidental — weak branch controls enable insider fraud, and insider fraud suppresses control scores.\n\nRecommendation: Implement network-wide Insider Risk monitoring as a standard quarterly control. Any staff member above 70/100 requires formal Compliance review within 14 days.` },
      { title:'5. REMEDIATION ROADMAP', content:`IMMEDIATE (within 48 hours):\n  - Suspend STF-1847 (DONE)\n  - Field audit team to BR-14 (IN PROGRESS)\n  - Freeze BR-14 credit approvals (IN PROGRESS)\n\nWITHIN 30 DAYS:\n  - System-enforced dual-control on all override approvals (IT)\n  - System-enforced maker-checker on all MJEs >LKR 1M (Finance / IT)\n  - Compliance review of all 12 flagged staff members\n  - Field audit of BR-23, BR-11, BR-56\n\nWITHIN 90 DAYS:\n  - KYC remediation — 39,290 accounts (prioritise critical and PEP)\n  - Implement automated clearing ratio monitoring (suspense accounts)\n  - HSBC migration KYC pre-work complete\n  - Quarterly Insider Risk reporting to Board Risk Committee\n\nWITHIN 6 MONTHS:\n  - All 4 below-threshold branches restored above 65/100\n  - MJE testing fully automated and continuous\n  - STR filing workflow integrated into Sentinel case management` },
    ],
  };
  return sections[reportId] || sections.board;
}

// ─── REPORT RENDERER ──────────────────────────────────────────────────────────

function ReportRenderer({ report }) {
  const sections = buildReport(report.id);
  return (
    <div style={{ fontFamily:'var(--font)', fontSize:13, lineHeight:1.7, color:'var(--color-text)' }}>
      {/* Header */}
      <div style={{ borderBottom:'2px solid var(--color-border)', paddingBottom:20, marginBottom:24 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div>
            <div style={{ fontSize:10, fontWeight:600, color:'var(--color-text-3)', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:5 }}>Nations Trust Bank PLC — Sentinel Audit Intelligence Platform</div>
            <div style={{ fontSize:20, fontWeight:800, color:'var(--color-text)', marginBottom:4 }}>{report.title}</div>
            <div style={{ fontSize:12, color:'var(--color-text-2)' }}>Period: {PERIOD} · Generated: {TODAY}</div>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize:11, fontWeight:700, color:'#DC2626', padding:'3px 10px', background:'var(--color-red-light)', borderRadius:4 }}>CONFIDENTIAL</div>
            <div style={{ fontSize:10, color:'var(--color-text-3)', marginTop:4 }}>Sentinel by Octave</div>
          </div>
        </div>
      </div>

      {/* Sections */}
      {sections.map((section, i) => (
        <div key={i} style={{ marginBottom:28 }}>
          <div style={{ fontSize:13, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.07em', color:'var(--color-text)', marginBottom:14, paddingBottom:7, borderBottom:`2px solid ${report.color}44`, display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:4, height:18, borderRadius:2, background:report.color }} />
            {section.title}
          </div>

          {/* Audit opinion block */}
          {(section.type === 'opinion' || section.type === 'mini_opinion') && (
            <div style={{ padding:'18px 20px', background:section.type==='opinion'?`${section.opinion?.classColor||report.color}08`:section.classColor+'08', border:`2px solid ${section.opinion?.classColor||section.classColor}44`, borderRadius:12, marginBottom:14 }}>
              <div style={{ display:'flex', gap:12, alignItems:'flex-start', marginBottom:12 }}>
                <div style={{ padding:'4px 14px', background:section.opinion?.classColor||section.classColor, color:'white', borderRadius:20, fontSize:12, fontWeight:800, flexShrink:0 }}>
                  AUDIT OPINION: {section.opinion?.classification||section.classification}
                </div>
              </div>
              <div style={{ fontSize:13, lineHeight:1.8, color:'var(--color-text)' }}>{section.opinion?.text||section.text}</div>
              {section.opinion?.basis && (
                <div style={{ marginTop:12 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:'var(--color-text-3)', marginBottom:5 }}>BASIS OF OPINION</div>
                  {section.opinion.basis.map((b,bi) => <div key={bi} style={{ fontSize:12, color:'var(--color-text-2)', marginBottom:3 }}>· {b}</div>)}
                </div>
              )}
            </div>
          )}
          {section.type !== 'opinion' && section.type !== 'mini_opinion' && section.content && (
            <pre style={{ whiteSpace:'pre-wrap', fontFamily:'var(--font)', fontSize:12, color:'var(--color-text)', lineHeight:1.8, background:'var(--color-surface-2)', padding:'14px 16px', borderRadius:8, margin:0 }}>
              {section.content}
            </pre>
          )}

          {/* Findings table */}
          {section.type === 'findings_table' && (
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:11 }}>
                <thead>
                  <tr style={{ background:'var(--color-surface-2)', borderBottom:'2px solid var(--color-border)' }}>
                    {['Ref','Finding','Severity','Exposure','Agents','Owner','Status'].map(h => (
                      <th key={h} style={{ padding:'8px 10px', textAlign:'left', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--color-text-3)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {section.findings.map((f,fi) => (
                    <tr key={fi} style={{ borderBottom:'1px solid var(--color-border)', background:fi%2===0?'transparent':'var(--color-surface-2)' }}>
                      <td style={{ padding:'8px 10px' }}><code style={{ fontSize:10, color:'var(--color-text-3)' }}>{f.ref}</code></td>
                      <td style={{ padding:'8px 10px', fontSize:11, lineHeight:1.5, maxWidth:300 }}>{f.finding}</td>
                      <td style={{ padding:'8px 10px' }}><span style={{ fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:4, background:f.severity==='Critical'?'#FEF0F0':'#FFFBEB', color:f.severity==='Critical'?'#DC2626':'#D97706' }}>{f.severity}</span></td>
                      <td style={{ padding:'8px 10px', fontSize:11, fontWeight:700, color:'#DC2626', whiteSpace:'nowrap' }}>{f.exposure}</td>
                      <td style={{ padding:'8px 10px', fontSize:11, color:'var(--color-text-2)' }}>{f.agents}</td>
                      <td style={{ padding:'8px 10px', fontSize:11 }}>{f.owner}</td>
                      <td style={{ padding:'8px 10px', fontSize:10, color:'var(--color-text-2)' }}>{f.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* KRI table */}
          {section.type === 'kri_table' && (
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:11 }}>
                <thead>
                  <tr style={{ background:'var(--color-surface-2)', borderBottom:'2px solid var(--color-border)' }}>
                    {['Metric','Actual','Limit','Status','Trend / Comment'].map(h => (
                      <th key={h} style={{ padding:'8px 10px', textAlign:'left', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--color-text-3)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {section.kris.map((k,ki) => {
                    const sc = { Green:'#16A34A', Amber:'#D97706', Red:'#DC2626' }[k.status] || '#6b6963';
                    return (
                      <tr key={ki} style={{ borderBottom:'1px solid var(--color-border)' }}>
                        <td style={{ padding:'8px 10px', fontWeight:600 }}>{k.metric}</td>
                        <td style={{ padding:'8px 10px', fontWeight:700, color:sc }}>{k.actual}</td>
                        <td style={{ padding:'8px 10px', color:'var(--color-text-2)' }}>{k.limit}</td>
                        <td style={{ padding:'8px 10px' }}><span style={{ fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:4, background:`${sc}15`, color:sc }}>{k.status}</span></td>
                        <td style={{ padding:'8px 10px', fontSize:11, color:'var(--color-text-2)', lineHeight:1.5 }}>{k.trend}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Action plan table */}
          {section.type === 'action_plan' && (
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:11 }}>
                <thead>
                  <tr style={{ background:'var(--color-surface-2)', borderBottom:'2px solid var(--color-border)' }}>
                    {['#','Finding','Management Action','Owner','Due Date','Status'].map(h => (
                      <th key={h} style={{ padding:'8px 10px', textAlign:'left', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--color-text-3)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {section.actions.map((a,ai) => {
                    const sc = a.status==='Resolved'?'#16A34A':a.status.includes('Progress')||a.status.includes('filed')?'#185FA5':a.status==='In Progress'?'#185FA5':'#D97706';
                    return (
                      <tr key={ai} style={{ borderBottom:'1px solid var(--color-border)' }}>
                        <td style={{ padding:'8px 10px', fontWeight:700, color:report.color }}>{a.rank}</td>
                        <td style={{ padding:'8px 10px', fontSize:10, color:'var(--color-text-3)' }}>{a.finding}</td>
                        <td style={{ padding:'8px 10px', lineHeight:1.5, maxWidth:280 }}>{a.action}</td>
                        <td style={{ padding:'8px 10px', color:'var(--color-text-2)' }}>{a.owner}</td>
                        <td style={{ padding:'8px 10px', whiteSpace:'nowrap', color:new Date(a.due)<new Date('2026-01-01')&&a.status!=='Resolved'?'#DC2626':'var(--color-text-2)' }}>{a.due}</td>
                        <td style={{ padding:'8px 10px' }}><span style={{ fontSize:10, fontWeight:600, padding:'2px 7px', borderRadius:4, background:`${sc}15`, color:sc }}>{a.status}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}

      <div style={{ borderTop:'1px solid var(--color-border)', paddingTop:16, marginTop:8, fontSize:10, color:'var(--color-text-3)', display:'flex', justifyContent:'space-between' }}>
        <span>Generated by Sentinel by Octave · Powered by Claude claude-sonnet-4-20250514</span>
        <span>Nations Trust Bank PLC · FY 2025 · CONFIDENTIAL</span>
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function Reports() {
  const [selected, setSelected] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const reportRef = useRef(null);

  const categories = ['all', ...new Set(REPORTS.map(r => r.category))];
  const filtered = REPORTS.filter(r => activeCategory === 'all' || r.category === activeCategory);

  function handleDownload(report) {
    const el = reportRef.current;
    if (!el) return;
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${report.title}</title><style>body{font-family:Georgia,serif;font-size:13px;line-height:1.8;color:#1a1917;max-width:900px;margin:40px auto;padding:0 32px} table{width:100%;border-collapse:collapse;margin:16px 0} th,td{padding:8px 10px;text-align:left;border-bottom:1px solid #e5e7eb} th{font-size:10px;text-transform:uppercase;letter-spacing:0.05em;background:#f7f8fb} pre{white-space:pre-wrap;background:#f7f8fb;padding:14px;border-radius:6px;font-family:inherit;font-size:12px} h1{font-size:20px;border-bottom:2px solid #e5e7eb;padding-bottom:12px} @media print{body{margin:0;padding:20px}}</style></head><body>${el.innerHTML}</body></html>`;
    const blob = new Blob([html], { type:'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${report.id}-audit-report-ntb-fy2025.html`; a.click();
  }

  return (
    <div style={{ maxWidth:1400 }}>
      <div style={{ marginBottom:24 }}>
        <h2 style={{ marginBottom:6 }}>Reports</h2>
        <p style={{ fontSize:13, color:'var(--color-text-2)', lineHeight:1.6 }}>
          Structured audit reports grounded in NTB FY 2025 agent findings. All reports include an audit opinion, findings table, and management action plan. Download as HTML for printing or PDF conversion.
        </p>
      </div>

      <div style={{ display:'flex', gap:6, marginBottom:20, flexWrap:'wrap' }}>
        {categories.map(c => (
          <button key={c} onClick={() => setActiveCategory(c)} className="btn btn-sm"
            style={{ background:activeCategory===c?'var(--color-text)':'var(--color-surface)', color:activeCategory===c?'white':'var(--color-text-2)', border:'1px solid var(--color-border)', textTransform:'capitalize' }}>{c}</button>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:selected?'300px 1fr':'repeat(auto-fill, minmax(280px, 1fr))', gap:16, alignItems:'start' }}>
        {/* Report cards */}
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {filtered.map(report => {
            const Icon = report.icon;
            const isSelected = selected?.id === report.id;
            return (
              <div key={report.id} onClick={() => setSelected(isSelected ? null : report)}
                style={{ padding:'16px 18px', background:'var(--color-surface)', border:`1px solid ${isSelected ? report.color + '66' : 'var(--color-border)'}`, borderRadius:12, cursor:'pointer', transition:'all 0.15s', borderTop:`3px solid ${report.color}`, boxShadow:isSelected?`0 4px 20px ${report.color}18`:'none' }}>
                <div style={{ display:'flex', gap:12, alignItems:'flex-start', marginBottom:10 }}>
                  <div style={{ width:36, height:36, borderRadius:10, background:`${report.color}15`, border:`1px solid ${report.color}28`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <Icon size={16} style={{ color:report.color }} />
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:'var(--color-text)', marginBottom:3, lineHeight:1.4 }}>{report.title}</div>
                    <div style={{ fontSize:11, color:'var(--color-text-2)', lineHeight:1.4 }}>{report.subtitle}</div>
                  </div>
                </div>
                <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                  <span style={{ fontSize:10, padding:'2px 7px', background:`${report.color}12`, color:report.color, borderRadius:4 }}>{report.category}</span>
                  <span style={{ fontSize:10, color:'var(--color-text-3)' }}>{report.pages} pages (est.)</span>
                  <span style={{ marginLeft:'auto', fontSize:11, fontWeight:600, color:report.color }}>{isSelected ? '← Viewing' : 'View →'}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Report preview */}
        {selected && (
          <div className="agent-panel animate-fade-in" style={{ position:'sticky', top:0 }}>
            <div className="agent-panel-header" style={{ background:`${selected.color}08` }}>
              <span className="agent-panel-title" style={{ color:selected.color }}>{selected.title}</span>
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={() => handleDownload(selected)} className="btn btn-sm btn-primary" style={{ background:selected.color, display:'flex', alignItems:'center', gap:5, fontSize:11 }}>
                  <Download size={12} /> Download HTML
                </button>
                <button onClick={() => setSelected(null)} style={{ fontSize:18, color:'var(--color-text-3)', background:'none', border:'none', cursor:'pointer' }}>×</button>
              </div>
            </div>
            <div className="agent-panel-body agent-panel-scroll" style={{ maxHeight:700, overflowY:'auto', padding:'20px 24px' }} ref={reportRef} id="report-preview">
              <ReportRenderer report={selected} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

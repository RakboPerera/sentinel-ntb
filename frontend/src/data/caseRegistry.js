// ─── SENTINEL CASE LOOKUP REGISTRY ──────────────────────────────────────────
// Single source of truth for finding → case mapping.
// Every component imports from here to resolve case links.

export const CASES = [
  {
    id: 'CASE-001',
    title: 'BR-14 Insider-Enabled Loan Fraud — STF-1847',
    severity: 'critical', status: 'investigating',
    branch_code: 'BR-14', branch_name: 'Ratnapura',
    domains: ['controls', 'credit', 'kyc', 'digital', 'insider', 'mje'],
    finding_ids: ['STF-1847', 'BR-14', 'NTB-CR-2025-0441', 'NTB-CR-2025-0872', 'NTB-CR-2025-1203', 'INT-BR14-007', 'MJE-2026-4201', 'MJE-2026-4204', 'SES-NTB-20251210-6612', 'CORR-001'],
    exposureLkr: 387000000,
    color: '#DC2626',
  },
  {
    id: 'CASE-002',
    title: 'SUS-017 CEFT Phantom Receivable — LKR 1.24 Bn',
    severity: 'critical', status: 'open',
    branch_code: 'BR-72', branch_name: 'Pettah Main St',
    domains: ['suspense', 'transaction', 'digital'],
    finding_ids: ['SUS-017', 'NTB-0841-X', 'DEV-A4F7-9921', 'CORR-002', 'NTB-2209-F'],
    exposureLkr: 1240000000,
    color: '#DC2626',
  },
  {
    id: 'CASE-003',
    title: 'NTB-CORP-0887 Trade-Based Money Laundering',
    severity: 'critical', status: 'investigating',
    branch_code: 'BR-16', branch_name: 'City Office',
    domains: ['trade', 'transaction', 'kyc'],
    finding_ids: ['NTB-CORP-0887', 'INV-2025-3441', 'LC-2025-3341', 'CORR-003'],
    exposureLkr: 421000000,
    color: '#DC2626',
  },
  {
    id: 'CASE-004',
    title: 'NTB-0841-X Structuring — 15 CEFT Transfers',
    severity: 'high', status: 'open',
    branch_code: 'BR-72', branch_name: 'Pettah Main St',
    domains: ['transaction'],
    finding_ids: ['NTB-0841-X'],
    exposureLkr: 71250000,
    color: '#D97706',
  },
  {
    id: 'CASE-005',
    title: 'KYC Gap Remediation — 39,290 Accounts',
    severity: 'high', status: 'open',
    branch_code: null, branch_name: 'Network-wide',
    domains: ['kyc'],
    finding_ids: ['INT-BR14-007', 'INT-BR23-012', 'NTB-C-0041-X', 'NTB-C-3312-B'],
    exposureLkr: 0,
    color: '#D97706',
  },
  {
    id: 'CASE-006',
    title: 'LCR Decline — ALCO Stabilisation Required',
    severity: 'medium', status: 'resolved',
    branch_code: null, branch_name: 'Treasury / Group',
    domains: ['trade'],
    finding_ids: ['LCR-2025', 'NSFR-2025'],
    exposureLkr: 0,
    color: '#185FA5',
  },
  {
    id: 'CASE-007',
    title: 'MJE-2026-4204 GL Manipulation — LKR 120M Loans Receivable',
    severity: 'critical', status: 'open',
    branch_code: 'BR-14', branch_name: 'Ratnapura',
    domains: ['mje', 'controls'],
    finding_ids: ['MJE-2026-4204', 'MJE-2026-4201', 'MJE-2026-4202', 'STF-1847'],
    exposureLkr: 305000000,
    color: '#DC2626',
  },
  {
    id: 'CASE-008',
    title: 'BR-72 Velocity Cluster — LKR 166M Suspicious Flow',
    severity: 'high', status: 'open',
    branch_code: 'BR-72', branch_name: 'Pettah Main St',
    domains: ['transaction', 'digital', 'suspense'],
    finding_ids: ['NTB-0841-X', 'NTB-2209-F', 'SUS-017', 'DEV-A4F7-9921', 'NTB-3312-B'],
    exposureLkr: 166000000,
    color: '#D97706',
  },
  {
    id: 'CASE-009',
    title: 'INV-2025-5881 Gold Under-Invoicing — HS 7108',
    severity: 'high', status: 'open',
    branch_code: 'BR-16', branch_name: 'City Office',
    domains: ['trade', 'kyc'],
    finding_ids: ['INV-2025-5881', 'NTB-CORP-4412'],
    exposureLkr: 147000000,
    color: '#D97706',
  },
  {
    id: 'CASE-010',
    title: 'BR-23 Elevated Controls Risk — STF-2341',
    severity: 'high', status: 'open',
    branch_code: 'BR-23', branch_name: 'Embilipitiya',
    domains: ['controls', 'credit', 'insider'],
    finding_ids: ['STF-2341', 'BR-23', 'NTB-CR-2025-0334', 'NTB-CR-2025-2041', 'INT-BR23-012'],
    exposureLkr: 156000000,
    color: '#D97706',
  },
];

// ─── LOOKUP HELPERS ───────────────────────────────────────────────────────────

/** Get all cases that mention a given entity ID or branch code */
export function getCasesForEntity(entityId) {
  if (!entityId) return [];
  return CASES.filter(c =>
    c.finding_ids.some(fid => fid.toLowerCase().includes(entityId.toLowerCase()) ||
                              entityId.toLowerCase().includes(fid.toLowerCase())) ||
    c.branch_code === entityId
  );
}

/** Get all cases for a branch code */
export function getCasesForBranch(branchCode) {
  if (!branchCode) return [];
  return CASES.filter(c => c.branch_code === branchCode || c.branch_code === null);
}

/** Get all cases for an audit domain */
export function getCasesForDomain(domain) {
  if (!domain) return [];
  return CASES.filter(c => c.domains.includes(domain));
}

/** Get a single case by ID */
export function getCaseById(id) {
  return CASES.find(c => c.id === id) || null;
}

/** Get cases for a branch × domain combination */
export function getCasesForCell(branchCode, domain) {
  return CASES.filter(c =>
    (c.branch_code === branchCode || c.branch_code === null) &&
    c.domains.includes(domain)
  );
}

/** Severity colours */
export const CASE_SEV_COLOR = {
  critical: '#E82AAE', high: '#D97706', medium: '#185FA5', low: '#16A34A'
};
export const CASE_SEV_BG = {
  critical: '#FEF0F0', high: '#FFFBEB', medium: '#EBF4FF', low: '#F0FDF4'
};
export const CASE_STATUS_COLOR = {
  open: '#DC2626', investigating: '#D97706', resolved: '#16A34A', closed: '#9ca3af'
};

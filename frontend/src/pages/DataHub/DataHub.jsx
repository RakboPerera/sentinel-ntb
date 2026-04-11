import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Papa from 'papaparse';
import axios from 'axios';
import { useApp } from '../../context/AppContext.jsx';
import InfoTooltip from '../../components/shared/InfoTooltip.jsx';
import {
  Upload, Download, CheckCircle, AlertCircle, Trash2,
  ChevronRight, Zap, Eye, EyeOff, ArrowRight, RefreshCw, MapPin
} from 'lucide-react';

// ─── AGENT CONFIG ─────────────────────────────────────────────────────────────

const AGENTS = [
  {
    id: 'credit', name: 'Credit Intelligence', color: '#185FA5', bg: '#E6F1FB', icon: '◈',
    tagline: 'SLFRS 9 staging • Vintage cohort • Override anomalies',
    what: 'Detects loans classified in a lower SLFRS 9 stage than their feature combination warrants — identifying understated provisions across the portfolio.',
    required: ['loan_id','exposure_lkr','assigned_stage','dpd_days','collateral_ratio'],
    optional: ['restructure_count','sector','branch_code','override_flag','origination_quarter','customer_risk_rating'],
    columnDefs: {
      loan_id: 'Unique loan reference (e.g. NTB-CR-2025-0441)',
      exposure_lkr: 'Outstanding balance in LKR',
      assigned_stage: 'Current SLFRS 9 stage — 1, 2, or 3',
      dpd_days: 'Days past due at analysis date',
      collateral_ratio: 'Collateral value ÷ exposure. 0.0–1.5+',
      restructure_count: 'Times the loan has been restructured',
      sector: 'Sector e.g. Construction, Agriculture, Consumer',
      branch_code: 'Originating branch code e.g. BR-14',
      override_flag: 'true or false — was this approval override-approved?',
      origination_quarter: 'Quarter originated e.g. 2025-Q3',
      customer_risk_rating: 'Internal rating 1 (low) – 5 (high)',
    },
    sampleRows: [
      { loan_id:'NTB-CR-2025-0441', exposure_lkr:'287000000', assigned_stage:'1', dpd_days:'67', collateral_ratio:'0.38', restructure_count:'2', sector:'Construction', branch_code:'BR-14', override_flag:'true', origination_quarter:'2025-Q3' },
      { loan_id:'NTB-CR-2025-0872', exposure_lkr:'144000000', assigned_stage:'2', dpd_days:'88', collateral_ratio:'0.52', restructure_count:'0', sector:'Agriculture', branch_code:'BR-56', override_flag:'false', origination_quarter:'2025-Q2' },
      { loan_id:'NTB-CR-2025-1203', exposure_lkr:'198000000', assigned_stage:'1', dpd_days:'0',  collateral_ratio:'0.81', restructure_count:'0', sector:'Construction', branch_code:'BR-23', override_flag:'true', origination_quarter:'2025-Q4' },
      { loan_id:'NTB-CR-2025-0334', exposure_lkr:'76000000',  assigned_stage:'1', dpd_days:'12', collateral_ratio:'0.74', restructure_count:'0', sector:'SME Manufacturing', branch_code:'BR-14', override_flag:'true', origination_quarter:'2025-Q3' },
      { loan_id:'NTB-CR-2025-1567', exposure_lkr:'112000000', assigned_stage:'2', dpd_days:'45', collateral_ratio:'0.41', restructure_count:'2', sector:'Hospitality', branch_code:'BR-41', override_flag:'false', origination_quarter:'2024-Q4' },
      { loan_id:'NTB-CR-2025-0918', exposure_lkr:'93000000',  assigned_stage:'1', dpd_days:'29', collateral_ratio:'0.68', restructure_count:'0', sector:'Trade & Services', branch_code:'BR-16', override_flag:'false', origination_quarter:'2025-Q1' },
      { loan_id:'NTB-CR-2025-2041', exposure_lkr:'67000000',  assigned_stage:'1', dpd_days:'7',  collateral_ratio:'0.77', restructure_count:'0', sector:'SME Manufacturing', branch_code:'BR-14', override_flag:'true', origination_quarter:'2025-Q3' },
    ],
  },
  {
    id: 'transaction', name: 'Transaction Surveillance', color: '#3D3C38', bg: '#F0F0EE', icon: '⟳',
    tagline: 'Structuring detection • Benford\'s Law • STR eligibility',
    what: 'Scans transactions for deliberate structuring below the LKR 5M STR threshold, velocity anomalies, and hub-and-spoke routing patterns consistent with layering.',
    required: ['transaction_id','account_id','amount_lkr','transaction_type','timestamp'],
    optional: ['channel','counterparty_account','counterparty_bank','city','device_id'],
    columnDefs: {
      transaction_id: 'Unique transaction reference',
      account_id: 'Account that initiated the transaction',
      amount_lkr: 'Transaction amount in LKR',
      transaction_type: 'CEFT / RTGS / ATM / POS / Transfer',
      timestamp: 'ISO datetime — YYYY-MM-DDTHH:MM:SS',
      channel: 'Digital / Branch / ATM / Mobile',
      counterparty_account: 'Beneficiary account number',
      counterparty_bank: 'Beneficiary bank name',
      city: 'City from IP geolocation or branch',
      device_id: 'Device fingerprint hash',
    },
    sampleRows: [
      { transaction_id:'TXN-20251220-0001', account_id:'NTB-0841-X', amount_lkr:'4950000', transaction_type:'CEFT', timestamp:'2025-12-20T23:47:02', channel:'Digital', counterparty_account:'SAM-9921-A', counterparty_bank:'Sampath Bank', city:'Colombo' },
      { transaction_id:'TXN-20251220-0002', account_id:'NTB-0841-X', amount_lkr:'4870000', transaction_type:'CEFT', timestamp:'2025-12-20T23:48:15', channel:'Digital', counterparty_account:'SAM-9921-A', counterparty_bank:'Sampath Bank', city:'Colombo' },
      { transaction_id:'TXN-20251220-0003', account_id:'NTB-0841-X', amount_lkr:'4920000', transaction_type:'CEFT', timestamp:'2025-12-20T23:49:31', channel:'Digital', counterparty_account:'SAM-9921-B', counterparty_bank:'Sampath Bank', city:'Colombo' },
      { transaction_id:'TXN-20251220-0004', account_id:'NTB-3312-B', amount_lkr:'4890000', transaction_type:'CEFT', timestamp:'2025-12-20T14:22:07', channel:'Digital', counterparty_account:'COM-1122-X', counterparty_bank:'Commercial Bank', city:'Kandy' },
      { transaction_id:'TXN-20251220-0005', account_id:'SUS-017',    amount_lkr:'8700000', transaction_type:'RTGS', timestamp:'2025-12-20T09:14:22', channel:'Digital', counterparty_account:'EXT-4412-R', counterparty_bank:'HNB', city:'Colombo' },
      { transaction_id:'TXN-20251219-0041', account_id:'NTB-7741-C', amount_lkr:'9800000', transaction_type:'RTGS', timestamp:'2025-12-19T02:21:03', channel:'Digital', counterparty_account:'EXT-8833-K', counterparty_bank:'BOC', city:'Gampaha' },
      { transaction_id:'TXN-20251218-0088', account_id:'NTB-5523-D', amount_lkr:'4980000', transaction_type:'CEFT', timestamp:'2025-12-18T11:04:55', channel:'Digital', counterparty_account:'PAN-0021-Z', counterparty_bank:'Pan Asia Bank', city:'Colombo' },
    ],
  },
  {
    id: 'suspense', name: 'Suspense & Reconciliation', color: '#993C1D', bg: '#FAECE7', icon: '⊟',
    tagline: 'Phantom receivables • Aging tiers • CEFT fraud',
    what: 'Identifies accounts where balance growth significantly outpaces clearing activity — the definitive phantom receivable signature. Flags CBSL 90-day guideline breaches.',
    required: ['account_id','account_type','branch_code','current_balance_lkr','aging_days'],
    optional: ['growth_rate_30d_pct','clearing_ratio','inflow_lkr_30d','outflow_lkr_30d','balance_30d_ago_lkr'],
    columnDefs: {
      account_id: 'Suspense or nostro account ID',
      account_type: 'CEFT Receivables / Fee Suspense / NOSTRO / Clearing',
      branch_code: 'Owning branch code',
      current_balance_lkr: 'Current unreconciled balance in LKR',
      aging_days: 'Days since oldest unreconciled entry',
      growth_rate_30d_pct: 'Balance % growth over last 30 days',
      clearing_ratio: 'Outflows ÷ inflows in period. 0.95+ is healthy',
      inflow_lkr_30d: 'Total inflows in last 30 days',
      outflow_lkr_30d: 'Total outflows in last 30 days',
      balance_30d_ago_lkr: 'Balance 30 days ago for trend calculation',
    },
    sampleRows: [
      { account_id:'SUS-017', account_type:'CEFT Receivables', branch_code:'BR-72', current_balance_lkr:'1240000000', aging_days:'94', growth_rate_30d_pct:'312', clearing_ratio:'0.08', inflow_lkr_30d:'940000000', outflow_lkr_30d:'75000000', balance_30d_ago_lkr:'301000000' },
      { account_id:'SUS-031', account_type:'CEFT Receivables', branch_code:'BR-16', current_balance_lkr:'340000000', aging_days:'38', growth_rate_30d_pct:'187', clearing_ratio:'0.21', inflow_lkr_30d:'220000000', outflow_lkr_30d:'46000000', balance_30d_ago_lkr:'118000000' },
      { account_id:'SUS-044', account_type:'Fee Suspense',     branch_code:'BR-14', current_balance_lkr:'87000000',  aging_days:'67', growth_rate_30d_pct:'44',  clearing_ratio:'0.41', inflow_lkr_30d:'22000000',  outflow_lkr_30d:'9000000',  balance_30d_ago_lkr:'60000000' },
      { account_id:'NOS-USD-01', account_type:'NOSTRO USD',   branch_code:'BR-16', current_balance_lkr:'710000000', aging_days:'12', growth_rate_30d_pct:'8',   clearing_ratio:'0.87', inflow_lkr_30d:'180000000', outflow_lkr_30d:'157000000', balance_30d_ago_lkr:'657000000' },
      { account_id:'SUS-082', account_type:'Fee Suspense',     branch_code:'BR-23', current_balance_lkr:'97000000',  aging_days:'22', growth_rate_30d_pct:'120', clearing_ratio:'0.44', inflow_lkr_30d:'53000000',  outflow_lkr_30d:'23000000',  balance_30d_ago_lkr:'44000000' },
      { account_id:'SUS-101', account_type:'CEFT Receivables', branch_code:'BR-41', current_balance_lkr:'34000000',  aging_days:'8',  growth_rate_30d_pct:'12',  clearing_ratio:'0.91', inflow_lkr_30d:'28000000',  outflow_lkr_30d:'25000000',  balance_30d_ago_lkr:'30000000' },
    ],
  },
  {
    id: 'kyc', name: 'Identity & KYC / AML', color: '#0F6E56', bg: '#E1F5EE', icon: '✦',
    tagline: '47-rule CDD engine • PEP screening • Beneficial ownership',
    what: 'Applies a 47-rule compliance framework to identify KYC gaps, expired documents, PEP accounts without current EDD, and FATF high-risk jurisdiction exposure.',
    required: ['customer_id','risk_rating','kyc_last_refresh_date','account_open_date'],
    optional: ['pep_flag','country_of_origin','entity_type','introducer_code','beneficial_owner_disclosed','dormant_flag'],
    columnDefs: {
      customer_id: 'Unique customer reference',
      risk_rating: 'high / medium / low',
      kyc_last_refresh_date: 'Date of last KYC refresh — YYYY-MM-DD',
      account_open_date: 'Account opening date — YYYY-MM-DD',
      pep_flag: 'true or false — Politically Exposed Person',
      country_of_origin: 'ISO 2-letter country code e.g. LK, PK',
      entity_type: 'Individual / Company / Partnership / Trust',
      introducer_code: 'Introducer staff or agent code',
      beneficial_owner_disclosed: 'true or false — for legal entities',
      dormant_flag: 'true or false — dormant >12 months',
    },
    sampleRows: [
      { customer_id:'NTB-C-0041-X', risk_rating:'high',   kyc_last_refresh_date:'2024-01-15', account_open_date:'2018-03-22', pep_flag:'true',  country_of_origin:'LK', entity_type:'Individual', introducer_code:'INT-BR14-007', beneficial_owner_disclosed:'true',  dormant_flag:'false' },
      { customer_id:'NTB-C-3312-B', risk_rating:'high',   kyc_last_refresh_date:'2023-06-10', account_open_date:'2020-11-05', pep_flag:'false', country_of_origin:'LK', entity_type:'Company',    introducer_code:'INT-BR16-003', beneficial_owner_disclosed:'false', dormant_flag:'false' },
      { customer_id:'NTB-C-7741-C', risk_rating:'medium', kyc_last_refresh_date:'2023-02-28', account_open_date:'2019-07-14', pep_flag:'false', country_of_origin:'LK', entity_type:'Individual', introducer_code:'INT-BR23-012', beneficial_owner_disclosed:'true',  dormant_flag:'false' },
      { customer_id:'NTB-C-8834-G', risk_rating:'high',   kyc_last_refresh_date:'2022-09-01', account_open_date:'2021-04-18', pep_flag:'false', country_of_origin:'PK', entity_type:'Individual', introducer_code:'INT-BR72-001', beneficial_owner_disclosed:'true',  dormant_flag:'false' },
      { customer_id:'NTB-C-5521-D', risk_rating:'medium', kyc_last_refresh_date:'2024-08-20', account_open_date:'2017-01-09', pep_flag:'false', country_of_origin:'LK', entity_type:'Individual', introducer_code:'INT-BR41-008', beneficial_owner_disclosed:'true',  dormant_flag:'true'  },
      { customer_id:'NTB-C-2209-F', risk_rating:'high',   kyc_last_refresh_date:'2024-03-11', account_open_date:'2022-06-30', pep_flag:'true',  country_of_origin:'LK', entity_type:'Individual', introducer_code:'INT-BR14-007', beneficial_owner_disclosed:'true',  dormant_flag:'false' },
    ],
  },
  {
    id: 'controls', name: 'Internal Controls', color: '#3A5A3A', bg: '#E8FDF4', icon: '⚙',
    tagline: 'SoD violations • Override concentration • Branch scoring',
    what: 'Detects Segregation of Duties violations where the same staff member both initiates and approves. Scores each branch on a 6-dimension composite to identify insider fraud risk.',
    required: ['transaction_id','branch_code','initiator_id','approver_id','amount_lkr','transaction_type','timestamp'],
    optional: ['override_flag','approval_time_minutes','customer_id','loan_id'],
    columnDefs: {
      transaction_id: 'Unique transaction reference',
      branch_code: 'Branch where transaction originated',
      initiator_id: 'Staff ID who initiated the transaction',
      approver_id: 'Staff ID who approved — SoD violation if same as initiator',
      amount_lkr: 'Transaction amount in LKR',
      transaction_type: 'Loan Disbursement / CEFT / RTGS / Account Open',
      timestamp: 'ISO datetime of approval',
      override_flag: 'true or false — was standard control overridden',
      approval_time_minutes: 'Minutes from initiation to approval. <2 mins = suspicious',
      customer_id: 'Related customer ID (optional)',
      loan_id: 'Related loan ID (optional)',
    },
    sampleRows: [
      { transaction_id:'TXN-BR14-20251104-0441', branch_code:'BR-14', initiator_id:'STF-1847', approver_id:'STF-1847', amount_lkr:'8700000',  transaction_type:'Loan Disbursement', timestamp:'2025-11-04T21:43:00', override_flag:'true',  approval_time_minutes:'1' },
      { transaction_id:'TXN-BR14-20251118-0872', branch_code:'BR-14', initiator_id:'STF-1847', approver_id:'STF-1847', amount_lkr:'14200000', transaction_type:'Loan Disbursement', timestamp:'2025-11-18T22:11:00', override_flag:'true',  approval_time_minutes:'2' },
      { transaction_id:'TXN-BR14-20251212-0334', branch_code:'BR-14', initiator_id:'STF-1847', approver_id:'STF-1847', amount_lkr:'11900000', transaction_type:'Loan Disbursement', timestamp:'2025-12-12T20:58:00', override_flag:'true',  approval_time_minutes:'1' },
      { transaction_id:'TXN-BR23-20251207-1203', branch_code:'BR-23', initiator_id:'STF-2341', approver_id:'STF-2341', amount_lkr:'4100000',  transaction_type:'CEFT',             timestamp:'2025-12-07T15:22:00', override_flag:'false', approval_time_minutes:'2' },
      { transaction_id:'TXN-BR41-20251201-0088', branch_code:'BR-41', initiator_id:'STF-3312', approver_id:'STF-3401', amount_lkr:'2800000',  transaction_type:'CEFT',             timestamp:'2025-12-01T10:44:00', override_flag:'false', approval_time_minutes:'8' },
      { transaction_id:'TXN-BR14-20251208-0778', branch_code:'BR-14', initiator_id:'STF-1847', approver_id:'STF-1847', amount_lkr:'9300000',  transaction_type:'Loan Disbursement', timestamp:'2025-12-08T21:17:00', override_flag:'true',  approval_time_minutes:'1' },
    ],
  },
  {
    id: 'digital', name: 'Digital Fraud & Identity', color: '#993556', bg: '#FBEAF0', icon: '⊕',
    tagline: 'Behavioral biometrics • Impossible travel • ATO detection',
    what: 'Compares each session\'s behavioral biometric score against the user\'s historical baseline. Detects impossible travel, unregistered devices initiating high-value transfers, and device sharing across multiple accounts.',
    required: ['session_id','account_id','device_id','login_city','behavioral_score','timestamp'],
    optional: ['is_registered_device','mfa_triggered','mfa_passed','previous_session_city','minutes_since_last_session','transaction_count','max_transaction_lkr'],
    columnDefs: {
      session_id: 'Unique session identifier',
      account_id: 'Account that logged in',
      device_id: 'Device fingerprint hash',
      login_city: 'City from IP geolocation',
      behavioral_score: 'Biometric match 0–100. 100 = perfect match to baseline',
      timestamp: 'Session start datetime — ISO format',
      is_registered_device: 'true or false — seen before for this account',
      mfa_triggered: 'true or false — step-up auth was required',
      mfa_passed: 'true or false — step-up auth succeeded',
      previous_session_city: 'City of the immediately preceding session',
      minutes_since_last_session: 'Minutes elapsed since last login',
      transaction_count: 'Number of transactions in this session',
      max_transaction_lkr: 'Largest single transaction in session',
    },
    sampleRows: [
      { session_id:'SES-NTB-20251220-8847', account_id:'NTB-0841-X',   device_id:'DEV-F221-1199', login_city:'Colombo',   behavioral_score:'28', timestamp:'2025-12-20T23:47:00', is_registered_device:'false', mfa_triggered:'true',  mfa_passed:'false', previous_session_city:'Colombo',   minutes_since_last_session:'4320', transaction_count:'0', max_transaction_lkr:'0' },
      { session_id:'SES-NTB-20251218-9121', account_id:'NTB-3312-B',   device_id:'DEV-B882-4412', login_city:'Colombo',   behavioral_score:'61', timestamp:'2025-12-18T14:50:00', is_registered_device:'true',  mfa_triggered:'true',  mfa_passed:'true',  previous_session_city:'Jaffna',    minutes_since_last_session:'18',   transaction_count:'2', max_transaction_lkr:'14800000' },
      { session_id:'SES-NTB-20251215-7734', account_id:'NTB-7741-C',   device_id:'DEV-C331-7721', login_city:'Gampaha',   behavioral_score:'44', timestamp:'2025-12-15T02:17:00', is_registered_device:'false', mfa_triggered:'true',  mfa_passed:'true',  previous_session_city:'Gampaha',   minutes_since_last_session:'8640', transaction_count:'1', max_transaction_lkr:'9800000' },
      { session_id:'SES-NTB-20251210-6612', account_id:'NTB-STF-1847', device_id:'DEV-A4F7-9921', login_city:'Ratnapura', behavioral_score:'57', timestamp:'2025-12-10T21:43:00', is_registered_device:'true',  mfa_triggered:'false', mfa_passed:'true',  previous_session_city:'Ratnapura', minutes_since_last_session:'780',  transaction_count:'0', max_transaction_lkr:'0' },
      { session_id:'SES-NTB-20251220-4421', account_id:'NTB-8834-G',   device_id:'DEV-A4F7-9921', login_city:'Colombo',   behavioral_score:'72', timestamp:'2025-12-20T11:22:00', is_registered_device:'false', mfa_triggered:'false', mfa_passed:'true',  previous_session_city:'Colombo',   minutes_since_last_session:'120',  transaction_count:'3', max_transaction_lkr:'4800000' },
    ],
  },
  {
    id: 'trade', name: 'Trade Finance & Treasury', color: '#3B6D11', bg: '#EAF3DE', icon: '◎',
    tagline: 'Invoice forensics • TBML • LCR/NSFR monitoring',
    what: 'Benchmarks declared unit prices against HS code industry medians to detect over/under-invoicing. Identifies duplicate LC applications on overlapping shipment periods and treasury limit breaches.',
    required: ['document_id','customer_id','hs_code','declared_unit_price','invoice_currency','counterparty_country'],
    optional: ['commodity_description','quantity','lc_reference','shipment_period_start','shipment_period_end','invoice_amount_lkr','position_id','currency_pair','position_amount','approved_limit','trader_id'],
    columnDefs: {
      document_id: 'Invoice or LC document reference',
      customer_id: 'NTB customer or corporate ID',
      hs_code: 'Harmonised System commodity code',
      declared_unit_price: 'Price per unit in invoice currency',
      invoice_currency: 'ISO currency code — USD, EUR, etc.',
      counterparty_country: 'ISO 2-letter country code of overseas counterparty',
      commodity_description: 'Human-readable commodity name',
      quantity: 'Number of units',
      lc_reference: 'Letter of Credit reference number',
      shipment_period_start: 'Start of shipment window — YYYY-MM-DD',
      shipment_period_end: 'End of shipment window — YYYY-MM-DD',
      invoice_amount_lkr: 'Total invoice in LKR equivalent',
      position_id: 'Treasury FX position ID',
      currency_pair: 'FX pair e.g. USD/LKR',
      position_amount: 'Position size in base currency',
      approved_limit: 'Approved limit in base currency',
      trader_id: 'Trader staff ID',
    },
    sampleRows: [
      { document_id:'INV-2025-3441', customer_id:'NTB-CORP-0887', hs_code:'6203', declared_unit_price:'34.70', invoice_currency:'USD', counterparty_country:'AE', commodity_description:"Men's apparel", quantity:'5000', lc_reference:'LC-2025-3341', shipment_period_start:'2025-11-01', shipment_period_end:'2025-12-31', invoice_amount_lkr:'530000000' },
      { document_id:'INV-2025-3687', customer_id:'NTB-CORP-0887', hs_code:'6203', declared_unit_price:'33.90', invoice_currency:'USD', counterparty_country:'AE', commodity_description:"Men's apparel", quantity:'4800', lc_reference:'LC-2025-3687', shipment_period_start:'2025-11-15', shipment_period_end:'2025-12-31', invoice_amount_lkr:'517000000' },
      { document_id:'INV-2025-4112', customer_id:'NTB-CORP-2341', hs_code:'0901', declared_unit_price:'2.10',  invoice_currency:'USD', counterparty_country:'DE', commodity_description:'Coffee unroasted', quantity:'20000', lc_reference:'LC-2025-4002', shipment_period_start:'2025-12-01', shipment_period_end:'2026-01-31', invoice_amount_lkr:'126000000' },
      { document_id:'INV-2025-5881', customer_id:'NTB-CORP-4412', hs_code:'7108', declared_unit_price:'28.00', invoice_currency:'USD', counterparty_country:'SG', commodity_description:'Gold unwrought', quantity:'3000', lc_reference:'LC-2025-5701', shipment_period_start:'2025-12-10', shipment_period_end:'2026-02-28', invoice_amount_lkr:'252000000' },
      { document_id:'INV-2025-2201', customer_id:'NTB-CORP-1122', hs_code:'4011', declared_unit_price:'42.50', invoice_currency:'USD', counterparty_country:'CN', commodity_description:'Rubber tyres', quantity:'1200', lc_reference:'LC-2025-2201', shipment_period_start:'2025-10-01', shipment_period_end:'2025-11-30', invoice_amount_lkr:'153000000' },
    ],
  },
  {
    id: 'insider', name: 'Insider Risk', color: '#2D2D2B', bg: '#F3F1FF', icon: '◉',
    tagline: 'Staff access logs • override patterns • approval timing',
    what: 'Scores every staff member with system access on 6 insider fraud dimensions — SoD violations, override concentration, same-cluster approvals, off-hours activity, approval turnaround anomaly, and session behavioral deviation.',
    required: ['staff_id','branch_code','transaction_id','role','initiator_flag','approver_flag','timestamp','amount_lkr'],
    optional: ['override_flag','approval_time_minutes','session_id','login_city','device_id','is_registered_device','customer_id','loan_id'],
    columnDefs: {
      staff_id: 'Staff member unique ID — e.g. STF-1847',
      branch_code: 'Branch where activity occurred — e.g. BR-14',
      transaction_id: 'Transaction reference being initiated/approved',
      role: 'Staff role — e.g. Relationship Manager, Branch Manager',
      initiator_flag: 'true if this staff member initiated the transaction',
      approver_flag: 'true if this staff member approved the transaction',
      timestamp: 'ISO datetime of the action — YYYY-MM-DDTHH:MM:SS',
      amount_lkr: 'Transaction amount in LKR',
      override_flag: 'true if an override was applied',
      approval_time_minutes: 'Minutes elapsed from initiation to approval',
      session_id: 'Login session ID at time of action',
      login_city: 'City inferred from login IP address',
      device_id: 'Device fingerprint ID',
      is_registered_device: 'true if device is pre-registered to this staff member',
      customer_id: 'Customer account affected',
      loan_id: 'Loan ID if credit transaction',
    },
    sampleRows: [
      { staff_id:'STF-1847', branch_code:'BR-14', transaction_id:'TXN-2025-441A', role:'Relationship Manager', initiator_flag:'true',  approver_flag:'true',  timestamp:'2025-12-20T21:43:00', amount_lkr:'14500000', override_flag:'true',  approval_time_minutes:'1.2', session_id:'SES-NTB-20251210-6612', login_city:'Ratnapura', device_id:'DEV-RMB14-001', is_registered_device:'true', customer_id:'NTB-C-0441', loan_id:'NTB-CR-2025-0441' },
      { staff_id:'STF-1847', branch_code:'BR-14', transaction_id:'TXN-2025-872B', role:'Relationship Manager', initiator_flag:'true',  approver_flag:'true',  timestamp:'2025-12-20T22:11:00', amount_lkr:'12200000', override_flag:'true',  approval_time_minutes:'1.4', session_id:'SES-NTB-20251210-6612', login_city:'Ratnapura', device_id:'DEV-RMB14-001', is_registered_device:'true', customer_id:'NTB-C-0872', loan_id:'NTB-CR-2025-0872' },
      { staff_id:'STF-2341', branch_code:'BR-23', transaction_id:'TXN-2025-334C', role:'Senior Credit Officer', initiator_flag:'false', approver_flag:'true',  timestamp:'2025-12-19T14:22:00', amount_lkr:'8400000',  override_flag:'true',  approval_time_minutes:'8.7', session_id:'SES-NTB-20251219-2234', login_city:'Embilipitiya', device_id:'DEV-SCO23-004', is_registered_device:'true', customer_id:'NTB-C-3341', loan_id:'NTB-CR-2025-0334' },
      { staff_id:'STF-1109', branch_code:'BR-11', transaction_id:'TXN-2025-621D', role:'Branch Manager', initiator_flag:'false', approver_flag:'true',  timestamp:'2025-12-18T10:15:00', amount_lkr:'21300000', override_flag:'false', approval_time_minutes:'24.3',session_id:'SES-NTB-20251218-8891', login_city:'Batticaloa', device_id:'DEV-BM11-002', is_registered_device:'true', customer_id:'NTB-C-6210', loan_id:'NTB-CR-2025-0621' },
      { staff_id:'STF-0771', branch_code:'BR-56', transaction_id:'TXN-2025-918E', role:'Relationship Manager', initiator_flag:'true',  approver_flag:'false', timestamp:'2025-12-17T09:30:00', amount_lkr:'9300000',  override_flag:'false', approval_time_minutes:null, session_id:'SES-NTB-20251217-7712', login_city:'Matara', device_id:'DEV-RM56-007', is_registered_device:'true', customer_id:'NTB-C-9180', loan_id:'NTB-CR-2025-0918' },
    ],
  },
  {
    id: 'mje', name: 'MJE Testing', color: '#0BBF7A', bg: '#ECFEFF', icon: '⊞',
    tagline: 'Manual journal entries • GL accounts • maker-checker',
    what: 'Full-population testing of all manual journal entries. Scores each entry on timing anomalies, amount patterns (Benford, round numbers), GL account sensitivity, maker-checker SoD, and supporting document completeness.',
    required: ['entry_id','gl_account','gl_name','amount_lkr','debit_credit','entry_date','entry_time','maker_id','approver_id'],
    optional: ['description','cost_centre','period','document_ref','is_reversal','reversal_of','authorisation_level','is_automated'],
    columnDefs: {
      entry_id: 'Unique MJE reference — e.g. MJE-2026-4201',
      gl_account: 'General Ledger account code',
      gl_name: 'Human-readable GL account name',
      amount_lkr: 'Entry amount in LKR (absolute value)',
      debit_credit: 'Dr or Cr — debit or credit side of entry',
      entry_date: 'Date of posting — YYYY-MM-DD',
      entry_time: 'Time of posting — HH:MM:SS',
      maker_id: 'Staff ID who created the entry',
      approver_id: 'Staff ID who approved the entry',
      description: 'Narrative description of the entry purpose',
      cost_centre: 'Cost centre or branch code',
      period: 'Accounting period — e.g. 2025-12',
      document_ref: 'Supporting document reference — leave blank if none',
      is_reversal: 'true if this entry reverses a prior entry',
      reversal_of: 'entry_id of the original entry being reversed',
      authorisation_level: 'Required auth level — standard, senior, director',
      is_automated: 'true if generated by an automated system (not manual)',
    },
    sampleRows: [
      { entry_id:'MJE-2026-4201', gl_account:'SUS-001',         gl_name:'CEFT Receivables Suspense',   amount_lkr:'185000000', debit_credit:'Dr', entry_date:'2025-12-31', entry_time:'23:47:00', maker_id:'STF-1847', approver_id:'STF-1847', description:'Month-end CEFT clearing adjustment', cost_centre:'BR-14', period:'2025-12', document_ref:'',             is_reversal:'false', reversal_of:'',             authorisation_level:'senior',   is_automated:'false' },
      { entry_id:'MJE-2026-4202', gl_account:'SUS-044',         gl_name:'Fee Suspense BR-14',          amount_lkr:'9450000',   debit_credit:'Cr', entry_date:'2025-12-31', entry_time:'23:52:00', maker_id:'STF-1847', approver_id:'STF-1847', description:'Fee accrual reversal',            cost_centre:'BR-14', period:'2025-12', document_ref:'',             is_reversal:'true',  reversal_of:'MJE-2025-3981', authorisation_level:'standard', is_automated:'false' },
      { entry_id:'MJE-2026-4203', gl_account:'4100-PROV',       gl_name:'Loan Loss Provision',        amount_lkr:'45000000',  debit_credit:'Cr', entry_date:'2025-12-30', entry_time:'17:14:00', maker_id:'STF-2210', approver_id:'STF-0441', description:'Q4 2025 SLFRS 9 ECL provision',  cost_centre:'HEAD', period:'2025-12', document_ref:'ECL-RPT-Q4-2025', is_reversal:'false', reversal_of:'',             authorisation_level:'director', is_automated:'false' },
      { entry_id:'MJE-2026-4204', gl_account:'1200-LOANS',      gl_name:'Loans Receivable',           amount_lkr:'120000000', debit_credit:'Dr', entry_date:'2025-12-31', entry_time:'00:03:00', maker_id:'STF-1847', approver_id:'STF-1847', description:'Loan balance adjustment',         cost_centre:'BR-14', period:'2025-12', document_ref:'',             is_reversal:'false', reversal_of:'',             authorisation_level:'director', is_automated:'false' },
      { entry_id:'MJE-2026-4205', gl_account:'3300-INT-INCOME', gl_name:'Interest Income Accrual',    amount_lkr:'2340000',   debit_credit:'Cr', entry_date:'2025-12-29', entry_time:'09:45:00', maker_id:'STF-3312', approver_id:'STF-0888', description:'December interest accrual',       cost_centre:'HEAD', period:'2025-12', document_ref:'INT-ACC-DEC',     is_reversal:'false', reversal_of:'',             authorisation_level:'standard', is_automated:'false' },
    ],
  },
];

// ─── UTILS ────────────────────────────────────────────────────────────────────

function toCsv(rows) {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  return [headers.join(','), ...rows.map(r => headers.map(h => `"${String(r[h] ?? '').replace(/"/g,'""')}"`).join(','))].join('\n');
}

function downloadCsv(rows, filename) {
  const blob = new Blob([toCsv(rows)], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  Object.assign(document.createElement('a'), { href: url, download: filename }).click();
  URL.revokeObjectURL(url);
}

function fmtNum(v) {
  const n = Number(v);
  if (isNaN(n)) return v;
  if (Math.abs(n) >= 1e9) return (n/1e9).toFixed(2)+'B';
  if (Math.abs(n) >= 1e6) return (n/1e6).toFixed(1)+'M';
  if (Math.abs(n) >= 1e3) return (n/1e3).toFixed(1)+'K';
  return n % 1 !== 0 ? n.toFixed(2) : String(n);
}

function isNumericCol(col, rows) {
  return rows.slice(0,5).every(r => r[col] !== undefined && r[col] !== '' && !isNaN(Number(r[col])));
}

// ─── SCROLLABLE DATA TABLE ────────────────────────────────────────────────────

function DataTable({ rows, color, maxRows = 7, highlightRequired = [], label }) {
  const [showAll, setShowAll] = useState(false);
  if (!rows.length) return null;
  const cols = Object.keys(rows[0]);
  const display = showAll ? rows : rows.slice(0, maxRows);

  return (
    <div style={{ borderRadius: 10, border: '1px solid var(--color-border)', overflow: 'hidden' }}>
      {label && (
        <div style={{ padding:'10px 14px', background:'var(--color-surface-2)', borderBottom:'1px solid var(--color-border)', fontSize:11, fontWeight:600, color:'var(--color-text-2)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span>{label}</span>
          <span style={{ fontWeight:400, color:'var(--color-text-3)' }}>{rows.length} rows</span>
        </div>
      )}
      <div style={{ overflowX:'auto' }}>
        <table className="data-table" style={{ minWidth: cols.length * 120 }}>
          <thead>
            <tr>
              {cols.map(col => (
                <th key={col} style={{ whiteSpace:'nowrap', fontSize:11, background:'var(--color-surface-2)' }}>
                  <span style={{ color: highlightRequired.includes(col) ? color : 'var(--color-text-2)', fontWeight: highlightRequired.includes(col) ? 600 : 400 }}>{col}</span>
                  {highlightRequired.includes(col) && <span style={{ color, fontSize:9, marginLeft:2 }}>*</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {display.map((row, i) => (
              <tr key={i}>
                {cols.map(col => {
                  const v = row[col] ?? '—';
                  const isNum = isNumericCol(col, rows);
                  const isBool = v === 'true' || v === 'false';
                  return (
                    <td key={col} style={{ fontSize:12, whiteSpace:'nowrap', fontFamily: isNum ? 'monospace' : 'inherit', color: v === 'true' && col.includes('flag') ? '#3A5A3A' : v === 'false' ? 'var(--color-text-3)' : 'inherit', textAlign: isNum ? 'right' : 'left' }}>
                      {isNum && !isBool ? fmtNum(v) : String(v)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length > maxRows && (
        <button onClick={() => setShowAll(!showAll)} style={{ width:'100%', padding:'8px', fontSize:12, color:'var(--color-text-2)', background:'var(--color-surface-2)', border:'none', borderTop:'1px solid var(--color-border)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
          {showAll ? <><EyeOff size={13}/>Show less</> : <><Eye size={13}/>Show all {rows.length} rows</>}
        </button>
      )}
    </div>
  );
}

// ─── UPLOAD PANEL ─────────────────────────────────────────────────────────────

function UploadPanel({ agent }) {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [parseError, setParseError] = useState(null);
  const [mapping, setMapping] = useState({});
  const [needsMapping, setNeedsMapping] = useState(false);
  const [parsedCols, setParsedCols] = useState([]);

  const uploaded = state.uploadedData[agent.id];
  const loading = state.agentLoading[agent.id];
  const error = state.agentErrors[agent.id];
  const result = state.agentResults[agent.id];
  const hasKey = state.apiKey && state.apiKeyStatus === 'valid';

  function processFile(file) {
    setParseError(null); setNeedsMapping(false); setMapping({});
    Papa.parse(file, {
      header: true, skipEmptyLines: true,
      complete: (res) => {
        if (!res.data.length) { setParseError('File appears empty — check it has a header row and data rows.'); return; }
        const fileCols = Object.keys(res.data[0]);
        setParsedCols(fileCols);
        const normalise = s => s.toLowerCase().replace(/[\s\-]/g,'_');
        const missing = agent.required.filter(r => !fileCols.some(c => normalise(c) === normalise(r)));
        if (missing.length > 0) {
          // Try auto-mapping
          const autoMap = {};
          agent.required.forEach(req => {
            const match = fileCols.find(c => normalise(c) === normalise(req));
            autoMap[req] = match || '';
          });
          setMapping(autoMap);
          setNeedsMapping(true);
          setParsedCols(fileCols);
          dispatch({ type: 'UPLOAD_DATA', agentId: agent.id, rows: res.data.slice(0,2000), filename: file.name });
        } else {
          dispatch({ type: 'UPLOAD_DATA', agentId: agent.id, rows: res.data.slice(0,2000), filename: file.name });
          dispatch({ type: 'SET_MODE', agentId: agent.id, payload: 'live' });
        }
      },
      error: () => setParseError('CSV parse failed. Ensure the file uses comma separators and UTF-8 encoding.'),
    });
  }

  async function runAgent() {
    if (!hasKey) { dispatch({ type: 'TOGGLE_SETTINGS' }); return; }
    let rows = uploaded?.rows;
    if (needsMapping) {
      rows = rows.map(row => {
        const out = {};
        Object.entries(mapping).forEach(([req, col]) => { if (col) out[req] = row[col]; });
        Object.keys(row).forEach(k => { if (!Object.values(mapping).includes(k)) out[k] = row[k]; });
        return out;
      });
    }
    if (!rows?.length) return;
    dispatch({ type: 'AGENT_LOADING', agentId: agent.id });
    setNeedsMapping(false);
    try {
      const res = await axios.post(`/api/agent/${agent.id}`, { data: rows }, { headers: { 'x-api-key': state.apiKey }, timeout: 120000 });
      dispatch({ type: 'AGENT_SUCCESS', agentId: agent.id, payload: res.data.result });
      dispatch({ type: 'SET_MODE', agentId: agent.id, payload: 'live' });
    } catch (err) {
      dispatch({ type: 'AGENT_ERROR', agentId: agent.id, payload: err.response?.data?.error || err.message });
    }
  }

  function clear() {
    dispatch({ type: 'CLEAR_UPLOAD', agentId: agent.id });
    setParseError(null); setNeedsMapping(false); setMapping({});
  }

  // ── State: analysis complete ──
  if (result) {
    const findings = result.key_findings?.length || 0;
    const critical = result.key_findings?.filter(f => f.severity === 'critical').length || 0;
    return (
      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
        <div style={{ padding:'16px 20px', background:'var(--color-green-light)', border:'1px solid rgba(59,109,17,0.25)', borderRadius:12 }}>
          <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:10 }}>
            <CheckCircle size={20} style={{ color:'var(--color-green)', flexShrink:0 }} />
            <div>
              <div style={{ fontSize:14, fontWeight:700, color:'var(--color-green)' }}>Analysis complete</div>
              <div style={{ fontSize:12, color:'var(--color-text-2)' }}>{uploaded?.rows?.length} rows · {findings} finding{findings!==1?'s':''}{critical>0?` · ${critical} critical`:''}</div>
            </div>
          </div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            <button onClick={() => navigate(`/agents/${agent.id}`)} className="btn btn-primary" style={{ background:agent.color, fontSize:13, display:'flex', alignItems:'center', gap:6 }}>
              <ChevronRight size={15}/>View full results in agent module
            </button>
            <button onClick={clear} className="btn btn-secondary btn-sm" style={{ display:'flex', alignItems:'center', gap:5 }}>
              <RefreshCw size={12}/>Upload new file
            </button>
          </div>
        </div>
        {result.key_findings?.slice(0,2).map((f, i) => (
          <div key={i} style={{ padding:'12px 14px', background: f.severity==='critical'?'var(--color-red-light)':'#E8FDF4', borderRadius:8, fontSize:12, color: f.severity==='critical'?'var(--color-red)':'#3A5A3A', lineHeight:1.5 }}>
            <strong>{f.severity.toUpperCase()}:</strong> {f.finding.substring(0,180)}...
          </div>
        ))}
      </div>
    );
  }

  // ── State: loading ──
  if (loading) {
    return (
      <div style={{ padding:'32px 24px', textAlign:'center', border:'1px solid var(--color-border)', borderRadius:12, background:'var(--color-surface-2)' }}>
        <div className="spinner" style={{ width:28, height:28, margin:'0 auto 16px' }} />
        <div style={{ fontSize:14, fontWeight:600, marginBottom:6 }}>Agent running analysis…</div>
        <div style={{ fontSize:12, color:'var(--color-text-2)', lineHeight:1.6, maxWidth:280, margin:'0 auto' }}>
          Claude is reviewing your data against the {agent.name} detection framework. This typically takes 30–90 seconds.
        </div>
      </div>
    );
  }

  // ── State: uploaded, awaiting run ──
  if (uploaded) {
    return (
      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
        {/* File pill */}
        <div style={{ display:'flex', gap:10, alignItems:'center', padding:'12px 14px', background:`${agent.color}0C`, border:`1px solid ${agent.color}33`, borderRadius:10 }}>
          <CheckCircle size={16} style={{ color:agent.color, flexShrink:0 }} />
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:13, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{uploaded.filename}</div>
            <div style={{ fontSize:11, color:'var(--color-text-2)' }}>{uploaded.rows.length} rows loaded · {uploaded.rows.length > 2000 ? 'capped at 2,000 rows' : 'all rows'}</div>
          </div>
          <button onClick={clear} style={{ color:'var(--color-text-3)', cursor:'pointer', padding:4, flexShrink:0 }}><Trash2 size={14}/></button>
        </div>

        {/* Column mapping if needed */}
        {needsMapping && (
          <div style={{ padding:'14px 16px', background:'#E8FDF4', border:'1px solid rgba(133,79,11,0.2)', borderRadius:10 }}>
            <div style={{ fontSize:12, fontWeight:600, color:'#3A5A3A', marginBottom:10, display:'flex', alignItems:'center', gap:6 }}>
              <AlertCircle size={14}/>Column names don't match exactly — please map them below
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {agent.required.map(req => (
                <div key={req} style={{ display:'flex', alignItems:'center', gap:8, fontSize:12 }}>
                  <code style={{ minWidth:160, padding:'3px 8px', background:`${agent.color}12`, borderRadius:4, color:agent.color, fontSize:11 }}>{req} *</code>
                  <ArrowRight size={12} style={{ color:'var(--color-text-3)', flexShrink:0 }} />
                  <select value={mapping[req]||''} onChange={e => setMapping(m=>({...m,[req]:e.target.value}))} style={{ flex:1 }}>
                    <option value="">— not mapped —</option>
                    {parsedCols.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Uploaded data preview */}
        <DataTable rows={uploaded.rows} color={agent.color} maxRows={5} highlightRequired={agent.required} label="Your uploaded data — preview" />

        {/* Error */}
        {error && (
          <div style={{ padding:'10px 14px', background:'var(--color-red-light)', border:'1px solid rgba(163,45,45,0.2)', borderRadius:8, fontSize:12, color:'var(--color-red)', display:'flex', gap:8 }}>
            <AlertCircle size={14} style={{ flexShrink:0, marginTop:1 }}/>{error}
          </div>
        )}

        {/* API key warning */}
        {!hasKey && (
          <div style={{ padding:'10px 14px', background:'#E8FDF4', border:'1px solid rgba(133,79,11,0.2)', borderRadius:8, fontSize:12, color:'#3A5A3A', display:'flex', gap:8, alignItems:'center' }}>
            <AlertCircle size={13} style={{ flexShrink:0 }}/>
            API key required to run.&nbsp;
            <button onClick={() => dispatch({ type:'TOGGLE_SETTINGS' })} style={{ fontWeight:700, color:'#3A5A3A', cursor:'pointer', textDecoration:'underline', background:'none', border:'none', padding:0 }}>Configure →</button>
          </div>
        )}

        {/* Run button */}
        <button
          onClick={runAgent}
          disabled={!hasKey || (needsMapping && agent.required.some(r => !mapping[r]))}
          style={{ width:'100%', padding:'14px', fontSize:14, fontWeight:700, color:'white', background: (!hasKey || (needsMapping && agent.required.some(r=>!mapping[r]))) ? 'var(--color-text-3)' : agent.color, border:'none', borderRadius:10, cursor: (!hasKey || (needsMapping && agent.required.some(r=>!mapping[r]))) ? 'not-allowed' : 'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, transition:'all 0.15s', boxShadow: hasKey ? `0 4px 14px ${agent.color}44` : 'none' }}
        >
          <Zap size={16}/> Run {agent.name} Agent on Your Data
        </button>
        <div style={{ fontSize:11, color:'var(--color-text-3)', textAlign:'center' }}>
          Your data is sent directly to the Anthropic API and is never stored on any server
        </div>
      </div>
    );
  }

  // ── State: empty — show drop zone ──
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
      {parseError && (
        <div style={{ padding:'10px 14px', background:'var(--color-red-light)', border:'1px solid rgba(163,45,45,0.2)', borderRadius:8, fontSize:12, color:'var(--color-red)', display:'flex', gap:8, alignItems:'flex-start' }}>
          <AlertCircle size={14} style={{ flexShrink:0, marginTop:1 }}/>{parseError}
        </div>
      )}
      <div
        onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) processFile(f); }}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => fileRef.current?.click()}
        style={{ border:`2px dashed ${dragOver ? agent.color : 'var(--color-border-strong)'}`, borderRadius:12, padding:'36px 24px', textAlign:'center', cursor:'pointer', transition:'all 0.15s', background: dragOver ? `${agent.color}06` : 'transparent' }}
      >
        <div style={{ width:52, height:52, borderRadius:14, background:`${agent.color}14`, border:`1px solid ${agent.color}33`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px', fontSize:24, color:agent.color }}>
          <Upload size={24}/>
        </div>
        <div style={{ fontSize:14, fontWeight:600, marginBottom:6 }}>Drop your CSV file here</div>
        <div style={{ fontSize:12, color:'var(--color-text-2)', marginBottom:4 }}>or click to browse files</div>
        <div style={{ fontSize:11, color:'var(--color-text-3)' }}>CSV format · headers required · up to 2,000 rows</div>
        <input ref={fileRef} type="file" accept=".csv" style={{ display:'none' }} onChange={e => { if (e.target.files[0]) processFile(e.target.files[0]); }} />
      </div>

      {!hasKey && (
        <div style={{ padding:'10px 14px', background:'var(--color-surface-2)', border:'1px solid var(--color-border)', borderRadius:8, fontSize:12, color:'var(--color-text-2)', display:'flex', gap:8, alignItems:'center' }}>
          <AlertCircle size={13} style={{ flexShrink:0 }}/>
          You'll need an Anthropic API key to run analysis after upload.&nbsp;
          <button onClick={() => dispatch({ type:'TOGGLE_SETTINGS' })} style={{ fontWeight:600, color:'var(--color-blue)', cursor:'pointer', textDecoration:'underline', background:'none', border:'none', padding:0 }}>Configure key →</button>
        </div>
      )}
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function DataHub() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [activeAgent, setActiveAgent] = useState('credit');
  const [bulkRunning, setBulkRunning] = useState(false);
  const [bulkDone, setBulkDone] = useState(false);

  const agent = AGENTS.find(a => a.id === activeAgent);
  const uploadedCount = AGENTS.filter(a => state.uploadedData[a.id]?.rows?.length > 0).length;
  const resultCount = AGENTS.filter(a => state.agentResults[a.id]).length;
  const pendingCount = AGENTS.filter(a => state.uploadedData[a.id]?.rows?.length > 0 && !state.agentResults[a.id]).length;

  async function runAllUploaded() {
    if (!state.apiKey) { dispatch({ type:'TOGGLE_SETTINGS' }); return; }
    const toRun = AGENTS.filter(a => state.uploadedData[a.id]?.rows?.length > 0 && !state.agentResults[a.id]);
    if (!toRun.length) return;
    setBulkRunning(true);
    for (const ag of toRun) {
      dispatch({ type:'BULK_PROGRESS', agentId:ag.id, status:'running' });
      dispatch({ type:'AGENT_LOADING', agentId:ag.id });
      try {
        const res = await axios.post(`/api/agent/${ag.id}`, { data: state.uploadedData[ag.id].rows }, { headers:{ 'x-api-key': state.apiKey }, timeout:120000 });
        dispatch({ type:'AGENT_SUCCESS', agentId:ag.id, payload:res.data.result });
        dispatch({ type:'BULK_PROGRESS', agentId:ag.id, status:'done' });
      } catch(err) {
        dispatch({ type:'AGENT_ERROR', agentId:ag.id, payload:err.response?.data?.error||err.message });
        dispatch({ type:'BULK_PROGRESS', agentId:ag.id, status:'error' });
      }
    }
    setBulkRunning(false); setBulkDone(true);
  }

  const agentPath = agent => `/agents/${agent.id}`;

  return (
    <div style={{ maxWidth:1400 }}>
      {/* ── Header ── */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:24, gap:16, flexWrap:'wrap' }}>
        <div>
          <h2 style={{ marginBottom:6 }}>Data Hub</h2>
          <p style={{ fontSize:13, color:'var(--color-text-2)', lineHeight:1.6, maxWidth:640 }}>
            Each tab shows the exact schema an agent expects, sample NTB reference data you can download as a CSV template, and an upload zone to bring your own data — then run any agent against it directly.
          </p>
        </div>
        {pendingCount > 0 && (
          <button onClick={runAllUploaded} disabled={bulkRunning} className="btn btn-primary" style={{ fontSize:13, display:'flex', alignItems:'center', gap:8, padding:'10px 20px', flexShrink:0, boxShadow:'0 4px 14px rgba(26,25,23,0.15)' }}>
            {bulkRunning ? <><span className="spinner" style={{ width:14, height:14 }}/>Running {pendingCount} agent{pendingCount>1?'s':''}…</> : <><Zap size={16}/>Run {pendingCount} Uploaded Agent{pendingCount>1?'s':''}</>}
          </button>
        )}
      </div>

      {/* ── Agent status strip ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(9, 1fr)', gap:8, marginBottom:20 }}>
        {AGENTS.map(ag => {
          const up = state.uploadedData[ag.id];
          const res = state.agentResults[ag.id];
          const loading = state.agentLoading[ag.id];
          const prog = state.bulkProgress[ag.id];
          const isActive = activeAgent === ag.id;
          const dotColor = res ? '#3B6D11' : (up || loading || prog==='running') ? ag.color : 'transparent';
          return (
            <button key={ag.id} onClick={() => setActiveAgent(ag.id)} style={{ padding:'12px 10px', background: isActive ? `${ag.color}10` : 'var(--color-surface)', border:`1px solid ${isActive ? ag.color+'55' : 'var(--color-border)'}`, borderRadius:10, cursor:'pointer', transition:'all 0.15s', borderTop:`3px solid ${isActive ? ag.color : 'transparent'}`, textAlign:'left' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
                <span style={{ fontSize:16 }}>{ag.icon}</span>
                {(up || res || loading) && <span style={{ width:7, height:7, borderRadius:'50%', background:dotColor, display:'block', marginTop:2, ...(loading||prog==='running' ? { animation:'pulse 1.5s ease-in-out infinite' } : {}) }} />}
              </div>
              <div style={{ fontSize:11, fontWeight:600, color: isActive ? ag.color : 'var(--color-text)', lineHeight:1.3 }}>{ag.name.split(' ').slice(0,2).join(' ')}</div>
              <div style={{ fontSize:10, color:'var(--color-text-3)', marginTop:3 }}>
                {res ? '✓ Results ready' : loading||prog==='running' ? 'Running…' : up ? `${up.rows.length} rows` : 'No data'}
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Bulk done banner ── */}
      {bulkDone && resultCount > 0 && (
        <div className="animate-fade-in" style={{ marginBottom:20, padding:'16px 20px', background:'linear-gradient(135deg, #F0FDF4, #ECFDF5)', border:'1px solid rgba(59,109,17,0.3)', borderRadius:10, display:'flex', gap:16, alignItems:'center' }}>
          <CheckCircle size={20} style={{ color:'#16A34A', flexShrink:0 }}/>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:14, fontWeight:700, color:'#15803D', marginBottom:4 }}>{resultCount} of {AGENTS.length} agents completed analysis</div>
            <div style={{ display:'flex', gap:16, fontSize:12, color:'#166534' }}>
              <span>📋 {AGENTS.reduce((s,a) => s + (state.agentResults[a.id]?.key_findings?.length || 0), 0)} total findings</span>
              {AGENTS.reduce((s,a) => s + (state.agentResults[a.id]?.key_findings?.filter(f=>f.severity==='critical')?.length || 0), 0) > 0 && (
                <span style={{ fontWeight:700, color:'#DC2626' }}>🔴 {AGENTS.reduce((s,a) => s + (state.agentResults[a.id]?.key_findings?.filter(f=>f.severity==='critical')?.length || 0), 0)} critical — immediate action required</span>
              )}
            </div>
          </div>
          <button onClick={() => navigate('/command-centre')} className="btn btn-sm" style={{ background:'var(--color-green)', color:'white', border:'none', display:'flex', alignItems:'center', gap:5, flexShrink:0 }}>
            Command Centre <ChevronRight size={12}/>
          </button>
        </div>
      )}

      {/* ── Main content: two-column ── */}
      {agent && (
        <div className="animate-fade-in" key={agent.id} style={{ display:'grid', gridTemplateColumns:'1fr 440px', gap:20, alignItems:'start' }}>

          {/* LEFT — Schema + Sample reference */}
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {/* Agent identity */}
            <div style={{ padding:'20px 24px', background:'var(--color-surface)', border:'1px solid var(--color-border)', borderRadius:14, borderTop:`3px solid ${agent.color}` }}>
              <div style={{ display:'flex', gap:14, alignItems:'flex-start', marginBottom:14 }}>
                <div style={{ width:44, height:44, borderRadius:12, background:agent.bg, border:`1px solid ${agent.color}33`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, color:agent.color, flexShrink:0 }}>{agent.icon}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:16, fontWeight:700, marginBottom:3 }}>{agent.name}</div>
                  <div style={{ fontSize:12, color:'var(--color-text-2)', marginBottom:6 }}>{agent.tagline}</div>
                  <div style={{ fontSize:12, color:'var(--color-text-2)', lineHeight:1.6 }}>{agent.what}</div>
                </div>
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={() => downloadCsv(agent.sampleRows, `sentinel-template-${agent.id}.csv`)} className="btn btn-secondary btn-sm" style={{ display:'flex', alignItems:'center', gap:5 }}>
                  <Download size={13}/>Download CSV template
                </button>
                <button onClick={() => navigate(`/agents/${agent.id}`)} className="btn btn-sm" style={{ background:agent.color, color:'white', border:'none', display:'flex', alignItems:'center', gap:5 }}>
                  Open agent module <ChevronRight size={12}/>
                </button>
              </div>
            </div>

            {/* Schema */}
            <div style={{ padding:'20px 24px', background:'var(--color-surface)', border:'1px solid var(--color-border)', borderRadius:14 }}>
              <div style={{ fontSize:12, fontWeight:700, color:'var(--color-text-2)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:14, display:'flex', alignItems:'center', gap:7 }}>
                Column Schema
                <InfoTooltip text="Required columns must be present in your CSV. Optional columns improve analysis accuracy but won't cause errors if absent. Column names are case-insensitive and underscores/spaces are interchangeable." width={300} position="right" />
              </div>
              <div style={{ marginBottom:12 }}>
                <div style={{ fontSize:10, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:agent.color, marginBottom:8 }}>Required — must be in your CSV</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                  {agent.required.map(col => (
                    <span key={col} style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:12, fontWeight:500, padding:'5px 10px', background:agent.bg, color:agent.color, border:`1px solid ${agent.color}33`, borderRadius:6 }}>
                      {col}
                      <InfoTooltip text={agent.columnDefs[col]||col} position="top" width={220} />
                    </span>
                  ))}
                </div>
              </div>
              {agent.optional.length > 0 && (
                <div>
                  <div style={{ fontSize:10, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--color-text-3)', marginBottom:8 }}>Optional — improves accuracy</div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                    {agent.optional.map(col => (
                      <span key={col} style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:12, padding:'4px 10px', background:'var(--color-surface-2)', color:'var(--color-text-2)', border:'1px solid var(--color-border)', borderRadius:6 }}>
                        {col}
                        {agent.columnDefs[col] && <InfoTooltip text={agent.columnDefs[col]} position="top" width={220} />}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sample data */}
            <div style={{ padding:'20px 24px', background:'var(--color-surface)', border:'1px solid var(--color-border)', borderRadius:14 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
                <div style={{ fontSize:12, fontWeight:700, color:'var(--color-text-2)', textTransform:'uppercase', letterSpacing:'0.07em', display:'flex', alignItems:'center', gap:7 }}>
                  Reference Sample Data
                  <InfoTooltip text="This is what your data should look like. Use the column names and data types shown here as a template. Download the CSV template to get a pre-formatted starter file." position="right" />
                </div>
                <span style={{ fontSize:11, color:'var(--color-text-3)' }}>NTB FY 2025 · grounded demo data</span>
              </div>
              <DataTable rows={agent.sampleRows} color={agent.color} maxRows={7} highlightRequired={agent.required} />
            </div>
          </div>

          {/* RIGHT — Upload + run */}
          <div style={{ position:'sticky', top:20, display:'flex', flexDirection:'column', gap:16 }}>
            <div style={{ padding:'22px 24px', border:`2px solid ${agent.color}33`, borderRadius:14, backgroundImage:`linear-gradient(135deg, ${agent.bg}40 0%, var(--color-surface) 60%)` }}>
              <div style={{ fontSize:15, fontWeight:700, marginBottom:4, display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:18 }}>{agent.icon}</span> Your Data
              </div>
              <div style={{ fontSize:12, color:'var(--color-text-2)', lineHeight:1.6, marginBottom:18 }}>
                Upload a CSV matching the schema on the left. After upload you'll see a preview of your data, then run the agent with one click. Your key findings will appear directly in the agent module.
              </div>
              <UploadPanel agent={agent} />
            </div>

            {/* Workflow steps (only when no data uploaded) */}
            {!state.uploadedData[agent.id] && !state.agentResults[agent.id] && (
              <div style={{ padding:'16px 20px', background:'var(--color-surface)', border:'1px solid var(--color-border)', borderRadius:12 }}>
                <div style={{ fontSize:11, fontWeight:700, color:'var(--color-text-3)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:12 }}>How it works</div>
                {[
                  { n:'1', title:'Download template', body:'Get a pre-formatted CSV with the right column headers for this agent.' },
                  { n:'2', title:'Fill with your data', body:'Replace the sample rows with your bank\'s actual records. Keep the column names.' },
                  { n:'3', title:'Upload & preview', body:'Drop the file above. You\'ll see a preview of your data before running.' },
                  { n:'4', title:'Run agent', body:'Claude analyses your data using the same detection framework as the demo. Findings appear instantly.' },
                ].map((s, i) => (
                  <div key={i} style={{ display:'flex', gap:12, padding:'8px 0', borderBottom: i<3 ? '1px solid var(--color-border)' : 'none' }}>
                    <div style={{ width:24, height:24, borderRadius:'50%', background:`${agent.color}15`, border:`1px solid ${agent.color}33`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:agent.color, flexShrink:0 }}>{s.n}</div>
                    <div>
                      <div style={{ fontSize:12, fontWeight:600, marginBottom:2 }}>{s.title}</div>
                      <div style={{ fontSize:11, color:'var(--color-text-2)', lineHeight:1.5 }}>{s.body}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

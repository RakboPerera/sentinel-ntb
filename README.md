# Sentinel by Octave
### Agentic AI Audit Intelligence Platform for Nations Trust Bank PLC

---

## Overview

Sentinel is a full-stack agentic AI platform that runs 7 specialised audit agents against bank data, detects anomalies, and surfaces cross-domain correlations. Built on Claude claude-sonnet-4-20250514.

**Agents:**
- Credit Intelligence — SLFRS 9 staging anomalies, vintage cohort analysis
- Transaction Surveillance — Benford's Law, structuring detection, AML
- Suspense & Reconciliation — phantom receivable detection, CBSL aging
- Identity & KYC / AML — 47-rule CDD compliance engine
- Internal Controls — SoD violations, override concentration, insider fraud
- Digital Fraud & Identity — behavioral biometrics, impossible travel, ATO
- Trade Finance & Treasury — TBML, over-invoicing, FX position limits

---

## Local Development

```bash
# 1. Install dependencies
cd backend && npm install
cd ../frontend && npm install

# 2. Run backend (port 8000)
cd backend && node server.js

# 3. Run frontend (port 5173) — in separate terminal
cd frontend && npm run dev
```

Navigate to `http://localhost:5173`. Enter your Anthropic API key in Settings (top right).

---

## Deployment on Render

This repo is configured for one-click Render deployment via `render.yaml`.

1. Push this repo to GitHub
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your GitHub repo
4. Render auto-detects `render.yaml` — no manual config needed
5. Deploy

**No environment variables required** — the Anthropic API key is entered by the user at runtime in the UI and sent per-request. It is never stored server-side.

---

## Architecture

```
sentinel-ntb/
├── backend/
│   ├── server.js          # Express server, serves frontend/dist in prod
│   ├── routes/
│   │   ├── agents.js      # POST /api/agent/:agentName
│   │   └── orchestrator.js # POST /api/orchestrate
│   └── prompts/           # System prompts for each agent
│       ├── credit.js
│       ├── transaction.js
│       ├── suspense.js
│       ├── kyc.js
│       ├── internalControls.js
│       ├── digitalFraud.js
│       ├── tradeTreasury.js
│       └── orchestrator.js
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── context/AppContext.jsx
│   │   ├── data/demoData.js      # NTB FY2025 demo data
│   │   ├── pages/                # Agent pages, Command Centre, etc.
│   │   └── components/           # Shared UI components
│   └── vite.config.js
├── sample-data/                  # Sample CSVs for testing live agents
├── render.yaml                   # Render deployment config
└── package.json
```

---

## Sample Data

The `sample-data/` folder contains 7 CSV files (one per agent) with realistic NTB-style data including embedded anomalies for testing. Upload via the Data Hub → select agent tab → upload CSV → Run Agent.

---

## Tech Stack

- **Frontend:** React 18, Vite, Recharts, D3, Lucide
- **Backend:** Node.js 20, Express
- **AI:** Anthropic Claude claude-sonnet-4-20250514 (claude-sonnet-4-20250514)
- **Deploy:** Render (single web service)

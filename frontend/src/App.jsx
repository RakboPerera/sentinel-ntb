import React, { useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar.jsx';
import Header from './components/layout/Header.jsx';
import ApiKeySettings from './components/shared/ApiKeySettings.jsx';
import GlobalFindingDrawer from './components/shared/GlobalFindingDrawer.jsx';
import { useApp } from './context/AppContext.jsx';
import './styles/platform.css';
import './styles/intro.css';

// Pages
import Intro from './pages/Intro/Intro.jsx';
import CommandCentre from './pages/CommandCentre/CommandCentre.jsx';
import AgentNetwork from './pages/AgentNetwork/AgentNetwork.jsx';
import CreditAgent from './pages/Agents/CreditAgent.jsx';
import TransactionAgent from './pages/Agents/TransactionAgent.jsx';
import SuspenseAgent from './pages/Agents/SuspenseAgent.jsx';
import KYCAgent from './pages/Agents/KYCAgent.jsx';
import InternalControlsAgent from './pages/Agents/InternalControlsAgent.jsx';
import DigitalFraudAgent from './pages/Agents/DigitalFraudAgent.jsx';
import TradeTreasuryAgent from './pages/Agents/TradeTreasuryAgent.jsx';
import ScenarioLab from './pages/ScenarioLab/ScenarioLab.jsx';
import ScenarioPlayer from './pages/ScenarioLab/ScenarioPlayer.jsx';
import CaseManager from './pages/CaseManager/CaseManager.jsx';
import Reports from './pages/Reports/Reports.jsx';
import DataHub from './pages/DataHub/DataHub.jsx';
import RiskHeatmap from './pages/RiskHeatmap/RiskHeatmap.jsx';
import InsiderRiskAgent from './pages/Agents/InsiderRiskAgent.jsx';
import MJEAgent from './pages/Agents/MJEAgent.jsx';
import RiskRegister from './pages/RiskRegister/RiskRegister.jsx';

// ─── ERROR BOUNDARY ──────────────────────────────────────────────────────────
class ErrorBoundary extends React.Component {
  constructor(props) { 
    super(props); 
    this.state = { hasError: false, retried: false }; 
    this._retryTimer = null;
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error, info) { 
    console.error('Sentinel render error:', error, info?.componentStack?.split('\n').slice(0,3).join(' '));
    // Auto-retry once after 50ms — clears transient first-render errors
    if (!this.state.retried) {
      this._retryTimer = setTimeout(() => this.setState({ hasError: false, retried: true }), 50);
    }
  }
  componentWillUnmount() { clearTimeout(this._retryTimer); }
  render() {
    if (this.state.hasError) return null; // silent — auto-retries in 50ms
    return this.props.children;
  }
}


function PlatformLayout({ children, title }) {
  const { state } = useApp();
  return (
    <div className="platform-layout">
      <Sidebar />
      <div className="main-content">
        <Header title={title} />
        <main className="page-content animate-fade-in">
          {children}
        </main>
      </div>
      {state.settingsOpen && <ApiKeySettings />}
      <ErrorBoundary><GlobalFindingDrawer /></ErrorBoundary>
    </div>
  );
}

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const isIntro = location.pathname === '/';

  // Register navigate globally so nested components can use it for case drill-through
  React.useEffect(() => {
    window._sentinelNavigate = navigate;
    return () => { window._sentinelNavigate = null; };
  }, [navigate]);

  useEffect(() => {
    if (isIntro) {
      document.body.classList.add('intro-mode');
    } else {
      document.body.classList.remove('intro-mode');
    }
  }, [isIntro]);

  return (
    <Routes>
      <Route path="/" element={<Intro />} />

      <Route path="/command-centre" element={
        <PlatformLayout title="Command Centre">
          <CommandCentre />
        </PlatformLayout>
      } />

      <Route path="/agents" element={
        <PlatformLayout title="Agent Network">
          <AgentNetwork />
        </PlatformLayout>
      } />

      <Route path="/agents/credit" element={
        <PlatformLayout title="Credit Intelligence Agent">
          <CreditAgent />
        </PlatformLayout>
      } />
      <Route path="/agents/transaction" element={
        <PlatformLayout title="Transaction Surveillance Agent">
          <TransactionAgent />
        </PlatformLayout>
      } />
      <Route path="/agents/suspense" element={
        <PlatformLayout title="Suspense & Reconciliation Agent">
          <SuspenseAgent />
        </PlatformLayout>
      } />
      <Route path="/agents/kyc" element={
        <PlatformLayout title="Identity, KYC & AML Agent">
          <KYCAgent />
        </PlatformLayout>
      } />
      <Route path="/agents/controls" element={
        <PlatformLayout title="Internal Controls Agent">
          <InternalControlsAgent />
        </PlatformLayout>
      } />
      <Route path="/agents/digital" element={
        <PlatformLayout title="Digital Fraud & Identity Agent">
          <DigitalFraudAgent />
        </PlatformLayout>
      } />
      <Route path="/agents/trade" element={
        <PlatformLayout title="Trade Finance & Treasury Agent">
          <TradeTreasuryAgent />
        </PlatformLayout>
      } />

      <Route path="/scenarios" element={
        <PlatformLayout title="Scenario Lab">
          <ScenarioLab />
        </PlatformLayout>
      } />
      <Route path="/scenarios/:scenarioId" element={
        <PlatformLayout title="Scenario Player">
          <ScenarioPlayer />
        </PlatformLayout>
      } />

      <Route path="/cases" element={
        <PlatformLayout title="Case Manager">
          <CaseManager />
        </PlatformLayout>
      } />
      <Route path="/data" element={
        <PlatformLayout title="Data Hub">
          <DataHub />
        </PlatformLayout>
      } />

      <Route path="/agents/mje" element={
        <PlatformLayout title="MJE Testing Agent">
          <MJEAgent />
        </PlatformLayout>
      } />

      <Route path="/agents/insider-risk" element={
        <PlatformLayout title="Insider Risk Agent">
          <InsiderRiskAgent />
        </PlatformLayout>
      } />

      <Route path="/heatmap" element={
        <PlatformLayout title="Risk Heatmap">
          <RiskHeatmap />
        </PlatformLayout>
      } />

      <Route path="/risk-register" element={
        <PlatformLayout><RiskRegister /></PlatformLayout>
      } />
      <Route path="/reports" element={
        <PlatformLayout title="Reports">
          <Reports />
        </PlatformLayout>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

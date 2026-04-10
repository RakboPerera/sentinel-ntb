import React, { createContext, useContext, useReducer } from 'react';

const AppContext = createContext(null);

const initialState = {
  apiKey: '',
  apiKeyStatus: 'unconfigured', // 'unconfigured' | 'valid' | 'invalid'
  settingsOpen: false,
  activeMode: {}, // { [agentId]: 'demo' | 'live' }
  agentResults: {}, // { [agentId]: resultObject }
  agentLoading: {}, // { [agentId]: boolean }
  agentErrors: {}, // { [agentId]: string }
  orchestratorResult: null,
  orchestratorLoading: false,
  cases: [], // auto-generated from agent findings
  activeScenario: null,
  scenarioStep: 0,
  scenarioRunning: false,
  uploadedData: {}, // { [agentId]: { rows: [], filename: '', uploadedAt: '' } }
  bulkRunning: false,
  bulkProgress: {},
  activeFinding: null, // { finding, agentId, agentName, agentColor, agentData }
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_API_KEY':
      return { ...state, apiKey: action.payload, apiKeyStatus: action.payload ? 'valid' : 'unconfigured' };
    case 'SET_API_KEY_STATUS':
      return { ...state, apiKeyStatus: action.payload };
    case 'TOGGLE_SETTINGS':
      return { ...state, settingsOpen: !state.settingsOpen };
    case 'CLOSE_SETTINGS':
      return { ...state, settingsOpen: false };
    case 'SET_MODE':
      return { ...state, activeMode: { ...state.activeMode, [action.agentId]: action.payload } };
    case 'AGENT_LOADING':
      return { ...state, agentLoading: { ...state.agentLoading, [action.agentId]: true }, agentErrors: { ...state.agentErrors, [action.agentId]: null } };
    case 'AGENT_SUCCESS': {
      const newCases = generateCases(action.agentId, action.payload);
      return {
        ...state,
        agentResults: { ...state.agentResults, [action.agentId]: action.payload },
        agentLoading: { ...state.agentLoading, [action.agentId]: false },
        cases: mergeCases(state.cases, newCases),
      };
    }
    case 'AGENT_ERROR':
      return { ...state, agentLoading: { ...state.agentLoading, [action.agentId]: false }, agentErrors: { ...state.agentErrors, [action.agentId]: action.payload } };
    case 'ORCHESTRATOR_LOADING':
      return { ...state, orchestratorLoading: true };
    case 'ORCHESTRATOR_SUCCESS':
      return { ...state, orchestratorResult: action.payload, orchestratorLoading: false };
    case 'ORCHESTRATOR_ERROR':
      return { ...state, orchestratorLoading: false };
    case 'SET_SCENARIO':
      return { ...state, activeScenario: action.payload, scenarioStep: 0, scenarioRunning: false };
    case 'SCENARIO_STEP':
      return { ...state, scenarioStep: action.payload };
    case 'SCENARIO_RUNNING':
      return { ...state, scenarioRunning: action.payload };
    case 'UPLOAD_DATA':
      return { ...state, uploadedData: { ...state.uploadedData, [action.agentId]: { rows: action.rows, filename: action.filename, uploadedAt: new Date().toISOString() } } };
    case 'CLEAR_UPLOAD':
      return { ...state, uploadedData: { ...state.uploadedData, [action.agentId]: null } };
    case 'BULK_RUNNING':
      return { ...state, bulkRunning: action.payload };
    case 'BULK_PROGRESS':
      return { ...state, bulkProgress: { ...state.bulkProgress, [action.agentId]: action.status } };
    case 'OPEN_FINDING':
      return { ...state, activeFinding: action.payload };
    case 'CLOSE_FINDING':
      return { ...state, activeFinding: null };
    case 'ADD_CASE':
      return { ...state, cases: [...state.cases, action.payload] };
    case 'UPDATE_CASE':
      return { ...state, cases: state.cases.map(c => c.id === action.payload.id ? { ...c, ...action.payload } : c) };
    default:
      return state;
  }
}

function generateCases(agentId, result) {
  const cases = [];
  const now = new Date().toISOString();
  const findings = result?.key_findings || [];
  findings.filter(f => f.severity === 'critical' || f.severity === 'high').forEach((f, i) => {
    cases.push({
      id: `CASE-${agentId.toUpperCase()}-${Date.now()}-${i}`,
      agentId,
      title: f.finding.substring(0, 80),
      severity: f.severity,
      status: 'open',
      createdAt: now,
      updatedAt: now,
      description: f.finding,
      recommendedAction: f.recommended_action,
      exposureLkr: f.affected_exposure_lkr || f.affected_balance_lkr || 0,
      evidence: result,
      slaHours: f.severity === 'critical' ? 4 : 24,
    });
  });
  return cases;
}

function mergeCases(existing, newCases) {
  const existingIds = new Set(existing.map(c => c.agentId + c.title));
  const filtered = newCases.filter(c => !existingIds.has(c.agentId + c.title));
  return [...existing, ...filtered];
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

import React, { useState } from 'react';
import { ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import AgentModule from '../../components/shared/AgentModule.jsx';
import { StatCard, VisualFindingCard, InsightBox, PanelWithMethod, MetricSpotlight, VerdictCard, HeatStrip, SignalMatrix, ComparisonSplit } from '../../components/shared/VisualComponents.jsx';
import ExplainerBox from '../../components/shared/ExplainerBox.jsx';
import InfoTooltip from '../../components/shared/InfoTooltip.jsx';
import useOpenFinding from '../../hooks/useOpenFinding.js';
import { demoData } from '../../data/demoData.js';

const COLOR = '#993556';
const SCHEMA = [{ field:'session_id',type:'string' },{ field:'account_id',type:'string' },{ field:'behavioral_score',type:'number' },{ field:'device_registered',type:'boolean' },{ field:'ip_country',type:'string' },{ field:'impossible_travel',type:'boolean' }];

function BehavioralGauge({ score }) {
  const pct = Math.round(score * 100);
  const color = pct >= 80 ? '#C41E3A' : pct >= 50 ? '#4A6070' : '#0BBF7A';
  const angle = -135 + (pct / 100) * 270;
  return (
    <div style={{ textAlign:'center', padding:'8px 0' }}>
      <svg width={100} height={60} viewBox="0 0 100 60">
        <path d="M 10 55 A 40 40 0 0 1 90 55" fill="none" stroke="var(--color-border)" strokeWidth={8} strokeLinecap="round"/>
        <path d="M 10 55 A 40 40 0 0 1 90 55" fill="none" stroke={color} strokeWidth={8} strokeLinecap="round"
          strokeDasharray={`${(pct/100)*125.6} 125.6`} />
        <text x="50" y="52" textAnchor="middle" fontSize="16" fontWeight="900" fill={color} fontFamily="var(--font-display)">{pct}</text>
      </svg>
      <div style={{ fontSize:9, color:'var(--color-text-3)', textTransform:'uppercase', letterSpacing:'0.06em', marginTop:-4 }}>Risk Score</div>
    </div>
  );
}

export default function DigitalFraudAgent() {
  const [expandedSession, setExpandedSession] = useState(null);
  const openFinding = useOpenFinding('digital');

  return (
    <AgentModule agentId="digital" agentName="Digital Fraud & Identity Agent" agentColor={COLOR} demoData={demoData.digital} schema={SCHEMA}>
      {(data) => {
        const ds = data.digital_summary || {};
        const ps = data.population_shift || {};

        return (
          <>
            <ExplainerBox color={COLOR} icon="⊕"
              title="How this agent detects account takeover and digital fraud"
              summary="Each user has a behavioral biometric baseline from 14 months of session history. The agent scores every new session against that baseline — combining device fingerprint, geographic velocity, and transaction pattern."
              detail="Three detection layers: (1) Behavioral biometrics — does this session look like you? (2) Geographic velocity — could you physically travel that fast? (3) Device fingerprinting — is this device shared across multiple accounts?"
              collapsible />

            {/* Audit Opinion */}
            <div style={{ background:'#99355606', border:'1px solid #99355622', borderRadius:10, overflow:'hidden' }}>
              <div style={{ padding:'12px 16px', display:'flex', gap:10, alignItems:'flex-start' }}>
                <div style={{ fontSize:10, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.08em', padding:'3px 9px', borderRadius:5, background:'#993556', color:'white', flexShrink:0, marginTop:2 }}>QUALIFIED</div>
                <div style={{ fontSize:12, color:'#993556', lineHeight:1.7 }}>In our opinion, the digital fraud detection environment is PARTIALLY EFFECTIVE. Behavioral biometrics detected 4 high-risk sessions. Impossible travel confirmed in 2 cases. PSI 0.14 indicates model drift requiring recalibration ahead of HSBC migration.</div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', borderTop:'1px solid #99355618' }}>
                {[['Population tested','148,247 authenticated sessions (100%)'],['Period covered','FY 2025 (Jan–Dec)'],['Materiality threshold','Sessions with behavioral score &lt;50; impossible travel within same day'],['Model limitations','Behavioral baseline requires 90-day history; HSBC migrated accounts have reduced baseline confidence']].map(([k,v],i)=>(
                  <div key={i} style={{ padding:'7px 16px', borderRight:i%2===0?'1px solid #99355612':'none', borderBottom:i<2?'1px solid #99355612':'none' }}>
                    <div style={{ fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'#993556', opacity:0.65, marginBottom:2 }}>{k}</div>
                    <div style={{ fontSize:11, color:'#993556', lineHeight:1.5 }} dangerouslySetInnerHTML={{__html:v}} />
                  </div>
                ))}
              </div>
            </div>

            {/* Hero metrics */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
              <MetricSpotlight value={(ds.total_sessions_analyzed||0).toLocaleString()} label="Sessions Analysed" sub={`${ds.anomalous_session_count||0} anomalous`} color={COLOR} icon="⊕" />
              <MetricSpotlight value={ds.critical_sessions||0} label="Critical Sessions" sub="Behavioral score < 30" color="#C41E3A" trend="Immediate review" trendDir="up" />
              <MetricSpotlight value={ds.impossible_travel_cases||0} label="Impossible Travel" sub="Geographic impossibility" color="#4A6070" />
              <MetricSpotlight value={ps.psi_score?.toFixed(2)||'0.14'} label="Model PSI" sub={ps.psi_score > 0.1 ? '⚠ Drift detected' : 'Stable'} color={ps.psi_score > 0.1 ? '#C41E3A' : '#0BBF7A'} trend="Recalibration needed" trendDir={ps.psi_score > 0.1 ? 'up' : 'down'} />
            </div>

            <div className="agent-panel">
              <div className="agent-panel-header"><span className="agent-panel-title">Key Findings</span></div>
              <div className="agent-panel-body">{(data.key_findings||[]).map((f,i) => <VisualFindingCard key={i} finding={f} agentColor={COLOR} index={i} agentId="digital" agentData={data} openFinding={openFinding} />)}</div>
            </div>

            <div className="agent-grid">
              {/* Left column */}
              <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

                {/* PSI Model Drift */}
                <PanelWithMethod title="Population Stability Index" tooltip="PSI > 0.10 = model drift. Current population behaves differently from training population." methodology="Compares distribution of behavioral scores across 10 buckets between training period and current population. Divergence = drift." agentColor={COLOR}>
                  <div style={{ padding:'16px' }}>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:14 }}>
                      {[
                        { label:'PSI Score', val:ps.psi_score?.toFixed(2)||'0.14', color: ps.psi_score>0.1?'#C41E3A':'#0BBF7A' },
                        { label:'Mean Score', val:ps.mean_behavioral_score?.toFixed(1)||'52.3', color:'var(--color-text)' },
                        { label:'Expected Mean', val:ps.expected_mean?.toFixed(1)||'67.8', color:'#4A6070' },
                      ].map((m,i)=>(
                        <div key={i} style={{ textAlign:'center', padding:'12px 8px', background:`${m.color}08`, borderRadius:8, border:`1px solid ${m.color}20` }}>
                          <div style={{ fontSize:26, fontWeight:900, color:m.color, lineHeight:1, fontFamily:'var(--font-display)' }}>{m.val}</div>
                          <div style={{ fontSize:10, color:'var(--color-text-3)', marginTop:4, textTransform:'uppercase', letterSpacing:'0.05em' }}>{m.label}</div>
                        </div>
                      ))}
                    </div>
                    <HeatStrip value={ps.psi_score||0.14} max={0.25} color="#C41E3A" label="PSI Severity" sublabel="0.10 = monitor  ·  0.20 = retrain  ·  0.25+ = suspend" format={v=>v.toFixed(3)} />
                    <InsightBox type={ps.detected?'warning':'success'} body={ps.interpretation||'Model shows drift ahead of HSBC migration. Recalibration recommended before Q2 2026 cutover.'} />
                  </div>
                </PanelWithMethod>

                {/* Impossible Travel */}
                <PanelWithMethod title="Impossible Travel Cases" tooltip="Two consecutive logins where elapsed time < minimum travel time between locations." methodology="Each login is geolocated via IP. Consecutive sessions for the same account are compared against a city-pair minimum travel time database." agentColor={COLOR}>
                  <div>
                    {(data.impossible_travel_cases||[]).map((itc,i)=>(
                      <div key={i} style={{ padding:'14px 16px', borderBottom:'1px solid var(--color-border)' }}>
                        <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:8 }}>
                          <code style={{ fontSize:12, fontWeight:700 }}>{itc.account_id}</code>
                          <span style={{ fontSize:11, color:'var(--color-text-2)' }}>{itc.from_city} → {itc.to_city}</span>
                          <span style={{ marginLeft:'auto', fontSize:11, fontWeight:700, color:'#C41E3A' }}>Impossible</span>
                        </div>
                        <ComparisonSplit leftLabel="Elapsed time" leftValue={`${itc.time_elapsed_minutes}min`} leftColor="#C41E3A" rightLabel="Minimum travel" rightValue={`${itc.minimum_travel_minutes}min`} rightColor="#0BBF7A" note={`${Math.round((itc.minimum_travel_minutes/itc.time_elapsed_minutes)*100)}% faster than physically possible`} />
                      </div>
                    ))}
                  </div>
                </PanelWithMethod>
              </div>

              {/* Right: Anomalous sessions */}
              <PanelWithMethod title="Anomalous Sessions" tooltip="Sessions risk-scored 0–100. Score combines behavioral biometrics (40%), device registration (20%), geographic velocity (25%), transaction pattern (15%)." methodology="Each session scored against 14-month baseline. Scores below 50 flag for review; below 30 trigger immediate response." agentColor={COLOR}>
                <div style={{ maxHeight:560, overflowY:'auto' }}>
                  {(data.anomalous_sessions||[]).map((sess,i)=>{
                    const score = sess.behavioral_score || 0;
                    const riskColor = score < 30 ? '#C41E3A' : score < 60 ? '#4A6070' : '#0BBF7A';
                    return (
                      <div key={i}>
                        <div style={{ padding:'12px 16px', borderBottom:'1px solid var(--color-border)', cursor:'pointer', background: expandedSession===i?'var(--color-surface-2)':'transparent' }}
                          onClick={()=>setExpandedSession(expandedSession===i?null:i)}>
                          <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:6 }}>
                            <BehavioralGauge score={score/100} />
                            <div style={{ flex:1 }}>
                              <div style={{ display:'flex', gap:6, alignItems:'center', marginBottom:4, flexWrap:'wrap' }}>
                                <code style={{ fontSize:12, fontWeight:700 }}>{sess.account_id}</code>
                                {!sess.device_registered && <span style={{ fontSize:9, fontWeight:700, padding:'2px 6px', background:'#F3F3F1', color:'#4A6070', borderRadius:4, border:'1px solid #D1D0CB' }}>Unregistered device</span>}
                                {sess.impossible_travel && <span style={{ fontSize:9, fontWeight:700, padding:'2px 6px', background:'#FCEEF1', color:'#C41E3A', borderRadius:4 }}>Impossible travel</span>}
                              </div>
                              <div style={{ fontSize:11, color:'var(--color-text-2)' }}>{sess.anomaly_type}</div>
                            </div>
                          </div>
                        </div>
                        {expandedSession === i && (
                          <div style={{ padding:'14px 16px', background:'var(--color-surface-2)', borderBottom:'1px solid var(--color-border)' }}>
                            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:10 }}>
                              {[
                                { label:'Max transaction', val:sess.max_txn_lkr>0?`LKR ${(sess.max_txn_lkr/1e6).toFixed(1)}M`:'No txn' },
                                { label:'MFA result', val:sess.mfa_triggered?(sess.mfa_passed?'Passed':'Failed'):'Not triggered' },
                                { label:'Device status', val:sess.device_registered?'Registered':'Unregistered' },
                              ].map((m,j)=>(
                                <div key={j} style={{ padding:'8px 12px', background:'var(--color-surface)', borderRadius:8, border:'1px solid var(--color-border)' }}>
                                  <div style={{ fontSize:10, color:'var(--color-text-3)', marginBottom:2, textTransform:'uppercase', letterSpacing:'0.05em' }}>{m.label}</div>
                                  <div style={{ fontSize:12, fontWeight:700 }}>{m.val}</div>
                                </div>
                              ))}
                            </div>
                            <div style={{ fontSize:12, color:'var(--color-text-2)', lineHeight:1.6, padding:'10px 14px', background:'var(--color-surface)', borderRadius:8, marginBottom:8 }}>
                              {sess.explanation}
                            </div>
                            <div style={{ padding:'8px 14px', background:'#FCEEF1', borderRadius:8, fontSize:12, fontWeight:600, color:'#C41E3A', border:'1px solid rgba(196,30,58,0.2)' }}>
                              → {sess.recommended_action}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </PanelWithMethod>
            </div>

            {/* Device sharing */}
            <PanelWithMethod title="Device Sharing Clusters" tooltip="One device ID accessing 3+ distinct accounts is a money mule indicator or credential theft." methodology="Device fingerprinting maps each device ID to all accounts using it. Cluster risk = number of accounts × session frequency." agentColor={COLOR}>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:12, padding:'16px' }}>
                {(data.device_sharing_clusters||[]).map((cluster,i)=>(
                  <VerdictCard key={i} verdict={cluster.risk} confidence={cluster.risk==='critical'?0.94:0.72} finding={cluster.description||`Device ${cluster.device_id} accessed ${cluster.account_count} distinct accounts`} evidence={cluster.account_ids} color={cluster.risk==='critical'?'#C41E3A':'#4A6070'} action={cluster.recommended_action} />
                ))}
              </div>
            </PanelWithMethod>
          </>
        );
      }}
    </AgentModule>
  );
}

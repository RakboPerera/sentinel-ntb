import React, { useState } from 'react';
import AgentModule from '../../components/shared/AgentModule.jsx';
import InfoTooltip from '../../components/shared/InfoTooltip.jsx';
import ExplainerBox from '../../components/shared/ExplainerBox.jsx';
import { VisualFindingCard, InsightBox, StatCard, PanelWithMethod, ScoreBar } from '../../components/shared/VisualComponents.jsx';
import { demoData } from '../../data/demoData.js';
import useOpenFinding from '../../hooks/useOpenFinding.js';

const SCHEMA = { agentName:'Digital Fraud & Identity', required:['session_id','account_id','device_id','login_city','behavioral_score','timestamp'], optional:['is_registered_device','mfa_triggered','mfa_passed','previous_session_city','minutes_since_last_session','transaction_count','max_transaction_lkr'] };
const COLOR = '#993556';

function BehavioralMeter({ score }) {
  const color = score < 30 ? '#A32D2D' : score < 50 ? '#3A5A3A' : score < 70 ? '#26EA9F' : '#3B6D11';
  const label = score < 30 ? 'Critical — likely ATO' : score < 50 ? 'Low — investigate' : score < 70 ? 'Watch' : 'Normal';
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:5 }}>
        <span style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--color-text-3)', display:'flex', alignItems:'center', gap:5 }}>
          Behavioral Score
          <InfoTooltip text="Behavioral biometric score 0–100 measured against this account's historical session baseline. Score reflects navigation pattern, typing rhythm, transaction sequencing. Below 50 is anomalous; below 30 triggers immediate ATO suspicion." position="right" width={280} />
        </span>
        <div style={{ display:'flex', gap:6, alignItems:'center' }}>
          <span style={{ fontSize:22, fontWeight:900, color, fontVariantNumeric:'tabular-nums', lineHeight:1 }}>{score}</span>
          <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', background:`${color}18`, color, borderRadius:4 }}>{label}</span>
        </div>
      </div>
      <div style={{ position:'relative', height:12, borderRadius:6, overflow:'hidden', background:'var(--color-surface-2)', border:'1px solid var(--color-border)' }}>
        {/* Zone coloring */}
        {[[0,30,'#A32D2D'],[30,50,'#3A5A3A'],[50,70,'#26EA9F'],[70,100,'#3B6D11']].map(([from,to,c]) => (
          <div key={from} style={{ position:'absolute', left:`${from}%`, width:`${to-from}%`, top:0, bottom:0, background:c, opacity:0.15 }} />
        ))}
        <div style={{ position:'absolute', left:0, width:`${score}%`, top:0, bottom:0, background:color, opacity:0.85, borderRadius:6 }} />
        {[30,50,70].map(t => <div key={t} style={{ position:'absolute', left:`${t}%`, top:0, bottom:0, width:2, background:'white', opacity:0.7 }} />)}
        <div style={{ position:'absolute', left:`calc(${score}% - 2px)`, top:-2, bottom:-2, width:4, borderRadius:2, background:color, boxShadow:`0 0 6px ${color}` }} />
      </div>
      <div style={{ display:'flex', justifyContent:'space-between', marginTop:3, fontSize:9, color:'var(--color-text-3)' }}>
        <span>0 ATO</span><span>30</span><span>50</span><span>70</span><span>100 Normal</span>
      </div>
    </div>
  );
}

export default function DigitalFraudAgent() {
  const [expandedSession, setExpandedSession] = useState(null);
  const openFinding = useOpenFinding('digital');
  return (
    <AgentModule agentId="digital" agentName="Digital Fraud & Identity Agent" agentColor={COLOR} demoData={demoData.digital} schema={SCHEMA}>
      {(data) => {
        const ds = data.digital_summary;
        return (
          <>
            <ExplainerBox color={COLOR} icon="⊕"
              title="How this agent detects account takeover and digital fraud"
              summary="Each user has a behavioral biometric baseline built from 14 months of session history. Deviations in navigation pattern, typing rhythm, and transaction sequencing produce a score 0–100. Sessions below 50 are investigated; below 30 are critical."
              detail="The agent cross-checks three detection layers: (1) Behavioral biometrics — does this session look like the account owner? (2) Geographic velocity — is the location physically possible given the prior session? Sri Lanka city-pair travel benchmarks are pre-loaded (Jaffna–Colombo: 330 min). (3) Device intelligence — is this a registered device, and is it appearing across multiple accounts? A single unregistered device accessing 3+ accounts is a money mule coordination signal. All three layers feed into a combined risk score."
              collapsible
            />

            {/* Audit Opinion Banner */}
            <div style={{ background:'#99355606', border:`1px solid #99355622`, borderRadius:10, overflow:'hidden' }}>
              <div style={{ padding:'12px 16px', display:'flex', gap:10, alignItems:'flex-start' }}>
                <div style={{ fontSize:10, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.08em', padding:'3px 9px', borderRadius:5, background:'#993556', color:'white', flexShrink:0, marginTop:2 }}>
                  QUALIFIED
                </div>
                <div style={{ fontSize:12, color:'#993556', lineHeight:1.7 }}>
                  In our opinion, the digital fraud detection environment is PARTIALLY EFFECTIVE. Behavioral biometrics detected 4 high-risk sessions. Impossible travel confirmed in 2 cases. PSI 0.14 indicates model drift requiring recalibration ahead of HSBC migration.
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', borderTop:`1px solid #99355618` }}>
                {[['Population tested','148,247 authenticated sessions (100%)'],['Period covered','FY 2025 (Jan–Dec)'],['Materiality threshold','Sessions with behavioral score &lt;50; impossible travel within same day'],['Model limitations','Behavioral baseline requires 90-day history; HSBC migrated accounts have reduced baseline confidence']].map(([k,v],i)=>(
                  <div key={i} style={{ padding:'7px 16px', borderRight:i%2===0?`1px solid #99355612`:'none', borderBottom:i<2?`1px solid #99355612`:'none' }}>
                    <div style={{ fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'#993556', opacity:0.65, marginBottom:2 }}>{k}</div>
                    <div style={{ fontSize:11, color:'#993556', lineHeight:1.5 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
              <StatCard label="Sessions Analysed" value={ds.total_sessions_analyzed.toLocaleString()} sub={`${ds.anomalous_sessions} anomalous sessions`} color={COLOR} tooltip="All digital banking sessions across Nations Direct (corporate) and mobile banking (retail) analysed in this cycle. Each session is scored against the account owner's 14-month behavioral baseline." />
              <StatCard label="Critical Sessions" value={ds.critical_sessions} sub="Behavioral score < 30" color="#A32D2D" tooltip="Sessions where the behavioral biometric score is below 30 — the threshold for likely Account Takeover. Combined with other signals (unregistered device, off-hours, high-value transfer), these are the highest-priority cases." alert="Immediate account review" />
              <StatCard label="Impossible Travel" value={ds.impossible_travel_cases} sub="Geographic impossibility" color="#854F0B" tooltip="Sessions where the time between consecutive logins is shorter than the minimum physically possible travel time between the two geolocated cities. A passed MFA in these cases suggests SIM swap." />
              <StatCard label="PSI Score" value={data.population_shift.psi_score.toFixed(2)} sub={ds.population_shift_detected ? '⚠ Model drift detected' : 'Model stable'} color={ds.population_shift_detected ? '#A32D2D' : '#3B6D11'} tooltip="Population Stability Index — measures whether the current session population has drifted from the behavioral model's training population. PSI > 0.10 requires model review; > 0.20 requires urgent recalibration. Critical for HSBC migration." />
            </div>

            <div className="agent-panel">
              <div className="agent-panel-header"><span className="agent-panel-title">Key Findings</span></div>
              <div className="agent-panel-body">
                {(data.key_findings || []).map((f,i) => <VisualFindingCard key={i} finding={f} agentColor={COLOR} index={i} agentId="digital" agentData={data} openFinding={openFinding} />)}
              </div>
            </div>

            <div className="agent-grid">
              <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                {/* PSI explainer */}
                <PanelWithMethod
                  title="Population Stability Index (PSI)"
                tooltip="PSI measures whether today\'s user population behaves like the model\'s training population. PSI > 0.10 = minor drift (flag). PSI > 0.20 = significant drift (urgent recalibration). Critical ahead of the HSBC migration."
                  methodology="PSI measures whether the distribution of behavioral scores in the current population matches the distribution used to train the model. PSI < 0.10 = stable (no action). PSI 0.10–0.20 = minor shift (flag for review). PSI > 0.20 = significant drift (urgent recalibration). The HSBC migration will add 200,000 new accounts with unknown behavioral baselines — PSI monitoring is critical in Q2 2026."
                  agentColor={COLOR}
                  tooltip="PSI > 0.10 means model drift — the current population behaves differently from the training population, potentially causing false positives or missed fraud."
                >
                  <div style={{ padding:'16px' }}>
                    <div style={{ display:'flex', gap:20, marginBottom:16 }}>
                      {[
                        { label:'PSI Score', val:data.population_shift.psi_score.toFixed(2), color:data.population_shift.psi_score>=0.2?'var(--color-red)':data.population_shift.psi_score>=0.1?'#3A5A3A':'var(--color-green)' },
                        { label:'Mean Score', val:data.population_shift.mean_behavioral_score.toFixed(1), color:'var(--color-text)' },
                        { label:'Expected Mean', val:data.population_shift.expected_mean.toFixed(1), color:'var(--color-green)' },
                      ].map((m,i) => (
                        <div key={i} style={{ textAlign:'center', flex:1 }}>
                          <div style={{ fontSize:28, fontWeight:900, color:m.color, lineHeight:1 }}>{m.val}</div>
                          <div style={{ fontSize:11, color:'var(--color-text-3)', marginTop:4 }}>{m.label}</div>
                        </div>
                      ))}
                    </div>
                    <InsightBox type={data.population_shift.detected?'warning':'success'} body={data.population_shift.interpretation} compact />
                    <div style={{ marginTop:10, padding:'10px 14px', background:'#E8FDF4', borderRadius:8, fontSize:12, color:'#3A5A3A', lineHeight:1.6 }}>
                      ⚠ {data.population_shift.recommendation}
                    </div>
                  </div>
                </PanelWithMethod>

                {/* Device sharing */}
                <PanelWithMethod
                  title="Device Sharing Clusters"
                tooltip="One device ID accessing 3+ distinct accounts is a money mule network indicator or credential theft. Legitimate shared devices (family plans) show consistent behavioral profiles across accounts — these do not."
                  methodology="Device fingerprinting maps each device ID to the accounts that use it. A single device ID accessing 3+ distinct accounts is a strong indicator of either account sharing within a money mule network or credential theft enabling multi-account access from one device. Cross-referenced with Transaction Agent suspicious accounts."
                  agentColor={COLOR}
                >
                  <div>
                    {(data.device_sharing_clusters || []).map((cluster,i) => (
                      <div key={i} style={{ padding:'12px 16px', borderBottom:'1px solid var(--color-border)', background: cluster.risk==='critical'?'var(--color-red-light)':'#E8FDF4' }}>
                        <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:6 }}>
                          <code style={{ fontSize:12, fontWeight:700 }}>{cluster.device_id}</code>
                          <span style={{ fontSize:11, fontWeight:700, padding:'2px 8px', background: cluster.risk==='critical'?'var(--color-red)':'#3A5A3A', color:'white', borderRadius:4 }}>
                            {cluster.account_count} accounts
                          </span>
                        </div>
                        <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:8 }}>
                          {cluster.account_ids.map(id => <code key={id} style={{ fontSize:10, padding:'2px 7px', background:'rgba(255,255,255,0.7)', borderRadius:4 }}>{id}</code>)}
                        </div>
                        <div style={{ fontSize:12, color: cluster.risk==='critical'?'var(--color-red)':'var(--color-text-2)', lineHeight:1.5 }}>{cluster.interpretation}</div>
                      </div>
                    ))}
                  </div>
                </PanelWithMethod>

                {/* Impossible travel */}
                <PanelWithMethod
                  title="Impossible Travel Cases"
                tooltip="Two consecutive logins to the same account where elapsed time < minimum travel time between the two geolocated cities. A passed MFA in the second session indicates OTP theft — likely SIM swap fraud."
                  methodology="Each login is geolocated via IP. Consecutive sessions for the same account are compared against a Sri Lanka city-pair travel time matrix (road and air). If elapsed time < minimum travel time, the case is flagged. MFA passing in the impossible session indicates OTP compromise — likely SIM swap."
                  agentColor={COLOR}
                >
                  <div>
                    {(data.impossible_travel_cases || []).map((itc,i) => (
                      <div key={i} style={{ padding:'12px 16px', borderBottom:'1px solid var(--color-border)', background:'var(--color-red-light)' }}>
                        <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:6 }}>
                          <code style={{ fontSize:12, fontWeight:700 }}>{itc.account_id}</code>
                          <span style={{ fontSize:11 }}>{itc.from_city} → {itc.to_city}</span>
                        </div>
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:8 }}>
                          <div style={{ padding:'8px 12px', background:'rgba(255,255,255,0.6)', borderRadius:6, textAlign:'center' }}>
                            <div style={{ fontSize:18, fontWeight:800, color:'var(--color-red)' }}>{itc.time_elapsed_minutes}m</div>
                            <div style={{ fontSize:10, color:'var(--color-text-3)' }}>Elapsed</div>
                          </div>
                          <div style={{ padding:'8px 12px', background:'rgba(255,255,255,0.6)', borderRadius:6, textAlign:'center' }}>
                            <div style={{ fontSize:18, fontWeight:800, color:'var(--color-green)' }}>{itc.minimum_travel_minutes}m</div>
                            <div style={{ fontSize:10, color:'var(--color-text-3)' }}>Minimum travel</div>
                          </div>
                        </div>
                        <div style={{ fontSize:11, color:'var(--color-red)', fontWeight:600 }}>{Math.round(itc.minimum_travel_minutes/itc.time_elapsed_minutes)}× too fast to be physically possible</div>
                      </div>
                    ))}
                  </div>
                </PanelWithMethod>
              </div>

              {/* Anomalous sessions */}
              <PanelWithMethod
                title="Anomalous Sessions"
                tooltip="Sessions risk-scored 0-1 combining: behavioral biometrics (40%), device registration (20%), geographic impossibility (25%), MFA outcome (15%). Above 0.75 = flagged. Above 0.85 = critical."
                methodology="Each session is risk-scored 0.0–1.0 combining: behavioral biometric score (weighted 40%), device registration status (20%), geographic impossibility (25%), MFA outcome (15%). Sessions above 0.75 are flagged; above 0.85 are critical. Click any session to see its full behavioral profile."
                agentColor={COLOR}
              >
                <div style={{ maxHeight:560, overflowY:'auto' }}>
                  {(data.anomalous_sessions || []).map((sess,i) => (
                    <div key={i}>
                      <div style={{ padding:'14px 16px', borderBottom:'1px solid var(--color-border)', cursor:'pointer', background: expandedSession===i ? `${COLOR}06` : 'transparent', transition:'background 0.12s' }}
                        onClick={() => setExpandedSession(expandedSession===i ? null : i)}>
                        <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:6, flexWrap:'wrap' }}>
                          <code style={{ fontSize:12, fontWeight:700 }}>{sess.account_id}</code>
                          <span style={{ fontSize:10, fontWeight:700, padding:'2px 7px', background: sess.risk_score>=0.9?'var(--color-red)':'#3A5A3A', color:'white', borderRadius:4 }}>
                            Risk {sess.risk_score.toFixed(2)}
                          </span>
                          {!sess.device_registered && <span style={{ fontSize:10, fontWeight:600, padding:'1px 6px', background:'#E8FDF4', color:'#3A5A3A', borderRadius:4 }}>Unregistered device</span>}
                          {sess.impossible_travel && <span style={{ fontSize:10, fontWeight:600, padding:'1px 6px', background:'var(--color-red-light)', color:'var(--color-red)', borderRadius:4 }}>Impossible travel</span>}
                        </div>
                        <div style={{ fontSize:11, color:'var(--color-text-2)', marginBottom:6 }}>{sess.anomaly_type}</div>
                        <BehavioralMeter score={sess.behavioral_score} />
                      </div>
                      {expandedSession === i && (
                        <div className="animate-fade-in" style={{ padding:'14px 16px', background:'var(--color-surface-2)', borderBottom:'1px solid var(--color-border)' }}>
                          <div style={{ display:'flex', gap:12, marginBottom:10, flexWrap:'wrap' }}>
                            {[
                              { label:'Max txn', val: sess.max_txn_lkr>0 ? `LKR ${(sess.max_txn_lkr/1e6).toFixed(1)}M` : 'None' },
                              { label:'MFA triggered', val: sess.mfa_triggered ? (sess.mfa_passed ? 'Passed' : 'Failed') : 'No' },
                              { label:'Device', val: sess.device_registered ? 'Registered' : 'Unregistered' },
                            ].map((m,j) => (
                              <div key={j} style={{ padding:'6px 12px', background:'var(--color-surface)', borderRadius:6, border:'1px solid var(--color-border)' }}>
                                <div style={{ fontSize:10, color:'var(--color-text-3)' }}>{m.label}</div>
                                <div style={{ fontSize:12, fontWeight:600 }}>{m.val}</div>
                              </div>
                            ))}
                          </div>
                          <div style={{ fontSize:12, color:'var(--color-text-2)', lineHeight:1.6, padding:'10px 14px', background:'white', borderRadius:8, border:'1px solid var(--color-border)', marginBottom:8 }}>
                            {sess.explanation}
                          </div>
                          <div style={{ padding:'8px 14px', background: sess.risk_score>=0.9?'var(--color-red-light)':'#E8FDF4', borderRadius:8, fontSize:12, color: sess.risk_score>=0.9?'var(--color-red)':'#3A5A3A', fontWeight:500 }}>
                            → {sess.recommended_action}
                          
                <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:8, marginTop:10, paddingTop:10, borderTop:'1px solid rgba(255,255,255,0.12)', fontSize:11 }}>
                  <div><div style={{ fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', opacity:0.6, marginBottom:2 }}>Population tested</div>148,247 authenticated sessions (100%)</div>
                  <div><div style={{ fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', opacity:0.6, marginBottom:2 }}>Period covered</div>FY 2025 (Jan–Dec)</div>
                  <div><div style={{ fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', opacity:0.6, marginBottom:2 }}>Materiality threshold</div>Sessions with behavioral score &lt;50/100; impossible travel within same day</div>
                  <div><div style={{ fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', opacity:0.6, marginBottom:2 }}>Model limitations</div>Behavioral baseline requires 90-day history; HSBC migrated accounts have reduced confidence</div>
                </div></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </PanelWithMethod>
            </div>
          </>
        );
      }}
      </AgentModule>
  );
}

import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import './Dashboard.css'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const Stars = ({ rating }) => (
  <div className="stars">
    {[1,2,3,4,5].map(i => (
      <span key={i} className={`star ${i <= rating ? '' : 'star-empty'}`}>★</span>
    ))}
  </div>
)

const HealthBar = ({ score }) => {
  const color = score >= 70 ? 'var(--accent-emerald)' : score >= 40 ? 'var(--accent-gold)' : 'var(--accent-red)'
  return (
    <div className="health-bar-wrap">
      <div className="health-bar-bg">
        <div className="health-bar-fill" style={{ width: `${score}%`, background: color }} />
      </div>
      <span className="health-score" style={{ color }}>{score}/100</span>
    </div>
  )
}

export default function Dashboard({ userProfile, diagnosis }) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('diagnosis')
  const [recommendations, setRecommendations] = useState(null)
  const [recLoading, setRecLoading] = useState(false)
  const [messages, setMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [selectedResource, setSelectedResource] = useState(null)
  const [reviewSim, setReviewSim] = useState(null)
  const [reviewLoading, setReviewLoading] = useState(false)
  const chatEndRef = useRef(null)

  useEffect(() => {
    if (activeTab === 'prescription' && !recommendations) {
      fetchRecommendations()
    }
  }, [activeTab])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchRecommendations = async (userMsg = null, history = []) => {
    setRecLoading(true)
    try {
      const res = await axios.post(`${API}/api/recommend`, {
        user_profile: userProfile,
        conversation_history: history,
        user_message: userMsg || "Give me my personalized financial prescription"
      })
      setRecommendations(res.data.recommendation)
    } catch (e) {
      console.error(e)
    } finally {
      setRecLoading(false)
    }
  }


  const sendChat = async () => {
    if (!chatInput.trim()) return
    const userMsg = chatInput
    setChatInput('')
    const newMessages = [...messages, { role: 'user', content: userMsg }]
    setMessages(newMessages)
    setChatLoading(true)
    try {
        const res = await axios.post(`${API}/api/chat`, {
        user_profile: userProfile,
        conversation_history: newMessages,
        user_message: userMsg
      })
      const botReply = res.data.response
      setMessages(m => [...m, { role: 'assistant', content: botReply }])
    } finally {
      setChatLoading(false)
    }
  }

  const simulateReview = async (resource) => {
    setSelectedResource(resource)
    setReviewLoading(true)
    setReviewSim(null)
    try {
      const res = await axios.post(`${API}/api/simulate-review`, {
        user_profile: userProfile,
        resource_title: resource.title,
        resource_type: resource.type,
        resource_description: resource.description || '',
        resource_author: resource.author || 'Unknown'
      })
      setReviewSim(res.data.simulation)
    } catch (e) {
      console.error(e)
    } finally {
      setReviewLoading(false)
    }
  }

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span style={{ color: 'var(--accent-gold)' }}>✚</span>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>Finova</span>
        </div>

        <div className="patient-card">
          <div className="patient-avatar">
            {userProfile?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="patient-info">
            <div className="patient-name">{userProfile?.name}</div>
            <div className="patient-persona">{diagnosis?.persona_label || 'Analyzing...'}</div>
          </div>
        </div>

        {diagnosis && (
          <div className="sidebar-health">
            <div className="sidebar-label">Financial Health</div>
            <HealthBar score={diagnosis.financial_health_score} />
          </div>
        )}

        <nav className="sidebar-nav">
          {[
            { id: 'diagnosis', icon: '🔬', label: 'Diagnosis' },
            { id: 'prescription', icon: '💊', label: 'Prescription' },
            { id: 'simulate', icon: '🧪', label: 'Simulate Review' },
            { id: 'chat', icon: '💬', label: 'Ask Finova' }
          ].map(tab => (
            <button
              key={tab.id}
              className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="nav-icon">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        <button className="btn-secondary sidebar-restart" onClick={() => navigate('/onboarding')}>
          New Patient →
        </button>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">

        {/* DIAGNOSIS TAB */}
        {activeTab === 'diagnosis' && (
          <div className="tab-content fade-up">
            <div className="tab-header">
              <span className="tag tag-gold">Medical Report</span>
              <h1 className="tab-title">Your Financial Diagnosis</h1>
              <p className="tab-subtitle">Based on your behavioral profile and spending analysis</p>
            </div>

            {!diagnosis ? (
              <div className="loading-state">
                <div className="spinner" />
                <p>Analyzing your financial health...</p>
              </div>
            ) : (
              <div className="diagnosis-grid">
                <div className="card diagnosis-summary">
                  <div className="card-label">Primary Diagnosis</div>
                  <h2 className="persona-label">{diagnosis.persona_label}</h2>
                  <p className="diagnosis-text">{diagnosis.diagnosis_summary}</p>
                  <div className="urgency-badge" data-level={diagnosis.urgency_level}>
                    Urgency: {diagnosis.urgency_level?.toUpperCase()}
                  </div>
                </div>

                <div className="card">
                  <div className="card-label">Financial Vitals</div>
                  <div className="vitals">
                    <div className="vital">
                      <span className="vital-label">Monthly Income</span>
                      <span className="vital-value">₦{Number(userProfile.monthly_income).toLocaleString()}</span>
                    </div>
                    <div className="vital">
                      <span className="vital-label">Monthly Expenses</span>
                      <span className="vital-value">₦{Number(userProfile.monthly_expenses).toLocaleString()}</span>
                    </div>
                    <div className="vital">
                      <span className="vital-label">Savings Rate</span>
                      <span className="vital-value">{userProfile.savings_rate}%</span>
                    </div>
                    <div className="vital">
                      <span className="vital-label">Risk Profile</span>
                      <span className="vital-value" style={{ textTransform: 'capitalize' }}>{userProfile.risk_tolerance?.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-label">Strengths</div>
                  <ul className="tag-list">
                    {diagnosis.strengths?.map((s, i) => (
                      <li key={i} className="tag tag-emerald">{s}</li>
                    ))}
                  </ul>
                </div>

                <div className="card">
                  <div className="card-label">Risk Areas</div>
                  <ul className="tag-list">
                    {diagnosis.risk_areas?.map((r, i) => (
                      <li key={i} className="tag tag-red">{r}</li>
                    ))}
                  </ul>
                </div>

                <div className="card full-width">
                  <div className="card-label">Mindset Profile</div>
                  <p className="long-text">{diagnosis.mindset_profile}</p>
                </div>

                <div className="card full-width">
                  <div className="card-label">Lifestyle Assessment</div>
                  <p className="long-text">{diagnosis.lifestyle_assessment}</p>
                </div>

                <div className="card full-width">
                  <div className="card-label">Prescription Focus Areas</div>
                  <div className="focus-areas">
                    {diagnosis.prescription_focus?.map((f, i) => (
                      <div key={i} className="focus-item">
                        <span className="focus-num">0{i + 1}</span>
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', marginTop: '8px' }}>
                  <button className="btn-primary" onClick={() => setActiveTab('prescription')}>
                    View My Prescription →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PRESCRIPTION TAB */}
        {activeTab === 'prescription' && (
          <div className="tab-content fade-up">
            <div className="tab-header">
              <span className="tag tag-gold">Task B · Recommendation</span>
              <h1 className="tab-title">Your Prescription</h1>
              <p className="tab-subtitle">Personalized resources curated by your Financial Doctor</p>
            </div>

            {recLoading ? (
              <div className="loading-state">
                <div className="spinner" />
                <p>Reasoning through your prescription...</p>
              </div>
            ) : recommendations ? (
              <div className="prescription-content">
                {/* Doctor Note */}
                <div className="doctor-note">
                  <div className="doctor-note-icon">✚</div>
                  <div>
                    <div className="card-label">Doctor's Note</div>
                    <p>{recommendations.prescription?.doctor_note}</p>
                  </div>
                </div>

                {/* Reasoning Chain */}
                {recommendations.reasoning_chain && (
                  <div className="card reasoning-card">
                    <div className="card-label">Agent Reasoning Process</div>
                    <div className="reasoning-chain">
                      {recommendations.reasoning_chain.map((step, i) => (
                        <div key={i} className="reasoning-step">
                          <span className="reasoning-num">{i + 1}</span>
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                <div className="reco-grid">
                  {recommendations.prescription?.recommendations?.map((rec, i) => (
                    <div key={i} className="reco-card card">
                      <div className="reco-header">
                        <span className="reco-rank">#{rec.rank}</span>
                        <span className={`tag ${rec.type === 'book' ? 'tag-gold' : rec.type === 'video' ? 'tag-red' : 'tag-emerald'}`}>
                          {rec.type}
                        </span>
                      </div>
                      <h3 className="reco-title">{rec.title}</h3>
                      <p className="reco-author">by {rec.author}</p>
                      <p className="reco-why">{rec.why_prescribed}</p>
                      <div className="reco-meta">
                        <span className="reco-impact">Impact: {rec.expected_impact}</span>
                        <span className={`tag ${rec.difficulty === 'beginner' ? 'tag-emerald' : rec.difficulty === 'advanced' ? 'tag-red' : 'tag-gold'}`}>
                          {rec.difficulty}
                        </span>
                      </div>
                      <div className="reco-actions">
                        {rec.url && (
                          <a href={rec.url} target="_blank" rel="noreferrer" className="btn-secondary" style={{ textDecoration: 'none', padding: '8px 16px', fontSize: '13px' }}>
                            Open Resource ↗
                          </a>
                        )}
                        <button className="btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }} onClick={() => { simulateReview(rec); setActiveTab('simulate') }}>
                          Simulate My Review
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {recommendations.prescription?.transformation_path && (
                  <div className="card">
                    <div className="card-label">Your Transformation Path</div>
                    <p className="long-text">{recommendations.prescription.transformation_path}</p>
                  </div>
                )}

                {recommendations.prescription?.follow_up_question && (
                  <div className="follow-up">
                    <p>💬 <em>{recommendations.prescription.follow_up_question}</em></p>
                    <button className="btn-secondary" style={{ marginTop: '12px' }} onClick={() => setActiveTab('chat')}>
                      Answer in Chat →
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="loading-state">
                <div className="spinner" />
              </div>
            )}
          </div>
        )}

        {/* SIMULATE REVIEW TAB */}
        {activeTab === 'simulate' && (
          <div className="tab-content fade-up">
            <div className="tab-header">
              <span className="tag tag-gold">Task A · User Modeling</span>
              <h1 className="tab-title">Simulate Your Review</h1>
              <p className="tab-subtitle">See how you'd rate and review any financial resource based on your profile</p>
            </div>

            <div className="simulate-grid">
              <div className="card">
                <div className="card-label">Enter a Resource to Simulate</div>
                <SimulateForm userProfile={userProfile} onSimulate={(resource, result) => {
                  setSelectedResource(resource)
                  setReviewSim(result)
                }} />
              </div>

              {reviewLoading && (
                <div className="card loading-state">
                  <div className="spinner" />
                  <p>Modeling your review behavior...</p>
                </div>
              )}

              {reviewSim && !reviewLoading && (
                <div className="card review-result fade-up">
                  <div className="card-label">Simulated Review</div>
                  <div className="review-header">
                    <Stars rating={reviewSim.star_rating} />
                    <span className="review-confidence">Confidence: {Math.round(reviewSim.rating_confidence * 100)}%</span>
                  </div>
                  <h3 className="review-title">"{reviewSim.review_title}"</h3>
                  <p className="review-text">{reviewSim.review_text}</p>
                  <hr className="divider" />
                  <div className="review-meta-grid">
                    <div>
                      <div className="card-label">What Resonated</div>
                      {reviewSim.key_resonances?.map((r, i) => <div key={i} className="meta-item emerald">✓ {r}</div>)}
                    </div>
                    <div>
                      <div className="card-label">Criticisms</div>
                      {reviewSim.key_criticisms?.map((c, i) => <div key={i} className="meta-item red">✗ {c}</div>)}
                    </div>
                  </div>
                  <div className="card-label" style={{ marginTop: '20px' }}>Behavioral Notes</div>
                  <p className="long-text">{reviewSim.behavioral_notes}</p>
                  <div className="review-footer">
                    <span className={`tag ${reviewSim.would_recommend ? 'tag-emerald' : 'tag-red'}`}>
                      {reviewSim.would_recommend ? '✓ Would Recommend' : '✗ Would Not Recommend'}
                    </span>
                    <span className="tag tag-gold">{reviewSim.simulated_helpfulness_votes} helpfulness votes</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CHAT TAB */}
        {activeTab === 'chat' && (
          <div className="tab-content fade-up chat-tab">
            <div className="tab-header">
              <span className="tag tag-gold">Conversational Agent</span>
              <h1 className="tab-title">Ask Your Financial Doctor</h1>
              <p className="tab-subtitle">Refine your prescription through conversation</p>
            </div>

            <div className="chat-container">
              <div className="chat-messages">
                {messages.length === 0 && (
                  <div className="chat-welcome">
                    <div className="chat-welcome-icon">✚</div>
                    <p>Hi {userProfile?.name}! I'm your Finova agent. Ask me anything about your financial prescription, or tell me more about your situation to get better recommendations.</p>
                    <div className="chat-suggestions">
                      {[
                        "What should I focus on first?",
                        "I struggle with impulse buying",
                        "Recommend podcasts for beginners",
                        "How do I start investing?"
                      ].map((s, i) => (
                        <button key={i} className="suggestion-chip" onClick={() => { setChatInput(s) }}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {messages.map((m, i) => (
                  <div key={i} className={`chat-message ${m.role}`}>
                    <div className="message-avatar">
                      {m.role === 'user' ? userProfile?.name?.[0]?.toUpperCase() : '✚'}
                    </div>
                    <div className="message-bubble">{m.content}</div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="chat-message assistant">
                    <div className="message-avatar">✚</div>
                    <div className="message-bubble typing">
                      <span /><span /><span />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="chat-input-bar">
                <input
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendChat()}
                  placeholder="Ask your financial doctor anything..."
                />
                <button className="btn-primary" onClick={sendChat} disabled={chatLoading || !chatInput.trim()}>
                  Send →
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function SimulateForm({ userProfile, onSimulate }) {
  const [form, setForm] = useState({ title: '', type: 'book', author: '', description: '' })
  const [loading, setLoading] = useState(false)
  const update = (f, v) => setForm(p => ({ ...p, [f]: v }))

  const submit = async () => {
    setLoading(true)
    try {
      const res = await axios.post(`${API}/api/simulate-review`, {
        user_profile: userProfile,
        resource_title: form.title,
        resource_type: form.type,
        resource_description: form.description,
        resource_author: form.author
      })
      onSimulate(form, res.data.simulation)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="form-group">
        <label>Resource Title</label>
        <input value={form.title} onChange={e => update('title', e.target.value)} placeholder="e.g. Rich Dad Poor Dad" />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Type</label>
          <select value={form.type} onChange={e => update('type', e.target.value)}>
            <option value="book">Book</option>
            <option value="video">Video</option>
            <option value="podcast">Podcast</option>
          </select>
        </div>
        <div className="form-group">
          <label>Author / Creator</label>
          <input value={form.author} onChange={e => update('author', e.target.value)} placeholder="e.g. Robert Kiyosaki" />
        </div>
      </div>
      <div className="form-group">
        <label>Brief Description</label>
        <textarea value={form.description} onChange={e => update('description', e.target.value)} rows={3} placeholder="What is this resource about?" />
      </div>
      <button className="btn-primary" onClick={submit} disabled={loading || !form.title}>
        {loading ? 'Simulating...' : 'Simulate My Review →'}
      </button>
    </div>
  )
}

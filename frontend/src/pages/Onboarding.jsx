import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import './Onboarding.css'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const GOALS = [
  'Build emergency fund', 'Pay off debt', 'Invest for retirement',
  'Buy a home', 'Start a business', 'Save for education',
  'Achieve financial freedom', 'Increase income streams'
]

const CHALLENGES = [
  'Living paycheck to paycheck', 'Impulsive spending', 'No savings habit',
  'Too much debt', 'Low financial literacy', 'No investment knowledge',
  'Poor budgeting', 'Lifestyle inflation'
]

const CATEGORIES = [
  'Food & Dining', 'Entertainment', 'Shopping', 'Transportation',
  'Rent/Housing', 'Subscriptions', 'Travel', 'Health & Fitness'
]

const STORAGE_KEY = 'finova_onboarding_form'

export default function Onboarding({ setUserProfile, setDiagnosis }) {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [customGoal, setCustomGoal] = useState('')
  const [customChallenge, setCustomChallenge] = useState('')

  const [form, setForm] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) return JSON.parse(saved)
    } catch (e) {}
    return {
      name: '', age: '', monthly_income: '', monthly_expenses: '',
      savings_rate: '', spending_categories: {},
      financial_goals: [], financial_challenges: [],
      risk_tolerance: '', investment_experience: '',
      debt_status: '', lifestyle: ''
    }
  })

  // Save to localStorage whenever form changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(form))
    } catch (e) {}
  }, [form])

  const update = (field, value) => setForm(f => ({ ...f, [field]: value }))

  const toggleArray = (field, val) => {
    setForm(f => {
      const arr = f[field]
      return {
        ...f,
        [field]: arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]
      }
    })
  }

  const addCustomGoal = () => {
    const g = customGoal.trim()
    if (g && !form.financial_goals.includes(g)) {
      setForm(f => ({ ...f, financial_goals: [...f.financial_goals, g] }))
      setCustomGoal('')
    }
  }

  const addCustomChallenge = () => {
    const c = customChallenge.trim()
    if (c && !form.financial_challenges.includes(c)) {
      setForm(f => ({ ...f, financial_challenges: [...f.financial_challenges, c] }))
      setCustomChallenge('')
    }
  }

  // Smart contradiction detection
  const getContextualNotes = () => {
    const notes = []
    const savingsRate = Number(form.savings_rate)
    const { debt_status, financial_challenges } = form

    if (savingsRate > 0 && financial_challenges.includes('No savings habit')) {
      notes.push('Note: You mentioned a savings rate but also selected "No savings habit" — your report will reflect your actual savings rate.')
    }
    if (savingsRate === 0 && debt_status === 'debt_free') {
      notes.push('Note: Zero savings with no debt — your prescription will focus on building your first savings buffer.')
    }
    return notes
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const profile = {
        ...form,
        age: Number(form.age),
        monthly_income: Number(form.monthly_income),
        monthly_expenses: Number(form.monthly_expenses),
        savings_rate: Number(form.savings_rate)
      }
      setUserProfile(profile)
      localStorage.setItem('finova_profile', JSON.stringify(profile))
      const res = await axios.post(`${API}/api/diagnose`, profile)
      setDiagnosis(res.data.diagnosis)
      localStorage.setItem('finova_diagnosis', JSON.stringify(res.data.diagnosis))
      localStorage.removeItem(STORAGE_KEY)
      navigate('/dashboard')
    } catch (e) {
      console.error(e)
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const totalSteps = 5

  const steps = [
    {
      title: "Let's start with the basics",
      subtitle: "Tell us about yourself",
      content: (
        <div>
          <div className="form-group">
            <label>Your name</label>
            <input
              value={form.name}
              onChange={e => update('name', e.target.value)}
              placeholder="e.g. Gbadebo Adeyemi"
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Age</label>
              <input
                type="number"
                inputMode="numeric"
                value={form.age}
                onChange={e => update('age', e.target.value)}
                placeholder="28"
                style={{ MozAppearance: 'textfield' }}
              />
            </div>
            <div className="form-group">
              <label>Monthly Income (₦)</label>
              <input
                type="number"
                inputMode="numeric"
                value={form.monthly_income}
                onChange={e => update('monthly_income', e.target.value)}
                placeholder="300000"
                style={{ MozAppearance: 'textfield' }}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Monthly Expenses (₦)</label>
              <input
                type="number"
                inputMode="numeric"
                value={form.monthly_expenses}
                onChange={e => update('monthly_expenses', e.target.value)}
                placeholder="200000"
                style={{ MozAppearance: 'textfield' }}
              />
            </div>
            <div className="form-group">
              <label>Current Savings Rate (%)</label>
              <input
                type="number"
                inputMode="numeric"
                value={form.savings_rate}
                onChange={e => update('savings_rate', e.target.value)}
                placeholder="10"
                style={{ MozAppearance: 'textfield' }}
              />
            </div>
          </div>
        </div>
      ),
      valid: form.name && form.age && form.monthly_income && form.monthly_expenses
    },
    {
      title: "How do you spend your money?",
      subtitle: "Estimate monthly spending per category (₦)",
      content: (
        <div>
          {CATEGORIES.map(cat => (
            <div className="form-group form-row" key={cat}>
              <label style={{ textTransform: 'none', fontSize: '14px', color: 'var(--text-primary)', marginBottom: 0, flex: 1, alignSelf: 'center' }}>
                {cat}
              </label>
              <div style={{ width: '160px' }}>
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="₦0"
                  value={form.spending_categories[cat] || ''}
                  onChange={e => {
                    setForm(f => ({
                      ...f,
                      spending_categories: { ...f.spending_categories, [cat]: Number(e.target.value) }
                    }))
                  }}
                  style={{ MozAppearance: 'textfield' }}
                />
              </div>
            </div>
          ))}
        </div>
      ),
      valid: true
    },
    {
      title: "What are your financial goals?",
      subtitle: "Select all that apply — or add your own",
      content: (
        <div>
          <div className="checkbox-group">
            {GOALS.map(g => (
              <div
                key={g}
                className={`checkbox-item ${form.financial_goals.includes(g) ? 'selected' : ''}`}
                onClick={() => toggleArray('financial_goals', g)}
              >
                {form.financial_goals.includes(g) ? '✓ ' : ''}{g}
              </div>
            ))}
            {/* Custom goals added by user */}
            {form.financial_goals.filter(g => !GOALS.includes(g)).map(g => (
              <div
                key={g}
                className="checkbox-item selected"
                onClick={() => toggleArray('financial_goals', g)}
              >
                ✓ {g}
              </div>
            ))}
          </div>
          <div className="custom-input-row">
            <input
              value={customGoal}
              onChange={e => setCustomGoal(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addCustomGoal()}
              placeholder="Add your own goal..."
            />
            <button className="btn-secondary" style={{ padding: '10px 16px', fontSize: '13px', whiteSpace: 'nowrap' }} onClick={addCustomGoal}>
              + Add
            </button>
          </div>
        </div>
      ),
      valid: form.financial_goals.length > 0
    },
    {
      title: "What are your biggest challenges?",
      subtitle: "Be honest — this helps us prescribe better",
      content: (
        <div>
          <div className="checkbox-group">
            {CHALLENGES.map(c => (
              <div
                key={c}
                className={`checkbox-item ${form.financial_challenges.includes(c) ? 'selected' : ''}`}
                onClick={() => toggleArray('financial_challenges', c)}
              >
                {form.financial_challenges.includes(c) ? '✓ ' : ''}{c}
              </div>
            ))}
            {/* Custom challenges added by user */}
            {form.financial_challenges.filter(c => !CHALLENGES.includes(c)).map(c => (
              <div
                key={c}
                className="checkbox-item selected"
                onClick={() => toggleArray('financial_challenges', c)}
              >
                ✓ {c}
              </div>
            ))}
          </div>
          <div className="custom-input-row">
            <input
              value={customChallenge}
              onChange={e => setCustomChallenge(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addCustomChallenge()}
              placeholder="Add your own challenge..."
            />
            <button className="btn-secondary" style={{ padding: '10px 16px', fontSize: '13px', whiteSpace: 'nowrap' }} onClick={addCustomChallenge}>
              + Add
            </button>
          </div>
        </div>
      ),
      valid: form.financial_challenges.length > 0
    },
    {
      title: "Final profile details",
      subtitle: "Help us understand your financial personality",
      content: (
        <div>
          <div className="form-group">
            <label>Risk Tolerance</label>
            <select value={form.risk_tolerance} onChange={e => update('risk_tolerance', e.target.value)}>
              <option value="">Select...</option>
              <option value="very_low">Very Low — I avoid all financial risk</option>
              <option value="low">Low — I prefer safe, stable options</option>
              <option value="medium">Medium — I accept some risk for growth</option>
              <option value="high">High — I'm comfortable with volatility</option>
              <option value="very_high">Very High — I take aggressive risks</option>
            </select>
          </div>
          <div className="form-group">
            <label>Investment Experience</label>
            <select value={form.investment_experience} onChange={e => update('investment_experience', e.target.value)}>
              <option value="">Select...</option>
              <option value="none">None — I've never invested</option>
              <option value="beginner">Beginner — Savings accounts only</option>
              <option value="intermediate">Intermediate — Stocks, ETFs</option>
              <option value="advanced">Advanced — Options, real estate, crypto</option>
            </select>
          </div>
          <div className="form-group">
            <label>Debt Status</label>
            <select value={form.debt_status} onChange={e => update('debt_status', e.target.value)}>
              <option value="">Select...</option>
              <option value="debt_free">Debt Free</option>
              <option value="student_loans">Student Loans Only</option>
              <option value="credit_card_debt">Credit Card Debt</option>
              <option value="mortgage">Mortgage</option>
              <option value="multiple_debts">Multiple Debts</option>
              <option value="overwhelmed">Overwhelmed by Debt</option>
            </select>
          </div>
          <div className="form-group">
            <label>Lifestyle Description</label>
            <select value={form.lifestyle} onChange={e => update('lifestyle', e.target.value)}>
              <option value="">Select...</option>
              <option value="minimalist">Minimalist — I live below my means</option>
              <option value="balanced">Balanced — I enjoy life but stay responsible</option>
              <option value="lifestyle_creep">Lifestyle Creep — I spend more as I earn more</option>
              <option value="yolo">YOLO — I live for today, not tomorrow</option>
              <option value="hustle">Hustle Mode — Multiple income streams, growth-focused</option>
            </select>
          </div>
          {/* Contradiction notes */}
          {getContextualNotes().map((note, i) => (
            <div key={i} className="context-note">{note}</div>
          ))}
        </div>
      ),
      valid: form.risk_tolerance && form.investment_experience && form.debt_status && form.lifestyle
    }
  ]

  const current = steps[step]
  const progress = ((step + 1) / totalSteps) * 100

  return (
    <div className="onboarding">
      <nav className="onboarding-nav">
        <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <span className="logo-icon" style={{ color: 'var(--accent-gold)', fontSize: '20px' }}>✚</span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700 }}>Finova</span>
        </div>
        <div className="step-counter">Step {step + 1} of {totalSteps}</div>
      </nav>

      <div className="onboarding-progress">
        <div className="progress-bar" style={{ width: `${progress}%` }} />
      </div>

      <main className="onboarding-main">
        <div className="onboarding-card fade-up" key={step}>
          <div className="step-header">
            <p className="step-subtitle">{current.subtitle}</p>
            <h2 className="step-title">{current.title}</h2>
          </div>
          <div className="step-content">
            {current.content}
          </div>
          <div className="step-actions">
            {step > 0 && (
              <button className="btn-secondary" onClick={() => setStep(s => s - 1)}>
                ← Back
              </button>
            )}
            {step < totalSteps - 1 ? (
              <button
                className="btn-primary"
                disabled={!current.valid}
                onClick={() => setStep(s => s + 1)}
              >
                Continue →
              </button>
            ) : (
              <button
                className="btn-primary"
                disabled={!current.valid || loading}
                onClick={handleSubmit}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
                    Diagnosing...
                  </span>
                ) : 'Get My Diagnosis →'}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
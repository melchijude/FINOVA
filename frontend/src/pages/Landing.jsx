import React from 'react'
import { useNavigate } from 'react-router-dom'
import './Landing.css'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="landing">
      <nav className="landing-nav">
        <div className="logo">
          <span className="logo-icon">✚</span>
          <span className="logo-text">Finova</span>
        </div>
        <div className="nav-tag">Your Finance Doctor</div>
      </nav>

      <main className="landing-main">
        <div className="hero-eyebrow">
          <span className="tag tag-gold">AI Financial Agent</span>
        </div>

        <h1 className="hero-title">
          Your Money Has<br />
          <span className="hero-accent">a Diagnosis.</span><br />
          We Have the Cure.
        </h1>

        <p className="hero-subtitle">
          Finova is an intelligent financial agent that analyzes your income, 
          spending behavior, and lifestyle to prescribe the exact resources 
          you need to transform your financial health.
        </p>

        <div className="hero-cta">
          <button className="btn-primary" onClick={() => navigate('/onboarding')}>
            Get Your Diagnosis →
          </button>
          <p className="cta-note">Takes 3 minutes. Completely personalized.</p>
        </div>

        <div className="hero-pillars">
          <div className="pillar">
            <div className="pillar-icon">🔬</div>
            <div className="pillar-label">Diagnose</div>
            <div className="pillar-desc">Deep behavioral analysis of your financial profile</div>
          </div>
          <div className="pillar-divider">→</div>
          <div className="pillar">
            <div className="pillar-icon">💊</div>
            <div className="pillar-label">Prescribe</div>
            <div className="pillar-desc">Personalized books, videos & podcasts curated for you</div>
          </div>
          <div className="pillar-divider">→</div>
          <div className="pillar">
            <div className="pillar-icon">📈</div>
            <div className="pillar-label">Transform</div>
            <div className="pillar-desc">Track your financial mindset evolution over time</div>
          </div>
        </div>
      </main>

      <footer className="landing-footer">
        <p>Diagnose. Prescribe. Transform.</p>
      </footer>
    </div>
  )
}

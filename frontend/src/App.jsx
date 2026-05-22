import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import Onboarding from './pages/Onboarding.jsx'
import Dashboard from './pages/Dashboard.jsx'

export default function App() {
  const [userProfile, setUserProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('finova_profile')
      return saved ? JSON.parse(saved) : null
    } catch (e) { return null }
  })

  const [diagnosis, setDiagnosis] = useState(() => {
    try {
      const saved = localStorage.getItem('finova_diagnosis')
      return saved ? JSON.parse(saved) : null
    } catch (e) { return null }
  })

  const handleSetProfile = (profile) => {
    setUserProfile(profile)
    localStorage.setItem('finova_profile', JSON.stringify(profile))
  }

  const handleSetDiagnosis = (diag) => {
    setDiagnosis(diag)
    localStorage.setItem('finova_diagnosis', JSON.stringify(diag))
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route
          path="/onboarding"
          element={
            <Onboarding
              setUserProfile={handleSetProfile}
              setDiagnosis={handleSetDiagnosis}
            />
          }
        />
        <Route
          path="/dashboard"
          element={
            userProfile
              ? <Dashboard userProfile={userProfile} diagnosis={diagnosis} />
              : <Navigate to="/onboarding" />
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
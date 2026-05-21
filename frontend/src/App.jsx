import React, { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import Onboarding from './pages/Onboarding.jsx'
import Dashboard from './pages/Dashboard.jsx'

export default function App() {
  const [userProfile, setUserProfile] = useState(null)
  const [diagnosis, setDiagnosis] = useState(null)

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route 
          path="/onboarding" 
          element={
            <Onboarding 
              setUserProfile={setUserProfile} 
              setDiagnosis={setDiagnosis} 
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

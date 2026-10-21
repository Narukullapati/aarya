import { useEffect, useState } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import './App.css'
import { SiteHeader } from './components/SiteHeader'
import { SiteFooter } from './components/SiteFooter'
import { Home } from './pages/Home'
import { WorkPage } from './pages/WorkPage'
import { TextPage } from './pages/TextPage'
import { API_BASE } from './api'

function Shell() {
  const location = useLocation()
  const [apiStatus, setApiStatus] = useState('checking…')

  useEffect(() => {
    if (!API_BASE) {
      setApiStatus('not configured')
      return
    }
    fetch(`${API_BASE}/api/health`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d) => setApiStatus(d.status ?? 'ok'))
      .catch(() => setApiStatus('unreachable'))
  }, [])

  useEffect(() => {
    if (!API_BASE) return
    fetch(`${API_BASE}/api/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: location.pathname,
        referrer: document.referrer,
      }),
    }).catch(() => {})
  }, [location.pathname])

  return (
    <>
      <div className="honeycomb" aria-hidden="true" />
      <div className="wrap">
        <SiteHeader />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/fine-art"
              element={
                <WorkPage
                  title="fine art"
                  note="selected works"
                  category="fine-art"
                />
              }
            />
            <Route
              path="/design-projects"
              element={
                <WorkPage
                  title="design projects"
                  note="process & output"
                  category="design-projects"
                />
              }
            />
            <Route
              path="/photography"
              element={
                <TextPage title="the human error log" note="public entries" />
              }
            />
            <Route path="*" element={<Home />} />
          </Routes>
        </main>
        <SiteFooter apiStatus={apiStatus} />
      </div>
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  )
}

export default App

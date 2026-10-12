import { useEffect, useState } from 'react'
import './App.css'

const NAV = [
  { label: 'fine art', href: '#fine-art' },
  { label: 'design projects', href: '#design-projects' },
  { label: 'photography', href: '#photography' },
]

const ANNOTATIONS = [
  { left: 528, top: 75, barW: 88, boxW: 161, solid: false, text: 'Aarya' },
  { left: 202, top: 172, barW: 71, boxW: 129, solid: true, text: 'image as structure' },
  { left: 274, top: 478, barW: 68, boxW: 140, solid: false, text: 'work with design, code and interfaces' },
  { left: 542, top: 465, barW: 88, boxW: 161, solid: false, text: 'experiments in visual language' },
]

const LINES = [
  { x1: 528, y1: 136, x2: 426, y2: 188 },
  { x1: 331, y1: 229, x2: 388, y2: 263 },
  { x1: 341, y1: 478, x2: 394, y2: 402 },
  { x1: 542, y1: 465, x2: 482, y2: 416 },
]

const SECTIONS = [
  { id: 'fine-art', title: 'fine art', note: 'selected works' },
  { id: 'design-projects', title: 'design projects', note: 'process & output' },
  { id: 'photography', title: 'photography', note: 'frames & studies' },
]

function MailIcon() {
  return (
    <svg width="22" height="15" viewBox="0 0 22 15" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0.5" y="0.5" width="21" height="14" stroke="#FF0C10" />
      <path d="M1 1L11 8.5L21 1" stroke="#FF0C10" />
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0.5" y="0.5" width="17" height="17" rx="4.5" stroke="#FF0C10" />
      <circle cx="9" cy="9" r="3.5" stroke="#FF0C10" />
      <circle cx="13.6" cy="4.4" r="1" fill="#FF0C10" />
    </svg>
  )
}

function App() {
  const [apiStatus, setApiStatus] = useState('checking…')

  useEffect(() => {
    const base = import.meta.env.VITE_API_BASE_URL
    if (!base) {
      setApiStatus('not configured')
      return
    }
    fetch(`${base}/api/health`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d) => setApiStatus(d.status ?? 'ok'))
      .catch(() => setApiStatus('unreachable'))

    fetch(`${base}/api/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: window.location.pathname,
        referrer: document.referrer,
      }),
    }).catch(() => {})
  }, [])

  return (
    <div className="wrap">
      <header className="site-header">
        <a href="/" className="logo" aria-label="aarya home">
          <span className="logo-box">A</span>
        </a>
        <nav className="site-nav">
          {NAV.map((n) => (
            <a key={n.href} href={n.href}>
              <span className="nav-label">{n.label}</span>
              <span className="nav-ghost">{n.label}</span>
            </a>
          ))}
        </nav>
      </header>

      <main>
        <section className="hero">
          <div className="hero-stage">
            <div className="hero-photo">
              <div className="ph">portrait</div>
            </div>
            <div className="hero-bg">
              <div className="ph" />
            </div>
            <div className="hero-title">
              <div className="fade">
                <p className="tag">
                  graphic design, imagery,
                  <br />
                  visual projects
                </p>
              </div>
              <h1>
                AARYA
                <br />
                PORTFOLIO
              </h1>
            </div>
            <div className="hero-desc">
              <p>
                This space collects work in design, code and visual experiments.
                The projects reflect an approach based on the balance of idea
                and form — each piece viewed as part of a broader process.
              </p>
            </div>
            {ANNOTATIONS.map((a, i) => (
              <div
                key={i}
                className="annotation"
                style={{ left: a.left, top: a.top }}
              >
                <div className="bar" style={{ width: a.barW }} />
                <div
                  className={`box${a.solid ? ' solid' : ''}`}
                  style={{ width: a.boxW }}
                >
                  <p>{a.text}</p>
                </div>
              </div>
            ))}
            <svg className="hero-lines">
              {LINES.map((l, i) => (
                <g key={i}>
                  <line
                    x1={l.x1}
                    y1={l.y1}
                    x2={l.x2}
                    y2={l.y2}
                    stroke="#FF0C10"
                    strokeWidth="1"
                  />
                  <circle cx={l.x2} cy={l.y2} r="2.67" fill="#FF0C10" />
                </g>
              ))}
            </svg>
          </div>
        </section>

        <section className="hero-mobile">
          <p className="tag">
            graphic design, imagery,
            <br />
            visual projects
          </p>
          <h1>
            AARYA
            <br />
            PORTFOLIO
          </h1>
          <div className="m-photo">portrait</div>
          <div className="m-annotations">
            {ANNOTATIONS.map((a, i) => (
              <div key={i}>
                <div className="bar" />
                <div className="box">{a.text}</div>
              </div>
            ))}
          </div>
          <p className="desc">
            This space collects work in design, code and visual experiments. The
            projects reflect an approach based on the balance of idea and form —
            each piece viewed as part of a broader process.
          </p>
        </section>

        {SECTIONS.map((s) => (
          <section key={s.id} id={s.id} className="work-section">
            <div className="work-inner">
              <div className="work-head">
                <h2>{s.title}</h2>
                <span>{s.note}</span>
              </div>
              <div className="work-grid">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="work-tile">
                    <div className="tile-bar" />
                    <div className="ph">image</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ))}
      </main>

      <footer className="site-footer">
        <div className="footer-grid">
          <div className="footer-contact">
            <p className="label">contact</p>
            <a href="mailto:hello@aarya.narukullapati.com">
              <span>hello@aarya.narukullapati.com</span>
              <MailIcon />
            </a>
            <a href="#" onClick={(e) => e.preventDefault()}>
              <span>instagram</span>
              <InstagramIcon />
            </a>
          </div>
        </div>
        <div className="api-status">api: {apiStatus}</div>
        <p className="copyright">© 2026 Aarya. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default App

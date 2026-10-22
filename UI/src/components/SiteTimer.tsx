import { useEffect, useState } from 'react'
import {
  fmtEst,
  getTimer,
  startTimer,
  stopTimer,
  type TimerState,
} from '../api'

function formatElapsed(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

export function SiteTimer() {
  const [timer, setTimer] = useState<TimerState | null>(null)
  const [now, setNow] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    getTimer()
      .then(setTimer)
      .catch(() => {})
  }, [])

  // counts off the viewer's own clock; only ticks while the tab is visible
  useEffect(() => {
    if (!timer?.running) return
    let id: number | undefined
    const tick = () => setNow(Date.now())
    const stop = () => {
      if (id !== undefined) {
        clearInterval(id)
        id = undefined
      }
    }
    const start = () => {
      tick()
      id = window.setInterval(tick, 1000)
    }
    const onVis = () => (document.hidden ? stop() : start())
    onVis()
    document.addEventListener('visibilitychange', onVis)
    return () => {
      stop()
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [timer])

  async function start() {
    setError('')
    const label = window.prompt('timer label') ?? ''
    try {
      setTimer(await startTimer(label))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'failed to start')
    }
  }

  async function stop() {
    setError('')
    try {
      await stopTimer()
      setTimer({ running: false })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'failed to stop')
    }
  }

  return (
    <section className="site-timer">
      {timer?.running && timer.started_at_ms ? (
        <div className="timer-box">
          {timer.label && <p className="timer-label">{timer.label}</p>}
          <p className="timer-digits">
            {formatElapsed(now - timer.started_at_ms)}
          </p>
          <p className="timer-started">
            started {fmtEst(timer.started_at_ms)}
          </p>
          <div className="timer-controls">
            <button className="add-btn" onClick={start}>
              restart
            </button>
            <button className="add-btn" onClick={stop}>
              stop
            </button>
          </div>
        </div>
      ) : (
        <button className="add-btn timer-start" onClick={start}>
          + start timer
        </button>
      )}
      {error && <p className="upload-error">{error}</p>}
    </section>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ColorPicker } from '../components/ColorPicker'
import { QUIZ_PASSWORD } from './QuizPage'
import { resetTheme, setGraphic, storedGraphic, type Graphic } from '../theme'

export function MiscPage() {
  const [resetId, setResetId] = useState(0)
  const [graphic, setGraphicState] = useState<Graphic>(storedGraphic())
  const navigate = useNavigate()

  function quizMe() {
    const pw = window.prompt(
      'enter the password to edit questions — cancel to just play',
    )
    if (pw === QUIZ_PASSWORD) {
      navigate('/quiz', { state: { admin: true } })
    } else {
      if (pw !== null && pw !== '') window.alert('wrong password')
      navigate('/quiz')
    }
  }

  function reset() {
    resetTheme()
    setGraphicState('hexagons')
    setResetId((i) => i + 1)
  }

  return (
    <section className="work-page">
      <div className="work-inner">
        <div className="work-head">
          <h2>misc</h2>
          <span>extras</span>
        </div>

        <div className="settings-card">
          <h3>Settings</h3>

          <div className="settings-row">
            <div className="settings-col">
              <div className="setting">
                <span className="setting-label">Accent Color</span>
                <ColorPicker key={`a${resetId}`} slot="accent" />
              </div>

              <div className="setting">
                <span className="setting-label">Main Color</span>
                <ColorPicker key={`m${resetId}`} slot="main" />
              </div>
            </div>

            <div className="settings-col">
              <div className="setting">
                <span className="setting-label">Front Graphic</span>
                <select
                  className="graphic-select"
                  value={graphic}
                  onChange={(e) => {
                    const g = e.target.value as Graphic
                    setGraphicState(g)
                    setGraphic(g)
                  }}
                >
                  <option value="hexagons">hexagons</option>
                  <option value="smileys">smileys</option>
                </select>
              </div>

              <div className="setting">
                <span className="setting-label">Quiz</span>
                <button className="quiz-me-btn" onClick={quizMe}>
                  Quiz me!
                </button>
              </div>
            </div>
          </div>

          <button className="reset-colors" onClick={reset}>
            reset to default
          </button>
        </div>
      </div>
    </section>
  )
}

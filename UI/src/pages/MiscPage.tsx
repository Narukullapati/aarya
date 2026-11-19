import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ColorPicker } from '../components/ColorPicker'
import { QUIZ_PASSWORD } from './QuizPage'
import { resetTheme, setGraphic, storedGraphic, type Graphic } from '../theme'
import { setEditToken } from '../api'
import { useEditMode, setEditMode } from '../editmode'
import { saveOverrides } from '../textedit'

export function MiscPage() {
  const [resetId, setResetId] = useState(0)
  const [graphic, setGraphicState] = useState<Graphic>(storedGraphic())
  const navigate = useNavigate()
  const editMode = useEditMode()
  const [saving, setSaving] = useState(false)

  function toggleEdit(checked: boolean) {
    if (!checked) {
      setEditMode(false)
      return
    }
    const pw = window.prompt('enter the password to enable edit mode')
    if (pw === QUIZ_PASSWORD) {
      setEditToken(pw)
      setEditMode(true)
    } else if (pw !== null && pw !== '') {
      window.alert('wrong password')
    }
  }

  async function saveEdits() {
    setSaving(true)
    try {
      await saveOverrides()
      window.alert('saved')
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'save failed')
    } finally {
      setSaving(false)
    }
  }

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

              <div className="setting">
                <span className="setting-label">Game</span>
                <Link className="quiz-me-btn" to="/pkmn">
                  PKMN Imposter
                </Link>
              </div>
            </div>
          </div>

          <div className="setting edit-setting">
            <span className="setting-label">Edit Mode</span>
            <label className="edit-check">
              <input
                type="checkbox"
                checked={editMode}
                onChange={(e) => toggleEdit(e.target.checked)}
              />
              <span>double-click text to edit</span>
            </label>
            {editMode && (
              <button className="add-btn" onClick={saveEdits} disabled={saving}>
                {saving ? 'saving…' : 'save'}
              </button>
            )}
          </div>

          <button className="reset-colors" onClick={reset}>
            reset to default
          </button>
        </div>
      </div>
    </section>
  )
}

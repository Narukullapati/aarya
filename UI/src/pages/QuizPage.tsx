import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

export const QUIZ_PASSWORD = '09/09/09'
const STORAGE_KEY = 'aarya-quiz-questions'
const JEOPARDY_KEY = 'aarya-quiz-jeopardy'
const CATS_KEY = 'aarya-quiz-categories'
const TEAMS_KEY = 'aarya-jeopardy-teams'

interface Team {
  name: string
  score: number
}

interface QuizQuestion {
  id: number
  q: string
  choices: string[]
  answer: number
  category: string
}

function storedJeopardy(): boolean {
  return localStorage.getItem(JEOPARDY_KEY) === '1'
}

function storedTeams(): Team[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(TEAMS_KEY) ?? '[]')
    if (Array.isArray(parsed)) {
      return parsed
        .filter((t) => t && typeof t.name === 'string' && t.name.trim())
        .map((t) => ({
          name: t.name,
          score: typeof t.score === 'number' ? t.score : 0,
        }))
    }
  } catch {
    // fall through to defaults
  }
  return [
    { name: 'team 1', score: 0 },
    { name: 'team 2', score: 0 },
  ]
}

function storedCats(): string[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(CATS_KEY) ?? '[]')
    return Array.isArray(parsed)
      ? parsed.filter((c) => typeof c === 'string' && c.trim())
      : []
  } catch {
    return []
  }
}

const LETTERS = ['a', 'b', 'c', 'd']

const DEFAULT_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    q: 'what is the site accent color by default?',
    choices: ['red', 'green', 'blue', 'purple'],
    answer: 1,
    category: 'this site',
  },
  {
    id: 2,
    q: 'how many links are in the top nav?',
    choices: ['two', 'three', 'four', 'five'],
    answer: 2,
    category: 'this site',
  },
  {
    id: 3,
    q: 'what graphic style is the smileys option based on?',
    choices: ['flames', 'hexagons', 'a band logo', 'pixel art'],
    answer: 2,
    category: 'graphics',
  },
]

function loadQuestions(): QuizQuestion[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        return parsed
          .filter(
            (p) => p && typeof p.q === 'string' && Array.isArray(p.choices),
          )
          .map((p) => ({
            ...p,
            category: typeof p.category === 'string' ? p.category : '',
          }))
      }
    }
  } catch {
    // fall through to defaults
  }
  return DEFAULT_QUESTIONS
}

export function QuizPage() {
  const state = useLocation().state as { admin?: boolean } | null
  if (state?.admin) return <QuizEditor />
  return storedJeopardy() ? <JeopardyBoard /> : <QuizPlayer />
}

// ---------- edit mode ----------

function QuizEditor() {
  const [questions, setQuestions] = useState<QuizQuestion[]>(loadQuestions)
  const [jep, setJep] = useState(storedJeopardy())
  const [cats, setCats] = useState<string[]>(storedCats)
  const [newCat, setNewCat] = useState('')

  useEffect(() => {
    localStorage.setItem(CATS_KEY, JSON.stringify(cats))
  }, [cats])

  function addCat() {
    const c = newCat.trim()
    if (c && !cats.includes(c)) setCats((cs) => [...cs, c])
    setNewCat('')
  }

  function removeCat(c: string) {
    setCats((cs) => cs.filter((x) => x !== c))
    setQuestions((qs) =>
      qs.map((q) => (q.category === c ? { ...q, category: '' } : q)),
    )
  }

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(questions))
  }, [questions])

  const update = (id: number, patch: Partial<QuizQuestion>) =>
    setQuestions((qs) => qs.map((q) => (q.id === id ? { ...q, ...patch } : q)))

  const setChoice = (id: number, i: number, v: string) =>
    setQuestions((qs) =>
      qs.map((q) =>
        q.id === id
          ? { ...q, choices: q.choices.map((c, ci) => (ci === i ? v : c)) }
          : q,
      ),
    )

  const add = () =>
    setQuestions((qs) => [
      ...qs,
      {
        id: Math.max(0, ...qs.map((q) => q.id)) + 1,
        q: '',
        choices: ['', '', '', ''],
        answer: 0,
        category: '',
      },
    ])

  const remove = (id: number) =>
    setQuestions((qs) => qs.filter((q) => q.id !== id))

  return (
    <section className="work-page">
      <div className="work-inner">
        <div className="work-head">
          <h2>quiz editor</h2>
          <span>{questions.length} questions</span>
        </div>

        {jep && (
          <div className="quiz-cats">
            <div className="quiz-cat-list">
              {cats.map((c) => (
                <span className="quiz-cat-chip" key={c}>
                  {c}
                  <button
                    onClick={() => removeCat(c)}
                    aria-label={`remove ${c}`}
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                className="quiz-input quiz-cat-new"
                value={newCat}
                placeholder="new category"
                onChange={(e) => setNewCat(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addCat()
                  }
                }}
              />
              <button className="add-btn" onClick={addCat}>
                + add
              </button>
            </div>
          </div>
        )}

        {questions.map((q, qi) => (
          <div className="quiz-edit-card" key={q.id}>
            <div className="quiz-edit-head">
              <span>question {qi + 1}</span>
              <button className="add-btn" onClick={() => remove(q.id)}>
                delete
              </button>
            </div>
            <input
              className="quiz-input"
              value={q.q}
              placeholder="question text"
              onChange={(e) => update(q.id, { q: e.target.value })}
            />
            {jep && (
              <select
                className="graphic-select quiz-cat-select"
                value={q.category}
                onChange={(e) => update(q.id, { category: e.target.value })}
              >
                <option value="">misc</option>
                {cats.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            )}
            <div className="quiz-choices-edit">
              {q.choices.map((c, i) => (
                <label key={i} className="quiz-choice-edit">
                  <input
                    type="radio"
                    name={`ans-${q.id}`}
                    checked={q.answer === i}
                    onChange={() => update(q.id, { answer: i })}
                  />
                  <span>{LETTERS[i]}</span>
                  <input
                    className="quiz-input"
                    value={c}
                    placeholder={`choice ${LETTERS[i]}`}
                    onChange={(e) => setChoice(q.id, i, e.target.value)}
                  />
                </label>
              ))}
            </div>
          </div>
        ))}

        <div className="quiz-actions">
          <button className="add-btn" onClick={add}>
            + add question
          </button>
          <Link className="add-btn" to="/quiz">
            play quiz
          </Link>
        </div>

        <div className="jeopardy-row">
          <span className="setting-label">Jeopardy</span>
          <button
            className={`jep-toggle ${jep ? 'on' : ''}`}
            onClick={() => {
              const next = !jep
              setJep(next)
              localStorage.setItem(JEOPARDY_KEY, next ? '1' : '0')
            }}
            aria-pressed={jep}
            aria-label="jeopardy mode"
          >
            <span className="jep-knob" />
          </button>
          <span className="jep-state">{jep ? 'on' : 'off'}</span>
        </div>
      </div>
    </section>
  )
}

// ---------- play mode ----------

function QuizPlayer() {
  const questions = useMemo(loadQuestions, [])
  const [i, setI] = useState(0)
  const [score, setScore] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)

  if (questions.length === 0) {
    return (
      <section className="work-page">
        <div className="work-inner">
          <div className="work-head">
            <h2>quiz</h2>
            <span>empty</span>
          </div>
          <p className="gallery-note">
            no questions yet — add some with the password from misc.
          </p>
        </div>
      </section>
    )
  }

  if (i >= questions.length) {
    return (
      <section className="work-page">
        <div className="work-inner">
          <div className="work-head">
            <h2>quiz</h2>
            <span>done</span>
          </div>
          <div className="quiz-result">
            <p className="big">
              {score}/{questions.length}
            </p>
            <p>{score === questions.length ? 'perfect' : 'not bad'}</p>
            <div className="quiz-actions center">
              <button
                className="add-btn"
                onClick={() => {
                  setI(0)
                  setScore(0)
                }}
              >
                play again
              </button>
              <Link className="add-btn" to="/misc">
                back to misc
              </Link>
            </div>
          </div>
        </div>
      </section>
    )
  }

  const q = questions[i]

  function pick(ci: number) {
    if (picked !== null) return
    setPicked(ci)
    if (ci === q.answer) setScore((s) => s + 1)
    window.setTimeout(() => {
      setPicked(null)
      setI((v) => v + 1)
    }, 1400)
  }

  return (
    <section className="work-page">
      <div className="work-inner">
        <div className="work-head">
          <h2>quiz</h2>
          <span>
            {i + 1} / {questions.length}
          </span>
        </div>

        <div className="quiz-question">
          <p>{q.q}</p>
        </div>

        <div className="quiz-grid">
          {q.choices.map((c, ci) => {
            let cls = 'quiz-choice'
            if (picked !== null) {
              if (ci === q.answer) cls += ' right'
              else if (ci === picked) cls += ' wrong'
              else cls += ' dim'
            }
            return (
              <button
                key={ci}
                className={cls}
                onClick={() => pick(ci)}
                disabled={picked !== null}
              >
                <span className="quiz-letter">{LETTERS[ci]}</span>
                <span>{c}</span>
              </button>
            )
          })}
        </div>

        {picked !== null && (
          <div
            className={`quiz-feedback ${picked === q.answer ? 'right' : 'wrong'}`}
          >
            {picked === q.answer ? 'correct!' : 'incorrect'}
          </div>
        )}
      </div>
    </section>
  )
}

// ---------- jeopardy mode ----------

function JeopardyBoard() {
  const questions = useMemo(loadQuestions, [])
  const cats = useMemo(() => {
    const map = new Map<string, QuizQuestion[]>()
    for (const c of storedCats()) map.set(c, [])
    for (const q of questions) {
      const c = q.category.trim() || 'misc'
      if (!map.has(c)) map.set(c, [])
      map.get(c)!.push(q)
    }
    return [...map.entries()].filter(([, qs]) => qs.length > 0)
  }, [questions])

  const [used, setUsed] = useState<Set<number>>(new Set())
  const [teams, setTeams] = useState<Team[]>(storedTeams)
  const [newTeam, setNewTeam] = useState('')
  const [active, setActive] = useState<{ q: QuizQuestion; v: number } | null>(
    null,
  )
  const [picked, setPicked] = useState<number | null>(null)

  useEffect(() => {
    localStorage.setItem(TEAMS_KEY, JSON.stringify(teams))
  }, [teams])

  const maxRows = Math.max(0, ...cats.map(([, qs]) => qs.length))
  const done = questions.length > 0 && used.size === questions.length

  function addTeam() {
    const name = newTeam.trim()
    if (name && !teams.some((t) => t.name === name)) {
      setTeams((ts) => [...ts, { name, score: 0 }])
    }
    setNewTeam('')
  }

  function removeTeam(name: string) {
    setTeams((ts) => ts.filter((t) => t.name !== name))
  }

  function pick(ci: number) {
    if (!active || picked !== null) return
    setPicked(ci)
    setUsed((u) => new Set(u).add(active.q.id))
  }

  function award(name: string) {
    if (!active || picked === null) return
    const delta = picked === active.q.answer ? active.v : -active.v
    setTeams((ts) =>
      ts.map((t) => (t.name === name ? { ...t, score: t.score + delta } : t)),
    )
    setPicked(null)
    setActive(null)
  }

  function backToBoard() {
    setPicked(null)
    setActive(null)
  }

  if (questions.length === 0) {
    return (
      <section className="work-page">
        <div className="work-inner">
          <div className="work-head">
            <h2>jeopardy</h2>
            <span>empty</span>
          </div>
          <p className="gallery-note">
            no questions yet — add some with the password from misc.
          </p>
        </div>
      </section>
    )
  }

  if (done) {
    return (
      <section className="work-page">
        <div className="work-inner">
          <div className="work-head">
            <h2>jeopardy</h2>
            <span>final</span>
          </div>
          <div className="quiz-result">
            {teams.length > 0 ? (
              <>
                <p className="big">
                  {[...teams].sort((a, b) => b.score - a.score)[0].name}
                </p>
                <p>wins!</p>
                <div className="jep-final-teams">
                  {[...teams]
                    .sort((a, b) => b.score - a.score)
                    .map((t) => (
                      <p key={t.name}>
                        {t.name}: {t.score}
                      </p>
                    ))}
                </div>
              </>
            ) : (
              <p className="big">done</p>
            )}
            <div className="quiz-actions center">
              <button
                className="add-btn"
                onClick={() => {
                  setUsed(new Set())
                  setTeams((ts) => ts.map((t) => ({ ...t, score: 0 })))
                }}
              >
                play again
              </button>
              <Link className="add-btn" to="/misc">
                back to misc
              </Link>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (active) {
    const { q } = active
    return (
      <section className="work-page">
        <div className="work-inner">
          <div className="work-head">
            <h2>{q.category.trim() || 'misc'}</h2>
            <span>{active.v} pts</span>
          </div>

          <div className="quiz-question">
            <p>{q.q}</p>
          </div>

          <div className="quiz-grid">
            {q.choices.map((c, ci) => {
              let cls = 'quiz-choice'
              if (picked !== null) {
                if (ci === q.answer) cls += ' right'
                else if (ci === picked) cls += ' wrong'
                else cls += ' dim'
              }
              return (
                <button
                  key={ci}
                  className={cls}
                  onClick={() => pick(ci)}
                  disabled={picked !== null}
                >
                  <span className="quiz-letter">{LETTERS[ci]}</span>
                  <span>{c}</span>
                </button>
              )
            })}
          </div>

          {picked !== null && (
            <>
              <div
                className={`quiz-feedback ${picked === q.answer ? 'right' : 'wrong'}`}
              >
                {picked === q.answer ? `+${active.v}` : `−${active.v}`}
              </div>
              <div className="jep-award">
                <span className="setting-label">award to:</span>
                {teams.map((t) => (
                  <button
                    key={t.name}
                    className="add-btn"
                    onClick={() => award(t.name)}
                  >
                    {t.name}{' '}
                    {picked === q.answer ? `+${active.v}` : `−${active.v}`}
                  </button>
                ))}
                {teams.length === 0 && (
                  <button className="add-btn" onClick={backToBoard}>
                    back to board
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </section>
    )
  }

  return (
    <section className="work-page">
      <div className="work-inner">
        <div className="work-head">
          <h2>jeopardy</h2>
          <span>{teams.length} teams</span>
        </div>

        <div className="jep-teams">
          {teams.map((t) => (
            <span className="quiz-cat-chip jep-team" key={t.name}>
              {t.name}: <b>{t.score}</b>
              <button
                onClick={() => removeTeam(t.name)}
                aria-label={`remove ${t.name}`}
              >
                ×
              </button>
            </span>
          ))}
          <input
            className="quiz-input jep-team-new"
            value={newTeam}
            placeholder="new team"
            onChange={(e) => setNewTeam(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addTeam()
              }
            }}
          />
          <button className="add-btn" onClick={addTeam}>
            + add
          </button>
        </div>

        <div
          className="jeopardy-board"
          style={{ gridTemplateColumns: `repeat(${cats.length}, 1fr)` }}
        >
          {cats.map(([c]) => (
            <div className="jeopardy-cat" key={`h-${c}`}>
              {c}
            </div>
          ))}
          {Array.from({ length: maxRows }, (_, row) =>
            cats.map(([c, qs]) => {
              const q = qs[row]
              if (!q) return <div key={`${c}-${row}`} className="jeopardy-tile empty" />
              const v = 200 * (row + 1)
              const isUsed = used.has(q.id)
              return (
                <button
                  key={`${c}-${row}`}
                  className={`jeopardy-tile ${isUsed ? 'used' : ''}`}
                  disabled={isUsed}
                  onClick={() => setActive({ q, v })}
                >
                  {isUsed ? '·' : v}
                </button>
              )
            }),
          )}
        </div>
      </div>
    </section>
  )
}

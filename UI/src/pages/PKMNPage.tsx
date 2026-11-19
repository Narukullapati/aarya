import { useState } from 'react'
import { Link } from 'react-router-dom'
import { POKEMON } from '../data-pokemon'

interface Game {
  players: string[]
  pokemon: string
  pkmnId: number
  imposters: Set<number>
}

const SPRITES =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites'
const POKE_BALL = `${SPRITES}/items/poke-ball.png`

function PkmnImg({ id, name }: { id: number; name: string }) {
  const [fallback, setFallback] = useState(false)
  return (
    <img
      className="pkmn-img"
      src={
        fallback
          ? `${SPRITES}/pokemon/${id}.png`
          : `${SPRITES}/pokemon/other/official-artwork/${id}.png`
      }
      alt={name}
      onError={() => setFallback(true)}
    />
  )
}

export function PKMNPage() {
  const [names, setNames] = useState<string[]>(['', '', '', ''])
  const [impCount, setImpCount] = useState(1)
  const [game, setGame] = useState<Game | null>(null)
  const [revealed, setRevealed] = useState<Set<number>>(new Set())

  const playerCount = names.map((n) => n.trim()).filter(Boolean).length

  function setName(i: number, v: string) {
    setNames((ns) => ns.map((n, ni) => (ni === i ? v : n)))
  }

  function addRow() {
    setNames((ns) => [...ns, ''])
  }

  function removeRow(i: number) {
    setNames((ns) => (ns.length > 2 ? ns.filter((_, ni) => ni !== i) : ns))
  }

  function start() {
    const players = names.map((n) => n.trim()).filter(Boolean)
    if (players.length < 2) {
      window.alert('need at least 2 players')
      return
    }
    const count =
      players.length > 3
        ? Math.min(Math.max(1, Math.floor(impCount) || 1), players.length - 1)
        : 1
    const imposters = new Set<number>()
    while (imposters.size < count) {
      imposters.add(Math.floor(Math.random() * players.length))
    }
    const pkmnId = Math.floor(Math.random() * POKEMON.length) + 1
    setGame({ players, pokemon: POKEMON[pkmnId - 1], pkmnId, imposters })
    setRevealed(new Set())
  }

  if (game) {
    return (
      <section className="work-page">
        <div className="work-inner">
          <div className="work-head">
            <h2>pkmn imposter</h2>
            <span>{game.players.length} players</span>
          </div>

          <p className="gallery-note pkmn-note">
            tap a card to reveal — tap again to hide. everyone who is not
            the imposter is a {game.pokemon}.
          </p>

          <div className="pkmn-grid">
            {game.players.map((name, i) => {
              const r = revealed.has(i)
              const isImp = game.imposters.has(i)
              return (
                <button
                  key={i}
                  className={`pkmn-card ${r ? 'revealed' : ''} ${r && isImp ? 'imp' : ''}`}
                  onClick={() =>
                    setRevealed((s) => {
                      const n = new Set(s)
                      if (n.has(i)) n.delete(i)
                      else n.add(i)
                      return n
                    })
                  }
                >
                  <span className="pkmn-name">{name}</span>
                  {r ? (
                    isImp ? (
                      <>
                        <img className="pkmn-img" src={POKE_BALL} alt="" />
                        <span className="pkmn-value">
                          you are the imposter
                        </span>
                      </>
                    ) : (
                      <>
                        <PkmnImg id={game.pkmnId} name={game.pokemon} />
                        <span className="pkmn-value">{game.pokemon}</span>
                      </>
                    )
                  ) : (
                    <span className="pkmn-value">?</span>
                  )}
                </button>
              )
            })}
          </div>

          <div className="quiz-actions center">
            <button className="add-btn" onClick={() => setGame(null)}>
              new game
            </button>
            <Link className="add-btn" to="/misc">
              back to misc
            </Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="work-page">
      <div className="work-inner">
        <div className="work-head">
          <h2>pkmn imposter</h2>
          <span>{playerCount} players</span>
        </div>

        <div className="pkmn-setup">
          {names.map((n, i) => (
            <div className="pkmn-row" key={i}>
              <input
                className="quiz-input"
                value={n}
                placeholder={`player ${i + 1}`}
                onChange={(e) => setName(i, e.target.value)}
              />
              {names.length > 2 && (
                <button
                  className="pkmn-remove"
                  onClick={() => removeRow(i)}
                  aria-label={`remove player ${i + 1}`}
                >
                  ×
                </button>
              )}
            </div>
          ))}

          {playerCount > 3 && (
            <div className="pkmn-row imp-row">
              <span className="setting-label">imposters</span>
              <input
                className="quiz-input pkmn-imp-input"
                type="number"
                min={1}
                value={impCount}
                onChange={(e) => setImpCount(Number(e.target.value))}
              />
            </div>
          )}

          <div className="quiz-actions">
            <button className="add-btn" onClick={addRow}>
              + add player
            </button>
            <button className="add-btn" onClick={start}>
              start
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

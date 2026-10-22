import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
  type MouseEvent,
} from 'react'
import {
  createPost,
  deletePost,
  fmtEst,
  listPosts,
  type TextPost,
} from '../api'

const MAX_WORDS = 500
const wordCount = (s: string) => (s.trim() ? s.trim().split(/\s+/).length : 0)

export function TextPage({ title, note }: { title: string; note: string }) {
  const [posts, setPosts] = useState<TextPost[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const refresh = useCallback(() => {
    listPosts()
      .then((d) => {
        setPosts(d)
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const words = wordCount(text)
  const overLimit = words > MAX_WORDS

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!text.trim() || overLimit || busy) return
    setBusy(true)
    setError('')
    try {
      await createPost(text)
      setText('')
      refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'post failed')
    } finally {
      setBusy(false)
    }
  }

  async function remove(id: number, e: MouseEvent) {
    e.stopPropagation()
    try {
      await deletePost(id)
      setPosts((prev) => prev.filter((p) => p.id !== id))
    } catch {
      setError('delete failed')
    }
  }

  return (
    <section className="work-page">
      <div className="work-inner">
        <div className="work-head">
          <h2>{title}</h2>
          <span>{note}</span>
        </div>

        <form className="upload-form" onSubmit={submit}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="type a paragraph…"
            rows={5}
          />
          <div className="upload-row">
            <span className={overLimit ? 'word-count over' : 'word-count'}>
              {words}/{MAX_WORDS} words
            </span>
            <button type="submit" disabled={!text.trim() || overLimit || busy}>
              {busy ? 'sending…' : 'send'}
            </button>
          </div>
          {error && <p className="upload-error">{error}</p>}
        </form>

        {status === 'error' && (
          <p className="gallery-note">couldn't reach the api</p>
        )}
        {status === 'ready' && posts.length === 0 && (
          <p className="gallery-note">no entries yet — write one</p>
        )}

        <div className="post-list">
          {posts.map((p) => (
            <div key={p.id} className="post-entry">
              <p>{p.body}</p>
              <div className="post-meta">
                <span>{fmtEst(p.ts_ms)}</span>
                <button
                  className="tile-delete post-delete"
                  onClick={(e) => remove(p.id, e)}
                  aria-label="delete entry"
                  title="delete"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type MouseEvent,
} from 'react'
import {
  deleteImage,
  imageUrl,
  listImages,
  uploadImage,
  type GalleryImage,
} from '../api'

const MAX_WORDS = 100
const wordCount = (s: string) => (s.trim() ? s.trim().split(/\s+/).length : 0)

export function WorkPage({
  title,
  note,
  category,
}: {
  title: string
  note: string
  category: string
}) {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [selected, setSelected] = useState<GalleryImage | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [caption, setCaption] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const fileInput = useRef<HTMLInputElement>(null)

  const refresh = useCallback(() => {
    listImages(category)
      .then((d) => {
        setImages(d)
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [category])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    if (!selected) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelected(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selected])

  const words = wordCount(caption)
  const overLimit = words > MAX_WORDS

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!file || overLimit || busy) return
    setBusy(true)
    setError('')
    try {
      await uploadImage(category, caption, file)
      setCaption('')
      setFile(null)
      if (fileInput.current) fileInput.current.value = ''
      setShowForm(false)
      refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'upload failed')
    } finally {
      setBusy(false)
    }
  }

  async function remove(id: number, e: MouseEvent) {
    e.stopPropagation()
    try {
      await deleteImage(id)
      setImages((prev) => prev.filter((i) => i.id !== id))
      if (selected?.id === id) setSelected(null)
    } catch {
      setError('delete failed')
    }
  }

  return (
    <section className="work-page">
      <div className="work-inner">
        <div className="work-head">
          <h2>{title}</h2>
          <div className="work-head-right">
            <button className="add-btn" onClick={() => setShowForm((v) => !v)}>
              {showForm ? 'close' : '+ add image'}
            </button>
            <span>{note}</span>
          </div>
        </div>

        {showForm && (
          <form className="upload-form" onSubmit={submit}>
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="caption (max 100 words)"
              rows={3}
            />
            <div className="upload-row">
              <span className={overLimit ? 'word-count over' : 'word-count'}>
                {words}/{MAX_WORDS} words
              </span>
              <button type="submit" disabled={!file || overLimit || busy}>
                {busy ? 'uploading…' : 'upload'}
              </button>
            </div>
            {error && <p className="upload-error">{error}</p>}
          </form>
        )}

        {status === 'error' && (
          <p className="gallery-note">couldn't reach the api</p>
        )}
        {status === 'ready' && images.length === 0 && (
          <p className="gallery-note">no images yet — add one</p>
        )}

        <div className="work-grid">
          {images.map((img) => (
            <div
              key={img.id}
              className="work-tile has-image"
              onClick={() => setSelected(img)}
            >
              <div className="tile-bar" />
              <img
                src={imageUrl(img.url)}
                alt={img.caption || 'image'}
                loading="lazy"
              />
              <button
                className="tile-delete"
                onClick={(e) => remove(img.id, e)}
                aria-label="delete image"
                title="delete"
              >
                ×
              </button>
              {img.caption && <div className="tile-caption">{img.caption}</div>}
            </div>
          ))}
        </div>
      </div>

      {selected && (
        <div className="lightbox" onClick={() => setSelected(null)}>
          <button
            className="lightbox-close"
            onClick={() => setSelected(null)}
            aria-label="close"
          >
            ×
          </button>
          <img
            src={imageUrl(selected.url)}
            alt={selected.caption || 'image'}
            onClick={(e) => e.stopPropagation()}
          />
          {selected.caption && (
            <p className="lightbox-caption">{selected.caption}</p>
          )}
        </div>
      )}
    </section>
  )
}

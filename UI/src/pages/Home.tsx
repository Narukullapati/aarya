import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { SiteTimer } from '../components/SiteTimer'
import { imageUrl, listImages, type GalleryImage } from '../api'

function marqueeBulbs(nb: number) {
  const pts: { x: string; y: string }[] = []
  for (let i = 1; i < nb - 1; i++) {
    const p = (i / (nb - 1)) * 100
    pts.push({ x: `${p}%`, y: '8px' })
  }
  for (const p of [30, 70]) {
    pts.push({ x: 'calc(100% - 8px)', y: `${p}%` })
  }
  for (let i = nb - 2; i >= 1; i--) {
    const p = (i / (nb - 1)) * 100
    pts.push({ x: `${p}%`, y: 'calc(100% - 8px)' })
  }
  for (const p of [70, 30]) {
    pts.push({ x: '8px', y: `${p}%` })
  }
  return pts
}

const BULBS = marqueeBulbs(16)

function Marquee({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={`showcase-marquee ${className ?? ''}`}>
      {BULBS.map((b, i) => (
        <span
          key={i}
          className="bulb"
          style={{ left: b.x, top: b.y } as CSSProperties}
        />
      ))}
      {children}
    </div>
  )
}

function Showcase({ art }: { art: GalleryImage | null }) {
  return (
    <div className="showcase">
      <Marquee>
        <span className="showcase-label">NOW SHOWCASING:</span>
      </Marquee>
      {art && (
        <>
          <img
            className="showcase-img"
            src={imageUrl(art.url)}
            alt={art.caption || 'featured fine art'}
          />
          {art.caption && (
            <Marquee className="caption-marquee">
              <span className="showcase-caption">{art.caption}</span>
            </Marquee>
          )}
        </>
      )}
    </div>
  )
}

export function Home() {
  const [art, setArt] = useState<GalleryImage | null>(null)
  const picked = useRef(false)

  useEffect(() => {
    if (picked.current) return
    picked.current = true
    listImages('fine-art')
      .then((imgs) => {
        if (imgs.length) {
          setArt(imgs[Math.floor(Math.random() * imgs.length)])
        }
      })
      .catch(() => {})
  }, [])

  return (
    <>
      <section className="hero">
        <div className="hero-stage">
          <Showcase art={art} />
          <div className="hero-bg">
            <div className="ph" />
          </div>
          <div className="hero-title">
            <div className="fade">
              <p className="tag">Heaven Has No Backup</p>
            </div>
            <h1>
              AN INDEX
              <br />
              FOR THE LOST
            </h1>
          </div>
          <div className="hero-desc">
            <p>
              The Higher You Soar The Smaller You Appear To Those Who Cannot
              Fly
            </p>
          </div>
        </div>
      </section>

      <section className="hero-mobile">
        <p className="tag">Heaven Has No Backup</p>
        <h1>
          AN INDEX
          <br />
          FOR THE LOST
        </h1>
        <Showcase art={art} />
        <p className="desc">
          The Higher You Soar The Smaller You Appear To Those Who Cannot Fly
        </p>
      </section>

      <SiteTimer />
    </>
  )
}

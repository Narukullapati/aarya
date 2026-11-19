import { useEffect, useState } from 'react'
import { SiteTimer } from '../components/SiteTimer'
import { imageUrl, listImages, type GalleryImage } from '../api'

export function Home() {
  const [art, setArt] = useState<GalleryImage | null>(null)

  useEffect(() => {
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
          <div className="showcase">
            <span className="showcase-label">NOW SHOWCASING:</span>
            {art && (
              <img
                className="showcase-img"
                src={imageUrl(art.url)}
                alt={art.caption || 'featured fine art'}
              />
            )}
          </div>
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
        <div className="showcase m-showcase">
          <span className="showcase-label">NOW SHOWCASING:</span>
          {art && (
            <img
              className="showcase-img"
              src={imageUrl(art.url)}
              alt={art.caption || 'featured fine art'}
            />
          )}
        </div>
        <p className="desc">
          The Higher You Soar The Smaller You Appear To Those Who Cannot Fly
        </p>
      </section>

      <SiteTimer />
    </>
  )
}

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

export function Home() {
  return (
    <>
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
                  stroke="#16A34A"
                  strokeWidth="1"
                />
                <circle cx={l.x2} cy={l.y2} r="2.67" fill="#16A34A" />
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
    </>
  )
}

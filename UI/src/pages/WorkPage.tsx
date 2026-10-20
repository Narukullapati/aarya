export function WorkPage({ title, note }: { title: string; note: string }) {
  return (
    <section className="work-page">
      <div className="work-inner">
        <div className="work-head">
          <h2>{title}</h2>
          <span>{note}</span>
        </div>
        <div className="work-grid">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="work-tile">
              <div className="tile-bar" />
              <div className="ph">image</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

import { Link, NavLink } from 'react-router-dom'
import logoArch from '../assets/logo-arch.png'

const NAV = [
  { label: 'fine art', to: '/fine-art' },
  { label: 'design projects', to: '/design-projects' },
  { label: 'the human error log', to: '/photography' },
  { label: 'misc', to: '/misc' },
]

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link to="/" className="logo" aria-label="aarya home">
        <span
          className="logo-img"
          role="img"
          style={{
            WebkitMaskImage: `url(${logoArch})`,
            maskImage: `url(${logoArch})`,
          }}
        />
      </Link>
      <nav className="site-nav">
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to}>
            <span className="nav-label">{n.label}</span>
            <span className="nav-ghost" aria-hidden="true">{n.label}</span>
          </NavLink>
        ))}
      </nav>
    </header>
  )
}

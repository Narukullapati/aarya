import { Link, NavLink } from 'react-router-dom'
import logoArch from '../assets/logo-arch.png'

const NAV = [
  { label: 'fine art', to: '/fine-art' },
  { label: 'design projects', to: '/design-projects' },
  { label: 'the human error log', to: '/photography' },
]

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link to="/" className="logo" aria-label="aarya home">
        <img className="logo-img" src={logoArch} alt="" />
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

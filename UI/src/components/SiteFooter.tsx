function MailIcon() {
  return (
    <svg width="22" height="15" viewBox="0 0 22 15" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0.5" y="0.5" width="21" height="14" stroke="#16A34A" />
      <path d="M1 1L11 8.5L21 1" stroke="#16A34A" />
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0.5" y="0.5" width="17" height="17" rx="4.5" stroke="#16A34A" />
      <circle cx="9" cy="9" r="3.5" stroke="#16A34A" />
      <circle cx="13.6" cy="4.4" r="1" fill="#16A34A" />
    </svg>
  )
}

export function SiteFooter({ apiStatus }: { apiStatus: string }) {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-contact">
          <p className="label">contact</p>
          <a href="mailto:hello@aarya.narukullapati.com">
            <span>hello@aarya.narukullapati.com</span>
            <MailIcon />
          </a>
          <a href="#" onClick={(e) => e.preventDefault()}>
            <span>instagram</span>
            <InstagramIcon />
          </a>
        </div>
      </div>
      <div className="api-status">api: {apiStatus}</div>
      <p className="copyright">© 2026 Aarya. All rights reserved.</p>
    </footer>
  )
}

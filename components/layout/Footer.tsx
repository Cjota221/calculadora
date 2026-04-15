export function Footer() {
  return (
    <footer>
      <div className="footer-name">Carolina Azevedo</div>
      <div className="footer-contacts">
        <a href="tel:+5562822370750" className="footer-link">
          <svg viewBox="0 0 24 24">
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 .06h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.21-1.21a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z" />
          </svg>
          (62) 8223-7075
        </a>
        <a href="https://instagram.com/caroline_azevedo15" target="_blank" rel="noreferrer" className="footer-link">
          <svg viewBox="0 0 24 24">
            <rect x="2" y="2" width="20" height="20" rx="5" />
            <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
          </svg>
          @caroline_azevedo15
        </a>
      </div>
      <div className="footer-copy">© 2026 Precifique — Todos os direitos reservados</div>
    </footer>
  )
}

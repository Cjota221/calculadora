import Link from 'next/link'

export function Navbar() {
  return (
    <nav>
      <div className="nav-brand">Precifique<span>.</span></div>
      <Link href="/login" className="nav-login">Já tenho acesso</Link>
    </nav>
  )
}

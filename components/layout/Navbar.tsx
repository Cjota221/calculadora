import Link from 'next/link'

export function Navbar() {
  return (
    <nav className="lp-nav">
      <div className="nav-brand">Precifique<span>.</span></div>
      <div className="nav-right">
        <Link href="/afiliados/cadastro" className="nav-afiliado">💜 Seja afiliada</Link>
        <Link href="/login" className="nav-login">Já tenho acesso</Link>
      </div>
    </nav>
  )
}

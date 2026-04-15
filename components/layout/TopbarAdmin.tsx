interface TopbarAdminProps {
  onLogout: () => void
}

export function TopbarAdmin({ onLogout }: TopbarAdminProps) {
  return (
    <div className="topbar">
      <div className="topbar-brand">Precifique<span>.</span> <span className="topbar-tag">Admin</span></div>
      <div className="topbar-right">
        <span className="topbar-user">Carolina Azevedo</span>
        <button className="btn-logout" onClick={onLogout}>Sair</button>
      </div>
    </div>
  )
}

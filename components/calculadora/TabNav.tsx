import type { Tab } from '@/types'
import type { ReactNode } from 'react'

interface TabDef {
  id: Tab
  label: string
  icon: ReactNode
}

interface TabNavProps {
  active: Tab
  onChange: (tab: Tab) => void
}

const tabs: TabDef[] = [
  {
    id: 'precificacao',
    label: 'Precificar',
    icon: (
      <>
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
      </>
    ),
  },
  {
    id: 'frete',
    label: 'Frete Unit.',
    icon: (
      <>
        <rect x="1" y="3" width="15" height="13" rx="1" />
        <path d="M16 8h4l3 4v4h-7V8z" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </>
    ),
  },
  {
    id: 'guia',
    label: 'Guia',
    icon: (
      <>
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
      </>
    ),
  },
  {
    id: 'salvos',
    label: 'Salvos',
    icon: (
      <>
        <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
        <polyline points="17 21 17 13 7 13 7 21"/>
        <polyline points="7 3 7 8 15 8"/>
      </>
    ),
  },
]

export function TabNav({ active, onChange }: TabNavProps) {
  return (
    <nav className="tabs-nav">
      {tabs.map(t => (
        <button
          key={t.id}
          className={`tab-btn${active === t.id ? ' active' : ''}`}
          onClick={() => onChange(t.id)}
        >
          <svg viewBox="0 0 24 24">{t.icon}</svg>
          {t.label}
        </button>
      ))}
    </nav>
  )
}

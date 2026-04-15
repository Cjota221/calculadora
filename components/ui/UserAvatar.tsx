'use client'
import { useRef, useState, useEffect } from 'react'

interface UserAvatarProps {
  nome: string
}

const STORAGE_KEY = 'precifique_avatar'

function getInitials(nome: string) {
  const parts = nome.trim().split(' ')
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function UserAvatar({ nome }: UserAvatarProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [photo, setPhoto] = useState<string | null>(null)
  const [tooltip, setTooltip] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) setPhoto(saved)
  }, [])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = ev => {
      const result = ev.target?.result as string
      localStorage.setItem(STORAGE_KEY, result)
      setPhoto(result)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  function handleRemove(e: React.MouseEvent) {
    e.stopPropagation()
    localStorage.removeItem(STORAGE_KEY)
    setPhoto(null)
  }

  return (
    <div className="avatar-wrap">
      <button
        className="avatar-btn"
        onClick={() => inputRef.current?.click()}
        onMouseEnter={() => setTooltip(true)}
        onMouseLeave={() => setTooltip(false)}
        aria-label="Alterar foto de perfil"
        title="Clique para alterar sua foto"
      >
        {photo ? (
          <img src={photo} alt={nome} className="avatar-img" />
        ) : (
          <span className="avatar-initials">{getInitials(nome)}</span>
        )}
        <span className="avatar-overlay">
          <svg viewBox="0 0 24 24" className="avatar-cam-icon">
            <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
        </span>
      </button>

      {photo && tooltip && (
        <button
          className="avatar-remove"
          onClick={handleRemove}
          aria-label="Remover foto"
        >
          ×
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </div>
  )
}

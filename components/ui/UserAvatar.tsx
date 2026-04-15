'use client'
import { useRef, useState } from 'react'

interface UserAvatarProps {
  userId: string
  nome: string
  initialData?: string | null
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const LOCAL_KEY = 'precifique_user'

function getInitials(nome: string) {
  const parts = nome.trim().split(' ')
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function compressImage(file: File, size = 150, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')!
      // crop centralizado
      const min = Math.min(img.width, img.height)
      const sx = (img.width - min) / 2
      const sy = (img.height - min) / 2
      ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.onerror = reject
    img.src = url
  })
}

async function saveToSupabase(userId: string, avatarData: string | null) {
  await fetch(`${SUPABASE_URL}/rest/v1/precifique_users?id=eq.${userId}`, {
    method: 'PATCH',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ avatar_data: avatarData }),
  })
}

function updateLocalStorage(avatarData: string | null) {
  const raw = localStorage.getItem(LOCAL_KEY)
  if (!raw) return
  try {
    const user = JSON.parse(raw)
    user.avatar_data = avatarData
    localStorage.setItem(LOCAL_KEY, JSON.stringify(user))
  } catch { /* noop */ }
}

export function UserAvatar({ userId, nome, initialData }: UserAvatarProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [photo, setPhoto] = useState<string | null>(initialData ?? null)
  const [saving, setSaving] = useState(false)
  const [hover, setHover] = useState(false)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    e.target.value = ''
    setSaving(true)
    try {
      const compressed = await compressImage(file)
      await saveToSupabase(userId, compressed)
      updateLocalStorage(compressed)
      setPhoto(compressed)
    } catch { /* silencioso */ }
    setSaving(false)
  }

  async function handleRemove(e: React.MouseEvent) {
    e.stopPropagation()
    setSaving(true)
    await saveToSupabase(userId, null)
    updateLocalStorage(null)
    setPhoto(null)
    setSaving(false)
  }

  return (
    <div className="avatar-wrap">
      <button
        className="avatar-btn"
        onClick={() => !saving && inputRef.current?.click()}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        aria-label="Alterar foto de perfil"
        disabled={saving}
      >
        {photo ? (
          <img src={photo} alt={nome} className="avatar-img" />
        ) : (
          <span className="avatar-initials">{getInitials(nome)}</span>
        )}
        <span className="avatar-overlay">
          {saving ? (
            <span className="avatar-spinner" />
          ) : (
            <svg viewBox="0 0 24 24" className="avatar-cam-icon">
              <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          )}
        </span>
      </button>

      {photo && hover && !saving && (
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

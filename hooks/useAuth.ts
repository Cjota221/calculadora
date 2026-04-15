'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export interface PrecifiqueUser {
  id: string
  nome: string
  username: string
  avatar_data?: string | null
}

export function useAuth() {
  const router = useRouter()
  const [user, setUser] = useState<PrecifiqueUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const raw = localStorage.getItem('precifique_user')
    if (!raw) {
      router.replace('/login')
      return
    }
    try {
      setUser(JSON.parse(raw))
    } catch {
      localStorage.removeItem('precifique_user')
      router.replace('/login')
    } finally {
      setLoading(false)
    }
  }, [router])

  function logout() {
    localStorage.removeItem('precifique_user')
    router.replace('/login')
  }

  return { user, loading, logout }
}
